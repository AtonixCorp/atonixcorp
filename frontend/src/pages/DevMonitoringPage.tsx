/**
 * DevMonitoringPage — Enterprise Monitoring Hub
 * ──────────────────────────────────────────────
 * 7-tab unified observability dashboard for the developer platform.
 * Tabs: Overview | Pipelines | Deployments | Projects | Services | Activity | Alerts
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Stack, Typography, Chip, Card, CardContent, CardHeader,
  Tabs, Tab, CircularProgress, LinearProgress, Tooltip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, IconButton, Select, MenuItem, FormControl, InputLabel,
  Alert, Divider,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import CloudIcon from '@mui/icons-material/Cloud';
import HistoryIcon from '@mui/icons-material/History';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

import {
  monitoringApi,
  DevOverview, PipelineHealth, DeploymentHealth,
  ProjectHealth, ActivityEvent, ServiceHealth,
  MonitoringAlert, Incident, AlertRule,
} from '../services/monitoringApi';

// ─── Helpers ─────────────────────────────────────────────────────────────────

type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d';
const HOURS_MAP: Record<TimeRange, number> = { '1h': 1, '6h': 6, '24h': 24, '7d': 168, '30d': 720 };

function statusColor(status: string): 'success' | 'warning' | 'error' | 'default' {
  if (['operational', 'success', 'healthy', 'resolved'].includes(status)) return 'success';
  if (['degraded', 'partial_outage', 'investigating', 'identified', 'monitoring'].includes(status)) return 'warning';
  if (['major_outage', 'failed', 'critical', 'open'].includes(status)) return 'error';
  return 'default';
}

function severityColor(sev: string): 'error' | 'warning' | 'info' | 'default' {
  if (['critical', 'sev1', 'sev2'].includes(sev)) return 'error';
  if (['warning', 'sev3'].includes(sev)) return 'warning';
  if (['info', 'sev4'].includes(sev)) return 'info';
  return 'default';
}

function StatusIcon({ status }: { status: string }) {
  const c = statusColor(status);
  if (c === 'success') return <CheckCircleIcon fontSize="small" color="success" />;
  if (c === 'warning') return <WarningIcon fontSize="small" color="warning" />;
  if (c === 'error') return <ErrorIcon fontSize="small" color="error" />;
  return <RadioButtonCheckedIcon fontSize="small" color="disabled" />;
}

function timeAgo(ts: string | null | undefined) {
  if (!ts) return '—';
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 2) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function unwrap<T>(data: any): T[] {
  return Array.isArray(data) ? data : (data?.results ?? []);
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  title, value, sub, color, icon,
}: {
  title: string;
  value: string | number;
  sub?: string;
  color?: 'success' | 'warning' | 'error' | 'info';
  icon?: React.ReactNode;
}) {
  const colorMap = {
    success: '#2e7d32',
    warning: '#ed6c02',
    error: '#d32f2f',
    info: '#0288d1',
  };
  const bg = color ? `${colorMap[color]}18` : 'transparent';
  const borderColor = color ? colorMap[color] : '#333';
  return (
    <Card sx={{ flex: 1, minWidth: 160, border: `1px solid ${borderColor}`, background: bg }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
          {icon}
          <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.8}>
            {title}
          </Typography>
        </Stack>
        <Typography variant="h4" fontWeight={700} color={color ? colorMap[color] : 'text.primary'}>
          {value}
        </Typography>
        {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
      </CardContent>
    </Card>
  );
}

// ─── Pipeline Row ─────────────────────────────────────────────────────────────

function PipelineHealthRow({ item }: { item: PipelineHealth }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TableRow hover sx={{ cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
        <TableCell><Typography fontWeight={600}>{item.project_name || item.project_id}</Typography></TableCell>
        <TableCell align="center">{item.total_runs}</TableCell>
        <TableCell align="center"><Chip label={item.success} color="success" size="small" /></TableCell>
        <TableCell align="center"><Chip label={item.failed} color={item.failed > 0 ? 'error' : 'default'} size="small" /></TableCell>
        <TableCell align="center">
          {item.running > 0
            ? <Chip label={`${item.running} running`} color="info" size="small" />
            : <Typography variant="body2" color="text.secondary">—</Typography>}
        </TableCell>
        <TableCell align="right">
          <Stack direction="row" alignItems="center" spacing={1} justifyContent="flex-end">
            <LinearProgress
              variant="determinate"
              value={item.success_rate}
              color={item.success_rate >= 80 ? 'success' : item.success_rate >= 50 ? 'warning' : 'error'}
              sx={{ width: 80, height: 6, borderRadius: 3 }}
            />
            <Typography variant="body2" fontWeight={600}>{item.success_rate.toFixed(1)}%</Typography>
          </Stack>
        </TableCell>
      </TableRow>
      {open && item.recent_runs.length > 0 && (
        <TableRow>
          <TableCell colSpan={6} sx={{ p: 0 }}>
            <Box sx={{ bgcolor: '#1a1a2e', p: 2 }}>
              <Typography variant="caption" color="text.secondary" mb={1} display="block">Recent runs</Typography>
              {item.recent_runs.map(r => (
                <Stack key={r.id} direction="row" spacing={2} alignItems="center" py={0.5}>
                  <StatusIcon status={r.status} />
                  <Typography variant="body2" sx={{ minWidth: 180 }}>{r.pipeline_name}</Typography>
                  <Chip label={r.branch} size="small" variant="outlined" />
                  <Chip label={r.status} color={statusColor(r.status)} size="small" />
                  <Typography variant="caption" color="text.secondary">by {r.triggered_by}</Typography>
                  <Typography variant="caption" color="text.secondary">{timeAgo(r.started_at)}</Typography>
                </Stack>
              ))}
            </Box>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

// ─── Deployment Row ───────────────────────────────────────────────────────────

function DeploymentHealthRow({ item }: { item: DeploymentHealth }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TableRow hover sx={{ cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
        <TableCell>
          <Typography fontWeight={600}>{item.container_name}</Typography>
          <Typography variant="caption" color="text.secondary">{item.image}</Typography>
        </TableCell>
        <TableCell align="center">{item.total_deploys}</TableCell>
        <TableCell align="center"><Chip label={item.success} color="success" size="small" /></TableCell>
        <TableCell align="center"><Chip label={item.failed} color={item.failed > 0 ? 'error' : 'default'} size="small" /></TableCell>
        <TableCell align="right">
          <Stack direction="row" alignItems="center" spacing={1} justifyContent="flex-end">
            <LinearProgress
              variant="determinate"
              value={item.success_rate}
              color={item.success_rate >= 80 ? 'success' : item.success_rate >= 50 ? 'warning' : 'error'}
              sx={{ width: 80, height: 6, borderRadius: 3 }}
            />
            <Typography variant="body2" fontWeight={600}>{item.success_rate.toFixed(1)}%</Typography>
          </Stack>
        </TableCell>
      </TableRow>
      {open && item.recent_deploys.length > 0 && (
        <TableRow>
          <TableCell colSpan={5} sx={{ p: 0 }}>
            <Box sx={{ bgcolor: '#1a1a2e', p: 2 }}>
              <Typography variant="caption" color="text.secondary" mb={1} display="block">Recent deployments</Typography>
              {item.recent_deploys.map(d => (
                <Stack key={d.id} direction="row" spacing={2} alignItems="center" py={0.5}>
                  <StatusIcon status={d.status} />
                  <Chip label={d.image_tag} size="small" variant="outlined" />
                  <Chip label={d.status} color={statusColor(d.status)} size="small" />
                  <Typography variant="caption" color="text.secondary">via {d.trigger}</Typography>
                  <Typography variant="caption" color="text.secondary">{timeAgo(d.started_at)}</Typography>
                </Stack>
              ))}
            </Box>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

// ─── Activity Event Row ───────────────────────────────────────────────────────

function ActivityRow({ ev }: { ev: ActivityEvent }) {
  const icon = ev.severity === 'critical'
    ? <ErrorIcon fontSize="small" color="error" />
    : ev.severity === 'warning'
    ? <WarningIcon fontSize="small" color="warning" />
    : <InfoIcon fontSize="small" color="info" />;

  return (
    <Stack
      direction="row" spacing={2} alignItems="flex-start" py={1.5}
      sx={{ borderBottom: '1px solid #222', '&:last-child': { borderBottom: 0 } }}
    >
      <Box sx={{ pt: 0.3 }}>{icon}</Box>
      <Box flex={1}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Chip
            label={ev.event_type.replace(/_/g, ' ')}
            size="small"
            color={severityColor(ev.severity)}
            variant="outlined"
          />
          {ev.project_name && <Chip label={ev.project_name} size="small" variant="outlined" />}
          {ev.resource_name && (
            <Typography variant="body2" color="text.secondary">
              {ev.resource_type}: <strong>{ev.resource_name}</strong>
            </Typography>
          )}
          {ev.environment && <Chip label={ev.environment} size="small" />}
        </Stack>
        <Typography variant="body2" mt={0.5}>{ev.description}</Typography>
        <Stack direction="row" spacing={2} mt={0.25}>
          {ev.actor && <Typography variant="caption" color="text.secondary">by {ev.actor}</Typography>}
          <Typography variant="caption" color="text.secondary">{timeAgo(ev.created_at)}</Typography>
        </Stack>
      </Box>
    </Stack>
  );
}

// ─── Tab config ───────────────────────────────────────────────────────────────

const TAB_LABELS = [
  { label: 'Overview',    icon: <CheckCircleIcon fontSize="small" /> },
  { label: 'Pipelines',   icon: <AccountTreeIcon fontSize="small" /> },
  { label: 'Deployments', icon: <RocketLaunchIcon fontSize="small" /> },
  { label: 'Projects',    icon: <FolderSpecialIcon fontSize="small" /> },
  { label: 'Services',    icon: <CloudIcon fontSize="small" /> },
  { label: 'Activity',    icon: <HistoryIcon fontSize="small" /> },
  { label: 'Alerts',      icon: <NotificationsActiveIcon fontSize="small" /> },
];

// ─── Main Component ───────────────────────────────────────────────────────────

const DevMonitoringPage: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const [overview, setOverview] = useState<DevOverview | null>(null);
  const [pipelines, setPipelines] = useState<PipelineHealth[]>([]);
  const [deployments, setDeployments] = useState<DeploymentHealth[]>([]);
  const [projects, setProjects] = useState<ProjectHealth[]>([]);
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [alerts, setAlerts] = useState<MonitoringAlert[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [alertFilter, setAlertFilter] = useState<'all' | 'active' | 'resolved'>('active');
  const [incidentFilter, setIncidentFilter] = useState<'all' | 'open' | 'resolved'>('open');
  const [actFilter, setActFilter] = useState<string>('all');

  const hours = HOURS_MAP[timeRange];
  const abortRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    try {
      const [
        ovRes, plRes, depRes, prjRes, svcRes, actRes,
        alRes, incRes, arRes,
      ] = await Promise.allSettled([
        monitoringApi.getDevOverview(),
        monitoringApi.getPipelineHealth({ hours }),
        monitoringApi.getDeploymentHealth({ hours }),
        monitoringApi.getProjectHealth(),
        monitoringApi.getServiceHealth(),
        monitoringApi.getActivity({ hours, limit: 100 }),
        monitoringApi.getAlerts(),
        monitoringApi.getIncidents(),
        monitoringApi.getAlertRules(),
      ]);

      if (ovRes.status === 'fulfilled') setOverview(ovRes.value.data as DevOverview);
      if (plRes.status === 'fulfilled') setPipelines(unwrap<PipelineHealth>(plRes.value.data));
      if (depRes.status === 'fulfilled') setDeployments(unwrap<DeploymentHealth>(depRes.value.data));
      if (prjRes.status === 'fulfilled') setProjects(unwrap<ProjectHealth>(prjRes.value.data));
      if (svcRes.status === 'fulfilled') setServices(unwrap<ServiceHealth>(svcRes.value.data));
      if (actRes.status === 'fulfilled') setActivity(unwrap<ActivityEvent>(actRes.value.data));
      if (alRes.status === 'fulfilled') setAlerts(unwrap<MonitoringAlert>(alRes.value.data));
      if (incRes.status === 'fulfilled') setIncidents(unwrap<Incident>(incRes.value.data));
      if (arRes.status === 'fulfilled') setAlertRules(unwrap<AlertRule>(arRes.value.data));

      setLastRefresh(new Date());
    } finally {
      setLoading(false);
    }
  }, [hours]);

  useEffect(() => { refresh(); }, [refresh]);

  const filteredAlerts = alerts.filter(a => {
    if (alertFilter === 'active') return a.status !== 'resolved';
    if (alertFilter === 'resolved') return a.status === 'resolved';
    return true;
  });
  const filteredIncidents = incidents.filter(i => {
    if (incidentFilter === 'open') return !['resolved', 'postmortem'].includes(i.status);
    if (incidentFilter === 'resolved') return ['resolved', 'postmortem'].includes(i.status);
    return true;
  });
  const filteredActivity = actFilter === 'all'
    ? activity
    : activity.filter(a => a.event_type.includes(actFilter) || a.severity === actFilter);

  const openIncidents = incidents.filter(i => !['resolved', 'postmortem'].includes(i.status)).length;
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved').length;

  // ── Tab: Overview ──────────────────────────────────────────────────────────
  const renderOverview = () => (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        <StatCard
          title="Pipeline Success"
          value={overview ? `${overview.pipelines.success_rate}%` : '—'}
          sub={`${overview?.pipelines.runs_24h ?? 0} runs in ${timeRange}`}
          color={
            overview && overview.pipelines.success_rate >= 80 ? 'success'
            : overview && overview.pipelines.success_rate >= 60 ? 'warning'
            : 'error'
          }
          icon={<AccountTreeIcon fontSize="small" />}
        />
        <StatCard
          title="Deploy Success"
          value={overview ? `${overview.deployments.success_rate}%` : '—'}
          sub={`${overview?.deployments.total_24h ?? 0} deploys in ${timeRange}`}
          color={overview && overview.deployments.success_rate >= 80 ? 'success' : 'warning'}
          icon={<RocketLaunchIcon fontSize="small" />}
        />
        <StatCard
          title="Active Alerts"
          value={overview?.alerts.active ?? '—'}
          sub={`${overview?.alerts.critical ?? 0} critical`}
          color={(overview?.alerts.critical ?? 0) > 0 ? 'error' : (overview?.alerts.active ?? 0) > 0 ? 'warning' : 'success'}
          icon={<NotificationsActiveIcon fontSize="small" />}
        />
        <StatCard
          title="Open Incidents"
          value={overview?.incidents.open ?? '—'}
          sub={`${overview?.incidents.total_rules ?? 0} alert rules`}
          color={(overview?.incidents.open ?? 0) > 0 ? 'error' : 'success'}
        />
        <StatCard
          title="Services Healthy"
          value={overview ? `${overview.services.healthy}/${overview.services.total}` : '—'}
          sub={`${overview?.services.degraded ?? 0} degraded, ${overview?.services.down ?? 0} down`}
          color={
            (overview?.services.down ?? 0) > 0 ? 'error'
            : (overview?.services.degraded ?? 0) > 0 ? 'warning'
            : 'success'
          }
          icon={<CloudIcon fontSize="small" />}
        />
      </Stack>

      <Card>
        <CardHeader
          title="Service Health"
          titleTypographyProps={{ variant: 'h6', fontWeight: 700 }}
          subheader="Real-time status of platform services"
        />
        <CardContent sx={{ pt: 0 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {services.length === 0 && (
              <Typography color="text.secondary" variant="body2">No service health data available.</Typography>
            )}
            {services.map(svc => (
              <Box key={svc.resource_id} sx={{ flex: '1 1 280px', maxWidth: 380 }}>
                <Card
                  variant="outlined"
                  sx={{
                    borderColor: statusColor(svc.status) === 'success' ? '#2e7d32'
                      : statusColor(svc.status) === 'warning' ? '#ed6c02'
                      : '#d32f2f',
                  }}
                >
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <StatusIcon status={svc.status} />
                        <Typography fontWeight={600} variant="body2">{svc.name}</Typography>
                      </Stack>
                      <Chip label={svc.status.replace('_', ' ')} color={statusColor(svc.status)} size="small" />
                    </Stack>
                    <Stack direction="row" spacing={3} mt={1}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Uptime</Typography>
                        <Typography variant="body2" fontWeight={600}>{svc.uptime_percent?.toFixed(2)}%</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Latency</Typography>
                        <Typography variant="body2" fontWeight={600}>{svc.latency_ms}ms</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Errors</Typography>
                        <Typography variant="body2" fontWeight={600}>{svc.error_rate?.toFixed(2)}%</Typography>
                      </Box>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
                      {svc.region} · {timeAgo(svc.last_checked)}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {activity.length > 0 && (
        <Card>
          <CardHeader
            title="Recent Activity"
            titleTypographyProps={{ variant: 'h6', fontWeight: 700 }}
            action={<Button size="small" onClick={() => setTab(5)}>View all</Button>}
          />
          <CardContent sx={{ pt: 0 }}>
            {activity.slice(0, 5).map((ev, i) => (
              <ActivityRow key={`${ev.id}-${i}`} ev={ev} />
            ))}
          </CardContent>
        </Card>
      )}
    </Stack>
  );

  // ── Tab: Pipelines ─────────────────────────────────────────────────────────
  const renderPipelines = () => (
    <Card>
      <CardHeader
        title="Pipeline Health"
        titleTypographyProps={{ variant: 'h6', fontWeight: 700 }}
        subheader={`Last ${timeRange} — click a row to see recent runs`}
      />
      <CardContent sx={{ p: 0 }}>
        {pipelines.length === 0 ? (
          <Box p={4} textAlign="center">
            <Typography color="text.secondary">No pipeline data for this time range.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Project</TableCell>
                  <TableCell align="center">Total</TableCell>
                  <TableCell align="center">Success</TableCell>
                  <TableCell align="center">Failed</TableCell>
                  <TableCell align="center">Running</TableCell>
                  <TableCell align="right">Success Rate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pipelines.map(pl => <PipelineHealthRow key={pl.project_id} item={pl} />)}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );

  // ── Tab: Deployments ───────────────────────────────────────────────────────
  const renderDeployments = () => (
    <Card>
      <CardHeader
        title="Deployment Health"
        titleTypographyProps={{ variant: 'h6', fontWeight: 700 }}
        subheader={`Last ${timeRange} — click a row for recent deployments`}
      />
      <CardContent sx={{ p: 0 }}>
        {deployments.length === 0 ? (
          <Box p={4} textAlign="center">
            <Typography color="text.secondary">No deployment data for this time range.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Container</TableCell>
                  <TableCell align="center">Total</TableCell>
                  <TableCell align="center">Success</TableCell>
                  <TableCell align="center">Failed</TableCell>
                  <TableCell align="right">Success Rate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deployments.map(dep => <DeploymentHealthRow key={dep.container_id} item={dep} />)}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );

  // ── Tab: Projects ──────────────────────────────────────────────────────────
  const renderProjects = () => (
    <Stack spacing={2}>
      {projects.length === 0 && (
        <Alert severity="info">No project health data. Create a project to get started.</Alert>
      )}
      {projects.map(p => (
        <Card key={p.project_id}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="h6" fontWeight={700}>{p.project_name}</Typography>
                  <Chip
                    label={p.health_status}
                    color={p.health_status === 'healthy' ? 'success' : p.health_status === 'degraded' ? 'warning' : 'error'}
                    size="small"
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary" mt={0.5}>ID: {p.project_id}</Typography>
              </Box>
              <Box textAlign="right">
                <Typography
                  variant="h4" fontWeight={800}
                  color={p.health_score >= 90 ? '#2e7d32' : p.health_score >= 70 ? '#ed6c02' : '#d32f2f'}
                >
                  {p.health_score}%
                </Typography>
                <Typography variant="caption" color="text.secondary">Health Score (7d)</Typography>
              </Box>
            </Stack>
            <Divider sx={{ my: 1.5 }} />
            <Stack direction="row" spacing={4} flexWrap="wrap">
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">Pipelines (7d)</Typography>
                <Typography variant="body2">
                  <span style={{ color: '#4caf50' }}>✓ {p.pipeline_success}</span>
                  {' / '}
                  <span style={{ color: '#f44336' }}>✗ {p.pipeline_failed}</span>
                  {' · '}{p.pipelines_7d} total
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">Deployments (7d)</Typography>
                <Typography variant="body2">
                  <span style={{ color: '#4caf50' }}>✓ {p.deploy_success}</span>
                  {' / '}
                  <span style={{ color: '#f44336' }}>✗ {p.deploy_failed}</span>
                  {' · '}{p.deploys_7d} total
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );

  // ── Tab: Services ──────────────────────────────────────────────────────────
  const renderServices = () => (
    <Stack spacing={2}>
      {services.length === 0 && (
        <Alert severity="info">No service health data available.</Alert>
      )}
      <TableContainer component={Card}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Service</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Uptime</TableCell>
              <TableCell align="right">Latency</TableCell>
              <TableCell align="right">Error Rate</TableCell>
              <TableCell>Region</TableCell>
              <TableCell>Last Checked</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.map(svc => (
              <TableRow key={svc.resource_id} hover>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <StatusIcon status={svc.status} />
                    <Typography fontWeight={600}>{svc.name}</Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip label={svc.status.replace('_', ' ')} color={statusColor(svc.status)} size="small" />
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2" fontWeight={700}
                    color={svc.uptime_percent >= 99.9 ? '#4caf50' : svc.uptime_percent >= 99 ? '#ff9800' : '#f44336'}
                  >
                    {svc.uptime_percent?.toFixed(3)}%
                  </Typography>
                </TableCell>
                <TableCell align="right"><Typography variant="body2">{svc.latency_ms} ms</Typography></TableCell>
                <TableCell align="right">
                  <Typography variant="body2" color={svc.error_rate > 1 ? '#f44336' : 'text.secondary'}>
                    {svc.error_rate?.toFixed(3)}%
                  </Typography>
                </TableCell>
                <TableCell><Chip label={svc.region} size="small" variant="outlined" /></TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">{timeAgo(svc.last_checked)}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );

  // ── Tab: Activity ──────────────────────────────────────────────────────────
  const renderActivity = () => (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Filter</InputLabel>
          <Select value={actFilter} label="Filter" onChange={e => setActFilter(e.target.value)}>
            <MenuItem value="all">All Events</MenuItem>
            <MenuItem value="pipeline">Pipelines</MenuItem>
            <MenuItem value="deployment">Deployments</MenuItem>
            <MenuItem value="alert">Alerts</MenuItem>
            <MenuItem value="incident">Incidents</MenuItem>
            <MenuItem value="critical">Critical Only</MenuItem>
            <MenuItem value="warning">Warnings+</MenuItem>
          </Select>
        </FormControl>
        <Typography variant="body2" color="text.secondary">{filteredActivity.length} events</Typography>
      </Stack>
      <Card>
        <CardContent>
          {filteredActivity.length === 0 && (
            <Typography color="text.secondary" textAlign="center" py={4}>No activity in this time range.</Typography>
          )}
          {filteredActivity.map((ev, i) => <ActivityRow key={`${ev.id}-${i}`} ev={ev} />)}
        </CardContent>
      </Card>
    </Stack>
  );

  // ── Tab: Alerts & Incidents ────────────────────────────────────────────────
  const renderAlerts = () => (
    <Stack spacing={3}>
      {/* Incidents */}
      <Card>
        <CardHeader
          title={
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6" fontWeight={700}>Incidents</Typography>
              {openIncidents > 0 && <Chip label={`${openIncidents} open`} color="error" size="small" />}
            </Stack>
          }
          action={
            <Stack direction="row" spacing={1}>
              {(['all', 'open', 'resolved'] as const).map(f => (
                <Button
                  key={f} size="small"
                  variant={incidentFilter === f ? 'contained' : 'outlined'}
                  onClick={() => setIncidentFilter(f)}
                >
                  {f}
                </Button>
              ))}
            </Stack>
          }
        />
        <CardContent sx={{ p: 0 }}>
          {filteredIncidents.length === 0 ? (
            <Box p={3} textAlign="center">
              <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
              <Typography color="text.secondary" mt={1}>
                {incidentFilter === 'open' ? 'No open incidents — all clear!' : 'No incidents found.'}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Service</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Detected</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredIncidents.map(inc => (
                    <TableRow key={inc.id} hover>
                      <TableCell>
                        <Typography variant="caption" fontFamily="monospace">{inc.resource_id}</Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={inc.summary || ''}>
                          <Typography variant="body2" fontWeight={600}>{inc.title}</Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell><Chip label={inc.service} size="small" variant="outlined" /></TableCell>
                      <TableCell><Chip label={inc.severity.toUpperCase()} color={severityColor(inc.severity)} size="small" /></TableCell>
                      <TableCell><Chip label={inc.status} color={statusColor(inc.status)} size="small" /></TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {inc.duration_minutes < 60
                            ? `${inc.duration_minutes}m`
                            : `${Math.floor(inc.duration_minutes / 60)}h ${inc.duration_minutes % 60}m`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">{timeAgo(inc.detected_at)}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card>
        <CardHeader
          title={
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6" fontWeight={700}>Alerts</Typography>
              {criticalAlerts > 0 && <Chip label={`${criticalAlerts} critical`} color="error" size="small" />}
            </Stack>
          }
          action={
            <Stack direction="row" spacing={1}>
              {(['all', 'active', 'resolved'] as const).map(f => (
                <Button
                  key={f} size="small"
                  variant={alertFilter === f ? 'contained' : 'outlined'}
                  onClick={() => setAlertFilter(f)}
                >
                  {f}
                </Button>
              ))}
            </Stack>
          }
        />
        <CardContent sx={{ p: 0 }}>
          {filteredAlerts.length === 0 ? (
            <Box p={3} textAlign="center">
              <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
              <Typography color="text.secondary" mt={1}>
                {alertFilter === 'active' ? 'No active alerts!' : 'No alerts found.'}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Rule</TableCell>
                    <TableCell>Resource</TableCell>
                    <TableCell>Metric</TableCell>
                    <TableCell align="right">Value / Threshold</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Fired</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAlerts.map(al => (
                    <TableRow key={al.id} hover>
                      <TableCell><Typography variant="body2" fontWeight={600}>{al.rule_name}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{al.resource_name}</Typography></TableCell>
                      <TableCell><Chip label={al.metric_type?.replace('_', ' ')} size="small" variant="outlined" /></TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={700}>{al.value?.toFixed(2)}</Typography>
                        <Typography variant="caption" color="text.secondary">/{al.threshold}</Typography>
                      </TableCell>
                      <TableCell><Chip label={al.severity} color={severityColor(al.severity)} size="small" /></TableCell>
                      <TableCell><Chip label={al.status} color={statusColor(al.status)} size="small" /></TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">{timeAgo(al.fired_at)}</Typography>
                      </TableCell>
                      <TableCell>
                        {al.status !== 'resolved' && (
                          <Tooltip title="Resolve">
                            <IconButton size="small" color="success"
                              onClick={() => monitoringApi.resolveAlert(al.id).then(refresh)}>
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Alert Rules */}
      <Card>
        <CardHeader
          title="Alert Rules"
          titleTypographyProps={{ variant: 'h6', fontWeight: 700 }}
          subheader={`${alertRules.length} rules configured`}
        />
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Resource</TableCell>
                  <TableCell>Condition</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Window</TableCell>
                  <TableCell>Enabled</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {alertRules.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography color="text.secondary" py={2} textAlign="center">No alert rules configured.</Typography>
                    </TableCell>
                  </TableRow>
                )}
                {alertRules.map(rule => (
                  <TableRow key={rule.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{rule.name}</Typography>
                      {rule.description && (
                        <Typography variant="caption" color="text.secondary">{rule.description}</Typography>
                      )}
                    </TableCell>
                    <TableCell><Typography variant="body2">{rule.resource_name}</Typography></TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace" fontSize="0.75rem">
                        {rule.metric_type} {rule.condition} {rule.threshold}
                      </Typography>
                    </TableCell>
                    <TableCell><Chip label={rule.severity} color={severityColor(rule.severity)} size="small" /></TableCell>
                    <TableCell><Typography variant="body2">{rule.window_minutes}m</Typography></TableCell>
                    <TableCell>
                      <Chip
                        label={rule.enabled ? 'enabled' : 'disabled'}
                        color={rule.enabled ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Stack>
  );

  const tabContent = [
    renderOverview,
    renderPipelines,
    renderDeployments,
    renderProjects,
    renderServices,
    renderActivity,
    renderAlerts,
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={800} letterSpacing={-0.5}>Monitoring Hub</Typography>
          <Typography variant="body2" color="text.secondary">
            Unified observability · Last updated {lastRefresh.toLocaleTimeString()}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} alignItems="center">
          {criticalAlerts > 0 && (
            <Chip
              icon={<ErrorIcon />}
              label={`${criticalAlerts} critical`}
              color="error"
              onClick={() => setTab(6)}
              sx={{ cursor: 'pointer' }}
            />
          )}
          {openIncidents > 0 && (
            <Chip
              icon={<WarningIcon />}
              label={`${openIncidents} incidents`}
              color="warning"
              onClick={() => setTab(6)}
              sx={{ cursor: 'pointer' }}
            />
          )}
          <FormControl size="small" sx={{ minWidth: 90 }}>
            <Select value={timeRange} onChange={e => setTimeRange(e.target.value as TimeRange)}>
              {(['1h', '6h', '24h', '7d', '30d'] as TimeRange[]).map(t => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Tooltip title="Refresh">
            <IconButton onClick={refresh} disabled={loading}>
              {loading ? <CircularProgress size={18} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
          {TAB_LABELS.map((t, i) => (
            <Tab
              key={t.label}
              label={
                <Stack direction="row" spacing={0.75} alignItems="center">
                  {t.icon}
                  <span>{t.label}</span>
                  {i === 6 && criticalAlerts > 0 && (
                    <Box
                      sx={{
                        bgcolor: 'error.main', color: '#fff',
                        borderRadius: '50%', width: 18, height: 18,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.65rem', fontWeight: 700,
                      }}
                    >
                      {criticalAlerts}
                    </Box>
                  )}
                </Stack>
              }
              sx={{ minHeight: 48, textTransform: 'none' }}
            />
          ))}
        </Tabs>
      </Box>

      {tabContent[tab]()}
    </Box>
  );
};

export default DevMonitoringPage;
