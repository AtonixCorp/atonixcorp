from rest_framework import serializers
from .models import ActivityLog


class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = (
            'id', 'user', 'event_type', 'event_name', 'payload', 'ip_address', 'user_agent',
            'latitude', 'longitude', 'created_at'
        )
        read_only_fields = ('id', 'user', 'ip_address', 'created_at')
