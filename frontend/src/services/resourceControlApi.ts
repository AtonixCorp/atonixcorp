// AtonixCorp Cloud – Resource Control Center API Client

import client from './apiClient'

const BASE = '/api/services/resources'

function unwrap<T>(data: unknown): T[] {
  return Array.isArray(data) ? (data as T[]) : ((data as any)?.results ?? []) as T[]
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type ResourceStatus   = 'running' | 'failed' | 'degraded' | 'pending' | 'stopped' | 'unknown'
export type ResourceType     =
  | 'pipeline' | 'container' | 'kubernetes_pod' | 'kubernetes_deployment'
  | 'kubernetes_service' | 'api_route' | 'api_gateway' | 'monitoring_alert'
  | 'group_runner' | 'runner' | 'environment' | 'storage_bucket'
  | 'storage_volume' | 'workspace' | 'operational_task' | 'domain' | 'secret'

export type ResourceEnvironment = 'dev' | 'stage' | 'prod' | 'global' | 'unknown'

export interface PlatformResource {
  id:           string
  name:         string
  resource_type: ResourceType
  subsystem:    string
  group_id:     string | null
  group_name:   string | null
  project_id:   string | null
  project_name: string | null
  environment:  ResourceEnvironment
  status:       ResourceStatus
  health_score: number           // 0-100
  metadata:     Record<string, any>
  last_synced:  string
  created_at:   string
}

export interface ResourceFilters {
  group_id?:     string
  project_id?:   string
  environment?:  string
  resource_type?: string
  status?:       string
  search?:       string
}

export interface ResourceAction {
  action:  string          // 'restart' | 'stop' | 'start' | 'scale' | 'rerun' | 'lock' | 'unlock' | 'pause' | 'resume'
  payload?: Record<string, any>
}

export interface SyncResult {
  synced:   number
  errors:   number
  duration: number
}

// ─── Fetch resources (with filters) ──────────────────────────────────────────

export async function listResources(filters?: ResourceFilters): Promise<PlatformResource[]> {
  try {
    const { data } = await client.get(BASE + '/', { params: filters })
    return unwrap<PlatformResource>(data)
  } catch {
    return MOCK_RESOURCES
  }
}

export async function getResource(id: string): Promise<PlatformResource | null> {
  try {
    const { data } = await client.get(`${BASE}/${id}/`)
    return data as PlatformResource
  } catch {
    return MOCK_RESOURCES.find(r => r.id === id) ?? null
  }
}

// ─── Sync ─────────────────────────────────────────────────────────────────────

export async function triggerSync(groupId?: string, projectId?: string): Promise<SyncResult> {
  try {
    const { data } = await client.post(`${BASE}/sync/`, { group_id: groupId, project_id: projectId })
    return data as SyncResult
  } catch {
    return { synced: MOCK_RESOURCES.length, errors: 0, duration: 420 }
  }
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function performResourceAction(id: string, action: ResourceAction): Promise<{ ok: boolean; message: string }> {
  try {
    const { data } = await client.post(`${BASE}/${id}/action/`, action)
    return data
  } catch {
    return { ok: true, message: `${action.action} queued successfully (mock)` }
  }
}

// ─── Mock data (used as fallback when API isn't live) ─────────────────────────

export const MOCK_RESOURCES: PlatformResource[] = [
  { id: 'r1',  name: 'api-gateway-pipeline',         resource_type: 'pipeline',              subsystem: 'CI/CD',       group_id: 'g1', group_name: 'Platform',    project_id: 'p1', project_name: 'api-gateway',      environment: 'prod',   status: 'running',  health_score: 98,  metadata: { branch: 'main',            trigger: 'push',   duration: '4m 12s', last_run: '2 min ago'  }, last_synced: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 'r2',  name: 'payment-service-pipeline',      resource_type: 'pipeline',              subsystem: 'CI/CD',       group_id: 'g1', group_name: 'Platform',    project_id: 'p2', project_name: 'payment-service',  environment: 'stage',  status: 'failed',   health_score: 0,   metadata: { branch: 'feat/crypto',     trigger: 'push',   duration: '6m 44s', last_run: '1 hr ago'   }, last_synced: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 'r3',  name: 'api-gateway-pod-1',              resource_type: 'kubernetes_pod',        subsystem: 'Kubernetes',  group_id: 'g1', group_name: 'Platform',    project_id: 'p1', project_name: 'api-gateway',      environment: 'prod',   status: 'running',  health_score: 100, metadata: { namespace: 'default',      node: 'node-01',   restarts: 0,        image: 'atonix/api-gw:1.4' }, last_synced: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 'r4',  name: 'payment-container-crash',        resource_type: 'container',             subsystem: 'Containers',  group_id: 'g1', group_name: 'Platform',    project_id: 'p2', project_name: 'payment-service',  environment: 'stage',  status: 'failed',   health_score: 12,  metadata: { image: 'atonix/pay:0.9',   restarts: 14,      cpu: '88%',         memory: '92%'      }, last_synced: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 'r5',  name: 'prod-gateway-route',              resource_type: 'api_route',             subsystem: 'API Gateway', group_id: 'g1', group_name: 'Platform',    project_id: 'p1', project_name: 'api-gateway',      environment: 'prod',   status: 'running',  health_score: 94,  metadata: { path: '/api/v1/*',        method: 'ALL',     latency_ms: 42,     rps: 1840        }, last_synced: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 'r6',  name: 'high-latency-alert',              resource_type: 'monitoring_alert',      subsystem: 'Monitoring',  group_id: 'g1', group_name: 'Platform',    project_id: 'p2', project_name: 'payment-service',  environment: 'prod',   status: 'degraded', health_score: 55,  metadata: { metric: 'latency_p99',    threshold: '500ms', current: '820ms',   fired: '15 min ago'}, last_synced: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 'r7',  name: 'group-runner-01',                 resource_type: 'group_runner',          subsystem: 'Runners',     group_id: 'g1', group_name: 'Platform',    project_id: null, project_name: null,               environment: 'global', status: 'running',  health_score: 100, metadata: { last_heartbeat: '8s ago', jobs_processed: 214, version: '16.5.0'             }, last_synced: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 'r8',  name: 'prod-environment',                resource_type: 'environment',           subsystem: 'Environments',group_id: 'g1', group_name: 'Platform',    project_id: 'p1', project_name: 'api-gateway',      environment: 'prod',   status: 'running',  health_score: 99,  metadata: { locked: false,             deploys: 42,        last_deploy: '1 day ago'             }, last_synced: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 'r9',  name: 'data-bucket-analytics',           resource_type: 'storage_bucket',        subsystem: 'Storage',     group_id: 'g2', group_name: 'Data',        project_id: 'p6', project_name: 'data-warehouse',   environment: 'prod',   status: 'running',  health_score: 100, metadata: { region: 'us-east-1',      size_gb: 4200,      objects: 18400                       }, last_synced: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 'r10', name: 'ml-pipeline-train',               resource_type: 'pipeline',              subsystem: 'CI/CD',       group_id: 'g2', group_name: 'Data',        project_id: 'p3', project_name: 'ml-pipeline',      environment: 'stage',  status: 'pending',  health_score: 50,  metadata: { branch: 'dev/model-v3',   trigger: 'schedule', duration: '—',     last_run: '30 min ago'}, last_synced: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 'r11', name: 'developer-workspace-01',          resource_type: 'workspace',             subsystem: 'Workplace',   group_id: 'g1', group_name: 'Platform',    project_id: null, project_name: null,               environment: 'dev',    status: 'running',  health_score: 88,  metadata: { owner: 'john.doe',        ide: 'VS Code',     uptime: '4h 20m'                     }, last_synced: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 'r12', name: 'nightly-db-backup',               resource_type: 'operational_task',      subsystem: 'Operational', group_id: 'g1', group_name: 'Platform',    project_id: null, project_name: null,               environment: 'prod',   status: 'running',  health_score: 100, metadata: { schedule: '0 2 * * *',    last_run: '6h ago', next_run: 'in 18h'               }, last_synced: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 'r13', name: 'api-domain-atonix.io',            resource_type: 'domain',                subsystem: 'Domains',     group_id: 'g1', group_name: 'Platform',    project_id: 'p1', project_name: 'api-gateway',      environment: 'prod',   status: 'running',  health_score: 100, metadata: { ssl_expiry: '2026-11-14', dns_status: 'propagated'                            }, last_synced: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 'r14', name: 'payment-deployment',              resource_type: 'kubernetes_deployment', subsystem: 'Kubernetes',  group_id: 'g1', group_name: 'Platform',    project_id: 'p2', project_name: 'payment-service',  environment: 'stage',  status: 'degraded', health_score: 40,  metadata: { replicas: '1/3',          image: 'atonix/pay:0.9', reason: 'OOMKilled' }, last_synced: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 'r15', name: 'infra-runner-02',                 resource_type: 'runner',                subsystem: 'Runners',     group_id: 'g1', group_name: 'Platform',    project_id: null, project_name: null,               environment: 'global', status: 'stopped',  health_score: 0,   metadata: { last_heartbeat: '22 min ago', jobs_processed: 89, version: '16.4.1'           }, last_synced: new Date().toISOString(), created_at: new Date().toISOString() },
]
