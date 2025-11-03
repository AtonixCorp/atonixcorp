"""
URL configuration for the observability app.

Provides endpoints for site analytics, system status, and monitoring data.
"""

from django.urls import path
from . import views

app_name = 'observability'

urlpatterns = [
    # Site Analytics - Comprehensive platform statistics
    path('analytics/', views.site_analytics, name='site-analytics'),

    # System Status - Real-time health monitoring
    path('status/', views.system_status, name='system-status'),

    # API Usage Statistics - Detailed usage analytics (authenticated)
    path('usage/', views.api_usage_stats, name='api-usage-stats'),

    # Existing telemetry and metrics endpoints
    path('telemetry/', views.telemetry_endpoint, name='telemetry'),
    path('metrics/', views.metrics, name='prometheus-metrics'),
    path('metrics/influx/', views.metrics_influx, name='metrics-influx'),
]