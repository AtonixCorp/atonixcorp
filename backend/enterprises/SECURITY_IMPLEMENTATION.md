# Enterprise Security Implementation Guide

Complete guide for implementing and using the Enterprise Security Management system in the AtonixCorp Platform.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup and Installation](#setup-and-installation)
4. [Configuration](#configuration)
5. [Usage Workflows](#usage-workflows)
6. [Dashboard Integration](#dashboard-integration)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The Enterprise Security Management system provides comprehensive tools for:

- **Security Policy Management**: Define and enforce enterprise-wide security policies
- **Compliance Tracking**: Monitor compliance with security frameworks (NIST, ISO 27001, CIS, OWASP, PCI-DSS, HIPAA, GDPR, SOC 2)
- **Control Implementation**: Track implementation of security controls mapped to frameworks
- **Audit Management**: Schedule and track security audits
- **Incident Response**: Report, track, and respond to security incidents
- **Dashboard Visualization**: Real-time security posture and compliance monitoring

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│         Enterprise Security Management System               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐  │
│  │         Django REST API Layer                        │  │
│  │  ├─ Security Policies ViewSet                        │  │
│  │  ├─ Security Controls ViewSet                        │  │
│  │  ├─ Hardening Checklists ViewSet                    │  │
│  │  ├─ Security Audits ViewSet                          │  │
│  │  ├─ Security Incidents ViewSet                       │  │
│  │  └─ Compliance Tracking ViewSet                      │  │
│  └─────────────────────────────────────────────────────┘  │
│                           ↓                                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │      Django ORM Data Models Layer                    │  │
│  │  ├─ SecurityFramework                               │  │
│  │  ├─ EnterpriseSecurityPolicy                        │  │
│  │  ├─ SecurityHardeningChecklist                      │  │
│  │  ├─ SecurityControl                                 │  │
│  │  ├─ SecurityAudit                                   │  │
│  │  ├─ SecurityIncident                                │  │
│  │  └─ ComplianceTracker                               │  │
│  └─────────────────────────────────────────────────────┘  │
│                           ↓                                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │      PostgreSQL Database                             │  │
│  │  └─ Persistent Data Storage                         │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐  │
│  │    Dashboard Integration Layer                       │  │
│  │  ├─ Security Overview Endpoint                      │  │
│  │  ├─ Compliance Status Endpoint                      │  │
│  │  ├─ Incidents Summary Endpoint                      │  │
│  │  └─ Audit Schedule Endpoint                         │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Data Model Relationships

```
Enterprise (Tenant)
    ↓
    ├─→ EnterpriseSecurityPolicy (1:1)
    │    └─→ SecurityFramework (M:M)
    │
    ├─→ SecurityControl (1:M)
    │    └─→ SecurityFramework (M:1)
    │
    ├─→ SecurityHardeningChecklist (1:M)
    │
    ├─→ SecurityAudit (1:M)
    │
    ├─→ SecurityIncident (1:M)
    │
    └─→ ComplianceTracker (1:M)
         └─→ SecurityFramework (M:1)

SecurityFramework (Reference Data)
    ├─→ SecurityControl (1:M)
    ├─→ EnterpriseSecurityPolicy (M:M)
    └─→ ComplianceTracker (1:M)
```

---

## Setup and Installation

### Prerequisites

- Python 3.10+
- Django 4.2+
- Django REST Framework
- PostgreSQL (recommended)
- Redis (for caching, optional)

### Installation Steps

1. **Create and activate migrations**

```bash
cd backend
python manage.py makemigrations enterprises --name add_security_models
python manage.py migrate enterprises
```

2. **Load security framework reference data**

```bash
python manage.py shell

# Load frameworks
from enterprises.security_models import SecurityFramework

frameworks = [
    {'name': 'nist', 'display_name': 'NIST Cybersecurity Framework', 'version': '1.1'},
    {'name': 'iso27001', 'display_name': 'ISO/IEC 27001', 'version': '2022'},
    {'name': 'cis', 'display_name': 'CIS Controls', 'version': '8.1'},
    {'name': 'owasp', 'display_name': 'OWASP Top 10', 'version': '2021'},
    {'name': 'pcidss', 'display_name': 'PCI DSS', 'version': '3.2.1'},
    {'name': 'hipaa', 'display_name': 'HIPAA Security Rule', 'version': '2013'},
    {'name': 'gdpr', 'display_name': 'GDPR', 'version': '2018'},
    {'name': 'soc2', 'display_name': 'SOC 2 Type II', 'version': '2022'},
]

for fw in frameworks:
    SecurityFramework.objects.get_or_create(
        name=fw['name'],
        defaults={
            'display_name': fw['display_name'],
            'version': fw['version'],
            'description': f"Security framework for {fw['display_name']}"
        }
    )

exit()
```

3. **Update Django settings** (in `atonixcorp/settings.py`)

```python
INSTALLED_APPS = [
    # ... existing apps
    'enterprises',
    'enterprises.security_models',
]

# Add DjangoFilterBackend for filtering
REST_FRAMEWORK = {
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
    ]
}
```

4. **Test API endpoints**

```bash
# Get all security frameworks
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/security/frameworks/

# List security policies
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/security/policies/
```

---

## Configuration

### Environment Variables

```bash
# .env or settings.py
SECURITY_AUDIT_RETENTION_DAYS=365
SECURITY_LOG_RETENTION_DAYS=90
ENABLE_SECURITY_AUDIT_LOGGING=True
ENABLE_INCIDENT_NOTIFICATIONS=True
INCIDENT_NOTIFICATION_EMAIL=security-team@example.com
COMPLIANCE_DASHBOARD_REFRESH_MINUTES=5
```

### Security Frameworks

Configure which frameworks your organization requires:

```python
# Load framework-specific requirements via management command or fixture
python manage.py loaddata security_frameworks.json
```

---

## Usage Workflows

### Workflow 1: Setup Enterprise Security Policy

1. **Create security policy**

```bash
POST /api/security/policies/
{
  "enterprise": "enterprise-uuid",
  "mfa_required": true,
  "password_min_length": 16,
  "enable_audit_logging": true,
  "primary_framework": "nist-uuid"
}
```

2. **Assign frameworks**

The policy automatically includes the primary framework. Link additional frameworks via the admin or directly in the serializer.

3. **Configure specific settings**

Update policy with framework-specific requirements using PATCH endpoint.

### Workflow 2: Track Security Controls

1. **Get framework controls**

```bash
GET /api/security/controls/by_framework/?framework_id=nist-uuid
```

2. **Update control status**

```bash
PATCH /api/security/controls/{control_id}/
{
  "status": "implemented",
  "implementation_notes": "Implemented via policy",
  "evidence_document": "https://docs.example.com/control-ac-1.pdf"
}
```

3. **Verify controls**

```bash
POST /api/security/controls/{control_id}/verify/
```

### Workflow 3: Run Security Audits

1. **Schedule audit**

```bash
POST /api/security/audits/
{
  "enterprise": "enterprise-uuid",
  "audit_type": "external",
  "title": "Q1 2024 Security Audit",
  "scheduled_date": "2024-03-15",
  "conducted_by": "Acme Security",
  "conducted_by_external": true
}
```

2. **Start audit**

```bash
POST /api/security/audits/{audit_id}/start/
```

3. **Record findings**

```bash
POST /api/security/audits/{audit_id}/complete/
{
  "findings_count": 8,
  "critical_findings": 1,
  "high_findings": 2,
  "medium_findings": 4,
  "low_findings": 1
}
```

4. **Track remediation**

Link incidents/compliance items to audit findings for tracking.

### Workflow 4: Manage Security Incidents

1. **Report incident**

```bash
POST /api/security/incidents/
{
  "enterprise": "enterprise-uuid",
  "title": "Unauthorized Access Detected",
  "severity": "high",
  "systems_affected": "API Gateway,Auth Service",
  "description": "Multiple failed auth attempts from external IP"
}
```

2. **Update status**

```bash
POST /api/security/incidents/{incident_id}/update_status/
{
  "status": "investigating"
}
```

As status updates occur, the system automatically sets `detected_at`, `contained_at`, and `resolved_at` timestamps.

3. **Document response**

Update incident with response actions, root cause, and improvements.

### Workflow 5: Track Compliance

1. **Create compliance items** (per framework requirement)

```bash
POST /api/security/compliance/
{
  "enterprise": "enterprise-uuid",
  "framework": "iso27001-uuid",
  "requirement_name": "Information Security Policy",
  "section_reference": "A.5.1",
  "deadline": "2024-06-30",
  "owner": "user-uuid"
}
```

2. **Monitor progress**

```bash
GET /api/security/compliance/by_framework/?framework_id=iso27001-uuid
```

3. **Mark as completed**

```bash
POST /api/security/compliance/{item_id}/mark_completed/
```

---

## Dashboard Integration

### Security Overview Dashboard

Display at `/dashboard/security/overview/`:

```python
# Python/React fetch
fetch('/api/dashboard/security/overview/', {
  headers: {'Authorization': `Bearer ${token}`}
})
.then(r => r.json())
.then(data => {
  // data.summary shows:
  // - total_enterprises
  // - policies_active
  // - controls_verified / controls_total
  // - active_incidents
  // - upcoming_audits
  // - compliance_score
})
```

### Compliance Dashboard Component

```react
function ComplianceDashboard() {
  const [compliance, setCompliance] = useState(null);
  
  useEffect(() => {
    fetch(`/api/dashboard/security/compliance/?enterprise_id=${enterpriseId}`, {
      headers: {'Authorization': `Bearer ${token}`}
    })
    .then(r => r.json())
    .then(data => setCompliance(data));
  }, [enterpriseId]);
  
  return (
    <div>
      {compliance?.frameworks.map(fw => (
        <FrameworkCard 
          framework={fw.framework}
          percentage={fw.compliance_percentage}
          items={fw.items}
        />
      ))}
    </div>
  );
}
```

### Incident Dashboard Component

```react
function IncidentDashboard() {
  const [incidents, setIncidents] = useState(null);
  
  useEffect(() => {
    fetch(`/api/dashboard/security/incidents/?enterprise_id=${enterpriseId}`, {
      headers: {'Authorization': `Bearer ${token}`}
    })
    .then(r => r.json())
    .then(data => setIncidents(data));
  }, [enterpriseId]);
  
  return (
    <div>
      <SummaryCards data={incidents?.by_severity} />
      <IncidentsList incidents={incidents?.recent_incidents} />
    </div>
  );
}
```

---

## Best Practices

### 1. Security Policy Configuration

- **Start with defaults**: Begin with standard policy for your industry
- **Customize incrementally**: Adjust settings based on risk assessment
- **Document rationale**: Record why each setting was chosen
- **Review quarterly**: Reassess policy settings every quarter
- **Version control**: Track policy changes with timestamps

### 2. Control Implementation

- **Map to frameworks**: Ensure all controls map to selected frameworks
- **Prioritize**: Implement critical controls first
- **Evidence collection**: Maintain documentation of implementation
- **Regular verification**: Schedule quarterly verification reviews
- **Automate where possible**: Use configuration management for enforcement

### 3. Audit Management

- **Plan annually**: Create annual audit schedule at start of year
- **Include both internal and external**: Mix internal and third-party audits
- **Track findings**: Link audit findings to incident/compliance items
- **Set remediation deadlines**: Establish clear timelines for fixes
- **Report progress**: Communicate audit status to stakeholders

### 4. Incident Response

- **Define severity levels**: Establish clear criteria for severity classification
- **Set response times**: Define SLAs for each severity level
- **Automate alerts**: Configure notifications for critical incidents
- **Document thoroughly**: Record all incident details for post-mortems
- **Learn and improve**: Update processes based on incident reviews

### 5. Compliance Tracking

- **Maintain current status**: Keep compliance items up-to-date
- **Track evidence**: Store documentation proving compliance
- **Monitor deadlines**: Set calendar reminders for upcoming deadlines
- **Communicate status**: Regularly report compliance metrics to leadership
- **Plan ahead**: Start work on items 30 days before deadline

### 6. Dashboard Monitoring

- **Check daily**: Review security dashboard each business day
- **Set alerts**: Configure alerts for high-risk conditions
- **Track trends**: Monitor improvements over time
- **Share reports**: Generate and distribute weekly security reports
- **Escalate issues**: Have clear escalation procedures for critical items

---

## Troubleshooting

### Common Issues

#### Issue: Migrations fail to apply

**Solution:**
```bash
# Check migration status
python manage.py showmigrations enterprises

# Rollback and reapply
python manage.py migrate enterprises 0001
python manage.py migrate enterprises
```

#### Issue: Permission denied on security endpoints

**Solution:**
- Verify user is part of enterprise (check `enterpriseteam` table)
- Ensure authentication token is valid
- Check that user has proper permissions
- Admin users bypass enterprise checks

#### Issue: Dashboard endpoints return empty data

**Solution:**
- Verify enterprise exists and user has access
- Check that security models have data created
- Review enterprise_id parameter is correctly specified
- Check database queries with Django debug toolbar

#### Issue: Audit findings not saving

**Solution:**
- Verify audit status is 'in_progress' or 'scheduled'
- Check findings JSON is valid format
- Ensure user has update permissions
- Review application logs for validation errors

### Performance Optimization

1. **Add database indexes** on frequently filtered fields:

```python
class SecurityControl(models.Model):
    # ...
    class Meta:
        indexes = [
            models.Index(fields=['enterprise', 'status']),
            models.Index(fields=['framework', 'priority']),
            models.Index(fields=['created_at', '-updated_at']),
        ]
```

2. **Use select_related/prefetch_related** in ViewSets:

```python
def get_queryset(self):
    return SecurityControl.objects.select_related(
        'enterprise', 'framework', 'verified_by'
    )
```

3. **Cache framework reference data**:

```python
from django.core.cache import cache

frameworks = cache.get('security_frameworks')
if not frameworks:
    frameworks = SecurityFramework.objects.all()
    cache.set('security_frameworks', frameworks, 3600)
```

4. **Paginate large result sets**:

```python
class SecurityControlViewSet(viewsets.ModelViewSet):
    pagination_class = LargeResultsSetPagination
```

---

## Support and Maintenance

### Regular Maintenance Tasks

- **Weekly**: Review active incidents, check dashboard alerts
- **Monthly**: Review compliance progress, update audit schedule
- **Quarterly**: Assess policy effectiveness, plan framework updates
- **Annually**: Complete full audit cycle, review all controls, update documentation

### Logging and Monitoring

All security operations are logged:

```python
# Access audit logs
GET /api/security/audits/?enterprise_id=xxx

# Track incident timeline
GET /api/security/incidents/{id}/

# Monitor compliance deadlines
GET /api/security/compliance/overdue/
```

### Backup and Recovery

Security data is critical—ensure proper backup strategy:

```bash
# Backup database including security models
pg_dump -h localhost -U postgres atonixcorp > backup_security_$(date +%Y%m%d).sql

# Restore from backup
psql -h localhost -U postgres atonixcorp < backup_security_20240115.sql
```

---

## Additional Resources

- [API Documentation](./SECURITY_API.md)
- [Security Framework Models](./security_models.py)
- [Security Serializers](./security_serializers.py)
- [Main Platform Security](../../SECURITY.md)
- [Django REST Framework Documentation](https://www.django-rest-framework.org/)

