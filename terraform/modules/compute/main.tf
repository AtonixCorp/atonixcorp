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
  description = "Name prefix for compute resources"
  type        = string
}

variable "instance_count" {
  description = "Number of VM instances to create"
  type        = number
  default     = 1
}

variable "flavor" {
  description = "OpenStack flavor name (e.g. ax.standard.medium)"
  type        = string
  default     = "ax.standard.medium"
}

variable "image" {
  description = "Glance image name (e.g. ax-ubuntu-2204-amd64-202602)"
  type        = string
}

variable "network_id" {
  description = "OpenStack network ID to attach instances to"
  type        = string
}

variable "security_group_ids" {
  description = "List of security group IDs to attach"
  type        = list(string)
  default     = []
}

variable "keypair_name" {
  description = "Name of the OpenStack keypair for SSH access"
  type        = string
  default     = "ax-default-key"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  validation {
    condition     = contains(["production", "staging", "development"], var.environment)
    error_message = "environment must be one of: production, staging, development"
  }
}

variable "role" {
  description = "VM role tag (e.g. web, k8s_node, storage, monitoring)"
  type        = string
  default     = "general"
}

variable "user_data" {
  description = "Cloud-init user data script"
  type        = string
  default     = ""
}

variable "volume_size" {
  description = "Boot volume size in GB (0 = use image default)"
  type        = number
  default     = 0
}

# ── Data ─────────────────────────────────────────────────────────────────────

data "openstack_images_image_v2" "this" {
  name        = var.image
  most_recent = true
}

# ── Resources ────────────────────────────────────────────────────────────────

resource "openstack_compute_instance_v2" "this" {
  count           = var.instance_count
  name            = "ax-${var.environment}-${var.name}-${count.index + 1}"
  flavor_name     = var.flavor
  key_pair        = var.keypair_name
  security_groups = var.security_group_ids
  user_data       = var.user_data

  metadata = {
    "ax:managed"     = "true"
    "ax:env"         = var.environment
    "ax:role"        = var.role
    "ax:terraform"   = "true"
  }

  dynamic "block_device" {
    for_each = var.volume_size > 0 ? [1] : []
    content {
      uuid                  = data.openstack_images_image_v2.this.id
      source_type           = "image"
      destination_type      = "volume"
      volume_size           = var.volume_size
      boot_index            = 0
      delete_on_termination = true
    }
  }

  dynamic "block_device" {
    for_each = var.volume_size == 0 ? [1] : []
    content {
      uuid                  = data.openstack_images_image_v2.this.id
      source_type           = "image"
      destination_type      = "local"
      boot_index            = 0
      delete_on_termination = true
    }
  }

  network {
    uuid = var.network_id
  }

  lifecycle {
    ignore_changes = [user_data]
  }
}

# ── Outputs ──────────────────────────────────────────────────────────────────

output "instance_ids" {
  description = "IDs of created instances"
  value       = openstack_compute_instance_v2.this[*].id
}

output "instance_ips" {
  description = "Fixed IPs of created instances"
  value = [
    for inst in openstack_compute_instance_v2.this :
    inst.network[0].fixed_ip_v4
  ]
}

output "instance_names" {
  description = "Names of created instances"
  value       = openstack_compute_instance_v2.this[*].name
}
