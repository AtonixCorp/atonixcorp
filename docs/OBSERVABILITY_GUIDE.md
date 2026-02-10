# AtonixCorp Observability Guide

## Overview

Observability is a critical requirement for the AtonixCorp platform. All services must implement:
- **Structured Logging** (JSON format)
- **Metrics Collection** (Prometheus)
- **Distributed Tracing** (Jaeger/Tempo)

## Observability Stack Architecture

```
┌──────────────────────────────────────┐
│   Application Services               │
│  ├─ Logging (JSON → stdout)         │
│  ├─ Metrics (Prometheus /metrics)   │
│  └─ Traces (OpenTelemetry)          │
└──────────────┬───────────────────────┘
               │
      ┌────────┼────────┐
      │        │        │
      ▼        ▼        ▼
  ┌─────┐  ┌──────┐  ┌─────────┐
  │Loki │  │Prom  │  │Jaeger/  │
  │     │  │etheus│  │Tempo    │
  └────┬┘  └───┬──┘  └────┬────┘
       │       │           │
       └───────┼───────────┘
               │
        ┌──────▼─────┐
        │  Grafana   │
        │ Dashboards │
        └────────────┘
```

## 1. Structured Logging

### 1.1 JSON Log Format

Every log entry MUST be valid JSON with these fields:

```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "level": "info",
  "logger": "api-gateway",
  "message": "Request processed",
  "request_id": "req-12345",
  "trace_id": "a1b2c3d4f5a6b7c8d9e0f1a2b3c4d5e6",
  "span_id": "f1a2b3c4d5e6f7a8",
  "user_id": "user-789",
  "duration_ms": 245,
  "status_code": 200,
  "method": "GET",
  "path": "/api/users",
  "error": null,
  "context": {
    "service": "api-gateway",
    "environment": "production",
    "version": "1.0.0",
    "region": "us-west-2"
  }
}
```

### 1.2 Python Implementation

```python
import json
import logging
from datetime import datetime, timezone

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'level': record.levelname.lower(),
            'logger': record.name,
            'message': record.getMessage(),
        }
        
        # Add trace context if available
        from opentelemetry import trace
        span = trace.get_current_span()
        if span.is_recording():
            ctx = span.get_span_context()
            log_data['trace_id'] = format(ctx.trace_id, '032x')
            log_data['span_id'] = format(ctx.span_id, '016x')
        
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)
        
        return json.dumps(log_data)

# Setup
handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logger = logging.getLogger('myservice')
logger.addHandler(handler)
```

### 1.3 Node.js Implementation

```javascript
const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      singleLine: true,
    }
  }
});

// Usage
logger.info({ request_id: 'req-123' }, 'Request processed');
```

### 1.4 Log Levels and Usage

```
DEBUG:  Detailed developer information (disabled in production)
INFO:   General informational messages (normal operations)
WARN:   Warning information (potential issues)
ERROR:  Error messages (recoverable errors)
FATAL:  Fatal errors (application shutdown)
```

**Examples:**

```python
# DEBUG - Too verbose for production
logger.debug(f"Processing request: {request.full_path}")

# INFO - Normal operation tracking
logger.info("User logged in", extra={
    'user_id': user.id,
    'ip_address': request.remote_addr
})

# WARN - Alerts but doesn't stop service
logger.warning("Database slow query", extra={
    'query_duration_ms': 2500,
    'threshold_ms': 1000
})

# ERROR - Something failed but service continues
logger.error("Payment processing failed", extra={
    'payment_id': payment.id,
    'error_code': 'insufficient_funds'
})

# FATAL - Service must shut down
logger.fatal("Critical: Database unreachable")
```

### 1.5 Sensitive Data Protection

**NEVER log:**
- Passwords or authentication tokens
- Credit card numbers
- API keys or secrets
- Personal health information (PHI)
- Personally identifiable information (PII)

```python
# ❌ WRONG
logger.info(f"User login: {username}, password: {password}")
logger.info(f"Credit card: {cc_number}")

# ✅ CORRECT
logger.info(f"User login: {username}")
logger.info("Payment processed", extra={'cc_last4': '****1234'})
```

## 2. Metrics Collection

### 2.1 Prometheus Metrics Endpoint

Every service MUST expose `/metrics` endpoint returning Prometheus-format metrics:

