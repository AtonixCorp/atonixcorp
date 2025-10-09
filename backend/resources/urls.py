from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ResourceCategoryViewSet, ResourceViewSet, CommunityLinkViewSet, FAQViewSet

router = DefaultRouter()
router.register(r'categories', ResourceCategoryViewSet)
router.register(r'resources', ResourceViewSet)
router.register(r'community-links', CommunityLinkViewSet)
router.register(r'faqs', FAQViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]