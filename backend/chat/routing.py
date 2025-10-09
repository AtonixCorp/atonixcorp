from django.urls import re_path
from .consumers import ChatConsumer
from dashboard.consumers import DashboardConsumer
from docs.consumers import DocsConsumer

websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<room_id>[^/]+)/$', ChatConsumer.as_asgi()),
    re_path(r'ws/docs/(?P<doc_id>[^/]+)/$', DocsConsumer.as_asgi()),
]
