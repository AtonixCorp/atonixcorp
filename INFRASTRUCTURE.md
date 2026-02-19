# AtonixCorp - Infrastructure Documentation

## [INFRA] Infrastructure Overview

The AtonixCorp is built with a modern, scalable, and production-ready infrastructure using Docker containers and microservices architecture.

### [ARCH] Architecture Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Nginx       │    │   React App     │    │  Django API     │
│  (Load Balancer)│──│   (Frontend)    │──│   (Backend)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
                                                       
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │      Redis      │    │     Celery      │
│   (Database)    │    │     (Cache)     │    │ (Task Queue)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### [CONTAINER] Container Services

| Service | Purpose | Port | Health Check |
|---------|---------|------|--------------|
| **nginx** | Reverse proxy & load balancer | 8080 | HTTP 200 on / |
| **frontend** | React application | 3000 | HTTP 200 on / |
| **backend** | Django API server | 8000 | HTTP 200 on /api/health/ |
| **db** | PostgreSQL database | 5432 | pg_isready |
| **redis** | Cache & session store | 6379 | redis-cli ping |
| **celery** | Background task worker | - | Task processing |
| **celery-beat** | Scheduled task scheduler | - | Beat scheduling |

## [START] Quick Start

### Prerequisites

- Docker Engine 20.0+
- Docker Compose 2.0+
- 4GB+ RAM available
- 10GB+ disk space

### Development Environment

```bash
# 1. Clone and navigate to project
cd /home/atonixdev/atonixcorp

# 2. Copy environment configuration
cp .env.example .env.local

# 3. Start development environment
./manage.sh start dev

# 4. Access the platform
open http://localhost:8080
```

### Production Environment

```bash
# 1. Configure production environment
cp .env.example .env.production
# Edit .env.production with your production values

# 2. Deploy to production
./deploy.sh production

# 3. Verify deployment
./manage.sh status
```

## [MONITOR] Monitoring & Observability

### Monitoring Stack

The platform includes comprehensive monitoring with:

- **Prometheus** - Metrics collection
- **Grafana** - Metrics visualization  
- **ELK Stack** - Centralized logging
- **Jaeger** - Distributed tracing

Start monitoring services:
```bash
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
```

### Access Points

- **Grafana Dashboard**: http://localhost:3001 (admin/admin123)
- **Prometheus**: http://localhost:9090
- **Kibana**: http://localhost:5601
- **Jaeger**: http://localhost:16686

### Key Metrics

- **Application Performance**: Response times, throughput, error rates
- **Infrastructure**: CPU, memory, disk usage
- **Database**: Connection pools, query performance
- **Cache**: Hit rates, memory usage
- **Business**: User registrations, active sessions

## [CONFIG] Configuration Management

### Environment Variables

| Variable | Description | Development | Production |
|----------|-------------|-------------|------------|
| `DEBUG` | Django debug mode | `True` | `False` |
| `SECRET_KEY` | Django secret key | `dev-key` | `random-50-chars` |
| `DATABASE_URL` | Database connection | SQLite | PostgreSQL |
| `REDIS_URL` | Redis connection | Local | Container |
| `ALLOWED_HOSTS` | Allowed hostnames | `localhost` | Your domain |

### Security Configuration

#### Production Security Features

- **HTTPS Enforcement**: SSL redirect and HSTS headers
- **Security Headers**: XSS protection, content type sniffing prevention
- **CORS Configuration**: Cross-origin request handling
- **Rate Limiting**: API endpoint protection
- **Session Security**: Secure cookies and session management

#### Secrets Management

```bash
# Generate secure secret key
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Use environment variables for sensitive data
export SECRET_KEY="your-generated-secret-key"
export DATABASE_PASSWORD="your-secure-password"
```

## [DEPLOYMENT] Deployment Strategies

### Rolling Deployment

```bash
# 1. Build new images
./manage.sh build

# 2. Deploy with zero downtime
./deploy.sh production

# 3. Health check verification
./manage.sh status
```

### Blue-Green Deployment

```bash
# 1. Deploy to green environment
./deploy.sh production-green

# 2. Test green environment
curl http://green.atonixcorp.org/api/health/

# 3. Switch traffic to green
./switch-traffic.sh green

# 4. Monitor and rollback if needed
./rollback.sh blue
```

### Backup & Recovery

#### Database Backup

```bash
# Create backup
./manage.sh backup

# Restore from backup
./manage.sh restore backups/backup_20250920_140000.sql
```

#### Volume Backup

```bash
# Backup persistent volumes
docker run --rm -v atonixcorp_postgres_data:/data -v $(pwd)/backups:/backup ubuntu tar czf /backup/postgres_data_$(date +%Y%m%d).tar.gz -C /data .
```

## [DEBUG] Troubleshooting

### Common Issues

#### Service Won't Start

```bash
# Check logs
./manage.sh logs [service-name]

# Check service status
docker-compose ps

# Restart specific service
docker-compose restart [service-name]
```

#### Database Connection Issues

```bash
# Check database status
./manage.sh shell db

# Reset database
docker-compose down -v
./deploy.sh dev
```

#### Performance Issues

```bash
# Check resource usage
docker stats

# Check application metrics
curl http://localhost:8080/api/health/

# View detailed logs
./manage.sh logs backend
```

### Health Checks

```bash
# Backend API health
curl http://localhost:8080/api/health/

# Database health
docker-compose exec db pg_isready -U atonixcorp_user

# Redis health
docker-compose exec redis redis-cli ping

# Frontend health
curl http://localhost:8080/
```

## [SCALING] Scaling

### Horizontal Scaling

```bash
# Scale backend instances
docker-compose up -d --scale backend=3

# Scale Celery workers
docker-compose up -d --scale celery=5
```

### Load Balancing

```nginx
# Nginx upstream configuration
upstream django_backend {
    server backend_1:8000;
    server backend_2:8000;
    server backend_3:8000;
}
```

### Database Scaling

- **Read Replicas**: Configure PostgreSQL read replicas
- **Connection Pooling**: Use PgBouncer for connection management
- **Partitioning**: Implement table partitioning for large datasets

## [SECURITY] Security Best Practices

### Container Security

- **Non-root Users**: All containers run as non-root
- **Image Scanning**: Regular vulnerability scans
- **Resource Limits**: CPU and memory constraints
- **Network Isolation**: Private networks for services

### Application Security

- **Authentication**: Token-based API authentication
- **Authorization**: Role-based access control
- **Input Validation**: Comprehensive data validation
- **SQL Injection Prevention**: ORM usage and parameterized queries

### Infrastructure Security

- **Firewall Rules**: Restrict network access
- **Regular Updates**: Keep base images updated
- **Secret Management**: Environment variable encryption
- **Audit Logging**: Comprehensive access logging

## [RESOURCES] Additional Resources

### Documentation Links

- [Django Documentation](https://docs.djangoproject.com/)
- [React Documentation](https://reactjs.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Support & Maintenance

- **Logs Location**: `/var/log/` in containers
- **Configuration Files**: `./config/` directory
- **Backup Schedule**: Daily automated backups
- **Update Schedule**: Monthly security updates

---

**Last Updated**: September 20, 2025  
**Version**: 1.0.0  
**Maintainer**: AtonixCorp Development Team