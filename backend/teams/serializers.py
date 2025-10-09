from rest_framework import serializers
from .models import Team, TeamMember, TeamSkill


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


class TeamSerializer(serializers.ModelSerializer):
    members = TeamMemberSerializer(many=True, read_only=True)
    skills = TeamSkillSerializer(many=True, read_only=True)
    
    class Meta:
        model = Team
        fields = [
            'id', 'name', 'slug', 'mission', 'description', 'image',
            'color_theme', 'is_active', 'created_at', 'updated_at',
            'members', 'skills'
        ]


class TeamListSerializer(serializers.ModelSerializer):
    """Simplified serializer for team lists"""
    member_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Team
        fields = [
            'id', 'name', 'slug', 'mission', 'image', 'color_theme',
            'is_active', 'member_count'
        ]
    
    def get_member_count(self, obj):
        return obj.members.count()