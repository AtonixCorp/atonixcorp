# Terraform module for Email infrastructure in Kubernetes

# MailHog ConfigMap (Development)
resource "kubernetes_config_map" "mailhog_config" {
  count = var.environment == "development" ? 1 : 0

  metadata {
    name      = "mailhog-config"
    namespace = var.namespace
    labels = {
      app       = "mailhog"
      component = "config"
    }
  }

  data = {
    "mailhog.yml" = <<-EOF
      storage: maildir
      maildir-path: /maildir
      smtp-bind-addr: 0.0.0.0:1025
      ui-bind-addr: 0.0.0.0:8025
      api-bind-addr: 0.0.0.0:8025
      cors-origin: "*"
      hostname: ${var.hostname}
    EOF
  }
}

# Postfix ConfigMap (Production)
resource "kubernetes_config_map" "postfix_config" {
  count = var.environment == "production" ? 1 : 0

  metadata {
    name      = "postfix-config"
    namespace = var.namespace
    labels = {
      app       = "postfix"
      component = "config"
    }
  }

  data = {
    "main.cf" = <<-EOF
      # Basic configuration
      myhostname = ${var.hostname}
      mydomain = ${var.domain}
      myorigin = ${var.domain}
      
      # Network configuration
      inet_interfaces = all
      inet_protocols = ipv4
      mynetworks = 127.0.0.0/8 [::ffff:127.0.0.0]/104 [::1]/128 ${var.trusted_networks}
      
      # Relay configuration
      relayhost = [${var.smtp_relay_host}]:${var.smtp_relay_port}
      smtp_sasl_auth_enable = yes
      smtp_sasl_password_maps = hash:/etc/postfix/sasl_passwd
      smtp_sasl_security_options = noanonymous
      smtp_tls_security_level = encrypt
      smtp_use_tls = yes
      
      # Message size limits
      message_size_limit = ${var.message_size_limit}
      mailbox_size_limit = 0
      
      # Queue configuration
      maximal_queue_lifetime = 1d
      bounce_queue_lifetime = 1d
      
      # Security
      smtpd_banner = $myhostname ESMTP
      disable_vrfy_command = yes
      smtpd_helo_required = yes
      
      # Virtual domains (if needed)
      virtual_alias_domains = ${var.virtual_domains}
    EOF

    "master.cf" = <<-EOF
      # Postfix master process configuration
      smtp      inet  n       -       y       -       -       smtpd
      submission inet n       -       y       -       -       smtpd
        -o syslog_name=postfix/submission
        -o smtpd_tls_security_level=encrypt
        -o smtpd_sasl_auth_enable=yes
        -o smtpd_client_restrictions=permit_sasl_authenticated,reject
      pickup    unix  n       -       y       60      1       pickup
      cleanup   unix  n       -       y       -       0       cleanup
      qmgr      unix  n       -       n       300     1       qmgr
      tlsmgr    unix  -       -       y       1000?   1       tlsmgr
      rewrite   unix  -       -       y       -       -       trivial-rewrite
      bounce    unix  -       -       y       -       0       bounce
      defer     unix  -       -       y       -       0       bounce
      trace     unix  -       -       y       -       0       bounce
      verify    unix  -       -       y       -       1       verify
      flush     unix  n       -       y       1000?   0       flush
      proxymap  unix  -       -       n       -       -       proxymap
      proxywrite unix -       -       n       -       1       proxymap
      smtp      unix  -       -       y       -       -       smtp
      relay     unix  -       -       y       -       -       smtp
      showq     unix  n       -       y       -       -       showq
      error     unix  -       -       y       -       -       error
      retry     unix  -       -       y       -       -       error
      discard   unix  -       -       y       -       -       discard
      local     unix  -       n       n       -       -       local
      virtual   unix  -       n       n       -       -       virtual
      lmtp      unix  -       -       y       -       -       lmtp
      anvil     unix  -       -       y       -       1       anvil
      scache    unix  -       -       y       -       1       scache
    EOF
  }
}

# Email Secret
resource "kubernetes_secret" "email_secret" {
  metadata {
    name      = "email-secret"
    namespace = var.namespace
    labels = {
      app = "email"
    }
  }

  data = {
    smtp-username = base64encode(var.smtp_username)
    smtp-password = base64encode(var.smtp_password)
    sasl-passwd   = base64encode("${var.smtp_relay_host}:${var.smtp_relay_port} ${var.smtp_username}:${var.smtp_password}")
  }
}

# MailHog Service (Development)
resource "kubernetes_service" "mailhog" {
  count = var.environment == "development" ? 1 : 0

  metadata {
    name      = "mailhog"
    namespace = var.namespace
    labels = {
      app = "mailhog"
    }
  }

  spec {
    selector = {
      app = "mailhog"
    }

    port {
      name        = "smtp"
      port        = 1025
      target_port = 1025
      protocol    = "TCP"
    }

    port {
      name        = "web"
      port        = 8025
      target_port = 8025
      protocol    = "TCP"
    }
  }
}

