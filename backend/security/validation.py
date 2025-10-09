"""
Input validation and sanitization utilities
"""
import re
import html
import json
from typing import Any, Dict, List, Optional, Union
from django.core.exceptions import ValidationError
from django.utils.html import strip_tags
from django.core.validators import validate_email, URLValidator
import logging

logger = logging.getLogger(__name__)


class InputValidator:
    """
    Comprehensive input validation and sanitization
    """
    
    # Dangerous patterns to detect
    XSS_PATTERNS = [
        r'<script[^>]*>.*?</script>',
        r'javascript:',
        r'onload\s*=',
        r'onerror\s*=',
        r'onclick\s*=',
        r'onmouseover\s*=',
        r'onfocus\s*=',
        r'onblur\s*=',
        r'<iframe[^>]*>',
        r'<object[^>]*>',
        r'<embed[^>]*>',
        r'<form[^>]*>',
        r'<meta[^>]*>',
        r'<link[^>]*>',
    ]
    
    SQL_INJECTION_PATTERNS = [
        r'union\s+select',
        r'drop\s+table',
        r'insert\s+into',
        r'delete\s+from',
        r'update\s+.*\s+set',
        r'exec\s*\(',
        r'execute\s*\(',
        r'sp_executesql',
        r'xp_cmdshell',
        r'--\s*$',
        r'/\*.*\*/',
        r';\s*drop',
        r';\s*delete',
        r';\s*insert',
        r';\s*update',
    ]
    
    COMMAND_INJECTION_PATTERNS = [
        r'&&',
        r'\|\|',
        r';\s*cat',
        r';\s*ls',
        r';\s*pwd',
        r';\s*whoami',
        r';\s*id',
        r';\s*uname',
        r';\s*ps',
        r';\s*netstat',
        r';\s*wget',
        r';\s*curl',
        r'`.*`',
        r'\$\(.*\)',
        r'</dev/null',
        r'2>&1',
        r'cmd\.exe',
        r'powershell',
        r'/bin/sh',
        r'/bin/bash',
    ]
    
    PATH_TRAVERSAL_PATTERNS = [
        r'\.\./\.\.',
        r'\.\.\\\.\.\\',
        r'\.\./',
        r'\.\.\\',
        r'/etc/passwd',
        r'/etc/shadow',
        r'windows\\system32',
        r'\.htaccess',
        r'\.htpasswd',
        r'web\.config',
    ]
    
    def __init__(self):
        self.url_validator = URLValidator()
    
    def validate_and_sanitize_string(
        self, 
        value: str, 
        max_length: int = 1000,
        allow_html: bool = False,
        strip_whitespace: bool = True
    ) -> str:
        """
        Validate and sanitize string input
        """
        if not isinstance(value, str):
            raise ValidationError("Input must be a string")
        
        # Strip whitespace if requested
        if strip_whitespace:
            value = value.strip()
        
        # Check length
        if len(value) > max_length:
            raise ValidationError(f"Input too long (max {max_length} characters)")
        
        # Check for malicious patterns
        if self._contains_malicious_patterns(value):
            raise ValidationError("Input contains potentially dangerous content")
        
        # Handle HTML
        if allow_html:
            # Allow specific safe HTML tags
            value = self._sanitize_html(value)
        else:
            # Strip all HTML tags
            value = strip_tags(value)
            # Escape any remaining HTML entities
            value = html.escape(value)
        
        return value
    
    def validate_email_address(self, email: str) -> str:
        """
        Validate and sanitize email address
        """
        if not isinstance(email, str):
            raise ValidationError("Email must be a string")
        
        email = email.strip().lower()
        
        try:
            validate_email(email)
        except ValidationError:
            raise ValidationError("Invalid email format")
        
        # Additional checks
        if len(email) > 254:  # RFC 5321
            raise ValidationError("Email address too long")
        
        # Check for suspicious patterns
        if self._contains_malicious_patterns(email):
            raise ValidationError("Email contains invalid characters")
        
        return email
    
    def validate_url(self, url: str) -> str:
        """
        Validate and sanitize URL
        """
        if not isinstance(url, str):
            raise ValidationError("URL must be a string")
        
        url = url.strip()
        
        # Check for malicious patterns
        if self._contains_malicious_patterns(url):
            raise ValidationError("URL contains potentially dangerous content")
        
        try:
            self.url_validator(url)
        except ValidationError:
            raise ValidationError("Invalid URL format")
        
        # Additional security checks
        parsed_url = self._parse_url_safely(url)
        if not parsed_url:
            raise ValidationError("Invalid URL")
        
        # Check for dangerous protocols
        dangerous_protocols = ['javascript', 'data', 'vbscript', 'file']
        if parsed_url.get('scheme', '').lower() in dangerous_protocols:
            raise ValidationError("Unsafe URL protocol")
        
        return url
    
    def validate_json(self, json_string: str, max_depth: int = 10) -> dict:
        """
        Validate and parse JSON safely
        """
        if not isinstance(json_string, str):
            raise ValidationError("JSON input must be a string")
        
        # Check for malicious patterns
        if self._contains_malicious_patterns(json_string):
            raise ValidationError("JSON contains potentially dangerous content")
        
        try:
            parsed = json.loads(json_string)
        except json.JSONDecodeError as e:
            raise ValidationError(f"Invalid JSON: {str(e)}")
        
        # Check depth to prevent DoS
        if self._get_json_depth(parsed) > max_depth:
            raise ValidationError(f"JSON too deeply nested (max depth: {max_depth})")
        
        # Recursively validate string values
        self._validate_json_values(parsed)
        
        return parsed
    
    def validate_filename(self, filename: str) -> str:
        """
        Validate and sanitize filename
        """
        if not isinstance(filename, str):
            raise ValidationError("Filename must be a string")
        
        filename = filename.strip()
        
        # Check length
        if len(filename) > 255:
            raise ValidationError("Filename too long")
        
        # Check for dangerous patterns
        dangerous_patterns = [
            r'\.\./',
            r'\.\.\\',
            r'^\..*',  # Hidden files
            r'.*\.(exe|bat|cmd|scr|pif|com)$',  # Executable files
            r'.*\.(php|jsp|asp|aspx)$',  # Server-side scripts
        ]
        
        for pattern in dangerous_patterns:
            if re.search(pattern, filename, re.IGNORECASE):
                raise ValidationError("Filename contains dangerous characters or extension")
        
        # Sanitize filename
        filename = re.sub(r'[^\w\-_\.]', '_', filename)
        
        return filename
    
    def validate_integer(
        self, 
        value: Union[str, int], 
        min_value: Optional[int] = None,
        max_value: Optional[int] = None
    ) -> int:
        """
        Validate integer input
        """
        try:
            if isinstance(value, str):
                value = int(value.strip())
            elif not isinstance(value, int):
                raise ValueError("Not an integer")
        except (ValueError, TypeError):
            raise ValidationError("Invalid integer value")
        
        if min_value is not None and value < min_value:
            raise ValidationError(f"Value must be at least {min_value}")
        
        if max_value is not None and value > max_value:
            raise ValidationError(f"Value must be at most {max_value}")
        
        return value
    
    def validate_phone_number(self, phone: str) -> str:
        """
        Validate and sanitize phone number
        """
        if not isinstance(phone, str):
            raise ValidationError("Phone number must be a string")
        
        # Remove all non-digit characters except + for international
        phone = re.sub(r'[^\d+]', '', phone)
        
        # Basic validation
        if not re.match(r'^\+?[\d]{7,15}$', phone):
            raise ValidationError("Invalid phone number format")
        
        return phone
    
    def _contains_malicious_patterns(self, value: str) -> bool:
        """
        Check if value contains malicious patterns
        """
        value_lower = value.lower()
        
        all_patterns = (
            self.XSS_PATTERNS + 
            self.SQL_INJECTION_PATTERNS + 
            self.COMMAND_INJECTION_PATTERNS + 
            self.PATH_TRAVERSAL_PATTERNS
        )
        
        for pattern in all_patterns:
            if re.search(pattern, value_lower, re.IGNORECASE | re.MULTILINE):
                logger.warning(f"Malicious pattern detected: {pattern}")
                return True
        
        return False
    
    def _sanitize_html(self, html_content: str) -> str:
        """
        Sanitize HTML content (basic implementation)
        For production, consider using a library like bleach
        """
        # Remove dangerous tags
        dangerous_tags = [
            'script', 'iframe', 'object', 'embed', 'form', 
            'input', 'button', 'textarea', 'select', 'option',
            'meta', 'link', 'style'
        ]
        
        for tag in dangerous_tags:
            pattern = rf'<{tag}[^>]*>.*?</{tag}>'
            html_content = re.sub(pattern, '', html_content, flags=re.IGNORECASE | re.DOTALL)
            # Also remove self-closing tags
            pattern = rf'<{tag}[^>]*/?>'
            html_content = re.sub(pattern, '', html_content, flags=re.IGNORECASE)
        
        # Remove dangerous attributes
        dangerous_attrs = [
            'onload', 'onerror', 'onclick', 'onmouseover', 'onfocus', 
            'onblur', 'onchange', 'onsubmit', 'onreset', 'onselect',
            'onkeydown', 'onkeyup', 'onkeypress', 'href="javascript:'
        ]
        
        for attr in dangerous_attrs:
            pattern = rf'{attr}[^>]*'
            html_content = re.sub(pattern, '', html_content, flags=re.IGNORECASE)
        
        return html_content
    
    def _parse_url_safely(self, url: str) -> Optional[Dict[str, str]]:
        """
        Safely parse URL
        """
        try:
            from urllib.parse import urlparse
            parsed = urlparse(url)
            return {
                'scheme': parsed.scheme,
                'netloc': parsed.netloc,
                'path': parsed.path,
                'params': parsed.params,
                'query': parsed.query,
                'fragment': parsed.fragment
            }
        except Exception:
            return None
    
    def _get_json_depth(self, obj: Any, depth: int = 0) -> int:
        """
        Calculate JSON object depth
        """
        if isinstance(obj, dict):
            return max([self._get_json_depth(v, depth + 1) for v in obj.values()], default=depth)
        elif isinstance(obj, list):
            return max([self._get_json_depth(item, depth + 1) for item in obj], default=depth)
        else:
            return depth
    
    def _validate_json_values(self, obj: Any):
        """
        Recursively validate JSON values
        """
        if isinstance(obj, dict):
            for key, value in obj.items():
                if isinstance(key, str) and self._contains_malicious_patterns(key):
                    raise ValidationError("JSON key contains malicious content")
                self._validate_json_values(value)
        elif isinstance(obj, list):
            for item in obj:
                self._validate_json_values(item)
        elif isinstance(obj, str):
            if self._contains_malicious_patterns(obj):
                raise ValidationError("JSON value contains malicious content")