```
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",status="200",path="/api/users"} 1234

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

### 2.2 Required Metrics

**Services MUST export these metrics:**

| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| `http_requests_total` | counter | method, status, path | Total HTTP requests |
| `http_request_duration_seconds` | histogram | method, path | Request duration |
| `http_active_requests` | gauge | method, path | Active requests |
| `http_errors_total` | counter | method, status, path | HTTP errors |
| `database_queries_total` | counter | query_type | Database queries |
| `database_query_duration_seconds` | histogram | query_type | Query duration |
| `cache_hits_total` | counter | cache_name | Cache hits |
| `cache_misses_total` | counter | cache_name | Cache misses |
| `process_resident_memory_bytes` | gauge | - | Memory usage |
| `process_cpu_seconds_total` | counter | - | CPU time |

### 2.3 Python Implementation

```python
from prometheus_client import Counter, Histogram, Gauge
from opentelemetry.exporter.prometheus import PrometheusMetricReader

# Create metrics
request_count = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'status', 'path']
)

request_duration = Histogram(
    'http_request_duration_seconds',
    'Request duration',
    ['method', 'path'],
    buckets=(0.01, 0.05, 0.1, 0.5, 1.0)
)

active_requests = Gauge(
    'http_active_requests',
    'Active HTTP requests'
)

# Usage in middleware
@app.before_request
def before():
    active_requests.inc()
    request.start_time = time.time()

@app.after_request
def after(response):
    active_requests.dec()
    duration = time.time() - request.start_time
    
    request_count.labels(
        method=request.method,
        status=response.status_code,
        path=request.path
    ).inc()
    
    request_duration.labels(
        method=request.method,
        path=request.path
    ).observe(duration)
    
    return response

@app.route('/metrics')
def metrics():
    from prometheus_client import generate_latest
    return generate_latest()
```

### 2.4 Node.js Implementation

```javascript
const prometheus = require('prom-client');

// Create metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Request duration in seconds',
  labelNames: ['method', 'path', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1.0]
});

const httpRequestTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'status', 'path']
});

// Middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    
    httpRequestTotal.labels(
      req.method,
      res.statusCode,
      req.path
    ).inc();
    
    httpRequestDuration.labels(
      req.method,
      req.path,
      res.statusCode
    ).observe(duration);
  });
  
  next();
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(prometheus.register.metrics());
});
```

## 3. Distributed Tracing

### 3.1 OpenTelemetry Setup

Services use OpenTelemetry for automatic instrumentation:

```python
from observability import initialize_opentelemetry, get_tracer

# Initialize at startup
initialize_opentelemetry()

# Get tracer
tracer = get_tracer('my-service')

# Use in code
with tracer.start_as_current_span('process_payment') as span:
    span.set_attribute('payment.id', payment_id)
    span.set_attribute('payment.amount', amount)
    
    try:
        result = process_payment(payment_id, amount)
        span.set_attribute('payment.status', 'success')
    except Exception as e:
        span.set_attribute('payment.status', 'failed')
        span.set_attribute('error', True)
        raise
```

### 3.2 Trace Context Propagation

Traces automatically propagate across services via headers:

```
Headers:
  traceparent: 00-a0b1c2d3f4a5b6c7d8e0f1a2b3c4d5e6-e1d2c3b4a5f6g7h8-01
  baggage: user_id=123,request_type=api_call
```

No manual header handling needed - OpenTelemetry handles it automatically.

### 3.3 Jaeger/Tempo Configuration

Set environment variables:

```yaml
# .env
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://tempo:4317
JAEGER_AGENT_HOST=jaeger-agent
JAEGER_AGENT_PORT=6831
OTEL_ENABLE_JAEGER=true
OTEL_ENABLE_PROMETHEUS=true
OTEL_SERVICE_NAME=api-gateway
OTEL_SERVICE_VERSION=1.0.0
ENVIRONMENT=production
```

## 4. Kubernetes Integration

### 4.1 Observability Deployment

```yaml
---
# Prometheus
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: observability
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
      - job_name: 'atonixcorp'
        kubernetes_sd_configs:
          - role: pod
        relabel_configs:
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
            action: keep
            regex: 'true'

---
# Tempo (Tracing Backend)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tempo
  namespace: observability
spec:
  replicas: 1
  selector:
    matchLabels:
      app: tempo
  template:
    metadata:
      labels:
        app: tempo
    spec:
      containers:
      - name: tempo
        image: grafana/tempo:latest
        ports:
        - containerPort: 4317  # OTLP gRPC
        - containerPort: 3100  # HTTP  
        volumeMounts:
        - name: tempo-config
          mountPath: /etc/tempo
      volumes:
      - name: tempo-config
        configMap:
          name: tempo-config

---
# Loki (Log Aggregation)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: loki
  namespace: observability
