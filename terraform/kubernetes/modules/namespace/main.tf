resource "kubernetes_namespace" "main" {
  metadata {
    name        = var.name
    labels      = var.labels
    annotations = var.annotations
  }
}

# Create a resource quota for the namespace
resource "kubernetes_resource_quota" "main" {
  metadata {
    name      = "${var.name}-quota"
    namespace = kubernetes_namespace.main.metadata[0].name
    labels    = var.labels
  }
  
  spec {
    hard = {
      "requests.cpu"                         = "10"
      "requests.memory"                      = "20Gi"
      "limits.cpu"                          = "20"
      "limits.memory"                       = "40Gi"
      "requests.storage"                    = "100Gi"
      "persistentvolumeclaims"              = "10"
      "pods"                                = "50"
      "replicationcontrollers"              = "20"
      "resourcequotas"                      = "1"
      "secrets"                             = "50"
      "services"                            = "20"
      "services.loadbalancers"              = "5"
      "services.nodeports"                  = "10"
      "count/deployments.apps"              = "20"
      "count/replicasets.apps"              = "20"
      "count/statefulsets.apps"             = "10"
      "count/jobs.batch"                    = "20"
      "count/cronjobs.batch"                = "10"
      "count/configmaps"                    = "50"
      "count/ingresses.networking.k8s.io"   = "10"
    }
  }
}

# Create a limit range for the namespace
resource "kubernetes_limit_range" "main" {
  metadata {
    name      = "${var.name}-limits"
    namespace = kubernetes_namespace.main.metadata[0].name
    labels    = var.labels
  }
  
  spec {
    limit {
      type = "Container"
      default = {
        cpu    = "500m"
        memory = "1Gi"
      }
      default_request = {
        cpu    = "100m"
        memory = "256Mi"
      }
      max = {
        cpu    = "2"
        memory = "4Gi"
      }
      min = {
        cpu    = "50m"
        memory = "128Mi"
      }
    }
    
    limit {
      type = "PersistentVolumeClaim"
      max = {
        storage = "50Gi"
      }
      min = {
        storage = "1Gi"
      }
    }
  }
}

# Create a network policy for basic security (if network policies are supported)
resource "kubernetes_network_policy" "default_deny" {
  metadata {
    name      = "${var.name}-default-deny"
    namespace = kubernetes_namespace.main.metadata[0].name
    labels    = var.labels
  }
  
  spec {
    pod_selector {}
    policy_types = ["Ingress", "Egress"]
    
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
    
    # Allow egress to internet (HTTP/HTTPS)
    egress {
      ports {
        port     = "80"
        protocol = "TCP"
      }
      ports {
        port     = "443"
        protocol = "TCP"
      }
    }
  }
}

# Allow ingress within the namespace
resource "kubernetes_network_policy" "allow_internal" {
  metadata {
    name      = "${var.name}-allow-internal"
    namespace = kubernetes_namespace.main.metadata[0].name
    labels    = var.labels
  }
  
  spec {
    pod_selector {}
    policy_types = ["Ingress"]
    
    ingress {
      from {
        namespace_selector {
          match_labels = {
            name = var.name
          }
        }
      }
    }
  }
}