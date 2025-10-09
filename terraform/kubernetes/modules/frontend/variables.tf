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
  description = "Frontend image repository"
  type        = string
}

variable "image_tag" {
  description = "Frontend image tag"
  type        = string
  default     = "latest"
}

variable "replicas" {
  description = "Number of frontend replicas"
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
  default     = 5
}

variable "api_url" {
  description = "Backend API URL"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
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
  description = "Resource limits for frontend"
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

variable "node_env" {
  description = "Node.js environment"
  type        = string
  default     = "production"
}