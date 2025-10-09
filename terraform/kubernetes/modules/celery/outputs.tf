output "worker_deployment_name" {
  description = "Name of the Celery worker deployment"
  value       = kubernetes_deployment.celery_worker.metadata[0].name
}

output "beat_deployment_name" {
  description = "Name of the Celery beat deployment"
  value       = kubernetes_deployment.celery_beat.metadata[0].name
}

output "metrics_service_name" {
  description = "Name of the Celery metrics service"
  value       = kubernetes_service.celery_metrics.metadata[0].name
}

output "secret_name" {
  description = "Name of the Celery secret"
  value       = kubernetes_secret.celery.metadata[0].name
}

output "configmap_name" {
  description = "Name of the Celery ConfigMap"
  value       = kubernetes_config_map.celery.metadata[0].name
}

output "hpa_name" {
  description = "Name of the Celery worker HPA"
  value       = kubernetes_horizontal_pod_autoscaler_v2.celery_worker.metadata[0].name
}

output "metrics_port" {
  description = "Metrics port for monitoring"
  value       = 8080
}

output "worker_replicas" {
  description = "Current number of worker replicas"
  value       = var.worker_replicas
}

output "beat_replicas" {
  description = "Number of beat scheduler replicas (always 1)"
  value       = 1
}