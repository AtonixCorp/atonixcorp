# Kubernetes deployment for atonixcorp

This folder contains minimal Kubernetes manifests to deploy the backend and frontend images you pushed as:

- atonixdev/atonixcorp-backend:latest
- atonixdev/atonixcorp-frontend:latest

Files:

- `namespace.yaml` - creates the `atonixcorp` namespace
- `backend-deployment.yaml` - backend Deployment (2 replicas) and placeholder env values
- `backend-service.yaml` - backend ClusterIP service on port 8000
- `frontend-deployment.yaml` - frontend Deployment (2 replicas), serves static via port 80
- `frontend-service.yaml` - frontend ClusterIP service on port 80
- `ingress.yaml` - ingress rules for `atonixcorp.com` (frontend) and `api.atonixcorp.com` (backend). This expects an ingress controller (e.g. nginx-ingress) to be installed.

Before applying
- Update secrets and environment variables in `backend-deployment.yaml`. The `SECRET_KEY` is referenced from a secret `atonixcorp-secrets` with key `DJANGO_SECRET_KEY`.
- If your image registry is private, create an image pull secret and reference it in the pod spec as `imagePullSecrets`.
- Ensure an Ingress controller is installed in the cluster (nginx-ingress, traefik, or cloud provider's load balancer).

Apply the manifests:

```bash
# optional: confirm kubectl context
kubectl config current-context

# create the namespace and resources
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/ingress.yaml
```

Notes & recommendations
- The manifests are intentionally minimal. For production you'll want:
  - Liveness / readiness probes for both backend and frontend.
  - Resource requests/limits.
  - HorizontalPodAutoscaler and proper replica counts.
  - Secrets stored in SealedSecrets/External Secret Manager.
  - A proper TLS secret (e.g. cert-manager + ACME) for `atonixcorp-tls` referenced in `ingress.yaml`.
AtonixCorp platform - Kubernetes manifests

Files
- platform-deployment.yaml - Deployment for the combined platform image (Django + static files)
- platform-service.yaml - ClusterIP service exposing port 8000 (Django)
- nginx-configmap.yaml - ConfigMap containing `default.conf` for nginx
- nginx-deployment.yaml - Deployment + Service for nginx (proxies to platform)
- postgres-deployment.yaml - Postgres Deployment + Service
- redis-deployment.yaml - Redis Deployment + Service
- secrets.yaml - Kubernetes Secret (stringData) for SECRET_KEY and DB credentials (replace values)
- pvcs.yaml - PersistentVolumeClaim definitions for Postgres, Redis and media
- ingress.yaml - Ingress (nginx) rules for atonixcorp.org and api.atonixcorp.org

Quick start (kind / minikube / any k8s):
1. Make sure your cluster can pull or has the image `atonixcorpvm:1.0.0`:
   - kind: `kind load docker-image atonixcorpvm:1.0.0 --name <cluster-name>`
   - minikube: `minikube image load atonixcorpvm:1.0.0`
   - alternative: push `atonixcorpvm:1.0.0` to a registry and update the image references above.

2. Edit `k8s/secrets.yaml` and replace `REPLACE_ME_WITH_A_SECRET` and DB credentials with secure values.

3. Create the `atonixcorp` namespace and apply manifests into that namespace:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -n atonixcorp -f k8s/secrets.yaml
kubectl apply -n atonixcorp -f k8s/pvcs.yaml
kubectl apply -n atonixcorp -f k8s/postgres-deployment.yaml
kubectl apply -n atonixcorp -f k8s/redis-deployment.yaml
kubectl apply -n atonixcorp -f k8s/platform-deployment.yaml
kubectl apply -n atonixcorp -f k8s/platform-service.yaml
kubectl apply -n atonixcorp -f k8s/nginx-configmap.yaml
kubectl apply -n atonixcorp -f k8s/nginx-deployment.yaml
kubectl apply -n atonixcorp -f k8s/ingress.yaml
```

4. Add hosts entries for `atonixcorp.org` and `api.atonixcorp.org` pointing at your cluster ingress IP (or use nip.io / xip.io / local hosts file).

Notes:
- These manifests are intentionally minimal for a demo/local cluster. For production, consider:
  - StatefulSet for Postgres with proper backup/restore and storage class tuning
  - Readiness/liveness tuning and PodDisruptionBudgets
  - Resource requests/limits
  - Using `imagePullPolicy: Always` if pulling from a registry
  - TLS via cert-manager and Ingress TLS secrets
