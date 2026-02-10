# Frontend Integration with AtonixCorp Platform

## 🎯 Frontend-to-Platform Integration

Your frontend is now part of the complete AtonixCorp Platform. This document shows how the frontend integrates with all platform components.

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────┐
│     Frontend (React 19 + TypeScript)            │
│  - Dashboard, Security, Enterprise features    │
│  - Material-UI components, Recharts charts     │
└────────────────────┬────────────────────────────┘
                     │
                     │ HTTP/HTTPS
                     │ Axios API calls
                     │
┌────────────────────▼────────────────────────────┐
│   API Gateway / Load Balancer (Kubernetes)     │
│  - SSL/TLS termination                         │
│  - Rate limiting & DDoS protection             │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│  Backend Services (Django + Django REST)       │
│  - /api/security/ endpoints                    │
│  - /api/enterprises/ endpoints                 │
│  - /api/dashboard/ endpoints                   │
│  - /health, /ready, /metrics endpoints         │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│  Data Layer (PostgreSQL + Redis)               │
│  - Persistent storage                          │
│  - Caching layer                               │
│  - Session management                          │
└─────────────────────────────────────────────────┘
```

## 🔗 Frontend API Integration

### Health Check Integration

The frontend should implement health checks to monitor backend connectivity:

```typescript
// src/services/healthApi.ts (suggested)
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: boolean;
    cache: boolean;
    api: boolean;
  };
}

export const healthApi = {
  async checkHealth(): Promise<HealthStatus> {
    try {
      const res = await axios.get(`${API_BASE}/health`);
      return res.data;
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        checks: { database: false, cache: false, api: false }
      };
    }
  },

  async checkReadiness(): Promise<boolean> {
    try {
      const res = await axios.get(`${API_BASE}/ready`);
      return res.status === 200;
    } catch {
      return false;
    }
  }
};
```

### Metrics Collection

The frontend can collect user interaction metrics and send them to the metrics endpoint:

```typescript
// Collect frontend performance metrics
import { performanceMetrics } from './services/metricsCollector';

// Track page load time
performanceMetrics.recordPageLoad('dashboard', loadTime);

// Track API response time
performanceMetrics.recordApiCall('GET /api/enterprises', duration);

// Track user actions
performanceMetrics.recordUserAction('security_scan_initiated');
```

## 🚀 Deployment Integration

### Development Workflow
```
Your Code
    ↓
npm run build
    ↓
Docker Image (frontend/Dockerfile)
    ↓
Docker Registry
    ↓
GitHub Actions CI/CD (.github/workflows/ci-cd-enhanced.yml)
    ↓
Kubernetes Namespace
    ↓
Service + LoadBalancer
    ↓
Users access http://platform.atonixcorp.com
```

### Environment Variables

Create `.env.local` for development:
```env
# Backend API
REACT_APP_API_URL=http://localhost:8000
REACT_APP_API_TIMEOUT=30000

# OAuth/Auth
REACT_APP_AUTH_URL=http://localhost:8000/auth
REACT_APP_OAUTH_CLIENT_ID=frontend-dev
REACT_APP_OAUTH_REDIRECT_URI=http://localhost:3000/auth/callback

# Features
REACT_APP_ENABLE_AI_FEATURES=true
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_ERROR_TRACKING=true

# External Services
REACT_APP_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
REACT_APP_DATADOG_RUM_ID=your-rum-id
```

### Production Deployment

The frontend is containerized in `/frontend/Dockerfile`:

```dockerfile
# Multi-stage build
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# Production image
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Deployment via atonix CLI**:
```bash
cd frontend
atonix init --name frontend
# Edit atonix.yaml
atonix deploy --environment production
```

## 🔐 Security Integration

### CORS Configuration
Backend should allow frontend origin:
```python
# backend/settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Development
    "https://platform.atonixcorp.com",  # Production
]
```

### CSP Headers
Configure Content Security Policy:
```nginx
add_header Content-Security-Policy "
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdn.example.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.atonixcorp.com;
";
```

### Authentication Flow
```
User Login
    ↓
OAuth2/JWT Token Request
    ↓
Backend validates credentials
    ↓
JWT Token returned to frontend
    ↓
Frontend stores in secure cookie/localStorage
    ↓
All API requests include Authorization header
    ↓
Backend validates token for each request
    ↓
Role-based access control (RBAC) enforced
```

## 📈 Observability Integration

### Distributed Tracing

Frontend can send traces to Jaeger:

```typescript
// src/services/tracing.ts
import { NodeTracerProvider } from '@opentelemetry/node';
import { JaegerExporter } from '@opentelemetry/exporter-trace-jaeger';

const jaegerExporter = new JaegerExporter({
  endpoint: 'http://localhost:14268/api/traces',
});

const tracerProvider = new NodeTracerProvider();
tracerProvider.addSpanProcessor(new BatchSpanProcessor(jaegerExporter));
```

