"""
Health check views for AtonixCorp Platform
"""
from django.http import JsonResponse
from django.views import View
from django.db import connections
from django.core.cache import cache
import redis
from django.conf import settings

class HealthCheckView(View):
    """
    Health check endpoint for monitoring and load balancers
    """
    
    def get(self, request):
        """
        Perform health checks on all critical services
        """
        health_status = {
            'status': 'healthy',
            'timestamp': None,
            'services': {
                'database': self._check_database(),
                'cache': self._check_cache(),
                'redis': self._check_redis(),
            }
        }
        
        # Determine overall health
        all_healthy = all(
            service['status'] == 'healthy' 
            for service in health_status['services'].values()
        )
        
        if not all_healthy:
            health_status['status'] = 'unhealthy'
            status_code = 503
        else:
            status_code = 200
            
        health_status['timestamp'] = self._get_timestamp()
        
        return JsonResponse(health_status, status=status_code)
    
    def _check_database(self):
        """Check database connectivity"""
        try:
            db_conn = connections['default']
            db_conn.cursor()
            return {'status': 'healthy', 'message': 'Database connection OK'}
        except Exception as e:
            return {'status': 'unhealthy', 'message': f'Database error: {str(e)}'}
    
    def _check_cache(self):
        """Check Django cache"""
        try:
            cache.set('health_check', 'test', 10)
            cache.get('health_check')
            return {'status': 'healthy', 'message': 'Cache connection OK'}
        except Exception as e:
            return {'status': 'unhealthy', 'message': f'Cache error: {str(e)}'}
    
    def _check_redis(self):
        """Check Redis connectivity"""
        try:
            if hasattr(settings, 'REDIS_URL'):
                r = redis.from_url(settings.REDIS_URL)
                r.ping()
                return {'status': 'healthy', 'message': 'Redis connection OK'}
            else:
                return {'status': 'healthy', 'message': 'Redis not configured'}
        except Exception as e:
            return {'status': 'unhealthy', 'message': f'Redis error: {str(e)}'}
    
    def _get_timestamp(self):
        """Get current timestamp"""
        from django.utils import timezone
        return timezone.now().isoformat()