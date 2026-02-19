# Apache2 Setup - What Was Created

## Summary

I've created a complete Apache2 reverse proxy setup for your AtonixCorp platform with support for both HTTP (development) and HTTPS (production) configurations.

## Files Created

### 1. Apache Configuration Files
- **`docker/apache2/httpd.conf`** - Main Apache configuration
  - Loads all necessary modules (proxy, rewrite, SSL, headers, etc.)
  - Configures worker pool and logging
  - Includes virtual host definitions

- **`docker/apache2/vhosts.conf`** - HTTP virtual hosts (development)
  - `atonixcorp.org` → Frontend (port 80)
  - `api.atonixcorp.org` → Backend API (port 8000)
  - Automatic API request routing
  - CORS headers for API

- **`docker/apache2/vhosts-ssl.conf`** - HTTPS virtual hosts (production)
  - SSL/TLS encryption support
  - HTTP → HTTPS redirect
  - HSTS headers for security
  - Separate certificates for each domain

- **`docker/apache2/certs/`** - SSL certificates directory
  - Place your certificates here for production

### 2. Docker Configuration
- **`docker/Dockerfile.apache2`** - Apache2 Docker image
  - Builds on official `httpd:2.4` image
  - Includes curl for health checks
  - Loads all required modules
  - Configured for reverse proxying

### 3. Docker Compose Files
- **`docker-compose.local.main.yml`** - Updated main compose file
  - Added `apache-proxy` service
  - Replaced old nginx entry with new Apache setup
  - Configured for local development

- **`docker-compose.prod.override.yml`** - Production override file
  - Enable HTTPS configuration
  - Production environment settings
  - HTTPS URLs for frontend/backend

### 4. Automation Scripts
- **`setup-docker.sh`** - One-command setup script
  - Creates Docker network
  - Adds hosts entries
  - Generates self-signed certificates
  - Validates Docker installation
  - Creates `.env` file template

### 5. Documentation
- **`docker/apache2/README.md`** - Technical Apache configuration guide
  - Configuration file details
  - Setup instructions (HTTP & HTTPS)
  - Troubleshooting tips
  - Performance tuning

- **`APACHE2_GUIDE.md`** - Comprehensive user guide
  - Overview and quick start
  - Architecture explanation
  - Common commands reference
  - Environment configuration
  - SSL/HTTPS setup guide
  - Troubleshooting section
  - Performance optimization tips
  - Monitoring guidelines

## Architecture

```
User Browser
    ↓ (HTTP/HTTPS)
Apache2 Reverse Proxy (Port 80 & 443)
    ├─→ atonixcorp.org → React Frontend (Port 80/3001)
    ├─→ api.atonixcorp.org → Django Backend (Port 8000)
    └─→ /api paths → Backend (Port 8000)
```

## Quick Start

```bash
# 1. Run setup script
chmod +x setup-docker.sh
./setup-docker.sh

# 2. Build Docker images
docker-compose -f docker-compose.local.main.yml build

# 3. Start services
docker-compose -f docker-compose.local.main.yml up -d

# 4. Access services
# Frontend: http://atonixcorp.org
# API: http://api.atonixcorp.org
```

## Key Features

 **Virtual Hosts**
- Separate domains for frontend and API
- Automatic request routing
- Hostname-based proxying

 **Security**
- X-Frame-Options header (prevents clickjacking)
- X-Content-Type-Options (prevents MIME sniffing)
- X-XSS-Protection (XSS protection)
- CORS headers for API

 **Performance**
- ProxyPreserveHost (maintains host header)
- ProxyPassReverse (rewrites Location headers)
- Worker pool optimization
- Configurable timeouts

 **SSL/HTTPS Support**
- Let's Encrypt integration
- Self-signed certificate generation
- HTTP → HTTPS redirect
- HSTS headers

 **Debugging**
- Health checks on containers
- Structured logging
- Easy log access
- Diagnostic commands

