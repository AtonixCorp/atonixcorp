# AtonixCorp Deployment Workflow

## Quick Start

```bash
# 1. Initialize service
atonix init --name my-service

# 2. Update atonix.yaml with your configuration
vim atonix.yaml

# 3. Build container
atonix build --tag my-service:1.0.0

# 4. Test locally
docker run -p 8080:8080 my-service:1.0.0

# 5. Push to registry
docker push atonixdev/my-service:1.0.0

# 6. Deploy to staging
atonix deploy --environment staging

# 7. Run integration tests
atonix test --environment staging

# 8. Deploy to production
atonix deploy --environment production
```

## Full Workflow Steps

### Phase 1: Development

```bash
# Create feature branch
git checkout -b feature/new-api

# Make changes
vim src/app.py

# Build Docker image locally
docker build -t my-service:dev .

# Run with docker-compose
docker-compose -f docker-compose.dev.yml up

# Run tests
pytest tests/ -v
npm test  # for frontend

# Run linters
flake8 src/
eslint src/

# Commit
git add .
git commit -m "feat: add new API endpoint"

# Push (triggers CI/CD)
git push origin feature/new-api
```

### Phase 2: Code Review & Testing

**Automated (GitHub Actions):**
-  Lint code
-  Run unit tests  
-  Security scan
-  Build container
-  Push to registry

**Manual:**
- [ ] Code review by teammates
- [ ] Approval from team lead

### Phase 3: Deploy to Staging

**Upon merge to develop branch:**

```bash
# Automatic
1. Build final image → `atonixdev/my-service:develop`
2. Push to registry
3. Deploy to staging cluster
4. Rollout pods
5. Run smoke tests
```

**Manual verification:**

```bash
# Check deployment status
kubectl -n atonixcorp-staging get deployments
kubectl -n atonixcorp-staging get pods

# View logs
kubectl -n atonixcorp-staging logs -l app=my-service --tail=50

# Test endpoints
curl -s https://staging-api.atonixcorp.com/health | jq .

# Run integration tests
pytest tests/integration/ -v
```

### Phase 4: Integration Testing

```bash
# Staging environment tests
cd backend

# API tests
pytest tests/integration/test_api.py -v

# Database tests
pytest tests/integration/test_database.py -v

# Cache tests
pytest tests/integration/test_cache.py -v

# Smoke tests (critical path)
pytest tests/smoke/ -v

# Load testing (optional)
k6 run tests/load/api-load-test.js
```

### Phase 5: Merge to Production

```bash
# Create pull request develop → main
git checkout main
git pull origin main
git merge develop

# Wait for:
#  All tests pass
#  Security scan approved
#  Code review complete

git push origin main
```

**Upon merge to main:**
- Automatic container build
- Push to registry: `atonixdev/my-service:main`
- **Manual approval required** in GitHub
- Deploy to production
- Verify deployment
- Monitor logs and metrics

### Phase 6: Production Deployment

```bash
# Manual approval in GitHub Actions

# Deployment process:
# 1. Create namespace (atonixcorp-production)
# 2. Update image reference
# 3. Rolling update deployment
# 4. Wait for all pods to be ready (10 min timeout)
# 5. Verify health checks passing
# 6. Run smoke tests against production

# Monitoring
kubectl -n atonixcorp-production get deployments
kubectl -n atonixcorp-production get pods
kubectl -n atonixcorp-production get svc

# Check metrics
# Visit Grafana dashboard
# Monitor error rates, response times, resource usage
```

## Pre-Deployment Checklist

Before any deployment, verify:

### Code Quality
- [ ] All tests passing (unit & integration)
- [ ] Test coverage >= 80%
- [ ] Linting passes (flake8, eslint)
- [ ] No hardcoded credentials
- [ ] No hardcoded environment-specific values

### Container & Image
- [ ] Dockerfile optimized and lean
- [ ] Image security scan passes
- [ ] No critical vulnerabilities
- [ ] Image tagged with version
- [ ] Image pushed to registry

### Configuration
- [ ] `atonix.yaml` valid and complete
- [ ] All required env vars documented
- [ ] Health endpoints configured (`/health`, `/ready`)
- [ ] Metrics endpoint available (`/metrics`)
- [ ] Logging configured (JSON format)

### Documentation
- [ ] README complete
- [ ] API documentation updated
- [ ] Configuration documented
- [ ] Breaking changes noted
- [ ] Rollback procedure documented

### Deployment
- [ ] Kubernetes manifests generated
- [ ] Resource requests/limits set
- [ ] Health checks configured
- [ ] Security context applied
- [ ] Network policies defined

### Monitoring
- [ ] Dashboards created
- [ ] Alert rules configured
- [ ] Log aggregation enabled
- [ ] Tracing enabled
- [ ] Baseline metrics recorded

## Deployment Scenarios

### Standard Deployment (Happy Path)

```
develop → staging deployment → manual test → main → production deployment
            ↓               ↓                        ↓
          success      all tests pass           approved
```

### Hotfix Deployment (Production)

```
main (hotfix branch) → immediate testing → production deployment
    ↓                    ↓                      ↓
create from main    smoke tests             automated
                    + manual                with approval
```

### Beta/Canary Deployment

