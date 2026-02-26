// AtonixCorp Cloud – Group Platform API Client

import client from './apiClient'

const BASE = '/api/services/groups'

function unwrap<T>(data: unknown): T[] {
  return Array.isArray(data) ? (data as T[]) : ((data as any)?.results ?? []) as T[]
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type GroupVisibility = 'public' | 'internal' | 'private'
export type GroupType = 'developer' | 'production' | 'marketing' | 'data' | 'custom'
export type GroupRole = 'owner' | 'admin' | 'maintainer' | 'developer' | 'viewer'
export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'expired'
export type ImportSource = 'github' | 'gitlab' | 'bitbucket' | 'atonix'

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

// ─── Legacy compat export (kept for any existing imports) ─────────────────────
export const groupsApi = { listGroups, getGroup, createGroup, updateGroup, deleteGroup }
export default groupsApi
