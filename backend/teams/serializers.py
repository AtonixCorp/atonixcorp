from rest_framework import serializers
from django.contrib.auth.models import User
from django.utils import timezone
from .models import Team, TeamMember, TeamSkill, TeamMembership, TeamInvitation


class TeamSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamSkill
        fields = ['id', 'name', 'description', 'proficiency_level']


class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMember
        fields = [
            'id', 'name', 'role', 'bio', 'avatar', 'email',
            'linkedin_url', 'github_url', 'is_lead', 'join_date', 'order'
        ]


class TeamMembershipSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    team_name = serializers.CharField(source='team.name', read_only=True)
    team_slug = serializers.CharField(source='team.slug', read_only=True)

    class Meta:
        model = TeamMembership
        fields = [
            'id', 'user', 'user_username', 'user_email', 'team', 'team_name', 'team_slug',
            'membership_type', 'joined_at', 'is_active', 'last_login', 'role', 'bio'
        ]
        read_only_fields = ['joined_at', 'last_login']


class TeamInvitationSerializer(serializers.ModelSerializer):
    invited_by_username = serializers.CharField(source='invited_by.username', read_only=True)

    class Meta:
        model = TeamInvitation
        fields = [
            'id', 'team', 'invited_by', 'invited_by_username', 'email',
            'membership_type', 'status', 'invited_at', 'expires_at',
            'accepted_at', 'token'
        ]
        read_only_fields = ['invited_at', 'accepted_at', 'token']


class TeamSerializer(serializers.ModelSerializer):
    members = TeamMemberSerializer(many=True, read_only=True)
    skills = TeamSkillSerializer(many=True, read_only=True)
    membership_count = serializers.SerializerMethodField()

    class Meta:
        model = Team
        fields = [
            'id', 'name', 'slug', 'mission', 'description', 'image',
            'color_theme', 'is_active', 'created_at', 'updated_at',
            'members', 'skills', 'membership_count'
        ]

    def get_membership_count(self, obj):
        return obj.memberships.filter(is_active=True).count()


class TeamListSerializer(serializers.ModelSerializer):
    """Simplified serializer for team lists"""
    member_count = serializers.SerializerMethodField()
    membership_count = serializers.SerializerMethodField()

    class Meta:
        model = Team
        fields = [
            'id', 'name', 'slug', 'mission', 'image', 'color_theme',
            'is_active', 'member_count', 'membership_count'
        ]

    def get_member_count(self, obj):
        return obj.members.count()

    def get_membership_count(self, obj):
        return obj.memberships.filter(is_active=True).count()


class UserTeamMembershipSerializer(serializers.ModelSerializer):
    """Serializer for user's team memberships"""
    team_name = serializers.CharField(source='team.name', read_only=True)
    team_slug = serializers.CharField(source='team.slug', read_only=True)
    team_mission = serializers.CharField(source='team.mission', read_only=True)
    team_color_theme = serializers.CharField(source='team.color_theme', read_only=True)

    class Meta:
        model = TeamMembership
        fields = [
            'id', 'team', 'team_name', 'team_slug', 'team_mission', 'team_color_theme',
            'membership_type', 'joined_at', 'is_active', 'last_login', 'role', 'bio'
        ]
        read_only_fields = ['joined_at', 'last_login']


class TeamJoinSerializer(serializers.Serializer):
    """Serializer for joining a team"""
    membership_type = serializers.ChoiceField(
        choices=TeamMembership.MEMBERSHIP_TYPES,
        default='free'
    )
    role = serializers.CharField(max_length=200, required=False)
    bio = serializers.CharField(required=False)


class TeamLoginSerializer(serializers.Serializer):
    """Serializer for team-specific login"""
    username = serializers.CharField()
    password = serializers.CharField()
    team_slug = serializers.CharField()
