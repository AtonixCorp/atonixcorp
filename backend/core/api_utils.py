"""
Professional API response utilities and base classes for AtonixCorp Platform.

This module provides standardized response formats, error handling,
and base classes for consistent API behavior across the platform.
"""

from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import exception_handler
from django.utils import timezone
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


class APIResponse:
    """
    Standardized API response wrapper for consistent response formatting.
    
    This class ensures all API responses follow a consistent structure
    with proper status codes, metadata, and error handling.
    """
    
    @staticmethod
    def success(data: Any = None, message: str = "Success", status_code: int = status.HTTP_200_OK, 
                metadata: Optional[Dict] = None) -> Response:
        """
        Create a successful API response.
        
        Args:
            data: The response data
            message: Success message
            status_code: HTTP status code
            metadata: Additional metadata (pagination, etc.)
            
        Returns:
            Response: Formatted DRF Response object
        """
        response_data = {
            "success": True,
            "message": message,
            "timestamp": timezone.now().isoformat(),
            "status_code": status_code
        }
        
        if data is not None:
            response_data["data"] = data
            
        if metadata:
            response_data["metadata"] = metadata
            
        return Response(response_data, status=status_code)
    
    @staticmethod
    def error(message: str = "An error occurred", errors: Optional[Dict] = None, 
              status_code: int = status.HTTP_400_BAD_REQUEST, 
              error_code: Optional[str] = None) -> Response:
        """
        Create an error API response.
        
        Args:
            message: Error message
            errors: Detailed error information
            status_code: HTTP status code
            error_code: Internal error code for tracking
            
        Returns:
            Response: Formatted DRF Response object
        """
        response_data = {
            "success": False,
            "message": message,
            "timestamp": timezone.now().isoformat(),
            "status_code": status_code
        }
        
        if errors:
            response_data["errors"] = errors
            
        if error_code:
            response_data["error_code"] = error_code
            
        return Response(response_data, status=status_code)
    
    @staticmethod
    def paginated(data: Any, paginator, message: str = "Success") -> Response:
        """
        Create a paginated API response.
        
        Args:
            data: The paginated data
            paginator: Django paginator object
            message: Success message
            
        Returns:
            Response: Formatted paginated response
        """
        metadata = {
            "pagination": {
                "page": paginator.page.number,
                "pages": paginator.page.paginator.num_pages,
                "per_page": paginator.page_size,
                "total": paginator.page.paginator.count,
                "has_next": paginator.page.has_next(),
                "has_previous": paginator.page.has_previous(),
            }
        }
        
        if paginator.page.has_next():
            metadata["pagination"]["next_page"] = paginator.page.number + 1
            
        if paginator.page.has_previous():
            metadata["pagination"]["previous_page"] = paginator.page.number - 1
            
        return APIResponse.success(data=data, message=message, metadata=metadata)


class BaseModelSerializer(serializers.ModelSerializer):
    """
    Base model serializer with common fields and behavior.
    
    This serializer provides standard fields like created_at, updated_at
    and common validation patterns used across the platform.
    """
    
    created_at = serializers.DateTimeField(read_only=True, format="%Y-%m-%dT%H:%M:%S.%fZ")
    updated_at = serializers.DateTimeField(read_only=True, format="%Y-%m-%dT%H:%M:%S.%fZ")
    
    class Meta:
        abstract = True
        
    def to_representation(self, instance):
        """
        Enhanced representation with additional metadata.
        """
        data = super().to_representation(instance)
        
        # Add model metadata
        if hasattr(instance, '_meta'):
            data['_metadata'] = {
                'model': instance._meta.model_name,
                'app': instance._meta.app_label,
            }
            
        return data


class ValidationErrorSerializer(serializers.Serializer):
    """
    Serializer for validation error responses.
    """
    field = serializers.CharField(help_text="The field that caused the validation error")
    message = serializers.CharField(help_text="The validation error message")
    code = serializers.CharField(help_text="The error code", required=False)


