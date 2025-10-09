# ConfigMap for frontend configuration
resource "kubernetes_config_map" "frontend" {
  metadata {
    name      = "${var.name_prefix}-frontend-config"
    namespace = var.namespace
    labels    = merge(var.labels, {
      "app.kubernetes.io/component" = "frontend"
      "app.kubernetes.io/name"      = "react"
    })
    annotations = var.annotations
  }

  data = {
    NODE_ENV                  = var.node_env
    REACT_APP_ENVIRONMENT     = var.environment
    REACT_APP_API_URL         = var.api_url
    REACT_APP_VERSION         = "1.0.0"
    GENERATE_SOURCEMAP        = var.environment == "development" ? "true" : "false"

    # Nginx configuration
    "nginx.conf" = <<-EOF
      user nginx;
      worker_processes auto;
      error_log /var/log/nginx/error.log notice;
      pid /var/run/nginx.pid;

      events {
          worker_connections 1024;
          use epoll;
          multi_accept on;
      }

      http {
          include /etc/nginx/mime.types;
          default_type application/octet-stream;

          # Logging
          log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                         '$status $body_bytes_sent "$http_referer" '
                         '"$http_user_agent" "$http_x_forwarded_for"';

          access_log /var/log/nginx/access.log main;

          # Performance
          sendfile on;
          tcp_nopush on;
          tcp_nodelay on;
          keepalive_timeout 65;
          types_hash_max_size 2048;

          # Gzip compression
          gzip on;
          gzip_vary on;
          gzip_min_length 1024;
          gzip_proxied any;
          gzip_comp_level 6;
          gzip_types
              text/plain
              text/css
              text/xml
              text/javascript
              application/json
              application/javascript
              application/xml+rss
              application/atom+xml
              image/svg+xml;

          # Security headers
          add_header X-Frame-Options "SAMEORIGIN" always;
          add_header X-Content-Type-Options "nosniff" always;
          add_header X-XSS-Protection "1; mode=block" always;
          add_header Referrer-Policy "no-referrer-when-downgrade" always;
          add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

          server {
              listen 80;
              server_name _;
              root /usr/share/nginx/html;
              index index.html;

              # Health check endpoint
              location /health {
                  access_log off;
                  return 200 "healthy\n";
                  add_header Content-Type text/plain;
              }

              # API proxy
              location /api/ {
                  proxy_pass ${var.api_url}/;
                  proxy_set_header Host $host;
                  proxy_set_header X-Real-IP $remote_addr;
                  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                  proxy_set_header X-Forwarded-Proto $scheme;

                  # Timeouts
                  proxy_connect_timeout 60s;
                  proxy_send_timeout 60s;
                  proxy_read_timeout 60s;

                  # Buffering
                  proxy_buffering on;
                  proxy_buffer_size 4k;
                  proxy_buffers 8 4k;
                  proxy_busy_buffers_size 8k;
              }

              # Admin proxy
              location /admin/ {
                  proxy_pass ${var.api_url}/admin/;
                  proxy_set_header Host $host;
                  proxy_set_header X-Real-IP $remote_addr;
                  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                  proxy_set_header X-Forwarded-Proto $scheme;

                  # Timeouts
                  proxy_connect_timeout 60s;
                  proxy_send_timeout 60s;
                  proxy_read_timeout 60s;
              }

              # Static files with caching
              location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
                  expires 1y;
                  add_header Cache-Control "public, immutable";
                  try_files $uri =404;
              }

              # React app - handle client-side routing
              location / {
                  try_files $uri $uri/ /index.html;

                  # Cache control for HTML files
                  location ~* \.(html)$ {
                      expires -1;
                      add_header Cache-Control "no-cache, no-store, must-revalidate";
                      add_header Pragma "no-cache";
                  }
              }

              # Error pages
              error_page 404 /index.html;
              error_page 500 502 503 504 /50x.html;
              location = /50x.html {
                  root /usr/share/nginx/html;
              }
          }
      }
    EOF
  }
}

