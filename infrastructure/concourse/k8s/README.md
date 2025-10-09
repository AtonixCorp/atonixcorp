# Concourse on Kubernetes (minimal scaffold)

This folder contains a minimal, safe scaffold to deploy Concourse (web + worker) and a few supporting services (Postgres, MinIO, Redis) into a Kubernetes cluster, plus a basic OpenTelemetry Collector and Jaeger for tracing.

This is intended for development or small proof-of-concept clusters. For production you should harden secrets, use durable storage, and configure resource requests/limits appropriately.

Quick steps
1. Generate Concourse key files locally:

```bash
cd infrastructure/concourse
chmod +x config/generate-keys.sh
./config/generate-keys.sh
```

This will create `infrastructure/concourse/config/keys` containing:
- session_signing_key
- session_signing_key.pub
- tsa_host_key
- tsa_host_key.pub
- worker_key
- worker_key.pub
- authorized_worker_keys

2. Create the `concourse-keys` Kubernetes secret from those files:

```bash
kubectl create secret generic concourse-keys \
  --from-file=./infrastructure/concourse/config/keys \
  -n concourse
```

3. Edit `concourse-secrets.yaml` with production values (Postgres password, MinIO creds, admin password) or create a secret using `kubectl create secret generic concourse-secrets --from-literal=...`.

4. Apply manifests (namespace first):

```bash
kubectl apply -f infrastructure/concourse/k8s/namespace.yaml
kubectl apply -f infrastructure/concourse/k8s/concourse-secrets.yaml
kubectl apply -f infrastructure/concourse/k8s/postgres-statefulset.yaml
kubectl apply -f infrastructure/concourse/k8s/minio-deployment.yaml
kubectl apply -f infrastructure/concourse/k8s/redis-deployment.yaml
kubectl apply -f infrastructure/concourse/k8s/concourse-web-deployment.yaml
kubectl apply -f infrastructure/concourse/k8s/concourse-worker-deployment.yaml
kubectl apply -f infrastructure/concourse/k8s/otel-collector.yaml
kubectl apply -f infrastructure/concourse/k8s/jaeger-all-in-one.yaml
kubectl apply -f infrastructure/concourse/k8s/ingress.yaml
```

5. Verify pods:

```bash
kubectl -n concourse get pods
kubectl -n concourse get svc
```

6. When Concourse web is ready, install `fly` and login (see `infrastructure/concourse/setup-concourse.sh` for example commands):

```bash
# Install fly locally and then
fly -t atonixcorp login -c https://concourse.example.com -u admin -p <password>
```

Notes & next steps
- These manifests intentionally keep resource requests/limits and persistence conservative.
- For production, replace MinIO with a managed object store or an appropriate S3-compatible store.
- Consider using an operator (e.g., Concourse Helm chart) for production-grade deployments.
