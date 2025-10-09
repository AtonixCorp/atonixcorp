# Terraform variables for Kafka module

variable "namespace" {
  description = "Kubernetes namespace for Kafka deployment"
  type        = string
  default     = "default"
}

variable "broker_id" {
  description = "Kafka broker ID"
  type        = number
  default     = 1
}

variable "advertised_host" {
  description = "Advertised hostname for Kafka"
  type        = string
  default     = "kafka"
}

variable "zookeeper_connect" {
  description = "Zookeeper connection string"
  type        = string
  default     = "zookeeper:2181"
}

variable "zookeeper_service_name" {
  description = "Zookeeper service name"
  type        = string
  default     = "zookeeper"
}

variable "kafka_image" {
  description = "Kafka Docker image"
  type        = string
  default     = "confluentinc/cp-kafka:7.4.0"
}

variable "replicas" {
  description = "Number of Kafka replicas"
  type        = number
  default     = 1
}

variable "replication_factor" {
  description = "Default replication factor for topics"
  type        = number
  default     = 1
}

variable "min_isr" {
  description = "Minimum in-sync replicas"
  type        = number
  default     = 1
}

variable "default_partitions" {
  description = "Default number of partitions for topics"
  type        = number
  default     = 3
}

variable "log_retention_hours" {
  description = "Log retention in hours"
  type        = number
  default     = 168  # 7 days
}

variable "log_segment_bytes" {
  description = "Log segment size in bytes"
  type        = number
  default     = 1073741824  # 1GB
}

variable "message_max_bytes" {
  description = "Maximum message size in bytes"
  type        = number
  default     = 1000000  # 1MB
}

variable "replica_fetch_max_bytes" {
  description = "Maximum bytes for replica fetch"
  type        = number
  default     = 1048576  # 1MB
}

variable "auto_create_topics" {
  description = "Enable auto topic creation"
  type        = bool
  default     = true
}

variable "storage_class" {
  description = "Storage class for persistent volumes"
  type        = string
  default     = "standard"
}

variable "storage_size" {
  description = "Storage size for Kafka data"
  type        = string
  default     = "10Gi"
}

variable "enable_external_access" {
  description = "Enable external access to Kafka"
  type        = bool
  default     = false
}

variable "external_node_port" {
  description = "NodePort for external Kafka access"
  type        = number
  default     = 30092
}

variable "enable_monitoring" {
  description = "Enable Prometheus monitoring"
  type        = bool
  default     = true
}

variable "resources" {
  description = "Resource requests and limits for Kafka"
  type = object({
    requests = object({
      cpu    = string
      memory = string
    })
    limits = object({
      cpu    = string
      memory = string
    })
  })
  default = {
    requests = {
      cpu    = "500m"
      memory = "1Gi"
    }
    limits = {
      cpu    = "2"
      memory = "4Gi"
    }
  }
}