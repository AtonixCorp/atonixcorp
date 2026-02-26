from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Group, GroupMember, GroupInvitation, GroupAccessToken, GroupAuditLog
from .serializers import (
    GroupSerializer,
    GroupCreateSerializer,
    GroupUpdateSerializer,
    GroupMemberSerializer,
    GroupMemberUpdateSerializer,
    GroupInvitationSerializer,
    GroupInviteCreateSerializer,
    GroupAccessTokenSerializer,
    GroupAuditLogSerializer,
)


def _audit(group, actor, action, target='', detail=None):
    GroupAuditLog.objects.create(
        group=group,
        actor=actor,
        action=action,
        target=target,
        detail=detail or {},
    )


# ── GroupViewSet ──────────────────────────────────────────────────────────────

class GroupViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Return groups where user is owner or member
        member_group_ids = GroupMember.objects.filter(user=user).values_list('group_id', flat=True)
        return Group.objects.filter(
            id__in=list(member_group_ids)
        ).order_by('-created_at').select_related('owner').prefetch_related('memberships')

    def get_serializer_class(self):
        if self.action == 'create':
            return GroupCreateSerializer
        if self.action in ('update', 'partial_update'):
            return GroupUpdateSerializer
        return GroupSerializer

    def perform_create(self, serializer):
        group = serializer.save()
        _audit(group, self.request.user.username, 'group_created', group.name)

    def perform_update(self, serializer):
        group = serializer.save()
        _audit(group, self.request.user.username, 'group_updated', group.name)

    def perform_destroy(self, instance):
        _audit(instance, self.request.user.username, 'group_deleted', instance.name)
        instance.delete()

    # ── /groups/{id}/members/ ─────────────────────────────────────────────────

    @action(detail=True, methods=['get'], url_path='members')
    def members(self, request, pk=None):
        group = self.get_object()
        members = group.memberships.select_related('user', 'invited_by').all()
        serializer = GroupMemberSerializer(members, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='members/add')
    def add_member(self, request, pk=None):
        group = self.get_object()
        user_id = request.data.get('user_id')
        role = request.data.get('role', 'developer')
        from django.contrib.auth.models import User as DjangoUser
        try:
            user = DjangoUser.objects.get(pk=user_id)
        except DjangoUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        member, created = GroupMember.objects.get_or_create(
            group=group, user=user,
            defaults={'role': role, 'invited_by': request.user},
        )
        if not created:
            return Response({'error': 'Already a member'}, status=400)
        group.member_count = group.memberships.count()
        group.save(update_fields=['member_count'])
        _audit(group, request.user.username, 'member_added', user.username, {'role': role})
        return Response(GroupMemberSerializer(member, context={'request': request}).data, status=201)

    @action(detail=True, methods=['delete'], url_path='members/(?P<member_id>[^/.]+)')
    def remove_member(self, request, pk=None, member_id=None):
        group = self.get_object()
        try:
            member = group.memberships.get(pk=member_id)
        except GroupMember.DoesNotExist:
            return Response({'error': 'Member not found'}, status=404)
        if member.role == 'owner':
            return Response({'error': 'Cannot remove the group owner'}, status=400)
        username = member.user.username
        member.delete()
        group.member_count = group.memberships.count()
        group.save(update_fields=['member_count'])
        _audit(group, request.user.username, 'member_removed', username)
        return Response(status=204)

    @action(detail=True, methods=['patch'], url_path='members/(?P<member_id>[^/.]+)/role')
    def update_member_role(self, request, pk=None, member_id=None):
        group = self.get_object()
        try:
            member = group.memberships.get(pk=member_id)
        except GroupMember.DoesNotExist:
            return Response({'error': 'Member not found'}, status=404)
        if member.role == 'owner':
            return Response({'error': 'Use transfer_ownership to change the owner'}, status=400)
        serializer = GroupMemberUpdateSerializer(member, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        _audit(group, request.user.username, 'member_updated', member.user.username, {'role': serializer.data['role']})
        return Response(GroupMemberSerializer(member, context={'request': request}).data)

    # ── /groups/{id}/leave/ ───────────────────────────────────────────────────

    @action(detail=True, methods=['post'], url_path='leave')
    def leave(self, request, pk=None):
        group = self.get_object()
        try:
            member = group.memberships.get(user=request.user)
        except GroupMember.DoesNotExist:
            return Response({'error': 'Not a member'}, status=400)
        if member.role == 'owner':
            return Response({'error': 'Owner must transfer ownership before leaving'}, status=400)
        member.delete()
        group.member_count = group.memberships.count()
        group.save(update_fields=['member_count'])
        return Response(status=204)

    # ── /groups/{id}/transfer/ ────────────────────────────────────────────────

    @action(detail=True, methods=['post'], url_path='transfer')
    def transfer_ownership(self, request, pk=None):
        group = self.get_object()
        if group.owner != request.user:
            return Response({'error': 'Only the current owner can transfer ownership'}, status=403)
        new_owner_id = request.data.get('user_id')
        from django.contrib.auth.models import User as DjangoUser
        try:
            new_owner = DjangoUser.objects.get(pk=new_owner_id)
        except DjangoUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        GroupMember.objects.filter(group=group, role='owner').update(role='maintainer')
        GroupMember.objects.update_or_create(
            group=group, user=new_owner,
            defaults={'role': 'owner'},
        )
        group.owner = new_owner
        group.save(update_fields=['owner'])
        _audit(group, request.user.username, 'member_updated', new_owner.username, {'new_role': 'owner', 'transfer': True})
        return Response({'status': 'ownership transferred'})

    # ── /groups/{id}/invite/ ──────────────────────────────────────────────────

    @action(detail=True, methods=['get', 'post'], url_path='invite')
    def invite(self, request, pk=None):
        group = self.get_object()
        if request.method == 'GET':
            invites = group.invitations.filter(status='pending').order_by('-created_at')
            return Response(GroupInvitationSerializer(invites, many=True, context={'request': request}).data)

        serializer = GroupInviteCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        role = serializer.validated_data['role']

        invite, created = GroupInvitation.objects.get_or_create(
            group=group, email=email, status='pending',
            defaults={'role': role, 'invited_by': request.user},
        )
        if not created:
            return Response({'error': 'An active invite already exists for this email'}, status=400)
        _audit(group, request.user.username, 'invite_sent', email, {'role': role})
        return Response(GroupInvitationSerializer(invite, context={'request': request}).data, status=201)

    # ── /groups/{id}/invitations/{inv_id}/accept/ ─────────────────────────────

    @action(detail=True, methods=['post'], url_path='invitations/(?P<invite_id>[^/.]+)/accept')
    def accept_invite(self, request, pk=None, invite_id=None):
        group = self.get_object()
        try:
            invite = group.invitations.get(pk=invite_id, status='pending')
        except GroupInvitation.DoesNotExist:
            return Response({'error': 'Invitation not found or already actioned'}, status=404)
        if invite.expires_at and invite.expires_at < timezone.now():
            invite.status = 'expired'
            invite.save()
            return Response({'error': 'Invitation has expired'}, status=400)
        invite.status = 'accepted'
        invite.accepted_at = timezone.now()
        invite.save()
        member, _ = GroupMember.objects.get_or_create(
            group=group, user=request.user,
            defaults={'role': invite.role, 'invited_by': invite.invited_by},
        )
        group.member_count = group.memberships.count()
        group.save(update_fields=['member_count'])
        _audit(group, request.user.username, 'invite_accepted', invite.email)
        return Response(GroupMemberSerializer(member, context={'request': request}).data)

    # ── /groups/{id}/tokens/ ──────────────────────────────────────────────────

    @action(detail=True, methods=['get', 'post'], url_path='tokens')
    def tokens(self, request, pk=None):
        group = self.get_object()
        if request.method == 'GET':
            tokens = group.access_tokens.filter(revoked=False).order_by('-created_at')
            return Response(GroupAccessTokenSerializer(tokens, many=True, context={'request': request}).data)

        serializer = GroupAccessTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = GroupAccessToken.objects.create(
            group=group,
            created_by=request.user,
            **serializer.validated_data,
        )
        _audit(group, request.user.username, 'token_created', token.name)
        return Response(GroupAccessTokenSerializer(token, context={'request': request}).data, status=201)

    @action(detail=True, methods=['delete'], url_path='tokens/(?P<token_id>[^/.]+)')
    def revoke_token(self, request, pk=None, token_id=None):
        group = self.get_object()
        try:
            token = group.access_tokens.get(pk=token_id)
        except GroupAccessToken.DoesNotExist:
            return Response({'error': 'Token not found'}, status=404)
        token.revoked = True
        token.save()
        _audit(group, request.user.username, 'token_revoked', token.name)
        return Response(status=204)

    # ── /groups/{id}/audit/ ───────────────────────────────────────────────────

    @action(detail=True, methods=['get'], url_path='audit')
    def audit_logs(self, request, pk=None):
        group = self.get_object()
        logs = group.audit_logs.order_by('-created_at')[:200]
        return Response(GroupAuditLogSerializer(logs, many=True).data)
