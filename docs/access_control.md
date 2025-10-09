# Access Control and Audit Logging

This document describes how to apply Role-Based Access Control (RBAC) manifests and enable Kubernetes audit logging for the atonixcorp cluster.

## RBAC

Apply the provided RBAC manifests:

```bash
kubectl apply -f k8s/rbac/namespace-rbac.yaml
```

Verify service accounts and role bindings:

```bash
kubectl get sa -n atonixcorp-dev
kubectl get rolebindings -n atonixcorp-dev
kubectl get clusterrolebindings
```

Use the service account token to authenticate as that SA (examples):

```bash
# Get token name
SECRET_NAME=$(kubectl get sa app-user-sa -n atonixcorp-dev -o jsonpath='{.secrets[0].name}')
# Extract token
kubectl get secret $SECRET_NAME -n atonixcorp-dev -o jsonpath='{.data.token}' | base64 --decode
```

Mount the token for pods that need limited permissions by specifying serviceAccountName in pod specs.

## Audit Logging

1. Place the audit policy at /etc/kubernetes/audit-policy.yaml on each control-plane node or in your cluster management config.

2. Configure the API server to use the policy and write logs to a file or external system. Example flags for kube-apiserver:

--audit-policy-file=/etc/kubernetes/audit-policy.yaml \
--audit-log-path=/var/log/kubernetes/audit.log \
--audit-log-maxage=30 \
--audit-log-maxbackup=10 \
--audit-log-maxsize=100

3. Restart kube-apiserver (or your control plane) to pick up settings.

4. Verify audit logs:

```bash
# tail the audit log
sudo tail -f /var/log/kubernetes/audit.log

# Search for events
sudo jq -c '. | select(.user.username=="system:serviceaccount:atonixcorp-dev:app-admin-sa")' /var/log/kubernetes/audit.log
```

## Verification and Troubleshooting

- Ensure RBAC rules are least-privilege.
- Test actions as service accounts using temporary kubeconfig contexts.
- For audit: ensure control-plane nodes have disk and rotation configured.

## Notes

- Enabling API server audit logging requires access to control-plane configuration (self-managed clusters). For managed services (EKS/GKE/AKS) use provider-specific audit/CloudTrail/Audit Logs features.
