# AtonixCorp Implementation & Deployment Guide

## Quick Start

### Prerequisites
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- RabbitMQ 3.12+
- Docker & Docker Compose
- Kubernetes 1.29+

### Local Development Setup

#### 1. Clone and Setup Environment
```bash
cd /home/atonixdev/atonixcorp-platform/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-opentelemetry.txt

# Copy environment template
cp .env.example .env
```

#### 2. Configure Environment Variables
```bash
# .env file
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1,atonixcorp.local

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/atonixcorp

# Redis
REDIS_URL=redis://localhost:6379/0

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5672/

# Email
EMAIL_HOST=localhost
EMAIL_PORT=1025
```

#### 3. Initialize Database
```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic --noinput
```

#### 4. Load Fixtures (Optional)
```bash
python manage.py loaddata fixtures/initial_data.json
```

#### 5. Start Services
```bash
# Terminal 1: Django development server
python manage.py runserver 0.0.0.0:8000

# Terminal 2: Celery worker
celery -A atonixcorp worker -l info

# Terminal 3: Celery beat (scheduler)
celery -A atonixcorp beat -l info
```

---

## Docker Compose Development

### Full Stack with Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Run migrations
docker-compose exec api python manage.py migrate

# Create superuser
docker-compose exec api python manage.py createsuperuser

# Stop all services
docker-compose down
```

### Docker Compose Configuration Template
```yaml
version: '3.9'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: atonixcorp
      POSTGRES_USER: atonixcorp
      POSTGRES_PASSWORD: secure_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Redis Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # RabbitMQ Message Queue
  rabbitmq:
    image: rabbitmq:3.12-management-alpine
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest
    ports:
      - "5672:5672"
      - "15672:15672"
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq

  # Django API
  api:
    build: .
    command: gunicorn atonixcorp.asgi:application --bind 0.0.0.0:8000 --workers 4
    ports:
      - "8000:8000"
    environment:
      DEBUG: "False"
      SECRET_KEY: your-secret-key
      DATABASE_URL: postgresql://atonixcorp:secure_password@postgres:5432/atonixcorp
      REDIS_URL: redis://redis:6379/0
      RABBITMQ_URL: amqp://guest:guest@rabbitmq:5672/
    depends_on:
      - postgres
      - redis
      - rabbitmq
    volumes:
      - .:/app
      - static_volume:/app/static
      - media_volume:/app/media

  # Celery Worker
  celery_worker:
    build: .
    command: celery -A atonixcorp worker -l info
    environment:
      DEBUG: "False"
      DATABASE_URL: postgresql://atonixcorp:secure_password@postgres:5432/atonixcorp
      REDIS_URL: redis://redis:6379/0
      RABBITMQ_URL: amqp://guest:guest@rabbitmq:5672/
    depends_on:
      - postgres
      - redis
      - rabbitmq
    volumes:
      - .:/app

  # Celery Beat (Scheduler)
  celery_beat:
    build: .
    command: celery -A atonixcorp beat -l info
    environment:
      DEBUG: "False"
      DATABASE_URL: postgresql://atonixcorp:secure_password@postgres:5432/atonixcorp
      REDIS_URL: redis://redis:6379/0
      RABBITMQ_URL: amqp://guest:guest@rabbitmq:5672/
    depends_on:
      - postgres
      - redis
      - rabbitmq
    volumes:
      - .:/app

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:
  static_volume:
  media_volume:
```

---

## Kubernetes Deployment

### Prerequisites
- kubectl configured
- Helm 3+
- Kubernetes 1.29+
- Persistent Volume provisioner

### Deployment Steps

#### 1. Create Namespace
```bash
kubectl create namespace atonixcorp
kubectl config set-context --current --namespace=atonixcorp
```

#### 2. Create Secrets
```bash
kubectl create secret generic atonixcorp-secrets \
  --from-literal=secret-key=your-secret-key \
  --from-literal=db-password=secure_password \
  --from-literal=rabbitmq-password=guest

kubectl create secret docker-registry atonixcorp-registry \
  --docker-server=docker.io \
  --docker-username=your_username \
  --docker-password=your_password
```

#### 3. Create ConfigMap
```bash
kubectl create configmap atonixcorp-config \
  --from-literal=debug=false \
  --from-literal=allowed-hosts=api.atonixcorp.com
```

#### 4. Deploy Database
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: fast-ssd
  resources:
    requests:
      storage: 100Gi

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_DB
          value: atonixcorp
        - name: POSTGRES_USER
          value: atonixcorp
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: atonixcorp-secrets
              key: db-password
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc
```

#### 5. Deploy API Service
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: atonixcorp-api
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: atonixcorp-api
  template:
    metadata:
      labels:
        app: atonixcorp-api
    spec:
      serviceAccountName: atonixcorp
      containers:
      - name: api
        image: atonixcorp/api:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 8000
          name: http
        env:
        - name: DEBUG
          valueFrom:
            configMapKeyRef:
              name: atonixcorp-config
              key: debug
        - name: SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: atonixcorp-secrets
              key: secret-key
        - name: DATABASE_URL
          value: postgresql://atonixcorp:$(DB_PASSWORD)@postgres:5432/atonixcorp
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: atonixcorp-secrets
              key: db-password
        - name: REDIS_URL
          value: redis://redis:6379/0
        - name: RABBITMQ_URL
          value: amqp://guest:guest@rabbitmq:5672/
        resources:
          requests:
            cpu: 500m
            memory: 512Mi
          limits:
            cpu: 2000m
            memory: 2Gi
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: atonixcorp-api
spec:
  type: LoadBalancer
  selector:
    app: atonixcorp-api
  ports:
  - port: 80
    targetPort: 8000
    protocol: TCP
    name: http
