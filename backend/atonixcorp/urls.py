"""
URL configuration for atonixcorp project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.decorators import api_view
from rest_framework.response import Response
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from drf_spectacular.utils import extend_schema
from .auth_views import LoginView, SignupView, LogoutView, MeView
<<<<<<< HEAD
from observability.views import telemetry_endpoint
=======
# from observability.views import telemetry_endpoint  # Temporarily disabled
>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
from core.health import health_check
from core.api_utils import APIRootSerializer
from core.views import landing_page, api_info, api_documentation
from .quantum_views import submit_job, job_status
from core.quantum_client import submit_quantum_job, get_job_status
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponseBadRequest
import json
<<<<<<< HEAD
=======
from .views_ruby import ruby_health
>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb

# Import custom admin
# from core.admin import admin_site  # Temporarily disabled


@extend_schema(
    operation_id="api_root",
    description="API Root endpoint providing comprehensive information about available endpoints",
    responses={200: APIRootSerializer},
    tags=["API Info"]
)
@api_view(['GET'])
def api_root(request):
    """
    API Root Endpoint
<<<<<<< HEAD
    
    Welcome to the AtonixCorp Platform API! This endpoint provides an overview 
    of all available API endpoints and their capabilities.
    
=======

    Welcome to the AtonixCorp Platform API! This endpoint provides an overview
    of all available API endpoints and their capabilities.

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
    ## Quick Start
    1. **Authentication**: Obtain a JWT token via `/api/auth/login/`
    2. **Explore**: Browse available endpoints below
    3. **Documentation**: Visit `/api/docs/` for interactive API documentation
    4. **Health Check**: Monitor API status at `/health/`
<<<<<<< HEAD
    
=======

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
    ## Features
    - 🔒 **Secure**: JWT authentication and API key support
    - 📊 **Comprehensive**: Full CRUD operations for all resources
    - ⚡ **Fast**: Optimized queries and Redis caching
    - 📖 **Well Documented**: Complete OpenAPI 3.0 specifications
    """
    base_url = request.build_absolute_uri('/').rstrip('/')
<<<<<<< HEAD
    
=======

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
    return Response({
        'message': 'Welcome to AtonixCorp Platform API',
        'version': '1.0.0',
        'status': 'operational',
        'timestamp': '2024-09-24T00:00:00Z',
        'documentation': {
            'swagger_ui': f'{base_url}/api/docs/',
            'redoc': f'{base_url}/api/redoc/',
            'openapi_schema': f'{base_url}/api/schema/',
        },
        'authentication': {
            'login': f'{base_url}/api/auth/login/',
            'signup': f'{base_url}/api/auth/signup/',
            'logout': f'{base_url}/api/auth/logout/',
            'profile': f'{base_url}/api/auth/me/',
        },
        'endpoints': {
            'projects': {
                'url': f'{base_url}/api/projects/',
                'description': 'Project management and tracking'
            },
            'teams': {
                'url': f'{base_url}/api/teams/',
                'description': 'Team collaboration and member management'
            },
            'focus_areas': {
                'url': f'{base_url}/api/focus-areas/',
                'description': 'Focus area categorization and organization'
            },
            'resources': {
                'url': f'{base_url}/api/resources/',
                'description': 'Resource management and sharing'
            },
            'dashboard': {
                'url': f'{base_url}/api/dashboard/',
                'description': 'Analytics and dashboard data'
            },
            'contact': {
                'url': f'{base_url}/api/contact/',
                'description': 'Contact form and communication'
            },
        },
        'system': {
            'health_check': f'{base_url}/health/',
            'admin_panel': f'{base_url}/admin/',
        },
        'support': {
            'email': 'support@atonixcorp.com',
            'documentation': 'https://docs.atonixcorp.org',
            'website': 'https://atonixcorp.org'
        }
    })


urlpatterns = [
    # Landing Page - Professional welcome page
    path('', landing_page, name='landing-page'),
<<<<<<< HEAD
    
    # Professional Admin interface
    path('admin/', admin.site.urls),
    
=======

    # Professional Admin interface
    path('admin/', admin.site.urls),

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
    # API Documentation - Professional Swagger UI and ReDoc
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
<<<<<<< HEAD
    
    # API Root - Welcome endpoint with full API overview
    path('api/', api_root, name='api-root'),
    
    # API Information endpoint
    path('api/info/', api_info, name='api-info'),
    
    # Professional API Documentation page
    path('api/documentation/', api_documentation, name='api-documentation'),
    
    # Health check endpoints
    path('api/health/', health_check, name='api-health-check'),
    path('health/', health_check, name='health-check'),
    
    # Authentication endpoints  
=======

    # API Root - Welcome endpoint with full API overview
    path('api/', api_root, name='api-root'),

    # API Information endpoint
    path('api/info/', api_info, name='api-info'),

    # Professional API Documentation page
    path('api/documentation/', api_documentation, name='api-documentation'),

    # Health check endpoints
    path('api/health/', health_check, name='api-health-check'),
    path('health/', health_check, name='health-check'),

    # Authentication endpoints
>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
    path('api/auth/login/', LoginView.as_view(), name='api-login'),
    path('api/auth/signup/', SignupView.as_view(), name='api-signup'),
    path('api/auth/logout/', LogoutView.as_view(), name='api-logout'),
    path('api/auth/me/', MeView.as_view(), name='api-me'),
    # Telemetry ingest endpoint for development
<<<<<<< HEAD
    path('api/telemetry/', telemetry_endpoint, name='api-telemetry'),
    
=======
    # path('api/telemetry/', telemetry_endpoint, name='api-telemetry'),  # Temporarily disabled

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
    # Core application endpoints
    path('api/', include('projects.urls')),
    path('api/', include('teams.urls')),
    path('api/', include('focus_areas.urls')),
    path('api/', include('resources.urls')),
    path('api/', include('contact.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/', include('scheduling.urls')),
    # Static informational pages accessible via footer links
    path('pages/', include('static_pages.urls', namespace='static_pages')),
<<<<<<< HEAD
    
=======

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
    # System and monitoring endpoints
    # path('api/zookeeper/', include('core.zookeeper_urls')),  # Temporarily disabled

    # Quantum service proxy (development)
    path('api/quantum/submit/', submit_job, name='quantum-submit'),
    path('api/quantum/status/<str:job_id>/', job_status, name='quantum-status'),
<<<<<<< HEAD
=======
    # Ruby service integration demo
    path('api/ruby/health/', ruby_health, name='ruby-health'),
>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
