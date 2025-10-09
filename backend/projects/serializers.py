"""
Professional API serializers for Project Management.

This module provides comprehensive serializers for the AtonixCorp Platform
project management system with validation, nested relationships, and
professional response formatting.
"""

from rest_framework import serializers
from drf_spectacular.utils import extend_schema_serializer, OpenApiExample
from core.api_utils import BaseModelSerializer
from .models import Project, ProjectFeature, ProjectImage


@extend_schema_serializer(
    examples=[
        OpenApiExample(
            'Basic Project Feature',
            summary='A simple project feature',
            description='Example of a basic project feature with icon and description',
            value={
                'id': 1,
                'title': 'Advanced Analytics',
                'description': 'Real-time analytics dashboard with customizable metrics and insights.',
                'icon': 'analytics',
                'order': 1
            }
        )
    ]
)
class ProjectFeatureSerializer(BaseModelSerializer):
    """
    Serializer for ProjectFeature model.
    
    Handles the serialization of individual project features including
    validation for icons, ordering, and required fields.
    """
    
    class Meta:
        model = ProjectFeature
        fields = [
            'id', 'title', 'description', 'icon', 'order', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        
    def validate_icon(self, value):
        """Validate that the icon name follows our naming convention."""
        if value and not value.replace('_', '').replace('-', '').isalnum():
            raise serializers.ValidationError(
                "Icon name must contain only alphanumeric characters, hyphens, and underscores."
            )
        return value
        
    def validate_order(self, value):
        """Ensure order is non-negative."""
        if value < 0:
            raise serializers.ValidationError("Order must be a non-negative integer.")
        return value


@extend_schema_serializer(
    examples=[
        OpenApiExample(
            'Project Gallery Image',
            summary='A project gallery image with caption',
            description='Example of a project image in the gallery',
            value={
                'id': 1,
                'image': 'https://api.atonixcorp.org/media/projects/gallery/screenshot1.jpg',
                'caption': 'Dashboard overview showing real-time analytics',
                'is_featured': True,
                'order': 1
            }
        )
    ]
)
class ProjectImageSerializer(BaseModelSerializer):
    """
    Serializer for ProjectImage model.
    
    Handles project image gallery items with proper URL generation
    and validation for image files and captions.
    """
    
    image = serializers.ImageField(
        help_text="Project image file (JPEG, PNG, WebP supported)",
        required=True
    )
    
    class Meta:
        model = ProjectImage
        fields = [
            'id', 'image', 'caption', 'is_featured', 'order',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        
    def validate_image(self, value):
        """Validate image file size and format."""
        if value:
            # Check file size (max 5MB)
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError(
                    "Image file size must be less than 5MB."
                )
            
        return value


@extend_schema_serializer(
    examples=[
        OpenApiExample(
            'Complete Project',
            summary='A complete project with all details',
            description='Example of a fully populated project with features and images',
            value={
                'id': 1,
                'name': 'AtonixCorp Analytics Platform',
                'slug': 'atonixcorp-analytics-platform',
                'overview': 'Comprehensive analytics platform for enterprise data visualization and insights.',
                'description': 'A full-featured analytics platform built with React and Django...',
                'image': 'https://api.atonixcorp.org/media/projects/analytics-platform.jpg',
                'technologies': ['React', 'Django', 'PostgreSQL', 'Redis', 'Docker'],
                'status': 'active',
                'website_url': 'https://analytics.atonixcorp.org',
                'github_url': 'https://github.com/atonixcorp/analytics-platform',
                'documentation_url': 'https://docs.analytics.atonixcorp.org',
                'is_featured': True,
                'created_at': '2024-01-15T10:30:00.000Z',
                'updated_at': '2024-09-20T15:45:30.123Z',
                'features': [],
                'images': [],
                'feature_count': 5,
                'image_count': 8,
                'technology_count': 5
            }
        )
    ]
)
class ProjectSerializer(BaseModelSerializer):
    """
    Comprehensive serializer for Project model.
    
    Provides full CRUD operations for projects including nested
    features and images, with proper validation and professional
    response formatting.
    """
    
    # Nested serializers for related objects
    features = ProjectFeatureSerializer(many=True, read_only=True)
    images = ProjectImageSerializer(many=True, read_only=True)
    
    # Computed fields for additional context
    feature_count = serializers.SerializerMethodField(
        help_text="Total number of features for this project"
    )
    image_count = serializers.SerializerMethodField(
        help_text="Total number of images in the project gallery"
    )
    technology_count = serializers.SerializerMethodField(
        help_text="Number of technologies used in this project"
    )
    
    class Meta:
        model = Project
        fields = [
            'id', 'name', 'slug', 'overview', 'description', 'image',
            'technologies', 'status', 'website_url', 'github_url',
            'documentation_url', 'is_featured', 'created_at', 'updated_at',
            'features', 'images', 'feature_count', 'image_count', 
            'technology_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'slug']
        
    def get_feature_count(self, obj):
        """Return the number of features for this project."""
        return obj.features.count()
        
    def get_image_count(self, obj):
        """Return the number of images for this project."""
        return obj.images.count()
        
    def get_technology_count(self, obj):
        """Return the number of technologies for this project."""
        return len(obj.technologies) if obj.technologies else 0


class ProjectListSerializer(BaseModelSerializer):
    """
    Lightweight serializer for project lists.
    
    Optimized for list views with essential fields only,
    reducing payload size and improving performance.
    """
    
    feature_count = serializers.SerializerMethodField()
    technology_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = [
            'id', 'name', 'slug', 'overview', 'image', 'technologies',
            'status', 'is_featured', 'created_at', 'updated_at',
            'feature_count', 'technology_count'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']
        
    def get_feature_count(self, obj):
        """Return cached feature count if available."""
        if hasattr(obj, 'feature_count_cached'):
            return obj.feature_count_cached
        return obj.features.count()
        
    def get_technology_count(self, obj):
        """Return the number of technologies."""
        return len(obj.technologies) if obj.technologies else 0