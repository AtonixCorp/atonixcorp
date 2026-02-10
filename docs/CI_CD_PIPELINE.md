# AtonixCorp CI/CD Pipeline

## Overview

The AtonixCorp CI/CD pipeline automates the entire software delivery process from code commit to production deployment. The pipeline follows industry best practices with automated testing, security scanning, and progressive deployment strategies.

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Code Push to GitHub                          │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
         PR/Merge to       Push to
         develop/main      develop/main
                │                     │
                ▼                     ▼
        ┌──────────────┐      ┌──────────────┐
        │ Stage 1:     │      │ Stage 1:     │
        │ Lint/Format  │      │ Lint/Format  │
        └──────┬───────┘      └──────┬───────┘
               │                     │
               ▼                     ▼
        ┌──────────────┐      ┌──────────────┐
        │ Stage 2:     │      │ Stage 2:     │
        │ Unit Tests   │      │ Unit Tests   │
        └──────┬───────┘      └──────┬───────┘
               │                     │
               ▼                     ▼
        ┌──────────────┐      ┌──────────────┐
        │ Stage 3:     │      │ Stage 3:     │
        │ Security     │      │ Security     │
        │ Scanning     │      │ Scanning     │
        └──────┬───────┘      └──────┬───────┘
               │                     │
               ▼                     ▼
        ┌──────────────┐      ┌──────────────┐
        │ PR Review    │      │ Build &      │
        │ Required     │      │ Push Images  │
        └──────────────┘      └──────┬───────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
              ┌──────────┐   ┌──────────────┐   ┌────────────┐
              │Deploy to │   │Integration   │   │Production  │
              │Staging   │   │Tests         │   │Deployment  │
              └────┬─────┘   └──────┬───────┘   └────┬───────┘
                   │                │                │
                   └────────┬───────┘                │
                            │                       │
                            ▼                       ▼
                      ┌──────────────┐       ┌────────────┐
                      │  Smoke Tests │       │  Monitor   │
                      └──────────────┘       │ & Verify   │
                                             └────────────┘
```

## Pipeline Stages

### Stage 1: Lint & Format Check

**Trigger**: All commits to main, develop, and PRs

**Purpose**: Ensure code quality and consistent formatting

**Tools**:
- `flake8` - Python linting
- `pylint` - Python code analysis
- `eslint` - JavaScript linting

**Actions**:
```bash
flake8 backend --max-line-length=120
pylint backend
npm run lint  # frontend
```

**Success Criteria**:
- No critical lint errors
- Code style matches standards
- All files formatted correctly

### Stage 2: Unit Tests

**Trigger**: All commits (continues even if Stage 1 fails)

**Purpose**: Validate individual components and functions

**Test Infrastructure**:
- Backend: PostgreSQL, Redis (via Docker services)
- Frontend: Jest test runner
- Coverage requirement: >= 80%

**Backend Tests**:
```bash
pytest tests/unit/ -v --cov=. --cov-report=xml
codecov upload  # Coverage reporting
```

**Frontend Tests**:
```bash
npm test -- --watchAll=false --coverage
codecov upload  # Coverage reporting
```

**Success Criteria**:
- All tests pass
- Coverage >= 80%
- No timeout errors

### Stage 3: Security Scanning

**Trigger**: All commits

**Purpose**: Identify vulnerabilities and security risks

**Tools**:
- Trivy - Container and filesystem scanning
- OWASP Dependency Check - Dependency vulnerabilities
- Safety - Python package vulnerabilities

**Scans**:
```bash
trivy fs .  # Filesystem scan
trivy image <image>  # Image scan
safety check --json  # Python deps
dependency-check  # All dependencies
```

**Output**:
- SARIF reports uploaded to GitHub Security tab
- Vulnerability list generated
- Build continues (warnings only)

### Stage 4: Build & Push Containers

**Trigger**: Push to main/develop branches only

**Purpose**: Build Docker images and push to registry

**Registry**: Docker Hub

**Images Built**:
- `atonixdev/atonixcorp-platform-frontend:<tag>`
- `atonixdev/atonixcorp-platform-backend:<tag>`

**Tagging Strategy**:
- Main branch: `latest`, `v1.0.0` (semver)
- Develop branch: `develop`, `develop-<short-sha>`
- All branches: `<branch>-<short-sha>`

**Process**:
```bash
docker buildx build --push \
  -t registry/image:tag
  
trivy image registry/image:tag  # Post-build scan
```

**Success Criteria**:
- Images built successfully
- Pushed to registry
- Security scan passed

### Stage 5: Deploy to Staging

**Trigger**: Merges to develop branch

**Environment**: Kubernetes staging cluster

**Actions**:
1. Create/update namespace: `atonixcorp-staging`
2. Update image references
3. Rollout deployment
4. Wait for rollout completion (5 min timeout)

**Deployment**:
```bash
kubectl -n atonixcorp-staging set image deployment/backend \
  backend=registry/image:develop
kubectl -n atonixcorp-staging rollout status deployment/backend
```

**Success Criteria**:
- Deployment created/updated
- Pods rolling out
- No errors in logs

### Stage 6: Integration Tests

**Trigger**: After staging deployment

**Purpose**: Test service interactions and APIs

**Tests**:
- API endpoint validation
- Database operation tests
- Cache integration tests
- External service mocks

**Execution**:
```bash
pytest tests/integration/ -v
pytest tests/smoke/ -v  # Quick validation
```

**Smoke Tests** (essential):
- Health check: `/health` → 200
- Readiness check: `/ready` → 200
- Database connectivity
- Cache accessibility

**Success Criteria**:
- All integration tests pass
- Smoke tests pass
- No performance degradation

### Stage 7: Promote to Production

**Trigger**: Successful merge to main branch

**Environment**: Kubernetes production cluster
**Manual Approval**: Required (GitHub environment protection)

**Actions**:
1. Create/update namespace: `atonixcorp-production`
2. Update image references to main branch
3. Rollout deployment
4. Wait for rollout completion (10 min timeout)
5. Verify deployment

**Pre-Deployment Checks**:
- All previous stages passed
- Security scan approved
- Manual approval in GitHub

**Deployment**:
```bash
kubectl -n atonixcorp-production set image deployment/backend \
  backend=registry/image:main --record
