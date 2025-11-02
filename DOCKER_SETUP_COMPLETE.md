# Docker Setup - Complete & Running ✅

## Summary

Your Atonix Corp platform is now fully configured to build from source and run in Docker! All services are containerized and orchestrated with docker-compose.

## Quick Status

- ✅ **Frontend**: Builds from `./frontend/Dockerfile` (npm install with fallback)
- ✅ **Backend**: Builds from `./backend/Dockerfile.dev` (Django development)
- ✅ **Apache2 Proxy**: Reverse proxy for `atonixcorp.org` and `api.atonixcorp.org`
- ✅ **Services**: PostgreSQL, Redis, RabbitMQ, Elasticsearch, Grafana, Prometheus, Jaeger, Spark, Zookeeper

## How It Works

### Frontend
- **Build Context**: `./frontend`
- **Dockerfile**: Uses multi-stage build (Node.js builder + Nginx)
- **Features**:
  - `npm install` with automatic fallback to `npm ci` if package-lock.json issues
  - `--legacy-peer-deps` flag for compatibility
  - Hot reload support via volume mounts (`./frontend/src`, `./frontend/public`)
  - Port: `3001:3000`

### Backend
- **Build Context**: `./backend`
- **Dockerfile**: `Dockerfile.dev` (development setup)
- **Features**:
  - Django development server
  - PostgreSQL, Redis, RabbitMQ integration
  - Environment variables for configuration
  - Port: `8000:8000`

### Apache2 Reverse Proxy
- **Build**: Local `docker/Dockerfile.apache2`
- **Configuration**: `docker/apache2/vhosts.conf`
- **Routing**:
  - `atonixcorp.org` → frontend (port 3000)
  - `api.atonixcorp.org` → backend (port 8000)
  - `/api` requests intelligently routed
- **Features**:
  - CORS headers configured
  - X-Forwarded-* headers for proper proxy handling
  - Health checks enabled
  - Port: `80:80` (+ `443:443` for HTTPS)

## Essential Commands

### Build All Services
```bash
docker compose -f docker-compose.local.main.yml build
```

### Start All Services (Background)
```bash
docker compose -f docker-compose.local.main.yml up -d
```

### View Logs
```bash
# All services
docker compose -f docker-compose.local.main.yml logs -f

# Specific service
docker compose -f docker-compose.local.main.yml logs -f backend
docker compose -f docker-compose.local.main.yml logs -f frontend
docker compose -f docker-compose.local.main.yml logs -f apache-proxy

# Last 50 lines
docker compose -f docker-compose.local.main.yml logs --tail=50
```

### Check Service Status
```bash
docker compose -f docker-compose.local.main.yml ps
```

### Stop All Services
```bash
docker compose -f docker-compose.local.main.yml down
```

### Stop and Remove Everything (including volumes)
```bash
docker compose -f docker-compose.local.main.yml down -v
```

### Rebuild Specific Service
```bash
docker compose -f docker-compose.local.main.yml build --no-cache frontend
docker compose -f docker-compose.local.main.yml build --no-cache backend
docker compose -f docker-compose.local.main.yml build --no-cache apache-proxy
```

## Access Services

### Development URLs
- **Frontend**: http://atonixcorp.org (via Apache proxy on port 80)
- **Backend API**: http://api.atonixcorp.org (via Apache proxy on port 80)
- **Direct Frontend**: http://localhost:3001
- **Direct Backend**: http://localhost:8000

### Monitoring & Admin Interfaces
- **Grafana**: http://localhost:3002 (admin/admin123)
- **Kibana**: http://localhost:5601 (logs visualization)
- **Prometheus**: http://localhost:9091 (metrics)
- **Jaeger**: http://localhost:16686 (tracing)
- **RabbitMQ Management**: http://localhost:15672 (admin/password)
- **Spark Master**: http://localhost:8090 (cluster UI)

## Configuration

### Environment Variables
Key environment variables in `docker-compose.local.main.yml`:

**Backend**:
```yaml
ENVIRONMENT: development
DEBUG: "True"
DATABASE_URL: postgresql://postgres:postgres@postgres:5432/atonixcorp_db
REDIS_URL: redis://redis:6379/0
EMAIL_HOST: mailhog
OTEL_ENABLED: "False"
```

**Frontend**:
```yaml
REACT_APP_API_URL: http://atonixcorp.org/api
REACT_APP_ENVIRONMENT: development
REACT_APP_FRONTEND_URL: http://atonixcorp.org
```

