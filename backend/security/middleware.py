"""
Security middleware for protecting against various attacks
"""
import re
import json
import time
from collections import defaultdict
from django.http import JsonResponse, HttpResponseForbidden
from django.core.cache import cache
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
from django.core.exceptions import SuspiciousOperation
import logging
import ipaddress
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)


class SecurityMiddleware(MiddlewareMixin):
    """
    Comprehensive security middleware for the platform
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.rate_limit_storage = defaultdict(list)
        self.blocked_ips = set()
        self.suspicious_patterns = [
            r'<script[^>]*>.*?</script>',  # XSS
            r'javascript:',  # JavaScript injection
            r'union\s+select',  # SQL injection
            r'drop\s+table',  # SQL injection
            r'insert\s+into',  # SQL injection
            r'delete\s+from',  # SQL injection
            r'\.\./',  # Path traversal
            r'etc/passwd',  # File inclusion
            r'cmd\.exe',  # Command injection
            r'powershell',  # Command injection
        ]
        super().__init__(get_response)
    
    def process_request(self, request):
        """Process incoming request for security threats"""
        client_ip = self.get_client_ip(request)
        
        # Check if IP is blocked
        if self.is_ip_blocked(client_ip):
            logger.warning(f"Blocked request from IP: {client_ip}")
            return HttpResponseForbidden("Access denied")
        
        # Rate limiting
        if self.is_rate_limited(client_ip, request.path):
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            return JsonResponse({
                'error': 'Rate limit exceeded',
                'retry_after': 60
            }, status=429)
        
        # Check for suspicious patterns
        if self.contains_suspicious_content(request):
            logger.warning(f"Suspicious content detected from IP: {client_ip}")
            self.block_ip(client_ip, duration=3600)  # Block for 1 hour
            return HttpResponseForbidden("Suspicious activity detected")
        
        # Validate request size
        if self.is_request_too_large(request):
            logger.warning(f"Request too large from IP: {client_ip}")
            return JsonResponse({'error': 'Request too large'}, status=413)
        
        return None
    
    def process_response(self, request, response):
        """Add security headers to response"""
        # Security headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
        
        # HSTS header for HTTPS
        if request.is_secure():
            response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        
        # CSP header
        csp_policy = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "connect-src 'self'; "
            "frame-ancestors 'none';"
        )
        response['Content-Security-Policy'] = csp_policy
        
        return response
    
    def get_client_ip(self, request) -> str:
        """Get the real client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR', '')
        return ip
    
    def is_ip_blocked(self, ip: str) -> bool:
        """Check if IP is in blocked list"""
        # Check in-memory blocked IPs
        if ip in self.blocked_ips:
            return True
        
        # Check cached blocked IPs
        blocked_until = cache.get(f"blocked_ip_{ip}")
        if blocked_until and time.time() < blocked_until:
            return True
        
        return False
    
    def block_ip(self, ip: str, duration: int = 3600):
        """Block IP for specified duration (seconds)"""
        self.blocked_ips.add(ip)
        cache.set(f"blocked_ip_{ip}", time.time() + duration, duration)
        logger.warning(f"Blocked IP {ip} for {duration} seconds")
    
    def is_rate_limited(self, ip: str, path: str) -> bool:
        """Check if request is rate limited"""
        now = time.time()
        key = f"{ip}:{path}"
        
        # Get rate limit settings
        rate_limit = getattr(settings, 'RATE_LIMIT_REQUESTS', 60)
        rate_window = getattr(settings, 'RATE_LIMIT_WINDOW', 60)
        
        # Clean old entries
        self.rate_limit_storage[key] = [
            timestamp for timestamp in self.rate_limit_storage[key]
            if now - timestamp < rate_window
        ]
        
        # Check if rate limit exceeded
        if len(self.rate_limit_storage[key]) >= rate_limit:
            return True
        
        # Add current request
        self.rate_limit_storage[key].append(now)
        return False
    
    def contains_suspicious_content(self, request) -> bool:
        """Check if request contains suspicious patterns"""
        # Check query parameters
        query_string = request.META.get('QUERY_STRING', '')
        if self._check_patterns(query_string):
            return True
        
        # Check POST data
        if hasattr(request, 'body') and request.body:
            try:
                body_str = request.body.decode('utf-8', errors='ignore')
                if self._check_patterns(body_str):
                    return True
            except:
                pass
        
        # Check headers
        for header_name, header_value in request.META.items():
            if header_name.startswith('HTTP_'):
                if self._check_patterns(str(header_value)):
                    return True
        
        return False
    
    def _check_patterns(self, content: str) -> bool:
        """Check content against suspicious patterns"""
        content_lower = content.lower()
        for pattern in self.suspicious_patterns:
            if re.search(pattern, content_lower, re.IGNORECASE):
                return True
        return False
    
    def is_request_too_large(self, request) -> bool:
        """Check if request is too large"""
        max_size = getattr(settings, 'MAX_REQUEST_SIZE', 10 * 1024 * 1024)  # 10MB default
        
        content_length = request.META.get('CONTENT_LENGTH')
        if content_length and int(content_length) > max_size:
            return True
        
        return False


