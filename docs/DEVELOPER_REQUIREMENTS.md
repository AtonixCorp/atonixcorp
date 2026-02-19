# AtonixCorp Developer Requirements & Service Standards

## 1. Service Standards Overview

All services deployed on atonixcorp must adhere to these standards to ensure:
- Operational consistency
- Security compliance
- Observability
- High availability
- Seamless integration

## 2. Containerization Requirements

### 2.1 Docker Images

**All services MUST be containerized using Docker.**

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Security: Run as non-root user
RUN useradd -m -u 1000 appuser

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ /app/

# Use specific port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

USER appuser

CMD ["python", "-m", "app.main"]
```

**Requirements:**
- Use official base images from trusted registries
- Keep images minimal (use slim/alpine variants)
- Never run containers as root
- Include HEALTHCHECK directive
- Pin package versions (no "latest" tags)
- Scan for vulnerabilities before deployment

### 2.2 Image Registry

- Primary registry: Docker Hub or internal registry
- Tags: `service-name:version` (semantic versioning)
- Latest tag required: `service-name:latest`
- Example: `atonixdev/api-gateway:1.0.0`

## 3. Configuration Management

### 3.1 Environment Variables

**ALL configuration must use environment variables.**

```python
import os

DATABASE_URL = os.environ.get('DATABASE_URL', 'postgres://localhost/db')
API_KEY = os.environ.get('API_KEY')  # Required, no default
LOG_LEVEL = os.environ.get('LOG_LEVEL', 'info')
```

**Rules:**
- No hardcoded credentials
- Provide sensible defaults for non-critical vars
- Use `.env` files for development only
- Use Kubernetes Secrets for production

### 3.2 atonix.yaml Configuration File

Every service must include `atonix.yaml` in its root directory. See [atonix.yaml Specification](./ATONIX_YAML_SPEC.md) for details.

### 3.3 Configuration Example

```yaml
# atonix.yaml
apiVersion: atonix.io/v1
kind: Service
metadata:
  name: api-gateway
  version: 1.0.0

service:
  name: api-gateway
  runtime: container
  replicas: 2

resources:
  cpu: "500m"
  memory: "512Mi"

env:
  - key: DATABASE_URL
    value: ${DATABASE_URL}
  - key: LOG_LEVEL
    value: info

health:
  liveness: /health
  readiness: /ready
```

## 4. Health Check Endpoints

### 4.1 Required Endpoints

**Every service MUST expose these endpoints:**

#### /health (Liveness Probe)
- **Purpose**: Kubernetes uses this to detect if pod should be restarted
- **Response**: 200 OK if service is running (even if degraded)
- **Response Time**: < 1 second
- **Frequency**: Every 30 seconds

```json
{
  "status": "healthy",
  "service": "api-gateway",
  "version": "1.0.0",
  "timestamp": "2024-01-01T12:00:00Z",
  "checks": {
    "database": {
      "status": "ok",
      "message": "Database connection OK"
    },
    "resources": {
      "cpu_percent": 45.2,
      "memory_percent": 62.5
    }
  }
}
```

#### /ready (Readiness Probe)
- **Purpose**: Kubernetes uses this to determine if pod should receive traffic
- **Response**: 200 OK only if service is ready for production traffic
- **Response Time**: < 1 second
- **Status Codes**:
  - 200: Ready (service can handle requests)
  - 503: Not ready (service unavailable)

```json
{
  "ready": true,
  "service": "api-gateway",
  "timestamp": "2024-01-01T12:00:00Z",
  "checks": {
    "database": {
      "status": "ok",
      "message": "Database ready"
    },
    "cache": {
      "status": "ok",
      "message": "Cache ready"
    },
    "disk_space": {
      "status": "ok",
      "percent_used": 45.2
    }
  }
}
```

### 4.2 Implementation Examples

**Python (Django):**

```python
from django.http import JsonResponse
from django.views import View

class HealthCheckView(View):
    def get(self, request):
        return JsonResponse({
            "status": "healthy",
            "service": "api-gateway"
        })

class ReadinessCheckView(View):
    def get(self, request):
        # Check critical dependencies
        db_ok = check_database()
        cache_ok = check_cache()
        
        ready = db_ok and cache_ok
        status_code = 200 if ready else 503
        
        return JsonResponse({
            "ready": ready,
            "checks": {
                "database": {"status": "ok" if db_ok else "error"},
                "cache": {"status": "ok" if cache_ok else "error"}
            }
        }, status=status_code)
