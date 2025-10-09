# Terraform module for RabbitMQ deployment in Kubernetes

# RabbitMQ ConfigMap
resource "kubernetes_config_map" "rabbitmq_config" {
  metadata {
    name      = "rabbitmq-config"
    namespace = var.namespace
    labels = {
      app       = "rabbitmq"
      component = "config"
    }
  }

  data = {
    "rabbitmq.conf" = <<-EOF
      # Networking
      listeners.tcp.default = 5672
      management.tcp.port = 15672
      
      # Logging
      log.console = true
      log.console.level = info
      log.file.level = info
      
      # Memory and disk thresholds
      vm_memory_high_watermark.relative = ${var.memory_high_watermark}
      disk_free_limit.absolute = ${var.disk_free_limit}
      
      # Performance settings
      collect_statistics_interval = 5000
      
      # Management plugin settings
      management.rates_mode = basic
      
      # Prometheus metrics
      prometheus.tcp.port = 15692
      prometheus.path = /metrics
      
      # Cluster settings
      cluster_formation.peer_discovery_backend = k8s
      cluster_formation.k8s.host = kubernetes.default.svc.cluster.local
      cluster_formation.k8s.address_type = hostname
      cluster_formation.k8s.service_name = ${var.service_name}
      cluster_formation.k8s.namespace = ${var.namespace}
      cluster_formation.node_cleanup.interval = 10
      cluster_formation.node_cleanup.only_log_warning = true
      cluster_partition_handling = autoheal
      
      # Queue settings
      queue_master_locator = min-masters
    EOF
    
    "enabled_plugins" = "[rabbitmq_management,rabbitmq_prometheus,rabbitmq_peer_discovery_k8s,rabbitmq_federation,rabbitmq_shovel]."
  }
}

# RabbitMQ Secret
resource "kubernetes_secret" "rabbitmq_secret" {
  metadata {
    name      = "rabbitmq-secret"
    namespace = var.namespace
    labels = {
      app = "rabbitmq"
    }
  }

  data = {
    rabbitmq-username = base64encode(var.rabbitmq_username)
    rabbitmq-password = base64encode(var.rabbitmq_password)
    rabbitmq-erlang-cookie = base64encode(var.erlang_cookie)
  }
}

# RabbitMQ Service (Headless for StatefulSet)
resource "kubernetes_service" "rabbitmq_headless" {
  metadata {
    name      = var.service_name
    namespace = var.namespace
    labels = {
      app = "rabbitmq"
    }
  }

  spec {
    cluster_ip = "None"
    
    selector = {
      app = "rabbitmq"
    }

    port {
      name        = "amqp"
      port        = 5672
      target_port = 5672
      protocol    = "TCP"
    }

    port {
      name        = "management"
      port        = 15672
      target_port = 15672
      protocol    = "TCP"
    }

    port {
      name        = "prometheus"
      port        = 15692
      target_port = 15692
      protocol    = "TCP"
    }

    port {
      name        = "clustering"
      port        = 25672
      target_port = 25672
      protocol    = "TCP"
    }
  }
}

# RabbitMQ Service (LoadBalancer/NodePort for external access)
resource "kubernetes_service" "rabbitmq_external" {
  count = var.enable_external_access ? 1 : 0

  metadata {
    name      = "rabbitmq-external"
    namespace = var.namespace
    labels = {
      app = "rabbitmq"
    }
  }

  spec {
    selector = {
      app = "rabbitmq"
    }

    port {
      name        = "amqp"
      port        = 5672
      target_port = 5672
      node_port   = var.amqp_node_port
      protocol    = "TCP"
    }

    port {
      name        = "management"
      port        = 15672
      target_port = 15672
      node_port   = var.management_node_port
      protocol    = "TCP"
    }

    type = var.external_service_type
  }
}