```

#### 6. Deploy Celery Workers
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: atonixcorp-celery-worker
spec:
  replicas: 2
  selector:
    matchLabels:
      app: atonixcorp-celery-worker
  template:
    metadata:
      labels:
        app: atonixcorp-celery-worker
    spec:
      containers:
      - name: celery
        image: atonixcorp/api:latest
        command:
        - celery
        - -A
        - atonixcorp
        - worker
        - -l
        - info
        - -c
        - "4"
        env:
        - name: DATABASE_URL
          value: postgresql://atonixcorp:$(DB_PASSWORD)@postgres:5432/atonixcorp
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: atonixcorp-secrets
              key: db-password
        resources:
          requests:
            cpu: 250m
            memory: 256Mi
          limits:
            cpu: 1000m
            memory: 1Gi
```

#### 7. Apply Configurations
```bash
# Apply all manifests
kubectl apply -f k8s/

# Monitor deployment
kubectl get pods -w
kubectl logs -f deployment/atonixcorp-api

# Port forward for local testing
kubectl port-forward svc/atonixcorp-api 8000:80
```

---

## Production Deployment Checklist

### Pre-Deployment
- [ ] Security audit completed
- [ ] Load testing passed
- [ ] Database backups configured
- [ ] SSL/TLS certificates obtained
- [ ] DNS records configured
- [ ] CDN configured
- [ ] Monitoring alerts set up
- [ ] Disaster recovery plan documented
- [ ] Rate limiting configured
- [ ] DDoS protection enabled

### Infrastructure
- [ ] Multi-region deployment planned
- [ ] Auto-scaling policies configured
- [ ] Health checks enabled
- [ ] Monitoring and alerting active
- [ ] Log aggregation configured
- [ ] Backup retention policy set
- [ ] High availability ensured

### Security
- [ ] Secrets management enabled
- [ ] Encryption at rest enabled
- [ ] Encryption in transit enabled
- [ ] Network policies configured
- [ ] RBAC configured
- [ ] Audit logging enabled
- [ ] Vulnerability scanning enabled
- [ ] API rate limiting enabled

### Operations
- [ ] Documentation complete
- [ ] Runbooks created
- [ ] On-call rotation established
- [ ] Incident response plan ready
- [ ] Performance baselines set
- [ ] SLA targets defined
- [ ] Monitoring dashboards created

---

## Scaling Guidelines

### Horizontal Scaling
```bash
# Scale API servers
kubectl scale deployment atonixcorp-api --replicas=5

# Scale Celery workers
kubectl scale deployment atonixcorp-celery-worker --replicas=3
```

### Vertical Scaling
Update resource requests/limits in deployment manifests:
```yaml
resources:
  requests:
    cpu: 1000m      # Increase from 500m
    memory: 1Gi     # Increase from 512Mi
  limits:
    cpu: 4000m      # Increase from 2000m
    memory: 4Gi     # Increase from 2Gi
```

### Database Scaling
```bash
# PostgreSQL replication
# Create read replicas for read-heavy operations

# Redis clustering
# Configure Redis Cluster for distributed caching

# RabbitMQ clustering
# Set up RabbitMQ cluster for HA message queue
```

---

## Monitoring & Observability

### Health Checks
```python
# Get system health
GET /health

{
  "status": "healthy",
  "timestamp": "2026-02-17T10:30:00Z",
  "version": "1.0.0"
}

# Get readiness status
GET /ready

{
  "ready": true,
  "database": "ok",
  "cache": "ok",
  "queue": "ok"
}

# Get metrics
GET /metrics

# Prometheus format metrics
```

### Key Metrics to Monitor
- API response time (p50, p95, p99)
- Request error rate
- Database connection pool usage
- Cache hit rate
- Queue depth
- CPU and memory usage
- Disk I/O
- Network throughput

---

## Backup & Recovery

### Automated Backups
```bash
# Daily database backup at 2 AM UTC
0 2 * * * /scripts/backup-db.sh

# Weekly backup retention
BACKUP_RETENTION=7

# Cross-region replication
BACKUP_REGIONS=["us-west-2", "eu-west-1", "ap-southeast-1"]
```

### Recovery Procedure
```bash
# List available backups
atonix backup list

# Restore from backup
atonix backup restore --backup-id=backup-2026-02-17

# Verify restored data
atonix verify --full
```

---

## Troubleshooting

### Common Issues

**Issue**: PostgreSQL connection failures
```bash
# Check database connectivity
python manage.py dbshell

# Check connection pool
SELECT count(*) FROM pg_stat_activity;

# Increase connection limit in settings.py
DATABASES['default']['CONN_MAX_AGE'] = 600
```

**Issue**: Task queue backlog
```bash
# Check queue depth
celery -A atonixcorp inspect active

# Scale workers
kubectl scale deployment atonixcorp-celery-worker --replicas=5

# Monitor task duration
celery -A atonixcorp events
```

**Issue**: High memory usage
```bash
# Check memory usage
kubectl top pods

# Clear Redis cache
redis-cli FLUSHDB

# Optimize queries with select_related/prefetch_related
```

---

## Version Management

### Release Process
1. Update version in `atonixcorp/__init__.py`
2. Update CHANGELOG.md
3. Create git tag: `git tag v1.0.0`
4. Build Docker image: `docker build -t atonixcorp/api:1.0.0 .`
5. Push image: `docker push atonixcorp/api:1.0.0`
6. Deploy: `kubectl set image deployment/atonixcorp-api api=atonixcorp/api:1.0.0`

---

**Last Updated**: February 17, 2026  
**Version**: 1.0.0
