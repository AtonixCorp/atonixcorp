# Enterprise Security Dashboard - Frontend Setup Guide

Complete guide for setting up and testing the Enterprise Security Dashboard frontend.

---

## Overview

The Enterprise Security Dashboard provides real-time visualization of:
- Security policies and controls
- Compliance status by framework
- Security incidents and their status
- Audit schedules and findings
- Overall security posture

---

## Files Created/Modified

### Created Files

1. **`frontend/src/services/securityApi.ts`** - API Service Layer
   - Centralized API calls to backend endpoints
   - Token-based authentication
   - Error handling
   - Type-safe responses

### Modified Files

1. **`frontend/src/pages/enterprise/EnterpriseSecurity.tsx`** - Main Dashboard Component
   - Updated to use securityApi service
   - Removed hardcoded API calls
   - Improved error handling
   - Real data fetching from backend

---

## Setup Instructions

### 1. Backend Prerequisites

Ensure backend security endpoints are running:

```bash
# In backend directory
cd backend
python manage.py migrate enterprises
python manage.py runserver
```

Verify backend endpoints are accessible:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/dashboard/security/overview/
```

### 2. Frontend Setup

```bash
# In frontend directory
cd frontend
npm install

# Start development server
npm start
```

Frontend runs at: `http://localhost:3000`

### 3. Authentication

The dashboard requires authentication:

```typescript
// Token stored in localStorage
localStorage.setItem('authToken', 'your-jwt-token');
```

---

## API Endpoints Used

The dashboard connects to these backend endpoints:

### Security Overview
```
GET /api/dashboard/security/overview/
Response: {
  data: {
    enterprises: [{...}],
    summary: {
      total_enterprises,
      policies_active,
      controls_total,
      controls_verified,
      active_incidents,
      upcoming_audits,
      compliance_score
    }
  }
}
```

### Compliance Status
```
GET /api/dashboard/security/compliance/?enterprise_id={id}
Response: {
  data: {
    enterprise_id,
    frameworks: [{
      framework,
      total,
      completed,
      in_progress,
      not_started,
      compliance_percentage,
      items: [...]
    }],
    overall_compliance
  }
}
```

### Security Incidents
```
GET /api/dashboard/security/incidents/?enterprise_id={id}
Response: {
  data: {
    total,
    by_severity: {...},
    by_status: {...},
    mttr_hours,
    active_incidents,
    recent_incidents: [...]
  }
}
```

### Audit Schedule
```
GET /api/dashboard/security/audits/?enterprise_id={id}&days=90
Response: {
  data: {
    upcoming: [...],
    recent: [...],
    summary: {...}
  }
}
```

---

## Dashboard Features

### Tab 1: Compliance

Displays compliance status by framework:

- **Framework Cards**: Show compliance percentage and progress
- **Status Breakdown**: In progress, not started, completed items
- **Progress Bars**: Visual representation of completion

Features:
- Color-coded completion status
- Framework-specific requirements
- Deadline tracking
- Evidence documentation

### Tab 2: Incidents

Security incident management:

- **Severity Distribution**: Critical, High, Medium, Low counts
- **Recent Incidents Table**: List of latest incidents
- **Status Tracking**: Reported → Investigating → Contained → Resolved
- **Incident Details Dialog**: View and update incident status

Features:
- Color-coded severity levels
- Status update capabilities
- System affected tracking
- Response timeline

### Tab 3: Audits

Audit scheduling and results:

- **Upcoming Audits**: Scheduled audits within 90 days
- **Recent Audits**: Completed audits with findings
- **Findings Summary**: Critical, High, Medium, Low breakdown
- **Audit Details**: Type, date, status

Features:
- Audit scheduling
- Finding tracking
- Remediation planning
- Compliance evidence

---

## Troubleshooting

### Issue: "No security data available"

**Cause**: Backend not responding or no data exists

**Solution**:
1. Verify backend is running: `http://localhost:8000/api/security/frameworks/`
2. Check authentication token is valid
3. Ensure enterprise exists and user has access
4. Check network tab in browser dev tools

### Issue: "Failed to fetch overview"

**Cause**: API endpoint not accessible or returns error

**Solution**:
1. Verify backend security app is installed
2. Check database migrations applied: `python manage.py migrate enterprises`
3. Verify CORS is configured if on different domain
4. Check backend logs for errors

### Issue: CORS Errors

**Cause**: Frontend and backend on different origins

**Solution**:
1. Add to Django settings:
```python
ALLOWED_HOSTS = ['localhost', '127.0.0.1']
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:8000',
]
```

2. Install django-cors-headers:
```bash
pip install django-cors-headers
```

3. Add to INSTALLED_APPS and MIDDLEWARE in settings.py

### Issue: 401 Unauthorized

**Cause**: Invalid or missing authentication token

**Solution**:
1. Verify token is stored in localStorage
2. Token must not be expired
3. Token must have proper permissions
4. Check token format: "Bearer {token}"

### Issue: 404 Not Found

**Cause**: Endpoint doesn't exist

