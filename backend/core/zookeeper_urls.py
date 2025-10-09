"""
URL patterns for Zookeeper-related views.
"""
from django.urls import path
from . import zookeeper_views


app_name = 'zookeeper'

urlpatterns = [
    path('feature-flags/', zookeeper_views.FeatureFlagsView.as_view(), name='feature_flags'),
    path('config/', zookeeper_views.ConfigManagementView.as_view(), name='config_management'),
    path('services/', zookeeper_views.ServiceDiscoveryView.as_view(), name='service_discovery'),
    path('health/', zookeeper_views.HealthCheckView.as_view(), name='health_check'),
    path('task/', zookeeper_views.DistributedTaskView.as_view(), name='distributed_task'),
    path('lock/', zookeeper_views.LockDemoView.as_view(), name='lock_demo'),
]