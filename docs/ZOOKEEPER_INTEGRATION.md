# Zookeeper Integration Documentation

## Overview

Zookeeper has been successfully integrated into the AtonixCorp platform to provide distributed coordination, configuration management, and service discovery capabilities.

## Components

### 1. Core Modules

- **`core/zookeeper_client.py`**: Main Zookeeper client with connection management, configuration, and basic operations
- **`core/config_manager.py`**: Configuration management using Zookeeper as a centralized store
- **`core/service_discovery.py`**: Service registry and discovery for microservices
- **`core/distributed_lock.py`**: Distributed locking and task coordination
- **`core/middleware.py`**: Django middleware to inject Zookeeper client into requests
- **`core/zookeeper_views.py`**: API endpoints for Zookeeper operations
- **`core/zookeeper_urls.py`**: URL patterns for Zookeeper endpoints

### 2. Management Commands

- **`management/commands/zookeeper.py`**: Django management command for Zookeeper operations

## Configuration

### Environment Variables

```bash
# Zookeeper connection
ZOOKEEPER_HOSTS=localhost:2181
ZOOKEEPER_ENABLED=true
```

### Django Settings

```python
# settings.py
ZOOKEEPER_HOSTS = os.getenv('ZOOKEEPER_HOSTS', 'localhost:2181')
ZOOKEEPER_ENABLED = os.getenv('ZOOKEEPER_ENABLED', 'true').lower() == 'true'

# Middleware (automatically added if ZOOKEEPER_ENABLED=true)
MIDDLEWARE = [
    # ... other middleware
    'core.middleware.ZookeeperMiddleware',  # Added automatically
]
```

## Usage Examples

### 1. Configuration Management

```python
from core.config_manager import get_config_manager

config_manager = get_config_manager()

# Set configuration
config_manager.set_setting('feature_flags', {
    'new_dashboard': True,
    'beta_features': False
})

# Get configuration
feature_flags = config_manager.get_setting('feature_flags', {})

# Watch for changes
def on_config_change(new_value):
    print(f"Feature flags updated: {new_value}")

config_manager.watch_setting('feature_flags', on_config_change)
```

### 2. Service Discovery

```python
from core.service_discovery import get_service_registry

service_registry = get_service_registry()

# Register a service
service_registry.register_service(
    'backend-api', 
    'localhost', 
    8000, 
    metadata={'version': '1.0', 'region': 'us-west'}
)

# Discover services
services = service_registry.discover_service('backend-api')
service_url = service_registry.get_service_url('backend-api')
```

### 3. Distributed Locking

```python
from core.distributed_lock import distributed_lock, TaskCoordinator

# Using context manager
with distributed_lock('critical-section', timeout=30):
    # Only one instance across the cluster will execute this
    perform_critical_operation()

# Using decorator
from core.distributed_lock import with_lock

@with_lock('data-processing', timeout=60)
def process_data():
    # Distributed exclusive execution
    pass

# Task coordination
coordinator = TaskCoordinator('daily-cleanup')
result = coordinator.run_once(cleanup_function)
```

### 4. In Django Views

```python
# With middleware, Zookeeper client is available in request.zk
def my_view(request):
    if request.zk and request.zk.connected:
        config = request.zk.get_config('/config/app/settings')
        # Use config
    
    return JsonResponse({'status': 'ok'})
```

## Management Commands

### Status Check
```bash
python manage.py zookeeper status
```

### Configuration Management
```bash
# Set configuration
python manage.py zookeeper config set feature_flags '{"new_ui": true}'

# Get configuration
python manage.py zookeeper config get feature_flags

# List all configurations
python manage.py zookeeper config list

# Remove configuration
python manage.py zookeeper config remove old_setting
```

### Service Management
```bash
# Register service
python manage.py zookeeper service register backend localhost 8000 --metadata '{"version": "1.0"}'

# Discover services
python manage.py zookeeper service discover backend

# List all services
python manage.py zookeeper service list
```

### Tree View
```bash
# Show Zookeeper tree structure
python manage.py zookeeper tree --path /config --depth 3
```

## API Endpoints

### Feature Flags
- **GET** `/api/zookeeper/feature-flags/` - Get current feature flags

### Configuration Management (Admin only)
- **GET** `/api/zookeeper/config/` - List all configurations
- **POST** `/api/zookeeper/config/` - Set configuration value

### Service Discovery
- **GET** `/api/zookeeper/services/?service=<name>` - Discover service instances

### Health Check
- **GET** `/api/zookeeper/health/` - Application health with Zookeeper status

### Distributed Tasks (Authenticated users)
- **POST** `/api/zookeeper/task/` - Run distributed task

### Lock Demo
- **POST** `/api/zookeeper/lock/` - Demonstrate distributed locking

## Example API Usage

### Get Feature Flags
```bash
curl http://localhost:8000/api/zookeeper/feature-flags/
```

### Set Configuration (Admin)
```bash
curl -X POST http://localhost:8000/api/zookeeper/config/ \
  -H "Content-Type: application/json" \
  -d '{"key": "max_connections", "value": 100, "description": "Maximum database connections"}'
```

### Service Discovery
```bash
curl http://localhost:8000/api/zookeeper/services/?service=backend-api
```

### Health Check
```bash
curl http://localhost:8000/api/zookeeper/health/
```

## Infrastructure Integration

### Docker Compose
Zookeeper is already configured in `docker-compose.yml`:
```yaml
zookeeper:
  image: confluentinc/cp-zookeeper:7.4.0
  ports:
    - "2181:2181"
  environment:
    ZOOKEEPER_CLIENT_PORT: 2181
    ZOOKEEPER_TICK_TIME: 2000
```

### Kubernetes
Zookeeper is deployed via Terraform in `terraform/kubernetes/modules/zookeeper/`:
- Deployment with persistent storage
- Service for internal access
- ConfigMap for configuration
- Monitoring integration

### Monitoring
- Prometheus metrics collection via JMX exporter
- Grafana dashboards for Zookeeper metrics
- Health check alerts

## Best Practices

1. **Error Handling**: Always wrap Zookeeper operations in try-catch blocks
2. **Connection Management**: Use the global client instance via `get_zk_client()`
3. **Timeouts**: Set appropriate timeouts for lock operations
4. **Namespacing**: Use application-specific paths (e.g., `/atonixcorp/config/`)
5. **Security**: Implement proper authentication and authorization for production
6. **Monitoring**: Monitor Zookeeper health and performance metrics
7. **Fallbacks**: Always have fallback values for configuration

## Testing

```python
# Test Zookeeper integration
python manage.py zookeeper status

# Test configuration
python manage.py zookeeper config set test_key "test_value"
python manage.py zookeeper config get test_key

# Test API endpoints
curl http://localhost:8000/api/zookeeper/health/
```

## Troubleshooting

1. **Connection Issues**: Check `ZOOKEEPER_HOSTS` environment variable
2. **Import Errors**: Ensure `kazoo` is installed: `pip install kazoo>=2.9.0`
3. **Permission Issues**: Verify Zookeeper ACLs if authentication is enabled
4. **Performance**: Monitor Zookeeper cluster health and network latency
5. **Lock Timeouts**: Adjust timeout values based on operation duration

## Production Considerations

1. **Cluster Setup**: Deploy Zookeeper in cluster mode (3+ nodes)
2. **Security**: Enable authentication and encryption
3. **Monitoring**: Set up comprehensive monitoring and alerting
4. **Backup**: Regular snapshots of Zookeeper data
5. **Network**: Ensure stable network connectivity between services
6. **Resource Limits**: Set appropriate CPU and memory limits