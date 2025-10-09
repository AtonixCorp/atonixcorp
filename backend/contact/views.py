from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import ContactPerson, ContactMessage, OfficeLocation
from .serializers import (
    ContactPersonSerializer, ContactMessageSerializer,
    ContactMessageCreateSerializer, OfficeLocationSerializer
)


class ContactPersonViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ContactPerson.objects.filter(is_active=True)
    serializer_class = ContactPersonSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department', 'is_primary']
    search_fields = ['name', 'title', 'department', 'bio']
    ordering_fields = ['name', 'order']
    ordering = ['-is_primary', 'order', 'name']
    
    @action(detail=False, methods=['get'])
    def primary(self, request):
        """Get primary contacts"""
        primary_contacts = self.queryset.filter(is_primary=True)
        serializer = self.get_serializer(primary_contacts, many=True)
        return Response(serializer.data)


class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['message_type', 'priority', 'status']
    search_fields = ['name', 'email', 'subject', 'message']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ContactMessageCreateSerializer
        return ContactMessageSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return super().get_permissions()
    
    def create(self, request, *args, **kwargs):
        """Public endpoint for creating contact messages"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Auto-assign to primary contact if available
        primary_contact = ContactPerson.objects.filter(is_primary=True, is_active=True).first()
        contact_message = serializer.save(assigned_to=primary_contact)
        
        return Response(
            {'message': 'Your message has been sent successfully. We will get back to you soon.'},
            status=status.HTTP_201_CREATED
        )


class OfficeLocationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = OfficeLocation.objects.filter(is_active=True)
    serializer_class = OfficeLocationSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['country', 'is_headquarters']
    search_fields = ['name', 'city', 'address_line_1']
    ordering_fields = ['name', 'city', 'country']
    ordering = ['-is_headquarters', 'country', 'city']
    
    @action(detail=False, methods=['get'])
    def headquarters(self, request):
        """Get headquarters location"""
        headquarters = self.queryset.filter(is_headquarters=True).first()
        if headquarters:
            serializer = self.get_serializer(headquarters)
            return Response(serializer.data)
        return Response({'message': 'No headquarters found'}, status=status.HTTP_404_NOT_FOUND)
