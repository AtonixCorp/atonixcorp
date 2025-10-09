"""
Professional Django Admin Configuration for AtonixCorp Platform.

This module customizes the Django admin interface to provide a
professional, branded experience for platform administrators.
"""

from django.contrib import admin
from django.contrib.admin import AdminSite
from django.utils.html import format_html
from django.urls import reverse
from django.http import HttpResponse
from django.template.response import TemplateResponse
from django.contrib.auth.models import User, Group
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin, GroupAdmin as BaseGroupAdmin


class AtonixCorpAdminSite(AdminSite):
    """
    Custom admin site with professional branding and enhanced functionality.
    """
    
    site_header = "AtonixCorp Platform Administration"
    site_title = "AtonixCorp Admin"
    index_title = "Platform Management Dashboard"
    site_url = "/"
    enable_nav_sidebar = True
    
    def get_app_list(self, request, app_label=None):
        """
        Return a sorted list of all the installed apps that have been
        registered in this site with enhanced descriptions.
        """
        app_dict = self._build_app_dict(request, app_label)
        
        # Custom app descriptions and icons
        app_enhancements = {
            'projects': {
                'name': 'Project Management',
                'description': 'Manage projects, milestones, and deliverables',
                'icon': '🚀'
            },
            'teams': {
                'name': 'Team Collaboration', 
                'description': 'Manage teams, members, and roles',
                'icon': '👥'
            },
            'focus_areas': {
                'name': 'Focus Areas',
                'description': 'Organize work by focus areas and categories',
                'icon': '🎯'
            },
            'resources': {
                'name': 'Resource Management',
                'description': 'Manage and share platform resources',
                'icon': '📚'
            },
            'contact': {
                'name': 'Contact Management',
                'description': 'Handle contact forms and communications',
                'icon': '📧'
            },
            'dashboard': {
                'name': 'Analytics Dashboard',
                'description': 'View platform analytics and metrics',
                'icon': '📊'
            },
            'security': {
                'name': 'Security Management',
                'description': 'Manage security settings and monitoring',
                'icon': '🔒'
            },
            'observability': {
                'name': 'System Observability',
                'description': 'Monitor system performance and health',
                'icon': '📡'
            },
            'auth': {
                'name': 'User Management',
                'description': 'Manage users, groups, and permissions',
                'icon': '👤'
            }
        }
        
        # Enhance app information
        for app in app_dict.values():
            app_label = app['app_label']
            if app_label in app_enhancements:
                enhancement = app_enhancements[app_label]
                app['name'] = f"{enhancement['icon']} {enhancement['name']}"
                app['description'] = enhancement['description']
                
        # Sort apps by importance
        app_order = ['auth', 'projects', 'teams', 'focus_areas', 'resources', 
                    'dashboard', 'contact', 'security', 'observability']
        
        def sort_key(app):
            app_label = app['app_label']
            try:
                return app_order.index(app_label)
            except ValueError:
                return len(app_order)  # Put unknown apps at the end
                
        app_list = sorted(app_dict.values(), key=sort_key)
        return app_list
    
    def index(self, request, extra_context=None):
        """
        Display the main admin index page with enhanced dashboard.
        """
        extra_context = extra_context or {}
        
        # Add system statistics
        try:
            from django.contrib.contenttypes.models import ContentType
            from django.apps import apps
            
            stats = {}
            for model in apps.get_models():
                if hasattr(model, 'objects'):
                    try:
                        count = model.objects.count()
                        app_label = model._meta.app_label
                        model_name = model._meta.verbose_name_plural.title()
                        
                        if app_label not in stats:
                            stats[app_label] = []
                        stats[app_label].append({
                            'name': model_name,
                            'count': count,
                            'url': reverse(f'admin:{model._meta.app_label}_{model._meta.model_name}_changelist')
                        })
                    except Exception:
                        continue  # Skip models that can't be counted
                        
            extra_context['system_stats'] = stats
            
        except Exception as e:
            extra_context['system_stats'] = {}
            
        # Add recent activity placeholder
        extra_context['recent_activity'] = [
            {'action': 'System startup', 'timestamp': 'Just now', 'user': 'System'},
            {'action': 'Admin interface loaded', 'timestamp': 'Just now', 'user': request.user.username if request.user.is_authenticated else 'Anonymous'},
        ]
        
        return super().index(request, extra_context)


class ProfessionalModelAdmin(admin.ModelAdmin):
    """
    Base admin class with professional styling and enhanced functionality.
    """
    
    # Enhanced list display
    list_per_page = 25
    list_max_show_all = 200
    preserve_filters = True
    save_on_top = True
    
    # Professional styling
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        # Add CSS classes for professional styling
        for field_name, field in form.base_fields.items():
            if hasattr(field.widget, 'attrs'):
                field.widget.attrs.update({'class': 'professional-field'})
        return form
    
    def changelist_view(self, request, extra_context=None):
        """Enhanced changelist view with additional context."""
        extra_context = extra_context or {}
        extra_context['model_name'] = self.model._meta.verbose_name_plural.title()
        extra_context['app_name'] = self.model._meta.app_label.title()
        return super().changelist_view(request, extra_context)
    
    def has_module_permission(self, request):
        """Enhanced permission checking."""
        return super().has_module_permission(request)


class EnhancedUserAdmin(BaseUserAdmin):
    """
    Enhanced User admin with additional fields and professional styling.
    """
    
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_active', 
                    'is_staff', 'last_login', 'date_joined')
    list_filter = ('is_active', 'is_staff', 'is_superuser', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    
    fieldsets = (
        ('User Information', {
            'fields': ('username', 'password')
        }),
        ('Personal Info', {
            'fields': ('first_name', 'last_name', 'email')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
            'classes': ('collapse',)
        }),
        ('Important Dates', {
            'fields': ('last_login', 'date_joined'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """Optimized queryset for better performance."""
        return super().get_queryset(request).select_related()


class EnhancedGroupAdmin(BaseGroupAdmin):
    """
    Enhanced Group admin with professional styling.
    """
    
    list_display = ('name', 'user_count')
    search_fields = ('name',)
    
    def user_count(self, obj):
        """Display the number of users in this group."""
        return obj.user_set.count()
    user_count.short_description = 'Users'
    
    def get_queryset(self, request):
        """Optimized queryset."""
        return super().get_queryset(request).prefetch_related('user_set')


# Create custom admin site
admin_site = AtonixCorpAdminSite(name='atonixcorp_admin')

# Register enhanced User and Group admins
admin_site.register(User, EnhancedUserAdmin)
admin_site.register(Group, EnhancedGroupAdmin)

# Set as default admin site
admin.site = admin_site
admin.sites.site = admin_site