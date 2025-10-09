output "service_name" {
  description = "Name of the Redis service"
  value       = kubernetes_service.redis.metadata[0].name
}

output "deployment_name" {
  description = "Name of the Redis deployment"
  value       = kubernetes_deployment.redis.metadata[0].name
}

output "pvc_name" {
  description = "Name of the Redis PVC"
  value       = var.enable_persistence ? kubernetes_persistent_volume_claim.redis[0].metadata[0].name : null
}

output "connection_url" {
  description = "Redis connection URL"
  value       = "redis://${kubernetes_service.redis.metadata[0].name}:6379"
}

output "host" {
  description = "Redis host"
  value       = kubernetes_service.redis.metadata[0].name
}

output "port" {
  description = "Redis port"
  value       = 6379
}

output "service_fqdn" {
  description = "Fully qualified domain name of the Redis service"
  value       = "${kubernetes_service.redis.metadata[0].name}.${var.namespace}.svc.cluster.local"
}

output "metrics_port" {
  description = "Metrics port for monitoring"
  value       = 9121
}

output "config_map_name" {
  description = "Name of the Redis ConfigMap"
  value       = kubernetes_config_map.redis.metadata[0].name
}