"""
Landing page views for the AtonixCorp Platform API.

This module provides the main landing page and documentation views
for users visiting the root URL of the API.
"""

from django.shortcuts import render
from django.http import JsonResponse
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from core.api_utils import APIResponse


def landing_page(request):
    """
    Professional landing page for the API.
    
    This view renders the main landing page with comprehensive information
    about the API, its endpoints, features, and getting started guide.
    """
    context = {
        'api_version': '1.0.0',
        'environment': getattr(settings, 'ENVIRONMENT', 'development'),
        'base_url': request.build_absolute_uri('/'),
        'api_url': request.build_absolute_uri('/api/'),
        'docs_url': request.build_absolute_uri('/api/docs/'),
        'redoc_url': request.build_absolute_uri('/api/redoc/'),
        'health_url': request.build_absolute_uri('/api/health/'),
        'admin_url': request.build_absolute_uri('/admin/'),
        'projects_url': request.build_absolute_uri('/api/projects/'),
        'teams_url': request.build_absolute_uri('/api/teams/'),
        'dashboard_url': request.build_absolute_uri('/api/dashboard/'),
        'auth_url': request.build_absolute_uri('/api/auth/'),
    }
    
    return render(request, 'api/landing.html', context)


@api_view(['GET'])
@permission_classes([AllowAny])
def api_info(request):
    """
    API information endpoint.
    
    Returns comprehensive information about the API including
    version, endpoints, status, and usage statistics.
    """
    from django.urls import reverse
    
    info_data = {
        'name': 'AtonixCorp Platform API',
        'version': '1.0.0',
        'description': 'Professional REST API for project management, team collaboration, and analytics',
        'status': 'operational',
        'environment': getattr(settings, 'ENVIRONMENT', 'development'),
        'documentation': {
            'swagger': request.build_absolute_uri(reverse('swagger-ui')),
            'redoc': request.build_absolute_uri(reverse('redoc')),
            'schema': request.build_absolute_uri(reverse('schema')),
        },
        'endpoints': {
            'projects': {
                'url': request.build_absolute_uri('/api/projects/'),
                'methods': ['GET'],
                'description': 'Project management and tracking',
                'authentication': 'Optional',
                'features': ['Filtering', 'Search', 'Pagination', 'Featured projects']
            },
            'teams': {
                'url': request.build_absolute_uri('/api/teams/'),
                'methods': ['GET'],
                'description': 'Team collaboration and member management', 
                'authentication': 'Required',
                'features': ['Team listings', 'Member management', 'Role assignments']
            },
            'focus_areas': {
                'url': request.build_absolute_uri('/api/focus-areas/'),
                'methods': ['GET'],
                'description': 'Focus area categorization and organization',
                'authentication': 'Optional',
                'features': ['Category management', 'Priority sorting', 'Project associations']
            },
            'resources': {
                'url': request.build_absolute_uri('/api/resources/'),
                'methods': ['GET'],
                'description': 'Resource management and sharing',
                'authentication': 'Optional',
                'features': ['Resource library', 'File management', 'Sharing controls']
            },
            'dashboard': {
                'url': request.build_absolute_uri('/api/dashboard/'),
                'methods': ['GET'],
                'description': 'Analytics and dashboard data',
                'authentication': 'Required',
                'features': ['Real-time metrics', 'Performance analytics', 'Custom dashboards']
            },
            'authentication': {
                'url': request.build_absolute_uri('/api/auth/'),
                'methods': ['POST', 'GET', 'DELETE'],
                'description': 'User authentication and session management',
                'authentication': 'Public',
                'features': ['JWT tokens', 'Social login', 'Session management', 'Profile management']
            }
        },
        'authentication': {
            'methods': [
                {
                    'type': 'JWT Bearer Token',
                    'header': 'Authorization: Bearer <token>',
                    'description': 'JSON Web Token authentication for API access'
                },
                {
                    'type': 'API Key',
                    'header': 'X-API-Key: <api_key>',
                    'description': 'API key authentication for service-to-service communication'
                },
                {
                    'type': 'Session Authentication',
                    'header': 'Cookie: sessionid=<session_id>',
                    'description': 'Cookie-based session authentication for web clients'
                }
            ]
        },
        'rate_limits': {
            'authenticated_users': '1000 requests/hour',
            'anonymous_users': '100 requests/hour',
            'premium_api_keys': '10000 requests/hour'
        },
        'response_format': {
            'success': {
                'success': True,
                'message': 'Operation completed successfully',
                'timestamp': '2024-09-24T10:30:00.000Z',
                'status_code': 200,
                'data': '...',
                'metadata': '...'
            },
            'error': {
                'success': False,
                'message': 'Error description',
                'timestamp': '2024-09-24T10:30:00.000Z',
                'status_code': 400,
                'errors': [
                    {
                        'field': 'field_name',
                        'message': 'Error message',
                        'code': 'error_code'
                    }
                ]
            }
        },
        'support': {
            'email': 'api@atonixcorp.com',
            'documentation': 'https://docs.atonixcorp.org',
            'status_page': 'https://status.atonixcorp.org',
            'github': 'https://github.com/atonixcorp/platform'
        },
        'server_info': {
            'timestamp': '2024-09-24T10:30:00.000Z',
            'django_version': getattr(settings, 'DJANGO_VERSION', 'Unknown'),
            'debug_mode': settings.DEBUG,
            'timezone': str(settings.TIME_ZONE),
            'language': settings.LANGUAGE_CODE
        }
    }
    
    return APIResponse.success(
        data=info_data,
        message="API information retrieved successfully"
    )


def api_documentation(request):
    """
    Professional API documentation page.
    
    This view renders a comprehensive, professional documentation page
    with detailed information about all API endpoints, authentication,
    examples, and best practices.
    """
    context = {
        'api_version': '1.0.0',
        'environment': getattr(settings, 'ENVIRONMENT', 'development'),
        'base_url': request.build_absolute_uri('/'),
        'api_url': request.build_absolute_uri('/api/'),
        'docs_url': request.build_absolute_uri('/api/docs/'),
        'redoc_url': request.build_absolute_uri('/api/redoc/'),
        'health_url': request.build_absolute_uri('/api/health/'),
        'admin_url': request.build_absolute_uri('/admin/'),
        'projects_url': request.build_absolute_uri('/api/projects/'),
        'teams_url': request.build_absolute_uri('/api/teams/'),
        'dashboard_url': request.build_absolute_uri('/api/dashboard/'),
        'auth_url': request.build_absolute_uri('/api/auth/'),
        'contact_url': request.build_absolute_uri('/api/contact/'),
        'focus_areas_url': request.build_absolute_uri('/api/focus-areas/'),
        'resources_url': request.build_absolute_uri('/api/resources/'),
    }
    
    return render(request, 'api/documentation.html', context)