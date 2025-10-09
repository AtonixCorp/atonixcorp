"""
Custom decorators and utilities for OpenTelemetry tracing and metrics.
"""

import functools
import time
from typing import Callable, Any, Optional, Dict
from opentelemetry import trace, metrics
from opentelemetry.trace import Status, StatusCode
from observability import get_tracer, get_meter

# Global tracer and meter instances
tracer = get_tracer("atonixcorp.decorators")
meter = get_meter("atonixcorp.decorators")

# Create metrics
function_duration = meter.create_histogram(
    name="function_duration_seconds",
    description="Function execution duration in seconds",
    unit="s"
)

function_calls = meter.create_counter(
    name="function_calls_total",
    description="Total number of function calls",
)

function_errors = meter.create_counter(
    name="function_errors_total",
    description="Total number of function errors",
)


def trace_function(
    name: Optional[str] = None,
    attributes: Optional[Dict[str, Any]] = None,
    record_exception: bool = True
):
    """
    Decorator to trace function execution with OpenTelemetry.
    
    Args:
        name: Custom span name (defaults to function name)
        attributes: Additional attributes to add to the span
        record_exception: Whether to record exceptions in the span
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            span_name = name or f"{func.__module__}.{func.__name__}"
            
            with tracer.start_as_current_span(span_name) as span:
                # Add function metadata
                span.set_attribute("function.name", func.__name__)
                span.set_attribute("function.module", func.__module__)
                span.set_attribute("function.file", func.__code__.co_filename)
                span.set_attribute("function.line", func.__code__.co_firstlineno)
                
                # Add custom attributes
                if attributes:
                    for key, value in attributes.items():
                        span.set_attribute(key, value)
                
                # Add arguments (be careful with sensitive data)
                if args:
                    span.set_attribute("function.args_count", len(args))
                if kwargs:
                    span.set_attribute("function.kwargs_count", len(kwargs))
                    # Only record non-sensitive kwargs
                    safe_kwargs = {k: v for k, v in kwargs.items() 
                                 if not any(sensitive in k.lower() 
                                          for sensitive in ['password', 'token', 'key', 'secret'])}
                    for key, value in safe_kwargs.items():
                        if isinstance(value, (str, int, float, bool)):
                            span.set_attribute(f"function.kwargs.{key}", value)
                
                start_time = time.time()
                
                try:
                    result = func(*args, **kwargs)
                    span.set_status(Status(StatusCode.OK))
                    return result
                    
                except Exception as e:
                    if record_exception:
                        span.record_exception(e)
                    span.set_status(Status(StatusCode.ERROR, str(e)))
                    
                    # Record error metrics
                    error_attributes = {
                        "function_name": func.__name__,
                        "exception_type": e.__class__.__name__
                    }
                    function_errors.add(1, error_attributes)
                    
                    raise
                    
                finally:
                    # Record metrics
                    duration = time.time() - start_time
                    metric_attributes = {
                        "function_name": func.__name__,
                        "module": func.__module__
                    }
                    function_duration.record(duration, metric_attributes)
                    function_calls.add(1, metric_attributes)
        
        return wrapper
    return decorator


def trace_method(
    name: Optional[str] = None,
    attributes: Optional[Dict[str, Any]] = None,
    include_class: bool = True
):
    """
    Decorator to trace class method execution.
    
    Args:
        name: Custom span name
        attributes: Additional attributes
        include_class: Whether to include class name in span attributes
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(self, *args, **kwargs):
            span_name = name or f"{self.__class__.__name__}.{func.__name__}"
            
            with tracer.start_as_current_span(span_name) as span:
                span.set_attribute("method.name", func.__name__)
                span.set_attribute("method.module", func.__module__)
                
                if include_class:
                    span.set_attribute("class.name", self.__class__.__name__)
                    span.set_attribute("class.module", self.__class__.__module__)
                
                # Add custom attributes
                if attributes:
                    for key, value in attributes.items():
                        span.set_attribute(key, value)
                
                start_time = time.time()
                
                try:
                    result = func(self, *args, **kwargs)
                    span.set_status(Status(StatusCode.OK))
                    return result
                    
                except Exception as e:
                    span.record_exception(e)
                    span.set_status(Status(StatusCode.ERROR, str(e)))
                    raise
                    
                finally:
                    # Record metrics
                    duration = time.time() - start_time
                    metric_attributes = {
                        "method_name": func.__name__,
                        "class_name": self.__class__.__name__
                    }
                    function_duration.record(duration, metric_attributes)
                    function_calls.add(1, metric_attributes)
        
        return wrapper
    return decorator


