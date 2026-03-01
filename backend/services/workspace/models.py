# AtonixCorp – Workspace Models
#
# A Workspace is an isolated unit of cloud resources belonging to a team/project.
# Each Workspace maps to exactly one OpenStack project per environment.
#
# Diagram:
#   Workspace (devops, finance, sandbox)
#       └─ WorkspaceBinding (staging → devops-project-staging)
#       └─ WorkspaceBinding (prod    → devops-project-prod)

from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Workspace(models.Model):
    """Top-level organisational unit.  Every resource belongs to a Workspace."""

    ENVIRONMENT_CHOICES = [
        ("dev",        "Development"),
        ("staging",    "Staging"),
        ("prod",       "Production"),
    ]

    # Slug-style identifier used in resource names and API payloads
    workspace_id   = models.SlugField(max_length=64, unique=True)
    display_name   = models.CharField(max_length=128)
    description    = models.TextField(blank=True)
    owner          = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="owned_workspaces")
    members        = models.ManyToManyField(User, blank=True, related_name="workspaces")
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)
    is_active      = models.BooleanField(default=True)

    class Meta:
        ordering = ["workspace_id"]

    def __str__(self):
        return self.workspace_id


class WorkspaceBinding(models.Model):
    """
    Maps a Workspace + Environment → OpenStack project credentials.

    The backend resolves the correct OpenStack project from this table
    for every provisioning request.

    Fields:
        workspace          – FK to Workspace
        environment        – dev / staging / prod
        openstack_project  – OpenStack project name (used as OS_PROJECT_NAME)
        openstack_region   – OpenStack region (default: RegionOne)
        quota_vcpus        – max vCPUs allowed in this workspace/environment
        quota_ram_gb       – max RAM (GB) allowed
        quota_storage_gb   – max block storage (GB) allowed
    """

    workspace          = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name="bindings")
    environment        = models.CharField(max_length=16, choices=Workspace.ENVIRONMENT_CHOICES)
    openstack_project  = models.CharField(max_length=128, help_text="OpenStack project/tenant name")
    openstack_region   = models.CharField(max_length=64, default="RegionOne")
    quota_vcpus        = models.PositiveIntegerField(default=20)
    quota_ram_gb       = models.PositiveIntegerField(default=100)
    quota_storage_gb   = models.PositiveIntegerField(default=500)
    created_at         = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [("workspace", "environment")]
        ordering        = ["workspace", "environment"]

    def __str__(self):
        return f"{self.workspace.workspace_id} [{self.environment}] → {self.openstack_project}"


class ProvisionedResource(models.Model):
    """
    Audit log of every resource the backend creates in OpenStack.
    Provides the source-of-truth for workspace resource inventory.
    """

    RESOURCE_TYPES = [
        ("vm",        "Virtual Machine"),
        ("volume",    "Block Storage Volume"),
        ("network",   "Network"),
        ("subnet",    "Subnet"),
        ("snapshot",  "Snapshot"),
        ("floating_ip", "Floating IP"),
        ("k8s_cluster", "Kubernetes Cluster"),
    ]

    STATUS_CHOICES = [
        ("creating",  "Creating"),
        ("active",    "Active"),
        ("error",     "Error"),
        ("deleting",  "Deleting"),
        ("deleted",   "Deleted"),
    ]

    workspace         = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name="resources")
    environment       = models.CharField(max_length=16)
    resource_type     = models.CharField(max_length=32, choices=RESOURCE_TYPES)
    resource_id       = models.CharField(max_length=255, help_text="OpenStack resource UUID")
    resource_name     = models.CharField(max_length=255)
    openstack_project = models.CharField(max_length=128)
    region            = models.CharField(max_length=64, default="RegionOne")
    status            = models.CharField(max_length=16, choices=STATUS_CHOICES, default="creating")
    metadata          = models.JSONField(default=dict, blank=True)
    created_by        = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at        = models.DateTimeField(auto_now_add=True)
    updated_at        = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes  = [
            models.Index(fields=["workspace", "environment"]),
            models.Index(fields=["resource_type"]),
            models.Index(fields=["resource_id"]),
        ]

    def __str__(self):
        return f"{self.resource_type}:{self.resource_name} ({self.workspace.workspace_id}/{self.environment})"
