# AtonixCorp Cloud – Monitoring & Incident Management Models
import uuid
from django.db import models
from django.contrib.auth.models import User
from .base_models import ResourceModel, TimeStampedModel


# ── Service Health ─────────────────────────────────────────────────────────────

class ServiceHealth(TimeStampedModel):
    """Current health snapshot for a top-level service."""

    SERVICE_CHOICES = [
        ('compute',     'Compute'),
        ('database',    'Database'),
        ('storage',     'Storage'),
        ('networking',  'Networking'),
        ('containers',  'Containers'),
        ('email',       'Email'),
        ('dns',         'DNS'),
        ('cdn',         'CDN'),
        ('monitoring',  'Monitoring'),
    ]

    STATUS_CHOICES = [
        ('operational',        'Operational'),
        ('degraded',           'Degraded Performance'),
        ('partial_outage',     'Partial Outage'),
        ('major_outage',       'Major Outage'),
        ('maintenance',        'Under Maintenance'),
    ]

    service      = models.CharField(max_length=64, choices=SERVICE_CHOICES, unique=True)
    status       = models.CharField(max_length=32, choices=STATUS_CHOICES, default='operational')
    uptime_pct   = models.FloatField(default=100.0)
    latency_ms   = models.FloatField(default=0.0)
    error_rate   = models.FloatField(default=0.0)   # percentage
    note         = models.TextField(blank=True)
    last_checked = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'service healths'
        ordering = ['service']

    def __str__(self):
        return f'{self.service} – {self.status}'


# ── Metric Snapshot ────────────────────────────────────────────────────────────

class MetricSnapshot(TimeStampedModel):
    """Time-series metric point for a resource."""

    METRIC_CHOICES = [
        ('cpu_percent',       'CPU %'),
        ('memory_percent',    'Memory %'),
        ('disk_io_read',      'Disk IO Read (MB/s)'),
        ('disk_io_write',     'Disk IO Write (MB/s)'),
        ('network_in',        'Network In (MB/s)'),
        ('network_out',       'Network Out (MB/s)'),
        ('latency_ms',        'Latency (ms)'),
        ('error_rate',        'Error Rate (%)'),
        ('request_rate',      'Requests/sec'),
        ('queue_length',      'Queue Length'),
        ('replication_lag',   'Replication Lag (s)'),
        ('pod_restarts',      'Pod Restarts'),
        ('storage_used_pct',  'Storage Used (%)'),
        ('email_queue',       'Email Queue Length'),
        ('dns_query_rate',    'DNS Queries/sec'),
    ]

    owner       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='metric_snapshots')
    resource_id = models.CharField(max_length=64, db_index=True)
    service     = models.CharField(max_length=64, db_index=True)
    metric      = models.CharField(max_length=64, choices=METRIC_CHOICES, db_index=True)
    value       = models.FloatField()
    unit        = models.CharField(max_length=32, blank=True)
    region      = models.CharField(max_length=64, blank=True)
    timestamp   = models.DateTimeField(db_index=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['resource_id', 'metric', 'timestamp']),
            models.Index(fields=['owner', 'service', 'timestamp']),
        ]

    def __str__(self):
        return f'{self.resource_id}/{self.metric}={self.value} @ {self.timestamp}'


# ── Alert Rule ─────────────────────────────────────────────────────────────────

