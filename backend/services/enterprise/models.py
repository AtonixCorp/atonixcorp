# AtonixCorp – Enterprise Module Models
# All models are scoped to an Organization (multi-tenant anchor).
# Modules: Organization, Email Sending, Domains, Branding, Billing, Audit/Compliance.

import uuid
from django.db import models
from django.contrib.auth.models import User
from ..core.base_models import TimeStampedModel


# ── Helpers ───────────────────────────────────────────────────────────────────

def _uid(prefix: str) -> str:
    return f'{prefix}-{uuid.uuid4().hex[:12]}'

# Named default functions (required so Django migrations can serialize them)
def _org_id():   return _uid('org')
def _mbr_id():   return _uid('mbr')
def _sed_id():   return _uid('sed')
def _esi_id():   return _uid('esi')
def _etpl_id():  return _uid('etpl')
def _elog_id():  return _uid('elog')
def _odom_id():  return _uid('odom')
def _drec_id():  return _uid('drec')
def _brnd_id():  return _uid('brnd')
def _bast_id():  return _uid('bast')
def _plan_id():  return _uid('plan')
def _sub_id():   return _uid('sub')
def _einv_id():  return _uid('einv')
def _aud_id():   return _uid('aud')
def _dept_id():  return _uid('dept')
def _team_id():  return _uid('team')
def _grp_id():   return _uid('grp')
def _dsbi_id():  return _uid('dsbi')
def _wpage_id(): return _uid('wp')
def _wcat_id():  return _uid('wcat')
def _wver_id():  return _uid('wver')
def _intc_id():  return _uid('intc')
def _intl_id():  return _uid('intl')
def _intwh_id(): return _uid('intwh')


# ═══════════════════════════════════════════════════════════════════════════════
# 1. ORGANIZATION (tenant anchor)
# ═══════════════════════════════════════════════════════════════════════════════

class Organization(TimeStampedModel):
    """Root tenant entity for the Enterprise system."""

    class Status(models.TextChoices):
        ACTIVE    = 'ACTIVE',    'Active'
        SUSPENDED = 'SUSPENDED', 'Suspended'
        TRIAL     = 'TRIAL',     'Trial'

    id             = models.CharField(max_length=36, primary_key=True,
                                      default=_org_id, editable=False)
    owner          = models.ForeignKey(User, on_delete=models.CASCADE,
                                       related_name='owned_organizations')
    name           = models.CharField(max_length=255, db_index=True)
    slug           = models.SlugField(max_length=100, unique=True, db_index=True)
    primary_domain = models.CharField(max_length=253, blank=True)
    industry       = models.CharField(max_length=100, blank=True)
    country        = models.CharField(max_length=64,  blank=True)
    plan           = models.CharField(max_length=64,  default='Enterprise')
    status         = models.CharField(max_length=20,  choices=Status.choices,
                                      default=Status.TRIAL)
    contact_email  = models.EmailField(blank=True, default='')
    domain_email   = models.EmailField(blank=True, default='',
                                       help_text='Primary organization email, e.g. admin@acme.com')
    logo_url       = models.URLField(blank=True, default='')
    class Meta:
        verbose_name = 'Organization'

    def __str__(self):
        return f'{self.name} ({self.slug})'


# ── Organization Member ───────────────────────────────────────────────────────

class OrganizationMember(TimeStampedModel):

    class Role(models.TextChoices):
        OWNER   = 'OWNER',   'Owner'
        ADMIN   = 'ADMIN',   'Admin'
        MANAGER = 'MANAGER', 'Manager'
        MEMBER  = 'MEMBER',  'Member'
        VIEWER  = 'VIEWER',  'Viewer'

    class Status(models.TextChoices):
        ACTIVE    = 'ACTIVE',    'Active'
        INVITED   = 'INVITED',   'Invited'
        SUSPENDED = 'SUSPENDED', 'Suspended'

    id           = models.CharField(max_length=36, primary_key=True,
                                    default=_mbr_id, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE,
                                     related_name='members')
    user         = models.ForeignKey(User, on_delete=models.SET_NULL,
                                     null=True, blank=True, related_name='org_memberships')
    email        = models.EmailField(db_index=True)
    name         = models.CharField(max_length=255, blank=True)
    role         = models.CharField(max_length=20, choices=Role.choices, default=Role.MEMBER)
    status       = models.CharField(max_length=20, choices=Status.choices, default=Status.INVITED)
    joined_at    = models.DateTimeField(null=True, blank=True)
    invited_at   = models.DateTimeField(auto_now_add=True)
    # Module-level permissions override
    permissions  = models.JSONField(default=dict,
                                    help_text='Per-module permission overrides')

    class Meta:
        unique_together = ('organization', 'email')
        verbose_name = 'Organization Member'

    def __str__(self):
        return f'{self.email} @ {self.organization.slug} [{self.role}]'


