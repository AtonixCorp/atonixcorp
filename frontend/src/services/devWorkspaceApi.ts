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

/** Build the full WebSocket URL from the backend's terminal_ws_url path */
export function buildTerminalWsUrl(terminalWsPath: string): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const envHost = typeof process !== 'undefined' ? (process.env as any).REACT_APP_WS_HOST : undefined
  const host = envHost ?? window.location.host
  return `${protocol}//${host}${terminalWsPath}`
}
