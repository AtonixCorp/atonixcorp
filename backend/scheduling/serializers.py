from rest_framework import serializers
from .models import ScheduleItem


class ScheduleItemSerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = ScheduleItem
        fields = [
            'id', 'owner', 'owner_username', 'title', 'description', 'start', 'end', 'all_day', 'timezone',
            'status', 'reminder_at', 'reminder_sent', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'owner', 'owner_username', 'reminder_sent', 'created_at', 'updated_at']
