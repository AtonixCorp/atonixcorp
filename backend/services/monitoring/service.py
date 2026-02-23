# AtonixCorp Cloud – Monitoring Service
# Collects metrics, evaluates alert rules, and manages incidents.
# Falls back to realistic mock data when live Prometheus/agents are unavailable.

import logging
import os
import random
import math
from datetime import datetime, timedelta, timezone

logger = logging.getLogger(__name__)

PROMETHEUS_URL = os.environ.get('PROMETHEUS_URL', '')
PROMETHEUS_USER = os.environ.get('PROMETHEUS_USER', '')
PROMETHEUS_PASS = os.environ.get('PROMETHEUS_PASS', '')


def _live() -> bool:
    return bool(PROMETHEUS_URL)


# ── Mock data helpers ──────────────────────────────────────────────────────────

def _wave(base: float, amplitude: float, offset: int = 0) -> float:
    """Sinusoidal variation seeded by time to produce realistic-looking charts."""
    t = datetime.now(timezone.utc).timestamp()
    return round(base + amplitude * math.sin((t / 300) + offset), 2)


def _mock_service_health() -> list[dict]:
    return [
        {'service': 'compute',    'status': 'operational',    'uptime_pct': 99.98, 'latency_ms': _wave(45, 10, 0),  'error_rate': _wave(0.1, 0.05, 1)},
        {'service': 'database',   'status': 'operational',    'uptime_pct': 99.99, 'latency_ms': _wave(12, 4, 2),   'error_rate': _wave(0.05, 0.02, 3)},
        {'service': 'storage',    'status': 'operational',    'uptime_pct': 100.0, 'latency_ms': _wave(8, 2, 4),    'error_rate': 0.0},
        {'service': 'networking', 'status': 'operational',    'uptime_pct': 99.95, 'latency_ms': _wave(3, 1, 5),    'error_rate': _wave(0.02, 0.01, 6)},
        {'service': 'containers', 'status': 'degraded',       'uptime_pct': 98.5,  'latency_ms': _wave(120, 30, 7), 'error_rate': _wave(2.1, 0.5, 8)},
        {'service': 'email',      'status': 'operational',    'uptime_pct': 99.9,  'latency_ms': _wave(60, 15, 9),  'error_rate': _wave(0.3, 0.1, 10)},
        {'service': 'dns',        'status': 'operational',    'uptime_pct': 100.0, 'latency_ms': _wave(2, 0.5, 11), 'error_rate': 0.0},
        {'service': 'cdn',        'status': 'operational',    'uptime_pct': 99.97, 'latency_ms': _wave(18, 5, 12),  'error_rate': _wave(0.08, 0.03, 13)},
    ]


def _mock_metrics_series(resource_id: str, metric: str, hours: int = 24) -> list[dict]:
    """Generate a time-series of metric points going back `hours` hours."""
    now = datetime.now(timezone.utc)
    META = {
        'cpu_percent':      (45.0, 20.0, '%'),
        'memory_percent':   (62.0, 15.0, '%'),
        'disk_io_read':     (30.0, 20.0, 'MB/s'),
        'disk_io_write':    (15.0, 10.0, 'MB/s'),
        'network_in':       (50.0, 30.0, 'MB/s'),
        'network_out':      (25.0, 15.0, 'MB/s'),
        'latency_ms':       (40.0, 20.0, 'ms'),
        'error_rate':       (0.5,   0.4, '%'),
        'request_rate':     (850.0, 400.0, 'req/s'),
        'queue_length':     (12.0,  8.0, ''),
        'replication_lag':  (0.2,   0.15, 's'),
        'pod_restarts':     (0.5,   0.5, ''),
        'storage_used_pct': (68.0,  5.0, '%'),
        'email_queue':      (5.0,   4.0, ''),
        'dns_query_rate':   (1200.0, 400.0, 'q/s'),
    }
    base, amp, unit = META.get(metric, (50.0, 10.0, ''))
    points = []
    steps = hours * 4  # every 15 minutes
    seed = hash(resource_id + metric) % 1000
    for i in range(steps):
        ts = now - timedelta(minutes=15 * (steps - i))
        val = base + amp * math.sin((i / (steps / (2 * math.pi))) + seed)
        val += random.uniform(-amp * 0.1, amp * 0.1)
        val = max(0.0, round(val, 2))
        points.append({'timestamp': ts.isoformat(), 'value': val, 'unit': unit})
    return points


# ── Public API ─────────────────────────────────────────────────────────────────

def get_service_health(owner=None) -> list[dict]:
    """Return current health for all monitored services."""
    if _live():
        # TODO: query Prometheus for real up/error-rate metrics
        pass
    return _mock_service_health()


def get_overview_stats(owner) -> dict:
    """Top-level summary numbers for the monitoring overview."""
    from .models import Incident, MonitoringAlert, AlertRule
    from django.db.models import Q

    open_incidents  = Incident.objects.filter(owner=owner).exclude(status='resolved').count()
    firing_alerts   = MonitoringAlert.objects.filter(owner=owner, state='firing').count()
    total_rules     = AlertRule.objects.filter(owner=owner, is_enabled=True).count()

    health_list = get_service_health()
    operational  = sum(1 for s in health_list if s['status'] == 'operational')
    degraded     = len(health_list) - operational

    return {
        'services_total':       len(health_list),
        'services_operational': operational,
        'services_degraded':    degraded,
        'open_incidents':       open_incidents,
        'firing_alerts':        firing_alerts,
        'active_alert_rules':   total_rules,
        'overall_uptime':       round(sum(s['uptime_pct'] for s in health_list) / len(health_list), 3),
    }


