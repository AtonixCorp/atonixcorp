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
from projects.models import Project
from teams.models import Team
from resources.models import Resource
from focus_areas.models import FocusArea
from contact.models import ContactPerson, OfficeLocation


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
            'documentation': 'https://docs.atonixcorp.com',
            'status_page': 'https://status.atonixcorp.com',
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


def interactive_api_root(request):
    """
    Interactive API Root viewer.

    Provides a web-based interface for exploring all available API endpoints
    with interactive browsing, testing, and documentation.
    """
    # Get real data counts for display
    projects_count = Project.objects.count()
    teams_count = Team.objects.count()
    resources_count = Resource.objects.count()
    focus_areas_count = FocusArea.objects.count()
    contact_persons_count = ContactPerson.objects.count()
    office_locations_count = OfficeLocation.objects.count()

    context = {
        'api_version': '1.0.0',
        'environment': getattr(settings, 'ENVIRONMENT', 'development'),
        'base_url': request.build_absolute_uri('/'),
        'api_url': request.build_absolute_uri('/api/'),
        'docs_url': request.build_absolute_uri('/api/docs/'),
        'redoc_url': request.build_absolute_uri('/api/redoc/'),
        'health_url': request.build_absolute_uri('/api/health/'),
        'admin_url': request.build_absolute_uri('/admin/'),

        # Real data counts
        'projects_count': projects_count,
        'teams_count': teams_count,
        'resources_count': resources_count,
        'focus_areas_count': focus_areas_count,
        'contact_persons_count': contact_persons_count,
        'office_locations_count': office_locations_count,

        # API endpoints data
        'endpoints': {
            'projects': {
                'url': request.build_absolute_uri('/api/projects/'),
                'interactive_url': request.build_absolute_uri('/api/browse/projects/'),
                'description': 'Project management and tracking',
                'methods': ['GET'],
                'auth_required': False,
                'features': ['Filtering', 'Search', 'Pagination', 'Featured projects']
            },
            'teams': {
                'url': request.build_absolute_uri('/api/teams/'),
                'interactive_url': request.build_absolute_uri('/api/browse/teams/'),
                'description': 'Team collaboration and member management',
                'methods': ['GET'],
                'auth_required': True,
                'features': ['Team listings', 'Member management', 'Role assignments']
            },
            'focus_areas': {
                'url': request.build_absolute_uri('/api/focus-areas/'),
                'interactive_url': request.build_absolute_uri('/api/browse/focus-areas/'),
                'description': 'Focus area categorization and organization',
                'methods': ['GET'],
                'auth_required': False,
                'features': ['Category management', 'Priority sorting', 'Project associations']
            },
            'resources': {
                'url': request.build_absolute_uri('/api/resources/'),
                'interactive_url': request.build_absolute_uri('/api/browse/resources/'),
                'description': 'Resource management and sharing',
                'methods': ['GET'],
                'auth_required': False,
                'features': ['Resource library', 'File management', 'Sharing controls']
            },
            'dashboard': {
                'url': request.build_absolute_uri('/api/dashboard/'),
                'interactive_url': request.build_absolute_uri('/api/browse/dashboard/'),
                'description': 'Analytics and dashboard data',
                'methods': ['GET'],
                'auth_required': True,
                'features': ['Real-time metrics', 'Performance analytics', 'Custom dashboards']
            },
            'contact': {
                'url': request.build_absolute_uri('/api/contact/'),
                'interactive_url': request.build_absolute_uri('/api/browse/contact/'),
                'description': 'Contact form and communication',
                'methods': ['GET', 'POST'],
                'auth_required': False,
                'features': ['Contact forms', 'Office locations', 'Support requests']
            },
            'analytics': {
                'url': request.build_absolute_uri('/api/status/analytics/'),
                'interactive_url': request.build_absolute_uri('/api/browse/analytics/'),
                'description': 'Comprehensive site analytics and statistics',
                'methods': ['GET'],
                'auth_required': False,
                'features': ['User metrics', 'Content analytics', 'Growth trends']
            },
            'status': {
                'url': request.build_absolute_uri('/api/status/status/'),
                'interactive_url': request.build_absolute_uri('/api/browse/status/'),
                'description': 'Real-time system status and health monitoring',
                'methods': ['GET'],
                'auth_required': False,
                'features': ['Service status', 'Performance metrics', 'Incident tracking']
            }
        },

        # Authentication endpoints
        'auth_endpoints': {
            'login': request.build_absolute_uri('/api/auth/login/'),
            'signup': request.build_absolute_uri('/api/auth/signup/'),
            'logout': request.build_absolute_uri('/api/auth/logout/'),
            'profile': request.build_absolute_uri('/api/auth/me/'),
        },

        # System endpoints
        'system_endpoints': {
            'health': request.build_absolute_uri('/api/health/'),
            'schema': request.build_absolute_uri('/api/schema/'),
            'docs': request.build_absolute_uri('/api/docs/'),
            'redoc': request.build_absolute_uri('/api/redoc/'),
        }
    }

    return render(request, 'api/interactive_root.html', context)


