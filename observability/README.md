# Observability – Prometheus + Grafana + Alertmanager

All metrics, dashboards, and alerting for the AtonixCorp platform.

## Architecture

```
Every service/node → Prometheus scrape (/metrics on port 9090/9100)
                                │
                    Prometheus Server (HA pair)
                    ┌───────────┴────────────┐
                    │                        │
             Alertmanager             Grafana (dashboards)
             (PagerDuty,              (version-controlled
              Slack, Email)            in dashboards/)
```

## What is Monitored

| Source | Exporter | Metrics |
|--------|----------|---------|
| Linux VMs | node_exporter | CPU, RAM, disk, network |
| OpenStack APIs | openstack-exporter | API latency, resource quotas |
| Kubernetes | kube-state-metrics | Pod status, deployments, HPA |
| Kubernetes | cAdvisor | Container CPU/RAM |
| PostgreSQL | postgres_exporter | Query latency, connections |
| Redis | redis_exporter | Hit rate, memory, ops/sec |
| RabbitMQ | rabbitmq_prometheus | Queue depth, message rate |
| Serverless (Knative) | built-in | Function invocations, latency |
| Argo Workflows | built-in | Workflow success/failure rate |

## Rules

1. **Every service must expose `/metrics` in Prometheus format.**
2. **Every node must run node_exporter** (deployed via `ansible/roles/monitoring-agent/`).
3. **All Grafana dashboards must be version-controlled** in `observability/grafana/dashboards/`.
4. **Alerting rules must be reviewed** quarterly.

## Subfolders

- `prometheus/` — Prometheus config, scrape configs, recording rules
- `grafana/` — Dashboard JSON models, datasource config, provisioning
- `alertmanager/` — Alerting rules and routing config

## See Also

- node_exporter install: `ansible/roles/monitoring-agent/`
- Kubernetes monitoring: `k8s/monitoring/`
- Existing prometheus deployment: `monitoring/prometheus/`
