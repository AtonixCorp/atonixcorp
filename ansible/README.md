# Ansible – Configuration Management

All **VM OS configuration** and **Kubernetes node setup** is managed exclusively through Ansible. No manual SSH configuration.

## Folder Structure

```
ansible/
├── inventory/          # Host inventory (dynamic via OpenStack)
├── playbooks/          # Top-level playbooks (entry points)
│   ├── site.yml        # Full environment convergence
│   ├── k8s-nodes.yml   # Kubernetes node provisioning
│   ├── monitoring.yml  # Monitoring agent deployment
│   ├── serverless.yml  # Serverless runtime setup
│   └── security.yml    # Security hardening
└── roles/              # Reusable Ansible roles
    ├── vm-base/        # Base OS config for all VMs
    ├── k8s-node/       # Kubernetes node bootstrap
    ├── storage-mount/  # Format + mount Cinder volumes
    ├── monitoring-agent/ # node_exporter + Prometheus
    ├── security-harden/  # CIS benchmark hardening
    └── serverless-runtime/ # Knative/OpenFaaS node setup
```

## Rules

1. **All VM configuration must be done through Ansible roles** — no manual SSH.
2. **All roles must be idempotent** — re-running must produce the same result.
3. **Inventory is generated dynamically** from OpenStack (see `inventory/openstack.yml`).
4. **Secrets** are never in playbooks — use Vault (`identity/vault/`) or `ansible-vault`.

## Running Playbooks

```bash
# Full site convergence
ansible-playbook -i inventory/openstack.yml playbooks/site.yml

# Kubernetes nodes only
ansible-playbook -i inventory/openstack.yml playbooks/k8s-nodes.yml --limit k8s_nodes

# Security hardening
ansible-playbook -i inventory/openstack.yml playbooks/security.yml
```

## CI/CD Integration

Playbooks are triggered via GitOps pipelines in `.github/workflows/` after Terraform apply.

## See Also

- Terraform (provisions VMs): `terraform/`
- Identity & secrets: `identity/`
- Kubernetes layer: `k8s/`
