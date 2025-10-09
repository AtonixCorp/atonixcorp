# AtonixCorp Platform - Kubernetes Infrastructure
terraform { 
  cloud { 
    
    organization = "AtonixCorp-Platform" 

    workspaces { 
      name = "atonixcorp" 
    } 
  } 
  required_version = ">= 1.0"
  
  # Note: Terraform Cloud workspace configuration removed for local execution.
  # If you rely on Terraform Cloud, restore the `cloud { ... }` block and
  # run applies through Terraform Cloud; local applies will otherwise run
  # against your local kubeconfig/environment.
  
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.20"
    }
  }
}

# Provider Configuration
provider "kubernetes" {
  host                   = var.kubernetes_host != "" ? var.kubernetes_host : null
  token                  = var.kubernetes_token != "" ? var.kubernetes_token : null
  cluster_ca_certificate = var.kubernetes_cluster_ca_certificate != "" ? base64decode(var.kubernetes_cluster_ca_certificate) : null
  config_path            = var.kubernetes_host == "" ? var.kubeconfig_path : null
}

# Local Values
locals {
  name_prefix = "${var.project_name}-${var.environment}"
  
  common_labels = {
    "app.kubernetes.io/name"       = var.project_name
    "app.kubernetes.io/instance"   = var.environment
    "app.kubernetes.io/version"    = var.app_version
    "app.kubernetes.io/component"  = "platform"
    "app.kubernetes.io/part-of"    = "atonixcorp"
    "app.kubernetes.io/managed-by" = "terraform"
    "environment"                  = var.environment
    "project"                      = var.project_name
  }

  annotations = {
    "terraform.io/managed"          = "true"
    "atonixcorp.com/environment"    = var.environment
    "atonixcorp.com/version"        = var.app_version
    "atonixcorp.com/deployed-by"    = "terraform"
    "atonixcorp.com/deployed-at"    = timestamp()
  }
}

# Namespace Module
module "namespace" {
  source = "./modules/namespace"
  
  name        = var.namespace
  labels      = local.common_labels
  annotations = local.annotations
}

# PostgreSQL Module
module "postgresql" {
  source = "./modules/postgresql"
  
  namespace   = module.namespace.name
  name_prefix = local.name_prefix
  
  database_name = var.database_name
  username      = var.database_username
  
  storage_class = var.storage_class
  storage_size  = var.postgresql_storage_size
  
  enable_monitoring = var.enable_monitoring
  
  labels      = local.common_labels
  annotations = local.annotations
}

# Redis Module
module "redis" {
  source = "./modules/redis"
  
  namespace   = module.namespace.name
  name_prefix = local.name_prefix
  
  storage_class = var.storage_class
  storage_size  = var.redis_storage_size
  
  enable_monitoring = var.enable_monitoring
  
  labels      = local.common_labels
  annotations = local.annotations
}

# Zookeeper Module
module "zookeeper" {
  source = "./modules/zookeeper"
  
  namespace   = module.namespace.name
  name_prefix = local.name_prefix
  
  storage_class = var.storage_class
  storage_size  = var.zookeeper_storage_size
  
  client_port                   = var.zookeeper_client_port
  tick_time                     = var.zookeeper_tick_time
  init_limit                    = var.zookeeper_init_limit
  sync_limit                    = var.zookeeper_sync_limit
  max_client_connections        = var.zookeeper_max_client_connections
  autopurge_snap_retain_count   = var.zookeeper_autopurge_snap_retain_count
  autopurge_purge_interval      = var.zookeeper_autopurge_purge_interval
  enable_jmx                    = var.zookeeper_enable_jmx
  jmx_port                      = var.zookeeper_jmx_port
  
  resource_limits = var.resource_limits.zookeeper
  
  labels      = local.common_labels
  annotations = local.annotations
}

# Kafka Module
module "kafka" {
  source = "./modules/kafka"
  
  namespace = module.namespace.name
  
  zookeeper_connect      = module.zookeeper.connection_string
  zookeeper_service_name = module.zookeeper.service_name
  
