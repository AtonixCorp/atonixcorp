# Kube-OVN Installation for AtonixCorp Platform

This directory contains the complete Kube-OVN networking plugin installation for advanced Kubernetes networking capabilities.

## Overview

Kube-OVN provides:
- **Subnet Management**: Advanced IP address management and subnet isolation
- **Network Policies**: Kubernetes network policy implementation
- **Load Balancing**: Built-in load balancer for services
- **QoS**: Quality of Service for network traffic
- **Security Groups**: Advanced security group functionality
- **VPC Support**: Virtual Private Cloud networking
- **Multi-tenancy**: Namespace-based network isolation

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   OVN Central   │    │ OVN Controller  │    │  Kube-OVN CNI  │
│   (ovn-nb/sb)   │──│   (ovs-vswitchd)│──│   (kube-ovn)   │
│                 │    │                 │    │                 │
│ • NB Database   │    │ • Flow Rules    │    │ • IPAM          │
│ • SB Database   │    │ • Port Binding  │    │ • CNI Plugin    │
│ • North Daemon  │    │ • QoS           │    │ • Network Policies│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Geneve VXLAN  │
                    │   Tunnels       │
                    │                 │
                    │ • Pod-to-Pod    │
                    │ • Service       │
                    │ • External      │
                    └─────────────────┘
```

## Installation

### Prerequisites
- Kubernetes 1.16+
- Cluster with at least 3 nodes recommended for HA
- Nodes with kernel modules support (Open vSwitch)
- Sufficient CPU and memory resources

### 1. Install RBAC and Config
```bash
kubectl apply -f k8s/kube-ovn/01-rbac.yaml
```

### 2. Install CRDs
```bash
kubectl apply -f k8s/kube-ovn/02-crds.yaml
```

### 3. Deploy OVN Central
```bash
kubectl apply -f k8s/kube-ovn/04-ovn-central.yaml
```

### 4. Deploy OVN Controller
```bash
kubectl apply -f k8s/kube-ovn/05-ovn-controller.yaml
```

### 5. Deploy Kube-OVN Components
```bash
kubectl apply -f k8s/kube-ovn/03-operator.yaml
```

### 6. Create Default Subnet
```bash
kubectl apply -f k8s/kube-ovn/06-subnet.yaml
```

### One-Command Installation
```bash
for file in 01-rbac.yaml 02-crds.yaml 04-ovn-central.yaml 05-ovn-controller.yaml 03-operator.yaml 06-subnet.yaml; do
  kubectl apply -f k8s/kube-ovn/$file
done
```

## Configuration

### Network Configuration
The default configuration provides:
- **Pod CIDR**: `10.16.0.0/16`
- **Service CIDR**: `10.96.0.0/12` (inherited from cluster)
- **Node Switch CIDR**: `100.64.0.0/16`
- **Gateway**: `10.16.0.1`
- **MTU**: 1400 (Geneve overhead)

### Customizing Network Settings
Edit `01-rbac.yaml` ConfigMap `ovn-config` to modify:
- `default-cidr`: Pod network CIDR
- `default-gateway`: Gateway IP
- `network-type`: `geneve` (default) or `vlan`
- `enable-np`: Network policies (true/false)
- `enable-lb`: Load balancer (true/false)

## Usage Examples

### Creating Custom Subnets
```yaml
apiVersion: kubeovn.io/v1
kind: Subnet
metadata:
  name: custom-subnet
spec:
  protocol: IPv4
  cidrBlock: 10.20.0.0/16
  gateway: 10.20.0.1
  namespaces:
  - custom-namespace
  natOutgoing: true
```

### Network Policies
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-web
  namespace: default
spec:
  podSelector:
    matchLabels:
      app: web
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: api
    ports:
    - protocol: TCP
      port: 80
```

### Security Groups
```yaml
apiVersion: kubeovn.io/v1
kind: SecurityGroup
metadata:
  name: web-sg
spec:
  ingressRules:
  - ipVersion: ipv4
    protocol: tcp
    portRangeMin: 80
    portRangeMax: 80
    remoteType: address
    remoteAddress: 0.0.0.0/0
  egressRules:
  - ipVersion: ipv4
    protocol: tcp
    portRangeMin: 443
    portRangeMax: 443
    remoteType: address
    remoteAddress: 0.0.0.0/0
```

## Monitoring

### Health Checks
- OVN Central: Ports 6641 (NB), 6642 (SB), 6643 (Northd)
- OVN Controller: Health check probes
- Kube-OVN CNI: Port 10665

### Metrics
Kube-OVN exposes Prometheus metrics for:
- Network throughput
- Connection states
- Error rates
- Resource usage

### Logs
```bash
# OVN logs
kubectl logs -n kube-system -l app=ovn-central
kubectl logs -n kube-system -l app=ovn-controller

# Kube-OVN logs
kubectl logs -n kube-system -l app=kube-ovn-controller
kubectl logs -n kube-system -l app=kube-ovn-cni
```

## Troubleshooting

### Common Issues

1. **Pods Stuck in ContainerCreating**
   ```bash
   # Check CNI plugin
   kubectl logs -n kube-system -l app=kube-ovn-cni
   # Verify subnet configuration
   kubectl get subnet
   ```

2. **Network Policies Not Working**
   ```bash
   # Check network policy status
   kubectl get networkpolicy
   # Verify kube-ovn-controller logs
   kubectl logs -n kube-system -l app=kube-ovn-controller
   ```

3. **OVN Database Issues**
   ```bash
   # Check OVN central status
   kubectl get pods -n kube-system -l app=ovn-central
   # View database logs
   kubectl logs -n kube-system -l app=ovn-central
   ```

### Debug Commands
```bash
# Check node network status
kubectl get nodes -o wide

# View subnet information
kubectl get subnet
kubectl describe subnet ovn-default

# Check IP allocations
kubectl get ip
kubectl get ip -l app=your-app

# Network connectivity test
kubectl run test-pod --image=busybox -- sleep 3600
kubectl exec -it test-pod -- ping 10.16.0.1
```

## Integration with Existing Workflows

Kube-OVN integrates seamlessly with:
- **ArgoCD**: Network-aware application deployments
- **Tekton**: Pipeline network isolation
- **Prometheus**: Advanced network monitoring
- **Istio**: Service mesh integration
- **Cert-Manager**: Certificate-based authentication

## Security Features

- **Network Segmentation**: VPC and subnet isolation
- **Access Control**: Security groups and network policies
- **Traffic Encryption**: Optional IPsec encryption
- **Audit Logging**: Network access logging
- **Compliance**: PCI DSS and HIPAA compliance support

## Performance Tuning

### Resource Allocation
```yaml
# Controller resources
resources:
  requests:
    cpu: 200m
    memory: 200Mi
  limits:
    cpu: 1000m
    memory: 1Gi

# CNI resources
resources:
  requests:
    cpu: 100m
    memory: 100Mi
  limits:
    cpu: 1000m
    memory: 1Gi
```

### Network Optimization
- **MTU**: Adjust for your infrastructure
- **Geneve vs VLAN**: Choose based on requirements
- **QoS**: Configure traffic prioritization
- **Load Balancing**: Enable for high-traffic services

## Upgrade

To upgrade Kube-OVN:
1. Backup network configuration
2. Update image versions in YAML files
3. Apply updated manifests
4. Verify network connectivity
5. Clean up old resources

## Support

For issues and questions:
- Check the [Kube-OVN documentation](https://kubeovn.github.io/docs/)
- Review [GitHub issues](https://github.com/kubeovn/kube-ovn/issues)
- Join the community discussions

## License

Kube-OVN is licensed under the Apache License 2.0.