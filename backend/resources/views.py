"""
Professional Resources API Views.

This module provides comprehensive REST API endpoints for the AtonixCorp Platform
resource management system with proper error handling, documentation,
and professional response formatting.
"""

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

from core.api_utils import APIResponse
from .models import ResourceCategory, Resource, CommunityLink, FAQ
from .serializers import (
    ResourceCategorySerializer, ResourceSerializer, ResourceListSerializer,
    CommunityLinkSerializer, FAQSerializer
)


@extend_schema_view(
    list=extend_schema(
        summary="List resource categories",
        description="Retrieve all resource categories with search and ordering capabilities",
        tags=['Resource Categories']
    ),
    retrieve=extend_schema(
        summary="Get category details",
        description="Retrieve detailed information about a specific resource category",
        tags=['Resource Categories']
    )
)
class ResourceCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Professional API ViewSet for Resource Categories.
    """
    queryset = ResourceCategory.objects.all()
    serializer_class = ResourceCategorySerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'order']
    ordering = ['order', 'name']
    lookup_field = 'slug'
    permission_classes = []  # Public read access


@extend_schema_view(
    list=extend_schema(
        summary="List resources",
        description="""
        Retrieve a paginated list of public resources with filtering and search capabilities.

        ## Features
        - **Filtering**: Filter by category, type, and featured status
        - **Search**: Search across title, description, content, and tags
        - **Ordering**: Sort by title, creation date, or update date
        - **Pagination**: Results are paginated for better performance

        ## Response Format
        Returns a standardized response with resource data and pagination metadata.
        """,
        parameters=[
            OpenApiParameter(
                name='category',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Filter by resource category slug'
            ),
            OpenApiParameter(
                name='resource_type',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Filter by resource type'
            ),
            OpenApiParameter(
                name='is_featured',
                type=OpenApiTypes.BOOL,
                location=OpenApiParameter.QUERY,
                description='Filter by featured status'
            ),
            OpenApiParameter(
                name='search',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Search in resource title, description, content, and tags'
            ),
            OpenApiParameter(
                name='ordering',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Order results by field (title, created_at, updated_at). Prefix with - for descending order.',
                enum=['title', '-title', 'created_at', '-created_at', 'updated_at', '-updated_at']
            ),
        ],
        tags=['Resources']
    ),
    retrieve=extend_schema(
        summary="Get resource details",
        description="Retrieve detailed information about a specific resource",
        tags=['Resources']
    ),
    featured=extend_schema(
        summary="Get featured resources",
        description="Retrieve all resources marked as featured",
        tags=['Resources']
    ),
    by_category=extend_schema(
        summary="Get resources by category",
        description="Retrieve resources organized by their categories",
        tags=['Resources']
    )
)
class ResourceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Professional API ViewSet for Resource management.
    """
    queryset = Resource.objects.filter(is_public=True).select_related('category')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'resource_type', 'is_featured']
    search_fields = ['title', 'description', 'content', 'tags']
    ordering_fields = ['title', 'created_at', 'updated_at']
    ordering = ['-is_featured', '-created_at']
    lookup_field = 'slug'
    permission_classes = []  # Public read access

    def get_serializer_class(self):
        if self.action == 'list':
            return ResourceListSerializer
        return ResourceSerializer

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
                    message="Resources retrieved successfully"
                )

            serializer = self.get_serializer(queryset, many=True)
            return APIResponse.success(
                data=serializer.data,
                message="Resources retrieved successfully"
            )

        except Exception as e:
            return APIResponse.error(
                message="Failed to retrieve resources",
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
                message=f"Resource '{instance.title}' retrieved successfully"
            )
        except Exception as e:
            return APIResponse.error(
                message="Resource not found",
                status_code=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """
        Get all featured resources.
        """
        try:
            featured_resources = self.get_queryset().filter(is_featured=True)
            serializer = self.get_serializer(featured_resources, many=True)

            return APIResponse.success(
                data=serializer.data,
                message=f"Retrieved {featured_resources.count()} featured resources"
            )
        except Exception as e:
            return APIResponse.error(
                message="Failed to retrieve featured resources",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """
        Get resources grouped by category.
        """
        try:
            categories = ResourceCategory.objects.all().order_by('order', 'name')
            result = []
            total_resources = 0

            for category in categories:
                resources = self.get_queryset().filter(category=category)
                resource_count = resources.count()
                total_resources += resource_count

                result.append({
                    'category': ResourceCategorySerializer(category).data,
                    'resources': ResourceListSerializer(resources, many=True).data,
                    'count': resource_count
                })

            return APIResponse.success(
                data=result,
                message=f"Resources grouped by {categories.count()} categories ({total_resources} total resources)",
                metadata={'total_categories': categories.count(), 'total_resources': total_resources}
            )

        except Exception as e:
            return APIResponse.error(
                message="Failed to retrieve resources by category",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@extend_schema_view(
    list=extend_schema(
        summary="List community links",
        description="Retrieve community links with filtering and search capabilities",
        tags=['Community Links']
    ),
    retrieve=extend_schema(
        summary="Get community link details",
        description="Retrieve detailed information about a specific community link",
        tags=['Community Links']
    )
)
class CommunityLinkViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Professional API ViewSet for Community Links.
    """
    queryset = CommunityLink.objects.filter(is_active=True)
    serializer_class = CommunityLinkSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['platform']
    search_fields = ['platform', 'name', 'description']
    ordering_fields = ['platform', 'order']
    ordering = ['order', 'platform']
    permission_classes = []  # Public read access


@extend_schema_view(
    list=extend_schema(
        summary="List FAQs",
        description="Retrieve FAQs with filtering, search, and ordering capabilities",
        tags=['FAQs']
    ),
    retrieve=extend_schema(
        summary="Get FAQ details",
        description="Retrieve detailed information about a specific FAQ",
        tags=['FAQs']
    ),
    featured=extend_schema(
        summary="Get featured FAQs",
        description="Retrieve all FAQs marked as featured",
        tags=['FAQs']
    ),
    by_category=extend_schema(
        summary="Get FAQs by category",
        description="Retrieve FAQs organized by their categories",
        tags=['FAQs']
    )
)
class FAQViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Professional API ViewSet for FAQs.
    """
    queryset = FAQ.objects.all()
    serializer_class = FAQSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_featured']
    search_fields = ['question', 'answer', 'category']
    ordering_fields = ['order', 'created_at']
    ordering = ['-is_featured', 'order']
    permission_classes = []  # Public read access

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """
        Get all featured FAQs.
        """
        try:
            featured_faqs = self.get_queryset().filter(is_featured=True)
            serializer = self.get_serializer(featured_faqs, many=True)

            return APIResponse.success(
                data=serializer.data,
                message=f"Retrieved {featured_faqs.count()} featured FAQs"
            )
        except Exception as e:
            return APIResponse.error(
                message="Failed to retrieve featured FAQs",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """
        Get FAQs grouped by category.
        """
        try:
            categories = self.get_queryset().values_list('category', flat=True).distinct()
            result = {}
            total_faqs = 0

            for category in categories:
                if category:
                    faqs = self.get_queryset().filter(category=category)
                    faq_count = faqs.count()
                    total_faqs += faq_count
                    result[category] = {
                        'faqs': FAQSerializer(faqs, many=True).data,
                        'count': faq_count
                    }

            return APIResponse.success(
                data=result,
                message=f"FAQs grouped by {len(result)} categories ({total_faqs} total FAQs)",
                metadata={'total_categories': len(result), 'total_faqs': total_faqs}
            )

        except Exception as e:
            return APIResponse.error(
                message="Failed to retrieve FAQs by category",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