# ═══════════════════════════════════════════════════════════════════════════════
# 1b. HIERARCHY: DEPARTMENT → TEAM → GROUP
# ═══════════════════════════════════════════════════════════════════════════════

class Department(TimeStampedModel):
    """A department inside an Organization."""
    DEPT_CATEGORIES = [
        # Business
        ('Administration', 'Administration'),
        ('Finance', 'Finance'),
        ('Human Resources (HR)', 'Human Resources (HR)'),
        ('Legal & Compliance', 'Legal & Compliance'),
        ('Operations', 'Operations'),
        ('Procurement', 'Procurement'),
        ('Sales', 'Sales'),
        ('Marketing', 'Marketing'),
        ('Customer Support', 'Customer Support'),
        ('Product Management', 'Product Management'),
        ('Business Development', 'Business Development'),
        ('Partnerships & Alliances', 'Partnerships & Alliances'),
        ('Public Relations / Communications', 'Public Relations / Communications'),
        ('Strategy & Planning', 'Strategy & Planning'),
        ('Investor Relations', 'Investor Relations'),
        # Technical
        ('Engineering / Software Development', 'Engineering / Software Development'),
        ('IT & Infrastructure', 'IT & Infrastructure'),
        ('Security / Cybersecurity', 'Security / Cybersecurity'),
        ('Research & Development (R&D)', 'Research & Development (R&D)'),
        ('Data & Analytics', 'Data & Analytics'),
        ('Quality Assurance', 'Quality Assurance'),
        ('Computing & Technology', 'Computing & Technology'),
        # Creative
        ('Design / Creative', 'Design / Creative'),
        ('Media & Content', 'Media & Content'),
        ('Training & Learning', 'Training & Learning'),
        ('Education & Training', 'Education & Training'),
        # Operations / Physical
        ('Manufacturing / Production', 'Manufacturing / Production'),
        ('Logistics / Supply Chain', 'Logistics / Supply Chain'),
        ('Facilities / Maintenance', 'Facilities / Maintenance'),
        ('Health & Safety', 'Health & Safety'),
        ('Construction & Architecture', 'Construction & Architecture'),
        ('Transportation', 'Transportation'),
        # Industry-specific
        ('Science & Research', 'Science & Research'),
        ('Medical / Healthcare', 'Medical / Healthcare'),
        ('Government & Public Sector', 'Government & Public Sector'),
        ('Nonprofit / NGO', 'Nonprofit / NGO'),
        ('Hospitality & Tourism', 'Hospitality & Tourism'),
        ('Real Estate', 'Real Estate'),
        ('Energy & Environment', 'Energy & Environment'),
        ('Agriculture', 'Agriculture'),
        ('Retail & E-commerce', 'Retail & E-commerce'),
        ('Sports & Entertainment', 'Sports & Entertainment'),
        ('Other', 'Other'),
    ]

    id              = models.CharField(max_length=36, primary_key=True, default=_dept_id, editable=False)
    organization    = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='departments')
    name            = models.CharField(max_length=255)
    category        = models.CharField(max_length=100, blank=True)
    description     = models.TextField(blank=True)
    department_lead = models.CharField(max_length=255, blank=True)
    parent          = models.ForeignKey(
                        'self', null=True, blank=True,
                        on_delete=models.SET_NULL,
                        related_name='sub_departments',
                      )

    class Meta:
        unique_together = ('organization', 'name')
        verbose_name = 'Department'
        ordering = ['name']

    def __str__(self):
        return f'{self.name} @ {self.organization.slug}'


