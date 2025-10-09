from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, ProjectFeatureViewSet, ProjectImageViewSet

router = DefaultRouter()
router.register(r'projects', ProjectViewSet)
router.register(r'features', ProjectFeatureViewSet)
router.register(r'images', ProjectImageViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]