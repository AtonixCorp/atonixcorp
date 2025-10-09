from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import FocusArea, FocusAreaTechnology, FocusAreaSolution
from .serializers import (
    FocusAreaSerializer, FocusAreaListSerializer,
    FocusAreaTechnologySerializer, FocusAreaSolutionSerializer
)


class FocusAreaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = FocusArea.objects.filter(is_active=True)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'detailed_description']
    ordering_fields = ['name', 'order', 'created_at']
    ordering = ['order', 'name']
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        if self.action == 'list':
            return FocusAreaListSerializer
        return FocusAreaSerializer
    
    @action(detail=True, methods=['get'])
    def technologies(self, request, slug=None):
        """Get focus area technologies"""
        focus_area = self.get_object()
        technologies = focus_area.technologies.all()
        serializer = FocusAreaTechnologySerializer(technologies, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def solutions(self, request, slug=None):
        """Get focus area solutions"""
        focus_area = self.get_object()
        solutions = focus_area.solutions.all()
        serializer = FocusAreaSolutionSerializer(solutions, many=True)
        return Response(serializer.data)


class FocusAreaTechnologyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = FocusAreaTechnology.objects.all()
    serializer_class = FocusAreaTechnologySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['focus_area']
    search_fields = ['name', 'description']


class FocusAreaSolutionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = FocusAreaSolution.objects.all()
    serializer_class = FocusAreaSolutionSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['focus_area']
    search_fields = ['title', 'description']
    ordering_fields = ['order', 'title']
    ordering = ['order']
