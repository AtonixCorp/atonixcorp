import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter

# Use token-based websocket auth middleware
from backend.channels.token_auth import TokenAuthMiddlewareStack

import backend.dashboard.routing as dashboard_routing
import backend.chat.routing as chat_routing
import backend.docs.routing as docs_routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': TokenAuthMiddlewareStack(
        URLRouter(
            dashboard_routing.websocket_urlpatterns + chat_routing.websocket_urlpatterns + docs_routing.websocket_urlpatterns
        )
    ),
})
