# Zookeeper Integration Example for Django
# This file shows how to integrate Apache Zookeeper with your Django backend
# for distributed coordination, configuration management, and service discovery

import os
import json
import logging
from typing import Dict, Any, Optional, List, Callable
try:
    from django.utils import timezone
    from kazoo.client import KazooClient
    from kazoo.exceptions import NodeExistsError, NoNodeError
    from django.conf import settings
    from django.core.cache import cache
except Exception:
    # Fallbacks so module can be imported in test environments without kazoo or django
    KazooClient = None
    class NodeExistsError(Exception):
        pass
    class NoNodeError(Exception):
        pass

    class _DummySettings:
        ENVIRONMENT = os.getenv('ENVIRONMENT', 'dev')

    settings = _DummySettings()

    class _SimpleCache(dict):
        def set(self, key, value, timeout=None):
            self[key] = value
        def get(self, key, default=None):
            return dict.get(self, key, default)

    cache = _SimpleCache()

    class timezone:
        @staticmethod
        def now():
            import datetime
            return datetime.datetime.utcnow()

logger = logging.getLogger(__name__)

class ZookeeperManager:
    """
    Zookeeper integration manager for Django applications.
    
    Use cases:
    - Distributed configuration management
    - Service discovery
    - Leader election
    - Distributed locks
    - Event coordination
    """
    
    def __init__(self):
        self.zk_hosts = os.getenv('ZOOKEEPER_HOSTS', 'localhost:2181')
        env = getattr(settings, 'ENVIRONMENT', os.getenv('ENVIRONMENT', 'dev'))
        self.app_namespace = f"/atonixcorp/{env}"
        self.client = None
        self._connected = False
    
    def connect(self) -> bool:
        """Connect to Zookeeper ensemble."""
        try:
            self.client = KazooClient(
                hosts=self.zk_hosts,
                timeout=10.0,
                connection_retry={'max_tries': 3, 'delay': 1, 'backoff': 2}
            )
            self.client.start(timeout=10)
            self._connected = True
            
            # Ensure our application namespace exists
            self._ensure_namespace()
            
            logger.info(f"Connected to Zookeeper at {self.zk_hosts}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect to Zookeeper: {e}")
            self._connected = False
            return False
    
    def disconnect(self):
        """Disconnect from Zookeeper."""
        if self.client and self._connected:
            self.client.stop()
            self.client.close()
            self._connected = False
            logger.info("Disconnected from Zookeeper")
    
    def is_connected(self) -> bool:
        """Check if connected to Zookeeper."""
        return self._connected and self.client and self.client.connected
    
    def _ensure_namespace(self):
        """Ensure application namespace exists."""
        try:
            self.client.ensure_path(self.app_namespace)
            self.client.ensure_path(f"{self.app_namespace}/config")
            self.client.ensure_path(f"{self.app_namespace}/services")
            self.client.ensure_path(f"{self.app_namespace}/locks")
            self.client.ensure_path(f"{self.app_namespace}/leader")
        except Exception as e:
            logger.error(f"Failed to create namespace {self.app_namespace}: {e}")
    
    # Configuration Management
    def set_config(self, key: str, value: Any) -> bool:
        """Set a configuration value in Zookeeper."""
        if not self.is_connected():
            return False
        
        try:
            path = f"{self.app_namespace}/config/{key}"
            data = json.dumps(value).encode('utf-8')
            
            if self.client.exists(path):
                self.client.set(path, data)
            else:
                self.client.create(path, data, makepath=True)
            
            # Update local cache
            cache.set(f"zk_config_{key}", value, timeout=300)
            logger.info(f"Set config {key} in Zookeeper")
            return True
            
        except Exception as e:
            logger.error(f"Failed to set config {key}: {e}")
            return False
    
    def get_config(self, key: str, default: Any = None) -> Any:
        """Get a configuration value from Zookeeper."""
        # Try local cache first
        cached_value = cache.get(f"zk_config_{key}")
        if cached_value is not None:
            return cached_value
        
        if not self.is_connected():
            return default
        
        try:
            path = f"{self.app_namespace}/config/{key}"
            data, stat = self.client.get(path)
            value = json.loads(data.decode('utf-8'))
            
            # Cache the value
            cache.set(f"zk_config_{key}", value, timeout=300)
            return value
            
        except (NoNodeError, json.JSONDecodeError) as e:
            logger.warning(f"Config {key} not found or invalid: {e}")
            return default
        except Exception as e:
            logger.error(f"Failed to get config {key}: {e}")
            return default
    
    def watch_config(self, key: str, callback):
        """Watch for changes to a configuration value."""
        if not self.is_connected():
            return False
        
        try:
            path = f"{self.app_namespace}/config/{key}"
            def watch_func(data, stat, event):
                if data:
                    try:
                        value = json.loads(data.decode('utf-8'))
                        cache.set(f"zk_config_{key}", value, timeout=300)
                        callback(key, value)
                    except json.JSONDecodeError:
                        logger.error(f"Invalid JSON in config {key}")

            # Register DataWatch with kazoo
            # client.DataWatch(path, func) will register the function immediately
            self.client.DataWatch(path, watch_func)
            return True
            
        except Exception as e:
            logger.error(f"Failed to watch config {key}: {e}")
            return False
    
    # Service Discovery
    def register_service(self, service_name: str, host: str, port: int, metadata: Dict = None) -> bool:
        """Register a service for discovery."""
        if not self.is_connected():
            return False
        
        try:
            service_data = {
                'host': host,
                'port': port,
                'metadata': metadata or {},
                'registered_at': timezone.now().isoformat()
            }
            
            path = f"{self.app_namespace}/services/{service_name}"
            data = json.dumps(service_data).encode('utf-8')
            
            # Create ephemeral sequential node
            self.client.create(
                f"{path}/instance-",
                data,
                ephemeral=True,
                sequence=True,
                makepath=True
            )
            
            logger.info(f"Registered service {service_name} at {host}:{port}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to register service {service_name}: {e}")
            return False
    
    def discover_services(self, service_name: str) -> List[Dict]:
        """Discover all instances of a service."""
        if not self.is_connected():
            return []
        
        try:
            path = f"{self.app_namespace}/services/{service_name}"
            instances = self.client.get_children(path)
            
            services = []
            for instance in instances:
                try:
                    data, stat = self.client.get(f"{path}/{instance}")
                    service_info = json.loads(data.decode('utf-8'))
                    services.append(service_info)
                except Exception as e:
                    logger.warning(f"Failed to get service instance {instance}: {e}")
            
            return services
            
        except NoNodeError:
            return []
        except Exception as e:
            logger.error(f"Failed to discover service {service_name}: {e}")
            return []
    
    # Distributed Locking
    def acquire_lock(self, lock_name: str, timeout: int = 30) -> Optional[object]:
        """Acquire a distributed lock."""
        if not self.is_connected():
            return None
        
        try:
            from kazoo.recipe.lock import Lock
            lock_path = f"{self.app_namespace}/locks/{lock_name}"
            lock = Lock(self.client, lock_path)
            
            if lock.acquire(timeout=timeout):
                logger.info(f"Acquired lock {lock_name}")
                return lock
            else:
                logger.warning(f"Failed to acquire lock {lock_name} within {timeout}s")
                return None
                
        except Exception as e:
            logger.error(f"Failed to acquire lock {lock_name}: {e}")
            return None
    
    def release_lock(self, lock):
        """Release a distributed lock."""
        try:
            if lock:
                lock.release()
                logger.info("Released distributed lock")
        except Exception as e:
            logger.error(f"Failed to release lock: {e}")
    
    # Leader Election
    def elect_leader(self, election_name: str, callback=None) -> Optional[object]:
        """Participate in leader election."""
        if not self.is_connected():
            return None
        
        try:
            from kazoo.recipe.election import Election
            election_path = f"{self.app_namespace}/leader/{election_name}"
            election = Election(self.client, election_path)
            
            def on_leadership_change():
                if callback:
                    callback(election.is_leader)
            
            election.run(on_leadership_change)
            return election
            
        except Exception as e:
            logger.error(f"Failed to participate in election {election_name}: {e}")
            return None


