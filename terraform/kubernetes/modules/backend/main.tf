# Secret for Django configuration
resource "kubernetes_secret" "backend" {
  metadata {
    name      = "${var.name_prefix}-backend"
    namespace = var.namespace
    labels    = merge(var.labels, {
      "app.kubernetes.io/component" = "backend"
      "app.kubernetes.io/name"      = "django"
    })
    annotations = var.annotations
  }
  
  type = "Opaque"
  
  data = {
    SECRET_KEY    = var.secret_key
    DATABASE_URL  = var.database_url
    REDIS_URL     = var.redis_url
    ZOOKEEPER_URL = var.zookeeper_url
  }
}

# ConfigMap for Django configuration
resource "kubernetes_config_map" "backend" {
  metadata {
    name      = "${var.name_prefix}-backend-config"
    namespace = var.namespace
    labels    = merge(var.labels, {
      "app.kubernetes.io/component" = "backend"
      "app.kubernetes.io/name"      = "django"
    })
    annotations = var.annotations
  }
  
  data = {
    DEBUG             = tostring(var.debug)
    ENVIRONMENT       = var.environment
    ALLOWED_HOSTS     = join(",", var.allowed_hosts)
    CORS_ORIGINS      = join(",", var.cors_origins)
    USE_TZ            = "true"
    TIME_ZONE         = "UTC"
    LANGUAGE_CODE     = "en-us"
    STATIC_URL        = "/static/"
    MEDIA_URL         = "/media/"
    STATIC_ROOT       = "/app/staticfiles"
    MEDIA_ROOT        = "/app/media"
    
    # Django settings
    SECURE_SSL_REDIRECT         = var.environment == "production" ? "true" : "false"
    SECURE_PROXY_SSL_HEADER     = "HTTP_X_FORWARDED_PROTO,https"
    SESSION_COOKIE_SECURE       = var.environment == "production" ? "true" : "false"
    CSRF_COOKIE_SECURE          = var.environment == "production" ? "true" : "false"
    SECURE_BROWSER_XSS_FILTER   = "true"
    SECURE_CONTENT_TYPE_NOSNIFF = "true"
    
    # Celery settings
    CELERY_RESULT_BACKEND = var.redis_url
    CELERY_BROKER_URL     = var.redis_url
    CELERY_TASK_SERIALIZER = "json"
    CELERY_RESULT_SERIALIZER = "json"
    CELERY_ACCEPT_CONTENT = "json"
    CELERY_TIMEZONE = "UTC"
    CELERY_ENABLE_UTC = "true"
    
    # Logging
    LOG_LEVEL = var.debug ? "DEBUG" : "INFO"
  }
}

# Persistent Volume Claim for media files
resource "kubernetes_persistent_volume_claim" "media" {
  metadata {
    name      = "${var.name_prefix}-backend-media"
    namespace = var.namespace
    labels    = merge(var.labels, {
      "app.kubernetes.io/component" = "backend"
      "app.kubernetes.io/name"      = "django"
    })
    annotations = var.annotations
  }
  
  spec {
    access_modes       = ["ReadWriteMany"]
    storage_class_name = var.storage_class
    
    resources {
      requests = {
        storage = var.media_size
      }
    }
  }
  
  wait_until_bound = false
}

