This folder contains minimal manifests and instructions to deploy Prometheus and Grafana for the cluster.

Options:
- Use the Prometheus Operator (recommended) via Helm: `helm repo add prometheus-community https://prometheus-community.github.io/helm-charts` then `helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring --create-namespace`.
- Or apply the `prometheus-standalone.yaml` manifest in this folder for a lightweight single-node setup.

ServiceMonitors: When using the Operator, ServiceMonitor CRD will be available, and Pod/Service metrics can be scraped using `ServiceMonitor` resources in `k8s/monitoring/servicemonitors/`.
