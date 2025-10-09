"""
Django Management Command for Zookeeper Operations

Usage:
    python manage.py zookeeper status
    python manage.py zookeeper config set feature_flags '{"new_dashboard": true}'
    python manage.py zookeeper config get feature_flags
    python manage.py zookeeper config list
    python manage.py zookeeper service register backend localhost 8000
    python manage.py zookeeper service discover backend
    python manage.py zookeeper tree
"""

from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
import json
import os


class Command(BaseCommand):
    help = 'Manage Zookeeper configuration and coordination'

    def add_arguments(self, parser):
        subparsers = parser.add_subparsers(dest='action', help='Zookeeper actions')
        
        # Status command
        status_parser = subparsers.add_parser('status', help='Check Zookeeper connection status')
        
        # Config commands
        config_parser = subparsers.add_parser('config', help='Manage configuration')
        config_subparsers = config_parser.add_subparsers(dest='config_action')
        
        # Config get
        get_parser = config_subparsers.add_parser('get', help='Get configuration value')
        get_parser.add_argument('key', help='Configuration key')
        get_parser.add_argument('--default', help='Default value if key not found')
        
        # Config set
        set_parser = config_subparsers.add_parser('set', help='Set configuration value')
        set_parser.add_argument('key', help='Configuration key')
        set_parser.add_argument('value', help='Configuration value')
        set_parser.add_argument('--description', help='Configuration description')
        
        # Config list
        config_subparsers.add_parser('list', help='List all configurations')
        
        # Config remove
        remove_parser = config_subparsers.add_parser('remove', help='Remove configuration')
        remove_parser.add_argument('key', help='Configuration key to remove')
        
        # Service commands
        service_parser = subparsers.add_parser('service', help='Manage services')
        service_subparsers = service_parser.add_subparsers(dest='service_action')
        
        # Service register
        register_parser = service_subparsers.add_parser('register', help='Register service')
        register_parser.add_argument('name', help='Service name')
        register_parser.add_argument('host', help='Service host')
        register_parser.add_argument('port', type=int, help='Service port')
        register_parser.add_argument('--metadata', help='Service metadata (JSON)')
        
        # Service discover
        discover_parser = service_subparsers.add_parser('discover', help='Discover services')
        discover_parser.add_argument('name', help='Service name')
        
        # Service list
        service_subparsers.add_parser('list', help='List all services')
        
        # Tree command
        tree_parser = subparsers.add_parser('tree', help='Show Zookeeper tree structure')
        tree_parser.add_argument('--path', default='/', help='Root path to display')
        tree_parser.add_argument('--depth', type=int, default=3, help='Maximum depth')

    def handle(self, *args, **options):
        action = options.get('action')
        
        if not action:
            self.print_help('manage.py', 'zookeeper')
            return
        
        try:
            # Import here to avoid issues if kazoo is not installed
            from core.zookeeper_client import get_zk_client
            from core.config_manager import get_config_manager
            from core.service_discovery import get_service_registry
        except ImportError:
            raise CommandError(
                "Zookeeper integration not available. "
                "Install kazoo: pip install kazoo>=2.9.0"
            )

        try:
            if action == 'status':
                self.handle_status()
            elif action == 'config':
                self.handle_config(options)
            elif action == 'service':
                self.handle_service(options)
            elif action == 'tree':
                self.handle_tree(options)
            else:
                raise CommandError(f"Unknown action: {action}")
        except Exception as e:
            raise CommandError(f"Command failed: {e}")

    def handle_status(self):
        """Check Zookeeper connection status."""
        from core.zookeeper_client import get_zk_client
        
        zk_client = get_zk_client()
        
        try:
            zk_client.connect()
            self.stdout.write(
                self.style.SUCCESS(f"✓ Connected to Zookeeper at {zk_client.hosts}")
            )
            
            # Test basic operations
            test_path = "/test-connection"
            zk_client.set_config(test_path, {"test": "connection"}, ephemeral=True)
            config = zk_client.get_config(test_path)
            
            if config and config.get("test") == "connection":
                self.stdout.write(self.style.SUCCESS("✓ Read/write operations working"))
            else:
                self.stdout.write(self.style.WARNING("⚠ Read/write operations may have issues"))
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"✗ Failed to connect to Zookeeper: {e}")
            )
        finally:
            zk_client.disconnect()

    def handle_config(self, options):
        """Handle configuration commands."""
        from core.config_manager import get_config_manager
        
        config_action = options.get('config_action')
        config_manager = get_config_manager()
        
        if config_action == 'get':
            key = options['key']
            default = options.get('default')
            value = config_manager.get_setting(key, default)
            
            if value is not None:
                self.stdout.write(f"{key}: {value}")
            else:
                self.stdout.write(f"Configuration key '{key}' not found")
        
        elif config_action == 'set':
            key = options['key']
            value = options['value']
            description = options.get('description', '')
            
            # Try to parse as JSON, fall back to string
            try:
                parsed_value = json.loads(value)
            except json.JSONDecodeError:
                parsed_value = value
            
            config_manager.set_setting(key, parsed_value, description)
            self.stdout.write(
                self.style.SUCCESS(f"Set configuration: {key} = {parsed_value}")
            )
        
        elif config_action == 'list':
            settings = config_manager.get_all_settings()
            
            if settings:
                self.stdout.write("Configuration settings:")
                for key, value in settings.items():
                    self.stdout.write(f"  {key}: {value}")
            else:
                self.stdout.write("No configuration settings found")
        
        elif config_action == 'remove':
            key = options['key']
            config_manager.remove_setting(key)
            self.stdout.write(
                self.style.SUCCESS(f"Removed configuration: {key}")
            )

    def handle_service(self, options):
        """Handle service commands."""
        from core.service_discovery import get_service_registry
        from core.zookeeper_client import get_zk_client
        
        service_action = options.get('service_action')
        service_registry = get_service_registry()
        
        if service_action == 'register':
            name = options['name']
            host = options['host']
            port = options['port']
            metadata_str = options.get('metadata')
            
            metadata = {}
            if metadata_str:
                try:
                    metadata = json.loads(metadata_str)
                except json.JSONDecodeError:
                    raise CommandError("Invalid JSON metadata")
            
            service_registry.register_service(name, host, port, metadata)
            self.stdout.write(
                self.style.SUCCESS(f"Registered service: {name} at {host}:{port}")
            )
        
        elif service_action == 'discover':
            name = options['name']
            services = service_registry.discover_service(name)
            
            if services:
                self.stdout.write(f"Found {len(services)} instances of {name}:")
                for service in services:
                    host = service.get('host')
                    port = service.get('port')
                    metadata = service.get('metadata', {})
                    self.stdout.write(f"  {host}:{port}")
                    if metadata:
                        self.stdout.write(f"    Metadata: {metadata}")
            else:
                self.stdout.write(f"No instances found for service: {name}")
        
        elif service_action == 'list':
            zk_client = get_zk_client()
            zk_client.connect()
            
            services_path = "/services"
            try:
                service_names = zk_client.get_children(services_path)
                
                if service_names:
                    self.stdout.write("Registered services:")
                    for service_name in service_names:
                        instances = service_registry.discover_service(service_name)
                        self.stdout.write(f"  {service_name} ({len(instances)} instances)")
                else:
                    self.stdout.write("No services registered")
            except Exception:
                self.stdout.write("No services registered")
            finally:
                zk_client.disconnect()

    def handle_tree(self, options):
        """Show Zookeeper tree structure."""
        from core.zookeeper_client import get_zk_client
        
        path = options.get('path', '/')
        depth = options.get('depth', 3)
        
        zk_client = get_zk_client()
        zk_client.connect()
        
        try:
            self._print_tree(zk_client, path, depth, 0)
        finally:
            zk_client.disconnect()

    def _print_tree(self, zk_client, path, max_depth, current_depth):
        """Recursively print Zookeeper tree structure."""
        if current_depth > max_depth:
            return
        
        indent = "  " * current_depth
        node_name = path.split('/')[-1] or "/"
        
        try:
            # Get node data
            if zk_client.client.exists(path):
                data, stat = zk_client.client.get(path)
                data_preview = ""
                
                if data:
                    try:
                        # Try to parse as JSON
                        json_data = json.loads(data.decode('utf-8'))
                        data_preview = f" (JSON: {len(str(json_data))} chars)"
                    except:
                        # Raw data
                        data_preview = f" (Data: {len(data)} bytes)"
                
                self.stdout.write(f"{indent}{node_name}{data_preview}")
                
                # Get children
                if current_depth < max_depth:
                    children = zk_client.get_children(path)
                    for child in sorted(children):
                        child_path = f"{path.rstrip('/')}/{child}"
                        self._print_tree(zk_client, child_path, max_depth, current_depth + 1)
            else:
                self.stdout.write(f"{indent}{node_name} (not found)")
                
        except Exception as e:
            self.stdout.write(f"{indent}{node_name} (error: {e})")


