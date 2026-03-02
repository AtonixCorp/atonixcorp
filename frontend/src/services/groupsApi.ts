// AtonixCorp Cloud – Group Platform API Client

import client from './apiClient'

const BASE = '/api/services/groups'

function unwrap<T>(data: unknown): T[] {
  return Array.isArray(data) ? (data as T[]) : ((data as any)?.results ?? []) as T[]
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type GroupVisibility = 'public' | 'internal' | 'private'
export type GroupType = 'developer' | 'enterprise' | 'system' | 'production' | 'marketing' | 'data' | 'custom'
export type GroupRole =
  | 'owner'
  | 'admin'
  | 'architect'
  | 'devops_engineer'
  | 'developer'
  | 'data_scientist'
  | 'finance'
  | 'viewer'
export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'expired'
export type ImportSource = 'github' | 'gitlab' | 'bitbucket' | 'atonix'

// Permission keys mirror the backend PERMISSION_MATRIX
export type GroupPermissionKey =
  | 'group.manage_members' | 'group.manage_settings' | 'group.delete' | 'group.transfer'
  | 'group.view_billing'  | 'group.manage_billing'
  | 'project.create' | 'project.edit' | 'project.delete' | 'project.view'
  | 'pipeline.run' | 'pipeline.cancel' | 'pipeline.create' | 'pipeline.edit'
  | 'pipeline.delete' | 'pipeline.view' | 'pipeline.approve'
  | 'environment.create' | 'environment.edit' | 'environment.promote'
  | 'environment.deploy' | 'environment.delete' | 'environment.view'
  | 'container.build' | 'container.push' | 'container.pull' | 'container.delete' | 'container.view'
  | 'kubernetes.deploy' | 'kubernetes.scale' | 'kubernetes.restart' | 'kubernetes.delete' | 'kubernetes.view'
  | 'secret.create' | 'secret.edit' | 'secret.view' | 'secret.delete'
  | 'env_var.create' | 'env_var.edit' | 'env_var.view' | 'env_var.delete'
  | 'deployment.trigger' | 'deployment.rollback' | 'deployment.approve' | 'deployment.view'
  | 'metrics.view' | 'logs.view'

export type GroupPermissionSet = Record<GroupPermissionKey, boolean>

export interface GroupPermissionsResponse {
  group_id:       string
  my_role:        GroupRole | null
  my_permissions: GroupPermissionSet
  /** Present only for owner / admin */
  role_matrix?:   Record<GroupRole, GroupPermissionSet>
}

export type ResourceType =
  | 'project' | 'pipeline' | 'environment' | 'container'
  | 'k8s_cluster' | 'secret' | 'env_var' | 'deployment'
  | 'metric_stream' | 'log_stream' | 'api_key' | 'storage' | 'domain'

export type ConfigFileType =
  | 'dockerfile' | 'pipeline_yaml' | 'k8s_manifest' | 'helm_chart'
  | 'terraform' | 'env_template' | 'buildpack' | 'ansible'
  | 'compose' | 'config_generic'

export interface GroupResources {
  projects?: boolean
  pipelines?: boolean
  runners?: boolean
  environments?: boolean
  deployments?: boolean
  observability?: boolean
  api_keys?: boolean
  secrets?: boolean
  storage_buckets?: boolean
  domains?: boolean
  billing?: boolean
}

export interface UserSummary {
  id: number
  username: string
  email: string
  display_name: string
}

export interface Group {
  id: string
  name: string
  handle: string
  description: string
  visibility: GroupVisibility
  group_type: GroupType
  avatar_url: string
  resources: GroupResources
  member_count: number
  project_count: number
  pipeline_count: number
  import_source: ImportSource | ''
  import_external_id: string
  owner: UserSummary
  my_role: GroupRole | null
  created_at: string
  updated_at: string
}

export interface GroupCreatePayload {
  name: string
  handle: string
  description?: string
  visibility: GroupVisibility
  group_type: GroupType
  avatar_url?: string
  resources?: GroupResources
}

export interface GroupUpdatePayload {
  name?: string
  description?: string
  visibility?: GroupVisibility
  group_type?: GroupType
  avatar_url?: string
  resources?: GroupResources
}

export interface GroupMember {
  id: string
  group: string
  user: UserSummary
  role: GroupRole
  invited_by: UserSummary | null
  created_at: string
}

export interface GroupInvitation {
  id: string
  group: string
  email: string
  role: GroupRole
  status: InviteStatus
  invited_by: UserSummary | null
  expires_at: string | null
  accepted_at: string | null
  created_at: string
}

export interface GroupAccessToken {
  id: string
  name: string
  scopes: string[]
  token_prefix: string
  expires_at: string | null
  last_used_at: string | null
  revoked: boolean
  created_by: UserSummary | null
  created_at: string
}

export interface GroupAuditLog {
  id: string
  actor: string
  action: string
  target: string
  detail: Record<string, unknown>
  created_at: string
}

// ── Resource Registry ─────────────────────────────────────────────────────────

export interface GroupRegisteredResource {
  id: string
  resource_type: ResourceType
  resource_id: string
  resource_name: string
  resource_slug: string
  status: 'active' | 'inactive' | 'error' | 'pending'
  region: string
  environment: string
  tags: string[]
  metadata: Record<string, unknown>
  discovered_at: string | null
  created_at: string
}

export interface GroupRegisteredResourceCreatePayload {
  resource_type: ResourceType
  resource_id: string
  resource_name: string
  resource_slug?: string
  status?: 'active' | 'inactive' | 'pending'
  region?: string
  environment?: string
  tags?: string[]
  metadata?: Record<string, unknown>
}

// ── Config Registry ───────────────────────────────────────────────────────────

export interface GroupConfigFile {
  id: string
  project_id: string
  file_type: ConfigFileType
  file_name: string
  file_path: string
  repo_url: string
  branch: string
  content_preview: string
  sha: string
  last_indexed_at: string | null
  tags: string[]
  created_at: string
}

export interface GroupConfigFileCreatePayload {
  project_id?: string
  file_type: ConfigFileType
  file_name: string
  file_path: string
  repo_url?: string
  branch?: string
  content_preview?: string
  sha?: string
  tags?: string[]
}

// ── Resource Bundle ───────────────────────────────────────────────────────────

export interface GroupResourceItem {
  id: string
  name: string
  slug: string
  status: string
  region: string
  environment: string
  tags: string[]
  metadata: Record<string, unknown>
  created_at: string | null
}

export interface GroupResourceBundle {
  projects:       GroupResourceItem[]
  pipelines:      GroupResourceItem[]
  environments:   GroupResourceItem[]
  containers:     GroupResourceItem[]
  k8s_clusters:   GroupResourceItem[]
  secrets:        GroupResourceItem[]
  env_vars:       GroupResourceItem[]
  deployments:    GroupResourceItem[]
  metric_streams: GroupResourceItem[]
  log_streams:    GroupResourceItem[]
  api_keys:       GroupResourceItem[]
  config_files:   GroupConfigFile[]
  resource_counts: Record<string, number>
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

export interface GroupSidebarSection {
  id: string
  label: string
  count: number
  badge: string
  status: string
}

export interface GroupSidebarData {
  group_id: string
  group_name: string
  group_handle: string
  group_type: GroupType | ''
  sections: GroupSidebarSection[]
  workspace_connected?: boolean
}

// ── Workspace connection ──────────────────────────────────────────────────────

export interface GroupWorkspaceSummary {
  workspace_id: string
  display_name: string
  status: string
  region: string
  owner: string
  created_at: string
  started_at: string | null
}

// ── Discovery ────────────────────────────────────────────────────────────────

export interface GroupDiscoveryResult {
  status: string
  group: string
  newly_registered: number
  resources: GroupRegisteredResource[]
}

// ─── Group CRUD ───────────────────────────────────────────────────────────────

export async function listGroups(): Promise<Group[]> {
  const { data } = await client.get(`${BASE}/`)
  return unwrap<Group>(data)
}

export async function getGroup(id: string): Promise<Group> {
  const { data } = await client.get(`${BASE}/${id}/`)
  return data
}

export async function createGroup(payload: GroupCreatePayload): Promise<Group> {
  const { data } = await client.post(`${BASE}/`, payload)
  return data
}

export async function updateGroup(id: string, payload: GroupUpdatePayload): Promise<Group> {
  const { data } = await client.patch(`${BASE}/${id}/`, payload)
  return data
}

export async function deleteGroup(id: string): Promise<void> {
  await client.delete(`${BASE}/${id}/`)
}

// ─── Members ──────────────────────────────────────────────────────────────────

export async function listMembers(groupId: string): Promise<GroupMember[]> {
  const { data } = await client.get(`${BASE}/${groupId}/members/`)
  return unwrap<GroupMember>(data)
}

export async function addMember(groupId: string, userId: number, role: GroupRole): Promise<GroupMember> {
  const { data } = await client.post(`${BASE}/${groupId}/members/add/`, { user_id: userId, role })
  return data
}

export async function removeMember(groupId: string, memberId: string): Promise<void> {
  await client.delete(`${BASE}/${groupId}/members/${memberId}/`)
}

export async function updateMemberRole(groupId: string, memberId: string, role: GroupRole): Promise<GroupMember> {
  const { data } = await client.patch(`${BASE}/${groupId}/members/${memberId}/role/`, { role })
  return data
}

export async function leaveGroup(groupId: string): Promise<void> {
  await client.post(`${BASE}/${groupId}/leave/`)
}

export async function transferOwnership(groupId: string, userId: number): Promise<void> {
  await client.post(`${BASE}/${groupId}/transfer/`, { user_id: userId })
}

// ─── Invitations ─────────────────────────────────────────────────────────────

export async function listInvitations(groupId: string): Promise<GroupInvitation[]> {
  const { data } = await client.get(`${BASE}/${groupId}/invite/`)
  return unwrap<GroupInvitation>(data)
}

export async function inviteToGroup(groupId: string, email: string, role: GroupRole): Promise<GroupInvitation> {
  const { data } = await client.post(`${BASE}/${groupId}/invite/`, { email, role })
  return data
}

export async function acceptInvitation(groupId: string, inviteId: string): Promise<GroupMember> {
  const { data } = await client.post(`${BASE}/${groupId}/invitations/${inviteId}/accept/`)
  return data
}

export async function declineInvitation(groupId: string, inviteId: string): Promise<void> {
  await client.post(`${BASE}/${groupId}/invitations/${inviteId}/decline/`)
}

export async function cancelInvitation(groupId: string, inviteId: string): Promise<void> {
  await client.delete(`${BASE}/${groupId}/invitations/${inviteId}/cancel/`)
}

// ─── Permissions ─────────────────────────────────────────────────────────────

export async function getGroupPermissions(groupId: string): Promise<GroupPermissionsResponse> {
  const { data } = await client.get(`${BASE}/${groupId}/permissions/`)
  return data as GroupPermissionsResponse
}

// ─── Access Tokens ────────────────────────────────────────────────────────────

export async function listTokens(groupId: string): Promise<GroupAccessToken[]> {
  const { data } = await client.get(`${BASE}/${groupId}/tokens/`)
  return unwrap<GroupAccessToken>(data)
}

export async function createToken(
  groupId: string,
  payload: Pick<GroupAccessToken, 'name' | 'scopes' | 'expires_at'>,
): Promise<GroupAccessToken> {
  const { data } = await client.post(`${BASE}/${groupId}/tokens/`, payload)
  return data
}

export async function revokeToken(groupId: string, tokenId: string): Promise<void> {
  await client.delete(`${BASE}/${groupId}/tokens/${tokenId}/`)
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export async function listAuditLogs(groupId: string): Promise<GroupAuditLog[]> {
  const { data } = await client.get(`${BASE}/${groupId}/audit/`)
  return unwrap<GroupAuditLog>(data)
}

// ─── Group Projects ───────────────────────────────────────────────────────────

export type ProjectStatus = 'active' | 'in-progress' | 'completed' | 'archived'
export type BuildStatus   = 'passing' | 'failing'   | 'pending'
export type ProjectLang   = 'TypeScript' | 'Python' | 'Go' | 'Rust' | 'Java' | 'HCL'

export interface GroupProject {
  id:          string
  name:        string
  description: string
  status:      ProjectStatus
  language:    ProjectLang
  branch:      string
  progress:    number
  open_issues: number
  last_build:  BuildStatus
  updated_at:  string
  tags:        string[]
  starred:     boolean
}

export interface GroupProjectCreatePayload {
  name:         string
  description?: string
  visibility?:  'public' | 'internal' | 'private'
  language?:    ProjectLang
}

export async function listGroupProjects(groupId: string): Promise<GroupProject[]> {
  try {
    const { data } = await client.get(`${BASE}/${groupId}/projects/`)
    return unwrap<GroupProject>(data)
  } catch {
    return []
  }
}

export async function createGroupProject(
  groupId: string,
  payload: GroupProjectCreatePayload,
): Promise<GroupProject | null> {
  try {
    const { data } = await client.post(`${BASE}/${groupId}/projects/`, payload)
    return data as GroupProject
  } catch {
    return null
  }
}

// ─── Resource Registry ────────────────────────────────────────────────────────

export async function getGroupResources(groupId: string): Promise<GroupResourceBundle> {
  const { data } = await client.get(`${BASE}/${groupId}/resources/`)
  return data as GroupResourceBundle
}

export async function registerGroupResource(
  groupId: string,
  payload: GroupRegisteredResourceCreatePayload,
): Promise<GroupRegisteredResource> {
  const { data } = await client.post(`${BASE}/${groupId}/resources/`, payload)
  return data as GroupRegisteredResource
}

export async function removeGroupResource(groupId: string, registryId: string): Promise<void> {
  await client.delete(`${BASE}/${groupId}/resources/${registryId}/`)
}

// ─── Config Files ─────────────────────────────────────────────────────────────

export async function listGroupConfigFiles(groupId: string): Promise<GroupConfigFile[]> {
  const { data } = await client.get(`${BASE}/${groupId}/config-files/`)
  return unwrap<GroupConfigFile>(data)
}

export async function registerGroupConfigFile(
  groupId: string,
  payload: GroupConfigFileCreatePayload,
): Promise<GroupConfigFile> {
  const { data } = await client.post(`${BASE}/${groupId}/config-files/`, payload)
  return data as GroupConfigFile
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export async function getGroupSidebar(groupId: string): Promise<GroupSidebarData> {
  const { data } = await client.get(`${BASE}/${groupId}/sidebar/`)
  return data as GroupSidebarData
}

// ─── Workspaces ───────────────────────────────────────────────────────────────

export async function listGroupWorkspaces(groupId: string): Promise<GroupWorkspaceSummary[]> {
  const { data } = await client.get(`${BASE}/${groupId}/workspaces/`)
  return unwrap<GroupWorkspaceSummary>(data)
}

// ─── Discovery ────────────────────────────────────────────────────────────────

export async function triggerGroupDiscovery(groupId: string): Promise<GroupDiscoveryResult> {
  const { data } = await client.post(`${BASE}/${groupId}/discover/`)
  return data as GroupDiscoveryResult
}

// ─── Legacy compat export (kept for any existing imports) ─────────────────────
export const groupsApi = { listGroups, getGroup, createGroup, updateGroup, deleteGroup }
export default groupsApi

