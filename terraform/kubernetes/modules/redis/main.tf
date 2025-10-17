# ConfigMap for Redis configuration
resource "kubernetes_config_map" "redis" {
  metadata {
    name      = "${var.name_prefix}-redis-config"
    namespace = var.namespace
    labels    = merge(var.labels, {
      "app.kubernetes.io/component" = "cache"
      "app.kubernetes.io/name"      = "redis"
    })
    annotations = var.annotations
  }
  
  data = {
    "redis.conf" = <<-EOF
      # Redis Configuration
      bind 0.0.0.0
      port 6379
      
      # Memory management
      maxmemory 512mb
      maxmemory-policy ${var.maxmemory_policy}
      
      # Persistence
      ${var.enable_persistence ? "save 900 1" : "save \"\""}
      ${var.enable_persistence ? "save 300 10" : ""}
      ${var.enable_persistence ? "save 60 10000" : ""}
      
      # Logging
      loglevel notice
      logfile ""
      
      # Client timeout
      timeout 300
      tcp-keepalive 300
      
      # Database settings
      databases 16
      
      # Security
      protected-mode no
      
      # Performance
      tcp-backlog 511
      
      # Append only file
      ${var.enable_persistence ? "appendonly yes" : "appendonly no"}
      ${var.enable_persistence ? "appendfsync everysec" : ""}
      ${var.enable_persistence ? "no-appendfsync-on-rewrite no" : ""}
      ${var.enable_persistence ? "auto-aof-rewrite-percentage 100" : ""}
      ${var.enable_persistence ? "auto-aof-rewrite-min-size 64mb" : ""}
      
      # Slow log
      slowlog-log-slower-than 10000
      slowlog-max-len 128
      
      # Latency monitoring
      latency-monitor-threshold 100
      
      # Client output buffer limits
      client-output-buffer-limit normal 0 0 0
      client-output-buffer-limit replica 256mb 64mb 60
      client-output-buffer-limit pubsub 32mb 8mb 60
    EOF
  }
}

# Persistent Volume Claim for Redis data
resource "kubernetes_persistent_volume_claim" "redis" {
  count = var.enable_persistence ? 1 : 0
  
  metadata {
    name      = "${var.name_prefix}-redis-data"
    namespace = var.namespace
    labels    = merge(var.labels, {
      "app.kubernetes.io/component" = "cache"
      "app.kubernetes.io/name"      = "redis"
    })
    annotations = var.annotations
  }
  
  spec {
    access_modes       = ["ReadWriteOnce"]
    storage_class_name = var.storage_class
    
    resources {
      requests = {
        storage = var.storage_size
      }
    }
  }
  
  wait_until_bound = false
}

