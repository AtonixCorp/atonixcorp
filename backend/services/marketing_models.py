# AtonixCorp Cloud – Email Marketing Models
# Campaigns, contact lists, templates, automations, and analytics.

import uuid
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from .base_models import TimeStampedModel, ResourceModel


# ── Contact List ──────────────────────────────────────────────────────────────

class ContactList(ResourceModel):
    """A named list of subscriber contacts."""
    STATUSES = [
        ('active',   'Active'),
        ('archived', 'Archived'),
    ]
    status      = models.CharField(max_length=20, choices=STATUSES, default='active')
    description = models.TextField(blank=True)
    double_optin = models.BooleanField(default=False,
                                       help_text='Require email confirmation on subscribe')

    class Meta:
        verbose_name = 'Contact List'
        ordering     = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.resource_id:
            self.resource_id = f'lst-{uuid.uuid4().hex[:12]}'
        super().save(*args, **kwargs)

    @property
    def subscriber_count(self):
        return self.contacts.filter(status='subscribed').count()

    def __str__(self):
        return self.name


# ── Contact ───────────────────────────────────────────────────────────────────

class Contact(TimeStampedModel):
    """A single email subscriber."""
    STATUSES = [
        ('subscribed',   'Subscribed'),
        ('unsubscribed', 'Unsubscribed'),
        ('bounced',      'Bounced'),
        ('complained',   'Complained'),
        ('pending',      'Pending Confirmation'),
    ]

    contact_list = models.ForeignKey(ContactList, on_delete=models.CASCADE,
                                     related_name='contacts')
    email        = models.EmailField(db_index=True)
    first_name   = models.CharField(max_length=100, blank=True)
    last_name    = models.CharField(max_length=100, blank=True)
    status       = models.CharField(max_length=20, choices=STATUSES,
                                    default='subscribed')
    custom_fields = models.JSONField(default=dict,
                                     help_text='Extra fields: company, phone, etc.')
    subscribed_at  = models.DateTimeField(auto_now_add=True)
    unsubscribed_at = models.DateTimeField(null=True, blank=True)
    ip_address     = models.GenericIPAddressField(null=True, blank=True)
    tags           = models.JSONField(default=list)

    class Meta:
        unique_together = ('contact_list', 'email')
        ordering        = ['-created_at']

    @property
    def full_name(self):
        return f'{self.first_name} {self.last_name}'.strip() or self.email

    def __str__(self):
        return f'{self.email} ({self.status})'


# ── Email Template ────────────────────────────────────────────────────────────

class EmailTemplate(ResourceModel):
    """Reusable HTML email templates."""
    CATEGORIES = [
        ('newsletter',   'Newsletter'),
        ('promotional',  'Promotional'),
        ('transactional','Transactional'),
        ('welcome',      'Welcome'),
        ('announcement', 'Announcement'),
        ('custom',       'Custom'),
    ]

    category       = models.CharField(max_length=30, choices=CATEGORIES,
                                      default='newsletter')
    subject        = models.CharField(max_length=255)
    preview_text   = models.CharField(max_length=255, blank=True,
                                      help_text='Short preview shown in inbox')
    html_body      = models.TextField(help_text='Full HTML email body')
    text_body      = models.TextField(blank=True,
                                      help_text='Plain-text fallback')
    thumbnail_url  = models.URLField(blank=True)
    is_active      = models.BooleanField(default=True)
    variables      = models.JSONField(default=list,
                                      help_text='List of merge-tag variable names')

    class Meta:
        verbose_name = 'Email Template'
        ordering     = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.resource_id:
            self.resource_id = f'tpl-{uuid.uuid4().hex[:12]}'
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.name} ({self.category})'


# ── Campaign ──────────────────────────────────────────────────────────────────

class Campaign(ResourceModel):
    """An email marketing campaign."""
    STATUSES = [
        ('draft',       'Draft'),
        ('scheduled',   'Scheduled'),
        ('sending',     'Sending'),
        ('sent',        'Sent'),
        ('paused',      'Paused'),
        ('cancelled',   'Cancelled'),
        ('error',       'Error'),
    ]
    TYPES = [
        ('regular',     'Regular'),
        ('ab_test',     'A/B Test'),
        ('automated',   'Automated'),
        ('rss',         'RSS Campaign'),
    ]

    status          = models.CharField(max_length=20, choices=STATUSES, default='draft')
    campaign_type   = models.CharField(max_length=20, choices=TYPES, default='regular')

    # Sender
    from_name       = models.CharField(max_length=100)
    from_email      = models.EmailField()
    reply_to        = models.EmailField(blank=True)

    # Content
    subject         = models.CharField(max_length=255)
    preview_text    = models.CharField(max_length=255, blank=True)
    template        = models.ForeignKey(EmailTemplate, on_delete=models.SET_NULL,
                                        null=True, blank=True, related_name='campaigns')
    html_body       = models.TextField(blank=True)
    text_body       = models.TextField(blank=True)

    # Audience
    contact_lists   = models.ManyToManyField(ContactList, blank=True,
                                              related_name='campaigns')

    # Scheduling
    scheduled_at    = models.DateTimeField(null=True, blank=True)
    sent_at         = models.DateTimeField(null=True, blank=True)

    # Tracking
    track_opens     = models.BooleanField(default=True)
    track_clicks    = models.BooleanField(default=True)
    google_analytics = models.BooleanField(default=False)
    utm_source      = models.CharField(max_length=100, blank=True)
    utm_medium      = models.CharField(max_length=100, default='email', blank=True)
    utm_campaign    = models.CharField(max_length=100, blank=True)

    class Meta:
        verbose_name = 'Campaign'
        ordering     = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.resource_id:
            self.resource_id = f'cmp-{uuid.uuid4().hex[:12]}'
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.name} [{self.status}]'


