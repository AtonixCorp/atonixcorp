"""
RabbitMQ client for message queuing and asynchronous processing.
"""
import json
import logging
import threading
import time
from typing import Dict, List, Optional, Any, Callable, Union
from datetime import datetime
from functools import wraps

# RabbitMQ imports (will be available after pip install)
try:
    import pika
    from pika.exceptions import AMQPError, ConnectionClosed, ChannelClosed
    import kombu
    from kombu import Connection, Queue, Exchange, Producer, Consumer
    from kombu.exceptions import KombuError
except ImportError:
    # Graceful fallback if RabbitMQ libraries aren't installed
    pika = None
    kombu = None
    AMQPError = ConnectionClosed = ChannelClosed = None
    Connection = Queue = Exchange = Producer = Consumer = None
    KombuError = None

from django.conf import settings

logger = logging.getLogger(__name__)


class RabbitMQClient:
    """RabbitMQ client for publishing and consuming messages."""
    
    def __init__(self):
        """Initialize RabbitMQ client."""
        self.connection_url = getattr(settings, 'RABBITMQ_URL', 'amqp://guest:guest@localhost:5672/')
        self.vhost = getattr(settings, 'RABBITMQ_VHOST', '/')
        self.exchange_name = getattr(settings, 'RABBITMQ_EXCHANGE', 'atonixcorp')
        
        self._connection = None
        self._channel = None
        self._kombu_connection = None
        
        # Connection parameters
        self.connection_params = self._parse_connection_url()
        
    def _parse_connection_url(self):
        """Parse connection URL to pika parameters."""
        if not pika:
            return None
        
        try:
            return pika.URLParameters(self.connection_url)
        except Exception as e:
            logger.error(f"Failed to parse RabbitMQ URL: {e}")
            return None
    
    def connect(self):
        """Establish connection to RabbitMQ."""
        if not pika:
            raise ImportError("pika library not installed")
        
        try:
            self._connection = pika.BlockingConnection(self.connection_params)
            self._channel = self._connection.channel()
            
            # Declare default exchange
            self._channel.exchange_declare(
                exchange=self.exchange_name,
                exchange_type='topic',
                durable=True
            )
            
            logger.info(f"Connected to RabbitMQ at {self.connection_params.host}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect to RabbitMQ: {e}")
            return False
    
    def disconnect(self):
        """Close RabbitMQ connection."""
        try:
            if self._channel and not self._channel.is_closed:
                self._channel.close()
            if self._connection and not self._connection.is_closed:
                self._connection.close()
            if self._kombu_connection:
                self._kombu_connection.close()
            logger.info("Disconnected from RabbitMQ")
        except Exception as e:
            logger.error(f"Error during disconnect: {e}")
    
    def publish_message(self, routing_key: str, message: Dict[str, Any], 
                       exchange: Optional[str] = None, persistent: bool = True,
                       headers: Optional[Dict] = None) -> bool:
        """Publish a message to RabbitMQ."""
        if not self._channel or self._channel.is_closed:
            if not self.connect():
                return False
        
        try:
            # Prepare message with metadata
            enriched_message = {
                'data': message,
                'metadata': {
                    'timestamp': datetime.utcnow().isoformat(),
                    'source': 'atonixcorp-backend',
                    'routing_key': routing_key,
                    'version': '1.0'
                }
            }
            
            if headers:
                enriched_message['metadata']['headers'] = headers
            
            # Message properties
            properties = pika.BasicProperties(
                delivery_mode=2 if persistent else 1,  # 2 = persistent, 1 = transient
                content_type='application/json',
                timestamp=int(time.time()),
                headers=headers or {}
            )
            
            self._channel.basic_publish(
                exchange=exchange or self.exchange_name,
                routing_key=routing_key,
                body=json.dumps(enriched_message),
                properties=properties
            )
            
            logger.info(f"Published message to {routing_key}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to publish message to {routing_key}: {e}")
            return False
    
    def declare_queue(self, queue_name: str, routing_key: str, 
                     durable: bool = True, exclusive: bool = False,
                     auto_delete: bool = False) -> bool:
        """Declare a queue and bind it to exchange."""
        if not self._channel or self._channel.is_closed:
            if not self.connect():
                return False
        
        try:
            self._channel.queue_declare(
                queue=queue_name,
                durable=durable,
                exclusive=exclusive,
                auto_delete=auto_delete
            )
            
            self._channel.queue_bind(
                exchange=self.exchange_name,
                queue=queue_name,
                routing_key=routing_key
            )
            
            logger.info(f"Declared queue {queue_name} with routing key {routing_key}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to declare queue {queue_name}: {e}")
            return False
    
    def consume_messages(self, queue_name: str, callback: Callable[[str, Dict], None],
                        auto_ack: bool = False, max_messages: Optional[int] = None):
        """Consume messages from a queue."""
        if not self._channel or self._channel.is_closed:
            if not self.connect():
                return
        
        message_count = 0
        
        def message_callback(ch, method, properties, body):
            nonlocal message_count
            
            try:
                # Parse message
                message_data = json.loads(body.decode('utf-8'))
                
                # Extract original data if it has our metadata wrapper
                if isinstance(message_data, dict) and 'data' in message_data and 'metadata' in message_data:
                    data = message_data['data']
                    metadata = message_data['metadata']
                    routing_key = metadata.get('routing_key', method.routing_key)
                    logger.debug(f"Received message with metadata from {metadata.get('source')}")
                else:
                    data = message_data
                    routing_key = method.routing_key
                
                # Call the callback function
                callback(routing_key, data)
                
                # Acknowledge message if not auto-ack
                if not auto_ack:
                    ch.basic_ack(delivery_tag=method.delivery_tag)
                
                message_count += 1
                if max_messages and message_count >= max_messages:
                    ch.stop_consuming()
                    
            except Exception as e:
                logger.error(f"Error processing message: {e}")
                if not auto_ack:
                    ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
        
        try:
            self._channel.basic_consume(
                queue=queue_name,
                on_message_callback=message_callback,
                auto_ack=auto_ack
            )
            
            logger.info(f"Starting to consume from queue {queue_name}")
            self._channel.start_consuming()
            
        except KeyboardInterrupt:
            logger.info("Consumer interrupted by user")
            self._channel.stop_consuming()
        except Exception as e:
            logger.error(f"Consumer error: {e}")
    
    def get_queue_info(self, queue_name: str) -> Optional[Dict[str, Any]]:
        """Get information about a queue."""
        if not self._channel or self._channel.is_closed:
            if not self.connect():
                return None
        
        try:
            method = self._channel.queue_declare(queue=queue_name, passive=True)
            return {
                'queue': queue_name,
                'message_count': method.method.message_count,
                'consumer_count': method.method.consumer_count
            }
        except Exception as e:
            logger.error(f"Failed to get queue info for {queue_name}: {e}")
            return None
    
    def purge_queue(self, queue_name: str) -> bool:
        """Purge all messages from a queue."""
        if not self._channel or self._channel.is_closed:
            if not self.connect():
                return False
        
        try:
            self._channel.queue_purge(queue=queue_name)
            logger.info(f"Purged queue {queue_name}")
            return True
        except Exception as e:
            logger.error(f"Failed to purge queue {queue_name}: {e}")
            return False
    
    def delete_queue(self, queue_name: str) -> bool:
        """Delete a queue."""
        if not self._channel or self._channel.is_closed:
            if not self.connect():
                return False
        
        try:
            self._channel.queue_delete(queue=queue_name)
            logger.info(f"Deleted queue {queue_name}")
            return True
        except Exception as e:
            logger.error(f"Failed to delete queue {queue_name}: {e}")
            return False


