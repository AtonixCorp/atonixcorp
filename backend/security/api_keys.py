"""
Secure API Key management system
"""
import hashlib
import secrets
import time
from datetime import datetime, timedelta
from django.db import models
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.conf import settings
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


class APIKey(models.Model):
    """
    Model for storing API keys with metadata
    """
    
    class APIKeyStatus(models.TextChoices):
        ACTIVE = 'active', 'Active'
        REVOKED = 'revoked', 'Revoked'
        EXPIRED = 'expired', 'Expired'
        SUSPENDED = 'suspended', 'Suspended'
    
    # Key identification
    key_id = models.CharField(max_length=32, unique=True, db_index=True)
    name = models.CharField(max_length=100, help_text="Descriptive name for the API key")
    
    # Key hash (we never store the actual key)
    key_hash = models.CharField(max_length=128, db_index=True)
    
    # Ownership and permissions
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='api_keys')
    permissions = models.JSONField(default=list, help_text="List of allowed permissions")
    
    # Status and lifecycle
    status = models.CharField(
        max_length=20, 
        choices=APIKeyStatus.choices, 
        default=APIKeyStatus.ACTIVE
    )
    
    # Time tracking
    created_at = models.DateTimeField(auto_now_add=True)
    last_used = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    # Usage tracking
    usage_count = models.PositiveIntegerField(default=0)
    rate_limit = models.PositiveIntegerField(default=1000, help_text="Requests per hour")
    
    # IP restrictions
    allowed_ips = models.JSONField(
        default=list, 
        blank=True, 
        help_text="List of allowed IP addresses (empty = any IP)"
    )
    
    # Security metadata
    created_from_ip = models.GenericIPAddressField(null=True, blank=True)
    last_used_ip = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        db_table = 'security_api_keys'
        indexes = [
            models.Index(fields=['key_hash']),
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status', 'expires_at']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.key_id})"
    
    def is_valid(self) -> bool:
        """Check if API key is valid for use"""
        if self.status != self.APIKeyStatus.ACTIVE:
            return False
        
        if self.expires_at and datetime.now() > self.expires_at:
            self.status = self.APIKeyStatus.EXPIRED
            self.save(update_fields=['status'])
            return False
        
        return True
    
    def is_rate_limited(self, client_ip: str) -> bool:
        """Check if API key usage is rate limited"""
        cache_key = f"api_key_usage_{self.key_id}"
        current_hour = int(time.time() // 3600)
        
        # Get current hour's usage
        usage_data = cache.get(cache_key, {})
        current_usage = usage_data.get(str(current_hour), 0)
        
        return current_usage >= self.rate_limit
    
    def record_usage(self, client_ip: str):
        """Record API key usage"""
        # Update database
        self.usage_count += 1
        self.last_used = datetime.now()
        self.last_used_ip = client_ip
        self.save(update_fields=['usage_count', 'last_used', 'last_used_ip'])
        
        # Update rate limiting cache
        cache_key = f"api_key_usage_{self.key_id}"
        current_hour = int(time.time() // 3600)
        
        usage_data = cache.get(cache_key, {})
        usage_data[str(current_hour)] = usage_data.get(str(current_hour), 0) + 1
        
        # Clean old hours (keep only current and previous hour)
        usage_data = {
            hour: count for hour, count in usage_data.items()
            if int(hour) >= current_hour - 1
        }
        
        cache.set(cache_key, usage_data, 7200)  # 2 hours TTL
    
    def is_ip_allowed(self, client_ip: str) -> bool:
        """Check if client IP is allowed"""
        if not self.allowed_ips:
            return True  # No IP restrictions
        
        return client_ip in self.allowed_ips
    
    def has_permission(self, permission: str) -> bool:
        """Check if API key has specific permission"""
        if not self.permissions:
            return False  # No permissions granted
        
        return permission in self.permissions or '*' in self.permissions


class APIKeyManager:
    """
    Manager for API key operations
    """
    
    def generate_api_key(
        self,
        user: User,
        name: str,
        permissions: list = None,
        expires_in_days: Optional[int] = None,
        rate_limit: int = 1000,
        allowed_ips: list = None,
        client_ip: str = None
    ) -> Dict[str, Any]:
        """
        Generate new API key
        """
        # Generate secure API key
        key_id = secrets.token_hex(16)
        api_key = f"ak_{key_id}_{secrets.token_urlsafe(32)}"
        
        # Hash the key for storage
        key_hash = self._hash_key(api_key)
        
        # Calculate expiration
        expires_at = None
        if expires_in_days:
            expires_at = datetime.now() + timedelta(days=expires_in_days)
        
        # Create API key record
        api_key_obj = APIKey.objects.create(
            key_id=key_id,
            name=name,
            key_hash=key_hash,
            user=user,
            permissions=permissions or [],
            expires_at=expires_at,
            rate_limit=rate_limit,
            allowed_ips=allowed_ips or [],
            created_from_ip=client_ip,
        )
        
        logger.info(f"Created API key {key_id} for user {user.username}")
        
        return {
            'api_key': api_key,
            'key_id': key_id,
            'name': name,
            'permissions': permissions or [],
            'expires_at': expires_at.isoformat() if expires_at else None,
            'rate_limit': rate_limit,
        }
    
    def validate_api_key(self, api_key: str, client_ip: str = None) -> Optional[APIKey]:
        """
        Validate API key and return APIKey object if valid
        """
        try:
            # Extract key ID from API key
            if not api_key.startswith('ak_'):
                return None
            
            parts = api_key.split('_')
            if len(parts) < 3:
                return None
            
            key_id = parts[1]
            
            # Hash the provided key
            key_hash = self._hash_key(api_key)
            
            # Find API key in database
            api_key_obj = APIKey.objects.get(
                key_id=key_id,
                key_hash=key_hash
            )
            
            # Validate key
            if not api_key_obj.is_valid():
                logger.warning(f"Invalid API key used: {key_id}")
                return None
            
            # Check IP restrictions
            if client_ip and not api_key_obj.is_ip_allowed(client_ip):
                logger.warning(f"API key {key_id} used from unauthorized IP: {client_ip}")
                return None
            
            # Check rate limiting
            if api_key_obj.is_rate_limited(client_ip):
                logger.warning(f"API key {key_id} rate limited")
                return None
            
            # Record usage
            api_key_obj.record_usage(client_ip or '')
            
            return api_key_obj
            
        except APIKey.DoesNotExist:
            logger.warning(f"API key not found: {api_key[:20]}...")
            return None
        except Exception as e:
            logger.error(f"API key validation error: {str(e)}")
            return None
    
    def revoke_api_key(self, key_id: str, user: User) -> bool:
        """
        Revoke API key
        """
        try:
            api_key = APIKey.objects.get(key_id=key_id, user=user)
            api_key.status = APIKey.APIKeyStatus.REVOKED
            api_key.save(update_fields=['status'])
            
            logger.info(f"Revoked API key {key_id} for user {user.username}")
            return True
            
        except APIKey.DoesNotExist:
            return False
    
    def list_user_api_keys(self, user: User) -> list:
        """
        List all API keys for a user (without revealing the actual keys)
        """
        keys = APIKey.objects.filter(user=user).order_by('-created_at')
        
        return [
            {
                'key_id': key.key_id,
                'name': key.name,
                'status': key.status,
                'permissions': key.permissions,
                'created_at': key.created_at.isoformat(),
                'last_used': key.last_used.isoformat() if key.last_used else None,
                'expires_at': key.expires_at.isoformat() if key.expires_at else None,
                'usage_count': key.usage_count,
                'rate_limit': key.rate_limit,
            }
            for key in keys
        ]
    
    def cleanup_expired_keys(self):
        """
        Mark expired API keys as expired
        """
        expired_count = APIKey.objects.filter(
            expires_at__lt=datetime.now(),
            status=APIKey.APIKeyStatus.ACTIVE
        ).update(status=APIKey.APIKeyStatus.EXPIRED)
        
        if expired_count > 0:
            logger.info(f"Marked {expired_count} API keys as expired")
        
        return expired_count
    
    def _hash_key(self, api_key: str) -> str:
        """
        Hash API key for secure storage
        """
        salt = getattr(settings, 'API_KEY_SALT', 'default-salt-change-in-production')
        return hashlib.sha256(f"{api_key}{salt}".encode()).hexdigest()


# API Key authentication for Django REST Framework
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed


class APIKeyAuthentication(BaseAuthentication):
    """
    API Key authentication for Django REST Framework
    """
    
    def __init__(self):
        self.api_key_manager = APIKeyManager()
    
    def authenticate(self, request):
        """
        Authenticate request using API key
        """
        # Try different API key sources
        api_key = (
            request.META.get('HTTP_X_API_KEY') or
            request.GET.get('api_key') or
            request.POST.get('api_key')
        )
        
        if not api_key:
            return None
        
        # Get client IP
        client_ip = self._get_client_ip(request)
        
        # Validate API key
        api_key_obj = self.api_key_manager.validate_api_key(api_key, client_ip)
        
        if not api_key_obj:
            raise AuthenticationFailed("Invalid API key")
        
        # Return user and API key object
        return (api_key_obj.user, api_key_obj)
    
    def authenticate_header(self, request):
        """Return authentication header for 401 responses"""
        return 'X-API-Key'
    
    def _get_client_ip(self, request) -> str:
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR', '')
        return ip


# Global API key manager instance
api_key_manager = APIKeyManager()