## Configuration

### Development (HTTP)
- Uses `vhosts.conf`
- No SSL certificates needed
- Direct localhost access
- `/etc/hosts` entries required

### Production (HTTPS)
- Uses `vhosts-ssl.conf`
- SSL certificates required
- HTTP redirects to HTTPS
- HSTS enabled

## Environment Setup

The `setup-docker.sh` script automatically:
1.  Creates Docker network (`atonixcorp_net`)
2.  Validates Docker installation
3.  Updates `/etc/hosts` file
4.  Creates `.env` file template
5.  Optionally generates SSL certificates

## Docker-Compose Commands

```bash
# Build
docker-compose -f docker-compose.local.main.yml build

# Start
docker-compose -f docker-compose.local.main.yml up -d

# Stop
docker-compose -f docker-compose.local.main.yml down

# View logs
docker-compose -f docker-compose.local.main.yml logs -f apache-proxy

# View all containers
docker-compose -f docker-compose.local.main.yml ps

# Execute commands
docker-compose -f docker-compose.local.main.yml exec apache-proxy bash
```

## Troubleshooting

### Can't access http://atonixcorp.org
1. Check `/etc/hosts` has the entries
2. Verify Apache container is running: `docker ps | grep apache`
3. Check logs: `docker logs atonixcorp_apache_proxy`

### 502 Bad Gateway
1. Ensure backend is running: `docker ps | grep backend`
2. Check backend logs: `docker logs atonixcorp_backend`
3. Test connectivity: `docker exec atonixcorp_apache_proxy curl http://atonixcorp_backend:8000/`

### SSL Certificate Issues
1. Run setup script to generate: `./setup-docker.sh`
2. Or generate manually with provided commands
3. Ensure certificates in `docker/apache2/certs/`

## Next Steps

1. **Run Setup**: Execute `./setup-docker.sh`
2. **Edit .env**: Add your configuration values
3. **Build**: `docker-compose -f docker-compose.local.main.yml build`
4. **Start**: `docker-compose -f docker-compose.local.main.yml up -d`
5. **Access**: Visit http://atonixcorp.org

## File Locations

```
atonixcorp/
├── docker/
│   ├── apache2/
│   │   ├── httpd.conf
│   │   ├── vhosts.conf
│   │   ├── vhosts-ssl.conf
│   │   ├── Dockerfile.apache2
│   │   ├── README.md
│   │   └── certs/ (SSL certificates)
│   └── Dockerfile.apache2 (symlink/copy)
├── docker-compose.local.main.yml (updated)
├── docker-compose.prod.override.yml
├── setup-docker.sh
└── APACHE2_GUIDE.md (this guide)
```

## Support Documentation

1. **Quick Reference**: Start here: `APACHE2_GUIDE.md`
2. **Technical Details**: See: `docker/apache2/README.md`
3. **Configuration Files**: In: `docker/apache2/`

## Important Notes

 **Local Development**
- Requires `/etc/hosts` entries
- Uses HTTP (no SSL)
- Domain names must match Apache configuration

 **Production Deployment**
- Obtain real SSL certificates (Let's Encrypt recommended)
- Update `ALLOWED_HOSTS` in backend
- Update `CSRF_TRUSTED_ORIGINS` in backend
- Use `docker-compose.prod.override.yml`

 **Security**
- Never commit real SSL private keys
- Use `.gitignore` for `docker/apache2/certs/`
- Change default Django `SECRET_KEY`
- Use strong database passwords

## Getting Help

1. Check logs: `docker-compose logs -f`
2. Verify configuration: `httpd -t` (inside container)
3. Test connectivity: `curl -v`
4. Review guides: `APACHE2_GUIDE.md`

---

**Created**: November 2, 2025
**For**: AtonixCorp
**Domains**: atonixcorp.org (frontend), api.atonixcorp.org (backend)