# Global validator instance
input_validator = InputValidator()


# Decorator for automatic input validation
def validate_input(**validation_rules):
    """
    Decorator for automatic input validation
    Usage: @validate_input(name='string:100', email='email', age='int:1:120')
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Validate kwargs based on rules
            for field, rule in validation_rules.items():
                if field in kwargs:
                    value = kwargs[field]
                    validated_value = _apply_validation_rule(field, value, rule)
                    kwargs[field] = validated_value
            
            return func(*args, **kwargs)
        return wrapper
    return decorator


def _apply_validation_rule(field_name: str, value: Any, rule: str) -> Any:
    """
    Apply validation rule to a field value
    """
    parts = rule.split(':')
    rule_type = parts[0]
    
    try:
        if rule_type == 'string':
            max_length = int(parts[1]) if len(parts) > 1 else 1000
            return input_validator.validate_and_sanitize_string(value, max_length)
        
        elif rule_type == 'email':
            return input_validator.validate_email_address(value)
        
        elif rule_type == 'url':
            return input_validator.validate_url(value)
        
        elif rule_type == 'int':
            min_val = int(parts[1]) if len(parts) > 1 else None
            max_val = int(parts[2]) if len(parts) > 2 else None
            return input_validator.validate_integer(value, min_val, max_val)
        
        elif rule_type == 'json':
            max_depth = int(parts[1]) if len(parts) > 1 else 10
            return input_validator.validate_json(value, max_depth)
        
        elif rule_type == 'filename':
            return input_validator.validate_filename(value)
        
        elif rule_type == 'phone':
            return input_validator.validate_phone_number(value)
        
        else:
            raise ValidationError(f"Unknown validation rule: {rule_type}")
    
    except ValidationError as e:
        raise ValidationError(f"Validation failed for field '{field_name}': {str(e)}")


class SecureFormMixin:
    """
    Mixin for Django forms to add automatic security validation
    """
    
    def clean(self):
        """
        Add security validation to form cleaning
        """
        cleaned_data = super().clean()
        
        # Validate all string fields for malicious content
        for field_name, value in cleaned_data.items():
            if isinstance(value, str):
                try:
                    cleaned_data[field_name] = input_validator.validate_and_sanitize_string(
                        value, 
                        max_length=getattr(self.fields[field_name], 'max_length', 1000)
                    )
                except ValidationError as e:
                    self.add_error(field_name, str(e))
        
        return cleaned_data