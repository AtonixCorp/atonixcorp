# AtonixCorp Backend - Base Models and Utilities

from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import uuid
import json

# ============================================================================
# BASE MODELS & MIXINS
# ============================================================================

class TimeStampedModel(models.Model):
    """Base model with created_at and updated_at timestamps."""
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class ResourceModel(TimeStampedModel):
    """Base model for cloud resources."""
    resource_id = models.CharField(
        max_length=64, 
        unique=True, 
        db_index=True,
        editable=False
    )
    name = models.CharField(max_length=255, db_index=True)
    description = models.TextField(blank=True, null=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='%(class)s_owned')
    tags = models.JSONField(default=dict, help_text="Key-value tags for resource")
    metadata = models.JSONField(default=dict, help_text="Additional metadata")
    
    class Meta:
        abstract = True
    
    def save(self, *args, **kwargs):
        """Generate resource_id if not set."""
        if not self.resource_id:
            self.resource_id = self.generate_resource_id()
        super().save(*args, **kwargs)
    
    @staticmethod
    def generate_resource_id(prefix='res'):
        """Generate unique resource ID."""
        return f"{prefix}-{uuid.uuid4().hex[:12]}"


class Status(models.TextChoices):
    """Common status choices for resources."""
    PENDING = 'pending', 'Pending'
    CREATING = 'creating', 'Creating'
    RUNNING = 'running', 'Running'
    STOPPING = 'stopping', 'Stopping'
    STOPPED = 'stopped', 'Stopped'
    TERMINATING = 'terminating', 'Terminating'
    TERMINATED = 'terminated', 'Terminated'
    ERROR = 'error', 'Error'
    FAILED = 'failed', 'Failed'


# ============================================================================
# AUDIT & LOGGING MODELS
# ============================================================================

class AuditLog(TimeStampedModel):
    """Log all resource changes for compliance and debugging."""
    ACTION_CHOICES = [
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('start', 'Start'),
        ('stop', 'Stop'),
        ('restart', 'Restart'),
        ('scale', 'Scale'),
        ('error', 'Error'),
    ]
    
    audit_id = models.CharField(max_length=64, unique=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    resource_type = models.CharField(max_length=100, db_index=True)
    resource_id = models.CharField(max_length=64, db_index=True)
    resource_name = models.CharField(max_length=255, blank=True)
    status = models.CharField(
        max_length=20,
        choices=[('success', 'Success'), ('failure', 'Failure')],
        default='success'
    )
    details = models.JSONField(default=dict)
    error_message = models.TextField(blank=True)
    source_ip = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'action']),
            models.Index(fields=['resource_type', 'resource_id']),
        ]
    
    def save(self, *args, **kwargs):
        if not self.audit_id:
            self.audit_id = f"audit-{uuid.uuid4().hex[:12]}"
        super().save(*args, **kwargs)
    
    @classmethod
    def log_action(cls, user, action, resource_type, resource_id, resource_name='', 
                   status='success', details=None, error_message='', source_ip=''):
        """Convenience method to create audit log."""
        return cls.objects.create(
            user=user,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            resource_name=resource_name,
            status=status,
            details=details or {},
            error_message=error_message,
            source_ip=source_ip,
        )


class ResourceTag(models.Model):
    """Tagging system for resources."""
    key = models.CharField(max_length=100, db_index=True)
    value = models.CharField(max_length=255)
    resource_type = models.CharField(max_length=100, db_index=True)
    resource_id = models.CharField(max_length=64, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('resource_type', 'resource_id', 'key')
        indexes = [
            models.Index(fields=['key', 'value']),
            models.Index(fields=['resource_type', 'resource_id']),
        ]


class ApiKey(TimeStampedModel):
    """API keys for programmatic access."""
    api_key_id = models.CharField(max_length=64, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='api_keys')
    name = models.CharField(max_length=255)
    key_hash = models.CharField(max_length=512)  # Store hash, not plaintext
    is_active = models.BooleanField(default=True, db_index=True)
    last_used_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    scopes = models.JSONField(default=list, help_text="List of permission scopes")
    
    class Meta:
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        if not self.api_key_id:
            self.api_key_id = f"key-{uuid.uuid4().hex[:12]}"
        super().save(*args, **kwargs)


# ============================================================================
# QUOTAS & LIMITS
# ============================================================================

class ResourceQuota(models.Model):
    """Track quotas and usage limits per user."""
    RESOURCE_TYPES = [
        ('instances', 'Virtual Machine Instances'),
        ('volumes', 'Storage Volumes'),
        ('buckets', 'Storage Buckets'),
        ('networks', 'Virtual Networks'),
        ('functions', 'Serverless Functions'),
        ('cpus', 'CPU Cores'),
        ('memory_gb', 'Memory (GB)'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='resource_quota')
    resource_type = models.CharField(max_length=100)
    limit = models.IntegerField()
    used = models.IntegerField(default=0, db_index=True)
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'resource_type')
    
    @property
    def available(self):
        return self.limit - self.used
    
    @property
    def usage_percentage(self):
        if self.limit == 0:
            return 0
        return (self.used / self.limit) * 100
    
    def is_available(self, amount=1):
        """Check if quota is available for the requested amount."""
        return self.available >= amount


# ============================================================================
# NOTIFICATIONS & ALERTS
# ============================================================================

class Alert(TimeStampedModel):
    """System alerts and notifications."""
    SEVERITY_CHOICES = [
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('critical', 'Critical'),
    ]
    
    alert_id = models.CharField(max_length=64, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='alerts')
    title = models.CharField(max_length=255)
    message = models.TextField()
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='info')
    resource_type = models.CharField(max_length=100, blank=True)
    resource_id = models.CharField(max_length=64, blank=True)
    is_read = models.BooleanField(default=False, db_index=True)
    metadata = models.JSONField(default=dict)
    
    class Meta:
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        if not self.alert_id:
            self.alert_id = f"alert-{uuid.uuid4().hex[:12]}"
        super().save(*args, **kwargs)
