from functools import wraps
from django.http import HttpResponseForbidden
from django.core.exceptions import PermissionDenied
from .models import RoleAssignment, Permission, ServiceAccount


def user_has_permission(user, permission_code):
    """
    Check if a user has a specific permission through their roles.
    
    Args:
        user: Django User instance or ServiceAccount
        permission_code: Permission code string (e.g., 'read:projects')
    
    Returns:
        bool: True if user has permission, False otherwise
    """
    if not user:
        return False
    
    # Handle service accounts
    if isinstance(user, ServiceAccount):
        return user.has_permission(permission_code) if user.is_active else False
    
    # Handle regular users
    if not getattr(user, 'is_authenticated', False):
        return False
    
    # Superusers have all permissions
    if getattr(user, 'is_superuser', False):
        return True
    
    # Check role assignments
    assignments = RoleAssignment.objects.filter(
        user=user,
        is_active=True,
        role__is_active=True
    ).select_related('role')
    
    for assignment in assignments:
        # Skip expired assignments
        if assignment.is_expired:
            continue
            
        if assignment.role.has_permission(permission_code):
            return True
    
    return False


def require_permission(permission_code, raise_exception=False):
    """
    Decorator that checks if the user has the required permission.
    
    Args:
        permission_code: The permission code required
        raise_exception: If True, raises PermissionDenied instead of returning 403
    
    Usage:
        @require_permission('write:projects')
        def my_view(request):
            # View code here
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped(request, *args, **kwargs):
            if user_has_permission(request.user, permission_code):
                return view_func(request, *args, **kwargs)
            
            if raise_exception:
                raise PermissionDenied(f'Permission required: {permission_code}')
            return HttpResponseForbidden('Forbidden: missing permission')
        return _wrapped
    return decorator


def require_any_permission(*permission_codes, raise_exception=False):
    """
    Decorator that checks if the user has any of the required permissions.
    
    Args:
        permission_codes: Multiple permission codes (user needs at least one)
        raise_exception: If True, raises PermissionDenied instead of returning 403
    
    Usage:
        @require_any_permission('read:projects', 'write:projects')
        def my_view(request):
            # View code here
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped(request, *args, **kwargs):
            for permission_code in permission_codes:
                if user_has_permission(request.user, permission_code):
                    return view_func(request, *args, **kwargs)
            
            if raise_exception:
                raise PermissionDenied(f'One of these permissions required: {", ".join(permission_codes)}')
            return HttpResponseForbidden('Forbidden: missing required permissions')
        return _wrapped
    return decorator


def require_all_permissions(*permission_codes, raise_exception=False):
    """
    Decorator that checks if the user has all of the required permissions.
    
    Args:
        permission_codes: Multiple permission codes (user needs all of them)
        raise_exception: If True, raises PermissionDenied instead of returning 403
    
    Usage:
        @require_all_permissions('read:projects', 'write:projects')
        def my_view(request):
            # View code here
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped(request, *args, **kwargs):
            for permission_code in permission_codes:
                if not user_has_permission(request.user, permission_code):
                    if raise_exception:
                        raise PermissionDenied(f'All permissions required: {", ".join(permission_codes)}')
                    return HttpResponseForbidden('Forbidden: missing required permissions')
            
            return view_func(request, *args, **kwargs)
        return _wrapped
    return decorator


class PermissionChecker:
    """
    Utility class for checking permissions in templates and other contexts.
    
    Usage:
        checker = PermissionChecker(request.user)
        if checker.has('read:projects'):
            # Do something
    """
    
    def __init__(self, user):
        self.user = user
    
    def has(self, permission_code):
        """Check if user has a specific permission."""
        return user_has_permission(self.user, permission_code)
    
    def has_any(self, *permission_codes):
        """Check if user has any of the specified permissions."""
        return any(self.has(code) for code in permission_codes)
    
    def has_all(self, *permission_codes):
        """Check if user has all of the specified permissions."""
        return all(self.has(code) for code in permission_codes)
