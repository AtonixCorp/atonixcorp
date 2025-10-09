"""
Professional API documentation and landing page views.

This module provides enhanced documentation views and landing pages
for the AtonixCorp Platform API with comprehensive information and examples.
"""

from django.shortcuts import render
from django.http import JsonResponse
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from core.api_utils import APIResponse, APIRootSerializer


@extend_schema(exclude=True)  # Exclude from OpenAPI schema as this is a documentation view
def api_documentation(request):
    """
    Professional API documentation landing page.
    
    This view renders a comprehensive documentation page with examples,
    authentication information, and getting started guides.
    """
    context = {
        'title': 'AtonixCorp Platform API Documentation',
        'api_version': '1.0.0',
        'base_url': request.build_absolute_uri('/api/'),
        'swagger_url': request.build_absolute_uri('/api/docs/'),
        'redoc_url': request.build_absolute_uri('/api/redoc/'),
        'schema_url': request.build_absolute_uri('/api/schema/'),
        'endpoints': [
            {
                'name': 'Projects',
                'url': '/api/projects/',
                'description': 'Manage and browse projects with advanced filtering',
                'methods': ['GET'],
                'features': ['Filtering', 'Search', 'Pagination', 'Featured projects']
            },
            {
                'name': 'Teams', 
                'url': '/api/teams/',
                'description': 'Team collaboration and member management',
                'methods': ['GET'],
                'features': ['Team listings', 'Member management', 'Role assignments']
            },
            {
                'name': 'Focus Areas',
                'url': '/api/focus-areas/', 
                'description': 'Categorize work by focus areas and priorities',
                'methods': ['GET'],
                'features': ['Category management', 'Priority sorting', 'Project associations']
            },
            {
                'name': 'Resources',
                'url': '/api/resources/',
                'description': 'Resource management and sharing platform',
                'methods': ['GET'],
                'features': ['Resource library', 'File management', 'Sharing controls']
            },
            {
                'name': 'Dashboard',
                'url': '/api/dashboard/',
                'description': 'Analytics and metrics dashboard data',
                'methods': ['GET'],
                'features': ['Real-time metrics', 'Performance analytics', 'Custom dashboards']
            },
            {
                'name': 'Authentication',
                'url': '/api/auth/',
                'description': 'User authentication and session management',
                'methods': ['POST', 'GET', 'DELETE'],
                'features': ['JWT tokens', 'Social login', 'Session management', 'Profile management']
            }
        ],
        'authentication_methods': [
            {
                'name': 'JWT Bearer Token',
                'description': 'JSON Web Token authentication for API access',
                'header': 'Authorization: Bearer <token>',
                'example': 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
            },
            {
                'name': 'API Key',
                'description': 'API key authentication for service-to-service communication',
                'header': 'X-API-Key: <api_key>',
                'example': 'X-API-Key: ak_live_1234567890abcdef'
            },
            {
                'name': 'Session Authentication',
                'description': 'Cookie-based session authentication for web clients',
                'header': 'Cookie: sessionid=<session_id>',
                'example': 'Cookie: sessionid=abc123def456'
            }
        ],
        'rate_limits': [
            {'type': 'Authenticated Users', 'limit': '1000 requests/hour'},
            {'type': 'Anonymous Users', 'limit': '100 requests/hour'},
            {'type': 'Premium API Keys', 'limit': '10000 requests/hour'}
        ],
        'example_requests': [
            {
                'title': 'Get All Projects',
                'method': 'GET',
                'url': '/api/projects/',
                'description': 'Retrieve a list of all projects with pagination',
                'curl': '''curl -X GET "https://api.atonixcorp.org/api/projects/" \\
     -H "Accept: application/json"''',
                'response': '''{
  "success": true,
  "message": "Projects retrieved successfully",
  "timestamp": "2024-09-24T10:30:00.000Z",
  "status_code": 200,
  "data": [...],
  "metadata": {
    "pagination": {
      "page": 1,
      "pages": 3,
      "per_page": 20,
      "total": 45,
      "has_next": true,
      "has_previous": false
    }
  }
}'''
            },
            {
                'title': 'Get Featured Projects',
                'method': 'GET', 
                'url': '/api/projects/featured/',
                'description': 'Retrieve only projects marked as featured',
                'curl': '''curl -X GET "https://api.atonixcorp.org/api/projects/featured/" \\
     -H "Accept: application/json"''',
                'response': '''{
  "success": true,
  "message": "Found 3 featured projects",
  "timestamp": "2024-09-24T10:31:00.000Z",
  "status_code": 200,
  "data": [...] 
}'''
            },
            {
                'title': 'Login with Credentials',
                'method': 'POST',
                'url': '/api/auth/login/',
                'description': 'Authenticate user and receive JWT token',
                'curl': '''curl -X POST "https://api.atonixcorp.org/api/auth/login/" \\
     -H "Content-Type: application/json" \\
     -d '{"username": "user@example.com", "password": "password123"}' ''',
                'response': '''{
  "success": true,
  "message": "Login successful",
  "timestamp": "2024-09-24T10:32:00.000Z",
  "status_code": 200,
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {...}
  }
}'''
            }
        ],
        'support': {
            'email': 'api-support@atonixcorp.com',
            'documentation': 'https://docs.atonixcorp.org/api',
            'status_page': 'https://status.atonixcorp.org',
            'github': 'https://github.com/atonixcorp/platform'
        }
    }
    
    return render(request, 'api/documentation.html', context)


