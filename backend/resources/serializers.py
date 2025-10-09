from rest_framework import serializers
from .models import ResourceCategory, Resource, CommunityLink, FAQ


class ResourceCategorySerializer(serializers.ModelSerializer):
    resource_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ResourceCategory
        fields = ['id', 'name', 'slug', 'description', 'icon', 'order', 'resource_count']
    
    def get_resource_count(self, obj):
        return obj.resources.filter(is_public=True).count()


class ResourceSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Resource
        fields = [
            'id', 'title', 'slug', 'category', 'category_name', 'description',
            'content', 'resource_type', 'external_url', 'file_attachment',
            'tags', 'is_featured', 'is_public', 'created_at', 'updated_at'
        ]


class ResourceListSerializer(serializers.ModelSerializer):
    """Simplified serializer for resource lists"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Resource
        fields = [
            'id', 'title', 'slug', 'category_name', 'description',
            'resource_type', 'external_url', 'tags', 'is_featured',
            'created_at'
        ]


class CommunityLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunityLink
        fields = [
            'id', 'platform', 'name', 'url', 'icon', 'description',
            'is_active', 'order'
        ]


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = [
            'id', 'question', 'answer', 'category', 'is_featured',
            'order', 'created_at', 'updated_at'
        ]