class MessagePublisher:
    """High-level message publisher for common application messages."""
    
    def __init__(self, rabbitmq_client: Optional[RabbitMQClient] = None):
        self.rabbitmq_client = rabbitmq_client or get_rabbitmq_client()
    
    def user_message(self, message_type: str, user_id: int, data: Dict[str, Any]) -> bool:
        """Send user-related message."""
        routing_key = f"user.{message_type}"
        message = {
            'user_id': user_id,
            'message_type': message_type,
            **data
        }
        return self.rabbitmq_client.publish_message(routing_key, message)
    
    def project_message(self, message_type: str, project_id: int, user_id: int, data: Dict[str, Any]) -> bool:
        """Send project-related message."""
        routing_key = f"project.{message_type}"
        message = {
            'project_id': project_id,
            'user_id': user_id,
            'message_type': message_type,
            **data
        }
        return self.rabbitmq_client.publish_message(routing_key, message)
    
    def team_message(self, message_type: str, team_id: int, user_id: int, data: Dict[str, Any]) -> bool:
        """Send team-related message."""
        routing_key = f"team.{message_type}"
        message = {
            'team_id': team_id,
            'user_id': user_id,
            'message_type': message_type,
            **data
        }
        return self.rabbitmq_client.publish_message(routing_key, message)
    
    def notification_message(self, user_id: int, notification_type: str, data: Dict[str, Any]) -> bool:
        """Send notification message."""
        routing_key = f"notification.{notification_type}"
        message = {
            'user_id': user_id,
            'notification_type': notification_type,
            'data': data,
            'created_at': datetime.utcnow().isoformat()
        }
        return self.rabbitmq_client.publish_message(routing_key, message)
    
    def task_message(self, task_type: str, data: Dict[str, Any], priority: int = 5) -> bool:
        """Send task message for background processing."""
        routing_key = f"task.{task_type}.priority.{priority}"
        message = {
            'task_type': task_type,
            'priority': priority,
            'data': data,
            'created_at': datetime.utcnow().isoformat()
        }
        return self.rabbitmq_client.publish_message(routing_key, message)


