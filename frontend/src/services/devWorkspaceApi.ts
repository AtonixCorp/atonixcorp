// AtonixCorp Cloud – Developer Workspace API Client

import client from './apiClient'

const BASE = '/api/services/dev-workspaces'

// ─── Types ────────────────────────────────────────────────────────────────────

export type DevWorkspaceStatus = 'stopped' | 'starting' | 'running' | 'stopping' | 'error'

export interface DevWorkspace {
  id: number
  workspace_id: string
  display_name: string
  owner: string
  status: DevWorkspaceStatus
  region: string
  image: string
  ide: string
  editor_url: string
  cpu_percent: number
  ram_percent: number
  containers: number
  volumes: number
  terminal_ws_url: string
  started_at: string | null
  created_at: string
  updated_at: string
  // Setup wizard connections
  connected_project_id: string
  connected_project_name: string
  connected_env_id: string
  connected_env_name: string
  connected_group_id: string
  connected_group_name: string
  connected_container_ids: string[]
  pipeline_last_run: string | null
  pipeline_last_success: string | null
  pipeline_last_failure: string | null
  pipeline_last_status: string
  setup_metadata: Record<string, unknown>
}

// ─── Setup Wizard types ─────────────────────────────────────────────────────

export type SetupAction = 'create' | 'connect' | 'skip'

export interface WorkspaceSetupPayload {
  // Project
  project_action?: SetupAction
  project_name?: string
  project_description?: string
  project_repo_option?: 'empty' | 'github' | 'gitlab' | 'bitbucket'
  project_repo_url?: string
  project_auto_cicd?: boolean
  project_id?: string
  project_auto_sync?: boolean
  project_auto_pipeline?: boolean
  // Container
  container_action?: SetupAction
  container_name?: string
  container_type?: 'app' | 'worker' | 'cron' | 'api' | 'custom'
  container_runtime_size?: 's' | 'm' | 'l' | 'xl'
  container_scaling_mode?: 'manual' | 'auto'
  container_attach_project?: boolean
  container_connect_repo?: boolean
  container_connect_pipeline?: boolean
  container_id?: string
  container_attach_env?: boolean
  // Environment
  environment_action?: SetupAction
  environment_name?: string
  environment_type?: 'dev' | 'stage' | 'prod'
  environment_region?: string
  environment_auto_deploy?: boolean
  environment_id?: string
  environment_sync_vars?: boolean
  environment_sync_secrets?: boolean
  // Group
  group_action?: SetupAction
  group_name?: string
  group_description?: string
  group_members?: string[]
  group_id?: string
  group_role?: 'owner' | 'maintainer' | 'developer' | 'viewer'
  // Pipeline
  pipeline_id?: string
  pipeline_auto_trigger?: boolean
}

export interface CreateDevWorkspacePayload {
  workspace_id: string
  display_name: string
  region?: string
  image?: string
  ide?: string
}

// ─── API Functions ─────────────────────────────────────────────────────────────

/** List all dev workspaces for the current user */
export async function listDevWorkspaces(): Promise<DevWorkspace[]> {
  const { data } = await client.get<DevWorkspace[] | { results: DevWorkspace[] }>(BASE + '/')
  return Array.isArray(data) ? data : (data as any).results ?? []
}

/** Get a single workspace by workspace_id */
export async function getDevWorkspace(workspaceId: string): Promise<DevWorkspace> {
  const { data } = await client.get<DevWorkspace>(`${BASE}/${workspaceId}/`)
  return data
}

/** Create a new developer workspace */
export async function createDevWorkspace(payload: CreateDevWorkspacePayload): Promise<DevWorkspace> {
  const { data } = await client.post<DevWorkspace>(BASE + '/', payload)
  return data
}

/** Delete a stopped workspace */
export async function deleteDevWorkspace(workspaceId: string): Promise<void> {
  await client.delete(`${BASE}/${workspaceId}/`)
}

/** Start a workspace — returns the updated workspace with editor_url populated */
export async function startDevWorkspace(workspaceId: string): Promise<DevWorkspace> {
  const { data } = await client.post<DevWorkspace>(`${BASE}/${workspaceId}/start/`)
  return data
}

/** Stop a running workspace */
export async function stopDevWorkspace(workspaceId: string): Promise<DevWorkspace> {
  const { data } = await client.post<DevWorkspace>(`${BASE}/${workspaceId}/stop/`)
  return data
}

/** Restart a workspace (stop + start in one call) */
export async function restartDevWorkspace(workspaceId: string): Promise<DevWorkspace> {
  const { data } = await client.post<DevWorkspace>(`${BASE}/${workspaceId}/restart/`)
  return data
}

/** Partial-update workspace display name / image / ide / region */
export async function updateDevWorkspace(
  workspaceId: string,
  payload: Partial<Pick<DevWorkspace, 'display_name' | 'image' | 'ide' | 'region'>>,
): Promise<DevWorkspace> {
  const { data } = await client.patch<DevWorkspace>(`${BASE}/${workspaceId}/`, payload)
  return data
}

/** Build the full WebSocket URL from the backend's terminal_ws_url path */
export function buildTerminalWsUrl(terminalWsPath: string): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const envHost = typeof process !== 'undefined' ? (process.env as any).REACT_APP_WS_HOST : undefined
  const host = envHost ?? window.location.host
  return `${protocol}//${host}${terminalWsPath}`
}

/**
 * Submit the unified workspace setup payload.
 * POST /api/services/dev-workspaces/<workspace_id>/setup/
 * Returns the updated workspace with all connections persisted.
 */
export async function workspaceSetup(
  workspaceId: string,
  payload: WorkspaceSetupPayload,
): Promise<DevWorkspace> {
  const { data } = await client.post<DevWorkspace>(
    `${BASE}/${workspaceId}/setup/`,
    payload,
  )
  return data
}
