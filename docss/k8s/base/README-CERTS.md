Instructions to issue DNS-01 (Cloudflare) staging certs via cert-manager

1) Create a Kubernetes Secret with your Cloudflare API token (recommended: token scoped to DNS edit for your zone)

Replace <CF-API-TOKEN> with your token and run as a user with permissions to create secrets in the cert-manager namespace:

kubectl create secret generic cf-api-token-secret --from-literal=api-token='<CF-API-TOKEN>' -n cert-manager

2) Edit `/k8s/base/letsencrypt-staging-dns-cloudflare-clusterissuer.yaml` and update `email` to your email.

3) Apply the ClusterIssuer and Certificate:

kubectl apply -f k8s/base/letsencrypt-staging-dns-cloudflare-clusterissuer.yaml
kubectl apply -f k8s/base/atonixcorp-cert-letsencrypt-staging.yaml

4) Watch Certificate status:

kubectl -n atonixcorp describe certificate atonixcorp-tls-staging
kubectl -n atonixcorp get secret atonixcorp-tls-staging -o yaml

Notes:
- Use Let's Encrypt staging while testing to avoid rate limits.
- If you use a different DNS provider, replace the solver block with the appropriate provider (Route53, Google, DigitalOcean, etc.).
- Once staging works, create a production ClusterIssuer with the production Let’s Encrypt server URL.
