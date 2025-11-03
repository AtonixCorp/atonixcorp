from django.contrib import admin
from .models import Enterprise, EnterpriseTeam, EnterpriseGroup, MigrationRun


@admin.register(Enterprise)
class EnterpriseAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'slug', 'website', 'created_at')
    search_fields = ('name', 'slug')


@admin.register(EnterpriseTeam)
class EnterpriseTeamAdmin(admin.ModelAdmin):
    list_display = ('id', 'enterprise', 'team', 'role', 'added_at')
    search_fields = ('enterprise__name', 'team__name')


@admin.register(EnterpriseGroup)
class EnterpriseGroupAdmin(admin.ModelAdmin):
    list_display = ('id', 'enterprise', 'name', 'created_at')
    search_fields = ('enterprise__name', 'name')


@admin.register(MigrationRun)
class MigrationRunAdmin(admin.ModelAdmin):
    list_display = ('id', 'enterprise', 'run_id', 'status', 'started_at', 'finished_at')
    search_fields = ('enterprise__name', 'run_id')