class ErrorResponseSerializer(serializers.Serializer):
    """
    Serializer for standard error responses.
    """
    success = serializers.BooleanField(default=False, help_text="Indicates if the request was successful")
    message = serializers.CharField(help_text="Human-readable error message")
    timestamp = serializers.DateTimeField(help_text="Timestamp of the error")
    status_code = serializers.IntegerField(help_text="HTTP status code")
    errors = ValidationErrorSerializer(many=True, required=False, help_text="Detailed validation errors")
    error_code = serializers.CharField(required=False, help_text="Internal error code for tracking")


class SuccessResponseSerializer(serializers.Serializer):
    """
    Serializer for standard success responses.
    """
    success = serializers.BooleanField(default=True, help_text="Indicates if the request was successful")
    message = serializers.CharField(help_text="Human-readable success message")
    timestamp = serializers.DateTimeField(help_text="Timestamp of the response")
    status_code = serializers.IntegerField(help_text="HTTP status code")
    data = serializers.JSONField(required=False, help_text="Response data")
    metadata = serializers.JSONField(required=False, help_text="Additional metadata (pagination, etc.)")


def custom_exception_handler(exc, context):
    """
    Custom exception handler that returns standardized error responses.
    
    This handler ensures all API errors follow the same format and
    provides appropriate logging for debugging.
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    if response is not None:
        # Log the error for debugging
        logger.error(f"API Error: {exc}", extra={
            'request': context['request'],
            'view': context['view'],
            'status_code': response.status_code
        })
        
        # Extract error details
        if hasattr(exc, 'detail'):
            if isinstance(exc.detail, dict):
                errors = []
                for field, messages in exc.detail.items():
                    if isinstance(messages, list):
                        for message in messages:
                            errors.append({
                                'field': field,
                                'message': str(message),
                                'code': getattr(message, 'code', None)
                            })
                    else:
                        errors.append({
                            'field': field,
                            'message': str(messages),
                            'code': getattr(messages, 'code', None)
                        })
            else:
                errors = [{
                    'field': 'non_field_errors',
                    'message': str(exc.detail),
                    'code': getattr(exc.detail, 'code', None)
                }]
        else:
            errors = None
            
        # Create standardized error response
        error_message = getattr(exc, 'default_detail', str(exc))
        
        custom_response_data = {
            'success': False,
            'message': str(error_message),
            'timestamp': timezone.now().isoformat(),
            'status_code': response.status_code
        }
        
        if errors:
            custom_response_data['errors'] = errors
            
        response.data = custom_response_data
    
    return response


class HealthCheckSerializer(serializers.Serializer):
    """
    Serializer for health check responses.
    """
    status = serializers.CharField(help_text="Overall system status")
    timestamp = serializers.DateTimeField(help_text="Current server timestamp")
    version = serializers.CharField(help_text="API version")
    environment = serializers.CharField(help_text="Current environment (dev/staging/prod)")
    services = serializers.DictField(help_text="Status of dependent services")
    uptime = serializers.FloatField(help_text="System uptime in seconds")


class PaginationMetadataSerializer(serializers.Serializer):
    """
    Serializer for pagination metadata.
    """
    page = serializers.IntegerField(help_text="Current page number")
    pages = serializers.IntegerField(help_text="Total number of pages")
    per_page = serializers.IntegerField(help_text="Items per page")
    total = serializers.IntegerField(help_text="Total number of items")
    has_next = serializers.BooleanField(help_text="Whether there is a next page")
    has_previous = serializers.BooleanField(help_text="Whether there is a previous page")
    next_page = serializers.IntegerField(required=False, help_text="Next page number if available")
    previous_page = serializers.IntegerField(required=False, help_text="Previous page number if available")


class APIRootSerializer(serializers.Serializer):
    """
    Serializer for API root endpoint response.
    """
    message = serializers.CharField(help_text="Welcome message")
    version = serializers.CharField(help_text="API version")
    status = serializers.CharField(help_text="API status")
    timestamp = serializers.DateTimeField(help_text="Response timestamp")
    documentation = serializers.DictField(help_text="Documentation URLs")
    authentication = serializers.DictField(help_text="Authentication endpoints")
    endpoints = serializers.DictField(help_text="Available API endpoints")
    system = serializers.DictField(help_text="System endpoints")
    support = serializers.DictField(help_text="Support information")