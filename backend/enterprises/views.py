from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated, IsAdminUser
from drf_spectacular.utils import extend_schema, extend_schema_view
from django.shortcuts import get_object_or_404
from .models import Enterprise, EnterpriseTeam, EnterpriseGroup, MigrationRun
from .serializers import (
    EnterpriseSerializer, EnterpriseTeamSerializer, EnterpriseTeamCreateSerializer,
    EnterpriseGroupSerializer, MigrationRunSerializer
)


@extend_schema_view(
    list=extend_schema(summary="List enterprises", tags=["Enterprises"]),
    retrieve=extend_schema(summary="Get enterprise", tags=["Enterprises"]),
    create=extend_schema(summary="Create enterprise", description="Create an enterprise (staff only)", tags=["Enterprises"]),
)
class EnterpriseViewSet(viewsets.ModelViewSet):
    queryset = Enterprise.objects.all()
    serializer_class = EnterpriseSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        # Require staff/admin for write actions: create, update, partial_update, destroy
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAdminUser()]
        # For nested POSTs (add_team, groups POST) require authenticated users
        if self.action in ('add_team',) or (self.action == 'groups' and self.request.method == 'POST'):
            return [IsAuthenticated()]
        return [perm() for perm in self.permission_classes]

    @action(detail=True, methods=['get'], url_path='teams')
    def teams(self, request, pk=None):
        enterprise = self.get_object()
        links = EnterpriseTeam.objects.filter(enterprise=enterprise).select_related('team')
        serializer = EnterpriseTeamSerializer(links, many=True)
        return Response({'data': serializer.data})

    @teams.mapping.post
    def add_team(self, request, pk=None):
        enterprise = self.get_object()
        serializer = EnterpriseTeamCreateSerializer(data=request.data, context={'enterprise': enterprise})
        serializer.is_valid(raise_exception=True)
        link = serializer.save()
        out = EnterpriseTeamSerializer(link)
        return Response(out.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get', 'post'], url_path='groups')
    def groups(self, request, pk=None):
        enterprise = self.get_object()
        if request.method == 'GET':
            groups = EnterpriseGroup.objects.filter(enterprise=enterprise)
            serializer = EnterpriseGroupSerializer(groups, many=True)
            return Response({'data': serializer.data})

        # POST - create group
        serializer = EnterpriseGroupSerializer(data={**request.data, 'enterprise': enterprise.id})
        serializer.is_valid(raise_exception=True)
        group = serializer.save()
        return Response(EnterpriseGroupSerializer(group).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], url_path='migration/runs')
    def migration_runs(self, request, pk=None):
        enterprise = self.get_object()
        runs = MigrationRun.objects.filter(enterprise=enterprise).order_by('-started_at')
        serializer = MigrationRunSerializer(runs, many=True)
        return Response({'data': serializer.data})

    @action(detail=True, methods=['get'], url_path='analytics/scores')
    def analytics_scores(self, request, pk=None):
        enterprise = self.get_object()
        days = int(request.query_params.get('days', 30))
        
        # Generate mock analytics data for now
        import random
        from datetime import datetime, timedelta
        
        scores = []
        base_date = datetime.now()
        for i in range(days):
            date = base_date - timedelta(days=i)
            # Generate a score between 0-100 with some variation
            score = min(100, max(0, 50 + 30 * random.sin(i / 4) + (random.random() * 20 - 10)))
            scores.append({
                'date': date.strftime('%Y-%m-%d'),
                'score': round(score, 2)
            })
        
        return Response(scores)
