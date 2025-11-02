variable "namespace" {
  description = "Kubernetes namespace"
  type        = string
}

variable "name_prefix" {
  description = "Name prefix for resources"
  type        = string
}

variable "domain_name" {
  description = "Domain name for ingress"
  type        = string
}

variable "tls_secret" {
  description = "Name of the TLS secret for HTTPS"
  type        = string
  default     = ""
}

variable "ingress_class" {
  description = "Ingress class to use"
  type        = string
  default     = "nginx"
}

variable "backend_service" {
  description = "Backend service name"
  type        = string
}

variable "frontend_service" {
  description = "Frontend service name"
  type        = string
}

<<<<<<< HEAD
=======
variable "ruby_service" {
  description = "Ruby service name"
  type        = string
}

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
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

variable "enable_rate_limiting" {
  description = "Enable rate limiting"
  type        = bool
  default     = true
}

variable "enable_compression" {
  description = "Enable gzip compression"
  type        = bool
  default     = true
}

variable "client_max_body_size" {
  description = "Maximum client body size"
  type        = string
  default     = "10m"
}

variable "ssl_redirect" {
  description = "Enable SSL redirect"
  type        = bool
  default     = true
<<<<<<< HEAD
}
=======
}
>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
