from django.urls import path
from . import views

urlpatterns = [
    path('stats/', views.dashboard_stats, name='dashboard_stats'),
    path('profile/', views.user_profile, name='user_profile'),
    
    # Security dashboard endpoints
    path('security/overview/', views.enterprise_security_overview, name='security_overview'),
    path('security/compliance/', views.compliance_status, name='compliance_status'),
    path('security/incidents/', views.security_incidents_summary, name='incidents_summary'),
    path('security/audits/', views.audit_schedule, name='audit_schedule'),
]