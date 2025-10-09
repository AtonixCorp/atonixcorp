from rest_framework import serializers
from .models import ContactPerson, ContactMessage, OfficeLocation


class ContactPersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactPerson
        fields = [
            'id', 'name', 'title', 'department', 'email', 'phone',
            'bio', 'avatar', 'linkedin_url', 'is_primary', 'is_active', 'order'
        ]


class ContactMessageSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.name', read_only=True)
    
    class Meta:
        model = ContactMessage
        fields = [
            'id', 'name', 'email', 'subject', 'message', 'company', 'phone',
            'message_type', 'priority', 'status', 'assigned_to', 'assigned_to_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ContactMessageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating contact messages (public form)"""
    class Meta:
        model = ContactMessage
        fields = [
            'name', 'email', 'subject', 'message', 'company', 'phone', 'message_type'
        ]


class OfficeLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = OfficeLocation
        fields = [
            'id', 'name', 'address_line_1', 'address_line_2', 'city',
            'state', 'postal_code', 'country', 'phone', 'email',
            'latitude', 'longitude', 'is_headquarters', 'is_active'
        ]