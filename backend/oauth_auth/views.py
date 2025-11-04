"""
OAuth Authentication Views for AtonixCorp Platform.

This module provides REST API endpoints for social authentication
with GitHub, GitLab, LinkedIn, and Google OAuth providers.
"""

from django.http import JsonResponse
from django.shortcuts import redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from allauth.socialaccount.models import SocialAccount
from allauth.socialaccount.providers.github.views import GitHubOAuth2Adapter
from allauth.socialaccount.providers.gitlab.views import GitLabOAuth2Adapter
from allauth.socialaccount.providers.linkedin_oauth2.views import LinkedInOAuth2Adapter
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from core.api_utils import APIResponse
import json


@api_view(['GET'])
@permission_classes([AllowAny])
def auth_status(request):
    """
    Get current authentication status and user info.
    """
    if request.user.is_authenticated:
        # Get social account info if available
        social_accounts = []
        for account in SocialAccount.objects.filter(user=request.user):
            social_accounts.append({
                'provider': account.provider,
                'uid': account.uid,
                'extra_data': account.extra_data,
            })

        user_data = {
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
            'is_active': request.user.is_active,
            'is_staff': request.user.is_staff,
            'is_superuser': request.user.is_superuser,
            'date_joined': request.user.date_joined.isoformat(),
            'last_login': request.user.last_login.isoformat() if request.user.last_login else None,
            'user_type': getattr(request.user, 'user_type', 'individual'),
            'social_accounts': social_accounts,
        }

        return APIResponse.success(
            data={'user': user_data, 'is_authenticated': True},
            message="User is authenticated"
        )

    return APIResponse.success(
        data={'is_authenticated': False},
        message="User is not authenticated"
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Traditional email/password login.
    """
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return APIResponse.error(
            message="Email and password are required",
            status_code=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(request, username=email, password=password)
    if user is not None:
        login(request, user)
        return APIResponse.success(
            data={
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'user_type': getattr(user, 'user_type', 'individual'),
                }
            },
            message="Login successful"
        )

    return APIResponse.error(
        message="Invalid credentials",
        status_code=status.HTTP_401_UNAUTHORIZED
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """
    Traditional email/password registration.
    """
    email = request.data.get('email')
    password = request.data.get('password')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')
    username = request.data.get('username', email.split('@')[0] if email else '')

    if not email or not password:
        return APIResponse.error(
            message="Email and password are required",
            status_code=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(email=email).exists():
        return APIResponse.error(
            message="User with this email already exists",
            status_code=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )
        user.user_type = 'individual'
        user.save()

        # Auto-login after registration
        login(request, user)

        return APIResponse.success(
            data={
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'user_type': user.user_type,
                }
            },
            message="Registration successful",
            status_code=status.HTTP_201_CREATED
        )

    except Exception as e:
        return APIResponse.error(
            message=f"Registration failed: {str(e)}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def logout_view(request):
    """
    Logout current user.
    """
    logout(request)
    return APIResponse.success(message="Logout successful")


@api_view(['GET'])
@permission_classes([AllowAny])
def oauth_providers(request):
    """
    Get available OAuth providers and their configuration status.
    """
    providers = {
        'github': {
            'name': 'GitHub',
            'icon': 'github',
            'configured': bool(settings.SOCIALACCOUNT_PROVIDERS.get('github', {}).get('APP', {}).get('client_id')),
            'url': f"{settings.FRONTEND_DOMAIN}/auth/github/login/"
        },
        'gitlab': {
            'name': 'GitLab',
            'icon': 'gitlab',
            'configured': bool(settings.SOCIALACCOUNT_PROVIDERS.get('gitlab', {}).get('APP', {}).get('client_id')),
            'url': f"{settings.FRONTEND_DOMAIN}/auth/gitlab/login/"
        },
        'linkedin': {
            'name': 'LinkedIn',
            'icon': 'linkedin',
            'configured': bool(settings.SOCIALACCOUNT_PROVIDERS.get('linkedin_oauth2', {}).get('APP', {}).get('client_id')),
            'url': f"{settings.FRONTEND_DOMAIN}/auth/linkedin/login/"
        },
        'google': {
            'name': 'Google',
            'icon': 'google',
            'configured': bool(settings.SOCIALACCOUNT_PROVIDERS.get('google', {}).get('APP', {}).get('client_id')),
            'url': f"{settings.FRONTEND_DOMAIN}/auth/google/login/"
        },
    }

    return APIResponse.success(
        data={'providers': providers},
        message="OAuth providers retrieved successfully"
    )


@api_view(['GET'])
@permission_classes([AllowAny])
def oauth_callback(request, provider):
    """
    Handle OAuth callback from social providers.
    This endpoint receives the callback from the OAuth provider
    and processes the authentication.
    """
    try:
        # Get the authorization code from the request
        code = request.GET.get('code')
        state = request.GET.get('state')

        if not code:
            return APIResponse.error(
                message="Authorization code is required",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        # Here we would normally exchange the code for tokens
        # and create/login the user. For now, we'll redirect to frontend
        # with the auth data

        frontend_redirect_url = f"{settings.FRONTEND_DOMAIN}/auth/{provider}/callback?code={code}"
        if state:
            frontend_redirect_url += f"&state={state}"

        return redirect(frontend_redirect_url)

    except Exception as e:
        return APIResponse.error(
            message=f"OAuth callback failed: {str(e)}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def oauth_complete(request, provider):
    """
    Complete OAuth authentication by exchanging code for tokens
    and creating/logging in the user.
    """
    try:
        code = request.data.get('code')
        state = request.data.get('state')

        if not code:
            return APIResponse.error(
                message="Authorization code is required",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        # This is where we would implement the actual OAuth token exchange
        # For now, we'll create a mock social login for demonstration

        # Mock user creation based on provider
        mock_user_data = {
            'github': {
                'username': f'github_user_{code[:8]}',
                'email': f'user_{code[:8]}@github.example.com',
                'first_name': 'GitHub',
                'last_name': 'User',
                'provider': 'github',
            },
            'gitlab': {
                'username': f'gitlab_user_{code[:8]}',
                'email': f'user_{code[:8]}@gitlab.example.com',
                'first_name': 'GitLab',
                'last_name': 'User',
                'provider': 'gitlab',
            },
            'linkedin': {
                'username': f'linkedin_user_{code[:8]}',
                'email': f'user_{code[:8]}@linkedin.example.com',
                'first_name': 'LinkedIn',
                'last_name': 'User',
                'provider': 'linkedin',
            },
            'google': {
                'username': f'google_user_{code[:8]}',
                'email': f'user_{code[:8]}@google.example.com',
                'first_name': 'Google',
                'last_name': 'User',
                'provider': 'google',
            },
        }

        user_info = mock_user_data.get(provider)
        if not user_info:
            return APIResponse.error(
                message=f"Unsupported provider: {provider}",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        # Check if user already exists
        user = User.objects.filter(email=user_info['email']).first()
        if not user:
            # Create new user
            user = User.objects.create_user(
                username=user_info['username'],
                email=user_info['email'],
                password=None,  # Social auth users don't have passwords
                first_name=user_info['first_name'],
                last_name=user_info['last_name'],
            )
            user.user_type = 'individual'
            user.save()

            # Create social account record
            SocialAccount.objects.create(
                user=user,
                provider=provider,
                uid=code[:16],  # Mock UID
                extra_data={'code': code}
            )

        # Log in the user
        login(request, user)

        return APIResponse.success(
            data={
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'user_type': getattr(user, 'user_type', 'individual'),
                    'provider': provider,
                }
            },
            message=f"{provider.title()} authentication successful"
        )

    except Exception as e:
        return APIResponse.error(
            message=f"OAuth completion failed: {str(e)}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )