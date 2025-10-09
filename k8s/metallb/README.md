MetalLB installation notes

This folder contains manifests and examples to install MetalLB (v0.13+) for IPv4 and IPv6 address pools.

Prereqs
- Kubernetes cluster (kubeadm/kind/k3s) with nodes reachable on the L2 network for MetalLB L2 mode.
- If you run on cloud providers, use their load balancer or follow provider docs.

Install steps (recommended):
1. Apply the official MetalLB manifests:
   kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.13.11/config/manifests/metallb-native.yaml

2. Create IPAddressPool(s) and L2Advertisement(s). Example manifests are in this directory:
   - ipv4-pool.yaml
   - ipv6-pool.yaml

3. After IPAddressPools are created, create a Service of type LoadBalancer and MetalLB will assign an address from the pool.

IPv6 notes
- For lab/testing, use ULA ranges (fd00::/48) or a specific /64 for the pool.
- For production you must use IPv6 ranges you control and configure routing on your network.

Security
- Adjust firewall rules to allow the chosen IPv6 ranges.

Validation
- kubectl get pods -n metallb-system
- kubectl get ippools -n metallb-system
- kubectl get svc -o wide

If you want, I can apply these manifests to your cluster now. Reply "apply metallb" and I'll run the commands (I will show each command first).