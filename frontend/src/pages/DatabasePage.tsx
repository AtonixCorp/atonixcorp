// AtonixCorp Cloud – Managed Database Page

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Stack, Button, Chip, Avatar, Divider,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, Skeleton, Alert, Snackbar, Tabs, Tab,
  Table, TableBody, TableCell, TableHead, TableRow,
  CircularProgress, Paper,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AddIcon                from '@mui/icons-material/Add';
import RefreshIcon            from '@mui/icons-material/Refresh';
import DeleteOutlineIcon      from '@mui/icons-material/DeleteOutline';
import ContentCopyIcon        from '@mui/icons-material/ContentCopy';
import BackupIcon             from '@mui/icons-material/Backup';
import RestoreIcon            from '@mui/icons-material/RestoreOutlined';
import RotateRightIcon        from '@mui/icons-material/Loop';
import VisibilityIcon         from '@mui/icons-material/Visibility';
import VisibilityOffIcon      from '@mui/icons-material/VisibilityOff';
import TerminalIcon           from '@mui/icons-material/Terminal';
import LockIcon               from '@mui/icons-material/Lock';
import SyncIcon               from '@mui/icons-material/Sync';
import { databaseApi }        from '../services/cloudApi';
import {
  ManagedDatabase, DBMetric, DBBackup, DBCredential,
  ENGINE_META, DBStatus,
} from '../types/database';
import CreateDatabaseModal from '../components/Cloud/CreateDatabaseModal';
import MigrateDatabaseModal from '../components/Cloud/MigrateDatabaseModal';

// ── Status colours ────────────────────────────────────────────────────────────
const STATUS_STYLE: Record<DBStatus, { bg: string; text: string; label: string }> = {
  running:      { bg: 'rgba(16,185,129,.12)',  text: '#10B981', label: 'Running' },
  provisioning: { bg: 'rgba(245,158,11,.12)',  text: '#F59E0B', label: 'Provisioning' },
  stopped:      { bg: 'rgba(107,114,128,.12)', text: '#6B7280', label: 'Stopped' },
  restarting:   { bg: 'rgba(99,102,241,.12)',  text: '#6366F1', label: 'Restarting' },
  scaling:      { bg: 'rgba(99,102,241,.12)',  text: '#6366F1', label: 'Scaling' },
  deleting:     { bg: 'rgba(239,68,68,.12)',   text: '#EF4444', label: 'Deleting' },
  error:        { bg: 'rgba(239,68,68,.12)',   text: '#EF4444', label: 'Error' },
  backup:       { bg: 'rgba(245,158,11,.12)',  text: '#F59E0B', label: 'Backup' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n: number | null | undefined, unit = '', digits = 1) {
  if (n == null) return '—';
  return `${n.toFixed(digits)}${unit}`;
}
function fmtMem(mb: number) { return mb >= 1024 ? `${(mb / 1024).toFixed(0)} GB` : `${mb} MB`; }

// ── DB list card ──────────────────────────────────────────────────────────────
function DBCard({ db, selected, onClick, isDark }: {
  db: ManagedDatabase; selected: boolean; onClick: () => void; isDark: boolean;
}) {
  const meta = ENGINE_META[db.engine];
  const st   = STATUS_STYLE[db.status] ?? STATUS_STYLE.stopped;
  const border = isDark ? 'rgba(255,255,255,.08)' : '#E5E7EB';
  return (
    <Box onClick={onClick} sx={{
      px: 2, py: 1.75, cursor: 'pointer', transition: 'background .12s',
      bgcolor: selected ? (isDark ? 'rgba(24,54,106,.35)' : 'rgba(24,54,106,.06)') : 'transparent',
      borderLeft: `3px solid ${selected ? '#18366A' : 'transparent'}`,
      borderBottom: `1px solid ${border}`,
      '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,.04)' : 'rgba(24,54,106,.03)' },
    }}>
      <Box display="flex" alignItems="center" gap={1.5}>
        <Box sx={{ width: 34, height: 34, borderRadius: '8px', bgcolor: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Typography fontWeight={800} fontSize=".65rem" color="#fff">{meta.icon}</Typography>
        </Box>
        <Box flex={1} minWidth={0}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography fontWeight={700} fontSize=".88rem" color={isDark ? '#ffffff' : '#0A0F1F'} noWrap>{db.name}</Typography>
            <Chip size="small" label={st.label} sx={{ height: 16, fontSize: '.6rem', fontWeight: 700, bgcolor: st.bg, color: st.text }} />
          </Box>
          <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,.5)' : '#9CA3AF' }}>
            {db.engine_display} v{db.version} &nbsp;·&nbsp; {db.region_display?.split(' — ')[0] ?? db.region}
          </Typography>
        </Box>
      </Box>
      <Box display="flex" gap={2} mt={.75} pl={5.5}>
        {[
          `${db.vcpus} vCPU`,
          fmtMem(db.memory_mb),
          `${db.storage_gb} GB`,
        ].map(s => (
          <Typography key={s} variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,.4)' : '#9CA3AF' }}>{s}</Typography>
        ))}
      </Box>
    </Box>
  );
}

