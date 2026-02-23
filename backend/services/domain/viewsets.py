import logging
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet

from .models import Domain, DnsZone, DomainDnsRecord, SslCertificate
from .serializers import (
    DomainListSerializer,
    DomainDetailSerializer,
    DomainCreateSerializer,
    DomainTransferCreateSerializer,
    DnsRecordSerializer,
    DnsRecordCreateSerializer,
    SslCertificateSerializer,
    UpdateNameserversSerializer,
    CheckAvailabilitySerializer,
)
from ..integrations import reseller_club_service as rc
from ..integrations import designate_service as dns_svc
from ..core.tasks import enqueue_domain_switch_workflow

logger = logging.getLogger(__name__)


# ── Domain ViewSet ────────────────────────────────────────────────────────────

class DomainViewSet(ModelViewSet):
    """
    CRUD + actions for Domain resources owned by the requesting user.
    """
    permission_classes = [IsAuthenticated]
    lookup_field       = 'resource_id'

    def get_queryset(self):
        return (
            Domain.objects
            .filter(owner=self.request.user)
            .select_related('owner')
            .prefetch_related('ssl_certs', 'transfers')
            .order_by('-created_at')
        )

    def get_serializer_class(self):
        if self.action in ('list',):
            return DomainListSerializer
        return DomainDetailSerializer

    # ── Static / discovery endpoints ──────────────────────────────────────────

    @action(detail=False, methods=['post'], url_path='check_availability')
    def check_availability(self, request):
        ser = CheckAvailabilitySerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        result = rc.check_availability(
            ser.validated_data['domain_name'],
            ser.validated_data.get('tlds') or None,
        )
        return Response(result)

    @action(detail=False, methods=['get'], url_path='tld_catalogue')
    def tld_catalogue(self, request):
        return Response(rc.get_tld_catalogue())

    # ── Registration ──────────────────────────────────────────────────────────

    @action(detail=False, methods=['post'], url_path='register')
    def register(self, request):
        ser = DomainCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        # 1. Register with ResellerClub
        reg = rc.register_domain(
            domain_name=data['domain_name'],
            years=data['registration_years'],
            customer_id=str(request.user.id),
            contact_id=str(request.user.id),
        )
        if not reg.get('success'):
            return Response({'error': reg.get('error', 'Registration failed.')},
                            status=status.HTTP_400_BAD_REQUEST)

        # 2. Create domain record
        domain = Domain.objects.create(
            owner=request.user,
            domain_name=data['domain_name'],
            status='active',
            reseller_order_id=reg.get('reseller_order_id', ''),
            reseller_customer_id=str(request.user.id),
            registration_years=data['registration_years'],
            whois_privacy=data['whois_privacy'],
            auto_renew=data['auto_renew'],
        )

        # 3. Bootstrap DNS zone in Designate
        zone = dns_svc.create_zone(data['domain_name'])
        if zone.get('success'):
            DnsZone.objects.create(
                domain=domain,
                zone_id=zone['zone_id'],
                zone_name=zone['zone_name'],
                status=zone.get('status', 'active'),
            )

        return Response(
            DomainDetailSerializer(domain).data,
            status=status.HTTP_201_CREATED,
        )

    # ── Transfer ──────────────────────────────────────────────────────────────

    @action(detail=False, methods=['post'], url_path='transfer')
    def transfer(self, request):
        ser = DomainTransferCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        init = rc.initiate_transfer(
            domain_name=data['domain_name'],
            epp_code=data['epp_code'],
            customer_id=str(request.user.id),
            contact_id=str(request.user.id),
        )
        if not init.get('success'):
            return Response({'error': init.get('error', 'Transfer initiation failed.')},
                            status=status.HTTP_400_BAD_REQUEST)

        domain = Domain.objects.create(
            owner=request.user,
            domain_name=data['domain_name'],
            status='transferring',
            reseller_order_id=init.get('reseller_order_id', ''),
            reseller_customer_id=str(request.user.id),
        )
        domain.transfers.create(
            status='initiated',
            reseller_order_id=init.get('reseller_order_id', ''),
            epp_code=data['epp_code'],
        )

        return Response(
            DomainDetailSerializer(domain).data,
            status=status.HTTP_201_CREATED,
        )

    # ── Renewal ───────────────────────────────────────────────────────────────

    @action(detail=True, methods=['post'], url_path='renew')
    def renew(self, request, resource_id=None):
        domain = self.get_object()
        years  = int(request.data.get('years', 1))

        result = rc.renew_domain(
            reseller_order_id=domain.reseller_order_id,
            years=years,
        )
        if not result.get('success'):
            return Response({'error': result.get('error', 'Renewal failed.')},
                            status=status.HTTP_400_BAD_REQUEST)
        return Response({'renewed': True, 'years': years})

    # ── DNS Zone ──────────────────────────────────────────────────────────────

    @action(detail=True, methods=['get'], url_path='dns_zone')
    def dns_zone(self, request, resource_id=None):
        domain = self.get_object()
        try:
            zone = domain.dns_zone
        except DnsZone.DoesNotExist:
            return Response({'error': 'No DNS zone configured.'}, status=404)
        from .serializers import DnsZoneSerializer
        return Response(DnsZoneSerializer(zone).data)

    # ── DNS Records ───────────────────────────────────────────────────────────

    @action(detail=True, methods=['get'], url_path='dns_records')
    def dns_records(self, request, resource_id=None):
        domain = self.get_object()
        try:
            zone    = domain.dns_zone
            records = zone.records.all()
        except DnsZone.DoesNotExist:
            return Response([])
        return Response(DnsRecordSerializer(records, many=True).data)

    @action(detail=True, methods=['post'], url_path='add_dns_record')
    def add_dns_record(self, request, resource_id=None):
        domain = self.get_object()
        ser    = DnsRecordCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        d = ser.validated_data

        try:
            zone = domain.dns_zone
        except DnsZone.DoesNotExist:
            return Response({'error': 'No DNS zone found.'}, status=404)

        result = dns_svc.create_record(
            zone_id=zone.zone_id,
            name=d['name'],
            record_type=d['record_type'],
            records=d['records'],
            ttl=d['ttl'],
        )
        if not result.get('success'):
            return Response({'error': result.get('error', 'Failed to create record.')},
                            status=status.HTTP_400_BAD_REQUEST)

        record = DomainDnsRecord.objects.create(
            zone=zone,
            recordset_id=result.get('recordset_id', ''),
            name=d['name'],
            record_type=d['record_type'],
            records=d['records'],
            ttl=d['ttl'],
        )
        return Response(DnsRecordSerializer(record).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='delete_dns_record')
    def delete_dns_record(self, request, resource_id=None):
        domain       = self.get_object()
        recordset_id = request.data.get('recordset_id')
        if not recordset_id:
            return Response({'error': 'recordset_id required.'}, status=400)

        try:
            zone = domain.dns_zone
        except DnsZone.DoesNotExist:
            return Response({'error': 'No DNS zone found.'}, status=404)

        dns_svc.delete_record(zone.zone_id, recordset_id)
        zone.records.filter(recordset_id=recordset_id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    # ── SSL ───────────────────────────────────────────────────────────────────

    @action(detail=True, methods=['get'], url_path='ssl_certs')
    def ssl_certs(self, request, resource_id=None):
        domain = self.get_object()
        certs  = domain.ssl_certs.all()
        return Response(SslCertificateSerializer(certs, many=True).data)

    @action(detail=True, methods=['post'], url_path='request_ssl')
    def request_ssl(self, request, resource_id=None):
        domain = self.get_object()
        cert   = SslCertificate.objects.create(
            domain=domain,
            common_name=domain.domain_name,
            sans=[f'www.{domain.domain_name}'],
            status='pending',
        )
        return Response(SslCertificateSerializer(cert).data, status=status.HTTP_202_ACCEPTED)

    # ── Nameservers ───────────────────────────────────────────────────────────

    @action(detail=True, methods=['post'], url_path='update_nameservers')
    def update_nameservers(self, request, resource_id=None):
        domain = self.get_object()
        ser    = UpdateNameserversSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        ns = ser.validated_data['nameservers']

        result = rc.update_nameservers(domain.reseller_order_id, ns)
        if not result.get('success'):
            return Response({'error': result.get('error', 'Nameserver update failed.')},
                            status=status.HTTP_400_BAD_REQUEST)

        domain.nameservers = ns
        domain.save(update_fields=['nameservers', 'updated_at'])
        return Response({'nameservers': ns})

    # ── Privacy ───────────────────────────────────────────────────────────────

    @action(detail=True, methods=['post'], url_path='set_privacy')
    def set_privacy(self, request, resource_id=None):
        domain = self.get_object()
        enable = bool(request.data.get('enable', True))

        result = rc.set_whois_privacy(domain.reseller_order_id, enable)
        if not result.get('success'):
            return Response({'error': result.get('error', 'Privacy update failed.')},
                            status=status.HTTP_400_BAD_REQUEST)

        domain.whois_privacy = enable
        domain.save(update_fields=['whois_privacy', 'updated_at'])
        return Response({'whois_privacy': enable})

    # ── DNSSEC ────────────────────────────────────────────────────────────────

    @action(detail=True, methods=['post'], url_path='enable_dnssec')
    def enable_dnssec(self, request, resource_id=None):
        domain = self.get_object()
        domain.dnssec_enabled = True
        domain.save(update_fields=['dnssec_enabled', 'updated_at'])
        return Response({'dnssec_enabled': True})

    @action(detail=True, methods=['post'], url_path='switch_domain')
    def switch_domain(self, request, resource_id=None):
        domain = self.get_object()
        target_endpoint = request.data.get('target_endpoint', '').strip()
        lb_resource_id = request.data.get('lb_resource_id', '').strip()
        cdn_resource_id = request.data.get('cdn_resource_id', '').strip()
        cluster_resource_id = request.data.get('cluster_resource_id', '').strip()
        queued = enqueue_domain_switch_workflow(
            domain_resource_id=domain.resource_id,
            user_id=request.user.id,
            target_endpoint=target_endpoint,
            lb_resource_id=lb_resource_id,
            cdn_resource_id=cdn_resource_id,
            cluster_resource_id=cluster_resource_id,
        )
        return Response(queued, status=status.HTTP_202_ACCEPTED)

    @action(detail=True, methods=['get'], url_path='switch_status')
    def switch_status(self, request, resource_id=None):
        """Return latest domain switch workflow status."""
        domain = self.get_object()
        switch_state = (domain.metadata or {}).get('domain_switch', {})
        return Response({
            'domain': domain.domain_name,
            'workflow': switch_state,
            'history': (domain.metadata or {}).get('domain_switch_history', []),
        })


# ── SslCertificate ViewSet ────────────────────────────────────────────────────

class SslCertificateViewSet(ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class   = SslCertificateSerializer
    lookup_field       = 'cert_id'

    def get_queryset(self):
        return SslCertificate.objects.filter(domain__owner=self.request.user)
