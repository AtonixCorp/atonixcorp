import json
import logging
from django.utils.deprecation import MiddlewareMixin
from django.utils import timezone
from .models import AuditLog
from .tasks import log_audit_async

logger = logging.getLogger('security')


class AuditMiddleware(MiddlewareMixin):
    """
    Comprehensive request/response auditing middleware.
    
    Records request metadata and response status to the AuditLog model.
    Supports both synchronous and asynchronous logging via Celery.
    """

    def __init__(self, get_response=None):
        super().__init__(get_response)
        # Check if Celery is available for async logging
        self.use_async = self._check_celery_available()

    def _check_celery_available(self):
        """Check if Celery is available and configured."""
        try:
            from django.conf import settings
            return hasattr(settings, 'CELERY_BROKER_URL') or hasattr(settings, 'BROKER_URL')
        except ImportError:
            return False

    def process_request(self, request):
        """Store audit data on the request for later processing."""
        request._audit_start_time = timezone.now()
        
        # Get client IP (handle proxy headers)
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR', '')

        # Store audit data
        request._audit = {
            'method': request.method,
            'path': request.get_full_path(),
            'query_params': request.GET.urlencode(),
            'ip_address': ip,
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
            'referer': request.META.get('HTTP_REFERER', ''),
            'session_key': getattr(request.session, 'session_key', ''),
        }

        # Only capture body for certain methods and if not too large
        if request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            try:
                content_length = int(request.META.get('CONTENT_LENGTH', 0))
                if content_length < 10240:  # 10KB limit
                    body = request.body.decode('utf-8', errors='replace')
                    # Don't log sensitive data
                    if not self._contains_sensitive_data(body):
                        request._audit['body'] = body
            except (ValueError, UnicodeDecodeError):
                pass

    def _contains_sensitive_data(self, body):
        """Check if body contains sensitive data that shouldn't be logged."""
        sensitive_fields = ['password', 'token', 'key', 'secret', 'auth']
        body_lower = body.lower()
        return any(field in body_lower for field in sensitive_fields)

    def process_response(self, request, response):
        """Log the audit entry after processing the request."""
        try:
            audit = getattr(request, '_audit', None)
            if audit is None:
                return response

            # Get user information
            user = getattr(request, 'user', None)
            username = ''
            if user and hasattr(user, 'is_authenticated') and user.is_authenticated:
                username = getattr(user, 'get_username', lambda: str(user))()

            # Determine action based on method and response
            action = self._determine_action(request.method, response.status_code)

            # Extract resource information from URL
            resource_type, resource_id = self._extract_resource_info(audit['path'])

            # Calculate response time
            start_time = getattr(request, '_audit_start_time', None)
            response_time = None
            if start_time:
                response_time = (timezone.now() - start_time).total_seconds()

            # Prepare audit data
            audit_data = {
                'user': user if getattr(user, 'is_authenticated', False) else None,
                'username': username,
                'session_key': audit.get('session_key', ''),
                'method': audit.get('method', ''),
                'path': audit.get('path', ''),
                'query_params': audit.get('query_params', ''),
                'status_code': getattr(response, 'status_code', None),
                'ip_address': audit.get('ip_address', ''),
                'user_agent': audit.get('user_agent', ''),
                'referer': audit.get('referer', ''),
                'action': action,
                'resource_type': resource_type,
                'resource_id': resource_id,
                'extra_data': {
                    'response_time': response_time,
                    'content_type': response.get('Content-Type', ''),
                    'body': audit.get('body', '')[:1000] if audit.get('body') else '',
                }
            }

            # Log asynchronously if Celery is available, otherwise synchronously
            if self.use_async:
                log_audit_async.delay(audit_data)
            else:
                self._log_audit_sync(audit_data)

        except Exception as exc:
            logger.exception('Failed to write audit log: %s', exc)
        
        return response

    def _determine_action(self, method, status_code):
        """Determine the action type based on HTTP method and status code."""
        if method == 'GET':
            return 'READ'
        elif method == 'POST':
            return 'CREATE' if status_code in [200, 201] else 'OTHER'
        elif method in ['PUT', 'PATCH']:
            return 'UPDATE'
        elif method == 'DELETE':
            return 'DELETE'
        else:
            return 'OTHER'

    def _extract_resource_info(self, path):
        """Extract resource type and ID from the request path."""
        try:
            # Simple extraction from REST API paths like /api/v1/projects/123/
            parts = [p for p in path.split('/') if p]
            if len(parts) >= 3 and parts[0] == 'api':
                resource_type = parts[2] if len(parts) > 2 else ''
                resource_id = parts[3] if len(parts) > 3 and parts[3].isdigit() else ''
                return resource_type, resource_id
        except (IndexError, ValueError):
            pass
        return '', ''

    def _log_audit_sync(self, audit_data):
        """Log audit entry synchronously."""
        try:
            AuditLog.objects.create(**audit_data)
        except Exception as exc:
            logger.exception('Failed to create audit log: %s', exc)
