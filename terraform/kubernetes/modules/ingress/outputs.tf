output "name" {
  description = "Name of the main ingress resource"
  value       = kubernetes_ingress_v1.main.metadata[0].name
}

output "api_ingress_name" {
  description = "Name of the API ingress resource"
  value       = kubernetes_ingress_v1.api.metadata[0].name
}

output "hostname" {
  description = "Primary hostname for the ingress"
  value       = var.domain_name
}

output "urls" {
  description = "Application URLs"
  value = {
    main_site = var.ssl_redirect ? "https://${var.domain_name}" : "http://${var.domain_name}"
    www_site  = var.ssl_redirect ? "https://www.${var.domain_name}" : "http://www.${var.domain_name}"
    api_site  = var.ssl_redirect ? "https://api.${var.domain_name}" : "http://api.${var.domain_name}"
    admin     = var.ssl_redirect ? "https://${var.domain_name}/admin" : "http://${var.domain_name}/admin"
    api       = var.ssl_redirect ? "https://${var.domain_name}/api" : "http://${var.domain_name}/api"
  }
}

output "tls_enabled" {
  description = "Whether TLS is enabled"
  value       = var.tls_secret != ""
}

output "tls_secret_name" {
  description = "Name of the TLS secret"
  value       = var.tls_secret
}

output "certificate_name" {
  description = "Name of the certificate resource"
  value       = var.tls_secret != "" ? kubernetes_manifest.certificate[0].manifest.metadata.name : null
}

output "ingress_class" {
  description = "Ingress class used"
  value       = var.ingress_class
}

output "annotations" {
  description = "Annotations applied to the ingress"
  value       = local.all_annotations
}

output "backend_paths" {
  description = "Paths routed to backend service"
  value = [
    "/api",
    "/admin",
    "/static",
    "/media",
    "/health",
    "/ready"
  ]
}

output "frontend_paths" {
  description = "Paths routed to frontend service"
  value = [
    "/"
  ]
}

output "network_policy_name" {
  description = "Name of the network policy"
  value       = kubernetes_network_policy.ingress.metadata[0].name
}