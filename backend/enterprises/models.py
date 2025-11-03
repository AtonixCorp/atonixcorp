from django.db import models
from django.utils import timezone
from django.conf import settings


class Enterprise(models.Model):
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    website = models.URLField(blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class EnterpriseTeam(models.Model):
    enterprise = models.ForeignKey(Enterprise, on_delete=models.CASCADE, related_name='enterprise_teams')
    # Link to existing Team model in `teams` app
    team = models.ForeignKey('teams.Team', on_delete=models.CASCADE, related_name='enterprise_links')
    role = models.CharField(max_length=100, blank=True)
    added_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('enterprise', 'team')
        ordering = ['-added_at']

    def __str__(self):
        return f"{self.enterprise.name} :: {self.team.name}"


class EnterpriseGroup(models.Model):
    enterprise = models.ForeignKey(Enterprise, on_delete=models.CASCADE, related_name='groups')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('enterprise', 'name')
        ordering = ['name']

    def __str__(self):
        return f"{self.enterprise.name} - {self.name}"


class MigrationRun(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('failed', 'Failed'),
        ('completed', 'Completed'),
    ]

    enterprise = models.ForeignKey(Enterprise, on_delete=models.CASCADE, related_name='migration_runs')
    run_id = models.CharField(max_length=128)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    details = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.enterprise.name} - {self.run_id} ({self.status})"
