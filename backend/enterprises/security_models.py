# Enterprise Security Settings Models
# This module implements enterprise-grade security settings and configurations

from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.postgres.fields import ArrayField
from django.conf import settings
from enterprises.models import Enterprise
import json


class SecurityFramework(models.Model):
    """Define security frameworks and compliance standards"""
    
    FRAMEWORK_CHOICES = [
        ('nist_csf', 'NIST Cybersecurity Framework'),
        ('iso_27001', 'ISO/IEC 27001'),
        ('cis_benchmark', 'CIS Benchmarks'),
        ('owasp_top10', 'OWASP Top 10'),
        ('pci_dss', 'PCI-DSS v3.2.1'),
        ('hipaa', 'HIPAA'),
        ('gdpr', 'GDPR'),
        ('soc2_type2', 'SOC 2 Type II'),
    ]
    
    name = models.CharField(max_length=100, choices=FRAMEWORK_CHOICES, unique=True)
    display_name = models.CharField(max_length=255)
    description = models.TextField()
    version = models.CharField(max_length=50)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.display_name


class EnterpriseSecurityPolicy(models.Model):
    """Enterprise-wide security policies and standards"""
    
    POLICY_LEVEL_CHOICES = [
        ('critical', 'Critical - Must implement'),
        ('high', 'High - Strongly recommended'),
        ('medium', 'Medium - Recommended'),
        ('low', 'Low - Optional'),
    ]
    
    enterprise = models.OneToOneField(Enterprise, on_delete=models.CASCADE, related_name='security_policy')
    
    # MFA Settings
    mfa_required = models.BooleanField(default=True, help_text="Enforce MFA for all users")
    mfa_grace_period_days = models.IntegerField(
        default=30,
        validators=[MinValueValidator(0), MaxValueValidator(90)],
        help_text="Days before MFA enforcement"
    )
    require_hardware_keys = models.BooleanField(default=False, help_text="Require hardware security keys")
    
    # Password Policy
    password_min_length = models.IntegerField(
        default=14,
        validators=[MinValueValidator(8), MaxValueValidator(128)]
    )
    password_require_uppercase = models.BooleanField(default=True)
    password_require_lowercase = models.BooleanField(default=True)
    password_require_numbers = models.BooleanField(default=True)
    password_require_special_chars = models.BooleanField(default=True)
    password_expiry_days = models.IntegerField(
        default=90,
        validators=[MinValueValidator(0), MaxValueValidator(365)]
    )
    password_history_count = models.IntegerField(
        default=5,
        validators=[MinValueValidator(0), MaxValueValidator(24)]
    )
    
    # Session Management
    session_timeout_minutes = models.IntegerField(
        default=15,
        validators=[MinValueValidator(5), MaxValueValidator(480)]
    )
    session_concurrent_limit = models.IntegerField(
        default=5,
        validators=[MinValueValidator(1), MaxValueValidator(50)]
    )
    require_vpn_for_admin = models.BooleanField(default=True)
    
    # Data Protection
    encryption_at_rest = models.BooleanField(default=True)
    encryption_algorithm = models.CharField(
        max_length=50,
        default='AES-256',
        choices=[('AES-256', 'AES-256'), ('AES-192', 'AES-192'), ('AES-128', 'AES-128')]
    )
    tls_minimum_version = models.CharField(
        max_length=20,
        default='TLS_1_3',
        choices=[('TLS_1_3', 'TLS 1.3'), ('TLS_1_2', 'TLS 1.2')]
    )
    
    # Audit & Logging
    enable_audit_logging = models.BooleanField(default=True)
    audit_log_retention_days = models.IntegerField(
        default=365,
        validators=[MinValueValidator(30), MaxValueValidator(2555)]
    )
    log_all_access = models.BooleanField(default=True)
    log_all_changes = models.BooleanField(default=True)
    
    # Access Control
    enforce_least_privilege = models.BooleanField(default=True)
    require_approval_for_privileged_access = models.BooleanField(default=True)
    privileged_access_approval_timeout_hours = models.IntegerField(
        default=8,
        validators=[MinValueValidator(1), MaxValueValidator(72)]
    )
    
    # Network Security
    enforce_network_segmentation = models.BooleanField(default=True)
    enforce_zero_trust = models.BooleanField(default=True)
    require_vpn_for_remote_access = models.BooleanField(default=True)
    
    # Vulnerability Management
    enable_vuln_scanning = models.BooleanField(default=True)
    vuln_scan_frequency_days = models.IntegerField(
        default=7,
        validators=[MinValueValidator(1), MaxValueValidator(30)]
    )
    auto_patch_critical = models.BooleanField(default=True)
    patch_window_hours = models.IntegerField(
        default=24,
        validators=[MinValueValidator(4), MaxValueValidator(168)]
    )
    
    # Backup & Recovery
    enable_backups = models.BooleanField(default=True)
    backup_frequency_hours = models.IntegerField(
        default=4,
        validators=[MinValueValidator(1), MaxValueValidator(24)]
    )
    backup_retention_days = models.IntegerField(
        default=90,
        validators=[MinValueValidator(7), MaxValueValidator(3650)]
    )
    rto_hours = models.IntegerField(default=4, help_text="Recovery Time Objective")
    rpo_minutes = models.IntegerField(default=5, help_text="Recovery Point Objective")
    
    # Compliance
    frameworks = models.ManyToManyField(SecurityFramework, related_name='enterprise_policies')
    primary_framework = models.ForeignKey(
        SecurityFramework,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='primary_policies'
    )
    annual_audit_required = models.BooleanField(default=True)
    penetration_testing_frequency_months = models.IntegerField(
        default=6,
        validators=[MinValueValidator(1), MaxValueValidator(24)]
    )
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    
    class Meta:
        verbose_name = "Enterprise Security Policy"
        verbose_name_plural = "Enterprise Security Policies"
    
    def __str__(self):
        return f"{self.enterprise.name} - Security Policy"


