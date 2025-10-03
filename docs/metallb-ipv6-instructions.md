MetalLB IPv6 pool and Service changes

This document shows the manifests and commands to add a globally-routable IPv6 IPAddressPool to MetalLB and how to change Services to request IPv6 addresses.

Prerequisites
- You must have a globally-routable IPv6 prefix routed to your Kubernetes nodes (provided by your ISP or datacenter).
- MetalLB speakers must be on the same L2 network or you must configure BGP. The example below uses L2 mode.
- Your cluster must support IPv6 Service ipFamilies if you plan to create dual-stack/IPv6 Services. If your cluster is currently single-stack IPv4, converting to dual-stack is needed before IPv6-only Services are accepted by the API.

Files added to repo
- k8s/metallb/ipv6-global-pool.yaml  (IPAddressPool)  - replace placeholder network with your global IPv6 range
- k8s/metallb/l2-advertise-ipv6-global.yaml  (L2Advertisement)

Apply the pool and advertisement
```bash
kubectl apply -f k8s/metallb/ipv6-global-pool.yaml
kubectl apply -f k8s/metallb/l2-advertise-ipv6-global.yaml
```

Change an existing Service to request an IPv6 (two approaches)

A) IPv6-only Service (single-stack IPv6)
- Requires the Service to have an IPv6 ClusterIP and the apiserver must allow IPv6 families.
- If your cluster is dual-stack or IPv6-enabled, you can patch a Service like this:

```bash
kubectl patch svc frontend -n atonixcorp --type='merge' -p '{"spec":{"ipFamilies":["IPv6"],"ipFamilyPolicy":"SingleStack","loadBalancerIP":"2001:db8:abcd:1::50"}}'
```

- Or create a new IPv6-only Service YAML (replace addresses with your pool allocation):

```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-ipv6
  namespace: atonixcorp
  annotations:
    metallb.universe.tf/address-pool: ipv6-global
spec:
  selector:
    app: frontend
  type: LoadBalancer
  ipFamilies:
  - IPv6
  ipFamilyPolicy: SingleStack
  loadBalancerIP: 2001:db8:abcd:1::50
  ports:
  - name: http
    port: 80
    targetPort: 80
```

B) Dual-stack Service (both IPv4 and IPv6)
- Requires cluster dual-stack support.
- Example patch to prefer IPv4 primary and also request IPv6 (replace with real IPv6):

```bash
kubectl patch svc frontend -n atonixcorp --type='merge' -p '{"spec":{"ipFamilies":["IPv4","IPv6"],"ipFamilyPolicy":"PreferDualStack","loadBalancerIP":"2001:db8:abcd:1::51"}}'
```

Caveats
- On a single-stack IPv4 control plane, attempting to patch `ipFamilies` to include IPv6 will be rejected with an error similar to: "spec.clusterIPs[0]: Invalid value: \"10.x.x.x\": expected an IPv6 value as indicated by `ipFamilies[0]`". This is because the service's clusterIP is IPv4 and the API expects matching family order.
- If the API rejects changes, the recommended path is to create a new dual-stack or IPv6-enabled cluster.

Validation steps
- Check the Service after applying/paching it:
  kubectl get svc frontend -n atonixcorp -o yaml
  Look at `status.loadBalancer.ingress` for `ip` entries (IPv6 will show as an IPv6 string). Check MetalLB controller logs for allocation info:
  kubectl -n metallb-system logs deployment/controller --tail=200

If you'd like, I can:
- Replace the placeholder `2001:db8:abcd:1::/64` in `k8s/metallb/ipv6-global-pool.yaml` with the IPv6 prefix you supply and apply the resources.
- Attempt to patch the Service (if your control plane is dual-stack). Tell me the IPv6 prefix and whether your cluster is already configured for dual-stack.

If you don't have a global IPv6 prefix or cannot configure dual-stack, I recommend Option A from my earlier message: create a public IPv6 reverse-proxy and point AAAA there.