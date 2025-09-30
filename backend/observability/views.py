from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponse
import json
import logging
import os

from . import metrics as metrics_helper

logger = logging.getLogger(__name__)


@csrf_exempt
def telemetry_endpoint(request):
    """Simple telemetry ingest endpoint for development/testing.

    Accepts JSON POSTs from the frontend. This endpoint is intentionally
    permissive for local development. In production, route telemetry to a
    secure collector (OpenTelemetry Collector / OTLP) instead.
    Expected JSON body example:
      {"cpu": 42, "memory": 128}
    """
    if request.method != 'POST':
        return JsonResponse({'detail': 'Method not allowed'}, status=405)

    try:
        payload = json.loads(request.body.decode('utf-8') or '{}')
    except Exception:
        payload = {}

    # Log the telemetry payload at debug level so it's available in logs
    logger.debug('Telemetry received: %s', payload)

    # Record Prometheus metrics if present
    cpu = payload.get('cpu') or payload.get('cpu_usage')
    memory = payload.get('memory') or payload.get('mem')
    try:
        metrics_helper.record_metrics(cpu=cpu, memory=memory)
    except Exception:
        logger.exception('Failed to record metrics')

    # Optional: push to Pushgateway if configured
    try:
        if os.environ.get('PROM_PUSHGATEWAY'):
            metrics_helper.push_metrics_to_gateway(job=os.environ.get('PROM_JOB', 'atonixcorp'))
    except Exception:
        logger.exception('Failed to push metrics to Pushgateway')

    # Optional: write to InfluxDB if configured and payload contains fields
    influx_host = os.environ.get('INFLUXDB_HOST')
    if influx_host and (cpu is not None or memory is not None):
        try:
            # lazy import so missing dependency doesn't crash server
            from influxdb import InfluxDBClient

            client = InfluxDBClient(host=influx_host, port=int(os.environ.get('INFLUXDB_PORT', 8086)))
            db = os.environ.get('INFLUXDB_DB', 'default')
            client.switch_database(db)
            json_body = [{
                'measurement': os.environ.get('INFLUX_MEASUREMENT', 'telemetry'),
                'fields': {}
            }]
            if cpu is not None:
                json_body[0]['fields']['cpu'] = float(cpu)
            if memory is not None:
                json_body[0]['fields']['memory'] = float(memory)
            client.write_points(json_body)
        except Exception:
            logger.exception('Failed to write to InfluxDB')

    # Respond with 202 Accepted to indicate we received it
    return HttpResponse(status=202)


def metrics(request):
    """Prometheus metrics scrape endpoint. GET /metrics"""
    if request.method not in ('GET', 'HEAD'):
        return JsonResponse({'detail': 'Method not allowed'}, status=405)
    try:
        content_type, body = metrics_helper.prometheus_metrics()
        return HttpResponse(body, content_type=content_type)
    except Exception:
        logger.exception('Failed to build Prometheus metrics')
        return JsonResponse({'detail': 'error'}, status=500)


@csrf_exempt
def metrics_influx(request):
    """
    Optional endpoint to accept telemetry and write to InfluxDB explicitly.
    POST JSON like {"cpu": 42, "memory": 128}
    """
    if request.method != 'POST':
        return JsonResponse({'detail': 'Method not allowed'}, status=405)
    try:
        payload = json.loads(request.body.decode('utf-8') or '{}')
    except Exception:
        payload = {}

    influx_host = os.environ.get('INFLUXDB_HOST')
    if not influx_host:
        return JsonResponse({'detail': 'InfluxDB not configured'}, status=503)
    try:
        from influxdb import InfluxDBClient

        client = InfluxDBClient(host=influx_host, port=int(os.environ.get('INFLUXDB_PORT', 8086)))
        db = os.environ.get('INFLUXDB_DB', 'default')
        client.switch_database(db)
        json_body = [{
            'measurement': os.environ.get('INFLUX_MEASUREMENT', 'telemetry'),
            'fields': {}
        }]
        if 'cpu' in payload:
            json_body[0]['fields']['cpu'] = float(payload['cpu'])
        if 'memory' in payload:
            json_body[0]['fields']['memory'] = float(payload['memory'])
        client.write_points(json_body)
    except Exception:
        logger.exception('Failed to write to InfluxDB')
        return JsonResponse({'detail': 'error'}, status=500)

    return JsonResponse({'detail': 'ok'}, status=202)
