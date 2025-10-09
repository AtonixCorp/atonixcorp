from rest_framework.permissions import BasePermission
from .permissions import user_has_permission

from .models import AuditLog



logger = logging.getLogger('security')class RBACPermission(BasePermission):

    """

    DRF permission class that integrates with the RBAC system.

@shared_task(bind=True, max_retries=3)    

def log_audit_async(self, audit_data):    Usage:

    """    1. Set permission_required on the view/viewset

    Asynchronous task to log audit entries.    2. Add RBACPermission to permission_classes

        

    This task runs in the background to avoid blocking request processing.    Example:

    Includes retry logic for resilience.        class ProjectViewSet(viewsets.ModelViewSet):

    """            permission_classes = [RBACPermission]

    try:            permission_required = 'write:projects'

        # Remove user instance if present (not serializable)    """

        user_id = None    

        if audit_data.get('user'):    def has_permission(self, request, view):

            user_id = audit_data['user'].id if hasattr(audit_data['user'], 'id') else None        # Get the required permission from the view

            audit_data['user'] = None        permission_required = getattr(view, 'permission_required', None)

                

        # Create the audit log entry        if not permission_required:

        audit_log = AuditLog.objects.create(**audit_data)            # If no permission specified, default to allowing authenticated users

                    return request.user and request.user.is_authenticated

        # Update with user ID if we had one        

        if user_id:        # Check if user has the required permission

            from django.contrib.auth import get_user_model        return user_has_permission(request.user, permission_required)

            User = get_user_model()

            try:    def has_object_permission(self, request, view, obj):

                user = User.objects.get(id=user_id)        # For object-level permissions, use the same logic as has_permission

                audit_log.user = user        return self.has_permission(request, view)

                audit_log.save(update_fields=['user'])

            except User.DoesNotExist:

                passclass RBACObjectPermission(BasePermission):

            """

        logger.info(f'Audit log created: {audit_log.id}')    Object-level RBAC permission for fine-grained access control.

        return audit_log.id    

            Usage:

    except Exception as exc:        class ProjectViewSet(viewsets.ModelViewSet):

        logger.exception(f'Failed to create audit log: {exc}')            permission_classes = [RBACObjectPermission]

        # Retry with exponential backoff            permission_map = {

        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))                'GET': 'read:projects',

                'POST': 'create:projects',

                'PUT': 'update:projects',

@shared_task                'PATCH': 'update:projects',

def cleanup_old_audit_logs(days=90):                'DELETE': 'delete:projects',

    """            }

    Clean up old audit logs to prevent database bloat.    """

        

    Args:    def has_permission(self, request, view):

        days: Number of days to keep audit logs (default: 90)        # Check basic authentication

    """        if not request.user or not request.user.is_authenticated:

    from django.utils import timezone            return False

    from datetime import timedelta        

            # Get permission mapping from the view

    cutoff_date = timezone.now() - timedelta(days=days)        permission_map = getattr(view, 'permission_map', {})

            required_permission = permission_map.get(request.method)

    try:        

        deleted_count = AuditLog.objects.filter(created_at__lt=cutoff_date).delete()[0]        if not required_permission:

        logger.info(f'Cleaned up {deleted_count} old audit log entries')            return True  # No specific permission required for this method

        return deleted_count            

    except Exception as exc:        return user_has_permission(request.user, required_permission)

        logger.exception(f'Failed to cleanup audit logs: {exc}')

        raise    def has_object_permission(self, request, view, obj):

        # Use the same logic as has_permission for object-level checks

        return self.has_permission(request, view)

@shared_task

