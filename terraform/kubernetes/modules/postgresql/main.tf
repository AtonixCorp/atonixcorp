# Generate random password for PostgreSQL
resource "random_password" "postgres_password" {
  length  = 32
  special = true
}

# Secret for PostgreSQL credentials
resource "kubernetes_secret" "postgresql" {
  metadata {
    name      = "${var.name_prefix}-postgresql"
    namespace = var.namespace
    labels    = merge(var.labels, {
      "app.kubernetes.io/component" = "database"
      "app.kubernetes.io/name"      = "postgresql"
    })
    annotations = var.annotations
  }
  
  type = "Opaque"
  
  data = {
    POSTGRES_DB       = var.database_name
    POSTGRES_USER     = var.username
    POSTGRES_PASSWORD = random_password.postgres_password.result
    DATABASE_URL      = "postgresql://${var.username}:${random_password.postgres_password.result}@${var.name_prefix}-postgresql:5432/${var.database_name}"
  }
}

# ConfigMap for PostgreSQL configuration
resource "kubernetes_config_map" "postgresql" {
  metadata {
    name      = "${var.name_prefix}-postgresql-config"
    namespace = var.namespace
    labels    = merge(var.labels, {
      "app.kubernetes.io/component" = "database"
      "app.kubernetes.io/name"      = "postgresql"
    })
    annotations = var.annotations
  }
  
  data = {
    "postgresql.conf" = <<-EOF
      # PostgreSQL Configuration
      listen_addresses = '*'
      port = 5432
      max_connections = 100
      shared_buffers = 256MB
      effective_cache_size = 1GB
      maintenance_work_mem = 64MB
      checkpoint_completion_target = 0.7
      wal_buffers = 16MB
      default_statistics_target = 100
      random_page_cost = 1.1
      effective_io_concurrency = 200
      work_mem = 4MB
      min_wal_size = 1GB
      max_wal_size = 4GB
      
      # Logging
      log_destination = 'stderr'
      logging_collector = on
      log_directory = 'log'
      log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
      log_file_mode = 0600
      log_truncate_on_rotation = on
      log_rotation_age = 1d
      log_rotation_size = 100MB
      log_min_duration_statement = 1000
      log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
      log_statement = 'none'
      
      # Monitoring
      track_activities = on
      track_counts = on
      track_io_timing = on
      track_functions = pl
      stats_temp_directory = 'pg_stat_tmp'
    EOF
    
    "pg_hba.conf" = <<-EOF
      # PostgreSQL Client Authentication Configuration File
      local   all             all                                     trust
      host    all             all             127.0.0.1/32            md5
      host    all             all             ::1/128                 md5
      host    all             all             0.0.0.0/0               md5
    EOF
  }
}

