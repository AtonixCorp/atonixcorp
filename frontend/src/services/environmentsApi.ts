/**
 * Environments API Service
 * ─────────────────────────
 * CRUD for /api/services/pipelines/environments/
 */

import client from './apiClient';

const BASE = '/api/services/pipelines/environments';

// ─── Types ────────────────────────────────────────────────────────────────────

export type DeploymentStrategy = 'rolling' | 'blue_green' | 'canary' | 'recreate';

export interface ApiEnvironment {
  id:                  string;
  name:                string;
  region:              string;
  description:         string;
  is_protected:        boolean;
  auto_deploy:         boolean;
  deployment_strategy: DeploymentStrategy;
  require_approval:    boolean;
  notify_email:        string;
  owner:               number | null;
  owner_username:      string | null;
  has_active_processes: boolean;
  project:             string;
  created_at:          string;
  updated_at:          string;
}

export interface EnvironmentSettingsPayload {
  name?:                string;
  region?:              string;
  description?:         string;
  is_protected?:        boolean;
  auto_deploy?:         boolean;
  deployment_strategy?: DeploymentStrategy;
  require_approval?:    boolean;
  notify_email?:        string;
}

export interface CreateEnvironmentPayload {
  id?:                 string;
  name:                string;
  region:              string;
  description?:        string;
  is_protected?:       boolean;
  auto_deploy?:        boolean;
  deployment_strategy?: DeploymentStrategy;
  require_approval?:   boolean;
  notify_email?:       string;
  project:             string;
}

// ─── API Calls ────────────────────────────────────────────────────────────────

export const listEnvironments = (projectId?: string): Promise<ApiEnvironment[]> =>
  client
    .get<{ count: number; results: ApiEnvironment[] } | ApiEnvironment[]>(
      `${BASE}/`,
      { params: projectId ? { project_id: projectId } : {} },
    )
    .then(r => {
      const d = r.data;
      return Array.isArray(d) ? d : (d as any).results ?? [];
    })
    .catch(() => []);

export const getEnvironment = (id: string): Promise<ApiEnvironment | null> =>
  client.get<ApiEnvironment>(`${BASE}/${id}/`)
    .then(r => r.data)
    .catch(() => null);

export const updateEnvironment = (
  id: string,
  payload: EnvironmentSettingsPayload,
): Promise<ApiEnvironment | null> =>
  client.patch<ApiEnvironment>(`${BASE}/${id}/`, payload)
    .then(r => r.data)
    .catch(() => null);

/** Returns null on success, or an error message string if blocked. */
export const deleteEnvironment = (id: string): Promise<null | string> =>
  client.delete(`${BASE}/${id}/`)
    .then(() => null)
    .catch(err => {
      const detail = err?.response?.data?.detail;
      return typeof detail === 'string' ? detail : 'Failed to delete environment.';
    });

export const createEnvironment = (
  payload: CreateEnvironmentPayload,
): Promise<ApiEnvironment> =>
  client.post<ApiEnvironment>(`${BASE}/`, payload).then(r => r.data);