def generate_audit_report(start_date, end_date, user_id=None):

    """class AdminOnlyPermission(BasePermission):

    Generate audit report for a specific time period.    """

        Permission that only allows users with admin role.

    Args:    """

        start_date: Start date for the report (ISO format)    

        end_date: End date for the report (ISO format)    def has_permission(self, request, view):

        user_id: Optional user ID to filter by        return user_has_permission(request.user, 'admin:all')

    """

    from django.utils.dateparse import parse_datetime

    from django.db.models import Countclass ReadOnlyPermission(BasePermission):

    import json    """

        Permission that allows read-only access to users with read permissions.

    try:    """

        start = parse_datetime(start_date)    

        end = parse_datetime(end_date)    def has_permission(self, request, view):

                if request.method in ['GET', 'HEAD', 'OPTIONS']:

        queryset = AuditLog.objects.filter(created_at__range=[start, end])            # Get the resource type from the view

                    resource = getattr(view, 'resource_type', 'generic')

        if user_id:            return user_has_permission(request.user, f'read:{resource}')

            queryset = queryset.filter(user_id=user_id)        return False

        

        # Generate summary statistics

        total_requests = queryset.count()class ConditionalPermission(BasePermission):

            """

        actions_summary = queryset.values('action').annotate(    Conditional permission based on HTTP method.

            count=Count('action')    

        ).order_by('-count')    Usage:

                class ProjectViewSet(viewsets.ModelViewSet):

        status_summary = queryset.values('status_code').annotate(            permission_classes = [ConditionalPermission]

            count=Count('status_code')            permission_map = {

        ).order_by('-count')                'list': 'read:projects',

                        'retrieve': 'read:projects',

        top_users = queryset.exclude(username='').values('username').annotate(                'create': 'create:projects',

            count=Count('username')                'update': 'update:projects',

        ).order_by('-count')[:10]                'partial_update': 'update:projects',

                        'destroy': 'delete:projects',

        top_ips = queryset.exclude(ip_address='').values('ip_address').annotate(            }

            count=Count('ip_address')    """

        ).order_by('-count')[:10]    

            def has_permission(self, request, view):

        report = {        if not request.user or not request.user.is_authenticated:

            'period': {'start': start_date, 'end': end_date},            return False

            'total_requests': total_requests,        

            'actions_summary': list(actions_summary),        # Get the action name

            'status_summary': list(status_summary),        action = getattr(view, 'action', None)

            'top_users': list(top_users),        if not action:

            'top_ips': list(top_ips),            return True

        }        

                # Get permission mapping from the view

        logger.info(f'Generated audit report for period {start_date} to {end_date}')        permission_map = getattr(view, 'permission_map', {})

        return report        required_permission = permission_map.get(action)

                

    except Exception as exc:        if not required_permission:

        logger.exception(f'Failed to generate audit report: {exc}')            return True  # No specific permission required

        raise            

        return user_has_permission(request.user, required_permission)

@shared_task
def detect_suspicious_activity():
    """
    Detect suspicious activity patterns in audit logs.
    
    This task can be run periodically to identify potential security issues.
    """
    from django.utils import timezone
    from datetime import timedelta
    from django.db.models import Count
    
    try:
        # Look at last 24 hours
        since = timezone.now() - timedelta(hours=24)
        recent_logs = AuditLog.objects.filter(created_at__gte=since)
        
        suspicious_activities = []
        
        # Detect multiple failed logins from same IP
        failed_logins = recent_logs.filter(
            action='ACCESS_DENIED',
            path__contains='login'
        ).values('ip_address').annotate(
            count=Count('ip_address')
        ).filter(count__gte=5)
        
        for item in failed_logins:
            suspicious_activities.append({
                'type': 'multiple_failed_logins',
                'ip_address': item['ip_address'],
                'count': item['count']
            })
        
        # Detect unusual activity from single user
        high_activity_users = recent_logs.exclude(username='').values('username').annotate(
            count=Count('username')
        ).filter(count__gte=1000)  # More than 1000 requests in 24h
        
        for item in high_activity_users:
            suspicious_activities.append({
                'type': 'high_activity_user',
                'username': item['username'],
                'count': item['count']
            })
        
        # Detect access from multiple IPs for same user
        multiple_ips = recent_logs.exclude(username='').exclude(ip_address='').values(
            'username'
        ).annotate(
            ip_count=Count('ip_address', distinct=True)
        ).filter(ip_count__gte=10)  # Same user from 10+ different IPs
        
        for item in multiple_ips:
            suspicious_activities.append({
                'type': 'multiple_ips_per_user',
                'username': item['username'],
                'ip_count': item['ip_count']
            })
        
        if suspicious_activities:
            logger.warning(f'Detected {len(suspicious_activities)} suspicious activities')
            # Here you could send notifications, create alerts, etc.
        
        return suspicious_activities
        
    except Exception as exc:
        logger.exception(f'Failed to detect suspicious activity: {exc}')
        raise