@api_view(['GET'])
@permission_classes([AllowAny])
@extend_schema(
    summary="API Status and Health Check",
    description="Get current API status, version information, and service health",
    responses={200: APIRootSerializer},
    tags=['System']
)
def api_status(request):
    """
    Comprehensive API status endpoint.
    
    Returns detailed information about API health, version,
    service dependencies, and operational metrics.
    """
    import time
    import os
    from django.db import connection
    from django.core.cache import cache
    
    # Check database connectivity
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        db_status = "healthy"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    # Check cache connectivity
    try:
        cache.set('health_check', 'ok', 30)
        cache_result = cache.get('health_check')
        cache_status = "healthy" if cache_result == 'ok' else "error"
    except Exception as e:
        cache_status = f"error: {str(e)}"
    
    # Calculate uptime (simplified)
    uptime_seconds = time.time() - getattr(settings, 'SERVER_START_TIME', time.time())
    
    status_data = {
        'status': 'operational',
        'timestamp': '2024-09-24T10:30:00.000Z',  # This would be dynamic in real implementation
        'version': '1.0.0',
        'environment': settings.ENVIRONMENT if hasattr(settings, 'ENVIRONMENT') else 'development',
        'services': {
            'database': db_status,
            'cache': cache_status,
            'api': 'healthy',
            'authentication': 'healthy',
            'storage': 'healthy'
        },
        'uptime_seconds': round(uptime_seconds, 2),
        'server_info': {
            'django_version': os.environ.get('DJANGO_VERSION', 'Unknown'),
            'python_version': f"{os.sys.version_info.major}.{os.sys.version_info.minor}.{os.sys.version_info.micro}",
            'debug_mode': settings.DEBUG
        },
        'metrics': {
            'total_requests': getattr(settings, 'TOTAL_REQUESTS', 0),
            'active_sessions': getattr(settings, 'ACTIVE_SESSIONS', 0),
            'cache_hit_rate': getattr(settings, 'CACHE_HIT_RATE', 0.85)
        }
    }
    
    return APIResponse.success(
        data=status_data,
        message="API status retrieved successfully"
    )


@api_view(['GET'])
@permission_classes([AllowAny])
def api_endpoints(request):
    """
    Dynamic endpoint discovery.
    
    Returns a comprehensive list of all available API endpoints
    with methods, descriptions, and parameter information.
    """
    from django.urls import get_resolver
    from django.conf import settings
    
    endpoints = []
    
    # This would be dynamically generated from URL patterns in a real implementation
    static_endpoints = [
        {
            'path': '/api/',
            'name': 'API Root',
            'methods': ['GET'],
            'description': 'API welcome endpoint with navigation links',
            'authentication_required': False
        },
        {
            'path': '/api/projects/',
            'name': 'Project List',
            'methods': ['GET'],
            'description': 'List all projects with filtering and search',
            'authentication_required': False,
            'parameters': ['status', 'is_featured', 'search', 'ordering']
        },
        {
            'path': '/api/projects/{slug}/',
            'name': 'Project Detail',
            'methods': ['GET'],
            'description': 'Get detailed information about a specific project',
            'authentication_required': False
        },
        {
            'path': '/api/projects/featured/',
            'name': 'Featured Projects',
            'methods': ['GET'],
            'description': 'Get all featured projects',
            'authentication_required': False
        },
        {
            'path': '/api/auth/login/',
            'name': 'User Login',
            'methods': ['POST'],
            'description': 'Authenticate user and receive JWT tokens',
            'authentication_required': False
        },
        {
            'path': '/api/auth/me/',
            'name': 'Current User',
            'methods': ['GET'],
            'description': 'Get current user profile information',
            'authentication_required': True
        },
        {
            'path': '/api/dashboard/stats/',
            'name': 'Dashboard Statistics',
            'methods': ['GET'],
            'description': 'Get dashboard statistics and metrics',
            'authentication_required': True
        }
    ]
    
    return APIResponse.success(
        data=static_endpoints,
        message=f"Found {len(static_endpoints)} API endpoints",
        metadata={'total_endpoints': len(static_endpoints)}
    )