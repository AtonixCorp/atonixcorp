from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()


class Permission(models.Model):
    """A fine-grained permission (verb:resource or similar)."""
    code = models.CharField(max_length=150, unique=True, 
                          help_text="Permission code like 'read:projects' or 'admin:all'")
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['code']

    def __str__(self):
        return self.code


class Role(models.Model):
    """A role composed of permissions."""
    name = models.CharField(max_length=150, unique=True)
    description = models.TextField(blank=True)
    permissions = models.ManyToManyField(Permission, blank=True, related_name='roles')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

    def has_permission(self, permission_code):
        """Check if this role has a specific permission."""
        return self.permissions.filter(code=permission_code).exists()


class RoleAssignment(models.Model):
    """Assign a role to a user or service account."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='role_assignments')
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='assignments')
    assigned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, 
                                  related_name='role_assignments_made')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True, 
                                    help_text="Optional expiration date for temporary roles")

    class Meta:
        unique_together = ('user', 'role')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user} -> {self.role}"

    @property
    def is_expired(self):
        """Check if this role assignment has expired."""
        if not self.expires_at:
            return False
        from django.utils import timezone
        return timezone.now() > self.expires_at


class AuditLog(models.Model):
    """Records actions taken by principals for audit/compliance."""
    ACTION_CHOICES = [
        ('CREATE', 'Create'),
        ('READ', 'Read'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
        ('LOGIN', 'Login'),
        ('LOGOUT', 'Logout'),
        ('ACCESS_DENIED', 'Access Denied'),
        ('OTHER', 'Other'),
    ]

    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    username = models.CharField(max_length=255, blank=True)
    session_key = models.CharField(max_length=40, blank=True)
    
    # Request details
    method = models.CharField(max_length=10)
    path = models.CharField(max_length=2000)
    query_params = models.TextField(blank=True)
    status_code = models.SmallIntegerField(null=True, blank=True)
    
    # Client details
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    referer = models.URLField(blank=True)
    
    # Action details
    action = models.CharField(max_length=20, choices=ACTION_CHOICES, default='OTHER')
    resource_type = models.CharField(max_length=100, blank=True)
    resource_id = models.CharField(max_length=100, blank=True)
    
    # Additional context
    extra_data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['action', '-created_at']),
            models.Index(fields=['ip_address', '-created_at']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.created_at.isoformat()} {self.username or 'anonymous'} {self.method} {self.path} -> {self.status_code}"


class ServiceAccount(models.Model):
    """Service accounts for API access and automation."""
    name = models.CharField(max_length=150, unique=True)
    description = models.TextField(blank=True)
    api_key = models.CharField(max_length=255, unique=True)
    roles = models.ManyToManyField(Role, blank=True, related_name='service_accounts')
    is_active = models.BooleanField(default=True)
    last_used = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

    def has_permission(self, permission_code):
        """Check if this service account has a specific permission."""
        return self.roles.filter(
            permissions__code=permission_code,
            is_active=True
        ).exists()
