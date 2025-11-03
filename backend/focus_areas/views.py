"""
Professional Focus Areas API Views.

This module provides comprehensive REST API endpoints for the AtonixCorp Platform
focus areas management system with proper error handling, documentation,
and professional response formatting.
"""

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

from core.api_utils import APIResponse
from .models import FocusArea, FocusAreaTechnology, FocusAreaSolution
from .serializers import (
    FocusAreaSerializer, FocusAreaListSerializer,
    FocusAreaTechnologySerializer, FocusAreaSolutionSerializer
)


@extend_schema_view(
    list=extend_schema(
        summary="List focus areas",
        description="""
        Retrieve a paginated list of all active focus areas with filtering and search capabilities.

        ## Features
        - **Search**: Search across focus area name, description, and detailed description
        - **Ordering**: Sort by name, order, or creation date
        - **Pagination**: Results are paginated for better performance

        ## Response Format
        Returns a standardized response with focus area data and pagination metadata.
        """,
        parameters=[
            OpenApiParameter(
                name='search',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Search in focus area name, description, and detailed description'
            ),
            OpenApiParameter(
                name='ordering',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Order results by field (name, order, created_at). Prefix with - for descending order.',
                enum=['name', '-name', 'order', '-order', 'created_at', '-created_at']
            ),
        ],
        tags=['Focus Areas']
    ),
    retrieve=extend_schema(
        summary="Get focus area details",
        description="""
        Retrieve detailed information about a specific focus area including technologies,
        solutions, and related metadata.
        """,
        tags=['Focus Areas']
    ),
    technologies=extend_schema(
        summary="Get focus area technologies",
        description="Retrieve all technologies associated with a specific focus area",
        tags=['Focus Areas']
    ),
    solutions=extend_schema(
        summary="Get focus area solutions",
        description="Retrieve all solutions associated with a specific focus area",
        tags=['Focus Areas']
    )
)
class FocusAreaViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Professional API ViewSet for Focus Area management.

    Provides comprehensive read-only access to focus areas with advanced
    filtering, searching, and related data retrieval capabilities.
    """

    queryset = FocusArea.objects.filter(is_active=True).prefetch_related(
        'technologies', 'solutions'
    )
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'detailed_description']
    ordering_fields = ['name', 'order', 'created_at']
    ordering = ['order', 'name']
    lookup_field = 'slug'
    permission_classes = []  # Public read access

    def get_serializer_class(self):
        if self.action == 'list':
            return FocusAreaListSerializer
        return FocusAreaSerializer

    def list(self, request, *args, **kwargs):
        """
        Enhanced list view with professional response formatting.
        """
        try:
            queryset = self.filter_queryset(self.get_queryset())

            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                paginated_response = self.get_paginated_response(serializer.data)

                return APIResponse.paginated(
                    data=paginated_response.data['results'],
                    paginator=self.paginator,
                    message="Focus areas retrieved successfully"
                )

            serializer = self.get_serializer(queryset, many=True)
            return APIResponse.success(
                data=serializer.data,
                message="Focus areas retrieved successfully"
            )

        except Exception as e:
            return APIResponse.error(
                message="Failed to retrieve focus areas",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, *args, **kwargs):
        """
        Enhanced retrieve view with professional response formatting.
        """
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return APIResponse.success(
                data=serializer.data,
                message=f"Focus area '{instance.name}' retrieved successfully"
            )
        except Exception as e:
            return APIResponse.error(
                message="Focus area not found",
                status_code=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['get'])
    def technologies(self, request, slug=None):
        """
        Get all technologies associated with a specific focus area.
        """
        try:
            focus_area = self.get_object()
            technologies = focus_area.technologies.all().order_by('name')
            serializer = FocusAreaTechnologySerializer(technologies, many=True)

            return APIResponse.success(
                data=serializer.data,
                message=f"Retrieved {technologies.count()} technologies for focus area '{focus_area.name}'"
            )
        except Exception as e:
            return APIResponse.error(
                message="Failed to retrieve focus area technologies",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def solutions(self, request, slug=None):
        """
        Get all solutions associated with a specific focus area.
        """
        try:
            focus_area = self.get_object()
            solutions = focus_area.solutions.all().order_by('order', 'title')
            serializer = FocusAreaSolutionSerializer(solutions, many=True)

            return APIResponse.success(
                data=serializer.data,
                message=f"Retrieved {solutions.count()} solutions for focus area '{focus_area.name}'"
            )
        except Exception as e:
            return APIResponse.error(
                message="Failed to retrieve focus area solutions",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@extend_schema_view(
    list=extend_schema(
        summary="List focus area technologies",
        description="Retrieve focus area technologies with filtering capabilities",
        tags=['Focus Area Technologies']
    ),
    retrieve=extend_schema(
        summary="Get technology details",
        description="Retrieve detailed information about a specific focus area technology",
        tags=['Focus Area Technologies']
    )
)
class FocusAreaTechnologyViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Professional API ViewSet for Focus Area Technologies.
    """
    queryset = FocusAreaTechnology.objects.select_related('focus_area').all()
    serializer_class = FocusAreaTechnologySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['focus_area']
    search_fields = ['name', 'description']
    permission_classes = []  # Public read access


@extend_schema_view(
    list=extend_schema(
        summary="List focus area solutions",
        description="Retrieve focus area solutions with filtering and ordering capabilities",
        tags=['Focus Area Solutions']
    ),
    retrieve=extend_schema(
        summary="Get solution details",
        description="Retrieve detailed information about a specific focus area solution",
        tags=['Focus Area Solutions']
    )
)
class FocusAreaSolutionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Professional API ViewSet for Focus Area Solutions.
    """
    queryset = FocusAreaSolution.objects.select_related('focus_area').all()
    serializer_class = FocusAreaSolutionSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['focus_area']
    search_fields = ['title', 'description']
    ordering_fields = ['order', 'title']
    ordering = ['order']
    permission_classes = []  # Public read access
