"""
Simple test script to verify Zookeeper integration without requiring actual Zookeeper server.
"""
import os
import sys
import django

# Add the backend directory to Python path
sys.path.insert(0, '/home/atonixdev/atonixcorp-platform/backend')

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'atonixcorp.settings')
django.setup()

def test_zookeeper_integration():
    """Test Zookeeper integration components."""
    print("🔍 Testing Zookeeper Integration Components")
    print("=" * 50)
    
    # Test 1: Import Zookeeper client
    try:
        from core.zookeeper_client import ZookeeperClient, get_zk_client
        print("✅ Zookeeper client import successful")
        
        # Create client instance (without connecting)
        client = ZookeeperClient()
        print(f"✅ Zookeeper client created for hosts: {client.hosts}")
        
    except ImportError as e:
        print(f"❌ Failed to import Zookeeper client: {e}")
        return False
    except Exception as e:
        print(f"❌ Failed to create Zookeeper client: {e}")
        return False
    
    # Test 2: Import configuration manager
    try:
        from core.config_manager import ConfigManager, get_config_manager
        print("✅ Configuration manager import successful")
        
        config_manager = ConfigManager()
        print(f"✅ Configuration manager created for app: {config_manager.app_name}")
        
    except Exception as e:
        print(f"❌ Failed to create configuration manager: {e}")
        return False
    
    # Test 3: Import service discovery
    try:
        from core.service_discovery import ServiceRegistry, get_service_registry
        print("✅ Service discovery import successful")
        
        service_registry = ServiceRegistry()
        print("✅ Service registry created")
        
    except Exception as e:
        print(f"❌ Failed to create service registry: {e}")
        return False
    
    # Test 4: Import distributed lock
    try:
        from core.distributed_lock import DistributedLock, distributed_lock
        print("✅ Distributed lock import successful")
        
        lock = DistributedLock('test-lock')
        print(f"✅ Distributed lock created: {lock.lock_name}")
        
    except Exception as e:
        print(f"❌ Failed to create distributed lock: {e}")
        return False
    
    # Test 5: Import middleware
    try:
        from core.middleware import ZookeeperMiddleware
        print("✅ Zookeeper middleware import successful")
        
    except Exception as e:
        print(f"❌ Failed to import Zookeeper middleware: {e}")
        return False
    
    # Test 6: Check Django settings
    from django.conf import settings
    
    zk_hosts = getattr(settings, 'ZOOKEEPER_HOSTS', None)
    zk_enabled = getattr(settings, 'ZOOKEEPER_ENABLED', None)
    
    if zk_hosts:
        print(f"✅ Zookeeper hosts configured: {zk_hosts}")
    else:
        print("⚠️  Zookeeper hosts not configured")
    
    if zk_enabled is not None:
        print(f"✅ Zookeeper enabled setting: {zk_enabled}")
    else:
        print("⚠️  Zookeeper enabled setting not configured")
    
    # Test 7: Check if core app is in INSTALLED_APPS
    if 'core' in settings.INSTALLED_APPS:
        print("✅ Core app is in INSTALLED_APPS")
    else:
        print("❌ Core app not found in INSTALLED_APPS")
        return False
    
    # Test 8: Check middleware configuration
    middleware_classes = getattr(settings, 'MIDDLEWARE', [])
    zk_middleware = 'core.middleware.ZookeeperMiddleware'
    
    if zk_middleware in middleware_classes:
        print("✅ Zookeeper middleware is configured")
    else:
        print("⚠️  Zookeeper middleware not found in MIDDLEWARE (normal if ZOOKEEPER_ENABLED=False)")
    
    print("\n🎉 All Zookeeper integration tests passed!")
    print("\n📚 Next Steps:")
    print("1. Start Zookeeper server: docker-compose up zookeeper")
    print("2. Test connection: python manage.py zookeeper status")
    print("3. Set configuration: python manage.py zookeeper config set test_key 'test_value'")
    print("4. Start Django server: python manage.py runserver")
    print("5. Test API: curl http://localhost:8000/api/zookeeper/health/")
    
    return True

if __name__ == '__main__':
    success = test_zookeeper_integration()
    sys.exit(0 if success else 1)