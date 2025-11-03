from django.contrib import admin
from .models import BlockedNetwork


@admin.register(BlockedNetwork)
class BlockedNetworkAdmin(admin.ModelAdmin):
    list_display = ('value', 'is_cidr', 'active', 'note', 'created_at')
    list_filter = ('active', 'is_cidr')
    search_fields = ('value', 'note')
    ordering = ('-created_at',)
