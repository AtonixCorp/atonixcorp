"""
Kafka middleware for Django to provide Kafka client in requests.
"""
import logging
from django.conf import settings
from core.kafka_client import get_kafka_client


logger = logging.getLogger(__name__)


class KafkaMiddleware:
    """Middleware to add Kafka client to request objects."""
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.kafka_enabled = getattr(settings, 'KAFKA_ENABLED', False)
        
        if self.kafka_enabled:
            try:
                self.kafka_client = get_kafka_client()
            except Exception as e:
                logger.warning(f"Failed to initialize Kafka client: {e}")
                self.kafka_client = None
        else:
            self.kafka_client = None
    
    def __call__(self, request):
        # Add Kafka client to request if enabled and available
        if self.kafka_enabled and self.kafka_client:
            request.kafka = self.kafka_client
        else:
            request.kafka = None
        
        response = self.get_response(request)
        return response