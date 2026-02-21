IPv6 enablement checklist and MetalLB dual-stack guidance

Before applying any dual-stack Service or IPv6 MetalLB pool you must ensure the following are true:

1) Node network IPv6 readiness
   - Each Kubernetes node must have an IPv6 address configured on the NIC where cluster traffic flows.
   - Verify with `ip -6 addr` on each node or `kubectl get nodes -o wide` and check .status.addresses for IPv6.

2) CNI and cluster dual-stack support
   - Your CNI plugin must support dual-stack (Calico, Cilium, etc.). Configure CNI according to its docs for IPv6/dual-stack.
   - kube-apiserver, kube-controller-manager, kubelet must be configured for dual-stack at cluster boot time.

3) MetalLB IPv6 pool
   - Choose an IPv6 address range that is routable on your L2 (global range or ULA) and does not conflict with other hosts.
   - Example MetalLB config snippet:

apiVersion: v1
kind: ConfigMap
metadata:
  namespace: metallb-system
  name: config
data:
  config: |
    address-pools:
    - name: ipv4-pool
      protocol: layer2
      addresses:
      - 192.168.1.240-192.168.1.250
    - name: ipv6-pool
      protocol: layer2
      addresses:
      - fd00:abcd::100-fd00:abcd::120

4) Apply dual-stack Service
   - After nodes and MetalLB ready, apply the dual-stack Service manifest (example `k8s/base/patch-frontend-dualstack.yaml`). The Service will then request an IPv6 and an IPv4 VIP.

5) Verify IPv6 allocation
   - `kubectl -n atonixcorp get svc frontend -o yaml` will show `spec.ipFamilies: [IPv6, IPv4]` and `status.loadBalancer.ingress` should include an IPv6 address.

Warnings:
- Do NOT apply dual-stack services before your nodes are IPv6-ready — the Service creation may fail.
- If unsure, test in a staging cluster first.
