# AtonixCorp Services API URLs

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .onboarding_views import onboarding_checklist, onboarding_checklist_update, dashboard_stats, wizard_options

# Import ViewSets
from .compute_viewsets import (
    FlavorViewSet, ImageViewSet, InstanceViewSet,
    KubernetesClusterViewSet, ServerlessFunctionViewSet,
    AutoScalingGroupViewSet
)
from .storage_viewsets import (
    StorageBucketViewSet, S3ObjectViewSet, StorageVolumeViewSet,
    StorageSnapshotViewSet, FileShareViewSet, EncryptionKeyViewSet,
    BackupPolicyViewSet, BackupViewSet
)
from .networking_viewsets import (
    VPCViewSet, SubnetViewSet, SecurityGroupViewSet,
    LoadBalancerViewSet, TargetGroupViewSet, RouteTableViewSet,
    DNSRecordViewSet, CDNDistributionViewSet, VPNConnectionViewSet,
    VPNGatewayViewSet, InternetGatewayViewSet, NATGatewayViewSet
)

# Create router and register viewsets
router = DefaultRouter()

# ============================================================================
# COMPUTE SERVICE ENDPOINTS
# ============================================================================
router.register(r'flavors', FlavorViewSet, basename='flavor')
router.register(r'images', ImageViewSet, basename='image')
router.register(r'instances', InstanceViewSet, basename='instance')
router.register(r'kubernetes-clusters', KubernetesClusterViewSet, basename='kubernetes-cluster')
router.register(r'serverless-functions', ServerlessFunctionViewSet, basename='serverless-function')
router.register(r'auto-scaling-groups', AutoScalingGroupViewSet, basename='auto-scaling-group')

# ============================================================================
# STORAGE SERVICE ENDPOINTS
# ============================================================================
router.register(r'buckets', StorageBucketViewSet, basename='bucket')
router.register(r's3-objects', S3ObjectViewSet, basename='s3-object')
router.register(r'volumes', StorageVolumeViewSet, basename='volume')
router.register(r'snapshots', StorageSnapshotViewSet, basename='snapshot')
router.register(r'file-shares', FileShareViewSet, basename='file-share')
router.register(r'encryption-keys', EncryptionKeyViewSet, basename='encryption-key')
router.register(r'backup-policies', BackupPolicyViewSet, basename='backup-policy')
router.register(r'backups', BackupViewSet, basename='backup')

# ============================================================================
# NETWORKING SERVICE ENDPOINTS
# ============================================================================
router.register(r'vpcs', VPCViewSet, basename='vpc')
router.register(r'subnets', SubnetViewSet, basename='subnet')
router.register(r'security-groups', SecurityGroupViewSet, basename='security-group')
router.register(r'load-balancers', LoadBalancerViewSet, basename='load-balancer')
router.register(r'target-groups', TargetGroupViewSet, basename='target-group')
router.register(r'route-tables', RouteTableViewSet, basename='route-table')
router.register(r'dns-records', DNSRecordViewSet, basename='dns-record')
router.register(r'cdn-distributions', CDNDistributionViewSet, basename='cdn-distribution')
router.register(r'vpn-connections', VPNConnectionViewSet, basename='vpn-connection')
router.register(r'vpn-gateways', VPNGatewayViewSet, basename='vpn-gateway')
router.register(r'internet-gateways', InternetGatewayViewSet, basename='internet-gateway')
router.register(r'nat-gateways', NATGatewayViewSet, basename='nat-gateway')

# URL Patterns
urlpatterns = [
    path('', include(router.urls)),
    # Onboarding & Dashboard
    path('onboarding/checklist/',        onboarding_checklist,        name='onboarding-checklist-get'),
    path('onboarding/checklist/update/', onboarding_checklist_update, name='onboarding-checklist-update'),
    path('onboarding/stats/',            dashboard_stats,             name='dashboard-stats'),
    path('onboarding/wizard-options/',   wizard_options,              name='wizard-options'),
]
