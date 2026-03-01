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
  description = "Volume name"
  type        = string
}

variable "size_gb" {
  description = "Volume size in GB"
  type        = number
}

variable "volume_type" {
  description = "Cinder volume type (ax-fast, ax-standard, ax-archive)"
  type        = string
  default     = "ax-standard"
  validation {
    condition     = contains(["ax-fast", "ax-standard", "ax-archive"], var.volume_type)
    error_message = "volume_type must be ax-fast, ax-standard, or ax-archive"
  }
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "enable_backup" {
  description = "Tag volume for nightly automated snapshots"
  type        = bool
  default     = true
}

variable "instance_id" {
  description = "Instance ID to attach volume to (empty = detached volume)"
  type        = string
  default     = ""
}

variable "attach_device" {
  description = "Device path for volume attachment (e.g. /dev/vdb)"
  type        = string
  default     = "/dev/vdb"
}

# ── Resources ────────────────────────────────────────────────────────────────

resource "openstack_blockstorage_volume_v3" "this" {
  name        = "ax-${var.environment}-${var.name}-vol"
  size        = var.size_gb
  volume_type = var.volume_type

  metadata = {
    "ax:managed"  = "true"
    "ax:env"      = var.environment
    "ax:backup"   = tostring(var.enable_backup)
    "ax:terraform" = "true"
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "openstack_compute_volume_attach_v2" "this" {
  count       = var.instance_id != "" ? 1 : 0
  instance_id = var.instance_id
  volume_id   = openstack_blockstorage_volume_v3.this.id
  device      = var.attach_device
}

# ── Outputs ──────────────────────────────────────────────────────────────────

output "volume_id" {
  description = "ID of the created volume"
  value       = openstack_blockstorage_volume_v3.this.id
}

output "volume_name" {
  description = "Name of the created volume"
  value       = openstack_blockstorage_volume_v3.this.name
}
