"""
Health check views for monitoring application status
"""
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
def health_check(request):
    """
    Health check endpoint for load balancers and monitoring
    """
    status = {"status": "healthy", "checks": {}}
    overall_healthy = True
    
    # Database check
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        status["checks"]["database"] = "healthy"
    except Exception as e:
        status["checks"]["database"] = f"unhealthy: {str(e)}"
        overall_healthy = False
        logger.error(f"Database health check failed: {e}")
    
    # Basic application check
    status["checks"]["application"] = "healthy"
    
    if not overall_healthy:
        status["status"] = "unhealthy"
        return JsonResponse(status, status=503)
    
    return JsonResponse(status, status=200)