// AtonixCorp Cloud — Developer Workspace
// Personal cockpit: Overview · Sessions · Tools · Logs · Settings

import React, { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  LinearProgress,
  Snackbar,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material'

import PlayArrowIcon        from '@mui/icons-material/PlayArrow'
import StopIcon             from '@mui/icons-material/Stop'
import TerminalIcon         from '@mui/icons-material/Terminal'
import CodeIcon             from '@mui/icons-material/Code'
import RefreshIcon          from '@mui/icons-material/Refresh'
import ContentCopyIcon      from '@mui/icons-material/ContentCopy'
import AddIcon              from '@mui/icons-material/Add'
import DeleteOutlineIcon    from '@mui/icons-material/DeleteOutline'
import VisibilityIcon       from '@mui/icons-material/Visibility'
import VisibilityOffIcon    from '@mui/icons-material/VisibilityOff'
import CheckCircleIcon      from '@mui/icons-material/CheckCircle'
import WarningAmberIcon     from '@mui/icons-material/WarningAmber'
import ErrorIcon            from '@mui/icons-material/Error'
import FolderOpenIcon       from '@mui/icons-material/FolderOpen'
import AccountTreeIcon      from '@mui/icons-material/AccountTree'
import AssignmentIcon       from '@mui/icons-material/Assignment'
import MemoryIcon           from '@mui/icons-material/Memory'
import StorageIcon          from '@mui/icons-material/Storage'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import KeyIcon              from '@mui/icons-material/Key'
import LockIcon             from '@mui/icons-material/Lock'

import { dashboardTokens, dashboardSemanticColors } from '../styles/dashboardDesignSystem'

// ─── Design tokens ────────────────────────────────────────────────────────────

const FONT = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
const t    = dashboardTokens.colors
const S    = dashboardSemanticColors

const STATUS_COLOR: Record<string, string> = {
  running: S.success, warning: S.warning, offline: S.danger, stopped: S.danger,
  healthy: S.success, degraded: S.warning, crashed: S.danger,
  active: S.success, idle: S.warning, pending: '#94a3b8',
}
const STATUS_BG: Record<string, string> = {
  running: 'rgba(34,197,94,.12)', warning: 'rgba(245,158,11,.12)', offline: 'rgba(239,68,68,.12)',
  stopped: 'rgba(239,68,68,.12)', healthy: 'rgba(34,197,94,.12)', degraded: 'rgba(245,158,11,.12)',
  crashed: 'rgba(239,68,68,.12)', active: 'rgba(34,197,94,.12)', idle: 'rgba(245,158,11,.12)',
  pending: 'rgba(148,163,184,.12)',
}

function statusDot(s: string) {
  return (
    <Box component="span" sx={{
      display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
      bgcolor: STATUS_COLOR[s] ?? '#94a3b8', flexShrink: 0,
    }} />
  )
}

// ─── Mock data ────────────────────────────────────────────────────────────────

type WorkspaceHealth = 'healthy' | 'warning' | 'crashed'

const MOCK_SESSION = {
  id:          'ws-john-01',
  owner:       'john.doe',
  status:      'running' as const,
  health:      'healthy' as WorkspaceHealth,
  ide:         'VS Code',
  uptime:      '4h 32m',
  cpu:         38,
  ram:         62,
  started:     '2026-02-25T08:14:22Z',
  region:      'us-east-1',
  image:       'atonix/devbox:22.04-lts',
  containers:  3,
  volumes:     2,
}

const MOCK_RECENT_PROJECTS = [
  { id: 'p1', name: 'api-gateway',     lang: 'TypeScript', lastActive: '12 min ago',  status: 'active'  },
  { id: 'p2', name: 'payment-service', lang: 'Go',         lastActive: '2 hours ago', status: 'idle'    },
  { id: 'p3', name: 'ml-pipeline',     lang: 'Python',     lastActive: '1 day ago',   status: 'idle'    },
]

const MOCK_RECENT_PIPELINES = [
  { id: 'pl1', name: 'api-gateway · main',      status: 'running', duration: '3m 11s', ago: '5 min ago'  },
  { id: 'pl2', name: 'payment-service · feat',  status: 'failed',  duration: '6m 44s', ago: '1 hr ago'   },
  { id: 'pl3', name: 'ml-pipeline · dev',       status: 'pending', duration: '—',      ago: '30 min ago' },
]

const MOCK_TASKS = [
  { id: 't1', title: 'Fix latency regression in payment-service', priority: 'high',   due: 'Today',     group: 'Platform' },
  { id: 't2', title: 'Update API docs for v2 routes',            priority: 'medium', due: 'Mar 1',     group: 'Platform' },
  { id: 't3', title: 'Implement caching layer for user sessions', priority: 'medium', due: 'Mar 4',     group: 'Data'     },
]

const MOCK_API_KEYS = [
  { id: 'ak1', name: 'Local Dev Key',        prefix: 'atx_dev_a1b2c3',  created: '2026-01-10', lastUsed: '5 min ago'  },
  { id: 'ak2', name: 'CI/CD Pipeline Token', prefix: 'atx_ci_d4e5f6',   created: '2026-01-22', lastUsed: '2 hr ago'   },
  { id: 'ak3', name: 'Terraform Automation', prefix: 'atx_tf_g7h8i9',   created: '2026-01-28', lastUsed: '3 days ago' },
]

const MOCK_SSH_KEYS = [
  { id: 'sk1', name: 'MacBook Pro (work)',   fingerprint: 'SHA256:ab12cd34ef56gh78ij90', added: '2025-12-01' },
  { id: 'sk2', name: 'Yubikey 5C',           fingerprint: 'SHA256:kl12mn34op56qr78st90', added: '2026-01-05' },
]

const MOCK_PATS = [
  { id: 'pt1', name: 'VS Code Extension',  scopes: 'read:projects,write:code', expiry: '2026-06-01', lastUsed: '1 hr ago'  },
  { id: 'pt2', name: 'GitHub Mirror Bot',  scopes: 'read:cicd,write:pipelines', expiry: '2026-12-31', lastUsed: '1 day ago' },
]

const MOCK_ACTIVITY: {time:string; type:string; msg:string; status:string}[] = [
  { time: '10:58', type: 'Pipeline',    msg: 'api-gateway · main triggered',                  status: 'running' },
  { time: '10:44', type: 'Deploy',      msg: 'api-gateway v1.4.2 → production succeeded',     status: 'healthy' },
  { time: '09:31', type: 'Error',       msg: 'payment-service OOMKilled (container restart)',  status: 'crashed' },
  { time: '09:22', type: 'Pipeline',    msg: 'payment-service · feat/crypto failed',          status: 'stopped' },
  { time: '08:55', type: 'Workspace',   msg: 'Workspace started (ws-john-01)',                 status: 'running' },
  { time: '08:12', type: 'Deploy',      msg: 'ml-pipeline v0.9.1 → staging succeeded',        status: 'healthy' },
  { time: '07:44', type: 'Pipeline',    msg: 'ml-pipeline · dev/model-v3 pending',            status: 'pending' },
  { time: 'Yesterday\n22:11', type: 'Workspace',   msg: 'Workspace stopped',                  status: 'stopped' },
  { time: 'Yesterday\n19:48', type: 'Deploy',      msg: 'api-gateway hotfix → production',    status: 'healthy' },
  { time: 'Yesterday\n16:30', type: 'Error',       msg: 'High latency alert fired (p99=820ms)',status: 'warning' },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{
      fontSize: '.72rem', fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase',
      letterSpacing: '.08em', fontFamily: FONT, mb: 1.25,
    }}>
      {children}
    </Typography>
  )
}

