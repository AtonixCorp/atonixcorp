from django.contrib import admin
from .models import WebhookSubscription, WebhookEvent


@admin.register(WebhookSubscription)
class WebhookSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'url', 'active', 'owner', 'created_at')
    list_filter = ('active',)
    search_fields = ('name', 'url')


@admin.register(WebhookEvent)
class WebhookEventAdmin(admin.ModelAdmin):
    list_display = ('id', 'event_type', 'subscription', 'status_code', 'created_at')
    search_fields = ('event_type',)
    readonly_fields = ('payload', 'response')
