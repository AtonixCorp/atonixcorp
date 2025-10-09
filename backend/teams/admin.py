from django.contrib import admin
from .models import Team, TeamMember, TeamSkill


class TeamMemberInline(admin.TabularInline):
    model = TeamMember
    extra = 1


class TeamSkillInline(admin.TabularInline):
    model = TeamSkill
    extra = 1


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'mission', 'description']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [TeamMemberInline, TeamSkillInline]
    list_editable = ['is_active']


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ['name', 'team', 'role', 'is_lead', 'join_date']
    list_filter = ['team', 'is_lead', 'join_date']
    search_fields = ['name', 'role', 'bio']
    list_editable = ['is_lead']
    ordering = ['team', '-is_lead', 'order']


@admin.register(TeamSkill)
class TeamSkillAdmin(admin.ModelAdmin):
    list_display = ['name', 'team', 'proficiency_level']
    list_filter = ['team', 'proficiency_level']
    search_fields = ['name', 'description']
    ordering = ['team', 'name']