class OrgTeam(TimeStampedModel):
    """A team inside a Department."""

    class TeamType(models.TextChoices):
        DEPARTMENT = 'DEPARTMENT', 'Department'
        FUNCTION   = 'FUNCTION',   'Function'
        SQUAD      = 'SQUAD',      'Squad'

    id          = models.CharField(max_length=36, primary_key=True, default=_team_id, editable=False)
    department  = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='teams')
    name        = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    team_type   = models.CharField(max_length=20, choices=TeamType.choices, default=TeamType.SQUAD)

    class Meta:
        unique_together = ('department', 'name')
        verbose_name = 'Team'
        ordering = ['name']

    def __str__(self):
        return f'{self.name} @ {self.department.name}'


class OrgGroup(TimeStampedModel):
    """A group inside a Team."""
    id          = models.CharField(max_length=36, primary_key=True, default=_grp_id, editable=False)
    team        = models.ForeignKey(OrgTeam, on_delete=models.CASCADE, related_name='groups')
    name        = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    owner       = models.CharField(max_length=255, blank=True)

    class Meta:
        unique_together = ('team', 'name')
        verbose_name = 'Group'
        ordering = ['name']

    def __str__(self):
        return f'{self.name} @ {self.team.name}'


# ── Department Sidebar Item ───────────────────────────────────────────────────

class DepartmentSidebarItem(TimeStampedModel):
    """
    A configurable sidebar entry scoped to one Department.
    Admins can reorder, toggle, rename, and add custom links.
    """

    class ItemType(models.TextChoices):
        NAVIGATION = 'navigation', 'Navigation'
        ACTION     = 'action',     'Quick Action'
        RESOURCE   = 'resource',   'Resource'
        HIGHLIGHT  = 'highlight',  'Highlight'
        CUSTOM     = 'custom',     'Custom Link'

    id          = models.CharField(max_length=36, primary_key=True, default=_dsbi_id, editable=False)
    department  = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='sidebar_items')
    item_type   = models.CharField(max_length=20, choices=ItemType.choices, default=ItemType.NAVIGATION)
    label       = models.CharField(max_length=100)
    url         = models.CharField(max_length=500, blank=True, default='')
    icon        = models.CharField(max_length=100, blank=True, default='')
    order_index = models.PositiveIntegerField(default=0)
    is_active   = models.BooleanField(default=True)

    class Meta:
        ordering = ['item_type', 'order_index']
        verbose_name = 'Department Sidebar Item'

    def __str__(self):
        return f'{self.item_type}:{self.label} @ {self.department.name}'


# ═══════════════════════════════════════════════════════════════════════════════
# 2. EMAIL SERVICE (sending domains, identities, templates, logs)
# ═══════════════════════════════════════════════════════════════════════════════

class EnterpriseSendDomain(TimeStampedModel):
    """
    A sending domain for transactional / marketing email.
    Entirely separate from the cloud mailbox EmailDomain.
    """

    class Status(models.TextChoices):
        PENDING_DNS = 'PENDING_DNS', 'Pending DNS'
        VERIFIED    = 'VERIFIED',    'Verified'
        FAILED      = 'FAILED',      'Failed'

    id               = models.CharField(max_length=36, primary_key=True,
                                        default=_sed_id, editable=False)
    organization     = models.ForeignKey(Organization, on_delete=models.CASCADE,
                                         related_name='send_domains')
    domain           = models.CharField(max_length=253, db_index=True)
    status           = models.CharField(max_length=20, choices=Status.choices,
                                        default=Status.PENDING_DNS)
    dkim_record      = models.TextField(blank=True,
                                        help_text='Full TXT record value for DKIM')
    spf_record       = models.TextField(blank=True,
                                        help_text='TXT value for SPF')
    tracking_domain  = models.CharField(max_length=253, blank=True,
                                        help_text='Subdomain for open/click tracking')
    selector         = models.CharField(max_length=64, default='s1')
    last_checked_at  = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('organization', 'domain')
        verbose_name = 'Enterprise Send Domain'

    def __str__(self):
        return f'{self.domain} ({self.status})'

    def generate_dns_records(self):
        """Populate dkim_record + spf_record based on selector and domain."""
        if not self.dkim_record:
            self.dkim_record = (
                f'{self.selector}._domainkey.{self.domain} IN TXT '
                f'"v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQ"'
            )
        if not self.spf_record:
            self.spf_record = f'v=spf1 include:mail.atonixcorp.com ~all'


