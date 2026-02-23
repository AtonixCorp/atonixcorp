# AtonixCorp Cloud – Monitoring Serializers

from rest_framework import serializers
from .models import (
    ServiceHealth, MetricSnapshot, AlertRule, MonitoringAlert, Incident, IncidentUpdate,
)


class ServiceHealthSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ServiceHealth
        fields = ['service', 'status', 'uptime_pct', 'latency_ms',
                  'error_rate', 'note', 'last_checked']


class MetricSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model  = MetricSnapshot
        fields = ['id', 'resource_id', 'service', 'metric', 'value',
                  'unit', 'region', 'timestamp', 'created_at']
        read_only_fields = ['id', 'created_at']


class AlertRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model  = AlertRule
        fields = [
            'resource_id', 'name', 'description', 'service',
            'resource_id_filter', 'metric', 'condition', 'threshold',
            'duration_mins', 'severity', 'notify_via', 'notify_target',
            'is_enabled', 'last_fired_at', 'created_at', 'updated_at',
        ]
        read_only_fields = ['resource_id', 'last_fired_at', 'created_at', 'updated_at']


class CreateAlertRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model  = AlertRule
        fields = ['name', 'description', 'service', 'resource_id_filter',
                  'metric', 'condition', 'threshold', 'duration_mins',
                  'severity', 'notify_via', 'notify_target']


class AlertSerializer(serializers.ModelSerializer):
    rule_name = serializers.CharField(source='rule.name', read_only=True)
    service   = serializers.CharField(source='rule.service', read_only=True)
    metric    = serializers.CharField(source='rule.metric', read_only=True)
    severity  = serializers.CharField(source='rule.severity', read_only=True)
    threshold = serializers.FloatField(source='rule.threshold', read_only=True)

    class Meta:
        model  = MonitoringAlert
        fields = ['id', 'rule_name', 'service', 'metric', 'severity',
                  'threshold', 'state', 'value', 'fired_at',
                  'resolved_at', 'message']
        read_only_fields = fields


class IncidentUpdateSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model  = IncidentUpdate
        fields = ['id', 'status', 'message', 'author_name', 'created_at']
        read_only_fields = fields

    def get_author_name(self, obj):
        if obj.author:
            return obj.author.get_full_name() or obj.author.username
        return 'System'


class IncidentListSerializer(serializers.ModelSerializer):
    duration_minutes = serializers.ReadOnlyField()

    class Meta:
        model  = Incident
        fields = ['resource_id', 'title', 'service', 'severity', 'status',
                  'detected_at', 'resolved_at', 'duration_minutes', 'created_at']
        read_only_fields = fields


class IncidentDetailSerializer(serializers.ModelSerializer):
    updates          = IncidentUpdateSerializer(many=True, read_only=True)
    duration_minutes = serializers.ReadOnlyField()
    assigned_to_name = serializers.SerializerMethodField()

    class Meta:
        model  = Incident
        fields = [
            'resource_id', 'title', 'name', 'description', 'service',
            'severity', 'status', 'summary', 'impact', 'resolution',
            'affected_resources', 'assigned_to_name',
            'detected_at', 'resolved_at', 'duration_minutes',
            'created_at', 'updated_at', 'updates',
        ]
        read_only_fields = ['resource_id', 'detected_at', 'resolved_at',
                            'created_at', 'updated_at', 'duration_minutes']

    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return obj.assigned_to.get_full_name() or obj.assigned_to.username
        return None


class CreateIncidentSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Incident
        fields = ['name', 'title', 'service', 'severity', 'summary',
                  'impact', 'affected_resources']