### Performance Monitoring

Use Web Vitals for frontend performance:

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);  // Cumulative Layout Shift
getFID(console.log);  // First Input Delay
getFCP(console.log);  // First Contentful Paint
getLCP(console.log);  // Largest Contentful Paint
getTTFB(console.log); // Time to First Byte
```

### Error Tracking

Integrate with Sentry for error monitoring:

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});

// Wrap your app
export default Sentry.withProfiler(App);
```

## 🎯 Frontend Checklist

### Pre-Production

- [ ] `.env.local` configured for development
- [ ] `.env.production` configured for production
- [ ] Backend API URL verified
- [ ] CORS headers configured on backend
- [ ] Authentication flow tested end-to-end
- [ ] All API endpoints responding
- [ ] Build succeeds: `npm run build`
- [ ] No console errors or warnings
- [ ] Security vulnerabilities addressed
- [ ] Performance bundle size < 500 kB gzipped

### Deployment

- [ ] Dockerfile tested locally
- [ ] Image builds successfully
- [ ] Backend service running and healthy
- [ ] Database migrations applied
- [ ] Redis cache available
- [ ] Frontend health endpoint responding
- [ ] CI/CD pipeline passes
- [ ] Staging deployment successful
- [ ] E2E tests passing
- [ ] Production rollout approved

### Post-Deployment

- [ ] Users can access the application
- [ ] No 404 or 500 errors in logs
- [ ] API calls showing in monitoring
- [ ] Performance metrics within acceptable range
- [ ] Error tracking system working
- [ ] User analytics collecting data
- [ ] Observability stack receiving signals
- [ ] Alerting rules firing correctly

## 📂 Related Documentation

| Document | Purpose |
|----------|---------|
| [../docs/PLATFORM_IMPLEMENTATION_GUIDE.md](../docs/PLATFORM_IMPLEMENTATION_GUIDE.md) | Platform overview |
| [../docs/DEVELOPER_REQUIREMENTS.md](../docs/DEVELOPER_REQUIREMENTS.md) | Service standards |
| [../docs/CI_CD_PIPELINE.md](../docs/CI_CD_PIPELINE.md) | Deployment automation |
| [../docs/DEPLOYMENT_WORKFLOW.md](../docs/DEPLOYMENT_WORKFLOW.md) | Deployment procedures |
| [../docs/SECURITY_STANDARDS.md](../docs/SECURITY_STANDARDS.md) | Security implementation |
| [../docs/OBSERVABILITY_GUIDE.md](../docs/OBSERVABILITY_GUIDE.md) | Monitoring setup |
| [./NPM_SETUP_GUIDE.md](./NPM_SETUP_GUIDE.md) | npm troubleshooting |
| [./FRONTEND_SETUP_COMPLETE.md](./FRONTEND_SETUP_COMPLETE.md) | Frontend setup summary |

## 🚀 Quick Start: Run Full Stack Locally

```bash
# Terminal 1: Backend
cd backend
python manage.py migrate
python manage.py runserver 0.0.0.0:8000

# Terminal 2: Frontend  
cd frontend
npm start
# Opens http://localhost:3000

# Terminal 3: Monitoring (optional)
docker-compose up -d prometheus grafana jaeger
```

**Access points**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Grafana: http://localhost:3000 (monitoring)
- Jaeger: http://localhost:16686 (traces)

## 🔧 Common Integration Issues

### CORS Error
**Symptom**: `Access to XMLHttpRequest blocked by CORS policy`
**Solution**: Configure `CORS_ALLOWED_ORIGINS` in Django settings

### Blank Page / 404
**Symptom**: Frontend loads but shows blank page
**Solution**: Check backend is running, verify `REACT_APP_API_URL` environment variable

### API Timeouts
**Symptom**: Requests take too long or fail
**Solution**: Check backend health, verify network connectivity, increase timeout in axios config

### Build Fails
**Symptom**: `npm run build` fails with errors
**Solution**: Run `npm audit fix`, clear cache: `rm -rf node_modules/.cache`, reinstall dependencies

### Port Already in Use
**Symptom**: `EADDRINUSE: address already in use :::3000`
**Solution**: `sudo lsof -ti:3000 | xargs kill -9` or use `PORT=3001 npm start`

## 📞 Support Contacts

- **Frontend Issues**: frontend-team@atonixcorp.com
- **Backend Integration**: backend-team@atonixcorp.com
- **DevOps/Deployment**: devops-team@atonixcorp.com
- **Security**: security-team@atonixcorp.com

---

**Status**: ✅ Frontend Ready for Integration  
**Last Updated**: February 10, 2026  
**React Version**: 19.1.1  
**Backend**: Django REST/Channels
