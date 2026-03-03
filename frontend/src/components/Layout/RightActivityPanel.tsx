/**
 * RightActivityPanel
 *
 * Context-aware right sidebar that changes its content based on the
 * current route. Shows live process summaries, resource status and
 * quick actions relevant to the active module.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Chip,
  Divider,
  IconButton,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import AccountTreeIcon       from '@mui/icons-material/AccountTree';
import CallSplitIcon         from '@mui/icons-material/CallSplit';
import ChevronLeftIcon       from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon      from '@mui/icons-material/ChevronRight';
import CircleIcon            from '@mui/icons-material/Circle';
import CheckCircleIcon       from '@mui/icons-material/CheckCircle';
import ErrorIcon             from '@mui/icons-material/Error';
import FolderOpenIcon        from '@mui/icons-material/FolderOpen';
import HourglassEmptyIcon    from '@mui/icons-material/HourglassEmpty';
import HubIcon               from '@mui/icons-material/Hub';
import LayersIcon            from '@mui/icons-material/Layers';
import LocalOfferIcon        from '@mui/icons-material/LocalOffer';
import MemoryIcon            from '@mui/icons-material/Memory';
import PlayCircleIcon        from '@mui/icons-material/PlayCircle';
import RefreshIcon           from '@mui/icons-material/Refresh';
import StorageIcon           from '@mui/icons-material/Storage';
import SyncIcon              from '@mui/icons-material/Sync';
import TerminalIcon          from '@mui/icons-material/Terminal';
import ViewInArIcon          from '@mui/icons-material/ViewInAr';
import WarningAmberIcon      from '@mui/icons-material/WarningAmber';
import { useLocation, useNavigate } from 'react-router-dom';
import { dashboardTokens, dashboardSemanticColors } from '../../styles/dashboardDesignSystem';
import { listProjects, listAllRepos } from '../../services/projectsApi';
import apiClient from '../../services/apiClient';

const t    = dashboardTokens.colors;
const FONT = dashboardTokens.typography.fontFamily;
const MONO = '"JetBrains Mono","Fira Code",monospace';

export const RIGHT_PANEL_WIDTH  = 268;
export const RIGHT_PANEL_COLLAPSED_WIDTH = 0;

// ── Types ─────────────────────────────────────────────────────────────────────

type Status = 'running' | 'success' | 'failed' | 'warning' | 'idle' | 'pending';

interface ProcessItem {
  id:     string;
  label:  string;
  sub?:   string;
  status: Status;
  meta?:  string;
}

interface QuickAction {
  label:  string;
  icon:   React.ReactNode;
  onClick?: () => void;
}

interface PanelDef {
  title:    string;
  icon:     React.ReactNode;
  items:    ProcessItem[];
  actions:  QuickAction[];
  metrics?: { label: string; value: string | number; color?: string; loading?: boolean }[];
}

interface LiveCounts {
  projects:   number | null;
  repos:      number | null;
  pipelines:  number | null;
  containers: number | null;
  loading:    boolean;
}

// ── Status helpers ─────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<Status, string> = {
  running: '#F59E0B',
  success: dashboardSemanticColors.success,
  failed:  dashboardSemanticColors.danger,
  warning: dashboardSemanticColors.warning,
  idle:    t.textTertiary,
  pending: '#6366F1',
};

const StatusDot: React.FC<{ status: Status }> = ({ status }) => (
  <CircleIcon sx={{ fontSize: '.55rem', color: STATUS_COLOR[status], flexShrink: 0 }} />
);

const StatusIcon: React.FC<{ status: Status }> = ({ status }) => {
  if (status === 'success') return <CheckCircleIcon sx={{ fontSize: '.9rem', color: STATUS_COLOR.success }} />;
  if (status === 'failed')  return <ErrorIcon       sx={{ fontSize: '.9rem', color: STATUS_COLOR.failed  }} />;
  if (status === 'warning') return <WarningAmberIcon sx={{ fontSize: '.9rem', color: STATUS_COLOR.warning }} />;
  if (status === 'running') return <SyncIcon         sx={{ fontSize: '.9rem', color: STATUS_COLOR.running, animation: 'spin 1.4s linear infinite', '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } } }} />;
  if (status === 'pending') return <HourglassEmptyIcon sx={{ fontSize: '.9rem', color: STATUS_COLOR.pending }} />;
  return <CircleIcon sx={{ fontSize: '.6rem', color: STATUS_COLOR.idle }} />;
};

// ── Panel definitions per route ────────────────────────────────────────────────

function usePanelDef(pathname: string, live: LiveCounts): PanelDef {
  const navigate = useNavigate();

  if (pathname.includes('/repositories') || pathname.includes('/repo/')) {
    return {
      title: 'Repository Activity',
      icon:  <AccountTreeIcon sx={{ fontSize: '1rem', color: t.brandPrimary }} />,
      metrics: [
        { label: 'Branches',    value: 3,     color: t.textPrimary },
        { label: 'Tags',        value: 2,     color: t.textPrimary },
        { label: 'Open PRs',    value: 1,     color: '#6366F1'     },
        { label: 'Open Issues', value: 4,     color: dashboardSemanticColors.warning },
      ],
      items: [
        { id: '1', label: 'main',    sub: 'Last push 43m ago',    status: 'success', meta: 'protected' },
        { id: '2', label: 'develop', sub: 'Last push 2h ago',     status: 'running', meta: '2 ahead'   },
        { id: '3', label: 'feat/auth', sub: 'Last push 1d ago',   status: 'idle',    meta: '5 ahead'   },
      ],
      actions: [
        { label: 'Sync Repository', icon: <SyncIcon sx={{ fontSize: '.85rem' }} />,     onClick: () => {} },
        { label: 'View Logs',       icon: <TerminalIcon sx={{ fontSize: '.85rem' }} />, onClick: () => {} },
        { label: 'Branches',        icon: <CallSplitIcon sx={{ fontSize: '.85rem' }} />, onClick: () => navigate('/developer/Dashboard/repositories') },
      ],
    };
  }

  if (pathname.includes('/containers')) {
    return {
      title: 'Container Activity',
      icon:  <ViewInArIcon sx={{ fontSize: '1rem', color: t.brandPrimary }} />,
      metrics: [
        { label: 'Running',   value: 4,       color: dashboardSemanticColors.success  },
        { label: 'Stopped',   value: 1,       color: t.textTertiary },
        { label: 'CPU',       value: '34%',   color: dashboardSemanticColors.warning  },
        { label: 'Memory',    value: '2.1 GB', color: t.textPrimary },
      ],
      items: [
        { id: '1', label: 'api-gateway',    sub: 'cpu 12% · mem 310MB',  status: 'running' },
        { id: '2', label: 'auth-service',   sub: 'cpu 5%  · mem 180MB',  status: 'running' },
        { id: '3', label: 'worker-1',       sub: 'cpu 22% · mem 640MB',  status: 'warning' },
        { id: '4', label: 'postgres-proxy', sub: 'cpu 2%  · mem 90MB',   status: 'running' },
        { id: '5', label: 'redis-cache',    sub: 'exited 10m ago',        status: 'failed'  },
      ],
      actions: [
        { label: 'Restart Failed',  icon: <RefreshIcon   sx={{ fontSize: '.85rem' }} />, onClick: () => {} },
        { label: 'Scale Up',        icon: <LayersIcon    sx={{ fontSize: '.85rem' }} />, onClick: () => {} },
        { label: 'Inspect Logs',    icon: <TerminalIcon  sx={{ fontSize: '.85rem' }} />, onClick: () => {} },
      ],
    };
  }

  if (pathname.includes('/cicd') || pathname.includes('/pipelines')) {
    return {
      title: 'Pipeline Activity',
      icon:  <PlayCircleIcon sx={{ fontSize: '1rem', color: t.brandPrimary }} />,
      metrics: [
        { label: 'Running',  value: 2,    color: STATUS_COLOR.running },
        { label: 'Passed',   value: 14,   color: dashboardSemanticColors.success },
        { label: 'Failed',   value: 1,    color: dashboardSemanticColors.danger  },
        { label: 'Queued',   value: 3,    color: '#6366F1' },
      ],
      items: [
        { id: '1', label: 'build:main',      sub: 'triggered 3m ago',   status: 'running', meta: '#142' },
        { id: '2', label: 'test:develop',    sub: 'triggered 8m ago',   status: 'running', meta: '#141' },
        { id: '3', label: 'deploy:staging',  sub: 'completed 22m ago',  status: 'success', meta: '#140' },
        { id: '4', label: 'test:feat/auth',  sub: 'failed 1h ago',      status: 'failed',  meta: '#139' },
        { id: '5', label: 'build:hotfix',    sub: 'queued',             status: 'pending', meta: '#143' },
      ],
      actions: [
        { label: 'Trigger Pipeline', icon: <PlayCircleIcon sx={{ fontSize: '.85rem' }} />, onClick: () => navigate('/developer/Dashboard/cicd') },
        { label: 'View Logs',        icon: <TerminalIcon   sx={{ fontSize: '.85rem' }} />, onClick: () => {} },
      ],
    };
  }

  if (pathname.includes('/kubernetes')) {
    return {
      title: 'Cluster Activity',
      icon:  <HubIcon sx={{ fontSize: '1rem', color: t.brandPrimary }} />,
      metrics: [
        { label: 'Nodes',     value: 3,    color: dashboardSemanticColors.success },
        { label: 'Pods',      value: 18,   color: t.textPrimary },
        { label: 'Services',  value: 7,    color: t.textPrimary },
        { label: 'CPU',       value: '61%', color: dashboardSemanticColors.warning },
      ],
      items: [
        { id: '1', label: 'node-1 (master)', sub: 'cpu 45% · ready',    status: 'success' },
        { id: '2', label: 'node-2',          sub: 'cpu 78% · ready',    status: 'warning' },
        { id: '3', label: 'node-3',          sub: 'cpu 34% · ready',    status: 'success' },
        { id: '4', label: 'pod: api-7f9d',   sub: 'Running · 2/2',      status: 'running' },
        { id: '5', label: 'pod: worker-4b2', sub: 'CrashLoopBackOff',   status: 'failed'  },
      ],
      actions: [
        { label: 'Scale Cluster', icon: <LayersIcon     sx={{ fontSize: '.85rem' }} />, onClick: () => {} },
        { label: 'View Metrics',  icon: <MemoryIcon     sx={{ fontSize: '.85rem' }} />, onClick: () => {} },
        { label: 'Inspect Logs',  icon: <TerminalIcon   sx={{ fontSize: '.85rem' }} />, onClick: () => {} },
      ],
    };
  }

  if (pathname.includes('/sdks') || pathname.includes('/tools')) {
    return {
      title: 'SDK & Tool Activity',
      icon:  <TerminalIcon sx={{ fontSize: '1rem', color: t.brandPrimary }} />,
      metrics: [
        { label: 'Active Tools', value: 6,  color: t.textPrimary },
        { label: 'Downloads',    value: 12, color: dashboardSemanticColors.success },
        { label: 'Updates',      value: 2,  color: dashboardSemanticColors.warning },
      ],
      items: [
        { id: '1', label: 'atonix-cli v2.4.1',  sub: 'Up to date',       status: 'success' },
        { id: '2', label: 'go-sdk v1.3.0',       sub: 'Update available', status: 'warning', meta: 'v1.4.0' },
        { id: '3', label: 'python-sdk v3.0.1',   sub: 'Up to date',       status: 'success' },
        { id: '4', label: 'terraform-provider',  sub: 'Installing…',      status: 'running' },
        { id: '5', label: 'kubectl-plugin',      sub: 'Up to date',       status: 'success' },
      ],
      actions: [
        { label: 'Update All SDKs', icon: <RefreshIcon   sx={{ fontSize: '.85rem' }} />, onClick: () => {} },
        { label: 'Install Tool',    icon: <StorageIcon   sx={{ fontSize: '.85rem' }} />, onClick: () => {} },
      ],
    };
  }

  if (pathname.includes('/iac') || pathname.includes('/infra')) {
    return {
      title: 'IaC Activity',
      icon:  <StorageIcon sx={{ fontSize: '1rem', color: t.brandPrimary }} />,
      metrics: [
        { label: 'Stacks',    value: 5,    color: t.textPrimary },
        { label: 'Drifted',   value: 1,    color: dashboardSemanticColors.warning },
        { label: 'Planned',   value: 2,    color: '#6366F1' },
      ],
      items: [
        { id: '1', label: 'prod-vpc',        sub: 'Applied 2h ago',      status: 'success' },
        { id: '2', label: 'staging-cluster', sub: 'Plan in progress',    status: 'running' },
        { id: '3', label: 'dev-network',     sub: 'Drift detected',      status: 'warning' },
        { id: '4', label: 'db-module',       sub: 'Applied 1d ago',      status: 'success' },
      ],
      actions: [
        { label: 'Run Plan',   icon: <PlayCircleIcon sx={{ fontSize: '.85rem' }} />, onClick: () => {} },
        { label: 'View Drift', icon: <WarningAmberIcon sx={{ fontSize: '.85rem' }} />, onClick: () => {} },
      ],
    };
  }

  if (pathname.includes('/projects')) {
    return {
      title: 'Project Activity',
      icon:  <FolderOpenIcon sx={{ fontSize: '1rem', color: t.brandPrimary }} />,
      metrics: [
        { label: 'Projects', value: live.projects  ?? '—', color: dashboardSemanticColors.success, loading: live.loading },
        { label: 'Repos',    value: live.repos      ?? '—', color: t.textPrimary,                   loading: live.loading },
        { label: 'Pipelines',value: live.pipelines  ?? '—', color: STATUS_COLOR.running,             loading: live.loading },
      ],
      items: [
        { id: '1', label: 'atonixcorp',   sub: 'Last activity 43m ago', status: 'success' },
        { id: '2', label: 'platform-v2',  sub: 'Last activity 2h ago',  status: 'running' },
        { id: '3', label: 'infra-tools',  sub: 'Last activity 1d ago',  status: 'idle'    },
      ],
      actions: [
        { label: 'New Project',   icon: <FolderOpenIcon   sx={{ fontSize: '.85rem' }} />, onClick: () => navigate('/developer/Dashboard/projects/create') },
        { label: 'Import Repo',   icon: <AccountTreeIcon  sx={{ fontSize: '.85rem' }} />, onClick: () => navigate('/developer/Dashboard/projects/import') },
      ],
    };
  }

  // Default / landing
  return {
    title: 'Recent Activity',
    icon:  <CircleIcon sx={{ fontSize: '1rem', color: t.brandPrimary }} />,
    metrics: [
      { label: 'Projects',   value: live.projects   ?? '—', color: t.textPrimary,                   loading: live.loading },
      { label: 'Repos',      value: live.repos       ?? '—', color: t.textPrimary,                   loading: live.loading },
      { label: 'Pipelines',  value: live.pipelines   ?? '—', color: STATUS_COLOR.running,             loading: live.loading },
      { label: 'Containers', value: live.containers  ?? '—', color: dashboardSemanticColors.success,  loading: live.loading },
    ],
    items: [
      { id: '1', label: 'Pipeline #142 running',    sub: '3m ago',  status: 'running' },
      { id: '2', label: 'Commit pushed to main',    sub: '43m ago', status: 'success' },
      { id: '3', label: 'Container restarted',      sub: '1h ago',  status: 'warning' },
      { id: '4', label: 'Deploy to staging done',   sub: '2h ago',  status: 'success' },
      { id: '5', label: 'Node-2 cpu spike',         sub: '3h ago',  status: 'warning' },
    ],
    actions: [
      { label: 'Go to Pipelines',  icon: <PlayCircleIcon  sx={{ fontSize: '.85rem' }} />, onClick: () => navigate('/developer/Dashboard/cicd') },
      { label: 'Go to Repos',      icon: <AccountTreeIcon sx={{ fontSize: '.85rem' }} />, onClick: () => navigate('/developer/Dashboard/repositories') },
    ],
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

interface RightActivityPanelProps {
  collapsed:   boolean;
  onToggle:    () => void;
}

const RightActivityPanel: React.FC<RightActivityPanelProps> = ({ collapsed, onToggle }) => {
  const { pathname } = useLocation();

  // ── Live counts fetched from backend ───────────────────────────────────────
  const [live, setLive] = useState<LiveCounts>({
    projects: null, repos: null, pipelines: null, containers: null, loading: true,
  });

  const fetchCounts = useCallback(async () => {
    setLive(prev => ({ ...prev, loading: true }));
    try {
      const [projectsRes, reposRes, pipelinesRes, containersRes] = await Promise.allSettled([
        listProjects(),
        listAllRepos(),
        apiClient.get<any[]>('/api/services/pipelines/definitions/'),
        apiClient.get<any[]>('/api/services/containers/'),
      ]);

      setLive({
        projects:   projectsRes.status   === 'fulfilled' ? projectsRes.value.length       : null,
        repos:      reposRes.status      === 'fulfilled' ? reposRes.value.length          : null,
        pipelines:  pipelinesRes.status  === 'fulfilled' ? (pipelinesRes.value.data ?? []).length : null,
        containers: containersRes.status === 'fulfilled' ? (containersRes.value.data ?? []).length : null,
        loading: false,
      });
    } catch {
      setLive(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => { fetchCounts(); }, [fetchCounts]);

  const panel = usePanelDef(pathname, live);

  if (collapsed) return null;

  return (
    <Box
      sx={{
        width: RIGHT_PANEL_WIDTH,
        flexShrink: 0,
        borderLeft: `1px solid ${t.border}`,
        bgcolor: t.surface,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        transition: 'width .2s ease',
        position: 'relative',
      }}
    >
      {/* Header */}
      <Box sx={{ px: 1.5, pt: 1.5, pb: 1, borderBottom: `1px solid ${t.border}`, flexShrink: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={0.75}>
            {panel.icon}
            <Typography sx={{ fontSize: '.78rem', fontWeight: 700, color: t.textPrimary, fontFamily: FONT, letterSpacing: '-.01em' }}>
              {panel.title}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.25}>
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={fetchCounts} disabled={live.loading} sx={{ color: t.textTertiary, '&:hover': { color: t.brandPrimary }, p: 0.4 }}>
                <RefreshIcon sx={{ fontSize: '.85rem', ...(live.loading ? { animation: 'spin 1s linear infinite', '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } } } : {}) }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Collapse panel">
              <IconButton size="small" onClick={onToggle} sx={{ color: t.textTertiary, '&:hover': { color: t.brandPrimary }, p: 0.4 }}>
                <ChevronRightIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>

      {/* Scrollable body */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', px: 1.5, py: 1, display: 'flex', flexDirection: 'column', gap: 1.5,
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': { bgcolor: t.border, borderRadius: 2 },
      }}>

        {/* Metrics grid */}
        {panel.metrics && (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75 }}>
            {panel.metrics.map(m => (
              <Box key={m.label} sx={{ bgcolor: t.surfaceSubtle, border: `1px solid ${t.border}`, borderRadius: '8px', px: 1.1, py: 0.9 }}>
                <Typography sx={{ fontSize: '.62rem', fontWeight: 700, color: t.textTertiary, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: FONT }}>
                  {m.label}
                </Typography>
                {m.loading ? (
                  <Skeleton variant="text" width={32} height={22} sx={{ bgcolor: `${t.border}` }} />
                ) : (
                  <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: m.color ?? t.textPrimary, lineHeight: 1.2, fontFamily: FONT }}>
                    {m.value}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )}

        <Divider sx={{ borderColor: t.border }} />

        {/* Process list */}
        <Box>
          <Typography sx={{ fontSize: '.65rem', fontWeight: 700, color: t.textTertiary, textTransform: 'uppercase', letterSpacing: '.07em', fontFamily: FONT, mb: 0.75 }}>
            Active Processes
          </Typography>
          <Stack spacing={0.4}>
            {panel.items.map(item => (
              <Box
                key={item.id}
                sx={{
                  display: 'flex', alignItems: 'flex-start', gap: 0.9,
                  px: 1, py: 0.75,
                  borderRadius: '7px',
                  bgcolor: 'transparent',
                  border: `1px solid transparent`,
                  transition: 'all .12s',
                  cursor: 'default',
                  '&:hover': { bgcolor: t.surfaceSubtle, border: `1px solid ${t.border}` },
                }}
              >
                <Box sx={{ pt: 0.2, flexShrink: 0 }}>
                  <StatusIcon status={item.status} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={0.5}>
                    <Typography sx={{ fontSize: '.75rem', fontWeight: 600, color: t.textPrimary, fontFamily: MONO, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.label}
                    </Typography>
                    {item.meta && (
                      <Typography sx={{ fontSize: '.6rem', color: t.textTertiary, fontFamily: FONT, whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {item.meta}
                      </Typography>
                    )}
                  </Stack>
                  {item.sub && (
                    <Typography sx={{ fontSize: '.68rem', color: t.textTertiary, fontFamily: FONT, mt: 0.1 }}>
                      {item.sub}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>

        <Divider sx={{ borderColor: t.border }} />

        {/* Quick actions */}
        <Box>
          <Typography sx={{ fontSize: '.65rem', fontWeight: 700, color: t.textTertiary, textTransform: 'uppercase', letterSpacing: '.07em', fontFamily: FONT, mb: 0.75 }}>
            Quick Actions
          </Typography>
          <Stack spacing={0.5}>
            {panel.actions.map((a, i) => (
              <Box
                key={i}
                onClick={a.onClick}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1,
                  px: 1.1, py: 0.7,
                  borderRadius: '7px',
                  border: `1px solid ${t.border}`,
                  bgcolor: t.surfaceSubtle,
                  cursor: 'pointer',
                  transition: 'all .12s',
                  '&:hover': { bgcolor: `${t.brandPrimary}0e`, borderColor: `${t.brandPrimary}50`, color: t.brandPrimary },
                }}
              >
                <Box sx={{ color: t.textSecondary, display: 'flex', alignItems: 'center', '.parent:hover &': { color: t.brandPrimary } }}>
                  {a.icon}
                </Box>
                <Typography sx={{ fontSize: '.75rem', fontWeight: 600, color: t.textSecondary, fontFamily: FONT }}>
                  {a.label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Live indicator */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.6, py: 0.5 }}>
          <Box sx={{
            width: 6, height: 6, borderRadius: '50%',
            bgcolor: dashboardSemanticColors.success,
            boxShadow: `0 0 0 2px ${dashboardSemanticColors.success}40`,
            animation: 'livePulse 2s ease-in-out infinite',
            '@keyframes livePulse': {
              '0%, 100%': { opacity: 1, transform: 'scale(1)' },
              '50%':       { opacity: .5, transform: 'scale(.8)' },
            },
          }} />
          <Typography sx={{ fontSize: '.63rem', color: t.textTertiary, fontFamily: FONT }}>Live · auto-refreshes</Typography>
        </Box>

      </Box>
    </Box>
  );
};

export default RightActivityPanel;

// ── Expand toggle tab (shown when panel is collapsed) ─────────────────────────

export const RightPanelExpandTab: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <Tooltip title="Open activity panel" placement="left">
    <Box
      onClick={onClick}
      sx={{
        position: 'fixed', right: 0, top: '50%', transform: 'translateY(-50%)',
        width: 22, height: 56,
        bgcolor: t.surface,
        border: `1px solid ${t.border}`,
        borderRight: 'none',
        borderRadius: '6px 0 0 6px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', zIndex: 1100,
        transition: 'all .14s',
        '&:hover': { bgcolor: t.surfaceSubtle, borderColor: `${t.brandPrimary}60` },
      }}
    >
      <ChevronLeftIcon sx={{ fontSize: '.9rem', color: t.textTertiary }} />
    </Box>
  </Tooltip>
);