// ── Metric bar ────────────────────────────────────────────────────────────────
function MetricBar({ label, value, max = 100, unit = '%', color = '#18366A', isDark }: {
  label: string; value: number | null; max?: number; unit?: string; color?: string; isDark: boolean;
}) {
  const pct = value != null ? Math.min((value / max) * 100, 100) : 0;
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={.4}>
        <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,.55)' : '#6B7280' }}>{label}</Typography>
        <Typography variant="caption" fontWeight={700} color={isDark ? '#ffffff' : '#0A0F1F'}>
          {value != null ? `${value.toFixed(1)}${unit}` : '—'}
        </Typography>
      </Box>
      <Box sx={{ height: 5, bgcolor: isDark ? 'rgba(255,255,255,.08)' : '#F3F4F6', borderRadius: 3 }}>
        <Box sx={{ width: `${pct}%`, height: '100%', bgcolor: pct > 80 ? '#EF4444' : pct > 60 ? '#F59E0B' : color, borderRadius: 3, transition: 'width .3s' }} />
      </Box>
    </Box>
  );
}

// ── Section card wrapper ──────────────────────────────────────────────────────
function SCard({ children, isDark }: { children: React.ReactNode; isDark: boolean }) {
  return (
    <Paper elevation={0} sx={{
      bgcolor: isDark ? '#132336' : '#ffffff',
      border: `1px solid ${isDark ? 'rgba(255,255,255,.08)' : '#E5E7EB'}`,
      borderRadius: '12px', p: 2.5, mb: 2,
    }}>
      {children}
    </Paper>
  );
}

