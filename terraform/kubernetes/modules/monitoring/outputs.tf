output "prometheus_service_name" {
  description = "Name of the Prometheus service"
  value       = kubernetes_service.prometheus.metadata[0].name
}

output "prometheus_deployment_name" {
  description = "Name of the Prometheus deployment"
  value       = kubernetes_deployment.prometheus.metadata[0].name
}

output "prometheus_pvc_name" {
  description = "Name of the Prometheus PVC"
  value       = kubernetes_persistent_volume_claim.prometheus.metadata[0].name
}

output "prometheus_url" {
  description = "Prometheus service URL"
  value       = "http://${kubernetes_service.prometheus.metadata[0].name}:9090"
}

output "grafana_admin_secret" {
  description = "Name of the Grafana admin secret"
  value       = kubernetes_secret.grafana.metadata[0].name
  sensitive   = true
}

output "grafana_admin_password" {
  description = "Grafana admin password"
  value       = local.grafana_password
  sensitive   = true
}

output "prometheus_config_map" {
  description = "Name of the Prometheus configuration ConfigMap"
  value       = kubernetes_config_map.prometheus_config.metadata[0].name
}

output "prometheus_rules_config_map" {
  description = "Name of the Prometheus rules ConfigMap"
  value       = kubernetes_config_map.prometheus_rules.metadata[0].name
}

output "prometheus_service_account" {
  description = "Name of the Prometheus service account"
  value       = kubernetes_service_account.prometheus.metadata[0].name
}

output "prometheus_cluster_role" {
  description = "Name of the Prometheus cluster role"
  value       = kubernetes_cluster_role.prometheus.metadata[0].name
}

output "prometheus_cluster_role_binding" {
  description = "Name of the Prometheus cluster role binding"
  value       = kubernetes_cluster_role_binding.prometheus.metadata[0].name
}

# Note: This simplified setup includes only Prometheus. In production,
# you would also include Grafana deployment and service outputs.
# For a complete monitoring stack, consider using the kube-prometheus-stack
# Helm chart instead of this custom setup.

output "grafana_service_name" {
  description = "Name of the Grafana service (placeholder)"
  value       = "${var.name_prefix}-grafana"
}

output "monitoring_endpoints" {
  description = "Monitoring service endpoints"
  value = {
    prometheus = "http://${kubernetes_service.prometheus.metadata[0].name}:9090"
    grafana    = "http://${var.name_prefix}-grafana:3000"  # Placeholder
  }
}

output "retention_period" {
  description = "Prometheus data retention period"
  value       = var.prometheus_retention
}

output "storage_size" {
  description = "Prometheus storage size"
  value       = var.prometheus_storage_size
}