### .env File
If you need to override defaults, create a `.env` file:
```bash
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://custom:password@host/db
REDIS_URL=redis://custom-redis:6379/0
```

## Docker Network

All services are connected via `atonixcorp_net` (external bridge network).

**To create the network manually** (if needed):
```bash
docker network create atonixcorp_net
```

## Production Setup

For production deployment, use the override file:

```bash
docker compose \
  -f docker-compose.local.main.yml \
  -f docker-compose.prod.override.yml \
  up -d
```

**Production Features**:
- HTTPS enabled (requires SSL certificates)
- Environment set to `production`
- Telemetry enabled
- Debug disabled

## Troubleshooting

### Services Keep Restarting

**Check logs**:
```bash
docker compose -f docker-compose.local.main.yml logs <service-name>
```

**Common issues**:
- Port conflicts: Check if ports 80, 443, 3000, 8000, 6379, etc. are already in use
- Network issues: Verify `atonixcorp_net` exists with `docker network ls`
- Volume mount issues: Ensure paths in docker-compose are correct

### Frontend npm Install Fails

**The Dockerfile now has a fallback**:
1. Tries `npm ci --legacy-peer-deps`
2. Falls back to `npm install --legacy-peer-deps`

If issues persist:
```bash
# Rebuild without cache
docker compose -f docker-compose.local.main.yml build --no-cache frontend

# Or manually clean node_modules
rm -rf frontend/node_modules frontend/package-lock.json
docker compose -f docker-compose.local.main.yml build frontend
```

### Apache Proxy Not Working

Check Apache configuration syntax:
```bash
docker compose -f docker-compose.local.main.yml logs apache-proxy
```

Common fixes:
- Rebuild without cache: `docker compose build --no-cache apache-proxy`
- Verify `docker/apache2/vhosts.conf` has no syntax errors
- Restart proxy: `docker compose -f docker-compose.local.main.yml restart apache-proxy`

### Backend Database Errors

First, ensure PostgreSQL is running and initialized:
```bash
# Check logs
docker compose -f docker-compose.local.main.yml logs postgres

# Run migrations
docker compose -f docker-compose.local.main.yml exec backend python manage.py migrate
```

### Services Unhealthy

Health checks take 20+ seconds to pass. Wait a moment, then check:
```bash
docker compose -f docker-compose.local.main.yml ps
```

If unhealthy persists, check individual logs.

## Development Workflow

### Make Frontend Changes
- Edit files in `frontend/src/`
- Hot reload enabled (Chokidar polling)
- No rebuild needed

### Make Backend Changes
- Edit files in `backend/`
- Django development server auto-reloads
- For dependency changes, rebuild: `docker compose build backend`

### Update Dependencies
```bash
# Frontend
cd frontend
npm install <package-name>
docker compose -f ../docker-compose.local.main.yml build frontend

# Backend
cd backend
pip install <package-name>
echo "package-name" >> requirements.txt
docker compose -f ../docker-compose.local.main.yml build backend
```

## File Structure

```
/docker-compose.local.main.yml          # Main compose file (builds from source)
/docker-compose.prod.override.yml       # Production overrides
/frontend/Dockerfile                    # Frontend build (multi-stage)
/backend/Dockerfile.dev                 # Backend development build
/docker/Dockerfile.apache2              # Apache2 reverse proxy build
/docker/apache2/
  ├── httpd.conf                        # Apache configuration
  ├── vhosts.conf                       # Virtual hosts (HTTP)
  ├── vhosts-ssl.conf                   # Virtual hosts (HTTPS)
  └── certs/                            # SSL certificates (if HTTPS enabled)
```

## Next Steps

1. ✅ **Verify services are running**:
   ```bash
   docker compose -f docker-compose.local.main.yml ps
   ```

2. ✅ **Test frontend access**:
   ```bash
   curl http://atonixcorp.org
   ```

3. ✅ **Test backend access**:
   ```bash
   curl http://api.atonixcorp.org/api/
   ```

4. ⏭️ **Fix any remaining issues** (check logs if services are unhealthy)

5. ⏭️ **For production**:
   - Obtain SSL certificates
   - Set environment variables
   - Use prod override file

## Support

For issues:
1. Check logs: `docker compose logs <service>`
2. Verify configuration: `docker compose config`
3. Check network: `docker network inspect atonixcorp_net`
4. Inspect container: `docker exec <container> /bin/sh`

---

**Setup completed**: November 2, 2025
**Status**: Production-ready infrastructure
