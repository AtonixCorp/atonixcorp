"""
Health checks for AtonixCorp Platform services.
Provides liveness and readiness probes required by Kubernetes.
"""

import logging
import json
from django.http import JsonResponse
from django.views import View
from django.db import connections
from django.core.cache import cache
import psutil

logger = logging.getLogger(__name__)


class HealthCheckView(View):
    """
    Kubernetes liveness probe endpoint.
    Returns 200 if the service is running, even if degraded.
    """
    
    def get(self, request):
        """Check if service is alive."""
        health_status = {
            "status": "healthy",
            "service": "atonixcorp-platform",
            "timestamp": self._get_timestamp(),
            "version": self._get_version(),
            "checks": {}
        }
        
        # Basic service check
        try:
            # Database check
            db_ok = self._check_database()
            health_status["checks"]["database"] = {
                "status": "ok" if db_ok else "degraded",
                "message": "Database connection OK" if db_ok else "Database connection lost"
            }
        except Exception as e:
            logger.warning(f"Database check failed: {e}")
            health_status["checks"]["database"] = {
                "status": "degraded",
                "message": str(e)
            }
        
        # System resources check
        try:
            resources = self._check_resources()
            health_status["checks"]["resources"] = resources
        except Exception as e:
            logger.warning(f"Resource check failed: {e}")
        
        return JsonResponse(health_status, status=200)
    
    @staticmethod
    def _check_database() -> bool:
        """Check if database is accessible."""
        try:
            connection = connections['default']
            connection.ensure_connection()
            return True
        except Exception:
            return False
    
    @staticmethod
    def _check_resources() -> dict:
        """Check system resource usage."""
        try:
            cpu_percent = psutil.cpu_percent(interval=0.1)
            memory = psutil.virtual_memory()
            
            return {
                "status": "ok",
                "cpu_percent": round(cpu_percent, 2),
                "memory_percent": round(memory.percent, 2),
                "memory_available_mb": round(memory.available / (1024 * 1024), 2)
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }
    
    @staticmethod
    def _get_timestamp() -> str:
        """Get current ISO timestamp."""
        from datetime import datetime, timezone
        return datetime.now(timezone.utc).isoformat()
    
    @staticmethod
    def _get_version() -> str:
        """Get service version."""
        import os
        return os.environ.get('SERVICE_VERSION', '1.0.0')


class ReadinessCheckView(View):
    """
    Kubernetes readiness probe endpoint.
    Returns 200 only if the service is ready to accept traffic.
    """
    
    def get(self, request):
        """Check if service is ready."""
        readiness_status = {
            "ready": True,
            "service": "atonixcorp-platform",
            "timestamp": self._get_timestamp(),
            "checks": {}
        }
        
        # Check all critical dependencies
        checks = [
            ("database", self._check_database),
            ("cache", self._check_cache),
            ("disk_space", self._check_disk),
        ]
        
        is_ready = True
        for check_name, check_func in checks:
            try:
                check_result = check_func()
                readiness_status["checks"][check_name] = check_result
                if not check_result.get("status") == "ok":
                    is_ready = False
            except Exception as e:
                logger.error(f"Readiness check '{check_name}' failed: {e}")
                readiness_status["checks"][check_name] = {
                    "status": "error",
                    "message": str(e)
                }
                is_ready = False
        
        readiness_status["ready"] = is_ready
        status_code = 200 if is_ready else 503
        
        return JsonResponse(readiness_status, status=status_code)
    
    @staticmethod
    def _check_database() -> dict:
        """Check if database is ready for queries."""
        try:
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            return {
                "status": "ok",
                "message": "Database ready"
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Database not ready: {str(e)}"
            }
    
    @staticmethod
    def _check_cache() -> dict:
        """Check if cache is accessible."""
        try:
            cache.set('readiness_check', 'ok', timeout=1)
            value = cache.get('readiness_check')
            if value == 'ok':
                return {
                    "status": "ok",
                    "message": "Cache ready"
                }
            else:
                return {
                    "status": "error",
                    "message": "Cache unreliable"
                }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Cache not ready: {str(e)}"
            }
    
    @staticmethod
    def _check_disk() -> dict:
        """Check available disk space."""
        try:
            disk = psutil.disk_usage('/')
            percent_used = disk.percent
            
            status = "ok" if percent_used < 90 else "warning"
            
            return {
                "status": status,
                "percent_used": round(percent_used, 2),
                "available_gb": round(disk.free / (1024**3), 2)
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }
    
    @staticmethod
    def _get_timestamp() -> str:
        """Get current ISO timestamp."""
        from datetime import datetime, timezone
        return datetime.now(timezone.utc).isoformat()


class MetricsView(View):
    """
    Prometheus metrics endpoint.
    Exposes application and system metrics.
    """
    
    def get(self, request):
        """Return Prometheus-format metrics."""
        from observability import prometheus_metrics
        
        content_type, body = prometheus_metrics()
        return JsonResponse(
            {"metrics": body.decode('utf-8') if isinstance(body, bytes) else body},
            status=200
        )
