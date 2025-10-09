from urllib.parse import parse_qs
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework.authtoken.models import Token


@database_sync_to_async
def get_user_for_token(key):
    try:
        token = Token.objects.select_related('user').get(key=key)
        return token.user
    except Token.DoesNotExist:
        return None


class TokenAuthMiddleware:
    """Custom middleware that takes token= in the query string and authenticates the user."""
    def __init__(self, inner):
        self.inner = inner

    def __call__(self, scope):
        return TokenAuthMiddlewareInstance(scope, self)


class TokenAuthMiddlewareInstance:
    def __init__(self, scope, middleware):
        self.scope = dict(scope)
        self.inner = middleware.inner

    async def __call__(self, receive, send):
        query_string = self.scope.get('query_string', b'').decode()
        qs = parse_qs(query_string)
        token_key = qs.get('token', [None])[0]
        user = None
        if token_key:
            user = await get_user_for_token(token_key)
        if user:
            self.scope['user'] = user
        else:
            self.scope['user'] = AnonymousUser()
        inner = self.inner(self.scope)
        return await inner(receive, send)


def TokenAuthMiddlewareStack(inner):
    return TokenAuthMiddleware(AuthMiddlewareStack(inner))
