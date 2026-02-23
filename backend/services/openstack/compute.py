# AtonixCorp – OpenStack Compute Service
#
# Wraps openstack.compute operations for servers (VMs) and flavors.
# Every public function opens its own connection so callers
# never manage connection lifecycle themselves.

import logging
from typing import Any

import openstack.exceptions

from infrastructure.openstack_conn import get_connection

logger = logging.getLogger(__name__)


# ── Servers ───────────────────────────────────────────────────────────────────

def list_servers() -> list[dict]:
    """
    List all servers visible to the authenticated project.
    Returns a list of plain dicts (safe to serialize to JSON).
    """
    conn = get_connection()
    servers = []
    for s in conn.compute.servers(details=True):
        servers.append(_server_to_dict(s))
    logger.info("list_servers returned %d results", len(servers))
    return servers


def get_server(server_id: str) -> dict | None:
    """Fetch a single server by ID. Returns None if not found."""
    conn = get_connection()
    server = conn.compute.find_server(server_id, ignore_missing=True)
    if server is None:
        return None
    return _server_to_dict(conn.compute.get_server(server.id))


def create_server(
    *,
    name: str,
    image_id: str,
    flavor_id: str,
    network_id: str,
    key_name: str | None = None,
    security_groups: list[str] | None = None,
    user_data: str | None = None,
    wait: bool = True,
    timeout: int = 300,
) -> dict:
    """
    Create a new VM and optionally wait for it to reach ACTIVE status.

    Args:
        name:            Display name of the server.
        image_id:        OpenStack image UUID.
        flavor_id:       OpenStack flavor UUID.
        network_id:      Network UUID to attach on boot.
        key_name:        Name of an existing keypair (optional).
        security_groups: List of security group names (optional).
        user_data:       Cloud-init script, base64 or plain text (optional).
        wait:            Block until server reaches ACTIVE (default True).
        timeout:         Seconds to wait before raising TimeoutError.

    Returns:
        Plain dict representation of the created server.
    """
    conn = get_connection()

    server_kwargs: dict[str, Any] = {
        "name":     name,
        "image_id": image_id,
        "flavor_id": flavor_id,
        "networks": [{"uuid": network_id}],
    }
    if key_name:
        server_kwargs["key_name"] = key_name
    if security_groups:
        server_kwargs["security_groups"] = [{"name": sg} for sg in security_groups]
    if user_data:
        server_kwargs["user_data"] = user_data

    logger.info("Creating server name=%s image=%s flavor=%s network=%s", name, image_id, flavor_id, network_id)
    server = conn.compute.create_server(**server_kwargs)

    if wait:
        server = conn.compute.wait_for_server(server, timeout=timeout)
        logger.info("Server %s reached status %s", server.id, server.status)

    return _server_to_dict(server)


def delete_server(server_id: str) -> None:
    """Delete a server by ID. Silently succeeds if already gone."""
    conn = get_connection()
    conn.compute.delete_server(server_id, ignore_missing=True)
    logger.info("Deleted server %s", server_id)


def start_server(server_id: str) -> None:
    """Start a SHUTOFF server."""
    conn = get_connection()
    conn.compute.start_server(server_id)
    logger.info("Started server %s", server_id)


def stop_server(server_id: str) -> None:
    """Stop (SHUTOFF) a running server."""
    conn = get_connection()
    conn.compute.stop_server(server_id)
    logger.info("Stopped server %s", server_id)


def reboot_server(server_id: str, reboot_type: str = "SOFT") -> None:
    """Reboot a server. reboot_type: 'SOFT' or 'HARD'."""
    conn = get_connection()
    conn.compute.reboot_server(server_id, reboot_type=reboot_type)
    logger.info("Rebooted server %s (%s)", server_id, reboot_type)


# ── Flavors ───────────────────────────────────────────────────────────────────

def list_flavors() -> list[dict]:
    """List all available compute flavors."""
    conn = get_connection()
    return [_flavor_to_dict(f) for f in conn.compute.flavors()]


def get_flavor(flavor_id: str) -> dict | None:
    """Fetch a single flavor by ID or name. Returns None if not found."""
    conn = get_connection()
    flavor = conn.compute.find_flavor(flavor_id, ignore_missing=True)
    return _flavor_to_dict(flavor) if flavor else None


# ── Images (read-only shortcut via Compute API) ────────────────────────────────

def list_images() -> list[dict]:
    """List all images from the Image service (via Glance)."""
    conn = get_connection()
    return [
        {
            "id":          img.id,
            "name":        img.name,
            "status":      img.status,
            "os_type":     img.properties.get("os_type") if img.properties else None,
            "size_gb":     round((img.size or 0) / (1024 ** 3), 2),
            "min_disk_gb": img.min_disk,
            "visibility":  img.visibility,
            "created_at":  str(img.created_at),
        }
        for img in conn.image.images()
    ]


# ── Private helpers ────────────────────────────────────────────────────────────

def _server_to_dict(s) -> dict:
    addresses = {}
    if hasattr(s, "addresses") and s.addresses:
        for net, addrs in s.addresses.items():
            addresses[net] = [a.get("addr") for a in addrs]
    return {
        "id":           s.id,
        "name":         s.name,
        "status":       s.status,
        "flavor_id":    s.flavor.get("id") if isinstance(s.flavor, dict) else getattr(s, "flavor_id", None),
        "image_id":     s.image.get("id") if isinstance(s.image, dict) else getattr(s, "image_id", None),
        "addresses":    addresses,
        "key_name":     getattr(s, "key_name", None),
        "created_at":   str(s.created_at) if hasattr(s, "created_at") else None,
        "updated_at":   str(s.updated_at) if hasattr(s, "updated_at") else None,
        "availability_zone": getattr(s, "availability_zone", None),
        "power_state":  getattr(s, "power_state", None),
    }


def _flavor_to_dict(f) -> dict:
    return {
        "id":         f.id,
        "name":       f.name,
        "vcpus":      f.vcpus,
        "memory_mb":  f.ram,
        "disk_gb":    f.disk,
        "is_public":  f.is_public,
        "extra_specs": dict(f.extra_specs) if hasattr(f, "extra_specs") else {},
    }
