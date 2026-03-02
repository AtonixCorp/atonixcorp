# AtonixCorp Cloud — Group Platform Models
# Enterprise-grade GitLab-inspired group system.

import uuid
from django.db import models
from django.contrib.auth.models import User
from ..core.base_models import TimeStampedModel


def _uid_group():
    return f'grp-{uuid.uuid4().hex[:12]}'


def _uid_member():
    return f'mem-{uuid.uuid4().hex[:12]}'


def _uid_invite():
    return f'inv-{uuid.uuid4().hex[:12]}'


def _uid_token():
    return f'tok-{uuid.uuid4().hex[:12]}'


# ── Choices ───────────────────────────────────────────────────────────────────

VISIBILITY_CHOICES = [
    ('public',   'Public'),
    ('internal', 'Internal'),
    ('private',  'Private'),
]

GROUP_TYPE_CHOICES = [
    ('developer',  'Developer Group'),
    ('enterprise', 'Enterprise Group'),
    ('system',     'System Group'),
    ('production', 'Production Group'),
    ('marketing',  'Marketing Group'),
    ('data',       'Data / Science Group'),
    ('custom',     'Custom Group'),
]

ROLE_CHOICES = [
    ('owner',      'Owner'),
    ('admin',      'Admin'),
    ('maintainer', 'Maintainer'),
    ('developer',  'Developer'),
    ('viewer',     'Viewer'),
]

INVITE_STATUS_CHOICES = [
    ('pending',  'Pending'),
    ('accepted', 'Accepted'),
    ('declined', 'Declined'),
    ('expired',  'Expired'),
]

IMPORT_SOURCE_CHOICES = [
    ('github',    'GitHub Organizations'),
    ('gitlab',    'GitLab Groups'),
    ('bitbucket', 'Bitbucket Workspaces'),
    ('atonix',    'AtonixCorp Cloud'),
]


# ── Group ─────────────────────────────────────────────────────────────────────

class Group(TimeStampedModel):
    """Top-level Group entity — owns projects, pipelines, runners, etc."""

    id = models.CharField(max_length=40, primary_key=True, default=_uid_group, editable=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_groups')
    name = models.CharField(max_length=200)
    handle = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True, default='')
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='private')
    group_type = models.CharField(max_length=30, choices=GROUP_TYPE_CHOICES, default='developer')
    avatar_url = models.URLField(blank=True, default='')

    # Resource ownership toggles
    resources = models.JSONField(default=dict)
    # e.g. {"projects": True, "pipelines": True, "runners": False, ...}

    # Aggregate counters (denormalised for fast reads)
    member_count = models.PositiveIntegerField(default=1)
    project_count = models.PositiveIntegerField(default=0)
    pipeline_count = models.PositiveIntegerField(default=0)

    # Import metadata
    import_source = models.CharField(max_length=20, choices=IMPORT_SOURCE_CHOICES, blank=True, default='')
    import_external_id = models.CharField(max_length=255, blank=True, default='')

    class Meta:
        db_table = 'groups_group'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['owner', '-created_at']),
            models.Index(fields=['visibility']),
        ]

    def __str__(self):
        return f'{self.name} ({self.handle})'


# ── GroupMember ───────────────────────────────────────────────────────────────

class GroupMember(TimeStampedModel):
    """User membership inside a Group with a specific role."""

    id = models.CharField(max_length=40, primary_key=True, default=_uid_member, editable=False)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='memberships')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='group_memberships')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='developer')
    invited_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='group_invitations_sent',
    )

    class Meta:
        db_table = 'groups_member'
        unique_together = [('group', 'user')]
        indexes = [models.Index(fields=['group', 'role'])]

    def __str__(self):
        return f'{self.user.username} → {self.group.handle} ({self.role})'


# ── GroupInvitation ───────────────────────────────────────────────────────────

class GroupInvitation(TimeStampedModel):
    """Pending email invitation to join a Group."""

    id = models.CharField(max_length=40, primary_key=True, default=_uid_invite, editable=False)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='invitations')
    email = models.EmailField()
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='developer')
    status = models.CharField(max_length=20, choices=INVITE_STATUS_CHOICES, default='pending')
    invited_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='sent_group_invitations')
    expires_at = models.DateTimeField(null=True, blank=True)
    accepted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'groups_invitation'
        indexes = [
            models.Index(fields=['group', 'status']),
            models.Index(fields=['email', 'status']),
        ]

    def __str__(self):
        return f'Invite {self.email} → {self.group.handle}'


# ── GroupAccessToken ──────────────────────────────────────────────────────────

class GroupAccessToken(TimeStampedModel):
    """API access token scoped to a Group."""

    id = models.CharField(max_length=40, primary_key=True, default=_uid_token, editable=False)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='access_tokens')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    name = models.CharField(max_length=200)
    scopes = models.JSONField(default=list)
    token_prefix = models.CharField(max_length=30, blank=True, default='')
    token_hash = models.CharField(max_length=128, blank=True, default='')
    expires_at = models.DateTimeField(null=True, blank=True)
    last_used_at = models.DateTimeField(null=True, blank=True)
    revoked = models.BooleanField(default=False)

    class Meta:
        db_table = 'groups_access_token'
        indexes = [models.Index(fields=['group', 'revoked'])]

    def __str__(self):
        return f'{self.name} ({self.group.handle})'


# ── GroupAuditLog ─────────────────────────────────────────────────────────────