class MessageConsumer:
    """High-level message consumer with handlers."""
    
    def __init__(self, rabbitmq_client: Optional[RabbitMQClient] = None):
        self.rabbitmq_client = rabbitmq_client or get_rabbitmq_client()
        self.handlers = {}
        self.running = False
        self.consumer_thread = None
    
    def register_handler(self, routing_pattern: str, handler: Callable[[str, Dict], None],
                        queue_name: Optional[str] = None):
        """Register a handler for messages matching routing pattern."""
        if queue_name is None:
            queue_name = f"queue.{routing_pattern.replace('.', '_').replace('*', 'all')}"
        
        self.handlers[routing_pattern] = {
            'handler': handler,
            'queue_name': queue_name
        }
        
        # Declare the queue
        self.rabbitmq_client.declare_queue(queue_name, routing_pattern)
    
    def start_consuming(self, queue_name: str):
        """Start consuming messages in a separate thread."""
        if self.running:
            logger.warning("Consumer already running")
            return
        
        self.running = True
        self.consumer_thread = threading.Thread(
            target=self._consume_loop,
            args=(queue_name,),
            daemon=True
        )
        self.consumer_thread.start()
    
    def stop_consuming(self):
        """Stop consuming messages."""
        self.running = False
        if self.consumer_thread:
            self.consumer_thread.join(timeout=5)
    
    def _consume_loop(self, queue_name: str):
        """Main consumer loop."""
        def message_handler(routing_key: str, data: Dict[str, Any]):
            # Find matching handlers
            for pattern, handler_info in self.handlers.items():
                if self._pattern_matches(pattern, routing_key):
                    try:
                        handler_info['handler'](routing_key, data)
                    except Exception as e:
                        logger.error(f"Handler error for {routing_key}: {e}")
        
        try:
            self.rabbitmq_client.consume_messages(queue_name, message_handler)
        except Exception as e:
            logger.error(f"Consumer loop error: {e}")
        finally:
            self.running = False
    
    def _pattern_matches(self, pattern: str, routing_key: str) -> bool:
        """Check if routing key matches pattern (supports * wildcard)."""
        if pattern == routing_key:
            return True
        
        if '*' in pattern:
            pattern_parts = pattern.split('.')
            key_parts = routing_key.split('.')
            
            if len(pattern_parts) != len(key_parts):
                return False
            
            for p_part, k_part in zip(pattern_parts, key_parts):
                if p_part != '*' and p_part != k_part:
                    return False
            
            return True
        
        return False


class TaskQueue:
    """Task queue for background job processing."""
    
    def __init__(self, queue_name: str = "tasks", rabbitmq_client: Optional[RabbitMQClient] = None):
        self.queue_name = queue_name
        self.rabbitmq_client = rabbitmq_client or get_rabbitmq_client()
        
        # Declare task queue
        self.rabbitmq_client.declare_queue(
            queue_name=self.queue_name,
            routing_key="task.*",
            durable=True
        )
    
    def enqueue_task(self, task_name: str, args: List[Any] = None, kwargs: Dict[str, Any] = None,
                    priority: int = 5, delay: Optional[int] = None) -> bool:
        """Enqueue a task for background processing."""
        task_data = {
            'task_name': task_name,
            'args': args or [],
            'kwargs': kwargs or {},
            'priority': priority,
            'enqueued_at': datetime.utcnow().isoformat(),
            'delay': delay
        }
        
        routing_key = f"task.{task_name}.priority.{priority}"
        return self.rabbitmq_client.publish_message(routing_key, task_data)
    
    def process_tasks(self, task_registry: Dict[str, Callable]):
        """Process tasks from the queue."""
        def task_handler(routing_key: str, data: Dict[str, Any]):
            task_name = data.get('task_name')
            args = data.get('args', [])
            kwargs = data.get('kwargs', {})
            
            if task_name in task_registry:
                try:
                    logger.info(f"Processing task: {task_name}")
                    result = task_registry[task_name](*args, **kwargs)
                    logger.info(f"Task {task_name} completed successfully")
                    return result
                except Exception as e:
                    logger.error(f"Task {task_name} failed: {e}")
                    raise
            else:
                logger.warning(f"Unknown task: {task_name}")
        
        self.rabbitmq_client.consume_messages(self.queue_name, task_handler)


# Decorator for task functions
def rabbitmq_task(task_name: str, queue: Optional[TaskQueue] = None):
    """Decorator to mark functions as RabbitMQ tasks."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if queue:
                return queue.enqueue_task(task_name, args, kwargs)
            else:
                # Execute directly if no queue provided
                return func(*args, **kwargs)
        
        wrapper.task_name = task_name
        wrapper.original_func = func
        return wrapper
    
    return decorator


# Global RabbitMQ client instance
_rabbitmq_client = None


def get_rabbitmq_client() -> RabbitMQClient:
    """Get or create global RabbitMQ client instance."""
    global _rabbitmq_client
    if _rabbitmq_client is None:
        _rabbitmq_client = RabbitMQClient()
    return _rabbitmq_client


def close_rabbitmq_client():
    """Close the global RabbitMQ client."""
    global _rabbitmq_client
    if _rabbitmq_client is not None:
        _rabbitmq_client.disconnect()
        _rabbitmq_client = None