**Solution**:
1. Verify backend URL is correct
2. Check API endpoint paths match backend routes
3. Ensure URL namespacing is correct
4. Verify views are registered in urls.py

---

## Testing Checklist

- [ ] Backend is running
- [ ] Authentication token is valid
- [ ] Dashboard loads without errors
- [ ] Summary cards show data
- [ ] Compliance tab displays frameworks
- [ ] Incidents tab shows data
- [ ] Audits tab displays schedule
- [ ] Can open incident details dialog
- [ ] Can update incident status
- [ ] Network requests succeed (check DevTools)
- [ ] No console errors

---

## Service Layer: securityApi.ts

The service layer provides clean, reusable API methods:

### Usage Example

```typescript
import { securityApi } from '../../services/securityApi';

// Get security overview
const overview = await securityApi.getSecurityOverview();

// Get compliance status
const compliance = await securityApi.getComplianceStatus(enterpriseId);

// Get incidents
const incidents = await securityApi.getSecurityIncidents(enterpriseId);

// Create incident
await securityApi.createIncident(enterpriseId, {
  title: 'Unauthorized Access',
  severity: 'high',
  description: '...'
});

// Update incident status
await securityApi.updateIncidentStatus(incidentId, 'investigating');
```

### Error Handling

All service methods throw on error:

```typescript
try {
  const data = await securityApi.getSecurityOverview();
  // Handle data
} catch (error) {
  console.error('Failed:', error.message);
  // Show user-friendly error
}
```

---

## Performance Optimization

### Caching

To reduce API calls, implement caching:

```typescript
const cache = new Map();

async function cachedFetch(key, fetcher, ttl = 60000) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const data = await fetcher();
  cache.set(key, data);
  
  setTimeout(() => cache.delete(key), ttl);
  return data;
}
```

### Polling

For real-time updates:

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    fetchOverview();
  }, 30000); // Every 30 seconds
  
  return () => clearInterval(interval);
}, []);
```

### Pagination

For large datasets:

```typescript
const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(25);

const response = await fetch(
  `${API_BASE_URL}/security/controls/?page=${page}&page_size=${pageSize}`
);
```

---

## Integration Points

### Dashboard Home Page

Link to Security Dashboard:

```tsx
<Link to={`/enterprise/${enterpriseId}/security`}>
  View Security Dashboard
</Link>
```

### Admin Panel

Add Security Management:

```tsx
<Link to="/admin/security/policies">
  Manage Security Policies
</Link>

<Link to="/admin/security/audits">
  Manage Audits
</Link>

<Link to="/admin/security/incidents">
  Manage Incidents
</Link>
```

### User Profile

Show User's Security Status:

```tsx
<SecurityStatusCard enterprise={userEnterprise} />
```

---

## Future Enhancements

- [ ] Real-time notifications for incidents
- [ ] Export compliance reports to PDF
- [ ] Charts and visualizations for trends
- [ ] Automated remediation suggestions
- [ ] Integration with incident ticketing
- [ ] Custom dashboard widgets
- [ ] Role-based dashboard views
- [ ] Mobile-responsive dashboard
- [ ] Dark mode support
- [ ] WebSocket for real-time updates

---

## Support

For issues or questions:

1. Check backend logs: `tail -f logs/django.log`
2. Check browser console: DevTools → Console tab
3. Check network requests: DevTools → Network tab
4. Review backend error responses
5. Verify database has security data

---

## API Response Formats

### Success Response
```json
{
  "data": { ...response data... },
  "message": "Optional message"
}
```

### Error Response
```json
{
  "error": "Error message",
  "message": "Detailed error information"
}
```

---

## Environment Variables

Create `.env` file in frontend directory:

```
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_AUTH_TOKEN_KEY=authToken
REACT_APP_ENTERPRISE_ID=default-enterprise-id
```

Access in code:

```typescript
const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const tokenKey = process.env.REACT_APP_AUTH_TOKEN_KEY || 'authToken';
```

---

## Security Best Practices

1. **Store Token Securely**
   ```typescript
   // ✅ Better - HTTP-only cookie
   // ❌ Avoid - localStorage for sensitive tokens
   localStorage.setItem('authToken', token); // For demo only
   ```

2. **Validate Data**
   ```typescript
   // Always validate API responses
   if (!data.data || typeof data.data !== 'object') {
     throw new Error('Invalid response format');
   }
   ```

3. **Handle Errors Gracefully**
   ```typescript
   // Show user-friendly messages
   catch (error) {
     const message = error.message === 'Unauthorized' 
       ? 'Please log in again'
       : 'An error occurred. Please try again.';
     setError(message);
   }
   ```

4. **CSRF Protection**
   - Django includes CSRF by default
   - Include CSRF token in POST requests

---

## Quick Start

1. **Terminal 1 - Backend**:
```bash
cd backend
source ../.venv/bin/activate
python manage.py runserver
```

2. **Terminal 2 - Frontend**:
```bash
cd frontend
npm start
```

3. **Browser**:
```
http://localhost:3000/enterprise/{id}/security
```

---

**Setup Complete!** 🎉

The Enterprise Security Dashboard is now ready to display real security data from your backend.
