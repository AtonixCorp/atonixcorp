// AtonixCorp Cloud — Environment Management
// Overview · Dev · Stage · Prod · Deployments · Config · Secrets

import React, { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  LinearProgress,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Snackbar,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'

import CheckCircleIcon      from '@mui/icons-material/CheckCircle'
import WarningAmberIcon     from '@mui/icons-material/WarningAmber'
import ErrorIcon            from '@mui/icons-material/Error'
import LockIcon             from '@mui/icons-material/Lock'
import LockOpenIcon         from '@mui/icons-material/LockOpen'
import PlayArrowIcon        from '@mui/icons-material/PlayArrow'
import RestartAltIcon       from '@mui/icons-material/RestartAlt'
import ArrowForwardIcon     from '@mui/icons-material/ArrowForward'
import ContentCopyIcon      from '@mui/icons-material/ContentCopy'
import AddIcon              from '@mui/icons-material/Add'
import DeleteOutlineIcon    from '@mui/icons-material/DeleteOutline'
import HistoryIcon          from '@mui/icons-material/History'
import TuneIcon             from '@mui/icons-material/Tune'
import UndoIcon             from '@mui/icons-material/Undo'
import ShieldIcon           from '@mui/icons-material/Shield'
import VisibilityIcon       from '@mui/icons-material/Visibility'
import VisibilityOffIcon    from '@mui/icons-material/VisibilityOff'

import { dashboardTokens, dashboardSemanticColors } from '../styles/dashboardDesignSystem'

// ─── Design tokens ────────────────────────────────────────────────────────────

const FONT = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
const t    = dashboardTokens.colors
const S    = dashboardSemanticColors

// ─── Types ────────────────────────────────────────────────────────────────────

type EnvHealth = 'healthy' | 'degraded' | 'critical'
type EnvName   = string   // 'dev' | 'stage' | 'prod' + custom envs
type CoreEnvId = 'dev' | 'stage' | 'prod'

interface EnvService {
  name:     string
  type:     string
  status:   string
  version:  string
  replicas: string
}
interface K8sWorkload {
  name:       string
  kind:       string
  namespace:  string
  ready:      string
  status:     string
}
interface ApiRoute {
  path:      string
  method:    string
  status:    string
  latency:   number
  rps:       number
}
interface Deployment {
  id:         string
  version:    string
  who:        string
  when:       string
  duration:   string
  status:     string
  canRollback: boolean
}
interface ConfigVar   { key: string; value: string; secret: boolean }
interface FeatureFlag { key: string; enabled: boolean; description?: string }
interface SecretItem  { name: string; type: string; created: string; expiry?: string; rotationHistory?: Array<{ date: string; by: string }> }
interface EnvMetrics  { cpu: number; memory: number; networkIn: string; networkOut: string; latency: number; throughput: string }

interface Env {
  id:           EnvName
  label:        string
  color:        string
  bg:           string
  protected:    boolean
  health:       EnvHealth
  version:      string
  errorRate:    string
  lastDeploy:   string
  locked:       boolean
  services:     EnvService[]
  workloads:    K8sWorkload[]
  routes:       ApiRoute[]
  config:       ConfigVar[]
  deployments:  Deployment[]
  secrets:      SecretItem[]
  featureFlags: FeatureFlag[]
  metrics:      EnvMetrics
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const ENVS: Env[] = [
  {
    id: 'prod', label: 'Production', color: '#ef4444', bg: 'rgba(239,68,68,.10)', protected: true,
    health: 'healthy', version: 'v1.4.2', errorRate: '0.12%', lastDeploy: '2 hours ago', locked: true,
    services: [
      { name: 'api-gateway',     type: 'Deployment', status: 'running', version: '1.4.2', replicas: '3/3' },
      { name: 'payment-service', type: 'Deployment', status: 'running', version: '2.1.0', replicas: '2/2' },
      { name: 'user-service',    type: 'Deployment', status: 'running', version: '1.8.1', replicas: '2/2' },
      { name: 'redis',           type: 'StatefulSet',status: 'running', version: '7.0',   replicas: '1/1' },
      { name: 'postgres',        type: 'StatefulSet',status: 'running', version: '16',    replicas: '2/2' },
    ],
    workloads: [
      { name: 'api-gateway-7d9bc',     kind: 'Pod',        namespace: 'production', ready: '3/3', status: 'Running' },
      { name: 'payment-service-6f8ab', kind: 'Pod',        namespace: 'production', ready: '2/2', status: 'Running' },
      { name: 'api-gateway',           kind: 'Deployment', namespace: 'production', ready: '3/3', status: 'Running' },
    ],
    routes: [
      { path: '/api/v1/*',    method: 'ALL',  status: 'active', latency: 42,  rps: 1840 },
      { path: '/health',      method: 'GET',  status: 'active', latency: 3,   rps: 120  },
      { path: '/api/v2/pay',  method: 'POST', status: 'active', latency: 88,  rps: 430  },
    ],
    deployments: [
      { id: 'd1', version: 'v1.4.2', who: 'john.doe',  when: '2 hours ago',  duration: '3m 18s', status: 'success',  canRollback: true },
      { id: 'd2', version: 'v1.4.1', who: 'alice.chen', when: '1 day ago',   duration: '4m 02s', status: 'success',  canRollback: true },
      { id: 'd3', version: 'v1.4.0', who: 'john.doe',  when: '3 days ago',   duration: '3m 51s', status: 'success',  canRollback: false },
    ],
    config: [
      { key: 'NODE_ENV',     value: 'production', secret: false },
      { key: 'LOG_LEVEL',    value: 'warn',       secret: false },
      { key: 'DATABASE_URL', value: 'postgres://****', secret: true },
      { key: 'REDIS_URL',    value: 'redis://****',    secret: true },
    ],
    secrets: [
      { name: 'db-credentials',  type: 'Kubernetes Secret', created: '2025-12-01', expiry: '—',
        rotationHistory: [{ date: '2025-12-01', by: 'infra-bot' }, { date: '2025-09-01', by: 'john.doe' }] },
      { name: 'stripe-api-key',  type: 'Vault Secret',      created: '2026-01-15', expiry: '2027-01-15',
        rotationHistory: [{ date: '2026-01-15', by: 'alice.chen' }] },
      { name: 'jwt-secret',      type: 'Kubernetes Secret', created: '2026-01-10', expiry: '—',
        rotationHistory: [{ date: '2026-01-10', by: 'john.doe' }] },
    ],
    featureFlags: [
      { key: 'new-checkout-flow',    enabled: true,  description: 'Revamped checkout UX' },
      { key: 'ai-recommendations',   enabled: true,  description: 'ML-powered product suggestions' },
      { key: 'dark-mode-v2',         enabled: false, description: 'Updated dark mode tokens' },
    ],
    metrics: { cpu: 34, memory: 51, networkIn: '1.2 GB/h', networkOut: '820 MB/h', latency: 42, throughput: '1.84k req/s' },
  },
  {
    id: 'stage', label: 'Staging', color: '#a855f7', bg: 'rgba(168,85,247,.10)', protected: false,
    health: 'degraded', version: 'v1.5.0-rc2', errorRate: '2.4%', lastDeploy: 'Yesterday', locked: false,
    services: [
      { name: 'api-gateway',     type: 'Deployment', status: 'running',  version: '1.5.0-rc2', replicas: '2/2' },
      { name: 'payment-service', type: 'Deployment', status: 'degraded', version: '2.2.0-beta', replicas: '1/3' },
      { name: 'user-service',    type: 'Deployment', status: 'running',  version: '1.9.0-rc1', replicas: '1/1' },
    ],
    workloads: [
      { name: 'api-gateway-stage',     kind: 'Deployment', namespace: 'staging', ready: '2/2', status: 'Running' },
      { name: 'payment-service-stage', kind: 'Deployment', namespace: 'staging', ready: '1/3', status: 'Degraded' },
    ],
    routes: [
      { path: '/api/v1/*',   method: 'ALL',  status: 'active',  latency: 120, rps: 240  },
      { path: '/api/v2/pay', method: 'POST', status: 'degraded',latency: 820, rps: 55   },
    ],
    deployments: [
      { id: 'd4', version: 'v1.5.0-rc2', who: 'alice.chen', when: 'Yesterday',  duration: '5m 44s', status: 'success', canRollback: true },
      { id: 'd5', version: 'v1.5.0-rc1', who: 'john.doe',   when: '2 days ago', duration: '6m 12s', status: 'failed',  canRollback: false },
    ],
    config: [
      { key: 'NODE_ENV',     value: 'staging', secret: false },
      { key: 'LOG_LEVEL',    value: 'info',    secret: false },
      { key: 'DATABASE_URL', value: 'postgres://****', secret: true },
    ],
    secrets: [
      { name: 'db-credentials-stage', type: 'Kubernetes Secret', created: '2026-01-01',
        rotationHistory: [{ date: '2026-01-01', by: 'infra-bot' }] },
      { name: 'stripe-test-key',      type: 'Vault Secret',      created: '2026-01-20', expiry: '2027-01-20',
        rotationHistory: [{ date: '2026-01-20', by: 'alice.chen' }] },
    ],
    featureFlags: [
      { key: 'new-checkout-flow',    enabled: true,  description: 'Revamped checkout UX (RC testing)' },
      { key: 'ai-recommendations',   enabled: true,  description: 'ML-powered product suggestions' },
      { key: 'dark-mode-v2',         enabled: true,  description: 'Updated dark mode tokens (staging test)' },
      { key: 'beta-dashboard',       enabled: false, description: 'Next-gen analytics dashboard' },
    ],
    metrics: { cpu: 68, memory: 74, networkIn: '320 MB/h', networkOut: '180 MB/h', latency: 120, throughput: '240 req/s' },
  },
  {
    id: 'dev', label: 'Development', color: '#008080', bg: 'rgba(0,128,128,.10)', protected: false,
    health: 'healthy', version: 'v1.5.0-dev', errorRate: '0.8%', lastDeploy: '3 hours ago', locked: false,
    services: [
      { name: 'api-gateway',     type: 'Deployment', status: 'running', version: '1.5.0-dev', replicas: '1/1' },
      { name: 'payment-service', type: 'Deployment', status: 'running', version: '2.2.0-dev', replicas: '1/1' },
    ],
    workloads: [
      { name: 'api-gateway-dev', kind: 'Deployment', namespace: 'development', ready: '1/1', status: 'Running' },
    ],
    routes: [
      { path: '/api/v1/*', method: 'ALL', status: 'active', latency: 68, rps: 40 },
    ],
    deployments: [
      { id: 'd6', version: 'v1.5.0-dev', who: 'john.doe', when: '3 hours ago', duration: '2m 11s', status: 'success', canRollback: true },
    ],
    config: [
      { key: 'NODE_ENV',     value: 'development',               secret: false },
      { key: 'LOG_LEVEL',    value: 'debug',                     secret: false },
      { key: 'DATABASE_URL', value: 'postgres://localhost:5432/dev', secret: false },
    ],
    secrets: [
      { name: 'db-credentials-dev', type: 'Kubernetes Secret', created: '2026-02-01',
        rotationHistory: [{ date: '2026-02-01', by: 'john.doe' }] },
    ],
    featureFlags: [
      { key: 'new-checkout-flow',    enabled: true,  description: 'Revamped checkout UX (dev)' },
      { key: 'ai-recommendations',   enabled: true,  description: 'ML-powered product suggestions (dev)' },
      { key: 'dark-mode-v2',         enabled: true,  description: 'Updated dark mode tokens (dev)' },
      { key: 'beta-dashboard',       enabled: true,  description: 'Next-gen analytics dashboard (dev)' },
      { key: 'experimental-search',  enabled: false, description: 'New vector search backend' },
    ],
    metrics: { cpu: 22, memory: 38, networkIn: '40 MB/h', networkOut: '25 MB/h', latency: 68, throughput: '40 req/s' },
  },
]

// ─── Color helpers ────────────────────────────────────────────────────────────

const HEALTH_COLOR: Record<EnvHealth, string> = {
  healthy:  S.success,
  degraded: S.warning,
  critical: S.danger,
}
const HEALTH_BG: Record<EnvHealth, string> = {
  healthy:  'rgba(34,197,94,.12)',
  degraded: 'rgba(245,158,11,.12)',
  critical: 'rgba(239,68,68,.12)',
}
const STATUS_COLOR: Record<string, string> = {
  running: S.success, degraded: S.warning, failed: S.danger, stopped: S.danger,
  active:  S.success, success: S.success,
}
const STATUS_BG: Record<string, string> = {
  running: 'rgba(34,197,94,.1)', degraded: 'rgba(245,158,11,.1)', failed: 'rgba(239,68,68,.1)',
  stopped: 'rgba(239,68,68,.1)', active: 'rgba(34,197,94,.1)',    success: 'rgba(34,197,94,.1)',
}

function HealthBadge({ health }: { health: EnvHealth }) {
  const map = {
    healthy:  { Icon: CheckCircleIcon,  label: 'Healthy'  },
    degraded: { Icon: WarningAmberIcon, label: 'Degraded' },
    critical: { Icon: ErrorIcon,        label: 'Critical' },
  }
  const { Icon, label } = map[health]
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.3, borderRadius: 1, bgcolor: HEALTH_BG[health] }}>
      <Icon sx={{ fontSize: 12, color: HEALTH_COLOR[health] }} />
      <Typography sx={{ fontSize: '.72rem', fontWeight: 700, color: HEALTH_COLOR[health], fontFamily: FONT }}>{label}</Typography>
    </Box>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{ fontSize: '.72rem', fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: FONT, mb: 1.25 }}>
      {children}
    </Typography>
  )
}

