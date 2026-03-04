# AtonixCorp – Enterprise Module ViewSets
# All views resolve the Organization from the URL slug and gate on ownership / membership.

import logging
from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet, ModelViewSet
from rest_framework.mixins import (
    ListModelMixin, CreateModelMixin,
    RetrieveModelMixin, UpdateModelMixin, DestroyModelMixin,
)

from .models import (
    Organization, OrganizationMember,
    Department, OrgTeam, OrgGroup,
    EnterpriseSendDomain, EmailSenderIdentity, EnterpriseEmailTemplate, EmailLog,
    OrgDomain, OrgDomainRecord,
    BrandingProfile, BrandAsset,
    EnterprisePlan, Subscription, EnterpriseInvoice,
    EnterpriseAuditLog,
)
from .serializers import (
    OrganizationSerializer, OrganizationCreateSerializer,
    OrganizationMemberSerializer, InviteMemberSerializer, UpdateMemberRoleSerializer,
    DepartmentSerializer, DepartmentCreateSerializer,
    OrgTeamSerializer, OrgTeamCreateSerializer,
    OrgGroupSerializer, OrgGroupCreateSerializer,
    EnterpriseSendDomainSerializer, CreateSendDomainSerializer,
    EmailSenderIdentitySerializer, CreateSenderIdentitySerializer,
    EnterpriseEmailTemplateSerializer,
    EmailLogSerializer,
    OrgDomainSerializer, OrgDomainRecordSerializer, CreateOrgDomainSerializer,
    BrandingProfileSerializer, BrandAssetSerializer,
    EnterprisePlanSerializer, SubscriptionSerializer, EnterpriseInvoiceSerializer,
    EnterpriseAuditLogSerializer,
)

logger = logging.getLogger(__name__)


# ── Shared helpers ────────────────────────────────────────────────────────────

def _get_org(request, org_id: str) -> Organization:
    """Resolve org by ID or slug; assert requester is owner or member."""
    try:
        org = Organization.objects.get(pk=org_id)
    except Organization.DoesNotExist:
        org = get_object_or_404(Organization, slug=org_id)
    # Gate: must be owner or active member
    if org.owner != request.user:
        if not org.members.filter(user=request.user,
                                  status=OrganizationMember.Status.ACTIVE).exists():
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('You are not a member of this organization.')
    return org


def _log_action(org: Organization, request, action: str,
                target_type: str = '', target_id: str = '',
                target_label: str = '', metadata: dict | None = None):
    """Write an immutable audit log entry."""
    actor = None
    try:
        actor = org.members.get(user=request.user)
    except OrganizationMember.DoesNotExist:
        pass
    x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    ip = x_forwarded.split(',')[0] if x_forwarded else request.META.get('REMOTE_ADDR')
    EnterpriseAuditLog.objects.create(
        organization=org,
        actor_member=actor,
        actor_email=request.user.email,
        action=action,
        target_type=target_type,
        target_id=target_id,
        target_label=target_label,
        metadata=metadata or {},
        ip_address=ip,
    )


# ── 1. Organization ───────────────────────────────────────────────────────────

