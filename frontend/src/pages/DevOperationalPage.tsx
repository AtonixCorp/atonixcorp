import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorIcon from '@mui/icons-material/Error';
import BuildIcon from '@mui/icons-material/Build';
import SpeedIcon from '@mui/icons-material/Speed';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import { dashboardTokens, dashboardSemanticColors } from '../styles/dashboardDesignSystem';

const FONT = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const t = dashboardTokens.colors;

type ServiceStatus = 'running' | 'degraded' | 'stopped';
type RunbookStatus = 'success' | 'running' | 'failed' | 'pending';

interface Service {
  name: string;
  status: ServiceStatus;
  uptime: string;
  cpu: number;
  memory: number;
  requests: string;
  errorRate: string;
  version: string;
}

interface Runbook {
  id: string;
  name: string;
  description: string;
  status: RunbookStatus;
  lastRun: string;
  duration: string;
  owner: string;
}

const SERVICES: Service[] = [
  { name: 'api-gateway',      status: 'running',  uptime: '99.98%', cpu: 34, memory: 52, requests: '12.4k/min', errorRate: '0.02%', version: 'v2.4.1' },
  { name: 'payment-service',  status: 'running',  uptime: '99.95%', cpu: 61, memory: 74, requests: '3.1k/min',  errorRate: '0.08%', version: 'v1.9.3' },
  { name: 'auth-service',     status: 'running',  uptime: '100%',   cpu: 18, memory: 38, requests: '8.7k/min',  errorRate: '0.00%', version: 'v3.1.0' },
  { name: 'events-worker',    status: 'degraded', uptime: '97.20%', cpu: 88, memory: 91, requests: '450/min',   errorRate: '2.30%', version: 'v1.2.7' },
  { name: 'web-frontend',     status: 'running',  uptime: '99.99%', cpu: 12, memory: 29, requests: '24k/min',   errorRate: '0.01%', version: 'v5.0.2' },
  { name: 'kafka-consumer',   status: 'stopped',  uptime: '—',      cpu: 0,  memory: 0,  requests: '—',         errorRate: '—',     version: 'v0.8.4' },
];

const RUNBOOKS: Runbook[] = [
  { id: 'r1', name: 'Rollback production', description: 'Revert the latest deployment to the previous stable version', status: 'success', lastRun: '2 hours ago', duration: '4m 12s', owner: 'Frank' },
  { id: 'r2', name: 'Restart events-worker', description: 'Gracefully restart all events-worker pods', status: 'running',  lastRun: 'Just now',    duration: '—',      owner: 'Jane'  },
  { id: 'r3', name: 'DB connection flush',  description: 'Flush stale connections from the connection pool', status: 'failed',  lastRun: '1 day ago',  duration: '1m 05s', owner: 'Frank' },
  { id: 'r4', name: 'Cache warm-up',        description: 'Pre-warm Redis cache for peak traffic windows', status: 'pending', lastRun: 'Never',       duration: '—',      owner: 'Sarah' },
  { id: 'r5', name: 'SSL cert renewal',     description: 'Auto-renew expiring TLS certificates', status: 'success', lastRun: '3 days ago',  duration: '22s',    owner: 'Ops Bot' },
];

const SVC_STATUS_COLOR: Record<ServiceStatus, string> = {
  running:  dashboardSemanticColors.success,
  degraded: dashboardSemanticColors.warning,
  stopped:  dashboardSemanticColors.danger,
};
const SVC_STATUS_BG: Record<ServiceStatus, string> = {
  running:  'rgba(34,197,94,.12)',
  degraded: 'rgba(245,158,11,.12)',
  stopped:  'rgba(239,68,68,.12)',
};
const RB_STATUS_COLOR: Record<RunbookStatus, string> = {
  success: dashboardSemanticColors.success,
  running: dashboardSemanticColors.info,
  failed:  dashboardSemanticColors.danger,
  pending: dashboardSemanticColors.warning,
};
const RB_STATUS_BG: Record<RunbookStatus, string> = {
  success: 'rgba(34,197,94,.12)',
  running: 'rgba(0,224,255,.12)',
  failed:  'rgba(239,68,68,.12)',
  pending: 'rgba(245,158,11,.12)',
};

const SvcStatusIcon: React.FC<{ s: ServiceStatus }> = ({ s }) => {
  const props = { sx: { fontSize: '.78rem' } };
  if (s === 'running')  return <CheckCircleIcon  {...props} />;
  if (s === 'degraded') return <WarningAmberIcon {...props} />;
  return <ErrorIcon {...props} />;
};

const UsageBar: React.FC<{ value: number }> = ({ value }) => {
  const color = value >= 80 ? dashboardSemanticColors.danger : value >= 60 ? dashboardSemanticColors.warning : dashboardSemanticColors.success;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 80 }}>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          flex: 1, height: 5, borderRadius: 3,
          bgcolor: `${color}22`,
          '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 },
        }}
      />
      <Typography sx={{ fontSize: '.72rem', fontWeight: 600, color, fontFamily: FONT, minWidth: 26, textAlign: 'right' }}>
        {value}%
      </Typography>
    </Box>
  );
};

const DevOperationalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'services' | 'runbooks'>('services');

  const running  = SERVICES.filter(s => s.status === 'running').length;
  const degraded = SERVICES.filter(s => s.status === 'degraded').length;
  const stopped  = SERVICES.filter(s => s.status === 'stopped').length;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, fontFamily: FONT }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.2rem', md: '1.35rem' }, color: t.textPrimary, fontFamily: FONT, letterSpacing: '-.02em' }}>
            Operational
          </Typography>
          <Typography sx={{ color: t.textSecondary, fontSize: '.875rem', mt: 0.3, fontFamily: FONT }}>
            Live service health, resource utilisation, and operational runbooks.
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<BuildIcon sx={{ fontSize: '.85rem' }} />}
          sx={{
            bgcolor: dashboardTokens.colors.brandPrimary,
            color: '#0a0f1a',
            fontWeight: 700,
            fontSize: '.8rem',
            borderRadius: '6px',
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': { bgcolor: dashboardTokens.colors.brandPrimaryHover, boxShadow: 'none' },
          }}
        >
          New Runbook
        </Button>
      </Box>

      {/* KPI stats */}
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5} sx={{ mb: 3 }}>
        {[
          { label: 'Running',     value: running,  color: dashboardSemanticColors.success, icon: <CheckCircleIcon sx={{ fontSize: '1rem' }} /> },
          { label: 'Degraded',    value: degraded, color: dashboardSemanticColors.warning, icon: <WarningAmberIcon sx={{ fontSize: '1rem' }} /> },
          { label: 'Down',        value: stopped,  color: dashboardSemanticColors.danger,  icon: <ErrorIcon sx={{ fontSize: '1rem' }} /> },
          { label: 'Avg CPU',     value: `${Math.round(SERVICES.filter(s => s.cpu > 0).reduce((a, s) => a + s.cpu, 0) / running)}%`, color: dashboardSemanticColors.info,    icon: <SpeedIcon sx={{ fontSize: '1rem' }} /> },
          { label: 'Avg Uptime',  value: '99.4%',  color: dashboardSemanticColors.success, icon: <TrendingUpIcon sx={{ fontSize: '1rem' }} /> },
          { label: 'Runbooks',    value: RUNBOOKS.length, color: dashboardSemanticColors.purple, icon: <AccessTimeIcon sx={{ fontSize: '1rem' }} /> },
        ].map((s) => (
          <Card key={s.label} sx={{ flex: 1, border: `1px solid ${t.border}`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '8px' }}>
            <CardContent sx={{ p: '12px 16px !important' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5, color: s.color }}>
                {s.icon}
                <Typography sx={{ fontSize: '.72rem', fontWeight: 600, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: FONT }}>
                  {s.label}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '1.45rem', fontWeight: 800, color: s.color, lineHeight: 1.2, fontFamily: FONT }}>
                {s.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Tabs */}
      <Stack direction="row" gap={0.5} sx={{ mb: 2 }}>
        {(['services', 'runbooks'] as const).map((tab) => (
          <Button
            key={tab}
            size="small"
            onClick={() => setActiveTab(tab)}
            sx={{
              textTransform: 'capitalize',
              fontWeight: activeTab === tab ? 700 : 500,
              fontSize: '.82rem',
              borderRadius: '6px',
              px: 1.75,
              color: activeTab === tab ? dashboardTokens.colors.brandPrimary : t.textSecondary,
              bgcolor: activeTab === tab ? 'rgba(0,224,255,0.10)' : 'transparent',
              border: `1px solid ${activeTab === tab ? 'rgba(0,224,255,0.28)' : 'transparent'}`,
              '&:hover': { bgcolor: 'rgba(0,224,255,0.07)' },
            }}
          >
            {tab === 'services' ? 'Services' : 'Runbooks'}
          </Button>
        ))}
      </Stack>

      {/* Services table */}
      {activeTab === 'services' && (
        <Card sx={{ border: `1px solid ${t.border}`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '8px' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: t.surfaceSubtle }}>
                {['Service', 'Status', 'Uptime', 'CPU', 'Memory', 'Requests', 'Error Rate', 'Version', ''].map((h) => (
                  <TableCell key={h} sx={{ color: t.textSecondary, fontSize: '.7rem', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', borderColor: t.border, py: 1.2, fontFamily: FONT }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {SERVICES.map((svc, i) => (
                <TableRow key={svc.name} sx={{ bgcolor: i % 2 === 0 ? 'transparent' : t.surfaceSubtle, '&:hover': { bgcolor: t.surfaceHover }, '& td': { borderColor: t.border } }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '.875rem', color: t.textPrimary, fontFamily: FONT, py: 1.2, whiteSpace: 'nowrap' }}>
                    {svc.name}
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={<SvcStatusIcon s={svc.status} />}
                      label={svc.status}
                      size="small"
                      sx={{ bgcolor: SVC_STATUS_BG[svc.status], color: SVC_STATUS_COLOR[svc.status], fontWeight: 700, fontSize: '.72rem', height: 18, textTransform: 'capitalize', '& .MuiChip-label': { px: 0.75 }, '& .MuiChip-icon': { color: SVC_STATUS_COLOR[svc.status], fontSize: '.78rem', ml: 0.5 } }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '.82rem', color: svc.uptime === '100%' ? dashboardSemanticColors.success : t.textPrimary, fontWeight: 600, fontFamily: FONT }}>{svc.uptime}</TableCell>
                  <TableCell><UsageBar value={svc.cpu} /></TableCell>
                  <TableCell><UsageBar value={svc.memory} /></TableCell>
                  <TableCell sx={{ fontSize: '.82rem', color: t.textPrimary, fontFamily: FONT }}>{svc.requests}</TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '.82rem', fontWeight: 600, fontFamily: FONT, color: parseFloat(svc.errorRate) > 1 ? dashboardSemanticColors.danger : parseFloat(svc.errorRate) > 0 ? dashboardSemanticColors.warning : dashboardSemanticColors.success }}>
                      {svc.errorRate}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: '.78rem', color: t.textSecondary, fontFamily: FONT }}>{svc.version}</TableCell>
                  <TableCell align="right">
                    {svc.status === 'stopped' ? (
                      <Button size="small" startIcon={<PlayArrowIcon sx={{ fontSize: '.75rem' }} />} sx={{ fontSize: '.7rem', borderRadius: '5px', textTransform: 'none', color: dashboardSemanticColors.success, border: `1px solid rgba(34,197,94,.3)`, px: 0.75, py: 0.25, minWidth: 0 }}>Start</Button>
                    ) : (
                      <Button size="small" startIcon={<StopIcon sx={{ fontSize: '.75rem' }} />} sx={{ fontSize: '.7rem', borderRadius: '5px', textTransform: 'none', color: t.textSecondary, border: `1px solid ${t.border}`, px: 0.75, py: 0.25, minWidth: 0 }}>Stop</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Divider sx={{ borderColor: t.border }} />
          <Box sx={{ px: 2, py: 1.25 }}>
            <Typography sx={{ fontSize: '.78rem', color: t.textSecondary, fontFamily: FONT }}>{SERVICES.length} services total</Typography>
          </Box>
        </Card>
      )}

      {/* Runbooks table */}
      {activeTab === 'runbooks' && (
        <Card sx={{ border: `1px solid ${t.border}`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '8px' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: t.surfaceSubtle }}>
                {['Runbook', 'Description', 'Status', 'Last Run', 'Duration', 'Owner', ''].map((h) => (
                  <TableCell key={h} sx={{ color: t.textSecondary, fontSize: '.7rem', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', borderColor: t.border, py: 1.2, fontFamily: FONT }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {RUNBOOKS.map((rb, i) => (
                <TableRow key={rb.id} sx={{ bgcolor: i % 2 === 0 ? 'transparent' : t.surfaceSubtle, '&:hover': { bgcolor: t.surfaceHover }, '& td': { borderColor: t.border } }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '.875rem', color: t.textPrimary, fontFamily: FONT, py: 1.2, whiteSpace: 'nowrap' }}>{rb.name}</TableCell>
                  <TableCell sx={{ fontSize: '.82rem', color: t.textSecondary, maxWidth: 260, fontFamily: FONT }}>{rb.description}</TableCell>
                  <TableCell>
                    <Chip
                      label={rb.status}
                      size="small"
                      sx={{ bgcolor: RB_STATUS_BG[rb.status], color: RB_STATUS_COLOR[rb.status], fontWeight: 700, fontSize: '.72rem', height: 18, textTransform: 'capitalize', '& .MuiChip-label': { px: 0.75 } }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '.82rem', color: t.textSecondary, fontFamily: FONT, whiteSpace: 'nowrap' }}>{rb.lastRun}</TableCell>
                  <TableCell sx={{ fontSize: '.82rem', color: t.textSecondary, fontFamily: FONT }}>{rb.duration}</TableCell>
                  <TableCell>
                    <Chip label={rb.owner} size="small" sx={{ bgcolor: 'rgba(139,92,246,.12)', color: dashboardSemanticColors.purple, fontWeight: 600, fontSize: '.72rem', height: 18, '& .MuiChip-label': { px: 0.75 } }} />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      startIcon={<PlayArrowIcon sx={{ fontSize: '.75rem' }} />}
                      disabled={rb.status === 'running'}
                      sx={{ fontSize: '.7rem', borderRadius: '5px', textTransform: 'none', color: dashboardTokens.colors.brandPrimary, border: `1px solid rgba(0,224,255,0.28)`, px: 0.75, py: 0.25, minWidth: 0, '&.Mui-disabled': { opacity: 0.4 } }}
                    >
                      Run
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Divider sx={{ borderColor: t.border }} />
          <Box sx={{ px: 2, py: 1.25 }}>
            <Typography sx={{ fontSize: '.78rem', color: t.textSecondary, fontFamily: FONT }}>{RUNBOOKS.length} runbooks total</Typography>
          </Box>
        </Card>
      )}
    </Box>
  );
};

export default DevOperationalPage;
