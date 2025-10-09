output "service_name" {
  description = "Name of the backend service"
  value       = kubernetes_service.backend.metadata[0].name
}

output "deployment_name" {
  description = "Name of the backend deployment"
  value       = kubernetes_deployment.backend.metadata[0].name
}

output "secret_name" {
  description = "Name of the backend secret"
  value       = kubernetes_secret.backend.metadata[0].name
}

output "configmap_name" {
  description = "Name of the backend ConfigMap"
  value       = kubernetes_config_map.backend.metadata[0].name
}

output "media_pvc_name" {
  description = "Name of the media files PVC"
  value       = kubernetes_persistent_volume_claim.media.metadata[0].name
}

output "endpoints" {
  description = "Backend service endpoints"
  value = {
    health = "/api/health/"
    ready  = "/api/ready/"
    admin  = "/admin/"
    api    = "/api/"
  }
}

output "service_fqdn" {
  description = "Fully qualified domain name of the backend service"
  value       = "${kubernetes_service.backend.metadata[0].name}.${var.namespace}.svc.cluster.local"
}

output "port" {
  description = "Backend service port"
  value       = 8000
}

output "hpa_name" {
  description = "Name of the HPA resource"
  value       = kubernetes_horizontal_pod_autoscaler_v2.backend.metadata[0].name
}

output "pdb_name" {
  description = "Name of the Pod Disruption Budget"
  value       = kubernetes_pod_disruption_budget_v1.backend.metadata[0].name
}