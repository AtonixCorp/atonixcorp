"""
Professional Contact API Views.

This module provides comprehensive REST API endpoints for the AtonixCorp Platform
contact management system with proper error handling, documentation,
and professional response formatting.
"""

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

from core.api_utils import APIResponse
from .models import ContactPerson, ContactMessage, OfficeLocation
from .serializers import (
    ContactPersonSerializer, ContactMessageSerializer,
    ContactMessageCreateSerializer, OfficeLocationSerializer
)


@extend_schema_view(
    list=extend_schema(
        summary="List contact persons",
        description="Retrieve contact persons with filtering and search capabilities",
        tags=['Contact Persons']
    ),
    retrieve=extend_schema(
        summary="Get contact person details",
        description="Retrieve detailed information about a specific contact person",
        tags=['Contact Persons']
    ),
    primary=extend_schema(
        summary="Get primary contacts",
        description="Retrieve all primary contact persons",
        tags=['Contact Persons']
    )
)
class ContactPersonViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Professional API ViewSet for Contact Persons.
    """
    queryset = ContactPerson.objects.filter(is_active=True)
    serializer_class = ContactPersonSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department', 'is_primary']
    search_fields = ['name', 'title', 'department', 'bio']
    ordering_fields = ['name', 'order']
    ordering = ['-is_primary', 'order', 'name']
    permission_classes = [AllowAny]  # Public read access

    @action(detail=False, methods=['get'])
    def primary(self, request):
        """
        Get all primary contact persons.
        """
        try:
            primary_contacts = self.get_queryset().filter(is_primary=True)
            serializer = self.get_serializer(primary_contacts, many=True)

            return APIResponse.success(
                data=serializer.data,
                message=f"Retrieved {primary_contacts.count()} primary contacts"
            )
        except Exception as e:
            return APIResponse.error(
                message="Failed to retrieve primary contacts",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@extend_schema_view(
    list=extend_schema(
        summary="List contact messages",
        description="Retrieve contact messages with filtering and search capabilities",
        tags=['Contact Messages']
    ),
    retrieve=extend_schema(
        summary="Get message details",
        description="Retrieve detailed information about a specific contact message",
        tags=['Contact Messages']
    ),
    create=extend_schema(
        summary="Create contact message",
        description="Submit a new contact message through the public API",
        tags=['Contact Messages']
    )
)
class ContactMessageViewSet(viewsets.ModelViewSet):
    """
    Professional API ViewSet for Contact Messages.
    """
    queryset = ContactMessage.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['message_type', 'priority', 'status']
    search_fields = ['name', 'email', 'subject', 'message']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return ContactMessageCreateSerializer
        return ContactMessageSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return super().get_permissions()

    def create(self, request, *args, **kwargs):
        """
        Public endpoint for creating contact messages with professional response.
        """
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            # Auto-assign to primary contact if available
            primary_contact = ContactPerson.objects.filter(is_primary=True, is_active=True).first()
            contact_message = serializer.save(assigned_to=primary_contact)

            return APIResponse.success(
                data={
                    'message_id': contact_message.id,
                    'assigned_to': primary_contact.name if primary_contact else None
                },
                message="Your message has been sent successfully. We will get back to you soon.",
                status_code=status.HTTP_201_CREATED
            )

        except Exception as e:
            return APIResponse.error(
                message="Failed to send contact message",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@extend_schema_view(
    list=extend_schema(
        summary="List office locations",
        description="Retrieve office locations with filtering and search capabilities",
        tags=['Office Locations']
    ),
    retrieve=extend_schema(
        summary="Get location details",
        description="Retrieve detailed information about a specific office location",
        tags=['Office Locations']
    ),
    headquarters=extend_schema(
        summary="Get headquarters",
        description="Retrieve the headquarters office location",
        tags=['Office Locations']
    )
)
class OfficeLocationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Professional API ViewSet for Office Locations.
    """
    queryset = OfficeLocation.objects.filter(is_active=True)
    serializer_class = OfficeLocationSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['country', 'is_headquarters']
    search_fields = ['name', 'city', 'address_line_1']
    ordering_fields = ['name', 'city', 'country']
    ordering = ['-is_headquarters', 'country', 'city']
    permission_classes = [AllowAny]  # Public read access

    @action(detail=False, methods=['get'])
    def headquarters(self, request):
        """
        Get the headquarters office location.
        """
        try:
            headquarters = self.get_queryset().filter(is_headquarters=True).first()
            if headquarters:
                serializer = self.get_serializer(headquarters)
                return APIResponse.success(
                    data=serializer.data,
                    message="Headquarters location retrieved successfully"
                )
            else:
                return APIResponse.error(
                    message="No headquarters found",
                    status_code=status.HTTP_404_NOT_FOUND
                )
        except Exception as e:
            return APIResponse.error(
                message="Failed to retrieve headquarters location",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
