# AtonixCorp Cloud – Monitoring ViewSets

import logging
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response

from .models import ServiceHealth, MetricSnapshot, AlertRule, MonitoringAlert, Incident
from .serializers import (
    ServiceHealthSerializer, MetricSnapshotSerializer,
    AlertRuleSerializer, CreateAlertRuleSerializer,
    AlertSerializer,
    IncidentListSerializer, IncidentDetailSerializer, CreateIncidentSerializer,
)
from . import service as svc

logger = logging.getLogger(__name__)


# ── Overview ──────────────────────────────────────────────────────────────────

class MonitoringOverviewViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        """GET /monitoring/overview/ – summary stats + service health."""
        stats  = svc.get_overview_stats(request.user)
        health = svc.get_service_health(request.user)
        return Response({'stats': stats, 'service_health': health})


# ── Metrics ───────────────────────────────────────────────────────────────────

class MetricViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        """GET /metrics/?resource=<id>&metric=<name>&hours=<n>"""
        resource_id = request.query_params.get('resource', 'global')
        metric      = request.query_params.get('metric', 'cpu_percent')
        hours       = int(request.query_params.get('hours', 24))
        data = svc.get_metric_series(request.user, resource_id, metric, hours)
        return Response({'resource_id': resource_id, 'metric': metric,
                         'hours': hours, 'points': data})

    @action(detail=False, methods=['post'])
    def ingest(self, request):
        """POST /metrics/ingest/ – push a metric value."""
        d = request.data
        result = svc.ingest_metric(
            request.user,
            d.get('resource_id', 'unknown'),
            d.get('service', 'unknown'),
            d.get('metric', 'cpu_percent'),
            float(d.get('value', 0)),
            d.get('unit', ''),
        )
        return Response(result)

    @action(detail=False, methods=['get'], url_path='available')
    def available(self, request):
        """GET /metrics/available/ – list of metric names."""
        choices = [
            {'value': v, 'label': l}
            for v, l in MetricSnapshot.METRIC_CHOICES
        ]
        return Response(choices)


# ── Alert Rules ───────────────────────────────────────────────────────────────

class AlertRuleViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'resource_id'

    def get_queryset(self):
        return AlertRule.objects.filter(owner=self.request.user)

    def get_serializer_class(self):
        return CreateAlertRuleSerializer if self.action == 'create' else AlertRuleSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['post'])
    def enable(self, request, resource_id=None):
        rule = self.get_object()
        rule.is_enabled = True
        rule.save(update_fields=['is_enabled', 'updated_at'])
        return Response({'is_enabled': True})

    @action(detail=True, methods=['post'])
    def disable(self, request, resource_id=None):
        rule = self.get_object()
        rule.is_enabled = False
        rule.save(update_fields=['is_enabled', 'updated_at'])
        return Response({'is_enabled': False})


# ── Alerts (fired events) ─────────────────────────────────────────────────────

class AlertViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class   = AlertSerializer

    def get_queryset(self):
        qs = MonitoringAlert.objects.filter(owner=self.request.user).select_related('rule')
        state = self.request.query_params.get('state')
        if state:
            qs = qs.filter(state=state)
        return qs

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        from django.utils import timezone
        alert = self.get_object()
        alert.state       = 'resolved'
        alert.resolved_at = timezone.now()
        alert.save(update_fields=['state', 'resolved_at'])
        return Response({'state': 'resolved'})

    @action(detail=True, methods=['post'])
    def silence(self, request, pk=None):
        alert = self.get_object()
        alert.state = 'silenced'
        alert.save(update_fields=['state'])
        return Response({'state': 'silenced'})


# ── Incidents ─────────────────────────────────────────────────────────────────

class IncidentViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'resource_id'

    def get_queryset(self):
        qs = Incident.objects.filter(owner=self.request.user).prefetch_related('updates')
        svc_filter = self.request.query_params.get('service')
        status_filter = self.request.query_params.get('status')
        if svc_filter:
            qs = qs.filter(service=svc_filter)
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateIncidentSerializer
        if self.action in ('list',):
            return IncidentListSerializer
        return IncidentDetailSerializer

    def perform_create(self, serializer):
        inc = serializer.save(owner=self.request.user)
        from .models import IncidentUpdate
        IncidentUpdate.objects.create(
            incident=inc, author=self.request.user,
            status='open', message='Incident opened.',
        )

    @action(detail=True, methods=['post'])
    def update_status(self, request, resource_id=None):
        incident   = self.get_object()
        new_status = request.data.get('status')
        message    = request.data.get('message', '')
        if not new_status:
            return Response({'error': 'status is required.'},
                            status=status.HTTP_400_BAD_REQUEST)
        result = svc.update_incident_status(incident, new_status, message, request.user)
        return Response(result)

    @action(detail=True, methods=['post'])
    def assign(self, request, resource_id=None):
        from django.contrib.auth.models import User as DjangoUser
        incident = self.get_object()
        user_id  = request.data.get('user_id')
        try:
            user = DjangoUser.objects.get(pk=user_id)
        except DjangoUser.DoesNotExist:
            return Response({'error': 'User not found.'}, status=404)
        incident.assigned_to = user
        incident.save(update_fields=['assigned_to', 'updated_at'])
        return Response({'assigned_to': user.username})


# ── Logs ──────────────────────────────────────────────────────────────────────

class LogViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        """GET /logs/?service=<name>&search=<text>&hours=<n>&limit=<n>"""
        svc_filter = request.query_params.get('service', '')
        search     = request.query_params.get('search', '')
        hours      = int(request.query_params.get('hours', 1))
        limit      = min(int(request.query_params.get('limit', 100)), 500)
        logs = svc.get_log_stream(request.user, svc_filter, search, hours, limit)
        return Response({'count': len(logs), 'logs': logs})


# ── Developer Dashboard Monitoring ────────────────────────────────────────────

class DevMonitoringViewSet(viewsets.ViewSet):
    """Unified developer-facing monitoring endpoints for the monitoring hub."""
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        """GET /monitoring/dev/ — combined overview stats."""
        data = svc.get_dev_overview(request.user)
        return Response(data)

    @action(detail=False, methods=['get'], url_path='pipeline-health')
    def pipeline_health(self, request):
        """GET /monitoring/dev/pipeline-health/?hours=<n>&project_id=<id>"""
        hours      = int(request.query_params.get('hours', 24))
        project_id = request.query_params.get('project_id', None)
        data = svc.get_pipeline_health(request.user, hours=hours, project_id=project_id)
        return Response({'count': len(data), 'results': data})

    @action(detail=False, methods=['get'], url_path='deployment-health')
    def deployment_health(self, request):
        """GET /monitoring/dev/deployment-health/?hours=<n>&project_id=<id>"""
        hours      = int(request.query_params.get('hours', 24))
        project_id = request.query_params.get('project_id', None)
        data = svc.get_deployment_health(request.user, hours=hours, project_id=project_id)
        return Response({'count': len(data), 'results': data})

    @action(detail=False, methods=['get'], url_path='project-health')
    def project_health(self, request):
        """GET /monitoring/dev/project-health/"""
        data = svc.get_project_health(request.user)
        return Response({'count': len(data), 'results': data})

    @action(detail=False, methods=['get'], url_path='activity')
    def activity(self, request):
        """GET /monitoring/dev/activity/?event_type=<t>&project_id=<id>&hours=<n>&limit=<n>"""
        event_type = request.query_params.get('event_type', None)
        project_id = request.query_params.get('project_id', None)
        hours      = int(request.query_params.get('hours', 24))
        limit      = min(int(request.query_params.get('limit', 50)), 200)
        data = svc.get_activity_feed(
            request.user, event_type=event_type,
            project_id=project_id, hours=hours, limit=limit,
        )
        return Response({'count': len(data), 'results': data})

    @action(detail=False, methods=['get'], url_path='service-health')
    def service_health(self, request):
        """GET /monitoring/dev/service-health/ — list of service health records."""
        data = svc.get_service_health(request.user)
        return Response({'count': len(data), 'results': data})

