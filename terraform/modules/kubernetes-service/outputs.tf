# Kubernetes Service Module - outputs.tf

output "deployment_name" {
  description = "Name of the Kubernetes deployment"
  value       = kubernetes_deployment.service.metadata[0].name
}

output "service_name" {
  description = "Name of the Kubernetes service"
  value       = kubernetes_service.service.metadata[0].name
}

output "service_endpoint" {
  description = "Service endpoint (DNS name)"
  value       = kubernetes_service.service.spec[0].cluster_ip
}

output "service_port" {
  description = "Service port"
  value       = kubernetes_service.service.spec[0].port[0].port
}

output "service_fqdn" {
  description = "Fully qualified domain name for service"
  value       = "${kubernetes_service.service.metadata[0].name}.${kubernetes_service.service.metadata[0].namespace}.svc.cluster.local"
}

output "namespace" {
  description = "Kubernetes namespace"
  value       = var.namespace
}

output "replicas" {
  description = "Number of pod replicas"
  value       = kubernetes_deployment.service.spec[0].replicas
}

output "image" {
  description = "Container image used"
  value       = "${var.image_registry}/${var.service_name}:${var.service_version}"
}

output "labels" {
  description = "Labels applied to resources"
  value       = kubernetes_deployment.service.metadata[0].labels
}

output "selector" {
  description = "Label selector for the service"
  value       = kubernetes_service.service.spec[0].selector
}

output "load_balancer_hostname" {
  description = "Hostname of the load balancer (if applicable)"
  value       = try(kubernetes_service.service.status[0].load_balancer[0].ingress[0].hostname, null)
}

output "load_balancer_ip" {
  description = "IP address of the load balancer (if applicable)"
  value       = try(kubernetes_service.service.status[0].load_balancer[0].ingress[0].ip, null)
}

output "service_account_name" {
  description = "Service account name"
  value       = kubernetes_service_account.service.metadata[0].name
}

output "hpa_name" {
  description = "HorizontalPodAutoscaler name (if enabled)"
  value       = try(kubernetes_horizontal_pod_autoscaler.service[0].metadata[0].name, null)
}

output "networkpolicy_name" {
  description = "NetworkPolicy name (if enabled)"
  value       = try(kubernetes_network_policy.service[0].metadata[0].name, null)
}

output "pdb_name" {
  description = "PodDisruptionBudget name (if enabled)"
  value       = try(kubernetes_pod_disruption_budget.service[0].metadata[0].name, null)
}

output "configmap_name" {
  description = "ConfigMap name"
  value       = kubernetes_config_map.service.metadata[0].name
}
