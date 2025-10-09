from rest_framework import serializers
from .models import MarketplaceApp


class MarketplaceAppSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketplaceApp
        fields = ['id', 'name', 'slug', 'description', 'pub_url', 'logo_url', 'metadata', 'enabled', 'created_at', 'updated_at']
