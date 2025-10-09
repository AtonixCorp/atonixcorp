# Terraform outputs for Kafka module

output "kafka_service_name" {
  description = "Name of the Kafka service"
  value       = kubernetes_service.kafka_service.metadata[0].name
}

output "kafka_service_port" {
  description = "Port of the Kafka service"
  value       = 9092
}

output "kafka_bootstrap_servers" {
  description = "Kafka bootstrap servers connection string"
  value       = "${kubernetes_service.kafka_service.metadata[0].name}:9092"
}

output "kafka_external_service_name" {
  description = "Name of the external Kafka service"
  value       = var.enable_external_access ? kubernetes_service.kafka_external[0].metadata[0].name : null
}

output "kafka_external_node_port" {
  description = "NodePort for external Kafka access"
  value       = var.enable_external_access ? var.external_node_port : null
}

output "kafka_jmx_port" {
  description = "JMX port for monitoring"
  value       = 9101
}

output "kafka_config_map_name" {
  description = "Name of the Kafka ConfigMap"
  value       = kubernetes_config_map.kafka_config.metadata[0].name
}