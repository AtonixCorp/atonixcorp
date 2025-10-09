"""
Custom middleware for OpenTelemetry instrumentation and observability.
"""

import time
import logging
from typing import Callable
from django.http import HttpRequest, HttpResponse
from django.utils.deprecation import MiddlewareMixin
from opentelemetry import trace, metrics
from opentelemetry.trace import Status, StatusCode
from opentelemetry.semconv.trace import SpanAttributes
from observability import get_tracer, get_meter

logger = logging.getLogger(__name__)


class OpenTelemetryMiddleware(MiddlewareMixin):
    """Custom middleware for enhanced OpenTelemetry instrumentation."""
    
    def __init__(self, get_response: Callable):
        super().__init__(get_response)
        self.tracer = get_tracer("atonixcorp.middleware")
        self.meter = get_meter("atonixcorp.middleware")
        
        # Create metrics
        self.request_duration = self.meter.create_histogram(
            name="http_request_duration_seconds",
            description="HTTP request duration in seconds",
            unit="s"
        )
        
        self.request_counter = self.meter.create_counter(
            name="http_requests_total",
            description="Total number of HTTP requests",
        )
        
        self.active_requests = self.meter.create_up_down_counter(
            name="http_active_requests",
            description="Number of active HTTP requests",
        )
        
        self.response_size = self.meter.create_histogram(
            name="http_response_size_bytes",
            description="HTTP response size in bytes",
            unit="byte"
        )
    
    def process_request(self, request: HttpRequest):
        """Process incoming request."""
        # Start timing
        request._otel_start_time = time.time()
        
        # Increment active requests
        self.active_requests.add(1, {
            "method": request.method,
            "endpoint": self._get_endpoint_name(request)
        })
        
        # Add custom attributes to current span
        current_span = trace.get_current_span()
        if current_span.is_recording():
            current_span.set_attribute("atonixcorp.user_agent", request.META.get('HTTP_USER_AGENT', ''))
            current_span.set_attribute("atonixcorp.remote_addr", self._get_client_ip(request))
            current_span.set_attribute("atonixcorp.content_type", request.content_type)
            
            # Add user information if available
            if hasattr(request, 'user') and request.user.is_authenticated:
                current_span.set_attribute("atonixcorp.user.id", str(request.user.id))
                current_span.set_attribute("atonixcorp.user.username", request.user.username)
                current_span.set_attribute("atonixcorp.user.is_staff", request.user.is_staff)
        
        return None
    
    def process_response(self, request: HttpRequest, response: HttpResponse):
        """Process outgoing response."""
        # Calculate duration
        start_time = getattr(request, '_otel_start_time', time.time())
        duration = time.time() - start_time
        
        # Get attributes
        attributes = {
            "method": request.method,
            "endpoint": self._get_endpoint_name(request),
            "status_code": response.status_code,
            "status_class": f"{response.status_code // 100}xx"
        }
        
        # Record metrics
        self.request_duration.record(duration, attributes)
        self.request_counter.add(1, attributes)
        self.active_requests.add(-1, {
            "method": request.method,
            "endpoint": attributes["endpoint"]
        })
        
        # Record response size
        if hasattr(response, 'content'):
            response_size = len(response.content)
            self.response_size.record(response_size, attributes)
        
        # Update current span
        current_span = trace.get_current_span()
        if current_span.is_recording():
            current_span.set_attribute("atonixcorp.response.size", len(response.content) if hasattr(response, 'content') else 0)
            current_span.set_attribute("atonixcorp.response.content_type", response.get('Content-Type', ''))
            
            # Set span status based on response code
            if response.status_code >= 400:
                current_span.set_status(Status(StatusCode.ERROR, f"HTTP {response.status_code}"))
            else:
                current_span.set_status(Status(StatusCode.OK))
        
        return response
    
    def process_exception(self, request: HttpRequest, exception: Exception):
        """Process exceptions."""
        # Record error metrics
        attributes = {
            "method": request.method,
            "endpoint": self._get_endpoint_name(request),
            "exception_type": exception.__class__.__name__
        }
        
        self.request_counter.add(1, {**attributes, "status_code": "500", "status_class": "5xx"})
        self.active_requests.add(-1, {
            "method": request.method,
            "endpoint": attributes["endpoint"]
        })
        
        # Update current span
        current_span = trace.get_current_span()
        if current_span.is_recording():
            current_span.record_exception(exception)
            current_span.set_status(Status(StatusCode.ERROR, str(exception)))
            current_span.set_attribute("atonixcorp.exception.type", exception.__class__.__name__)
            current_span.set_attribute("atonixcorp.exception.message", str(exception))
        
        return None
    
    def _get_endpoint_name(self, request: HttpRequest) -> str:
        """Get a normalized endpoint name for the request."""
        # Try to get the URL pattern name
        if hasattr(request, 'resolver_match') and request.resolver_match:
            if request.resolver_match.url_name:
                return request.resolver_match.url_name
            elif request.resolver_match.view_name:
                return request.resolver_match.view_name
        
        # Fallback to path with parameter normalization
        path = request.path
        
        # Normalize common patterns
        import re
        # Replace UUIDs with placeholder
        path = re.sub(r'/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/', '/{uuid}/', path)
        # Replace numeric IDs with placeholder
        path = re.sub(r'/\d+/', '/{id}/', path)
        
        return path
    
    def _get_client_ip(self, request: HttpRequest) -> str:
        """Get client IP address."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip or 'unknown'


class PerformanceMonitoringMiddleware(MiddlewareMixin):
    """Middleware for monitoring performance metrics."""
    
    def __init__(self, get_response: Callable):
        super().__init__(get_response)
        self.meter = get_meter("atonixcorp.performance")
        
        # Create performance metrics
        self.database_query_duration = self.meter.create_histogram(
            name="database_query_duration_seconds",
            description="Database query duration in seconds",
            unit="s"
        )
        
        self.database_query_counter = self.meter.create_counter(
            name="database_queries_total",
            description="Total number of database queries",
        )
        
        self.cache_operations = self.meter.create_counter(
            name="cache_operations_total",
            description="Total number of cache operations",
        )
    
    def process_request(self, request: HttpRequest):
        """Initialize performance monitoring for request."""
        request._otel_db_queries_start = len(self._get_db_queries())
        return None
    
    def process_response(self, request: HttpRequest, response: HttpResponse):
        """Record performance metrics."""
        # Database query metrics
        db_queries_end = len(self._get_db_queries())
        db_queries_start = getattr(request, '_otel_db_queries_start', db_queries_end)
        query_count = db_queries_end - db_queries_start
        
        if query_count > 0:
            attributes = {
                "endpoint": self._get_endpoint_name(request),
                "method": request.method
            }
            self.database_query_counter.add(query_count, attributes)
            
            # Record individual query durations if available
            for query in self._get_db_queries()[db_queries_start:]:
                if hasattr(query, 'time'):
                    self.database_query_duration.record(float(query.time), attributes)
        
        return response
    
    def _get_db_queries(self):
        """Get database queries from Django connection."""
        try:
            from django.db import connection
            return connection.queries
        except:
            return []
    
    def _get_endpoint_name(self, request: HttpRequest) -> str:
        """Get endpoint name (same as OpenTelemetryMiddleware)."""
        if hasattr(request, 'resolver_match') and request.resolver_match:
            if request.resolver_match.url_name:
                return request.resolver_match.url_name
            elif request.resolver_match.view_name:
                return request.resolver_match.view_name
        return request.path