# ── Campaign Analytics ────────────────────────────────────────────────────────

class CampaignAnalytics(TimeStampedModel):
    """Aggregate delivery/engagement metrics for a Campaign."""
    campaign        = models.OneToOneField(Campaign, on_delete=models.CASCADE,
                                           related_name='analytics')
    total_sent      = models.PositiveIntegerField(default=0)
    delivered       = models.PositiveIntegerField(default=0)
    bounced         = models.PositiveIntegerField(default=0)
    hard_bounces    = models.PositiveIntegerField(default=0)
    soft_bounces    = models.PositiveIntegerField(default=0)
    opens           = models.PositiveIntegerField(default=0)
    unique_opens    = models.PositiveIntegerField(default=0)
    clicks          = models.PositiveIntegerField(default=0)
    unique_clicks   = models.PositiveIntegerField(default=0)
    unsubscribes    = models.PositiveIntegerField(default=0)
    complaints      = models.PositiveIntegerField(default=0)
    # Enriched link-click breakdown
    link_clicks     = models.JSONField(default=dict,
                                       help_text='url → click count')
    last_synced_at  = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name_plural = 'Campaign Analytics'

    @property
    def open_rate(self):
        base = self.delivered or self.total_sent
        return round(self.unique_opens / base * 100, 2) if base else 0.0

    @property
    def click_rate(self):
        base = self.delivered or self.total_sent
        return round(self.unique_clicks / base * 100, 2) if base else 0.0

    @property
    def bounce_rate(self):
        if not self.total_sent:
            return 0.0
        return round(self.bounced / self.total_sent * 100, 2)

    @property
    def unsubscribe_rate(self):
        base = self.delivered or self.total_sent
        return round(self.unsubscribes / base * 100, 2) if base else 0.0


# ── Send Event (per-recipient tracking) ──────────────────────────────────────

class SendEvent(TimeStampedModel):
    """Individual delivery / engagement event for a campaign + contact."""
    EVENT_TYPES = [
        ('sent',        'Sent'),
        ('delivered',   'Delivered'),
        ('opened',      'Opened'),
        ('clicked',     'Clicked'),
        ('bounced',     'Bounced'),
        ('unsubscribed','Unsubscribed'),
        ('complained',  'Complained'),
    ]
    campaign  = models.ForeignKey(Campaign, on_delete=models.CASCADE,
                                  related_name='send_events')
    contact   = models.ForeignKey(Contact, on_delete=models.CASCADE,
                                  related_name='send_events')
    event     = models.CharField(max_length=20, choices=EVENT_TYPES)
    metadata  = models.JSONField(default=dict, help_text='url, user_agent, ip, etc.')

    class Meta:
        ordering = ['-created_at']


# ── Automation ────────────────────────────────────────────────────────────────

class Automation(ResourceModel):
    """
    Simple email automation sequence.
    e.g. Welcome series, drip campaigns.
    """
    TRIGGERS = [
        ('subscribe',       'On Subscribe'),
        ('unsubscribe',     'On Unsubscribe'),
        ('date_field',      'On Date Field'),
        ('campaign_open',   'On Campaign Open'),
        ('campaign_click',  'On Campaign Click'),
        ('manual',          'Manual Trigger'),
    ]

    trigger         = models.CharField(max_length=30, choices=TRIGGERS,
                                       default='subscribe')
    contact_list    = models.ForeignKey(ContactList, on_delete=models.SET_NULL,
                                        null=True, blank=True, related_name='automations')
    is_active       = models.BooleanField(default=False)
    steps           = models.JSONField(default=list,
                                       help_text=(
                                           'Ordered list of steps: '
                                           '[{delay_days, subject, html_body, from_email}]'
                                       ))

    class Meta:
        verbose_name = 'Automation'
        ordering     = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.resource_id:
            self.resource_id = f'aut-{uuid.uuid4().hex[:12]}'
        super().save(*args, **kwargs)
