import logging
import uuid
from typing import Any

from infrastructure.openstack_conn import get_connection, is_openstack_configured

logger = logging.getLogger(__name__)


def provision_load_balancer(*, name: str, scheme: str, subnets: list[str] | None = None) -> dict[str, Any]:
    """
    Create/provision LB infrastructure using OpenStack Octavia when configured.
    Falls back to simulated provisioning in local/dev environments.
    """
    lb_dns = f"{name}-{uuid.uuid4().hex[:6]}.lb.atonixcorp.cloud"

    if not is_openstack_configured():
        return {
            'provider': 'simulated',
            'dns_name': lb_dns,
            'status': 'running',
            'vip_address': f"10.0.{uuid.uuid4().int % 200}.{uuid.uuid4().int % 250}",
        }

    try:
        conn = get_connection()
        network_proxy = getattr(conn, 'load_balancer', None)
        if not network_proxy:
            raise RuntimeError('OpenStack load_balancer proxy not available')

        requested_subnets = subnets or []
        vip_subnet = requested_subnets[0] if requested_subnets else None

        lb = conn.load_balancer.create_load_balancer(
            name=name,
            vip_subnet_id=vip_subnet,
            description=f"AtonixCorp {scheme} LB",
            admin_state_up=True,
        )
        return {
            'provider': 'openstack-octavia',
            'dns_name': lb_dns,
            'status': 'running',
            'vip_address': getattr(lb, 'vip_address', ''),
            'openstack_id': getattr(lb, 'id', ''),
        }
    except Exception as exc:
        logger.warning('OpenStack LB provisioning failed, using simulated fallback: %s', exc)
        return {
            'provider': 'simulated-fallback',
            'dns_name': lb_dns,
            'status': 'running',
            'vip_address': f"10.1.{uuid.uuid4().int % 200}.{uuid.uuid4().int % 250}",
        }


def delete_load_balancer(*, openstack_id: str | None) -> dict[str, Any]:
    if not openstack_id:
        return {'provider': 'simulated', 'deleted': True}

    if not is_openstack_configured():
        return {'provider': 'simulated', 'deleted': True}

    try:
        conn = get_connection()
        conn.load_balancer.delete_load_balancer(openstack_id, ignore_missing=True)
        return {'provider': 'openstack-octavia', 'deleted': True}
    except Exception as exc:
        logger.warning('OpenStack LB deletion fallback: %s', exc)
        return {'provider': 'simulated-fallback', 'deleted': True}


def load_balancer_metrics(*, lb_name: str) -> dict[str, Any]:
    # Synthetic metrics for dashboard until telemetry pipeline is connected.
    seed = sum(ord(char) for char in lb_name) % 50
    return {
        'latency_ms_p50': 25 + seed,
        'latency_ms_p95': 55 + seed,
        'request_rate_rps': 120 + seed * 3,
        'error_rate_percent': round((seed % 5) * 0.2, 2),
        'healthy_targets': max(1, 3 + seed % 4),
        'unhealthy_targets': 0 if seed % 6 else 1,
        'throughput_mbps': 80 + seed * 2,
    }
