# AtonixCorp Apache2 Reverse Proxy Guide

## Overview

This guide explains how to set up Apache2 as a reverse proxy for the AtonixCorp platform using Docker. The setup provides:

- **Frontend**: `atonixcorp.org` (React application on port 80/443)
- **API Backend**: `api.atonixcorp.org` (Django backend on port 80/443)
- **HTTPS Support**: Optional SSL/TLS encryption for production

## Quick Start

### 1. Clone and Navigate
```bash
cd /home/atonixdev/atonixcorp
```

### 2. Run Setup Script
```bash
chmod +x setup-docker.sh
./setup-docker.sh
```

This script will:
- Create the Docker network
- Check for required tools
- Add hosts entries to `/etc/hosts`
- Optionally generate SSL certificates

### 3. Build and Start
```bash
# Build images
docker-compose -f docker-compose.local.main.yml build

# Start all services
docker-compose -f docker-compose.local.main.yml up -d

# Check status
docker-compose -f docker-compose.local.main.yml ps
```

### 4. Access Services
- **Frontend**: http://atonixcorp.org or http://localhost
- **API**: http://api.atonixcorp.org or http://localhost:8000
- **Admin Panel**: http://api.atonixcorp.org/admin

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ User Browser / Client                                       │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/HTTPS (80/443)
                       
┌─────────────────────────────────────────────────────────────┐
│ Apache2 Reverse Proxy (atonixcorp_apache_proxy)             │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Virtual Hosts:                                        │   │
│ │ - atonixcorp.org → frontend:3001/80                  │   │
│ │ - api.atonixcorp.org → backend:8000                  │   │
│ │ - Rewrites /api calls intelligently                  │   │
│ └───────────────────────────────────────────────────────┘   │
└──────────────┬──────────────────────────┬──────────────────┘
               │                          │
       ┌───────────────┐        ┌─────────────────┐
       │ Frontend       │        │ Backend          │
       │ (React App)    │        │ (Django API)     │
       │ Port: 80       │        │ Port: 8000       │
       │ (or 3001)      │        │                  │
       └────────────────┘        └────────────────┘
```

## File Structure

```
docker/
├── apache2/
│   ├── httpd.conf              # Main Apache config
│   ├── vhosts.conf             # HTTP virtual hosts
│   ├── vhosts-ssl.conf         # HTTPS virtual hosts
│   ├── Dockerfile.apache2      # Apache Docker image
│   ├── certs/                  # SSL certificates (production)
│   │   ├── atonixcorp.org.crt
│   │   ├── atonixcorp.org.key
│   │   ├── api.atonixcorp.org.crt
│   │   └── api.atonixcorp.org.key
│   └── README.md               # Detailed Apache configuration
├── Dockerfile.apache2          # Apache Docker image definition
└── ...
```

## Common Commands

### Start Services
```bash
# Start all services in background
docker-compose -f docker-compose.local.main.yml up -d

# Start with logs in foreground
docker-compose -f docker-compose.local.main.yml up

# Start specific services only
docker-compose -f docker-compose.local.main.yml up -d apache-proxy backend frontend
```

### View Logs
```bash
# View all logs
docker-compose -f docker-compose.local.main.yml logs

# Follow logs in real-time
docker-compose -f docker-compose.local.main.yml logs -f

# View specific service logs
docker-compose -f docker-compose.local.main.yml logs -f apache-proxy
docker-compose -f docker-compose.local.main.yml logs -f backend
docker-compose -f docker-compose.local.main.yml logs -f frontend
```

### Stop Services
```bash
# Stop all services
docker-compose -f docker-compose.local.main.yml down

# Stop and remove volumes
docker-compose -f docker-compose.local.main.yml down -v
```

### Rebuild
```bash
# Rebuild all images
docker-compose -f docker-compose.local.main.yml build

# Rebuild specific image
docker-compose -f docker-compose.local.main.yml build apache-proxy

