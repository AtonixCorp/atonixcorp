// Mock security data used as a fallback when backend is unavailable

export const overviewMock = {
  enterprises: [
    {
      id: 'demo-enterprise',
      name: 'Demo Enterprise',
      security: {
        policy_active: true,
        policy_id: null,
        controls: { total: 120, verified: 95, percentage: 79.1667 },
        incidents: { active: 3, critical: 1, high: 1 },
        audits: { upcoming: 1, recent: 2 },
        compliance_score: 82.5,
      },
    },
  ],
  summary: {
    total_enterprises: 1,
    policies_active: 1,
    controls_total: 120,
    controls_verified: 95,
    active_incidents: 3,
    upcoming_audits: 1,
    compliance_score: 82.5,
  },
};

export const complianceMock = {
  enterprise_id: 'demo-enterprise',
  frameworks: [
    {
      framework: 'NIST CSF',
      total: 40,
      completed: 32,
      in_progress: 6,
      not_started: 2,
      compliance_percentage: 80,
      items: [],
    },
    {
      framework: 'ISO 27001',
      total: 30,
      completed: 26,
      in_progress: 3,
      not_started: 1,
      compliance_percentage: 86.67,
      items: [],
    },
  ],
  overall_compliance: 83.34,
};

export const incidentsMock = {
  total: 3,
  by_severity: { critical: 1, high: 1, medium: 1, low: 0 },
  by_status: { reported: 1, investigating: 1, contained: 1, resolved: 0 },
  mttr_hours: 12,
  active_incidents: 3,
  recent_incidents: [
    {
      id: 'inc-1',
      title: 'Unauthorized access attempt',
      severity: 'critical',
      status: 'investigating',
      reported_at: new Date().toISOString(),
      resolved_at: null,
      systems_affected: ['web', 'api'],
    },
    {
      id: 'inc-2',
      title: 'Suspicious process on host',
      severity: 'high',
      status: 'reported',
      reported_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      resolved_at: null,
      systems_affected: ['db'],
    },
  ],
};

export const auditsMock = {
  upcoming: [
    {
      id: 'audit-1',
      title: 'Quarterly security audit',
      type: 'internal',
      scheduled_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
      status: 'scheduled',
    },
  ],
  recent: [
    {
      id: 'audit-2',
      title: 'Pen test - infra',
      type: 'external',
      completed_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
      status: 'completed',
      findings: { total: 3, critical: 0, high: 1, medium: 2, low: 0 },
    },
  ],
  summary: { scheduled: 1, completed_this_year: 2, avg_findings_per_audit: 1.5 },
};

export default {
  overviewMock,
  complianceMock,
  incidentsMock,
  auditsMock,
};
