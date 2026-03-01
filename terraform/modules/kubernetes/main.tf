terraform {
  required_providers {
    openstack = {
      source  = "terraform-provider-openstack/openstack"
      version = "~> 1.54"
    }
  }
}

# ── Variables ────────────────────────────────────────────────────────────────

variable "cluster_name" {
  description = "Kubernetes cluster name"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  validation {
    condition     = contains(["production", "staging", "development"], var.environment)
    error_message = "environment must be one of: production, staging, development"
  }
}

variable "control_plane_count" {
  description = "Number of control plane (master) nodes"
  type        = number
  default     = 3
}

variable "worker_count" {
  description = "Number of worker nodes"
  type        = number
  default     = 3
}

variable "control_plane_flavor" {
  description = "Flavor for control plane nodes"
  type        = string
  default     = "ax.standard.large"
}

variable "worker_flavor" {
  description = "Flavor for worker nodes"
  type        = string
  default     = "ax.standard.large"
}

variable "k8s_image" {
  description = "Glance image for Kubernetes nodes"
  type        = string
  default     = "ax-k8s-node-1.29-amd64-202602"
}

variable "network_id" {
  description = "Network ID for Kubernetes nodes"
  type        = string
}

variable "subnet_id" {
  description = "Subnet ID for load balancer (control plane API endpoint)"
  type        = string
}

# ── Control Plane Nodes ───────────────────────────────────────────────────────

module "control_plane" {
  source         = "../compute"
  name           = "${var.cluster_name}-cp"
  instance_count = var.control_plane_count
  flavor         = var.control_plane_flavor
  image          = var.k8s_image
  network_id     = var.network_id
  environment    = var.environment
  role           = "k8s_node"
  volume_size    = 100
}

# ── Worker Nodes ─────────────────────────────────────────────────────────────

module "workers" {
  source         = "../compute"
  name           = "${var.cluster_name}-worker"
  instance_count = var.worker_count
  flavor         = var.worker_flavor
  image          = var.k8s_image
  network_id     = var.network_id
  environment    = var.environment
  role           = "k8s_node"
  volume_size    = 100
}

# ── API Server Load Balancer ─────────────────────────────────────────────────

module "api_lb" {
  source       = "../loadbalancer"
  name         = "${var.cluster_name}-api"
  subnet_id    = var.subnet_id
  protocol     = "TCP"
  port         = 6443
  backend_port = 6443
  backend_ips  = module.control_plane.instance_ips
  environment  = var.environment
}

# ── Outputs ──────────────────────────────────────────────────────────────────

output "control_plane_ips" {
  description = "Control plane node IPs"
  value       = module.control_plane.instance_ips
}

output "worker_ips" {
  description = "Worker node IPs"
  value       = module.workers.instance_ips
}

output "api_endpoint" {
  description = "Kubernetes API server endpoint"
  value       = "https://${module.api_lb.vip_address}:6443"
}
