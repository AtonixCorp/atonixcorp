# Enterprise Security Management API

Comprehensive REST API for managing enterprise security policies, compliance tracking, audits, and incident response.

## Overview

The Enterprise Security Management API provides a complete suite of endpoints for:
- **Security Policies**: Configure and manage enterprise security policies
- **Security Controls**: Track implementation of security frameworks (NIST, ISO 27001, CIS, etc.)
- **Hardening Checklists**: System-specific security checklists (Linux, Windows, Containers, Kubernetes, etc.)
- **Security Audits**: Schedule, conduct, and track security audits
- **Incident Management**: Report and track security incidents
- **Compliance Tracking**: Monitor compliance with security requirements

## Authentication

All endpoints require `IsAuthenticated` permission. Include the authentication token in request headers:

```
Authorization: Bearer <your-token>
```

## Base URL

```
/api/security/
```

---

## Endpoints

### Security Frameworks

Reference data for security compliance frameworks.

#### List Frameworks
```
GET /api/security/frameworks/
```

**Query Parameters:**
- None

**Response:**
```json
{
  "count": 8,
  "results": [
    {
      "id": "uuid",
      "name": "nist",
      "display_name": "NIST Cybersecurity Framework",
      "description": "NIST Framework for managing cybersecurity risk",
      "version": "2.0"
    }
  ]
}
```

#### Get Framework by Name
```
GET /api/security/frameworks/by_name/?name=nist
```

**Response:**
```json
{
  "id": "uuid",
  "name": "nist",
  "display_name": "NIST Cybersecurity Framework",
  "description": "NIST Framework for managing cybersecurity risk",
  "version": "2.0"
}
```

---

### Security Policies

Manage enterprise-wide security policies and configurations.

#### List Policies
```
GET /api/security/policies/
```

**Query Parameters:**
- `enterprise` - Filter by enterprise ID
- `primary_framework` - Filter by framework
- `ordering` - `created_at`, `updated_at`, `-updated_at`

