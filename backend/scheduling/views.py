from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ScheduleItem
from .serializers import ScheduleItemSerializer


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Read permissions allowed to any authenticated user; write only to owner
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user


class ScheduleItemViewSet(viewsets.ModelViewSet):
    queryset = ScheduleItem.objects.all()
    serializer_class = ScheduleItemSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        # Return items for the requesting user only (admins can see all)
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return ScheduleItem.objects.all()
        return ScheduleItem.objects.filter(owner=user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_reminder_sent(self, request, pk=None):
        item = self.get_object()
        item.reminder_sent = True
        item.save()
        return Response({'status': 'reminder marked'})

