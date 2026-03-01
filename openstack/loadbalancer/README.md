# Octavia – Load Balancing

Managed load balancing via **OpenStack Octavia** — equivalent to AWS ALB/NLB.

## Load Balancer Types

| Type | Listener Protocol | Use Case |
|------|-----------------|----------|
| HTTP | HTTP/HTTPS | Web applications |
| TCP | TCP | Databases, raw TCP |
| TERMINATED_HTTPS | HTTPS with TLS offload | Public endpoints |

## Standards

- All public-facing services must go through a load balancer.
- TLS certificates managed via cert-manager → Let's Encrypt.
- Health check interval: 5s, unhealthy threshold: 3.
- All LBs must log to centralized log collector.

## Templates

- `lb-http.yaml` — standard HTTP load balancer
- `lb-https-terminated.yaml` — HTTPS with TLS termination
- `lb-tcp.yaml` — TCP passthrough

## See Also

- Terraform module: `terraform/modules/loadbalancer/`
- cert-manager: `k8s/cert-manager/`
- Ingress controller: `k8s/` (NGINX/Contour)