# MailHog Deployment (Development)
resource "kubernetes_deployment" "mailhog" {
  count = var.environment == "development" ? 1 : 0

  metadata {
    name      = "mailhog"
    namespace = var.namespace
    labels = {
      app = "mailhog"
    }
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "mailhog"
      }
    }

    template {
      metadata {
        labels = {
          app = "mailhog"
        }
      }

      spec {
        container {
          name  = "mailhog"
          image = var.mailhog_image

          port {
            name           = "smtp"
            container_port = 1025
            protocol       = "TCP"
          }

          port {
            name           = "web"
            container_port = 8025
            protocol       = "TCP"
          }

          env {
            name  = "MH_STORAGE"
            value = "maildir"
          }

          env {
            name  = "MH_MAILDIR_PATH"
            value = "/maildir"
          }

          volume_mount {
            name       = "mailhog-data"
            mount_path = "/maildir"
          }

          liveness_probe {
            http_get {
              path = "/"
              port = 8025
            }
            initial_delay_seconds = 30
            period_seconds        = 30
          }

          readiness_probe {
            http_get {
              path = "/"
              port = 8025
            }
            initial_delay_seconds = 5
            period_seconds        = 10
          }

          resources {
            requests = {
              cpu    = var.mailhog_resources.requests.cpu
              memory = var.mailhog_resources.requests.memory
            }
            limits = {
              cpu    = var.mailhog_resources.limits.cpu
              memory = var.mailhog_resources.limits.memory
            }
          }
        }

        volume {
          name = "mailhog-data"
          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.mailhog_pvc[0].metadata[0].name
          }
        }
      }
    }
  }
}

# MailHog PVC (Development)
resource "kubernetes_persistent_volume_claim" "mailhog_pvc" {
  count = var.environment == "development" ? 1 : 0

  metadata {
    name      = "mailhog-data"
    namespace = var.namespace
    labels = {
      app = "mailhog"
    }
  }

  spec {
    access_modes       = ["ReadWriteOnce"]
    storage_class_name = var.storage_class
    resources {
      requests = {
        storage = var.mailhog_storage_size
      }
    }
  }
}

# Postfix Service (Production)
resource "kubernetes_service" "postfix" {
  count = var.environment == "production" ? 1 : 0

  metadata {
    name      = "postfix"
    namespace = var.namespace
    labels = {
      app = "postfix"
    }
  }

  spec {
    selector = {
      app = "postfix"
    }

    port {
      name        = "smtp"
      port        = 25
      target_port = 25
      protocol    = "TCP"
    }

    port {
      name        = "submission"
      port        = 587
      target_port = 587
      protocol    = "TCP"
    }
  }
}

# Postfix Deployment (Production)
resource "kubernetes_deployment" "postfix" {
  count = var.environment == "production" ? 1 : 0

  metadata {
    name      = "postfix"
    namespace = var.namespace
    labels = {
      app = "postfix"
    }
  }

  spec {
    replicas = var.postfix_replicas

    selector {
      match_labels = {
        app = "postfix"
      }
    }

    template {
      metadata {
        labels = {
          app = "postfix"
        }
      }

      spec {
        container {
          name  = "postfix"
          image = var.postfix_image

          port {
            name           = "smtp"
            container_port = 25
            protocol       = "TCP"
          }

          port {
            name           = "submission"
            container_port = 587
            protocol       = "TCP"
          }

          env {
            name  = "SMTP_SERVER"
            value = var.smtp_relay_host
          }

          env {
            name  = "SMTP_PORT"
            value = tostring(var.smtp_relay_port)
          }

          env {
            name = "SMTP_USERNAME"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.email_secret.metadata[0].name
                key  = "smtp-username"
              }
            }
          }

          env {
            name = "SMTP_PASSWORD"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.email_secret.metadata[0].name
                key  = "smtp-password"
              }
            }
          }

          env {
            name  = "SERVER_HOSTNAME"
            value = var.hostname
          }

          volume_mount {
            name       = "postfix-config"
            mount_path = "/etc/postfix/main.cf"
            sub_path   = "main.cf"
          }

          volume_mount {
            name       = "postfix-config"
            mount_path = "/etc/postfix/master.cf"
            sub_path   = "master.cf"
          }

          volume_mount {
            name       = "postfix-data"
            mount_path = "/var/spool/postfix"
          }

          liveness_probe {
            exec {
              command = ["postfix", "status"]
            }
            initial_delay_seconds = 30
            period_seconds        = 30
          }

          readiness_probe {
            tcp_socket {
              port = 25
            }
            initial_delay_seconds = 10
            period_seconds        = 10
          }

          resources {
            requests = {
              cpu    = var.postfix_resources.requests.cpu
              memory = var.postfix_resources.requests.memory
            }
            limits = {
              cpu    = var.postfix_resources.limits.cpu
              memory = var.postfix_resources.limits.memory
            }
          }
        }

        volume {
          name = "postfix-config"
          config_map {
            name = kubernetes_config_map.postfix_config[0].metadata[0].name
          }
        }

        volume {
          name = "postfix-data"
          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.postfix_pvc[0].metadata[0].name
          }
        }
      }
    }
  }
}

# Postfix PVC (Production)
resource "kubernetes_persistent_volume_claim" "postfix_pvc" {
  count = var.environment == "production" ? 1 : 0

  metadata {
    name      = "postfix-data"
    namespace = var.namespace
    labels = {
      app = "postfix"
    }
  }

  spec {
    access_modes       = ["ReadWriteOnce"]
    storage_class_name = var.storage_class
    resources {
      requests = {
        storage = var.postfix_storage_size
      }
    }
  }
}

# External Service for MailHog (Development)
resource "kubernetes_service" "mailhog_external" {
  count = var.environment == "development" && var.enable_external_access ? 1 : 0

  metadata {
    name      = "mailhog-external"
    namespace = var.namespace
    labels = {
      app = "mailhog"
    }
  }

  spec {
    selector = {
      app = "mailhog"
    }

    port {
      name        = "web"
      port        = 8025
      target_port = 8025
      node_port   = var.mailhog_web_node_port
      protocol    = "TCP"
    }

    type = "NodePort"
  }
}