def trace_async_function(
    name: Optional[str] = None,
    attributes: Optional[Dict[str, Any]] = None
):
    """
    Decorator to trace async function execution.
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            span_name = name or f"{func.__module__}.{func.__name__}"
            
            with tracer.start_as_current_span(span_name) as span:
                span.set_attribute("function.name", func.__name__)
                span.set_attribute("function.module", func.__module__)
                span.set_attribute("function.async", True)
                
                if attributes:
                    for key, value in attributes.items():
                        span.set_attribute(key, value)
                
                start_time = time.time()
                
                try:
                    result = await func(*args, **kwargs)
                    span.set_status(Status(StatusCode.OK))
                    return result
                    
                except Exception as e:
                    span.record_exception(e)
                    span.set_status(Status(StatusCode.ERROR, str(e)))
                    raise
                    
                finally:
                    duration = time.time() - start_time
                    metric_attributes = {
                        "function_name": func.__name__,
                        "module": func.__module__,
                        "async": True
                    }
                    function_duration.record(duration, metric_attributes)
                    function_calls.add(1, metric_attributes)
        
        return wrapper
    return decorator


def measure_time(name: str, attributes: Optional[Dict[str, Any]] = None):
    """
    Context manager to measure time and record metrics.
    
    Usage:
        with measure_time("database_operation", {"table": "users"}):
            # database operation
            pass
    """
    class TimeMeasurement:
        def __init__(self, operation_name: str, attrs: Optional[Dict[str, Any]] = None):
            self.name = operation_name
            self.attributes = attrs or {}
            self.start_time = None
            
        def __enter__(self):
            self.start_time = time.time()
            return self
            
        def __exit__(self, exc_type, exc_val, exc_tb):
            if self.start_time:
                duration = time.time() - self.start_time
                
                # Create a histogram for this specific operation if it doesn't exist
                operation_duration = meter.create_histogram(
                    name=f"{self.name}_duration_seconds",
                    description=f"Duration of {self.name} operations",
                    unit="s"
                )
                
                operation_duration.record(duration, self.attributes)
                
                # Also record in the general operations counter
                operations_counter = meter.create_counter(
                    name="operations_total",
                    description="Total number of operations",
                )
                operations_counter.add(1, {**self.attributes, "operation": self.name})
    
    return TimeMeasurement(name, attributes)


def create_span(name: str, attributes: Optional[Dict[str, Any]] = None):
    """
    Context manager to create a custom span.
    
    Usage:
        with create_span("custom_operation", {"user_id": 123}) as span:
            span.add_event("Starting operation")
            # custom logic
            span.add_event("Operation completed")
    """
    return tracer.start_as_current_span(name)


def add_span_attribute(key: str, value: Any):
    """Add attribute to current span if it exists."""
    current_span = trace.get_current_span()
    if current_span.is_recording():
        current_span.set_attribute(key, value)


def add_span_event(name: str, attributes: Optional[Dict[str, Any]] = None):
    """Add event to current span if it exists."""
    current_span = trace.get_current_span()
    if current_span.is_recording():
        current_span.add_event(name, attributes or {})


def record_exception(exception: Exception, attributes: Optional[Dict[str, Any]] = None):
    """Record exception in current span if it exists."""
    current_span = trace.get_current_span()
    if current_span.is_recording():
        current_span.record_exception(exception, attributes or {})


def get_current_trace_id() -> str:
    """Get current trace ID as string."""
    current_span = trace.get_current_span()
    if current_span.is_recording():
        return format(current_span.get_span_context().trace_id, '032x')
    return ""


def get_current_span_id() -> str:
    """Get current span ID as string."""
    current_span = trace.get_current_span()
    if current_span.is_recording():
        return format(current_span.get_span_context().span_id, '016x')
    return ""