def browse_projects(request):
    """
    Interactive Projects Browser.

    Provides a web-based interface for browsing and exploring projects
    with filtering, search, and detailed project views.
    """
    # Get featured projects for quick access
    featured_projects = Project.objects.filter(is_featured=True).select_related().order_by('-created_at')[:6]

    # Get project status distribution
    from django.db.models import Count
    status_counts = Project.objects.values('status').annotate(count=Count('status')).order_by('status')

    # Get technology tags (mock data for now)
    technologies = [
        'React', 'Django', 'Python', 'JavaScript', 'TypeScript',
        'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'AWS'
    ]

    context = {
        'api_version': '1.0.0',
        'base_url': request.build_absolute_uri('/'),
        'api_url': request.build_absolute_uri('/api/projects/'),
        'featured_projects': featured_projects,
        'total_projects': Project.objects.count(),
        'status_counts': status_counts,
        'technologies': technologies,

        # Filter options
        'status_options': [
            {'value': 'active', 'label': 'Active', 'count': Project.objects.filter(status='active').count()},
            {'value': 'development', 'label': 'Development', 'count': Project.objects.filter(status='development').count()},
            {'value': 'completed', 'label': 'Completed', 'count': Project.objects.filter(status='completed').count()},
            {'value': 'paused', 'label': 'Paused', 'count': Project.objects.filter(status='paused').count()},
        ],

        # API endpoints for AJAX calls
        'endpoints': {
            'list': request.build_absolute_uri('/api/projects/'),
            'featured': request.build_absolute_uri('/api/projects/featured/'),
            'by_status': request.build_absolute_uri('/api/projects/by_status/'),
            'search': request.build_absolute_uri('/api/projects/?search='),
        }
    }

    return render(request, 'api/browse_projects.html', context)


