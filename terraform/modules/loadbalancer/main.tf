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
  description = "Load balancer name"
  type        = string
}

variable "subnet_id" {
  description = "Subnet ID for the load balancer VIP"
  type        = string
}

variable "protocol" {
  description = "Listener protocol (HTTP, HTTPS, TCP, TERMINATED_HTTPS)"
  type        = string
  default     = "HTTP"
}

variable "port" {
  description = "Listener port"
  type        = number
  default     = 80
}

variable "backend_port" {
  description = "Backend pool member port"
  type        = number
  default     = 8080
}

variable "backend_ips" {
  description = "List of backend member IP addresses"
  type        = list(string)
}

variable "algorithm" {
  description = "Load balancing algorithm (ROUND_ROBIN, LEAST_CONNECTIONS, SOURCE_IP)"
  type        = string
  default     = "ROUND_ROBIN"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "health_check_path" {
  description = "HTTP health check path (HTTP/HTTPS only)"
  type        = string
  default     = "/healthz"
}

# ── Resources ────────────────────────────────────────────────────────────────

resource "openstack_lb_loadbalancer_v2" "this" {
  name          = "ax-${var.environment}-${var.name}-lb"
  vip_subnet_id = var.subnet_id
}

resource "openstack_lb_listener_v2" "this" {
  name            = "ax-${var.environment}-${var.name}-listener"
  protocol        = var.protocol
  protocol_port   = var.port
  loadbalancer_id = openstack_lb_loadbalancer_v2.this.id

  insert_headers = var.protocol == "TERMINATED_HTTPS" || var.protocol == "HTTP" ? {
    X-Forwarded-For  = "true"
    X-Forwarded-Port = "true"
  } : {}
}

resource "openstack_lb_pool_v2" "this" {
  name        = "ax-${var.environment}-${var.name}-pool"
  protocol    = var.protocol == "TERMINATED_HTTPS" ? "HTTP" : var.protocol
  lb_method   = var.algorithm
  listener_id = openstack_lb_listener_v2.this.id
}

resource "openstack_lb_members_v2" "this" {
  pool_id = openstack_lb_pool_v2.this.id

  dynamic "member" {
    for_each = var.backend_ips
    content {
      address       = member.value
      protocol_port = var.backend_port
    }
  }
}

resource "openstack_lb_monitor_v2" "this" {
  count       = contains(["HTTP", "HTTPS", "TERMINATED_HTTPS"], var.protocol) ? 1 : 0
  pool_id     = openstack_lb_pool_v2.this.id
  type        = "HTTP"
  delay       = 5
  timeout     = 5
  max_retries = 3
  url_path    = var.health_check_path
  http_method = "GET"
  expected_codes = "200-299"
}

# ── Outputs ──────────────────────────────────────────────────────────────────

output "lb_id" {
  description = "Load balancer ID"
  value       = openstack_lb_loadbalancer_v2.this.id
}

output "vip_address" {
  description = "VIP (virtual IP) address of the load balancer"
  value       = openstack_lb_loadbalancer_v2.this.vip_address
}
