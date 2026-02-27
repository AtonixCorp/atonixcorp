// AtonixCorp Cloud – Enterprise Overview Dashboard
// Mission-critical snapshot of the entire cloud environment.

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Box, Typography, Stack, Chip, Grid, Divider,
  CircularProgress, Alert, IconButton, Tooltip,
  LinearProgress, Table, TableHead, TableRow,
  TableCell, TableBody, Badge,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RefreshIcon          from '@mui/icons-material/Refresh';
import CheckCircleIcon      from '@mui/icons-material/CheckCircle';
import WarningAmberIcon     from '@mui/icons-material/WarningAmber';
import ErrorIcon            from '@mui/icons-material/Error';
import TrendingUpIcon       from '@mui/icons-material/TrendingUp';
import TrendingDownIcon     from '@mui/icons-material/TrendingDown';
import ComputerIcon         from '@mui/icons-material/Computer';
import StorageIcon          from '@mui/icons-material/Storage';
import RouterIcon           from '@mui/icons-material/Router';
import ViewInArIcon         from '@mui/icons-material/ViewInAr';
import FunctionsIcon        from '@mui/icons-material/Functions';
import MemoryIcon           from '@mui/icons-material/Memory';
import SpeedIcon            from '@mui/icons-material/Speed';
import CloudCircleIcon      from '@mui/icons-material/CloudCircle';
import MonitorHeartIcon     from '@mui/icons-material/MonitorHeart';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import PeopleIcon           from '@mui/icons-material/People';
import AttachMoneyIcon      from '@mui/icons-material/AttachMoney';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import OpenInNewIcon        from '@mui/icons-material/OpenInNew';
import { useNavigate }      from 'react-router-dom';
import { useAuth }          from '../contexts/AuthContext';
import {
  dashboardTokens,
  dashboardSemanticColors,
} from '../styles/dashboardDesignSystem';
import { dashboardApi, monitoringApi, billingApi } from '../services/cloudApi';

// ── Design tokens ─────────────────────────────────────────────────────────────
const BG       = dashboardTokens.colors.background;
const SURFACE  = dashboardTokens.colors.surface;
const SURFACE2 = dashboardTokens.colors.surfaceSubtle;
const BORDER   = dashboardTokens.colors.border;
const TEXT     = dashboardTokens.colors.textPrimary;
const MUTED    = dashboardTokens.colors.textSecondary;
const BRAND    = dashboardTokens.colors.brandPrimary;
const SUCCESS  = dashboardSemanticColors.success;
const WARNING  = dashboardSemanticColors.warning;
const DANGER   = dashboardSemanticColors.danger;
const PURPLE   = dashboardSemanticColors.purple;
const FONT     = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

// ── Helpers ───────────────────────────────────────────────────────────────────
function statusColor(s: string) {
  if (s === 'operational' || s === 'healthy' || s === 'running' || s === 'active') return SUCCESS;
  if (s === 'degraded' || s === 'warning' || s === 'partial_outage') return WARNING;
  return DANGER;
}

function StatusDot({ status }: { status: string }) {
  const color = statusColor(status);
  return (
    <FiberManualRecordIcon sx={{ fontSize: 10, color, flexShrink: 0 }} />
  );
}

function StatusBadge({ status }: { status: string }) {
  const color = statusColor(status);
  const label =
    status === 'operational' ? 'Operational' :
    status === 'degraded'    ? 'Degraded' :
    status === 'partial_outage' ? 'Partial Outage' :
    status === 'major_outage'   ? 'Major Outage' :
    status === 'maintenance'    ? 'Maintenance' :
    status;
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        bgcolor: `${color}1a`,
        color,
        border: `1px solid ${color}33`,
        fontWeight: 700,
        fontSize: '0.65rem',
        height: 20,
        fontFamily: FONT,
      }}
    />
  );
}

// ── Mini metric gauge ────────────────────────────────────────────────────────
function UsageBar({ value, max = 100, color }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  const barColor =
    color ||
    (pct >= 90 ? DANGER : pct >= 70 ? WARNING : SUCCESS);
  return (
    <Box sx={{ width: '100%' }}>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 4,
          borderRadius: 2,
          bgcolor: `${barColor}22`,
          '& .MuiLinearProgress-bar': { bgcolor: barColor, borderRadius: 2 },
        }}
      />
    </Box>
  );
}