  replicas            = var.kafka_replicas
  replication_factor  = var.kafka_replication_factor
  min_isr            = var.kafka_min_isr
  default_partitions = var.kafka_default_partitions
  
  log_retention_hours = var.kafka_log_retention_hours
  log_segment_bytes   = var.kafka_log_segment_bytes
  message_max_bytes   = var.kafka_message_max_bytes
  auto_create_topics  = var.kafka_auto_create_topics
  
  storage_class = var.storage_class
  storage_size  = var.kafka_storage_size
  
  enable_external_access = var.kafka_enable_external_access
  external_node_port     = var.kafka_external_node_port
  enable_monitoring      = var.enable_monitoring
  
  resources = {
    requests = {
      cpu    = var.resource_limits.kafka.cpu_request
      memory = var.resource_limits.kafka.memory_request
    }
    limits = {
      cpu    = var.resource_limits.kafka.cpu_limit
      memory = var.resource_limits.kafka.memory_limit
    }
  }
  
  depends_on = [module.zookeeper]
}

# Backend Module
module "backend" {
  source = "./modules/backend"
  
  namespace   = module.namespace.name
  name_prefix = local.name_prefix
  
  image_registry   = var.image_registry
  image_repository = var.backend_image_repository
  image_tag        = var.backend_image_tag
  
  replicas     = var.backend_replicas
  min_replicas = var.backend_min_replicas
  max_replicas = var.backend_max_replicas
  
  database_url  = module.postgresql.connection_url
  redis_url     = module.redis.connection_url
  zookeeper_url = module.zookeeper.connection_string
  
  secret_key      = var.django_secret_key
  allowed_hosts   = var.allowed_hosts
  cors_origins    = var.cors_allowed_origins
  
  storage_class = var.storage_class
  media_size    = var.media_storage_size
  
  resource_limits = var.resource_limits.backend
  environment     = var.environment
  
  labels      = local.common_labels
  annotations = local.annotations
  
  depends_on = [
    module.postgresql,
    module.redis,
    module.zookeeper
  ]
}

# Frontend Module
module "frontend" {
  source = "./modules/frontend"
  
  namespace   = module.namespace.name
  name_prefix = local.name_prefix
  
  image_registry   = var.image_registry
  image_repository = var.frontend_image_repository
  image_tag        = var.frontend_image_tag
  
  replicas     = var.frontend_replicas
  min_replicas = var.frontend_min_replicas
  max_replicas = var.frontend_max_replicas
  
  api_url     = var.api_url
  environment = var.environment
  
  labels      = local.common_labels
  annotations = local.annotations
}

# Celery Module
module "celery" {
  source = "./modules/celery"
  
  namespace   = module.namespace.name
  name_prefix = local.name_prefix
  
  image_registry   = var.image_registry
  image_repository = var.backend_image_repository
  image_tag        = var.backend_image_tag
  
  worker_replicas     = var.celery_worker_replicas
  worker_min_replicas = var.celery_worker_min_replicas
  worker_max_replicas = var.celery_worker_max_replicas
  
  database_url  = module.postgresql.connection_url
  redis_url     = module.redis.connection_url
  zookeeper_url = module.zookeeper.connection_string
  
  secret_key = var.django_secret_key
  
  resource_limits = var.resource_limits.celery
  
  labels      = local.common_labels
  annotations = local.annotations
  
  depends_on = [
    module.postgresql,
    module.redis,
    module.zookeeper
  ]
}

# Ingress Module
module "ingress" {
  source = "./modules/ingress"
  
  namespace   = module.namespace.name
  name_prefix = local.name_prefix
  
  domain_name    = var.domain_name
  tls_secret     = var.tls_secret_name
  ingress_class  = var.ingress_class
  
  backend_service  = module.backend.service_name
  frontend_service = module.frontend.service_name
  
  labels      = local.common_labels
  annotations = merge(local.annotations, var.ingress_annotations)
}

# Monitoring Module (Optional)
module "monitoring" {
  source = "./modules/monitoring"
  count  = var.enable_monitoring ? 1 : 0
  
  namespace   = module.namespace.name
  name_prefix = local.name_prefix
  
  labels      = local.common_labels
  annotations = local.annotations
}