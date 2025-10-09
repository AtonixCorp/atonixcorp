from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FocusAreaViewSet, FocusAreaTechnologyViewSet, FocusAreaSolutionViewSet

router = DefaultRouter()
router.register(r'focus-areas', FocusAreaViewSet)
router.register(r'technologies', FocusAreaTechnologyViewSet)
router.register(r'solutions', FocusAreaSolutionViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]