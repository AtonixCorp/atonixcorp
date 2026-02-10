# atonix.yaml Specification

## Overview

The `atonix.yaml` file defines all configuration for AtonixCorp services. This specification describes the required and optional fields for service configuration, deployment, and lifecycle management.

## File Structure

```yaml
apiVersion: atonix.io/v1
kind: Service
metadata:
  name: service-name
  version: 1.0.0
  createdAt: 2024-01-01T00:00:00Z

service:
  name: service-name
  runtime: container
  replicas: 2
  description: Service description

autoscaling:
  enabled: true
  min: 2
  max: 20
  targetCPU: 70
  targetMemory: 80

resources:
  cpu: "500m"
  memory: "512Mi"
  disk: "1Gi"

env:
  - key: DATABASE_URL
    value: ${DATABASE_URL}
  - key: SECRET_KEY
    value: ${SECRET_KEY}
    secret: true

ports:
  - name: http
    containerPort: 8080
    protocol: TCP
  - name: metrics
    containerPort: 9090
    protocol: TCP

health:
  liveness: /health
  readiness: /ready
  periodSeconds: 30
  timeoutSeconds: 5
  startupDelaySeconds: 10
  failureThreshold: 3

security:
  runAsNonRoot: true
  readOnlyRootFilesystem: true
  allowPrivilegeEscalation: false
  capabilities:
    drop:
      - ALL

observability:
  logging:
    format: json
    level: info
  metrics:
    enabled: true
    port: 9090
    path: /metrics
  tracing:
    enabled: true
    sampling_rate: 0.1

dependencies:
  - name: database
    type: postgres
    required: true
  - name: cache
    type: redis
    required: false

deployment:
  strategy: rolling
  maxSurge: "25%"
  maxUnavailable: "25%"
  progressDeadlineSeconds: 600
```

## Field Reference

### Metadata Section

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `apiVersion` | string | Yes | API version (atonix.io/v1) |
| `kind` | string | Yes | Resource kind (Service) |
| `metadata.name` | string | Yes | Service name (lowercase, alphanumeric, hyphens) |
| `metadata.version` | string | No | Service version (semantic versioning) |
| `metadata.createdAt` | string | No | ISO 8601 timestamp |

### Service Section

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `service.name` | string | Yes | Service name |
| `service.runtime` | string | Yes | Runtime type: container, serverless, vm |
| `service.replicas` | int | Yes | Default replicas (overridden by autoscaling) |
| `service.description` | string | No | Service description |

### Autoscaling Section

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `autoscaling.enabled` | bool | No | Enable autoscaling (default: true) |
| `autoscaling.min` | int | Yes if enabled | Minimum replicas |
| `autoscaling.max` | int | Yes if enabled | Maximum replicas |
| `autoscaling.targetCPU` | int | No | Target CPU percentage (default: 70) |
| `autoscaling.targetMemory` | int | No | Target memory percentage (default: 80) |

### Resources Section

Kubernetes-style resource requests and limits.

| Field | Type | Format | Example |
|-------|------|--------|---------|
| `resources.cpu` | string | Kubernetes | "500m", "1", "2" |
| `resources.memory` | string | Kubernetes | "256Mi", "512Mi", "1Gi" |
| `resources.disk` | string | Kubernetes | "1Gi", "10Gi" |

### Environment Variables

```yaml
env:
  - key: DATABASE_URL
    value: jdbc:postgres://db:5432/app
    
  - key: API_KEY
    value: ${SECRET_API_KEY}  # Reference to secret
    secret: true
    
  - key: LOG_LEVEL
    value: info
    configMap: app-logging  # Reference to ConfigMap
```

### Ports

```yaml
ports:
  - name: http
    containerPort: 8080
    hostPort: 8080  # Optional
    protocol: TCP
    
  - name: metrics
    containerPort: 9090
    protocol: TCP
```

### Health Checks

- **liveness**: Endpoint to check if service should be restarted
- **readiness**: Endpoint to check if service can accept traffic
- **periodSeconds**: Check interval in seconds
- **timeoutSeconds**: Check timeout
- **startupDelaySeconds**: Initial delay before checks start
- **failureThreshold**: Failed checks before action taken

### Security

Required security context for all services:

```yaml
security:
  runAsNonRoot: true              # Don't run as root
  readOnlyRootFilesystem: true    # Root fs is read-only
  allowPrivilegeEscalation: false # No privilege escalation
  capabilities:
    drop:
      - ALL                        # Drop all Linux capabilities
    add: []                        # Add only required capabilities
```

