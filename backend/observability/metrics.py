from prometheus_client import CollectorRegistry, Gauge, generate_latest, CONTENT_TYPE_LATEST
from prometheus_client import push_to_gateway
import os

# Registry and basic metrics
registry = CollectorRegistry()

cpu_gauge = Gauge('app_cpu_usage', 'CPU usage reported by app', registry=registry)
mem_gauge = Gauge('app_memory_usage', 'Memory usage reported by app', registry=registry)

def record_metrics(cpu=None, memory=None):
    if cpu is not None:
        try:
            cpu_gauge.set(float(cpu))
        except Exception:
            pass
    if memory is not None:
        try:
            mem_gauge.set(float(memory))
        except Exception:
            pass

def prometheus_metrics():
    """Return (content_type, body) for a Prometheus scrape."""
    body = generate_latest(registry)
    return CONTENT_TYPE_LATEST, body

def push_metrics_to_gateway(job='atonixcorp', gateway_url=None):
    gateway = gateway_url or os.environ.get('PROM_PUSHGATEWAY')
    if not gateway:
        return False
    try:
        push_to_gateway(gateway, job=job, registry=registry)
        return True
    except Exception:
        return False
