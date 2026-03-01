from rest_framework import serializers
from .models import CloudRegion, AvailabilityZone, RegionPeer, SERVICE_CATALOG


class AvailabilityZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailabilityZone
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class CloudRegionSerializer(serializers.ModelSerializer):
    zones = AvailabilityZoneSerializer(many=True, read_only=True)
    zone_count = serializers.IntegerField(source='zones.count', read_only=True)
    cloud_type_display = serializers.CharField(source='get_cloud_type_display', read_only=True)
    connectivity_type_display = serializers.CharField(source='get_connectivity_type_display', read_only=True)
    available_services = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = CloudRegion
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_available_services(self, obj):
        """Return service catalog entries that match this region's enabled_services."""
        catalog = SERVICE_CATALOG.get(obj.cloud_type, [])
        if obj.enabled_services:
            return [s for s in catalog if s['slug'] in obj.enabled_services]
        return catalog


class CloudRegionListSerializer(serializers.ModelSerializer):
    """Lightweight serializer used in list views (no nested zones)."""
    zone_count = serializers.IntegerField(source='zones.count', read_only=True)
    cloud_type_display = serializers.CharField(source='get_cloud_type_display', read_only=True)

    class Meta:
        model = CloudRegion
        fields = [
            'id', 'code', 'name', 'country', 'city', 'continent',
            'latitude', 'longitude', 'status', 'cloud_type', 'cloud_type_display',
            'connectivity_type', 'tenant_isolation', 'is_default',
            'uptime_30d_pct', 'latency_ms', 'enabled_services',
            'zone_count', 'created_at',
        ]


class RegionPeerSerializer(serializers.ModelSerializer):
    primary_code   = serializers.CharField(source='primary.code',   read_only=True)
    secondary_code = serializers.CharField(source='secondary.code', read_only=True)

    class Meta:
        model = RegionPeer
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'primary_code', 'secondary_code']
