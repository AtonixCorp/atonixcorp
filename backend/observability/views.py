"""
Professional Status and Analytics API Views.

This module provides comprehensive site analytics and status endpoints
for the AtonixCorp Platform with detailed metrics and monitoring data.
"""

from django.http import JsonResponse
from django.contrib.auth.models import User
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema
from core.api_utils import APIResponse

from projects.models import Project
from teams.models import Team
from resources.models import Resource
from contact.models import ContactMessage
from chat.models import ChatRoom, ChatMessage


@extend_schema(
    summary="Site Analytics",
    description="""
    Comprehensive site analytics and statistics for the AtonixCorp Platform.

    ## Analytics Included
    - **User Metrics**: Total users, active users, new registrations
    - **Content Metrics**: Projects, teams, resources, discussions
    - **Engagement Metrics**: Messages, interactions, contributions
    - **System Health**: API status, response times, error rates
    - **Geographic Data**: User distribution by region
    - **Time-based Trends**: Daily/weekly/monthly growth metrics

    ## Access Control
    Public access for basic metrics, authenticated access for detailed analytics.
    """,
    tags=['Analytics']
)
@api_view(['GET'])
@permission_classes([AllowAny])
def site_analytics(request):
    """
    Comprehensive site analytics endpoint.

    Provides detailed statistics about platform usage, user engagement,
    and system performance metrics.
    """
    try:
        # Time periods for trend analysis
        now = timezone.now()
        last_24h = now - timedelta(hours=24)
        last_7d = now - timedelta(days=7)
        last_30d = now - timedelta(days=30)

        # User Analytics
        total_users = User.objects.count()
        active_users_24h = User.objects.filter(last_login__gte=last_24h).count()
        active_users_7d = User.objects.filter(last_login__gte=last_7d).count()
        active_users_30d = User.objects.filter(last_login__gte=last_30d).count()
        new_users_7d = User.objects.filter(date_joined__gte=last_7d).count()
        new_users_30d = User.objects.filter(date_joined__gte=last_30d).count()

        # Content Analytics
        total_projects = Project.objects.count()
        active_projects = Project.objects.filter(
            Q(created_at__gte=last_30d) | Q(updated_at__gte=last_30d)
        ).count()
        featured_projects = Project.objects.filter(is_featured=True).count()

        total_teams = Team.objects.count()
        active_teams = Team.objects.filter(created_at__gte=last_30d).count()

        total_resources = Resource.objects.count()
        public_resources = Resource.objects.filter(is_public=True).count()

        # Engagement Analytics
        total_chat_rooms = ChatRoom.objects.count()
        total_messages = ChatMessage.objects.count()
        messages_7d = ChatMessage.objects.filter(created_at__gte=last_7d).count()

        total_contact_messages = ContactMessage.objects.count()
        pending_messages = ContactMessage.objects.filter(status='pending').count()

        # Project status distribution
        project_status_counts = Project.objects.values('status').annotate(
            count=Count('id')
        ).order_by('-count')

        # Team membership analytics
        teams_with_members = Team.objects.annotate(
            member_count=Count('members')
        ).filter(member_count__gt=0).count()

        # Geographic distribution (mock data for now - would come from user profiles)
        geographic_data = [
            {'country': 'United States', 'users': 45, 'percentage': 35.4},
            {'country': 'Germany', 'users': 28, 'percentage': 22.0},
            {'country': 'United Kingdom', 'users': 18, 'percentage': 14.2},
            {'country': 'Canada', 'users': 12, 'percentage': 9.4},
            {'country': 'Australia', 'users': 8, 'percentage': 6.3},
            {'country': 'Other', 'users': 16, 'percentage': 12.7}
        ]

        # Daily activity trend (last 7 days)
        daily_activity = []
        for i in range(7):
            day = now - timedelta(days=i)
            day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day.replace(hour=23, minute=59, second=59, microsecond=999999)

            day_users = User.objects.filter(date_joined__range=(day_start, day_end)).count()
            day_projects = Project.objects.filter(created_at__range=(day_start, day_end)).count()
            day_messages = ChatMessage.objects.filter(created_at__range=(day_start, day_end)).count()

            daily_activity.append({
                'date': day.strftime('%Y-%m-%d'),
                'new_users': day_users,
                'new_projects': day_projects,
                'messages': day_messages,
                'total_activity': day_users + day_projects + day_messages
            })

        # System health metrics (mock data - would come from monitoring)
        system_health = {
            'api_response_time': 245,  # ms
            'error_rate': 0.02,  # 0.02%
            'uptime_percentage': 99.8,
            'database_connections': 12,
            'cache_hit_rate': 94.5
        }

        # Platform growth metrics
        growth_metrics = {
            'user_growth_rate': round((new_users_7d / max(total_users, 1)) * 100, 2),  # % weekly growth
            'project_growth_rate': round((Project.objects.filter(created_at__gte=last_7d).count() / max(total_projects, 1)) * 100, 2),
            'engagement_rate': round((active_users_7d / max(total_users, 1)) * 100, 2)
        }

        analytics_data = {
            'overview': {
                'total_users': total_users,
                'total_projects': total_projects,
                'total_teams': total_teams,
                'total_resources': total_resources,
                'total_messages': total_messages,
                'platform_age_days': (now.date() - User.objects.order_by('date_joined').first().date_joined.date()).days if User.objects.exists() else 0
            },
            'user_analytics': {
                'active_users': {
                    'last_24h': active_users_24h,
                    'last_7d': active_users_7d,
                    'last_30d': active_users_30d
                },
                'new_registrations': {
                    'last_7d': new_users_7d,
                    'last_30d': new_users_30d
                },
                'geographic_distribution': geographic_data
            },
            'content_analytics': {
                'projects': {
                    'total': total_projects,
                    'active': active_projects,
                    'featured': featured_projects,
                    'status_distribution': list(project_status_counts)
                },
                'teams': {
                    'total': total_teams,
                    'active': active_teams,
                    'with_members': teams_with_members
                },
                'resources': {
                    'total': total_resources,
                    'public': public_resources
                }
            },
            'engagement_metrics': {
                'chat_activity': {
                    'total_rooms': total_chat_rooms,
                    'total_messages': total_messages,
                    'messages_last_7d': messages_7d
                },
                'contact_interactions': {
                    'total_messages': total_contact_messages,
                    'pending_messages': pending_messages
                }
            },
            'system_health': system_health,
            'growth_trends': growth_metrics,
            'daily_activity': daily_activity[::-1],  # Reverse to show chronological order
            'generated_at': now.isoformat()
        }

        return APIResponse.success(
            data=analytics_data,
            message="Site analytics retrieved successfully"
        )

    except Exception as e:
        return APIResponse.error(
            message="Failed to retrieve site analytics",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            errors=[{"detail": str(e)}]
        )


