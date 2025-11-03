from django.contrib import admin
from .models import ActivityLog


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'user', 'event_type', 'event_name', 'ip_address')
    list_filter = ('event_type', 'created_at')
    search_fields = ('user__username', 'event_name', 'payload', 'ip_address')
    readonly_fields = ('created_at',)
