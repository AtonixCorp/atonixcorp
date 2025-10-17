# Local Spark with Apache proxy

This guide starts a small Spark master + worker along with an Apache httpd reverse proxy that exposes the Spark master UI at http://localhost/spark and the worker UI at http://localhost/spark/worker.

Files created:
- `docker/docker-compose.spark.yml` - compose file that starts Spark master, worker and Apache httpd.
- `docker/apache-spark.conf` - httpd config used by the Apache container to proxy /spark to the master UI and /spark/worker to the worker UI.

How to run (using nerdctl):

1. From the project root (where `docker` folder lives):

```bash
cd docker
nerdctl compose -f docker-compose.spark.yml up -d
```

2. Check containers:

```bash
nerdctl ps --filter "name=spark-" --filter "name=apache-spark-proxy"
```

3. Open the Spark master UI in your browser:

http://localhost/spark/

4. Worker UI:

http://localhost/spark/worker/

If something fails:
- Inspect logs: `nerdctl logs spark-master`, `nerdctl logs spark-worker`, `nerdctl logs apache-spark-proxy`.
- Common issues: port 80 already in use (stop other web servers), image pull errors (ensure internet access) or firewall rules blocking ports.
# Spark + Apache local run (dev)

This file explains how to quickly run an Apache proxy in front of a Spark master and worker using Docker Compose.

Prerequisites
- Docker and Docker Compose (or compatible `docker compose`) installed and working locally.

Start

Run from the repository root:

```bash
cd docker
docker compose -f docker-compose.spark.yml up -d
```

Access
- Spark Master UI via Apache reverse proxy: http://localhost/spark/
- Direct Spark Master UI: http://localhost:8080/

Stop

```bash
cd docker
docker compose -f docker-compose.spark.yml down
```

Troubleshooting
- If the Apache container fails to start because `mod_proxy` is not available in the runtime image, use the `httpd:2.4` official image which includes mod_proxy. The compose file uses that image.
- If ports 80 or 8080 are in use, change the host ports in `docker-compose.spark.yml`.
- If Spark UI doesn't show up, check container logs:

```bash
docker compose -f docker-compose.spark.yml logs spark-master --tail 200
docker compose -f docker-compose.spark.yml logs apache-proxy --tail 200
```