**Response:**
```json
{
  "count": 1,
  "results": [
    {
      "id": "uuid",
      "enterprise": "enterprise-uuid",
      "mfa_required": true,
      "mfa_grace_period_days": 30,
      "require_hardware_keys": false,
      "password_min_length": 16,
      "password_require_uppercase": true,
      "password_require_lowercase": true,
      "password_require_numbers": true,
      "password_require_special_chars": true,
      "password_expiry_days": 90,
      "password_history_count": 12,
      "session_timeout_minutes": 30,
      "session_concurrent_limit": 5,
      "require_vpn_for_admin": true,
      "encryption_at_rest": true,
      "encryption_algorithm": "AES-256",
      "tls_minimum_version": "1.3",
      "enable_audit_logging": true,
      "audit_log_retention_days": 365,
      "log_all_access": true,
      "log_all_changes": true,
      "enforce_least_privilege": true,
      "require_approval_for_privileged_access": true,
      "privileged_access_approval_timeout_hours": 24,
      "enforce_network_segmentation": true,
      "enforce_zero_trust": true,
      "require_vpn_for_remote_access": true,
      "enable_vuln_scanning": true,
      "vuln_scan_frequency_days": 7,
      "auto_patch_critical": true,
      "patch_window_hours": 4,
      "enable_backups": true,
      "backup_frequency_hours": 24,
      "backup_retention_days": 365,
      "rto_hours": 4,
      "rpo_minutes": 60,
      "primary_framework": "framework-uuid",
      "frameworks": ["framework-uuid-list"],
      "annual_audit_required": true,
      "penetration_testing_frequency_months": 12,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Create Policy
```
POST /api/security/policies/
```

**Request Body:**
```json
{
  "enterprise": "enterprise-uuid",
  "mfa_required": true,
  "password_min_length": 16,
  "password_expiry_days": 90,
  "enable_audit_logging": true,
  "primary_framework": "framework-uuid"
}
```

#### Update Policy
```
PATCH /api/security/policies/{id}/
```

#### Get Compliance Summary
```
GET /api/security/policies/{id}/compliance_summary/
```

**Response:**
```json
{
  "policy_id": "uuid",
  "enterprise": "enterprise-uuid",
  "frameworks": ["NIST", "ISO 27001"],
  "summary": {
    "mfa_enabled": true,
    "encryption_enabled": true,
    "audit_logging": true,
    "backup_enabled": true,
    "vulnerability_scanning": true
  },
  "updated_at": "2024-01-15T10:30:00Z"
}
```

---

### Hardening Checklists

System-specific security hardening checklists.

#### List Checklists
```
GET /api/security/checklists/
```

**Query Parameters:**
- `enterprise` - Filter by enterprise
- `system_type` - `linux`, `windows`, `containers`, `kubernetes`, `database`, `application`, `network`
- `status` - `incomplete`, `in_progress`, `verified`
- `ordering` - `created_at`, `completion_percentage`

**Response:**
```json
{
  "count": 7,
  "results": [
    {
      "id": "uuid",
      "enterprise": "enterprise-uuid",
      "system_type": "linux",
      "name": "Linux Server Security Hardening",
      "description": "Comprehensive hardening checklist for Linux systems",
      "items": [
        {
          "id": "item-1",
          "title": "Disable root login",
          "description": "Disable direct SSH root login",
          "completed": true,
          "priority": "critical",
          "category": "access_control"
        }
      ],
      "status": "in_progress",
      "completion_percentage": 75,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "last_verified_at": "2024-01-10T15:00:00Z",
      "verified_by_username": "security_admin"
    }
  ]
}
```

#### Verify Checklist
```
POST /api/security/checklists/{id}/verify/
```

**Response:** Returns updated checklist with `verified_by` and `last_verified_at` fields set.

---

### Security Controls

Individual security controls mapped to compliance frameworks.

#### List Controls
```
GET /api/security/controls/
```

**Query Parameters:**
- `enterprise` - Filter by enterprise
- `framework` - Filter by framework
- `status` - `not_implemented`, `implemented`, `verified`
- `priority` - `critical`, `high`, `medium`, `low`
- `search` - Search in control_id, name, description
- `ordering` - `created_at`, `priority`

**Response:**
```json
{
  "count": 50,
  "results": [
    {
      "id": "uuid",
      "enterprise": "enterprise-uuid",
      "framework": "framework-uuid",
      "framework_name": "NIST Cybersecurity Framework",
      "control_id": "AC-1",
      "name": "Access Control Policy",
      "description": "Develop and document access control policies",
      "category": "Access Control",
      "status": "verified",
      "priority": "critical",
      "implementation_notes": "Implemented via enterprise security policy",
      "evidence_document": "https://...",
      "test_results": "All tests passed",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "verification_date": "2024-01-10T15:00:00Z",
      "verified_by_username": "security_auditor"
    }
  ]
}
```

#### Get Controls by Framework
```
GET /api/security/controls/by_framework/?framework_id={framework_id}
```

#### Verify Control
```
POST /api/security/controls/{id}/verify/
```

**Response:** Returns updated control with verification information.

---

### Security Audits

Schedule and track security audits.

#### List Audits
```
GET /api/security/audits/
```

**Query Parameters:**
- `enterprise` - Filter by enterprise
- `audit_type` - `internal`, `external`, `penetration_test`, `compliance_audit`
- `status` - `scheduled`, `in_progress`, `completed`, `on_hold`
- `ordering` - `created_at`, `scheduled_date`, `start_date`, `end_date`

**Response:**
```json
{
  "count": 12,
  "results": [
    {
      "id": "uuid",
      "enterprise": "enterprise-uuid",
      "audit_type": "external",
      "title": "2024 Q1 External Security Audit",
      "description": "Full scope security audit by third-party firm",
      "status": "completed",
      "scope": "Full infrastructure and application security",
      "scheduled_date": "2024-01-15T00:00:00Z",
      "start_date": "2024-01-15T09:00:00Z",
      "end_date": "2024-01-17T17:00:00Z",
      "findings_count": 12,
      "critical_findings": 1,
      "high_findings": 3,
      "medium_findings": 5,
      "low_findings": 3,
      "report_document": "https://...",
      "findings_json": {...},
      "conducted_by": "Acme Security Inc.",
      "conducted_by_external": true,
      "remediation_plan": "See attached remediation plan",
      "remediation_deadline": "2024-02-15",
      "created_at": "2024-01-10T00:00:00Z",
      "updated_at": "2024-01-17T18:00:00Z"
    }
  ]
}
```

#### Create Audit
```
POST /api/security/audits/
```

**Request Body:**
```json
{
  "enterprise": "enterprise-uuid",
  "audit_type": "external",
  "title": "2024 Q1 External Security Audit",
  "description": "Full scope security audit",
  "scope": "Full infrastructure",
  "scheduled_date": "2024-03-01T00:00:00Z",
  "conducted_by": "Acme Security Inc.",
  "conducted_by_external": true
}
```

#### Start Audit
```
POST /api/security/audits/{id}/start/
```

**Response:** Updates audit status to `in_progress` and sets `start_date`.

#### Complete Audit
```
POST /api/security/audits/{id}/complete/
```

**Request Body:**
```json
{
  "findings_count": 12,
  "critical_findings": 1,
  "high_findings": 3,
  "medium_findings": 5,
  "low_findings": 3
}
```

#### Get Upcoming Audits
```
GET /api/security/audits/upcoming/?days=30
```

**Query Parameters:**
- `days` - Days ahead to check (default: 30)

---

### Security Incidents

Report and track security incidents.

#### List Incidents
```
GET /api/security/incidents/
```

**Query Parameters:**
- `enterprise` - Filter by enterprise
- `severity` - `critical`, `high`, `medium`, `low`
- `status` - `reported`, `investigating`, `contained`, `resolved`
- `ordering` - `created_at`, `reported_at`, `resolved_at`, `severity`

**Response:**
```json
{
  "count": 8,
  "results": [
    {
      "id": "uuid",
      "enterprise": "enterprise-uuid",
      "title": "Unauthorized API Access Attempt",
      "description": "Multiple failed authentication attempts detected",
      "severity": "high",
      "status": "contained",
      "reported_at": "2024-01-15T14:30:00Z",
      "detected_at": "2024-01-15T14:25:00Z",
      "contained_at": "2024-01-15T15:45:00Z",
      "resolved_at": null,
      "response_team": "Security Operations Center",
      "response_actions": "Blocked IP, reset credentials, reviewed logs",
      "root_cause": "Credential compromise detected from external source",
      "systems_affected": "API Gateway, Authentication Service",
      "data_affected": "User authentication logs",
      "user_count_affected": 0,
      "notification_sent": false,
      "notification_date": null,
      "regulators_notified": false,
      "regulator_notification_date": null,
      "lessons_learned": "Implement rate limiting on auth endpoints",
      "improvements_planned": "Deploy WAF, implement MFA",
      "created_at": "2024-01-15T14:30:00Z",
      "updated_at": "2024-01-15T15:45:00Z"
    }
  ]
}
```

#### Create Incident
```
POST /api/security/incidents/
```

**Request Body:**
```json
{
  "enterprise": "enterprise-uuid",
  "title": "Unauthorized Access Detected",
  "description": "Multiple failed authentication attempts",
  "severity": "high",
  "systems_affected": "API Gateway,Authentication",
  "data_affected": "User authentication logs"
}
```

#### Update Incident Status
```
POST /api/security/incidents/{id}/update_status/
```

**Request Body:**
```json
{
  "status": "investigating"
}
```

**Valid Statuses:** `reported`, `investigating`, `contained`, `resolved`

#### Get Active Incidents
```
GET /api/security/incidents/active/
```

#### Get Incidents by Severity
```
GET /api/security/incidents/by_severity/
```

**Response:**
```json
{
  "critical": 0,
  "high": 2,
  "medium": 1,
  "low": 0
}
```

---

### Compliance Tracking

Monitor compliance with security requirements.

#### List Compliance Items
```
GET /api/security/compliance/
```

**Query Parameters:**
- `enterprise` - Filter by enterprise
- `framework` - Filter by framework
- `status` - `not_started`, `in_progress`, `completed`
- `search` - Search in requirement_name, description
- `ordering` - `created_at`, `deadline`, `status_percentage`

**Response:**
```json
{
  "count": 45,
  "results": [
    {
      "id": "uuid",
      "enterprise": "enterprise-uuid",
      "framework": "framework-uuid",
      "framework_name": "ISO 27001",
      "requirement_name": "Information Security Policy",
      "description": "Establish and maintain comprehensive security policy",
      "section_reference": "A.5.1",
      "status": "completed",
      "status_percentage": 100,
      "deadline": "2024-02-28",
      "completed_date": "2024-02-20",
      "owner": "user-uuid",
      "owner_username": "compliance_officer",
      "evidence_document": "https://...",
      "verification_notes": "Policy approved by board",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-02-20T10:30:00Z"
    }
  ]
}
```

#### Get Overdue Items
```
GET /api/security/compliance/overdue/
```

#### Get Compliance by Framework
```
GET /api/security/compliance/by_framework/?framework_id={framework_id}
```

**Response:**
```json
{
  "framework_id": "uuid",
  "total": 45,
  "completed": 40,
  "in_progress": 4,
  "not_started": 1,
  "overall_percentage": 88.89,
  "items": [...]
}
```

#### Mark as Completed
```
POST /api/security/compliance/{id}/mark_completed/
```

---

## Dashboard Security Endpoints

Specialized endpoints for security dashboard displays.

### Enterprise Security Overview
```
GET /api/dashboard/security/overview/
```

**Response:**
```json
{
  "enterprises": [
    {
      "id": "uuid",
      "name": "Acme Corp",
      "security": {
        "policy_active": true,
        "controls": {
          "total": 50,
          "verified": 45,
          "percentage": 90
        },
        "incidents": {
          "active": 1,
          "critical": 0,
          "high": 1
        },
        "audits": {
          "upcoming": 2,
          "recent": 5
        },
        "compliance_score": 88.5
      }
    }
  ],
  "summary": {
    "total_enterprises": 1,
    "policies_active": 1,
    "controls_total": 50,
    "controls_verified": 45,
    "active_incidents": 1,
    "upcoming_audits": 2,
    "compliance_score": 88.5
  }
}
```

### Compliance Status
```
GET /api/dashboard/security/compliance/?enterprise_id={enterprise_id}
```

### Security Incidents Summary
```
GET /api/dashboard/security/incidents/?enterprise_id={enterprise_id}
```

### Audit Schedule
```
GET /api/dashboard/security/audits/?enterprise_id={enterprise_id}&days=90
```

---

## Error Responses

All endpoints follow standard HTTP status codes:

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

**Error Response Format:**
```json
{
  "error": "Error message",
  "details": "Additional error context"
}
```

---

## Permissions

- **Staff/Admin**: Full access to all enterprises
- **Enterprise Members**: Access only to their enterprise security data
- **Others**: No access (403 Forbidden)

---

## Rate Limiting

API requests are subject to standard rate limiting. Check response headers for rate limit information:
- `X-RateLimit-Limit` - Maximum requests per period
- `X-RateLimit-Remaining` - Requests remaining in current period
- `X-RateLimit-Reset` - Unix timestamp when limit resets

---

## Examples

### Example: Complete Security Audit Workflow

1. **Create an audit**
```bash
curl -X POST /api/security/audits/ \
  -H "Authorization: Bearer token" \
  -d '{"enterprise":"uuid","audit_type":"external","title":"Q1 Audit"}'
```

2. **Start the audit**
```bash
curl -X POST /api/security/audits/{id}/start/ \
  -H "Authorization: Bearer token"
```

3. **Complete with findings**
```bash
curl -X POST /api/security/audits/{id}/complete/ \
  -H "Authorization: Bearer token" \
  -d '{"findings_count":5,"critical_findings":1}'
```

4. **View audit details**
```bash
curl /api/security/audits/{id}/ \
  -H "Authorization: Bearer token"
```

---

## Support

For API support and documentation updates, contact the platform team or visit the admin dashboard.
