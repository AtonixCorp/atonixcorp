output "service_name" {
  description = "Name of the Zookeeper service"
  value       = kubernetes_service.zookeeper.metadata[0].name
}

output "deployment_name" {
  description = "Name of the Zookeeper deployment"
  value       = kubernetes_deployment.zookeeper.metadata[0].name
}

output "data_pvc_name" {
  description = "Name of the Zookeeper data PVC"
  value       = kubernetes_persistent_volume_claim.zookeeper_data.metadata[0].name
}

output "logs_pvc_name" {
  description = "Name of the Zookeeper logs PVC"
  value       = kubernetes_persistent_volume_claim.zookeeper_logs.metadata[0].name
}

output "connection_string" {
  description = "Zookeeper connection string"
  value       = "${kubernetes_service.zookeeper.metadata[0].name}:${var.client_port}"
}

output "host" {
  description = "Zookeeper host"
  value       = kubernetes_service.zookeeper.metadata[0].name
}

output "client_port" {
  description = "Zookeeper client port"
  value       = var.client_port
}

output "admin_port" {
  description = "Zookeeper admin server port"
  value       = 8080
}

output "jmx_port" {
  description = "JMX port for monitoring"
  value       = var.enable_jmx ? var.jmx_port : null
}

output "metrics_port" {
  description = "Metrics port for Prometheus"
  value       = var.enable_jmx ? 5556 : null
}

output "service_fqdn" {
  description = "Fully qualified domain name of the Zookeeper service"
  value       = "${kubernetes_service.zookeeper.metadata[0].name}.${var.namespace}.svc.cluster.local"
}

output "config_map_name" {
  description = "Name of the Zookeeper ConfigMap"
  value       = kubernetes_config_map.zookeeper.metadata[0].name
}

output "jmx_config_map_name" {
  description = "Name of the JMX ConfigMap"
  value       = var.enable_jmx ? kubernetes_config_map.jmx_config[0].metadata[0].name : null
}

output "admin_url" {
  description = "Zookeeper admin server URL"
  value       = "http://${kubernetes_service.zookeeper.metadata[0].name}:8080"
}

output "endpoints" {
  description = "Zookeeper service endpoints"
  value = {
    client          = "${kubernetes_service.zookeeper.metadata[0].name}:${var.client_port}"
    admin           = "${kubernetes_service.zookeeper.metadata[0].name}:8080"
    jmx             = var.enable_jmx ? "${kubernetes_service.zookeeper.metadata[0].name}:${var.jmx_port}" : null
    metrics         = var.enable_jmx ? "${kubernetes_service.zookeeper.metadata[0].name}:5556" : null
  }
}