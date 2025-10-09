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
