# AtonixCorp – Enterprise Module Serializers

from rest_framework import serializers
from .models import (
    Organization, OrganizationMember,
    Department, OrgTeam, OrgGroup, DepartmentSidebarItem,
    EnterpriseSendDomain, EmailSenderIdentity, EnterpriseEmailTemplate, EmailLog,
    OrgDomain, OrgDomainRecord,
    BrandingProfile, BrandAsset,
    EnterprisePlan, Subscription, EnterpriseInvoice,
    EnterpriseAuditLog,
    WikiCategory, WikiPage, WikiPageVersion,
    IntegrationConnection, IntegrationLog, IntegrationWebhookEvent,
)


# ── Organization ──────────────────────────────────────────────────────────────

class OrganizationSerializer(serializers.ModelSerializer):
    member_count = serializers.SerializerMethodField()

    class Meta:
        model  = Organization
        fields = [
            'id', 'name', 'slug', 'primary_domain', 'industry', 'country',
            'plan', 'status', 'member_count', 'contact_email', 'domain_email',
            'logo_url', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'member_count']

    def get_member_count(self, obj):
        return obj.members.filter(status=OrganizationMember.Status.ACTIVE).count()


class OrganizationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Organization
        fields = ['name', 'slug', 'primary_domain', 'industry', 'country',
                  'contact_email', 'domain_email', 'logo_url']


# ── Organization Member ───────────────────────────────────────────────────────

class OrganizationMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model  = OrganizationMember
        fields = [
            'id', 'organization', 'email', 'name', 'role', 'status',
            'permissions', 'joined_at', 'invited_at', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'organization', 'invited_at', 'joined_at',
                            'created_at', 'updated_at']


class InviteMemberSerializer(serializers.Serializer):
    email = serializers.EmailField()
    name  = serializers.CharField(max_length=255, required=False, default='')
    role  = serializers.ChoiceField(choices=OrganizationMember.Role.choices,
                                    default=OrganizationMember.Role.MEMBER)


class UpdateMemberRoleSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=OrganizationMember.Role.choices)


# ── Hierarchy: Department → Team → Group ──────────────────────────────────────

class OrgGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model  = OrgGroup
        fields = ['id', 'team', 'name', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'team', 'created_at', 'updated_at']


class OrgTeamSerializer(serializers.ModelSerializer):
    groups = OrgGroupSerializer(many=True, read_only=True)

    class Meta:
        model  = OrgTeam
        fields = ['id', 'department', 'name', 'description', 'team_type', 'groups', 'created_at', 'updated_at']
        read_only_fields = ['id', 'department', 'created_at', 'updated_at']


class DepartmentSerializer(serializers.ModelSerializer):
    teams = OrgTeamSerializer(many=True, read_only=True)

    class Meta:
        model  = Department
        fields = [
            'id', 'organization', 'name', 'category', 'description',
            'department_lead', 'parent', 'teams', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'organization', 'created_at', 'updated_at']


# ── Create helpers (write-only, no nested expansions) ─────────────────────────

class DepartmentCreateSerializer(serializers.Serializer):
    name            = serializers.CharField(max_length=255)
    category        = serializers.CharField(required=False, default='', allow_blank=True)
    description     = serializers.CharField(required=False, default='', allow_blank=True)
    department_lead = serializers.CharField(required=False, default='', allow_blank=True)
    parent          = serializers.CharField(required=False, default='', allow_blank=True)


# ── Department Sidebar ────────────────────────────────────────────────────────

class DepartmentSidebarItemSerializer(serializers.ModelSerializer):
    class Meta:
        model  = DepartmentSidebarItem
        fields = [
            'id', 'item_type', 'label', 'url', 'icon',
            'order_index', 'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class DepartmentSidebarItemWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model  = DepartmentSidebarItem
        fields = ['item_type', 'label', 'url', 'icon', 'order_index', 'is_active']


class DepartmentSidebarBulkSerializer(serializers.Serializer):
    """Accepts a list of items to set/replace the full sidebar configuration."""
    items = DepartmentSidebarItemWriteSerializer(many=True)


class OrgTeamCreateSerializer(serializers.Serializer):
    name        = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, default='', allow_blank=True)
    team_type   = serializers.ChoiceField(choices=OrgTeam.TeamType.choices,
                                          default=OrgTeam.TeamType.SQUAD)


class OrgGroupCreateSerializer(serializers.Serializer):
    name        = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, default='', allow_blank=True)


# ── Enterprise Send Domain ────────────────────────────────────────────────────

class EnterpriseSendDomainSerializer(serializers.ModelSerializer):
    class Meta:
        model  = EnterpriseSendDomain
        fields = [
            'id', 'organization', 'domain', 'status', 'dkim_record',
            'spf_record', 'tracking_domain', 'selector',
            'last_checked_at', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'organization', 'status', 'dkim_record', 'spf_record',
            'last_checked_at', 'created_at', 'updated_at',
        ]


