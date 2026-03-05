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
    WikiPage, WikiCategory, WikiPageVersion,
    IntegrationConnection, IntegrationLog, IntegrationWebhookEvent,
    OrgOrder,
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
    WikiCategorySerializer, WikiCategoryWriteSerializer,
    WikiPageListSerializer, WikiPageDetailSerializer,
    WikiPageVersionSerializer, WikiPageWriteSerializer,
    IntegrationConnectionSerializer, IntegrationConnectionWriteSerializer,
    IntegrationLogSerializer, IntegrationWebhookEventSerializer,
    OrgOrderSerializer, OrgOrderWriteSerializer,
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


# ── Orders ────────────────────────────────────────────────────────────────────

class OrgOrderViewSet(
    ListModelMixin, CreateModelMixin,
    RetrieveModelMixin, UpdateModelMixin,
    GenericViewSet,
):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return OrgOrderWriteSerializer
        return OrgOrderSerializer

    def get_queryset(self):
        org = _get_org(self.request, self.kwargs['org_pk'])
        qs  = org.orders.prefetch_related('items').order_by('-created_at')
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def perform_create(self, serializer):
        org   = _get_org(self.request, self.kwargs['org_pk'])
        order = serializer.save(organization=org)
        _log_action(org, self.request, 'ORDER_CREATED',
                    target_type='ORDER', target_id=order.id,
                    target_label=order.order_number)


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


# ── 13. Wiki ──────────────────────────────────────────────────────────────

