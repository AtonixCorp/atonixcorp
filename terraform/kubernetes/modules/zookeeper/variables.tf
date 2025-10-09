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
  default     = "10Gi"
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

variable "zookeeper_version" {
  description = "Zookeeper version"
  type        = string
  default     = "7.4.0"
}

variable "resource_limits" {
  description = "Resource limits for Zookeeper"
  type = object({
    cpu_request    = string
    cpu_limit      = string
    memory_request = string
    memory_limit   = string
  })
  default = {
    cpu_request    = "250m"
    cpu_limit      = "1000m"
    memory_request = "512Mi"
    memory_limit   = "2Gi"
  }
}

variable "client_port" {
  description = "Zookeeper client port"
  type        = number
  default     = 2181
}

variable "tick_time" {
  description = "Zookeeper tick time in milliseconds"
  type        = number
  default     = 2000
}

variable "init_limit" {
  description = "Zookeeper init limit"
  type        = number
  default     = 5
}

variable "sync_limit" {
  description = "Zookeeper sync limit"
  type        = number
  default     = 2
}

variable "max_client_connections" {
  description = "Maximum client connections"
  type        = number
  default     = 60
}

variable "autopurge_snap_retain_count" {
  description = "Number of snapshots to retain during autopurge"
  type        = number
  default     = 3
}

variable "autopurge_purge_interval" {
  description = "Autopurge interval in hours"
  type        = number
  default     = 24
}

variable "enable_jmx" {
  description = "Enable JMX for monitoring"
  type        = bool
  default     = true
}

variable "jmx_port" {
  description = "JMX port for monitoring"
  type        = number
  default     = 9999
}