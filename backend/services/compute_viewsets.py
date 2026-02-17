# AtonixCorp Compute Service - ViewSets

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .compute_models import (
    Flavor, Image, Instance, InstanceMetric,
    KubernetesCluster, KubernetesNode,
    ServerlessFunction, ServerlessFunctionTrigger,
    AutoScalingGroup, ScalingPolicy
)
from .compute_serializers import (
    FlavorSerializer, ImageSerializer,
    InstanceListSerializer, InstanceDetailSerializer, InstanceCreateSerializer, InstanceUpdateSerializer,
    InstanceMetricSerializer,
    KubernetesClusterListSerializer, KubernetesClusterDetailSerializer, KubernetesClusterCreateSerializer,
    KubernetesNodeSerializer,
    ServerlessFunctionListSerializer, ServerlessFunctionDetailSerializer,
    ServerlessFunctionCreateSerializer, ServerlessFunctionUpdateSerializer,
    ServerlessFunctionTriggerSerializer,
    AutoScalingGroupListSerializer, AutoScalingGroupDetailSerializer,
    AutoScalingGroupCreateSerializer, AutoScalingGroupUpdateSerializer,
    ScalingPolicySerializer
)


# ============================================================================
# FLAVOR VIEWSET
# ============================================================================

class FlavorViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Viewset for VM flavors (instance types).
    Provides listing and detail views for available instance types.
    """
    queryset = Flavor.objects.filter(is_active=True).order_by('vcpus', 'memory_mb')
    serializer_class = FlavorSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_gpu', 'is_active']
    search_fields = ['name', 'flavor_id']
    ordering_fields = ['vcpus', 'memory_mb', 'hourly_cost_usd']
    
    @action(detail=False, methods=['get'])
    def gpu_flavors(self, request):
        """Get GPU-enabled flavors."""
        flavors = self.queryset.filter(is_gpu=True)
        serializer = self.get_serializer(flavors, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_vcpus(self, request):
        """Filter flavors by vCPU count."""
        vcpus = request.query_params.get('vcpus')
        if vcpus:
            flavors = self.queryset.filter(vcpus=int(vcpus))
            serializer = self.get_serializer(flavors, many=True)
            return Response(serializer.data)
        return Response({'error': 'vcpus parameter required'}, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# IMAGE VIEWSET
# ============================================================================

class ImageViewSet(viewsets.ModelViewSet):
    """
    Viewset for VM images/templates.
    Full CRUD operations for managing OS images and custom AMIs.
    """
    serializer_class = ImageSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['os_type', 'is_public', 'is_active']
    search_fields = ['name', 'os_name', 'image_id']
    ordering_fields = ['created_at', 'size_gb', 'name']
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter images by owner or public images."""
        user = self.request.user
        return Image.objects.filter(is_public=True) | Image.objects.filter(owner=user)
    
    @action(detail=False, methods=['get'])
    def public(self, request):
        """Get all public images."""
        images = Image.objects.filter(is_public=True)
        serializer = self.get_serializer(images, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_images(self, request):
        """Get user's private images."""
        images = Image.objects.filter(owner=request.user)
        serializer = self.get_serializer(images, many=True)
        return Response(serializer.data)


# ============================================================================
# INSTANCE VIEWSET
# ============================================================================

class InstanceViewSet(viewsets.ModelViewSet):
    """
    Viewset for VM instances.
    Full CRUD operations for creating, managing, and monitoring VM instances.
    """
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['owner', 'status', 'flavor', 'availability_zone']
    search_fields = ['instance_id', 'name', 'private_ip', 'public_ip']
    ordering_fields = ['created_at', 'name', 'status']
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter instances by owner."""
        return Instance.objects.filter(owner=self.request.user)
    
    def get_serializer_class(self):
        """Use different serializers for different actions."""
        if self.action == 'retrieve':
            return InstanceDetailSerializer
        elif self.action == 'create':
            return InstanceCreateSerializer
        elif self.action == 'update' or self.action == 'partial_update':
            return InstanceUpdateSerializer
        return InstanceListSerializer
    
    def perform_create(self, serializer):
        """Set owner to current user."""
        serializer.save(owner=self.request.user)
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Start a stopped instance."""
        instance = self.get_object()
        if instance.status == 'stopped':
            instance.status = 'running'
            instance.save()
            return Response({'status': 'Instance started'})
        return Response({'error': 'Instance must be stopped'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def stop(self, request, pk=None):
        """Stop a running instance."""
        instance = self.get_object()
        if instance.status == 'running':
            instance.status = 'stopped'
            instance.save()
            return Response({'status': 'Instance stopped'})
        return Response({'error': 'Instance must be running'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def terminate(self, request, pk=None):
        """Terminate an instance."""
        instance = self.get_object()
        if instance.enable_termination_protection:
            return Response({'error': 'Instance is protected from termination'},
                          status=status.HTTP_400_BAD_REQUEST)
        instance.status = 'terminated'
        instance.save()
        return Response({'status': 'Instance terminated'})
    
    @action(detail=True, methods=['get'])
    def metrics(self, request, pk=None):
        """Get instance metrics."""
        instance = self.get_object()
        metrics = instance.metrics.all()[:100]  # Last 100 metrics
        serializer = InstanceMetricSerializer(metrics, many=True)
        return Response(serializer.data)


# ============================================================================
# KUBERNETES CLUSTER VIEWSET
# ============================================================================

class KubernetesClusterViewSet(viewsets.ModelViewSet):
    """
    Viewset for Kubernetes clusters.
    Full CRUD operations for managing Kubernetes clusters.
    """
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['owner', 'status', 'region']
    search_fields = ['cluster_id', 'name']
    ordering_fields = ['created_at', 'name', 'status']
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter clusters by owner."""
        return KubernetesCluster.objects.filter(owner=self.request.user)
    
    def get_serializer_class(self):
        """Use different serializers for different actions."""
        if self.action == 'retrieve':
            return KubernetesClusterDetailSerializer
        elif self.action == 'create':
            return KubernetesClusterCreateSerializer
        return KubernetesClusterListSerializer
    
    def perform_create(self, serializer):
        """Set owner to current user."""
        serializer.save(owner=self.request.user)
    
    @action(detail=True, methods=['get'])
    def nodes(self, request, pk=None):
        """Get cluster nodes."""
        cluster = self.get_object()
        nodes = cluster.nodes.all()
        serializer = KubernetesNodeSerializer(nodes, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def scale(self, request, pk=None):
        """Scale cluster node count."""
        cluster = self.get_object()
        desired_count = request.data.get('desired_count')
        if desired_count is None:
            return Response({'error': 'desired_count required'}, status=status.HTTP_400_BAD_REQUEST)
        cluster.desired_capacity = desired_count
        cluster.save()
        return Response({'status': f'Cluster scaling to {desired_count} nodes'})


# ============================================================================
# SERVERLESS FUNCTION VIEWSET
# ============================================================================

class ServerlessFunctionViewSet(viewsets.ModelViewSet):
    """
    Viewset for serverless functions (FaaS).
    Full CRUD operations for managing serverless functions.
    """
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['owner', 'runtime', 'status']
    search_fields = ['function_id', 'name', 'handler']
    ordering_fields = ['created_at', 'name', 'invocation_count', 'last_invoked_at']
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter functions by owner."""
        return ServerlessFunction.objects.filter(owner=self.request.user)
    
    def get_serializer_class(self):
        """Use different serializers for different actions."""
        if self.action == 'retrieve':
            return ServerlessFunctionDetailSerializer
        elif self.action == 'create':
            return ServerlessFunctionCreateSerializer
        elif self.action == 'update' or self.action == 'partial_update':
            return ServerlessFunctionUpdateSerializer
        return ServerlessFunctionListSerializer
    
    def perform_create(self, serializer):
        """Set owner to current user."""
        serializer.save(owner=self.request.user)
    
    @action(detail=True, methods=['post'])
    def invoke(self, request, pk=None):
        """Invoke a serverless function."""
        function = self.get_object()
        # In a real implementation, this would invoke the actual function
        function.invocation_count += 1
        function.last_invoked_at = timezone.now()
        function.save()
        return Response({'status': 'Function invoked', 'invocation_count': function.invocation_count})
    
    @action(detail=True, methods=['get'])
    def triggers(self, request, pk=None):
        """Get function triggers."""
        function = self.get_object()
        triggers = function.triggers.all()
        serializer = ServerlessFunctionTriggerSerializer(triggers, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_trigger(self, request, pk=None):
        """Add a trigger to function."""
        function = self.get_object()
        serializer = ServerlessFunctionTriggerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(function=function)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# AUTO-SCALING GROUP VIEWSET
# ============================================================================

class AutoScalingGroupViewSet(viewsets.ModelViewSet):
    """
    Viewset for auto-scaling groups.
    Full CRUD operations for managing auto-scaling groups and policies.
    """
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['owner', 'health_check_type']
    search_fields = ['asg_id', 'name']
    ordering_fields = ['created_at', 'name', 'desired_capacity']
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter ASGs by owner."""
        return AutoScalingGroup.objects.filter(owner=self.request.user)
    
    def get_serializer_class(self):
        """Use different serializers for different actions."""
        if self.action == 'retrieve':
            return AutoScalingGroupDetailSerializer
        elif self.action == 'create':
            return AutoScalingGroupCreateSerializer
        elif self.action == 'update' or self.action == 'partial_update':
            return AutoScalingGroupUpdateSerializer
        return AutoScalingGroupListSerializer
    
    def perform_create(self, serializer):
        """Set owner to current user."""
        serializer.save(owner=self.request.user)
    
    @action(detail=True, methods=['post'])
    def update_capacity(self, request, pk=None):
        """Update desired capacity."""
        asg = self.get_object()
        desired_capacity = request.data.get('desired_capacity')
        if desired_capacity is None:
            return Response({'error': 'desired_capacity required'}, status=status.HTTP_400_BAD_REQUEST)
        if not (asg.min_size <= desired_capacity <= asg.max_size):
            return Response({'error': f'Must be between {asg.min_size} and {asg.max_size}'},
                          status=status.HTTP_400_BAD_REQUEST)
        asg.desired_capacity = desired_capacity
        asg.save()
        return Response({'status': f'Capacity updated to {desired_capacity}'})
    
    @action(detail=True, methods=['get'])
    def policies(self, request, pk=None):
        """Get scaling policies."""
        asg = self.get_object()
        policies = asg.policies.all()
        serializer = ScalingPolicySerializer(policies, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_policy(self, request, pk=None):
        """Add scaling policy."""
        asg = self.get_object()
        serializer = ScalingPolicySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(asg=asg)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
