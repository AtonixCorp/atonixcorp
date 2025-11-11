"""
Security middleware for protecting against various attacks
"""
import re
import json
import time
from collections import defaultdict
from django.http import JsonResponse, HttpResponseForbidden, HttpResponseRedirect
from django.shortcuts import render, redirect
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
        # Load configured auth-blocking settings (IPs and CIDR ranges)
        self.auth_block_paths = getattr(settings, 'AUTH_BLOCKED_PATHS', [
            '/api/auth/login', '/api/auth/register', '/auth/login', '/auth/register',
        ])
        self.auth_blocked_ips = set(getattr(settings, 'AUTH_BLOCKED_IPS', []))
        self.auth_blocked_networks = []
        for cidr in getattr(settings, 'AUTH_BLOCKED_IP_RANGES', []):
            try:
                self.auth_blocked_networks.append(ipaddress.ip_network(cidr))
            except Exception:
                logger.warning(f"Invalid CIDR in AUTH_BLOCKED_IP_RANGES: {cidr}")
        # Also attempt to load any entries from the BlockedNetwork model (if app is migrated)
        try:
            from .models import BlockedNetwork
            for bn in BlockedNetwork.objects.filter(active=True):
                try:
                    if bn.is_cidr:
                        self.auth_blocked_networks.append(ipaddress.ip_network(bn.value))
                    else:
                        self.auth_blocked_ips.add(bn.value)
                except Exception:
                    logger.warning(f"Invalid BlockedNetwork entry skipped: {bn.value}")
        except Exception:
            # If model/table not available (e.g., during migrate), skip silently
            pass
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
        # Check auth-specific block list for login/register paths
        try:
            path = request.path or ''
            if any(path.startswith(p) for p in self.auth_block_paths):
                if self.is_ip_in_auth_blocklist(client_ip):
                    msg = getattr(settings, 'AUTH_BLOCKED_MESSAGE', 'Access denied')
                    logger.warning(f"Auth blocked for IP {client_ip} on path {path}")
                    # Optional redirect URL configured in settings
                    redirect_url = getattr(settings, 'AUTH_BLOCKED_REDIRECT_URL', None)
                    if redirect_url:
                        try:
                            return redirect(redirect_url)
                        except Exception:
                            logger.exception('Failed to redirect blocked auth request')

                    # If client prefers HTML, render a friendly blocked page
                    accept = request.META.get('HTTP_ACCEPT', '')
                    if 'text/html' in accept:
                        try:
                            return render(request, 'security/blocked.html', {'message': msg}, status=403)
                        except Exception:
                            logger.exception('Error rendering blocked template')

                    # Fallback to JSON for API/clients
                    return JsonResponse({'error': msg}, status=403)
        except Exception:
            # In case of any unexpected error during auth-block checks, continue processing
            logger.exception('Error during auth blocklist check')
        
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
        # Only set headers if not already present (avoid overwriting hosting proxies)
        if 'X-Content-Type-Options' not in response:
            response['X-Content-Type-Options'] = 'nosniff'
        if 'X-Frame-Options' not in response:
            response['X-Frame-Options'] = getattr(settings, 'X_FRAME_OPTIONS', 'DENY')
        if 'X-XSS-Protection' not in response:
            response['X-XSS-Protection'] = '1; mode=block'
        if 'Referrer-Policy' not in response:
            response['Referrer-Policy'] = getattr(settings, 'SECURE_REFERRER_POLICY', 'strict-origin-when-cross-origin')
        if 'Permissions-Policy' not in response:
            response['Permissions-Policy'] = getattr(settings, 'PERMISSIONS_POLICY', 'geolocation=(), microphone=(), camera=()')

        # HSTS header for HTTPS - only set when running behind TLS / SECURE_SSL_REDIRECT
        hsts_seconds = getattr(settings, 'SECURE_HSTS_SECONDS', None)
        hsts_include_subdomains = getattr(settings, 'SECURE_HSTS_INCLUDE_SUBDOMAINS', False)
        hsts_preload = getattr(settings, 'SECURE_HSTS_PRELOAD', False)
        try:
            should_set_hsts = False
            # Prefer explicit SECURE_SSL_REDIRECT or USE_HTTPS flag in settings
            if getattr(settings, 'SECURE_SSL_REDIRECT', False) or getattr(settings, 'USE_HTTPS', False):
                should_set_hsts = True
            # Fall back to request.is_secure() when TLS is terminated upstream
            if not should_set_hsts and request.is_secure():
                should_set_hsts = True

            if should_set_hsts and hsts_seconds:
                hsts_value = f"max-age={int(hsts_seconds)}"
                if hsts_include_subdomains:
                    hsts_value += '; includeSubDomains'
                if hsts_preload:
                    hsts_value += '; preload'
                response.setdefault('Strict-Transport-Security', hsts_value)
        except Exception:
            logger.exception('Error while setting HSTS header')

        # Build CSP dynamically from settings if present, otherwise use a safe default
        try:
            csp_parts = []
            default_src = getattr(settings, 'CSP_DEFAULT_SRC', ["'self'"])
            csp_parts.append('default-src ' + ' '.join(default_src))

            script_src = getattr(settings, 'CSP_SCRIPT_SRC', None)
            if script_src:
                csp_parts.append('script-src ' + ' '.join(script_src))

            style_src = getattr(settings, 'CSP_STYLE_SRC', None)
            if style_src:
                csp_parts.append('style-src ' + ' '.join(style_src))

            img_src = getattr(settings, 'CSP_IMG_SRC', None)
            if img_src:
                csp_parts.append('img-src ' + ' '.join(img_src))

            font_src = getattr(settings, 'CSP_FONT_SRC', None)
            if font_src:
                csp_parts.append('font-src ' + ' '.join(font_src))

            connect_src = getattr(settings, 'CSP_CONNECT_SRC', None)
            if connect_src:
                csp_parts.append('connect-src ' + ' '.join(connect_src))

            frame_anc = getattr(settings, 'CSP_FRAME_ANCESTORS', None)
            if frame_anc:
                csp_parts.append('frame-ancestors ' + ' '.join(frame_anc))

            # Join into a policy string
            csp_policy = '; '.join(csp_parts)
            if csp_policy and 'Content-Security-Policy' not in response:
                response['Content-Security-Policy'] = csp_policy
        except Exception:
            logger.exception('Failed to build or apply CSP header')
        
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

    def is_ip_in_auth_blocklist(self, ip: str) -> bool:
        """Check if IP is explicitly blocked for auth flows (registration/login)"""
        try:
            if not ip:
                return False
            # Exact matches
            if ip in self.auth_blocked_ips:
                return True

            # CIDR/range matches
            try:
                client_ip = ipaddress.ip_address(ip)
            except ValueError:
                return False

            for net in self.auth_blocked_networks:
                if client_ip in net:
                    return True

            # Also check cache-based blocked IPs from other logic
            if self.is_ip_blocked(ip):
                return True

            return False
        except Exception:
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