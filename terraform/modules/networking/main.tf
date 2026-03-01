terraform {
  required_providers {
    openstack = {
      source  = "terraform-provider-openstack/openstack"
      version = "~> 1.54"
    }
  }
}

# ── Variables ────────────────────────────────────────────────────────────────

variable "name" {
  description = "Name prefix for all network resources"
  type        = string
}

variable "cidr" {
  description = "Subnet CIDR block"
  type        = string
  default     = "10.10.0.0/24"
}

variable "environment" {
  description = "Deployment environment (production, staging, development)"
  type        = string
  validation {
    condition     = contains(["production", "staging", "development"], var.environment)
    error_message = "environment must be one of: production, staging, development"
  }
}

variable "dns_nameservers" {
  description = "DNS nameservers for the subnet"
  type        = list(string)
  default     = ["1.1.1.1", "8.8.8.8"]
}

variable "external_network_name" {
  description = "Name of the external (provider) network for the router gateway"
  type        = string
  default     = "ax-provider"
}

variable "enable_floating_ip" {
  description = "Allocate a floating IP for this network's router"
  type        = bool
  default     = false
}

# ── Resources ────────────────────────────────────────────────────────────────

resource "openstack_networking_network_v2" "this" {
  name           = "ax-${var.environment}-${var.name}-net"
  admin_state_up = true
  tags           = ["ax:managed=true", "ax:env=${var.environment}"]
}

resource "openstack_networking_subnet_v2" "this" {
  name            = "ax-${var.environment}-${var.name}-subnet"
  network_id      = openstack_networking_network_v2.this.id
  cidr            = var.cidr
  ip_version      = 4
  dns_nameservers = var.dns_nameservers
}

data "openstack_networking_network_v2" "external" {
  name = var.external_network_name
}

resource "openstack_networking_router_v2" "this" {
  name                = "ax-${var.environment}-${var.name}-router"
  external_network_id = data.openstack_networking_network_v2.external.id
}

resource "openstack_networking_router_interface_v2" "this" {
  router_id = openstack_networking_router_v2.this.id
  subnet_id = openstack_networking_subnet_v2.this.id
}

# ── Standard security groups ─────────────────────────────────────────────────

resource "openstack_networking_secgroup_v2" "web" {
  name        = "ax-${var.environment}-${var.name}-sg-web"
  description = "HTTP/HTTPS ingress"
}

resource "openstack_networking_secgroup_rule_v2" "http" {
  direction         = "ingress"
  ethertype         = "IPv4"
  protocol          = "tcp"
  port_range_min    = 80
  port_range_max    = 80
  remote_ip_prefix  = "0.0.0.0/0"
  security_group_id = openstack_networking_secgroup_v2.web.id
}

resource "openstack_networking_secgroup_rule_v2" "https" {
  direction         = "ingress"
  ethertype         = "IPv4"
  protocol          = "tcp"
  port_range_min    = 443
  port_range_max    = 443
  remote_ip_prefix  = "0.0.0.0/0"
  security_group_id = openstack_networking_secgroup_v2.web.id
}

resource "openstack_networking_secgroup_v2" "ssh_internal" {
  name        = "ax-${var.environment}-${var.name}-sg-ssh"
  description = "SSH from management CIDR only"
}

resource "openstack_networking_secgroup_rule_v2" "ssh" {
  direction         = "ingress"
  ethertype         = "IPv4"
  protocol          = "tcp"
  port_range_min    = 22
  port_range_max    = 22
  remote_ip_prefix  = "10.0.0.0/8"
  security_group_id = openstack_networking_secgroup_v2.ssh_internal.id
}

# ── Outputs ──────────────────────────────────────────────────────────────────

output "network_id" {
  description = "ID of the created network"
  value       = openstack_networking_network_v2.this.id
}

output "subnet_id" {
  description = "ID of the created subnet"
  value       = openstack_networking_subnet_v2.this.id
}

output "router_id" {
  description = "ID of the created router"
  value       = openstack_networking_router_v2.this.id
}

output "sg_web_id" {
  description = "ID of the web security group (HTTP/HTTPS)"
  value       = openstack_networking_secgroup_v2.web.id
}

output "sg_ssh_id" {
  description = "ID of the SSH (internal) security group"
  value       = openstack_networking_secgroup_v2.ssh_internal.id
}