function StatMini({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <Card sx={{ flex: '1 1 110px', border: `1px solid ${t.border}`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '8px' }}>
      <CardContent sx={{ p: '12px 14px !important' }}>
        <Typography sx={{ fontSize: '.7rem', fontWeight: 600, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '.07em', fontFamily: FONT }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color, lineHeight: 1.2, fontFamily: FONT }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  )
}

function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
      <LinearProgress
        variant="determinate" value={value}
        sx={{ flex: 1, height: 5, borderRadius: 3, bgcolor: 'rgba(148,163,184,.18)',
          '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 } }}
      />
      <Typography sx={{ fontSize: '.7rem', fontWeight: 700, color, minWidth: 28, fontFamily: FONT }}>{value}%</Typography>
    </Box>
  )
}

function HealthBadge({ health }: { health: WorkspaceHealth }) {
  const map = {
    healthy: { color: S.success, bg: 'rgba(34,197,94,.12)', label: 'Healthy', Icon: CheckCircleIcon },
    warning: { color: S.warning, bg: 'rgba(245,158,11,.12)', label: 'Warning', Icon: WarningAmberIcon },
    crashed: { color: S.danger,  bg: 'rgba(239,68,68,.12)',  label: 'Crashed', Icon: ErrorIcon },
  }
  const { color, bg, label, Icon } = map[health]
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.3, borderRadius: 1, bgcolor: bg }}>
      <Icon sx={{ fontSize: 13, color }} />
      <Typography sx={{ fontSize: '.72rem', fontWeight: 700, color, fontFamily: FONT }}>{label}</Typography>
    </Box>
  )
}

// ─── Tab 0 — Overview ─────────────────────────────────────────────────────────

