# ConfigMap for Zookeeper configuration
resource "kubernetes_config_map" "zookeeper" {
  metadata {
    name      = "${var.name_prefix}-zookeeper-config"
    namespace = var.namespace
    labels    = merge(var.labels, {
      "app.kubernetes.io/component" = "coordination"
      "app.kubernetes.io/name"      = "zookeeper"
    })
    annotations = var.annotations
  }
  
  data = {
    # Zookeeper Configuration
    ZOOKEEPER_CLIENT_PORT = tostring(var.client_port)
    ZOOKEEPER_TICK_TIME = tostring(var.tick_time)
    ZOOKEEPER_INIT_LIMIT = tostring(var.init_limit)
    ZOOKEEPER_SYNC_LIMIT = tostring(var.sync_limit)
    ZOOKEEPER_MAX_CLIENT_CNXNS = tostring(var.max_client_connections)
    ZOOKEEPER_AUTOPURGE_SNAP_RETAIN_COUNT = tostring(var.autopurge_snap_retain_count)
    ZOOKEEPER_AUTOPURGE_PURGE_INTERVAL = tostring(var.autopurge_purge_interval)
    ZOOKEEPER_4LW_COMMANDS_WHITELIST = "mntr,conf,ruok,stat,srvr,cons,dump,envi,reqs,wchs,wchc,wchp"
    
    # JMX Configuration
    KAFKA_JMX_HOSTNAME = "localhost"
    KAFKA_JMX_PORT = var.enable_jmx ? tostring(var.jmx_port) : ""
    KAFKA_JMX_OPTS = var.enable_jmx ? "-Dcom.sun.management.jmxremote -Dcom.sun.management.jmxremote.authenticate=false -Dcom.sun.management.jmxremote.ssl=false -Dcom.sun.management.jmxremote.local.only=false -Dcom.sun.management.jmxremote.port=${var.jmx_port} -Dcom.sun.management.jmxremote.rmi.port=${var.jmx_port}" : ""
    
    # Logging Configuration
    ZOOKEEPER_LOG4J_ROOT_LOGLEVEL = "INFO"
    ZOOKEEPER_LOG4J_PROP = "INFO,CONSOLE,ROLLINGFILE"
    
    # Data and Log Directories
    ZOOKEEPER_DATA_DIR = "/var/lib/zookeeper/data"
    ZOOKEEPER_LOG_DIR = "/var/lib/zookeeper/log"
    
    # Custom zoo.cfg
    "zoo.cfg" = <<-EOF
      # Basic time unit in milliseconds used by ZooKeeper
      tickTime=${var.tick_time}
      
      # The number of ticks that the initial synchronization phase can take
      initLimit=${var.init_limit}
      
      # The number of ticks that can pass between sending a request and getting an acknowledgement
      syncLimit=${var.sync_limit}
      
      # Data directory
      dataDir=/var/lib/zookeeper/data
      
      # Log directory
      dataLogDir=/var/lib/zookeeper/log
      
      # Port at which the clients will connect
      clientPort=${var.client_port}
      
      # Maximum number of client connections
      maxClientCnxns=${var.max_client_connections}
      
      # Autopurge settings
      autopurge.snapRetainCount=${var.autopurge_snap_retain_count}
      autopurge.purgeInterval=${var.autopurge_purge_interval}
      
      # Admin server configuration
      admin.enableServer=true
      admin.serverPort=8080
      
      # 4lw commands whitelist
      4lw.commands.whitelist=mntr,conf,ruok,stat,srvr,cons,dump,envi,reqs,wchs,wchc,wchp
      
      # Performance tuning
      preAllocSize=65536
      snapCount=100000
      maxSessionTimeout=40000
      minSessionTimeout=4000
      
      # Security (if needed)
      # authProvider.1=org.apache.zookeeper.server.auth.SASLAuthenticationProvider
      # requireClientAuthScheme=sasl
    EOF
    
    # Log4j configuration
    "log4j.properties" = <<-EOF
      # Root logger
      log4j.rootLogger=INFO, CONSOLE, ROLLINGFILE
      
      # Console appender
      log4j.appender.CONSOLE=org.apache.log4j.ConsoleAppender
      log4j.appender.CONSOLE.layout=org.apache.log4j.PatternLayout
      log4j.appender.CONSOLE.layout.ConversionPattern=%d{ISO8601} [myid:%X{myid}] - %-5p [%t:%C{1}@%L] - %m%n
      
      # Rolling file appender
      log4j.appender.ROLLINGFILE=org.apache.log4j.RollingFileAppender
      log4j.appender.ROLLINGFILE.File=/var/lib/zookeeper/log/zookeeper.log
      log4j.appender.ROLLINGFILE.MaxFileSize=10MB
      log4j.appender.ROLLINGFILE.MaxBackupIndex=10
      log4j.appender.ROLLINGFILE.layout=org.apache.log4j.PatternLayout
      log4j.appender.ROLLINGFILE.layout.ConversionPattern=%d{ISO8601} [myid:%X{myid}] - %-5p [%t:%C{1}@%L] - %m%n
      
      # Suppress noisy classes
      log4j.logger.org.apache.zookeeper.server.NIOServerCnxn=WARN
      log4j.logger.org.apache.zookeeper.server.NIOServerCnxnFactory=WARN
      log4j.logger.org.apache.zookeeper.server.NettyServerCnxnFactory=WARN
      log4j.logger.org.apache.zookeeper.ClientCnxn=WARN
    EOF
  }
}

