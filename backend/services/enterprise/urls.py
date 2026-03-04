# AtonixCorp – Enterprise API URL Configuration
# All routes are org-scoped via /organizations/:org_pk/...
# Mounted at /api/enterprise/ by the main atonixcorp/urls.py

from django.urls import path, include
from rest_framework.routers import SimpleRouter

from .views import (
    OrganizationViewSet, OrganizationMemberViewSet,
    EnterpriseSendDomainViewSet, EmailSenderIdentityViewSet,
    EnterpriseEmailTemplateViewSet, EmailLogViewSet,
    OrgDomainViewSet,
    BrandingProfileViewSet, BrandAssetViewSet,
    EnterprisePlanViewSet, SubscriptionViewSet, EnterpriseInvoiceViewSet,
    EnterpriseAuditLogViewSet,
)

# ── Top-level router (org CRUD + plans) ──────────────────────────────────────
router = SimpleRouter()
router.register(r'organizations', OrganizationViewSet,   basename='enterprise-org')
router.register(r'plans',         EnterprisePlanViewSet, basename='enterprise-plan')

# ── Nested sub-routers ────────────────────────────────────────────────────────
_r_members  = SimpleRouter(); _r_members.register(r'',  OrganizationMemberViewSet,      basename='org-member')
_r_sdomains = SimpleRouter(); _r_sdomains.register(r'', EnterpriseSendDomainViewSet,    basename='org-sdomain')
_r_senders  = SimpleRouter(); _r_senders.register(r'',  EmailSenderIdentityViewSet,     basename='org-sender')
_r_tmpls    = SimpleRouter(); _r_tmpls.register(r'',    EnterpriseEmailTemplateViewSet, basename='org-etemplate')
_r_logs     = SimpleRouter(); _r_logs.register(r'',     EmailLogViewSet,               basename='org-elog')
_r_domains  = SimpleRouter(); _r_domains.register(r'',  OrgDomainViewSet,              basename='org-domain')
_r_branding = SimpleRouter(); _r_branding.register(r'', BrandingProfileViewSet,        basename='org-branding')
_r_assets   = SimpleRouter(); _r_assets.register(r'',   BrandAssetViewSet,             basename='org-basset')
_r_sub      = SimpleRouter(); _r_sub.register(r'',      SubscriptionViewSet,           basename='org-sub')
_r_invoices = SimpleRouter(); _r_invoices.register(r'', EnterpriseInvoiceViewSet,      basename='org-invoice')
_r_audit    = SimpleRouter(); _r_audit.register(r'',    EnterpriseAuditLogViewSet,     basename='org-audit')

_P = 'organizations/<str:org_pk>/'

urlpatterns = router.urls + [
    path(_P + 'members/',              include(_r_members.urls)),
    path(_P + 'email-domains/',        include(_r_sdomains.urls)),
    path(_P + 'email-senders/',        include(_r_senders.urls)),
    path(_P + 'email-templates/',      include(_r_tmpls.urls)),
    path(_P + 'email-logs/',           include(_r_logs.urls)),
    path(_P + 'domains/',              include(_r_domains.urls)),
    path(_P + 'branding/',             include(_r_branding.urls)),
    path(_P + 'branding-assets/',      include(_r_assets.urls)),
    path(_P + 'billing-subscription/', include(_r_sub.urls)),
    path(_P + 'billing-invoices/',     include(_r_invoices.urls)),
    path(_P + 'audit-logs/',           include(_r_audit.urls)),
]