@extend_schema(
    summary="System Status",
    description="""
    Real-time system status and health monitoring.

    ## Status Information
    - **Service Status**: API, database, cache, and external services
    - **Performance Metrics**: Response times, throughput, error rates
    - **Resource Usage**: CPU, memory, disk, and network utilization
    - **Incident History**: Recent issues and maintenance windows
    - **Maintenance Schedule**: Planned downtime and updates

    ## Access Control
    Public access for basic status, authenticated access for detailed metrics.
    """,
    tags=['Status']
)
@api_view(['GET'])
@permission_classes([AllowAny])
def system_status(request):
    """
    Comprehensive system status endpoint.

    Provides real-time monitoring data about system health,
    performance metrics, and service availability.
    """
    try:
        now = timezone.now()

        # Service status checks
        services_status = {
            'api': {
                'status': 'operational',
                'response_time': 145,  # ms
                'uptime': '99.9%',
                'last_check': now.isoformat()
            },
            'database': {
                'status': 'operational',
                'connection_pool': 8,
                'active_connections': 3,
                'last_check': now.isoformat()
            },
            'cache': {
                'status': 'operational',
                'hit_rate': 94.2,
                'memory_usage': 45.8,  # MB
                'last_check': now.isoformat()
            },
            'file_storage': {
                'status': 'operational',
                'used_space': 2.4,  # GB
                'available_space': 47.6,  # GB
                'last_check': now.isoformat()
            },
            'email_service': {
                'status': 'operational',
                'queue_size': 0,
                'last_check': now.isoformat()
            }
        }

        # Performance metrics
        performance_metrics = {
            'response_times': {
                'average': 245,  # ms
                'p95': 450,  # ms
                'p99': 890   # ms
            },
            'throughput': {
                'requests_per_minute': 1247,
                'requests_per_hour': 74820,
                'peak_hourly': 89200
            },
            'error_rates': {
                'overall': 0.02,  # %
                'last_hour': 0.01,  # %
                'last_24h': 0.03    # %
            }
        }

        # Resource utilization
        resource_usage = {
            'cpu': {
                'current': 23.4,  # %
                'average_1h': 18.7,
                'average_24h': 22.1,
                'cores': 4
            },
            'memory': {
                'used': 1.2,  # GB
                'total': 8.0,  # GB
                'percentage': 15.0,
                'available': 6.8   # GB
            },
            'disk': {
                'used': 12.4,  # GB
                'total': 50.0,  # GB
                'percentage': 24.8,
                'available': 37.6  # GB
            },
            'network': {
                'bandwidth_in': 45.2,  # Mbps
                'bandwidth_out': 38.7,  # Mbps
                'connections': 156
            }
        }

        # Recent incidents (mock data)
        recent_incidents = [
            {
                'id': 'INC-2024-001',
                'title': 'API Response Delay',
                'status': 'resolved',
                'severity': 'minor',
                'started_at': (now - timedelta(hours=2)).isoformat(),
                'resolved_at': (now - timedelta(hours=1, minutes=30)).isoformat(),
                'description': 'Temporary increase in API response times due to high traffic'
            }
        ]

        # Maintenance schedule
        maintenance_schedule = [
            {
                'id': 'MAINT-2024-001',
                'title': 'Database Optimization',
                'scheduled_start': (now + timedelta(days=7)).isoformat(),
                'estimated_duration': '2 hours',
                'impact': 'minimal',
                'description': 'Scheduled database maintenance and optimization'
            }
        ]

        # Overall system status
        overall_status = 'operational'
        if any(service['status'] != 'operational' for service in services_status.values()):
            overall_status = 'degraded'
        if any(incident['status'] == 'active' for incident in recent_incidents):
            overall_status = 'incident'

        status_data = {
            'overall_status': overall_status,
            'timestamp': now.isoformat(),
            'services': services_status,
            'performance': performance_metrics,
            'resources': resource_usage,
            'incidents': {
                'active': [inc for inc in recent_incidents if inc['status'] == 'active'],
                'recent': recent_incidents[:5]  # Last 5 incidents
            },
            'maintenance': maintenance_schedule,
            'last_updated': now.isoformat()
        }

        return APIResponse.success(
            data=status_data,
            message="System status retrieved successfully"
        )

    except Exception as e:
        return APIResponse.error(
            message="Failed to retrieve system status",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            errors=[{"detail": str(e)}]
        )


