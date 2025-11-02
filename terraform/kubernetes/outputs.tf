# ==========================
# Namespace Outputs
# ==========================

output "namespace_name" {
  description = "Name of the Kubernetes namespace"
  value       = module.namespace.name
}

# ==========================
# Database Outputs
# ==========================

output "postgresql_service_name" {
  description = "PostgreSQL service name"
  value       = module.postgresql.service_name
}

output "postgresql_secret_name" {
  description = "PostgreSQL secret name"
  value       = module.postgresql.secret_name
}

output "postgresql_connection_url" {
  description = "PostgreSQL connection URL"
  value       = module.postgresql.connection_url
  sensitive   = true
}

# ==========================
# Redis Outputs
# ==========================

output "redis_service_name" {
  description = "Redis service name"
  value       = module.redis.service_name
}

output "redis_connection_url" {
  description = "Redis connection URL"
  value       = module.redis.connection_url
  sensitive   = true
}

# ==========================
# Zookeeper Outputs
# ==========================

output "zookeeper_service_name" {
  description = "Zookeeper service name"
  value       = module.zookeeper.service_name
}

output "zookeeper_connection_string" {
  description = "Zookeeper connection string"
  value       = module.zookeeper.connection_string
}

output "zookeeper_admin_url" {
  description = "Zookeeper admin server URL"
  value       = module.zookeeper.admin_url
}

# ==========================
# Backend Outputs
# ==========================

output "backend_service_name" {
  description = "Backend service name"
  value       = module.backend.service_name
}

output "backend_deployment_name" {
  description = "Backend deployment name"
  value       = module.backend.deployment_name
}

output "backend_endpoints" {
  description = "Backend service endpoints"
  value       = module.backend.endpoints
}

# ==========================
# Frontend Outputs
# ==========================

output "frontend_service_name" {
  description = "Frontend service name"
  value       = module.frontend.service_name
}

output "frontend_deployment_name" {
  description = "Frontend deployment name"
  value       = module.frontend.deployment_name
}

output "frontend_endpoints" {
  description = "Frontend service endpoints"
  value       = module.frontend.endpoints
}

# ==========================
# Celery Outputs
# ==========================

output "celery_worker_deployment_name" {
  description = "Celery worker deployment name"
  value       = module.celery.worker_deployment_name
}

output "celery_beat_deployment_name" {
  description = "Celery beat deployment name"
  value       = module.celery.beat_deployment_name
}

# ==========================
# Ingress Outputs
# ==========================

output "ingress_name" {
  description = "Ingress resource name"
  value       = module.ingress.name
}

output "ingress_hostname" {
  description = "Ingress hostname"
  value       = module.ingress.hostname
}

output "ingress_urls" {
  description = "Application URLs"
  value = {
    frontend = "https://${var.domain_name}"
    backend  = "https://${var.domain_name}/api"
    admin    = "https://${var.domain_name}/admin"
  }
}

# ==========================
# Monitoring Outputs
# ==========================

output "monitoring_enabled" {
  description = "Whether monitoring is enabled"
  value       = var.enable_monitoring
}

<<<<<<< HEAD
output "prometheus_service_name" {
  description = "Prometheus service name"
  value       = var.enable_monitoring ? module.monitoring[0].prometheus_service_name : null
}

output "grafana_service_name" {
  description = "Grafana service name"
  value       = var.enable_monitoring ? module.monitoring[0].grafana_service_name : null
}

output "grafana_admin_secret" {
  description = "Grafana admin secret name"
  value       = var.enable_monitoring ? module.monitoring[0].grafana_admin_secret : null
  sensitive   = true
}

=======
>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
# ==========================
# Application Info Outputs
# ==========================

output "application_info" {
  description = "Complete application deployment information"
  value = {
    project_name    = var.project_name
    environment     = var.environment
    app_version     = var.app_version
    namespace       = module.namespace.name
    domain_name     = var.domain_name
    ingress_class   = var.ingress_class
    storage_class   = var.storage_class
    monitoring      = var.enable_monitoring
    autoscaling     = var.enable_autoscaling
    backup_enabled  = var.enable_backup
  }
}

# ==========================
# Resource Counts Outputs
# ==========================

output "resource_summary" {
  description = "Summary of deployed resources"
  value = {
    deployments = {
      backend       = module.backend.deployment_name
      frontend      = module.frontend.deployment_name
      celery_worker = module.celery.worker_deployment_name
      celery_beat   = module.celery.beat_deployment_name
      postgresql    = module.postgresql.deployment_name
      redis         = module.redis.deployment_name
      zookeeper     = module.zookeeper.deployment_name
    }
    services = {
      backend    = module.backend.service_name
      frontend   = module.frontend.service_name
      postgresql = module.postgresql.service_name
      redis      = module.redis.service_name
      zookeeper  = module.zookeeper.service_name
    }
    secrets = {
      postgresql = module.postgresql.secret_name
      django     = module.backend.secret_name
    }
    configmaps = {
      backend   = module.backend.configmap_name
      frontend  = module.frontend.configmap_name
      zookeeper = module.zookeeper.config_map_name
    }
    persistent_volumes = {
      postgresql       = module.postgresql.pvc_name
      redis            = module.redis.pvc_name
      media            = module.backend.media_pvc_name
      zookeeper_data   = module.zookeeper.data_pvc_name
      zookeeper_logs   = module.zookeeper.logs_pvc_name
    }
  }
}

# ==========================
# Connection Information
# ==========================

output "connection_info" {
  description = "Connection information for services"
  value = {
    external_urls = {
      frontend = "https://${var.domain_name}"
      api      = "https://${var.domain_name}/api"
      admin    = "https://${var.domain_name}/admin"
    }
    internal_services = {
      backend_service     = "${module.backend.service_name}.${module.namespace.name}.svc.cluster.local"
      frontend_service    = "${module.frontend.service_name}.${module.namespace.name}.svc.cluster.local"
      postgresql_service  = "${module.postgresql.service_name}.${module.namespace.name}.svc.cluster.local"
      redis_service       = "${module.redis.service_name}.${module.namespace.name}.svc.cluster.local"
      zookeeper_service   = "${module.zookeeper.service_name}.${module.namespace.name}.svc.cluster.local"
    }
    ports = {
      backend    = 8000
      frontend   = 80
      postgresql = 5432
      redis      = 6379
      zookeeper  = 2181
    }
  }
}

# ==========================
# Health Check Outputs
# ==========================

output "health_check_endpoints" {
  description = "Health check endpoints for monitoring"
  value = {
    backend_health    = "https://${var.domain_name}/api/health/"
    backend_ready     = "https://${var.domain_name}/api/ready/"
    frontend_health   = "https://${var.domain_name}/health"
    database_health   = "internal"
    redis_health      = "internal"
  }
<<<<<<< HEAD
}
=======
}
>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
