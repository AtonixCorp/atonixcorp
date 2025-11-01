from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TeamViewSet, TeamMemberViewSet, TeamSkillViewSet,
    TeamMembershipViewSet, team_login, leave_team
)

router = DefaultRouter()
router.register(r'teams', TeamViewSet)
router.register(r'members', TeamMemberViewSet)
router.register(r'skills', TeamSkillViewSet)
router.register(r'memberships', TeamMembershipViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/auth/team-login/', team_login, name='team_login'),
    path('api/teams/<slug:team_slug>/leave/', leave_team, name='leave_team'),
]