def browse_api_endpoint(request, endpoint_type):
    """
    Generic interactive API browser for different endpoint types.

    Provides a unified interface for browsing different types of API endpoints.
    """
    endpoint_configs = {
        'teams': {
            'title': 'Teams',
            'description': 'Browse and explore team collaborations',
            'api_url': request.build_absolute_uri('/api/teams/'),
            'model': Team,
            'fields': ['name', 'mission', 'description'],
            'icon': '👥',
            'status_field': 'is_active',
            'status_options': [
                {'value': 'active', 'label': 'Active Teams'},
                {'value': 'inactive', 'label': 'Inactive Teams'},
            ],
            'filter_options': {
                'label': 'Skills',
                'values': [
                    {'value': 'python', 'label': 'Python'},
                    {'value': 'javascript', 'label': 'JavaScript'},
                    {'value': 'react', 'label': 'React'},
                    {'value': 'django', 'label': 'Django'},
                ]
            }
        },
        'focus-areas': {
            'title': 'Focus Areas',
            'description': 'Explore technology focus areas and solutions',
            'api_url': request.build_absolute_uri('/api/focus-areas/'),
            'model': FocusArea,
            'fields': ['name', 'description'],
            'icon': '🎯',
        },
        'resources': {
            'title': 'Resources',
            'description': 'Browse resource library and documentation',
            'api_url': request.build_absolute_uri('/api/resources/'),
            'model': Resource,
            'fields': ['title', 'resource_type', 'category'],
            'icon': '🔧',
            'status_field': 'is_active',
            'status_options': [
                {'value': 'active', 'label': 'Active Resources'},
                {'value': 'inactive', 'label': 'Inactive Resources'},
            ],
            'filter_options': {
                'label': 'Category',
                'values': [
                    {'value': 'documentation', 'label': 'Documentation'},
                    {'value': 'tutorial', 'label': 'Tutorial'},
                    {'value': 'tool', 'label': 'Tool'},
                    {'value': 'template', 'label': 'Template'},
                ]
            }
        },
        'contact': {
            'title': 'Contact',
            'description': 'Contact information and office locations',
            'api_url': request.build_absolute_uri('/api/contact/'),
            'model': ContactPerson,
            'fields': ['name', 'title', 'department'],
            'icon': '📞',
        },
        'analytics': {
            'title': 'Site Analytics',
            'description': 'Comprehensive site analytics and statistics',
            'api_url': request.build_absolute_uri('/api/status/analytics/'),
            'model': None,
            'fields': [],
            'icon': '📊',
        },
        'status': {
            'title': 'System Status',
            'description': 'Real-time system health and monitoring',
            'api_url': request.build_absolute_uri('/api/status/status/'),
            'model': None,
            'fields': [],
            'icon': '⚡',
        },
        'dashboard': {
            'title': 'Dashboard',
            'description': 'Analytics dashboard and user metrics',
            'api_url': request.build_absolute_uri('/api/dashboard/'),
            'model': None,
            'fields': [],
            'icon': '📈',
        },
    }

    if endpoint_type not in endpoint_configs:
        return render(request, 'api/error.html', {
            'error_title': 'Endpoint Not Found',
            'error_message': f'No interactive browser available for {endpoint_type}',
        })

    config = endpoint_configs[endpoint_type]

    # Get sample data if model exists
    items = []
    total_count = 0
    stats = []
    status_options = config.get('status_options', [])
    filter_options = config.get('filter_options', {})

    if config['model']:
        # Get total count
        total_count = config['model'].objects.count()

        # Get sample items for display
        items_queryset = config['model'].objects.all().order_by('-created_at')[:10]

        for item in items_queryset:
            item_data = {
                'id': item.id,
                'name': getattr(item, 'name', getattr(item, 'title', str(item))),
                'description': getattr(item, 'description', getattr(item, 'mission', '')),
                'created_at': item.created_at,
                'icon': config['icon'],
                'slug': getattr(item, 'slug', item.id),
                'is_featured': getattr(item, 'is_featured', False),
                'status': getattr(item, config.get('status_field', ''), None),
                'status_display': None,
                'tags': [],
            }

            # Add status display if applicable
            if hasattr(item, 'get_' + config.get('status_field', '') + '_display'):
                item_data['status_display'] = getattr(item, 'get_' + config.get('status_field', '') + '_display')()

            # Add tags based on endpoint type
            if endpoint_type == 'teams' and hasattr(item, 'skills'):
                skills_list = list(item.skills.all()) if hasattr(item.skills, 'all') else []
                item_data['tags'] = [skill.name for skill in skills_list[:3]] if skills_list else []
            elif endpoint_type == 'resources' and hasattr(item, 'category'):
                item_data['tags'] = [item.category] if item.category else []

            items.append(item_data)

        # Get stats
        if status_options:
            for status_opt in status_options:
                count = config['model'].objects.filter(**{config.get('status_field', ''): status_opt['value'] == 'active'}).count()
                stats.append({
                    'label': status_opt['label'],
                    'count': count,
                })

    context = {
        'endpoint_type': endpoint_type,
        'title': config['title'],
        'description': config['description'],
        'api_url': config['api_url'],
        'total_count': total_count,
        'items': items,
        'stats': stats,
        'status_options': status_options,
        'filter_options': filter_options,
        'filter_param': filter_options.get('param', 'category') if filter_options else '',
        'base_url': request.build_absolute_uri('/'),
    }

    return render(request, 'api/browse_endpoint.html', context)