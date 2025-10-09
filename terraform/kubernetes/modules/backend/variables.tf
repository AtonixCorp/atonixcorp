variable "namespace" {
  description = "Kubernetes namespace"
  type        = string
}

variable "name_prefix" {
  description = "Name prefix for resources"
  type        = string
}

variable "image_registry" {
  description = "Container image registry"
  type        = string
  default     = "ghcr.io"
}

variable "image_repository" {
  description = "Backend image repository"
  type        = string
}

variable "image_tag" {
  description = "Backend image tag"
  type        = string
  default     = "latest"
}

variable "replicas" {
  description = "Number of backend replicas"
  type        = number
  default     = 2
}

variable "min_replicas" {
  description = "Minimum number of replicas for HPA"
  type        = number
  default     = 1
}

variable "max_replicas" {
  description = "Maximum number of replicas for HPA"
  type        = number
  default     = 10
}

variable "database_url" {
  description = "Database connection URL"
  type        = string
  sensitive   = true
}

variable "redis_url" {
  description = "Redis connection URL"
  type        = string
}

variable "zookeeper_url" {
  description = "Zookeeper connection URL"
  type        = string
}

variable "secret_key" {
  description = "Django secret key"
  type        = string
  sensitive   = true
}

variable "allowed_hosts" {
  description = "Django allowed hosts"
  type        = list(string)
  default     = ["*"]
}

variable "cors_origins" {
  description = "CORS allowed origins"
  type        = list(string)
  default     = []
}

variable "storage_class" {
  description = "Storage class for media files"
  type        = string
  default     = "standard"
}

variable "media_size" {
  description = "Storage size for media files"
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

variable "resource_limits" {
  description = "Resource limits for backend"
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

variable "debug" {
  description = "Enable Django debug mode"
  type        = bool
  default     = false
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}