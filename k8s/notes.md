Notes / next steps

- The platform image `atonixcorp-platform:1.0.0` must be available to your cluster. For local clusters use `kind load docker-image` or `minikube image load`. If using a remote cluster, push to a registry and update image refs.
- The deployment uses `atonixcorp-secrets` for DB credentials and SECRET_KEY. Replace these values before applying.
- The nginx ConfigMap contains the production nginx config and proxies to the internal platform service on port 8000.
- If you want the React dev server on port 3000, create a `frontend` Deployment and Service and either expose it directly (NodePort 3000) or route via nginx to that service.
 - All manifests target the `atonixcorp` namespace. Create it first with:
	 `kubectl apply -f k8s/namespace.yaml` or use `-n atonixcorp` when applying.