class EmailSenderIdentity(TimeStampedModel):
    """A verified sender (From address) for enterprise email sending."""

    id           = models.CharField(max_length=36, primary_key=True,
                                    default=_esi_id, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE,
                                     related_name='sender_identities')
    email        = models.EmailField()
    name         = models.CharField(max_length=255)
    verified     = models.BooleanField(default=False)
    verify_token = models.CharField(max_length=64, blank=True)
    verified_at  = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('organization', 'email')
        verbose_name = 'Email Sender Identity'

    def __str__(self):
        return f'{self.name} <{self.email}>'


class EnterpriseEmailTemplate(TimeStampedModel):
    """HTML/text email template with variable substitution."""

    id               = models.CharField(max_length=36, primary_key=True,
                                        default=_etpl_id, editable=False)
    organization     = models.ForeignKey(Organization, on_delete=models.CASCADE,
                                         related_name='email_templates')
    name             = models.CharField(max_length=255)
    subject          = models.CharField(max_length=998)
    html_body        = models.TextField(blank=True)
    text_body        = models.TextField(blank=True)
    variables        = models.JSONField(default=list,
                                        help_text='List of variable names used in template')
    created_by       = models.ForeignKey(OrganizationMember, on_delete=models.SET_NULL,
                                         null=True, blank=True, related_name='created_templates')

    class Meta:
        unique_together = ('organization', 'name')
        verbose_name = 'Enterprise Email Template'

    def __str__(self):
        return f'{self.name} ({self.organization.slug})'


class EmailLog(TimeStampedModel):
    """Record of every outbound email sent through the Enterprise system."""

    class Status(models.TextChoices):
        QUEUED  = 'QUEUED',  'Queued'
        SENT    = 'SENT',    'Sent'
        FAILED  = 'FAILED',  'Failed'
        BOUNCED = 'BOUNCED', 'Bounced'
        OPENED  = 'OPENED',  'Opened'
        CLICKED = 'CLICKED', 'Clicked'

    id                  = models.CharField(max_length=36, primary_key=True,
                                           default=_elog_id, editable=False)
    organization        = models.ForeignKey(Organization, on_delete=models.CASCADE,
                                            related_name='email_logs')
    campaign_id         = models.CharField(max_length=128, blank=True, db_index=True)
    to_email            = models.EmailField()
    from_email          = models.EmailField()
    subject             = models.CharField(max_length=998)
    status              = models.CharField(max_length=20, choices=Status.choices,
                                           default=Status.QUEUED)
    provider_message_id = models.CharField(max_length=255, blank=True)
    metadata            = models.JSONField(default=dict)

    class Meta:
        verbose_name = 'Email Log'
        ordering = ['-created_at']
        indexes = [models.Index(fields=['organization', '-created_at'])]

    def __str__(self):
        return f'→{self.to_email} [{self.status}]'


# ═══════════════════════════════════════════════════════════════════════════════
# 3. DOMAINS (org-scoped, separate from cloud DNS management)
# ═══════════════════════════════════════════════════════════════════════════════

class OrgDomain(TimeStampedModel):
    """A domain registered or associated with an organization."""

    class Type(models.TextChoices):
        APP       = 'APP',       'Application'
        MARKETING = 'MARKETING', 'Marketing'
        EMAIL     = 'EMAIL',     'Email'
        MIXED     = 'MIXED',     'Mixed'

    class Status(models.TextChoices):
        PENDING_DNS = 'PENDING_DNS', 'Pending DNS'
        ACTIVE      = 'ACTIVE',      'Active'
        FAILED      = 'FAILED',      'Failed'

    id           = models.CharField(max_length=36, primary_key=True,
                                    default=_odom_id, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE,
                                     related_name='org_domains')
    name         = models.CharField(max_length=253, db_index=True)
    type         = models.CharField(max_length=20, choices=Type.choices, default=Type.MIXED)
    status       = models.CharField(max_length=20, choices=Status.choices,
                                    default=Status.PENDING_DNS)
    linked_apps  = models.JSONField(default=list,
                                    help_text='List of app/service names this domain is linked to')

    class Meta:
        unique_together = ('organization', 'name')
        verbose_name = 'Organization Domain'

    def __str__(self):
        return f'{self.name} ({self.organization.slug})'