function OverviewTab({ onStartStop }: { onStartStop: (s: boolean) => void }) {
  const s  = MOCK_SESSION
  const isRunning = s.status === 'running'

  return (
    <Stack spacing={2.5}>
      {/* Workspace health card */}
      <Card sx={{ border: `1px solid ${t.border}`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '10px' }}>
        <CardContent sx={{ p: '16px 20px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Box sx={{
              width: 42, height: 42, borderRadius: '9px', flexShrink: 0,
              bgcolor: isRunning ? 'rgba(34,197,94,.14)' : 'rgba(239,68,68,.14)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <TerminalIcon sx={{ fontSize: '1.1rem', color: isRunning ? S.success : S.danger }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: t.textPrimary, fontFamily: FONT }}>{s.id}</Typography>
                <HealthBadge health={s.health} />
              </Stack>
              <Typography sx={{ fontSize: '.8rem', color: t.textSecondary, fontFamily: FONT }}>
                {s.ide} · {s.region} · {s.image}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography sx={{ fontSize: '.8rem', color: t.textSecondary, fontFamily: FONT }}>Up {s.uptime}</Typography>
              <Chip
                label={s.status}
                size="small"
                sx={{ bgcolor: STATUS_BG[s.status], color: STATUS_COLOR[s.status], fontWeight: 700, fontSize: '.72rem', height: 20, textTransform: 'capitalize' }}
              />
              <Button
                size="small"
                variant={isRunning ? 'outlined' : 'contained'}
                startIcon={isRunning ? <StopIcon sx={{ fontSize: '0.9rem' }} /> : <PlayArrowIcon sx={{ fontSize: '0.9rem' }} />}
                onClick={() => onStartStop(!isRunning)}
                sx={{
                  fontWeight: 700, fontSize: '.78rem', borderRadius: '6px', textTransform: 'none',
                  ...(isRunning
                    ? { borderColor: S.danger, color: S.danger, '&:hover': { borderColor: S.danger, bgcolor: 'rgba(239,68,68,.08)' } }
                    : { bgcolor: dashboardTokens.colors.brandPrimary, color: '#0a0f1a', boxShadow: 'none', '&:hover': { bgcolor: dashboardTokens.colors.brandPrimaryHover, boxShadow: 'none' } }),
                }}
              >
                {isRunning ? 'Stop Workspace' : 'Start Workspace'}
              </Button>
            </Stack>
          </Box>

          {/* CPU / RAM */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.6 }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <MemoryIcon sx={{ fontSize: '.82rem', color: t.textSecondary }} />
                  <Typography sx={{ fontSize: '.75rem', fontWeight: 600, color: t.textSecondary, fontFamily: FONT }}>CPU</Typography>
                </Stack>
                <Typography sx={{ fontSize: '.75rem', fontWeight: 700, color: s.cpu > 80 ? S.danger : s.cpu > 60 ? S.warning : S.success, fontFamily: FONT }}>{s.cpu}%</Typography>
              </Stack>
              <MiniBar value={s.cpu} color={s.cpu > 80 ? S.danger : s.cpu > 60 ? S.warning : S.success} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.6 }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <StorageIcon sx={{ fontSize: '.82rem', color: t.textSecondary }} />
                  <Typography sx={{ fontSize: '.75rem', fontWeight: 600, color: t.textSecondary, fontFamily: FONT }}>RAM</Typography>
                </Stack>
                <Typography sx={{ fontSize: '.75rem', fontWeight: 700, color: s.ram > 80 ? S.danger : s.ram > 60 ? S.warning : S.success, fontFamily: FONT }}>{s.ram}%</Typography>
              </Stack>
              <MiniBar value={s.ram} color={s.ram > 80 ? S.danger : s.ram > 60 ? S.warning : S.success} />
            </Box>
          </Stack>

          {/* Quick actions */}
          <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap">
            <Button size="small" variant="outlined" startIcon={<TerminalIcon sx={{ fontSize: '.82rem' }} />}
              sx={{ fontSize: '.75rem', borderRadius: '5px', textTransform: 'none', borderColor: t.border, color: t.textPrimary }}>
              Open Terminal
            </Button>
            <Button size="small" variant="outlined" startIcon={<CodeIcon sx={{ fontSize: '.82rem' }} />}
              sx={{ fontSize: '.75rem', borderRadius: '5px', textTransform: 'none', borderColor: t.border, color: t.textPrimary }}>
              Open Editor
            </Button>
            <Button size="small" variant="outlined" startIcon={<RefreshIcon sx={{ fontSize: '.82rem' }} />}
              sx={{ fontSize: '.75rem', borderRadius: '5px', textTransform: 'none', borderColor: t.border, color: t.textSecondary }}>
              Restart
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Row: Recent Projects + Recent Pipelines */}
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
        {/* Recent Projects */}
        <Card sx={{ flex: 1, border: `1px solid ${t.border}`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '10px' }}>
          <CardContent sx={{ p: '14px 18px !important' }}>
            <Stack direction="row" alignItems="center" spacing={0.8} sx={{ mb: 1.25 }}>
              <FolderOpenIcon sx={{ fontSize: '0.9rem', color: t.textSecondary }} />
              <SectionTitle>Recent Projects</SectionTitle>
            </Stack>
            <Stack spacing={1}>
              {MOCK_RECENT_PROJECTS.map(p => (
                <Box key={p.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {statusDot(p.status)}
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '.82rem', fontWeight: 700, color: t.textPrimary, fontFamily: FONT }}>{p.name}</Typography>
                    <Typography sx={{ fontSize: '.72rem', color: t.textSecondary, fontFamily: FONT }}>{p.lang} · {p.lastActive}</Typography>
                  </Box>
                  <Chip label={p.status} size="small" sx={{ height: 18, fontSize: '.66rem', fontWeight: 700, textTransform: 'capitalize', bgcolor: STATUS_BG[p.status], color: STATUS_COLOR[p.status], '& .MuiChip-label': { px: 0.75 } }} />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        {/* Recent Pipelines */}
        <Card sx={{ flex: 1, border: `1px solid ${t.border}`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '10px' }}>
          <CardContent sx={{ p: '14px 18px !important' }}>
            <Stack direction="row" alignItems="center" spacing={0.8} sx={{ mb: 1.25 }}>
              <AccountTreeIcon sx={{ fontSize: '0.9rem', color: t.textSecondary }} />
              <SectionTitle>Recent Pipelines</SectionTitle>
            </Stack>
            <Stack spacing={1}>
              {MOCK_RECENT_PIPELINES.map(p => (
                <Box key={p.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {statusDot(p.status)}
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '.82rem', fontWeight: 700, color: t.textPrimary, fontFamily: FONT }}>{p.name}</Typography>
                    <Typography sx={{ fontSize: '.72rem', color: t.textSecondary, fontFamily: FONT }}>{p.duration} · {p.ago}</Typography>
                  </Box>
                  <Chip label={p.status} size="small" sx={{ height: 18, fontSize: '.66rem', fontWeight: 700, textTransform: 'capitalize', bgcolor: STATUS_BG[p.status], color: STATUS_COLOR[p.status], '& .MuiChip-label': { px: 0.75 } }} />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Assigned tasks */}
      <Card sx={{ border: `1px solid ${t.border}`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '10px' }}>
        <CardContent sx={{ p: '14px 18px !important' }}>
          <Stack direction="row" alignItems="center" spacing={0.8} sx={{ mb: 1.25 }}>
            <AssignmentIcon sx={{ fontSize: '0.9rem', color: t.textSecondary }} />
            <SectionTitle>Assigned Tasks</SectionTitle>
          </Stack>
          <Stack spacing={1}>
            {MOCK_TASKS.map(task => (
              <Box key={task.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5, borderBottom: `1px solid ${t.border}`, '&:last-child': { borderBottom: 0 } }}>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '.82rem', fontWeight: 600, color: t.textPrimary, fontFamily: FONT }}>{task.title}</Typography>
                  <Typography sx={{ fontSize: '.72rem', color: t.textSecondary, fontFamily: FONT }}>{task.group} · Due {task.due}</Typography>
                </Box>
                <Chip
                  label={task.priority}
                  size="small"
                  sx={{
                    height: 18, fontSize: '.66rem', fontWeight: 700, textTransform: 'capitalize',
                    bgcolor: task.priority === 'high' ? 'rgba(239,68,68,.12)' : 'rgba(245,158,11,.12)',
                    color:   task.priority === 'high' ? S.danger : S.warning,
                    '& .MuiChip-label': { px: 0.75 },
                  }}
                />
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Stats row */}
      <Stack direction="row" spacing={1.5} flexWrap="wrap">
        <StatMini label="Active Sessions"     value={1}   color={S.success} />
        <StatMini label="Containers"          value={s.containers} color={S.info} />
        <StatMini label="Volumes"             value={s.volumes}    color={S.purple} />
        <StatMini label="Open Tasks"          value={MOCK_TASKS.length} color={S.warning} />
      </Stack>
    </Stack>
  )
}

// ─── Tab 1 — Sessions ────────────────────────────────────────────────────────

function SessionsTab() {
  const s = MOCK_SESSION

  const containerRows = [
    { name: 'devbox-main',      image: 'atonix/devbox:22.04-lts', cpu: 38, ram: 62, status: 'running' },
    { name: 'postgres-local',   image: 'postgres:16',             cpu: 2,  ram: 14, status: 'running' },
    { name: 'redis-local',      image: 'redis:7-alpine',          cpu: 1,  ram: 4,  status: 'running' },
  ]
  const logs = [
    '08:55:12 INFO  workspace started: ws-john-01',
    '08:55:14 INFO  container devbox-main started',
    '08:55:15 INFO  container postgres-local started',
    '08:55:17 INFO  container redis-local started',
    '09:31:03 WARN  payment-service OOMKilled — restarting container',
    '09:31:08 INFO  container recovered: payment-service',
    '10:44:00 INFO  deployment api-gateway v1.4.2 → production succeeded',
    '10:58:01 INFO  pipeline triggered: api-gateway · main',
  ]

  return (
    <Stack spacing={2.5}>
      {/* Session info */}
      <Card sx={{ border: `1px solid ${t.border}`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '10px' }}>
        <CardContent sx={{ p: '14px 18px !important' }}>
          <SectionTitle>Active Session</SectionTitle>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
            {[
              ['Session ID',  s.id],
              ['Owner',       s.owner],
              ['IDE',         s.ide],
              ['Region',      s.region],
              ['Image',       s.image],
              ['Started',     new Date(s.started).toLocaleTimeString()],
              ['Uptime',      s.uptime],
            ].map(([label, value]) => (
              <Box key={label} sx={{ minWidth: 140 }}>
                <Typography sx={{ fontSize: '.7rem', color: t.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', fontFamily: FONT }}>{label}</Typography>
                <Typography sx={{ fontSize: '.82rem', color: t.textPrimary, fontWeight: 600, fontFamily: FONT }}>{value}</Typography>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* CPU & RAM live */}
      <Card sx={{ border: `1px solid ${t.border}`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '10px' }}>
        <CardContent sx={{ p: '14px 18px !important' }}>
          <SectionTitle>Resource Usage</SectionTitle>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
            {[
              { label: 'CPU Usage', value: s.cpu, color: s.cpu > 80 ? S.danger : s.cpu > 60 ? S.warning : S.success },
              { label: 'RAM Usage', value: s.ram, color: s.ram > 80 ? S.danger : s.ram > 60 ? S.warning : S.success },
            ].map(({ label, value, color }) => (
              <Box key={label} sx={{ flex: 1, textAlign: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-flex', mb: 0.5 }}>
                  <CircularProgress variant="determinate" value={value} size={72}
                    sx={{ color, '& .MuiCircularProgress-circle': { strokeLinecap: 'round' } }} />
                  <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: '.82rem', fontWeight: 800, color, fontFamily: FONT }}>{value}%</Typography>
                  </Box>
                </Box>
                <Typography sx={{ fontSize: '.78rem', color: t.textSecondary, fontFamily: FONT }}>{label}</Typography>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Containers */}
      <Card sx={{ border: `1px solid ${t.border}`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '10px' }}>
        <CardContent sx={{ p: '14px 18px !important' }}>
          <SectionTitle>Workspace Containers</SectionTitle>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Container', 'Image', 'CPU', 'RAM', 'Status'].map(h => (
                  <TableCell key={h} sx={{ color: t.textSecondary, fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', borderColor: t.border, py: 0.75, fontFamily: FONT }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {containerRows.map(c => (
                <TableRow key={c.name} sx={{ '& td': { borderColor: t.border } }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '.82rem', color: t.textPrimary, py: 0.75, fontFamily: FONT }}>{c.name}</TableCell>
                  <TableCell sx={{ fontSize: '.78rem', color: t.textSecondary, py: 0.75, fontFamily: FONT }}>{c.image}</TableCell>
                  <TableCell sx={{ py: 0.75, minWidth: 80 }}><MiniBar value={c.cpu} color={c.cpu > 80 ? S.danger : S.success} /></TableCell>
                  <TableCell sx={{ py: 0.75, minWidth: 80 }}><MiniBar value={c.ram} color={c.ram > 80 ? S.danger : c.ram > 60 ? S.warning : S.success} /></TableCell>
                  <TableCell sx={{ py: 0.75 }}>
                    <Chip label={c.status} size="small" sx={{ height: 18, fontSize: '.66rem', fontWeight: 700, bgcolor: STATUS_BG[c.status], color: STATUS_COLOR[c.status], '& .MuiChip-label': { px: 0.7 } }} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Workspace logs */}
      <Card sx={{ border: `1px solid ${t.border}`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '10px' }}>
        <CardContent sx={{ p: '14px 18px !important' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <SectionTitle>Workspace Logs</SectionTitle>
            <IconButton size="small" sx={{ color: t.textSecondary }}><RefreshIcon sx={{ fontSize: '.9rem' }} /></IconButton>
          </Stack>
          <Box sx={{
            fontFamily: 'monospace', fontSize: '.78rem', color: '#e6edf3',
            bgcolor: '#0d1117', borderRadius: '6px', p: 1.5, lineHeight: 1.7,
            maxHeight: 220, overflow: 'auto',
          }}>
            {logs.map((line, i) => {
              const level = line.includes('WARN') ? S.warning : line.includes('ERROR') ? S.danger : '#8b949e'
              return (
                <Box key={i} component="div" sx={{ color: line.includes('WARN') ? S.warning : line.includes('ERROR') ? S.danger : 'inherit' }}>
                  <span style={{ color: level, fontWeight: 600 }}>
                    {line.includes('WARN') ? '⚠ ' : line.includes('ERROR') ? '✖ ' : '  '}
                  </span>
                  {line}
                </Box>
              )
            })}
          </Box>
        </CardContent>
      </Card>
    </Stack>
  )
}

// ─── Tab 2 — Tools ───────────────────────────────────────────────────────────

function ToolsTab() {
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({})
  const toggle = (id: string) => setVisibleKeys(p => ({ ...p, [id]: !p[id] }))

  const cliCommands = [
    { label: 'Login',             cmd: 'atonix auth login' },
    { label: 'List workspaces',   cmd: 'atonix workspace list' },
    { label: 'Start workspace',   cmd: 'atonix workspace start ws-john-01' },
    { label: 'Deploy to prod',    cmd: 'atonix deploy --env=production --project=api-gateway' },
    { label: 'Port forward K8s',  cmd: 'atonix k8s port-forward service/api-gateway 8080:80' },
  ]

  return (
    <Stack spacing={2.5}>
      {/* API keys */}
      <Card sx={{ border: `1px solid ${t.border}`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '10px' }}>
        <CardContent sx={{ p: '14px 18px !important' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
            <Stack direction="row" spacing={0.7} alignItems="center">
              <KeyIcon sx={{ fontSize: '0.9rem', color: t.textSecondary }} />
              <SectionTitle>API Keys</SectionTitle>
            </Stack>
            <Button size="small" startIcon={<AddIcon sx={{ fontSize: '.8rem' }} />}
              sx={{ fontSize: '.72rem', textTransform: 'none', fontWeight: 700, color: dashboardTokens.colors.brandPrimary }}>
              New Key
            </Button>
          </Stack>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Name', 'Prefix', 'Created', 'Last Used', ''].map(h => (
                  <TableCell key={h} sx={{ color: t.textSecondary, fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', borderColor: t.border, py: 0.75, fontFamily: FONT }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {MOCK_API_KEYS.map(k => (
                <TableRow key={k.id} sx={{ '& td': { borderColor: t.border } }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '.82rem', color: t.textPrimary, py: 0.75, fontFamily: FONT }}>{k.name}</TableCell>
                  <TableCell sx={{ fontSize: '.78rem', color: t.textSecondary, py: 0.75, fontFamily: FONT, fontFamily2: 'monospace' }}>
                    <Box component="code" sx={{ bgcolor: 'rgba(148,163,184,.1)', px: 0.8, py: 0.2, borderRadius: 1, fontSize: '.75rem' }}>
                      {k.prefix}…
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: '.78rem', color: t.textSecondary, py: 0.75, fontFamily: FONT }}>{k.created}</TableCell>
                  <TableCell sx={{ fontSize: '.78rem', color: t.textSecondary, py: 0.75, fontFamily: FONT }}>{k.lastUsed}</TableCell>
                  <TableCell align="right" sx={{ py: 0.75 }}>
                    <IconButton size="small" sx={{ color: t.textSecondary }}><ContentCopyIcon sx={{ fontSize: '.82rem' }} /></IconButton>
                    <IconButton size="small" sx={{ color: S.danger }}><DeleteOutlineIcon sx={{ fontSize: '.82rem' }} /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* SSH Keys */}
      <Card sx={{ border: `1px solid ${t.border}`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '10px' }}>
        <CardContent sx={{ p: '14px 18px !important' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
            <Stack direction="row" spacing={0.7} alignItems="center">
              <LockIcon sx={{ fontSize: '0.9rem', color: t.textSecondary }} />
              <SectionTitle>SSH Keys</SectionTitle>
            </Stack>
            <Button size="small" startIcon={<AddIcon sx={{ fontSize: '.8rem' }} />}
              sx={{ fontSize: '.72rem', textTransform: 'none', fontWeight: 700, color: dashboardTokens.colors.brandPrimary }}>
              Add Key
            </Button>
          </Stack>
          <Stack spacing={1}>
            {MOCK_SSH_KEYS.map(k => (
              <Box key={k.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5, borderBottom: `1px solid ${t.border}`, '&:last-child': { borderBottom: 0 } }}>
                <LockIcon sx={{ fontSize: '0.9rem', color: t.textSecondary, flexShrink: 0 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '.82rem', fontWeight: 700, color: t.textPrimary, fontFamily: FONT }}>{k.name}</Typography>
                  <Box component="code" sx={{ fontSize: '.72rem', color: t.textSecondary, fontFamily: 'monospace' }}>{k.fingerprint}</Box>
                </Box>
                <Typography sx={{ fontSize: '.72rem', color: t.textSecondary, fontFamily: FONT }}>Added {k.added}</Typography>
                <IconButton size="small" sx={{ color: S.danger }}><DeleteOutlineIcon sx={{ fontSize: '.82rem' }} /></IconButton>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Personal Access Tokens */}
      <Card sx={{ border: `1px solid ${t.border}`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '10px' }}>
        <CardContent sx={{ p: '14px 18px !important' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
            <SectionTitle>Personal Access Tokens</SectionTitle>
            <Button size="small" startIcon={<AddIcon sx={{ fontSize: '.8rem' }} />}
              sx={{ fontSize: '.72rem', textTransform: 'none', fontWeight: 700, color: dashboardTokens.colors.brandPrimary }}>
              New Token
            </Button>
          </Stack>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Name', 'Scopes', 'Expiry', 'Last Used', ''].map(h => (
                  <TableCell key={h} sx={{ color: t.textSecondary, fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', borderColor: t.border, py: 0.75, fontFamily: FONT }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {MOCK_PATS.map(p => (
                <TableRow key={p.id} sx={{ '& td': { borderColor: t.border } }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '.82rem', color: t.textPrimary, py: 0.75, fontFamily: FONT }}>{p.name}</TableCell>
                  <TableCell sx={{ py: 0.75 }}>
                    {p.scopes.split(',').map(sc => (
                      <Chip key={sc} label={sc} size="small" sx={{ mr: 0.4, height: 16, fontSize: '.62rem', bgcolor: 'rgba(0,224,255,.1)', color: S.info, '& .MuiChip-label': { px: 0.5 } }} />
                    ))}
                  </TableCell>
                  <TableCell sx={{ fontSize: '.78rem', color: t.textSecondary, py: 0.75, fontFamily: FONT }}>{p.expiry}</TableCell>
                  <TableCell sx={{ fontSize: '.78rem', color: t.textSecondary, py: 0.75, fontFamily: FONT }}>{p.lastUsed}</TableCell>
                  <TableCell align="right" sx={{ py: 0.75 }}>
                    <IconButton size="small" onClick={() => toggle(p.id)} sx={{ color: t.textSecondary }}>
                      {visibleKeys[p.id] ? <VisibilityOffIcon sx={{ fontSize: '.82rem' }} /> : <VisibilityIcon sx={{ fontSize: '.82rem' }} />}
                    </IconButton>
                    <IconButton size="small" sx={{ color: S.danger }}><DeleteOutlineIcon sx={{ fontSize: '.82rem' }} /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* CLI Commands */}
      <Card sx={{ border: `1px solid ${t.border}`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '10px' }}>
        <CardContent sx={{ p: '14px 18px !important' }}>
          <SectionTitle>CLI Commands (auto-generated for your workspace)</SectionTitle>
          <Stack spacing={0.75}>
            {cliCommands.map((c, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: '#0d1117', borderRadius: '6px', px: 1.5, py: 0.75 }}>
                <Typography sx={{ fontSize: '.7rem', color: '#8b949e', minWidth: 120, fontFamily: FONT }}>{c.label}</Typography>
                <Box component="code" sx={{ flex: 1, fontSize: '.78rem', color: '#e6edf3', fontFamily: 'monospace' }}>{c.cmd}</Box>
                <IconButton size="small" sx={{ color: '#8b949e' }}><ContentCopyIcon sx={{ fontSize: '.78rem' }} /></IconButton>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}

// ─── Tab 3 — Logs (Activity Timeline) ────────────────────────────────────────

function LogsTab() {
  const typeColor: Record<string, string> = {
    Pipeline: S.info, Deploy: S.success, Error: S.danger, Workspace: S.purple, Alert: S.warning,
  }

  return (
    <Card sx={{ border: `1px solid ${t.border}`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '10px' }}>
      <CardContent sx={{ p: '14px 18px !important' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <SectionTitle>24-Hour Activity Timeline</SectionTitle>
          <Chip label="Feb 25, 2026" size="small" sx={{ height: 20, fontSize: '.7rem', bgcolor: 'rgba(148,163,184,.12)', color: t.textSecondary }} />
        </Stack>
        <Stack spacing={0}>
          {MOCK_ACTIVITY.map((ev, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 1.5, pb: 1.5 }}>
              {/* Timeline line */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 18 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: STATUS_COLOR[ev.status] ?? '#94a3b8', flexShrink: 0, mt: 0.3 }} />
                {i < MOCK_ACTIVITY.length - 1 && (
                  <Box sx={{ width: 1, flex: 1, bgcolor: t.border, mt: 0.5 }} />
                )}
              </Box>
              {/* Content */}
              <Box sx={{ flex: 1, pb: 0.5 }}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Typography sx={{ fontSize: '.7rem', fontWeight: 700, color: typeColor[ev.type] ?? t.textSecondary, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: FONT }}>
                    {ev.type}
                  </Typography>
                  <Typography sx={{ fontSize: '.7rem', color: t.textSecondary, fontFamily: FONT, whiteSpace: 'pre' }}>
                    {ev.time}
                  </Typography>
                </Stack>
                <Typography sx={{ fontSize: '.82rem', color: t.textPrimary, fontFamily: FONT, mt: 0.2 }}>
                  {ev.msg}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  )
}

// ─── Tab 4 — Settings ────────────────────────────────────────────────────────

function SettingsTab() {
  const [autoStart, setAutoStart]     = useState(true)
  const [darkMode, setDarkMode]       = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [autoSave, setAutoSave]       = useState(true)
  const [telemetry, setTelemetry]     = useState(false)

  const rows: { label: string; sub: string; value: boolean; set: (v: boolean) => void }[] = [
    { label: 'Auto-start workspace on login', sub: 'Workspace starts automatically when you log in to AtonixCorp Cloud.', value: autoStart, set: setAutoStart },
    { label: 'Dark mode', sub: 'Use dark mode across all Developer Workspace views.', value: darkMode, set: setDarkMode },
    { label: 'Push notifications', sub: 'Receive notifications for pipeline completions, errors, and deployments.', value: notifications, set: setNotifications },
    { label: 'Auto-save editor changes', sub: 'Save editor changes automatically every 30 seconds.', value: autoSave, set: setAutoSave },
    { label: 'Share anonymous telemetry', sub: 'Help improve AtonixCorp by sharing anonymous usage data.', value: telemetry, set: setTelemetry },
  ]

  return (
    <Stack spacing={2}>
      <Card sx={{ border: `1px solid ${t.border}`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '10px' }}>
        <CardContent sx={{ p: '14px 18px !important' }}>
          <SectionTitle>Workspace Preferences</SectionTitle>
          <Stack divider={<Divider sx={{ borderColor: t.border }} />}>
            {rows.map(r => (
              <Box key={r.label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.25, gap: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: '.85rem', fontWeight: 600, color: t.textPrimary, fontFamily: FONT }}>{r.label}</Typography>
                  <Typography sx={{ fontSize: '.75rem', color: t.textSecondary, fontFamily: FONT }}>{r.sub}</Typography>
                </Box>
                <Switch checked={r.value} onChange={e => r.set(e.target.checked)} size="small"
                  sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: dashboardTokens.colors.brandPrimary }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: dashboardTokens.colors.brandPrimary } }} />
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ border: `1px solid ${t.border}`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '10px' }}>
        <CardContent sx={{ p: '14px 18px !important' }}>
          <SectionTitle>Danger Zone</SectionTitle>
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1, borderBottom: `1px solid ${t.border}` }}>
              <Box>
                <Typography sx={{ fontSize: '.85rem', fontWeight: 600, color: t.textPrimary, fontFamily: FONT }}>Reset workspace</Typography>
                <Typography sx={{ fontSize: '.75rem', color: t.textSecondary, fontFamily: FONT }}>Destroy and re-provision from a clean image. All unsaved work will be lost.</Typography>
              </Box>
              <Button size="small" variant="outlined" sx={{ borderColor: S.warning, color: S.warning, fontWeight: 700, fontSize: '.75rem', textTransform: 'none', borderRadius: '5px', '&:hover': { borderColor: S.warning, bgcolor: 'rgba(245,158,11,.08)' } }}>
                Reset
              </Button>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}>
              <Box>
                <Typography sx={{ fontSize: '.85rem', fontWeight: 600, color: S.danger, fontFamily: FONT }}>Delete workspace</Typography>
                <Typography sx={{ fontSize: '.75rem', color: t.textSecondary, fontFamily: FONT }}>Permanently delete this workspace and all associated data.</Typography>
              </Box>
              <Button size="small" variant="outlined" sx={{ borderColor: S.danger, color: S.danger, fontWeight: 700, fontSize: '.75rem', textTransform: 'none', borderRadius: '5px', '&:hover': { borderColor: S.danger, bgcolor: 'rgba(239,68,68,.08)' } }}>
                Delete
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}

// ─── Root page ─────────────────────────────────────────────────────────────────

const TABS = ['Overview', 'Sessions', 'Tools', 'Logs', 'Settings']

const DevWorkspacePage: React.FC = () => {
  const [tab, setTab]           = useState(0)
  const [sessionRunning, setSessionRunning] = useState(true)
  const [toast, setToast]       = useState<string | null>(null)

  const handleStartStop = (start: boolean) => {
    setSessionRunning(start)
    setToast(start ? 'Workspace starting…' : 'Workspace stopped.')
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, fontFamily: FONT }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.2rem', md: '1.35rem' }, color: t.textPrimary, fontFamily: FONT, letterSpacing: '-.02em' }}>
            Developer Workspace
          </Typography>
          <Typography sx={{ color: t.textSecondary, fontSize: '.875rem', mt: 0.3, fontFamily: FONT }}>
            Your private cloud cockpit — build, test, Deploy, and monitor without leaving AtonixCorp Cloud.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.5, borderRadius: '20px', bgcolor: sessionRunning ? 'rgba(34,197,94,.12)' : 'rgba(239,68,68,.12)' }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: sessionRunning ? S.success : S.danger, animation: sessionRunning ? 'pulse 2s infinite' : 'none' }} />
            <Typography sx={{ fontSize: '.78rem', fontWeight: 700, color: sessionRunning ? S.success : S.danger, fontFamily: FONT }}>
              {sessionRunning ? 'Running' : 'Offline'}
            </Typography>
          </Box>
          <Tooltip title="Notifications">
            <IconButton size="small" sx={{ color: t.textSecondary }}>
              <NotificationsNoneIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 2.5,
          borderBottom: `1px solid ${t.border}`,
          minHeight: 38,
          '& .MuiTab-root': { fontFamily: FONT, fontSize: '.82rem', fontWeight: 600, textTransform: 'none', minHeight: 38, color: t.textSecondary, px: 1.5 },
          '& .Mui-selected': { color: dashboardTokens.colors.brandPrimary },
          '& .MuiTabs-indicator': { bgcolor: dashboardTokens.colors.brandPrimary, height: 2 },
        }}
      >
        {TABS.map(label => <Tab key={label} label={label} />)}
      </Tabs>

      {tab === 0 && <OverviewTab onStartStop={handleStartStop} />}
      {tab === 1 && <SessionsTab />}
      {tab === 2 && <ToolsTab />}
      {tab === 3 && <LogsTab />}
      {tab === 4 && <SettingsTab />}

      <Snackbar open={Boolean(toast)} autoHideDuration={4000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="info" onClose={() => setToast(null)} sx={{ fontFamily: FONT }}>{toast}</Alert>
      </Snackbar>
    </Box>
  )
}

export default DevWorkspacePage
