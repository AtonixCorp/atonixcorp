# OVN – Logical Network Configuration

This directory contains OVN logical network definitions applied via the OpenStack Neutron API and direct OVN NorthBound DB configuration for advanced routing.

## BGP Configuration for VM ↔ Pod Routing

OVN must have a static route pointing pod CIDRs (`192.168.0.0/16`) back to the Calico border nodes.

### Adding the Pod CIDR Route

```bash
# Replace <calico-node-fixed-ip> with the fixed IP of a Calico BGP border node
openstack router set ax-main-router \
  --route destination=192.168.0.0/16,gateway=<calico-node-fixed-ip>
```

### Logical Router Standards

```bash
# Create standard tenant router
openstack router create ax-tenant-router \
  --external-gateway ax-provider \
  --enable-snat

# Attach tenant network
openstack router add subnet ax-tenant-router ax-tenant-subnet
```

## OVN Port Groups (Security Groups)

Port groups map 1:1 to Neutron security groups. These are managed exclusively through Terraform — never directly in the NB DB.

## See Also

- Neutron security group templates: `openstack/networking/security-groups.yaml`
- Calico BGP peer config: `networking/calico/bgp-configuration.yaml`
