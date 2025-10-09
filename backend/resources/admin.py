from django.contrib import admin
from .models import ResourceCategory, Resource, CommunityLink, FAQ


@admin.register(ResourceCategory)
class ResourceCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'order']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ['order']
    ordering = ['order', 'name']


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'resource_type', 'is_featured', 'is_public', 'created_at']
    list_filter = ['category', 'resource_type', 'is_featured', 'is_public', 'created_at']
    search_fields = ['title', 'description', 'content']
    prepopulated_fields = {'slug': ('title',)}
    list_editable = ['is_featured', 'is_public']
    ordering = ['-is_featured', '-created_at']


@admin.register(CommunityLink)
class CommunityLinkAdmin(admin.ModelAdmin):
    list_display = ['platform', 'name', 'is_active', 'order']
    list_filter = ['platform', 'is_active']
    search_fields = ['platform', 'name', 'description']
    list_editable = ['is_active', 'order']
    ordering = ['order', 'platform']


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ['question', 'category', 'is_featured', 'order']
    list_filter = ['category', 'is_featured', 'created_at']
    search_fields = ['question', 'answer', 'category']
    list_editable = ['is_featured', 'order']
    ordering = ['-is_featured', 'order']