# Example Django settings.py integration:
"""
# settings.py

# Zookeeper configuration
ZOOKEEPER_HOSTS = os.getenv('ZOOKEEPER_HOSTS', 'localhost:2181')
ZOOKEEPER_ENABLED = os.getenv('ZOOKEEPER_ENABLED', 'true').lower() == 'true'

# Optional: Load configuration from Zookeeper
if ZOOKEEPER_ENABLED:
    try:
        from zookeeper_integration import ZookeeperConfig
        zk_config = ZookeeperConfig()
        
        # Override settings with Zookeeper values
        DEBUG = zk_config.get('django.debug', DEBUG)
        
        # Feature flags
        FEATURE_FLAGS = zk_config.get('feature_flags', {
            'new_dashboard': False,
            'experimental_features': False,
            'maintenance_mode': False
        })
        
        # Dynamic configuration
        CACHE_TIMEOUT = zk_config.get('cache.timeout', 300)
        
    except ImportError:
        # Zookeeper not available, use defaults
        FEATURE_FLAGS = {
            'new_dashboard': False,
            'experimental_features': False,
            'maintenance_mode': False
        }
        CACHE_TIMEOUT = 300

# Add Zookeeper middleware
if ZOOKEEPER_ENABLED:
    MIDDLEWARE.insert(0, 'zookeeper_integration.ZookeeperMiddleware')
"""

