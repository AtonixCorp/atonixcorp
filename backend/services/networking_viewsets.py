# AtonixCorp Networking Service - ViewSets

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .networking_models import (
    VPC, Subnet, SecurityGroup, SecurityGroupRule,
    LoadBalancer, TargetGroup, Listener,
    RouteTable, Route, DNSRecord, CDNDistribution,
    VPNGateway, CustomerGateway, VPNConnection,
    InternetGateway, NATGateway
)
from .networking_serializers import (
    VPCListSerializer, VPCDetailSerializer, VPCCreateSerializer,
    SubnetListSerializer, SubnetDetailSerializer, SubnetCreateSerializer,
    SecurityGroupListSerializer, SecurityGroupDetailSerializer, SecurityGroupCreateSerializer,
    SecurityGroupRuleListSerializer, SecurityGroupRuleDetailSerializer, SecurityGroupRuleCreateSerializer,
    LoadBalancerListSerializer, LoadBalancerDetailSerializer, LoadBalancerCreateSerializer,
    TargetGroupListSerializer, TargetGroupDetailSerializer,
    ListenerListSerializer,
    RouteTableListSerializer, RouteTableDetailSerializer,
    RouteListSerializer, RouteDetailSerializer, RouteCreateSerializer,
    DNSRecordListSerializer, DNSRecordDetailSerializer, DNSRecordCreateSerializer,
    CDNDistributionListSerializer, CDNDistributionDetailSerializer, CDNDistributionCreateSerializer,
    VPNConnectionListSerializer, VPNConnectionDetailSerializer, VPNConnectionCreateSerializer,
    VPNGatewayListSerializer, CustomerGatewayListSerializer,
    InternetGatewayListSerializer, NATGatewayListSerializer, NATGatewayDetailSerializer
)


# ============================================================================
# VPC VIEWSET
# ============================================================================

class VPCViewSet(viewsets.ModelViewSet):
    """
    Viewset for Virtual Private Clouds.
    Full CRUD operations for managing VPCs and their configuration.
    """
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['owner', 'region', 'status']
    search_fields = ['vpc_id', 'name', 'cidr_block']
    ordering_fields = ['created_at', 'name', 'region']
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter VPCs by owner."""
        return VPC.objects.filter(owner=self.request.user)
    
    def get_serializer_class(self):
        """Use different serializers for different actions."""
        if self.action == 'retrieve':
            return VPCDetailSerializer
        elif self.action == 'create':
            return VPCCreateSerializer
        return VPCListSerializer
    
    def perform_create(self, serializer):
        """Set owner to current user."""
        serializer.save(owner=self.request.user)
    
    @action(detail=True, methods=['get'])
    def subnets(self, request, pk=None):
        """Get all subnets in VPC."""
        vpc = self.get_object()
        subnets = vpc.subnets.all()
        serializer = SubnetListSerializer(subnets, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def security_groups(self, request, pk=None):
        """Get all security groups in VPC."""
        vpc = self.get_object()
        sgs = vpc.security_groups.all()
        serializer = SecurityGroupListSerializer(sgs, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def route_tables(self, request, pk=None):
        """Get all route tables in VPC."""
        vpc = self.get_object()
        rts = vpc.route_tables.all()
        serializer = RouteTableListSerializer(rts, many=True)
        return Response(serializer.data)


# ============================================================================
# SUBNET VIEWSET
# ============================================================================

class SubnetViewSet(viewsets.ModelViewSet):
    """
    Viewset for VPC subnets.
    Full CRUD operations for managing subnets.
    """
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['vpc', 'availability_zone', 'is_default']
    search_fields = ['subnet_id', 'name', 'cidr_block']
    ordering_fields = ['created_at', 'availability_zone']
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter subnets by VPC owner."""
        return Subnet.objects.filter(vpc__owner=self.request.user)
    
    def get_serializer_class(self):
        """Use different serializers for different actions."""
        if self.action == 'retrieve':
            return SubnetDetailSerializer
        elif self.action == 'create':
            return SubnetCreateSerializer
        return SubnetListSerializer
    
    @action(detail=True, methods=['post'])
    def enable_public_ips(self, request, pk=None):
        """Enable automatic public IP assignment."""
        subnet = self.get_object()
        subnet.map_public_ip_on_launch = True
        subnet.save()
        return Response({'status': 'Public IP assignment enabled'})


# ============================================================================
# SECURITY GROUP VIEWSET
# ============================================================================

