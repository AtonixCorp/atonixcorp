# Local variables for ingress annotations
locals {
  base_annotations = {
    "kubernetes.io/ingress.class"                    = var.ingress_class
    "nginx.ingress.kubernetes.io/proxy-body-size"    = var.client_max_body_size
    "nginx.ingress.kubernetes.io/proxy-read-timeout" = "300"
    "nginx.ingress.kubernetes.io/proxy-send-timeout" = "300"
    "nginx.ingress.kubernetes.io/use-regex"          = "true"
  }
  
  ssl_annotations = var.ssl_redirect ? {
    "nginx.ingress.kubernetes.io/ssl-redirect"       = "true"
    "nginx.ingress.kubernetes.io/force-ssl-redirect" = "true"
  } : {}
  
  compression_annotations = var.enable_compression ? {
    "nginx.ingress.kubernetes.io/enable-compression" = "true"
    "nginx.ingress.kubernetes.io/compress-types"     = "text/plain,text/css,application/json,application/javascript,text/xml,application/xml,application/xml+rss,text/javascript"
  } : {}
  
  rate_limit_annotations = var.enable_rate_limiting ? {
    "nginx.ingress.kubernetes.io/rate-limit"            = "100"
    "nginx.ingress.kubernetes.io/rate-limit-window"     = "1m"
    "nginx.ingress.kubernetes.io/rate-limit-connections" = "10"
  } : {}
  
  security_annotations = {
    "nginx.ingress.kubernetes.io/server-snippet" = <<-EOF
      add_header X-Frame-Options "SAMEORIGIN" always;
      add_header X-Content-Type-Options "nosniff" always;
      add_header X-XSS-Protection "1; mode=block" always;
      add_header Referrer-Policy "no-referrer-when-downgrade" always;
      add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    EOF
  }
  
  all_annotations = merge(
    local.base_annotations,
    local.ssl_annotations,
    local.compression_annotations,
    local.rate_limit_annotations,
    local.security_annotations,
    var.annotations
  )
}

# TLS Certificate (if using cert-manager)
resource "kubernetes_manifest" "certificate" {
  count = var.tls_secret != "" ? 1 : 0
  
  manifest = {
    apiVersion = "cert-manager.io/v1"
    kind       = "Certificate"
    metadata = {
      name      = "${var.name_prefix}-tls-cert"
      namespace = var.namespace
      labels    = merge(var.labels, {
        "app.kubernetes.io/component" = "certificate"
        "app.kubernetes.io/name"      = "tls"
      })
    }
    spec = {
      secretName = var.tls_secret
      issuerRef = {
        name = "letsencrypt-prod"
        kind = "ClusterIssuer"
      }
      dnsNames = [
        var.domain_name,
        "www.${var.domain_name}"
      ]
    }
  }
}

# Main Ingress Resource
resource "kubernetes_ingress_v1" "main" {
  metadata {
    name        = "${var.name_prefix}-ingress"
    namespace   = var.namespace
    labels      = merge(var.labels, {
      "app.kubernetes.io/component" = "ingress"
      "app.kubernetes.io/name"      = "nginx"
    })
    annotations = local.all_annotations
  }
  
  spec {
    ingress_class_name = var.ingress_class
    
    dynamic "tls" {
      for_each = var.tls_secret != "" ? [1] : []
      content {
        hosts       = [var.domain_name, "www.${var.domain_name}"]
        secret_name = var.tls_secret
      }
    }
    
    # API Routes (Backend)
    rule {
      host = var.domain_name
      http {
        # API endpoints
        path {
          path      = "/api"
          path_type = "Prefix"
          backend {
            service {
              name = var.backend_service
              port {
                number = 8000
              }
            }
          }
        }
        
        # Django Admin
        path {
          path      = "/admin"
          path_type = "Prefix"
          backend {
            service {
              name = var.backend_service
              port {
                number = 8000
              }
            }
          }
        }
        
        # Static files (served by Django in production)
        path {
          path      = "/static"
          path_type = "Prefix"
          backend {
            service {
              name = var.backend_service
              port {
                number = 8000
              }
            }
          }
        }
        
        # Media files
        path {
          path      = "/media"
          path_type = "Prefix"
          backend {
            service {
              name = var.backend_service
              port {
                number = 8000
              }
            }
          }
        }
        
        # Ruby service
        path {
          path      = "/api/ruby"
          path_type = "Prefix"
          backend {
            service {
              name = var.ruby_service
              port {
                number = 80
              }
            }
          }
        }
        
        path {
          path      = "/ready"
          path_type = "Exact"
          backend {
            service {
              name = var.backend_service
              port {
                number = 8000
              }
            }
          }
        }
        
        # Frontend (React app) - catch all
        path {
          path      = "/"
          path_type = "Prefix"
          backend {
            service {
              name = var.frontend_service
              port {
                number = 80
              }
            }
          }
        }
      }
    }
    
    # WWW redirect rule
    rule {
      host = "www.${var.domain_name}"
      http {
        path {
          path      = "/"
          path_type = "Prefix"
          backend {
            service {
              name = var.frontend_service
              port {
                number = 80
              }
            }
          }
        }
      }
    }
  }
  
  depends_on = [kubernetes_manifest.certificate]
}

