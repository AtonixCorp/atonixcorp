"""
Zookeeper client for distributed configuration and service discovery.
"""
import json
import logging
from typing import Dict, List, Optional, Any, Callable
from kazoo.client import KazooClient
from kazoo.exceptions import NodeExistsError, NoNodeError
from kazoo.protocol.states import EventType
from django.conf import settings

logger = logging.getLogger(__name__)


class ZookeeperClient:
    """Zookeeper client for configuration management and service discovery."""
    
    def __init__(self):
        """Initialize Zookeeper client."""
        self.hosts = getattr(settings, 'ZOOKEEPER_HOSTS', 'localhost:2181')
        self.client = KazooClient(hosts=self.hosts, timeout=30)
        self.connected = False
        
    def connect(self):
        """Connect to Zookeeper ensemble."""
        try:
            self.client.start(timeout=30)
            self.connected = True
            logger.info(f"Connected to Zookeeper at {self.hosts}")
        except Exception as e:
            logger.error(f"Failed to connect to Zookeeper: {e}")
            self.connected = False
            raise
    
    def disconnect(self):
        """Disconnect from Zookeeper."""
        if self.connected:
            self.client.stop()
            self.connected = False
            logger.info("Disconnected from Zookeeper")
    
    def ensure_path(self, path: str, makepath: bool = True):
        """Ensure a path exists in Zookeeper."""
        if not self.connected:
            self.connect()
        
        try:
            self.client.ensure_path(path, makepath=makepath)
            logger.debug(f"Ensured path exists: {path}")
        except Exception as e:
            logger.error(f"Failed to ensure path {path}: {e}")
            raise
    
    def set_config(self, path: str, data: Dict[str, Any], ephemeral: bool = False):
        """Set configuration data in Zookeeper."""
        if not self.connected:
            self.connect()
        
        try:
            json_data = json.dumps(data, indent=2)
            
            if self.client.exists(path):
                self.client.set(path, json_data.encode('utf-8'))
                logger.info(f"Updated config at {path}")
            else:
                self.client.create(
                    path, 
                    json_data.encode('utf-8'), 
                    ephemeral=ephemeral, 
                    makepath=True
                )
                logger.info(f"Created config at {path}")
        except Exception as e:
            logger.error(f"Failed to set config at {path}: {e}")
            raise
    
    def get_config(self, path: str, default: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        """Get configuration data from Zookeeper."""
        if not self.connected:
            self.connect()
        
        try:
            if self.client.exists(path):
                data, stat = self.client.get(path)
                config = json.loads(data.decode('utf-8'))
                logger.debug(f"Retrieved config from {path}")
                return config
            else:
                logger.warning(f"Config path {path} does not exist")
                return default
        except Exception as e:
            logger.error(f"Failed to get config from {path}: {e}")
            return default
    
    def watch_config(self, path: str, callback: Callable[[Dict[str, Any]], None]):
        """Watch configuration changes in Zookeeper."""
        if not self.connected:
            self.connect()
        
        def watcher(event):
            if event.type == EventType.CHANGED:
                config = self.get_config(path)
                if config:
                    callback(config)
        
        try:
            self.client.get(path, watch=watcher)
            logger.info(f"Started watching config at {path}")
        except NoNodeError:
            logger.warning(f"Cannot watch non-existent path: {path}")
        except Exception as e:
            logger.error(f"Failed to watch config at {path}: {e}")
            raise
    
    def register_service(self, service_name: str, host: str, port: int, metadata: Optional[Dict] = None):
        """Register a service in Zookeeper for service discovery."""
        if not self.connected:
            self.connect()
        
        service_data = {
            'host': host,
            'port': port,
            'metadata': metadata or {}
        }
        
        service_path = f"/services/{service_name}"
        node_path = f"{service_path}/{host}:{port}"
        
        try:
            self.ensure_path(service_path)
            self.set_config(node_path, service_data, ephemeral=True)
            logger.info(f"Registered service {service_name} at {host}:{port}")
        except Exception as e:
            logger.error(f"Failed to register service {service_name}: {e}")
            raise
    
    def discover_services(self, service_name: str) -> List[Dict[str, Any]]:
        """Discover services registered in Zookeeper."""
        if not self.connected:
            self.connect()
        
        service_path = f"/services/{service_name}"
        services = []
        
        try:
            if self.client.exists(service_path):
                children = self.client.get_children(service_path)
                for child in children:
                    node_path = f"{service_path}/{child}"
                    service_data = self.get_config(node_path)
                    if service_data:
                        services.append(service_data)
                
                logger.debug(f"Discovered {len(services)} instances of {service_name}")
            else:
                logger.warning(f"Service {service_name} not found")
        
        except Exception as e:
            logger.error(f"Failed to discover services for {service_name}: {e}")
        
        return services
    
    def acquire_lock(self, lock_path: str, timeout: int = 30) -> bool:
        """Acquire a distributed lock."""
        if not self.connected:
            self.connect()
        
        try:
            from kazoo.recipe.lock import Lock
            lock = Lock(self.client, lock_path)
            acquired = lock.acquire(timeout=timeout)
            
            if acquired:
                logger.info(f"Acquired lock: {lock_path}")
            else:
                logger.warning(f"Failed to acquire lock: {lock_path}")
            
            return acquired
        except Exception as e:
            logger.error(f"Error acquiring lock {lock_path}: {e}")
            return False
    
    def release_lock(self, lock_path: str):
        """Release a distributed lock."""
        if not self.connected:
            self.connect()
        
        try:
            from kazoo.recipe.lock import Lock
            lock = Lock(self.client, lock_path)
            lock.release()
            logger.info(f"Released lock: {lock_path}")
        except Exception as e:
            logger.error(f"Error releasing lock {lock_path}: {e}")
    
    def get_children(self, path: str) -> List[str]:
        """Get children of a Zookeeper node."""
        if not self.connected:
            self.connect()
        
        try:
            if self.client.exists(path):
                children = self.client.get_children(path)
                logger.debug(f"Found {len(children)} children for {path}")
                return children
            else:
                logger.warning(f"Path {path} does not exist")
                return []
        except Exception as e:
            logger.error(f"Failed to get children for {path}: {e}")
            return []
    
    def delete_node(self, path: str, recursive: bool = False):
        """Delete a node from Zookeeper."""
        if not self.connected:
            self.connect()
        
        try:
            if recursive:
                self.client.delete(path, recursive=True)
            else:
                self.client.delete(path)
            logger.info(f"Deleted node: {path}")
        except NoNodeError:
            logger.warning(f"Node {path} does not exist")
        except Exception as e:
            logger.error(f"Failed to delete node {path}: {e}")
            raise


# Global Zookeeper client instance
_zk_client = None


def get_zk_client() -> ZookeeperClient:
    """Get or create global Zookeeper client instance."""
    global _zk_client
    if _zk_client is None:
        _zk_client = ZookeeperClient()
    return _zk_client


def close_zk_client():
    """Close the global Zookeeper client."""
    global _zk_client
    if _zk_client is not None:
        _zk_client.disconnect()
        _zk_client = None