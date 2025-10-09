from django.contrib import admin
from .models import ContactPerson, ContactMessage, OfficeLocation


@admin.register(ContactPerson)
class ContactPersonAdmin(admin.ModelAdmin):
    list_display = ['name', 'title', 'department', 'email', 'is_primary', 'is_active']
    list_filter = ['department', 'is_primary', 'is_active']
    search_fields = ['name', 'title', 'email', 'bio']
    list_editable = ['is_primary', 'is_active']
    ordering = ['-is_primary', 'order', 'name']


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'subject', 'message_type', 'priority', 'status', 'created_at']
    list_filter = ['message_type', 'priority', 'status', 'created_at']
    search_fields = ['name', 'email', 'subject', 'message']
    list_editable = ['status', 'priority']
    readonly_fields = ['created_at']
    ordering = ['-created_at']


@admin.register(OfficeLocation)
class OfficeLocationAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'country', 'is_headquarters', 'is_active']
    list_filter = ['country', 'is_headquarters', 'is_active']
    search_fields = ['name', 'city', 'address_line_1']
    list_editable = ['is_headquarters', 'is_active']
    ordering = ['-is_headquarters', 'country', 'city']