class SecurityHardeningChecklist(models.Model):
    """Security hardening checklists for different system types"""
    
    SYSTEM_TYPE_CHOICES = [
        ('linux', 'Linux Systems'),
        ('windows', 'Windows Systems'),
        ('container', 'Containers (Docker/Podman)'),
        ('kubernetes', 'Kubernetes Clusters'),
        ('database', 'Databases'),
        ('application', 'Applications'),
        ('network', 'Network'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    enterprise = models.ForeignKey(Enterprise, on_delete=models.CASCADE, related_name='hardening_checklists')
    system_type = models.CharField(max_length=50, choices=SYSTEM_TYPE_CHOICES)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    # Checklist items (JSON format)
    items = models.JSONField(default=list, help_text="Array of checklist items")
    
    # Status and tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    completion_percentage = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    
    # Dates
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    last_verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_checklists'
    )
    
    class Meta:
        unique_together = ('enterprise', 'system_type')
        ordering = ['system_type', 'created_at']
    
    def __str__(self):
        return f"{self.enterprise.name} - {self.get_system_type_display()}"


class SecurityControl(models.Model):
    """Individual security controls and their implementation status"""
    
    STATUS_CHOICES = [
        ('not_implemented', 'Not Implemented'),
        ('partial', 'Partially Implemented'),
        ('implemented', 'Implemented'),
        ('verified', 'Verified'),
        ('exempted', 'Exempted'),
    ]
    
    PRIORITY_CHOICES = [
        ('critical', 'Critical'),
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]
    
    enterprise = models.ForeignKey(Enterprise, on_delete=models.CASCADE, related_name='security_controls')
    framework = models.ForeignKey(SecurityFramework, on_delete=models.CASCADE)
    
    # Control details
    control_id = models.CharField(max_length=50)  # e.g., "AC-2" for NIST
    name = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100)  # e.g., "Access Control", "Audit"
    
    # Implementation
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_implemented')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    implementation_notes = models.TextField(blank=True)
    
    # Evidence
    evidence_document = models.FileField(upload_to='security_controls/', null=True, blank=True)
    test_results = models.JSONField(default=dict, blank=True)
    
    # Dates
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    verification_date = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_controls'
    )
    
    class Meta:
        unique_together = ('enterprise', 'framework', 'control_id')
        ordering = ['priority', 'category', 'control_id']
    
    def __str__(self):
        return f"{self.enterprise.name} - {self.control_id}: {self.name}"


