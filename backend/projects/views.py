"""
Professional API views for Project Management.

This module provides comprehensive REST API endpoints for the AtonixCorp Platform
project management system with proper error handling, documentation,
and professional response formatting.
"""

from rest_framework import viewsets, filters, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Prefetch
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

from core.api_utils import APIResponse
from .models import Project, ProjectFeature, ProjectImage
from .serializers import (
    ProjectSerializer, ProjectListSerializer,
    ProjectFeatureSerializer, ProjectImageSerializer
)


@extend_schema_view(
    list=extend_schema(
        summary="List all projects",
        description="""
        Retrieve a paginated list of all projects with filtering, searching, and ordering capabilities.
        
        ## Features
        - **Filtering**: Filter by status, featured status
        - **Search**: Search across name, overview, and description
        - **Ordering**: Sort by name, creation date, or update date
        - **Pagination**: Results are paginated for better performance
        
        ## Response Format
        Returns a standardized response with data, pagination metadata, and status information.
        """,
        parameters=[
            OpenApiParameter(
                name='status',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Filter by project status (active, development, completed, paused)',
                enum=['active', 'development', 'completed', 'paused']
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
                description='Search in project name, overview, and description'
            ),
            OpenApiParameter(
                name='ordering',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Order results by field (name, created_at, updated_at). Prefix with - for descending order.',
                enum=['name', '-name', 'created_at', '-created_at', 'updated_at', '-updated_at']
            ),
        ],
        tags=['Projects']
    ),
    retrieve=extend_schema(
        summary="Get project details",
        description="""
        Retrieve detailed information about a specific project including all features,
        images, and related metadata.
        
        ## Project Details
        - Complete project information
        - All project features with descriptions and icons
        - Project image gallery
        - Technology stack information
        - Links to external resources
        """,
        tags=['Projects']
    ),
    featured=extend_schema(
        summary="Get featured projects",
        description="Retrieve all projects marked as featured",
        tags=['Projects']
    ),
    by_status=extend_schema(
        summary="Get projects grouped by status",
        description="Retrieve projects organized by their current status",
        tags=['Projects']
    )
)
class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Professional API ViewSet for Project management.
    
    Provides comprehensive read-only access to projects with advanced
    filtering, searching, and custom endpoints for specialized queries.
    """
    
    queryset = Project.objects.select_related().prefetch_related(
        'features', 'images'
    ).annotate(
        feature_count_cached=Count('features'),
        image_count_cached=Count('images')
    )
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'status': ['exact', 'in'],
        'is_featured': ['exact'],
        'technologies': ['icontains'],
        'created_at': ['gte', 'lte', 'year', 'month'],
    }
    search_fields = ['name', 'overview', 'description', 'technologies']
    ordering_fields = ['name', 'created_at', 'updated_at', 'is_featured']
    ordering = ['-is_featured', '-created_at']
    lookup_field = 'slug'
    permission_classes = [permissions.AllowAny]  # Public read access
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'list':
            return ProjectListSerializer
        return ProjectSerializer
    
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
                
                # Convert to professional format
                return APIResponse.paginated(
                    data=paginated_response.data['results'],
                    paginator=self.paginator,
                    message="Projects retrieved successfully"
                )
            
            serializer = self.get_serializer(queryset, many=True)
            return APIResponse.success(
                data=serializer.data,
                message="Projects retrieved successfully"
            )
            
        except Exception as e:
            return APIResponse.error(
                message="Failed to retrieve projects",
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
                message=f"Project '{instance.name}' retrieved successfully"
            )
        except Exception as e:
            return APIResponse.error(
                message="Project not found",
                status_code=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """
        Get all featured projects.
        
        Returns projects that are marked as featured, typically used
        for homepage displays and promotional content.
        """
        try:
            featured_projects = self.get_queryset().filter(is_featured=True)
            serializer = self.get_serializer(featured_projects, many=True)
            return APIResponse.success(
                data=serializer.data,
                message=f"Found {featured_projects.count()} featured projects"
            )
        except Exception as e:
            return APIResponse.error(
                message="Failed to retrieve featured projects",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def by_status(self, request):
        """
        Get projects grouped by their status.
        
        Returns a dictionary with status keys and arrays of projects
        for each status, useful for dashboard displays.
        """
        try:
            result = {}
            total_count = 0
            
            for status_choice in Project._meta.get_field('status').choices:
                status_key = status_choice[0]
                status_label = status_choice[1]
                
                projects = self.get_queryset().filter(status=status_key)
                project_count = projects.count()
                total_count += project_count
                
                result[status_key] = {
                    'label': status_label,
                    'count': project_count,
                    'projects': ProjectListSerializer(projects, many=True).data
                }
            
            return APIResponse.success(
                data=result,
                message=f"Projects grouped by status ({total_count} total projects)",
                metadata={'total_projects': total_count, 'status_count': len(result)}
            )
            
        except Exception as e:
            return APIResponse.error(
                message="Failed to retrieve projects by status",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def features(self, request, slug=None):
        """
        Get all features for a specific project.
        
        Returns detailed information about all features
        associated with the specified project.
        """
        try:
            project = self.get_object()
            features = project.features.all().order_by('order', 'id')
            serializer = ProjectFeatureSerializer(features, many=True)
            
            return APIResponse.success(
                data=serializer.data,
                message=f"Retrieved {features.count()} features for project '{project.name}'"
            )
        except Exception as e:
            return APIResponse.error(
                message="Failed to retrieve project features",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def gallery(self, request, slug=None):
        """
        Get all images for a specific project.
        
        Returns the complete image gallery for the specified project
        with proper ordering and metadata.
        """
        try:
            project = self.get_object()
            images = project.images.all().order_by('-is_featured', 'order', 'id')
            serializer = ProjectImageSerializer(images, many=True)
            
            return APIResponse.success(
                data=serializer.data,
                message=f"Retrieved {images.count()} images for project '{project.name}'"
            )
        except Exception as e:
            return APIResponse.error(
                message="Failed to retrieve project gallery",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@extend_schema_view(
    list=extend_schema(
        summary="List project features",
        description="Retrieve all project features with filtering capabilities",
        tags=['Project Features']
    ),
    retrieve=extend_schema(
        summary="Get feature details",
        description="Retrieve detailed information about a specific project feature",
        tags=['Project Features']
    )
)
class ProjectFeatureViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Professional API ViewSet for Project Features.
    
    Provides read-only access to project features with proper
    filtering and professional response formatting.
    """
    
    queryset = ProjectFeature.objects.select_related('project').all()
    serializer_class = ProjectFeatureSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['project', 'project__slug']
    ordering_fields = ['order', 'title']
    ordering = ['order', 'id']
    permission_classes = [permissions.AllowAny]


@extend_schema_view(
    list=extend_schema(
        summary="List project images",
        description="Retrieve all project images with filtering capabilities",
        tags=['Project Images']
    ),
    retrieve=extend_schema(
        summary="Get image details",
        description="Retrieve detailed information about a specific project image",
        tags=['Project Images']
    )
)
class ProjectImageViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Professional API ViewSet for Project Images.
    
    Provides read-only access to project images with proper
    filtering and professional response formatting.
    """
    
    queryset = ProjectImage.objects.select_related('project').all()
    serializer_class = ProjectImageSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['project', 'project__slug', 'is_featured']
    ordering_fields = ['order', 'is_featured']
    ordering = ['-is_featured', 'order', 'id']
    permission_classes = [permissions.AllowAny]