class OrgDomainRecord(TimeStampedModel):
    """DNS-style record associated with an OrgDomain."""

    class RecordType(models.TextChoices):
        A     = 'A',     'A'
        CNAME = 'CNAME', 'CNAME'
        TXT   = 'TXT',   'TXT'
        MX    = 'MX',    'MX'

    id                  = models.CharField(max_length=36, primary_key=True,
                                           default=_drec_id, editable=False)
    domain              = models.ForeignKey(OrgDomain, on_delete=models.CASCADE,
                                            related_name='records')
    type                = models.CharField(max_length=10, choices=RecordType.choices)
    name                = models.CharField(max_length=253)
    value               = models.TextField()
    ttl                 = models.PositiveIntegerField(default=3600)
    managed_by_platform = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Domain Record'

    def __str__(self):
        return f'{self.type} {self.name} → {self.value[:40]}'


# ═══════════════════════════════════════════════════════════════════════════════
# 4. BRANDING
# ═══════════════════════════════════════════════════════════════════════════════

class BrandingProfile(TimeStampedModel):
    """Visual brand settings for an organization."""

    GOOGLE_FONTS = [
        'IBM Plex Sans', 'Inter', 'Roboto', 'Open Sans', 'Lato',
        'Montserrat', 'Nunito', 'Source Sans 3', 'Raleway',
    ]

    id              = models.CharField(max_length=36, primary_key=True,
                                       default=_brnd_id, editable=False)
    organization    = models.OneToOneField(Organization, on_delete=models.CASCADE,
                                           related_name='branding')
    name            = models.CharField(max_length=255, default='Default')
    primary_color   = models.CharField(max_length=7,  default='#153d75')
    secondary_color = models.CharField(max_length=7,  default='#1e3a5f')
    accent_color    = models.CharField(max_length=7,  default='#3b82f6')
    logo_url        = models.URLField(blank=True)
    favicon_url     = models.URLField(blank=True)
    font_family     = models.CharField(max_length=100, default='IBM Plex Sans')
    custom_css      = models.TextField(blank=True,
                                       help_text='Additional CSS injected into branded pages')

    class Meta:
        verbose_name = 'Branding Profile'

    def __str__(self):
        return f'Branding: {self.organization.slug}'


class BrandAsset(TimeStampedModel):
    """A binary asset (logo, icon, image, document) attached to a BrandingProfile."""

    class AssetType(models.TextChoices):
        LOGO     = 'LOGO',     'Logo'
        ICON     = 'ICON',     'Icon'
        IMAGE    = 'IMAGE',    'Image'
        DOCUMENT = 'DOCUMENT', 'Document'

    id              = models.CharField(max_length=36, primary_key=True,
                                       default=_bast_id, editable=False)
    branding_profile = models.ForeignKey(BrandingProfile, on_delete=models.CASCADE,
                                          related_name='assets')
    type            = models.CharField(max_length=20, choices=AssetType.choices)
    url             = models.URLField()
    label           = models.CharField(max_length=255)
    file_size_bytes = models.PositiveBigIntegerField(default=0)
    mime_type       = models.CharField(max_length=64, blank=True)

    class Meta:
        verbose_name = 'Brand Asset'

    def __str__(self):
        return f'{self.type}: {self.label}'


# ═══════════════════════════════════════════════════════════════════════════════
# 5. BILLING (org-scoped plans, subscriptions, invoices)
# ═══════════════════════════════════════════════════════════════════════════════

class EnterprisePlan(TimeStampedModel):
    """Platform-defined plan offered to enterprise organizations."""

    id            = models.CharField(max_length=36, primary_key=True,
                                     default=_plan_id, editable=False)
    name          = models.CharField(max_length=100, unique=True)
    price_monthly = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    price_yearly  = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    limits        = models.JSONField(default=dict,
                                     help_text='{"members": 500, "teams": 50, ...}')
    features      = models.JSONField(default=list,
                                     help_text='Marketing feature bullets')
    is_active     = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Enterprise Plan'

    def __str__(self):
        return self.name