kubectl -n atonixcorp-production rollout status deployment/backend
```

**Post-Deployment**:
- Verify pod status
- Check service endpoints
- Validate health checks
- Monitor logs for errors

## Pipeline Configuration

### GitHub Secrets Required

Set these in your GitHub repository settings:

```
DOCKER_USERNAME          # Docker Hub username
DOCKER_PASSWORD          # Docker Hub personal access token
DOCKER_REGISTRY          # Docker registry URL
KUBE_CONFIG_STAGING      # Base64-encoded kubeconfig for staging
KUBE_CONFIG_PRODUCTION   # Base64-encoded kubeconfig for production
SLACK_WEBHOOK            # Slack webhook for notifications
STAGING_API_URL          # Staging API endpoint
STAGING_API_KEY          # Staging API authentication
```

### Environment Variables

Configure per-environment:

```yaml
# Staging Environment
env:
  DATABASE_URL: postgres://db:5432/atonix_staging
  REDIS_URL: redis://redis:6379/0
  LOG_LEVEL: debug
  DEBUG: true

# Production Environment  
env:
  DATABASE_URL: postgres://prod-db:5432/atonix_prod
  REDIS_URL: redis://prod-redis:6379/0
  LOG_LEVEL: info
  DEBUG: false
```

## Branch Strategy

### Main Branch (`main`)
- Production-ready code
- Requires PR review and checks passing
- Automatic production deployment
- Manual approval required before merge
- Tag releases with semantic versioning

### Develop Branch (`develop`)
- Integration branch
- Accepts PRs from feature branches
- Automatic staging deployment
- Automatic integration tests

### Feature Branches (`feature/*`)
- Created from develop
- Automatic testing on PR
- Requires PR review before merge
- Deleted after merge

### Hotfix Branches (`hotfix/*`)
- Created from main
- For urgent production fixes
- Direct merge to main (bypass develop)
- Tag release immediately

## Pipeline Workflow Example

### Feature Development

```
1. Create feature branch: git checkout -b feature/new-api

2. Push commits:
   ├─ Inline: Lint + Unit Tests (automatic)
   ├─ No deployment (feature branch)
   └─ PR created

3. PR Review:
   ├─ Code review by team members
   ├─ All checks must pass
   ├─ Security review required
   └─ Approved

4. Merge to develop:
   ├─ Build containers
   ├─ Push to registry
   ├─ Deploy to staging
   ├─ Integration tests
   └─ Notification sent

5. Merge to main:
   ├─ Manual approval in GitHub
   ├─ Deploy to production
   ├─ Verify deployment
   ├─ Tag release
   └─ Notification sent
```

## Monitoring & Observability

### Build Metrics

Track in dashboard:
- Build success rate
- Build duration
- Test coverage trend
- Security vulnerabilities found

### Deployment Metrics

Track in dashboard:
- Deployment frequency
- Deployment lead time
- Deployment success rate
- Mean time to recovery (MTTR)

### Test Results

Dashboard displays:
- Test pass/fail rates
- Coverage trends
- Performance benchmarks
- Regression detection

## Rollback Procedures

### Staging Rollback

```bash
# Revert to previous image
kubectl -n atonixcorp-staging set image deployment/backend \
  backend=registry/image:develop-previous-sha

# Verify rollback
kubectl -n atonixcorp-staging rollout status deployment/backend
```

### Production Rollback

```bash
# Check deployment history
kubectl -n atonixcorp-production rollout history deployment/backend

# Rollback to previous revision
kubectl -n atonixcorp-production rollout undo deployment/backend

# Verify rollback
kubectl -n atonixcorp-production rollout status deployment/backend
```

## Troubleshooting

### Pipeline Failures

**Lint Failures**:
```bash
# Fix locally before pushing
flake8 backend --fix-long-lines
autopep8 backend -r --in-place
```

**Test Failures**:
```bash
# Run tests locally
pytest tests/unit/ -v -s
npm test -- --verbose
```

**Build Failures**:
```bash
# Debug Docker build locally
docker build -t test:local .
docker run -it test:local /bin/bash
```

**Deployment Failures**:
```bash
# Check pod status
kubectl -n atonixcorp-staging describe pod <pod-name>
kubectl -n atonixcorp-staging logs <pod-name>

# Check events
kubectl -n atonixcorp-staging get events --sort-by='.lastTimestamp'
```

## Best Practices

1. **Keep pipelines fast**: Parallel execution, cache dependencies
2. **Fail fast**: Run quick checks first (lint before tests)
3. **Security first**: Security scanning on every commit
4. **Test coverage**: Maintain >= 80% test coverage
5. **Atomic commits**: Small, focused changes
6. **Clear naming**: Descriptive commit messages
7. **No secrets in code**: Use GitHub Secrets
8. **Monitor metrics**: Track pipeline health
9. **Regular reviews**: Audit and optimize pipeline
10. **Document changes**: Update docs with code

## Support

- Pipeline issues: devops-team@atonixcorp.com
- Deployment help: platform-team@atonixcorp.com
- Security concerns: security-team@atonixcorp.com