class CreateSendDomainSerializer(serializers.Serializer):
    domain          = serializers.CharField(max_length=253)
    tracking_domain = serializers.CharField(max_length=253, required=False, default='')
    selector        = serializers.CharField(max_length=64, required=False, default='s1')


# ── Email Sender Identity ─────────────────────────────────────────────────────

class EmailSenderIdentitySerializer(serializers.ModelSerializer):
    class Meta:
        model  = EmailSenderIdentity
        fields = [
            'id', 'organization', 'email', 'name', 'verified',
            'verified_at', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'organization', 'verified', 'verified_at',
                            'verify_token', 'created_at', 'updated_at']


class CreateSenderIdentitySerializer(serializers.Serializer):
    email = serializers.EmailField()
    name  = serializers.CharField(max_length=255)


# ── Email Template ────────────────────────────────────────────────────────────

class EnterpriseEmailTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = EnterpriseEmailTemplate
        fields = [
            'id', 'organization', 'name', 'subject', 'html_body',
            'text_body', 'variables', 'created_by',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'organization', 'created_at', 'updated_at']


# ── Email Log ─────────────────────────────────────────────────────────────────

class EmailLogSerializer(serializers.ModelSerializer):
    class Meta:
        model  = EmailLog
        fields = [
            'id', 'organization', 'campaign_id', 'to_email', 'from_email',
            'subject', 'status', 'provider_message_id', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'organization', 'created_at', 'updated_at']


# ── Org Domain ───────────────────────────────────────────────────────────────

class OrgDomainRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model  = OrgDomainRecord
        fields = [
            'id', 'domain', 'type', 'name', 'value', 'ttl',
            'managed_by_platform', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'domain', 'created_at', 'updated_at']


class OrgDomainSerializer(serializers.ModelSerializer):
    records      = OrgDomainRecordSerializer(many=True, read_only=True)
    record_count = serializers.SerializerMethodField()

    class Meta:
        model  = OrgDomain
        fields = [
            'id', 'organization', 'name', 'type', 'status',
            'linked_apps', 'record_count', 'records',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'organization', 'created_at', 'updated_at']

    def get_record_count(self, obj):
        return obj.records.count()


class CreateOrgDomainSerializer(serializers.Serializer):
    name       = serializers.CharField(max_length=253)
    type       = serializers.ChoiceField(choices=OrgDomain.Type.choices,
                                         default=OrgDomain.Type.MIXED)


# ── Branding ──────────────────────────────────────────────────────────────────

class BrandAssetSerializer(serializers.ModelSerializer):
    class Meta:
        model  = BrandAsset
        fields = [
            'id', 'branding_profile', 'type', 'url', 'label',
            'file_size_bytes', 'mime_type', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'branding_profile', 'created_at', 'updated_at']


class BrandingProfileSerializer(serializers.ModelSerializer):
    assets = BrandAssetSerializer(many=True, read_only=True)

    class Meta:
        model  = BrandingProfile
        fields = [
            'id', 'organization', 'name',
            'primary_color', 'secondary_color', 'accent_color',
            'logo_url', 'favicon_url', 'font_family', 'custom_css',
            'assets', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'organization', 'created_at', 'updated_at']


# ── Enterprise Plan & Subscription ───────────────────────────────────────────

