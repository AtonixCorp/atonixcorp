output "service_name" {
  description = "Name of the frontend service"
  value       = kubernetes_service.frontend.metadata[0].name
}

output "deployment_name" {
  description = "Name of the frontend deployment"
  value       = kubernetes_deployment.frontend.metadata[0].name
}

output "configmap_name" {
  description = "Name of the frontend ConfigMap"
  value       = kubernetes_config_map.frontend.metadata[0].name
}

output "endpoints" {
  description = "Frontend service endpoints"
  value = {
    health  = "/health"
    app     = "/"
    api     = "/api/"
    admin   = "/admin/"
  }
}

output "service_fqdn" {
  description = "Fully qualified domain name of the frontend service"
  value       = "${kubernetes_service.frontend.metadata[0].name}.${var.namespace}.svc.cluster.local"
}

output "port" {
  description = "Frontend service port"
  value       = 80
}

output "metrics_port" {
  description = "Metrics port for monitoring"
  value       = 9113
}

output "hpa_name" {
  description = "Name of the HPA resource"
  value       = kubernetes_horizontal_pod_autoscaler_v2.frontend.metadata[0].name
}

output "pdb_name" {
  description = "Name of the Pod Disruption Budget"
  value       = kubernetes_pod_disruption_budget_v1.frontend.metadata[0].name
}