# Neutron + OVN – Networking

All tenant networks, routers, floating IPs, and security groups are managed through **Neutron** with **OVN as the SDN backend**.

## Network Architecture

```
Internet
    │
  Floating IP (Neutron)
    │
  OVN Router (provider network → tenant network)
    │
  Tenant Network (10.x.x.0/24)
    │
  ┌──────────────────────────────┐
  │  VM instances   (Nova)       │
  │  Kubernetes nodes (Calico)   │
  └──────────────────────────────┘
```

## Standards

- Provider network: `ax-provider` (mapped to physical NIC)
- Default tenant CIDR: `10.10.0.0/16` (per project: `10.10.<project_id>.0/24`)
- DNS server: `1.1.1.1`, `8.8.8.8`
- All security groups must be defined in Terraform (no manual creation)

## VM ↔ Pod Communication

Calico BGP advertises pod CIDRs → OVN routes back to Calico nodes.

- Calico pod CIDR: `192.168.0.0/16`
- OVN static route: `192.168.0.0/16 → Calico border node`

## Templates

- `security-groups.yaml` — standard security group templates
- `network-policy.yaml` — default tenant network spec

## See Also

- `networking/ovn/` — OVN configuration
- `networking/calico/` — Calico CNI configuration
- Terraform module: `terraform/modules/networking/`