# RabbitMQ StatefulSet
resource "kubernetes_stateful_set" "rabbitmq" {
  metadata {
    name      = "rabbitmq"
    namespace = var.namespace
    labels = {
      app = "rabbitmq"
    }
  }

  spec {
    service_name = kubernetes_service.rabbitmq_headless.metadata[0].name
    replicas     = var.replicas

    selector {
      match_labels = {
        app = "rabbitmq"
      }
    }

    template {
      metadata {
        labels = {
          app = "rabbitmq"
        }
        annotations = {
          "prometheus.io/scrape" = "true"
          "prometheus.io/port"   = "15692"
          "prometheus.io/path"   = "/metrics"
        }
      }

      spec {
        service_account_name = kubernetes_service_account.rabbitmq.metadata[0].name
        
        init_container {
          name  = "rabbitmq-config"
          image = "busybox:1.35"
          command = [
            "sh", "-c",
            "cp /tmp/rabbitmq/* /etc/rabbitmq/ && chmod 600 /etc/rabbitmq/*"
          ]
          
          volume_mount {
            name       = "config"
            mount_path = "/tmp/rabbitmq"
          }
          
          volume_mount {
            name       = "rabbitmq-config"
            mount_path = "/etc/rabbitmq"
          }
        }

        container {
          name  = "rabbitmq"
          image = var.rabbitmq_image

          port {
            name           = "amqp"
            container_port = 5672
            protocol       = "TCP"
          }

          port {
            name           = "management"
            container_port = 15672
            protocol       = "TCP"
          }

          port {
            name           = "prometheus"
            container_port = 15692
            protocol       = "TCP"
          }

          port {
            name           = "clustering"
            container_port = 25672
            protocol       = "TCP"
          }

          env {
            name = "RABBITMQ_DEFAULT_USER"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.rabbitmq_secret.metadata[0].name
                key  = "rabbitmq-username"
              }
            }
          }

          env {
            name = "RABBITMQ_DEFAULT_PASS"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.rabbitmq_secret.metadata[0].name
                key  = "rabbitmq-password"
              }
            }
          }

          env {
            name = "RABBITMQ_ERLANG_COOKIE"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.rabbitmq_secret.metadata[0].name
                key  = "rabbitmq-erlang-cookie"
              }
            }
          }

          env {
            name  = "RABBITMQ_DEFAULT_VHOST"
            value = var.default_vhost
          }

          env {
            name  = "RABBITMQ_USE_LONGNAME"
            value = "true"
          }

          env {
            name = "RABBITMQ_NODENAME"
            value = "rabbit@$(hostname).${kubernetes_service.rabbitmq_headless.metadata[0].name}.${var.namespace}.svc.cluster.local"
          }

          env {
            name  = "K8S_SERVICE_NAME"
            value = kubernetes_service.rabbitmq_headless.metadata[0].name
          }

          env {
            name  = "K8S_HOSTNAME_SUFFIX"
            value = ".${kubernetes_service.rabbitmq_headless.metadata[0].name}.${var.namespace}.svc.cluster.local"
          }

          volume_mount {
            name       = "rabbitmq-data"
            mount_path = "/var/lib/rabbitmq"
          }

          volume_mount {
            name       = "rabbitmq-config"
            mount_path = "/etc/rabbitmq"
          }

          liveness_probe {
            exec {
              command = ["rabbitmq-diagnostics", "-q", "ping"]
            }
            initial_delay_seconds = 120
            period_seconds        = 30
            timeout_seconds       = 20
            failure_threshold     = 3
          }

          readiness_probe {
            exec {
              command = ["rabbitmq-diagnostics", "-q", "check_running"]
            }
            initial_delay_seconds = 30
            period_seconds        = 10
            timeout_seconds       = 20
            failure_threshold     = 3
          }

          resources {
            requests = {
              cpu    = var.resources.requests.cpu
              memory = var.resources.requests.memory
            }
            limits = {
              cpu    = var.resources.limits.cpu
              memory = var.resources.limits.memory
            }
          }
        }

        volume {
          name = "config"
          config_map {
            name = kubernetes_config_map.rabbitmq_config.metadata[0].name
          }
        }

        volume {
          name = "rabbitmq-config"
          empty_dir {}
        }
      }
    }

    volume_claim_template {
      metadata {
        name = "rabbitmq-data"
        labels = {
          app = "rabbitmq"
        }
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
    }

    update_strategy {
      type = "RollingUpdate"
      rolling_update {
        partition = 0
      }
    }
  }
}

# ServiceAccount for RabbitMQ
resource "kubernetes_service_account" "rabbitmq" {
  metadata {
    name      = "rabbitmq"
    namespace = var.namespace
    labels = {
      app = "rabbitmq"
    }
  }
}

# ClusterRole for RabbitMQ peer discovery
resource "kubernetes_cluster_role" "rabbitmq" {
  metadata {
    name = "rabbitmq-${var.namespace}"
    labels = {
      app = "rabbitmq"
    }
  }

  rule {
    api_groups = [""]
    resources  = ["endpoints"]
    verbs      = ["get"]
  }

  rule {
    api_groups = [""]
    resources  = ["events"]
    verbs      = ["create"]
  }
}

# ClusterRoleBinding for RabbitMQ
resource "kubernetes_cluster_role_binding" "rabbitmq" {
  metadata {
    name = "rabbitmq-${var.namespace}"
    labels = {
      app = "rabbitmq"
    }
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = kubernetes_cluster_role.rabbitmq.metadata[0].name
  }

  subject {
    kind      = "ServiceAccount"
    name      = kubernetes_service_account.rabbitmq.metadata[0].name
    namespace = var.namespace
  }
}

# ServiceMonitor for Prometheus
resource "kubernetes_manifest" "rabbitmq_service_monitor" {
  count = var.enable_monitoring ? 1 : 0

  manifest = {
    apiVersion = "monitoring.coreos.com/v1"
    kind       = "ServiceMonitor"
    metadata = {
      name      = "rabbitmq"
      namespace = var.namespace
      labels = {
        app = "rabbitmq"
      }
    }
    spec = {
      selector = {
        matchLabels = {
          app = "rabbitmq"
        }
      }
      endpoints = [
        {
          port     = "prometheus"
          interval = "30s"
          path     = "/metrics"
        }
      ]
    }
  }
}