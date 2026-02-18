from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
import json


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({'status': 'ok', 'service': 'atonixcorp-backend'})


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get('email', '')
    password = request.data.get('password', '')

    # Try username=email first, then try to find user by email
    user = authenticate(username=email, password=password)
    if user is None:
        try:
            u = User.objects.get(email=email)
            user = authenticate(username=u.username, password=password)
        except User.DoesNotExist:
            pass

    if user is None or not user.is_active:
        return Response({'detail': 'Invalid credentials.'}, status=400)

    token, _ = Token.objects.get_or_create(user=user)
    return Response({
        'token': token.key,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'user_type': getattr(user, 'profile', None) and 'individual' or 'individual',
        }
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    username = request.data.get('username', '')
    email = request.data.get('email', '')
    password = request.data.get('password', '')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')

    if not email or not password:
        return Response({'detail': 'Email and password are required.'}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({'detail': 'A user with this email already exists.'}, status=400)

    user = User.objects.create_user(
        username=username or email,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
    )
    token, _ = Token.objects.get_or_create(user=user)
    return Response({
        'token': token.key,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'user_type': 'individual',
        }
    }, status=201)


@api_view(['GET'])
def current_user_view(request):
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'user_type': 'individual',
    })


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check),
    path('api/auth/login/', login_view),
    path('api/auth/signup/', signup_view),
    path('api/auth/register/', signup_view),  # alias
    path('api/auth/me/', current_user_view),
    path('api/auth/user/', current_user_view),  # alias
    path('api/services/', include('services.urls')),
]
