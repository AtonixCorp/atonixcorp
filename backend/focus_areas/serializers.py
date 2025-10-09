from rest_framework import serializers
from .models import FocusArea, FocusAreaTechnology, FocusAreaSolution


class FocusAreaTechnologySerializer(serializers.ModelSerializer):
    class Meta:
        model = FocusAreaTechnology
        fields = ['id', 'name', 'description', 'icon', 'website_url']


class FocusAreaSolutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FocusAreaSolution
        fields = ['id', 'title', 'description', 'benefits', 'use_cases', 'order']


class FocusAreaSerializer(serializers.ModelSerializer):
    technologies = FocusAreaTechnologySerializer(many=True, read_only=True)
    solutions = FocusAreaSolutionSerializer(many=True, read_only=True)
    
    class Meta:
        model = FocusArea
        fields = [
            'id', 'name', 'slug', 'description', 'detailed_description',
            'icon', 'image', 'color_theme', 'is_active', 'order',
            'created_at', 'updated_at', 'technologies', 'solutions'
        ]


class FocusAreaListSerializer(serializers.ModelSerializer):
    """Simplified serializer for focus area lists"""
    technology_count = serializers.SerializerMethodField()
    solution_count = serializers.SerializerMethodField()
    
    class Meta:
        model = FocusArea
        fields = [
            'id', 'name', 'slug', 'description', 'icon', 'image',
            'color_theme', 'is_active', 'order', 'technology_count',
            'solution_count'
        ]
    
    def get_technology_count(self, obj):
        return obj.technologies.count()
    
    def get_solution_count(self, obj):
        return obj.solutions.count()