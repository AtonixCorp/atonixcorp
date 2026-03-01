"""
Developer Workspace ViewSet
===========================
REST API for managing personal DevWorkspace instances.

Endpoints:
    GET    /api/services/dev-workspaces/           – list current user's workspaces
    POST   /api/services/dev-workspaces/           – create a new workspace
    GET    /api/services/dev-workspaces/<id>/       – retrieve a workspace
    PUT    /api/services/dev-workspaces/<id>/       – replace
    PATCH  /api/services/dev-workspaces/<id>/       – partial update
    DELETE /api/services/dev-workspaces/<id>/       – delete a stopped workspace
    POST   /api/services/dev-workspaces/<id>/start/ – start the workspace
    POST   /api/services/dev-workspaces/<id>/stop/  – stop the workspace
"""

from __future__ import annotations

import uuid
from datetime import timezone

from django.utils import timezone as django_tz
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import DevWorkspace
from .serializers import DevWorkspaceSerializer, DevWorkspaceCreateSerializer


class DevWorkspaceViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = DevWorkspaceSerializer
    lookup_field = 'workspace_id'

    def get_queryset(self):
        return DevWorkspace.objects.filter(owner=self.request.user)

    def get_serializer_class(self):
        if self.action == 'create':
            return DevWorkspaceCreateSerializer
        return DevWorkspaceSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def destroy(self, request, *args, **kwargs):
        workspace = self.get_object()
        if workspace.status == 'running':
            return Response(
                {'detail': 'Stop the workspace before deleting it.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        workspace.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    # ------------------------------------------------------------------
    # Custom actions
    # ------------------------------------------------------------------

    @action(detail=True, methods=['post'], url_path='start')
    def start(self, request, workspace_id=None):
        workspace = self.get_object()
        if workspace.status == 'running':
            return Response(
                {'detail': 'Workspace is already running.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if workspace.status == 'starting':
            return Response(
                {'detail': 'Workspace is already starting.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Simulate start: set a demo editor URL and update metrics.
        # In production this would trigger a Kubernetes Job / Docker API call.
        workspace.status = 'running'
        workspace.started_at = django_tz.now()
        workspace.editor_url = (
            f'https://editor.atonixcorp.dev/{workspace.workspace_id}'
        )
        workspace.cpu_percent = 5
        workspace.ram_percent = 20
        workspace.containers = 1
        workspace.volumes = 1
        workspace.save(update_fields=[
            'status', 'started_at', 'editor_url',
            'cpu_percent', 'ram_percent', 'containers', 'volumes',
        ])
        return Response(DevWorkspaceSerializer(workspace).data)

    @action(detail=True, methods=['post'], url_path='stop')
    def stop(self, request, workspace_id=None):
        workspace = self.get_object()
        if workspace.status == 'stopped':
            return Response(
                {'detail': 'Workspace is already stopped.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        workspace.status = 'stopped'
        workspace.editor_url = ''
        workspace.cpu_percent = 0
        workspace.ram_percent = 0
        workspace.containers = 0
        workspace.volumes = 0
        workspace.save(update_fields=[
            'status', 'editor_url',
            'cpu_percent', 'ram_percent', 'containers', 'volumes',
        ])
        return Response(DevWorkspaceSerializer(workspace).data)
