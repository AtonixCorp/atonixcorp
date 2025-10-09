"""
Example views showing Zookeeper integration in Django.
"""
import json
import logging
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from core.config_manager import get_config_manager
from core.service_discovery import get_service_registry
from core.distributed_lock import distributed_lock, TaskCoordinator


logger = logging.getLogger(__name__)


class FeatureFlagsView(View):
    """API endpoint for feature flags managed by Zookeeper."""
    
    def get(self, request):
        """Get current feature flags."""
        try:
            config_manager = get_config_manager()
            feature_flags = config_manager.get_setting('feature_flags', {
                'new_dashboard': False,
                'experimental_features': False,
                'maintenance_mode': False,
                'beta_api': False
            })
            
            return JsonResponse({
                'feature_flags': feature_flags,
                'source': 'zookeeper' if hasattr(request, 'zk') and request.zk else 'defaults'
            })
        except Exception as e:
            logger.error(f"Failed to get feature flags: {e}")
            return JsonResponse({
                'feature_flags': {
                    'new_dashboard': False,
                    'experimental_features': False,
                    'maintenance_mode': False,
                    'beta_api': False
                },
                'source': 'fallback',
                'error': str(e)
            })


@method_decorator(staff_member_required, name='dispatch')
class ConfigManagementView(View):
    """Admin endpoint for configuration management."""
    
    def get(self, request):
        """Get all configuration settings."""
        try:
            config_manager = get_config_manager()
            settings = config_manager.get_all_settings()
            
            return JsonResponse({
                'success': True,
                'configs': settings,
                'count': len(settings)
            })
        except Exception as e:
            logger.error(f"Failed to get configurations: {e}")
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)
    
    @method_decorator(csrf_exempt)
    def post(self, request):
        """Set a configuration value."""
        try:
            data = json.loads(request.body)
            key = data.get('key')
            value = data.get('value')
            description = data.get('description', '')
            
            if not key or value is None:
                return JsonResponse({
                    'success': False,
                    'error': 'key and value are required'
                }, status=400)
            
            config_manager = get_config_manager()
            config_manager.set_setting(key, value, description)
            
            return JsonResponse({
                'success': True,
                'message': f'Configuration {key} updated'
            })
            
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'Invalid JSON'
            }, status=400)
        except Exception as e:
            logger.error(f"Failed to set configuration: {e}")
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)


class ServiceDiscoveryView(View):
    """API endpoint for service discovery."""
    
    def get(self, request):
        """Get available services."""
        service_name = request.GET.get('service')
        
        try:
            service_registry = get_service_registry()
            
            if service_name:
                # Get specific service instances
                services = service_registry.discover_service(service_name)
                return JsonResponse({
                    'service_name': service_name,
                    'instances': services,
                    'count': len(services)
                })
            else:
                # List all services (simplified implementation)
                # In a real app, you might want to cache this or implement differently
                return JsonResponse({
                    'message': 'Specify service name with ?service=<name> parameter'
                })
                
        except Exception as e:
            logger.error(f"Service discovery failed: {e}")
            return JsonResponse({
                'error': str(e)
            }, status=500)


class HealthCheckView(View):
    """Health check endpoint with Zookeeper status."""
    
    def get(self, request):
        """Get application health status."""
        health_data = {
            'status': 'healthy',
            'timestamp': request.META.get('HTTP_DATE'),
            'services': {}
        }
        
        # Check Zookeeper connection
        if hasattr(request, 'zk') and request.zk:
            try:
                if request.zk.connected:
                    health_data['services']['zookeeper'] = {
                        'status': 'connected',
                        'hosts': request.zk.hosts
                    }
                else:
                    health_data['services']['zookeeper'] = {
                        'status': 'disconnected',
                        'hosts': request.zk.hosts
                    }
                    health_data['status'] = 'degraded'
            except Exception as e:
                health_data['services']['zookeeper'] = {
                    'status': 'error',
                    'error': str(e)
                }
                health_data['status'] = 'degraded'
        else:
            health_data['services']['zookeeper'] = {
                'status': 'disabled'
            }
        
        return JsonResponse(health_data)


@method_decorator(login_required, name='dispatch')
class DistributedTaskView(View):
    """Example of distributed task coordination."""
    
    @method_decorator(csrf_exempt)
    def post(self, request):
        """Run a distributed task."""
        try:
            data = json.loads(request.body)
            task_name = data.get('task_name')
            
            if not task_name:
                return JsonResponse({
                    'success': False,
                    'error': 'task_name is required'
                }, status=400)
            
            # Example task function
            def example_task():
                import time
                time.sleep(2)  # Simulate work
                return {'result': f'Task {task_name} completed', 'user': request.user.username}
            
            # Use task coordinator to ensure task runs only once
            coordinator = TaskCoordinator(f"user-task-{task_name}")
            
            if coordinator.is_completed():
                return JsonResponse({
                    'success': True,
                    'message': 'Task already completed',
                    'task_name': task_name
                })
            
            result = coordinator.run_once(example_task)
            
            return JsonResponse({
                'success': True,
                'result': result,
                'task_name': task_name
            })
            
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'Invalid JSON'
            }, status=400)
        except Exception as e:
            logger.error(f"Distributed task failed: {e}")
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)


class LockDemoView(View):
    """Demonstration of distributed locking."""
    
    @method_decorator(csrf_exempt)
    def post(self, request):
        """Demonstrate distributed lock usage."""
        try:
            data = json.loads(request.body)
            lock_name = data.get('lock_name', 'demo-lock')
            
            # Try to acquire a lock and perform some work
            try:
                with distributed_lock(lock_name, timeout=10):
                    # Simulate some work that should be exclusive
                    import time
                    time.sleep(1)
                    
                    return JsonResponse({
                        'success': True,
                        'message': f'Successfully acquired and released lock: {lock_name}',
                        'lock_name': lock_name
                    })
                    
            except RuntimeError as e:
                return JsonResponse({
                    'success': False,
                    'message': f'Failed to acquire lock: {lock_name}',
                    'error': str(e)
                }, status=423)  # 423 Locked
                
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'Invalid JSON'
            }, status=400)
        except Exception as e:
            logger.error(f"Lock demo failed: {e}")
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)