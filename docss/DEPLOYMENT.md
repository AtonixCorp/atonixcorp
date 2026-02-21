# AtonixCorp - Deployment Guide

## [DEPLOY] Production Deployment

This guide walks you through deploying the AtonixCorp to a production environment.

### Prerequisites

- **Server**: Ubuntu 20.04+ or CentOS 8+ with minimum 4GB RAM, 2 CPU cores
- **Docker**: Docker Engine 20.0+ and Docker Compose 2.0+
- **Domain**: Registered domain name with DNS access
- **SSL Certificate**: Let's Encrypt or commercial SSL certificate
- **Email Service**: SMTP server for notifications

### Pre-Deployment Checklist

- [ ] Server provisioned and accessible via SSH
- [ ] Docker and Docker Compose installed
- [ ] Domain DNS pointing to server IP
- [ ] SSL certificate obtained
- [ ] Database backup strategy planned
- [ ] Monitoring accounts set up (Sentry, etc.)

## [GUIDE] Step-by-Step Deployment

### 1. Server Setup

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
```

### 2. Application Deployment

```bash
# Clone repository
git clone https://github.com/atonixcorp/platform.git
cd platform

# Copy production environment template
cp .env.example .env.production

# Edit production configuration
nano .env.production
```

### 3. Environment Configuration

Edit `.env.production` with your production values:

```bash
# Security
DEBUG=False
SECRET_KEY=your-super-secure-50-character-secret-key
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Database
DATABASE_URL=postgresql://user:password@db:5432/atonixcorp
POSTGRES_PASSWORD=your-secure-database-password

# Cache
REDIS_PASSWORD=your-secure-redis-password

# Email
EMAIL_HOST=smtp.yourmailprovider.com
EMAIL_HOST_USER=noreply@yourdomain.com
EMAIL_HOST_PASSWORD=your-email-password

# Security
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000

# Monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### 4. SSL Configuration

```bash
# Create SSL directory
mkdir -p nginx/ssl

# Copy your SSL certificates
cp /path/to/your/certificate.crt nginx/ssl/
cp /path/to/your/private.key nginx/ssl/

# Or use Let's Encrypt
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/
```

### 5. Production Nginx Configuration

Create `nginx/conf.d/production.conf`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;

    # API routes to Django
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /static/ {
        alias /var/www/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Frontend
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 6. Deploy Application

```bash
# Deploy to production
./deploy.sh production

# Verify deployment
./manage.sh status

# Check logs
./manage.sh logs
```

### 7. Post-Deployment Tasks

```bash
# Create superuser
./manage.sh shell backend
python manage.py createsuperuser

# Set up automated backups
./setup-backups.sh

# Configure log rotation
sudo nano /etc/logrotate.d/atonixcorp
```

## [SECURITY] Security Hardening

### Firewall Configuration

```bash
# Install and configure UFW
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
```

### Database Security

```bash
# Secure PostgreSQL
sudo -u postgres psql
ALTER USER postgres PASSWORD 'your-secure-password';
CREATE USER atonixcorp_user WITH PASSWORD 'your-app-password';
GRANT ALL PRIVILEGES ON DATABASE atonixcorp TO atonixcorp_user;
```

### Container Security

```bash
# Set resource limits in docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

## [MONITORING] Monitoring Setup

### Application Monitoring

```bash
# Start monitoring stack
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d

# Configure Grafana dashboards
# Access: https://yourdomain.com:3001
```

### Error Tracking

```bash
# Configure Sentry in .env.production
SENTRY_DSN=https://your-dsn@sentry.io/project-id

# Verify Sentry integration
curl -X POST https://yourdomain.com/api/sentry-test/
```

### Log Management

```bash
# Configure log rotation
cat > /etc/logrotate.d/atonixcorp << EOF
/var/lib/docker/containers/*/*.log {
    daily
    missingok
    rotate 30
    compress
    notifempty
    create 644 root root
    postrotate
        /bin/kill -USR1 $(cat /var/run/docker.pid) 2>/dev/null || true
    endscript
}
EOF
```

## [BACKUPS] Automated Backups

### Database Backup Script

Create `/opt/atonixcorp/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/atonixcorp"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

mkdir -p $BACKUP_DIR
docker-compose exec -T db pg_dump -U atonixcorp_user atonixcorp > $BACKUP_FILE
gzip $BACKUP_FILE

# Keep only last 30 days
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

# Upload to S3 (optional)
# aws s3 cp $BACKUP_FILE.gz s3://your-backup-bucket/
```

### Cron Job Setup

```bash
# Add to crontab
crontab -e

# Add these lines:
# Daily backup at 2 AM
0 2 * * * /opt/atonixcorp/backup.sh

# Weekly cleanup at 3 AM on Sunday
0 3 * * 0 docker system prune -f
```

## [PERFORMANCE] Performance Optimization

### Database Optimization

```sql
-- PostgreSQL configuration
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET random_page_cost = 1.1;
SELECT pg_reload_conf();
```

### Application Optimization

```bash
# Enable Gunicorn optimization
GUNICORN_WORKERS=4
GUNICORN_WORKER_CLASS=gevent
GUNICORN_WORKER_CONNECTIONS=1000
```

### Caching Strategy

```bash
# Redis optimization
REDIS_MAXMEMORY=512mb
REDIS_MAXMEMORY_POLICY=allkeys-lru
```

## [MAINTENANCE] Maintenance

### Regular Updates

```bash
# Update application
git pull origin main
./deploy.sh production

# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker images
docker-compose pull
docker-compose up -d
```

### Health Monitoring

```bash
# Create health check script
cat > /opt/atonixcorp/health-check.sh << EOF
#!/bin/bash
if ! curl -f https://yourdomain.com/api/health/; then
    echo "Health check failed" | mail -s "AtonixCorp Down" admin@yourdomain.com
fi
EOF

# Run every 5 minutes
*/5 * * * * /opt/atonixcorp/health-check.sh
```

## 🆘 Disaster Recovery

### Backup Restoration

```bash
# Stop services
./manage.sh stop

# Restore database
./manage.sh restore /path/to/backup.sql

# Restore volumes
docker run --rm -v atonixcorp_postgres_data:/data -v $(pwd)/backups:/backup ubuntu tar xzf /backup/postgres_data_20250920.tar.gz -C /data

# Start services
./manage.sh start prod
```

### Rollback Procedure

```bash
# Rollback to previous version
git checkout previous-tag
./deploy.sh production

# Or rollback database
./manage.sh restore backups/pre_deployment_backup.sql
```

---

## [SUPPORT] Support

For deployment support, contact:
- **Email**: devops@atonixcorp.com
- **Slack**: #infrastructure
- **Documentation**: https://docs.atonixcorp.com

**Emergency Contact**: +1-555-ATONIX-1