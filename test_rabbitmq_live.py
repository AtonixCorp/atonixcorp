#!/usr/bin/env python
"""
Live test of RabbitMQ integration with running RabbitMQ service
"""
import sys
import os
import time

# Add the backend directory to Python path
sys.path.insert(0, '/home/atonixdev/atonixcorp/backend')

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'atonixcorp.settings')

import django
django.setup()

# Now test RabbitMQ
print("Testing RabbitMQ integration with live server...")

try:
    # Test direct import
    import pika
    print("✓ pika imports successful")
    
    # Wait for RabbitMQ to be ready
    print("Waiting for RabbitMQ to be ready...")
    time.sleep(15)
    
    # Test basic connection
    connection_params = pika.ConnectionParameters(
        host='localhost',
        port=5672,
        virtual_host='atonixcorp',
        credentials=pika.PlainCredentials('admin', 'rabbitmq_password')
    )
    
    connection = pika.BlockingConnection(connection_params)
    channel = connection.channel()
    print("✓ Connected to RabbitMQ successfully")
    
    # Declare a test queue
    queue_name = 'test_queue'
    channel.queue_declare(queue=queue_name, durable=True)
    print(f"✓ Declared queue '{queue_name}'")
    
    # Send test message
    test_message = "Test message from live RabbitMQ test"
    channel.basic_publish(
        exchange='',
        routing_key=queue_name,
        body=test_message,
        properties=pika.BasicProperties(delivery_mode=2)  # Make message persistent
    )
    print(f"✓ Sent message to queue '{queue_name}'")
    
    # Receive test message
    def callback(ch, method, properties, body):
        print(f"✓ Received message: {body.decode()}")
        ch.basic_ack(delivery_tag=method.delivery_tag)
        ch.stop_consuming()
    
    channel.basic_consume(queue=queue_name, on_message_callback=callback)
    channel.start_consuming()
    
    # Test our Django RabbitMQ client
    from core.rabbitmq_client import get_rabbitmq_client
    
    # Create fresh client instance
    rabbitmq_client = get_rabbitmq_client()
    
    # Test message publishing
    rabbitmq_client.publish_message(
        queue='test_django_queue',
        message={'test': True, 'timestamp': '2025-09-20T15:50:00Z'},
        routing_key='test'
    )
    print("✓ Sent message through Django RabbitMQ client")
    
    connection.close()
    
    print("\n" + "="*60)
    print("✓ ALL RABBITMQ TESTS PASSED!")
    print("✓ RabbitMQ integration is working correctly")
    print("="*60)
    
except Exception as e:
    print(f"✗ RabbitMQ test failed: {e}")
    import traceback
    traceback.print_exc()