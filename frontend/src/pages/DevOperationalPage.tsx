// AtonixCorp Cloud — Operational (NOC)
// Overview · Jobs · Alerts · Incidents · Audit Logs · Metrics

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
  IconButton,
  LinearProgress,
  Paper,
  Snackbar,
  Stack,
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
import InfoOutlinedIcon     from '@mui/icons-material/InfoOutlined'
import PlayArrowIcon        from '@mui/icons-material/PlayArrow'
import StopIcon             from '@mui/icons-material/Stop'
import ReplayIcon           from '@mui/icons-material/Replay'
import BuildIcon            from '@mui/icons-material/Build'
import SpeedIcon            from '@mui/icons-material/Speed'
import AccessTimeIcon       from '@mui/icons-material/AccessTime'
import TrendingUpIcon       from '@mui/icons-material/TrendingUp'
import StorageIcon          from '@mui/icons-material/Storage'
import MemoryIcon           from '@mui/icons-material/Memory'
import NetworkCheckIcon     from '@mui/icons-material/NetworkCheck'
import ScheduleIcon         from '@mui/icons-material/Schedule'
import AssignmentIcon       from '@mui/icons-material/Assignment'
import PersonIcon           from '@mui/icons-material/Person'
import GppGoodIcon          from '@mui/icons-material/GppGood'
import FilterListIcon       from '@mui/icons-material/FilterList'
import AddIcon              from '@mui/icons-material/Add'
import EditNoteIcon         from '@mui/icons-material/EditNote'
import SearchIcon           from '@mui/icons-material/Search'
import RefreshIcon          from '@mui/icons-material/Refresh'
import LanIcon              from '@mui/icons-material/Lan'

import { dashboardTokens, dashboardSemanticColors } from '../styles/dashboardDesignSystem'

// ─── Design tokens ────────────────────────────────────────────────────────────

const FONT = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
const t    = dashboardTokens.colors
const S    = dashboardSemanticColors

// ─── Types ────────────────────────────────────────────────────────────────────

type Severity   = 'info' | 'warning' | 'critical'
type JobStatus  = 'running' | 'scheduled' | 'failed' | 'pending' | 'success'
type IncStatus  = 'open' | 'investigating' | 'resolved'
type ServiceStatus = 'running' | 'degraded' | 'stopped'
type RunbookStatus = 'success' | 'running' | 'failed' | 'pending'