```
Create canary deployment:
kubectl patch deployment/my-service -p \
  '{"spec":{"replicas":1}}'

Route 10% traffic to canary:
# Configure ingress or load balancer

Monitor canary metrics:
- Error rate < 0.1%
- Response time within baseline
- Resource usage normal

If successful:
- Increase replicas
- Eventually replace primary

If issues:
- Drain traffic
- Rollback
```

### Rollback Procedure

**Why rollback:**
- High error rate (>1%)
- Critical performance degradation
- Infrastructure unavailable
- Security issue discovered

**Automatic rollback:**
```bash
# Health checks fail → pod restart → full rollback
# Liveness probe fails 3x → container restarted
# Ready probe fails → traffic removed
```

**Manual rollback:**
```bash
# View deployment history
kubectl rollout history deployment/my-service -n atonixcorp-production

# Rollback to previous version
kubectl rollout undo deployment/my-service -n atonixcorp-production

# Rollback to specific revision
kubectl rollout undo deployment/my-service \
  --to-revision=3 -n atonixcorp-production

# Verify rollback
kubectl rollout status deployment/my-service -n atonixcorp-production

# Check pod logs
kubectl logs -l app=my-service --tail=100
```

## Release Management

### Version Numbering (Semantic Versioning)

```
MAJOR.MINOR.PATCH
1.0.0 = first release
1.1.0 = new feature, backward compatible
1.1.1 = bug fix
2.0.0 = breaking changes
```

### Release Process

```bash
# Create release branch
git checkout -b release/v1.1.0

# Update versions
# - atonix.yaml
# - package.json
# - requirements.txt
# - README

# Create tag
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0

# GitHub auto-creates release notes from commit history
```

### Release Notes Template

```markdown
# AtonixCorp v1.1.0

## New Features
- [ ] Feature 1 description
- [ ] Feature 2 description

## Bug Fixes
- [ ] Bug 1 fix

## Breaking Changes
- [ ] Change 1 description

## Upgrade Instructions

1. Update image: `atonixdev/my-service:1.1.0`
2. Run migrations: `atonix migrate`
3. Deploy: `atonix deploy --environment production`
4. Monitor metrics for 30 minutes

## Migration Guide
...

## Known Issues
...

## Contributors
...
```

## Environment Defaults

### Development Environment

```yaml
replicas: 1
cpu_request: "100m"
memory_request: "128Mi"
log_level: debug
debug_mode: true
cache_ttl: 1min
database: development_db
```

### Staging Environment

```yaml
replicas: 2
cpu_request: "250m"
memory_request: "256Mi"
log_level: info
debug_mode: false
cache_ttl: 5min
database: staging_db
```

### Production Environment

```yaml
replicas: 3 (min), 10 (max)
cpu_request: "500m"
memory_request: "512Mi"
log_level: warn
debug_mode: false
cache_ttl: 1hour
database: production_db (replicated, backup)
```

## Monitoring Deployment Health

### Key Metrics

```
Before deployment (baseline):
- API latency (p50, p95, p99)
- Error rate (%)
- CPU usage (%)
- Memory usage (%)
- Request volume
```

### Health Checks

Hour 1 (Critical):
- [ ] Pods running and ready
- [ ] No crash loops
- [ ] Health checks passing
- [ ] Error rate < 0.5%
- [ ] Latency within baseline

Hour 4 (Extended):
- [ ] Memory stable (no leaks)
- [ ] CPU usage normal
- [ ] No cascading failures
- [ ] Database connections healthy

Day 1 (Full):
- [ ] All metrics stable
- [ ] Logs normal
- [ ] No alerts firing
- [ ] Customer reports normal

### Alerting Rules

```yaml
High Error Rate:
  condition: error_rate > 1%
  duration: 5 minutes
  action: PagerDuty alert
  
High Latency:
  condition: p95_latency > 2s
  duration: 10 minutes
  action: Slack notification
  
Pod Crash Loop:
  condition: restart_count > 3 in 10 min
  duration: 1 minute
  action: PagerDuty alert + auto-rollback
```

## Runbooks

### Deploy Service

1. Ensure all tests pass
2. Tag image with version
3. Create release in GitHub
4. Use GitHub Actions to deploy
5. Manual approval in GitHub UI
6. Verify deployment in production

### Rollback Service

1. Identify issue (error rate spike, etc.)
2. Determine root cause
3. Execute rollback: `kubectl rollout undo deployment/service`
4. Verify rollback successful
5. Post-mortem in Slack/Jira

### Scale Service

```bash
# Manual scaling
kubectl scale deployment/my-service --replicas=5 -n atonixcorp-production

# Change autoscaler limits
kubectl patch hpa my-service -p '{"spec":{"maxReplicas":20}}'
```

### Update Secret

```bash
# Create new version
kubectl patch secret db-password \
  -p '{"data":{"password":"'$(echo -n 'newpass' | base64)'"}}'

# Rolling restart
kubectl rollout restart deployment/my-service
```

## Support

- **Deployment Help**: devops-team@atonixcorp.com
- **Emergency Rollback**: security-team@atonixcorp.com (24/7)
- **Build Failures**: platform-team@atonixcorp.com
- **Questions**: #deployment Slack channel
