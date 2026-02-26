import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { dashboardCardSx, dashboardPrimaryButtonSx, dashboardTokens } from '../styles/dashboardDesignSystem';
import { NewDeploymentPayload } from './DevDeployAppPage';

type DeploymentStatus = 'running' | 'failed' | 'building';

interface DeploymentItem {
  id: string;
  appName: string;
  status: DeploymentStatus;
  environment: 'dev' | 'stage' | 'prod';
  lastDeployed: string;
  hostname: string;
  image: string;
  branch: string;
  owner: string;
  createdAt: string;
  cpu: string;
  memory: string;
  errors: number;
  vulnerabilities: Array<{ severity: 'Low' | 'Medium' | 'High' | 'Critical'; title: string }>;
}

const INITIAL_DEPLOYMENTS: DeploymentItem[] = [
  {
    id: 'dep-1',
    appName: 'payment-service',
    status: 'running',
    environment: 'prod',
    lastDeployed: '2026-02-23 07:10',
    hostname: 'pay.atonix.local',
    image: 'registry/atonix/payment:2.4.1',
    branch: 'main',
    owner: 'frank',
    createdAt: '2026-01-04 10:33',
    cpu: '42%',
    memory: '65%',
    errors: 1,
    vulnerabilities: [{ severity: 'Low', title: 'openssl advisory pending patch window' }],
  },
  {
    id: 'dep-2',
    appName: 'web-frontend',
    status: 'running',
    environment: 'stage',
    lastDeployed: '2026-02-23 06:41',
    hostname: 'web-stage.atonix.local',
    image: 'registry/atonix/web:1.11.3',
    branch: 'release/stage',
    owner: 'sarah',
    createdAt: '2025-12-19 13:22',
    cpu: '28%',
    memory: '49%',
    errors: 0,
    vulnerabilities: [],
  },
  {
    id: 'dep-3',
    appName: 'events-worker',
    status: 'failed',
    environment: 'dev',
    lastDeployed: '2026-02-23 05:57',
    hostname: 'events-dev.atonix.local',
    image: 'registry/atonix/events:0.9.8',
    branch: 'feature/retry-flow',
    owner: 'jane',
    createdAt: '2026-02-02 09:01',
    cpu: '0%',
    memory: '0%',
    errors: 7,
    vulnerabilities: [{ severity: 'High', title: 'base image contains unpatched package' }],
  },
];

const statusColor = (status: DeploymentStatus) => {
  if (status === 'running') return 'success';
  if (status === 'failed') return 'error';
  return 'warning';
};

const severityColor = (severity: 'Low' | 'Medium' | 'High' | 'Critical') => {
  if (severity === 'Low') return 'success';
  if (severity === 'Medium') return 'warning';
  return 'error';
};

const DevDeploymentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selected,    setSelected]   = useState<DeploymentItem | null>(null);
  const [tab,         setTab]        = useState(0);
  const [deployments, setDeployments] = useState<DeploymentItem[]>(INITIAL_DEPLOYMENTS);
  const [newItemId,   setNewItemId]  = useState<string | null>(null);

  // Pick up a newly deployed app when navigating back from the deploy wizard
  useEffect(() => {
    const raw = localStorage.getItem('ATONIX_NEW_DEPLOY');
    if (!raw) return;
    try {
      const payload: NewDeploymentPayload = JSON.parse(raw);
      localStorage.removeItem('ATONIX_NEW_DEPLOY');
      const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
      const newItem: DeploymentItem = {
        id:           `dep-${Date.now()}`,
        appName:      payload.appName,
        status:       'running',
        environment:  payload.environment,
        lastDeployed: now,
        hostname:     payload.hostname,
        image:        payload.image,
        branch:       payload.branch,
        owner:        'you',
        createdAt:    now,
        cpu:          '2%',
        memory:       '18%',
        errors:       0,
        vulnerabilities: [],
      };
      setDeployments(prev => [newItem, ...prev]);
      setNewItemId(newItem.id);
      setTimeout(() => setNewItemId(null), 6000);
    } catch {}
  }, []);

  const summary = useMemo(() => {
    const total = deployments.length;
    const running = deployments.filter((item) => item.status === 'running').length;
    const failed = deployments.filter((item) => item.status === 'failed').length;
    const lastDeploymentTime = deployments[0]?.lastDeployed || 'N/A';
    return { total, running, failed, lastDeploymentTime };
  }, [deployments]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: dashboardTokens.colors.background }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} mb={2} gap={1}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: dashboardTokens.colors.textPrimary }}>Deployments</Typography>
          <Typography variant="body2" color="text.secondary">Overview-first deployment workspace for developers.</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<RocketLaunchIcon sx={{ fontSize: '.85rem' }} />}
          onClick={() => navigate('/developer/Dashboard/deploy-app')}
          sx={dashboardPrimaryButtonSx}
        >
          Deploy new app
        </Button>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4,1fr)' }, gap: 1.5, mb: 2 }}>
        <Card sx={dashboardCardSx}><CardContent><Typography variant="caption" color="text.secondary">Total deployments</Typography><Typography variant="h6" sx={{ fontWeight: 700 }}>{summary.total}</Typography></CardContent></Card>
        <Card sx={dashboardCardSx}><CardContent><Typography variant="caption" color="text.secondary">Running</Typography><Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>{summary.running}</Typography></CardContent></Card>
        <Card sx={dashboardCardSx}><CardContent><Typography variant="caption" color="text.secondary">Failed</Typography><Typography variant="h6" sx={{ fontWeight: 700, color: summary.failed ? 'error.main' : 'text.primary' }}>{summary.failed}</Typography></CardContent></Card>
        <Card sx={dashboardCardSx}><CardContent><Typography variant="caption" color="text.secondary">Last deployment</Typography><Typography variant="h6" sx={{ fontWeight: 700 }}>{summary.lastDeploymentTime}</Typography></CardContent></Card>
      </Box>

      <Card sx={{ ...dashboardCardSx, mb: 2 }}>
        <CardContent>
          <Typography sx={{ fontWeight: 700, color: summary.failed > 0 ? 'warning.main' : 'success.main' }}>
            {summary.failed > 0 ? `${summary.failed} deployment needs attention` : 'All systems operational'}
          </Typography>
        </CardContent>
      </Card>

      <Card sx={dashboardCardSx}>
        <CardContent>
          <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Deployments List</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: dashboardTokens.colors.surfaceSubtle }}>
                  <TableCell>App Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Environment</TableCell>
                  <TableCell>Last Deployed</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deployments.map((item) => (
                  <TableRow
                    key={item.id}
                    hover
                    sx={item.id === newItemId ? {
                      animation: 'flashNew 6s ease-out',
                      '@keyframes flashNew': {
                        '0%':   { bgcolor: 'rgba(0,224,255,.18)' },
                        '40%':  { bgcolor: 'rgba(0,224,255,.10)' },
                        '100%': { bgcolor: 'transparent' },
                      },
                    } : {}}
                  >
                      <TableCell>{item.appName}{item.id === newItemId && <Chip size="small" label="NEW" sx={{ ml:1, height:15, fontSize:'.58rem', fontWeight:800, bgcolor:`rgba(0,224,255,.18)`, color: dashboardTokens.colors.brandPrimary, border:`1px solid ${dashboardTokens.colors.brandPrimary}55`, '& .MuiChip-label':{ px:.6 } }} />}</TableCell>
                    <TableCell><Chip size="small" label={item.status} color={statusColor(item.status)} /></TableCell>
                    <TableCell>{item.environment}</TableCell>
                    <TableCell>{item.lastDeployed}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" justifyContent="flex-end" gap={1}>
                        <Button size="small" onClick={() => { setSelected(item); setTab(0); }} sx={{ color: dashboardTokens.colors.brandPrimary }}>View</Button>
                        <Button size="small" variant="outlined">Logs</Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} maxWidth="md" fullWidth>
        <DialogTitle>{selected?.appName} Deployment Detail</DialogTitle>
        <DialogContent>
          <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 1 }}>
            <Tab label="Overview" />
            <Tab label="Pipelines" />
            <Tab label="Containers" />
            <Tab label="Monitoring" />
            <Tab label="Security" />
          </Tabs>
          <Divider sx={{ mb: 2 }} />

          {tab === 0 && selected && (
            <Stack gap={1.5}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3,1fr)' }, gap: 1 }}>
                <Card variant="outlined"><CardContent sx={{ py: 1.25, '&:last-child': { pb: 1.25 } }}><Typography variant="caption" color="text.secondary">Service status</Typography><Typography sx={{ fontWeight: 700, textTransform: 'capitalize' }}>{selected.status}</Typography></CardContent></Card>
                <Card variant="outlined"><CardContent sx={{ py: 1.25, '&:last-child': { pb: 1.25 } }}><Typography variant="caption" color="text.secondary">Environment</Typography><Typography sx={{ fontWeight: 700, textTransform: 'uppercase' }}>{selected.environment}</Typography></CardContent></Card>
                <Card variant="outlined"><CardContent sx={{ py: 1.25, '&:last-child': { pb: 1.25 } }}><Typography variant="caption" color="text.secondary">Release strategy</Typography><Typography sx={{ fontWeight: 700 }}>{selected.environment === 'prod' ? 'Canary 20/80' : 'Rolling update'}</Typography></CardContent></Card>
              </Box>

              <Stack gap={0.75}>
                <Typography><strong>Hostname:</strong> {selected.hostname}</Typography>
                <Typography><strong>Container image:</strong> {selected.image}</Typography>
                <Typography><strong>Git branch:</strong> {selected.branch}</Typography>
                <Typography><strong>On-call owner:</strong> {selected.owner}</Typography>
                <Typography><strong>Created:</strong> {selected.createdAt}</Typography>
                <Typography><strong>Last deployment:</strong> {selected.lastDeployed}</Typography>
              </Stack>

              <Stack direction="row" gap={1} flexWrap="wrap">
                <Button size="small" variant="contained" sx={dashboardPrimaryButtonSx}>Rollback</Button>
                <Button size="small" variant="outlined">Open runbook</Button>
                <Button size="small" variant="outlined">View incident timeline</Button>
              </Stack>
            </Stack>
          )}
          {tab === 1 && selected && (
            <Stack gap={1.25}>
              <Typography><strong>Pipeline:</strong> {selected.appName}-release</Typography>
              <Typography><strong>Latest execution:</strong> Passed checks (build, tests, security scan, deploy)</Typography>
              <Typography><strong>Approval gate:</strong> {selected.environment === 'prod' ? 'Required (2 approvers)' : 'Not required'}</Typography>
              <Typography><strong>Change window:</strong> {selected.environment === 'prod' ? 'Mon-Fri 09:00-18:00 UTC' : 'Open'}</Typography>
              <Stack direction="row" gap={1}>
                <Button size="small" variant="contained" sx={dashboardPrimaryButtonSx}>Run pipeline</Button>
                <Button size="small" variant="outlined">View logs</Button>
              </Stack>
            </Stack>
          )}
          {tab === 2 && selected && (
            <Stack gap={1.25}>
              <Typography><strong>Desired replicas:</strong> {selected.status === 'failed' ? '2' : '4'} · <strong>Ready replicas:</strong> {selected.status === 'failed' ? '1' : '4'}</Typography>
              <Typography><strong>Container health:</strong> {selected.status === 'failed' ? 'Degraded - one container crash-looping' : 'Healthy'}</Typography>
              <Typography><strong>Recent restart count:</strong> {selected.status === 'failed' ? '14 in last hour' : '0 in last hour'}</Typography>
              <Typography><strong>Pod policy:</strong> Readiness + liveness checks enabled</Typography>
              <Stack direction="row" gap={1}>
                <Button size="small" variant="outlined">Restart unhealthy pod</Button>
                <Button size="small" variant="outlined">Open kubernetes events</Button>
              </Stack>
            </Stack>
          )}
          {tab === 3 && selected && (
            <Stack gap={1.25}>
              <Typography><strong>CPU:</strong> {selected.cpu} · <strong>Memory:</strong> {selected.memory}</Typography>
              <Typography><strong>Error rate:</strong> {selected.errors > 0 ? `${selected.errors} active errors` : 'No active errors'}</Typography>
              <Typography><strong>SLO:</strong> 99.9% availability · <strong>Current:</strong> {selected.status === 'failed' ? '99.1%' : '99.95%'}</Typography>
              <Typography><strong>Latency (p95):</strong> {selected.status === 'failed' ? '730ms' : '210ms'}</Typography>
              <Stack direction="row" gap={1}>
                <Button size="small" variant="outlined">Open dashboards</Button>
                <Button size="small" variant="outlined">Create alert mute</Button>
              </Stack>
            </Stack>
          )}
          {tab === 4 && selected && (
            <Stack gap={1}>
              {selected.vulnerabilities.length === 0 ? (
                <Card variant="outlined"><CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}><Typography>No vulnerabilities found. Image is compliant with current policy baseline.</Typography></CardContent></Card>
              ) : (
                selected.vulnerabilities.map((item, index) => (
                  <Card key={index} variant="outlined">
                    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.75}>
                        <Chip size="small" label={item.severity} color={severityColor(item.severity)} />
                        <Typography variant="body2" color="text.secondary">Status: Open</Typography>
                      </Stack>
                      <Typography>{item.title}</Typography>
                    </CardContent>
                  </Card>
                ))
              )}
              <Stack direction="row" gap={1}>
                <Button size="small" variant="outlined">Open security policy</Button>
                <Button size="small" variant="outlined">Schedule patch rollout</Button>
              </Stack>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DevDeploymentsPage;
