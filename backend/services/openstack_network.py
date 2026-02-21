# AtonixCorp – OpenStack Network Service
#
# Wraps openstack.network (Neutron) operations:
# VPCs (networks), subnets, security groups, floating IPs, and routers.

import logging
from typing import Any

from infrastructure.openstack_conn import get_connection

logger = logging.getLogger(__name__)


# ── Networks ──────────────────────────────────────────────────────────────────

def list_networks() -> list[dict]:
    """List all networks visible to the project."""
    conn = get_connection()
    return [_network_to_dict(n) for n in conn.network.networks()]


def get_network(network_id: str) -> dict | None:
    """Fetch a network by ID or name. Returns None if not found."""
    conn = get_connection()
    net = conn.network.find_network(network_id, ignore_missing=True)
    return _network_to_dict(net) if net else None


def get_network_by_name(name: str) -> dict | None:
    """Fetch network by display name. Returns None if not found."""
    conn = get_connection()
    net = conn.network.find_network(name, ignore_missing=True)
    return _network_to_dict(net) if net else None


def create_network(
    *,
    name: str,
    admin_state_up: bool = True,
    shared: bool = False,
) -> dict:
    """Create a new network."""
    conn = get_connection()
    net = conn.network.create_network(
        name=name,
        admin_state_up=admin_state_up,
        shared=shared,
    )
    logger.info("Created network %s (%s)", net.name, net.id)
    return _network_to_dict(net)


def delete_network(network_id: str) -> None:
    """Delete a network by ID."""
    conn = get_connection()
    conn.network.delete_network(network_id, ignore_missing=True)
    logger.info("Deleted network %s", network_id)


# ── Subnets ───────────────────────────────────────────────────────────────────

def list_subnets(network_id: str | None = None) -> list[dict]:
    """List all subnets, optionally filtered by network."""
    conn = get_connection()
    kwargs: dict[str, Any] = {}
    if network_id:
        kwargs["network_id"] = network_id
    return [_subnet_to_dict(s) for s in conn.network.subnets(**kwargs)]


def create_subnet(
    *,
    network_id: str,
    name: str,
    cidr: str,
    ip_version: int = 4,
    enable_dhcp: bool = True,
    dns_nameservers: list[str] | None = None,
) -> dict:
    """Create a subnet on the given network."""
    conn = get_connection()
    kwargs: dict[str, Any] = {
        "name":        name,
        "network_id":  network_id,
        "cidr":        cidr,
        "ip_version":  ip_version,
        "enable_dhcp": enable_dhcp,
    }
    if dns_nameservers:
        kwargs["dns_nameservers"] = dns_nameservers
    subnet = conn.network.create_subnet(**kwargs)
    logger.info("Created subnet %s (%s) on network %s", subnet.name, subnet.id, network_id)
    return _subnet_to_dict(subnet)


# ── Security Groups ───────────────────────────────────────────────────────────

def list_security_groups() -> list[dict]:
    """List all security groups for the project."""
    conn = get_connection()
    return [_sg_to_dict(sg) for sg in conn.network.security_groups()]


def create_security_group(*, name: str, description: str = "") -> dict:
    """Create a new security group."""
    conn = get_connection()
    sg = conn.network.create_security_group(name=name, description=description)
    logger.info("Created security group %s (%s)", sg.name, sg.id)
    return _sg_to_dict(sg)


def add_security_group_rule(
    *,
    security_group_id: str,
    direction: str = "ingress",
    protocol: str | None = None,
    port_range_min: int | None = None,
    port_range_max: int | None = None,
    remote_ip_prefix: str | None = None,
    ethertype: str = "IPv4",
) -> dict:
    """Add an ingress or egress rule to a security group."""
    conn = get_connection()
    rule = conn.network.create_security_group_rule(
        security_group_id=security_group_id,
        direction=direction,
        protocol=protocol,
        port_range_min=port_range_min,
        port_range_max=port_range_max,
        remote_ip_prefix=remote_ip_prefix,
        ethertype=ethertype,
    )
    return {"id": rule.id, "direction": rule.direction, "protocol": rule.protocol}


# ── Floating IPs ──────────────────────────────────────────────────────────────

def list_floating_ips() -> list[dict]:
    """List all floating IPs allocated to the project."""
    conn = get_connection()
    return [
        {
            "id":          fip.id,
            "floating_ip": fip.floating_ip_address,
            "fixed_ip":    fip.fixed_ip_address,
            "status":      fip.status,
            "port_id":     fip.port_id,
        }
        for fip in conn.network.ips()
    ]


def allocate_floating_ip(external_network_name: str = "public") -> dict:
    """Allocate a floating IP from the external network pool."""
    conn = get_connection()
    ext_net = conn.network.find_network(external_network_name, ignore_missing=True)
    if ext_net is None:
        raise ValueError(f"External network '{external_network_name}' not found")
    fip = conn.network.create_ip(floating_network_id=ext_net.id)
    logger.info("Allocated floating IP %s", fip.floating_ip_address)
    return {"id": fip.id, "floating_ip": fip.floating_ip_address}


# ── Routers ───────────────────────────────────────────────────────────────────

def list_routers() -> list[dict]:
    """List all routers for the project."""
    conn = get_connection()
    return [
        {
            "id":     r.id,
            "name":   r.name,
            "status": r.status,
            "admin_state_up": r.is_admin_state_up,
        }
        for r in conn.network.routers()
    ]


# ── Private helpers ────────────────────────────────────────────────────────────

def _network_to_dict(n) -> dict:
    return {
        "id":             n.id,
        "name":           n.name,
        "status":         n.status,
        "admin_state_up": n.is_admin_state_up,
        "shared":         n.is_shared,
        "subnets":        list(n.subnet_ids) if n.subnet_ids else [],
        "created_at":     str(n.created_at) if hasattr(n, "created_at") else None,
    }


def _subnet_to_dict(s) -> dict:
    return {
        "id":          s.id,
        "name":        s.name,
        "network_id":  s.network_id,
        "cidr":        s.cidr,
        "ip_version":  s.ip_version,
        "enable_dhcp": s.is_dhcp_enabled,
        "gateway_ip":  s.gateway_ip,
    }


def _sg_to_dict(sg) -> dict:
    return {
        "id":          sg.id,
        "name":        sg.name,
        "description": sg.description,
        "rules":       [
            {
                "id":              r.get("id"),
                "direction":       r.get("direction"),
                "protocol":        r.get("protocol"),
                "port_range_min":  r.get("port_range_min"),
                "port_range_max":  r.get("port_range_max"),
                "remote_ip_prefix": r.get("remote_ip_prefix"),
            }
            for r in (sg.security_group_rules or [])
        ],
    }