# Frontend Deployment
resource "kubernetes_deployment" "frontend" {
  metadata {
    name      = "${var.name_prefix}-frontend"
    namespace = var.namespace
    labels    = merge(var.labels, {
      "app.kubernetes.io/component" = "frontend"
      "app.kubernetes.io/name"      = "react"
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
        "app.kubernetes.io/name"      = "react"
        "app.kubernetes.io/instance"  = var.name_prefix
        "app.kubernetes.io/component" = "frontend"
      }
    }

    template {
      metadata {
        labels = merge(var.labels, {
          "app.kubernetes.io/name"      = "react"
          "app.kubernetes.io/instance"  = var.name_prefix
          "app.kubernetes.io/component" = "frontend"
        })
        annotations = merge(var.annotations, {
          "prometheus.io/scrape" = "true"
          "prometheus.io/port"   = "9113"
          "prometheus.io/path"   = "/metrics"
        })
      }

      spec {
        dynamic "image_pull_secrets" {
          for_each = var.image_pull_secrets
          content {
            name = image_pull_secrets.value
          }
        }

        container {
          name  = "nginx"
          image = "${var.image_registry}/${var.image_repository}:${var.image_tag}"

          port {
            name           = "http"
            container_port = 80
            protocol       = "TCP"
          }

          env_from {
            config_map_ref {
              name = kubernetes_config_map.frontend.metadata[0].name
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
            name       = "nginx-config"
            mount_path = "/etc/nginx/nginx.conf"
            sub_path   = "nginx.conf"
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
              path = "/health"
              port = 80
            }
            initial_delay_seconds = 30
            period_seconds        = 10
            timeout_seconds       = 5
            failure_threshold     = 3
          }

          readiness_probe {
            http_get {
              path = "/health"
              port = 80
            }
            initial_delay_seconds = 5
            period_seconds        = 5
            timeout_seconds       = 3
            failure_threshold     = 3
          }

          startup_probe {
            http_get {
              path = "/health"
              port = 80
            }
            initial_delay_seconds = 10
            period_seconds        = 5
            timeout_seconds       = 3
            failure_threshold     = 30
          }
        }

        # Nginx Prometheus Exporter
        container {
          name  = "nginx-exporter"
          image = "nginx/nginx-prometheus-exporter:0.10.0"

          args = [
            "-nginx.scrape-uri=http://localhost:80/nginx_status"
          ]

          port {
            name           = "metrics"
            container_port = 9113
            protocol       = "TCP"
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
              port = 9113
            }
            initial_delay_seconds = 30
            period_seconds        = 30
          }
        }

        volume {
          name = "nginx-config"
          config_map {
            name = kubernetes_config_map.frontend.metadata[0].name
          }
        }

        security_context {
          run_as_user     = 101
          run_as_group    = 101
          run_as_non_root = true
        }
      }
    }
  }
}

# Frontend Service
resource "kubernetes_service" "frontend" {
  metadata {
    name      = "${var.name_prefix}-frontend"
    namespace = var.namespace
    labels    = merge(var.labels, {
      "app.kubernetes.io/component" = "frontend"
      "app.kubernetes.io/name"      = "react"
    })
    annotations = merge(var.annotations, {
      "prometheus.io/scrape" = "true"
      "prometheus.io/port"   = "9113"
      "prometheus.io/path"   = "/metrics"
    })
  }

  spec {
    type = "ClusterIP"

    port {
      name        = "http"
      port        = 80
      target_port = 80
      protocol    = "TCP"
    }

    port {
      name        = "metrics"
      port        = 9113
      target_port = 9113
      protocol    = "TCP"
    }

    selector = {
      "app.kubernetes.io/name"      = "react"
      "app.kubernetes.io/instance"  = var.name_prefix
      "app.kubernetes.io/component" = "frontend"
    }
  }
}

# Horizontal Pod Autoscaler
resource "kubernetes_horizontal_pod_autoscaler_v2" "frontend" {
  metadata {
    name      = "${var.name_prefix}-frontend-hpa"
    namespace = var.namespace
    labels    = merge(var.labels, {
      "app.kubernetes.io/component" = "frontend"
      "app.kubernetes.io/name"      = "react"
    })
  }

  spec {
    scale_target_ref {
      api_version = "apps/v1"
      kind        = "Deployment"
      name        = kubernetes_deployment.frontend.metadata[0].name
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
resource "kubernetes_pod_disruption_budget_v1" "frontend" {
  metadata {
    name      = "${var.name_prefix}-frontend-pdb"
    namespace = var.namespace
    labels    = merge(var.labels, {
      "app.kubernetes.io/component" = "frontend"
      "app.kubernetes.io/name"      = "react"
    })
  }

  spec {
    min_available = "50%"

    selector {
      match_labels = {
        "app.kubernetes.io/name"      = "react"
        "app.kubernetes.io/instance"  = var.name_prefix
        "app.kubernetes.io/component" = "frontend"
      }
    }
  }
}
