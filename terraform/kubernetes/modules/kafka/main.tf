# Terraform module for Apache Kafka deployment in Kubernetes

# Kafka ConfigMap
resource "kubernetes_config_map" "kafka_config" {
  metadata {
    name      = "kafka-config"
    namespace = var.namespace
    labels = {
      app       = "kafka"
      component = "config"
    }
  }

  data = {
    "server.properties" = <<-EOF
      # Kafka Broker Configuration
      broker.id=${var.broker_id}
      
      # Network Configuration
      listeners=PLAINTEXT://0.0.0.0:9092
      advertised.listeners=PLAINTEXT://${var.advertised_host}:9092
      listener.security.protocol.map=PLAINTEXT:PLAINTEXT
      
      # Zookeeper Configuration
      zookeeper.connect=${var.zookeeper_connect}
      zookeeper.connection.timeout.ms=6000
      
      # Topic Configuration
      num.network.threads=3
      num.io.threads=8
      socket.send.buffer.bytes=102400
      socket.receive.buffer.bytes=102400
      socket.request.max.bytes=104857600
      
      # Log Configuration
      log.dirs=/kafka/kafka-logs
      num.partitions=${var.default_partitions}
      num.recovery.threads.per.data.dir=1
      offsets.topic.replication.factor=${var.replication_factor}
      transaction.state.log.replication.factor=${var.replication_factor}
      transaction.state.log.min.isr=${var.min_isr}
      
      # Log Retention
      log.retention.hours=${var.log_retention_hours}
      log.segment.bytes=${var.log_segment_bytes}
      log.retention.check.interval.ms=300000
      
      # Group Coordinator Configuration
      group.initial.rebalance.delay.ms=0
      
      # Auto Topic Creation
      auto.create.topics.enable=${var.auto_create_topics}
      delete.topic.enable=true
      
      # Message Size Configuration
      message.max.bytes=${var.message_max_bytes}
      replica.fetch.max.bytes=${var.replica_fetch_max_bytes}
      
      # JMX Configuration
      jmx.port=9101
    EOF
    
    "log4j.properties" = <<-EOF
      log4j.rootLogger=INFO, stdout
      
      log4j.appender.stdout=org.apache.log4j.ConsoleAppender
      log4j.appender.stdout.layout=org.apache.log4j.PatternLayout
      log4j.appender.stdout.layout.ConversionPattern=[%d] %p %m (%c)%n
      
      log4j.appender.kafkaAppender=org.apache.log4j.DailyRollingFileAppender
      log4j.appender.kafkaAppender.DatePattern='.'yyyy-MM-dd-HH
      log4j.appender.kafkaAppender.File=/kafka/logs/server.log
      log4j.appender.kafkaAppender.layout=org.apache.log4j.PatternLayout
      log4j.appender.kafkaAppender.layout.ConversionPattern=[%d] %p %m (%c)%n
      
      log4j.logger.kafka=INFO, kafkaAppender
      log4j.logger.org.apache.kafka=INFO, kafkaAppender
      log4j.additivity.kafka=false
      log4j.additivity.org.apache.kafka=false
    EOF
  }
}

# Kafka Service
resource "kubernetes_service" "kafka_service" {
  metadata {
    name      = "kafka"
    namespace = var.namespace
    labels = {
      app = "kafka"
    }
  }

  spec {
    selector = {
      app = "kafka"
    }

    port {
      name        = "kafka"
      port        = 9092
      target_port = 9092
      protocol    = "TCP"
    }

    port {
      name        = "jmx"
      port        = 9101
      target_port = 9101
      protocol    = "TCP"
    }

    cluster_ip = "None"  # Headless service for StatefulSet
  }
}