class GroupAuditLog(TimeStampedModel):
    """Immutable audit record for group-level actions."""

    ACTION_CHOICES = [
        ('group_created',   'Group Created'),
        ('group_updated',   'Group Updated'),
        ('group_deleted',   'Group Deleted'),
        ('member_added',    'Member Added'),
        ('member_removed',  'Member Removed'),
        ('member_updated',  'Member Role Updated'),
        ('invite_sent',     'Invitation Sent'),
        ('invite_accepted', 'Invitation Accepted'),
        ('token_created',   'Token Created'),
        ('token_revoked',   'Token Revoked'),
        ('settings_changed','Settings Changed'),
        ('resource_linked', 'Resource Linked'),
        ('resource_removed','Resource Removed'),
        ('config_indexed',  'Config File Indexed'),
    ]

    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='audit_logs')
    actor = models.CharField(max_length=150)
    action = models.CharField(max_length=30, choices=ACTION_CHOICES)
    target = models.CharField(max_length=255, blank=True, default='')
    detail = models.JSONField(default=dict)

    class Meta:
        db_table = 'groups_audit_log'
        ordering = ['-created_at']
        indexes = [models.Index(fields=['group', '-created_at'])]


# ── GroupResourceRegistry ─────────────────────────────────────────────────────

def _uid_registry():
    return f'reg-{uuid.uuid4().hex[:12]}'


class GroupResourceRegistry(TimeStampedModel):
    """
    Maps any platform resource (project, pipeline, environment, container,
    k8s cluster, secret, deployment…) to the owning Group.

    The resource is referenced by a (resource_type, resource_id) pair so
    this model imposes no FK coupling to any specific service model.
    """

    RESOURCE_TYPE_CHOICES = [
        ('project',     'Project'),
        ('pipeline',    'CI/CD Pipeline'),
        ('environment', 'Environment'),
        ('container',   'Container'),
        ('k8s_cluster', 'Kubernetes Cluster'),
        ('secret',      'Secret'),
        ('env_var',     'Environment Variable'),
        ('deployment',  'Deployment'),
        ('metric_stream', 'Metric Stream'),
        ('log_stream',  'Log Stream'),
        ('api_key',     'API Key / Token'),
        ('storage',     'Storage Bucket'),
        ('domain',      'Domain'),
    ]

    STATUS_CHOICES = [
        ('active',    'Active'),
        ('inactive',  'Inactive'),
        ('error',     'Error'),
        ('pending',   'Pending'),
    ]

    id = models.CharField(max_length=40, primary_key=True, default=_uid_registry, editable=False)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='resource_registry')
    resource_type = models.CharField(max_length=30, choices=RESOURCE_TYPE_CHOICES)
    resource_id = models.CharField(max_length=255, help_text='Service-specific resource identifier')
    resource_name = models.CharField(max_length=255)
    resource_slug = models.CharField(max_length=255, blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    region = models.CharField(max_length=64, blank=True, default='')
    environment = models.CharField(max_length=64, blank=True, default='',
        help_text='dev / staging / prod / (empty = all)')
    tags = models.JSONField(default=list, blank=True)
    metadata = models.JSONField(default=dict, blank=True,
        help_text='Resource-specific metadata (e.g. k8s version, pipeline status)')
    discovered_at = models.DateTimeField(null=True, blank=True,
        help_text='Set when auto-discovered; null when manually linked')
    linked_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='group_resource_links')

    class Meta:
        db_table = 'groups_resource_registry'
        unique_together = [('group', 'resource_type', 'resource_id')]
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['group', 'resource_type']),
            models.Index(fields=['group', 'status']),
        ]

    def __str__(self):
        return f'{self.resource_type}:{self.resource_name} → {self.group.handle}'


# ── GroupConfigRegistry ───────────────────────────────────────────────────────

def _uid_config():
    return f'cfg-{uuid.uuid4().hex[:12]}'


class GroupConfigRegistry(TimeStampedModel):
    """
    Registry of configuration files tracked by the Group.

    Covers: Dockerfiles, pipeline YAML, Terraform, Helm charts,
    Kubernetes manifests, .env templates, and custom config files.
    The Workspace Right Panel renders these as browsable config files.
    """

    FILE_TYPE_CHOICES = [
        ('dockerfile',     'Dockerfile'),
        ('pipeline_yaml',  'Pipeline YAML'),
        ('k8s_manifest',   'Kubernetes Manifest'),
        ('helm_chart',     'Helm Chart'),
        ('terraform',      'Terraform / HCL'),
        ('env_template',   '.env Template'),
        ('buildpack',      'Cloud Buildpack'),
        ('ansible',        'Ansible Playbook'),
        ('compose',        'Docker Compose'),
        ('config_generic', 'Generic Config'),
    ]

    id = models.CharField(max_length=40, primary_key=True, default=_uid_config, editable=False)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='config_registry')
    project_id = models.CharField(max_length=255, blank=True, default='',
        help_text='Owning project (optional; global group configs leave this blank)')
    file_type = models.CharField(max_length=30, choices=FILE_TYPE_CHOICES)
    file_name = models.CharField(max_length=255)
    file_path = models.CharField(max_length=1024, help_text='Repo-relative path, e.g. deploy/Dockerfile')
    repo_url = models.CharField(max_length=1024, blank=True, default='')
    branch = models.CharField(max_length=255, blank=True, default='main')
    content_preview = models.TextField(blank=True, default='',
        help_text='First ~4 KB of the file for quick preview without a full fetch')
    sha = models.CharField(max_length=64, blank=True, default='')
    last_indexed_at = models.DateTimeField(null=True, blank=True)
    tags = models.JSONField(default=list, blank=True)

    class Meta:
        db_table = 'groups_config_registry'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['group', 'file_type']),
            models.Index(fields=['group', 'project_id']),
        ]

    def __str__(self):
        return f'{self.file_name} ({self.file_type}) → {self.group.handle}'