// ── Connection string row ─────────────────────────────────────────────────────
function ConnRow({ label, value, mono = false, isDark }: {
  label: string; value: string; mono?: boolean; isDark: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  const textSec = isDark ? 'rgba(255,255,255,.5)' : '#9CA3AF';
  return (
    <Box display="flex" alignItems="center" gap={1} py={.4}>
      <Typography variant="caption" sx={{ color: textSec, minWidth: 120 }}>{label}</Typography>
      <Typography variant="caption" sx={{ flex: 1, fontFamily: mono ? 'monospace' : 'inherit', color: isDark ? '#ffffff' : '#0A0F1F', wordBreak: 'break-all', fontSize: mono ? '.78rem' : '.82rem' }}>
        {value || '—'}
      </Typography>
      <Tooltip title={copied ? 'Copied!' : 'Copy'}><IconButton size="small" onClick={copy} sx={{ color: textSec }}><ContentCopyIcon sx={{ fontSize: '.85rem' }} /></IconButton></Tooltip>
    </Box>
  );
}

// ── Credentials tab ───────────────────────────────────────────────────────────
function CredentialsTab({ db, isDark }: { db: ManagedDatabase; isDark: boolean }) {
  const [creds, setCreds]     = useState<DBCredential[]>(db.credentials ?? []);
  const [loading, setLoading] = useState(false);
  const [shown, setShown]     = useState<Record<number, boolean>>({});
  const [rotating, setRotating] = useState<number | null>(null);
  const [newCred, setNewCred] = useState<{ username: string; password: string } | null>(null);
  const bg     = isDark ? 'rgba(255,255,255,.04)' : '#F9FAFB';
  const border = isDark ? 'rgba(255,255,255,.08)' : '#E5E7EB';

  const refresh = useCallback(() => {
    setLoading(true);
    databaseApi.credentials(db.id).then(r => { setCreds(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [db.id]);

  const rotate = async (username: string, id: number) => {
    setRotating(id);
    try {
      const r = await databaseApi.rotate(db.id, username);
      setNewCred({ username: r.data.username, password: r.data.password });
      refresh();
    } finally { setRotating(null); }
  };

  return (
    <Box>
      {newCred && (
        <Alert severity="success" onClose={() => setNewCred(null)} sx={{ mb: 2 }}>
          <strong>New password for {newCred.username}:</strong>&nbsp;
          <code style={{ fontFamily: 'monospace' }}>{newCred.password}</code>&nbsp;— copy it now, it won't be shown again.
        </Alert>
      )}
      <Box display="flex" justifyContent="flex-end" mb={1.5}>
        <Button size="small" startIcon={<RefreshIcon />} onClick={refresh} disabled={loading} sx={{ textTransform: 'none', color: isDark ? '#ffffff' : '#374151' }}>Refresh</Button>
      </Box>
      <Stack spacing={1.5}>
        {loading ? [1,2].map(k => <Skeleton key={k} height={70} sx={{ bgcolor: isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.05)', borderRadius: 2 }} />) :
        creds.map(c => (
          <Box key={c.id} sx={{ p: 1.75, bgcolor: bg, borderRadius: '10px', border: `1px solid ${border}` }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={.75} flexWrap="wrap" gap={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <LockIcon sx={{ fontSize: '.9rem', color: isDark ? 'rgba(255,255,255,.4)' : '#9CA3AF' }} />
                <Typography fontWeight={700} fontSize=".88rem" color={isDark ? '#ffffff' : '#0A0F1F'}>{c.username}</Typography>
                <Chip size="small" label={c.role} sx={{ height: 16, fontSize: '.6rem', fontWeight: 700,
                  bgcolor: c.role === 'admin' ? 'rgba(239,68,68,.1)' : 'rgba(24,54,106,.1)',
                  color: c.role === 'admin' ? '#EF4444' : '#18366A' }} />
              </Box>
              <Button size="small" startIcon={rotating === c.id ? <CircularProgress size={12} /> : <RotateRightIcon />}
                onClick={() => rotate(c.username, c.id)} disabled={rotating === c.id}
                sx={{ textTransform: 'none', fontSize: '.78rem', color: isDark ? '#ffffff' : '#374151' }}>
                Rotate
              </Button>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography sx={{ fontFamily: 'monospace', fontSize: '.82rem', color: isDark ? 'rgba(255,255,255,.6)' : '#6B7280', flex: 1 }}>
                {shown[c.id] ? c.password : '••••••••••••••••••••'}
              </Typography>
              <IconButton size="small" onClick={() => setShown(s => ({ ...s, [c.id]: !s[c.id] }))} sx={{ color: isDark ? 'rgba(255,255,255,.4)' : '#9CA3AF' }}>
                {shown[c.id] ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
              </IconButton>
              <IconButton size="small" onClick={() => navigator.clipboard.writeText(c.password)} sx={{ color: isDark ? 'rgba(255,255,255,.4)' : '#9CA3AF' }}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Box>
            {c.last_rotated_at && (
              <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,.3)' : '#9CA3AF', mt: .5, display: 'block' }}>
                Last rotated: {new Date(c.last_rotated_at).toLocaleString()}
              </Typography>
            )}
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

// ── Backups tab ───────────────────────────────────────────────────────────────
function BackupsTab({ db, isDark }: { db: ManagedDatabase; isDark: boolean }) {
  const [backups, setBackups]   = useState<DBBackup[]>(db.backups ?? []);
  const [loading, setLoading]   = useState(false);
  const [creating, setCreating] = useState(false);
  const bg     = isDark ? 'rgba(255,255,255,.04)' : '#F9FAFB';
  const border = isDark ? 'rgba(255,255,255,.08)' : '#E5E7EB';

  const refresh = () => {
    setLoading(true);
    databaseApi.backups(db.id).then(r => { setBackups(r.data); setLoading(false); }).catch(() => setLoading(false));
  };

  const createBackup = async () => {
    setCreating(true);
    await databaseApi.backup(db.id, 'manual').catch(() => {});
    setCreating(false);
    refresh();
  };

  const statusColor = (s: string) => ({ completed: '#10B981', running: '#F59E0B', failed: '#EF4444' }[s] ?? '#6B7280');

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" gap={1} mb={1.5}>
        <Button size="small" startIcon={<RefreshIcon />} onClick={refresh} sx={{ textTransform: 'none', color: isDark ? '#ffffff' : '#374151' }}>Refresh</Button>
        <Button size="small" variant="contained" startIcon={creating ? <CircularProgress size={12} color="inherit" /> : <BackupIcon />}
          onClick={createBackup} disabled={creating || db.status !== 'running'}
          sx={{ bgcolor: '#18366A', '&:hover': { bgcolor: '#102548' }, textTransform: 'none', borderRadius: '8px', fontWeight: 600 }}>
          Create Backup
        </Button>
      </Box>
      {loading ? [1,2,3].map(k => <Skeleton key={k} height={50} sx={{ mb: 1, bgcolor: isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.05)', borderRadius: 1 }} />) : (
        backups.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <BackupIcon sx={{ fontSize: '2rem', color: isDark ? 'rgba(255,255,255,.2)' : '#E5E7EB', mb: 1 }} />
            <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,.4)' : '#9CA3AF' }}>No backups yet</Typography>
          </Box>
        ) : (
          <Stack spacing={1}>
            {backups.map(b => (
              <Box key={b.backup_id} display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}
                sx={{ p: 1.5, bgcolor: bg, borderRadius: '8px', border: `1px solid ${border}` }}>
                <Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip size="small" label={b.status} sx={{ height: 16, fontSize: '.6rem', fontWeight: 700, bgcolor: `${statusColor(b.status)}18`, color: statusColor(b.status) }} />
                    <Chip size="small" label={b.backup_type} sx={{ height: 16, fontSize: '.6rem', fontWeight: 700, bgcolor: isDark ? 'rgba(255,255,255,.08)' : '#F3F4F6', color: isDark ? '#ffffff' : '#374151' }} />
                    <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,.45)' : '#9CA3AF' }}>{b.size_gb.toFixed(2)} GB</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,.35)' : '#9CA3AF', display: 'block', mt: .25 }}>
                    {new Date(b.created_at).toLocaleString()} &nbsp;·&nbsp; {b.duration_s}s
                  </Typography>
                </Box>
                <Tooltip title="Restore from backup">
                  <span>
                    <IconButton size="small" disabled={b.status !== 'completed'}
                      onClick={() => databaseApi.restore(db.id, b.backup_id)}
                      sx={{ color: b.status === 'completed' ? (isDark ? '#ffffff' : '#18366A') : isDark ? 'rgba(255,255,255,.2)' : '#D1D5DB' }}>
                      <RestoreIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            ))}
          </Stack>
        )
      )}
    </Box>
  );
}

// ── Metrics tab ───────────────────────────────────────────────────────────────
function MetricsTab({ db, isDark }: { db: ManagedDatabase; isDark: boolean }) {
  const [metrics, setMetrics] = useState<DBMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const latest = metrics[0];

  useEffect(() => {
    databaseApi.metrics(db.id).then(r => { setMetrics(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [db.id]);

  const border  = isDark ? 'rgba(255,255,255,.08)' : '#E5E7EB';
  const textSec = isDark ? 'rgba(255,255,255,.5)' : '#9CA3AF';

  const statBoxes = latest ? [
    { label: 'CPU', value: `${fmt(latest.cpu_percent)}%`, color: '#18366A' },
    { label: 'Memory', value: `${fmt(latest.memory_percent)}%`, color: '#6366F1' },
    { label: 'Storage', value: `${fmt(latest.storage_used_gb, ' GB')}`, color: '#F59E0B' },
    { label: 'Connections', value: String(latest.active_connections ?? '—'), color: '#10B981' },
    { label: 'QPS', value: fmt(latest.queries_per_second), color: '#EC4899' },
    { label: 'Latency', value: `${fmt(latest.avg_query_latency_ms, 'ms')}`, color: '#8B5CF6' },
  ] : [];

  if (loading) return (
    <Box display="grid" gridTemplateColumns="repeat(3,1fr)" gap={1.5}>
      {[1,2,3,4,5,6].map(k => <Skeleton key={k} height={72} sx={{ bgcolor: isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.05)', borderRadius: 2 }} />)}
    </Box>
  );

  return (
    <Box>
      {/* Stat boxes */}
      <Box display="grid" gridTemplateColumns={{ xs: 'repeat(2,1fr)', sm: 'repeat(3,1fr)' }} gap={1.5} mb={2.5}>
        {statBoxes.map(s => (
          <Box key={s.label} sx={{ p: 1.5, bgcolor: isDark ? 'rgba(255,255,255,.04)' : '#F9FAFB', borderRadius: '10px', border: `1px solid ${border}` }}>
            <Typography variant="caption" sx={{ color: textSec, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '.07em', fontSize: '.65rem' }}>{s.label}</Typography>
            <Typography fontWeight={800} fontSize="1.3rem" color={s.color} mt={.25}>{s.value}</Typography>
          </Box>
        ))}
      </Box>
      {/* Progress bars */}
      {latest && (
        <Box sx={{ p: 2, bgcolor: isDark ? 'rgba(255,255,255,.04)' : '#F9FAFB', borderRadius: '10px', border: `1px solid ${border}` }}>
          <Typography fontWeight={700} fontSize=".88rem" color={isDark ? '#ffffff' : '#0A0F1F'} mb={1.5}>Resource Utilisation</Typography>
          <Stack spacing={1.5}>
            <MetricBar label="CPU"     value={latest.cpu_percent}     color="#18366A" isDark={isDark} />
            <MetricBar label="Memory"  value={latest.memory_percent}  color="#6366F1" isDark={isDark} />
            <MetricBar label="Storage" value={latest.storage_used_gb} max={db.storage_gb} unit=" GB" color="#F59E0B" isDark={isDark} />
          </Stack>
        </Box>
      )}
      {/* Recent history table */}
      {metrics.length > 1 && (
        <Box sx={{ mt: 2, border: `1px solid ${border}`, borderRadius: '10px', overflow: 'hidden' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: isDark ? 'rgba(255,255,255,.04)' : '#F9FAFB' }}>
                {['Time', 'CPU %', 'Mem %', 'Connections', 'QPS', 'Latency (ms)'].map(h => (
                  <TableCell key={h} sx={{ fontSize: '.75rem', fontWeight: 700, color: textSec, borderColor: border }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {metrics.slice(0, 12).map(m => (
                <TableRow key={m.id} sx={{ '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,.03)' : 'rgba(0,0,0,.02)' } }}>
                  <TableCell sx={{ fontSize: '.78rem', color: textSec, borderColor: border }}>{new Date(m.created_at).toLocaleTimeString()}</TableCell>
                  <TableCell sx={{ fontSize: '.78rem', color: isDark ? '#ffffff' : '#0A0F1F', borderColor: border }}>{fmt(m.cpu_percent, '%')}</TableCell>
                  <TableCell sx={{ fontSize: '.78rem', color: isDark ? '#ffffff' : '#0A0F1F', borderColor: border }}>{fmt(m.memory_percent, '%')}</TableCell>
                  <TableCell sx={{ fontSize: '.78rem', color: isDark ? '#ffffff' : '#0A0F1F', borderColor: border }}>{m.active_connections ?? '—'}</TableCell>
                  <TableCell sx={{ fontSize: '.78rem', color: isDark ? '#ffffff' : '#0A0F1F', borderColor: border }}>{fmt(m.queries_per_second)}</TableCell>
                  <TableCell sx={{ fontSize: '.78rem', color: isDark ? '#ffffff' : '#0A0F1F', borderColor: border }}>{fmt(m.avg_query_latency_ms)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  );
}

// ── Detail panel ──────────────────────────────────────────────────────────────
function DatabaseDetail({ db, onDelete, onRefresh, isDark }: {
  db: ManagedDatabase; onDelete: () => void; onRefresh: () => void; isDark: boolean;
}) {
  const [tab, setTab]               = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [migrateOpen, setMigrate]   = useState(false);
  const meta   = ENGINE_META[db.engine];
  const st     = STATUS_STYLE[db.status] ?? STATUS_STYLE.stopped;
  const border = isDark ? 'rgba(255,255,255,.08)' : '#E5E7EB';

  const doDelete = async () => {
    setDeleting(true);
    await databaseApi.delete(db.id).catch(() => {});
    setDeleting(false);
    setDeleteOpen(false);
    onDelete();
  };

  const restart = async () => {
    await databaseApi.restart(db.id).catch(() => {});
    onRefresh();
  };

  return (
    <>
      {/* Header */}
      <Box sx={{ p: 2.5, borderBottom: `1px solid ${border}` }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box sx={{ width: 42, height: 42, borderRadius: '10px', bgcolor: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Typography fontWeight={800} fontSize=".75rem" color="#fff">{meta.icon}</Typography>
            </Box>
            <Box>
              <Typography fontWeight={800} fontSize="1.05rem" color={isDark ? '#ffffff' : '#0A0F1F'}>{db.name}</Typography>
              <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,.5)' : '#9CA3AF' }}>
                {db.engine_display} v{db.version} &nbsp;·&nbsp; {db.region_display}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={.75} flexWrap="wrap" justifyContent="flex-end">
            <Chip size="small" label={st.label} sx={{ bgcolor: st.bg, color: st.text, fontWeight: 700, fontSize: '.72rem' }} />
            <Tooltip title="Migrate to another database">
              <span>
                <IconButton size="small" onClick={() => setMigrate(true)} disabled={db.status !== 'running'}
                  sx={{ color: db.status === 'running' ? (isDark ? '#ffffff' : '#374151') : (isDark ? 'rgba(255,255,255,.2)' : '#D1D5DB') }}>
                  <SyncIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Restart">
              <IconButton size="small" onClick={restart} sx={{ color: isDark ? '#ffffff' : '#374151' }}><RefreshIcon fontSize="small" /></IconButton>
            </Tooltip>
            <Tooltip title="Delete database">
              <IconButton size="small" onClick={() => setDeleteOpen(true)} sx={{ color: '#EF4444' }}><DeleteOutlineIcon fontSize="small" /></IconButton>
            </Tooltip>
          </Box>
        </Box>
        {/* Quick stats */}
        <Box display="flex" gap={2} mt={1.5} flexWrap="wrap">
          {[
            [`${db.vcpus} vCPU`, ''], [`${fmtMem(db.memory_mb)} RAM`, ''],
            [`${db.storage_gb} GB SSD`, ''], [`$${db.hourly_cost_usd}/hr`, ''],
            [db.read_replicas > 0 ? `${db.read_replicas} replica${db.read_replicas > 1 ? 's' : ''}` : 'No replicas', ''],
          ].map(([v]) => (
            <Typography key={v} variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,.55)' : '#6B7280', bgcolor: isDark ? 'rgba(255,255,255,.06)' : '#F3F4F6', px: 1, py: .25, borderRadius: '6px' }}>
              {v}
            </Typography>
          ))}
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: `1px solid ${border}` }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{
          px: 1.5, minHeight: 40,
          '& .MuiTab-root': { textTransform: 'none', fontSize: '.82rem', minHeight: 40, color: isDark ? 'rgba(255,255,255,.5)' : '#6B7280' },
          '& .Mui-selected': { color: isDark ? '#ffffff' : '#18366A', fontWeight: 700 },
          '& .MuiTabs-indicator': { bgcolor: '#18366A' },
        }}>
          <Tab label="Overview" />
          <Tab label="Credentials" />
          <Tab label="Backups" />
          <Tab label="Metrics" />
        </Tabs>
      </Box>

      {/* Tab content */}
      <Box sx={{ p: 2.5, overflowY: 'auto', flex: 1 }}>
        {/* Overview */}
        {tab === 0 && (
          <>
            <SCard isDark={isDark}>
              <Typography fontWeight={700} fontSize=".9rem" color={isDark ? '#ffffff' : '#0A0F1F'} mb={1.5}>Connection Details</Typography>
              <ConnRow label="Host"     value={db.host || '—'}                isDark={isDark} mono />
              <Divider sx={{ my: .5, borderColor: isDark ? 'rgba(255,255,255,.06)' : '#F3F4F6' }} />
              <ConnRow label="Port"     value={String(db.port || db.default_port)} isDark={isDark} />
              <Divider sx={{ my: .5, borderColor: isDark ? 'rgba(255,255,255,.06)' : '#F3F4F6' }} />
              <ConnRow label="Database" value={db.database_name}              isDark={isDark} />
              <Divider sx={{ my: .5, borderColor: isDark ? 'rgba(255,255,255,.06)' : '#F3F4F6' }} />
              <ConnRow label="SSL"      value={db.ssl_enabled ? 'Enabled (TLS 1.3)' : 'Disabled'} isDark={isDark} />
              <Divider sx={{ my: .5, borderColor: isDark ? 'rgba(255,255,255,.06)' : '#F3F4F6' }} />
              <ConnRow label="URI"      value={db.connection_uri || '—'}      isDark={isDark} mono />
            </SCard>
            <SCard isDark={isDark}>
              <Typography fontWeight={700} fontSize=".9rem" color={isDark ? '#ffffff' : '#0A0F1F'} mb={1.5}>Configuration</Typography>
              {[
                ['Engine',        `${db.engine_display} v${db.version}`],
                ['Tenancy',       db.tenancy_model],
                ['Region',        db.region_display ?? db.region],
                ['vCPU / RAM',    `${db.vcpus} vCPU / ${fmtMem(db.memory_mb)}`],
                ['Storage',       `${db.storage_gb} GB (${db.current_storage_gb.toFixed(1)} GB used)`],
                ['Replicas',      String(db.read_replicas)],
                ['Public Access', db.publicly_accessible ? 'Yes' : 'No'],
                ['Backups',       db.backup_enabled ? `Enabled (${db.backup_retention_days} day retention)` : 'Disabled'],
                ['Created',       db.created_at ? new Date(db.created_at).toLocaleString() : '—'],
              ].map(([k, v]) => (
                <Box key={k} display="flex" justifyContent="space-between" py={.4} sx={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,.04)' : '#F9FAFB'}` }}>
                  <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,.5)' : '#9CA3AF', minWidth: 130 }}>{k}</Typography>
                  <Typography variant="caption" fontWeight={600} color={isDark ? '#ffffff' : '#0A0F1F'} textAlign="right">{v}</Typography>
                </Box>
              ))}
            </SCard>
            {/* Allowed IPs */}
            {db.allowed_ips !== undefined && (
              <SCard isDark={isDark}>
                <Typography fontWeight={700} fontSize=".9rem" color={isDark ? '#ffffff' : '#0A0F1F'} mb={1}>Allowed IP Addresses</Typography>
                {(db.allowed_ips ?? []).length === 0 ? (
                  <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,.4)' : '#9CA3AF' }}>All IPs allowed (not restricted)</Typography>
                ) : (
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {(db.allowed_ips ?? []).map(ip => <Chip key={ip} label={ip} size="small" sx={{ bgcolor: isDark ? 'rgba(255,255,255,.08)' : '#F3F4F6', color: isDark ? '#ffffff' : '#374151' }} />)}
                  </Stack>
                )}
              </SCard>
            )}
          </>
        )}
        {tab === 1 && <CredentialsTab db={db} isDark={isDark} />}
        {tab === 2 && <BackupsTab db={db} isDark={isDark} />}
        {tab === 3 && <MetricsTab db={db} isDark={isDark} />}
      </Box>

      {/* Migrate modal */}
      <MigrateDatabaseModal open={migrateOpen} source={db} onClose={() => setMigrate(false)} />

      {/* Delete confirm */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { bgcolor: isDark ? '#132336' : '#ffffff', borderRadius: '12px', border: `1px solid ${border}` } }}>
        <DialogTitle sx={{ color: isDark ? '#ffffff' : '#0A0F1F', fontWeight: 700 }}>Delete database?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,.65)' : '#6B7280' }}>
            <strong style={{ color: isDark ? '#ffffff' : '#0A0F1F' }}>{db.name}</strong> and all its data will be permanently deleted. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteOpen(false)} sx={{ textTransform: 'none', color: isDark ? 'rgba(255,255,255,.6)' : '#6B7280' }}>Cancel</Button>
          <Button onClick={doDelete} variant="contained" color="error" disabled={deleting}
            startIcon={deleting ? <CircularProgress size={14} color="inherit" /> : undefined}
            sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 600 }}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ onCreate, isDark }: { onCreate: () => void; isDark: boolean }) {
  return (
    <Box sx={{ textAlign: 'center', py: 10, px: 3 }}>
      <Box sx={{ width: 64, height: 64, bgcolor: isDark ? 'rgba(255,255,255,.06)' : '#F3F4F6', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
        <TerminalIcon sx={{ fontSize: '2rem', color: isDark ? 'rgba(255,255,255,.3)' : '#D1D5DB' }} />
      </Box>
      <Typography fontWeight={700} fontSize="1.05rem" color={isDark ? '#ffffff' : '#0A0F1F'} mb={.75}>No databases yet</Typography>
      <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,.5)' : '#9CA3AF', mb: 3, maxWidth: 340, mx: 'auto' }}>
        Deploy PostgreSQL, MySQL, MongoDB, Redis and more in seconds. Fully managed, auto-backed-up, and SSL-secured.
      </Typography>
      <Button variant="contained" startIcon={<AddIcon />} onClick={onCreate}
        sx={{ bgcolor: '#18366A', '&:hover': { bgcolor: '#102548' }, textTransform: 'none', borderRadius: '8px', fontWeight: 600 }}>
        Create First Database
      </Button>
    </Box>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const DatabasePage: React.FC = () => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [databases, setDatabases] = useState<ManagedDatabase[]>([]);
  const [selected, setSelected]   = useState<ManagedDatabase | null>(null);
  const [loading, setLoading]     = useState(true);
  const [createOpen, setCreate]   = useState(false);
  const [toast, setToast]         = useState('');

  const border  = isDark ? 'rgba(255,255,255,.08)' : '#E5E7EB';
  const sideBg  = isDark ? '#0F1E30' : '#F9FAFB';
  const mainBg  = isDark ? '#0D1826' : '#ffffff';

  const load = useCallback(() => {
    setLoading(true);
    databaseApi.list()
      .then(r => {
        // DRF may return a paginated object { results: [...] } or a plain array
        const list: ManagedDatabase[] = Array.isArray(r.data)
          ? r.data
          : (r.data as any).results ?? [];
        setDatabases(list);
        setSelected(s => s ? list.find(d => d.id === s.id) ?? null : null);
      })
      .catch(() => setDatabases([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreated = (db: ManagedDatabase, password: string) => {
    setCreate(false);
    load();
    setToast(`Database "${db.name}" created! Admin password: ${password}`);
    // Fetch full detail after creation
    databaseApi.get(db.id).then(r => setSelected(r.data)).catch(() => setSelected(db));
  };

  const handleSelect = (db: ManagedDatabase) => {
    databaseApi.get(db.id).then(r => setSelected(r.data)).catch(() => setSelected(db));
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: mainBg }}>
      {/* Page header */}
      <Box sx={{ bgcolor: isDark ? '#0F1E30' : '#ffffff', borderBottom: `1px solid ${border}`, px: 4, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography fontWeight={800} fontSize="1.25rem" color={isDark ? '#ffffff' : '#0A0F1F'}>Managed Databases</Typography>
          <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,.5)' : '#6B7280', mt: .25 }}>
            PostgreSQL · MySQL · MariaDB · MongoDB · Redis · ClickHouse · Cassandra
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button startIcon={<RefreshIcon />} onClick={load} disabled={loading}
            sx={{ textTransform: 'none', color: isDark ? '#ffffff' : '#374151', borderColor: border, '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.04)' } }}
            variant="outlined" size="small">
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreate(true)}
            sx={{ bgcolor: '#18366A', '&:hover': { bgcolor: '#102548' }, textTransform: 'none', borderRadius: '8px', fontWeight: 600 }}>
            Create Database
          </Button>
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ display: 'flex', height: 'calc(100vh - 88px)' }}>
        {/* Left: DB list */}
        <Box sx={{ width: { xs: '100%', md: 320 }, flexShrink: 0, borderRight: `1px solid ${border}`, bgcolor: sideBg, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {/* Stats bar */}
          <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${border}`, display: 'flex', gap: 2 }}>
            {[
              { label: 'Total', value: databases.length },
              { label: 'Running', value: databases.filter(d => d.status === 'running').length, color: '#10B981' },
              { label: 'Error', value: databases.filter(d => d.status === 'error').length, color: '#EF4444' },
            ].map(s => (
              <Box key={s.label} textAlign="center">
                <Typography fontWeight={800} fontSize="1.1rem" color={s.color ?? (isDark ? '#ffffff' : '#0A0F1F')}>{s.value}</Typography>
                <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,.4)' : '#9CA3AF' }}>{s.label}</Typography>
              </Box>
            ))}
          </Box>
          {loading ? (
            <Box p={2}>{[1,2,3].map(k => <Skeleton key={k} height={70} sx={{ mb: 1, bgcolor: isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.05)', borderRadius: 2 }} />)}</Box>
          ) : databases.length === 0 ? (
            <EmptyState onCreate={() => setCreate(true)} isDark={isDark} />
          ) : (
            databases.map(db => (
              <DBCard key={db.id} db={db} selected={selected?.id === db.id} onClick={() => handleSelect(db)} isDark={isDark} />
            ))
          )}
        </Box>

        {/* Right: Detail */}
        <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', bgcolor: isDark ? '#0D1826' : '#ffffff' }}>
          {selected ? (
            <DatabaseDetail
              db={selected}
              isDark={isDark}
              onDelete={() => { setSelected(null); load(); }}
              onRefresh={() => { databaseApi.get(selected.id).then(r => setSelected(r.data)).catch(() => {}); }}
            />
          ) : (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box textAlign="center">
                <TerminalIcon sx={{ fontSize: '3rem', color: isDark ? 'rgba(255,255,255,.12)' : '#E5E7EB', mb: 1.5 }} />
                <Typography fontWeight={600} color={isDark ? 'rgba(255,255,255,.3)' : '#9CA3AF'} fontSize=".9rem">
                  {databases.length > 0 ? 'Select a database to view details' : 'Create your first database'}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Create modal */}
      <CreateDatabaseModal open={createOpen} onClose={() => setCreate(false)} onSuccess={handleCreated} />

      {/* Toast */}
      <Snackbar open={!!toast} autoHideDuration={30000} onClose={() => setToast('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" onClose={() => setToast('')} sx={{ maxWidth: 500, wordBreak: 'break-all' }}>{toast}</Alert>
      </Snackbar>
    </Box>
  );
};

export default DatabasePage;
