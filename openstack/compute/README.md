# Nova – Compute

Manages VM lifecycle: flavors, keypairs, hypervisor placement, and quotas.

## Flavors

Define standard VM sizes here. Apply via:

```bash
openstack flavor create --ram 4096 --vcpus 2 --disk 40 ax.standard.medium
```

## Hypervisor Placement

Use host-aggregate and availability-zone policies in `nova.conf` to separate:
- General compute (`ax-general`)
- GPU workloads (`ax-gpu`)
- High-memory workloads (`ax-highmem`)

## Templates

- `flavors.yaml` — standard flavor definitions
- `keypairs.yaml` — shared keypair references
- `quotas.yaml` — per-project resource quotas

## See Also

- Terraform module: `terraform/modules/compute/`
- Ansible role: `ansible/roles/vm-base/`