spec:
  replicas: 1
  selector:
    matchLabels:
      app: loki
  template:
    metadata:
      labels:
        app: loki
    spec:
      containers:
      - name: loki
        image: grafana/loki:latest
        ports:
        - containerPort: 3100
        volumeMounts:
        - name: loki-config
          mountPath: /etc/loki
      volumes:
      - name: loki-config
        configMap:
          name: loki-config

---
# Grafana (Dashboards)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: grafana
  namespace: observability
spec:
  replicas: 1
  selector:
    matchLabels:
      app: grafana
  template:
    metadata:
      labels:
        app: grafana
    spec:
      containers:
      - name: grafana
        image: grafana/grafana:latest
        ports:
        - containerPort: 3000
        env:
        - name: GF_SECURITY_ADMIN_PASSWORD
          value: "admin"
        - name: GF_USERS_ALLOW_SIGN_UP
          value: "false"
        volumeMounts:
        - name: datasources
          mountPath: /etc/grafana/provisioning/datasources
        - name: dashboards
          mountPath: /etc/grafana/provisioning/dashboards
      volumes:
      - name: datasources
        configMap:
          name: grafana-datasources
      - name: dashboards
        configMap:
          name: grafana-dashboards
```

### 4.2 Application Pod Configuration

Add annotations for Prometheus scraping:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
spec:
  template:
    metadata:
      annotations:
        prometheus.io/scrape: 'true'
        prometheus.io/port: '8080'
        prometheus.io/path: '/metrics'
    spec:
      containers:
      - name: api-gateway
        env:
        - name: OTEL_EXPORTER_OTLP_ENDPOINT
          value: http://tempo:4317
        - name: OTEL_SERVICE_NAME
          value: api-gateway
      # Health checks use /health and /ready endpoints
      livenessProbe:
        httpGet:
          path: /health
          port: 8080
        periodSeconds: 30
      readinessProbe:
        httpGet:
          path: /ready
          port: 8080
        periodSeconds: 10
```

## 5. Monitoring & Alerting

### 5.1 Key Dashboards

**Services Dashboard:**
- Request rate (requests/sec)
- Error rate (%)
- Response time (p50, p95, p99)
- Active connections

**Infrastructure Dashboard:**
- CPU usage (%)
- Memory usage (%)
- Disk I/O
- Network I/O

**Traces Dashboard:**
- Slowest endpoints
- Error traces
- Service dependencies
- Latency distribution

### 5.2 Alert Rules

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: atonixcorp-alerts
spec:
  groups:
  - name: atonixcorp
    rules:
    # High error rate
    - alert: HighErrorRate
      expr: rate(http_errors_total[5m]) > 0.05
      for: 5m
      annotations:
        summary: High error rate detected
    
    # High latency
    - alert: HighLatency
      expr: histogram_quantile(0.95, http_request_duration_seconds) > 1.0
      for: 5m
      annotations:
        summary: Request latency is high
    
    # High memory usage
    - alert: HighMemoryUsage
      expr: process_resident_memory_bytes / 1024 / 1024 > 800
      for: 5m
      annotations:
        summary: Memory usage above 800MB
```

## 6. Best Practices

1. **Consistent Timestamps**: Use ISO 8601 format with UTC timezone
2. **Structured Data**: Always use JSON for logs
3. **Add Context**: Include trace IDs, user IDs, request IDs
4. **Cardinality**: Avoid high-cardinality labels (e.g., user ID)
5. **Sample**: Use sampling for high-volume services (trace sampling_rate: 0.1)
6. **Retention**: Set appropriate log/metric retention periods
7. **Security**: Encrypt logs in transit and at rest
8. **Testing**: Test observability in development before production

## 7. Dashboard Examples

Search Grafana for:
- "RED Method" - Rate, Errors, Duration
- "USE Method" - Utilization, Saturation, Errors
- "AtonixCorp Service Monitor"
- "Kubernetes Cluster Health"

## 8. Troubleshooting

**No metrics appearing:**
```bash
# Check endpoint is accessible
curl http://service:8080/metrics

# Verify Prometheus is scraping
kubectl logs -l app=prometheus
```

**No logs in Loki:**
```bash
# Check logs are going to stdout
kubectl logs <pod-name>

# Verify Promtail is running
kubectl get pods -l app=promtail
```

**Traces not appearing:**
```bash
# Check OTLP endpoint is reachable
telnet tempo 4317

# Verify service is configured
echo $OTEL_EXPORTER_OTLP_ENDPOINT
```
