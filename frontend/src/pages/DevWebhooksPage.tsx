import React, { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Chip, Button, Tabs, Tab, Grid, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Select, MenuItem, FormControl, InputLabel,
  IconButton, Tooltip, Switch,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { dashboardTokens, dashboardSemanticColors } from '../styles/dashboardDesignSystem';

const T = dashboardTokens.colors;
const S = dashboardSemanticColors;

interface Webhook {
  id: string; name: string; url: string; events: string[];
  status: 'active' | 'inactive'; successRate: number; lastDelivery: string;
  secret: boolean; retries: number;
}

interface Delivery {
  id: string; webhookName: string; event: string; status: 'success' | 'failed' | 'pending';
  responseCode: number; duration: string; timestamp: string; attempt: number;
}

const WEBHOOKS: Webhook[] = [
  { id: 'wh-001', name: 'GitHub Actions Trigger', url: 'https://api.github.com/repos/atonix/hooks/dispatch', events: ['deployment.created', 'deployment.completed'], status: 'active', successRate: 99.1, lastDelivery: '2 min ago', secret: true, retries: 3 },
  { id: 'wh-002', name: 'Slack Alert Notifications', url: 'https://hooks.slack.com/services/T0X.../B0X.../xxx', events: ['alert.triggered', 'incident.created'], status: 'active', successRate: 97.8, lastDelivery: '14 min ago', secret: false, retries: 2 },
  { id: 'wh-003', name: 'PagerDuty Integration', url: 'https://events.pagerduty.com/v2/enqueue', events: ['alert.critical', 'slo.breached'], status: 'active', successRate: 100, lastDelivery: '1 hr ago', secret: true, retries: 5 },
  { id: 'wh-004', name: 'Jenkins Pipeline', url: 'https://jenkins.internal.corp/generic-webhook-trigger', events: ['container.pushed', 'deployment.created'], status: 'inactive', successRate: 88.4, lastDelivery: '3 days ago', secret: true, retries: 3 },
  { id: 'wh-005', name: 'Custom Audit Logger', url: 'https://audit.internal.corp/webhook/cloud', events: ['iam.*', 'billing.threshold'], status: 'active', successRate: 95.2, lastDelivery: '5 min ago', secret: true, retries: 1 },
];

const DELIVERIES: Delivery[] = [
  { id: 'del-001', webhookName: 'GitHub Actions Trigger', event: 'deployment.created', status: 'success', responseCode: 204, duration: '142ms', timestamp: '2026-02-27 14:33:01', attempt: 1 },
  { id: 'del-002', webhookName: 'Slack Alert Notifications', event: 'alert.triggered', status: 'success', responseCode: 200, duration: '89ms', timestamp: '2026-02-27 14:20:15', attempt: 1 },
  { id: 'del-003', webhookName: 'Custom Audit Logger', event: 'iam.CreateUser', status: 'failed', responseCode: 500, duration: '3002ms', timestamp: '2026-02-27 14:18:44', attempt: 2 },
  { id: 'del-004', webhookName: 'PagerDuty Integration', event: 'alert.critical', status: 'success', responseCode: 202, duration: '231ms', timestamp: '2026-02-27 13:55:00', attempt: 1 },
  { id: 'del-005', webhookName: 'GitHub Actions Trigger', event: 'deployment.completed', status: 'success', responseCode: 204, duration: '118ms', timestamp: '2026-02-27 13:50:32', attempt: 1 },
  { id: 'del-006', webhookName: 'Custom Audit Logger', event: 'billing.threshold', status: 'pending', responseCode: 0, duration: '—', timestamp: '2026-02-27 14:34:00', attempt: 1 },
];

const ALL_EVENTS = [
  'deployment.created', 'deployment.completed', 'deployment.failed',
  'alert.triggered', 'alert.resolved', 'alert.critical',
  'incident.created', 'incident.resolved',
  'iam.*', 'iam.CreateUser', 'iam.DeleteUser',
  'billing.threshold', 'billing.invoice',
  'slo.breached', 'slo.recovered',
  'container.pushed', 'container.deleted',
];

const deliveryStatusColor = (s: string) =>
  s === 'success' ? S.success : s === 'failed' ? S.danger : S.warning;

export default function DevWebhooksPage() {
  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ p: 3, bgcolor: T.background, minHeight: '100vh', fontFamily: dashboardTokens.typography.fontFamily }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ color: T.textPrimary, fontWeight: 700 }}>Webhooks</Typography>
          <Typography variant="body2" sx={{ color: T.textSecondary, mt: 0.3 }}>Configure outbound webhooks for CI/CD, alerts, and automation integrations</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}
          sx={{ bgcolor: T.brandPrimary, '&:hover': { bgcolor: T.brandPrimaryHover } }}>
          Add Webhook
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Active Webhooks', value: WEBHOOKS.filter(w => w.status === 'active').length, color: S.success },
          { label: 'Total Webhooks', value: WEBHOOKS.length },
          { label: 'Deliveries Today', value: DELIVERIES.length, color: T.brandPrimary },
          { label: 'Failed Deliveries', value: DELIVERIES.filter(d => d.status === 'failed').length, color: S.danger },
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
          <Tab label="Webhooks" />
          <Tab label="Delivery Log" />
          <Tab label="Event Catalog" />
        </Tabs>

        {tab === 0 && (
          <Table>
            <TableHead>
              <TableRow>
                {['Name', 'Endpoint URL', 'Events', 'Success Rate', 'Last Delivery', 'Signed', 'Retries', 'Active', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ color: T.textSecondary, fontSize: '.75rem', fontWeight: 600 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {WEBHOOKS.map(wh => (
                <TableRow key={wh.id} hover sx={{ '&:hover': { bgcolor: T.surfaceHover } }}>
                  <TableCell sx={{ color: T.textPrimary, fontWeight: 600 }}>{wh.name}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, maxWidth: 200 }}>
                      <Typography variant="caption" sx={{ color: T.textSecondary, fontFamily: 'monospace', fontSize: '.72rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {wh.url.length > 40 ? wh.url.slice(0, 40) + '…' : wh.url}
                      </Typography>
                      <ContentCopyIcon sx={{ fontSize: '.8rem', color: T.textSecondary, cursor: 'pointer', flexShrink: 0 }} onClick={() => navigator.clipboard?.writeText(wh.url)} />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.4, flexWrap: 'wrap', maxWidth: 200 }}>
                      {wh.events.slice(0, 2).map(e => (
                        <Chip key={e} label={e} size="small" sx={{ bgcolor: T.surfaceSubtle, color: T.textSecondary, fontFamily: 'monospace', fontSize: '.62rem' }} />
                      ))}
                      {wh.events.length > 2 && <Chip label={`+${wh.events.length - 2}`} size="small" sx={{ bgcolor: T.surfaceSubtle, color: T.textSecondary, fontSize: '.62rem' }} />}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: wh.successRate >= 99 ? S.success : wh.successRate >= 95 ? S.warning : S.danger, fontWeight: 600 }}>
                      {wh.successRate}%
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: T.textSecondary }}>{wh.lastDelivery}</TableCell>
                  <TableCell>
                    <Chip label={wh.secret ? 'HMAC-SHA256' : 'None'} size="small"
                      sx={{ bgcolor: wh.secret ? `${S.success}22` : T.surfaceSubtle, color: wh.secret ? S.success : T.textSecondary, fontSize: '.65rem' }} />
                  </TableCell>
                  <TableCell sx={{ color: T.textPrimary }}>{wh.retries}×</TableCell>
                  <TableCell>
                    <Switch size="small" checked={wh.status === 'active'} />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Test Webhook"><IconButton size="small" sx={{ color: S.success }}><PlayArrowIcon fontSize="small" /></IconButton></Tooltip>
                    <IconButton size="small" sx={{ color: T.textSecondary }}><EditIcon fontSize="small" /></IconButton>
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
                {['Webhook', 'Event', 'Status', 'Response Code', 'Duration', 'Attempt', 'Timestamp'].map(h => (
                  <TableCell key={h} sx={{ color: T.textSecondary, fontSize: '.75rem', fontWeight: 600 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {DELIVERIES.map(d => (
                <TableRow key={d.id} hover sx={{ bgcolor: d.status === 'failed' ? `${S.danger}08` : 'transparent', '&:hover': { bgcolor: T.surfaceHover } }}>
                  <TableCell sx={{ color: T.textPrimary, fontWeight: 600 }}>{d.webhookName}</TableCell>
                  <TableCell sx={{ color: T.textSecondary, fontFamily: 'monospace', fontSize: '.8rem' }}>{d.event}</TableCell>
                  <TableCell>
                    <Chip icon={d.status === 'success' ? <CheckCircleIcon sx={{ fontSize: '.8rem !important' }} /> : d.status === 'failed' ? <ErrorIcon sx={{ fontSize: '.8rem !important' }} /> : undefined}
                      label={d.status} size="small"
                      sx={{ bgcolor: `${deliveryStatusColor(d.status)}22`, color: deliveryStatusColor(d.status), fontSize: '.7rem' }} />
                  </TableCell>
                  <TableCell sx={{ color: d.responseCode >= 400 ? S.danger : d.responseCode === 0 ? T.textSecondary : S.success, fontWeight: 600 }}>
                    {d.responseCode || '—'}
                  </TableCell>
                  <TableCell sx={{ color: T.textSecondary }}>{d.duration}</TableCell>
                  <TableCell sx={{ color: T.textSecondary }}>{d.attempt}</TableCell>
                  <TableCell sx={{ color: T.textSecondary, fontSize: '.78rem' }}>{d.timestamp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {tab === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="body2" sx={{ color: T.textSecondary, mb: 2 }}>All subscribable events. Use wildcards like <Box component="span" sx={{ fontFamily: 'monospace', color: T.brandPrimary }}>iam.*</Box> to catch all events in a namespace.</Typography>
            <Grid container spacing={1}>
              {ALL_EVENTS.map(ev => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={ev}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, borderRadius: 1, '&:hover': { bgcolor: T.surfaceHover } }}>
                    <ContentCopyIcon sx={{ fontSize: '.8rem', color: T.textSecondary, cursor: 'pointer' }} onClick={() => navigator.clipboard?.writeText(ev)} />
                    <Typography variant="caption" sx={{ color: T.textPrimary, fontFamily: 'monospace', fontSize: '.82rem' }}>{ev}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: T.textPrimary }}>Add Webhook</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
          <TextField label="Webhook Name" fullWidth size="small" />
          <TextField label="Endpoint URL" fullWidth size="small" placeholder="https://your-server.com/webhook" />
          <FormControl size="small" fullWidth>
            <InputLabel>Events</InputLabel>
            <Select label="Events" multiple defaultValue={[]} renderValue={(sel: any) => (sel as string[]).join(', ')}>
              {ALL_EVENTS.map(ev => <MenuItem key={ev} value={ev} sx={{ fontFamily: 'monospace', fontSize: '.85rem' }}>{ev}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Secret (for HMAC signature)" fullWidth size="small" type="password" placeholder="Leave empty for no signing" />
          <FormControl size="small" fullWidth>
            <InputLabel>Max Retries</InputLabel>
            <Select label="Max Retries" defaultValue={3}>
              {[0,1,2,3,5].map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
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
