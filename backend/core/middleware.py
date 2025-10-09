"""
Zookeeper middleware for Django to provide Zookeeper client in requests.
"""
import logging
from django.conf import settings
from core.zookeeper_client import get_zk_client


logger = logging.getLogger(__name__)


class ZookeeperMiddleware:
    """Middleware to add Zookeeper client to request objects."""
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.zk_enabled = getattr(settings, 'ZOOKEEPER_ENABLED', False)
        
        if self.zk_enabled:
            self.zk_client = get_zk_client()
        else:
            self.zk_client = None
    
    def __call__(self, request):
        # Add Zookeeper client to request if enabled
        if self.zk_enabled and self.zk_client:
            try:
                if not self.zk_client.connected:
                    self.zk_client.connect()
                request.zk = self.zk_client
            except Exception as e:
                logger.warning(f"Failed to connect to Zookeeper: {e}")
                request.zk = None
        else:
            request.zk = None
        
        response = self.get_response(request)
        return response