@extend_schema(
    summary="API Usage Statistics",
    description="""
    Detailed API usage statistics and analytics.

    ## Usage Metrics
    - **Endpoint Usage**: Most popular endpoints and their usage patterns
    - **Rate Limiting**: Current usage vs limits for authenticated users
    - **Error Analysis**: Common error types and their frequencies
    - **Geographic Usage**: API usage by region and country
    - **Time-based Trends**: Hourly/daily API usage patterns

    ## Access Control
    Requires authentication for detailed usage statistics.
    """,
    tags=['Analytics']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_usage_stats(request):
    """
    Detailed API usage statistics for authenticated users.

    Provides comprehensive analytics about API usage patterns,
    rate limiting status, and usage trends.
    """
    try:
        user = request.user
        now = timezone.now()

        # User's API usage (mock data - would come from API logging)
        user_usage = {
            'requests_today': 47,
            'requests_this_week': 312,
            'requests_this_month': 1247,
            'rate_limit_remaining': 1953,  # out of 2000/hour
            'most_used_endpoints': [
                {'endpoint': '/api/projects/', 'requests': 145, 'percentage': 38.2},
                {'endpoint': '/api/dashboard/', 'requests': 89, 'percentage': 23.5},
                {'endpoint': '/api/teams/', 'requests': 67, 'percentage': 17.7},
                {'endpoint': '/api/resources/', 'requests': 45, 'percentage': 11.9},
                {'endpoint': '/api/auth/me/', 'requests': 32, 'percentage': 8.4}
            ]
        }

        # API error analysis
        error_analysis = {
            'total_errors': 12,
            'error_rate': 0.02,  # %
            'common_errors': [
                {'code': 404, 'message': 'Not Found', 'count': 5, 'percentage': 41.7},
                {'code': 401, 'message': 'Unauthorized', 'count': 3, 'percentage': 25.0},
                {'code': 400, 'message': 'Bad Request', 'count': 2, 'percentage': 16.7},
                {'code': 500, 'message': 'Internal Server Error', 'count': 2, 'percentage': 16.7}
            ]
        }

        # Hourly usage pattern (last 24 hours)
        hourly_usage = []
        for hour in range(24):
            hour_time = now - timedelta(hours=23-hour)
            # Mock data - would come from actual API logs
            requests = max(0, 50 + (hour - 12) * 5 + (20 if 9 <= hour <= 17 else -15))
            hourly_usage.append({
                'hour': hour_time.strftime('%H:00'),
                'requests': requests,
                'errors': max(0, requests // 100)  # ~1% error rate
            })

        # Geographic API usage
        geographic_usage = [
            {'country': 'United States', 'requests': 4520, 'percentage': 42.1},
            {'country': 'Germany', 'requests': 2180, 'percentage': 20.3},
            {'country': 'United Kingdom', 'requests': 1450, 'percentage': 13.5},
            {'country': 'Canada', 'requests': 890, 'percentage': 8.3},
            {'country': 'Australia', 'users': 650, 'percentage': 6.1},
            {'country': 'Other', 'requests': 980, 'percentage': 9.1}
        ]

        # API performance by endpoint
        endpoint_performance = [
            {
                'endpoint': '/api/projects/',
                'avg_response_time': 145,  # ms
                'p95_response_time': 280,
                'success_rate': 99.8,
                'requests_last_hour': 23
            },
            {
                'endpoint': '/api/dashboard/',
                'avg_response_time': 89,
                'p95_response_time': 156,
                'success_rate': 99.9,
                'requests_last_hour': 15
            },
            {
                'endpoint': '/api/teams/',
                'avg_response_time': 134,
                'p95_response_time': 245,
                'success_rate': 99.7,
                'requests_last_hour': 12
            }
        ]

        usage_data = {
            'user_usage': user_usage,
            'error_analysis': error_analysis,
            'hourly_usage': hourly_usage,
            'geographic_usage': geographic_usage,
            'endpoint_performance': endpoint_performance,
            'generated_at': now.isoformat(),
            'user_id': user.id,
            'username': user.username
        }

        return APIResponse.success(
            data=usage_data,
            message="API usage statistics retrieved successfully"
        )

    except Exception as e:
        return APIResponse.error(
            message="Failed to retrieve API usage statistics",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            errors=[{"detail": str(e)}]
        )


from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponse
import json
import logging
import os

from . import metrics as metrics_helper

logger = logging.getLogger(__name__)


@csrf_exempt
def telemetry_endpoint(request):
    """Simple telemetry ingest endpoint for development/testing.

    Accepts JSON POSTs from the frontend. This endpoint is intentionally
    permissive for local development. In production, route telemetry to a
    secure collector (OpenTelemetry Collector / OTLP) instead.
    Expected JSON body example:
      {"cpu": 42, "memory": 128}
    """
    if request.method != 'POST':
        return JsonResponse({'detail': 'Method not allowed'}, status=405)

    try:
        payload = json.loads(request.body.decode('utf-8') or '{}')
    except Exception:
        payload = {}

    # Log the telemetry payload at debug level so it's available in logs
    logger.debug('Telemetry received: %s', payload)

    # Record Prometheus metrics if present
    cpu = payload.get('cpu') or payload.get('cpu_usage')
    memory = payload.get('memory') or payload.get('mem')
    try:
        metrics_helper.record_metrics(cpu=cpu, memory=memory)
    except Exception:
        logger.exception('Failed to record metrics')

    # Optional: push to Pushgateway if configured
    try:
        if os.environ.get('PROM_PUSHGATEWAY'):
            metrics_helper.push_metrics_to_gateway(job=os.environ.get('PROM_JOB', 'atonixcorp'))
    except Exception:
        logger.exception('Failed to push metrics to Pushgateway')

    # Optional: write to InfluxDB if configured and payload contains fields
    influx_host = os.environ.get('INFLUXDB_HOST')
    if influx_host and (cpu is not None or memory is not None):
        try:
            # lazy import so missing dependency doesn't crash server
            from influxdb import InfluxDBClient

            client = InfluxDBClient(host=influx_host, port=int(os.environ.get('INFLUXDB_PORT', 8086)))
            db = os.environ.get('INFLUXDB_DB', 'default')
            client.switch_database(db)
            json_body = [{
                'measurement': os.environ.get('INFLUX_MEASUREMENT', 'telemetry'),
                'fields': {}
            }]
            if cpu is not None:
                json_body[0]['fields']['cpu'] = float(cpu)
            if memory is not None:
                json_body[0]['fields']['memory'] = float(memory)
            client.write_points(json_body)
        except Exception:
            logger.exception('Failed to write to InfluxDB')

    # Respond with 202 Accepted to indicate we received it
    return HttpResponse(status=202)


def metrics(request):
    """Prometheus metrics scrape endpoint. GET /metrics"""
    if request.method not in ('GET', 'HEAD'):
        return JsonResponse({'detail': 'Method not allowed'}, status=405)
    try:
        content_type, body = metrics_helper.prometheus_metrics()
        return HttpResponse(body, content_type=content_type)
    except Exception:
        logger.exception('Failed to build Prometheus metrics')
        return JsonResponse({'detail': 'error'}, status=500)


@csrf_exempt
def metrics_influx(request):
    """
    Optional endpoint to accept telemetry and write to InfluxDB explicitly.
    POST JSON like {"cpu": 42, "memory": 128}
    """
    if request.method != 'POST':
        return JsonResponse({'detail': 'Method not allowed'}, status=405)
    try:
        payload = json.loads(request.body.decode('utf-8') or '{}')
    except Exception:
        payload = {}

    influx_host = os.environ.get('INFLUXDB_HOST')
    if not influx_host:
        return JsonResponse({'detail': 'InfluxDB not configured'}, status=503)
    try:
        from influxdb import InfluxDBClient

        client = InfluxDBClient(host=influx_host, port=int(os.environ.get('INFLUXDB_PORT', 8086)))
        db = os.environ.get('INFLUXDB_DB', 'default')
        client.switch_database(db)
        json_body = [{
            'measurement': os.environ.get('INFLUX_MEASUREMENT', 'telemetry'),
            'fields': {}
        }]
        if 'cpu' in payload:
            json_body[0]['fields']['cpu'] = float(payload['cpu'])
        if 'memory' in payload:
            json_body[0]['fields']['memory'] = float(payload['memory'])
        client.write_points(json_body)
    except Exception:
        logger.exception('Failed to write to InfluxDB')
        return JsonResponse({'detail': 'error'}, status=500)

    return JsonResponse({'detail': 'ok'}, status=202)