# Persistent Volume Claim for Zookeeper data
resource "kubernetes_persistent_volume_claim" "zookeeper_data" {
  metadata {
    name      = "${var.name_prefix}-zookeeper-data"
    namespace = var.namespace
    labels    = merge(var.labels, {
      "app.kubernetes.io/component" = "coordination"
      "app.kubernetes.io/name"      = "zookeeper"
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

# Persistent Volume Claim for Zookeeper logs
resource "kubernetes_persistent_volume_claim" "zookeeper_logs" {
  metadata {
    name      = "${var.name_prefix}-zookeeper-logs"
    namespace = var.namespace
    labels    = merge(var.labels, {
      "app.kubernetes.io/component" = "coordination"
      "app.kubernetes.io/name"      = "zookeeper"
    })
    annotations = var.annotations
  }
  
  spec {
    access_modes       = ["ReadWriteOnce"]
    storage_class_name = var.storage_class
    
    resources {
      requests = {
        storage = "5Gi"  # Smaller size for logs
      }
    }
  }
  
  wait_until_bound = false
}

# Zookeeper Deployment
resource "kubernetes_deployment" "zookeeper" {
  metadata {
    name      = "${var.name_prefix}-zookeeper"
    namespace = var.namespace
    labels    = merge(var.labels, {
      "app.kubernetes.io/component" = "coordination"
      "app.kubernetes.io/name"      = "zookeeper"
    })
    annotations = var.annotations
  }
  
  spec {
    replicas = 1  # Single node for simplicity; can be scaled to 3 or 5 for HA
    
    strategy {
      type = "Recreate"  # Important for single-node Zookeeper
    }
    
    selector {
      match_labels = {
        "app.kubernetes.io/name"      = "zookeeper"
        "app.kubernetes.io/instance"  = var.name_prefix
        "app.kubernetes.io/component" = "coordination"
      }
    }
    
    template {
      metadata {
        labels = merge(var.labels, {
          "app.kubernetes.io/name"      = "zookeeper"
          "app.kubernetes.io/instance"  = var.name_prefix
          "app.kubernetes.io/component" = "coordination"
        })
        annotations = merge(var.annotations, {
          "prometheus.io/scrape" = var.enable_jmx ? "true" : "false"
          "prometheus.io/port"   = var.enable_jmx ? tostring(var.jmx_port) : ""
        })
      }
      
      spec {
        container {
          name  = "zookeeper"
          image = "confluentinc/cp-zookeeper:${var.zookeeper_version}"
          
          port {
            name           = "client"
            container_port = var.client_port
            protocol       = "TCP"
          }
          
          port {
            name           = "peer"
            container_port = 2888
            protocol       = "TCP"
          }
          
          port {
            name           = "leader-election"
            container_port = 3888
            protocol       = "TCP"
          }
          
          port {
            name           = "admin"
            container_port = 8080
            protocol       = "TCP"
          }
          
          dynamic "port" {
            for_each = var.enable_jmx ? [1] : []
            content {
              name           = "jmx"
              container_port = var.jmx_port
              protocol       = "TCP"
            }
          }
          
          env_from {
            config_map_ref {
              name = kubernetes_config_map.zookeeper.metadata[0].name
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
          
          # Set ZooKeeper ID for cluster mode (can be enhanced for multi-node)
          env {
            name  = "ZOOKEEPER_SERVER_ID"
            value = "1"
          }
          
          volume_mount {
            name       = "zookeeper-data"
            mount_path = "/var/lib/zookeeper/data"
          }
          
          volume_mount {
            name       = "zookeeper-logs"
            mount_path = "/var/lib/zookeeper/log"
          }
          
          volume_mount {
            name       = "zookeeper-config"
            mount_path = "/etc/zookeeper"
          }

            # Writable directory for runtime-generated secrets (avoid writing into ConfigMap)
            volume_mount {
              name       = "zookeeper-secrets"
              mount_path = "/etc/zookeeper/secrets"
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
                "sh", "-c",
                "echo srvr | nc localhost ${var.client_port} | grep -q Zookeeper"
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
                "sh", "-c",
                "echo srvr | nc localhost ${var.client_port} | grep -q Zookeeper"
              ]
            }
            initial_delay_seconds = 10
            period_seconds        = 5
            timeout_seconds       = 3
            failure_threshold     = 3
          }
          
          startup_probe {
            exec {
              command = [
                "sh", "-c",
                "echo srvr | nc localhost ${var.client_port} | grep -q Zookeeper"
              ]
            }
            initial_delay_seconds = 15
            period_seconds        = 5
            timeout_seconds       = 3
            failure_threshold     = 30
          }
        }
        
        # JMX Exporter for Prometheus monitoring
        dynamic "container" {
          for_each = var.enable_jmx ? [1] : []
          content {
            name  = "jmx-exporter"
            image = "sscaling/jmx-prometheus-exporter:0.17.0"
            
            port {
              name           = "metrics"
              container_port = 5556
              protocol       = "TCP"
            }
            
            env {
              name  = "CONFIG_YML"
              value = "/etc/jmx-exporter/config.yml"
            }
            
            volume_mount {
              name       = "jmx-config"
              mount_path = "/etc/jmx-exporter"
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
                port = 5556
              }
              initial_delay_seconds = 30
              period_seconds        = 30
            }
          }
        }
        
        volume {
          name = "zookeeper-data"
          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.zookeeper_data.metadata[0].name
          }
        }
        
        volume {
          name = "zookeeper-logs"
          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.zookeeper_logs.metadata[0].name
          }
        }
        
        volume {
          name = "zookeeper-config"
          config_map {
            name = kubernetes_config_map.zookeeper.metadata[0].name
          }
        }

        # Writable emptyDir for runtime-generated secrets under /etc/zookeeper/secrets
        volume {
          name = "zookeeper-secrets"
          empty_dir {}
        }
        
        # JMX exporter configuration
        dynamic "volume" {
          for_each = var.enable_jmx ? [1] : []
          content {
            name = "jmx-config"
            config_map {
              name = kubernetes_config_map.jmx_config[0].metadata[0].name
            }
          }
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

# JMX Exporter Configuration
resource "kubernetes_config_map" "jmx_config" {
  count = var.enable_jmx ? 1 : 0
  
  metadata {
    name      = "${var.name_prefix}-zookeeper-jmx-config"
    namespace = var.namespace
    labels    = merge(var.labels, {
      "app.kubernetes.io/component" = "coordination"
      "app.kubernetes.io/name"      = "zookeeper"
    })
    annotations = var.annotations
  }
  
  data = {
    "config.yml" = yamlencode({
      hostPort = "localhost:${var.jmx_port}"
      rules = [
        {
          pattern = "org.apache.ZooKeeperService<name0=ReplicatedServer_id(\\d+)><>(\\w+)"
          name = "zookeeper_$2"
          labels = {
            replicaId = "$1"
          }
        },
        {
          pattern = "org.apache.ZooKeeperService<name0=ReplicatedServer_id(\\d+), name1=replica.(\\d+)><>(\\w+)"
          name = "zookeeper_$3"
          labels = {
            replicaId = "$2"
          }
        },
        {
          pattern = "org.apache.ZooKeeperService<name0=ReplicatedServer_id(\\d+), name1=replica.(\\d+), name2=(\\w+)><>(\\w+)"
          name = "zookeeper_$4"
          labels = {
            replicaId = "$2"
            memberType = "$3"
          }
        },
        {
          pattern = "org.apache.ZooKeeperService<name0=ReplicatedServer_id(\\d+), name1=replica.(\\d+), name2=(\\w+), name3=(\\w+)><>(\\w+)"
          name = "zookeeper_$4_$5"
          labels = {
            replicaId = "$2"
            memberType = "$3"
          }
        }
      ]
    })
  }
}

# Zookeeper Service
resource "kubernetes_service" "zookeeper" {
  metadata {
    name      = "${var.name_prefix}-zookeeper"
    namespace = var.namespace
    labels    = merge(var.labels, {
      "app.kubernetes.io/component" = "coordination"
      "app.kubernetes.io/name"      = "zookeeper"
    })
    annotations = merge(var.annotations, {
      "prometheus.io/scrape" = var.enable_jmx ? "true" : "false"
      "prometheus.io/port"   = var.enable_jmx ? "5556" : ""
      "prometheus.io/path"   = "/metrics"
    })
  }
  
  spec {
    type = "ClusterIP"
    
    port {
      name        = "client"
      port        = var.client_port
      target_port = var.client_port
      protocol    = "TCP"
    }
    
    port {
      name        = "peer"
      port        = 2888
      target_port = 2888
      protocol    = "TCP"
    }
    
    port {
      name        = "leader-election"
      port        = 3888
      target_port = 3888
      protocol    = "TCP"
    }
    
    port {
      name        = "admin"
      port        = 8080
      target_port = 8080
      protocol    = "TCP"
    }
    
    dynamic "port" {
      for_each = var.enable_jmx ? [1] : []
      content {
        name        = "jmx"
        port        = var.jmx_port
        target_port = var.jmx_port
        protocol    = "TCP"
      }
    }
    
    dynamic "port" {
      for_each = var.enable_jmx ? [1] : []
      content {
        name        = "metrics"
        port        = 5556
        target_port = 5556
        protocol    = "TCP"
      }
    }
    
    selector = {
      "app.kubernetes.io/name"      = "zookeeper"
      "app.kubernetes.io/instance"  = var.name_prefix
      "app.kubernetes.io/component" = "coordination"
    }
  }
}

# ServiceMonitor for Prometheus (if monitoring is enabled)
resource "kubernetes_manifest" "zookeeper_servicemonitor" {
  count = var.enable_jmx ? 1 : 0
  
  manifest = {
    apiVersion = "monitoring.coreos.com/v1"
    kind       = "ServiceMonitor"
    metadata = {
      name      = "${var.name_prefix}-zookeeper"
      namespace = var.namespace
      labels    = merge(var.labels, {
        "app.kubernetes.io/component" = "coordination"
        "app.kubernetes.io/name"      = "zookeeper"
      })
    }
    spec = {
      selector = {
        matchLabels = {
          "app.kubernetes.io/name"      = "zookeeper"
          "app.kubernetes.io/instance"  = var.name_prefix
          "app.kubernetes.io/component" = "coordination"
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