# Enterprise Security Serializers

from rest_framework import serializers
from enterprises.security_models import (
    SecurityFramework,
    EnterpriseSecurityPolicy,
    SecurityHardeningChecklist,
    SecurityControl,
    SecurityAudit,
    SecurityIncident,
    ComplianceTracker,
)


class SecurityFrameworkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SecurityFramework
        fields = ['id', 'name', 'display_name', 'description', 'version', 'created_at']
        read_only_fields = ['created_at']


class EnterpriseSecurityPolicySerializer(serializers.ModelSerializer):
    frameworks = SecurityFrameworkSerializer(many=True, read_only=True)
    primary_framework_display = serializers.CharField(source='primary_framework.display_name', read_only=True)
    updated_by_username = serializers.CharField(source='updated_by.username', read_only=True)
    
    class Meta:
        model = EnterpriseSecurityPolicy
        fields = [
            'id', 'enterprise', 
            # MFA
            'mfa_required', 'mfa_grace_period_days', 'require_hardware_keys',
            # Password
            'password_min_length', 'password_require_uppercase', 'password_require_lowercase',
            'password_require_numbers', 'password_require_special_chars', 'password_expiry_days',
            'password_history_count',
            # Session
            'session_timeout_minutes', 'session_concurrent_limit', 'require_vpn_for_admin',
            # Data
            'encryption_at_rest', 'encryption_algorithm', 'tls_minimum_version',
            # Audit
            'enable_audit_logging', 'audit_log_retention_days', 'log_all_access', 'log_all_changes',
            # Access
            'enforce_least_privilege', 'require_approval_for_privileged_access',
            'privileged_access_approval_timeout_hours',
            # Network
            'enforce_network_segmentation', 'enforce_zero_trust', 'require_vpn_for_remote_access',
            # Vulnerability
            'enable_vuln_scanning', 'vuln_scan_frequency_days', 'auto_patch_critical',
            'patch_window_hours',
            # Backup
            'enable_backups', 'backup_frequency_hours', 'backup_retention_days',
            'rto_hours', 'rpo_minutes',
            # Compliance
            'frameworks', 'primary_framework', 'primary_framework_display',
            'annual_audit_required', 'penetration_testing_frequency_months',
            # Metadata
            'created_at', 'updated_at', 'updated_by_username'
        ]
        read_only_fields = ['created_at', 'updated_at']


class SecurityChecklistItemSerializer(serializers.Serializer):
    """Serializer for individual checklist items"""
    id = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField()
    completed = serializers.BooleanField()
    priority = serializers.CharField()
    category = serializers.CharField()
    due_date = serializers.DateField(required=False)
    assigned_to = serializers.CharField(required=False)


class SecurityHardeningChecklistSerializer(serializers.ModelSerializer):
    items = SecurityChecklistItemSerializer(many=True)
    verified_by_username = serializers.CharField(source='verified_by.username', read_only=True)
    
    class Meta:
        model = SecurityHardeningChecklist
        fields = [
            'id', 'enterprise', 'system_type', 'name', 'description',
            'items', 'status', 'completion_percentage', 'created_at',
            'updated_at', 'last_verified_at', 'verified_by_username'
        ]
        read_only_fields = ['created_at', 'updated_at', 'last_verified_at']


class SecurityControlSerializer(serializers.ModelSerializer):
    framework_name = serializers.CharField(source='framework.display_name', read_only=True)
    verified_by_username = serializers.CharField(source='verified_by.username', read_only=True)
    
    class Meta:
        model = SecurityControl
        fields = [
            'id', 'enterprise', 'framework', 'framework_name',
            'control_id', 'name', 'description', 'category',
            'status', 'priority', 'implementation_notes',
            'evidence_document', 'test_results', 'created_at',
            'updated_at', 'verification_date', 'verified_by_username'
        ]
        read_only_fields = ['created_at', 'updated_at']


class SecurityAuditSerializer(serializers.ModelSerializer):
    class Meta:
        model = SecurityAudit
        fields = [
            'id', 'enterprise', 'audit_type', 'title', 'description',
            'status', 'scope', 'scheduled_date', 'start_date', 'end_date',
            'findings_count', 'critical_findings', 'high_findings',
            'medium_findings', 'low_findings', 'report_document',
            'findings_json', 'conducted_by', 'conducted_by_external',
            'remediation_plan', 'remediation_deadline', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class SecurityIncidentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SecurityIncident
        fields = [
            'id', 'enterprise', 'title', 'description', 'severity', 'status',
            'reported_at', 'detected_at', 'contained_at', 'resolved_at',
            'response_team', 'response_actions', 'root_cause',
            'systems_affected', 'data_affected', 'user_count_affected',
            'notification_sent', 'notification_date', 'regulators_notified',
            'regulator_notification_date', 'lessons_learned', 'improvements_planned',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ComplianceTrackerSerializer(serializers.ModelSerializer):
    framework_name = serializers.CharField(source='framework.display_name', read_only=True)
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    
    class Meta:
        model = ComplianceTracker
        fields = [
            'id', 'enterprise', 'framework', 'framework_name',
            'requirement_name', 'description', 'section_reference',
            'status', 'status_percentage', 'deadline', 'completed_date',
            'owner', 'owner_username', 'evidence_document',
            'verification_notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
