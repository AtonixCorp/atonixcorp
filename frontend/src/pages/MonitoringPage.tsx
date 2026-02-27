import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CardHeader,
  Chip, Button, CircularProgress, Alert as MuiAlert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Select, FormControl, InputLabel, IconButton, Tooltip,
  ToggleButtonGroup, ToggleButton, LinearProgress,
  List, ListItem, ListItemText, Divider, Paper,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import SearchIcon from '@mui/icons-material/Search';
import { monitoringApi } from '../services/cloudApi';
import type {
  MonitoringOverview, ServiceHealth, Alert, AlertRule, CreateAlertRulePayload,
  Incident, CreateIncidentPayload, LogEntry, MetricPoint,
} from '../types/monitoring';
import {
  dashboardTokens,
  dashboardSemanticColors,
  dashboardStatusColors,
  dashboardPrimaryButtonSx,
} from '../styles/dashboardDesignSystem';

// ─── helpers ────────────────────────────────────────────────────────────────

function useThemeTokens() {
  return {
    panelBg: dashboardTokens.colors.background,
    cardBg: dashboardTokens.colors.surface,
    border: dashboardTokens.colors.border,
    text: dashboardTokens.colors.textPrimary,
    subtext: dashboardTokens.colors.textSecondary,
    brand: '#153d75',
  };
}

// ─── Severity / Status colour helpers ───────────────────────────────────────

const SERVICE_STATUS_COLOR: Record<string, string> = {
  ...dashboardStatusColors.monitoringService,
};

const INCIDENT_SEV_COLOR: Record<string, string> = {
  ...dashboardStatusColors.incidentSeverity,
};

const INCIDENT_STATUS_COLOR: Record<string, string> = {
  ...dashboardStatusColors.incidentStatus,
};

const LOG_LEVEL_COLOR: Record<string, string> = {
  ...dashboardStatusColors.logLevel,
};

const ALERT_STATE_COLOR: Record<string, string> = {
  ...dashboardStatusColors.alertState,
};

