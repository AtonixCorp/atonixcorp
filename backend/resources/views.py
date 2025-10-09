from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import ResourceCategory, Resource, CommunityLink, FAQ
from .serializers import (
    ResourceCategorySerializer, ResourceSerializer, ResourceListSerializer,
    CommunityLinkSerializer, FAQSerializer
)


class ResourceCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ResourceCategory.objects.all()
    serializer_class = ResourceCategorySerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'order']
    ordering = ['order', 'name']
    lookup_field = 'slug'


class ResourceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Resource.objects.filter(is_public=True)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'resource_type', 'is_featured']
    search_fields = ['title', 'description', 'content', 'tags']
    ordering_fields = ['title', 'created_at', 'updated_at']
    ordering = ['-is_featured', '-created_at']
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ResourceListSerializer
        return ResourceSerializer
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured resources"""
        featured_resources = self.queryset.filter(is_featured=True)
        serializer = self.get_serializer(featured_resources, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get resources grouped by category"""
        categories = ResourceCategory.objects.all().order_by('order', 'name')
        result = []
        for category in categories:
            resources = self.queryset.filter(category=category)
            result.append({
                'category': ResourceCategorySerializer(category).data,
                'resources': ResourceListSerializer(resources, many=True).data
            })
        return Response(result)


class CommunityLinkViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CommunityLink.objects.filter(is_active=True)
    serializer_class = CommunityLinkSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['platform']
    search_fields = ['platform', 'name', 'description']
    ordering_fields = ['platform', 'order']
    ordering = ['order', 'platform']


class FAQViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = FAQ.objects.all()
    serializer_class = FAQSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_featured']
    search_fields = ['question', 'answer', 'category']
    ordering_fields = ['order', 'created_at']
    ordering = ['-is_featured', 'order']
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured FAQs"""
        featured_faqs = self.queryset.filter(is_featured=True)
        serializer = self.get_serializer(featured_faqs, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get FAQs grouped by category"""
        categories = self.queryset.values_list('category', flat=True).distinct()
        result = {}
        for category in categories:
            if category:
                faqs = self.queryset.filter(category=category)
                result[category] = FAQSerializer(faqs, many=True).data
        return Response(result)
