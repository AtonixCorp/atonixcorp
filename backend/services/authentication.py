# Authentication classes for AtonixCorp services
from rest_framework.authentication import TokenAuthentication, BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.utils import timezone


class APIKeyAuthentication(BaseAuthentication):
    """
    API Key authentication using the APIKey model (plain-key lookup).
    Header format:  Authorization: ApiKey <key>
    """
    auth_header_prefix = 'ApiKey'

    def get_authorization_header(self, request):
        auth = request.META.get('HTTP_AUTHORIZATION', '').split()
        if not auth or auth[0].lower() != self.auth_header_prefix.lower():
            return None
        if len(auth) == 1:
            raise AuthenticationFailed('Invalid token header. No credentials provided.')
        if len(auth) > 2:
            raise AuthenticationFailed('Invalid token header. Token string should not contain spaces.')
        return auth[1]

    def authenticate(self, request):
        auth_token = self.get_authorization_header(request)
        if auth_token is None:
            return None
        return self.authenticate_credentials(key_string=auth_token)

    def authenticate_credentials(self, key_string):
        """Validate a plain API key string and return (user, api_key)."""
        from .base_models import UserAPIKey
        try:
            api_key = UserAPIKey.objects.select_related('user').get(key=key_string)
        except UserAPIKey.DoesNotExist:
            raise AuthenticationFailed('Invalid API key.')

        if not api_key.is_active:
            raise AuthenticationFailed('API key is inactive.')

        if api_key.expires_at and api_key.expires_at < timezone.now():
            raise AuthenticationFailed('API key has expired.')

        return (api_key.user, api_key)

    def authenticate_header(self, request):
        return self.auth_header_prefix


class BearerTokenAuthentication(TokenAuthentication):
    """Bearer token authentication (alias for DRF TokenAuthentication)."""
    keyword = 'Bearer'


__all__ = ['APIKeyAuthentication', 'BearerTokenAuthentication']