# Persistent Volume Claim for PostgreSQL data
resource "kubernetes_persistent_volume_claim" "postgresql" {
  metadata {
    name      = "${var.name_prefix}-postgresql-data"
    namespace = var.namespace
    labels    = merge(var.labels, {
      "app.kubernetes.io/component" = "database"
      "app.kubernetes.io/name"      = "postgresql"
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

# PostgreSQL Deployment
resource "kubernetes_deployment" "postgresql" {
  metadata {
    name      = "${var.name_prefix}-postgresql"
    namespace = var.namespace
    labels    = merge(var.labels, {
      "app.kubernetes.io/component" = "database"
      "app.kubernetes.io/name"      = "postgresql"
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
        "app.kubernetes.io/name"      = "postgresql"
        "app.kubernetes.io/instance"  = var.name_prefix
        "app.kubernetes.io/component" = "database"
      }
    }
    
    template {
      metadata {
        labels = merge(var.labels, {
          "app.kubernetes.io/name"      = "postgresql"
          "app.kubernetes.io/instance"  = var.name_prefix
          "app.kubernetes.io/component" = "database"
        })
        annotations = merge(var.annotations, {
          "prometheus.io/scrape" = "true"
          "prometheus.io/port"   = "9187"
        })
      }
      
      spec {
        container {
          name  = "postgresql"
          image = "postgres:${var.postgres_version}-alpine"
          
          port {
            name           = "postgresql"
            container_port = 5432
            protocol       = "TCP"
          }
          
          env_from {
            secret_ref {
              name = kubernetes_secret.postgresql.metadata[0].name
            }
          }
          
          env {
            name  = "PGDATA"
            value = "/var/lib/postgresql/data/pgdata"
          }
          
          volume_mount {
            name       = "postgresql-data"
            mount_path = "/var/lib/postgresql/data"
          }
          
          volume_mount {
            name       = "postgresql-config"
            mount_path = "/etc/postgresql"
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
                "/bin/sh",
                "-c",
                "pg_isready -U ${var.username} -d ${var.database_name}"
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
                "/bin/sh",
                "-c",
                "pg_isready -U ${var.username} -d ${var.database_name}"
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
                "/bin/sh",
                "-c",
                "pg_isready -U ${var.username} -d ${var.database_name}"
              ]
            }
            initial_delay_seconds = 10
            period_seconds        = 5
            timeout_seconds       = 3
            failure_threshold     = 30
          }
        }
        
        # PostgreSQL Exporter for Prometheus monitoring
        container {
          name  = "postgres-exporter"
          image = "prometheuscommunity/postgres-exporter:v0.11.1"
          
          port {
            name           = "metrics"
            container_port = 9187
            protocol       = "TCP"
          }
          
          env {
            name = "DATA_SOURCE_NAME"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.postgresql.metadata[0].name
                key  = "DATABASE_URL"
              }
            }
          }
          
          resources {
            requests = {
              cpu    = "50m"
              memory = "128Mi"
            }
            limits = {
              cpu    = "200m"
              memory = "256Mi"
            }
          }
          
          liveness_probe {
            http_get {
              path = "/metrics"
              port = 9187
            }
            initial_delay_seconds = 30
            period_seconds        = 30
          }
        }
        
        volume {
          name = "postgresql-data"
          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.postgresql.metadata[0].name
          }
        }
        
        volume {
          name = "postgresql-config"
          config_map {
            name = kubernetes_config_map.postgresql.metadata[0].name
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

# PostgreSQL Service
resource "kubernetes_service" "postgresql" {
  metadata {
    name      = "${var.name_prefix}-postgresql"
    namespace = var.namespace
    labels    = merge(var.labels, {
      "app.kubernetes.io/component" = "database"
      "app.kubernetes.io/name"      = "postgresql"
    })
    annotations = merge(var.annotations, {
      "prometheus.io/scrape" = "true"
      "prometheus.io/port"   = "9187"
      "prometheus.io/path"   = "/metrics"
    })
  }
  
  spec {
    type = "ClusterIP"
    
    port {
      name        = "postgresql"
      port        = 5432
      target_port = 5432
      protocol    = "TCP"
    }
    
    port {
      name        = "metrics"
      port        = 9187
      target_port = 9187
      protocol    = "TCP"
    }
    
    selector = {
      "app.kubernetes.io/name"      = "postgresql"
      "app.kubernetes.io/instance"  = var.name_prefix
      "app.kubernetes.io/component" = "database"
    }
  }
}

# ServiceMonitor for Prometheus (if monitoring is enabled)
resource "kubernetes_manifest" "postgresql_servicemonitor" {
  count = var.enable_monitoring && var.backup_enabled ? 1 : 0
  
  manifest = {
    apiVersion = "monitoring.coreos.com/v1"
    kind       = "ServiceMonitor"
    metadata = {
      name      = "${var.name_prefix}-postgresql"
      namespace = var.namespace
      labels    = merge(var.labels, {
        "app.kubernetes.io/component" = "database"
        "app.kubernetes.io/name"      = "postgresql"
      })
    }
    spec = {
      selector = {
        matchLabels = {
          "app.kubernetes.io/name"      = "postgresql"
          "app.kubernetes.io/instance"  = var.name_prefix
          "app.kubernetes.io/component" = "database"
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