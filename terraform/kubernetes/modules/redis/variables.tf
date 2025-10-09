variable "namespace" {
  description = "Kubernetes namespace"
  type        = string
}

variable "name_prefix" {
  description = "Name prefix for resources"
  type        = string
}

variable "storage_class" {
  description = "Storage class for persistent volume"
  type        = string
  default     = "standard"
}

variable "storage_size" {
  description = "Storage size for persistent volume"
  type        = string
  default     = "5Gi"
}

variable "labels" {
  description = "Labels to apply to resources"
  type        = map(string)
  default     = {}
}

variable "annotations" {
  description = "Annotations to apply to resources"
  type        = map(string)
  default     = {}
}

variable "redis_version" {
  description = "Redis version"
  type        = string
  default     = "7-alpine"
}

variable "resource_limits" {
  description = "Resource limits for Redis"
  type = object({
    cpu_request    = string
    cpu_limit      = string
    memory_request = string
    memory_limit   = string
  })
  default = {
    cpu_request    = "100m"
    cpu_limit      = "500m"
    memory_request = "256Mi"
    memory_limit   = "1Gi"
  }
}

variable "maxmemory_policy" {
  description = "Redis maxmemory policy"
  type        = string
  default     = "allkeys-lru"
}

variable "enable_persistence" {
  description = "Enable Redis persistence"
  type        = bool
  default     = true
}

variable "enable_monitoring" {
  description = "Enable Redis monitoring and ServiceMonitor"
  type        = bool
  default     = false
}