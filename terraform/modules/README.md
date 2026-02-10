# AtonixCorp Kubernetes Module

This module provisions AtonixCorp services on Kubernetes.

## Module Structure

```
modules/
├── kubernetes-service/
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── README.md
├── storage/
│   ├── main.tf
│   └── variables.tf
├── networking/
│   ├── main.tf
│   └── variables.tf
└── observability/
    ├── main.tf
    └── variables.tf
```

## Usage

```hcl
module "kubernetes_service" {
  source = "./modules/kubernetes-service"
  
  service_name    = "api-gateway"
  namespace       = "atonixcorp"
  replicas        = 2
  image           = "atonixdev/api-gateway:latest"
  cpu_limit       = "500m"
  memory_limit    = "512Mi"
  
  env_vars = {
    LOG_LEVEL = "info"
    DEBUG     = "false"
  }
}
```

## Available Modules

### 1. kubernetes-service
Deploys Kubernetes Deployment, Service, and ConfigMap

### 2. storage
Provisions PersistentVolumes and StorageClasses

### 3. networking
Sets up NetworkPolicies and Ingress rules

### 4. observability
Deploys Prometheus, Loki, and Grafana
