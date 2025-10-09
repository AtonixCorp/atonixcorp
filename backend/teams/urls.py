from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TeamViewSet, TeamMemberViewSet, TeamSkillViewSet

router = DefaultRouter()
router.register(r'teams', TeamViewSet)
router.register(r'members', TeamMemberViewSet)
router.register(r'skills', TeamSkillViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]