interface Service {
  name: string; status: ServiceStatus; uptime: string; cpu: number; memory: number
  requests: string; errorRate: string; version: string
}
interface Runbook {
  id: string; name: string; description: string; status: RunbookStatus
  lastRun: string; duration: string; owner: string
}
interface Job {
  id: string; name: string; type: 'scheduled' | 'background' | 'async'
  status: JobStatus; queue: string; schedule?: string
  lastRun: string; nextRun?: string; duration: string; retries: number; error?: string
}
interface AlertItem {
  id: string; title: string; severity: Severity; source: string
  service: string; since: string; count: number; resolved: boolean
}
interface Incident {
  id: string; title: string; status: IncStatus; severity: Severity
  openedAt: string; resolvedAt?: string; assignedTo: string[]
  rootCause?: string; resolution?: string
  timeline: Array<{ time: string; actor: string; note: string }>
}
interface AuditEntry {
  id: string; who: string; action: string; resource: string
  when: string; ip: string; result: 'success' | 'denied'
}
interface NodeMetrics {
  node: string; role: string; cpu: number; memory: number; disk: number; pods: string; status: 'Ready' | 'NotReady'
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const SERVICES: Service[] = [
  { name: 'api-gateway',      status: 'running',  uptime: '99.98%', cpu: 34, memory: 52, requests: '12.4k/min', errorRate: '0.02%', version: 'v2.4.1' },
  { name: 'payment-service',  status: 'running',  uptime: '99.95%', cpu: 61, memory: 74, requests: '3.1k/min',  errorRate: '0.08%', version: 'v1.9.3' },
  { name: 'auth-service',     status: 'running',  uptime: '100%',   cpu: 18, memory: 38, requests: '8.7k/min',  errorRate: '0.00%', version: 'v3.1.0' },
  { name: 'events-worker',    status: 'degraded', uptime: '97.20%', cpu: 88, memory: 91, requests: '450/min',   errorRate: '2.30%', version: 'v1.2.7' },
  { name: 'web-frontend',     status: 'running',  uptime: '99.99%', cpu: 12, memory: 29, requests: '24k/min',   errorRate: '0.01%', version: 'v5.0.2' },
  { name: 'kafka-consumer',   status: 'stopped',  uptime: '—',      cpu: 0,  memory: 0,  requests: '—',         errorRate: '—',     version: 'v0.8.4' },
]

const RUNBOOKS: Runbook[] = [
  { id: 'r1', name: 'Rollback production',  description: 'Revert latest deployment to previous stable version', status: 'success', lastRun: '2 hours ago', duration: '4m 12s', owner: 'Frank' },
  { id: 'r2', name: 'Restart events-worker',description: 'Gracefully restart all events-worker pods',           status: 'running', lastRun: 'Just now',    duration: '—',      owner: 'Jane'  },
  { id: 'r3', name: 'DB connection flush',  description: 'Flush stale connections from the connection pool',    status: 'failed',  lastRun: '1 day ago',  duration: '1m 05s', owner: 'Frank' },
  { id: 'r4', name: 'Cache warm-up',        description: 'Pre-warm Redis cache for peak traffic windows',        status: 'pending', lastRun: 'Never',       duration: '—',      owner: 'Sarah' },
  { id: 'r5', name: 'SSL cert renewal',     description: 'Auto-renew expiring TLS certificates',                status: 'success', lastRun: '3 days ago',  duration: '22s',    owner: 'Ops Bot' },
]

const MOCK_JOBS: Job[] = [
  { id:'j1',  name:'nightly-db-backup',     type:'scheduled',  status:'success',   queue:'ops',     schedule:'0 2 * * *',  lastRun:'6h ago',    nextRun:'in 18h', duration:'4m 12s', retries:0 },
  { id:'j2',  name:'send-billing-emails',   type:'scheduled',  status:'running',   queue:'email',   schedule:'0 8 * * 1',  lastRun:'just now',  nextRun:'in 7d',  duration:'—',      retries:0 },
  { id:'j3',  name:'events-worker@1',       type:'background', status:'running',   queue:'events',  lastRun:'continuous',                        duration:'—',      retries:0 },
  { id:'j4',  name:'events-worker@2',       type:'background', status:'running',   queue:'events',  lastRun:'continuous',                        duration:'—',      retries:0 },
  { id:'j5',  name:'stripe-webhook-handler',type:'async',      status:'failed',    queue:'payments',lastRun:'2m ago',                            duration:'320ms',  retries:3, error:'Stripe API 503: Service Unavailable' },
  { id:'j6',  name:'image-resize-worker',   type:'background', status:'pending',   queue:'media',   lastRun:'5m ago',                            duration:'—',      retries:0 },
  { id:'j7',  name:'ssl-cert-renewal',      type:'scheduled',  status:'success',   queue:'ops',     schedule:'0 3 1 * *',  lastRun:'3d ago',    nextRun:'in 27d', duration:'22s',    retries:0 },
  { id:'j8',  name:'cache-warm-up',         type:'scheduled',  status:'scheduled', queue:'ops',     schedule:'30 5 * * *', lastRun:'yesterday', nextRun:'in 14h', duration:'1m 44s', retries:0 },
  { id:'j9',  name:'log-aggregation',       type:'background', status:'running',   queue:'logs',    lastRun:'continuous',                        duration:'—',      retries:0 },
  { id:'j10', name:'dead-letter-requeue',   type:'async',      status:'failed',    queue:'ops',     lastRun:'18m ago',                           duration:'50ms',   retries:5, error:'Max retries exceeded: queue full' },
]

const MOCK_ALERTS: AlertItem[] = [
  { id:'a1', title:'events-worker CPU > 85%',         severity:'critical', source:'Kubernetes', service:'events-worker',   since:'18m ago', count:4,  resolved:false },
  { id:'a2', title:'payment-service latency > 800ms', severity:'warning',  source:'API Gateway',service:'payment-service', since:'32m ago', count:12, resolved:false },
  { id:'a3', title:'stripe-webhook job failure ×3',   severity:'critical', source:'Job Queue',  service:'payments',        since:'2m ago',  count:3,  resolved:false },
  { id:'a4', title:'Dead-letter queue depth > 500',   severity:'warning',  source:'RabbitMQ',   service:'events',          since:'1h ago',  count:2,  resolved:false },
  { id:'a5', title:'DB slow query > 2s (pg_stat)',    severity:'warning',  source:'Database',   service:'postgres',        since:'45m ago', count:8,  resolved:false },
  { id:'a6', title:'Node worker-2 memory > 90%',      severity:'critical', source:'Kubernetes', service:'node/worker-2',   since:'5m ago',  count:1,  resolved:false },
  { id:'a7', title:'SSL cert expiring in 14 days',    severity:'info',     source:'TLS Monitor',service:'api.atonixcorp.io',since:'1d ago', count:1,  resolved:false },
  { id:'a8', title:'CDN cache hit rate dropped 62%',  severity:'info',     source:'CDN',        service:'cdn-edge',        since:'3h ago',  count:1,  resolved:true  },
]

const MOCK_INCIDENTS: Incident[] = [
  {
    id:'INC-001', title:'events-worker pod OOMKilled causing queue backlog',
    status:'investigating', severity:'critical', openedAt:'2026-02-25 09:04',
    assignedTo:['alice.chen','john.doe'],
    timeline:[
      { time:'09:04', actor:'System',     note:'Alert: events-worker CPU > 85% — incident auto-created' },
      { time:'09:06', actor:'alice.chen', note:'Acknowledged. Investigating pod resource limits.' },
      { time:'09:12', actor:'john.doe',   note:'Confirmed OOMKilled on events-worker@2. Increased memory limit to 512Mi.' },
      { time:'09:18', actor:'alice.chen', note:'Dead-letter queue depth now at 820. Triggering requeue job.' },
    ],
  },
  {
    id:'INC-002', title:'Stripe webhook handler degraded — downstream 503',
    status:'investigating', severity:'critical', openedAt:'2026-02-25 09:22',
    assignedTo:['john.doe'],
    timeline:[
      { time:'09:22', actor:'System',   note:'Alert: stripe-webhook-handler failed ×3' },
      { time:'09:24', actor:'john.doe', note:'Stripe API returning 503. Checking Stripe status page.' },
    ],
  },
  {
    id:'INC-003', title:'Scheduled DB backup exceeded 10-minute SLA',
    status:'resolved', severity:'warning', openedAt:'2026-02-24 02:00', resolvedAt:'2026-02-24 02:28',
    assignedTo:['infra-bot'],
    rootCause: 'Backup destination S3 bucket throttled due to rate limits during peak window.',
    resolution:'Added exponential back-off to backup agent. Quota increased. Backup completed at 02:28.',
    timeline:[
      { time:'02:00', actor:'System',    note:'Backup job started' },
      { time:'02:10', actor:'System',    note:'SLA breach: job running > 10 minutes' },
      { time:'02:15', actor:'infra-bot', note:'S3 throttle detected — retrying with back-off' },
      { time:'02:28', actor:'infra-bot', note:'Backup completed successfully. Incident resolved.' },
    ],
  },
]

const MOCK_AUDIT: AuditEntry[] = [
  { id:'au1',  who:'alice.chen', action:'ENV_LOCKED',       resource:'environment/production',   when:'09:18:32', ip:'192.168.1.45',  result:'success' },
  { id:'au2',  who:'john.doe',   action:'DEPLOY_TRIGGERED', resource:'environment/staging',      when:'09:15:04', ip:'10.0.0.12',     result:'success' },
  { id:'au3',  who:'john.doe',   action:'K8S_SCALE',        resource:'deployment/events-worker', when:'09:12:10', ip:'10.0.0.12',     result:'success' },
  { id:'au4',  who:'alice.chen', action:'SECRET_ROTATED',   resource:'secret/db-credentials',    when:'09:10:55', ip:'192.168.1.45',  result:'success' },
  { id:'au5',  who:'bob.smith',  action:'ENV_PROMOTE',      resource:'environment/dev→stage',    when:'08:55:22', ip:'203.0.113.88',  result:'denied'  },
  { id:'au6',  who:'infra-bot',  action:'JOB_RETRY',        resource:'job/dead-letter-requeue',  when:'08:48:01', ip:'10.0.0.1',      result:'success' },
  { id:'au7',  who:'alice.chen', action:'USER_LOGIN',       resource:'auth/session',             when:'08:30:14', ip:'192.168.1.45',  result:'success' },
  { id:'au8',  who:'unknown',    action:'USER_LOGIN',       resource:'auth/session',             when:'08:29:51', ip:'185.234.218.7', result:'denied'  },
  { id:'au9',  who:'john.doe',   action:'CONFIG_UPDATE',    resource:'environment/dev/config',   when:'08:12:33', ip:'10.0.0.12',     result:'success' },
  { id:'au10', who:'sarah.ops',  action:'RUNBOOK_RUN',      resource:'runbook/ssl-cert-renewal', when:'06:00:22', ip:'10.0.0.15',     result:'success' },
]

const MOCK_NODES: NodeMetrics[] = [
  { node:'master-1', role:'Control Plane', cpu:22, memory:44, disk:38, pods:'12/110', status:'Ready'    },
  { node:'worker-1', role:'Worker',        cpu:61, memory:72, disk:54, pods:'28/110', status:'Ready'    },
  { node:'worker-2', role:'Worker',        cpu:88, memory:91, disk:67, pods:'34/110', status:'Ready'    },
  { node:'worker-3', role:'Worker',        cpu:41, memory:55, disk:42, pods:'22/110', status:'Ready'    },
  { node:'infra-1',  role:'Infra',         cpu:18, memory:36, disk:72, pods:'6/110',  status:'NotReady' },
]

// ─── Colour helpers ────────────────────────────────────────────────────────────

const SEV_COLOR: Record<Severity, string>     = { info: S.info, warning: S.warning, critical: S.danger }
const SEV_BG:    Record<Severity, string>     = { info:'rgba(0,224,255,.1)', warning:'rgba(245,158,11,.1)', critical:'rgba(239,68,68,.1)' }
const JOB_COLOR: Record<JobStatus, string>    = { running:S.info, scheduled:S.purple, failed:S.danger, pending:S.warning, success:S.success }
const JOB_BG:    Record<JobStatus, string>    = { running:'rgba(0,224,255,.1)', scheduled:'rgba(139,92,246,.1)', failed:'rgba(239,68,68,.1)', pending:'rgba(245,158,11,.1)', success:'rgba(34,197,94,.1)' }
const INC_COLOR: Record<IncStatus, string>    = { open:S.danger, investigating:S.warning, resolved:S.success }
const SVC_STATUS_COLOR: Record<ServiceStatus,string> = { running:S.success, degraded:S.warning, stopped:S.danger }
const SVC_STATUS_BG:    Record<ServiceStatus,string> = { running:'rgba(34,197,94,.12)', degraded:'rgba(245,158,11,.12)', stopped:'rgba(239,68,68,.12)' }
const RB_STATUS_COLOR:  Record<RunbookStatus,string> = { success:S.success, running:S.info, failed:S.danger, pending:S.warning }
const RB_STATUS_BG:     Record<RunbookStatus,string> = { success:'rgba(34,197,94,.12)', running:'rgba(0,224,255,.12)', failed:'rgba(239,68,68,.12)', pending:'rgba(245,158,11,.12)' }

// ─── Shared helpers ────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{ fontSize:'.7rem', fontWeight:700, color:t.textSecondary, textTransform:'uppercase', letterSpacing:'.09em', fontFamily:FONT, mb:1.25 }}>
      {children}
    </Typography>
  )
}

