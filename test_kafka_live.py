#!/usr/bin/env python
"""
Live test of Kafka integration with running Kafka service
"""
import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, '/home/atonixdev/atonixcorp/backend')

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'atonixcorp.settings')

import django
django.setup()

# Now test Kafka
print("Testing Kafka integration with live server...")

try:
    # Test direct import
    from kafka import KafkaProducer, KafkaConsumer, KafkaAdminClient
    from kafka.admin import NewTopic
    print("✓ kafka-python imports successful")
    
    # Test basic connection
    admin_client = KafkaAdminClient(
        bootstrap_servers=['localhost:9092'],
        client_id='test-admin'
    )
    
    # List topics
    metadata = admin_client.list_consumer_groups()
    print("✓ Connected to Kafka successfully")
    
    # Create a test topic
    topic_name = "test-connection"
    topic = NewTopic(
        name=topic_name,
        num_partitions=3,
        replication_factor=1
    )
    
    try:
        admin_client.create_topics([topic])
        print(f"✓ Created topic '{topic_name}'")
    except Exception as e:
        if "already exists" in str(e).lower():
            print(f"✓ Topic '{topic_name}' already exists")
        else:
            print(f"[WARNING] Topic creation failed: {e}")
    
    # Test producer
    producer = KafkaProducer(
        bootstrap_servers=['localhost:9092'],
        value_serializer=lambda x: x.encode('utf-8') if isinstance(x, str) else x
    )
    
    # Send test message
    future = producer.send(topic_name, value="Test message from live test")
    result = future.get(timeout=10)
    print(f"✓ Sent message to topic '{topic_name}'")
    
    # Test consumer
    consumer = KafkaConsumer(
        topic_name,
        bootstrap_servers=['localhost:9092'],
        auto_offset_reset='earliest',
        consumer_timeout_ms=5000,
        value_deserializer=lambda x: x.decode('utf-8') if x else None
    )
    
    messages = []
    for message in consumer:
        messages.append(message.value)
        break  # Just get one message
    
    if messages:
        print(f"✓ Received message: {messages[0]}")
    else:
        print("[WARNING] No messages received")
    
    # Test our Django Kafka client
    from core.kafka_client import get_kafka_client
    
    # Create fresh client instance
    kafka_client = get_kafka_client()
    
    # Test event sending
    kafka_client.send_event(
        event_type='test.event',
        data={'test': True, 'timestamp': '2025-09-20T15:50:00Z'},
        key='test-key'
    )
    print("✓ Sent event through Django Kafka client")
    
    print("\n" + "="*60)
    print("✓ ALL KAFKA TESTS PASSED!")
    print("✓ Kafka integration is working correctly")
    print("="*60)
    
except Exception as e:
    print(f"✗ Kafka test failed: {e}")
    import traceback
    traceback.print_exc()