# Ingress for API-only subdomain (optional)
resource "kubernetes_ingress_v1" "api" {
  metadata {
    name        = "${var.name_prefix}-api-ingress"
    namespace   = var.namespace
    labels      = merge(var.labels, {
      "app.kubernetes.io/component" = "ingress"
      "app.kubernetes.io/name"      = "nginx-api"
    })
    annotations = merge(local.all_annotations, {
      "nginx.ingress.kubernetes.io/rewrite-target" = "/$2"
    })
  }
  
  spec {
    ingress_class_name = var.ingress_class
    
    dynamic "tls" {
      for_each = var.tls_secret != "" ? [1] : []
      content {
        hosts       = ["api.${var.domain_name}"]
        secret_name = var.tls_secret
      }
    }
    
    rule {
      host = "api.${var.domain_name}"
      http {
        path {
          path      = "/(/|$)(.*)"
          path_type = "Prefix"
          backend {
            service {
              name = var.backend_service
              port {
                number = 8000
              }
            }
          }
        }
      }
    }
  }
  
  depends_on = [kubernetes_manifest.certificate]
}

# Network Policy for Ingress (if network policies are enabled)
resource "kubernetes_network_policy" "ingress" {
  metadata {
    name      = "${var.name_prefix}-ingress-netpol"
    namespace = var.namespace
    labels    = merge(var.labels, {
      "app.kubernetes.io/component" = "ingress"
      "app.kubernetes.io/name"      = "nginx"
    })
  }
  
  spec {
    pod_selector {
      match_labels = {
        "app.kubernetes.io/name" = "nginx"
      }
    }
    
    policy_types = ["Ingress", "Egress"]
    
    # Allow ingress from anywhere on HTTP/HTTPS
    ingress {
      ports {
        port     = "80"
        protocol = "TCP"
      }
      ports {
        port     = "443"
        protocol = "TCP"
      }
    }
    
    # Allow egress to backend and frontend services
    egress {
      to {
        pod_selector {
          match_labels = {
            "app.kubernetes.io/component" = "backend"
          }
        }
      }
      ports {
        port     = "8000"
        protocol = "TCP"
      }
    }
    
    egress {
      to {
        pod_selector {
          match_labels = {
            "app.kubernetes.io/component" = "frontend"
          }
        }
      }
      ports {
        port     = "80"
        protocol = "TCP"
      }
    }
    
    egress {
      to {
        pod_selector {
          match_labels = {
            app = "ruby-service"
          }
        }
      }
      ports {
        port     = "80"
        protocol = "TCP"
      }
    }
    
    # Allow egress to DNS
    egress {
      to {
        namespace_selector {
          match_labels = {
            name = "kube-system"
          }
        }
      }
      ports {
        port     = "53"
        protocol = "UDP"
      }
      ports {
        port     = "53"
        protocol = "TCP"
      }
    }
  }
}