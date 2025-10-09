"""
Secure JWT authentication system with token rotation and blacklisting
"""
import jwt
import time
import hashlib
from datetime import datetime, timedelta
from django.conf import settings
from django.core.cache import cache
from django.contrib.auth import get_user_model
from django.contrib.auth.backends import BaseBackend
from django.http import JsonResponse
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from typing import Optional, Dict, Any
import secrets
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


class SecureJWTManager:
    """
    Secure JWT token management with rotation and blacklisting
    """
    
    def __init__(self):
        self.secret_key = getattr(settings, 'JWT_SECRET_KEY', settings.SECRET_KEY)
        self.access_token_lifetime = getattr(settings, 'JWT_ACCESS_TOKEN_LIFETIME', 900)  # 15 minutes
        self.refresh_token_lifetime = getattr(settings, 'JWT_REFRESH_TOKEN_LIFETIME', 604800)  # 7 days
        self.algorithm = 'HS256'
        self.issuer = getattr(settings, 'JWT_ISSUER', 'atonixcorp-platform')
    
    def generate_token_pair(self, user: User) -> Dict[str, str]:
        """Generate access and refresh token pair"""
        now = datetime.utcnow()
        
        # Generate unique token ID
        token_id = secrets.token_hex(16)
        
        # Access token payload
        access_payload = {
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'token_type': 'access',
            'token_id': token_id,
            'iat': int(now.timestamp()),
            'exp': int((now + timedelta(seconds=self.access_token_lifetime)).timestamp()),
            'iss': self.issuer,
            'jti': self._generate_jti(user.id, token_id, 'access'),
        }
        
        # Refresh token payload
        refresh_payload = {
            'user_id': user.id,
            'token_type': 'refresh',
            'token_id': token_id,
            'iat': int(now.timestamp()),
            'exp': int((now + timedelta(seconds=self.refresh_token_lifetime)).timestamp()),
            'iss': self.issuer,
            'jti': self._generate_jti(user.id, token_id, 'refresh'),
        }
        
        # Generate tokens
        access_token = jwt.encode(access_payload, self.secret_key, algorithm=self.algorithm)
        refresh_token = jwt.encode(refresh_payload, self.secret_key, algorithm=self.algorithm)
        
        # Store token metadata in cache for validation
        self._store_token_metadata(user.id, token_id, now)
        
        return {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'token_type': 'Bearer',
            'expires_in': self.access_token_lifetime,
        }
    
    def validate_access_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Validate access token and return payload"""
        try:
            # Decode token
            payload = jwt.decode(
                token, 
                self.secret_key, 
                algorithms=[self.algorithm],
                options={'verify_exp': True}
            )
            
            # Verify token type
            if payload.get('token_type') != 'access':
                raise jwt.InvalidTokenError("Invalid token type")
            
            # Check if token is blacklisted
            if self._is_token_blacklisted(payload.get('jti')):
                raise jwt.InvalidTokenError("Token is blacklisted")
            
            # Verify token metadata exists
            if not self._verify_token_metadata(payload.get('user_id'), payload.get('token_id')):
                raise jwt.InvalidTokenError("Token metadata not found")
            
            return payload
            
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Token has expired")
        except jwt.InvalidTokenError as e:
            raise AuthenticationFailed(f"Invalid token: {str(e)}")
        except Exception as e:
            logger.error(f"Token validation error: {str(e)}")
            raise AuthenticationFailed("Token validation failed")
    
    def refresh_token(self, refresh_token: str) -> Dict[str, str]:
        """Refresh access token using refresh token"""
        try:
            # Decode refresh token
            payload = jwt.decode(
                refresh_token,
                self.secret_key,
                algorithms=[self.algorithm],
                options={'verify_exp': True}
            )
            
            # Verify token type
            if payload.get('token_type') != 'refresh':
                raise jwt.InvalidTokenError("Invalid token type")
            
            # Check if token is blacklisted
            if self._is_token_blacklisted(payload.get('jti')):
                raise jwt.InvalidTokenError("Token is blacklisted")
            
            # Get user
            user_id = payload.get('user_id')
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                raise jwt.InvalidTokenError("User not found")
            
            # Blacklist old tokens for this user
            self._blacklist_user_tokens(user_id, payload.get('token_id'))
            
            # Generate new token pair
            return self.generate_token_pair(user)
            
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Refresh token has expired")
        except jwt.InvalidTokenError as e:
            raise AuthenticationFailed(f"Invalid refresh token: {str(e)}")
        except Exception as e:
            logger.error(f"Token refresh error: {str(e)}")
            raise AuthenticationFailed("Token refresh failed")
    
    def blacklist_token(self, token: str):
        """Blacklist a specific token"""
        try:
            payload = jwt.decode(
                token,
                self.secret_key,
                algorithms=[self.algorithm],
                options={'verify_exp': False}  # Don't verify expiration for blacklisting
            )
            
            jti = payload.get('jti')
            if jti:
                # Store in blacklist with TTL equal to token's remaining lifetime
                exp = payload.get('exp', 0)
                ttl = max(0, exp - int(time.time()))
                cache.set(f"blacklisted_token_{jti}", True, ttl)
                
        except Exception as e:
            logger.error(f"Token blacklisting error: {str(e)}")
    
    def blacklist_user_tokens(self, user_id: int):
        """Blacklist all tokens for a specific user"""
        self._blacklist_user_tokens(user_id)
    
    def _generate_jti(self, user_id: int, token_id: str, token_type: str) -> str:
        """Generate unique token identifier"""
        data = f"{user_id}:{token_id}:{token_type}:{int(time.time())}"
        return hashlib.sha256(data.encode()).hexdigest()
    
    def _store_token_metadata(self, user_id: int, token_id: str, issued_at: datetime):
        """Store token metadata for validation"""
        metadata = {
            'user_id': user_id,
            'issued_at': issued_at.isoformat(),
            'active': True,
        }
        cache.set(f"token_metadata_{user_id}_{token_id}", metadata, self.refresh_token_lifetime)
    
    def _verify_token_metadata(self, user_id: int, token_id: str) -> bool:
        """Verify token metadata exists and is active"""
        metadata = cache.get(f"token_metadata_{user_id}_{token_id}")
        return metadata is not None and metadata.get('active', False)
    
    def _is_token_blacklisted(self, jti: str) -> bool:
        """Check if token is blacklisted"""
        if not jti:
            return True
        return cache.get(f"blacklisted_token_{jti}", False)
    
    def _blacklist_user_tokens(self, user_id: int, current_token_id: str = None):
        """Blacklist all tokens for a user except current one"""
        # This is a simplified implementation
        # In production, you might want to store token metadata in database
        # for more robust token management
        cache_pattern = f"token_metadata_{user_id}_*"
        # Note: Redis would support pattern-based deletion
        # For Django cache, we'll mark user as requiring re-authentication
        cache.set(f"user_tokens_invalidated_{user_id}", True, self.refresh_token_lifetime)


class JWTAuthentication(BaseAuthentication):
    """
    JWT Authentication for Django REST Framework
    """
    
    def __init__(self):
        self.jwt_manager = SecureJWTManager()
    
    def authenticate(self, request):
        """Authenticate request using JWT token"""
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        
        if not auth_header:
            return None
        
        try:
            # Parse Authorization header
            auth_parts = auth_header.split()
            
            if len(auth_parts) != 2 or auth_parts[0].lower() != 'bearer':
                return None
            
            token = auth_parts[1]
            
            # Validate token
            payload = self.jwt_manager.validate_access_token(token)
            
            # Get user
            user_id = payload.get('user_id')
            try:
                user = User.objects.get(id=user_id, is_active=True)
            except User.DoesNotExist:
                raise AuthenticationFailed("User not found or inactive")
            
            # Check if user tokens are invalidated
            if cache.get(f"user_tokens_invalidated_{user_id}"):
                raise AuthenticationFailed("Token invalidated")
            
            return (user, token)
            
        except AuthenticationFailed:
            raise
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            raise AuthenticationFailed("Authentication failed")
    
    def authenticate_header(self, request):
        """Return authentication header for 401 responses"""
        return 'Bearer'


class SecureLoginBackend(BaseBackend):
    """
    Secure authentication backend with brute force protection
    """
    
    def authenticate(self, request, username=None, password=None, **kwargs):
        """Authenticate user with security checks"""
        if not username or not password:
            return None
        
        # Get client IP for rate limiting
        client_ip = self._get_client_ip(request)
        
        # Check if IP is rate limited for failed attempts
        if self._is_rate_limited(client_ip, username):
            logger.warning(f"Authentication rate limited for IP: {client_ip}, username: {username}")
            return None
        
        try:
            # Find user
            user = User.objects.get(username=username, is_active=True)
            
            # Check password
            if user.check_password(password):
                # Reset failed attempts on successful login
                self._reset_failed_attempts(client_ip, username)
                return user
            else:
                # Record failed attempt
                self._record_failed_attempt(client_ip, username)
                return None
                
        except User.DoesNotExist:
            # Record failed attempt even for non-existent users
            self._record_failed_attempt(client_ip, username)
            return None
    
    def get_user(self, user_id):
        """Get user by ID"""
        try:
            return User.objects.get(pk=user_id, is_active=True)
        except User.DoesNotExist:
            return None
    
    def _get_client_ip(self, request) -> str:
        """Get client IP address"""
        if request:
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip = x_forwarded_for.split(',')[0].strip()
            else:
                ip = request.META.get('REMOTE_ADDR', '')
            return ip
        return ''
    
    def _is_rate_limited(self, ip: str, username: str) -> bool:
        """Check if authentication is rate limited"""
        max_attempts = getattr(settings, 'AUTH_MAX_ATTEMPTS', 5)
        lockout_time = getattr(settings, 'AUTH_LOCKOUT_TIME', 900)  # 15 minutes
        
        # Check failed attempts for IP
        ip_key = f"failed_auth_ip_{ip}"
        ip_attempts = cache.get(ip_key, 0)
        
        # Check failed attempts for username
        username_key = f"failed_auth_user_{username}"
        user_attempts = cache.get(username_key, 0)
        
        return ip_attempts >= max_attempts or user_attempts >= max_attempts
    
    def _record_failed_attempt(self, ip: str, username: str):
        """Record failed authentication attempt"""
        lockout_time = getattr(settings, 'AUTH_LOCKOUT_TIME', 900)
        
        # Record for IP
        ip_key = f"failed_auth_ip_{ip}"
        ip_attempts = cache.get(ip_key, 0) + 1
        cache.set(ip_key, ip_attempts, lockout_time)
        
        # Record for username
        username_key = f"failed_auth_user_{username}"
        user_attempts = cache.get(username_key, 0) + 1
        cache.set(username_key, user_attempts, lockout_time)
        
        logger.warning(f"Failed authentication attempt from IP: {ip}, username: {username}")
    
    def _reset_failed_attempts(self, ip: str, username: str):
        """Reset failed attempts on successful login"""
        cache.delete(f"failed_auth_ip_{ip}")
        cache.delete(f"failed_auth_user_{username}")


# Global JWT manager instance
jwt_manager = SecureJWTManager()