# AtonixCorp - Docker Setup Guide

This guide explains how to run the entire AtonixCorp using Docker Compose with a single command.

## [QUICKSTART] Quick Start

### Option 1: Use the Startup Script (Recommended)

```bash
# Make the script executable
chmod +x start-platform.sh

# Start minimal setup (recommended for development)
./start-platform.sh minimal

# Start full development environment
./start-platform.sh full

# Start production-ready environment
./start-platform.sh production
```

### Option 2: Direct Docker Compose

```bash
# Start the minimal setup
docker-compose -f docker-compose.all-in-one.yml up db redis backend frontend

# Start with all services
docker-compose -f docker-compose.yml up
```

## [COMPOSE FILES] Available Docker Compose Files

| File | Purpose | Services Included |
|------|---------|-------------------|
| `docker-compose.yml` | Full development environment | All services (PostgreSQL, Redis, Kafka, RabbitMQ, Backend, Frontend, Nginx, Celery) |
| `docker-compose.all-in-one.yml` | Optimized single-file setup | Core services + optional profiles |
| `docker-compose.unified.yml` | Single container approach | Frontend + Backend in one container |
| `docker-compose.simple.yml` | Minimal setup | Database + Redis + App |
| `docker-compose.production.yml` | Production deployment | Production-optimized services |

## [SETUP] Setup Instructions

### 1. Prerequisites

- Docker 20.10+
- Docker Compose 2.0+ (or docker-compose 1.29+)
- 4GB+ available RAM
- 10GB+ available disk space

### 2. Environment Configuration

```bash
# Copy the environment template
cp .env.example .env

# Edit the .env file with your settings
nano .env
```

### 3. Choose Your Setup

#### Minimal Development Setup (Recommended)
Perfect for frontend/backend development:
```bash
./start-platform.sh minimal
```
**Includes:** PostgreSQL, Redis, Django Backend, React Frontend

#### Full Development Environment
Complete development environment with all services:
```bash
./start-platform.sh full
```
**Includes:** All minimal services + Kafka, RabbitMQ, MailHog, Nginx, Celery

#### Production-like Environment
Includes Nginx reverse proxy:
```bash
./start-platform.sh production
```
**Includes:** All minimal services + Nginx

#### With Messaging Services
Includes message brokers and task queues:
```bash
./start-platform.sh messaging
```
**Includes:** All services + Kafka, RabbitMQ, Celery, MailHog

## [ACCESS] Service URLs & Access

### Application URLs
- **Frontend (React):** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Admin Panel:** http://localhost:8000/admin
- **API Documentation:** http://localhost:8000/api/docs

### Development Tools
- **PostgreSQL:** `localhost:5432`
  - Database: `atonixcorp`
  - User: `atonixcorp_user`
  - Password: `atonixcorp_password`
- **Redis:** `localhost:6379`
  - Password: `redis_password`
- **MailHog UI:** http://localhost:8025 (email testing)
- **RabbitMQ Management:** http://localhost:15672 (admin/rabbitmq_password)
- **Kafka UI:** http://localhost:8090

## [SOCIAL AUTH] Social Authentication Setup

The platform supports social login with GitHub, Google, GitLab, and LinkedIn. To enable:

1. **Configure OAuth Applications:**
   - GitHub: https://github.com/settings/developers
   - Google: https://console.cloud.google.com/
   - GitLab: https://gitlab.com/-/profile/applications
   - LinkedIn: https://www.linkedin.com/developers/

2. **Update .env file:**
```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
# ... add other providers
```

3. **Set callback URLs in OAuth apps:**
   - GitHub: `http://localhost:8000/api/auth/github/callback/`
   - Google: `http://localhost:8000/api/auth/google/callback/`
   - GitLab: `http://localhost:8000/api/auth/gitlab/callback/`
   - LinkedIn: `http://localhost:8000/api/auth/linkedin/callback/`

## [WORKFLOW] Development Workflow

### Starting Development
```bash
# Start the platform
./start-platform.sh minimal -d

# View logs
./start-platform.sh logs

# Check service status
./start-platform.sh status
```

### Code Changes
- **Frontend:** Changes auto-reload at http://localhost:3000
- **Backend:** Changes require container restart or use development server

### Database Operations
```bash
# Access Django shell
docker-compose -f docker-compose.all-in-one.yml exec backend python manage.py shell

# Run migrations
docker-compose -f docker-compose.all-in-one.yml exec backend python manage.py migrate

# Create superuser
docker-compose -f docker-compose.all-in-one.yml exec backend python manage.py createsuperuser
```

## [TROUBLESHOOTING] Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   sudo lsof -i :3000
   sudo lsof -i :8000
   
   # Stop conflicting services or change ports in docker-compose
   ```

2. **Database Connection Issues**
   ```bash
   # Check database logs
   docker-compose logs db
   
   # Reset database
   docker-compose down -v
   docker-compose up db
   ```

3. **Frontend Build Issues**
   ```bash
   # Rebuild frontend container
   docker-compose build frontend --no-cache
   
   # Clear node_modules
   docker-compose down
   docker volume rm atonixcorp_node_modules
   docker-compose up frontend
   ```

4. **Permission Issues**
   ```bash
   # Fix file permissions (Linux/Mac)
   sudo chown -R $USER:$USER .
   ```

### Viewing Logs
```bash
# All services
./start-platform.sh logs

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Health Checks
```bash
# Check service health
docker-compose ps

# Test API health
curl http://localhost:8000/api/health/

# Test frontend
curl http://localhost:3000
```

##  Cleanup

### Stop Services
```bash
./start-platform.sh stop
```

### Clean Everything (Remove volumes and data)
```bash
./start-platform.sh clean
```

### Remove Docker Images
```bash
# Remove project images
docker rmi $(docker images "atonixcorp*" -q)

# Clean system
docker system prune -a
```

## [UPDATES] Updates & Maintenance

### Update Dependencies
```bash
# Rebuild containers with latest dependencies
./start-platform.sh minimal --build

# Update Docker images
docker-compose pull
```

### Backup Data
```bash
# Backup database
docker-compose exec db pg_dump -U atonixcorp_user atonixcorp > backup.sql

# Backup volumes
docker run --rm -v atonixcorp_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz /data
```

## [RESOURCES] Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Django in Docker](https://docs.docker.com/samples/django/)
- [React in Docker](https://create-react-app.dev/docs/deployment/#docker)

##  Support

If you encounter issues:
1. Check the troubleshooting section above
2. View service logs: `./start-platform.sh logs`
3. Check service status: `./start-platform.sh status`
4. Create an issue in the project repository

## [PERFORMANCE] Performance Optimization

### For Development
- Use minimal setup for faster startup
- Enable Docker BuildKit: `export DOCKER_BUILDKIT=1`
- Allocate more memory to Docker (8GB+ recommended)

### For Production
- Use production Docker Compose file
- Enable proper logging and monitoring
- Use external databases for better performance
- Configure proper backup strategies