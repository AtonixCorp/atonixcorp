from django.urls import path, include
from backend.core.health_views import HealthCheckView, ReadinessCheckView, MetricsView

urlpatterns = [
    # Health checks (required by Kubernetes)
    path('health', HealthCheckView.as_view(), name='health'),
    path('ready', ReadinessCheckView.as_view(), name='ready'),
    path('metrics', MetricsView.as_view(), name='metrics'),
    
    # API endpoints
    path('api/', include('backend.dashboard.urls')),
    path('api/automation/', include('backend.automation.urls')),
    path('api/integrations/webhooks/', include('backend.integrations.webhooks.urls')),
    path('api/chat/', include('backend.chat.urls')),
    path('api/', include('backend.enterprises.urls')),
]
