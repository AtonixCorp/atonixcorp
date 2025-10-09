"""
Service discovery using Zookeeper.
"""
import logging
from typing import List, Dict, Any, Optional
from core.zookeeper_client import get_zk_client


logger = logging.getLogger(__name__)


class ServiceRegistry:
    """Service registry for microservice discovery."""
    
    def __init__(self):
        self.zk_client = get_zk_client()
    
    def register_service(self, service_name: str, host: str, port: int, 
                        metadata: Optional[Dict] = None):
        """Register a service instance."""
        try:
            self.zk_client.register_service(service_name, host, port, metadata)
            logger.info(f"Registered service {service_name} at {host}:{port}")
        except Exception as e:
            logger.error(f"Failed to register service {service_name}: {e}")
            raise
    
    def discover_service(self, service_name: str) -> List[Dict[str, Any]]:
        """Discover all instances of a service."""
        try:
            services = self.zk_client.discover_services(service_name)
            logger.debug(f"Found {len(services)} instances of {service_name}")
            return services
        except Exception as e:
            logger.error(f"Failed to discover service {service_name}: {e}")
            return []
    
    def get_service_url(self, service_name: str, protocol: str = 'http') -> Optional[str]:
        """Get a service URL using round-robin selection."""
        services = self.discover_service(service_name)
        
        if not services:
            logger.warning(f"No instances found for service: {service_name}")
            return None
        
        # Simple round-robin selection (in production, use more sophisticated load balancing)
        service = services[0]
        host = service.get('host')
        port = service.get('port')
        
        if host and port:
            url = f"{protocol}://{host}:{port}"
            logger.debug(f"Selected service URL: {url}")
            return url
        
        return None
    
    def unregister_service(self, service_name: str, host: str, port: int):
        """Unregister a service instance."""
        try:
            service_path = f"/services/{service_name}"
            node_path = f"{service_path}/{host}:{port}"
            self.zk_client.delete_node(node_path)
            logger.info(f"Unregistered service {service_name} at {host}:{port}")
        except Exception as e:
            logger.error(f"Failed to unregister service {service_name}: {e}")


class HealthChecker:
    """Health checking for registered services."""
    
    def __init__(self, service_registry: ServiceRegistry):
        self.service_registry = service_registry
    
    def check_service_health(self, service_name: str) -> Dict[str, Any]:
        """Check health of all instances of a service."""
        services = self.service_registry.discover_service(service_name)
        health_status = {
            'service_name': service_name,
            'total_instances': len(services),
            'healthy_instances': 0,
            'unhealthy_instances': 0,
            'instances': []
        }
        
        for service in services:
            host = service.get('host')
            port = service.get('port')
            
            # In a real implementation, you would make HTTP health check calls
            # For now, we assume all discovered services are healthy
            is_healthy = True  # This would be the result of an actual health check
            
            instance_status = {
                'host': host,
                'port': port,
                'healthy': is_healthy,
                'metadata': service.get('metadata', {})
            }
            
            health_status['instances'].append(instance_status)
            
            if is_healthy:
                health_status['healthy_instances'] += 1
            else:
                health_status['unhealthy_instances'] += 1
        
        return health_status


# Global service registry instance
_service_registry = None


def get_service_registry() -> ServiceRegistry:
    """Get or create global service registry instance."""
    global _service_registry
    if _service_registry is None:
        _service_registry = ServiceRegistry()
    return _service_registry