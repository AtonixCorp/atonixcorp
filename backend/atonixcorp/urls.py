"""
URL configuration for atonixcorp project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.decorators import api_view
from rest_framework.response import Response
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from drf_spectacular.utils import extend_schema
from .auth_views import LoginView, SignupView, LogoutView, MeView
# Telemetry endpoint: keep import commented while telemetry is disabled in some branches
# from observability.views import telemetry_endpoint
from core.health import health_check
from core.api_utils import APIRootSerializer
from core.views import landing_page, api_info, api_documentation, interactive_api_root, browse_projects, browse_api_endpoint
from .quantum_views import submit_job, job_status
from core.quantum_client import submit_quantum_job, get_job_status
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponseBadRequest
import json
from .views_ruby import ruby_health


# Import custom admin
# from core.admin import admin_site  # Temporarily disabled


@extend_schema(
    operation_id="api_root",
    description="API Root endpoint providing comprehensive information about available endpoints",
    responses={200: APIRootSerializer},
    tags=["API Info"],
)
@api_view(["GET"])
def api_root(request):
    """
    API Root Endpoint

    Welcome to the AtonixCorp Platform API! This endpoint provides an overview
    of all available API endpoints and their capabilities.
    """
    base_url = request.build_absolute_uri("/").rstrip("/")
    return Response(
        {
            "message": "Welcome to AtonixCorp Platform API",
            "version": "1.0.0",
            "status": "operational",
            "timestamp": "2024-09-24T00:00:00Z",
            "documentation": {
                "swagger_ui": f"{base_url}/api/docs/",
                "redoc": f"{base_url}/api/redoc/",
                "openapi_schema": f"{base_url}/api/schema/",
            },
            "authentication": {
                "login": f"{base_url}/api/auth/login/",
                "signup": f"{base_url}/api/auth/signup/",
                "logout": f"{base_url}/api/auth/logout/",
                "profile": f"{base_url}/api/auth/me/",
            },
            "endpoints": {
                "projects": {"url": f"{base_url}/api/projects/", "description": "Project management and tracking"},
                "teams": {"url": f"{base_url}/api/teams/", "description": "Team collaboration and member management"},
                "focus_areas": {"url": f"{base_url}/api/focus-areas/", "description": "Focus area categorization and organization"},
                "resources": {"url": f"{base_url}/api/resources/", "description": "Resource management and sharing"},
                "dashboard": {"url": f"{base_url}/api/dashboard/", "description": "Analytics and dashboard data"},
                "contact": {"url": f"{base_url}/api/contact/", "description": "Contact form and communication"},
                "chat": {"url": f"{base_url}/api/chat/", "description": "Real-time messaging and communication"},
                "analytics": {"url": f"{base_url}/api/status/analytics/", "description": "Comprehensive site analytics and statistics"},
                "status": {"url": f"{base_url}/api/status/status/", "description": "Real-time system status and health monitoring"},
                "api_usage": {"url": f"{base_url}/api/status/usage/", "description": "Detailed API usage statistics (authenticated)"},
            },
            "system": {"health_check": f"{base_url}/health/", "admin_panel": f"{base_url}/admin/"},
            "support": {"email": "support@atonixcorp.com", "documentation": "https://docs.atonixcorp.org", "website": "https://atonixcorp.org"},
        }
    )


urlpatterns = [
    # Landing Page - Professional welcome page
    path("", landing_page, name="landing-page"),
    # Professional Admin interface
    path("admin/", admin.site.urls),
    # API Documentation - Professional Swagger UI and ReDoc
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    # API Root - Welcome endpoint with full API overview
    path("api/", api_root, name="api-root"),

    # API Information endpoint
    path("api/info/", api_info, name="api-info"),

    # Professional API Documentation page
    path("api/documentation/", api_documentation, name="api-documentation"),

    # Interactive API Browser
    path("api/browse/", interactive_api_root, name="interactive-api-root"),
    path("api/browse/projects/", browse_projects, name="browse-projects"),
    path("api/browse/<str:endpoint_type>/", browse_api_endpoint, name="browse-api-endpoint"),

    # Health check endpoints
    path("api/health/", health_check, name="api-health-check"),
    path("health/", health_check, name="health-check"),

    # Authentication endpoints
    path("api/auth/login/", LoginView.as_view(), name="api-login"),
    path("api/auth/signup/", SignupView.as_view(), name="api-signup"),
    path("api/auth/logout/", LogoutView.as_view(), name="api-logout"),
    path("api/auth/me/", MeView.as_view(), name="api-me"),
    # Telemetry ingest endpoint for development
    # path('api/telemetry/', telemetry_endpoint, name='api-telemetry'),  # Temporarily disabled
    # Core application endpoints
    path("api/", include("projects.urls")),
    path("api/", include("teams.urls")),
    path("api/", include("focus_areas.urls")),
    path("api/", include("resources.urls")),
    path("api/", include("contact.urls")),
    path("api/dashboard/", include("dashboard.urls")),
    path("api/", include("scheduling.urls")),
    # Activity tracking endpoints (ingest and listing of user events)
    path("api/v1/activity/", include("activity.urls")),
    path("api/", include("enterprises.urls")),
    # Chat and communication endpoints
    path("api/chat/", include("chat.urls")),
    # Static informational pages accessible via footer links
    path("pages/", include("static_pages.urls", namespace="static_pages")),

    # System and monitoring endpoints
    # path('api/zookeeper/', include('core.zookeeper_urls')),  # Temporarily disabled

    # Observability and analytics endpoints
    path("api/status/", include("observability.urls")),

    # Quantum service proxy (development)
    path("api/quantum/submit/", submit_job, name="quantum-submit"),
    path("api/quantum/status/<str:job_id>/", job_status, name="quantum-status"),
    # Ruby service integration demo
    path("api/ruby/health/", ruby_health, name="ruby-health"),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
