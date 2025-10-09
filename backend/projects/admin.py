from django.contrib import admin
from .models import Project, ProjectFeature, ProjectImage


class ProjectFeatureInline(admin.TabularInline):
    model = ProjectFeature
    extra = 1


class ProjectImageInline(admin.TabularInline):
    model = ProjectImage
    extra = 1


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'status', 'is_featured', 'created_at']
    list_filter = ['status', 'is_featured', 'created_at']
    search_fields = ['name', 'overview', 'description']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProjectFeatureInline, ProjectImageInline]
    list_editable = ['is_featured', 'status']
    ordering = ['-is_featured', '-created_at']


@admin.register(ProjectFeature)
class ProjectFeatureAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'order']
    list_filter = ['project']
    search_fields = ['title', 'description']
    ordering = ['project', 'order']


@admin.register(ProjectImage)
class ProjectImageAdmin(admin.ModelAdmin):
    list_display = ['project', 'caption', 'is_featured', 'order']
    list_filter = ['project', 'is_featured']
    list_editable = ['is_featured', 'order']
    ordering = ['project', 'order']
