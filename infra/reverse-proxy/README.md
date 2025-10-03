Caddy reverse-proxy for IPv6 + TLS

Purpose
- Provide public IPv6 + automatic TLS (Let's Encrypt) for atonixcorp domains.
- Proxy incoming HTTPS requests to the cluster's IPv4 MetalLB EXTERNAL-IP addresses.

Quick start (on an IPv6-enabled public VM)

1. Install Docker and Docker Compose (if not installed).

2. Copy this repo to the VM and cd into `infra/reverse-proxy`.

3. Update `Caddyfile` with the public IPv6 AAAA records for your domains if you need domain-specific tweaks. The proxy addresses point at the current MetalLB IPv4 LBs (192.168.1.244 backend, 192.168.1.242 frontend).

4. Ensure DNS A/AAAA records point to the VM's public IPv6 address (or A record for IPv4 if you also have it). Let's Encrypt will validate via IPv6.

5. Run:

```bash
docker compose up -d
```

6. Verify TLS and access:

```bash
curl -vkI https://api.atonixcorp.org
curl -vkI https://www.atonixcorp.org
```

Notes
- Caddy will automatically obtain certificates from Let's Encrypt. If you prefer staging use the environment variable `CADDY_TLS_EMAIL` and `ACME_AGREE=false` with appropriate ACME server override.
- This approach avoids enabling dual-stack on the cluster and is fast to deploy.
- For production, lock down firewall to allow only required ports and run Caddy behind a process manager or systemd.
