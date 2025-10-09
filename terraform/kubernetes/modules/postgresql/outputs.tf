output "service_name" {
  description = "Name of the PostgreSQL service"
  value       = kubernetes_service.postgresql.metadata[0].name
}

output "deployment_name" {
  description = "Name of the PostgreSQL deployment"
  value       = kubernetes_deployment.postgresql.metadata[0].name
}

output "secret_name" {
  description = "Name of the PostgreSQL secret"
  value       = kubernetes_secret.postgresql.metadata[0].name
}

output "pvc_name" {
  description = "Name of the PostgreSQL PVC"
  value       = kubernetes_persistent_volume_claim.postgresql.metadata[0].name
}

output "connection_url" {
  description = "PostgreSQL connection URL"
  value       = "postgresql://${var.username}:${random_password.postgres_password.result}@${kubernetes_service.postgresql.metadata[0].name}:5432/${var.database_name}"
  sensitive   = true
}

output "host" {
  description = "PostgreSQL host"
  value       = kubernetes_service.postgresql.metadata[0].name
}

output "port" {
  description = "PostgreSQL port"
  value       = 5432
}

output "database_name" {
  description = "PostgreSQL database name"
  value       = var.database_name
}

output "username" {
  description = "PostgreSQL username"
  value       = var.username
}

output "password" {
  description = "PostgreSQL password"
  value       = random_password.postgres_password.result
  sensitive   = true
}

output "service_fqdn" {
  description = "Fully qualified domain name of the PostgreSQL service"
  value       = "${kubernetes_service.postgresql.metadata[0].name}.${var.namespace}.svc.cluster.local"
}

output "metrics_port" {
  description = "Metrics port for monitoring"
  value       = 9187
}