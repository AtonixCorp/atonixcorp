from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
import json
from rest_framework.authtoken.models import Token
from core.models import UserProfile
from core import gpg_utils


def _user_from_token_header(request):
    """Helper to extract user from Authorization header if present.

    Supports header: Authorization: Token <key>
    """
    auth = request.META.get('HTTP_AUTHORIZATION', '')
    if not auth:
        return None
    parts = auth.split()
    if len(parts) != 2:
        return None
    scheme, key = parts
    if scheme.lower() != 'token':
        return None
    try:
        token = Token.objects.get(key=key)
        return token.user
    except Token.DoesNotExist:
        return None


@method_decorator(csrf_exempt, name='dispatch')
class LoginView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')
            
            # Try to find user by email
            try:
                user = User.objects.get(email=email)
                username = user.username
            except User.DoesNotExist:
                return JsonResponse({
                    'error': 'Invalid credentials'
                }, status=400)
            
            # Authenticate user
            user = authenticate(request, username=username, password=password)
            
            if user is not None:
                login(request, user)
                
                # Create or get token for API authentication
                token, created = Token.objects.get_or_create(user=user)
                
                # Get or create user profile for UUID
                profile, created = UserProfile.objects.get_or_create(user=user)
                
                return JsonResponse({
                    'message': 'Login successful',
                    'user': {
                        'id': user.id,
                        'uuid': str(profile.uuid),
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'is_staff': user.is_staff,
                        'is_superuser': user.is_superuser,
                        'is_active': user.is_active,
                        'date_joined': user.date_joined.isoformat() if hasattr(user, 'date_joined') else None,
                        'last_login': user.last_login.isoformat() if hasattr(user, 'last_login') and user.last_login else None,
                    },
                    'token': token.key
                })
            else:
                return JsonResponse({
                    'error': 'Invalid credentials'
                }, status=400)
                
        except json.JSONDecodeError:
            return JsonResponse({
                'error': 'Invalid JSON'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'error': str(e)
            }, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class SignupView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')
            confirm_password = data.get('confirm_password')
            username = data.get('username', '')
            first_name = data.get('first_name', '')
            last_name = data.get('last_name', '')
            
            # Validate required fields
            if not email or not password:
                return JsonResponse({
                    'error': 'Email and password are required'
                }, status=400)
                
            if not username:
                return JsonResponse({
                    'error': 'Username is required'
                }, status=400)
                
            if not first_name or not last_name:
                return JsonResponse({
                    'error': 'First name and last name are required'
                }, status=400)
            
            # Validate password confirmation if provided
            if confirm_password and password != confirm_password:
                return JsonResponse({
                    'error': 'Passwords do not match'
                }, status=400)
            
            # Validate password length
            if len(password) < 8:
                return JsonResponse({
                    'error': 'Password must be at least 8 characters long'
                }, status=400)
            
            # Validate username length
            if len(username) < 3:
                return JsonResponse({
                    'error': 'Username must be at least 3 characters long'
                }, status=400)
            
            # Check if user already exists
            if User.objects.filter(email=email).exists():
                return JsonResponse({
                    'error': 'User with this email already exists'
                }, status=400)
            
            # Check if username already exists
            if User.objects.filter(username=username).exists():
                return JsonResponse({
                    'error': 'Username already exists'
                }, status=400)
            
            # Create user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )
            
            # Create token for API authentication
            token = Token.objects.create(user=user)
            
            # Create user profile for UUID
            profile = UserProfile.objects.create(user=user)

            # Optionally generate a GPG keypair for the user and return the
            # plaintext private key once in the signup response. The request
            # may include an optional `gpg_passphrase` to protect the private key.
            one_time_private_key = None
            try:
                gpg_passphrase = data.get('gpg_passphrase', '')
                name_email = f"{first_name} {last_name} <{email}>"
                fingerprint, public_key, encrypted_private, private_key = gpg_utils.generate_gpg_keypair(name_email, passphrase=gpg_passphrase)

                # Save metadata to profile
                profile.gpg_fingerprint = fingerprint
                profile.gpg_public_key = public_key
                profile.gpg_private_key_encrypted = encrypted_private
                profile.save()

                # Expose the plaintext private key exactly once in response
                one_time_private_key = private_key
            except Exception as e:
                # Don't fail signup for GPG generation issues; surface warning
                gpg_error = str(e)
            else:
                gpg_error = None
            
            # Log the user in
            login(request, user)
            
            resp = {
                'message': 'Account created successfully',
                'user': {
                    'id': user.id,
                    'uuid': str(profile.uuid),
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser,
                    'is_active': user.is_active,
                    'date_joined': user.date_joined.isoformat() if hasattr(user, 'date_joined') else None,
                    'last_login': user.last_login.isoformat() if hasattr(user, 'last_login') and user.last_login else None,
                },
                'token': token.key
            }

            # Include one-time private key in response when available. This is
            # the only time the plaintext private key will be returned; it is
            # the client's responsibility to persist it securely for the user.
            if one_time_private_key:
                resp['one_time_private_key'] = one_time_private_key

            if gpg_error:
                resp['gpg_error'] = gpg_error

            return JsonResponse(resp, status=201)
            
        except json.JSONDecodeError:
            return JsonResponse({
                'error': 'Invalid JSON'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'error': str(e)
            }, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class LogoutView(View):
    def post(self, request):
        try:
            if request.user.is_authenticated:
                # Delete the user's token
                try:
                    token = Token.objects.get(user=request.user)
                    token.delete()
                except Token.DoesNotExist:
                    pass
                
                logout(request)
                return JsonResponse({
                    'message': 'Logged out successfully'
                })
            else:
                return JsonResponse({
                    'error': 'Not logged in'
                }, status=400)
        except Exception as e:
            return JsonResponse({
                'error': str(e)
            }, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class MeView(View):
    def get(self, request):
        # Allow token-authenticated requests (API clients) in addition to session auth
        user = request.user if request.user.is_authenticated else _user_from_token_header(request)
        if user and user.is_authenticated:
            try:
                profile = UserProfile.objects.get(user=user)
                user_uuid = str(profile.uuid)
            except UserProfile.DoesNotExist:
                user_uuid = None
            return JsonResponse({
                'user': {
                    'id': user.id,
                    'uuid': user_uuid,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser,
                    'is_active': user.is_active,
                    'date_joined': user.date_joined.isoformat() if hasattr(user, 'date_joined') else None,
                    'last_login': user.last_login.isoformat() if hasattr(user, 'last_login') and user.last_login else None,
                }
            })
        else:
            return JsonResponse({
                'error': 'Not authenticated'
            }, status=401)