# Global Zookeeper manager instance
zk_manager = ZookeeperManager()

# Django integration
class ZookeeperMiddleware:
    """Django middleware for Zookeeper integration."""
    
    def __init__(self, get_response):
        self.get_response = get_response
        # Connect to Zookeeper on startup
        if not zk_manager.is_connected():
            zk_manager.connect()
    
    def __call__(self, request):
        # Add Zookeeper manager to request
        request.zk = zk_manager
        response = self.get_response(request)
        return response

# Configuration management using Zookeeper
class ZookeeperConfig:
    """
    Django configuration backed by Zookeeper.
    
    Usage:
        # In settings.py
        zk_config = ZookeeperConfig()
        
        # Get configuration with fallback
        DEBUG = zk_config.get('debug', default=False)
        DATABASE_URL = zk_config.get('database_url', default=os.getenv('DATABASE_URL'))
    """
    
    def __init__(self):
        self.zk = zk_manager
        if not self.zk.is_connected():
            self.zk.connect()
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get configuration value."""
        return self.zk.get_config(key, default)
    
    def set(self, key: str, value: Any) -> bool:
        """Set configuration value."""
        return self.zk.set_config(key, value)
    
    def watch(self, key: str, callback):
        """Watch for configuration changes."""
        return self.zk.watch_config(key, callback)

# Management command example
"""
# management/commands/zk_config.py
from django.core.management.base import BaseCommand
from myapp.zookeeper_integration import zk_manager

