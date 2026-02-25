/**
 * Monitoring Hub API Service
 * ──────────────────────────
 * Wraps all /api/services/monitoring/* and developer-facing monitoring endpoints.
 */

import client from './apiClient';

const BASE = '/api/services';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DevOverview {
  pipelines: {
    total: number;
    running: number;
    failed_24h: number;
    runs_24h: number;
    success_rate: number;
  };
  deployments: {
    total_24h: number;
    failed_24h: number;
    success_24h: number;
    success_rate: number;
  };
  services: {
    total: number;
    healthy: number;
    degraded: number;
    down: number;
  };
  alerts: {
    active: number;
    critical: number;
  };
  incidents: {
    open: number;
    total_rules: number;
  };
}

export interface PipelineHealth {
  project_id: string;
  project_name: string;
  total_runs: number;
  success: number;
  failed: number;
  running: number;
  cancelled: number;
  success_rate: number;
  recent_runs: {
    id: string;
    pipeline_name: string;
    branch: string;
    status: string;
    triggered_by: string;
    started_at: string;
    finished_at: string | null;
  }[];
}

export interface DeploymentHealth {
  container_id: string;
  container_name: string;
  image: string;
  total_deploys: number;
  success: number;
  failed: number;
  running: number;
  success_rate: number;
  recent_deploys: {
    id: string;
    image_tag: string;
    trigger: string;
    status: string;
    started_at: string;
    ended_at: string | null;
  }[];
}

export interface ProjectHealth {
  project_id: string;
  project_name: string;
  health_score: number;
  health_status: 'healthy' | 'degraded' | 'critical';
  pipelines_7d: number;
  pipeline_success: number;
  pipeline_failed: number;
  deploys_7d: number;
  deploy_success: number;
  deploy_failed: number;
}

export interface ActivityEvent {
  id: string | number;
  event_type: string;
  actor: string;
  project_id: string;
  project_name: string;
  resource_type: string;
  resource_id: string;
  resource_name: string;
  environment: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  created_at: string;
}

export interface ServiceHealth {
  resource_id: string;
  name: string;
  status: 'operational' | 'degraded' | 'partial_outage' | 'major_outage' | 'maintenance';
  uptime_percent: number;
  latency_ms: number;
  error_rate: number;
  region: string;
  last_checked: string;
}

export interface MonitoringAlert {
  id: number;
  resource_id: string;
  rule_name: string;
  resource_name: string;
  metric_type: string;
  value: number;
  threshold: number;
  severity: string;
  status: string;
  fired_at: string;
  message: string;
}

export interface Incident {
  id: number;
  resource_id: string;
  service: string;
  severity: string;
  status: string;
  title: string;
  summary: string;
  detected_at: string;
  resolved_at: string | null;
  duration_minutes: number;
  impact: string;
}

export interface AlertRule {
  id: number;
  resource_id: string;
  name: string;
  resource_name: string;
  metric_type: string;
  condition: string;
  threshold: number;
  window_minutes: number;
  severity: string;
  enabled: boolean;
  cooldown_minutes: number;
  description: string;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export const monitoringApi = {
  // ── Developer Overview ───────────────────────────────────────────────────
  getDevOverview: () =>
    client.get<DevOverview>(`${BASE}/monitoring/dev/`),

  getPipelineHealth: (params?: { hours?: number; project_id?: string }) =>
    client.get<{ count: number; results: PipelineHealth[] }>(
      `${BASE}/monitoring/dev/pipeline-health/`, { params }
    ),

  getDeploymentHealth: (params?: { hours?: number; project_id?: string }) =>
    client.get<{ count: number; results: DeploymentHealth[] }>(
      `${BASE}/monitoring/dev/deployment-health/`, { params }
    ),

  getProjectHealth: () =>
    client.get<{ count: number; results: ProjectHealth[] }>(
      `${BASE}/monitoring/dev/project-health/`
    ),

  getActivity: (params?: {
    event_type?: string;
    project_id?: string;
    hours?: number;
    limit?: number;
  }) =>
    client.get<{ count: number; results: ActivityEvent[] }>(
      `${BASE}/monitoring/dev/activity/`, { params }
    ),

  getServiceHealth: () =>
    client.get<{ count: number; results: ServiceHealth[] }>(
      `${BASE}/monitoring/dev/service-health/`
    ),

  // ── Alerts & Incidents ───────────────────────────────────────────────────
  getAlerts: (params?: { status?: string; severity?: string }) =>
    client.get<{ count: number; results: MonitoringAlert[] }>(
      `${BASE}/alerts/`, { params }
    ),

  resolveAlert: (id: number) =>
    client.post(`${BASE}/alerts/${id}/resolve/`),

  silenceAlert: (id: number) =>
    client.post(`${BASE}/alerts/${id}/silence/`),

  getAlertRules: () =>
    client.get<{ count: number; results: AlertRule[] }>(`${BASE}/alert-rules/`),

  createAlertRule: (payload: Partial<AlertRule>) =>
    client.post<AlertRule>(`${BASE}/alert-rules/`, payload),

  deleteAlertRule: (id: number) =>
    client.delete(`${BASE}/alert-rules/${id}/`),

  getIncidents: (params?: { status?: string; severity?: string }) =>
    client.get<{ count: number; results: Incident[] }>(
      `${BASE}/incidents/`, { params }
    ),

  createIncident: (payload: { service: string; title: string; severity: string; summary?: string }) =>
    client.post<Incident>(`${BASE}/incidents/`, payload),

  updateIncidentStatus: (id: number, status: string, message?: string) =>
    client.post(`${BASE}/incidents/${id}/update_status/`, { status, message }),

  // ── Metrics ─────────────────────────────────────────────────────────────
  getMetrics: (params: { resource?: string; metric?: string; hours?: number }) =>
    client.get(`${BASE}/metrics/`, { params }),

  // ── Logs ────────────────────────────────────────────────────────────────
  getLogs: (params?: { service?: string; search?: string; hours?: number; limit?: number }) =>
    client.get(`${BASE}/logs/`, { params }),
};