class IPWhitelistMiddleware(MiddlewareMixin):
    """
    Middleware to restrict access to whitelisted IPs for admin interfaces
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.admin_paths = ['/admin/', '/api/admin/']
        self.whitelisted_ips = getattr(settings, 'ADMIN_WHITELIST_IPS', [])
        super().__init__(get_response)
    
    def process_request(self, request):
        """Check if admin access is from whitelisted IP"""
        if not self.whitelisted_ips:
            return None
        
        # Check if this is an admin path
        is_admin_path = any(request.path.startswith(path) for path in self.admin_paths)
        if not is_admin_path:
            return None
        
        # Get client IP
        client_ip = self.get_client_ip(request)
        
        # Check if IP is whitelisted
        if not self.is_ip_whitelisted(client_ip):
            logger.warning(f"Admin access denied for IP: {client_ip}")
            return HttpResponseForbidden("Admin access restricted")
        
        return None
    
    def get_client_ip(self, request) -> str:
        """Get the real client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR', '')
        return ip
    
    def is_ip_whitelisted(self, ip: str) -> bool:
        """Check if IP is in whitelist"""
        try:
            client_ip = ipaddress.ip_address(ip)
            for whitelisted_ip in self.whitelisted_ips:
                if '/' in whitelisted_ip:
                    # CIDR notation
                    if client_ip in ipaddress.ip_network(whitelisted_ip):
                        return True
                else:
                    # Single IP
                    if client_ip == ipaddress.ip_address(whitelisted_ip):
                        return True
            return False
        except ValueError:
            # Invalid IP format
            return False


class RequestValidationMiddleware(MiddlewareMixin):
    """
    Middleware for validating and sanitizing requests
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        super().__init__(get_response)
    
    def process_request(self, request):
        """Validate and sanitize request data"""
        # Validate Content-Type for POST/PUT requests
        if request.method in ['POST', 'PUT', 'PATCH']:
            content_type = request.META.get('CONTENT_TYPE', '')
            if not self.is_valid_content_type(content_type):
                return JsonResponse({
                    'error': 'Invalid content type'
                }, status=400)
        
        # Validate User-Agent header
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        if not self.is_valid_user_agent(user_agent):
            logger.warning(f"Suspicious User-Agent: {user_agent}")
            return HttpResponseForbidden("Invalid user agent")
        
        return None
    
    def is_valid_content_type(self, content_type: str) -> bool:
        """Check if content type is valid"""
        valid_types = [
            'application/json',
            'application/x-www-form-urlencoded',
            'multipart/form-data',
            'text/plain',
            'application/xml',
        ]
        
        # Extract base content type (ignore charset, etc.)
        base_type = content_type.split(';')[0].strip().lower()
        return base_type in valid_types or base_type == ''
    
    def is_valid_user_agent(self, user_agent: str) -> bool:
        """Check if user agent is valid (not obviously malicious)"""
        if not user_agent:
            return False
        
        # Check for obviously malicious patterns
        malicious_patterns = [
            r'sqlmap',
            r'nikto',
            r'nessus',
            r'openvas',
            r'burpsuite',
            r'w3af',
            r'havij',
            r'union.*select',
            r'<script',
        ]
        
        user_agent_lower = user_agent.lower()
        for pattern in malicious_patterns:
            if re.search(pattern, user_agent_lower):
                return False
        
        return True


class SecurityEventLogger:
    """
    Logger for security events
    """
    
    @staticmethod
    def log_failed_auth(ip: str, username: str = None):
        """Log failed authentication attempt"""
        logger.warning(f"Failed authentication from {ip}, username: {username}")
    
    @staticmethod
    def log_suspicious_activity(ip: str, description: str):
        """Log suspicious activity"""
        logger.warning(f"Suspicious activity from {ip}: {description}")
    
    @staticmethod
    def log_rate_limit_exceeded(ip: str, path: str):
        """Log rate limit exceeded"""
        logger.warning(f"Rate limit exceeded from {ip} for path: {path}")
    
    @staticmethod
    def log_blocked_ip(ip: str, reason: str):
        """Log IP blocking"""
        logger.warning(f"Blocked IP {ip}, reason: {reason}")