class EnterprisePlanSerializer(serializers.ModelSerializer):
    class Meta:
        model  = EnterprisePlan
        fields = [
            'id', 'name', 'price_monthly', 'price_yearly',
            'limits', 'features', 'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SubscriptionSerializer(serializers.ModelSerializer):
    plan = EnterprisePlanSerializer(read_only=True)

    class Meta:
        model  = Subscription
        fields = [
            'id', 'organization', 'plan', 'status', 'renewal_date',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'organization', 'created_at', 'updated_at']


class EnterpriseInvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model  = EnterpriseInvoice
        fields = [
            'id', 'organization', 'amount', 'currency', 'status',
            'period_start', 'period_end', 'pdf_url',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'organization', 'created_at', 'updated_at']


# ── Audit Log ────────────────────────────────────────────────────────────────

class EnterpriseAuditLogSerializer(serializers.ModelSerializer):
    actor_name  = serializers.SerializerMethodField()

    class Meta:
        model  = EnterpriseAuditLog
        fields = [
            'id', 'organization', 'actor_member', 'actor_email', 'actor_name',
            'action', 'target_type', 'target_id', 'target_label',
            'metadata', 'ip_address', 'timestamp',
        ]
        read_only_fields = [
            'id', 'organization', 'actor_member', 'actor_email',
            'action', 'target_type', 'target_id', 'target_label',
            'metadata', 'ip_address', 'timestamp',
        ]

    def get_actor_name(self, obj):
        if obj.actor_member:
            return obj.actor_member.name or obj.actor_member.email
        return obj.actor_email or 'System'


# ── Wiki ─────────────────────────────────────────────────────────────────────

class WikiCategorySerializer(serializers.ModelSerializer):
    page_count = serializers.SerializerMethodField()

    class Meta:
        model  = WikiCategory
        fields = ['id', 'organization', 'name', 'color', 'description',
                  'page_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'organization', 'page_count', 'created_at', 'updated_at']

    def get_page_count(self, obj):
        return obj.pages.count()


class WikiPageListSerializer(serializers.ModelSerializer):
    """Compact serializer for list views (no content body)."""
    categories   = WikiCategorySerializer(many=True, read_only=True)
    created_by_name = serializers.SerializerMethodField()
    updated_by_name = serializers.SerializerMethodField()

    class Meta:
        model  = WikiPage
        fields = [
            'id', 'organization', 'title', 'slug', 'summary',
            'is_pinned', 'view_count', 'tags', 'categories',
            'linked_module', 'created_by_name', 'updated_by_name',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'organization', 'view_count', 'created_at', 'updated_at']

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return ''

    def get_updated_by_name(self, obj):
        if obj.updated_by:
            return obj.updated_by.get_full_name() or obj.updated_by.username
        return ''


class WikiPageDetailSerializer(WikiPageListSerializer):
    """Full serializer including markdown content."""

    class Meta(WikiPageListSerializer.Meta):
        fields = WikiPageListSerializer.Meta.fields + ['content']


class WikiPageVersionSerializer(serializers.ModelSerializer):
    edited_by_name = serializers.SerializerMethodField()

    class Meta:
        model  = WikiPageVersion
        fields = ['id', 'page', 'title', 'content', 'edited_by_name',
                  'edited_at', 'version_note']
        read_only_fields = ['id', 'page', 'edited_at']

    def get_edited_by_name(self, obj):
        if obj.edited_by:
            return obj.edited_by.get_full_name() or obj.edited_by.username
        return 'System'


class WikiPageWriteSerializer(serializers.Serializer):
    title         = serializers.CharField(max_length=255)
    slug          = serializers.SlugField(max_length=255, required=False, allow_blank=True)
    content       = serializers.CharField(required=False, default='', allow_blank=True)
    summary       = serializers.CharField(max_length=500, required=False,
                                          default='', allow_blank=True)
    is_pinned     = serializers.BooleanField(required=False, default=False)
    tags          = serializers.ListField(
                        child=serializers.CharField(max_length=50),
                        required=False, default=list)
    category_ids  = serializers.ListField(
                        child=serializers.CharField(max_length=36),
                        required=False, default=list)
    linked_module = serializers.CharField(max_length=50, required=False,
                                          default='', allow_blank=True)
    version_note  = serializers.CharField(max_length=255, required=False,
                                          default='', allow_blank=True)


class WikiCategoryWriteSerializer(serializers.Serializer):
    name        = serializers.CharField(max_length=120)
    color       = serializers.CharField(max_length=20, required=False, default='#3b82f6')
    description = serializers.CharField(required=False, default='', allow_blank=True)


# ── Integrations ──────────────────────────────────────────────────────────────

class IntegrationConnectionSerializer(serializers.ModelSerializer):
    connected_by_name = serializers.SerializerMethodField()

    class Meta:
        model  = IntegrationConnection
        fields = [
            'id', 'organization', 'provider', 'display_name', 'category',
            'status', 'config', 'last_sync', 'last_error',
            'total_calls', 'error_count',
            'connected_by_name', 'webhook_secret',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'organization', 'total_calls', 'error_count',
            'last_sync', 'last_error', 'connected_by_name',
            'webhook_secret', 'created_at', 'updated_at',
        ]

    def get_connected_by_name(self, obj):
        if obj.connected_by:
            return obj.connected_by.get_full_name() or obj.connected_by.username
        return ''


class IntegrationConnectionWriteSerializer(serializers.Serializer):
    provider     = serializers.CharField(max_length=80)
    display_name = serializers.CharField(max_length=120, required=False, default='', allow_blank=True)
    category     = serializers.CharField(max_length=50, required=False, default='other')
    credentials  = serializers.DictField(required=False, default=dict)
    config       = serializers.DictField(required=False, default=dict)


class IntegrationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model  = IntegrationLog
        fields = [
            'id', 'provider', 'event_type', 'level', 'message',
            'http_status', 'duration_ms', 'retry_count',
            'correlation_id', 'timestamp',
        ]
        read_only_fields = fields


class IntegrationWebhookEventSerializer(serializers.ModelSerializer):
    class Meta:
        model  = IntegrationWebhookEvent
        fields = [
            'id', 'provider', 'event_type', 'event_id',
            'payload', 'normalized', 'processed', 'processing_error',
            'received_at',
        ]
        read_only_fields = fields