### Observability

#### Logging

```yaml
observability:
  logging:
    format: json           # json or text
    level: info           # debug, info, warn, error
    excludeFields:        # Fields to exclude from logs
      - password
      - token
```

#### Metrics

```yaml
  metrics:
    enabled: true
    port: 9090
    path: /metrics  # Prometheus-compatible endpoint
```

#### Tracing

```yaml
  tracing:
    enabled: true
    sampling_rate: 0.1  # 10% sampling
```

### Dependencies

```yaml
dependencies:
  - name: database
    type: postgres
    required: true
    
  - name: cache
    type: redis
    required: false
```

### Deployment Strategy

```yaml
deployment:
  strategy: rolling              # rolling or blue-green
  maxSurge: "25%"               # Max additional pods
  maxUnavailable: "25%"         # Max unavailable pods
  progressDeadlineSeconds: 600  # Timeout for deployment
```

## Examples

### Simple HTTP Service

```yaml
apiVersion: atonix.io/v1
kind: Service
metadata:
  name: api-gateway
  version: 1.0.0

service:
  name: api-gateway
  runtime: container
  replicas: 3
  description: Main API Gateway

resources:
  cpu: "500m"
  memory: "512Mi"

env:
  - key: PORT
    value: "8080"
  - key: LOG_LEVEL
    value: info

ports:
  - name: http
    containerPort: 8080

health:
  liveness: /health
  readiness: /ready

observability:
  metrics:
    enabled: true
    port: 9090
```

### Database Service

```yaml
apiVersion: atonix.io/v1
kind: Service
metadata:
  name: database-service
  version: 2.0.0

service:
  name: database-service
  runtime: container
  replicas: 1

resources:
  cpu: "2000m"
  memory: "4Gi"
  disk: "50Gi"

env:
  - key: POSTGRES_DB
    value: atonixcorp
  - key: POSTGRES_PASSWORD
    secret: true

ports:
  - name: postgres
    containerPort: 5432

health:
  liveness: /health
  readiness: /ready
  periodSeconds: 30

security:
  runAsNonRoot: true
  readOnlyRootFilesystem: false
```

### AI/ML Service with GPU

```yaml
apiVersion: atonix.io/v1
kind: Service
metadata:
  name: ml-inference
  version: 1.0.0

service:
  name: ml-inference
  runtime: container
  replicas: 2

resources:
  cpu: "4"
  memory: "8Gi"
  disk: "20Gi"
  gpu: 1  # GPU accelerator

autoscaling:
  enabled: true
  min: 1
  max: 10
  targetCPU: 60

env:
  - key: MODEL_PATH
    value: /models/bert-large
  - key: BATCH_SIZE
    value: "32"

ports:
  - name: http
    containerPort: 8080
  - name: metrics
    containerPort: 9090

health:
  liveness: /health
  readiness: /ready

observability:
  logging:
    format: json
    level: info
  metrics:
    enabled: true
  tracing:
    enabled: true
    sampling_rate: 0.2
```

## Validation Rules

1. **Service name**: Must match `[a-z0-9]([-a-z0-9]*[a-z0-9])?`
2. **Replicas**: Must be >= 1
3. **Resources**: CPU and memory must be valid Kubernetes quantities
4. **Health endpoints**: Must be valid URL paths
5. **Ports**: Must be 1-65535, unique within service
6. **Version**: Must follow semantic versioning

## Environment Variable Resolution

Environment variables can reference:
- Literal values: `value: database`
- Secrets: `${SECRET_NAME}` (requires `secret: true`)
- ConfigMaps: Referenced via `configMap` field

## Security Best Practices

1. **Always set `runAsNonRoot: true`**
2. **Make root filesystem read-only**
3. **Drop all Linux capabilities**
4. **Use secrets for sensitive values**
5. **Enable tracing for debugging**
6. **Regular security scanning required**

## Deployment Workflow

1. Create `atonix.yaml` in service root
2. Run `atonix init` to validate
3. Run `atonix build` to build container
4. Run `atonix test` to verify
5. Run `atonix deploy --environment staging` to test
6. Run `atonix deploy --environment production --apply` to deploy

## Related Documentation

- [Developer Requirements](./DEVELOPER_REQUIREMENTS.md)
- [Deployment Workflow](./DEPLOYMENT_WORKFLOW.md)
- [Security Standards](./SECURITY_STANDARDS.md)
