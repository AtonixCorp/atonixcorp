from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import Permission, Role, RoleAssignment, AuditLog, ServiceAccount


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'created_at')
    search_fields = ('code', 'name', 'description')
    list_filter = ('created_at',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'permission_count', 'is_active', 'created_at')
    search_fields = ('name', 'description')
    list_filter = ('is_active', 'created_at')
    filter_horizontal = ('permissions',)
    readonly_fields = ('created_at', 'updated_at')

    def permission_count(self, obj):
        return obj.permissions.count()
    permission_count.short_description = 'Permissions'


@admin.register(RoleAssignment)
class RoleAssignmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'is_active', 'expires_at', 'created_at')
    search_fields = ('user__username', 'user__email', 'role__name')
    list_filter = ('is_active', 'role', 'created_at', 'expires_at')
    autocomplete_fields = ('user', 'assigned_by')
    readonly_fields = ('created_at',)

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'role', 'assigned_by')


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'username', 'action', 'method', 'path_short', 'status_code', 'ip_address')
    search_fields = ('username', 'path', 'ip_address')
    list_filter = ('action', 'method', 'status_code', 'created_at')
    readonly_fields = ('user', 'username', 'session_key', 'method', 'path', 'query_params', 
                      'status_code', 'ip_address', 'user_agent', 'referer', 'action', 
                      'resource_type', 'resource_id', 'extra_data', 'created_at')
    ordering = ('-created_at',)
    actions = None  # Disable bulk actions for security
    date_hierarchy = 'created_at'

    def path_short(self, obj):
        """Show a shortened version of the path."""
        if len(obj.path) > 50:
            return obj.path[:47] + '...'
        return obj.path
    path_short.short_description = 'Path'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')

    def has_add_permission(self, request):
        return False  # Audit logs should not be manually created

    def has_delete_permission(self, request, obj=None):
        return False  # Audit logs should not be deleted

    def has_change_permission(self, request, obj=None):
        return False  # Audit logs should not be modified


@admin.register(ServiceAccount)
class ServiceAccountAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'last_used', 'created_at')
    search_fields = ('name', 'description')
    list_filter = ('is_active', 'created_at', 'last_used')
    filter_horizontal = ('roles',)
    readonly_fields = ('api_key', 'last_used', 'created_at')
    autocomplete_fields = ('created_by',)

    def save_model(self, request, obj, form, change):
        if not change:  # New object
            obj.created_by = request.user
            # Generate API key
            import secrets
            obj.api_key = secrets.token_urlsafe(32)
        super().save_model(request, obj, form, change)
