from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContactPersonViewSet, ContactMessageViewSet, OfficeLocationViewSet

router = DefaultRouter()
router.register(r'contact-persons', ContactPersonViewSet, basename='contactperson')
router.register(r'contact-messages', ContactMessageViewSet, basename='contactmessage')
router.register(r'office-locations', OfficeLocationViewSet, basename='officelocation')

urlpatterns = [
    path('api/', include(router.urls)),
]