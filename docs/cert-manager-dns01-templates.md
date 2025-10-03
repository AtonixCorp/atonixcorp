This file contains ready-to-apply cert-manager DNS-01 ClusterIssuer templates for common DNS providers.

Important: These use Let's Encrypt staging to avoid rate limits during testing. Replace staging with production server when you're ready.

1) Cloudflare (recommended if your DNS is on Cloudflare)

Secrets needed:
- namespace: cert-manager
- secret name: cloudflare-api-token-secret
- key: api-token

Secret creation (example):

kubectl create secret generic cloudflare-api-token-secret \
  --from-literal=api-token="<CLOUDFLARE_API_TOKEN>" \
  -n cert-manager

ClusterIssuer (staging):

apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-dns-cloudflare-staging
spec:
  acme:
    server: https://acme-staging-v02.api.letsencrypt.org/directory
    email: admin@example.com
    privateKeySecretRef:
      name: letsencrypt-dns-cloudflare-staging-key
    solvers:
    - dns01:
        cloudflare:
          apiTokenSecretRef:
            name: cloudflare-api-token-secret
            key: api-token


2) Route53 (AWS)

Secrets needed:
- namespace: cert-manager
- secret name: route53-credentials
- keys: access-key-id and secret-access-key

Create secret (example):

kubectl create secret generic route53-credentials \
  --from-literal=access-key-id="<AWS_ACCESS_KEY_ID>" \
  --from-literal=secret-access-key="<AWS_SECRET_ACCESS_KEY>" \
  -n cert-manager

ClusterIssuer (staging):

apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-dns-route53-staging
spec:
  acme:
    server: https://acme-staging-v02.api.letsencrypt.org/directory
    email: admin@example.com
    privateKeySecretRef:
      name: letsencrypt-dns-route53-staging-key
    solvers:
    - dns01:
        route53:
          region: us-east-1
          accessKeyID: "<AWS_ACCESS_KEY_ID>"
          secretAccessKeySecretRef:
            name: route53-credentials
            key: secret-access-key


3) Notes
- Use staging issuer for tests. When successful, switch server to https://acme-v02.api.letsencrypt.org/directory and create a production ClusterIssuer with a new privateKeySecretRef name.
- For other DNS providers cert-manager supports many drivers (gcloud, digitalocean, powerdns, etc.). Ask which provider you use if it’s not listed here.
- After creating ClusterIssuer, create a Certificate resource or annotate an Ingress with `cert-manager.io/cluster-issuer: <issuer-name>` and create an Ingress rule for your hostname. cert-manager will create the challenge.

Example Certificate for domain `api.atonixcorp.com`:

apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: api-atonixcorp-com-cert
  namespace: default
spec:
  secretName: api-atonixcorp-com-tls
  dnsNames:
  - api.atonixcorp.com
  issuerRef:
    name: letsencrypt-dns-cloudflare-staging
    kind: ClusterIssuer

Once the Certificate resource is submitted, run `kubectl describe certificate api-atonixcorp-com-cert -n default` to view challenge status.

If you want me to create the secret and ClusterIssuer directly, paste the provider name and the credential token(s) (or say you'll create the secret and I will just apply the ClusterIssuer YAML).