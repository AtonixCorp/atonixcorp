# Terraform outputs for RabbitMQ module

output "rabbitmq_service_name" {
  description = "Name of the RabbitMQ service"
  value       = kubernetes_service.rabbitmq_headless.metadata[0].name
}

output "rabbitmq_amqp_port" {
  description = "AMQP port of the RabbitMQ service"
  value       = 5672
}

output "rabbitmq_management_port" {
  description = "Management UI port of the RabbitMQ service"
  value       = 15672
}

output "rabbitmq_connection_url" {
  description = "RabbitMQ connection URL"
  value       = "amqp://${var.rabbitmq_username}:${var.rabbitmq_password}@${kubernetes_service.rabbitmq_headless.metadata[0].name}:5672/${var.default_vhost}"
  sensitive   = true
}

output "rabbitmq_management_url" {
  description = "RabbitMQ management UI URL"
  value       = "http://${kubernetes_service.rabbitmq_headless.metadata[0].name}:15672"
}

output "rabbitmq_external_service_name" {
  description = "Name of the external RabbitMQ service"
  value       = var.enable_external_access ? kubernetes_service.rabbitmq_external[0].metadata[0].name : null
}

output "rabbitmq_external_amqp_port" {
  description = "External AMQP port"
  value       = var.enable_external_access ? var.amqp_node_port : null
}

output "rabbitmq_external_management_port" {
  description = "External management port"
  value       = var.enable_external_access ? var.management_node_port : null
}

output "rabbitmq_prometheus_port" {
  description = "Prometheus metrics port"
  value       = 15692
}

output "rabbitmq_secret_name" {
  description = "Name of the RabbitMQ secret"
  value       = kubernetes_secret.rabbitmq_secret.metadata[0].name
}