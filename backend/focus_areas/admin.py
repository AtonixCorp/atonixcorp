from django.contrib import admin
from .models import FocusArea, FocusAreaTechnology, FocusAreaSolution


class FocusAreaTechnologyInline(admin.TabularInline):
    model = FocusAreaTechnology
    extra = 1


class FocusAreaSolutionInline(admin.TabularInline):
    model = FocusAreaSolution
    extra = 1


@admin.register(FocusArea)
class FocusAreaAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'order', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [FocusAreaTechnologyInline, FocusAreaSolutionInline]
    list_editable = ['is_active', 'order']
    ordering = ['order', 'name']


@admin.register(FocusAreaTechnology)
class FocusAreaTechnologyAdmin(admin.ModelAdmin):
    list_display = ['name', 'focus_area']
    list_filter = ['focus_area']
    search_fields = ['name', 'description']
    ordering = ['focus_area', 'name']


@admin.register(FocusAreaSolution)
class FocusAreaSolutionAdmin(admin.ModelAdmin):
    list_display = ['title', 'focus_area', 'order']
    list_filter = ['focus_area']
    search_fields = ['title', 'description']
    list_editable = ['order']
    ordering = ['focus_area', 'order']