class Subscription(TimeStampedModel):
    """Active subscription linking an Organization to a Plan."""

    class Status(models.TextChoices):
        ACTIVE   = 'ACTIVE',   'Active'
        TRIALING = 'TRIALING', 'Trialing'
        PAST_DUE = 'PAST_DUE', 'Past Due'
        CANCELED = 'CANCELED', 'Canceled'

    id           = models.CharField(max_length=36, primary_key=True,
                                    default=_sub_id, editable=False)
    organization = models.OneToOneField(Organization, on_delete=models.CASCADE,
                                        related_name='subscription')
    plan         = models.ForeignKey(EnterprisePlan, on_delete=models.SET_NULL,
                                     null=True, related_name='subscriptions')
    status       = models.CharField(max_length=20, choices=Status.choices,
                                    default=Status.TRIALING)
    renewal_date = models.DateField(null=True, blank=True)
    external_id  = models.CharField(max_length=128, blank=True,
                                    help_text='Stripe subscription ID etc.')

    class Meta:
        verbose_name = 'Subscription'

    def __str__(self):
        plan_name = self.plan.name if self.plan else 'No Plan'
        return f'{self.organization.slug} → {plan_name} [{self.status}]'


class EnterpriseInvoice(TimeStampedModel):
    """Invoice issued to an organization."""

    class Status(models.TextChoices):
        DUE    = 'DUE',    'Due'
        PAID   = 'PAID',   'Paid'
        FAILED = 'FAILED', 'Failed'

    id           = models.CharField(max_length=36, primary_key=True,
                                    default=_einv_id, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE,
                                     related_name='enterprise_invoices')
    amount       = models.DecimalField(max_digits=12, decimal_places=2)
    currency     = models.CharField(max_length=8, default='USD')
    status       = models.CharField(max_length=20, choices=Status.choices, default=Status.DUE)
    period_start = models.DateField()
    period_end   = models.DateField()
    pdf_url      = models.URLField(blank=True)
    external_id  = models.CharField(max_length=128, blank=True)

    class Meta:
        verbose_name = 'Enterprise Invoice'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.organization.slug} {self.period_start}→{self.period_end} ${self.amount}'


# ═══════════════════════════════════════════════════════════════════════════════
# 6. AUDIT LOG (compliance)
# ═══════════════════════════════════════════════════════════════════════════════

class EnterpriseAuditLog(models.Model):
    """Immutable record of every significant action in an organization."""

    id           = models.CharField(max_length=36, primary_key=True,
                                    default=_aud_id, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE,
                                     related_name='audit_logs')
    actor_member = models.ForeignKey(OrganizationMember, on_delete=models.SET_NULL,
                                     null=True, blank=True, related_name='audit_events')
    actor_email  = models.EmailField(blank=True,
                                     help_text='Denormalized email for deleted members')
    action       = models.CharField(max_length=100, db_index=True)
    target_type  = models.CharField(max_length=50, db_index=True, blank=True)
    target_id    = models.CharField(max_length=128, blank=True)
    target_label = models.CharField(max_length=255, blank=True)
    metadata     = models.JSONField(default=dict)
    ip_address   = models.GenericIPAddressField(null=True, blank=True)
    timestamp    = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = 'Enterprise Audit Log'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['organization', '-timestamp']),
            models.Index(fields=['organization', 'action']),
        ]

    def __str__(self):
        return f'[{self.timestamp:%Y-%m-%d}] {self.actor_email} {self.action}'


# ═══════════════════════════════════════════════════════════════════════════════
# 7. WIKI (knowledge base)
# ═══════════════════════════════════════════════════════════════════════════════

class WikiCategory(TimeStampedModel):
    """Org-scoped category for grouping wiki pages."""

    id           = models.CharField(max_length=36, primary_key=True,
                                    default=_wcat_id, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE,
                                     related_name='wiki_categories')
    name         = models.CharField(max_length=120)
    color        = models.CharField(max_length=20, default='#3b82f6',
                                    help_text='Hex color for UI badge')
    description  = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['name']
        unique_together = [('organization', 'name')]

    def __str__(self):
        return f'{self.organization.slug} / {self.name}'