// ── Mini SVG sparkline ────────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data.length) return null;
  const W = 100, H = 32;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * H}`)
    .join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: 80, height: 28, display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

// ── Section title ────────────────────────────────────────────────────────────
function SectionTitle({ icon, title, sub, action }: {
  icon: React.ReactNode;
  title: string;
  sub?: string;
  action?: React.ReactNode;
}) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Box sx={{ color: BRAND, display: 'flex' }}>{icon}</Box>
        <Box>
          <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.95rem', color: TEXT }}>
            {title}
          </Typography>
          {sub && (
            <Typography sx={{ fontFamily: FONT, fontSize: '0.75rem', color: MUTED }}>
              {sub}
            </Typography>
          )}
        </Box>
      </Stack>
      {action}
    </Stack>
  );
}

// ── KPI card ─────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, sub, icon, color, trend, onClick,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color?: string;
  trend?: { value: number; label: string };
  onClick?: () => void;
}) {
  const accent = color || BRAND;
  const isDark  = useTheme().palette.mode === 'dark';
  return (
    <Box
      onClick={onClick}
      sx={{
        bgcolor: SURFACE,
        border: `1px solid ${BORDER}`,
        borderRadius: 1,
        p: 2.5,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.15s',
        '&:hover': onClick ? { borderColor: accent } : {},
        minWidth: 0,
      }}
    >
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontFamily: FONT, fontSize: '0.72rem', color: MUTED, fontWeight: 500, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {label}
          </Typography>
          <Typography sx={{ fontFamily: FONT, fontSize: '1.6rem', fontWeight: 800, color: TEXT, lineHeight: 1.1 }}>
            {value}
          </Typography>
          {sub && (
            <Typography sx={{ fontFamily: FONT, fontSize: '0.72rem', color: MUTED, mt: 0.5 }}>
              {sub}
            </Typography>
          )}
          {trend && (
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.75 }}>
              {trend.value >= 0
                ? <TrendingUpIcon sx={{ fontSize: 14, color: SUCCESS }} />
                : <TrendingDownIcon sx={{ fontSize: 14, color: DANGER }} />}
              <Typography sx={{ fontFamily: FONT, fontSize: '0.72rem', color: trend.value >= 0 ? SUCCESS : DANGER, fontWeight: 600 }}>
                {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
              </Typography>
            </Stack>
          )}
        </Box>
        <Box
          sx={{
            bgcolor: `${accent}18`,
            borderRadius: 1,
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accent,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Box>
  );
}

// ── Region health card ────────────────────────────────────────────────────────
interface RegionHealth {
  region: string;
  status: string;
  workloads: number;
  incidents: number;
  capacity_pct: number;
  zones: number;
  zones_healthy: number;
}

function RegionCard({ r }: { r: RegionHealth }) {
  const color = statusColor(r.status);
  return (
    <Box
      sx={{
        bgcolor: SURFACE,
        border: `1px solid ${BORDER}`,
        borderRadius: 1,
        p: 2,
        borderLeft: `3px solid ${color}`,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <StatusDot status={r.status} />
          <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.85rem', color: TEXT }}>
            {r.region}
          </Typography>
        </Stack>
        <StatusBadge status={r.status} />
      </Stack>
      <Grid container spacing={1}>
        {[
          { label: 'Workloads', value: r.workloads },
          { label: 'Incidents', value: r.incidents, warn: r.incidents > 0 },
          { label: 'Zones', value: `${r.zones_healthy}/${r.zones}` },
        ].map(({ label, value, warn }: any) => (
          <Grid size={{ xs: 4 }} key={label}>
            <Typography sx={{ fontFamily: FONT, fontSize: '0.68rem', color: MUTED, mb: 0.2 }}>{label}</Typography>
            <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.9rem', color: warn ? DANGER : TEXT }}>
              {value}
            </Typography>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 1.5 }}>
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
          <Typography sx={{ fontFamily: FONT, fontSize: '0.68rem', color: MUTED }}>Capacity</Typography>
          <Typography sx={{ fontFamily: FONT, fontSize: '0.68rem', fontWeight: 600, color: TEXT }}>{r.capacity_pct}%</Typography>
        </Stack>
        <UsageBar value={r.capacity_pct} />
      </Box>
    </Box>
  );
}

// ── Service health row ────────────────────────────────────────────────────────
interface ServiceHealth {
  service: string;
  status: string;
  uptime_pct: number;
  latency_ms: number;
  error_rate: number;
}

// ── Active workload row ───────────────────────────────────────────────────────
interface Workload {
  type: string;
  count: number;
  running: number;
  icon: React.ReactNode;
  path: string;
}

// ── Incident row ──────────────────────────────────────────────────────────────
interface Incident {
  id: string;
  title: string;
  severity: string;
  status: string;
  service: string;
  created_at: string;
}

// ── Mock data generators ──────────────────────────────────────────────────────
function mockRegions(): RegionHealth[] {
  return [
    { region: 'US-East-1',     status: 'operational',    workloads: 142, incidents: 0, capacity_pct: 68, zones: 3, zones_healthy: 3 },
    { region: 'EU-West-1',     status: 'degraded',       workloads: 89,  incidents: 2, capacity_pct: 81, zones: 3, zones_healthy: 2 },
    { region: 'AP-Southeast-1',status: 'operational',    workloads: 54,  incidents: 0, capacity_pct: 44, zones: 2, zones_healthy: 2 },
    { region: 'US-West-2',     status: 'operational',    workloads: 77,  incidents: 0, capacity_pct: 55, zones: 3, zones_healthy: 3 },
    { region: 'SA-East-1',     status: 'major_outage',   workloads: 12,  incidents: 4, capacity_pct: 12, zones: 2, zones_healthy: 0 },
    { region: 'ME-South-1',    status: 'operational',    workloads: 8,   incidents: 0, capacity_pct: 22, zones: 2, zones_healthy: 2 },
  ];
}

function mockServices(): ServiceHealth[] {
  return [
    { service: 'Compute',     status: 'operational',   uptime_pct: 99.98, latency_ms: 12,   error_rate: 0.01 },
    { service: 'Storage',     status: 'operational',   uptime_pct: 99.99, latency_ms: 8,    error_rate: 0.00 },
    { service: 'Kubernetes',  status: 'degraded',      uptime_pct: 99.72, latency_ms: 45,   error_rate: 0.28 },
    { service: 'Networking',  status: 'operational',   uptime_pct: 99.97, latency_ms: 5,    error_rate: 0.00 },
    { service: 'Database',    status: 'operational',   uptime_pct: 99.95, latency_ms: 18,   error_rate: 0.02 },
    { service: 'Serverless',  status: 'operational',   uptime_pct: 99.93, latency_ms: 22,   error_rate: 0.05 },
    { service: 'CDN',         status: 'operational',   uptime_pct: 100,   latency_ms: 3,    error_rate: 0.00 },
    { service: 'IAM',         status: 'operational',   uptime_pct: 100,   latency_ms: 2,    error_rate: 0.00 },
    { service: 'Monitoring',  status: 'operational',   uptime_pct: 99.89, latency_ms: 9,    error_rate: 0.01 },
  ];
}

function mockIncidents(): Incident[] {
  return [
    { id: 'INC-0041', title: 'EU-West-1 Kubernetes API latency spike',  severity: 'sev2', status: 'investigating', service: 'Kubernetes', created_at: '2026-02-27T11:32:00Z' },
    { id: 'INC-0040', title: 'SA-East-1 storage cluster degraded',       severity: 'sev1', status: 'open',          service: 'Storage',    created_at: '2026-02-27T09:15:00Z' },
    { id: 'INC-0039', title: 'Cost anomaly: US-East-1 GPU spend +340%',  severity: 'sev3', status: 'identified',    service: 'Billing',    created_at: '2026-02-26T22:00:00Z' },
    { id: 'INC-0038', title: 'DNS propagation delay – EU domains',        severity: 'sev3', status: 'monitoring',    service: 'DNS',        created_at: '2026-02-26T18:45:00Z' },
    { id: 'INC-0037', title: 'Serverless cold start p99 >1500 ms',       severity: 'sev4', status: 'resolved',      service: 'Serverless', created_at: '2026-02-26T14:00:00Z' },
  ];
}

// ── Real-time metric chart (SSE-ready) ────────────────────────────────────────
interface LiveMetric {
  name: string;
  value: number;
  unit: string;
  history: number[];
  color: string;
}

function LiveMetricCard({ m }: { m: LiveMetric }) {
  const isUp = m.history.length > 1 && m.history[m.history.length - 1] >= m.history[m.history.length - 2];
  return (
    <Box sx={{ bgcolor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 1, p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography sx={{ fontFamily: FONT, fontSize: '0.72rem', color: MUTED, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {m.name}
        </Typography>
        <Sparkline data={m.history} color={m.color} />
      </Stack>
      <Stack direction="row" alignItems="baseline" spacing={0.5}>
        <Typography sx={{ fontFamily: FONT, fontSize: '1.4rem', fontWeight: 800, color: TEXT, lineHeight: 1 }}>
          {m.value.toFixed(m.unit === '%' ? 1 : 0)}
        </Typography>
        <Typography sx={{ fontFamily: FONT, fontSize: '0.75rem', color: MUTED }}>{m.unit}</Typography>
        {isUp
          ? <TrendingUpIcon sx={{ fontSize: 14, color: m.unit === '%' ? WARNING : SUCCESS, ml: 0.5 }} />
          : <TrendingDownIcon sx={{ fontSize: 14, color: SUCCESS, ml: 0.5 }} />}
      </Stack>
    </Box>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const EnterpriseOverviewDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user }  = useAuth() as any;

  const [regions,    setRegions]    = useState<RegionHealth[]>([]);
  const [services,   setServices]   = useState<ServiceHealth[]>([]);
  const [incidents,  setIncidents]  = useState<Incident[]>([]);
  const [stats,      setStats]      = useState<any>(null);
  const [liveMetrics, setLiveMetrics] = useState<LiveMetric[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Build initial live metrics
  const initLiveMetrics = useCallback((): LiveMetric[] => [
    { name: 'CPU Usage',       value: 62.4, unit: '%',      history: [45,50,55,60,63,58,62], color: BRAND     },
    { name: 'RAM Usage',       value: 71.8, unit: '%',      history: [65,68,70,72,74,71,72], color: PURPLE    },
    { name: 'Storage I/O',     value: 1240, unit: 'MB/s',   history: [900,1100,1050,1200,1180,1240,1240], color: SUCCESS },
    { name: 'Network In',      value: 4.8,  unit: 'Gbps',   history: [3.2,3.8,4.1,4.4,4.6,4.8,4.8], color: '#06B6D4' },
    { name: 'Network Out',     value: 2.1,  unit: 'Gbps',   history: [1.5,1.8,1.9,2.0,2.1,2.0,2.1], color: '#F97316' },
    { name: 'API Latency p99', value: 38,   unit: 'ms',     history: [28,30,34,35,37,38,38], color: WARNING   },
    { name: 'Error Rate',      value: 0.12, unit: '%',      history: [0.05,0.08,0.06,0.10,0.11,0.12,0.12], color: DANGER },
    { name: 'GPU Utilization', value: 84.2, unit: '%',      history: [70,75,78,81,83,84,84], color: '#EC4899' },
  ], []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Try real API first, fall back to mock data
      const [statsRes] = await Promise.allSettled([
        dashboardApi.getStats(),
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
    } catch {
      // ignore
    } finally {
      setRegions(mockRegions());
      setServices(mockServices());
      setIncidents(mockIncidents());
      setLiveMetrics(initLiveMetrics());
      setLastRefresh(new Date());
      setLoading(false);
    }
  }, [initLiveMetrics]);

  useEffect(() => { load(); }, [load]);

  // Simulate live metric updates every 5 s
  useEffect(() => {
    const id = setInterval(() => {
      setLiveMetrics(prev =>
        prev.map(m => {
          const delta = (Math.random() - 0.45) * (m.value * 0.05);
          const newVal = Math.max(0, m.value + delta);
          return {
            ...m,
            value: newVal,
            history: [...m.history.slice(-9), newVal],
          };
        })
      );
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // ── Derived KPIs ─────────────────────────────────────────────────────────
  const openIncidents    = incidents.filter(i => i.status !== 'resolved').length;
  const criticalIncidents = incidents.filter(i => i.severity === 'sev1').length;
  const healthyRegions   = regions.filter(r => r.status === 'operational').length;
  const totalWorkloads   = regions.reduce((s, r) => s + r.workloads, 0);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: BG, pb: 6, fontFamily: FONT }}>

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <Box
        sx={{
          bgcolor: SURFACE,
          borderBottom: `1px solid ${BORDER}`,
          px: { xs: 2, md: 4 },
          py: 2.5,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack spacing={0.3}>
            <Typography sx={{ fontFamily: FONT, fontWeight: 800, fontSize: '1.1rem', color: TEXT }}>
              Cloud Overview
            </Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: '0.78rem', color: MUTED }}>
              Enterprise infrastructure health — updated {lastRefresh.toLocaleTimeString()}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            {criticalIncidents > 0 && (
              <Chip
                icon={<ErrorIcon sx={{ fontSize: 14, color: DANGER + ' !important' }} />}
                label={`${criticalIncidents} Critical`}
                size="small"
                sx={{ bgcolor: `${DANGER}1a`, color: DANGER, border: `1px solid ${DANGER}33`, fontWeight: 700, fontSize: '0.7rem' }}
              />
            )}
            <Chip
              label={`${healthyRegions}/${regions.length} Regions Healthy`}
              size="small"
              sx={{ bgcolor: `${SUCCESS}1a`, color: SUCCESS, border: `1px solid ${SUCCESS}33`, fontWeight: 600, fontSize: '0.7rem' }}
            />
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={load} disabled={loading} sx={{ color: MUTED }}>
                <RefreshIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <CircularProgress size={32} sx={{ color: BRAND }} />
        </Box>
      ) : (
        <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>

          {/* ── KPI Row ─────────────────────────────────────────────────── */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {[
              { label: 'Total Workloads',   value: totalWorkloads, sub: 'across all regions',     icon: <ComputerIcon />,      color: BRAND,   path: '/dashboard/compute' },
              { label: 'Active Incidents',  value: openIncidents,  sub: `${criticalIncidents} sev1`, icon: <NotificationsActiveIcon />, color: DANGER, path: '/monitor-dashboard/incidents' },
              { label: 'Regions Online',    value: `${healthyRegions}/${regions.length}`, sub: 'availability zones', icon: <CloudCircleIcon />, color: SUCCESS, path: null },
              { label: 'Services Running',  value: services.filter(s => s.status === 'operational').length, sub: `of ${services.length} services`, icon: <MonitorHeartIcon />, color: PURPLE, path: '/monitor-dashboard/overview' },
              { label: 'Monthly Spend',     value: stats?.monthly_spend ? `$${(stats.monthly_spend / 1000).toFixed(1)}k` : '$14.2k', sub: 'projected $17.1k', icon: <AttachMoneyIcon />, color: WARNING, path: '/dashboard/billing', trend: { value: 8.4, label: 'MoM' } },
              { label: 'Team Members',      value: stats?.team_count || 24, sub: '6 active now',  icon: <PeopleIcon />,        color: '#06B6D4', path: '/dashboard/teams' },
            ].map(item => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={item.label}>
                <KpiCard
                  label={item.label}
                  value={item.value}
                  sub={item.sub}
                  icon={item.icon}
                  color={item.color}
                  trend={(item as any).trend}
                  onClick={item.path ? () => navigate(item.path!) : undefined}
                />
              </Grid>
            ))}
          </Grid>

          {/* ── Live Metrics ─────────────────────────────────────────────── */}
          <Box sx={{ mb: 4 }}>
            <SectionTitle
              icon={<SpeedIcon fontSize="small" />}
              title="Live Platform Metrics"
              sub="Real-time infrastructure telemetry — updates every 5 s"
            />
            <Grid container spacing={1.5}>
              {liveMetrics.map(m => (
                <Grid size={{ xs: 6, sm: 4, md: 3, lg: 3 }} key={m.name}>
                  <LiveMetricCard m={m} />
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* ── Region Health + Active Workloads ──────────────────────────── */}
          <Grid container spacing={3} sx={{ mb: 4 }}>

            {/* Region health */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <Box sx={{ bgcolor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 1, p: 3, height: '100%' }}>
                <SectionTitle
                  icon={<CloudCircleIcon fontSize="small" />}
                  title="Regional Health"
                  sub="Zone availability and capacity per region"
                />
                <Grid container spacing={2}>
                  {regions.map(r => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={r.region}>
                      <RegionCard r={r} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>

            {/* Active workloads */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Box sx={{ bgcolor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 1, p: 3, height: '100%' }}>
                <SectionTitle
                  icon={<ViewInArIcon fontSize="small" />}
                  title="Active Workloads"
                  sub="Cross-service summary"
                />
                <Stack spacing={1.5}>
                  {[
                    { label: 'Virtual Machines',     count: 127, running: 114, icon: <ComputerIcon sx={{ fontSize: 16 }} />,  color: BRAND,   path: '/dashboard/compute' },
                    { label: 'Containers',           count: 84,  running: 84,  icon: <ViewInArIcon sx={{ fontSize: 16 }} />,  color: PURPLE,  path: '/dashboard/containers' },
                    { label: 'K8s Pods',             count: 342, running: 318, icon: <RouterIcon sx={{ fontSize: 16 }} />,    color: '#06B6D4', path: '/dashboard/kubernetes' },
                    { label: 'Serverless Functions', count: 58,  running: 58,  icon: <FunctionsIcon sx={{ fontSize: 16 }} />, color: WARNING, path: '/dashboard/serverless' },
                    { label: 'GPU Jobs',             count: 12,  running: 9,   icon: <MemoryIcon sx={{ fontSize: 16 }} />,    color: '#EC4899', path: '/dashboard/gpu' },
                    { label: 'Batch Jobs',           count: 24,  running: 18,  icon: <StorageIcon sx={{ fontSize: 16 }} />,   color: SUCCESS, path: null },
                  ].map(w => (
                    <Box
                      key={w.label}
                      onClick={() => w.path && navigate(w.path)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 1.5,
                        bgcolor: SURFACE2,
                        borderRadius: 1,
                        border: `1px solid ${BORDER}`,
                        cursor: w.path ? 'pointer' : 'default',
                        transition: 'border-color 0.15s',
                        '&:hover': w.path ? { borderColor: w.color } : {},
                      }}
                    >
                      <Box sx={{ color: w.color, display: 'flex' }}>{w.icon}</Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontFamily: FONT, fontSize: '0.8rem', color: TEXT, fontWeight: 600 }}>
                          {w.label}
                        </Typography>
                        <Typography sx={{ fontFamily: FONT, fontSize: '0.7rem', color: MUTED }}>
                          {w.running}/{w.count} running
                        </Typography>
                      </Box>
                      <UsageBar value={w.running} max={w.count} color={w.color} />
                      <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.85rem', color: TEXT, minWidth: 28, textAlign: 'right' }}>
                        {w.running}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Grid>
          </Grid>

          {/* ── Service Health + Incident Feed ───────────────────────────── */}
          <Grid container spacing={3} sx={{ mb: 4 }}>

            {/* Service health table */}
            <Grid size={{ xs: 12, lg: 7 }}>
              <Box sx={{ bgcolor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 1, p: 3 }}>
                <SectionTitle
                  icon={<MonitorHeartIcon fontSize="small" />}
                  title="Service Health"
                  sub="Uptime, latency, error rates across all services"
                  action={
                    <Chip
                      label="View All"
                      size="small"
                      onClick={() => navigate('/monitor-dashboard/overview')}
                      sx={{ bgcolor: `${BRAND}18`, color: BRAND, cursor: 'pointer', fontSize: '0.7rem' }}
                    />
                  }
                />
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {['Service', 'Status', 'Uptime', 'Latency', 'Error Rate'].map(h => (
                        <TableCell key={h} sx={{ fontFamily: FONT, fontSize: '0.68rem', color: MUTED, fontWeight: 700, borderColor: BORDER, py: 1, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {services.map(s => (
                      <TableRow key={s.service} sx={{ '&:hover': { bgcolor: SURFACE2 } }}>
                        <TableCell sx={{ fontFamily: FONT, fontSize: '0.8rem', color: TEXT, fontWeight: 600, borderColor: BORDER, py: 1.2 }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <StatusDot status={s.status} />
                            <span>{s.service}</span>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ borderColor: BORDER, py: 1.2 }}>
                          <StatusBadge status={s.status} />
                        </TableCell>
                        <TableCell sx={{ fontFamily: FONT, fontSize: '0.8rem', color: s.uptime_pct >= 99.9 ? SUCCESS : WARNING, fontWeight: 700, borderColor: BORDER, py: 1.2 }}>
                          {s.uptime_pct.toFixed(2)}%
                        </TableCell>
                        <TableCell sx={{ fontFamily: FONT, fontSize: '0.8rem', color: TEXT, borderColor: BORDER, py: 1.2 }}>
                          {s.latency_ms} ms
                        </TableCell>
                        <TableCell sx={{ fontFamily: FONT, fontSize: '0.8rem', color: s.error_rate > 0.1 ? DANGER : TEXT, fontWeight: s.error_rate > 0.1 ? 700 : 400, borderColor: BORDER, py: 1.2 }}>
                          {s.error_rate.toFixed(2)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Grid>

            {/* Incident feed */}
            <Grid size={{ xs: 12, lg: 5 }}>
              <Box sx={{ bgcolor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 1, p: 3 }}>
                <SectionTitle
                  icon={<NotificationsActiveIcon fontSize="small" />}
                  title="Incident Feed"
                  sub="Active and recent platform incidents"
                  action={
                    <Chip
                      label="All Incidents"
                      size="small"
                      onClick={() => navigate('/monitor-dashboard/incidents')}
                      sx={{ bgcolor: `${BRAND}18`, color: BRAND, cursor: 'pointer', fontSize: '0.7rem' }}
                    />
                  }
                />
                <Stack spacing={1.5}>
                  {incidents.map(inc => {
                    const sevColor =
                      inc.severity === 'sev1' ? DANGER :
                      inc.severity === 'sev2' ? '#F97316' :
                      inc.severity === 'sev3' ? WARNING : MUTED;
                    const stColor =
                      inc.status === 'resolved' ? SUCCESS :
                      inc.status === 'open' || inc.status === 'investigating' ? DANGER : WARNING;
                    return (
                      <Box
                        key={inc.id}
                        sx={{
                          bgcolor: SURFACE2,
                          border: `1px solid ${BORDER}`,
                          borderLeft: `3px solid ${sevColor}`,
                          borderRadius: 1,
                          p: 1.5,
                        }}
                      >
                        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Stack direction="row" alignItems="center" spacing={0.8} sx={{ mb: 0.5 }}>
                              <Typography sx={{ fontFamily: FONT, fontSize: '0.68rem', color: sevColor, fontWeight: 700 }}>
                                {inc.severity.toUpperCase()}
                              </Typography>
                              <Typography sx={{ fontFamily: FONT, fontSize: '0.68rem', color: MUTED }}>·</Typography>
                              <Typography sx={{ fontFamily: FONT, fontSize: '0.68rem', color: MUTED }}>
                                {inc.service}
                              </Typography>
                            </Stack>
                            <Typography sx={{ fontFamily: FONT, fontSize: '0.8rem', color: TEXT, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {inc.title}
                            </Typography>
                            <Typography sx={{ fontFamily: FONT, fontSize: '0.68rem', color: MUTED, mt: 0.3 }}>
                              {inc.id} · {new Date(inc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                          </Box>
                          <Chip
                            label={inc.status}
                            size="small"
                            sx={{ bgcolor: `${stColor}1a`, color: stColor, border: `1px solid ${stColor}33`, fontWeight: 700, fontSize: '0.65rem', height: 20, flexShrink: 0, textTransform: 'capitalize' }}
                          />
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            </Grid>
          </Grid>

          {/* ── Resource Utilization ───────────────────────────────────────── */}
          <Box sx={{ bgcolor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 1, p: 3, mb: 4 }}>
            <SectionTitle
              icon={<SpeedIcon fontSize="small" />}
              title="Cluster Resource Utilization"
              sub="CPU · RAM · Storage · GPU across all regions"
            />
            <Grid container spacing={3}>
              {[
                { label: 'CPU',     used: 62, total: 100, unit: '%',    color: BRAND  },
                { label: 'Memory',  used: 71, total: 100, unit: '%',    color: PURPLE },
                { label: 'Storage', used: 58, total: 480, unit: ' TB',  color: SUCCESS },
                { label: 'GPU',     used: 84, total: 100, unit: '%',    color: '#EC4899' },
                { label: 'Network', used: 4.8, total: 10, unit: ' Gbps', color: '#06B6D4' },
              ].map(r => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 12/5 }} key={r.label}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                      <Typography sx={{ fontFamily: FONT, fontSize: '0.78rem', color: TEXT, fontWeight: 600 }}>
                        {r.label}
                      </Typography>
                      <Typography sx={{ fontFamily: FONT, fontSize: '0.78rem', color: MUTED }}>
                        {r.used}{r.unit} / {r.total}{r.unit}
                      </Typography>
                    </Stack>
                    <UsageBar value={r.used} max={r.total} color={r.color} />
                    <Typography sx={{ fontFamily: FONT, fontSize: '0.68rem', color: MUTED, mt: 0.4, textAlign: 'right' }}>
                      {((r.used / r.total) * 100).toFixed(0)}% utilized
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* ── Quick Links ───────────────────────────────────────────────── */}
          <Box>
            <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.85rem', color: MUTED, mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Quick Access
            </Typography>
            <Grid container spacing={1.5}>
              {[
                { label: 'Compute',         path: '/dashboard/compute',            icon: <ComputerIcon sx={{ fontSize: 18 }} />,   color: BRAND  },
                { label: 'Kubernetes',      path: '/dashboard/kubernetes',         icon: <RouterIcon sx={{ fontSize: 18 }} />,    color: '#06B6D4' },
                { label: 'Storage',         path: '/dashboard/storage',            icon: <StorageIcon sx={{ fontSize: 18 }} />,   color: SUCCESS },
                { label: 'Networking',      path: '/dashboard/network',            icon: <RouterIcon sx={{ fontSize: 18 }} />,    color: WARNING },
                { label: 'IAM',             path: '/dashboard/iam',                icon: <PeopleIcon sx={{ fontSize: 18 }} />,    color: PURPLE },
                { label: 'Monitoring',      path: '/monitor-dashboard/overview',   icon: <MonitorHeartIcon sx={{ fontSize: 18 }} />, color: '#EC4899' },
                { label: 'Billing',         path: '/dashboard/billing',            icon: <AttachMoneyIcon sx={{ fontSize: 18 }} />, color: WARNING },
                { label: 'Compliance',      path: '/dashboard/compliance',         icon: <CheckCircleIcon sx={{ fontSize: 18 }} />, color: SUCCESS },
                { label: 'Secrets Vault',   path: '/dashboard/secrets',            icon: <SpeedIcon sx={{ fontSize: 18 }} />,     color: DANGER },
                { label: 'KMS',             path: '/dashboard/kms',                icon: <SpeedIcon sx={{ fontSize: 18 }} />,     color: '#F97316' },
                { label: 'GPU Workloads',   path: '/dashboard/gpu',                icon: <MemoryIcon sx={{ fontSize: 18 }} />,    color: '#EC4899' },
                { label: 'Zero-Trust',      path: '/dashboard/zero-trust',         icon: <SpeedIcon sx={{ fontSize: 18 }} />,     color: '#8B5CF6' },
              ].map(q => (
                <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={q.label}>
                  <Box
                    onClick={() => navigate(q.path)}
                    sx={{
                      bgcolor: SURFACE,
                      border: `1px solid ${BORDER}`,
                      borderRadius: 1,
                      p: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      cursor: 'pointer',
                      transition: 'border-color 0.15s',
                      '&:hover': { borderColor: q.color },
                    }}
                  >
                    <Box sx={{ color: q.color }}>{q.icon}</Box>
                    <Typography sx={{ fontFamily: FONT, fontSize: '0.8rem', color: TEXT, fontWeight: 600, flex: 1 }}>
                      {q.label}
                    </Typography>
                    <OpenInNewIcon sx={{ fontSize: 12, color: MUTED }} />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

        </Box>
      )}
    </Box>
  );
};

export default EnterpriseOverviewDashboard;