```

**Node.js (Express):**

```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString()
  });
});

app.get('/ready', (req, res) => {
  const ready = checkDatabase() && checkCache();
  const status = ready ? 200 : 503;
  
  res.status(status).json({
    ready: ready,
    checks: {
      database: { status: ready ? 'ok' : 'error' },
      cache: { status: ready ? 'ok' : 'error' }
    }
  });
});
```

## 5. Structured Logging

### 5.1 JSON Logging Format

**ALL logs MUST be in JSON format.**

```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "level": "info",
  "logger": "api-gateway",
  "message": "Request processed successfully",
  "request_id": "req-12345",
  "user_id": "user-789",
  "duration_ms": 245,
  "status_code": 200,
  "method": "GET",
  "path": "/api/users",
  "context": {
    "service": "api-gateway",
    "environment": "production",
    "version": "1.0.0"
  }
}
```

### 5.2 Log Levels

**Use these log levels consistently:**

- **debug**: Detailed information for developers (development only)
- **info**: General informational messages (normal operation)
- **warn**: Warning messages (potential issues)
- **error**: Error messages (recoverable errors)
- **fatal**: Fatal errors (service shutdown)

### 5.3 Logging Implementation

**Python (Django):**

```python
import json
import logging

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            'timestamp': self.formatTime(record, '%Y-%m-%dT%H:%M:%S.000Z'),
            'level': record.levelname.lower(),
            'logger': record.name,
            'message': record.getMessage(),
            'context': {
                'service': 'api-gateway',
                'environment': 'production'
            }
        }
        
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)
        
        return json.dumps(log_data)

handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logger = logging.getLogger('api-gateway')
logger.addHandler(handler)
```

**Node.js (Pino):**

```javascript
const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      singleLine: true
    }
  }
});

logger.info({ request_id: 'req-123', duration: 245 }, 'Request processed');
```

### 5.4 Sensitive Data Protection

**NEVER log:**
- Passwords
- API keys
- Tokens
- Credit card numbers
- Personal identifiable information (PII)

```python
#  WRONG
logger.info(f"User login: {username}, password: {password}")

#  CORRECT
logger.info(f"User login: {username}")
```

## 6. Monitoring & Metrics

### 6.1 Required Metrics Endpoint

**Service must expose `/metrics` endpoint in Prometheus format.**

```
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",status="200"} 1234

# HELP http_request_duration_seconds HTTP request duration
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{method="GET",le="0.1"} 100
http_request_duration_seconds_bucket{method="GET",le="0.5"} 500
http_request_duration_seconds_bucket{method="GET",le="1"} 1200
http_request_duration_seconds_sum{method="GET"} 2400
http_request_duration_seconds_count{method="GET"} 1234

# HELP process_resident_memory_bytes Memory usage
# TYPE process_resident_memory_bytes gauge
process_resident_memory_bytes 52428800
```

### 6.2 Required Metrics to Expose

**Minimum metrics all services must export:**

| Metric | Type | Description |
|--------|------|-------------|
| `http_requests_total` | Counter | Total HTTP requests |
| `http_request_duration_seconds` | Histogram | Request duration |
| `http_requests_active` | Gauge | Active request count |
| `http_errors_total` | Counter | Total HTTP errors |
| `process_resident_memory_bytes` | Gauge | Memory usage |
| `process_cpu_seconds_total` | Counter | CPU time |

### 6.3 Metrics Implementation

**Python (Prometheus Client):**

```python
from prometheus_client import Counter, Histogram, Gauge, generate_latest

request_count = Counter(
    'http_requests_total',
    'Total requests',
    ['method', 'endpoint', 'status']
)

request_duration = Histogram(
    'http_request_duration_seconds',
    'Request duration',
    ['method', 'endpoint']
)

active_requests = Gauge(
    'http_requests_active',
    'Active requests'
)

@app.before_request
def before_request():
    active_requests.inc()

@app.after_request
def after_request(response):
    active_requests.dec()
    request_count.labels(
        method=request.method,
        endpoint=request.path,
        status=response.status_code
    ).inc()
    return response

@app.route('/metrics')
def metrics():
    return generate_latest()