# Kafka StatefulSet
resource "kubernetes_stateful_set" "kafka" {
  metadata {
    name      = "kafka"
    namespace = var.namespace
    labels = {
      app = "kafka"
    }
  }

  spec {
    service_name = kubernetes_service.kafka_service.metadata[0].name
    replicas     = var.replicas

    selector {
      match_labels = {
        app = "kafka"
      }
    }

    template {
      metadata {
        labels = {
          app = "kafka"
        }
        annotations = {
          "prometheus.io/scrape" = "true"
          "prometheus.io/port"   = "9101"
          "prometheus.io/path"   = "/metrics"
        }
      }

      spec {
        termination_grace_period_seconds = 30

        init_container {
          name  = "init-kafka"
          image = "busybox:1.35"
          command = [
            "sh", "-c",
            "until nc -z ${var.zookeeper_service_name} 2181; do echo 'Waiting for Zookeeper...'; sleep 2; done; echo 'Zookeeper is ready'"
          ]
        }

        container {
          name  = "kafka"
          image = var.kafka_image

          port {
            name           = "kafka"
            container_port = 9092
            protocol       = "TCP"
          }

          port {
            name           = "jmx"
            container_port = 9101
            protocol       = "TCP"
          }

          env {
            name = "KAFKA_BROKER_ID"
            value_from {
              field_ref {
                field_path = "metadata.annotations['kafka.broker.id']"
              }
            }
          }

          env {
            name  = "KAFKA_ZOOKEEPER_CONNECT"
            value = var.zookeeper_connect
          }

          env {
            name  = "KAFKA_LISTENERS"
            value = "PLAINTEXT://0.0.0.0:9092"
          }

          env {
            name = "KAFKA_ADVERTISED_LISTENERS"
            value_from {
              field_ref {
                field_path = "status.podIP"
              }
            }
          }

          env {
            name  = "KAFKA_LISTENER_SECURITY_PROTOCOL_MAP"
            value = "PLAINTEXT:PLAINTEXT"
          }

          env {
            name  = "KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR"
            value = tostring(var.replication_factor)
          }

          env {
            name  = "KAFKA_TRANSACTION_STATE_LOG_MIN_ISR"
            value = tostring(var.min_isr)
          }

          env {
            name  = "KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR"
            value = tostring(var.replication_factor)
          }

          env {
            name  = "KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS"
            value = "0"
          }

          env {
            name  = "KAFKA_JMX_PORT"
            value = "9101"
          }

          env {
            name  = "KAFKA_JMX_HOSTNAME"
            value = "localhost"
          }

          env {
            name  = "KAFKA_AUTO_CREATE_TOPICS_ENABLE"
            value = tostring(var.auto_create_topics)
          }

          env {
            name  = "KAFKA_DELETE_TOPIC_ENABLE"
            value = "true"
          }

          env {
            name  = "KAFKA_LOG_RETENTION_HOURS"
            value = tostring(var.log_retention_hours)
          }

          env {
            name  = "KAFKA_LOG_SEGMENT_BYTES"
            value = tostring(var.log_segment_bytes)
          }

          env {
            name  = "KAFKA_MESSAGE_MAX_BYTES"
            value = tostring(var.message_max_bytes)
          }

          env {
            name  = "KAFKA_REPLICA_FETCH_MAX_BYTES"
            value = tostring(var.replica_fetch_max_bytes)
          }

          volume_mount {
            name       = "kafka-data"
            mount_path = "/var/lib/kafka/data"
          }

          volume_mount {
            name       = "kafka-logs"
            mount_path = "/kafka/logs"
          }

          volume_mount {
            name       = "kafka-config"
            mount_path = "/etc/kafka"
          }

          liveness_probe {
            exec {
              command = [
                "sh", "-c",
                "kafka-broker-api-versions --bootstrap-server localhost:9092"
              ]
            }
            initial_delay_seconds = 60
            period_seconds        = 30
            timeout_seconds       = 10
            failure_threshold     = 3
          }

          readiness_probe {
            exec {
              command = [
                "sh", "-c",
                "kafka-topics --bootstrap-server localhost:9092 --list"
              ]
            }
            initial_delay_seconds = 30
            period_seconds        = 10
            timeout_seconds       = 5
            failure_threshold     = 5
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
          name = "kafka-config"
          config_map {
            name = kubernetes_config_map.kafka_config.metadata[0].name
          }
        }
      }
    }

    volume_claim_template {
      metadata {
        name = "kafka-data"
        labels = {
          app = "kafka"
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

    volume_claim_template {
      metadata {
        name = "kafka-logs"
        labels = {
          app = "kafka"
        }
      }
      spec {
        access_modes       = ["ReadWriteOnce"]
        storage_class_name = var.storage_class
        resources {
          requests = {
            storage = "5Gi"
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

# Kafka External Service (for external access)
resource "kubernetes_service" "kafka_external" {
  count = var.enable_external_access ? 1 : 0

  metadata {
    name      = "kafka-external"
    namespace = var.namespace
    labels = {
      app = "kafka"
    }
  }

  spec {
    selector = {
      app = "kafka"
    }

    port {
      name        = "kafka"
      port        = 9092
      target_port = 9092
      node_port   = var.external_node_port
      protocol    = "TCP"
    }

    type = "NodePort"
  }
}

# Kafka ServiceMonitor for Prometheus
resource "kubernetes_manifest" "kafka_service_monitor" {
  count = var.enable_monitoring ? 1 : 0

  manifest = {
    apiVersion = "monitoring.coreos.com/v1"
    kind       = "ServiceMonitor"
    metadata = {
      name      = "kafka"
      namespace = var.namespace
      labels = {
        app = "kafka"
      }
    }
    spec = {
      selector = {
        matchLabels = {
          app = "kafka"
        }
      }
      endpoints = [
        {
          port     = "jmx"
          interval = "30s"
          path     = "/metrics"
        }
      ]
    }
  }
}