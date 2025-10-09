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
  description = "Backend image repository (same as backend)"
  type        = string
}

variable "image_tag" {
  description = "Backend image tag (same as backend)"
  type        = string
  default     = "latest"
}

variable "worker_replicas" {
  description = "Number of Celery worker replicas"
  type        = number
  default     = 2
}

variable "worker_min_replicas" {
  description = "Minimum number of worker replicas for HPA"
  type        = number
  default     = 1
}

variable "worker_max_replicas" {
  description = "Maximum number of worker replicas for HPA"
  type        = number
  default     = 8
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
  description = "Resource limits for Celery"
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

variable "worker_concurrency" {
  description = "Number of concurrent workers per pod"
  type        = number
  default     = 4
}

variable "worker_log_level" {
  description = "Celery worker log level"
  type        = string
  default     = "INFO"
}