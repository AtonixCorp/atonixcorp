import base64
import hashlib
import logging
from typing import Any

from infrastructure.openstack_conn import is_openstack_configured
from . import compute as openstack_compute
from . import network as openstack_network

logger = logging.getLogger(__name__)


def _build_kubeconfig(cluster_name: str, api_endpoint: str) -> str:
    kubeconfig = f"""apiVersion: v1
kind: Config
clusters:
- name: {cluster_name}
  cluster:
    server: {api_endpoint}
    insecure-skip-tls-verify: true
contexts:
- name: {cluster_name}-context
  context:
    cluster: {cluster_name}
    user: {cluster_name}-admin
current-context: {cluster_name}-context
users:
- name: {cluster_name}-admin
  user:
    token: atonix-demo-token
"""
    return base64.b64encode(kubeconfig.encode("utf-8")).decode("utf-8")


def provision_kubernetes_cluster(*, cluster_name: str, node_count: int, region: str, kubernetes_version: str) -> dict[str, Any]:
    """
    Provisions infrastructure backing a K8s cluster using OpenStack when available.
    Falls back to simulated provisioning when OpenStack is not configured.
    """
    api_endpoint = f"https://{cluster_name}.k8s.{region}.atonixcorp.cloud:6443"
    kubeconfig = _build_kubeconfig(cluster_name, api_endpoint)

    if not is_openstack_configured():
        nodes = [
            {
                "node_name": f"{cluster_name}-node-{index + 1}",
                "instance_id": f"sim-{cluster_name}-{index + 1}",
                "status": "ready",
                "cpu_allocatable": 4,
                "memory_allocatable_mb": 8192,
                "pods_allocatable": 110,
            }
            for index in range(node_count)
        ]
        return {
            "provider": "simulated",
            "api_endpoint": api_endpoint,
            "kubeconfig": kubeconfig,
            "nodes": nodes,
        }

    try:
        networks = openstack_network.list_networks()
        images = openstack_compute.list_images()
        flavors = openstack_compute.list_flavors()

        if not networks or not images or not flavors:
            raise ValueError("OpenStack returned no networks/images/flavors for cluster provisioning")

        network_id = networks[0]["id"]
        image_id = images[0]["id"]
        flavor_id = flavors[0]["id"]

        nodes = []
        for index in range(node_count):
            node_name = f"{cluster_name}-node-{index + 1}"
            server = openstack_compute.create_server(
                name=node_name,
                image_id=image_id,
                flavor_id=flavor_id,
                network_id=network_id,
                wait=False,
            )
            nodes.append(
                {
                    "node_name": node_name,
                    "instance_id": server["id"],
                    "status": "ready",
                    "cpu_allocatable": 4,
                    "memory_allocatable_mb": 8192,
                    "pods_allocatable": 110,
                }
            )

        return {
            "provider": "openstack",
            "api_endpoint": api_endpoint,
            "kubeconfig": kubeconfig,
            "nodes": nodes,
        }
    except Exception as exc:
        logger.warning("OpenStack K8s provisioning failed, using simulated fallback: %s", exc)
        nodes = [
            {
                "node_name": f"{cluster_name}-node-{index + 1}",
                "instance_id": f"fallback-{cluster_name}-{index + 1}",
                "status": "ready",
                "cpu_allocatable": 4,
                "memory_allocatable_mb": 8192,
                "pods_allocatable": 110,
            }
            for index in range(node_count)
        ]
        return {
            "provider": "simulated-fallback",
            "api_endpoint": api_endpoint,
            "kubeconfig": kubeconfig,
            "nodes": nodes,
        }


def deploy_kubernetes_manifest(*, cluster_name: str, manifest_yaml: str) -> dict[str, Any]:
    manifest_hash = hashlib.sha256(manifest_yaml.encode("utf-8")).hexdigest()
    return {
        "cluster": cluster_name,
        "manifest_hash": manifest_hash,
        "status": "accepted",
        "resources_created": ["deployment/webapp"],
    }


def deploy_serverless_function(*, function_name: str, runtime: str, code_uri: str) -> dict[str, Any]:
    endpoint = f"https://functions.atonixcorp.cloud/{function_name}"
    return {
        "provider": "knative-simulated",
        "endpoint": endpoint,
        "image": code_uri,
        "runtime": runtime,
        "status": "active",
    }


def invoke_serverless_function(*, endpoint: str, payload: dict[str, Any]) -> dict[str, Any]:
    return {
        "endpoint": endpoint,
        "status_code": 200,
        "result": {"ok": True, "echo": payload},
    }