function StatusChip({ label, color }: { label: string; color: string }) {
  return (
    <Chip
      label={label.replace(/_/g, ' ').toUpperCase()}
      size="small"
      sx={{
        bgcolor: `${color}22`,
        color,
        fontWeight: 700,
        fontSize: '0.65rem',
        letterSpacing: '0.05em',
        border: `1px solid ${color}44`,
      }}
    />
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  const t = useThemeTokens();
  return (
    <Card sx={{ bgcolor: t.cardBg, border: `1px solid ${t.border}` }}>
      <CardContent sx={{ textAlign: 'center', p: 2, '&:last-child': { pb: 2 } }}>
        <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: color ?? t.text }}>{value}</Typography>
        <Typography variant="caption" sx={{ color: t.subtext, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</Typography>
        {sub && <Typography variant="caption" display="block" sx={{ color: t.subtext }}>{sub}</Typography>}
      </CardContent>
    </Card>
  );
}

// ─── Overview Tab ────────────────────────────────────────────────────────────

function OverviewTab({ data, loading }: { data: MonitoringOverview | null; loading: boolean }) {
  const t = useThemeTokens();
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (!data) return null;
  const { stats, service_health } = data;
  return (
    <Box>
      {/* Stat row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Overall Uptime', value: `${(stats.overall_uptime ?? 0).toFixed(2)}%`, color: dashboardSemanticColors.success },
          { label: 'Services', value: `${stats.services_operational}/${stats.services_total}`, sub: 'operational', color: dashboardSemanticColors.info },
          { label: 'Open Incidents', value: stats.open_incidents, color: stats.open_incidents > 0 ? dashboardSemanticColors.danger : t.text },
          { label: 'Firing Alerts', value: stats.firing_alerts, color: stats.firing_alerts > 0 ? dashboardSemanticColors.orange : t.text },
          { label: 'Alert Rules', value: stats.active_alert_rules, color: t.subtext },
        ].map((s) => (
          <Grid key={s.label} size={{ xs: 12, sm: 6, md: 2 }}>
            <StatCard {...s} />
          </Grid>
        ))}
      </Grid>

      {/* Service health grid */}
      <Typography variant="h6" sx={{ color: t.text, mb: 2 }}>Service Health</Typography>
      <Grid container spacing={2}>
        {(service_health ?? []).map((svc: ServiceHealth) => (
          <Grid key={svc.service} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Card sx={{ bgcolor: t.cardBg, border: `1px solid ${t.border}` }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography sx={{ color: t.text, fontWeight: 600, textTransform: 'capitalize' }}>
                    {svc.service.replace(/_/g, ' ')}
                  </Typography>
                  <StatusChip
                    label={svc.status}
                    color={SERVICE_STATUS_COLOR[svc.status] ?? dashboardSemanticColors.purple}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Typography variant="caption" sx={{ color: t.subtext }}>
                    Uptime <span style={{ color: dashboardSemanticColors.success, fontWeight: 700 }}>{(svc.uptime_pct ?? 0).toFixed(2)}%</span>
                  </Typography>
                  <Typography variant="caption" sx={{ color: t.subtext }}>
                    Latency <span style={{ color: t.text, fontWeight: 600 }}>{(svc.latency_ms ?? 0).toFixed(0)} ms</span>
                  </Typography>
                  <Typography variant="caption" sx={{ color: t.subtext }}>
                    Errors <span style={{ color: svc.error_rate > 1 ? dashboardSemanticColors.danger : t.text, fontWeight: 600 }}>{(svc.error_rate ?? 0).toFixed(2)}%</span>
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(svc.uptime_pct ?? 0, 100)}
                  sx={{
                    mt: 1,
                    bgcolor: `${SERVICE_STATUS_COLOR[svc.status]}33`,
                    '& .MuiLinearProgress-bar': { bgcolor: SERVICE_STATUS_COLOR[svc.status] ?? dashboardSemanticColors.success },
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

// Incidents Tab

const INCIDENT_STATUSES = ['open', 'investigating', 'identified', 'monitoring', 'resolved', 'postmortem'] as const;

function CreateIncidentDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const t = useThemeTokens();
  const [form, setForm] = useState<CreateIncidentPayload>({
    service: 'api',
    severity: 'sev2',
    title: '',
    summary: '',
    affected_resources: [],
  });
  const [busy, setBusy] = useState(false);

  const handle = (field: string) => (e: React.ChangeEvent<HTMLInputElement | { value: unknown }>) => {
    setForm((previous) => ({ ...previous, [field]: (e.target as any).value }));
  };

  const submit = () => {
    setBusy(true);
    monitoringApi
      .createIncident(form)
      .then(() => {
        onCreated();
        onClose();
      })
      .catch(() => {})
      .finally(() => setBusy(false));
  };

  const inputSx = {
    input: { color: t.text },
    '& .MuiInputLabel-root': { color: t.subtext },
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: t.border },
      '&:hover fieldset': { borderColor: '#153d75' },
    },
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { bgcolor: t.cardBg, color: t.text, minWidth: 480 } }}>
      <DialogTitle>New Incident</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
        <TextField label="Title" value={form.title} onChange={handle('title')} fullWidth sx={inputSx} />
        <TextField label="Summary" value={form.summary ?? ''} onChange={handle('summary')} fullWidth multiline rows={3} sx={inputSx} />
        <FormControl fullWidth sx={inputSx}>
          <InputLabel>Service</InputLabel>
          <Select value={form.service} label="Service" onChange={handle('service') as any} sx={{ color: t.text }}>
            {['api', 'compute', 'database', 'storage', 'networking', 'containers', 'email', 'dns'].map((serviceName) => (
              <MenuItem key={serviceName} value={serviceName}>{serviceName.charAt(0).toUpperCase() + serviceName.slice(1)}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth sx={inputSx}>
          <InputLabel>Severity</InputLabel>
          <Select value={form.severity} label="Severity" onChange={handle('severity') as any} sx={{ color: t.text }}>
            {['sev1', 'sev2', 'sev3', 'sev4'].map((severity) => (
              <MenuItem key={severity} value={severity}>{severity.toUpperCase()}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: t.subtext }}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={busy || !form.title} sx={dashboardPrimaryButtonSx}>
          {busy ? <CircularProgress size={16} /> : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function IncidentsTab() {
  const t = useThemeTokens();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Incident | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [updateMsg, setUpdateMsg] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    monitoringApi.listIncidents(statusFilter ? { status: statusFilter } : undefined)
      .then(r => setIncidents((r.data as any).results ?? r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const submitUpdate = () => {
    if (!selected || !newStatus) return;
    setUpdating(true);
    monitoringApi.updateIncidentStatus(selected.resource_id, newStatus, updateMsg)
      .then(() => { load(); setUpdateMsg(''); setNewStatus(''); })
      .catch(() => {})
      .finally(() => setUpdating(false));
  };

  const inputSx = { '& .MuiInputLabel-root': { color: t.subtext }, '& .MuiOutlinedInput-root': { color: t.text, '& fieldset': { borderColor: t.border } } };

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      {/* List pane */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 160, ...inputSx }}>
              <InputLabel>Status filter</InputLabel>
              <Select value={statusFilter} label="Status filter" onChange={e => setStatusFilter(e.target.value)} sx={{ color: t.text }}>
                <MenuItem value="">All</MenuItem>
                {INCIDENT_STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
            <IconButton onClick={load} sx={{ color: t.subtext }}><RefreshIcon /></IconButton>
          </Box>
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)} sx={dashboardPrimaryButtonSx}>
            New Incident
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : (
          <TableContainer component={Paper} sx={{ bgcolor: t.cardBg, border: `1px solid ${t.border}` }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['ID','Title','Service','Severity','Status','Detected'].map(h => (
                    <TableCell key={h} sx={{ color: t.subtext, borderColor: t.border, fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {incidents.map(inc => (
                  <TableRow
                    key={inc.resource_id}
                    hover
                    selected={selected?.resource_id === inc.resource_id}
                    onClick={() => setSelected(inc)}
                    sx={{ cursor: 'pointer', '& td': { borderColor: t.border }, '&.Mui-selected': { bgcolor: `${t.brand}22` } }}
                  >
                    <TableCell sx={{ color: t.subtext, fontSize: '0.7rem' }}>{inc.resource_id}</TableCell>
                    <TableCell sx={{ color: t.text, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inc.title}</TableCell>
                    <TableCell sx={{ color: t.subtext, textTransform: 'capitalize' }}>{inc.service}</TableCell>
                    <TableCell><StatusChip label={inc.severity} color={INCIDENT_SEV_COLOR[inc.severity] ?? dashboardSemanticColors.purple} /></TableCell>
                    <TableCell><StatusChip label={inc.status} color={INCIDENT_STATUS_COLOR[inc.status] ?? dashboardSemanticColors.purple} /></TableCell>
                    <TableCell sx={{ color: t.subtext, fontSize: '0.75rem' }}>{new Date(inc.detected_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                {incidents.length === 0 && (
                  <TableRow><TableCell colSpan={6} sx={{ textAlign: 'center', color: t.subtext, py: 4, borderColor: t.border }}>No incidents found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Detail pane */}
      {selected && (
        <Box sx={{ width: 340, flexShrink: 0 }}>
          <Card sx={{ bgcolor: t.cardBg, border: `1px solid ${t.border}` }}>
            <CardHeader
              title={<Typography sx={{ color: t.text, fontWeight: 700, fontSize: '0.9rem' }}>{selected.title}</Typography>}
              subheader={<Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                <StatusChip label={selected.severity} color={INCIDENT_SEV_COLOR[selected.severity]} />
                <StatusChip label={selected.status} color={INCIDENT_STATUS_COLOR[selected.status]} />
              </Box>}
            />
            <CardContent>
              {selected.summary && (
                <Typography variant="body2" sx={{ color: t.subtext, mb: 2 }}>{selected.summary}</Typography>
              )}
              {/* Updates timeline */}
              <Typography variant="caption" sx={{ color: t.subtext, fontWeight: 700, textTransform: 'uppercase' }}>Timeline</Typography>
              <List dense sx={{ maxHeight: 200, overflowY: 'auto' }}>
                {(selected.updates ?? []).map((u: any, i: number) => (
                  <React.Fragment key={i}>
                    <ListItem sx={{ px: 0, alignItems: 'flex-start' }}>
                      <ListItemText
                        primary={<Typography variant="caption" sx={{ color: t.text }}>{u.message}</Typography>}
                        secondary={<Typography variant="caption" sx={{ color: t.subtext }}>{u.author_name} · {new Date(u.created_at).toLocaleString()}</Typography>}
                      />
                    </ListItem>
                    {i < (selected.updates ?? []).length - 1 && <Divider sx={{ borderColor: t.border }} />}
                  </React.Fragment>
                ))}
              </List>

              <Divider sx={{ borderColor: t.border, my: 1.5 }} />
              <Typography variant="caption" sx={{ color: t.subtext, fontWeight: 700, textTransform: 'uppercase', display: 'block', mb: 1 }}>Update Status</Typography>
              <FormControl size="small" fullWidth sx={{ mb: 1, ...inputSx }}>
                <InputLabel>New Status</InputLabel>
                <Select value={newStatus} label="New Status" onChange={e => setNewStatus(e.target.value)} sx={{ color: t.text }}>
                  {INCIDENT_STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField
                size="small" multiline rows={2} fullWidth placeholder="Update message…"
                value={updateMsg} onChange={e => setUpdateMsg(e.target.value)}
                sx={{ mb: 1, ...inputSx }}
              />
              <Button
                variant="contained" size="small" fullWidth disabled={!newStatus || updating}
                onClick={submitUpdate} sx={dashboardPrimaryButtonSx}
              >
                {updating ? <CircularProgress size={14} /> : 'Post Update'}
              </Button>
            </CardContent>
          </Card>
        </Box>
      )}

      <CreateIncidentDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreated={load} />
    </Box>
  );
}

// ─── Alerts Tab ───────────────────────────────────────────────────────────────

function CreateAlertRuleDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const t = useThemeTokens();
  const [form, setForm] = useState<CreateAlertRulePayload>({
    name: '', service: 'api', metric: 'cpu_percent', condition: 'gt',
    threshold: 80, duration_mins: 5, severity: 'warning',
    notify_via: ['email'], notify_target: '',
  });
  const [busy, setBusy] = useState(false);

  const handle = (field: string) => (e: React.ChangeEvent<HTMLInputElement | { value: unknown }>) =>
    setForm(f => ({ ...f, [field]: (e.target as any).value }));

  const submit = () => {
    setBusy(true);
    monitoringApi.createAlertRule(form)
      .then(() => { onCreated(); onClose(); })
      .catch(() => {})
      .finally(() => setBusy(false));
  };

  const inputSx = { '& .MuiInputLabel-root': { color: t.subtext }, '& .MuiOutlinedInput-root': { color: t.text, '& fieldset': { borderColor: t.border } } };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { bgcolor: t.cardBg, color: t.text, minWidth: 500 } }}>
      <DialogTitle>Create Alert Rule</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
        <TextField label="Rule Name" value={form.name} onChange={handle('name')} fullWidth sx={inputSx} />
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <FormControl fullWidth size="small" sx={inputSx}>
              <InputLabel>Service</InputLabel>
              <Select value={form.service} label="Service" onChange={handle('service') as any} sx={{ color: t.text }}>
                {['api','compute','database','storage','networking','containers','email','dns'].map(s => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <FormControl fullWidth size="small" sx={inputSx}>
              <InputLabel>Metric</InputLabel>
              <Select value={form.metric} label="Metric" onChange={handle('metric') as any} sx={{ color: t.text }}>
                {['cpu_percent','memory_percent','disk_io_read','disk_io_write','network_in','network_out',
                  'latency_ms','error_rate','request_rate','queue_length'].map(m => (
                  <MenuItem key={m} value={m}>{m.replace(/_/g, ' ')}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <FormControl fullWidth size="small" sx={inputSx}>
              <InputLabel>Condition</InputLabel>
              <Select value={form.condition} label="Condition" onChange={handle('condition') as any} sx={{ color: t.text }}>
                {[['gt','>'],['gte','≥'],['lt','<'],['lte','≤'],['eq','=']].map(([v,l]) => (
                  <MenuItem key={v} value={v}>{l}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <TextField label="Threshold" type="number" value={form.threshold} onChange={handle('threshold')} fullWidth size="small" sx={inputSx} />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <TextField label="Duration (min)" type="number" value={form.duration_mins} onChange={handle('duration_mins')} fullWidth size="small" sx={inputSx} />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <FormControl fullWidth size="small" sx={inputSx}>
              <InputLabel>Severity</InputLabel>
              <Select value={form.severity} label="Severity" onChange={handle('severity') as any} sx={{ color: t.text }}>
                {['info','warning','critical'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField label="Notify Target" value={form.notify_target || ''} onChange={handle('notify_target')} fullWidth size="small" sx={inputSx} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: t.subtext }}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={busy || !form.name} sx={dashboardPrimaryButtonSx}>
          {busy ? <CircularProgress size={16} /> : 'Create Rule'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function AlertsTab() {
  const t = useThemeTokens();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [stateFilter, setStateFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [activePane, setActivePane] = useState<'alerts' | 'rules'>('alerts');

  const loadAlerts = useCallback(() => {
    setLoadingAlerts(true);
    monitoringApi.listAlerts(stateFilter || undefined)
      .then(r => setAlerts((r.data as any).results ?? r.data))
      .catch(() => {})
      .finally(() => setLoadingAlerts(false));
  }, [stateFilter]);

  const loadRules = useCallback(() => {
    monitoringApi.listAlertRules()
      .then(r => setRules((r.data as any).results ?? r.data))
      .catch(() => {});
  }, []);

  useEffect(() => { loadAlerts(); loadRules(); }, [loadAlerts, loadRules]);

  const toggleRule = (rule: AlertRule) => {
    const action = rule.is_enabled ? monitoringApi.disableAlertRule : monitoringApi.enableAlertRule;
    action(rule.resource_id).then(() => loadRules()).catch(() => {});
  };

  const deleteRule = (id: string) => {
    monitoringApi.deleteAlertRule(id).then(() => loadRules()).catch(() => {});
  };

  const resolve = (id: number) => monitoringApi.resolveAlert(id).then(() => loadAlerts()).catch(() => {});
  const silence = (id: number) => monitoringApi.silenceAlert(id).then(() => loadAlerts()).catch(() => {});

  const inputSx = { '& .MuiInputLabel-root': { color: t.subtext }, '& .MuiOutlinedInput-root': { color: t.text, '& fieldset': { borderColor: t.border } } };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <ToggleButtonGroup
          value={activePane} exclusive
          onChange={(_, v) => v && setActivePane(v)}
          size="small" sx={{ '& .MuiToggleButton-root': { color: t.subtext, borderColor: t.border } }}
        >
          <ToggleButton value="alerts">Fired Alerts</ToggleButton>
          <ToggleButton value="rules">Alert Rules</ToggleButton>
        </ToggleButtonGroup>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {activePane === 'alerts' && (
            <FormControl size="small" sx={{ minWidth: 140, ...inputSx }}>
              <InputLabel>State</InputLabel>
              <Select value={stateFilter} label="State" onChange={e => setStateFilter(e.target.value)} sx={{ color: t.text }}>
                <MenuItem value="">All</MenuItem>
                {['firing','resolved','silenced'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
          )}
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)} sx={dashboardPrimaryButtonSx}>
            New Rule
          </Button>
        </Box>
      </Box>

      {activePane === 'alerts' ? (
        loadingAlerts ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : (
          <TableContainer component={Paper} sx={{ bgcolor: t.cardBg, border: `1px solid ${t.border}` }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Rule','Service','Metric','Severity','State','Value','Fired At','Actions'].map(h => (
                    <TableCell key={h} sx={{ color: t.subtext, borderColor: t.border, fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {alerts.map(a => (
                  <TableRow key={a.id} sx={{ '& td': { borderColor: t.border } }}>
                    <TableCell sx={{ color: t.text }}>{a.rule_name}</TableCell>
                    <TableCell sx={{ color: t.subtext }}>{a.service}</TableCell>
                    <TableCell sx={{ color: t.subtext }}>{(a.metric ?? '').replace(/_/g,' ')}</TableCell>
                    <TableCell><StatusChip label={a.severity ?? ''} color={INCIDENT_SEV_COLOR[a.severity ?? ''] ?? dashboardSemanticColors.purple} /></TableCell>
                    <TableCell><StatusChip label={a.state} color={ALERT_STATE_COLOR[a.state] ?? dashboardSemanticColors.purple} /></TableCell>
                    <TableCell sx={{ color: t.text, fontWeight: 700 }}>{(a.value ?? 0).toFixed(2)}</TableCell>
                    <TableCell sx={{ color: t.subtext, fontSize: '0.75rem' }}>{new Date(a.fired_at).toLocaleString()}</TableCell>
                    <TableCell>
                      {a.state === 'firing' && (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Resolve"><IconButton size="small" onClick={() => resolve(a.id)} sx={{ color: dashboardSemanticColors.success }}><CheckCircleIcon fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="Silence"><IconButton size="small" onClick={() => silence(a.id)} sx={{ color: dashboardSemanticColors.purple }}><StopIcon fontSize="small" /></IconButton></Tooltip>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {alerts.length === 0 && (
                  <TableRow><TableCell colSpan={8} sx={{ textAlign: 'center', color: t.subtext, py: 4, borderColor: t.border }}>No alerts</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )
      ) : (
        <TableContainer component={Paper} sx={{ bgcolor: t.cardBg, border: `1px solid ${t.border}` }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Name','Service','Metric','Condition','Threshold','Severity','Status','Actions'].map(h => (
                  <TableCell key={h} sx={{ color: t.subtext, borderColor: t.border, fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rules.map(r => (
                <TableRow key={r.resource_id} sx={{ '& td': { borderColor: t.border } }}>
                  <TableCell sx={{ color: t.text }}>{r.name}</TableCell>
                  <TableCell sx={{ color: t.subtext }}>{r.service}</TableCell>
                  <TableCell sx={{ color: t.subtext }}>{r.metric.replace(/_/g,' ')}</TableCell>
                  <TableCell sx={{ color: t.subtext }}>{r.condition}</TableCell>
                  <TableCell sx={{ color: t.text, fontWeight: 700 }}>{r.threshold}</TableCell>
                  <TableCell><StatusChip label={r.severity} color={INCIDENT_SEV_COLOR[r.severity] ?? dashboardSemanticColors.purple} /></TableCell>
                  <TableCell>
                    <Chip label={r.is_enabled ? 'Enabled' : 'Disabled'} size="small"
                      sx={{ bgcolor: r.is_enabled ? `${dashboardSemanticColors.success}22` : `${dashboardSemanticColors.purple}22`, color: r.is_enabled ? dashboardSemanticColors.success : dashboardSemanticColors.purple, fontWeight: 700 }} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title={r.is_enabled ? 'Disable' : 'Enable'}>
                        <IconButton size="small" onClick={() => toggleRule(r)} sx={{ color: r.is_enabled ? dashboardSemanticColors.warning : dashboardSemanticColors.success }}>
                          {r.is_enabled ? <StopIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => deleteRule(r.resource_id)} sx={{ color: dashboardSemanticColors.danger }}>
                          <ErrorIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {rules.length === 0 && (
                <TableRow><TableCell colSpan={8} sx={{ textAlign: 'center', color: t.subtext, py: 4, borderColor: t.border }}>No alert rules</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <CreateAlertRuleDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreated={loadRules} />
    </Box>
  );
}

// ─── Metrics Tab ──────────────────────────────────────────────────────────────

const METRICS = [
  'cpu_percent','memory_percent','disk_io_read','disk_io_write',
  'network_in','network_out','latency_ms','error_rate','request_rate','queue_length',
];

function SparkLine({ points, color, width = 300, height = 60 }: { points: MetricPoint[]; color: string; width?: number; height?: number }) {
  if (!points.length) return null;
  const vals = points.map(p => p.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const xs = points.map((_, i) => (i / (points.length - 1)) * width);
  const ys = points.map(p => height - ((p.value - min) / range) * (height - 8) - 4);
  const d = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
  const area = `${d} L${width},${height} L0,${height} Z`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height }}>
      <path d={area} fill={`${color}22`} />
      <path d={d} stroke={color} strokeWidth="2" fill="none" />
      <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="3" fill={color} />
    </svg>
  );
}

function MetricsTab() {
  const t = useThemeTokens();
  const [resourceId, setResourceId] = useState('server-01');
  const [metric, setMetric] = useState<string>('cpu_percent');
  const [hours, setHours] = useState(24);
  const [points, setPoints] = useState<MetricPoint[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    if (!resourceId) return;
    setLoading(true);
    monitoringApi.metricSeries(resourceId, metric as any, hours)
      .then(r => {
        const series = r.data as any;
        setPoints(series.points ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [resourceId, metric, hours]);

  useEffect(() => { load(); }, [load]);

  const last = points[points.length - 1];
  const avg = points.length ? (points.reduce((s, p) => s + p.value, 0) / points.length).toFixed(2) : '—';
  const max = points.length ? Math.max(...points.map(p => p.value)).toFixed(2) : '—';

  const inputSx = { '& .MuiInputLabel-root': { color: t.subtext }, '& .MuiOutlinedInput-root': { color: t.text, '& fieldset': { borderColor: t.border } } };

  return (
    <Box>
      {/* Controls */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3, alignItems: 'center' }}>
        <TextField
          label="Resource ID" size="small" value={resourceId}
          onChange={e => setResourceId(e.target.value)} sx={{ minWidth: 180, ...inputSx }}
        />
        <FormControl size="small" sx={{ minWidth: 200, ...inputSx }}>
          <InputLabel>Metric</InputLabel>
          <Select value={metric} label="Metric" onChange={e => setMetric(e.target.value)} sx={{ color: t.text }}>
            {METRICS.map(m => <MenuItem key={m} value={m}>{m.replace(/_/g, ' ')}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120, ...inputSx }}>
          <InputLabel>Time Range</InputLabel>
          <Select value={hours} label="Time Range" onChange={e => setHours(Number(e.target.value))} sx={{ color: t.text }}>
            {[[1,'1h'],[6,'6h'],[24,'24h'],[72,'3d'],[168,'7d']].map(([v,l]) => (
              <MenuItem key={v} value={v}>{l}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <IconButton onClick={load} sx={{ color: t.subtext }}><RefreshIcon /></IconButton>
      </Box>

      {/* Chart card */}
      <Card sx={{ bgcolor: t.cardBg, border: `1px solid ${t.border}` }}>
        <CardHeader
          title={<Typography sx={{ color: t.text, fontWeight: 700 }}>{metric.replace(/_/g, ' ')} — {resourceId}</Typography>}
          subheader={
            !loading && points.length > 0 ? (
              <Box sx={{ display: 'flex', gap: 3, mt: 0.5 }}>
                <Typography variant="caption" sx={{ color: t.subtext }}>
                  Current: <span style={{ color: dashboardSemanticColors.info, fontWeight: 700 }}>{(last?.value ?? 0).toFixed(2)} {last?.unit}</span>
                </Typography>
                <Typography variant="caption" sx={{ color: t.subtext }}>
                  Avg: <span style={{ color: t.text, fontWeight: 600 }}>{avg}</span>
                </Typography>
                <Typography variant="caption" sx={{ color: t.subtext }}>
                  Max: <span style={{ color: dashboardSemanticColors.warning, fontWeight: 600 }}>{max}</span>
                </Typography>
                <Typography variant="caption" sx={{ color: t.subtext }}>
                  {points.length} points
                </Typography>
              </Box>
            ) : null
          }
        />
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
          ) : points.length > 0 ? (
            <>
              <SparkLine points={points} color={dashboardSemanticColors.info} height={120} />
              {/* X-axis labels */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                <Typography variant="caption" sx={{ color: t.subtext }}>{new Date(points[0].timestamp).toLocaleTimeString()}</Typography>
                <Typography variant="caption" sx={{ color: t.subtext }}>{new Date(points[Math.floor(points.length / 2)].timestamp).toLocaleTimeString()}</Typography>
                <Typography variant="caption" sx={{ color: t.subtext }}>{new Date(points[points.length - 1].timestamp).toLocaleTimeString()}</Typography>
              </Box>
            </>
          ) : (
            <Box sx={{ textAlign: 'center', py: 6, color: t.subtext }}>
              <Typography>No metric data. Enter a resource ID and click refresh.</Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

// ─── Logs Tab ─────────────────────────────────────────────────────────────────

function LogsTab() {
  const t = useThemeTokens();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [service, setService] = useState('');
  const [search, setSearch] = useState('');
  const [hours, setHours] = useState(1);
  const [levelFilter, setLevelFilter] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    monitoringApi.logs({ service: service || undefined, search: search || undefined, hours, limit: 200 })
      .then(r => {
        const stream = r.data as any;
        setLogs(stream.entries ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [service, search, hours]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(load, 10000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoRefresh, load]);

  const displayed = levelFilter ? logs.filter(l => l.level === levelFilter) : logs;

  const inputSx = { '& .MuiInputLabel-root': { color: t.subtext }, '& .MuiOutlinedInput-root': { color: t.text, '& fieldset': { borderColor: t.border } } };

  return (
    <Box>
      {/* Toolbar */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2, alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 150, ...inputSx }}>
          <InputLabel>Service</InputLabel>
          <Select value={service} label="Service" onChange={e => setService(e.target.value)} sx={{ color: t.text }}>
            <MenuItem value="">All</MenuItem>
            {['api','compute','database','storage','networking','containers','email','dns'].map(s => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Search" size="small" value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon sx={{ color: t.subtext, mr: 0.5, fontSize: 16 }} /> }}
          sx={{ minWidth: 200, ...inputSx }}
        />
        <FormControl size="small" sx={{ minWidth: 100, ...inputSx }}>
          <InputLabel>Hours</InputLabel>
          <Select value={hours} label="Hours" onChange={e => setHours(Number(e.target.value))} sx={{ color: t.text }}>
            {[1,6,24,72].map(h => <MenuItem key={h} value={h}>{h}h</MenuItem>)}
          </Select>
        </FormControl>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {['', 'INFO', 'WARNING', 'ERROR', 'DEBUG', 'CRITICAL'].map(l => (
            <Chip
              key={l || 'all'} label={l || 'ALL'} size="small" clickable
              onClick={() => setLevelFilter(l)}
              sx={{
                bgcolor: levelFilter === l ? (LOG_LEVEL_COLOR[l] ? `${LOG_LEVEL_COLOR[l]}33` : `${t.brand}33`) : 'transparent',
                color:   levelFilter === l ? (LOG_LEVEL_COLOR[l] ?? t.brand) : t.subtext,
                border: `1px solid ${levelFilter === l ? (LOG_LEVEL_COLOR[l] ?? t.brand) : t.border}`,
              }}
            />
          ))}
        </Box>
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
          <Tooltip title={autoRefresh ? 'Stop auto-refresh' : 'Auto-refresh every 10s'}>
            <IconButton size="small" onClick={() => setAutoRefresh(a => !a)} sx={{ color: autoRefresh ? dashboardSemanticColors.success : t.subtext }}>
              {autoRefresh ? <StopIcon /> : <PlayArrowIcon />}
            </IconButton>
          </Tooltip>
          <IconButton onClick={load} sx={{ color: t.subtext }}><RefreshIcon /></IconButton>
        </Box>
      </Box>

      {/* Log table */}
      {loading && !logs.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} sx={{ bgcolor: t.cardBg, border: `1px solid ${t.border}`, maxHeight: 520 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {['Time','Level','Service','Message'].map(h => (
                  <TableCell key={h} sx={{ bgcolor: t.cardBg, color: t.subtext, borderColor: t.border, fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {displayed.map((log, i) => (
                <TableRow key={i} sx={{ '& td': { borderColor: t.border }, fontFamily: 'monospace' }}>
                  <TableCell sx={{ color: t.subtext, fontSize: '0.72rem', whiteSpace: 'nowrap', width: 160 }}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </TableCell>
                  <TableCell sx={{ width: 80 }}>
                    <Chip
                      label={log.level} size="small"
                      icon={log.level === 'ERROR' || log.level === 'CRITICAL' ? <ErrorIcon style={{ fontSize: 12 }} /> :
                            log.level === 'WARNING' ? <WarningIcon style={{ fontSize: 12 }} /> : <InfoIcon style={{ fontSize: 12 }} />}
                      sx={{
                        bgcolor: `${LOG_LEVEL_COLOR[log.level] ?? dashboardSemanticColors.purple}22`,
                        color: LOG_LEVEL_COLOR[log.level] ?? dashboardSemanticColors.purple,
                        border: `1px solid ${LOG_LEVEL_COLOR[log.level] ?? dashboardSemanticColors.purple}44`,
                        fontSize: '0.65rem', fontWeight: 700,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: t.subtext, fontSize: '0.75rem', width: 120 }}>{log.service}</TableCell>
                  <TableCell sx={{ color: t.text, fontSize: '0.75rem', fontFamily: 'monospace' }}>{log.message}</TableCell>
                </TableRow>
              ))}
              {displayed.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: 'center', color: t.subtext, py: 4, borderColor: t.border }}>No log entries</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Typography variant="caption" sx={{ color: t.subtext, mt: 1, display: 'block' }}>
        {displayed.length} entries shown
      </Typography>
    </Box>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

interface MonitoringPageProps {
  defaultTab?: number;
}

export default function MonitoringPage({ defaultTab = 0 }: MonitoringPageProps) {
  const t = useThemeTokens();
  const [tab, setTab] = useState(defaultTab);
  const [overview, setOverview] = useState<MonitoringOverview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [error, setError] = useState('');

  // Sync active tab when the route changes (e.g. clicking Logs, Incidents etc. in sidebar)
  useEffect(() => { setTab(defaultTab); }, [defaultTab]);

  const loadOverview = useCallback(() => {
    setOverviewLoading(true);
    monitoringApi.overview()
      .then(r => setOverview(r.data as any))
      .catch(() => setError('Failed to load monitoring data.'))
      .finally(() => setOverviewLoading(false));
  }, []);

  useEffect(() => { loadOverview(); }, [loadOverview]);

  return (
    <Box sx={{ bgcolor: t.panelBg, minHeight: '100vh', p: 3 }}>
      {/* Refresh button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Tooltip title="Refresh">
          <IconButton onClick={loadOverview} sx={{ color: t.subtext }}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {error && <MuiAlert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</MuiAlert>}

      <Box>
        {tab === 0 && <OverviewTab data={overview} loading={overviewLoading} />}
        {tab === 1 && <IncidentsTab />}
        {tab === 2 && <AlertsTab />}
        {tab === 3 && <MetricsTab />}
        {tab === 4 && <LogsTab />}
      </Box>
    </Box>
  );
}
