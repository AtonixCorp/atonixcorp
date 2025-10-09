"""
Django management command for Kafka operations.
"""
import json
import threading
import time
from django.core.management.base import BaseCommand, CommandError
from core.kafka_client import get_kafka_client, EventProducer, EventConsumer


class Command(BaseCommand):
    help = 'Manage Kafka operations'

    def add_arguments(self, parser):
        subparsers = parser.add_subparsers(dest='action', help='Kafka actions')
        
        # Status command
        status_parser = subparsers.add_parser('status', help='Check Kafka connection status')
        
        # Topic commands
        topic_parser = subparsers.add_parser('topic', help='Manage topics')
        topic_subparsers = topic_parser.add_subparsers(dest='topic_action')
        
        # Topic create
        create_parser = topic_subparsers.add_parser('create', help='Create topic')
        create_parser.add_argument('name', help='Topic name')
        create_parser.add_argument('--partitions', type=int, default=3, help='Number of partitions')
        create_parser.add_argument('--replication-factor', type=int, default=1, help='Replication factor')
        
        # Topic list
        topic_subparsers.add_parser('list', help='List topics')
        
        # Topic info
        info_parser = topic_subparsers.add_parser('info', help='Get topic information')
        info_parser.add_argument('name', help='Topic name')
        
        # Topic delete
        delete_parser = topic_subparsers.add_parser('delete', help='Delete topic')
        delete_parser.add_argument('name', help='Topic name')
        delete_parser.add_argument('--confirm', action='store_true', help='Confirm deletion')
        
        # Produce commands
        produce_parser = subparsers.add_parser('produce', help='Produce messages')
        produce_parser.add_argument('topic', help='Topic name')
        produce_parser.add_argument('message', help='Message to send (JSON format)')
        produce_parser.add_argument('--key', help='Message key')
        produce_parser.add_argument('--partition', type=int, help='Specific partition')
        
        # Event commands
        event_parser = subparsers.add_parser('event', help='Send events')
        event_parser.add_argument('event_type', help='Event type (e.g., user.created)')
        event_parser.add_argument('data', help='Event data (JSON format)')
        event_parser.add_argument('--key', help='Event key')
        
        # Consume commands
        consume_parser = subparsers.add_parser('consume', help='Consume messages')
        consume_parser.add_argument('topics', nargs='+', help='Topic names')
        consume_parser.add_argument('--group-id', help='Consumer group ID')
        consume_parser.add_argument('--max-messages', type=int, help='Maximum messages to consume')
        consume_parser.add_argument('--timeout', type=int, default=30, help='Consumer timeout in seconds')

    def handle(self, *args, **options):
        action = options.get('action')
        
        if not action:
            self.print_help('manage.py', 'kafka')
            return
        
        try:
            # Import here to avoid issues if Kafka libraries aren't installed
            kafka_client = get_kafka_client()
        except ImportError:
            raise CommandError(
                "Kafka integration not available. "
                "Install kafka packages: pip install kafka-python confluent-kafka"
            )
        except Exception as e:
            raise CommandError(f"Failed to initialize Kafka client: {e}")

        try:
            if action == 'status':
                self.handle_status(kafka_client)
            elif action == 'topic':
                self.handle_topic(kafka_client, options)
            elif action == 'produce':
                self.handle_produce(kafka_client, options)
            elif action == 'event':
                self.handle_event(kafka_client, options)
            elif action == 'consume':
                self.handle_consume(kafka_client, options)
            else:
                raise CommandError(f"Unknown action: {action}")
        except Exception as e:
            raise CommandError(f"Command failed: {e}")

    def handle_status(self, kafka_client):
        """Check Kafka connection status."""
        try:
            topics = kafka_client.list_topics()
            self.stdout.write(
                self.style.SUCCESS(f"✓ Connected to Kafka at {kafka_client.bootstrap_servers}")
            )
            self.stdout.write(f"✓ Found {len(topics)} topics")
            
            # Test produce/consume
            test_topic = "test-connection"
            if kafka_client.create_topic(test_topic, num_partitions=1):
                test_message = {"test": "connection", "timestamp": time.time()}
                if kafka_client.send_message(test_topic, test_message):
                    self.stdout.write(self.style.SUCCESS("✓ Producer working"))
                else:
                    self.stdout.write(self.style.WARNING("⚠ Producer test failed"))
            else:
                self.stdout.write(self.style.WARNING("⚠ Topic creation test failed"))
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"✗ Failed to connect to Kafka: {e}")
            )

    def handle_topic(self, kafka_client, options):
        """Handle topic commands."""
        topic_action = options.get('topic_action')
        
        if topic_action == 'create':
            name = options['name']
            partitions = options['partitions']
            replication_factor = options['replication_factor']
            
            if kafka_client.create_topic(name, partitions, replication_factor):
                self.stdout.write(
                    self.style.SUCCESS(f"Topic '{name}' created with {partitions} partitions")
                )
            else:
                self.stdout.write(
                    self.style.ERROR(f"Failed to create topic '{name}'")
                )
        
        elif topic_action == 'list':
            topics = kafka_client.list_topics()
            
            if topics:
                self.stdout.write("Available topics:")
                for topic in sorted(topics):
                    # Skip internal topics
                    if not topic.startswith('_'):
                        info = kafka_client.get_topic_info(topic)
                        if info:
                            msg_count = info.get('total_messages', 0)
                            partition_count = info.get('partition_count', 0)
                            self.stdout.write(f"  {topic} ({partition_count} partitions, {msg_count} messages)")
                        else:
                            self.stdout.write(f"  {topic}")
            else:
                self.stdout.write("No topics found")
        
        elif topic_action == 'info':
            name = options['name']
            info = kafka_client.get_topic_info(name)
            
            if info:
                self.stdout.write(f"Topic: {info['topic']}")
                self.stdout.write(f"Partitions: {info['partition_count']}")
                self.stdout.write(f"Total messages: {info['total_messages']}")
                self.stdout.write("\nPartition details:")
                for partition in info['partitions']:
                    self.stdout.write(
                        f"  Partition {partition['partition']}: "
                        f"{partition['message_count']} messages "
                        f"(offset {partition['low_offset']}-{partition['high_offset']})"
                    )
            else:
                self.stdout.write(f"Topic '{name}' not found or inaccessible")
        
        elif topic_action == 'delete':
            name = options['name']
            confirm = options['confirm']
            
            if not confirm:
                self.stdout.write(
                    self.style.WARNING(f"Add --confirm to delete topic '{name}'")
                )
                return
            
            if kafka_client.delete_topic(name):
                self.stdout.write(
                    self.style.SUCCESS(f"Topic '{name}' deleted")
                )
            else:
                self.stdout.write(
                    self.style.ERROR(f"Failed to delete topic '{name}'")
                )

    def handle_produce(self, kafka_client, options):
        """Handle produce commands."""
        topic = options['topic']
        message_str = options['message']
        key = options.get('key')
        partition = options.get('partition')
        
        try:
            message = json.loads(message_str)
        except json.JSONDecodeError:
            raise CommandError("Message must be valid JSON")
        
        if kafka_client.send_message(topic, message, key, partition):
            self.stdout.write(
                self.style.SUCCESS(f"Message sent to topic '{topic}'")
            )
        else:
            self.stdout.write(
                self.style.ERROR(f"Failed to send message to topic '{topic}'")
            )

    def handle_event(self, kafka_client, options):
        """Handle event commands."""
        event_type = options['event_type']
        data_str = options['data']
        key = options.get('key')
        
        try:
            data = json.loads(data_str)
        except json.JSONDecodeError:
            raise CommandError("Event data must be valid JSON")
        
        event_producer = EventProducer(kafka_client)
        
        if event_producer.kafka_client.send_event(event_type, data, key):
            self.stdout.write(
                self.style.SUCCESS(f"Event '{event_type}' sent")
            )
        else:
            self.stdout.write(
                self.style.ERROR(f"Failed to send event '{event_type}'")
            )

    def handle_consume(self, kafka_client, options):
        """Handle consume commands."""
        topics = options['topics']
        group_id = options.get('group_id')
        max_messages = options.get('max_messages')
        timeout = options['timeout']
        
        self.stdout.write(f"Consuming from topics: {', '.join(topics)}")
        self.stdout.write(f"Group ID: {group_id or kafka_client.group_id}")
        self.stdout.write("Press Ctrl+C to stop...\n")
        
        message_count = 0
        start_time = time.time()
        
        def message_handler(topic, data):
            nonlocal message_count
            message_count += 1
            
            self.stdout.write(f"[{message_count}] Topic: {topic}")
            self.stdout.write(f"Data: {json.dumps(data, indent=2)}")
            self.stdout.write("-" * 50)
        
        try:
            # Set up timeout if specified
            if max_messages:
                kafka_client.consume_messages(topics, message_handler, group_id, max_messages)
            else:
                # Use threading to implement timeout
                consumer_thread = threading.Thread(
                    target=kafka_client.consume_messages,
                    args=(topics, message_handler, group_id),
                    daemon=True
                )
                consumer_thread.start()
                
                # Wait for timeout or user interrupt
                try:
                    consumer_thread.join(timeout=timeout)
                    if consumer_thread.is_alive():
                        self.stdout.write(f"\nTimeout reached ({timeout}s)")
                except KeyboardInterrupt:
                    self.stdout.write("\nConsumer stopped by user")
            
            self.stdout.write(f"\nConsumed {message_count} messages")
            
        except KeyboardInterrupt:
            self.stdout.write("\nConsumer stopped by user")
        except Exception as e:
            self.stdout.write(f"\nConsumer error: {e}")