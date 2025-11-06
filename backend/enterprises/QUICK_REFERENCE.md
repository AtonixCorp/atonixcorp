# Enterprise Security Management - Quick Reference Guide

Fast lookup guide for developers working with the security management system.

---

## Setup (5 minutes)

```bash
# 1. Apply migrations
cd backend
python manage.py migrate enterprises

# 2. Load framework data
python manage.py shell
from enterprises.security_models import SecurityFramework
frameworks = [
    {'name': 'nist', 'display_name': 'NIST'},
    {'name': 'iso27001', 'display_name': 'ISO 27001'},
]
for fw in frameworks:
    SecurityFramework.objects.create(**fw)
exit()

# 3. Test endpoints
curl -H "Authorization: Bearer token" http://localhost:8000/api/security/frameworks/
```

---

## Most Common Tasks

### 1. Create Security Policy
```python
POST /api/security/policies/
{
  "enterprise": "uuid",
  "mfa_required": true,
  "password_min_length": 16,
  "primary_framework": "nist-uuid"
}
```

### 2. Report Security Incident
```python
POST /api/security/incidents/
{
  "enterprise": "uuid",
  "title": "Unauthorized Access",
  "severity": "high",
  "systems_affected": "API"
}
```

### 3. Schedule Audit
```python
POST /api/security/audits/
{
  "enterprise": "uuid",
  "audit_type": "external",
  "title": "Q1 Security Audit",
  "scheduled_date": "2024-03-15"
}
```

### 4. Track Compliance
```python
POST /api/security/compliance/
{
  "enterprise": "uuid",
  "framework": "iso27001-uuid",
  "requirement_name": "Security Policy",
  "deadline": "2024-06-30"
}
```

### 5. Get Dashboard Overview
```python
GET /api/dashboard/security/overview/
```

---

## Database Models

```
SecurityFramework
├─ id (UUID)
├─ name (NIST, ISO 27001, etc)
├─ display_name
└─ version

EnterpriseSecurityPolicy
├─ enterprise → Enterprise
├─ mfa_required (bool)
├─ password_min_length (int)
├─ enable_audit_logging (bool)
├─ primary_framework → SecurityFramework
└─ 30+ more fields

SecurityControl
├─ enterprise → Enterprise
├─ framework → SecurityFramework
├─ control_id (AC-1, etc)
├─ status (not_implemented, implemented, verified)
└─ priority (critical, high, medium, low)

SecurityAudit
├─ enterprise → Enterprise
├─ status (scheduled, in_progress, completed)
├─ findings_count
└─ remediation_deadline

SecurityIncident
├─ enterprise → Enterprise
├─ severity (critical, high, medium, low)
├─ status (reported, investigating, contained, resolved)
└─ response_actions

ComplianceTracker
├─ enterprise → Enterprise
├─ framework → SecurityFramework
├─ requirement_name
├─ status (not_started, in_progress, completed)
└─ deadline

SecurityHardeningChecklist
├─ enterprise → Enterprise
├─ system_type (linux, windows, containers, k8s, db, app, network)
├─ items (JSON list of checklist items)
└─ completion_percentage
```

---

## Endpoint Reference

### Frameworks (Read-Only)
- `GET /api/security/frameworks/` - List all
- `GET /api/security/frameworks/by_name/?name=nist` - Get by name

### Policies
- `GET /api/security/policies/` - List
- `POST /api/security/policies/` - Create
- `PATCH /api/security/policies/{id}/` - Update
- `GET /api/security/policies/{id}/compliance_summary/` - Compliance overview

### Controls
- `GET /api/security/controls/` - List (filterable by framework, status, priority)
- `POST /api/security/controls/` - Create
- `PATCH /api/security/controls/{id}/` - Update
- `POST /api/security/controls/{id}/verify/` - Mark verified
- `GET /api/security/controls/by_framework/?framework_id=uuid` - Get by framework

### Audits
- `GET /api/security/audits/` - List (filterable by status)
- `POST /api/security/audits/` - Create
- `PATCH /api/security/audits/{id}/` - Update
- `POST /api/security/audits/{id}/start/` - Begin audit
- `POST /api/security/audits/{id}/complete/` - Finalize with findings
- `GET /api/security/audits/upcoming/?days=30` - Get upcoming

### Incidents
- `GET /api/security/incidents/` - List (filterable by severity, status)
- `POST /api/security/incidents/` - Create/report
- `PATCH /api/security/incidents/{id}/` - Update
- `POST /api/security/incidents/{id}/update_status/` - Change status
- `GET /api/security/incidents/active/` - Active only
- `GET /api/security/incidents/by_severity/` - Count by severity

### Compliance
- `GET /api/security/compliance/` - List
- `POST /api/security/compliance/` - Create
- `PATCH /api/security/compliance/{id}/` - Update
- `GET /api/security/compliance/overdue/` - Overdue items
- `GET /api/security/compliance/by_framework/?framework_id=uuid` - By framework
- `POST /api/security/compliance/{id}/mark_completed/` - Mark complete

