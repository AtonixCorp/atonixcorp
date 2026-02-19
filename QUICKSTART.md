# AtonixCorp - Quick Start Guide

## [START] Getting Started

The AtonixCorp is a modern, full-stack community platform built with Django and React, powered by a complete Docker infrastructure.

###  Super Quick Start

```bash
# 1. Navigate to project
cd /home/atonixdev/atonixcorp

# 2. Start the platform
./manage.sh start dev

# 3. Access your platform
open http://localhost:8080
```

### [BUILD] Infrastructure Components

Your platform now includes:

- **[DOCKER] Docker Infrastructure**: Complete containerization with PostgreSQL, Redis, Nginx
- **[TOOLS] Backend API**: Django REST API with authentication, caching, and background tasks
- ** Frontend**: React TypeScript application with Material-UI
- **[METRICS] Monitoring**: Prometheus, Grafana, ELK stack for comprehensive observability
- **[DEPLOY] Deployment**: Automated deployment scripts and CI/CD ready configuration
- **[SECURITY] Security**: Production-ready security headers, SSL, and authentication

## [FOLDER] Project Structure

```
atonixcorp/
├── backend/                 # Django API backend
│   ├── atonixcorp/         # Main Django project
│   ├── dashboard/          # Dashboard app with Celery tasks
│   ├── projects/           # Projects management
│   ├── teams/              # Team management
│   ├── focus_areas/        # Focus areas
│   ├── resources/          # Resources management
│   ├── contacts/           # Contact system
│   ├── Dockerfile          # Backend container
│   └── requirements.txt    # Python dependencies
├── frontend/               # React application
│   ├── src/               # Source code
│   ├── public/            # Public assets
│   ├── package.json       # Node dependencies
│   └── Dockerfile         # Frontend container
├── nginx/                 # Nginx configuration
│   ├── nginx.conf         # Main nginx config
│   └── conf.d/            # Server configurations
├── monitoring/            # Monitoring stack
│   ├── prometheus/        # Metrics collection
│   ├── grafana/          # Dashboards
│   └── logstash/         # Log processing
├── docker-compose.yml     # Main services
├── docker-compose.prod.yml # Production overrides
├── docker-compose.monitoring.yml # Monitoring services
├── deploy.sh              # Deployment script
├── manage.sh              # Management script
├── .env.example           # Environment template
└── docs/                  # Documentation
```

## [TARGET] Available Commands

### Platform Management

```bash
# Start platform (development)
./manage.sh start dev

# Start platform (production)
./manage.sh start prod

# Show service status
./manage.sh status

# View logs
./manage.sh logs [service-name]

# Access service shell
./manage.sh shell backend    # Django shell
./manage.sh shell db        # PostgreSQL shell
./manage.sh shell redis     # Redis CLI

# Database operations
./manage.sh backup          # Create database backup
./manage.sh restore backup.sql # Restore from backup
./manage.sh migrate         # Run migrations

# Stop all services
./manage.sh stop
```

### Production Deployment

```bash
# Deploy to production
./deploy.sh production

# Start with monitoring
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
```

## [NETWORK] Access Points

Once running, you can access:

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:8080 | Main application |
| **API** | http://localhost:8080/api/ | REST API endpoints |
| **Admin** | http://localhost:8080/admin/ | Django admin |
| **Health** | http://localhost:8080/api/health/ | Health monitoring |
| **Grafana** | http://localhost:3001 | Metrics dashboard |
| **Prometheus** | http://localhost:9090 | Metrics collection |
| **Kibana** | http://localhost:5601 | Log analysis |

## [TOOLS] Configuration

### Environment Files

- `.env.local` - Development configuration
- `.env.example` - Template for production
- `.env.production` - Production configuration (create from template)

### Key Settings

```bash
# Development
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
REDIS_URL=redis://localhost:6379/0

# Production
DEBUG=False
DATABASE_URL=postgresql://user:pass@db:5432/atonixcorp
REDIS_URL=redis://:password@redis:6379/0
SECRET_KEY=your-50-character-secret-key
ALLOWED_HOSTS=yourdomain.com
```

##  Development Workflow

### 1. Backend Development

```bash
# Access Django shell
./manage.sh shell backend

# Run migrations
./manage.sh migrate

# Create new Django app
docker-compose exec backend python manage.py startapp newapp

# Run tests
./manage.sh test
```

### 2. Frontend Development

```bash
# Access frontend container
./manage.sh shell frontend

# Install new packages
docker-compose exec frontend npm install package-name

# Build for production
docker-compose exec frontend npm run build
```

### 3. Database Management

```bash
# Access PostgreSQL
./manage.sh shell db

# Create backup
./manage.sh backup

# View database logs
./manage.sh logs db
```

## [METRICS] Monitoring & Observability

### Metrics Dashboard (Grafana)

1. Access http://localhost:3001
2. Login: admin / admin123
3. Import pre-configured dashboards
4. Monitor application performance

### Log Analysis (Kibana)

1. Access http://localhost:5601
2. Configure index patterns
3. Analyze application logs
4. Set up alerts

### Health Monitoring

```bash
# Check overall health
curl http://localhost:8080/api/health/

# Check specific services
./manage.sh status
```

## [DEPLOY] Production Deployment

### Prerequisites

- Server with Docker and Docker Compose
- Domain name with DNS access
- SSL certificate
- SMTP server for emails

### Deployment Steps

1. **Server Setup**
   ```bash
   # Install Docker on your server
   curl -fsSL https://get.docker.com | sh
   ```

2. **Configuration**
   ```bash
   # Copy and configure environment
   cp .env.example .env.production
   # Edit with your production values
   ```

3. **Deploy**
   ```bash
   # Deploy to production
   ./deploy.sh production
   ```

4. **Verify**
   ```bash
   # Check deployment status
   ./manage.sh status
   ```

## [SECURE] Security Features

- **Authentication**: Token-based API authentication
- **Authorization**: Role-based access control
- **HTTPS**: SSL/TLS encryption in production
- **Security Headers**: XSS, CSRF, and content sniffing protection
- **Rate Limiting**: API endpoint protection
- **Container Security**: Non-root users and resource limits

## 🆘 Troubleshooting

### Common Issues

1. **Services won't start**
   ```bash
   ./manage.sh logs [service-name]
   docker-compose ps
   ```

2. **Database connection errors**
   ```bash
   ./manage.sh shell db
   ./manage.sh logs db
   ```

3. **Frontend build issues**
   ```bash
   ./manage.sh logs frontend
   docker-compose exec frontend npm install
   ```

### Getting Help

- Check the logs: `./manage.sh logs`
- View service status: `./manage.sh status`
- Access health check: `curl http://localhost:8080/api/health/`

## [DOCS] Documentation

- [Infrastructure Documentation](INFRASTRUCTURE.md) - Detailed architecture guide
- [Deployment Guide](DEPLOYMENT.md) - Production deployment instructions
- [Troubleshooting Guide](TROUBLESHOOTING.md) - Common issues and solutions

## [NEXT] What's Next?

Your AtonixCorp is now equipped with enterprise-grade infrastructure! You can:

1. **Customize the frontend** - Modify React components and styling
2. **Extend the API** - Add new Django apps and endpoints
3. **Scale horizontally** - Add more containers for high availability
4. **Monitor performance** - Use the built-in monitoring stack
5. **Deploy to production** - Follow the deployment guide

Happy coding! [SUCCESS]