# Rebuild without cache
docker-compose -f docker-compose.local.main.yml build --no-cache
```

### Debugging
```bash
# Check container status
docker-compose -f docker-compose.local.main.yml ps

# Inspect network
docker network inspect atonixcorp_net

# Execute command in container
docker-compose -f docker-compose.local.main.yml exec apache-proxy bash

# Check Apache syntax
docker-compose -f docker-compose.local.main.yml exec apache-proxy \
  httpd -t

# Test connectivity
docker-compose -f docker-compose.local.main.yml exec apache-proxy \
  curl -H "Host: atonixcorp.org" http://localhost/
```

## Configuration Details

### Virtual Host: atonixcorp.org (Frontend)

**Purpose**: Serves the React frontend and handles client requests

**Features**:
- Proxies requests to `frontend:80` 
- Handles static file serving (React assets)
- Forwards `/api` requests to backend
- Sets proper `X-Forwarded-*` headers

**Request Flow**:
```
User → atonixcorp.org → Apache → React Frontend
```

### Virtual Host: api.atonixcorp.org (Backend API)

**Purpose**: Serves Django REST API endpoints

**Features**:
- Proxies all requests to `backend:8000`
- Includes CORS headers for cross-origin requests
- Sets `X-Forwarded-*` headers for Django
- Handles `OPTIONS` requests for CORS preflight

**Request Flow**:
```
Client → api.atonixcorp.org → Apache → Django Backend
```

## Environment Configuration

### Backend Environment Variables
```bash
ALLOWED_HOSTS=atonixcorp.org,www.atonixcorp.org,api.atonixcorp.org,www.api.atonixcorp.org
CSRF_TRUSTED_ORIGINS=https://atonixcorp.org,https://api.atonixcorp.org
USE_HTTPS=True  # For production
DEBUG=False     # For production
```

### Frontend Environment Variables
```bash
REACT_APP_API_URL=https://api.atonixcorp.org/api
REACT_APP_FRONTEND_URL=https://atonixcorp.org
REACT_APP_ENVIRONMENT=production
```

### Apache Configuration
Edit `docker/apache2/httpd.conf` for:
- Worker pool settings
- Timeout values
- Cache settings
- Logging configuration

## SSL/HTTPS Setup (Production)

### Using Let's Encrypt (Recommended)

1. **Get certificates**:
```bash
sudo certbot certonly --standalone -d atonixcorp.org -d www.atonixcorp.org
sudo certbot certonly --standalone -d api.atonixcorp.org
```

2. **Copy to Docker volume**:
```bash
sudo cp /etc/letsencrypt/live/atonixcorp.org/fullchain.pem \
  docker/apache2/certs/atonixcorp.org.crt
sudo cp /etc/letsencrypt/live/atonixcorp.org/privkey.pem \
  docker/apache2/certs/atonixcorp.org.key

sudo cp /etc/letsencrypt/live/api.atonixcorp.org/fullchain.pem \
  docker/apache2/certs/api.atonixcorp.org.crt
sudo cp /etc/letsencrypt/live/api.atonixcorp.org/privkey.pem \
  docker/apache2/certs/api.atonixcorp.org.key

# Fix permissions
sudo chown -R $(whoami) docker/apache2/certs
```

3. **Update docker-compose**:
```bash
# Edit docker-compose.local.main.yml apache-proxy volumes section:
volumes:
  - ./docker/apache2/httpd.conf:/usr/local/apache2/conf/httpd.conf:ro
  - ./docker/apache2/vhosts-ssl.conf:/usr/local/apache2/conf.d/vhosts.conf:ro
  - ./docker/apache2/certs:/etc/apache2/certs:ro
```

4. **Restart Apache**:
```bash
docker-compose -f docker-compose.local.main.yml restart apache-proxy
```

### Using Self-Signed Certificates (Development)

The setup script can generate these automatically, or manually:

```bash
# Frontend
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout docker/apache2/certs/atonixcorp.org.key \
  -out docker/apache2/certs/atonixcorp.org.crt \
  -subj "/C=US/ST=State/L=City/O=AtonixCorp/CN=atonixcorp.org"