```

## 7. Service Statelessness

### 7.1 Design Principles

**Services MUST be stateless by default.**

- No local file storage (except temp)
- Session data in external storage (Redis, database)
- Multiple replicas should be interchangeable
- No sticky sessions

### 7.2 Approved Stateful Services

Only these services may be stateful with explicit approval:

- Database services
- Cache services
- Message brokers
- Distributed ledgers

**Stateful services REQUIRE:**
- Persistent volumes
- StatefulSet deployment
- Backup strategy
- Recovery procedure

## 8. Network Requirements

### 8.1 Port Assignments

**Standard ports by service type:**

| Service Type | Port | Protocol |
|-------------|------|----------|
| API/Web Server | 8080 | HTTP |
| Metrics | 9090 | HTTP |
| gRPC | 50051 | H2C |
| Database | 5432 (postgres) | TCP |
| Cache | 6379 (redis) | TCP |

### 8.2 Service Communication

- All internal traffic: HTTP/2 over TLS
- External traffic: HTTPS (TLS 1.2+)
- Service-to-service: Service mesh (Istio)
- Public endpoints: Load balancer with DDoS protection

## 9. Directory Structure

**All services MUST follow this structure:**

```
service-name/
├── atonix.yaml              # Service configuration (REQUIRED)
├── Dockerfile               # Container definition (REQUIRED)
├── README.md               # Service documentation (REQUIRED)
├── src/                    # Source code
│   ├── main.py|index.js   # Entry point
│   ├── app/               # Application logic
│   └── utils/             # Utilities
├── config/                # Configuration files
│   ├── logging.yaml
│   ├── settings.py
│   └── observability.yaml
├── tests/                 # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── deploy/                # Kubernetes manifests
│   ├── deployment.yaml
│   ├── service.yaml
│   └── configmap.yaml
├── requirements.txt|package.json  # Dependencies (REQUIRED)
└── .dockerignore          # Docker ignore patterns
```

## 10. Testing Requirements

### 10.1 Test Coverage

- Unit tests: >= 80% coverage
- Integration tests: Critical paths
- E2E tests: User workflows

### 10.2 Test Execution

```bash
# Unit tests
pytest tests/unit/ -v

# Integration tests
pytest tests/integration/ -v

# E2E tests
pytest tests/e2e/ -v

# Coverage report
pytest --cov=src tests/
```

## 11. Security Requirements

### 11.1 Container Security

```dockerfile
FROM python:3.11-slim

# Don't run as root
RUN useradd -m -u 1000 appuser
USER appuser

# Read-only filesystem
RUN chmod -R 555 /app
```

### 11.2 Secret Management

- Use Kubernetes Secrets for sensitive data
- Encrypt secrets at rest
- Rotate credentials regularly
- Never commit secrets to Git

```bash
# Create secret
kubectl create secret generic my-secret --from-literal=api_key=secret_value

# Use in pod
env:
  - name: API_KEY
    valueFrom:
      secretKeyRef:
        name: my-secret
        key: api_key
```

### 11.3 Network Policies

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: service-network-policy
spec:
  podSelector:
    matchLabels:
      app: api-gateway
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
      - podSelector:
          matchLabels:
            app: frontend
  egress:
    - to:
      - podSelector:
          matchLabels:
            app: database
```

## 12. Deployment Checklist

Before deploying any service:

- [ ] `atonix.yaml` created and validated
- [ ] `Dockerfile` optimized and security-scanned
- [ ] `README.md` with setup instructions
- [ ] Health endpoints implemented (`/health`, `/ready`)
- [ ] Structured logging enabled (JSON format)
- [ ] Metrics exposed (`/metrics`)
- [ ] Configuration uses environment variables
- [ ] Unit tests written (80%+ coverage)
- [ ] Integration tests pass
- [ ] Security scanning passed
- [ ] Documentation complete
- [ ] Kubernetes manifests generated
- [ ] Deployment tested in staging

## 13. Support & Contacts

- **Platform Engineering**: platform-team@atonixcorp.com
- **Cloud Infrastructure**: infrastructure-team@atonixcorp.com
- **Security Team**: security-team@atonixcorp.com
- **DevOps**: devops-team@atonixcorp.com

## 14. Related Documentation

- [atonix.yaml Specification](./ATONIX_YAML_SPEC.md)
- [Deployment Workflow](./DEPLOYMENT_WORKFLOW.md)
- [Security Standards](./SECURITY_STANDARDS.md)
- [CI/CD Pipeline](./CI_CD_PIPELINE.md)
- [Observability Guide](./OBSERVABILITY_GUIDE.md)