# Redis Deployment
resource "kubernetes_deployment" "redis" {
  metadata {
    name      = "${var.name_prefix}-redis"
    namespace = var.namespace
    labels    = merge(var.labels, {
      "app.kubernetes.io/component" = "cache"
      "app.kubernetes.io/name"      = "redis"
    })
    annotations = var.annotations
  }
  
  spec {
    replicas = 1
    
    strategy {
      type = "Recreate"
    }
    
    selector {
      match_labels = {
        "app.kubernetes.io/name"      = "redis"
        "app.kubernetes.io/instance"  = var.name_prefix
        "app.kubernetes.io/component" = "cache"
      }
    }
    
    template {
      metadata {
        labels = merge(var.labels, {
          "app.kubernetes.io/name"      = "redis"
          "app.kubernetes.io/instance"  = var.name_prefix
          "app.kubernetes.io/component" = "cache"
        })
        annotations = merge(var.annotations, {
          "prometheus.io/scrape" = "true"
          "prometheus.io/port"   = "9121"
        })
      }
      
      spec {
        container {
          name  = "redis"
          image = "redis:${var.redis_version}"
          
          command = [
            "redis-server",
            "/etc/redis/redis.conf"
          ]
          
          port {
            name           = "redis"
            container_port = 6379
            protocol       = "TCP"
          }
          
          volume_mount {
            name       = "redis-config"
            mount_path = "/etc/redis"
          }
          
          dynamic "volume_mount" {
            for_each = var.enable_persistence ? [1] : []
            content {
              name       = "redis-data"
              mount_path = "/data"
            }
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
            exec {
              command = [
                "redis-cli",
                "ping"
              ]
            }
            initial_delay_seconds = 30
            period_seconds        = 10
            timeout_seconds       = 5
            failure_threshold     = 3
          }
          
          readiness_probe {
            exec {
              command = [
                "redis-cli",
                "ping"
              ]
            }
            initial_delay_seconds = 5
            period_seconds        = 5
            timeout_seconds       = 3
            failure_threshold     = 3
          }
          
          startup_probe {
            exec {
              command = [
                "redis-cli",
                "ping"
              ]
            }
            initial_delay_seconds = 10
            period_seconds        = 5
            timeout_seconds       = 3
            failure_threshold     = 30
          }
        }
        
        # Redis Exporter for Prometheus monitoring
        container {
          name  = "redis-exporter"
          image = "oliver006/redis_exporter:v1.45.0"
          
          port {
            name           = "metrics"
            container_port = 9121
            protocol       = "TCP"
          }
          
          env {
            name  = "REDIS_ADDR"
            value = "redis://localhost:6379"
          }
          
          resources {
            requests = {
              cpu    = "50m"
<<<<<<< HEAD
              memory = "64Mi"
=======
              memory = "128Mi"
>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
            }
            limits = {
              cpu    = "200m"
              memory = "256Mi"
            }
          }
          
          liveness_probe {
            http_get {
              path = "/metrics"
              port = 9121
            }
            initial_delay_seconds = 30
            period_seconds        = 30
          }
        }
        
        volume {
          name = "redis-config"
          config_map {
            name = kubernetes_config_map.redis.metadata[0].name
          }
        }
        
        dynamic "volume" {
          for_each = var.enable_persistence ? [1] : []
          content {
            name = "redis-data"
            persistent_volume_claim {
              claim_name = kubernetes_persistent_volume_claim.redis[0].metadata[0].name
            }
          }
        }
        
        security_context {
          run_as_user     = 999
          run_as_group    = 999
          fs_group        = 999
          run_as_non_root = true
        }
      }
    }
  }
}

# Redis Service
resource "kubernetes_service" "redis" {
  metadata {
    name      = "${var.name_prefix}-redis"
    namespace = var.namespace
    labels    = merge(var.labels, {
      "app.kubernetes.io/component" = "cache"
      "app.kubernetes.io/name"      = "redis"
    })
    annotations = merge(var.annotations, {
      "prometheus.io/scrape" = "true"
      "prometheus.io/port"   = "9121"
      "prometheus.io/path"   = "/metrics"
    })
  }
  
  spec {
    type = "ClusterIP"
    
    port {
      name        = "redis"
      port        = 6379
      target_port = 6379
      protocol    = "TCP"
    }
    
    port {
      name        = "metrics"
      port        = 9121
      target_port = 9121
      protocol    = "TCP"
    }
    
    selector = {
      "app.kubernetes.io/name"      = "redis"
      "app.kubernetes.io/instance"  = var.name_prefix
      "app.kubernetes.io/component" = "cache"
    }
  }
}

# ServiceMonitor for Prometheus (if monitoring is enabled)
resource "kubernetes_manifest" "redis_servicemonitor" {
  count = var.enable_monitoring ? 1 : 0
  manifest = {
    apiVersion = "monitoring.coreos.com/v1"
    kind       = "ServiceMonitor"
    metadata = {
      name      = "${var.name_prefix}-redis"
      namespace = var.namespace
      labels    = merge(var.labels, {
        "app.kubernetes.io/component" = "cache"
        "app.kubernetes.io/name"      = "redis"
      })
    }
    spec = {
      selector = {
        matchLabels = {
          "app.kubernetes.io/name"      = "redis"
          "app.kubernetes.io/instance"  = var.name_prefix
          "app.kubernetes.io/component" = "cache"
        }
      }
      endpoints = [{
        port     = "metrics"
        interval = "30s"
        path     = "/metrics"
      }]
    }
  }
}