### Dashboard
- `GET /api/dashboard/security/overview/` - Enterprise summary
- `GET /api/dashboard/security/compliance/?enterprise_id=uuid` - Compliance by framework
- `GET /api/dashboard/security/incidents/?enterprise_id=uuid` - Incident summary
- `GET /api/dashboard/security/audits/?enterprise_id=uuid&days=90` - Audit schedule

---

## Status Values

**Policy**: active, inactive

**Control**: 
- not_implemented
- implemented
- verified

**Audit**:
- scheduled
- in_progress
- completed
- on_hold

**Incident**:
- reported
- investigating
- contained
- resolved

**Compliance**:
- not_started
- in_progress
- completed

---

## Severity Levels

**Incident**:
- critical (immediate action required)
- high (urgent, within hours)
- medium (normal, within days)
- low (informational, no urgency)

**Control**:
- critical (must implement)
- high (strongly recommended)
- medium (recommended)
- low (optional)

---

## Query Examples

### Get all NIST controls for an enterprise
```python
GET /api/security/controls/?enterprise=uuid&framework=nist-uuid
```

### Get active security incidents by severity
```python
GET /api/security/incidents/?enterprise=uuid&status__in=reported,investigating
```

### Get overdue compliance items
```python
GET /api/security/compliance/overdue/?enterprise=uuid
```

### Get compliance status for ISO 27001
```python
GET /api/security/compliance/by_framework/?framework_id=iso-uuid&enterprise=uuid
```

### Get upcoming audits in next 60 days
```python
GET /api/security/audits/upcoming/?days=60
```

---

## Permissions

All endpoints require: `IsAuthenticated`

**User Access**:
- See own enterprise data only
- Must be member of enterprise team OR
- Be staff/admin (see all enterprises)

**Admin Access**:
- `is_staff=True` → See all enterprises
- `is_superuser=True` → Full access

---

## Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| 403 Forbidden | Add user to enterprise team |
| 404 Not Found | Check enterprise_id exists and user has access |
| Empty results | Verify filters match existing data |
| Validation error | Check required fields in request body |
| No endpoints found | Run `makemigrations` and `migrate` |

---

## Common Workflows

### Complete an Audit
```bash
# 1. Create
POST /api/security/audits/
{"enterprise": "uuid", "scheduled_date": "2024-03-15"}

# 2. Start (when ready)
POST /api/security/audits/{id}/start/

# 3. Complete (add findings)
POST /api/security/audits/{id}/complete/
{"findings_count": 5, "critical_findings": 1}
```

### Respond to an Incident
```bash
# 1. Report
POST /api/security/incidents/
{"enterprise": "uuid", "title": "...", "severity": "high"}

# 2. Investigate
POST /api/security/incidents/{id}/update_status/
{"status": "investigating"}

# 3. Contain
POST /api/security/incidents/{id}/update_status/
{"status": "contained"}

# 4. Resolve
POST /api/security/incidents/{id}/update_status/
{"status": "resolved"}
```

### Track Compliance Requirement
```bash
# 1. Create requirement
POST /api/security/compliance/
{
  "enterprise": "uuid",
  "framework": "iso-uuid",
  "requirement_name": "Access Control",
  "deadline": "2024-06-30"
}

# 2. Mark complete
POST /api/security/compliance/{id}/mark_completed/
```

---

## Performance Tips

1. **Use filtering** instead of fetching all:
   ```python
   GET /api/security/controls/?enterprise=uuid&status=verified
   ```

2. **Pagination for large sets**:
   ```python
   GET /api/security/audits/?page=2&page_size=50
   ```

3. **Cache framework data**:
   ```python
   frameworks = cache.get('frameworks')
   if not frameworks:
       frameworks = SecurityFramework.objects.all()
       cache.set('frameworks', frameworks, 3600)
   ```

4. **Use dashboard endpoints** for summaries instead of fetching raw data

---

## Files Reference

| File | Purpose | Lines |
|------|---------|-------|
| `security_models.py` | 7 data models | ~500 |
| `security_serializers.py` | 7 serializers | ~300 |
| `views.py` | 7 ViewSets + dashboard | ~700 |
| `urls.py` | Route configuration | +10 |
| `dashboard/views.py` | 4 dashboard endpoints | +300 |
| `SECURITY_API.md` | Complete API docs | ~500 |
| `SECURITY_IMPLEMENTATION.md` | Setup & usage | ~400 |

---

## Quick Links

- **API Docs**: [SECURITY_API.md](./SECURITY_API.md)
- **Setup Guide**: [SECURITY_IMPLEMENTATION.md](./SECURITY_IMPLEMENTATION.md)
- **Models**: [security_models.py](./security_models.py)
- **ViewSets**: [views.py](./views.py)

---

## Support

**Check these first**:
1. Read the SECURITY_API.md for endpoint details
2. Review SECURITY_IMPLEMENTATION.md for setup issues
3. Verify user has enterprise team membership
4. Check database has security framework data

**Get help**:
- Check Django logs: `tail -f logs/django.log`
- Test endpoint: `curl -v http://localhost:8000/api/security/frameworks/`
- Debug query: Use Django debug toolbar or `print(Model.objects.query)`

---

**Last Updated**: January 2024  
**Version**: 1.0  
**Status**: ✅ Production Ready