def get_metric_series(owner, resource_id: str, metric: str,
                      hours: int = 24) -> list[dict]:
    """Return time-series data points for a resource metric."""
    if _live():
        # TODO: query Prometheus range API
        pass
    return _mock_metrics_series(resource_id, metric, hours)


def ingest_metric(owner, resource_id: str, service: str,
                  metric: str, value: float, unit: str = '') -> dict:
    """Store a single metric snapshot and evaluate alert rules."""
    from .models import MetricSnapshot
    from django.utils import timezone

    snap = MetricSnapshot.objects.create(
        owner=owner,
        resource_id=resource_id,
        service=service,
        metric=metric,
        value=value,
        unit=unit,
        timestamp=timezone.now(),
    )
    _evaluate_rules(owner, resource_id, service, metric, value)
    return {'id': snap.id, 'stored': True}


def _evaluate_rules(owner, resource_id, service, metric, value):
    """Check if any enabled alert rules are breached; fire alert if so."""
    from .models import AlertRule, MonitoringAlert
    from django.utils import timezone

    from django.db.models import Q
    rules = AlertRule.objects.filter(
        owner=owner, metric=metric, service=service, is_enabled=True
    ).filter(
        Q(resource_id_filter='') | Q(resource_id_filter=resource_id)
    )
    for rule in rules:
        op = rule.condition
        breached = (
            (op == 'gt'  and value >  rule.threshold) or
            (op == 'gte' and value >= rule.threshold) or
            (op == 'lt'  and value <  rule.threshold) or
            (op == 'lte' and value <= rule.threshold) or
            (op == 'eq'  and value == rule.threshold)
        )
        if breached:
            MonitoringAlert.objects.create(
                rule=rule, owner=owner, state='firing',
                value=value,
                message=f'{metric} is {value} (threshold {op} {rule.threshold})',
            )
            rule.last_fired_at = timezone.now()
            rule.save(update_fields=['last_fired_at'])


def create_incident(owner, service: str, severity: str, title: str,
                    description: str = '', affected: list | None = None) -> dict:
    """Open a new incident."""
    from .models import Incident, IncidentUpdate

    inc = Incident.objects.create(
        owner=owner,
        service=service,
        severity=severity,
        status='open',
        name=title,
        title=title,
        summary=description,
        affected_resources=affected or [],
    )
    IncidentUpdate.objects.create(
        incident=inc, author=owner, status='open',
        message=f'Incident opened: {description or title}',
    )
    return {'resource_id': inc.resource_id, 'created': True}


def update_incident_status(incident, new_status: str, message: str, author) -> dict:
    """Transition incident status and log the update."""
    from .models import IncidentUpdate
    from django.utils import timezone

    incident.status = new_status
    if new_status == 'resolved':
        incident.resolved_at = timezone.now()
    incident.save(update_fields=['status', 'resolved_at', 'updated_at'])

    IncidentUpdate.objects.create(
        incident=incident, author=author, status=new_status, message=message,
    )
    return {'status': new_status}


def get_log_stream(owner, service: str = '', search: str = '',
                   hours: int = 1, limit: int = 100) -> list[dict]:
    """
    Return a stream of mock log entries (replace with Elasticsearch query).
    """
    LEVELS   = ['INFO', 'INFO', 'INFO', 'WARNING', 'ERROR', 'DEBUG']
    SERVICES = ['compute', 'database', 'storage', 'networking', 'containers', 'email', 'dns']
    MSGS = [
        'Request processed successfully in {ms}ms',
        'Health check passed',
        'Connection established to {host}',
        'Cache miss – fetching from upstream',
        'Rate limit approaching for client {ip}',
        'Retrying failed operation (attempt {n}/3)',
        'Slow query detected: {ms}ms',
        'Authentication failure from {ip}',
        'Disk usage at {pct}%',
        'Auto-scaling triggered: adding 1 node',
        'TLS certificate renewal successful',
        'Backup completed in {ms}ms',
    ]

    import random
    now = datetime.now(timezone.utc)
    logs = []

    services_pool = [service] if service else SERVICES
    for i in range(limit):
        ts = now - timedelta(seconds=random.randint(0, hours * 3600))
        svc = random.choice(services_pool)
        level = random.choice(LEVELS)
        msg = random.choice(MSGS).format(
            ms=random.randint(5, 2000),
            host=f'{svc}-node-{random.randint(1, 8)}.internal',
            ip=f'10.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}',
            n=random.randint(1, 3),
            pct=random.randint(40, 95),
        )
        if search and search.lower() not in msg.lower() and search.lower() not in svc.lower():
            continue
        logs.append({
            'timestamp': ts.isoformat(),
            'service':   svc,
            'level':     level,
            'message':   msg,
            'pod':       f'{svc}-{random.randint(1000,9999)}',
            'region':    random.choice(['us-east-1', 'eu-west-1', 'ap-south-1']),
        })

    logs.sort(key=lambda x: x['timestamp'], reverse=True)
    return logs[:limit]