// ─── PromoteDialog ────────────────────────────────────────────────────────────

function PromoteDialog({ from, to, onClose }: { from: string; to: string; onClose: () => void }) {
  return (
    <Dialog open onClose={onClose} PaperProps={{ sx: { bgcolor: t.surface, border: `1px solid ${t.border}`, borderRadius: '10px' } }}>
      <DialogTitle sx={{ fontFamily: FONT, fontWeight: 700, color: t.textPrimary, pb: 1 }}>Promote Build</DialogTitle>
      <DialogContent>
        <Typography sx={{ fontFamily: FONT, color: t.textSecondary, fontSize: '.875rem' }}>
          Promote the current build from <strong style={{ color: t.textPrimary }}>{from}</strong> to{' '}
          <strong style={{ color: t.textPrimary }}>{to}</strong>?
        </Typography>
        <Alert severity="warning" sx={{ mt: 2, fontSize: '.8rem' }}>
          This will trigger a deployment pipeline run. Approvals may be required for <strong>production</strong>.
        </Alert>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} size="small" sx={{ color: t.textSecondary, fontFamily: FONT, textTransform: 'none' }}>Cancel</Button>
        <Button onClick={onClose} size="small" variant="contained" sx={{ fontWeight: 700, textTransform: 'none', bgcolor: dashboardTokens.colors.brandPrimary, color: '#0a0f1a', '&:hover': { bgcolor: dashboardTokens.colors.brandPrimaryHover } }}>
          Promote
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ─── ScaleDialog ─────────────────────────────────────────────────────────────

function ScaleDialog({ env, onClose }: { env: Env; onClose: () => void }) {
  const [replicas, setReplicas] = useState<Record<string, number>>(
    Object.fromEntries(env.services.map(s => [s.name, parseInt(s.replicas.split('/')[1] ?? '1', 10)]))
  )
  return (
    <Dialog open onClose={onClose} PaperProps={{ sx: { bgcolor: t.surface, border: `1px solid ${t.border}`, borderRadius: '10px', minWidth: 360 } }}>
      <DialogTitle sx={{ fontFamily: FONT, fontWeight: 700, color: t.textPrimary, pb: 1 }}>Scale Services — {env.label}</DialogTitle>
      <DialogContent>
        <Typography sx={{ fontFamily: FONT, color: t.textSecondary, fontSize: '.82rem', mb: 2 }}>
          Adjust replica counts per service. Changes apply immediately.
        </Typography>
        <Stack spacing={1.5}>
          {env.services.map(svc => (
            <Box key={svc.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
              <Box>
                <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '.82rem', color: t.textPrimary }}>{svc.name}</Typography>
                <Typography sx={{ fontFamily: FONT, fontSize: '.72rem', color: t.textSecondary }}>{svc.type}</Typography>
              </Box>
              <Select
                value={replicas[svc.name] ?? 1}
                onChange={e => setReplicas(p => ({ ...p, [svc.name]: Number(e.target.value) }))}
                size="small"
                sx={{ fontFamily: FONT, fontSize: '.8rem', minWidth: 80, color: t.textPrimary,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: t.border },
                  '& .MuiSvgIcon-root': { color: t.textSecondary },
                  bgcolor: 'rgba(148,163,184,.06)',
                }}
              >
                {[1,2,3,4,5,6,8,10].map(n => <MenuItem key={n} value={n} sx={{ fontFamily: FONT, fontSize: '.8rem' }}>{n} replica{n !== 1 ? 's' : ''}</MenuItem>)}
              </Select>
            </Box>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} size="small" sx={{ color: t.textSecondary, fontFamily: FONT, textTransform: 'none' }}>Cancel</Button>
        <Button onClick={onClose} size="small" variant="contained"
          sx={{ fontWeight: 700, textTransform: 'none', bgcolor: S.purple, color: '#fff', boxShadow: 'none', '&:hover': { bgcolor: '#7c3aed', boxShadow: 'none' } }}>
          Apply Scale
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ─── Environment detail card ──────────────────────────────────────────────────

function EnvDetailCard({ env, onLockToggle, onPromote }: {
  env: Env
  onLockToggle: (id: EnvName) => void
  onPromote:    (from: EnvName) => void
}) {
  const [subtab, setSubtab] = useState(0)
  const [revealSecrets, setRevealSecrets] = useState<Record<string, boolean>>({})
  const [scaleOpen, setScaleOpen] = useState(false)
  const [expandRotation, setExpandRotation] = useState<Record<string, boolean>>({})

  const SUBTABS = ['Services', 'Workloads', 'API Routes', 'Config', 'Secrets', 'Logs', 'Metrics']
  const promoteTarget: EnvName | null = env.id === 'dev' ? 'stage' : env.id === 'stage' ? 'prod' : null

  return (
    <Card sx={{ border: `1px solid ${env.color}44`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '10px' }}>
      <CardContent sx={{ p: '16px 20px !important' }}>
        {/* Card header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '8px', bgcolor: env.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <TuneIcon sx={{ fontSize: '1rem', color: env.color }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: t.textPrimary, fontFamily: FONT }}>{env.label}</Typography>
              <HealthBadge health={env.health} />
              {env.protected && (
                <Chip icon={<ShieldIcon sx={{ fontSize: '0.75rem !important' }} />} label="Protected" size="small"
                  sx={{ height: 20, fontSize: '.66rem', fontWeight: 700, bgcolor: 'rgba(239,68,68,.1)', color: S.danger, '& .MuiChip-label': { px: 0.7 } }} />
              )}
              {env.locked && (
                <Chip icon={<LockIcon sx={{ fontSize: '0.75rem !important' }} />} label="Locked" size="small"
                  sx={{ height: 20, fontSize: '.66rem', fontWeight: 700, bgcolor: 'rgba(148,163,184,.1)', color: t.textSecondary, '& .MuiChip-label': { px: 0.7 } }} />
              )}
            </Stack>
            <Typography sx={{ fontSize: '.78rem', color: t.textSecondary, fontFamily: FONT, mt: 0.2 }}>
              {env.version} · Last deployed {env.lastDeploy} · Error rate {env.errorRate}
            </Typography>
          </Box>

          {/* Controls */}
          <Stack direction="row" spacing={0.75} flexWrap="wrap">
            <Tooltip title={env.locked ? 'Unlock environment' : 'Lock environment'}>
              <Button
                size="small" variant="outlined"
                startIcon={env.locked ? <LockOpenIcon sx={{ fontSize: '.8rem' }} /> : <LockIcon sx={{ fontSize: '.8rem' }} />}
                onClick={() => onLockToggle(env.id)}
                sx={{ fontSize: '.72rem', borderRadius: '5px', textTransform: 'none', borderColor: t.border, color: t.textSecondary, fontFamily: FONT }}
              >
                {env.locked ? 'Unlock' : 'Lock'}
              </Button>
            </Tooltip>
            <Tooltip title="Restart all services">
              <Button size="small" variant="outlined" startIcon={<RestartAltIcon sx={{ fontSize: '.8rem' }} />}
                sx={{ fontSize: '.72rem', borderRadius: '5px', textTransform: 'none', borderColor: t.border, color: t.textSecondary, fontFamily: FONT }}>
                Restart
              </Button>
            </Tooltip>
            <Tooltip title="Scale services">
              <Button size="small" variant="outlined" startIcon={<PlayArrowIcon sx={{ fontSize: '.8rem' }} />}
                onClick={() => setScaleOpen(true)}
                sx={{ fontSize: '.72rem', borderRadius: '5px', textTransform: 'none', borderColor: t.border, color: S.purple, fontFamily: FONT }}>
                Scale
              </Button>
            </Tooltip>
            {promoteTarget && (
              <Button
                size="small" variant="contained"
                startIcon={<ArrowForwardIcon sx={{ fontSize: '.8rem' }} />}
                onClick={() => onPromote(env.id)}
                disabled={env.locked}
                sx={{ fontSize: '.72rem', borderRadius: '5px', textTransform: 'none', fontWeight: 700, bgcolor: env.color, color: '#fff', boxShadow: 'none', '&:hover': { bgcolor: env.color + 'cc', boxShadow: 'none' } }}
              >
                Promote → {promoteTarget.charAt(0).toUpperCase() + promoteTarget.slice(1)}
              </Button>
            )}
          </Stack>
        </Box>

        <Divider sx={{ borderColor: t.border, mb: 1.5 }} />

        {/* Sub-tabs */}
        <Tabs
          value={subtab}
          onChange={(_, v) => setSubtab(v)}
          variant="scrollable" scrollButtons="auto"
          sx={{
            mb: 1.5, minHeight: 32, borderBottom: `1px solid ${t.border}`,
            '& .MuiTab-root': { fontFamily: FONT, fontSize: '.76rem', fontWeight: 600, textTransform: 'none', minHeight: 32, px: 1.25, color: t.textSecondary },
            '& .Mui-selected': { color: env.color },
            '& .MuiTabs-indicator': { bgcolor: env.color, height: 2 },
          }}
        >
          {SUBTABS.map(l => <Tab key={l} label={l} />)}
        </Tabs>

        {/* Services */}
        {subtab === 0 && (
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Service', 'Type', 'Version', 'Replicas', 'Status'].map(h => (
                  <TableCell key={h} sx={{ color: t.textSecondary, fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', borderColor: t.border, py: 0.75, fontFamily: FONT }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {env.services.map(svc => (
                <TableRow key={svc.name} sx={{ '& td': { borderColor: t.border } }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '.82rem', color: t.textPrimary, py: 0.75, fontFamily: FONT }}>{svc.name}</TableCell>
                  <TableCell sx={{ fontSize: '.78rem', color: t.textSecondary, py: 0.75, fontFamily: FONT }}>{svc.type}</TableCell>
                  <TableCell sx={{ py: 0.75 }}><Box component="code" sx={{ fontSize: '.72rem', bgcolor: 'rgba(148,163,184,.1)', px: 0.6, py: 0.2, borderRadius: 1 }}>{svc.version}</Box></TableCell>
                  <TableCell sx={{ fontSize: '.78rem', color: t.textSecondary, py: 0.75, fontFamily: FONT }}>{svc.replicas}</TableCell>
                  <TableCell sx={{ py: 0.75 }}>
                    <Chip label={svc.status} size="small" sx={{ height: 18, fontSize: '.66rem', fontWeight: 700, textTransform: 'capitalize', bgcolor: STATUS_BG[svc.status] ?? 'rgba(148,163,184,.1)', color: STATUS_COLOR[svc.status] ?? t.textSecondary, '& .MuiChip-label': { px: 0.7 } }} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* K8s Workloads */}
        {subtab === 1 && (
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Name', 'Kind', 'Namespace', 'Ready', 'Status'].map(h => (
                  <TableCell key={h} sx={{ color: t.textSecondary, fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', borderColor: t.border, py: 0.75, fontFamily: FONT }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {env.workloads.map(w => (
                <TableRow key={w.name} sx={{ '& td': { borderColor: t.border } }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '.78rem', color: t.textPrimary, py: 0.75, fontFamily: FONT }}>{w.name}</TableCell>
                  <TableCell sx={{ fontSize: '.78rem', color: t.textSecondary, py: 0.75, fontFamily: FONT }}>{w.kind}</TableCell>
                  <TableCell sx={{ fontSize: '.78rem', color: t.textSecondary, py: 0.75, fontFamily: FONT }}>{w.namespace}</TableCell>
                  <TableCell sx={{ fontSize: '.78rem', color: t.textSecondary, py: 0.75, fontFamily: FONT }}>{w.ready}</TableCell>
                  <TableCell sx={{ py: 0.75 }}>
                    <Chip label={w.status} size="small" sx={{ height: 18, fontSize: '.66rem', fontWeight: 700, bgcolor: STATUS_BG[w.status.toLowerCase()] ?? 'rgba(148,163,184,.1)', color: STATUS_COLOR[w.status.toLowerCase()] ?? t.textSecondary, '& .MuiChip-label': { px: 0.7 } }} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* API Routes */}
        {subtab === 2 && (
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Path', 'Method', 'Status', 'Latency (ms)', 'RPS'].map(h => (
                  <TableCell key={h} sx={{ color: t.textSecondary, fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', borderColor: t.border, py: 0.75, fontFamily: FONT }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {env.routes.map(r => (
                <TableRow key={r.path} sx={{ '& td': { borderColor: t.border } }}>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '.78rem', color: t.textPrimary, py: 0.75 }}>{r.path}</TableCell>
                  <TableCell sx={{ py: 0.75 }}>
                    <Chip label={r.method} size="small" sx={{ height: 18, fontSize: '.66rem', fontWeight: 700, bgcolor: 'rgba(0,224,255,.1)', color: S.info, '& .MuiChip-label': { px: 0.7 } }} />
                  </TableCell>
                  <TableCell sx={{ py: 0.75 }}>
                    <Chip label={r.status} size="small" sx={{ height: 18, fontSize: '.66rem', fontWeight: 700, bgcolor: STATUS_BG[r.status] ?? 'rgba(148,163,184,.1)', color: STATUS_COLOR[r.status] ?? t.textSecondary, '& .MuiChip-label': { px: 0.7 } }} />
                  </TableCell>
                  <TableCell sx={{ fontSize: '.82rem', color: r.latency > 500 ? S.danger : r.latency > 200 ? S.warning : S.success, fontWeight: 700, py: 0.75, fontFamily: FONT }}>{r.latency}</TableCell>
                  <TableCell sx={{ fontSize: '.82rem', color: t.textPrimary, py: 0.75, fontFamily: FONT }}>{r.rps}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Config */}
        {subtab === 3 && (
          <Box>
            <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
              <Button size="small" startIcon={<AddIcon sx={{ fontSize: '.8rem' }} />}
                sx={{ fontSize: '.72rem', textTransform: 'none', fontWeight: 700, color: dashboardTokens.colors.brandPrimary }}>
                Add Variable
              </Button>
            </Stack>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Key', 'Value', ''].map(h => (
                    <TableCell key={h} sx={{ color: t.textSecondary, fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', borderColor: t.border, py: 0.75, fontFamily: FONT }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {env.config.map(v => (
                  <TableRow key={v.key} sx={{ '& td': { borderColor: t.border } }}>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '.82rem', fontWeight: 700, color: t.textPrimary, py: 0.75 }}>{v.key}</TableCell>
                    <TableCell sx={{ fontSize: '.82rem', py: 0.75 }}>
                      {v.secret
                        ? <Chip label="secret" size="small" sx={{ height: 16, fontSize: '.62rem', bgcolor: 'rgba(239,68,68,.1)', color: S.danger, '& .MuiChip-label': { px: 0.6 } }} />
                        : <Box component="code" sx={{ fontSize: '.75rem', color: t.textPrimary, bgcolor: 'rgba(148,163,184,.08)', px: 0.6, py: 0.2, borderRadius: 1 }}>{v.value}</Box>
                      }
                    </TableCell>
                    <TableCell align="right" sx={{ py: 0.75 }}>
                      <IconButton size="small" sx={{ color: t.textSecondary }}><ContentCopyIcon sx={{ fontSize: '.78rem' }} /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Feature Flags */}
            <Box sx={{ mt: 2.5 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <SectionTitle>Feature Flags</SectionTitle>
                <Button size="small" startIcon={<AddIcon sx={{ fontSize: '.8rem' }} />}
                  sx={{ fontSize: '.72rem', textTransform: 'none', fontWeight: 700, color: S.purple }}>
                  Add Flag
                </Button>
              </Stack>
              <Stack spacing={0.75}>
                {env.featureFlags.map(flag => (
                  <Box key={flag.key} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.25, py: 0.75, borderRadius: '6px', border: `1px solid ${t.border}`, bgcolor: 'rgba(148,163,184,.04)' }}>
                    <Box sx={{ width: 32, height: 18, borderRadius: '9px', bgcolor: flag.enabled ? S.success : 'rgba(148,163,184,.3)', display: 'flex', alignItems: 'center', px: 0.4, cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#fff', ml: flag.enabled ? 'auto' : 0, transition: 'margin .2s' }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontFamily: 'monospace', fontSize: '.8rem', fontWeight: 700, color: t.textPrimary }}>{flag.key}</Typography>
                      {flag.description && <Typography sx={{ fontFamily: FONT, fontSize: '.72rem', color: t.textSecondary }}>{flag.description}</Typography>}
                    </Box>
                    <Chip label={flag.enabled ? 'On' : 'Off'} size="small"
                      sx={{ height: 18, fontSize: '.62rem', fontWeight: 700, bgcolor: flag.enabled ? 'rgba(34,197,94,.1)' : 'rgba(148,163,184,.1)', color: flag.enabled ? S.success : t.textSecondary, '& .MuiChip-label': { px: 0.7 } }} />
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>
        )}

        {/* Secrets */}
        {subtab === 4 && (
          <Box>
            <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
              <Button size="small" startIcon={<AddIcon sx={{ fontSize: '.8rem' }} />}
                sx={{ fontSize: '.72rem', textTransform: 'none', fontWeight: 700, color: dashboardTokens.colors.brandPrimary }}>
                Add Secret
              </Button>
            </Stack>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Name', 'Type', 'Created', 'Expiry', ''].map(h => (
                    <TableCell key={h} sx={{ color: t.textSecondary, fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', borderColor: t.border, py: 0.75, fontFamily: FONT }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {env.secrets.map(sec => (
                  <React.Fragment key={sec.name}>
                    <TableRow sx={{ '& td': { borderColor: t.border } }}>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '.82rem', fontWeight: 700, color: t.textPrimary, py: 0.75 }}>{sec.name}</TableCell>
                      <TableCell sx={{ fontSize: '.78rem', color: t.textSecondary, py: 0.75, fontFamily: FONT }}>{sec.type}</TableCell>
                      <TableCell sx={{ fontSize: '.78rem', color: t.textSecondary, py: 0.75, fontFamily: FONT }}>{sec.created}</TableCell>
                      <TableCell sx={{ fontSize: '.78rem', color: t.textSecondary, py: 0.75, fontFamily: FONT }}>{sec.expiry ?? '—'}</TableCell>
                      <TableCell align="right" sx={{ py: 0.75 }}>
                        {sec.rotationHistory && (
                          <Tooltip title="View rotation history">
                            <IconButton size="small" onClick={() => setExpandRotation(p => ({ ...p, [sec.name]: !p[sec.name] }))} sx={{ color: S.info }}>
                              <HistoryIcon sx={{ fontSize: '.82rem' }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        <IconButton size="small" onClick={() => setRevealSecrets(p => ({ ...p, [sec.name]: !p[sec.name] }))} sx={{ color: t.textSecondary }}>
                          {revealSecrets[sec.name] ? <VisibilityOffIcon sx={{ fontSize: '.82rem' }} /> : <VisibilityIcon sx={{ fontSize: '.82rem' }} />}
                        </IconButton>
                        <IconButton size="small" sx={{ color: S.danger }}><DeleteOutlineIcon sx={{ fontSize: '.82rem' }} /></IconButton>
                      </TableCell>
                    </TableRow>
                    {expandRotation[sec.name] && sec.rotationHistory?.map((r, ri) => (
                      <TableRow key={ri} sx={{ '& td': { borderColor: t.border, bgcolor: 'rgba(0,224,255,.03)' } }}>
                        <TableCell colSpan={5} sx={{ py: 0.5, pl: 3, fontSize: '.72rem', color: t.textSecondary, fontFamily: FONT }}>
                          ↳ Rotated on <strong style={{ color: t.textPrimary }}>{r.date}</strong> by <strong style={{ color: t.textPrimary }}>{r.by}</strong>
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}

        {/* Logs */}
        {subtab === 5 && (
          <Box>
            <Stack direction="row" spacing={1} sx={{ mb: 1.5 }} flexWrap="wrap">
              {['Application', 'Deployment', 'Errors'].map(kind => (
                <Chip key={kind} label={kind} size="small"
                  sx={{ height: 20, fontSize: '.66rem', fontWeight: 700, bgcolor: 'rgba(148,163,184,.1)', color: t.textSecondary, cursor: 'pointer', '& .MuiChip-label': { px: 0.8 } }} />
              ))}
            </Stack>
            <Box sx={{ fontFamily: 'monospace', fontSize: '.76rem', color: '#e6edf3', bgcolor: '#0d1117', borderRadius: '6px', p: 1.5, lineHeight: 1.75, maxHeight: 260, overflow: 'auto' }}>
              {[
                { t: '[INFO]',  l: `2026-02-25 09:00:01  service api-gateway started (${env.version})` },
                { t: '[INFO]',  l: '2026-02-25 09:00:03  healthcheck /health → 200 OK (3ms)' },
                { t: '[INFO]',  l: '2026-02-25 09:01:12  POST /api/v1/auth/login → 200 (42ms)' },
                { t: '[INFO]',  l: '2026-02-25 09:01:45  GET  /api/v1/users/me  → 200 (18ms)' },
                { t: '[INFO]',  l: '2026-02-25 09:02:00  Deploy pipeline triggered — version ' + env.version },
                { t: '[INFO]',  l: '2026-02-25 09:03:10  Zero-downtime rollout complete. Pods: 3/3 ready' },
                ...(env.health === 'degraded' ? [
                  { t: '[WARN]',  l: '2026-02-25 09:04:30  payment-service latency spike: 820ms (>500ms threshold)' },
                  { t: '[WARN]',  l: '2026-02-25 09:04:45  payment-service 1/3 pods not ready (OOMKilled)' },
                  { t: '[ERROR]', l: '2026-02-25 09:05:00  payment-service pod CrashLoopBackOff — retrying' },
                ] : [
                  { t: '[INFO]',  l: '2026-02-25 09:05:00  All services operating normally' },
                ]),
              ].map((entry, i) => (
                <Box key={i} component="div" sx={{ color: entry.t === '[WARN]' ? S.warning : entry.t === '[ERROR]' ? S.danger : '#e6edf3', mb: 0.1 }}>
                  <span style={{ color: entry.t === '[WARN]' ? S.warning : entry.t === '[ERROR]' ? S.danger : '#58a6ff', marginRight: 8 }}>{entry.t}</span>
                  {entry.l}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Metrics */}
        {subtab === 6 && (
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap">
              {[
                { label: 'CPU Usage',    value: env.metrics.cpu,    unit: '%',  color: env.metrics.cpu > 80 ? S.danger : env.metrics.cpu > 60 ? S.warning : S.success },
                { label: 'Memory Usage', value: env.metrics.memory, unit: '%',  color: env.metrics.memory > 85 ? S.danger : env.metrics.memory > 70 ? S.warning : S.success },
                { label: 'Avg Latency',  value: env.metrics.latency, unit: 'ms', color: env.metrics.latency > 500 ? S.danger : env.metrics.latency > 200 ? S.warning : S.success },
              ].map(m => (
                <Card key={m.label} sx={{ flex: '1 1 140px', border: `1px solid ${t.border}`, bgcolor: 'rgba(148,163,184,.04)', boxShadow: 'none', borderRadius: '8px' }}>
                  <CardContent sx={{ p: '12px 14px !important' }}>
                    <Typography sx={{ fontSize: '.68rem', fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '.07em', fontFamily: FONT }}>{m.label}</Typography>
                    <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: m.color, lineHeight: 1.1, mt: 0.3, fontFamily: FONT }}>{m.value}<span style={{ fontSize: '.72rem', marginLeft: 2, color: t.textSecondary }}>{m.unit}</span></Typography>
                    <LinearProgress variant="determinate" value={Math.min(m.value / (m.unit === 'ms' ? 10 : 1), 100)}
                      sx={{ mt: 1, height: 4, borderRadius: 2, bgcolor: 'rgba(148,163,184,.15)', '& .MuiLinearProgress-bar': { bgcolor: m.color, borderRadius: 2 } }} />
                  </CardContent>
                </Card>
              ))}
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              {[
                { label: 'Network In',  value: env.metrics.networkIn },
                { label: 'Network Out', value: env.metrics.networkOut },
                { label: 'Throughput',  value: env.metrics.throughput },
              ].map(m => (
                <Card key={m.label} sx={{ flex: '1 1 140px', border: `1px solid ${t.border}`, bgcolor: 'rgba(148,163,184,.04)', boxShadow: 'none', borderRadius: '8px' }}>
                  <CardContent sx={{ p: '12px 14px !important' }}>
                    <Typography sx={{ fontSize: '.68rem', fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '.07em', fontFamily: FONT }}>{m.label}</Typography>
                    <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: S.info, lineHeight: 1.2, mt: 0.4, fontFamily: FONT }}>{m.value}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Stack>
        )}

        {scaleOpen && <ScaleDialog env={env} onClose={() => setScaleOpen(false)} />}
      </CardContent>
    </Card>
  )
}

// ─── Deployment History ───────────────────────────────────────────────────────

function DeploymentsTab({ envs }: { envs: Env[] }) {
  const all = envs.flatMap(env =>
    env.deployments.map(d => ({ ...d, env: env.id, envLabel: env.label, envColor: env.color }))
  ).sort((a, b) => a.when.localeCompare(b.when))

  return (
    <Card sx={{ border: `1px solid ${t.border}`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '10px' }}>
      <CardContent sx={{ p: '14px 18px !important' }}>
        <SectionTitle>All Deployment History</SectionTitle>
        <Table size="small">
          <TableHead>
            <TableRow>
              {['Version', 'Environment', 'By', 'When', 'Duration', 'Status', 'Actions'].map(h => (
                <TableCell key={h} sx={{ color: t.textSecondary, fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', borderColor: t.border, py: 0.75, fontFamily: FONT }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {all.map(d => (
              <TableRow key={d.id} sx={{ '& td': { borderColor: t.border } }}>
                <TableCell sx={{ py: 0.75 }}>
                  <Box component="code" sx={{ fontSize: '.75rem', bgcolor: 'rgba(148,163,184,.1)', px: 0.7, py: 0.2, borderRadius: 1, color: t.textPrimary }}>{d.version}</Box>
                </TableCell>
                <TableCell sx={{ py: 0.75 }}>
                  <Chip label={d.envLabel} size="small" sx={{ height: 18, fontSize: '.66rem', fontWeight: 700, bgcolor: d.envColor + '22', color: d.envColor, '& .MuiChip-label': { px: 0.7 } }} />
                </TableCell>
                <TableCell sx={{ fontSize: '.78rem', color: t.textSecondary, py: 0.75, fontFamily: FONT }}>{d.who}</TableCell>
                <TableCell sx={{ fontSize: '.78rem', color: t.textSecondary, py: 0.75, fontFamily: FONT }}>{d.when}</TableCell>
                <TableCell sx={{ fontSize: '.78rem', color: t.textSecondary, py: 0.75, fontFamily: FONT }}>{d.duration}</TableCell>
                <TableCell sx={{ py: 0.75 }}>
                  <Chip label={d.status} size="small" sx={{ height: 18, fontSize: '.66rem', fontWeight: 700, bgcolor: STATUS_BG[d.status] ?? 'rgba(148,163,184,.1)', color: STATUS_COLOR[d.status] ?? t.textSecondary, '& .MuiChip-label': { px: 0.7 } }} />
                </TableCell>
                <TableCell sx={{ py: 0.75 }}>
                  {d.canRollback && (
                    <Tooltip title="Rollback to this version">
                      <IconButton size="small" sx={{ color: S.warning }}>
                        <UndoIcon sx={{ fontSize: '.9rem' }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// ─── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab({ envs, onLockToggle, onPromote }: {
  envs:         Env[]
  onLockToggle: (id: EnvName) => void
  onPromote:    (from: EnvName) => void
}) {
  const totalServices = envs.reduce((a, e) => a + e.services.length, 0)

  return (
    <Stack spacing={2.5}>
      {/* Summary stats */}
      <Stack direction="row" spacing={1.5} flexWrap="wrap">
        {[
          { label: 'Environments', value: envs.length,       color: S.info    },
          { label: 'Healthy',      value: envs.filter(e => e.health === 'healthy').length,  color: S.success },
          { label: 'Degraded',     value: envs.filter(e => e.health === 'degraded').length, color: S.warning },
          { label: 'Total Services', value: totalServices,   color: S.purple  },
        ].map(s => (
          <Card key={s.label} sx={{ flex: '1 1 110px', border: `1px solid ${t.border}`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '8px' }}>
            <CardContent sx={{ p: '12px 14px !important' }}>
              <Typography sx={{ fontSize: '.7rem', fontWeight: 600, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '.07em', fontFamily: FONT }}>{s.label}</Typography>
              <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color: s.color, lineHeight: 1.2, fontFamily: FONT }}>{s.value}</Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Promote pipeline */}
      <Paper elevation={0} sx={{ border: `1px solid ${t.border}`, borderRadius: '10px', p: 2 }}>
        <SectionTitle>Deployment Pipeline</SectionTitle>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
          {envs.map((env, i) => (
            <React.Fragment key={env.id}>
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Box sx={{ px: 2, py: 1, borderRadius: '8px', border: `2px solid ${env.color}44`, bgcolor: env.bg }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '.85rem', color: env.color, fontFamily: FONT }}>{env.label}</Typography>
                  <Typography sx={{ fontSize: '.72rem', color: t.textSecondary, fontFamily: FONT }}>{env.version}</Typography>
                  <HealthBadge health={env.health} />
                </Box>
              </Box>
              {i < envs.length - 1 && (
                <ArrowForwardIcon sx={{ color: t.textSecondary, flexShrink: 0, fontSize: '1.1rem' }} />
              )}
            </React.Fragment>
          ))}
        </Stack>
      </Paper>

      {/* All env cards */}
      {envs.map(env => (
        <EnvDetailCard key={env.id} env={env} onLockToggle={onLockToggle} onPromote={onPromote} />
      ))}
    </Stack>
  )
}

// ─── Global Config tab (across all envs) ──────────────────────────────────────

function GlobalConfigTab({ envs }: { envs: Env[] }) {
  return (
    <Stack spacing={2.5}>
      {envs.map(env => (
        <Card key={env.id} sx={{ border: `1px solid ${env.color}44`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '10px' }}>
          <CardContent sx={{ p: '14px 18px !important' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: env.color, flexShrink: 0 }} />
              <Typography sx={{ fontWeight: 800, fontSize: '.92rem', color: t.textPrimary, fontFamily: FONT }}>{env.label}</Typography>
              <Chip label={env.version} size="small" sx={{ height: 18, fontSize: '.64rem', bgcolor: env.bg, color: env.color, fontWeight: 700, '& .MuiChip-label': { px: 0.8 } }} />
            </Stack>

            <SectionTitle>Environment Variables</SectionTitle>
            <Table size="small" sx={{ mb: 2 }}>
              <TableHead>
                <TableRow>
                  {['Key', 'Value', ''].map(h => (
                    <TableCell key={h} sx={{ color: t.textSecondary, fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', borderColor: t.border, py: 0.6, fontFamily: FONT }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {env.config.map(v => (
                  <TableRow key={v.key} sx={{ '& td': { borderColor: t.border } }}>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '.8rem', fontWeight: 700, color: t.textPrimary, py: 0.6 }}>{v.key}</TableCell>
                    <TableCell sx={{ fontSize: '.8rem', py: 0.6 }}>
                      {v.secret
                        ? <Chip label="secret" size="small" sx={{ height: 16, fontSize: '.62rem', bgcolor: 'rgba(239,68,68,.1)', color: S.danger, '& .MuiChip-label': { px: 0.6 } }} />
                        : <Box component="code" sx={{ fontSize: '.75rem', color: t.textPrimary, bgcolor: 'rgba(148,163,184,.08)', px: 0.6, py: 0.2, borderRadius: 1 }}>{v.value}</Box>
                      }
                    </TableCell>
                    <TableCell align="right" sx={{ py: 0.6 }}>
                      <IconButton size="small" sx={{ color: t.textSecondary }}><ContentCopyIcon sx={{ fontSize: '.75rem' }} /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <SectionTitle>Feature Flags</SectionTitle>
            <Stack spacing={0.6}>
              {env.featureFlags.map(flag => (
                <Box key={flag.key} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.2, py: 0.65, borderRadius: '6px', border: `1px solid ${t.border}`, bgcolor: 'rgba(148,163,184,.04)' }}>
                  <Box sx={{ width: 32, height: 18, borderRadius: '9px', bgcolor: flag.enabled ? S.success : 'rgba(148,163,184,.3)', display: 'flex', alignItems: 'center', px: 0.4, cursor: 'pointer', flexShrink: 0 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#fff', ml: flag.enabled ? 'auto' : 0 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontFamily: 'monospace', fontSize: '.79rem', fontWeight: 700, color: t.textPrimary }}>{flag.key}</Typography>
                    {flag.description && <Typography sx={{ fontFamily: FONT, fontSize: '.71rem', color: t.textSecondary }}>{flag.description}</Typography>}
                  </Box>
                  <Chip label={flag.enabled ? 'On' : 'Off'} size="small"
                    sx={{ height: 18, fontSize: '.62rem', fontWeight: 700, bgcolor: flag.enabled ? 'rgba(34,197,94,.1)' : 'rgba(148,163,184,.1)', color: flag.enabled ? S.success : t.textSecondary, '& .MuiChip-label': { px: 0.7 } }} />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  )
}

// ─── Global Secrets tab (across all envs) ─────────────────────────────────────

function GlobalSecretsTab({ envs }: { envs: Env[] }) {
  const [revealAll, setRevealAll] = useState<Record<string, boolean>>({})
  const [expandRot, setExpandRot] = useState<Record<string, boolean>>({})
  return (
    <Stack spacing={2.5}>
      {envs.map(env => (
        <Card key={env.id} sx={{ border: `1px solid ${env.color}44`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '10px' }}>
          <CardContent sx={{ p: '14px 18px !important' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: env.color, flexShrink: 0 }} />
              <Typography sx={{ fontWeight: 800, fontSize: '.92rem', color: t.textPrimary, fontFamily: FONT }}>{env.label}</Typography>
              {env.protected && (
                <Chip icon={<ShieldIcon sx={{ fontSize: '0.72rem !important' }} />} label="Protected" size="small"
                  sx={{ height: 18, fontSize: '.62rem', fontWeight: 700, bgcolor: 'rgba(239,68,68,.1)', color: S.danger, '& .MuiChip-label': { px: 0.6 } }} />
              )}
            </Stack>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Name', 'Type', 'Created', 'Expiry', 'History', ''].map(h => (
                    <TableCell key={h} sx={{ color: t.textSecondary, fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', borderColor: t.border, py: 0.6, fontFamily: FONT }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {env.secrets.map(sec => {
                  const key = `${env.id}:${sec.name}`
                  return (
                    <React.Fragment key={key}>
                      <TableRow sx={{ '& td': { borderColor: t.border } }}>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '.8rem', fontWeight: 700, color: t.textPrimary, py: 0.7 }}>{sec.name}</TableCell>
                        <TableCell sx={{ fontSize: '.76rem', color: t.textSecondary, py: 0.7, fontFamily: FONT }}>{sec.type}</TableCell>
                        <TableCell sx={{ fontSize: '.76rem', color: t.textSecondary, py: 0.7, fontFamily: FONT }}>{sec.created}</TableCell>
                        <TableCell sx={{ fontSize: '.76rem', py: 0.7 }}>
                          {sec.expiry && sec.expiry !== '—'
                            ? <Chip label={sec.expiry} size="small" sx={{ height: 17, fontSize: '.62rem', fontWeight: 600, bgcolor: 'rgba(245,158,11,.1)', color: S.warning, '& .MuiChip-label': { px: 0.6 } }} />
                            : <Typography sx={{ fontSize: '.76rem', color: t.textSecondary, fontFamily: FONT }}>—</Typography>
                          }
                        </TableCell>
                        <TableCell sx={{ py: 0.7 }}>
                          {sec.rotationHistory && (
                            <Chip
                              label={`${sec.rotationHistory.length} rotation${sec.rotationHistory.length !== 1 ? 's' : ''}`}
                              size="small" onClick={() => setExpandRot(p => ({ ...p, [key]: !p[key] }))}
                              icon={<HistoryIcon sx={{ fontSize: '.72rem !important' }} />}
                              sx={{ height: 18, fontSize: '.62rem', fontWeight: 700, cursor: 'pointer', bgcolor: 'rgba(0,224,255,.08)', color: S.info, '& .MuiChip-label': { px: 0.6 } }}
                            />
                          )}
                        </TableCell>
                        <TableCell align="right" sx={{ py: 0.7 }}>
                          <IconButton size="small" onClick={() => setRevealAll(p => ({ ...p, [key]: !p[key] }))} sx={{ color: t.textSecondary }}>
                            {revealAll[key] ? <VisibilityOffIcon sx={{ fontSize: '.8rem' }} /> : <VisibilityIcon sx={{ fontSize: '.8rem' }} />}
                          </IconButton>
                          <IconButton size="small" sx={{ color: S.danger }}><DeleteOutlineIcon sx={{ fontSize: '.8rem' }} /></IconButton>
                        </TableCell>
                      </TableRow>
                      {expandRot[key] && sec.rotationHistory?.map((r, ri) => (
                        <TableRow key={ri} sx={{ '& td': { borderColor: t.border, bgcolor: 'rgba(0,224,255,.025)' } }}>
                          <TableCell colSpan={6} sx={{ py: 0.5, pl: 3, fontSize: '.72rem', color: t.textSecondary, fontFamily: FONT }}>
                            ↳ Rotated on <strong style={{ color: t.textPrimary }}>{r.date}</strong> by <strong style={{ color: t.textPrimary }}>{r.by}</strong>
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </Stack>
  )
}

// ─── New Environment Wizard ───────────────────────────────────────────────────

const WIZARD_STEPS = ['General', 'Services', 'Config', 'Access & Review']

const ENV_TYPE_OPTIONS = [
  { value: 'development', label: 'Development', color: '#008080', bg: 'rgba(0,128,128,.12)' },
  { value: 'staging',     label: 'Staging',     color: '#a855f7', bg: 'rgba(168,85,247,.12)' },
  { value: 'production',  label: 'Production',  color: '#ef4444', bg: 'rgba(239,68,68,.12)'  },
  { value: 'testing',     label: 'Testing',     color: '#f59e0b', bg: 'rgba(245,158,11,.12)' },
  { value: 'custom',      label: 'Custom',      color: '#94a3b8', bg: 'rgba(148,163,184,.12)' },
]

const REGIONS = [
  'us-east-1', 'us-west-2', 'eu-west-1',
  'eu-central-1', 'ap-southeast-1', 'ap-northeast-1', 'ca-central-1',
]

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

interface WizardService { name: string; type: string; version: string; replicas: number }
interface WizardConfig  { key: string; value: string; secret: boolean }

interface NewEnvForm {
  name:        string
  id:          string
  multiMode:   boolean          // false = single type, true = pick multiple
  envType:     string           // used in single mode
  envTypes:    string[]         // used in multi mode
  region:      string
  description: string
  services:    WizardService[]
  config:      WizardConfig[]
  featureFlags: FeatureFlag[]
  locked:      boolean
  protected:   boolean
}

const EMPTY_FORM: NewEnvForm = {
  name: '', id: '', multiMode: false,
  envType: 'development', envTypes: [],
  region: 'us-east-1', description: '',
  services: [{ name: '', type: 'Deployment', version: '', replicas: 1 }],
  config: [{ key: '', value: '', secret: false }],
  featureFlags: [],
  locked: false, protected: false,
}

// shared input sx
const inputSx = {
  '& .MuiInputBase-root': { bgcolor: 'rgba(148,163,184,.06)', borderRadius: '6px', color: dashboardTokens.colors.textPrimary, fontSize: '.85rem' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: dashboardTokens.colors.border },
  '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: dashboardSemanticColors.info },
  '& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: dashboardSemanticColors.info },
  '& .MuiInputLabel-root': { color: dashboardTokens.colors.textSecondary, fontSize: '.82rem' },
  '& .MuiInputLabel-root.Mui-focused': { color: dashboardSemanticColors.info },
  '& .MuiSvgIcon-root': { color: dashboardTokens.colors.textSecondary },
}

function NewEnvironmentDialog({ onClose, onCreate }: {
  onClose:  () => void
  onCreate: (envs: Env[]) => void
}) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<NewEnvForm>(EMPTY_FORM)
  const [nameError, setNameError] = useState('')

  const patch = (partial: Partial<NewEnvForm>) => setForm(f => ({ ...f, ...partial }))

  /* ---- helpers ---- */
  const selectedType  = ENV_TYPE_OPTIONS.find(o => o.value === form.envType) ?? ENV_TYPE_OPTIONS[0]
  const selectedTypes = form.multiMode
    ? form.envTypes.map(v => ENV_TYPE_OPTIONS.find(o => o.value === v)!).filter(Boolean)
    : [selectedType]
  const willCreate    = selectedTypes.length

  const handleNameChange = (val: string) => {
    setNameError(val.trim() === '' ? 'Name is required' : '')
    patch({ name: val, id: slugify(val) })
  }

  const addService = () => patch({ services: [...form.services, { name: '', type: 'Deployment', version: '', replicas: 1 }] })
  const removeService = (i: number) => patch({ services: form.services.filter((_, idx) => idx !== i) })
  const patchService = (i: number, fld: Partial<WizardService>) =>
    patch({ services: form.services.map((s, idx) => idx === i ? { ...s, ...fld } : s) })

  const addConfigRow = () => patch({ config: [...form.config, { key: '', value: '', secret: false }] })
  const removeConfig = (i: number) => patch({ config: form.config.filter((_, idx) => idx !== i) })
  const patchConfig  = (i: number, fld: Partial<WizardConfig>) =>
    patch({ config: form.config.map((c, idx) => idx === i ? { ...c, ...fld } : c) })

  const canNext = () => {
    if (step === 0) {
      if (form.name.trim() === '') return false
      if (form.multiMode && form.envTypes.length === 0) return false
      return true
    }
    return true
  }

  /* ---- create ---- */
  const buildEnv = (typeValue: string, nameSuffix?: string): Env => {
    const typeOpt  = ENV_TYPE_OPTIONS.find(o => o.value === typeValue) ?? ENV_TYPE_OPTIONS[0]
    const envName  = nameSuffix ? `${form.name} ${typeOpt.label}` : form.name
    const envId    = nameSuffix ? `${form.id}-${slugify(typeOpt.label)}` : (form.id || 'custom-' + Date.now())
    return {
      id:          envId,
      label:       envName,
      color:       typeOpt.color,
      bg:          typeOpt.bg,
      protected:   typeValue === 'production' || form.protected,
      health:      'healthy',
      version:     'v0.1.0',
      errorRate:   '0.0%',
      lastDeploy:  'just now',
      locked:      typeValue === 'production' ? true : form.locked,
      services:    form.services.filter(s => s.name.trim()).map(s => ({
        name: s.name, type: s.type, status: 'running', version: s.version || 'latest', replicas: `${s.replicas}/${s.replicas}`,
      })),
      workloads:   form.services.filter(s => s.name.trim()).map(s => ({
        name: `${slugify(s.name)}-pod`, kind: s.type, namespace: envId, ready: `${s.replicas}/${s.replicas}`, status: 'Running',
      })),
      routes:      [],
      config:      form.config.filter(c => c.key.trim()),
      deployments: [],
      secrets:     [],
      featureFlags: form.featureFlags,
      metrics:     { cpu: 0, memory: 0, networkIn: '0 MB/h', networkOut: '0 MB/h', latency: 0, throughput: '0 req/s' },
    }
  }

  const handleCreate = () => {
    if (form.multiMode) {
      onCreate(form.envTypes.map(type => buildEnv(type, 'suffix')))
    } else {
      onCreate([buildEnv(form.envType)])
    }
  }

  const fieldLabel = (label: string) => (
    <Typography sx={{ fontFamily: FONT, fontSize: '.75rem', fontWeight: 700, color: dashboardTokens.colors.textSecondary, textTransform: 'uppercase', letterSpacing: '.06em', mb: 0.6 }}>
      {label}
    </Typography>
  )

  /* ═══════════════════════════════════════════════════════════════════════════
     STEP 0 — General Info
  ═══════════════════════════════════════════════════════════════════════════ */
  const Step0 = (
    <Stack spacing={2.5}>
      {/* Name */}
      <Box>
        {fieldLabel('Environment Name *')}
        <TextField
          fullWidth size="small" placeholder="e.g. QA, Hotfix, Preview"
          value={form.name} onChange={e => handleNameChange(e.target.value)}
          error={!!nameError} helperText={nameError || `Slug: ${form.id || '—'}`}
          sx={inputSx}
          FormHelperTextProps={{ sx: { fontFamily: FONT, fontSize: '.72rem', color: form.id ? dashboardSemanticColors.info : dashboardTokens.colors.textSecondary } }}
        />
      </Box>

      {/* Creation mode toggle */}
      <Box>
        {fieldLabel('Creation Mode')}
        <Stack direction="row" spacing={1}>
          {[
            { value: false, label: 'Single Environment',   desc: 'Create one environment with a specific type' },
            { value: true,  label: 'Multiple Environments', desc: 'Create Dev, Stage, Prod (or any combo) at once' },
          ].map(mode => (
            <Box
              key={String(mode.value)}
              onClick={() => patch({ multiMode: mode.value, envTypes: mode.value ? [] : [] })}
              sx={{
                flex: 1, px: 1.5, py: 1, borderRadius: '8px', cursor: 'pointer', transition: 'all .15s',
                border: `2px solid ${form.multiMode === mode.value ? dashboardSemanticColors.info : dashboardTokens.colors.border}`,
                bgcolor: form.multiMode === mode.value ? 'rgba(0,224,255,.08)' : 'transparent',
              }}
            >
              <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '.82rem', color: form.multiMode === mode.value ? dashboardSemanticColors.info : dashboardTokens.colors.textPrimary }}>
                {mode.label}
              </Typography>
              <Typography sx={{ fontFamily: FONT, fontSize: '.72rem', color: dashboardTokens.colors.textSecondary, mt: 0.2 }}>
                {mode.desc}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Type selector — single */}
      {!form.multiMode && (
        <Box>
          {fieldLabel('Environment Type')}
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {ENV_TYPE_OPTIONS.map(opt => (
              <Box
                key={opt.value}
                onClick={() => patch({ envType: opt.value, protected: opt.value === 'production' })}
                sx={{
                  px: 1.5, py: 0.8, borderRadius: '7px', cursor: 'pointer', transition: 'all .15s',
                  border: `2px solid ${form.envType === opt.value ? opt.color : dashboardTokens.colors.border}`,
                  bgcolor: form.envType === opt.value ? opt.bg : 'transparent',
                }}
              >
                <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '.8rem', color: form.envType === opt.value ? opt.color : dashboardTokens.colors.textSecondary }}>
                  {opt.label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {/* Type selector — multi */}
      {form.multiMode && (
        <Box>
          {fieldLabel('Select Environment Types (pick one or more)')}
          <Stack spacing={0.75}>
            {ENV_TYPE_OPTIONS.map(opt => {
              const selected = form.envTypes.includes(opt.value)
              const toggle   = () => patch({
                envTypes: selected
                  ? form.envTypes.filter(v => v !== opt.value)
                  : [...form.envTypes, opt.value],
              })
              return (
                <Box
                  key={opt.value}
                  onClick={toggle}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5,
                    px: 1.5, py: 1, borderRadius: '8px', cursor: 'pointer', transition: 'all .15s',
                    border: `2px solid ${selected ? opt.color : dashboardTokens.colors.border}`,
                    bgcolor: selected ? opt.bg : 'rgba(148,163,184,.03)',
                  }}
                >
                  {/* Checkbox visual */}
                  <Box sx={{
                    width: 18, height: 18, borderRadius: '4px', flexShrink: 0,
                    border: `2px solid ${selected ? opt.color : dashboardTokens.colors.border}`,
                    bgcolor: selected ? opt.color : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {selected && (
                      <Box component="span" sx={{ color: '#0a0f1a', fontSize: '.62rem', fontWeight: 900, lineHeight: 1 }}>✓</Box>
                    )}
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '.85rem', color: selected ? opt.color : dashboardTokens.colors.textPrimary }}>
                      {opt.label}
                    </Typography>
                    <Typography sx={{ fontFamily: FONT, fontSize: '.72rem', color: dashboardTokens.colors.textSecondary }}>
                      {{
                        development: 'Local dev, feature work, rapid iteration — unprotected',
                        staging:     'Pre-production validation, QA, integration testing',
                        production:  'Live traffic — auto-protected and locked on creation',
                        testing:     'Automated test suites, CI runners, ephemeral workloads',
                        custom:      'Custom role — configure protection and access manually',
                      }[opt.value]}
                    </Typography>
                  </Box>

                  {opt.value === 'production' && selected && (
                    <Chip label="Auto-protected" size="small"
                      sx={{ height: 18, fontSize: '.62rem', fontWeight: 700, bgcolor: 'rgba(239,68,68,.12)', color: dashboardSemanticColors.danger, '& .MuiChip-label': { px: 0.7 } }} />
                  )}
                </Box>
              )
            })}
          </Stack>

          {form.envTypes.length > 0 && (
            <Box sx={{ mt: 1.5, px: 1.25, py: 0.75, borderRadius: '6px', bgcolor: 'rgba(0,224,255,.06)', border: `1px solid rgba(0,224,255,.2)` }}>
              <Typography sx={{ fontFamily: FONT, fontSize: '.75rem', color: dashboardSemanticColors.info }}>
                <strong>{form.envTypes.length}</strong> environment{form.envTypes.length > 1 ? 's' : ''} will be created:&nbsp;
                {form.envTypes.map(v => ENV_TYPE_OPTIONS.find(o => o.value === v)?.label).join(', ')}
                {form.name.trim() && (
                  <> &nbsp;·&nbsp; Names: <em>{form.envTypes.map(v => `${form.name} ${ENV_TYPE_OPTIONS.find(o => o.value === v)?.label}`).join(', ')}</em></>
                )}
              </Typography>
            </Box>
          )}

          {form.envTypes.length === 0 && (
            <Typography sx={{ fontFamily: FONT, fontSize: '.75rem', color: dashboardSemanticColors.warning, mt: 1 }}>
              Select at least one environment type to continue.
            </Typography>
          )}
        </Box>
      )}

      {/* Region */}
      <Box>
        {fieldLabel('Region')}
        <Select fullWidth size="small" value={form.region} onChange={e => patch({ region: e.target.value })}
          input={<OutlinedInput />}
          sx={{ ...inputSx, '& .MuiSelect-select': { fontSize: '.85rem', color: dashboardTokens.colors.textPrimary, fontFamily: FONT } }}>
          {REGIONS.map(r => (
            <MenuItem key={r} value={r} sx={{ fontFamily: FONT, fontSize: '.82rem' }}>{r}</MenuItem>
          ))}
        </Select>
      </Box>

      {/* Description */}
      <Box>
        {fieldLabel('Description (optional)')}
        <TextField
          fullWidth size="small" multiline rows={2}
          placeholder="Describe the purpose of this environment…"
          value={form.description} onChange={e => patch({ description: e.target.value })}
          sx={inputSx}
        />
      </Box>
    </Stack>
  )

  /* ═══════════════════════════════════════════════════════════════════════════
     STEP 1 — Services
  ═══════════════════════════════════════════════════════════════════════════ */
  const Step1 = (
    <Stack spacing={1.5}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        {fieldLabel('Microservices & Containers')}
        <Button size="small" startIcon={<AddIcon sx={{ fontSize: '.8rem' }} />}
          onClick={addService}
          sx={{ fontSize: '.72rem', textTransform: 'none', fontWeight: 700, color: dashboardSemanticColors.info }}>
          Add Service
        </Button>
      </Stack>

      {form.services.map((svc, i) => (
        <Paper key={i} elevation={0} sx={{ p: 1.5, border: `1px solid ${dashboardTokens.colors.border}`, borderRadius: '8px', bgcolor: 'rgba(148,163,184,.04)' }}>
          <Stack direction="row" spacing={1} alignItems="flex-start" flexWrap="wrap">
            <TextField size="small" label="Service name" value={svc.name}
              onChange={e => patchService(i, { name: e.target.value })}
              sx={{ ...inputSx, flex: '2 1 140px' }} />
            <Select size="small" value={svc.type} onChange={e => patchService(i, { type: e.target.value })}
              sx={{ ...inputSx, flex: '1 1 120px', '& .MuiSelect-select': { fontSize: '.82rem', color: dashboardTokens.colors.textPrimary, fontFamily: FONT } }}>
              {['Deployment', 'StatefulSet', 'DaemonSet', 'CronJob', 'Job'].map(k => (
                <MenuItem key={k} value={k} sx={{ fontFamily: FONT, fontSize: '.82rem' }}>{k}</MenuItem>
              ))}
            </Select>
            <TextField size="small" label="Version / Tag" value={svc.version}
              onChange={e => patchService(i, { version: e.target.value })}
              placeholder="latest" sx={{ ...inputSx, flex: '1 1 100px' }} />
            <TextField size="small" label="Replicas" type="number"
              value={svc.replicas} onChange={e => patchService(i, { replicas: Number(e.target.value) })}
              inputProps={{ min: 1, max: 20 }} sx={{ ...inputSx, flex: '0 1 80px' }} />
            <IconButton size="small" onClick={() => removeService(i)}
              disabled={form.services.length === 1}
              sx={{ mt: 0.3, color: dashboardSemanticColors.danger, opacity: form.services.length === 1 ? 0.3 : 1 }}>
              <DeleteOutlineIcon sx={{ fontSize: '1rem' }} />
            </IconButton>
          </Stack>
        </Paper>
      ))}

      {form.services.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 3, color: dashboardTokens.colors.textSecondary }}>
          <Typography sx={{ fontFamily: FONT, fontSize: '.82rem' }}>No services added — you can add them after creation too.</Typography>
        </Box>
      )}
    </Stack>
  )

  /* ═══════════════════════════════════════════════════════════════════════════
     STEP 2 — Config & Secrets
  ═══════════════════════════════════════════════════════════════════════════ */
  const Step2 = (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        {fieldLabel('Environment Variables')}
        <Button size="small" startIcon={<AddIcon sx={{ fontSize: '.8rem' }} />}
          onClick={addConfigRow}
          sx={{ fontSize: '.72rem', textTransform: 'none', fontWeight: 700, color: dashboardSemanticColors.info }}>
          Add Variable
        </Button>
      </Stack>

      {form.config.map((cv, i) => (
        <Stack key={i} direction="row" spacing={1} alignItems="center">
          <TextField size="small" label="KEY" value={cv.key}
            onChange={e => patchConfig(i, { key: e.target.value })}
            sx={{ ...inputSx, flex: '1 1 120px', fontFamily: 'monospace' }} />
          <TextField size="small" label="Value" value={cv.value}
            onChange={e => patchConfig(i, { value: e.target.value })}
            type={cv.secret ? 'password' : 'text'}
            sx={{ ...inputSx, flex: '2 1 160px' }} />
          <Tooltip title={cv.secret ? 'Mark as plain text' : 'Mark as secret'}>
            <Box
              onClick={() => patchConfig(i, { secret: !cv.secret })}
              sx={{
                px: 1, py: 0.5, borderRadius: '5px', cursor: 'pointer', fontSize: '.68rem', fontWeight: 700, fontFamily: FONT,
                border: `1px solid ${cv.secret ? dashboardSemanticColors.danger : dashboardTokens.colors.border}`,
                color: cv.secret ? dashboardSemanticColors.danger : dashboardTokens.colors.textSecondary,
                bgcolor: cv.secret ? 'rgba(239,68,68,.08)' : 'transparent',
                whiteSpace: 'nowrap',
              }}>
              {cv.secret ? 'Secret' : 'Plain'}
            </Box>
          </Tooltip>
          <IconButton size="small" onClick={() => removeConfig(i)}
            disabled={form.config.length === 1}
            sx={{ color: dashboardSemanticColors.danger, opacity: form.config.length === 1 ? 0.3 : 1 }}>
            <DeleteOutlineIcon sx={{ fontSize: '1rem' }} />
          </IconButton>
        </Stack>
      ))}
    </Stack>
  )

  /* ═══════════════════════════════════════════════════════════════════════════
     STEP 3 — Access & Review
  ═══════════════════════════════════════════════════════════════════════════ */
  const validServices = form.services.filter(s => s.name.trim())
  const validConfig   = form.config.filter(c => c.key.trim())

  const Step3 = (
    <Stack spacing={2.5}>
      {/* Access toggles */}
      <Box>
        {fieldLabel('Access Control')}
        <Stack spacing={1}>
          <Paper elevation={0} sx={{ p: 1.25, border: `1px solid ${dashboardTokens.colors.border}`, borderRadius: '8px', bgcolor: 'rgba(148,163,184,.04)' }}>
            <FormControlLabel
              control={
                <Switch checked={form.locked} size="small"
                  onChange={e => patch({ locked: e.target.checked })}
                  sx={{ '& .MuiSwitch-thumb': { bgcolor: form.locked ? dashboardSemanticColors.warning : '#fff' }, '& .Mui-checked+.MuiSwitch-track': { bgcolor: dashboardSemanticColors.warning + '88' } }} />
              }
              label={
                <Box>
                  <Typography sx={{ fontFamily: FONT, fontSize: '.82rem', fontWeight: 700, color: dashboardTokens.colors.textPrimary }}>Lock environment</Typography>
                  <Typography sx={{ fontFamily: FONT, fontSize: '.72rem', color: dashboardTokens.colors.textSecondary }}>Prevent deployments until explicitly unlocked by a Maintainer or Admin</Typography>
                </Box>
              }
              sx={{ m: 0, alignItems: 'flex-start', gap: 1.5 }}
            />
          </Paper>
          <Paper elevation={0} sx={{ p: 1.25, border: `1px solid ${dashboardTokens.colors.border}`, borderRadius: '8px', bgcolor: 'rgba(148,163,184,.04)' }}>
            <FormControlLabel
              control={
                <Switch checked={form.protected} size="small"
                  onChange={e => patch({ protected: e.target.checked })}
                  sx={{ '& .MuiSwitch-thumb': { bgcolor: form.protected ? dashboardSemanticColors.danger : '#fff' }, '& .Mui-checked+.MuiSwitch-track': { bgcolor: dashboardSemanticColors.danger + '88' } }} />
              }
              label={
                <Box>
                  <Typography sx={{ fontFamily: FONT, fontSize: '.82rem', fontWeight: 700, color: dashboardTokens.colors.textPrimary }}>Protected environment</Typography>
                  <Typography sx={{ fontFamily: FONT, fontSize: '.72rem', color: dashboardTokens.colors.textSecondary }}>Required approvals before any deployment. Recommended for production-like environments</Typography>
                </Box>
              }
              sx={{ m: 0, alignItems: 'flex-start', gap: 1.5 }}
            />
          </Paper>
        </Stack>
      </Box>

      <Divider sx={{ borderColor: dashboardTokens.colors.border }} />

      {/* Review summary */}
      <Box>
        {fieldLabel('Review Summary')}
        <Stack spacing={1}>
          {/* Name + type row */}
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Paper elevation={0} sx={{ flex: 1, p: 1.25, border: `1px solid ${dashboardTokens.colors.border}`, borderRadius: '8px', bgcolor: 'rgba(148,163,184,.03)' }}>
              <Typography sx={{ fontFamily: FONT, fontSize: '.68rem', fontWeight: 700, color: dashboardTokens.colors.textSecondary, textTransform: 'uppercase', letterSpacing: '.07em', mb: 0.3 }}>Name</Typography>
              <Typography sx={{ fontFamily: FONT, fontSize: '.88rem', fontWeight: 800, color: dashboardTokens.colors.textPrimary }}>{form.name || '—'}</Typography>
              <Typography sx={{ fontFamily: 'monospace', fontSize: '.72rem', color: dashboardSemanticColors.info }}>{form.id ? `id: ${form.id}` : ''}</Typography>
            </Paper>
            <Paper elevation={0} sx={{ flex: 1, p: 1.25, border: `1px solid ${dashboardTokens.colors.border}`, borderRadius: '8px', bgcolor: 'rgba(148,163,184,.03)' }}>
              <Typography sx={{ fontFamily: FONT, fontSize: '.68rem', fontWeight: 700, color: dashboardTokens.colors.textSecondary, textTransform: 'uppercase', letterSpacing: '.07em', mb: 0.3 }}>Type{form.multiMode ? 's' : ''}</Typography>
              {form.multiMode ? (
                <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 0.3 }}>
                  {selectedTypes.map(opt => (
                    <Chip key={opt.value} label={opt.label} size="small"
                      sx={{ height: 20, fontSize: '.7rem', fontWeight: 700, bgcolor: opt.bg, color: opt.color, '& .MuiChip-label': { px: 0.8 } }} />
                  ))}
                  {selectedTypes.length === 0 && <Typography sx={{ fontFamily: FONT, fontSize: '.78rem', color: dashboardSemanticColors.warning }}>None selected</Typography>}
                </Stack>
              ) : (
                <Typography sx={{ fontFamily: FONT, fontSize: '.88rem', fontWeight: 800, color: selectedType.color }}>{selectedType.label}</Typography>
              )}
              <Typography sx={{ fontFamily: FONT, fontSize: '.72rem', color: dashboardTokens.colors.textSecondary, mt: 0.3 }}>{form.region}</Typography>
            </Paper>
          </Stack>
          {/* Services / Config counts */}
          <Stack direction="row" spacing={1}>
            {[
              { label: form.multiMode ? 'Environments' : 'Services', value: form.multiMode ? willCreate : validServices.length, color: dashboardSemanticColors.info   },
              { label: 'Variables',  value: validConfig.length,   color: dashboardSemanticColors.purple },
              { label: 'Protection', value: form.protected ? 'On' : 'Off', color: form.protected ? dashboardSemanticColors.danger : dashboardTokens.colors.textSecondary },
              { label: 'Locked',     value: form.locked ? 'Yes' : 'No',    color: form.locked    ? dashboardSemanticColors.warning : dashboardTokens.colors.textSecondary },
            ].map(s => (
              <Paper key={s.label} elevation={0}
                sx={{ flex: 1, textAlign: 'center', py: 1, border: `1px solid ${dashboardTokens.colors.border}`, borderRadius: '8px', bgcolor: 'rgba(148,163,184,.03)' }}>
                <Typography sx={{ fontFamily: FONT, fontSize: '1.1rem', fontWeight: 800, color: s.color }}>{s.value}</Typography>
                <Typography sx={{ fontFamily: FONT, fontSize: '.68rem', color: dashboardTokens.colors.textSecondary, textTransform: 'uppercase', letterSpacing: '.06em' }}>{s.label}</Typography>
              </Paper>
            ))}
          </Stack>
          {form.description && (
            <Paper elevation={0} sx={{ p: 1.25, border: `1px solid ${dashboardTokens.colors.border}`, borderRadius: '8px', bgcolor: 'rgba(148,163,184,.03)' }}>
              <Typography sx={{ fontFamily: FONT, fontSize: '.75rem', color: dashboardTokens.colors.textSecondary, fontStyle: 'italic' }}>"{form.description}"</Typography>
            </Paper>
          )}
        </Stack>
      </Box>
    </Stack>
  )

  const STEP_CONTENT = [Step0, Step1, Step2, Step3]
  const isLastStep   = step === WIZARD_STEPS.length - 1

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: dashboardTokens.colors.surface,
          border: `1px solid ${dashboardTokens.colors.border}`,
          borderRadius: '12px',
          backgroundImage: 'none',
        },
      }}
    >
      <DialogTitle sx={{ pb: 0, pt: 2.5, px: 3 }}>
        <Typography sx={{ fontFamily: FONT, fontWeight: 800, fontSize: '1.05rem', color: dashboardTokens.colors.textPrimary }}>
          Create New Environment
        </Typography>
        <Typography sx={{ fontFamily: FONT, fontSize: '.8rem', color: dashboardTokens.colors.textSecondary, mt: 0.3 }}>
          Step {step + 1} of {WIZARD_STEPS.length} — {WIZARD_STEPS[step]}
        </Typography>
      </DialogTitle>

      <Box sx={{ px: 3, pt: 2.5, pb: 1 }}>
        <Stepper activeStep={step} alternativeLabel
          sx={{
            '& .MuiStepLabel-label': { fontFamily: FONT, fontSize: '.72rem', color: dashboardTokens.colors.textSecondary, mt: 0.5 },
            '& .MuiStepLabel-label.Mui-active': { color: dashboardSemanticColors.info, fontWeight: 700 },
            '& .MuiStepLabel-label.Mui-completed': { color: dashboardSemanticColors.success },
            '& .MuiStepIcon-root': { color: dashboardTokens.colors.border, fontSize: '1.3rem' },
            '& .MuiStepIcon-root.Mui-active': { color: dashboardSemanticColors.info },
            '& .MuiStepIcon-root.Mui-completed': { color: dashboardSemanticColors.success },
            '& .MuiStepConnector-line': { borderColor: dashboardTokens.colors.border },
          }}
        >
          {WIZARD_STEPS.map(label => (
            <Step key={label}><StepLabel>{label}</StepLabel></Step>
          ))}
        </Stepper>
      </Box>

      <Divider sx={{ borderColor: dashboardTokens.colors.border }} />

      <DialogContent sx={{ px: 3, py: 2.5, maxHeight: '58vh', overflowY: 'auto' }}>
        {STEP_CONTENT[step]}
      </DialogContent>

      <Divider sx={{ borderColor: dashboardTokens.colors.border }} />

      <DialogActions sx={{ px: 3, py: 1.75, gap: 1 }}>
        <Button onClick={onClose} size="small"
          sx={{ fontFamily: FONT, textTransform: 'none', color: dashboardTokens.colors.textSecondary, mr: 'auto' }}>
          Cancel
        </Button>
        {step > 0 && (
          <Button size="small" variant="outlined" onClick={() => setStep(s => s - 1)}
            sx={{ fontFamily: FONT, textTransform: 'none', borderColor: dashboardTokens.colors.border, color: dashboardTokens.colors.textSecondary }}>
            Back
          </Button>
        )}
        {!isLastStep ? (
          <Button
            size="small" variant="contained"
            disabled={!canNext()}
            onClick={() => setStep(s => s + 1)}
            sx={{ fontFamily: FONT, textTransform: 'none', fontWeight: 700, bgcolor: dashboardSemanticColors.info, color: '#0a0f1a', boxShadow: 'none', '&:hover': { bgcolor: '#00c4e0', boxShadow: 'none' }, '&:disabled': { opacity: 0.4 } }}
          >
            Next →
          </Button>
        ) : (
          <Button
            size="small" variant="contained"
            disabled={!form.name.trim() || (form.multiMode && form.envTypes.length === 0)}
            startIcon={<CheckCircleIcon sx={{ fontSize: '.9rem' }} />}
            onClick={handleCreate}
            sx={{ fontFamily: FONT, textTransform: 'none', fontWeight: 700, bgcolor: dashboardSemanticColors.success, color: '#fff', boxShadow: 'none', '&:hover': { bgcolor: '#16a34a', boxShadow: 'none' }, '&:disabled': { opacity: 0.4 } }}
          >
            {form.multiMode && form.envTypes.length > 1
              ? `Create ${form.envTypes.length} Environments`
              : 'Create Environment'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

// ─── Root page ────────────────────────────────────────────────────────────────

const TOP_TABS = ['Overview', 'Dev', 'Stage', 'Prod', 'Deployments', 'Config', 'Secrets']

const DevEnvironmentPage: React.FC = () => {
  const [tab, setTab] = useState(0)
  const [envs, setEnvs] = useState<Env[]>(ENVS)
  const [promoteFrom, setPromoteFrom] = useState<EnvName | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const handleCreate = (newEnvs: Env[]) => {
    setEnvs(prev => [...prev, ...newEnvs])
    setCreateOpen(false)
    const label = newEnvs.length > 1
      ? `${newEnvs.length} environments created successfully.`
      : `Environment "${newEnvs[0].label}" created successfully.`
    setToast(label)
  }

  const toggleLock = (id: EnvName) => {
    setEnvs(prev => prev.map(e => e.id === id ? { ...e, locked: !e.locked } : e))
    const env = envs.find(e => e.id === id)!
    setToast(`${env.label} ${env.locked ? 'unlocked' : 'locked'}.`)
  }

  const envByTab: Array<CoreEnvId | null> = [null, 'dev', 'stage', 'prod', null, null, null]

  const getEnv = (id: EnvName) => envs.find(e => e.id === id)!
  const allEnvs   = envs  // includes any dynamically-created envs

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, fontFamily: FONT }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.2rem', md: '1.35rem' }, color: t.textPrimary, fontFamily: FONT, letterSpacing: '-.02em' }}>
            Environments
          </Typography>
          <Typography sx={{ color: t.textSecondary, fontSize: '.875rem', mt: 0.3, fontFamily: FONT }}>
            Dev → Stage → Prod — visibility, control, and traceability across your deployment pipeline.
          </Typography>
        </Box>
        <Button
          size="small" variant="contained"
          startIcon={<AddIcon sx={{ fontSize: '.85rem' }} />}
          onClick={() => setCreateOpen(true)}
          sx={{ fontWeight: 700, fontSize: '.78rem', borderRadius: '6px', textTransform: 'none', bgcolor: dashboardTokens.colors.brandPrimary, color: '#0a0f1a', boxShadow: 'none', '&:hover': { bgcolor: dashboardTokens.colors.brandPrimaryHover, boxShadow: 'none' } }}
        >
          New Environment
        </Button>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 2.5, borderBottom: `1px solid ${t.border}`, minHeight: 38,
          '& .MuiTab-root': { fontFamily: FONT, fontSize: '.82rem', fontWeight: 600, textTransform: 'none', minHeight: 38, color: t.textSecondary, px: 1.5 },
          '& .Mui-selected': { color: dashboardTokens.colors.brandPrimary },
          '& .MuiTabs-indicator': { bgcolor: dashboardTokens.colors.brandPrimary, height: 2 },
        }}
      >
        {TOP_TABS.map((l, i) => {
          const envId = envByTab[i] as EnvName | null
          const envData = envId ? envs.find(e => e.id === envId) : null
          const dotColor = envData ? HEALTH_COLOR[envData.health] : undefined
          return (
            <Tab key={l} label={
              <Stack direction="row" spacing={0.6} alignItems="center">
                {dotColor && <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: dotColor }} />}
                <span>{l}</span>
              </Stack>
            } />
          )
        })}
      </Tabs>

      {/* Content */}
      {tab === 0 && <OverviewTab envs={allEnvs} onLockToggle={toggleLock} onPromote={setPromoteFrom} />}
      {tab === 1 && <EnvDetailCard env={getEnv('dev')}   onLockToggle={toggleLock} onPromote={setPromoteFrom} />}
      {tab === 2 && <EnvDetailCard env={getEnv('stage')} onLockToggle={toggleLock} onPromote={setPromoteFrom} />}
      {tab === 3 && <EnvDetailCard env={getEnv('prod')}  onLockToggle={toggleLock} onPromote={setPromoteFrom} />}
      {tab === 4 && <DeploymentsTab envs={allEnvs} />}
      {tab === 5 && <GlobalConfigTab  envs={allEnvs} />}
      {tab === 6 && <GlobalSecretsTab envs={allEnvs} />}

      {/* New environment wizard */}
      {createOpen && <NewEnvironmentDialog onClose={() => setCreateOpen(false)} onCreate={handleCreate} />}

      {/* Promote dialog */}
      {promoteFrom && (
        <PromoteDialog
          from={promoteFrom}
          to={promoteFrom === 'dev' ? 'stage' : 'prod'}
          onClose={() => {
            setToast(`Promotion from ${promoteFrom} triggered.`)
            setPromoteFrom(null)
          }}
        />
      )}

      <Snackbar open={Boolean(toast)} autoHideDuration={4000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="info" onClose={() => setToast(null)} sx={{ fontFamily: FONT }}>{toast}</Alert>
      </Snackbar>
    </Box>
  )
}

export default DevEnvironmentPage
