output "name" {
  description = "Name of the created namespace"
  value       = kubernetes_namespace.main.metadata[0].name
}

output "uid" {
  description = "UID of the created namespace"
  value       = kubernetes_namespace.main.metadata[0].uid
}

output "resource_version" {
  description = "Resource version of the namespace"
  value       = kubernetes_namespace.main.metadata[0].resource_version
}

output "labels" {
  description = "Labels applied to the namespace"
  value       = kubernetes_namespace.main.metadata[0].labels
}

output "annotations" {
  description = "Annotations applied to the namespace"
  value       = kubernetes_namespace.main.metadata[0].annotations
}

output "resource_quota_name" {
  description = "Name of the resource quota"
  value       = kubernetes_resource_quota.main.metadata[0].name
}

output "limit_range_name" {
  description = "Name of the limit range"
  value       = kubernetes_limit_range.main.metadata[0].name
}