"""
URL patterns for OAuth authentication endpoints.
"""

from django.urls import path
from . import views

app_name = 'auth'

urlpatterns = [
    # Authentication status
    path('status/', views.auth_status, name='auth_status'),

    # Traditional login/logout
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),

    # OAuth providers info
    path('providers/', views.oauth_providers, name='oauth_providers'),

    # OAuth callbacks
    path('oauth/<str:provider>/callback/', views.oauth_callback, name='oauth_callback'),
    path('oauth/<str:provider>/complete/', views.oauth_complete, name='oauth_complete'),
]