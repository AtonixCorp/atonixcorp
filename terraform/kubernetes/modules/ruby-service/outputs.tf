# Ruby Service Module Outputs

output "service_name" {
  description = "Name of the Ruby service"
  value       = kubernetes_service.ruby_service.metadata[0].name
}

output "service_port" {
  description = "Port of the Ruby service"
  value       = kubernetes_service.ruby_service.spec[0].port[0].port
}

output "deployment_name" {
  description = "Name of the Ruby service deployment"
  value       = kubernetes_deployment.ruby_service_web.metadata[0].name
}

output "sidekiq_deployment_name" {
  description = "Name of the Sidekiq deployment"
  value       = kubernetes_deployment.ruby_service_sidekiq.metadata[0].name
}

output "config_map_name" {
  description = "Name of the Ruby service config map"
  value       = kubernetes_config_map.ruby_service_config.metadata[0].name
}

output "secret_name" {
  description = "Name of the Ruby service secrets"
  value       = kubernetes_secret.ruby_service_secrets.metadata[0].name
}

output "service_account_name" {
  description = "Name of the Ruby service account"
  value       = kubernetes_service_account.ruby_service.metadata[0].name
}