function StatCard({ label, value, color, icon }: { label:string; value:string|number; color:string; icon:React.ReactNode }) {
  return (
    <Card sx={{ flex:'1 1 120px', border:`1px solid ${t.border}`, bgcolor:t.surface, boxShadow:'none', borderRadius:'8px' }}>
      <CardContent sx={{ p:'12px 16px !important' }}>
        <Box sx={{ display:'flex', alignItems:'center', gap:.75, mb:.4, color }}>
          {icon}
          <Typography sx={{ fontSize:'.7rem', fontWeight:700, color:t.textSecondary, textTransform:'uppercase', letterSpacing:'.08em', fontFamily:FONT }}>{label}</Typography>
        </Box>
        <Typography sx={{ fontSize:'1.45rem', fontWeight:800, color, lineHeight:1.2, fontFamily:FONT }}>{value}</Typography>
      </CardContent>
    </Card>
  )
}

function UsageBar({ value, small }: { value:number; small?:boolean }) {
  const color = value >= 80 ? S.danger : value >= 60 ? S.warning : S.success
  return (
    <Box sx={{ display:'flex', alignItems:'center', gap:1, minWidth:small?60:90 }}>
      <LinearProgress variant="determinate" value={value}
        sx={{ flex:1, height:small?4:5, borderRadius:3, bgcolor:`${color}22`, '& .MuiLinearProgress-bar':{ bgcolor:color, borderRadius:3 } }} />
      <Typography sx={{ fontSize:'.72rem', fontWeight:600, color, fontFamily:FONT, minWidth:26, textAlign:'right' }}>{value}%</Typography>
    </Box>
  )
}

function SevBadge({ sev }: { sev: Severity }) {
  const Icon = sev === 'info' ? InfoOutlinedIcon : sev === 'warning' ? WarningAmberIcon : ErrorIcon
  return (
    <Box sx={{ display:'inline-flex', alignItems:'center', gap:.4, px:.75, py:.2, borderRadius:1, bgcolor:SEV_BG[sev] }}>
      <Icon sx={{ fontSize:'.72rem', color:SEV_COLOR[sev] }} />
      <Typography sx={{ fontSize:'.68rem', fontWeight:700, color:SEV_COLOR[sev], textTransform:'capitalize', fontFamily:FONT }}>{sev}</Typography>
    </Box>
  )
}

const SvcStatusIcon: React.FC<{ s: ServiceStatus }> = ({ s }) => {
  const props = { sx: { fontSize: '.78rem' } }
  if (s === 'running')  return <CheckCircleIcon  {...props} />
  if (s === 'degraded') return <WarningAmberIcon {...props} />
  return <ErrorIcon {...props} />
}

// ─── Overview ─────────────────────────────────────────────────────────────────