# API
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout docker/apache2/certs/api.atonixcorp.org.key \
  -out docker/apache2/certs/api.atonixcorp.org.crt \
  -subj "/C=US/ST=State/L=City/O=AtonixCorp/CN=api.atonixcorp.org"
```

## Troubleshooting

### Apache Won't Start
```bash
# Check configuration syntax
docker-compose -f docker-compose.local.main.yml exec apache-proxy \
  httpd -t

# View detailed error logs
docker-compose -f docker-compose.local.main.yml logs apache-proxy
```

### 502 Bad Gateway Error
```bash
# Check if backend is running
docker-compose -f docker-compose.local.main.yml ps backend

# Check if containers can communicate
docker-compose -f docker-compose.local.main.yml exec apache-proxy \
  curl http://atonixcorp_backend:8000/health/

# Check backend logs
docker-compose -f docker-compose.local.main.yml logs backend
```

### Hostname Resolution Issues
```bash
# Verify /etc/hosts
cat /etc/hosts | grep atonixcorp

# Add entries if missing (for local development)
sudo bash -c 'echo "127.0.0.1 atonixcorp.org api.atonixcorp.org" >> /etc/hosts'
```

### CORS Issues
- Ensure `Access-Control-Allow-*` headers in `vhosts.conf`
- Check backend `CORS_ALLOWED_ORIGINS` setting
- Verify `CSRF_TRUSTED_ORIGINS` in backend settings

### SSL Certificate Issues
```bash
# Check certificate expiration
openssl x509 -text -noout -in docker/apache2/certs/atonixcorp.org.crt | \
  grep -A 1 "Not After"

# Verify certificate matches key
openssl x509 -noout -modulus -in docker/apache2/certs/atonixcorp.org.crt | \
  openssl md5

openssl rsa -noout -modulus -in docker/apache2/certs/atonixcorp.org.key | \
  openssl md5
```

## Performance Optimization

### Apache Configuration
Edit `docker/apache2/httpd.conf`:

```apache
# Increase worker pool for high traffic
<IfModule mpm_prefork_module>
    StartServers           8
    MinSpareServers        5
    MaxSpareServers       20
    MaxRequestWorkers    256
    MaxConnectionsPerChild 4000
</IfModule>

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml
</IfModule>
```

### Frontend Optimization
- Enable gzip in frontend build
- Minimize bundle size
- Cache static assets

### Backend Optimization
- Enable database connection pooling
- Use Redis caching
- Implement API rate limiting

## Monitoring

### Container Health
```bash
# Docker built-in health checks
docker-compose -f docker-compose.local.main.yml ps

# View health check history
docker inspect atonixcorp_apache_proxy | grep -A 20 "Health"
```

### Log Analysis
```bash
# Follow Apache access logs
docker-compose -f docker-compose.local.main.yml logs -f apache-proxy | \
  grep "HTTP"

# Monitor error rate
docker-compose -f docker-compose.local.main.yml logs apache-proxy | \
  grep "ERROR" | wc -l
```

### Resource Usage
```bash
# Check container resource consumption
docker stats atonixcorp_apache_proxy

# View detailed stats
docker compose -f docker-compose.local.main.yml stats
```

## Useful References

- [Apache Proxy Module](https://httpd.apache.org/docs/2.4/mod/mod_proxy.html)
- [Apache SSL Module](https://httpd.apache.org/docs/2.4/mod/mod_ssl.html)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Django Deployment with WSGI](https://docs.djangoproject.com/en/stable/howto/deployment/wsgi/)
- [React Production Build](https://create-react-app.dev/docs/production-build/)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review logs: `docker-compose logs -f`
3. Verify configuration: `httpd -t`
4. Check network connectivity: `docker network inspect atonixcorp_net`
