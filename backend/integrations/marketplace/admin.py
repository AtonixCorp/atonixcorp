from django.contrib import admin
from .models import MarketplaceApp


@admin.register(MarketplaceApp)
class MarketplaceAppAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'slug', 'enabled', 'created_at')
    search_fields = ('name', 'slug')
    actions = ['approve_app']

    def approve_app(self, request, queryset):
        queryset.update(enabled=True)
    approve_app.short_description = 'Approve selected apps'
