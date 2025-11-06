from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EnterpriseViewSet,
    SecurityFrameworkViewSet,
    EnterpriseSecurityPolicyViewSet,
    SecurityHardeningChecklistViewSet,
    SecurityControlViewSet,
    SecurityAuditViewSet,
    SecurityIncidentViewSet,
    ComplianceTrackerViewSet,
)

router = DefaultRouter()
router.register(r'enterprises', EnterpriseViewSet, basename='enterprise')

# Security management endpoints
router.register(r'security/frameworks', SecurityFrameworkViewSet, basename='security-framework')
router.register(r'security/policies', EnterpriseSecurityPolicyViewSet, basename='security-policy')
router.register(r'security/checklists', SecurityHardeningChecklistViewSet, basename='security-checklist')
router.register(r'security/controls', SecurityControlViewSet, basename='security-control')
router.register(r'security/audits', SecurityAuditViewSet, basename='security-audit')
router.register(r'security/incidents', SecurityIncidentViewSet, basename='security-incident')
router.register(r'security/compliance', ComplianceTrackerViewSet, basename='security-compliance')

# NOTE: this module is included at project path('api/', include('enterprises.urls'))
# so router URLs should be mounted at the root here to avoid double '/api/api/' paths.
urlpatterns = [
    path('', include(router.urls)),
]
