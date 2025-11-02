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
<<<<<<< HEAD
  
=======

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
  data = {
    NODE_ENV                  = var.node_env
    REACT_APP_ENVIRONMENT     = var.environment
    REACT_APP_API_URL         = var.api_url
    REACT_APP_VERSION         = "1.0.0"
    GENERATE_SOURCEMAP        = var.environment == "development" ? "true" : "false"
<<<<<<< HEAD
    
=======

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
    # Nginx configuration
    "nginx.conf" = <<-EOF
      user nginx;
      worker_processes auto;
      error_log /var/log/nginx/error.log notice;
      pid /var/run/nginx.pid;
<<<<<<< HEAD
      
=======

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
      events {
          worker_connections 1024;
          use epoll;
          multi_accept on;
      }
<<<<<<< HEAD
      
      http {
          include /etc/nginx/mime.types;
          default_type application/octet-stream;
          
=======

      http {
          include /etc/nginx/mime.types;
          default_type application/octet-stream;

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
          # Logging
          log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                         '$status $body_bytes_sent "$http_referer" '
                         '"$http_user_agent" "$http_x_forwarded_for"';
<<<<<<< HEAD
          
          access_log /var/log/nginx/access.log main;
          
=======

          access_log /var/log/nginx/access.log main;

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
          # Performance
          sendfile on;
          tcp_nopush on;
          tcp_nodelay on;
          keepalive_timeout 65;
          types_hash_max_size 2048;
<<<<<<< HEAD
          
=======

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
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
<<<<<<< HEAD
          
=======

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
          # Security headers
          add_header X-Frame-Options "SAMEORIGIN" always;
          add_header X-Content-Type-Options "nosniff" always;
          add_header X-XSS-Protection "1; mode=block" always;
          add_header Referrer-Policy "no-referrer-when-downgrade" always;
          add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
<<<<<<< HEAD
          
=======

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
          server {
              listen 80;
              server_name _;
              root /usr/share/nginx/html;
              index index.html;
<<<<<<< HEAD
              
=======

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
              # Health check endpoint
              location /health {
                  access_log off;
                  return 200 "healthy\n";
                  add_header Content-Type text/plain;
              }
<<<<<<< HEAD
              
=======

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
              # API proxy
              location /api/ {
                  proxy_pass ${var.api_url}/;
                  proxy_set_header Host $host;
                  proxy_set_header X-Real-IP $remote_addr;
                  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                  proxy_set_header X-Forwarded-Proto $scheme;
<<<<<<< HEAD
                  
=======

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
                  # Timeouts
                  proxy_connect_timeout 60s;
                  proxy_send_timeout 60s;
                  proxy_read_timeout 60s;
<<<<<<< HEAD
                  
=======

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
                  # Buffering
                  proxy_buffering on;
                  proxy_buffer_size 4k;
                  proxy_buffers 8 4k;
                  proxy_busy_buffers_size 8k;
              }
<<<<<<< HEAD
              
=======

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
              # Admin proxy
              location /admin/ {
                  proxy_pass ${var.api_url}/admin/;
                  proxy_set_header Host $host;
                  proxy_set_header X-Real-IP $remote_addr;
                  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                  proxy_set_header X-Forwarded-Proto $scheme;
<<<<<<< HEAD
                  
=======

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
                  # Timeouts
                  proxy_connect_timeout 60s;
                  proxy_send_timeout 60s;
                  proxy_read_timeout 60s;
              }
<<<<<<< HEAD
              
=======

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
              # Static files with caching
              location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
                  expires 1y;
                  add_header Cache-Control "public, immutable";
                  try_files $uri =404;
              }
<<<<<<< HEAD
              
              # React app - handle client-side routing
              location / {
                  try_files $uri $uri/ /index.html;
                  
=======

              # React app - handle client-side routing
              location / {
                  try_files $uri $uri/ /index.html;

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
                  # Cache control for HTML files
                  location ~* \.(html)$ {
                      expires -1;
                      add_header Cache-Control "no-cache, no-store, must-revalidate";
                      add_header Pragma "no-cache";
                  }
              }
<<<<<<< HEAD
              
=======

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
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
<<<<<<< HEAD
  
  spec {
    replicas = var.replicas
    
=======

  spec {
    replicas = var.replicas

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
    strategy {
      type = "RollingUpdate"
      rolling_update {
        max_unavailable = "25%"
        max_surge       = "25%"
      }
    }
<<<<<<< HEAD
    
=======

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
    selector {
      match_labels = {
        "app.kubernetes.io/name"      = "react"
        "app.kubernetes.io/instance"  = var.name_prefix
        "app.kubernetes.io/component" = "frontend"
      }
    }
<<<<<<< HEAD
    
=======

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
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
<<<<<<< HEAD
      
      spec {
        container {
          name  = "nginx"
          image = "${var.image_registry}/${var.image_repository}:${var.image_tag}"
          
=======

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

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
          port {
            name           = "http"
            container_port = 80
            protocol       = "TCP"
          }
<<<<<<< HEAD
          
=======

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
          env_from {
            config_map_ref {
              name = kubernetes_config_map.frontend.metadata[0].name
            }
          }
<<<<<<< HEAD
          
=======

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
          env {
            name = "POD_NAME"
            value_from {
              field_ref {
                field_path = "metadata.name"
              }
            }
          }
<<<<<<< HEAD
          
=======

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
          env {
            name = "POD_NAMESPACE"
            value_from {
              field_ref {
                field_path = "metadata.namespace"
              }
            }
          }
<<<<<<< HEAD
          
=======

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
          volume_mount {
            name       = "nginx-config"
            mount_path = "/etc/nginx/nginx.conf"
            sub_path   = "nginx.conf"
          }
<<<<<<< HEAD
          
=======

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
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
<<<<<<< HEAD
          
=======

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
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
<<<<<<< HEAD
          
=======

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
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
<<<<<<< HEAD
          
=======

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
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
<<<<<<< HEAD
        
=======

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
        # Nginx Prometheus Exporter
        container {
          name  = "nginx-exporter"
          image = "nginx/nginx-prometheus-exporter:0.10.0"
<<<<<<< HEAD
          
          args = [
            "-nginx.scrape-uri=http://localhost:80/nginx_status"
          ]
          
=======

          args = [
            "-nginx.scrape-uri=http://localhost:80/nginx_status"
          ]

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
          port {
            name           = "metrics"
            container_port = 9113
            protocol       = "TCP"
          }
<<<<<<< HEAD
          
          resources {
            requests = {
              cpu    = "50m"
              memory = "64Mi"
=======

          resources {
            requests = {
              cpu    = "50m"
              memory = "128Mi"
>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
            }
            limits = {
              cpu    = "200m"
              memory = "256Mi"
            }
          }
<<<<<<< HEAD
          
=======

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
          liveness_probe {
            http_get {
              path = "/metrics"
              port = 9113
            }
            initial_delay_seconds = 30
            period_seconds        = 30
          }
        }
<<<<<<< HEAD
        
=======

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
        volume {
          name = "nginx-config"
          config_map {
            name = kubernetes_config_map.frontend.metadata[0].name
          }
        }
<<<<<<< HEAD
        
=======

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
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
<<<<<<< HEAD
  
  spec {
    type = "ClusterIP"
    
=======

  spec {
    type = "ClusterIP"

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
    port {
      name        = "http"
      port        = 80
      target_port = 80
      protocol    = "TCP"
    }
<<<<<<< HEAD
    
=======

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
    port {
      name        = "metrics"
      port        = 9113
      target_port = 9113
      protocol    = "TCP"
    }
<<<<<<< HEAD
    
=======

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
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
<<<<<<< HEAD
  
=======

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
  spec {
    scale_target_ref {
      api_version = "apps/v1"
      kind        = "Deployment"
      name        = kubernetes_deployment.frontend.metadata[0].name
    }
<<<<<<< HEAD
    
    min_replicas = var.min_replicas
    max_replicas = var.max_replicas
    
=======

    min_replicas = var.min_replicas
    max_replicas = var.max_replicas

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
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
<<<<<<< HEAD
    
=======

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
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
<<<<<<< HEAD
    
=======

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
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
<<<<<<< HEAD
      
=======

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
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
<<<<<<< HEAD
  
  spec {
    min_available = "50%"
    
=======

  spec {
    min_available = "50%"

>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
    selector {
      match_labels = {
        "app.kubernetes.io/name"      = "react"
        "app.kubernetes.io/instance"  = var.name_prefix
        "app.kubernetes.io/component" = "frontend"
      }
    }
  }
<<<<<<< HEAD
}
=======
}
>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