# Backend Deployment
resource "kubernetes_deployment" "backend" {
  metadata {
    name      = "${var.name_prefix}-backend"
    namespace = var.namespace
    labels    = merge(var.labels, {
      "app.kubernetes.io/component" = "backend"
      "app.kubernetes.io/name"      = "django"
    })
    annotations = var.annotations
  }
  
  spec {
    replicas = var.replicas
    
    strategy {
      type = "RollingUpdate"
      rolling_update {
        max_unavailable = "25%"
        max_surge       = "25%"
      }
    }
    
    selector {
      match_labels = {
        "app.kubernetes.io/name"      = "django"
        "app.kubernetes.io/instance"  = var.name_prefix
        "app.kubernetes.io/component" = "backend"
      }
    }
    
    template {
      metadata {
        labels = merge(var.labels, {
          "app.kubernetes.io/name"      = "django"
          "app.kubernetes.io/instance"  = var.name_prefix
          "app.kubernetes.io/component" = "backend"
        })
        annotations = merge(var.annotations, {
          "prometheus.io/scrape" = "true"
          "prometheus.io/port"   = "8000"
          "prometheus.io/path"   = "/metrics/"
        })
      }
      
      spec {
        # Init container for database migrations
        init_container {
          name  = "migrate"
          image = "${var.image_registry}/${var.image_repository}:${var.image_tag}"
          
          command = [
            "python",
            "manage.py",
            "migrate",
            "--noinput"
          ]
          
          env_from {
            secret_ref {
              name = kubernetes_secret.backend.metadata[0].name
            }
          }
          
          env_from {
            config_map_ref {
              name = kubernetes_config_map.backend.metadata[0].name
            }
          }
          
          resources {
            requests = {
              cpu    = "100m"
              memory = "256Mi"
            }
            limits = {
              cpu    = "500m"
              memory = "1Gi"
            }
          }
        }
        
        # Init container for collecting static files
        init_container {
          name  = "collectstatic"
          image = "${var.image_registry}/${var.image_repository}:${var.image_tag}"
          
          command = [
            "python",
            "manage.py",
            "collectstatic",
            "--noinput"
          ]
          
          env_from {
            secret_ref {
              name = kubernetes_secret.backend.metadata[0].name
            }
          }
          
          env_from {
            config_map_ref {
              name = kubernetes_config_map.backend.metadata[0].name
            }
          }
          
          volume_mount {
            name       = "static-files"
            mount_path = "/app/staticfiles"
          }
          
          resources {
            requests = {
              cpu    = "100m"
              memory = "256Mi"
            }
            limits = {
              cpu    = "500m"
              memory = "1Gi"
            }
          }
        }
        
        container {
          name  = "django"
          image = "${var.image_registry}/${var.image_repository}:${var.image_tag}"
          
          port {
            name           = "http"
            container_port = 8000
            protocol       = "TCP"
          }
          
          env_from {
            secret_ref {
              name = kubernetes_secret.backend.metadata[0].name
            }
          }
          
          env_from {
            config_map_ref {
              name = kubernetes_config_map.backend.metadata[0].name
            }
          }
          
          env {
            name = "POD_NAME"
            value_from {
              field_ref {
                field_path = "metadata.name"
              }
            }
          }
          
          env {
            name = "POD_NAMESPACE"
            value_from {
              field_ref {
                field_path = "metadata.namespace"
              }
            }
          }
          
          volume_mount {
            name       = "media-files"
            mount_path = "/app/media"
          }
          
          volume_mount {
            name       = "static-files"
            mount_path = "/app/staticfiles"
          }
          
          resources {
            requests = {
              cpu    = var.resource_limits.cpu_request
              memory = var.resource_limits.memory_request
            }
            limits = {
              cpu    = var.resource_limits.cpu_limit
              memory = var.resource_limits.memory_limit
            }
          }
          
          liveness_probe {
            http_get {
              path = "/api/health/"
              port = 8000
            }
            initial_delay_seconds = 30
            period_seconds        = 10
            timeout_seconds       = 5
            failure_threshold     = 3
          }
          
          readiness_probe {
            http_get {
              path = "/api/ready/"
              port = 8000
            }
            initial_delay_seconds = 5
            period_seconds        = 5
            timeout_seconds       = 3
            failure_threshold     = 3
          }
          
          startup_probe {
            http_get {
              path = "/api/health/"
              port = 8000
            }
            initial_delay_seconds = 10
            period_seconds        = 5
            timeout_seconds       = 3
            failure_threshold     = 30
          }
        }
        
        volume {
          name = "media-files"
          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.media.metadata[0].name
          }
        }
        
        volume {
          name = "static-files"
          empty_dir {}
        }
        
        security_context {
          run_as_user     = 1000
          run_as_group    = 1000
          fs_group        = 1000
          run_as_non_root = true
        }
      }
    }
  }
}

# Backend Service
resource "kubernetes_service" "backend" {
  metadata {
    name      = "${var.name_prefix}-backend"
    namespace = var.namespace
    labels    = merge(var.labels, {
      "app.kubernetes.io/component" = "backend"
      "app.kubernetes.io/name"      = "django"
    })
    annotations = merge(var.annotations, {
      "prometheus.io/scrape" = "true"
      "prometheus.io/port"   = "8000"
      "prometheus.io/path"   = "/metrics/"
    })
  }
  
  spec {
    type = "ClusterIP"
    
    port {
      name        = "http"
      port        = 8000
      target_port = 8000
      protocol    = "TCP"
    }
    
    selector = {
      "app.kubernetes.io/name"      = "django"
      "app.kubernetes.io/instance"  = var.name_prefix
      "app.kubernetes.io/component" = "backend"
    }
  }
}

# Horizontal Pod Autoscaler
resource "kubernetes_horizontal_pod_autoscaler_v2" "backend" {
  metadata {
    name      = "${var.name_prefix}-backend-hpa"
    namespace = var.namespace
    labels    = merge(var.labels, {
      "app.kubernetes.io/component" = "backend"
      "app.kubernetes.io/name"      = "django"
    })
  }
  
  spec {
    scale_target_ref {
      api_version = "apps/v1"
      kind        = "Deployment"
      name        = kubernetes_deployment.backend.metadata[0].name
    }
    
    min_replicas = var.min_replicas
    max_replicas = var.max_replicas
    
    metric {
      type = "Resource"
      resource {
        name = "cpu"
        target {
          type                = "Utilization"
          average_utilization = 70
        }
      }
    }
    
    metric {
      type = "Resource"
      resource {
        name = "memory"
        target {
          type                = "Utilization"
          average_utilization = 80
        }
      }
    }
    
    behavior {
      scale_up {
        stabilization_window_seconds = 60
        select_policy = "Max"
        policy {
          type          = "Percent"
          value         = 100
          period_seconds = 15
        }
        policy {
          type          = "Pods"
          value         = 2
          period_seconds = 60
        }
      }
      
      scale_down {
        stabilization_window_seconds = 300
        select_policy = "Min"
        policy {
          type          = "Percent"
          value         = 10
          period_seconds = 60
        }
        policy {
          type          = "Pods"
          value         = 1
          period_seconds = 60
        }
      }
    }
  }
}

# Pod Disruption Budget
resource "kubernetes_pod_disruption_budget_v1" "backend" {
  metadata {
    name      = "${var.name_prefix}-backend-pdb"
    namespace = var.namespace
    labels    = merge(var.labels, {
      "app.kubernetes.io/component" = "backend"
      "app.kubernetes.io/name"      = "django"
    })
  }
  
  spec {
    min_available = "50%"
    
    selector {
      match_labels = {
        "app.kubernetes.io/name"      = "django"
        "app.kubernetes.io/instance"  = var.name_prefix
        "app.kubernetes.io/component" = "backend"
      }
    }
  }
}