function OverviewTab() {
  const activeAlerts   = MOCK_ALERTS.filter(a => !a.resolved)
  const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical').length
  const runningJobs    = MOCK_JOBS.filter(j => j.status === 'running').length
  const failedJobs     = MOCK_JOBS.filter(j => j.status === 'failed').length
  const openIncidents  = MOCK_INCIDENTS.filter(i => i.status !== 'resolved').length

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" flexWrap="wrap" spacing={1.5} useFlexGap>
        <StatCard label="Uptime"         value="99.97%"              color={S.success} icon={<TrendingUpIcon sx={{ fontSize:'1rem' }} />} />
        <StatCard label="Active Alerts"  value={activeAlerts.length} color={criticalAlerts > 0 ? S.danger : S.warning} icon={<WarningAmberIcon sx={{ fontSize:'1rem' }} />} />
        <StatCard label="Critical"       value={criticalAlerts}      color={S.danger}  icon={<ErrorIcon sx={{ fontSize:'1rem' }} />} />
        <StatCard label="Open Incidents" value={openIncidents}       color={openIncidents > 0 ? S.danger : S.success} icon={<AssignmentIcon sx={{ fontSize:'1rem' }} />} />
        <StatCard label="Running Jobs"   value={runningJobs}         color={S.info}    icon={<ScheduleIcon sx={{ fontSize:'1rem' }} />} />
        <StatCard label="Failed Jobs"    value={failedJobs}          color={failedJobs > 0 ? S.danger : S.success} icon={<BuildIcon sx={{ fontSize:'1rem' }} />} />
        <StatCard label="API p95"        value="84 ms"               color={S.success} icon={<SpeedIcon sx={{ fontSize:'1rem' }} />} />
        <StatCard label="API p99"        value="192 ms"              color={S.warning} icon={<SpeedIcon sx={{ fontSize:'1rem' }} />} />
      </Stack>

      <Stack direction={{ xs:'column', md:'row' }} spacing={2}>
        {/* Active alerts preview */}
        <Card sx={{ flex:2, border:`1px solid ${t.border}`, bgcolor:t.surface, boxShadow:'none', borderRadius:'10px' }}>
          <CardContent sx={{ p:'14px 18px !important' }}>
            <SectionTitle>Active Alerts</SectionTitle>
            <Stack spacing={.75}>
              {activeAlerts.slice(0,5).map(a => (
                <Box key={a.id} sx={{ display:'flex', alignItems:'center', gap:1, py:.5, borderBottom:`1px solid ${t.border}` }}>
                  <SevBadge sev={a.severity} />
                  <Typography sx={{ flex:1, fontSize:'.82rem', fontWeight:600, color:t.textPrimary, fontFamily:FONT }}>{a.title}</Typography>
                  <Typography sx={{ fontSize:'.72rem', color:t.textSecondary, fontFamily:FONT, whiteSpace:'nowrap' }}>{a.since}</Typography>
                  <Chip label={a.source} size="small" sx={{ height:17, fontSize:'.62rem', bgcolor:'rgba(148,163,184,.1)', color:t.textSecondary, '& .MuiChip-label':{ px:.6 } }} />
                </Box>
              ))}
              {activeAlerts.length > 5 && (
                <Typography sx={{ fontSize:'.75rem', color:S.info, fontFamily:FONT, pt:.5 }}>+{activeAlerts.length - 5} more alerts</Typography>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Queue health */}
        <Card sx={{ flex:1, border:`1px solid ${t.border}`, bgcolor:t.surface, boxShadow:'none', borderRadius:'10px' }}>
          <CardContent sx={{ p:'14px 18px !important' }}>
            <SectionTitle>Queue Health</SectionTitle>
            <Stack spacing={1}>
              {[
                { name:'events',   depth:820, limit:1000 },
                { name:'payments', depth:12,  limit:1000 },
                { name:'email',    depth:4,   limit:500  },
                { name:'media',    depth:154, limit:500  },
                { name:'ops',      depth:3,   limit:200  },
              ].map(q => {
                const pct   = Math.round((q.depth / q.limit) * 100)
                const color = pct > 80 ? S.danger : pct > 50 ? S.warning : S.success
                return (
                  <Box key={q.name}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb:.3 }}>
                      <Typography sx={{ fontFamily:'monospace', fontSize:'.78rem', color:t.textPrimary, fontWeight:600 }}>{q.name}</Typography>
                      <Typography sx={{ fontFamily:FONT, fontSize:'.72rem', color, fontWeight:700 }}>{q.depth} / {q.limit}</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={pct}
                      sx={{ height:4, borderRadius:2, bgcolor:`${color}22`, '& .MuiLinearProgress-bar':{ bgcolor:color, borderRadius:2 } }} />
                  </Box>
                )
              })}
            </Stack>
          </CardContent>
        </Card>

        {/* Storage */}
        <Card sx={{ flex:1, border:`1px solid ${t.border}`, bgcolor:t.surface, boxShadow:'none', borderRadius:'10px' }}>
          <CardContent sx={{ p:'14px 18px !important' }}>
            <SectionTitle>Storage Usage</SectionTitle>
            <Stack spacing={1}>
              {[
                { name:'media-bucket',   used:'142 GB', pct:56, limit:'250 GB' },
                { name:'backups-bucket', used:'89 GB',  pct:44, limit:'200 GB' },
                { name:'logs-volume',    used:'31 GB',  pct:78, limit:'40 GB'  },
                { name:'pg-volume',      used:'18 GB',  pct:36, limit:'50 GB'  },
                { name:'redis-volume',   used:'2 GB',   pct:13, limit:'16 GB'  },
              ].map(s => {
                const color = s.pct > 80 ? S.danger : s.pct > 60 ? S.warning : S.success
                return (
                  <Box key={s.name}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb:.3 }}>
                      <Typography sx={{ fontFamily:'monospace', fontSize:'.75rem', color:t.textPrimary }}>{s.name}</Typography>
                      <Typography sx={{ fontFamily:FONT, fontSize:'.72rem', color, fontWeight:700 }}>{s.used} / {s.limit}</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={s.pct}
                      sx={{ height:4, borderRadius:2, bgcolor:`${color}22`, '& .MuiLinearProgress-bar':{ bgcolor:color, borderRadius:2 } }} />
                  </Box>
                )
              })}
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Worker status */}
      <Card sx={{ border:`1px solid ${t.border}`, bgcolor:t.surface, boxShadow:'none', borderRadius:'10px' }}>
        <CardContent sx={{ p:'14px 18px !important' }}>
          <SectionTitle>Worker Status</SectionTitle>
          <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap>
            {[
              { name:'events-worker@1',  status:'online',  load:78 },
              { name:'events-worker@2',  status:'online',  load:92 },
              { name:'email-worker@1',   status:'online',  load:18 },
              { name:'media-worker@1',   status:'idle',    load:4  },
              { name:'ops-worker@1',     status:'online',  load:34 },
              { name:'log-aggregator@1', status:'online',  load:27 },
              { name:'payment-worker@1', status:'offline', load:0  },
            ].map(w => {
              const sc = w.status === 'online' ? S.success : w.status === 'idle' ? S.warning : S.danger
              return (
                <Box key={w.name} sx={{ px:1.25, py:.75, borderRadius:'7px', border:`1px solid ${sc}44`, bgcolor:`${sc}0d`, minWidth:160 }}>
                  <Stack direction="row" alignItems="center" spacing={.6} sx={{ mb:.5 }}>
                    <Box sx={{ width:7, height:7, borderRadius:'50%', bgcolor:sc, flexShrink:0 }} />
                    <Typography sx={{ fontFamily:'monospace', fontSize:'.75rem', color:t.textPrimary, fontWeight:700 }}>{w.name}</Typography>
                  </Stack>
                  <UsageBar value={w.load} small />
                </Box>
              )
            })}
          </Stack>
        </CardContent>
      </Card>

      {/* Services summary */}
      <Card sx={{ border:`1px solid ${t.border}`, bgcolor:t.surface, boxShadow:'none', borderRadius:'10px' }}>
        <CardContent sx={{ p:'14px 16px 6px !important' }}>
          <SectionTitle>Services</SectionTitle>
        </CardContent>
        <Table size="small">
          <TableHead>
            <TableRow>
              {['Service','Status','Uptime','CPU','Memory','Requests','Error Rate','Ver'].map(h => (
                <TableCell key={h} sx={{ color:t.textSecondary, fontSize:'.68rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', borderColor:t.border, py:.9, fontFamily:FONT }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {SERVICES.map(svc => (
              <TableRow key={svc.name} sx={{ '& td':{ borderColor:t.border }, '&:hover':{ bgcolor:'rgba(148,163,184,.04)' } }}>
                <TableCell sx={{ fontWeight:700, fontSize:'.82rem', color:t.textPrimary, py:.9, fontFamily:'monospace' }}>{svc.name}</TableCell>
                <TableCell sx={{ py:.9 }}>
                  <Chip icon={<SvcStatusIcon s={svc.status} />} label={svc.status} size="small"
                    sx={{ bgcolor:SVC_STATUS_BG[svc.status], color:SVC_STATUS_COLOR[svc.status], fontWeight:700, fontSize:'.7rem', height:18, textTransform:'capitalize',
                      '& .MuiChip-label':{ px:.75 }, '& .MuiChip-icon':{ color:SVC_STATUS_COLOR[svc.status], fontSize:'.78rem', ml:.5 } }} />
                </TableCell>
                <TableCell sx={{ fontSize:'.82rem', color:svc.uptime==='100%'?S.success:t.textPrimary, fontWeight:600, fontFamily:FONT, py:.9 }}>{svc.uptime}</TableCell>
                <TableCell sx={{ py:.9 }}><UsageBar value={svc.cpu} /></TableCell>
                <TableCell sx={{ py:.9 }}><UsageBar value={svc.memory} /></TableCell>
                <TableCell sx={{ fontSize:'.82rem', color:t.textPrimary, fontFamily:FONT, py:.9 }}>{svc.requests}</TableCell>
                <TableCell sx={{ py:.9 }}>
                  <Typography sx={{ fontSize:'.82rem', fontWeight:600, fontFamily:FONT, color:parseFloat(svc.errorRate)>1?S.danger:parseFloat(svc.errorRate)>0?S.warning:S.success }}>
                    {svc.errorRate}
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontSize:'.75rem', color:t.textSecondary, fontFamily:FONT, py:.9 }}>{svc.version}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Stack>
  )
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────

function JobsTab() {
  const [filter, setFilter] = useState<'all'|'running'|'failed'|'scheduled'>('all')
  const [search, setSearch] = useState('')

  const filtered = MOCK_JOBS.filter(j => {
    if (filter === 'failed'    && j.status !== 'failed')    return false
    if (filter === 'running'   && j.status !== 'running')   return false
    if (filter === 'scheduled' && j.type   !== 'scheduled') return false
    if (search && !j.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        {(['all','running','failed','scheduled'] as const).map(f => (
          <Button key={f} size="small" onClick={() => setFilter(f)}
            sx={{ fontSize:'.76rem', textTransform:'capitalize', fontWeight:filter===f?700:500, borderRadius:'5px', px:1.25,
              color:filter===f?S.info:t.textSecondary, bgcolor:filter===f?'rgba(0,224,255,.1)':'transparent',
              border:`1px solid ${filter===f?'rgba(0,224,255,.3)':'transparent'}` }}>
            {f}
          </Button>
        ))}
        <Box sx={{ flex:1 }} />
        <Box sx={{ display:'flex', alignItems:'center', gap:.75, px:1, py:.5, borderRadius:'6px', border:`1px solid ${t.border}`, bgcolor:'rgba(148,163,184,.05)', minWidth:200 }}>
          <SearchIcon sx={{ fontSize:'.9rem', color:t.textSecondary }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs…"
            style={{ background:'none', border:'none', outline:'none', color:'inherit', fontFamily:FONT, fontSize:'.82rem', flex:1, width:'100%' }} />
        </Box>
      </Stack>

      <Card sx={{ border:`1px solid ${t.border}`, bgcolor:t.surface, boxShadow:'none', borderRadius:'10px' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {['Job','Type','Queue','Status','Schedule / Last Run','Next Run','Duration','Retries',''].map(h => (
                <TableCell key={h} sx={{ color:t.textSecondary, fontSize:'.68rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', borderColor:t.border, py:.9, fontFamily:FONT }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(j => (
              <React.Fragment key={j.id}>
                <TableRow sx={{ '& td':{ borderColor:t.border }, '&:hover':{ bgcolor:'rgba(148,163,184,.04)' } }}>
                  <TableCell sx={{ fontWeight:700, fontSize:'.82rem', color:t.textPrimary, py:.9, fontFamily:'monospace' }}>{j.name}</TableCell>
                  <TableCell sx={{ py:.9 }}>
                    <Chip label={j.type} size="small" sx={{ height:17, fontSize:'.62rem', fontWeight:600, bgcolor:'rgba(148,163,184,.1)', color:t.textSecondary, '& .MuiChip-label':{ px:.7 } }} />
                  </TableCell>
                  <TableCell sx={{ fontSize:'.78rem', color:t.textSecondary, py:.9, fontFamily:FONT }}>{j.queue}</TableCell>
                  <TableCell sx={{ py:.9 }}>
                    <Chip label={j.status} size="small" sx={{ height:17, fontSize:'.66rem', fontWeight:700, textTransform:'capitalize', bgcolor:JOB_BG[j.status], color:JOB_COLOR[j.status], '& .MuiChip-label':{ px:.7 } }} />
                  </TableCell>
                  <TableCell sx={{ fontSize:'.78rem', color:t.textSecondary, py:.9, fontFamily:FONT }}>
                    {j.schedule
                      ? <Box component="code" sx={{ fontSize:'.72rem', bgcolor:'rgba(148,163,184,.1)', px:.6, py:.15, borderRadius:1 }}>{j.schedule}</Box>
                      : j.lastRun}
                  </TableCell>
                  <TableCell sx={{ fontSize:'.78rem', color:t.textSecondary, py:.9, fontFamily:FONT }}>{j.nextRun ?? '—'}</TableCell>
                  <TableCell sx={{ fontSize:'.78rem', color:t.textSecondary, py:.9, fontFamily:FONT }}>{j.duration}</TableCell>
                  <TableCell sx={{ py:.9 }}>
                    {j.retries > 0
                      ? <Chip label={j.retries} size="small" sx={{ height:17, fontSize:'.66rem', fontWeight:700, bgcolor:'rgba(239,68,68,.1)', color:S.danger, '& .MuiChip-label':{ px:.7 } }} />
                      : <Typography sx={{ fontSize:'.78rem', color:t.textSecondary, fontFamily:FONT }}>—</Typography>}
                  </TableCell>
                  <TableCell align="right" sx={{ py:.9 }}>
                    {j.status === 'failed'    && <Tooltip title="Retry"><IconButton size="small" sx={{ color:S.warning }}><ReplayIcon sx={{ fontSize:'.9rem' }} /></IconButton></Tooltip>}
                    {j.status === 'running'   && <Tooltip title="Stop"><IconButton size="small" sx={{ color:S.danger  }}><StopIcon   sx={{ fontSize:'.9rem' }} /></IconButton></Tooltip>}
                    {(j.status === 'scheduled'||j.status==='pending'||j.status==='success') && <Tooltip title="Run now"><IconButton size="small" sx={{ color:S.info }}><PlayArrowIcon sx={{ fontSize:'.9rem' }} /></IconButton></Tooltip>}
                  </TableCell>
                </TableRow>
                {j.error && (
                  <TableRow sx={{ '& td':{ borderColor:t.border, bgcolor:'rgba(239,68,68,.04)' } }}>
                    <TableCell colSpan={9} sx={{ py:.5, pl:2.5, fontFamily:'monospace', fontSize:'.72rem', color:S.danger }}>✕ {j.error}</TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
        <Box sx={{ px:2, py:1.25, borderTop:`1px solid ${t.border}` }}>
          <Typography sx={{ fontSize:'.78rem', color:t.textSecondary, fontFamily:FONT }}>{filtered.length} jobs</Typography>
        </Box>
      </Card>

      {/* Runbooks */}
      <Card sx={{ border:`1px solid ${t.border}`, bgcolor:t.surface, boxShadow:'none', borderRadius:'10px', mt:1 }}>
        <CardContent sx={{ p:'14px 18px 6px !important' }}><SectionTitle>Runbooks</SectionTitle></CardContent>
        <Table size="small">
          <TableHead>
            <TableRow>
              {['Runbook','Description','Status','Last Run','Duration','Owner',''].map(h => (
                <TableCell key={h} sx={{ color:t.textSecondary, fontSize:'.68rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', borderColor:t.border, py:.9, fontFamily:FONT }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {RUNBOOKS.map(rb => (
              <TableRow key={rb.id} sx={{ '& td':{ borderColor:t.border }, '&:hover':{ bgcolor:'rgba(148,163,184,.04)' } }}>
                <TableCell sx={{ fontWeight:700, fontSize:'.875rem', color:t.textPrimary, fontFamily:FONT, py:.9 }}>{rb.name}</TableCell>
                <TableCell sx={{ fontSize:'.82rem', color:t.textSecondary, maxWidth:260, fontFamily:FONT, py:.9 }}>{rb.description}</TableCell>
                <TableCell sx={{ py:.9 }}>
                  <Chip label={rb.status} size="small" sx={{ bgcolor:RB_STATUS_BG[rb.status], color:RB_STATUS_COLOR[rb.status], fontWeight:700, fontSize:'.72rem', height:18, textTransform:'capitalize', '& .MuiChip-label':{ px:.75 } }} />
                </TableCell>
                <TableCell sx={{ fontSize:'.82rem', color:t.textSecondary, fontFamily:FONT, py:.9 }}>{rb.lastRun}</TableCell>
                <TableCell sx={{ fontSize:'.82rem', color:t.textSecondary, fontFamily:FONT, py:.9 }}>{rb.duration}</TableCell>
                <TableCell sx={{ py:.9 }}>
                  <Chip label={rb.owner} size="small" sx={{ bgcolor:'rgba(139,92,246,.12)', color:S.purple, fontWeight:600, fontSize:'.72rem', height:18, '& .MuiChip-label':{ px:.75 } }} />
                </TableCell>
                <TableCell align="right" sx={{ py:.9 }}>
                  <Button size="small" startIcon={<PlayArrowIcon sx={{ fontSize:'.75rem' }} />} disabled={rb.status==='running'}
                    sx={{ fontSize:'.7rem', borderRadius:'5px', textTransform:'none', color:dashboardTokens.colors.brandPrimary, border:`1px solid rgba(0,224,255,0.28)`, px:.75, py:.25, minWidth:0, '&.Mui-disabled':{ opacity:.4 } }}>
                    Run
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Stack>
  )
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

function AlertsTab() {
  const [showResolved, setShowResolved] = useState(false)
  const [sev, setSev] = useState<'all'|Severity>('all')

  const shown = MOCK_ALERTS.filter(a => {
    if (!showResolved && a.resolved) return false
    if (sev !== 'all' && a.severity !== sev) return false
    return true
  })

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
        {(['all','critical','warning','info'] as const).map(s => (
          <Button key={s} size="small" onClick={() => setSev(s)}
            sx={{ fontSize:'.76rem', textTransform:'capitalize', fontWeight:sev===s?700:500, borderRadius:'5px', px:1.25,
              color: sev===s ? (s==='all'?S.info:SEV_COLOR[s as Severity]) : t.textSecondary,
              bgcolor: sev===s ? (s==='all'?'rgba(0,224,255,.1)':SEV_BG[s as Severity]) : 'transparent',
              border:`1px solid ${sev===s?(s==='all'?'rgba(0,224,255,.3)':SEV_COLOR[s as Severity]+'55'):'transparent'}` }}>
            {s}
          </Button>
        ))}
        <Box sx={{ flex:1 }} />
        <Button size="small" onClick={() => setShowResolved(p => !p)}
          sx={{ fontSize:'.76rem', textTransform:'none', fontWeight:500, borderRadius:'5px', px:1.25,
            color:showResolved?S.success:t.textSecondary, bgcolor:showResolved?'rgba(34,197,94,.1)':'transparent',
            border:`1px solid ${showResolved?'rgba(34,197,94,.3)':t.border}` }}>
          {showResolved ? 'Hiding resolved' : 'Show resolved'}
        </Button>
      </Stack>

      <Stack spacing={1}>
        {shown.map(a => (
          <Paper key={a.id} elevation={0}
            sx={{ p:'12px 16px', border:`1px solid ${a.resolved?t.border:SEV_COLOR[a.severity]+'44'}`, borderRadius:'8px', bgcolor:a.resolved?'rgba(148,163,184,.03)':SEV_BG[a.severity], opacity:a.resolved?.65:1 }}>
            <Stack direction="row" spacing={1.5} alignItems="flex-start" flexWrap="wrap">
              <SevBadge sev={a.severity} />
              <Box sx={{ flex:1, minWidth:180 }}>
                <Typography sx={{ fontWeight:700, fontSize:'.88rem', color:t.textPrimary, fontFamily:FONT }}>{a.title}</Typography>
                <Stack direction="row" spacing={1} sx={{ mt:.4 }} flexWrap="wrap">
                  <Chip label={a.source}  size="small" sx={{ height:17, fontSize:'.62rem', bgcolor:'rgba(148,163,184,.1)', color:t.textSecondary, '& .MuiChip-label':{ px:.6 } }} />
                  <Chip label={a.service} size="small" sx={{ height:17, fontSize:'.62rem', bgcolor:'rgba(0,224,255,.08)',  color:S.info,           '& .MuiChip-label':{ px:.6 } }} />
                  {a.count > 1 && <Chip label={`×${a.count}`} size="small" sx={{ height:17, fontSize:'.62rem', fontWeight:700, bgcolor:SEV_BG[a.severity], color:SEV_COLOR[a.severity], '& .MuiChip-label':{ px:.6 } }} />}
                </Stack>
              </Box>
              <Stack direction="row" spacing={.75} alignItems="center">
                <Typography sx={{ fontSize:'.75rem', color:t.textSecondary, fontFamily:FONT }}>{a.since}</Typography>
                {!a.resolved && (
                  <Button size="small" variant="outlined"
                    sx={{ fontSize:'.7rem', borderRadius:'5px', textTransform:'none', borderColor:t.border, color:t.textSecondary, px:.75, py:.25, minWidth:0 }}>
                    Ack
                  </Button>
                )}
                {a.resolved && <Chip label="Resolved" size="small" sx={{ height:17, fontSize:'.62rem', fontWeight:700, bgcolor:'rgba(34,197,94,.1)', color:S.success, '& .MuiChip-label':{ px:.6 } }} />}
              </Stack>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Stack>
  )
}

// ─── Incidents ────────────────────────────────────────────────────────────────

function IncidentsTab() {
  const [selected, setSelected] = useState<Incident|null>(null)

  const STATUS_ICON: Record<IncStatus,React.ReactNode> = {
    open:          <ErrorIcon sx={{ fontSize:'.9rem' }} />,
    investigating: <WarningAmberIcon sx={{ fontSize:'.9rem' }} />,
    resolved:      <CheckCircleIcon sx={{ fontSize:'.9rem' }} />,
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="flex-end">
        <Button size="small" variant="contained" startIcon={<AddIcon sx={{ fontSize:'.85rem' }} />}
          sx={{ fontSize:'.78rem', textTransform:'none', fontWeight:700, bgcolor:S.danger, color:'#fff', boxShadow:'none', borderRadius:'6px', '&:hover':{ bgcolor:'#dc2626', boxShadow:'none' } }}>
          Declare Incident
        </Button>
      </Stack>

      <Stack spacing={1.25}>
        {MOCK_INCIDENTS.map(inc => (
          <Paper key={inc.id} elevation={0} onClick={() => setSelected(inc)}
            sx={{ p:'14px 18px', border:`1px solid ${INC_COLOR[inc.status]+'44'}`, borderRadius:'10px', bgcolor:inc.status==='resolved'?'rgba(34,197,94,.04)':`${INC_COLOR[inc.status]}0d`, cursor:'pointer',
              '&:hover':{ border:`1px solid ${INC_COLOR[inc.status]}99` }, transition:'border .15s' }}>
            <Stack direction="row" spacing={1.5} alignItems="flex-start" flexWrap="wrap">
              <Box sx={{ color:INC_COLOR[inc.status], mt:.1 }}>{STATUS_ICON[inc.status]}</Box>
              <Box sx={{ flex:1 }}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Typography sx={{ fontFamily:'monospace', fontSize:'.72rem', color:t.textSecondary }}>{inc.id}</Typography>
                  <SevBadge sev={inc.severity} />
                  <Chip label={inc.status} size="small" sx={{ height:18, fontSize:'.66rem', fontWeight:700, textTransform:'capitalize', bgcolor:`${INC_COLOR[inc.status]}15`, color:INC_COLOR[inc.status], '& .MuiChip-label':{ px:.7 } }} />
                </Stack>
                <Typography sx={{ fontWeight:700, fontSize:'.92rem', color:t.textPrimary, fontFamily:FONT, mt:.4 }}>{inc.title}</Typography>
                <Stack direction="row" spacing={1.5} sx={{ mt:.5 }} flexWrap="wrap">
                  <Typography sx={{ fontSize:'.75rem', color:t.textSecondary, fontFamily:FONT }}>Opened {inc.openedAt}</Typography>
                  {inc.resolvedAt && <Typography sx={{ fontSize:'.75rem', color:S.success, fontFamily:FONT }}>Resolved {inc.resolvedAt}</Typography>}
                  <Stack direction="row" spacing={.5}>
                    {inc.assignedTo.map(u => (
                      <Chip key={u} label={u} size="small" sx={{ height:17, fontSize:'.62rem', bgcolor:'rgba(139,92,246,.1)', color:S.purple, '& .MuiChip-label':{ px:.6 } }} />
                    ))}
                  </Stack>
                </Stack>
              </Box>
              <Typography sx={{ fontSize:'.75rem', color:S.info, fontFamily:FONT, whiteSpace:'nowrap' }}>View →</Typography>
            </Stack>
          </Paper>
        ))}
      </Stack>

      {selected && (
        <Dialog open onClose={() => setSelected(null)} maxWidth="sm" fullWidth
          PaperProps={{ sx:{ bgcolor:t.surface, border:`1px solid ${t.border}`, borderRadius:'12px', backgroundImage:'none' } }}>
          <DialogTitle sx={{ fontFamily:FONT, fontWeight:800, color:t.textPrimary, pb:.5 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography sx={{ fontFamily:'monospace', fontSize:'.78rem', color:t.textSecondary }}>{selected.id}</Typography>
              <SevBadge sev={selected.severity} />
              <Chip label={selected.status} size="small" sx={{ height:18, fontSize:'.66rem', fontWeight:700, textTransform:'capitalize', bgcolor:`${INC_COLOR[selected.status]}15`, color:INC_COLOR[selected.status], '& .MuiChip-label':{ px:.7 } }} />
            </Stack>
            <Typography sx={{ fontFamily:FONT, fontWeight:800, fontSize:'1rem', color:t.textPrimary, mt:.5 }}>{selected.title}</Typography>
          </DialogTitle>
          <DialogContent sx={{ pt:'12px !important' }}>
            {selected.rootCause && (
              <Box sx={{ mb:1.5, p:1.25, borderRadius:'7px', bgcolor:'rgba(245,158,11,.08)', border:`1px solid rgba(245,158,11,.3)` }}>
                <Typography sx={{ fontFamily:FONT, fontSize:'.72rem', fontWeight:700, color:S.warning, textTransform:'uppercase', letterSpacing:'.08em', mb:.3 }}>Root Cause</Typography>
                <Typography sx={{ fontFamily:FONT, fontSize:'.82rem', color:t.textPrimary }}>{selected.rootCause}</Typography>
              </Box>
            )}
            {selected.resolution && (
              <Box sx={{ mb:1.5, p:1.25, borderRadius:'7px', bgcolor:'rgba(34,197,94,.06)', border:`1px solid rgba(34,197,94,.3)` }}>
                <Typography sx={{ fontFamily:FONT, fontSize:'.72rem', fontWeight:700, color:S.success, textTransform:'uppercase', letterSpacing:'.08em', mb:.3 }}>Resolution</Typography>
                <Typography sx={{ fontFamily:FONT, fontSize:'.82rem', color:t.textPrimary }}>{selected.resolution}</Typography>
              </Box>
            )}
            <SectionTitle>Timeline</SectionTitle>
            <Box sx={{ position:'relative', pl:2.5 }}>
              <Box sx={{ position:'absolute', left:7, top:0, bottom:0, width:'1px', bgcolor:t.border }} />
              {selected.timeline.map((e, i) => (
                <Box key={i} sx={{ position:'relative', mb:1.5 }}>
                  <Box sx={{ position:'absolute', left:-18, top:4, width:8, height:8, borderRadius:'50%', bgcolor:i===0?S.danger:S.info, border:`2px solid ${t.surface}` }} />
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb:.25 }}>
                    <Typography sx={{ fontFamily:'monospace', fontSize:'.72rem', color:S.info }}>{e.time}</Typography>
                    <Chip label={e.actor} size="small" sx={{ height:16, fontSize:'.62rem', bgcolor:'rgba(139,92,246,.1)', color:S.purple, '& .MuiChip-label':{ px:.6 } }} />
                  </Stack>
                  <Typography sx={{ fontFamily:FONT, fontSize:'.82rem', color:t.textPrimary }}>{e.note}</Typography>
                </Box>
              ))}
            </Box>
          </DialogContent>
          <DialogActions sx={{ px:3, pb:2 }}>
            <Button onClick={() => setSelected(null)} size="small" sx={{ fontFamily:FONT, textTransform:'none', color:t.textSecondary }}>Close</Button>
            {selected.status !== 'resolved' && (
              <Button size="small" variant="contained" startIcon={<EditNoteIcon sx={{ fontSize:'.85rem' }} />}
                sx={{ fontFamily:FONT, textTransform:'none', fontWeight:700, bgcolor:S.warning, color:'#0a0f1a', boxShadow:'none', '&:hover':{ bgcolor:'#d97706', boxShadow:'none' } }}>
                Update Incident
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}
    </Stack>
  )
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────

function AuditLogsTab() {
  const [search, setSearch] = useState('')

  const shown = MOCK_AUDIT.filter(e =>
    !search ||
    e.who.toLowerCase().includes(search.toLowerCase()) ||
    e.action.toLowerCase().includes(search.toLowerCase()) ||
    e.resource.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Box sx={{ display:'flex', alignItems:'center', gap:.75, px:1, py:.6, borderRadius:'6px', border:`1px solid ${t.border}`, bgcolor:'rgba(148,163,184,.05)', flex:1, maxWidth:380 }}>
          <SearchIcon sx={{ fontSize:'.9rem', color:t.textSecondary }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by user, action, resource…"
            style={{ background:'none', border:'none', outline:'none', color:'inherit', fontFamily:FONT, fontSize:'.82rem', flex:1, width:'100%' }} />
        </Box>
        <Button size="small" startIcon={<FilterListIcon sx={{ fontSize:'.85rem' }} />}
          sx={{ fontSize:'.76rem', textTransform:'none', borderRadius:'5px', color:t.textSecondary, border:`1px solid ${t.border}`, fontFamily:FONT }}>
          Filters
        </Button>
        <Box sx={{ flex:1 }} />
        <Typography sx={{ fontSize:'.75rem', color:t.textSecondary, fontFamily:FONT }}>{shown.length} entries</Typography>
      </Stack>

      <Card sx={{ border:`1px solid ${t.border}`, bgcolor:t.surface, boxShadow:'none', borderRadius:'10px' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {['Time','User','Action','Resource','IP Address','Result'].map(h => (
                <TableCell key={h} sx={{ color:t.textSecondary, fontSize:'.68rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', borderColor:t.border, py:.9, fontFamily:FONT }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {shown.map(e => (
              <TableRow key={e.id} sx={{ '& td':{ borderColor:t.border }, '&:hover':{ bgcolor:'rgba(148,163,184,.04)' } }}>
                <TableCell sx={{ fontFamily:'monospace', fontSize:'.75rem', color:t.textSecondary, py:.9, whiteSpace:'nowrap' }}>{e.when}</TableCell>
                <TableCell sx={{ py:.9 }}>
                  <Stack direction="row" spacing={.5} alignItems="center">
                    <PersonIcon sx={{ fontSize:'.82rem', color:t.textSecondary }} />
                    <Typography sx={{ fontSize:'.82rem', fontWeight:600, color:t.textPrimary, fontFamily:FONT }}>{e.who}</Typography>
                  </Stack>
                </TableCell>
                <TableCell sx={{ py:.9 }}>
                  <Box component="code" sx={{ fontSize:'.72rem', bgcolor:'rgba(148,163,184,.1)', px:.6, py:.2, borderRadius:1, color:S.info }}>{e.action}</Box>
                </TableCell>
                <TableCell sx={{ fontFamily:'monospace', fontSize:'.75rem', color:t.textSecondary, py:.9 }}>{e.resource}</TableCell>
                <TableCell sx={{ fontFamily:'monospace', fontSize:'.75rem', py:.9 }}>
                  {e.ip === '185.234.218.7'
                    ? <Typography component="span" sx={{ fontFamily:'monospace', fontSize:'.75rem', color:S.danger }}>{e.ip} ⚠</Typography>
                    : <Typography component="span" sx={{ fontFamily:'monospace', fontSize:'.75rem', color:t.textSecondary }}>{e.ip}</Typography>}
                </TableCell>
                <TableCell sx={{ py:.9 }}>
                  {e.result === 'success'
                    ? <Chip label="Success" size="small" sx={{ height:17, fontSize:'.62rem', fontWeight:700, bgcolor:'rgba(34,197,94,.1)',  color:S.success, '& .MuiChip-label':{ px:.7 } }} />
                    : <Chip label="Denied"  size="small" sx={{ height:17, fontSize:'.62rem', fontWeight:700, bgcolor:'rgba(239,68,68,.1)',  color:S.danger,  '& .MuiChip-label':{ px:.7 } }} />}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Stack>
  )
}

// ─── Metrics ─────────────────────────────────────────────────────────────────

function MetricsTab() {
  function SparkBar({ data, color }: { data: number[]; color: string }) {
    const max = Math.max(...data, 1)
    const w = 6; const gap = 2; const h = 36
    const total = data.length * (w + gap) - gap
    return (
      <svg width={total} height={h} style={{ display:'block' }}>
        {data.map((v, i) => {
          const bh = Math.round((v / max) * h)
          return <rect key={i} x={i*(w+gap)} y={h-bh} width={w} height={bh} rx={2} fill={color} opacity={0.8} />
        })}
      </svg>
    )
  }

  const CPU_HIST    = [18,22,31,45,52,48,61,72,78,68,55,48,61,73,80,75,68,71,74,69]
  const MEM_HIST    = [44,46,49,52,55,56,58,61,64,67,66,65,68,70,72,71,70,69,70,71]
  const NET_HIST    = [120,180,240,320,480,600,720,810,920,880,760,640,720,810,880,820,740,700,780,840]
  const LAT_HIST    = [38,42,40,45,52,48,56,84,92,80,74,68,72,80,84,78,76,80,86,84]
  const QUERY_HIST  = [180,195,210,240,280,310,290,320,380,360,310,290,320,350,370,340,310,330,360,340]

  const clusterCpu = Math.round(MOCK_NODES.reduce((a, n) => a + n.cpu, 0) / MOCK_NODES.length)
  const clusterMem = Math.round(MOCK_NODES.reduce((a, n) => a + n.memory, 0) / MOCK_NODES.length)

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" flexWrap="wrap" spacing={1.5}>
        {[
          { label:'Cluster CPU',     value:clusterCpu, unit:'%', hist:CPU_HIST,   color:clusterCpu>80?S.danger:clusterCpu>60?S.warning:S.success, bar:true,  icon:<SpeedIcon sx={{ fontSize:'1rem' }} /> },
          { label:'Cluster Memory',  value:clusterMem, unit:'%', hist:MEM_HIST,   color:clusterMem>80?S.danger:clusterMem>60?S.warning:S.success,  bar:true,  icon:<MemoryIcon sx={{ fontSize:'1rem' }} /> },
          { label:'Network (MB/s)',  value:840,        unit:'',  hist:NET_HIST,   color:S.info,    bar:false, icon:<NetworkCheckIcon sx={{ fontSize:'1rem' }} /> },
          { label:'API Latency (ms)',value:84,         unit:'',  hist:LAT_HIST,   color:S.success, bar:false, icon:<LanIcon sx={{ fontSize:'1rem' }} /> },
          { label:'DB Queries/s',   value:340,        unit:'',  hist:QUERY_HIST, color:S.purple,  bar:false, icon:<StorageIcon sx={{ fontSize:'1rem' }} /> },
        ].map(m => (
          <Card key={m.label} sx={{ flex:'1 1 160px', border:`1px solid ${t.border}`, bgcolor:t.surface, boxShadow:'none', borderRadius:'10px' }}>
            <CardContent sx={{ p:'14px 16px !important' }}>
              <Box sx={{ display:'flex', alignItems:'center', gap:.75, mb:.5, color:m.color }}>
                {m.icon}
                <Typography sx={{ fontSize:'.68rem', fontWeight:700, color:t.textSecondary, textTransform:'uppercase', letterSpacing:'.08em', fontFamily:FONT }}>{m.label}</Typography>
              </Box>
              <Typography sx={{ fontSize:'1.5rem', fontWeight:800, color:m.color, lineHeight:1.1, fontFamily:FONT }}>
                {m.value}<span style={{ fontSize:'.72rem', color:t.textSecondary, marginLeft:2 }}>{m.unit}</span>
              </Typography>
              {m.bar && (
                <LinearProgress variant="determinate" value={m.value as number}
                  sx={{ mt:1, height:4, borderRadius:2, bgcolor:`${m.color}20`, '& .MuiLinearProgress-bar':{ bgcolor:m.color, borderRadius:2 } }} />
              )}
              <Box sx={{ mt:1.25 }}>
                <SparkBar data={m.hist} color={m.color} />
                <Typography sx={{ fontFamily:FONT, fontSize:'.62rem', color:t.textSecondary, mt:.3 }}>Last 20 data points</Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Card sx={{ border:`1px solid ${t.border}`, bgcolor:t.surface, boxShadow:'none', borderRadius:'10px' }}>
        <CardContent sx={{ p:'14px 18px 6px !important' }}><SectionTitle>Node Performance</SectionTitle></CardContent>
        <Table size="small">
          <TableHead>
            <TableRow>
              {['Node','Role','CPU','Memory','Disk','Pods','Status'].map(h => (
                <TableCell key={h} sx={{ color:t.textSecondary, fontSize:'.68rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', borderColor:t.border, py:.9, fontFamily:FONT }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {MOCK_NODES.map(n => (
              <TableRow key={n.node} sx={{ '& td':{ borderColor:t.border }, '&:hover':{ bgcolor:'rgba(148,163,184,.04)' } }}>
                <TableCell sx={{ fontWeight:700, fontSize:'.82rem', color:t.textPrimary, py:1, fontFamily:'monospace' }}>{n.node}</TableCell>
                <TableCell sx={{ py:1 }}>
                  <Chip label={n.role} size="small" sx={{ height:17, fontSize:'.62rem', bgcolor:'rgba(148,163,184,.1)', color:t.textSecondary, '& .MuiChip-label':{ px:.7 } }} />
                </TableCell>
                <TableCell sx={{ py:1, minWidth:110 }}><UsageBar value={n.cpu} /></TableCell>
                <TableCell sx={{ py:1, minWidth:110 }}><UsageBar value={n.memory} /></TableCell>
                <TableCell sx={{ py:1, minWidth:110 }}><UsageBar value={n.disk} /></TableCell>
                <TableCell sx={{ fontSize:'.82rem', color:t.textSecondary, py:1, fontFamily:FONT }}>{n.pods}</TableCell>
                <TableCell sx={{ py:1 }}>
                  {n.status === 'Ready'
                    ? <Chip label="Ready"     size="small" sx={{ height:17, fontSize:'.66rem', fontWeight:700, bgcolor:'rgba(34,197,94,.1)', color:S.success, '& .MuiChip-label':{ px:.7 } }} />
                    : <Chip label="Not Ready" size="small" sx={{ height:17, fontSize:'.66rem', fontWeight:700, bgcolor:'rgba(239,68,68,.1)', color:S.danger,  '& .MuiChip-label':{ px:.7 } }} />}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card sx={{ border:`1px solid ${t.border}`, bgcolor:t.surface, boxShadow:'none', borderRadius:'10px' }}>
        <CardContent sx={{ p:'14px 18px !important' }}>
          <SectionTitle>Database Performance</SectionTitle>
          <Stack direction={{ xs:'column', sm:'row' }} spacing={1.5} flexWrap="wrap">
            {[
              { label:'Queries/s',          value:'340',    color:S.purple  },
              { label:'Slow queries (>2s)',  value:'3',      color:S.warning },
              { label:'Active connections',  value:'42/200', color:S.info    },
              { label:'Locks held',          value:'1',      color:S.warning },
              { label:'Replication lag',     value:'< 1ms',  color:S.success },
              { label:'Cache hit rate',      value:'98.4%',  color:S.success },
            ].map(m => (
              <Paper key={m.label} elevation={0}
                sx={{ flex:'1 1 120px', p:'10px 14px', border:`1px solid ${t.border}`, borderRadius:'8px', bgcolor:'rgba(148,163,184,.03)' }}>
                <Typography sx={{ fontFamily:FONT, fontSize:'.68rem', fontWeight:700, color:t.textSecondary, textTransform:'uppercase', letterSpacing:'.07em', mb:.3 }}>{m.label}</Typography>
                <Typography sx={{ fontFamily:FONT, fontSize:'1.1rem', fontWeight:800, color:m.color }}>{m.value}</Typography>
              </Paper>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

const TOP_TABS = ['Overview','Jobs','Alerts','Incidents','Audit Logs','Metrics']

const DevOperationalPage: React.FC = () => {
  const [tab,   setTab]   = useState(0)
  const [toast, setToast] = useState<string|null>(null)

  const activeAlerts   = MOCK_ALERTS.filter(a => !a.resolved).length
  const criticalAlerts = MOCK_ALERTS.filter(a => !a.resolved && a.severity === 'critical').length
  const failedJobs     = MOCK_JOBS.filter(j => j.status === 'failed').length
  const openInc        = MOCK_INCIDENTS.filter(i => i.status !== 'resolved').length

  const tabDot = (i: number) => {
    if (i === 2) return criticalAlerts > 0 ? S.danger : activeAlerts > 0 ? S.warning : undefined
    if (i === 3) return openInc        > 0 ? S.danger   : undefined
    if (i === 1) return failedJobs     > 0 ? S.warning  : undefined
    return undefined
  }

  return (
    <Box sx={{ p:{ xs:2, md:3 }, fontFamily:FONT }}>
      {/* Header */}
      <Box sx={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', mb:2.5, flexWrap:'wrap', gap:1 }}>
        <Box>
          <Typography sx={{ fontWeight:800, fontSize:{ xs:'1.2rem', md:'1.35rem' }, color:t.textPrimary, fontFamily:FONT, letterSpacing:'-.02em' }}>
            Operational
          </Typography>
          <Typography sx={{ color:t.textSecondary, fontSize:'.875rem', mt:.3, fontFamily:FONT }}>
            Platform-wide health, jobs, alerts, incidents, and audit trail.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh metrics">
            <IconButton size="small" onClick={() => setToast('Metrics refreshed.')}
              sx={{ border:`1px solid ${t.border}`, borderRadius:'6px', color:t.textSecondary }}>
              <RefreshIcon sx={{ fontSize:'1rem' }} />
            </IconButton>
          </Tooltip>
          <Button variant="contained" size="small" startIcon={<GppGoodIcon sx={{ fontSize:'.85rem' }} />}
            sx={{ fontWeight:700, fontSize:'.78rem', borderRadius:'6px', textTransform:'none', bgcolor:dashboardTokens.colors.brandPrimary, color:'#0a0f1a', boxShadow:'none', '&:hover':{ bgcolor:dashboardTokens.colors.brandPrimaryHover, boxShadow:'none' } }}>
            Declare Incident
          </Button>
        </Stack>
      </Box>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)}
        sx={{
          mb:2.5, borderBottom:`1px solid ${t.border}`, minHeight:38,
          '& .MuiTab-root':{ fontFamily:FONT, fontSize:'.82rem', fontWeight:600, textTransform:'none', minHeight:38, color:t.textSecondary, px:1.5 },
          '& .Mui-selected':{ color:dashboardTokens.colors.brandPrimary },
          '& .MuiTabs-indicator':{ bgcolor:dashboardTokens.colors.brandPrimary, height:2 },
        }}
      >
        {TOP_TABS.map((l, i) => {
          const dot = tabDot(i)
          return (
            <Tab key={l} label={
              <Stack direction="row" spacing={.6} alignItems="center">
                {dot && <Box sx={{ width:7, height:7, borderRadius:'50%', bgcolor:dot }} />}
                <span>{l}</span>
              </Stack>
            } />
          )
        })}
      </Tabs>

      {tab === 0 && <OverviewTab />}
      {tab === 1 && <JobsTab />}
      {tab === 2 && <AlertsTab />}
      {tab === 3 && <IncidentsTab />}
      {tab === 4 && <AuditLogsTab />}
      {tab === 5 && <MetricsTab />}

      <Snackbar open={Boolean(toast)} autoHideDuration={3500} onClose={() => setToast(null)} anchorOrigin={{ vertical:'bottom', horizontal:'center' }}>
        <Alert severity="info" onClose={() => setToast(null)} sx={{ fontFamily:FONT }}>{toast}</Alert>
      </Snackbar>
    </Box>
  )
}

export default DevOperationalPage