class OrganizationViewSet(
    CreateModelMixin, RetrieveModelMixin, UpdateModelMixin,
    DestroyModelMixin, ListModelMixin, GenericViewSet,
):
    """
    GET    /api/enterprise/organizations/          – list orgs you own or are a member of
    POST   /api/enterprise/organizations/          – create a new org
    GET    /api/enterprise/organizations/:id/      – detail
    PATCH  /api/enterprise/organizations/:id/      – update (owner only)
    DELETE /api/enterprise/organizations/:id/      – delete (owner only)
    """
    permission_classes = [IsAuthenticated]
    pagination_class    = None  # a user has few orgs; no need for pagination

    def get_serializer_class(self):
        if self.action == 'create':
            return OrganizationCreateSerializer
        return OrganizationSerializer

    def get_queryset(self):
        user = self.request.user
        owned = Organization.objects.filter(owner=user)
        member_of = Organization.objects.filter(
            members__user=user,
            members__status=OrganizationMember.Status.ACTIVE,
        )
        return (owned | member_of).distinct().order_by('-created_at')

    def create(self, request, *args, **kwargs):
        ser = OrganizationCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        org = Organization.objects.create(owner=request.user, **ser.validated_data)
        # Auto-create OWNER membership
        OrganizationMember.objects.create(
            organization=org,
            user=request.user,
            email=request.user.email,
            name=request.user.get_full_name() or request.user.username,
            role=OrganizationMember.Role.OWNER,
            status=OrganizationMember.Status.ACTIVE,
            joined_at=timezone.now(),
        )
        # Auto-create branding profile
        BrandingProfile.objects.create(organization=org)
        # Seed default hierarchy: General → Core Team → Default Group
        dept = Department.objects.create(organization=org, name='General')
        team = OrgTeam.objects.create(department=dept, name='Core Team')
        OrgGroup.objects.create(team=team, name='Default Group')
        _log_action(org, request, 'ORGANIZATION_CREATED',
                    target_type='ORGANIZATION', target_id=org.id, target_label=org.name)
        return Response(OrganizationSerializer(org).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        org = self.get_object()
        if org.owner != request.user:
            return Response({'error': 'Only the owner can update org settings.'}, status=403)
        partial = kwargs.pop('partial', True)
        ser = OrganizationSerializer(org, data=request.data, partial=partial)
        ser.is_valid(raise_exception=True)
        ser.save()
        _log_action(org, request, 'ORGANIZATION_UPDATED',
                    target_type='ORGANIZATION', target_id=org.id, target_label=org.name)
        return Response(ser.data)

    def destroy(self, request, *args, **kwargs):
        org = self.get_object()
        if org.owner != request.user:
            return Response({'error': 'Only the owner can delete this organization.'}, status=403)
        org_name = org.name
        org_id   = org.id
        # Write audit log before deletion (cascade will remove the org's audit rows)
        _log_action(org, request, 'ORGANIZATION_DELETED',
                    target_type='ORGANIZATION', target_id=org_id, target_label=org_name)
        org.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ── 2. Organization Members ───────────────────────────────────────────────────

class OrganizationMemberViewSet(
    ListModelMixin, RetrieveModelMixin, UpdateModelMixin,
    DestroyModelMixin, GenericViewSet,
):
    """
    GET  /api/enterprise/organizations/:orgId/members/       – list
    POST /api/enterprise/organizations/:orgId/members/invite/ – invite
    PATCH /api/enterprise/organizations/:orgId/members/:id/   – update role
    DELETE /api/enterprise/organizations/:orgId/members/:id/  – remove
    """
    permission_classes = [IsAuthenticated]
    pagination_class   = None
    serializer_class   = OrganizationMemberSerializer

    def _org(self):
        return _get_org(self.request, self.kwargs['org_pk'])

    def get_queryset(self):
        org = self._org()
        return org.members.select_related('user').order_by('name', 'email')

    @action(detail=False, methods=['post'], url_path='invite')
    def invite(self, request, org_pk=None):
        org = _get_org(request, org_pk)
        ser = InviteMemberSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        email = ser.validated_data['email']
        name  = ser.validated_data['name']
        role  = ser.validated_data['role']

        member, created = OrganizationMember.objects.get_or_create(
            organization=org, email=email,
            defaults={'name': name, 'role': role, 'status': OrganizationMember.Status.INVITED},
        )
        if not created:
            return Response({'error': 'Member already exists.'}, status=400)

        _log_action(org, request, 'MEMBER_INVITED',
                    target_type='MEMBER', target_id=member.id, target_label=email)
        return Response(OrganizationMemberSerializer(member).data, status=201)

    def update(self, request, *args, **kwargs):
        org    = self._org()
        member = self.get_object()
        ser    = UpdateMemberRoleSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        old_role = member.role
        member.role = ser.validated_data['role']
        member.save(update_fields=['role', 'updated_at'])
        _log_action(org, request, 'MEMBER_ROLE_CHANGED',
                    target_type='MEMBER', target_id=member.id, target_label=member.email,
                    metadata={'old_role': old_role, 'new_role': member.role})
        return Response(OrganizationMemberSerializer(member).data)

    def destroy(self, request, *args, **kwargs):
        org    = self._org()
        member = self.get_object()
        if member.role == OrganizationMember.Role.OWNER:
            return Response({'error': 'Cannot remove the organization owner.'}, status=400)
        _log_action(org, request, 'MEMBER_REMOVED',
                    target_type='MEMBER', target_id=member.id,
                    target_label=member.email)
        member.delete()
        return Response(status=204)


# ── 2b. Entry redirect – resolve org for the current user ────────────────────

from rest_framework.views import APIView

class EnterpriseEntryView(APIView):
    """
    GET /api/enterprise/entry/
    Returns the user's organization list so the frontend can redirect:
      - empty list   → send to /enterprise/organizations/create
      - one or more  → frontend picks first (or shows org-switcher)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user     = request.user
        owned    = Organization.objects.filter(owner=user)
        member_of = Organization.objects.filter(
            members__user=user,
            members__status=OrganizationMember.Status.ACTIVE,
        )
        orgs = (owned | member_of).distinct().order_by('-created_at')
        data = OrganizationSerializer(orgs, many=True).data
        return Response({'organizations': data})


# ── 2c. Departments ───────────────────────────────────────────────────────────

class DepartmentViewSet(
    ListModelMixin, CreateModelMixin, RetrieveModelMixin,
    UpdateModelMixin, DestroyModelMixin, GenericViewSet,
):
    """
    GET    /api/enterprise/organizations/:orgId/departments/         – list
    POST   /api/enterprise/organizations/:orgId/departments/         – create
    GET    /api/enterprise/organizations/:orgId/departments/:id/     – detail
    PATCH  /api/enterprise/organizations/:orgId/departments/:id/     – update
    DELETE /api/enterprise/organizations/:orgId/departments/:id/     – delete
    """
    permission_classes = [IsAuthenticated]
    pagination_class   = None
    serializer_class   = DepartmentSerializer

    def _org(self):
        return _get_org(self.request, self.kwargs['org_pk'])

    def get_queryset(self):
        return self._org().departments.prefetch_related('teams__groups').order_by('name')

    def create(self, request, org_pk=None):
        org = _get_org(request, org_pk)
        ser = DepartmentCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = dict(ser.validated_data)
        # Resolve optional parent FK
        parent_id = data.pop('parent', '') or ''
        parent_obj = None
        if parent_id:
            try:
                parent_obj = Department.objects.get(id=parent_id, organization=org)
            except Department.DoesNotExist:
                return Response({'error': 'Parent department not found.'}, status=400)
        if org.departments.filter(name=data['name']).exists():
            return Response({'error': 'Department name already exists in this organization.'}, status=400)
        dept = Department.objects.create(organization=org, parent=parent_obj, **data)
        _log_action(org, request, 'DEPARTMENT_CREATED',
                    target_type='DEPARTMENT', target_id=dept.id, target_label=dept.name)
        return Response(DepartmentSerializer(dept).data, status=201)

    def update(self, request, *args, **kwargs):
        dept = self.get_object()
        ser  = DepartmentCreateSerializer(data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        data = dict(ser.validated_data)
        parent_id = data.pop('parent', None)
        if parent_id is not None:
            if parent_id:
                try:
                    data['parent'] = Department.objects.get(id=parent_id, organization=dept.organization)
                except Department.DoesNotExist:
                    return Response({'error': 'Parent department not found.'}, status=400)
            else:
                data['parent'] = None
        for attr, val in data.items():
            setattr(dept, attr, val)
        dept.save()
        org = dept.organization
        _log_action(org, request, 'DEPARTMENT_UPDATED',
                    target_type='DEPARTMENT', target_id=dept.id, target_label=dept.name)
        return Response(DepartmentSerializer(dept).data)

    def perform_destroy(self, instance):
        org = instance.organization
        _log_action(org, self.request, 'DEPARTMENT_DELETED',
                    target_type='DEPARTMENT', target_id=instance.id, target_label=instance.name)
        instance.delete()


# ── 2c-ii. Department Sidebar Items ──────────────────────────────────────────

class DepartmentSidebarViewSet(
    ListModelMixin, CreateModelMixin, UpdateModelMixin,
    DestroyModelMixin, GenericViewSet,
):
    """
    GET    /api/enterprise/organizations/:orgId/departments/:deptId/sidebar/          – list items
    POST   /api/enterprise/organizations/:orgId/departments/:deptId/sidebar/          – create item
    PATCH  /api/enterprise/organizations/:orgId/departments/:deptId/sidebar/:id/      – update item
    DELETE /api/enterprise/organizations/:orgId/departments/:deptId/sidebar/:id/      – delete item
    POST   /api/enterprise/organizations/:orgId/departments/:deptId/sidebar/bulk_set/ – replace all
    """
    permission_classes = [IsAuthenticated]
    pagination_class   = None

    def _dept(self):
        org  = _get_org(self.request, self.kwargs['org_pk'])
        return get_object_or_404(Department, pk=self.kwargs['dept_pk'], organization=org)

    def get_queryset(self):
        dept = self._dept()
        return dept.sidebar_items.order_by('item_type', 'order_index')

    def get_serializer_class(self):
        from .serializers import DepartmentSidebarItemSerializer, DepartmentSidebarItemWriteSerializer
        if self.action in ('create', 'update', 'partial_update'):
            return DepartmentSidebarItemWriteSerializer
        return DepartmentSidebarItemSerializer

    def create(self, request, org_pk=None, dept_pk=None):
        from .serializers import DepartmentSidebarItemSerializer, DepartmentSidebarItemWriteSerializer
        from .models import DepartmentSidebarItem
        dept = self._dept()
        ser  = DepartmentSidebarItemWriteSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        item = DepartmentSidebarItem.objects.create(department=dept, **ser.validated_data)
        return Response(DepartmentSidebarItemSerializer(item).data, status=201)

    def update(self, request, *args, **kwargs):
        from .serializers import DepartmentSidebarItemSerializer, DepartmentSidebarItemWriteSerializer
        item = self.get_object()
        ser  = DepartmentSidebarItemWriteSerializer(item, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(DepartmentSidebarItemSerializer(item).data)

    @action(detail=False, methods=['post'], url_path='bulk_set')
    def bulk_set(self, request, org_pk=None, dept_pk=None):
        """Replace entire sidebar config with the provided list."""
        from .serializers import (
            DepartmentSidebarItemSerializer, DepartmentSidebarBulkSerializer,
        )
        from .models import DepartmentSidebarItem
        dept = self._dept()
        ser  = DepartmentSidebarBulkSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        dept.sidebar_items.all().delete()
        items_data = ser.validated_data['items']
        created = []
        for i, item_data in enumerate(items_data):
            item_data.setdefault('order_index', i)
            created.append(DepartmentSidebarItem(department=dept, **item_data))
        DepartmentSidebarItem.objects.bulk_create(created)
        result = dept.sidebar_items.order_by('item_type', 'order_index')
        return Response(DepartmentSidebarItemSerializer(result, many=True).data)


# ── 2d. Teams (scoped to a Department within an Org) ─────────────────────────

class OrgTeamViewSet(
    ListModelMixin, CreateModelMixin, RetrieveModelMixin,
    UpdateModelMixin, DestroyModelMixin, GenericViewSet,
):
    """
    GET    /api/enterprise/organizations/:orgId/departments/:deptId/teams/     – list
    POST   /api/enterprise/organizations/:orgId/departments/:deptId/teams/     – create
    PATCH  /api/enterprise/organizations/:orgId/departments/:deptId/teams/:id/ – update
    DELETE /api/enterprise/organizations/:orgId/departments/:deptId/teams/:id/ – delete
    """
    permission_classes = [IsAuthenticated]
    pagination_class   = None
    serializer_class   = OrgTeamSerializer

    def _dept(self):
        org  = _get_org(self.request, self.kwargs['org_pk'])
        dept = get_object_or_404(Department, pk=self.kwargs['dept_pk'], organization=org)
        return dept

    def get_queryset(self):
        return self._dept().teams.prefetch_related('groups').order_by('name')

    def create(self, request, org_pk=None, dept_pk=None):
        dept = self._dept()
        ser  = OrgTeamCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        if dept.teams.filter(name=ser.validated_data['name']).exists():
            return Response({'error': 'Team name already exists in this department.'}, status=400)
        team = OrgTeam.objects.create(department=dept, **ser.validated_data)
        _log_action(dept.organization, request, 'TEAM_CREATED',
                    target_type='TEAM', target_id=team.id, target_label=team.name)
        return Response(OrgTeamSerializer(team).data, status=201)

    def update(self, request, *args, **kwargs):
        team = self.get_object()
        ser  = OrgTeamCreateSerializer(data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        for attr, val in ser.validated_data.items():
            setattr(team, attr, val)
        team.save()
        _log_action(team.department.organization, request, 'TEAM_UPDATED',
                    target_type='TEAM', target_id=team.id, target_label=team.name)
        return Response(OrgTeamSerializer(team).data)

    def perform_destroy(self, instance):
        _log_action(instance.department.organization, self.request, 'TEAM_DELETED',
                    target_type='TEAM', target_id=instance.id, target_label=instance.name)
        instance.delete()


# ── 2e. Groups (scoped to a Team within an Org) ───────────────────────────────

class OrgGroupViewSet(
    ListModelMixin, CreateModelMixin, RetrieveModelMixin,
    UpdateModelMixin, DestroyModelMixin, GenericViewSet,
):
    """
    GET    /api/enterprise/organizations/:orgId/departments/:deptId/teams/:teamId/groups/
    POST   /api/enterprise/organizations/:orgId/departments/:deptId/teams/:teamId/groups/
    PATCH  /api/enterprise/organizations/:orgId/departments/:deptId/teams/:teamId/groups/:id/
    DELETE /api/enterprise/organizations/:orgId/departments/:deptId/teams/:teamId/groups/:id/
    """
    permission_classes = [IsAuthenticated]
    pagination_class   = None
    serializer_class   = OrgGroupSerializer

    def _team(self):
        org  = _get_org(self.request, self.kwargs['org_pk'])
        dept = get_object_or_404(Department, pk=self.kwargs['dept_pk'], organization=org)
        return get_object_or_404(OrgTeam, pk=self.kwargs['team_pk'], department=dept)

    def get_queryset(self):
        return self._team().groups.order_by('name')

    def create(self, request, org_pk=None, dept_pk=None, team_pk=None):
        team = self._team()
        ser  = OrgGroupCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        if team.groups.filter(name=ser.validated_data['name']).exists():
            return Response({'error': 'Group name already exists in this team.'}, status=400)
        grp = OrgGroup.objects.create(team=team, **ser.validated_data)
        _log_action(team.department.organization, request, 'GROUP_CREATED',
                    target_type='GROUP', target_id=grp.id, target_label=grp.name)
        return Response(OrgGroupSerializer(grp).data, status=201)

    def update(self, request, *args, **kwargs):
        grp = self.get_object()
        ser = OrgGroupCreateSerializer(data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        for attr, val in ser.validated_data.items():
            setattr(grp, attr, val)
        grp.save()
        _log_action(grp.team.department.organization, request, 'GROUP_UPDATED',
                    target_type='GROUP', target_id=grp.id, target_label=grp.name)
        return Response(OrgGroupSerializer(grp).data)

    def perform_destroy(self, instance):
        _log_action(instance.team.department.organization, self.request, 'GROUP_DELETED',
                    target_type='GROUP', target_id=instance.id, target_label=instance.name)
        instance.delete()


# ── 3. Enterprise Send Domains ────────────────────────────────────────────────

class EnterpriseSendDomainViewSet(
    ListModelMixin, CreateModelMixin, RetrieveModelMixin,
    DestroyModelMixin, GenericViewSet,
):
    permission_classes = [IsAuthenticated]
    serializer_class   = EnterpriseSendDomainSerializer

    def _org(self):
        return _get_org(self.request, self.kwargs['org_pk'])

    def get_queryset(self):
        return self._org().send_domains.order_by('-created_at')

    def create(self, request, org_pk=None):
        org = _get_org(request, org_pk)
        ser = CreateSendDomainSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        domain_str = ser.validated_data['domain']

        if org.send_domains.filter(domain=domain_str).exists():
            return Response({'error': 'Domain already registered.'}, status=400)

        obj = EnterpriseSendDomain(
            organization=org,
            domain=domain_str,
            tracking_domain=ser.validated_data.get('tracking_domain', f'track.{domain_str}'),
            selector=ser.validated_data.get('selector', 's1'),
        )
        obj.generate_dns_records()
        obj.save()
        _log_action(org, request, 'EMAIL_DOMAIN_ADDED',
                    target_type='EMAIL_DOMAIN', target_id=obj.id, target_label=domain_str)
        return Response(EnterpriseSendDomainSerializer(obj).data, status=201)

    @action(detail=True, methods=['post'], url_path='check-dns')
    def check_dns(self, request, org_pk=None, pk=None):
        """Trigger a DNS verification check."""
        obj = self.get_object()
        # In production: run actual DNS lookups here.
        # For now, simulate: if records are non-empty mark as VERIFIED.
        if obj.dkim_record and obj.spf_record:
            obj.status = EnterpriseSendDomain.Status.VERIFIED
        else:
            obj.status = EnterpriseSendDomain.Status.FAILED
        obj.last_checked_at = timezone.now()
        obj.save(update_fields=['status', 'last_checked_at', 'updated_at'])
        return Response(EnterpriseSendDomainSerializer(obj).data)


# ── 4. Email Sender Identities ────────────────────────────────────────────────

class EmailSenderIdentityViewSet(
    ListModelMixin, CreateModelMixin, DestroyModelMixin, GenericViewSet,
):
    permission_classes = [IsAuthenticated]
    serializer_class   = EmailSenderIdentitySerializer

    def _org(self):
        return _get_org(self.request, self.kwargs['org_pk'])

    def get_queryset(self):
        return self._org().sender_identities.order_by('-created_at')

    def create(self, request, org_pk=None):
        org = _get_org(request, org_pk)
        ser = CreateSenderIdentitySerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        email_str = ser.validated_data['email']

        if org.sender_identities.filter(email=email_str).exists():
            return Response({'error': 'Sender identity already exists.'}, status=400)

        import secrets
        identity = EmailSenderIdentity.objects.create(
            organization=org,
            email=email_str,
            name=ser.validated_data['name'],
            verify_token=secrets.token_urlsafe(32),
        )
        # In production: send verification email with token link.
        _log_action(org, request, 'SENDER_IDENTITY_ADDED',
                    target_type='SENDER', target_id=identity.id, target_label=email_str)
        return Response(EmailSenderIdentitySerializer(identity).data, status=201)

    @action(detail=True, methods=['post'], url_path='verify')
    def verify(self, request, org_pk=None, pk=None):
        """Mark a sender identity as verified (token flow simulated)."""
        identity = self.get_object()
        identity.verified    = True
        identity.verified_at = timezone.now()
        identity.save(update_fields=['verified', 'verified_at', 'updated_at'])
        return Response(EmailSenderIdentitySerializer(identity).data)


# ── 5. Email Templates ────────────────────────────────────────────────────────

class EnterpriseEmailTemplateViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class   = EnterpriseEmailTemplateSerializer

    def _org(self):
        return _get_org(self.request, self.kwargs['org_pk'])

    def get_queryset(self):
        return self._org().email_templates.order_by('-created_at')

    def perform_create(self, serializer):
        org = _get_org(self.request, self.kwargs['org_pk'])
        # Resolve current member
        try:
            member = org.members.get(user=self.request.user)
        except OrganizationMember.DoesNotExist:
            member = None
        instance = serializer.save(organization=org, created_by=member)
        _log_action(org, self.request, 'EMAIL_TEMPLATE_CREATED',
                    target_type='TEMPLATE', target_id=instance.id,
                    target_label=instance.name)

    def perform_update(self, serializer):
        instance = serializer.save()
        org = instance.organization
        _log_action(org, self.request, 'EMAIL_TEMPLATE_UPDATED',
                    target_type='TEMPLATE', target_id=instance.id,
                    target_label=instance.name)

    def perform_destroy(self, instance):
        org = instance.organization
        _log_action(org, self.request, 'EMAIL_TEMPLATE_DELETED',
                    target_type='TEMPLATE', target_id=instance.id,
                    target_label=instance.name)
        instance.delete()


# ── 6. Email Logs ─────────────────────────────────────────────────────────────

class EmailLogViewSet(ListModelMixin, RetrieveModelMixin, GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class   = EmailLogSerializer

    def get_queryset(self):
        org = _get_org(self.request, self.kwargs['org_pk'])
        qs  = org.email_logs.order_by('-created_at')
        status_f = self.request.query_params.get('status')
        if status_f:
            qs = qs.filter(status=status_f.upper())
        campaign_f = self.request.query_params.get('campaign_id')
        if campaign_f:
            qs = qs.filter(campaign_id=campaign_f)
        return qs[:500]  # cap at 500


# ── 7. Organization Domains ───────────────────────────────────────────────────

class OrgDomainViewSet(
    ListModelMixin, CreateModelMixin, RetrieveModelMixin,
    UpdateModelMixin, DestroyModelMixin, GenericViewSet,
):
    permission_classes = [IsAuthenticated]
    serializer_class   = OrgDomainSerializer

    def _org(self):
        return _get_org(self.request, self.kwargs['org_pk'])

    def get_queryset(self):
        return self._org().org_domains.prefetch_related('records').order_by('-created_at')

    def create(self, request, org_pk=None):
        org = _get_org(request, org_pk)
        ser = CreateOrgDomainSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        if org.org_domains.filter(name=ser.validated_data['name']).exists():
            return Response({'error': 'Domain already registered.'}, status=400)

        dom = OrgDomain.objects.create(organization=org, **ser.validated_data)
        _log_action(org, request, 'DOMAIN_ADDED',
                    target_type='DOMAIN', target_id=dom.id, target_label=dom.name)
        return Response(OrgDomainSerializer(dom).data, status=201)

    @action(detail=True, methods=['get'], url_path='records')
    def records(self, request, org_pk=None, pk=None):
        dom     = self.get_object()
        records = dom.records.all()
        return Response(OrgDomainRecordSerializer(records, many=True).data)

    @action(detail=True, methods=['post'], url_path='activate')
    def activate(self, request, org_pk=None, pk=None):
        """Mark domain as ACTIVE (DNS verified)."""
        dom        = self.get_object()
        dom.status = OrgDomain.Status.ACTIVE
        dom.save(update_fields=['status', 'updated_at'])
        org = dom.organization
        _log_action(org, request, 'DOMAIN_ACTIVATED',
                    target_type='DOMAIN', target_id=dom.id, target_label=dom.name)
        return Response(OrgDomainSerializer(dom).data)


# ── 8. Branding ───────────────────────────────────────────────────────────────

class BrandingProfileViewSet(RetrieveModelMixin, UpdateModelMixin, GenericViewSet):
    """
    GET  /api/enterprise/organizations/:orgId/branding/profile/ – retrieve
    PATCH /api/enterprise/organizations/:orgId/branding/profile/ – update
    """
    permission_classes = [IsAuthenticated]
    serializer_class   = BrandingProfileSerializer

    def _org(self):
        return _get_org(self.request, self.kwargs['org_pk'])

    def get_object(self):
        org = self._org()
        profile, _ = BrandingProfile.objects.get_or_create(organization=org)
        return profile

    @action(detail=False, methods=['get', 'patch'], url_path='profile')
    def profile(self, request, org_pk=None):
        obj = self.get_object()
        if request.method == 'PATCH':
            ser = BrandingProfileSerializer(obj, data=request.data, partial=True)
            ser.is_valid(raise_exception=True)
            ser.save()
            org = obj.organization
            _log_action(org, request, 'BRANDING_UPDATED',
                        target_type='BRANDING', target_id=obj.id)
            return Response(ser.data)
        return Response(BrandingProfileSerializer(obj).data)


class BrandAssetViewSet(
    ListModelMixin, CreateModelMixin, DestroyModelMixin, GenericViewSet,
):
    permission_classes = [IsAuthenticated]
    serializer_class   = BrandAssetSerializer

    def _branding(self):
        org = _get_org(self.request, self.kwargs['org_pk'])
        profile, _ = BrandingProfile.objects.get_or_create(organization=org)
        return profile

    def get_queryset(self):
        return self._branding().assets.order_by('-created_at')

    def create(self, request, org_pk=None):
        profile = self._branding()
        ser     = BrandAssetSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        asset   = ser.save(branding_profile=profile)
        _log_action(profile.organization, request, 'BRAND_ASSET_UPLOADED',
                    target_type='BRAND_ASSET', target_id=asset.id, target_label=asset.label)
        return Response(BrandAssetSerializer(asset).data, status=201)


# ── 9. Enterprise Plans ───────────────────────────────────────────────────────

class EnterprisePlanViewSet(ListModelMixin, RetrieveModelMixin, GenericViewSet):
    """Public list of available enterprise plans."""
    permission_classes = [IsAuthenticated]
    serializer_class   = EnterprisePlanSerializer

    def get_queryset(self):
        return EnterprisePlan.objects.filter(is_active=True).order_by('price_monthly')


# ── 10. Subscription ──────────────────────────────────────────────────────────

class SubscriptionViewSet(RetrieveModelMixin, UpdateModelMixin, GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class   = SubscriptionSerializer

    def _org(self):
        return _get_org(self.request, self.kwargs['org_pk'])

    def get_object(self):
        org = self._org()
        sub, created = Subscription.objects.get_or_create(organization=org)
        return sub

    @action(detail=False, methods=['get'], url_path='current')
    def current(self, request, org_pk=None):
        sub = self.get_object()
        return Response(SubscriptionSerializer(sub).data)

    @action(detail=False, methods=['post'], url_path='change-plan')
    def change_plan(self, request, org_pk=None):
        org     = _get_org(request, org_pk)
        plan_id = request.data.get('plan_id')
        plan    = get_object_or_404(EnterprisePlan, pk=plan_id, is_active=True)
        sub     = self.get_object()
        old_plan = sub.plan.name if sub.plan else 'None'
        sub.plan   = plan
        sub.status = Subscription.Status.ACTIVE
        sub.save(update_fields=['plan', 'status', 'updated_at'])
        _log_action(org, request, 'SUBSCRIPTION_PLAN_CHANGED',
                    target_type='SUBSCRIPTION', target_id=sub.id,
                    metadata={'old_plan': old_plan, 'new_plan': plan.name})
        return Response(SubscriptionSerializer(sub).data)


# ── 11. Enterprise Invoices ───────────────────────────────────────────────────

class EnterpriseInvoiceViewSet(ListModelMixin, RetrieveModelMixin, GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class   = EnterpriseInvoiceSerializer

    def get_queryset(self):
        org = _get_org(self.request, self.kwargs['org_pk'])
        return org.enterprise_invoices.order_by('-created_at')


# ── 12. Audit Logs ────────────────────────────────────────────────────────────

class EnterpriseAuditLogViewSet(ListModelMixin, RetrieveModelMixin, GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class   = EnterpriseAuditLogSerializer

    def get_queryset(self):
        org = _get_org(self.request, self.kwargs['org_pk'])
        qs  = org.audit_logs.order_by('-timestamp')
        # Filters
        actor  = self.request.query_params.get('actor')
        action = self.request.query_params.get('action')
        target = self.request.query_params.get('target_type')
        since  = self.request.query_params.get('since')   # ISO date
        until  = self.request.query_params.get('until')
        if actor:
            qs = qs.filter(actor_email__icontains=actor)
        if action:
            qs = qs.filter(action__icontains=action)
        if target:
            qs = qs.filter(target_type__iexact=target)
        if since:
            qs = qs.filter(timestamp__date__gte=since)
        if until:
            qs = qs.filter(timestamp__date__lte=until)
        return qs[:1000]