class SecurityAudit(models.Model):
    """Security audit records and findings"""
    
    TYPE_CHOICES = [
        ('internal', 'Internal Audit'),
        ('external', 'External Audit'),
        ('pentest', 'Penetration Test'),
        ('vulnerability_scan', 'Vulnerability Scan'),
        ('compliance_check', 'Compliance Check'),
        ('incident_review', 'Incident Review'),
    ]
    
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('reviewed', 'Reviewed'),
    ]
    
    enterprise = models.ForeignKey(Enterprise, on_delete=models.CASCADE, related_name='security_audits')
    audit_type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    # Audit details
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    scope = models.TextField(help_text="What systems/areas are covered")
    
    # Schedule
    scheduled_date = models.DateField()
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    
    # Findings
    findings_count = models.IntegerField(default=0)
    critical_findings = models.IntegerField(default=0)
    high_findings = models.IntegerField(default=0)
    medium_findings = models.IntegerField(default=0)
    low_findings = models.IntegerField(default=0)
    
    # Audit report
    report_document = models.FileField(upload_to='security_audits/', null=True, blank=True)
    findings_json = models.JSONField(default=list, blank=True)
    
    # Auditor info
    conducted_by = models.CharField(max_length=255, blank=True)
    conducted_by_external = models.BooleanField(default=False)
    
    # Remediation
    remediation_plan = models.TextField(blank=True)
    remediation_deadline = models.DateField(null=True, blank=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-scheduled_date']
    
    def __str__(self):
        return f"{self.enterprise.name} - {self.get_audit_type_display()}"


class SecurityIncident(models.Model):
    """Security incident tracking and response"""
    
    SEVERITY_CHOICES = [
        ('critical', 'Critical'),
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]
    
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('investigating', 'Investigating'),
        ('contained', 'Contained'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]
    
    enterprise = models.ForeignKey(Enterprise, on_delete=models.CASCADE, related_name='security_incidents')
    
    # Incident details
    title = models.CharField(max_length=255)
    description = models.TextField()
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    
    # Timeline
    reported_at = models.DateTimeField(default=timezone.now)
    detected_at = models.DateTimeField(null=True, blank=True)
    contained_at = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    # Response
    response_team = models.CharField(max_length=255, blank=True)
    response_actions = models.TextField(blank=True)
    root_cause = models.TextField(blank=True)
    
    # Impact
    systems_affected = models.JSONField(default=list)
    data_affected = models.TextField(blank=True)
    user_count_affected = models.IntegerField(default=0)
    
    # Notifications
    notification_sent = models.BooleanField(default=False)
    notification_date = models.DateTimeField(null=True, blank=True)
    regulators_notified = models.BooleanField(default=False)
    regulator_notification_date = models.DateTimeField(null=True, blank=True)
    
    # Post-incident
    lessons_learned = models.TextField(blank=True)
    improvements_planned = models.JSONField(default=list)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-reported_at']
    
    def __str__(self):
        return f"{self.enterprise.name} - {self.title}"


class ComplianceTracker(models.Model):
    """Track compliance requirements and their status"""
    
    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('expired', 'Expired'),
        ('non_compliant', 'Non-Compliant'),
    ]
    
    enterprise = models.ForeignKey(Enterprise, on_delete=models.CASCADE, related_name='compliance_trackers')
    framework = models.ForeignKey(SecurityFramework, on_delete=models.CASCADE)
    
    requirement_name = models.CharField(max_length=255)
    description = models.TextField()
    section_reference = models.CharField(max_length=100, blank=True)  # e.g., "GDPR Article 32"
    
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='not_started')
    status_percentage = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    
    deadline = models.DateField()
    completed_date = models.DateField(null=True, blank=True)
    
    # Owner
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    
    # Evidence
    evidence_document = models.FileField(upload_to='compliance_evidence/', null=True, blank=True)
    verification_notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['deadline']
        unique_together = ('enterprise', 'framework', 'requirement_name')
    
    def __str__(self):
        return f"{self.enterprise.name} - {self.requirement_name}"
