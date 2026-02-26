import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Stack, Chip, Button,
  Table, TableHead, TableRow, TableCell, TableBody, CircularProgress,
  Alert, Tooltip, IconButton, Tabs, Tab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SettingsIcon from '@mui/icons-material/Settings';
import SyncIcon from '@mui/icons-material/Sync';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorIcon from '@mui/icons-material/Error';
import { useNavigate } from 'react-router-dom';
import { kubernetesApi, KubeConfig, KubeSyncRun } from '../services/kubernetesApi';

const SyncStatusChip: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, any> = {
    success:  { color: 'success', icon: <CheckCircleIcon fontSize="small" /> },
    failed:   { color: 'error',   icon: <ErrorIcon fontSize="small" /> },
    syncing:  { color: 'info',    icon: <SyncIcon fontSize="small" /> },
    scanning: { color: 'info',    icon: <SyncIcon fontSize="small" /> },
    pending:  { color: 'warning', icon: <WarningAmberIcon fontSize="small" /> },
    partial:  { color: 'warning', icon: <WarningAmberIcon fontSize="small" /> },
    never:    { color: 'default', icon: null },
  };
  const cfg = map[status] ?? map.never;
  return <Chip size="small" label={status} color={cfg.color} icon={cfg.icon ?? undefined} />;
};

const StatCard: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color }) => (
  <Card variant="outlined">
    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="h6" fontWeight={800} color={color}>{value}</Typography>
    </CardContent>
  </Card>
);

const DevKubernetesPage: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab]         = useState(0);
  const [configs, setConfigs]   = useState<KubeConfig[]>([]);
  const [syncRuns, setSyncRuns] = useState<KubeSyncRun[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [cfgRes, runRes] = await Promise.all([
        kubernetesApi.listConfigs(),
        kubernetesApi.allSyncRuns(),
      ]);
      // DRF may return a paginated envelope { results: [...] } or a plain array
      const cfgData = cfgRes.data as any;
      const runData = runRes.data as any;
      setConfigs(Array.isArray(cfgData) ? cfgData : (cfgData?.results ?? []));
      setSyncRuns(Array.isArray(runData) ? runData : (runData?.results ?? []));
    } catch (err: any) {
      setError(err?.response?.data?.error ?? err?.message ?? 'Failed to load Kubernetes data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const totalConfigs   = configs.length;
  const healthyConfigs = configs.filter(c => c.last_sync_status === 'success').length;
  const failedConfigs  = configs.filter(c => c.last_sync_status === 'failed').length;
  const totalWarnings  = configs.reduce((s, c) => s + (c.governance_warnings?.length ?? 0), 0);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Kubernetes</Typography>
          <Typography variant="body2" color="text.secondary">
            GitOps Kubernetes management — configure, scan, apply, and monitor per project.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchAll}><RefreshIcon /></IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<AddIcon />}
            onClick={() => navigate('/developer/Dashboard/kubernetes/setup/new')}>
            Connect Project
          </Button>
        </Stack>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px,1fr))', gap: 1.5, mb: 2 }}>
        <StatCard label="Configured Projects" value={totalConfigs} />
        <StatCard label="Healthy"  value={healthyConfigs} color="success.main" />
        <StatCard label="Failed"   value={failedConfigs}  color={failedConfigs > 0 ? 'error.main' : undefined} />
        <StatCard label="Governance Warnings" value={totalWarnings} color={totalWarnings > 0 ? 'warning.main' : undefined} />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 4 }}>
          <CircularProgress size={24} /><Typography>Loading…</Typography>
        </Box>
      ) : (
        <Card>
          <CardContent>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
              <Tab label="Projects" />
              <Tab label={`Sync History (${syncRuns.length})`} />
            </Tabs>

            {tab === 0 && (
              configs.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="h6" mb={1}>No Kubernetes projects yet</Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Connect a project to a cluster and Git repository to get started.
                  </Typography>
                  <Button variant="contained" startIcon={<AddIcon />}
                    onClick={() => navigate('/developer/Dashboard/kubernetes/setup/new')}>
                    Connect Your First Project
                  </Button>
                </Box>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Project</TableCell>
                      <TableCell>Environment</TableCell>
                      <TableCell>Namespace</TableCell>
                      <TableCell>Repository</TableCell>
                      <TableCell>Sync Status</TableCell>
                      <TableCell>Last Synced</TableCell>
                      <TableCell>Warnings</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {configs.map(cfg => (
                      <TableRow key={cfg.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{cfg.project_name || cfg.project_id}</TableCell>
                        <TableCell>
                          <Chip size="small" label={cfg.environment}
                            color={cfg.environment === 'production' ? 'error' : cfg.environment === 'staging' ? 'warning' : 'default'} />
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '.8rem' }}>{cfg.derived_namespace}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '.8rem' }}>{cfg.git_repo || '—'}</TableCell>
                        <TableCell><SyncStatusChip status={cfg.last_sync_status} /></TableCell>
                        <TableCell sx={{ fontSize: '.8rem' }}>
                          {cfg.last_synced_at ? new Date(cfg.last_synced_at).toLocaleDateString() : '—'}
                        </TableCell>
                        <TableCell>
                          {(cfg.governance_warnings?.length ?? 0) > 0
                            ? <Chip size="small" label={cfg.governance_warnings.length} color="warning" icon={<WarningAmberIcon fontSize="small" />} />
                            : <CheckCircleIcon fontSize="small" color="success" />}
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            <Tooltip title="Monitor">
                              <IconButton size="small" onClick={() => navigate(`/developer/Dashboard/kubernetes/monitor/${cfg.id}`)}>
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Setup / Sync">
                              <IconButton size="small" onClick={() => navigate(`/developer/Dashboard/kubernetes/setup/${cfg.project_id}`)}>
                                <SettingsIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )
            )}

            {tab === 1 && (
              syncRuns.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No sync runs yet.</Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Run ID</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Triggered By</TableCell>
                      <TableCell>Commit</TableCell>
                      <TableCell>Files Applied</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Started</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {syncRuns.map(run => (
                      <TableRow key={run.id} hover>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '.8rem' }}>{run.id.slice(0, 12)}</TableCell>
                        <TableCell><Chip size="small" label={run.run_type} variant="outlined" /></TableCell>
                        <TableCell>{run.triggered_by}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '.8rem' }}>
                          {run.commit_sha ? run.commit_sha.slice(0, 8) : '—'}
                        </TableCell>
                        <TableCell>{run.files_applied.length}/{run.files_selected.length}</TableCell>
                        <TableCell><SyncStatusChip status={run.status} /></TableCell>
                        <TableCell>{run.duration_seconds != null ? `${run.duration_seconds}s` : '—'}</TableCell>
                        <TableCell sx={{ fontSize: '.8rem' }}>{new Date(run.started_at).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default DevKubernetesPage;