class WikiCategoryViewSet(
    ListModelMixin, CreateModelMixin, RetrieveModelMixin,
    UpdateModelMixin, DestroyModelMixin, GenericViewSet,
):
    """
    GET    /api/enterprise/organizations/:org_pk/wiki/categories/      – list
    POST   /api/enterprise/organizations/:org_pk/wiki/categories/      – create
    GET    /api/enterprise/organizations/:org_pk/wiki/categories/:id/  – detail
    PATCH  /api/enterprise/organizations/:org_pk/wiki/categories/:id/  – update
    DELETE /api/enterprise/organizations/:org_pk/wiki/categories/:id/  – delete
    """
    permission_classes = [IsAuthenticated]
    pagination_class   = None
    serializer_class   = WikiCategorySerializer

    def _org(self):
        return _get_org(self.request, self.kwargs['org_pk'])

    def get_queryset(self):
        return self._org().wiki_categories.all()

    def create(self, request, org_pk=None):
        ser = WikiCategoryWriteSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        d = ser.validated_data
        org = self._org()
        if org.wiki_categories.filter(name__iexact=d['name']).exists():
            return Response({'detail': 'A category with this name already exists.'},
                            status=status.HTTP_400_BAD_REQUEST)
        cat = org.wiki_categories.create(
            name=d['name'],
            color=d.get('color', '#3b82f6'),
            description=d.get('description', ''),
        )
        _log_action(org, request, 'WIKI_CATEGORY_CREATED',
                    target_type='WIKI_CATEGORY', target_id=cat.id, target_label=cat.name)
        return Response(WikiCategorySerializer(cat).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        cat = self.get_object()
        ser = WikiCategoryWriteSerializer(data=request.data, partial=partial)
        ser.is_valid(raise_exception=True)
        d = ser.validated_data
        for field in ('name', 'color', 'description'):
            if field in d:
                setattr(cat, field, d[field])
        cat.save()
        return Response(WikiCategorySerializer(cat).data)

    def perform_destroy(self, instance):
        _log_action(instance.organization, self.request, 'WIKI_CATEGORY_DELETED',
                    target_type='WIKI_CATEGORY', target_id=instance.id,
                    target_label=instance.name)
        instance.delete()


class WikiPageViewSet(
    ListModelMixin, CreateModelMixin, RetrieveModelMixin,
    UpdateModelMixin, DestroyModelMixin, GenericViewSet,
):
    """
    GET    /api/enterprise/organizations/:org_pk/wiki/pages/              – list (no content)
    POST   /api/enterprise/organizations/:org_pk/wiki/pages/              – create
    GET    /api/enterprise/organizations/:org_pk/wiki/pages/:id/          – detail (with content)
    PATCH  /api/enterprise/organizations/:org_pk/wiki/pages/:id/          – update
    DELETE /api/enterprise/organizations/:org_pk/wiki/pages/:id/          – delete
    GET    /api/enterprise/organizations/:org_pk/wiki/pages/:id/versions/ – version history
    POST   /api/enterprise/organizations/:org_pk/wiki/pages/:id/restore/:version_id/ – restore
    """
    permission_classes = [IsAuthenticated]
    pagination_class   = None

    def _org(self):
        return _get_org(self.request, self.kwargs['org_pk'])

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return WikiPageDetailSerializer
        return WikiPageListSerializer

    def get_queryset(self):
        org = self._org()
        qs = org.wiki_pages.prefetch_related('categories').select_related(
            'created_by', 'updated_by'
        )
        # Filters
        q           = self.request.query_params.get('q', '').strip()
        category_id = self.request.query_params.get('category')
        tag         = self.request.query_params.get('tag')
        module      = self.request.query_params.get('module')
        pinned      = self.request.query_params.get('pinned')
        if q:
            qs = qs.filter(title__icontains=q)
        if category_id:
            qs = qs.filter(categories__id=category_id)
        if tag:
            qs = qs.filter(tags__contains=[tag])
        if module:
            qs = qs.filter(linked_module__iexact=module)
        if pinned:
            qs = qs.filter(is_pinned=True)
        return qs.order_by('-is_pinned', '-updated_at')

    def retrieve(self, request, *args, **kwargs):
        page = self.get_object()
        # Increment view count
        WikiPage.objects.filter(pk=page.pk).update(view_count=page.view_count + 1)
        page.refresh_from_db(fields=['view_count'])
        return Response(WikiPageDetailSerializer(page).data)

    def _save_version(self, page, user, note=''):
        WikiPageVersion.objects.create(
            page=page,
            title=page.title,
            content=page.content,
            edited_by=user,
            version_note=note,
        )

    def _apply_write(self, page, data, org):
        """Apply WikiPageWriteSerializer validated_data onto a WikiPage instance."""
        from django.utils.text import slugify
        page.title   = data['title']
        page.content = data.get('content', page.content)
        page.summary = data.get('summary', page.summary)
        page.is_pinned    = data.get('is_pinned', page.is_pinned)
        page.tags         = data.get('tags', page.tags)
        page.linked_module = data.get('linked_module', page.linked_module)
        # Slug: use provided or generate from title (collision-safe)
        raw_slug = data.get('slug') or slugify(data['title'])
        slug = raw_slug
        n = 1
        while org.wiki_pages.filter(slug=slug).exclude(pk=page.pk).exists():
            slug = f'{raw_slug}-{n}'
            n += 1
        page.slug = slug

    def create(self, request, org_pk=None):
        ser = WikiPageWriteSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        d   = ser.validated_data
        org = self._org()

        page = WikiPage(organization=org, created_by=request.user, updated_by=request.user)
        self._apply_write(page, d, org)
        page.save()

        # Assign categories
        cat_ids = d.get('category_ids', [])
        if cat_ids:
            cats = WikiCategory.objects.filter(organization=org, id__in=cat_ids)
            page.categories.set(cats)

        # Save initial version
        self._save_version(page, request.user, d.get('version_note', 'Initial version'))

        _log_action(org, request, 'WIKI_PAGE_CREATED',
                    target_type='WIKI_PAGE', target_id=page.id, target_label=page.title)
        return Response(WikiPageDetailSerializer(page).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        page = self.get_object()
        org  = page.organization

        ser = WikiPageWriteSerializer(data=request.data, partial=partial)
        ser.is_valid(raise_exception=True)
        d = ser.validated_data

        # Snapshot current state before overwriting
        self._save_version(page, request.user, d.get('version_note', ''))

        self._apply_write(page, d, org)
        page.updated_by = request.user
        page.save()

        cat_ids = d.get('category_ids')
        if cat_ids is not None:
            cats = WikiCategory.objects.filter(organization=org, id__in=cat_ids)
            page.categories.set(cats)

        _log_action(org, request, 'WIKI_PAGE_UPDATED',
                    target_type='WIKI_PAGE', target_id=page.id, target_label=page.title)
        return Response(WikiPageDetailSerializer(page).data)

    def perform_destroy(self, instance):
        _log_action(instance.organization, self.request, 'WIKI_PAGE_DELETED',
                    target_type='WIKI_PAGE', target_id=instance.id,
                    target_label=instance.title)
        instance.delete()

    @action(detail=True, methods=['get'], url_path='versions')
    def versions(self, request, org_pk=None, pk=None):
        """GET /wiki/pages/:id/versions/ – list all saved versions."""
        page = self.get_object()
        vers = page.versions.select_related('edited_by').order_by('-edited_at')[:50]
        return Response(WikiPageVersionSerializer(vers, many=True).data)

    @action(detail=True, methods=['post'], url_path='restore/(?P<version_id>[^/.]+)')
    def restore(self, request, org_pk=None, pk=None, version_id=None):
        """POST /wiki/pages/:id/restore/:version_id/ – restore a version."""
        page = self.get_object()
        org  = page.organization
        ver  = get_object_or_404(WikiPageVersion, pk=version_id, page=page)

        # Snapshot the current state before restoring
        self._save_version(page, request.user,
                           f'Auto-saved before restoring version {ver.id}')

        page.title      = ver.title
        page.content    = ver.content
        page.updated_by = request.user
        page.save(update_fields=['title', 'content', 'updated_by', 'updated_at'])

        _log_action(org, request, 'WIKI_PAGE_RESTORED',
                    target_type='WIKI_PAGE', target_id=page.id, target_label=page.title,
                    metadata={'restored_version': ver.id})
        return Response(WikiPageDetailSerializer(page).data)


# ── Integrations ──────────────────────────────────────────────────────────────

class IntegrationConnectionViewSet(
    ListModelMixin, CreateModelMixin, RetrieveModelMixin,
    UpdateModelMixin, DestroyModelMixin, GenericViewSet,
):
    """
    CRUD for org integration connections + custom actions:
      POST .../connect/     – save credentials & mark CONNECTED
      POST .../disconnect/  – clear credentials & mark DISCONNECTED
      POST .../test/        – run a connection health check
      POST .../sync/        – record a manual sync attempt
      GET  .../logs/        – list last 100 log entries
      GET  .../events/      – list last 50 webhook events
    """
    permission_classes = [IsAuthenticated]
    pagination_class   = None
    serializer_class   = IntegrationConnectionSerializer

    def _org(self):
        return _get_org(self.request, self.kwargs['org_pk'])

    def get_queryset(self):
        qs = self._org().integrations.all()
        category = self.request.query_params.get('category')
        status   = self.request.query_params.get('status')
        if category:
            qs = qs.filter(category__iexact=category)
        if status:
            qs = qs.filter(status__iexact=status)
        return qs

    def _log(self, connection, event_type, level, message, **kwargs):
        IntegrationLog.objects.create(
            connection=connection,
            organization=connection.organization,
            provider=connection.provider,
            event_type=event_type,
            level=level,
            message=message,
            **kwargs,
        )

    # ── CRUD overrides ────────────────────────────────────────────────────────

    def create(self, request, org_pk=None):
        ser = IntegrationConnectionWriteSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        d   = ser.validated_data
        org = self._org()

        conn, created = IntegrationConnection.objects.get_or_create(
            organization=org,
            provider=d['provider'],
            defaults={
                'display_name': d.get('display_name') or d['provider'].title(),
                'category':     d.get('category', 'other'),
                'credentials':  d.get('credentials', {}),
                'config':       d.get('config', {}),
                'connected_by': request.user,
                'status':       IntegrationConnection.Status.PENDING,
            },
        )
        if not created:
            conn.display_name = d.get('display_name') or conn.display_name
            conn.credentials  = d.get('credentials', conn.credentials)
            conn.config       = d.get('config', conn.config)
            conn.connected_by = request.user
            conn.save()

        _log_action(org, request, 'INTEGRATION_CREATED' if created else 'INTEGRATION_UPDATED',
                    target_type='INTEGRATION', target_id=conn.id, target_label=conn.provider)
        return Response(IntegrationConnectionSerializer(conn).data,
                        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        conn = self.get_object()
        ser  = IntegrationConnectionWriteSerializer(data=request.data, partial=partial)
        ser.is_valid(raise_exception=True)
        d = ser.validated_data
        for field in ('display_name', 'category', 'credentials', 'config'):
            if field in d:
                setattr(conn, field, d[field])
        conn.save()
        return Response(IntegrationConnectionSerializer(conn).data)

    def perform_destroy(self, instance):
        self._log(instance, IntegrationLog.EventType.DISCONNECT,
                  IntegrationLog.Level.INFO, 'Integration removed')
        _log_action(instance.organization, self.request, 'INTEGRATION_REMOVED',
                    target_type='INTEGRATION', target_id=instance.id,
                    target_label=instance.provider)
        instance.delete()

    # ── Custom actions ────────────────────────────────────────────────────────

    @action(detail=True, methods=['post'], url_path='connect')
    def connect(self, request, org_pk=None, pk=None):
        """Save credentials and mark the integration as CONNECTED."""
        conn = self.get_object()
        ser  = IntegrationConnectionWriteSerializer(data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        d = ser.validated_data

        if 'credentials' in d and d['credentials']:
            conn.credentials = d['credentials']
        if 'config' in d:
            conn.config = d['config']
        if 'display_name' in d and d['display_name']:
            conn.display_name = d['display_name']

        conn.status       = IntegrationConnection.Status.CONNECTED
        conn.last_error   = ''
        conn.connected_by = request.user
        conn.save()

        self._log(conn, IntegrationLog.EventType.CONNECT, IntegrationLog.Level.SUCCESS,
                  f'Integration connected by {request.user.username}')
        _log_action(conn.organization, request, 'INTEGRATION_CONNECTED',
                    target_type='INTEGRATION', target_id=conn.id, target_label=conn.provider)
        return Response(IntegrationConnectionSerializer(conn).data)

    @action(detail=True, methods=['post'], url_path='disconnect')
    def disconnect(self, request, org_pk=None, pk=None):
        """Revoke credentials and mark the integration as DISCONNECTED."""
        conn = self.get_object()
        conn.credentials = {}
        conn.status      = IntegrationConnection.Status.DISCONNECTED
        conn.last_error  = ''
        conn.save()

        self._log(conn, IntegrationLog.EventType.DISCONNECT, IntegrationLog.Level.INFO,
                  f'Integration disconnected by {request.user.username}')
        _log_action(conn.organization, request, 'INTEGRATION_DISCONNECTED',
                    target_type='INTEGRATION', target_id=conn.id, target_label=conn.provider)
        return Response(IntegrationConnectionSerializer(conn).data)

    @action(detail=True, methods=['post'], url_path='test')
    def test_connection(self, request, org_pk=None, pk=None):
        """
        Run a health check against the integration provider.
        In production this fires a real probe; here it validates credentials are set.
        """
        import time
        conn = self.get_object()
        t0   = time.monotonic()

        if conn.status == IntegrationConnection.Status.DISCONNECTED or not conn.credentials:
            conn.status     = IntegrationConnection.Status.ERROR
            conn.last_error = 'No credentials configured. Please connect first.'
            conn.save()
            self._log(conn, IntegrationLog.EventType.TEST, IntegrationLog.Level.ERROR,
                      conn.last_error, http_status=400,
                      duration_ms=int((time.monotonic() - t0) * 1000))
            return Response({'success': False, 'message': conn.last_error},
                            status=status.HTTP_400_BAD_REQUEST)

        # Simulate a successful probe
        conn.status     = IntegrationConnection.Status.CONNECTED
        conn.last_error = ''
        conn.total_calls += 1
        conn.save()

        duration = int((time.monotonic() - t0) * 1000)
        self._log(conn, IntegrationLog.EventType.TEST, IntegrationLog.Level.SUCCESS,
                  'Connection test passed', http_status=200, duration_ms=duration)
        return Response({'success': True, 'message': 'Connection is healthy.',
                         'duration_ms': duration})

    @action(detail=True, methods=['post'], url_path='sync')
    def sync(self, request, org_pk=None, pk=None):
        """Trigger a manual data synchronisation for this integration."""
        from django.utils import timezone as tz
        conn = self.get_object()
        if conn.status != IntegrationConnection.Status.CONNECTED:
            return Response({'detail': 'Integration must be CONNECTED to sync.'},
                            status=status.HTTP_400_BAD_REQUEST)

        conn.last_sync = tz.now()
        conn.save(update_fields=['last_sync'])
        self._log(conn, IntegrationLog.EventType.SYNC, IntegrationLog.Level.INFO,
                  f'Manual sync triggered by {request.user.username}')
        return Response({'success': True, 'synced_at': conn.last_sync.isoformat()})

    @action(detail=True, methods=['get'], url_path='logs')
    def logs(self, request, org_pk=None, pk=None):
        """List the last 100 log entries for this connection."""
        conn  = self.get_object()
        items = conn.logs.order_by('-timestamp')[:100]
        return Response(IntegrationLogSerializer(items, many=True).data)

    @action(detail=True, methods=['get'], url_path='events')
    def events(self, request, org_pk=None, pk=None):
        """List the last 50 incoming webhook events for this connection."""
        conn  = self.get_object()
        items = conn.webhook_events.order_by('-received_at')[:50]
        return Response(IntegrationWebhookEventSerializer(items, many=True).data)


from rest_framework.views import APIView

class IntegrationWebhookView(APIView):
    """
    Receive incoming webhooks from external providers.
    URL: POST /api/enterprise/webhooks/:provider/:org_pk/
    """
    permission_classes = []   # No auth — validated via HMAC signature

    def post(self, request, provider, org_pk):
        import hashlib, hmac, time
        try:
            org  = Organization.objects.get(pk=org_pk)
            conn = IntegrationConnection.objects.get(organization=org, provider=provider)
        except (Organization.DoesNotExist, IntegrationConnection.DoesNotExist):
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Basic HMAC validation (skip if no secret configured)
        if conn.webhook_secret:
            sig_header = request.META.get('HTTP_X_SIGNATURE_256', '')
            body       = request.body
            expected   = 'sha256=' + hmac.new(
                conn.webhook_secret.encode(), body, hashlib.sha256
            ).hexdigest()
            if not hmac.compare_digest(expected, sig_header):
                return Response({'detail': 'Invalid signature.'}, status=status.HTTP_401_UNAUTHORIZED)

        event_type = (request.data.get('type') or
                      request.META.get('HTTP_X_EVENT_TYPE', 'unknown'))
        event_id   = (request.data.get('id') or
                      request.META.get('HTTP_X_EVENT_ID', ''))

        # Idempotency check
        if event_id and IntegrationWebhookEvent.objects.filter(
            organization=org, provider=provider, event_id=event_id
        ).exists():
            return Response({'status': 'duplicate'})

        evt = IntegrationWebhookEvent.objects.create(
            connection=conn,
            organization=org,
            provider=provider,
            event_type=event_type,
            event_id=event_id,
            payload=request.data,
            normalized={},
            processed=True,
        )
        IntegrationLog.objects.create(
            connection=conn, organization=org, provider=provider,
            event_type=IntegrationLog.EventType.WEBHOOK,
            level=IntegrationLog.Level.INFO,
            message=f'Webhook received: {event_type}',
        )
        return Response({'status': 'accepted', 'id': evt.id})


# ══════════════════════════════════════════════════════════════════════════════
# MEETING HUB VIEW SETS
# ══════════════════════════════════════════════════════════════════════════════

from .models import Meeting, MeetingParticipant, MeetingNotification, Announcement
from .serializers import (
    MeetingSerializer, MeetingWriteSerializer,
    MeetingParticipantSerializer,
    MeetingNotificationSerializer,
    AnnouncementSerializer, AnnouncementWriteSerializer,
)
import uuid as _uuid


class MeetingViewSet(
    ListModelMixin, CreateModelMixin,
    RetrieveModelMixin, UpdateModelMixin, DestroyModelMixin,
    GenericViewSet,
):
    permission_classes = [IsAuthenticated]

    def _org(self):
        return _get_org(self.request, self.kwargs['org_pk'])

    def get_queryset(self):
        org = self._org()
        qs = Meeting.objects.filter(organization=org).prefetch_related('participants')
        dept = self.request.query_params.get('department')
        status_filter = self.request.query_params.get('status')
        meeting_type = self.request.query_params.get('type')
        upcoming = self.request.query_params.get('upcoming')
        if dept:
            qs = qs.filter(department_id=dept)
        if status_filter:
            qs = qs.filter(status=status_filter)
        if meeting_type:
            qs = qs.filter(meeting_type=meeting_type)
        if upcoming:
            qs = qs.filter(start_time__gte=timezone.now(), status=Meeting.Status.SCHEDULED)
        return qs

    def get_serializer_class(self):
        return MeetingWriteSerializer if self.request.method in ('POST', 'PUT', 'PATCH') else MeetingSerializer

    def perform_create(self, serializer):
        org = self._org()
        video_room_id = f'room-{_uuid.uuid4().hex[:12]}'
        meeting = serializer.save(
            organization=org,
            created_by=self.request.user,
            video_room_id=video_room_id,
        )
        _log_action(org, self.request, 'meeting.create',
                    'Meeting', meeting.id, meeting.title)

    def perform_update(self, serializer):
        meeting = serializer.save()
        _log_action(self._org(), self.request, 'meeting.update',
                    'Meeting', meeting.id, meeting.title)

    def perform_destroy(self, instance):
        _log_action(self._org(), self.request, 'meeting.delete',
                    'Meeting', instance.id, instance.title)
        instance.delete()

    @action(detail=True, methods=['post'], url_path='invite')
    def invite(self, request, org_pk=None, pk=None):
        """Invite participants: [{email, name, role}]"""
        meeting = self.get_object()
        participants = request.data.get('participants', [])
        created_count = 0
        for p in participants:
            email = p.get('email', '')
            name  = p.get('name', '')
            role  = p.get('role', 'attendee')
            if not email:
                continue
            MeetingParticipant.objects.get_or_create(
                meeting=meeting, email=email,
                defaults={'name': name, 'role': role,
                          'invite_status': MeetingParticipant.InviteStatus.INVITED},
            )
            created_count += 1
        return Response({'invited': created_count})

    @action(detail=True, methods=['post'], url_path='start')
    def start(self, request, org_pk=None, pk=None):
        """Mark meeting as in-progress and return the join URL."""
        meeting = self.get_object()
        meeting.status = Meeting.Status.IN_PROGRESS
        meeting.save(update_fields=['status', 'updated_at'])
        # Notify all participants
        for participant in meeting.participants.select_related('user'):
            if participant.user:
                MeetingNotification.objects.create(
                    user=participant.user,
                    meeting=meeting,
                    notif_type=MeetingNotification.NotifType.STARTED,
                    message=f'"{meeting.title}" has started. Join now.',
                )
        return Response({
            'status': meeting.status,
            'video_room_id': meeting.video_room_id,
            'video_join_url': meeting.video_join_url or f'/meetings/room/{meeting.video_room_id}',
        })

    @action(detail=True, methods=['post'], url_path='end')
    def end(self, request, org_pk=None, pk=None):
        """Mark meeting as completed."""
        meeting = self.get_object()
        meeting.status = Meeting.Status.COMPLETED
        notes = request.data.get('notes', '')
        if notes:
            meeting.notes = notes
        meeting.save(update_fields=['status', 'notes', 'updated_at'])
        return Response({'status': meeting.status})

    @action(detail=True, methods=['post'], url_path='rsvp')
    def rsvp(self, request, org_pk=None, pk=None):
        """Current user responds to an invite: {status: accepted|declined|tentative}"""
        meeting = self.get_object()
        invite_status = request.data.get('status', 'accepted')
        MeetingParticipant.objects.filter(
            meeting=meeting, user=request.user
        ).update(invite_status=invite_status)
        return Response({'status': invite_status})

    @action(detail=False, methods=['get'], url_path='analytics')
    def analytics(self, request, org_pk=None):
        """Quick stats for the Meeting Hub dashboard."""
        from django.utils import timezone
        from datetime import timedelta
        org = self._org()
        now = timezone.now()
        week_start = now - timedelta(days=now.weekday())
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        qs = Meeting.objects.filter(organization=org)
        return Response({
            'total':          qs.count(),
            'this_week':      qs.filter(start_time__gte=week_start).count(),
            'this_month':     qs.filter(start_time__gte=month_start).count(),
            'upcoming':       qs.filter(start_time__gte=now, status=Meeting.Status.SCHEDULED).count(),
            'in_progress':    qs.filter(status=Meeting.Status.IN_PROGRESS).count(),
            'completed':      qs.filter(status=Meeting.Status.COMPLETED).count(),
            'avg_duration':   int(
                sum(m.duration_minutes for m in qs.filter(status=Meeting.Status.COMPLETED)) /
                max(qs.filter(status=Meeting.Status.COMPLETED).count(), 1)
            ),
        })


class MeetingNotificationViewSet(
    ListModelMixin, UpdateModelMixin, GenericViewSet,
):
    permission_classes = [IsAuthenticated]
    serializer_class = MeetingNotificationSerializer

    def get_queryset(self):
        _get_org(self.request, self.kwargs['org_pk'])  # gate
        return MeetingNotification.objects.filter(
            user=self.request.user,
            meeting__organization__id=self.kwargs['org_pk'],
        ).select_related('meeting')

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request, org_pk=None):
        updated = self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({'marked': updated})


class AnnouncementViewSet(
    ListModelMixin, CreateModelMixin,
    RetrieveModelMixin, UpdateModelMixin, DestroyModelMixin,
    GenericViewSet,
):
    permission_classes = [IsAuthenticated]

    def _org(self):
        return _get_org(self.request, self.kwargs['org_pk'])

    def get_queryset(self):
        org = self._org()
        qs = Announcement.objects.filter(organization=org)
        dept = self.request.query_params.get('department')
        if dept == 'org':
            qs = qs.filter(department__isnull=True)
        elif dept:
            qs = qs.filter(department_id=dept)
        return qs

    def get_serializer_class(self):
        return AnnouncementWriteSerializer if self.request.method in ('POST', 'PUT', 'PATCH') else AnnouncementSerializer

    def perform_create(self, serializer):
        org = self._org()
        ann = serializer.save(organization=org, created_by=self.request.user)
        _log_action(org, self.request, 'announcement.create',
                    'Announcement', ann.id, ann.title)
