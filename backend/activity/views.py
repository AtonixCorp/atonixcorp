from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils import timezone
from .models import ActivityLog
from .serializers import ActivityLogSerializer


class ActivityLogViewSet(viewsets.GenericViewSet):
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        """Accept a single event or a list of events and store them."""
        data = request.data
        items = data if isinstance(data, list) else [data]
        created = []

        for item in items:
            serializer = self.get_serializer(data=item)
            serializer.is_valid(raise_exception=True)
            # Determine IP and user agent from request
            ip = request.META.get('HTTP_X_FORWARDED_FOR', '').split(',')[0].strip() or request.META.get('REMOTE_ADDR')
            ua = request.META.get('HTTP_USER_AGENT', '')

            instance = serializer.save(user=request.user if request.user.is_authenticated else None,
                                       ip_address=ip,
                                       user_agent=ua,
                                       created_at=timezone.now())
            created.append(self.get_serializer(instance).data)

        return Response(created, status=status.HTTP_201_CREATED)

    def list(self, request, *args, **kwargs):
        """List recent activity logs (admin/authorized users will want to query this)."""
        qs = self.get_queryset()
        qs = qs.order_by('-created_at')
        page = self.paginate_queryset(qs)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)
