from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponse
import json
import logging

logger = logging.getLogger(__name__)


@csrf_exempt
def telemetry_endpoint(request):
    """Simple telemetry ingest endpoint for development/testing.

    Accepts JSON POSTs from the frontend. This endpoint is intentionally
    permissive for local development. In production, route telemetry to a
    secure collector (OpenTelemetry Collector / OTLP) instead.
    """
    if request.method != 'POST':
        return JsonResponse({'detail': 'Method not allowed'}, status=405)

    try:
        payload = json.loads(request.body.decode('utf-8') or '{}')
    except Exception:
        payload = None

    # Log the telemetry payload at debug level so it's available in logs
    logger.debug('Telemetry received: %s', payload)

    # TODO: forward to OpenTelemetry/collector, write to DB, or enqueue for processing

    # Respond with 202 Accepted to indicate we received it
    return HttpResponse(status=202)