class SecurityGroupViewSet(viewsets.ModelViewSet):
    """
    Viewset for security groups.
    Full CRUD operations for managing security groups and rules.
    """
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['owner', 'vpc', 'is_default']
    search_fields = ['sg_id', 'name']
    ordering_fields = ['created_at', 'name']
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter security groups by owner."""
        return SecurityGroup.objects.filter(owner=self.request.user)
    
    def get_serializer_class(self):
        """Use different serializers for different actions."""
        if self.action == 'retrieve':
            return SecurityGroupDetailSerializer
        elif self.action == 'create':
            return SecurityGroupCreateSerializer
        return SecurityGroupListSerializer
    
    def perform_create(self, serializer):
        """Set owner to current user."""
        serializer.save(owner=self.request.user)
    
    @action(detail=True, methods=['post'])
    def add_rule(self, request, pk=None):
        """Add ingress/egress rule."""
        sg = self.get_object()
        serializer = SecurityGroupRuleCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(security_group=sg)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def rules(self, request, pk=None):
        """Get all rules in security group."""
        sg = self.get_object()
        rules = sg.rules.all()
        serializer = SecurityGroupRuleListSerializer(rules, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def authorize_ingress(self, request, pk=None):
        """Add ingress rule (HTTP/HTTPS shortcut)."""
        sg = self.get_object()
        protocol = request.data.get('protocol', 'tcp')
        from_port = request.data.get('from_port')
        to_port = request.data.get('to_port', from_port)
        cidr = request.data.get('cidr', '0.0.0.0/0')
        
        rule = SecurityGroupRule.objects.create(
            security_group=sg,
            direction='ingress',
            protocol=protocol,
            from_port=from_port,
            to_port=to_port,
            cidr_ipv4=cidr
        )
        serializer = SecurityGroupRuleDetailSerializer(rule)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ============================================================================
# LOAD BALANCER VIEWSET
# ============================================================================

class LoadBalancerViewSet(viewsets.ModelViewSet):
    """
    Viewset for load balancers.
    Full CRUD operations for managing load balancers.
    """
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['owner', 'status', 'lb_type', 'scheme']
    search_fields = ['lb_id', 'name', 'dns_name']
    ordering_fields = ['created_at', 'name', 'status']
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter load balancers by owner."""
        return LoadBalancer.objects.filter(owner=self.request.user)
    
    def get_serializer_class(self):
        """Use different serializers for different actions."""
        if self.action == 'retrieve':
            return LoadBalancerDetailSerializer
        elif self.action == 'create':
            return LoadBalancerCreateSerializer
        return LoadBalancerListSerializer
    
    def perform_create(self, serializer):
        """Set owner to current user."""
        serializer.save(owner=self.request.user)
    
    @action(detail=True, methods=['get'])
    def listeners(self, request, pk=None):
        """Get all listeners."""
        lb = self.get_object()
        listeners = lb.listeners.all()
        serializer = ListenerListSerializer(listeners, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def target_groups(self, request, pk=None):
        """Get all target groups."""
        lb = self.get_object()
        tgs = lb.target_groups.all()
        serializer = TargetGroupListSerializer(tgs, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_target_group(self, request, pk=None):
        """Create target group."""
        from .networking_serializers import TargetGroupDetailSerializer
        lb = self.get_object()
        data = request.data.copy()
        data['load_balancer'] = lb.pk
        serializer = TargetGroupDetailSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# TARGET GROUP VIEWSET
# ============================================================================

class TargetGroupViewSet(viewsets.ModelViewSet):
    """
    Viewset for target groups.
    Full CRUD operations for managing target groups and targets.
    """
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['load_balancer', 'protocol', 'target_type']
    search_fields = ['tg_id', 'name']
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter target groups by LB owner."""
        return TargetGroup.objects.filter(load_balancer__owner=self.request.user)
    
    def get_serializer_class(self):
        """Use different serializers for different actions."""
        if self.action == 'retrieve':
            return TargetGroupDetailSerializer
        return TargetGroupListSerializer
    
    @action(detail=True, methods=['post'])
    def register_target(self, request, pk=None):
        """Register target with group."""
        tg = self.get_object()
        target_id = request.data.get('target_id')
        port = request.data.get('port', tg.port)
        if not target_id:
            return Response({'error': 'target_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        targets = tg.registered_targets
        targets.append({'id': target_id, 'port': port})
        tg.registered_targets = targets
        tg.health_status[target_id] = 'healthy'
        tg.save()
        return Response({'status': f'Target {target_id} registered'})
    
    @action(detail=True, methods=['post'])
    def deregister_target(self, request, pk=None):
        """Deregister target from group."""
        tg = self.get_object()
        target_id = request.data.get('target_id')
        if not target_id:
            return Response({'error': 'target_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        tg.registered_targets = [t for t in tg.registered_targets if t['id'] != target_id]
        if target_id in tg.health_status:
            del tg.health_status[target_id]
        tg.save()
        return Response({'status': f'Target {target_id} deregistered'})


# ============================================================================
# ROUTE TABLE VIEWSET
# ============================================================================

class RouteTableViewSet(viewsets.ModelViewSet):
    """
    Viewset for route tables.
    Full CRUD operations for managing routes.
    """
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['vpc', 'is_main']
    search_fields = ['route_table_id', 'name']
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter route tables by VPC owner."""
        return RouteTable.objects.filter(vpc__owner=self.request.user)
    
    def get_serializer_class(self):
        """Use different serializers for different actions."""
        if self.action == 'retrieve':
            return RouteTableDetailSerializer
        return RouteTableListSerializer
    
    @action(detail=True, methods=['get'])
    def routes(self, request, pk=None):
        """Get all routes in table."""
        rt = self.get_object()
        routes = rt.routes.all()
        serializer = RouteListSerializer(routes, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_route(self, request, pk=None):
        """Add route to table."""
        rt = self.get_object()
        serializer = RouteCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(route_table=rt)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# DNS RECORD VIEWSET
# ============================================================================

class DNSRecordViewSet(viewsets.ModelViewSet):
    """
    Viewset for DNS records.
    Full CRUD operations for managing DNS records.
    """
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['zone_id', 'record_type', 'owner']
    search_fields = ['name', 'record_id']
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter DNS records by owner."""
        return DNSRecord.objects.filter(owner=self.request.user)
    
    def get_serializer_class(self):
        """Use different serializers for different actions."""
        if self.action == 'retrieve':
            return DNSRecordDetailSerializer
        elif self.action == 'create':
            return DNSRecordCreateSerializer
        return DNSRecordListSerializer
    
    def perform_create(self, serializer):
        """Set owner to current user."""
        serializer.save(owner=self.request.user)


# ============================================================================
# CDN DISTRIBUTION VIEWSET
# ============================================================================

class CDNDistributionViewSet(viewsets.ModelViewSet):
    """
    Viewset for CDN distributions.
    Full CRUD operations for managing CDN distributions.
    """
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['owner', 'status', 'enabled']
    search_fields = ['distribution_id', 'name', 'origin_domain']
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter CDN distributions by owner."""
        return CDNDistribution.objects.filter(owner=self.request.user)
    
    def get_serializer_class(self):
        """Use different serializers for different actions."""
        if self.action == 'retrieve':
            return CDNDistributionDetailSerializer
        elif self.action == 'create':
            return CDNDistributionCreateSerializer
        return CDNDistributionListSerializer
    
    def perform_create(self, serializer):
        """Set owner to current user."""
        serializer.save(owner=self.request.user)
    
    @action(detail=True, methods=['post'])
    def invalidate_cache(self, request, pk=None):
        """Invalidate CDN cache for paths."""
        dist = self.get_object()
        paths = request.data.get('paths', ['/*'])
        return Response({'status': 'Cache invalidation in progress', 'paths': paths})


# ============================================================================
# VPN CONNECTION VIEWSET
# ============================================================================

class VPNConnectionViewSet(viewsets.ModelViewSet):
    """
    Viewset for VPN connections.
    Full CRUD operations for managing VPN connections.
    """
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['vpn_gateway', 'customer_gateway', 'status']
    search_fields = ['connection_id']
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter VPN connections by gateway owner."""
        return VPNConnection.objects.filter(vpn_gateway__owner=self.request.user)
    
    def get_serializer_class(self):
        """Use different serializers for different actions."""
        if self.action == 'retrieve':
            return VPNConnectionDetailSerializer
        elif self.action == 'create':
            return VPNConnectionCreateSerializer
        return VPNConnectionListSerializer


# ============================================================================
# VPN GATEWAY VIEWSET
# ============================================================================

class VPNGatewayViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Viewset for VPN gateways.
    Read-only access to VPN gateway information.
    """
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['owner', 'vpc', 'status']
    search_fields = ['vpn_gw_id', 'name']
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter VPN gateways by owner."""
        return VPNGateway.objects.filter(owner=self.request.user)
    
    serializer_class = VPNGatewayListSerializer


# ============================================================================
# INTERNET GATEWAY VIEWSET
# ============================================================================

class InternetGatewayViewSet(viewsets.ModelViewSet):
    """
    Viewset for internet gateways.
    Full CRUD operations for managing internet gateways.
    """
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['owner', 'vpc', 'status']
    search_fields = ['ig_id', 'name']
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter internet gateways by owner."""
        return InternetGateway.objects.filter(owner=self.request.user)
    
    serializer_class = InternetGatewayListSerializer
    
    def perform_create(self, serializer):
        """Set owner to current user."""
        serializer.save(owner=self.request.user)


# ============================================================================
# NAT GATEWAY VIEWSET
# ============================================================================

class NATGatewayViewSet(viewsets.ModelViewSet):
    """
    Viewset for NAT gateways.
    Full CRUD operations for managing NAT gateways.
    """
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['owner', 'subnet', 'status']
    search_fields = ['nat_gw_id', 'name']
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter NAT gateways by owner."""
        return NATGateway.objects.filter(owner=self.request.user)
    
    def get_serializer_class(self):
        """Use different serializers for different actions."""
        if self.action == 'retrieve':
            return NATGatewayDetailSerializer
        return NATGatewayListSerializer
    
    def perform_create(self, serializer):
        """Set owner to current user."""
        serializer.save(owner=self.request.user)
