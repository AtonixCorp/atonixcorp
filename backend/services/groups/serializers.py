from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Group, GroupMember, GroupInvitation, GroupAccessToken, GroupAuditLog


# ── User summary ──────────────────────────────────────────────────────────────

class UserSummarySerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'display_name']

    def get_display_name(self, obj):
        full = f'{obj.first_name} {obj.last_name}'.strip()
        return full or obj.username


# ── Group ─────────────────────────────────────────────────────────────────────

class GroupSerializer(serializers.ModelSerializer):
    owner = UserSummarySerializer(read_only=True)
    my_role = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = [
            'id', 'name', 'handle', 'description',
            'visibility', 'group_type', 'avatar_url',
            'resources',
            'member_count', 'project_count', 'pipeline_count',
            'import_source', 'import_external_id',
            'owner', 'my_role',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'owner', 'member_count', 'project_count', 'pipeline_count', 'created_at', 'updated_at']

    def get_my_role(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        if obj.owner_id == request.user.id:
            return 'owner'
        membership = obj.memberships.filter(user=request.user).first()
        return membership.role if membership else None


class GroupCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = [
            'name', 'handle', 'description',
            'visibility', 'group_type', 'avatar_url',
            'resources',
        ]

    def create(self, validated_data):
        request = self.context['request']
        group = Group.objects.create(owner=request.user, **validated_data)
        # Creator becomes the owner member
        GroupMember.objects.create(
            group=group,
            user=request.user,
            role='owner',
        )
        return group


class GroupUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = [
            'name', 'description', 'visibility',
            'group_type', 'avatar_url', 'resources',
        ]


# ── GroupMember ───────────────────────────────────────────────────────────────

class GroupMemberSerializer(serializers.ModelSerializer):
    user = UserSummarySerializer(read_only=True)
    invited_by = UserSummarySerializer(read_only=True)

    class Meta:
        model = GroupMember
        fields = ['id', 'group', 'user', 'role', 'invited_by', 'created_at']
        read_only_fields = ['id', 'group', 'user', 'created_at']


class GroupMemberUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupMember
        fields = ['role']


# ── GroupInvitation ───────────────────────────────────────────────────────────

class GroupInvitationSerializer(serializers.ModelSerializer):
    invited_by = UserSummarySerializer(read_only=True)

    class Meta:
        model = GroupInvitation
        fields = [
            'id', 'group', 'email', 'role', 'status',
            'invited_by', 'expires_at', 'accepted_at',
            'created_at',
        ]
        read_only_fields = ['id', 'group', 'status', 'invited_by', 'accepted_at', 'created_at']



class GroupInviteCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=['admin', 'maintainer', 'developer', 'viewer'])


# ── GroupAccessToken ──────────────────────────────────────────────────────────

class GroupAccessTokenSerializer(serializers.ModelSerializer):
    created_by = UserSummarySerializer(read_only=True)

    class Meta:
        model = GroupAccessToken
        fields = [
            'id', 'name', 'scopes', 'token_prefix',
            'expires_at', 'last_used_at', 'revoked',
            'created_by', 'created_at',
        ]
        read_only_fields = ['id', 'token_prefix', 'last_used_at', 'revoked', 'created_by', 'created_at']


# ── GroupAuditLog ─────────────────────────────────────────────────────────────

class GroupAuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupAuditLog
        fields = ['id', 'actor', 'action', 'target', 'detail', 'created_at']
        read_only_fields = fields
