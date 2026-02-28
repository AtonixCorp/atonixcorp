import React, { useState } from 'react';
import {
  Box, Typography, Paper, Grid, Button, Chip, Tabs, Tab,
  Table, TableHead, TableRow, TableCell, TableBody, LinearProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select,
  MenuItem, FormControl, InputLabel, IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { dashboardTokens, dashboardSemanticColors } from '../styles/dashboardDesignSystem';

const T = dashboardTokens.colors;
const S = dashboardSemanticColors;

interface SandboxEnv {
  id: string; name: string; owner: string; stack: string;
  status: 'running' | 'stopped' | 'provisioning'; cpuUsed: number;
  ramUsed: number; expiresIn: string; url: string; mockAPIs: number;
}

const ENVS: SandboxEnv[] = [
  { id: 'sbx-001', name: 'Feature/auth-refactor', owner: 'James Liu', stack: 'Node.js + PostgreSQL', status: 'running', cpuUsed: 24, ramUsed: 38, expiresIn: '2d 4h', url: 'https://sbx-001.sandbox.atonix.dev', mockAPIs: 3 },
  { id: 'sbx-002', name: 'API Gateway v2 Testing', owner: 'Sarah Chen', stack: 'Python FastAPI', status: 'running', cpuUsed: 8, ramUsed: 15, expiresIn: '6h', url: 'https://sbx-002.sandbox.atonix.dev', mockAPIs: 5 },
  { id: 'sbx-003', name: 'Load Test Environment', owner: 'Marcus Webb', stack: 'Go + Redis', status: 'stopped', cpuUsed: 0, ramUsed: 0, expiresIn: 'Expired', url: 'https://sbx-003.sandbox.atonix.dev', mockAPIs: 0 },
  { id: 'sbx-004', name: 'New Payment Integration', owner: 'Priya Nair', stack: 'Node.js + Stripe Mock', status: 'provisioning', cpuUsed: 0, ramUsed: 0, expiresIn: '3d', url: '', mockAPIs: 8 },
];

const MOCK_APIS = [
  { id: 'mock-001', name: 'Stripe Payments API', endpoint: '/mock/stripe', calls: 1242, status: 'active', latency: '120ms' },
  { id: 'mock-002', name: 'SendGrid Email API', endpoint: '/mock/sendgrid', calls: 89, status: 'active', latency: '45ms' },
  { id: 'mock-003', name: 'Twilio SMS API', endpoint: '/mock/twilio', calls: 34, status: 'active', latency: '88ms' },
  { id: 'mock-004', name: 'GitHub OAuth', endpoint: '/mock/github/oauth', calls: 156, status: 'active', latency: '62ms' },
  { id: 'mock-005', name: 'Internal User Service', endpoint: '/mock/users', calls: 4521, status: 'active', latency: '12ms' },
];

const statusColor = (s: string) =>
  s === 'running' ? S.success : s === 'provisioning' ? '#60A5FA' : T.textSecondary;

export default function DevSandboxPage() {
  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState(false);

  const QUOTA_USED = ENVS.filter(e => e.status === 'running').length;
  const QUOTA_LIMIT = 5;

  return (
    <Box sx={{ p: 3, bgcolor: T.background, minHeight: '100vh', fontFamily: dashboardTokens.typography.fontFamily }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ color: T.textPrimary, fontWeight: 700 }}>Developer Sandbox</Typography>
          <Typography variant="body2" sx={{ color: T.textSecondary, mt: 0.3 }}>Ephemeral test environments, mock APIs, and isolated dev spaces</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}
          sx={{ bgcolor: T.brandPrimary, '&:hover': { bgcolor: T.brandPrimaryHover } }}>
          New Environment
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 2 }}>
        Sandbox quota: {QUOTA_USED}/{QUOTA_LIMIT} running environments. Sandboxes auto-expire after 3 days of inactivity.
      </Alert>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Running Envs', value: ENVS.filter(e => e.status === 'running').length, color: S.success },
          { label: 'Total Envs', value: ENVS.length },
          { label: 'Mock APIs', value: MOCK_APIS.length, color: T.brandPrimary },
          { label: 'Mock API Calls', value: MOCK_APIS.reduce((a, m) => a + m.calls, 0).toLocaleString() },
        ].map(c => (
          <Grid size={{ xs: 6, sm: 3 }} key={c.label}>
            <Paper sx={{ p: 2, borderRadius: 2, border: `1px solid ${T.border}`, bgcolor: T.surface }}>
              <Typography variant="caption" sx={{ color: T.textSecondary, textTransform: 'uppercase', letterSpacing: '.06em' }}>{c.label}</Typography>
              <Typography variant="h4" sx={{ color: (c as any).color || T.textPrimary, fontWeight: 700, mt: 0.5 }}>{c.value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ borderRadius: 2, border: `1px solid ${T.border}`, bgcolor: T.surface }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, borderBottom: `1px solid ${T.border}` }}>
          <Tab label="Environments" />
          <Tab label="Mock APIs" />
          <Tab label="Usage Limits" />
        </Tabs>

        {tab === 0 && (
          <Table>
            <TableHead>
              <TableRow>
                {['Name', 'Owner', 'Stack', 'Status', 'CPU', 'RAM', 'Expires In', 'Mock APIs', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ color: T.textSecondary, fontSize: '.75rem', fontWeight: 600 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {ENVS.map(env => (
                <TableRow key={env.id} hover sx={{ '&:hover': { bgcolor: T.surfaceHover } }}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ color: T.textPrimary, fontWeight: 600 }}>{env.name}</Typography>
                      {env.url && (
                        <Typography variant="caption" sx={{ color: T.brandPrimary, fontFamily: 'monospace', fontSize: '.72rem', cursor: 'pointer' }}
                          onClick={() => navigator.clipboard?.writeText(env.url)}>{env.url.replace('https://', '')}</Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: T.textSecondary }}>{env.owner}</TableCell>
                  <TableCell sx={{ color: T.textSecondary, fontSize: '.8rem' }}>{env.stack}</TableCell>
                  <TableCell>
                    <Chip label={env.status} size="small"
                      sx={{ bgcolor: `${statusColor(env.status)}22`, color: statusColor(env.status), fontSize: '.7rem' }} />
                  </TableCell>
                  <TableCell sx={{ minWidth: 80 }}>
                    {env.status === 'running'
                      ? <Box><LinearProgress variant="determinate" value={env.cpuUsed} sx={{ height: 4, borderRadius: 2, '& .MuiLinearProgress-bar': { bgcolor: S.success } }} />
                          <Typography variant="caption" sx={{ color: T.textSecondary }}>{env.cpuUsed}%</Typography></Box>
                      : <Typography variant="caption" sx={{ color: T.textSecondary }}>—</Typography>}
                  </TableCell>
                  <TableCell sx={{ minWidth: 80 }}>
                    {env.status === 'running'
                      ? <Box><LinearProgress variant="determinate" value={env.ramUsed} sx={{ height: 4, borderRadius: 2, '& .MuiLinearProgress-bar': { bgcolor: '#60A5FA' } }} />
                          <Typography variant="caption" sx={{ color: T.textSecondary }}>{env.ramUsed}%</Typography></Box>
                      : <Typography variant="caption" sx={{ color: T.textSecondary }}>—</Typography>}
                  </TableCell>
                  <TableCell sx={{ color: env.expiresIn === 'Expired' ? S.danger : T.textSecondary }}>{env.expiresIn}</TableCell>
                  <TableCell sx={{ color: T.textPrimary }}>{env.mockAPIs}</TableCell>
                  <TableCell>
                    {env.status === 'running'
                      ? <IconButton size="small" sx={{ color: S.warning }}><StopIcon fontSize="small" /></IconButton>
                      : env.status === 'stopped'
                      ? <IconButton size="small" sx={{ color: S.success }}><PlayArrowIcon fontSize="small" /></IconButton>
                      : null}
                    <IconButton size="small" sx={{ color: S.danger }}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {tab === 1 && (
          <Table>
            <TableHead>
              <TableRow>
                {['Mock API', 'Endpoint', 'Total Calls', 'Simulated Latency', 'Status', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ color: T.textSecondary, fontSize: '.75rem', fontWeight: 600 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {MOCK_APIS.map(m => (
                <TableRow key={m.id} hover sx={{ '&:hover': { bgcolor: T.surfaceHover } }}>
                  <TableCell sx={{ color: T.textPrimary, fontWeight: 600 }}>{m.name}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="caption" sx={{ color: T.brandPrimary, fontFamily: 'monospace', fontSize: '.8rem' }}>{m.endpoint}</Typography>
                      <ContentCopyIcon sx={{ fontSize: '.8rem', color: T.textSecondary, cursor: 'pointer' }} onClick={() => navigator.clipboard?.writeText(m.endpoint)} />
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: T.textPrimary }}>{m.calls.toLocaleString()}</TableCell>
                  <TableCell sx={{ color: T.textSecondary }}>{m.latency}</TableCell>
                  <TableCell><Chip label={m.status} size="small" sx={{ bgcolor: `${S.success}22`, color: S.success, fontSize: '.7rem' }} /></TableCell>
                  <TableCell><IconButton size="small" sx={{ color: S.danger }}><DeleteIcon fontSize="small" /></IconButton></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {tab === 2 && (
          <Box sx={{ p: 3 }}>
            {[
              { label: 'Running Environments', used: QUOTA_USED, limit: QUOTA_LIMIT, unit: 'envs' },
              { label: 'Total vCPUs (sandbox)', used: 6, limit: 32, unit: 'vCPUs' },
              { label: 'Total RAM (sandbox)', used: 14, limit: 64, unit: 'GB' },
              { label: 'Mock API calls today', used: 6042, limit: 100000, unit: 'requests' },
            ].map((q, i) => {
              const pct = Math.round((q.used / q.limit) * 100);
              return (
                <Box key={i} sx={{ mb: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ color: T.textPrimary, fontWeight: 600 }}>{q.label}</Typography>
                    <Typography variant="caption" sx={{ color: T.textSecondary }}>{q.used.toLocaleString()} / {q.limit.toLocaleString()} {q.unit}</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={pct} sx={{ height: 8, borderRadius: 4,
                    '& .MuiLinearProgress-bar': { bgcolor: pct > 80 ? S.danger : pct > 60 ? S.warning : S.success } }} />
                </Box>
              );
            })}
          </Box>
        )}
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: T.textPrimary }}>New Sandbox Environment</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
          <TextField label="Environment Name" fullWidth size="small" placeholder="Feature/my-feature" />
          <FormControl size="small" fullWidth>
            <InputLabel>Tech Stack</InputLabel>
            <Select label="Tech Stack" defaultValue="">
              {['Node.js + PostgreSQL','Python FastAPI','Go + Redis','Java Spring Boot','React + Node.js'].map(s => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel>Expiry</InputLabel>
            <Select label="Expiry" defaultValue="3d">
              <MenuItem value="6h">6 hours</MenuItem>
              <MenuItem value="1d">1 day</MenuItem>
              <MenuItem value="3d">3 days (default)</MenuItem>
              <MenuItem value="7d">7 days</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: T.textSecondary }}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpen(false)}
            sx={{ bgcolor: T.brandPrimary, '&:hover': { bgcolor: T.brandPrimaryHover } }}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