class Command(BaseCommand):
    help = 'Manage Zookeeper configuration'
    
    def add_arguments(self, parser):
        parser.add_argument('action', choices=['get', 'set', 'list'])
        parser.add_argument('--key', type=str)
        parser.add_argument('--value', type=str)
    
    def handle(self, *args, **options):
        if not zk_manager.is_connected():
            zk_manager.connect()
        
        if options['action'] == 'get':
            value = zk_manager.get_config(options['key'])
            self.stdout.write(f"{options['key']}: {value}")
        
        elif options['action'] == 'set':
            success = zk_manager.set_config(options['key'], options['value'])
            if success:
                self.stdout.write(f"Set {options['key']} = {options['value']}")
            else:
                self.stderr.write(f"Failed to set {options['key']}")
"""

# Example usage in views
"""
from django.http import JsonResponse
from django.views import View
from .zookeeper_integration import zk_manager

class ConfigView(View):
    def get(self, request):
        # Get configuration from Zookeeper
        feature_flags = zk_manager.get_config('feature_flags', {})
        return JsonResponse(feature_flags)
    
    def post(self, request):
        # Update configuration in Zookeeper
        key = request.POST.get('key')
        value = request.POST.get('value')
        
        if zk_manager.set_config(key, value):
            return JsonResponse({'status': 'success'})
        else:
            return JsonResponse({'status': 'error'}, status=500)

class ServiceDiscoveryView(View):
    def get(self, request):
        service_name = request.GET.get('service', 'backend')
        services = zk_manager.discover_services(service_name)
        return JsonResponse({'services': services})
"""

# Celery integration example
"""
from celery import Task
from .zookeeper_integration import zk_manager

class ZookeeperTask(Task):
    '''Base task class with Zookeeper support.'''
    
    def __call__(self, *args, **kwargs):
        # Ensure Zookeeper connection
        if not zk_manager.is_connected():
            zk_manager.connect()
        
        # Get task configuration from Zookeeper
        task_config = zk_manager.get_config(f'tasks.{self.name}', {})
        
        # Apply configuration
        if 'rate_limit' in task_config:
            self.rate_limit = task_config['rate_limit']
        
        return super().__call__(*args, **kwargs)

@app.task(base=ZookeeperTask)
def distributed_task():
    '''Example task that uses distributed coordination.'''
    
    # Acquire distributed lock
    lock = zk_manager.acquire_lock('task_lock', timeout=30)
    if not lock:
        return {'status': 'skipped', 'reason': 'could not acquire lock'}
    
    try:
        # Do work that requires coordination
        result = perform_critical_work()
        return {'status': 'success', 'result': result}
    
    finally:
        # Always release the lock
        zk_manager.release_lock(lock)
"""