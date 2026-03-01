# Grafana Dashboards

All Grafana dashboards are version-controlled here as JSON models.

## Dashboard Catalogue

| File | Dashboard | Purpose |
|------|-----------|---------|
| `infrastructure-health.json` | Infrastructure Health | Node CPU, RAM, disk, network across all VMs |
| `kubernetes-cluster.json` | Kubernetes Cluster | Pod status, deployments, node resources |
| `openstack-overview.json` | OpenStack Overview | API latency, quota usage, instance counts |
| `serverless-functions.json` | Serverless Functions | Knative invocations, latency, errors |
| `workflow-engine.json` | Workflow Engine | Argo Workflows success/failure rate, queue depth |
| `api-performance.json` | API Performance | Backend API latency, error rates, throughput |

## Provisioning

Dashboards are auto-provisioned via `grafana/provisioning/dashboards.yaml`.

Datasources are auto-provisioned via `grafana/provisioning/datasources.yaml`.

## Standards

- All dashboards must have a `uid` matching the filename (without `.json`).
- All panels must use `$cluster` variable for environment filtering.
- Dashboard refresh interval: 30s for operational dashboards, 5m for capacity planning.

## Adding a Dashboard

1. Create the dashboard in Grafana UI.
2. Export as JSON (_Share → Export → Save to file_).
3. Move to this directory.
4. Commit via Git.
