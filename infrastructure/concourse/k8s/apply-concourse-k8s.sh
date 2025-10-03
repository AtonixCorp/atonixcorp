#!/usr/bin/env bash
set -euo pipefail

# Helper to create concourse-keys secret from generated keys and apply the k8s manifests
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
KEYS_DIR="$ROOT_DIR/config/keys"

if [ ! -d "$KEYS_DIR" ]; then
  echo "Concourse keys not found in $KEYS_DIR"
  echo "Run: cd $ROOT_DIR && chmod +x config/generate-keys.sh && ./config/generate-keys.sh"
  exit 1
fi

NAMESPACE=concourse

echo "Creating namespace..."
kubectl apply -f $ROOT_DIR/k8s/namespace.yaml

echo "Creating concourse-keys secret from $KEYS_DIR"
kubectl -n $NAMESPACE create secret generic concourse-keys --from-file=$KEYS_DIR --dry-run=client -o yaml | kubectl apply -f -

echo "Applying secrets..."
kubectl apply -f $ROOT_DIR/k8s/concourse-secrets.yaml

echo "Applying Postgres StatefulSet..."
kubectl apply -f $ROOT_DIR/k8s/postgres-statefulset.yaml

echo "Applying MinIO..."
kubectl apply -f $ROOT_DIR/k8s/minio-deployment.yaml

echo "Applying Redis..."
kubectl apply -f $ROOT_DIR/k8s/redis-deployment.yaml

echo "Applying Concourse web and worker..."
kubectl apply -f $ROOT_DIR/k8s/concourse-web-deployment.yaml
kubectl apply -f $ROOT_DIR/k8s/concourse-worker-deployment.yaml

echo "Applying OTEL collector and Jaeger..."
kubectl apply -f $ROOT_DIR/k8s/otel-collector.yaml
kubectl apply -f $ROOT_DIR/k8s/jaeger-all-in-one.yaml

echo "Applying ingress..."
kubectl apply -f $ROOT_DIR/k8s/ingress.yaml

echo "Done. Check pod status: kubectl -n concourse get pods"