class AlertRule(ResourceModel):
    """User-defined alerting rule (like CloudWatch alarm)."""

    CONDITION_CHOICES = [
        ('gt', '>'),
        ('gte', '>='),
        ('lt', '<'),
        ('lte', '<='),
        ('eq', '=='),
    ]

    SEVERITY_CHOICES = [
        ('info',     'Info'),
        ('warning',  'Warning'),
        ('critical', 'Critical'),
    ]

    NOTIFY_CHOICES = [
        ('email',    'Email'),
        ('slack',    'Slack'),
        ('webhook',  'Webhook'),
        ('pagerduty','PagerDuty'),
    ]

    def save(self, *args, **kwargs):
        if not self.resource_id:
            self.resource_id = f'alr-{uuid.uuid4().hex[:12]}'
        super().save(*args, **kwargs)

    service        = models.CharField(max_length=64)
    resource_id_filter = models.CharField(max_length=64, blank=True,
        help_text='Specific resource to watch, or blank for service-wide')
    metric         = models.CharField(max_length=64)
    condition      = models.CharField(max_length=8, choices=CONDITION_CHOICES, default='gt')
    threshold      = models.FloatField()
    duration_mins  = models.IntegerField(default=5,
        help_text='Minutes the condition must hold before firing')
    severity       = models.CharField(max_length=16, choices=SEVERITY_CHOICES, default='warning')
    notify_via     = models.JSONField(default=list,
        help_text='List of notification channels')
    notify_target  = models.TextField(blank=True,
        help_text='Email / webhook URL / PagerDuty key')
    is_enabled     = models.BooleanField(default=True)
    last_fired_at  = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']


# ── Alert (fired instance) ─────────────────────────────────────────────────────

class MonitoringAlert(TimeStampedModel):
    """A fired alert event."""

    STATE_CHOICES = [
        ('firing',    'Firing'),
        ('resolved',  'Resolved'),
        ('silenced',  'Silenced'),
    ]

    rule        = models.ForeignKey(AlertRule, on_delete=models.CASCADE, related_name='alerts')
    owner       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='monitoring_alerts')
    state       = models.CharField(max_length=16, choices=STATE_CHOICES, default='firing')
    value       = models.FloatField(help_text='Metric value that triggered the alert')
    fired_at    = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    message     = models.TextField(blank=True)

    class Meta:
        ordering = ['-fired_at']


# ── Incident ───────────────────────────────────────────────────────────────────

class Incident(ResourceModel):
    """An operational incident requiring investigation/resolution."""

    SEVERITY_CHOICES = [
        ('sev1', 'SEV-1 Critical'),
        ('sev2', 'SEV-2 High'),
        ('sev3', 'SEV-3 Medium'),
        ('sev4', 'SEV-4 Low'),
    ]

    STATUS_CHOICES = [
        ('open',          'Open'),
        ('investigating', 'Investigating'),
        ('identified',    'Identified'),
        ('monitoring',    'Monitoring'),
        ('resolved',      'Resolved'),
        ('postmortem',    'Post-Mortem'),
    ]

    def save(self, *args, **kwargs):
        if not self.resource_id:
            self.resource_id = f'inc-{uuid.uuid4().hex[:12]}'
        super().save(*args, **kwargs)

    service       = models.CharField(max_length=64)
    severity      = models.CharField(max_length=8, choices=SEVERITY_CHOICES, default='sev3')
    status        = models.CharField(max_length=16, choices=STATUS_CHOICES, default='open')
    title         = models.CharField(max_length=255)
    summary       = models.TextField(blank=True)
    affected_resources = models.JSONField(default=list)
    assigned_to   = models.ForeignKey(User, null=True, blank=True,
                        on_delete=models.SET_NULL, related_name='assigned_incidents')
    alert         = models.ForeignKey(MonitoringAlert, null=True, blank=True,
                        on_delete=models.SET_NULL, related_name='incidents')
    detected_at   = models.DateTimeField(auto_now_add=True)
    resolved_at   = models.DateTimeField(null=True, blank=True)
    impact        = models.TextField(blank=True)
    resolution    = models.TextField(blank=True)

    class Meta:
        ordering = ['-detected_at']

    @property
    def duration_minutes(self):
        from django.utils import timezone
        end = self.resolved_at or timezone.now()
        return int((end - self.detected_at).total_seconds() / 60)


class IncidentUpdate(TimeStampedModel):
    """Timestamped status update on an incident (audit trail)."""

    incident = models.ForeignKey(Incident, on_delete=models.CASCADE, related_name='updates')
    author   = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    status   = models.CharField(max_length=16)
    message  = models.TextField()

    class Meta:
        ordering = ['created_at']