class WikiPage(TimeStampedModel):
    """A knowledge base page scoped to an organization."""

    id           = models.CharField(max_length=36, primary_key=True,
                                    default=_wpage_id, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE,
                                     related_name='wiki_pages')
    title        = models.CharField(max_length=255, db_index=True)
    slug         = models.SlugField(max_length=255, db_index=True)
    content      = models.TextField(default='', blank=True,
                                    help_text='Markdown content')
    summary      = models.CharField(max_length=500, blank=True, default='',
                                    help_text='Short description / excerpt')
    is_pinned    = models.BooleanField(default=False)
    view_count   = models.PositiveIntegerField(default=0)
    tags         = models.JSONField(default=list,
                                    help_text='Free-form tag strings, e.g. ["policy","hr"]')
    categories   = models.ManyToManyField(WikiCategory, through='WikiPageCategory',
                                          blank=True, related_name='pages')
    created_by   = models.ForeignKey(User, on_delete=models.SET_NULL,
                                     null=True, blank=True, related_name='+')
    updated_by   = models.ForeignKey(User, on_delete=models.SET_NULL,
                                     null=True, blank=True, related_name='+')
    # Cross-module: optional link source label (e.g. "Compliance", "Marketing")
    linked_module = models.CharField(max_length=50, blank=True, default='')

    class Meta:
        ordering = ['-updated_at']
        unique_together = [('organization', 'slug')]
        indexes = [
            models.Index(fields=['organization', '-updated_at']),
            models.Index(fields=['organization', 'title']),
        ]

    def __str__(self):
        return f'{self.organization.slug} / {self.title}'


class WikiPageCategory(models.Model):
    """Through table linking pages to categories."""
    page     = models.ForeignKey(WikiPage,     on_delete=models.CASCADE)
    category = models.ForeignKey(WikiCategory, on_delete=models.CASCADE)

    class Meta:
        unique_together = [('page', 'category')]


class WikiPageVersion(models.Model):
    """Immutable snapshot of a WikiPage at a point in time."""

    id        = models.CharField(max_length=36, primary_key=True,
                                 default=_wver_id, editable=False)
    page      = models.ForeignKey(WikiPage, on_delete=models.CASCADE,
                                  related_name='versions')
    title     = models.CharField(max_length=255)
    content   = models.TextField(default='')
    edited_by = models.ForeignKey(User, on_delete=models.SET_NULL,
                                  null=True, blank=True, related_name='+')
    edited_at = models.DateTimeField(auto_now_add=True, db_index=True)
    version_note = models.CharField(max_length=255, blank=True, default='')

    class Meta:
        ordering = ['-edited_at']

    def __str__(self):
        return f'{self.page.title} @ {self.edited_at:%Y-%m-%d %H:%M}'


# ═══════════════════════════════════════════════════════════════════════════════
# 8. INTEGRATIONS (external service connections)
# ═══════════════════════════════════════════════════════════════════════════════

class IntegrationConnection(TimeStampedModel):
    """An org's connection to an external integration provider (Stripe, SendGrid, etc.)."""

    class Status(models.TextChoices):
        CONNECTED    = 'CONNECTED',    'Connected'
        DISCONNECTED = 'DISCONNECTED', 'Disconnected'
        ERROR        = 'ERROR',        'Error'
        PENDING      = 'PENDING',      'Pending'

    id             = models.CharField(max_length=36, primary_key=True,
                                      default=_intc_id, editable=False)
    organization   = models.ForeignKey(Organization, on_delete=models.CASCADE,
                                       related_name='integrations')
    provider       = models.CharField(max_length=80, db_index=True,
                                      help_text='e.g. stripe, sendgrid, slack')
    display_name   = models.CharField(max_length=120, blank=True, default='')
    category       = models.CharField(max_length=50, default='other',
                                      help_text='payments | email | domains | communication | development | marketing | identity | monitoring | crm | productivity | support | other')
    status         = models.CharField(max_length=20, choices=Status.choices,
                                      default=Status.DISCONNECTED, db_index=True)
    credentials    = models.JSONField(default=dict, blank=True,
                                      help_text='Encrypted-at-rest credential fields')
    config         = models.JSONField(default=dict, blank=True,
                                      help_text='Provider-specific settings')
    last_sync      = models.DateTimeField(null=True, blank=True)
    last_error     = models.TextField(blank=True, default='')
    total_calls    = models.PositiveIntegerField(default=0)
    error_count    = models.PositiveIntegerField(default=0)
    connected_by   = models.ForeignKey(User, on_delete=models.SET_NULL,
                                       null=True, blank=True, related_name='+')
    webhook_secret = models.CharField(max_length=128, blank=True, default='',
                                      help_text='HMAC secret for incoming webhooks')

    class Meta:
        ordering = ['provider']
        unique_together = [('organization', 'provider')]

    def __str__(self):
        return f'{self.organization.slug}/{self.provider} [{self.status}]'


