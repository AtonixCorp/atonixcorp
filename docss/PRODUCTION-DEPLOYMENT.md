# [DEPLOY] AtonixCorp - Production Deployment Guide

## [PACKAGE] Main Production Image

<<<<<<< HEAD
**Image to push to production:** `atonixcorp:latest` or `quay.io/atonixdev/atonixcorp:latest`
=======
**Image to push to production:** `atonixcorpvm:latest` or `quay.io/atonixdev/atonixcorp:latest`
>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb

## [DOMAINS] Production Domains

- **Frontend**: `https://atonixcorp.com` - Serves the React application
- **Backend API**: `https://api.atonixcorp.com` - Serves the Django REST API  
- **Admin Interface**: `https://api.atonixcorp.com/admin/` - Django admin panel

## [ARCHITECTURE] Architecture Overview

### Single Unified Container: `atonixcorp:latest`

This container includes:

#### [FRONTEND] **Frontend (React)**
- **Location**: Built React app stored in `/app/static/` inside the container
- **Build process**: Multi-stage Docker build compiles React → static files
- **Served by**: Nginx on port 8080
- **Entry point**: `http://localhost:8080/` serves the React SPA

#### [BACKEND] **Backend (Django)**
- **Location**: Django application running on port 8000 inside container
- **Process manager**: Supervised by supervisord
- **API endpoints**: Proxied through Nginx from port 8080
- **Access**: `http://localhost:8080/api/`, `http://localhost:8080/admin/`

#### [WEB] **Web Server (Nginx)**
- **Port**: 8080 (exposed from container)
- **Function**: 
  - Serves React static files for `/`
  - Proxies API requests to Django backend
  - Handles static/media file serving
  - Provides gzip compression and security headers

#### [PROCESS] **Process Management (Supervisor)**
- **Django server**: Python development server on :8000
- **Nginx**: Web server on :8080  
- **Django migrations**: Runs automatically on startup
- **Static files collection**: Runs automatically on startup

## [DEPS] External Dependencies (Separate Containers)

### Database: `postgres:15-alpine`
- **Purpose**: Main application database
- **Port**: 5433 (external) → 5432 (internal)
- **Connection**: `postgresql://atonixcorp:atonixpass@db:5432/atonixcorp`

### Cache: `redis:7-alpine`
- **Purpose**: Caching and session storage
- **Port**: 6380 (external) → 6379 (internal)
- **Connection**: `redis://redis:6379`

## [SHIP] Production Deployment

### Option 1: Deploy Unified Container Only
```bash
# Export the main image
<<<<<<< HEAD
nerdctl save atonixcorp:latest -o atonixcorp.tar
=======
nerdctl save atonixcorpvm:latest -o atonixcorp.tar
>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb

# On production server
docker load -i atonixcorp.tar
docker run -d -p 8080:8080 \
  -e DATABASE_URL="postgresql://user:pass@your-db:5432/dbname" \
  -e REDIS_URL="redis://your-redis:6379" \
  --name atonixcorp-app \
<<<<<<< HEAD
  atonixcorp:latest
=======
  atonixcorpvm:latest
>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
```

### Option 2: Deploy Full Stack with Docker Compose
```bash
# Copy these files to production:
# - docker-compose.simple.yml
# - .env (with production settings)

# On production
docker-compose -f docker-compose.simple.yml up -d
```

### Option 3: Deploy from Quay.io Registry (Recommended)
```bash
# Pull from Quay.io registry
docker pull quay.io/atonixdev/atonixcorp:latest

# Deploy from registry
docker run -d -p 8080:8080 \
  -e DATABASE_URL="postgresql://user:pass@your-db:5432/dbname" \
  -e REDIS_URL="redis://your-redis:6379" \
  -e DEBUG=False \
  -e ALLOWED_HOSTS="your-domain.com" \
  --name atonixcorp-app \
  quay.io/atonixdev/atonixcorp:latest
```

### Option 4: Deploy with Docker Compose from Registry
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  app:
    image: quay.io/atonixdev/atonixcorp:latest
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/dbname
      - REDIS_URL=redis://redis:6379
      - DEBUG=False
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: atonixcorp
      POSTGRES_USER: atonixcorp
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## [LINK] Access Points in Production

- **Main Application**: `https://your-domain.com/`
- **API Endpoints**: `https://your-domain.com/api/`
- **Admin Interface**: `https://your-domain.com/admin/`
- **Health Check**: `https://your-domain.com/health/`

## [ENV] Environment Variables for Production

```bash
# Database
DATABASE_URL=postgresql://user:password@db-host:5432/dbname

# Redis  
REDIS_URL=redis://redis-host:6379

# Django
DJANGO_SETTINGS_MODULE=atonixcorp.settings
DEBUG=False
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=your-domain.com,www.your-domain.com

# Email (if using external SMTP)
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@domain.com
EMAIL_HOST_PASSWORD=your-email-password
```

## [PERFORMANCE] Container Size and Performance

```
<<<<<<< HEAD
Image: atonixcorp:latest
=======
Image: atonixcorpvm:latest
>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
Size: ~505 MB
Components:
- Python 3.11 base: ~140 MB
- Node.js build artifacts: ~50 MB  
- Django + dependencies: ~200 MB
- Nginx + system deps: ~115 MB
```

## [VERIFY] Verification Commands

```bash
# Check container health
curl http://localhost:8080/health/

# Check frontend is served
curl -I http://localhost:8080/

# Check API is proxied  
curl -I http://localhost:8080/api/

# View container logs
docker logs atonixcorp-app-1
```

## [BENEFITS] Key Benefits of This Architecture

1. **Single Deployment Unit**: One container with both frontend and backend
2. **No CORS Issues**: Frontend and backend served from same origin
3. **Simplified Routing**: Nginx handles all traffic routing
4. **Production Ready**: Includes process management, logging, health checks
5. **Scalable**: Can be easily replicated behind a load balancer
6. **Self-Contained**: Only requires external database and cache

## [NOTES] Important Notes

- The **frontend is NOT running as a separate server** - it's built into static files and served by Nginx
<<<<<<< HEAD
- The **main container** (`atonixcorp:latest`) is what you deploy to production  
=======
-- The **main container** (`atonixcorpvm:latest`) is what you deploy to production  
>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
- Database and Redis can be external managed services or separate containers
- The container runs on port 8080 to avoid requiring root privileges
- Health checks are built-in at `/health/` endpoint

---

**[SUCCESS] This unified approach gives you a production-ready, single-container deployment that's easy to scale and manage!**