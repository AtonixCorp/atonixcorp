variable "namespace" {
  description = "Kubernetes namespace"
  type        = string
}

variable "name_prefix" {
  description = "Name prefix for resources"
  type        = string
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

variable "prometheus_retention" {
  description = "Prometheus data retention period"
  type        = string
  default     = "15d"
}

variable "prometheus_storage_size" {
  description = "Prometheus storage size"
  type        = string
  default     = "50Gi"
}

variable "grafana_admin_password" {
  description = "Grafana admin password"
  type        = string
  default     = ""
  sensitive   = true
}

variable "storage_class" {
  description = "Storage class for persistent volumes"
  type        = string
  default     = "standard"
}

variable "enable_alertmanager" {
  description = "Enable Alertmanager"
  type        = bool
  default     = true
}

variable "slack_webhook_url" {
  description = "Slack webhook URL for alerts"
  type        = string
  default     = ""
  sensitive   = true
}

variable "email_smtp_host" {
  description = "SMTP host for email alerts"
  type        = string
  default     = ""
}

variable "email_smtp_port" {
  description = "SMTP port for email alerts"
  type        = number
  default     = 587
}

variable "email_smtp_username" {
  description = "SMTP username for email alerts"
  type        = string
  default     = ""
}

variable "email_smtp_password" {
  description = "SMTP password for email alerts"
  type        = string
  default     = ""
  sensitive   = true
}

variable "alert_email_to" {
  description = "Email address to send alerts to"
  type        = string
  default     = ""
}