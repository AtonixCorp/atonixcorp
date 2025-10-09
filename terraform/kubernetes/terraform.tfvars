# Terraform variables for AtonixCorp Platform on single-node Kubernetes

# Core Configuration
project_name = "atonixcorp"
environment = "dev"
app_version = "1.0.0"
namespace = "atonixcorp"

# Kubernetes Configuration
kubeconfig_path = "~/.kube/config"

# Storage Configuration
storage_class = "standard"
postgresql_storage_size = "5Gi"
redis_storage_size = "2Gi"
zookeeper_storage_size = "2Gi"
kafka_storage_size = "3Gi"
media_storage_size = "2Gi"

# Database Configuration
database_name = "atonixcorp"
database_username = "atonixcorp"

# Image Configuration
image_registry = "docker.io"
backend_image_repository = "nginx"
backend_image_tag = "latest"
frontend_image_repository = "nginx"
frontend_image_tag = "latest"

# Scaling Configuration (single node - keep low)
backend_replicas = 1
backend_min_replicas = 1
backend_max_replicas = 2

frontend_replicas = 1
frontend_min_replicas = 1
frontend_max_replicas = 2

celery_worker_replicas = 1
celery_worker_min_replicas = 1
celery_worker_max_replicas = 2

# Kafka Configuration (single node)
kafka_replicas = 1
kafka_replication_factor = 1
kafka_min_isr = 1

# Network Configuration
# Consolidated allowed hosts and CORS origins (deduplicated). Keep both https origins and http localhost for dev.
allowed_hosts = ["localhost", "127.0.0.1", "atonixcorp.org", "api.atonixcorp.org", "www.atonixcorp.org"]
cors_allowed_origins = ["https://atonixcorp.org", "https://www.atonixcorp.org", "http://atonixcorp.org", "http://www.atonixcorp.org", "http://localhost:3000"]
api_url = "http://api.atonixcorp.org"

# Domain Configuration
domain_name = "atonixcorp.org"
ingress_class = "nginx"

# Disable TLS/cert-manager for now
tls_secret_name = ""

# Security Configuration
django_secret_key = "EOnU#!aut7u37F&A790-E3w(k2mu5bO#uHjE0*%=Pxzhjp*pev"

# Optional Features
enable_monitoring = false
kafka_enable_external_access = false

# Disable cert-manager and monitoring for now
ingress_annotations = {}

# Disable JMX to avoid ServiceMonitor CRD requirement
zookeeper_enable_jmx = false