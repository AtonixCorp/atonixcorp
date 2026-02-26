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