class IntegrationLog(models.Model):
    """Append-only audit trail for all integration events."""

    class Level(models.TextChoices):
        INFO    = 'INFO',    'Info'
        SUCCESS = 'SUCCESS', 'Success'
        WARNING = 'WARNING', 'Warning'
        ERROR   = 'ERROR',   'Error'

    class EventType(models.TextChoices):
        API_CALL       = 'API_CALL',       'API Call'
        WEBHOOK        = 'WEBHOOK',        'Webhook Received'
        TOKEN_REFRESH  = 'TOKEN_REFRESH',  'Token Refresh'
        SYNC           = 'SYNC',           'Data Sync'
        CONNECT        = 'CONNECT',        'Connection'
        DISCONNECT     = 'DISCONNECT',     'Disconnection'
        TEST           = 'TEST',           'Connection Test'
        ERROR          = 'ERROR',          'Error'

    id             = models.CharField(max_length=36, primary_key=True,
                                      default=_intl_id, editable=False)
    connection     = models.ForeignKey(IntegrationConnection, on_delete=models.CASCADE,
                                       related_name='logs', null=True, blank=True)
    organization   = models.ForeignKey(Organization, on_delete=models.CASCADE,
                                       related_name='integration_logs')
    provider       = models.CharField(max_length=80, db_index=True)
    event_type     = models.CharField(max_length=30, choices=EventType.choices)
    level          = models.CharField(max_length=10, choices=Level.choices,
                                      default=Level.INFO)
    message        = models.TextField()
    request_data   = models.JSONField(default=dict, blank=True)
    response_data  = models.JSONField(default=dict, blank=True)
    http_status    = models.IntegerField(null=True, blank=True)
    duration_ms    = models.IntegerField(null=True, blank=True)
    retry_count    = models.IntegerField(default=0)
    correlation_id = models.CharField(max_length=64, blank=True, default='')
    timestamp      = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['organization', '-timestamp']),
            models.Index(fields=['organization', 'provider', '-timestamp']),
        ]

    def __str__(self):
        return f'[{self.level}] {self.provider}/{self.event_type} @ {self.timestamp:%Y-%m-%d %H:%M}'


class IntegrationWebhookEvent(models.Model):
    """Incoming webhook events from external providers."""

    id               = models.CharField(max_length=36, primary_key=True,
                                        default=_intwh_id, editable=False)
    connection       = models.ForeignKey(IntegrationConnection, on_delete=models.CASCADE,
                                         related_name='webhook_events', null=True, blank=True)
    organization     = models.ForeignKey(Organization, on_delete=models.CASCADE,
                                         related_name='webhook_events')
    provider         = models.CharField(max_length=80, db_index=True)
    event_type       = models.CharField(max_length=120)
    event_id         = models.CharField(max_length=128, blank=True, default='',
                                        help_text='Provider event ID for deduplication')
    payload          = models.JSONField(default=dict)
    normalized       = models.JSONField(default=dict)
    processed        = models.BooleanField(default=False, db_index=True)
    processing_error = models.TextField(blank=True, default='')
    received_at      = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-received_at']
        indexes = [
            models.Index(fields=['organization', 'provider', '-received_at']),
        ]

    def __str__(self):
        return f'{self.provider}/{self.event_type} [{self.id}]'
