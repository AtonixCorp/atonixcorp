"""
Kafka client for event streaming and real-time messaging.
"""
import json
import logging
import asyncio
from typing import Dict, List, Optional, Any, Callable, Union
from threading import Thread
import time
from datetime import datetime

# Kafka imports (will be available after pip install)
try:
    from kafka import KafkaProducer, KafkaConsumer, KafkaAdminClient
    from kafka.admin import ConfigResource, ConfigResourceType, NewTopic
    from kafka.errors import KafkaError, TopicAlreadyExistsError
    from confluent_kafka import Producer, Consumer, AdminClient
    from confluent_kafka.admin import NewTopic as ConfluentNewTopic
    import aiokafka
except ImportError:
    # Graceful fallback if Kafka libraries aren't installed
    KafkaProducer = KafkaConsumer = KafkaAdminClient = None
    Producer = Consumer = AdminClient = None
    aiokafka = None

from django.conf import settings

logger = logging.getLogger(__name__)


class KafkaClient:
    """Kafka client for producing and consuming messages."""
    
    def __init__(self):
        """Initialize Kafka client."""
        self.bootstrap_servers = getattr(settings, 'KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
        self.client_id = getattr(settings, 'KAFKA_CLIENT_ID', 'atonixcorp-django')
        self.group_id = getattr(settings, 'KAFKA_CONSUMER_GROUP_ID', 'atonixcorp-consumers')
        
        self._producer = None
        self._admin_client = None
        self._consumers = {}
        
        # Configuration
        self.producer_config = {
            'bootstrap_servers': self.bootstrap_servers,
            'client_id': f'{self.client_id}-producer',
            'value_serializer': lambda v: json.dumps(v).encode('utf-8'),
            'key_serializer': lambda k: str(k).encode('utf-8') if k else None,
            'acks': 'all',
            'retries': 3,
            'batch_size': 16384,
            'linger_ms': 10,
            'buffer_memory': 33554432
        }
        
        self.consumer_config = {
            'bootstrap_servers': self.bootstrap_servers,
            'group_id': self.group_id,
            'client_id': f'{self.client_id}-consumer',
            'value_deserializer': lambda m: json.loads(m.decode('utf-8')) if m else None,
            'key_deserializer': lambda m: m.decode('utf-8') if m else None,
            'auto_offset_reset': 'latest',
            'enable_auto_commit': True,
            'auto_commit_interval_ms': 1000
        }
        
        self.admin_config = {
            'bootstrap_servers': self.bootstrap_servers,
            'client_id': f'{self.client_id}-admin'
        }
    
    @property
    def producer(self):
        """Get or create Kafka producer."""
        if not KafkaProducer:
            raise ImportError("kafka-python not installed")
        
        if not self._producer:
            self._producer = KafkaProducer(**self.producer_config)
        return self._producer
    
    @property
    def admin_client(self):
        """Get or create Kafka admin client."""
        if not KafkaAdminClient:
            raise ImportError("kafka-python not installed")
        
        if not self._admin_client:
            self._admin_client = KafkaAdminClient(**self.admin_config)
        return self._admin_client
    
    def send_message(self, topic: str, message: Dict[str, Any], key: Optional[str] = None, 
                    partition: Optional[int] = None, headers: Optional[Dict] = None) -> bool:
        """Send a message to Kafka topic."""
        try:
            # Add metadata to message
            enriched_message = {
                'data': message,
                'metadata': {
                    'timestamp': datetime.utcnow().isoformat(),
                    'source': 'atonixcorp-backend',
                    'version': '1.0'
                }
            }
            
            if headers:
                enriched_message['metadata']['headers'] = headers
            
            future = self.producer.send(
                topic=topic,
                value=enriched_message,
                key=key,
                partition=partition
            )
            
            # Wait for message to be sent
            record_metadata = future.get(timeout=10)
            
            logger.info(f"Message sent to topic {topic}, partition {record_metadata.partition}, offset {record_metadata.offset}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send message to topic {topic}: {e}")
            return False
    
    def send_event(self, event_type: str, data: Dict[str, Any], key: Optional[str] = None) -> bool:
        """Send an event message with standardized format."""
        event_message = {
            'event_type': event_type,
            'data': data,
            'timestamp': datetime.utcnow().isoformat(),
            'source': 'atonixcorp-backend'
        }
        
        topic = f"events.{event_type.replace('_', '.')}"
        return self.send_message(topic, event_message, key)
    
    def create_consumer(self, topics: List[str], group_id: Optional[str] = None) -> 'KafkaConsumer':
        """Create a Kafka consumer for specified topics."""
        if not KafkaConsumer:
            raise ImportError("kafka-python not installed")
        
        config = self.consumer_config.copy()
        if group_id:
            config['group_id'] = group_id
        
        consumer = KafkaConsumer(*topics, **config)
        return consumer
    
    def consume_messages(self, topics: List[str], callback: Callable[[str, Dict], None], 
                        group_id: Optional[str] = None, max_messages: Optional[int] = None):
        """Consume messages from topics and call callback for each message."""
        consumer = self.create_consumer(topics, group_id)
        
        try:
            message_count = 0
            for message in consumer:
                try:
                    topic = message.topic
                    value = message.value
                    key = message.key
                    
                    # Extract original data if it has our metadata wrapper
                    if isinstance(value, dict) and 'data' in value and 'metadata' in value:
                        data = value['data']
                        metadata = value['metadata']
                        logger.debug(f"Received message with metadata from {metadata.get('source')}")
                    else:
                        data = value
                    
                    # Call the callback function
                    callback(topic, data)
                    
                    message_count += 1
                    if max_messages and message_count >= max_messages:
                        break
                        
                except Exception as e:
                    logger.error(f"Error processing message from topic {message.topic}: {e}")
                    continue
                    
        except KeyboardInterrupt:
            logger.info("Consumer interrupted by user")
        except Exception as e:
            logger.error(f"Consumer error: {e}")
        finally:
            consumer.close()
    
    def create_topic(self, topic_name: str, num_partitions: int = 3, 
                    replication_factor: int = 1) -> bool:
        """Create a new Kafka topic."""
        try:
            topic = NewTopic(
                name=topic_name,
                num_partitions=num_partitions,
                replication_factor=replication_factor
            )
            
            result = self.admin_client.create_topics([topic])
            
            # Wait for the result
            for topic, future in result.items():
                try:
                    future.result()  # The result itself is None
                    logger.info(f"Topic {topic} created successfully")
                    return True
                except TopicAlreadyExistsError:
                    logger.info(f"Topic {topic} already exists")
                    return True
                except Exception as e:
                    logger.error(f"Failed to create topic {topic}: {e}")
                    return False
                    
        except Exception as e:
            logger.error(f"Failed to create topic {topic_name}: {e}")
            return False
    
    def list_topics(self) -> List[str]:
        """List all available topics."""
        try:
            metadata = self.admin_client.list_consumer_groups()
            consumer = self.create_consumer([])
            topics = list(consumer.topics())
            consumer.close()
            return topics
        except Exception as e:
            logger.error(f"Failed to list topics: {e}")
            return []
    
    def delete_topic(self, topic_name: str) -> bool:
        """Delete a Kafka topic."""
        try:
            result = self.admin_client.delete_topics([topic_name])
            
            for topic, future in result.items():
                try:
                    future.result()
                    logger.info(f"Topic {topic} deleted successfully")
                    return True
                except Exception as e:
                    logger.error(f"Failed to delete topic {topic}: {e}")
                    return False
                    
        except Exception as e:
            logger.error(f"Failed to delete topic {topic_name}: {e}")
            return False
    
    def get_topic_info(self, topic_name: str) -> Optional[Dict[str, Any]]:
        """Get information about a topic."""
        try:
            consumer = self.create_consumer([])
            metadata = consumer.partitions_for_topic(topic_name)
            
            if metadata is None:
                return None
            
            partitions = list(metadata)
            
            # Get partition info
            partition_info = []
            for partition in partitions:
                low_offset, high_offset = consumer.get_watermark_offsets(
                    consumer.TopicPartition(topic_name, partition)
                )
                partition_info.append({
                    'partition': partition,
                    'low_offset': low_offset,
                    'high_offset': high_offset,
                    'message_count': high_offset - low_offset
                })
            
            consumer.close()
            
            return {
                'topic': topic_name,
                'partition_count': len(partitions),
                'partitions': partition_info,
                'total_messages': sum(p['message_count'] for p in partition_info)
            }
            
        except Exception as e:
            logger.error(f"Failed to get topic info for {topic_name}: {e}")
            return None
    
    def close(self):
        """Close all Kafka connections."""
        if self._producer:
            self._producer.close()
            self._producer = None
        
        if self._admin_client:
            self._admin_client.close()
            self._admin_client = None
        
        for consumer in self._consumers.values():
            consumer.close()
        self._consumers.clear()


class EventProducer:
    """High-level event producer for common application events."""
    
    def __init__(self, kafka_client: Optional[KafkaClient] = None):
        self.kafka_client = kafka_client or get_kafka_client()
    
    def user_event(self, event_type: str, user_id: int, data: Dict[str, Any]) -> bool:
        """Send user-related event."""
        return self.kafka_client.send_event(
            f"user.{event_type}",
            {
                'user_id': user_id,
                **data
            },
            key=str(user_id)
        )
    
    def project_event(self, event_type: str, project_id: int, user_id: int, data: Dict[str, Any]) -> bool:
        """Send project-related event."""
        return self.kafka_client.send_event(
            f"project.{event_type}",
            {
                'project_id': project_id,
                'user_id': user_id,
                **data
            },
            key=str(project_id)
        )
    
    def team_event(self, event_type: str, team_id: int, user_id: int, data: Dict[str, Any]) -> bool:
        """Send team-related event."""
        return self.kafka_client.send_event(
            f"team.{event_type}",
            {
                'team_id': team_id,
                'user_id': user_id,
                **data
            },
            key=str(team_id)
        )
    
    def system_event(self, event_type: str, data: Dict[str, Any]) -> bool:
        """Send system-related event."""
        return self.kafka_client.send_event(
            f"system.{event_type}",
            data
        )


class EventConsumer:
    """High-level event consumer with handlers."""
    
    def __init__(self, kafka_client: Optional[KafkaClient] = None):
        self.kafka_client = kafka_client or get_kafka_client()
        self.handlers = {}
        self.running = False
        self.consumer_thread = None
    
    def register_handler(self, event_pattern: str, handler: Callable[[str, Dict], None]):
        """Register a handler for events matching pattern."""
        self.handlers[event_pattern] = handler
    
    def start_consuming(self, topics: List[str]):
        """Start consuming events in a separate thread."""
        if self.running:
            logger.warning("Consumer already running")
            return
        
        self.running = True
        self.consumer_thread = Thread(
            target=self._consume_loop,
            args=(topics,),
            daemon=True
        )
        self.consumer_thread.start()
    
    def stop_consuming(self):
        """Stop consuming events."""
        self.running = False
        if self.consumer_thread:
            self.consumer_thread.join(timeout=5)
    
    def _consume_loop(self, topics: List[str]):
        """Main consumer loop."""
        def message_handler(topic: str, data: Dict[str, Any]):
            event_type = data.get('event_type', '')
            
            # Find matching handlers
            for pattern, handler in self.handlers.items():
                if pattern in event_type or pattern == '*':
                    try:
                        handler(event_type, data)
                    except Exception as e:
                        logger.error(f"Handler error for {event_type}: {e}")
        
        try:
            self.kafka_client.consume_messages(topics, message_handler)
        except Exception as e:
            logger.error(f"Consumer loop error: {e}")
        finally:
            self.running = False


# Global Kafka client instance
_kafka_client = None


def get_kafka_client() -> KafkaClient:
    """Get or create global Kafka client instance."""
    global _kafka_client
    if _kafka_client is None:
        _kafka_client = KafkaClient()
    return _kafka_client


def close_kafka_client():
    """Close the global Kafka client."""
    global _kafka_client
    if _kafka_client is not None:
        _kafka_client.close()
        _kafka_client = None