# Example views.py integration:
"""
# views.py

from django.http import JsonResponse
from django.views import View
from django.conf import settings

class FeatureFlagsView(View):
    '''API endpoint for feature flags managed by Zookeeper.'''
    
    def get(self, request):
        if hasattr(request, 'zk') and request.zk.is_connected():
            # Get live feature flags from Zookeeper
            flags = request.zk.get_config('feature_flags', {})
        else:
            # Fallback to settings
            flags = getattr(settings, 'FEATURE_FLAGS', {})
        
        return JsonResponse({'feature_flags': flags})

class ConfigView(View):
    '''Admin endpoint for configuration management.'''
    
    def get(self, request):
        if not request.user.is_staff:
            return JsonResponse({'error': 'Permission denied'}, status=403)
        
        if hasattr(request, 'zk') and request.zk.is_connected():
            # List all configuration keys
            try:
                config_path = f"{request.zk.app_namespace}/config"
                keys = request.zk.client.get_children(config_path)
                configs = {}
                
                for key in keys:
                    configs[key] = request.zk.get_config(key)
                
                return JsonResponse({'configs': configs})
            except Exception as e:
                return JsonResponse({'error': str(e)}, status=500)
        else:
            return JsonResponse({'error': 'Zookeeper not available'}, status=503)
    
    def post(self, request):
        if not request.user.is_staff:
            return JsonResponse({'error': 'Permission denied'}, status=403)
        
        key = request.POST.get('key')
        value = request.POST.get('value')
        
        if not key or value is None:
            return JsonResponse({'error': 'key and value required'}, status=400)
        
        if hasattr(request, 'zk') and request.zk.is_connected():
            try:
                # Parse JSON if possible
                import json
                try:
                    parsed_value = json.loads(value)
                except json.JSONDecodeError:
                    parsed_value = value
                
                if request.zk.set_config(key, parsed_value):
                    return JsonResponse({'status': 'success'})
                else:
                    return JsonResponse({'error': 'Failed to set config'}, status=500)
            except Exception as e:
                return JsonResponse({'error': str(e)}, status=500)
        else:
            return JsonResponse({'error': 'Zookeeper not available'}, status=503)
"""