from django.contrib import admin
from .models import ScheduleItem


@admin.register(ScheduleItem)
class ScheduleItemAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'start', 'end', 'all_day', 'status', 'reminder_at', 'reminder_sent')
    list_filter = ('status', 'all_day', 'reminder_sent')
    search_fields = ('title', 'description', 'owner__username', 'owner__email')
