from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Team, TeamMember, TeamSkill
from .serializers import (
    TeamSerializer, TeamListSerializer,
    TeamMemberSerializer, TeamSkillSerializer
)


class TeamViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Team.objects.filter(is_active=True)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'mission', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        if self.action == 'list':
            return TeamListSerializer
        return TeamSerializer
    
    @action(detail=True, methods=['get'])
    def members(self, request, slug=None):
        """Get team members"""
        team = self.get_object()
        members = team.members.all()
        serializer = TeamMemberSerializer(members, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def skills(self, request, slug=None):
        """Get team skills"""
        team = self.get_object()
        skills = team.skills.all()
        serializer = TeamSkillSerializer(skills, many=True)
        return Response(serializer.data)


class TeamMemberViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['team', 'is_lead']
    search_fields = ['name', 'role', 'bio']


class TeamSkillViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TeamSkill.objects.all()
    serializer_class = TeamSkillSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['team', 'proficiency_level']
