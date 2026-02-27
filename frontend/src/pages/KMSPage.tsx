// AtonixCorp Cloud – KMS (Key Management Service) Page
// Encryption keys, rotation, usage logs, scheduling deletion

import React, { useState } from 'react';
import {
  Box, Typography, Stack, Chip, Tabs, Tab,
  Table, TableHead, TableRow, TableCell, TableBody,
  Button, IconButton, Tooltip, Grid, LinearProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem,
} from '@mui/material';
import VpnKeyIcon           from '@mui/icons-material/VpnKey';
import AutorenewIcon        from '@mui/icons-material/Autorenew';
import LockIcon             from '@mui/icons-material/Lock';
import LockOpenIcon         from '@mui/icons-material/LockOpen';
import DeleteIcon           from '@mui/icons-material/Delete';
import AddIcon              from '@mui/icons-material/Add';
import RefreshIcon          from '@mui/icons-material/Refresh';
import SearchIcon           from '@mui/icons-material/Search';
import ContentCopyIcon      from '@mui/icons-material/ContentCopy';
import HistoryIcon          from '@mui/icons-material/History';
import ScheduleIcon         from '@mui/icons-material/Schedule';
import CheckCircleIcon      from '@mui/icons-material/CheckCircle';
import { InputAdornment }   from '@mui/material';
import {
  dashboardTokens,
  dashboardSemanticColors,
} from '../styles/dashboardDesignSystem';

const BG      = dashboardTokens.colors.background;
const SURFACE = dashboardTokens.colors.surface;
const SURFACE2 = dashboardTokens.colors.surfaceSubtle;
const BORDER  = dashboardTokens.colors.border;
const TEXT    = dashboardTokens.colors.textPrimary;
const MUTED   = dashboardTokens.colors.textSecondary;
const BRAND   = dashboardTokens.colors.brandPrimary;
const SUCCESS = dashboardSemanticColors.success;
const WARNING = dashboardSemanticColors.warning;
const DANGER  = dashboardSemanticColors.danger;
const PURPLE  = dashboardSemanticColors.purple;
const FONT    = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const CELL_SX = { fontFamily: FONT, fontSize: '0.8rem', color: TEXT, borderColor: BORDER, py: 1.2 };
const HEAD_SX = { fontFamily: FONT, fontSize: '0.68rem', color: MUTED, fontWeight: 700, borderColor: BORDER, py: 1, textTransform: 'uppercase' as const, letterSpacing: '0.04em' };

function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const KEY_COLORS: Record<string, string> = {
  enabled: SUCCESS, disabled: MUTED, 'pending-deletion': DANGER, pending_import: WARNING,
};

const KEY_STATUS_LABELS: Record<string, string> = {
  enabled: 'Enabled', disabled: 'Disabled', 'pending-deletion': 'Pending Deletion', pending_import: 'Pending Import',
};

const MOCK_KEYS = [
  { id: 1, key_id: 'atnx-key-a1b2c3f4', alias: 'prod/backend/db-encryption', key_type: 'SYMMETRIC_DEFAULT', key_usage: 'ENCRYPT_DECRYPT', status: 'enabled', description: 'Production database encryption key', rotation_enabled: true, next_rotation_date: '2026-09-01', created_at: '2025-09-01', deleted_at: null, encryption_count: 142800, decryption_count: 138450 },
  { id: 2, key_id: 'atnx-key-d5e6f7a8', alias: 'prod/secrets/vault-master',   key_type: 'SYMMETRIC_DEFAULT', key_usage: 'ENCRYPT_DECRYPT', status: 'enabled', description: 'Secrets vault master key', rotation_enabled: true, next_rotation_date: '2026-08-15', created_at: '2025-08-15', deleted_at: null, encryption_count: 73200, decryption_count: 71500 },
  { id: 3, key_id: 'atnx-key-b9c0d1e2', alias: 'prod/storage/backup-key',     key_type: 'SYMMETRIC_DEFAULT', key_usage: 'ENCRYPT_DECRYPT', status: 'enabled', description: 'Backup storage encryption', rotation_enabled: false, next_rotation_date: null, created_at: '2025-06-10', deleted_at: null, encryption_count: 45600, decryption_count: 44900 },
  { id: 4, key_id: 'atnx-key-f3a4b5c6', alias: 'dev/backend/test-key',        key_type: 'SYMMETRIC_DEFAULT', key_usage: 'ENCRYPT_DECRYPT', status: 'disabled', description: 'Development test key (disabled)',rotation_enabled: false, next_rotation_date: null, created_at: '2025-01-20', deleted_at: null, encryption_count: 1200, decryption_count: 1150 },
  { id: 5, key_id: 'atnx-key-e7f8a9b0', alias: 'prod/signing/jwt-key',        key_type: 'RSA_4096',          key_usage: 'SIGN_VERIFY',     status: 'enabled', description: 'JWT token signing key',      rotation_enabled: false, next_rotation_date: null, created_at: '2025-03-05', deleted_at: null, encryption_count: 0, decryption_count: 289000 },
];

const MOCK_ROTATION = [
  { id: 1, key: 'atnx-key-a1b2c3f4', alias: 'prod/backend/db-encryption', rotated_at: '2026-03-01', initiated_by: 'auto', previous_version: 2, new_version: 3 },
  { id: 2, key: 'atnx-key-a1b2c3f4', alias: 'prod/backend/db-encryption', rotated_at: '2025-09-01', initiated_by: 'auto', previous_version: 1, new_version: 2 },
  { id: 3, key: 'atnx-key-d5e6f7a8', alias: 'prod/secrets/vault-master',   rotated_at: '2026-02-15', initiated_by: 'alice.nguyen', previous_version: 1, new_version: 2 },
];

const MOCK_USAGE_LOGS = [
  { id: 1, key: 'atnx-key-a1b2c3f4', operation: 'Encrypt', requester: 'backend/services/auth', resource_arn: 'arn:atnx:s3:::prod-db-backup', timestamp: '2026-02-27T11:05:00Z' },
  { id: 2, key: 'atnx-key-a1b2c3f4', operation: 'Decrypt', requester: 'backend/services/auth', resource_arn: 'arn:atnx:s3:::prod-db-backup', timestamp: '2026-02-27T11:03:00Z' },
  { id: 3, key: 'atnx-key-d5e6f7a8', operation: 'Decrypt', requester: 'backend/services/secrets', resource_arn: 'arn:atnx:secrets:::prod/api-key', timestamp: '2026-02-27T10:58:00Z' },
  { id: 4, key: 'atnx-key-e7f8a9b0', operation: 'Sign',    requester: 'backend/services/jwt',     resource_arn: 'arn:atnx:iam:::token', timestamp: '2026-02-27T10:55:00Z' },
];

const TABS = ['Keys', 'Rotation History', 'Usage Logs'];

function SummaryCards({ keys }: { keys: any[] }) {
  const enabled   = keys.filter(k => k.status === 'enabled').length;
  const pending   = keys.filter(k => k.status === 'pending-deletion').length;
  const autoRot   = keys.filter(k => k.rotation_enabled).length;
  const totalOps  = keys.reduce((s, k) => s + k.encryption_count + k.decryption_count, 0);
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {[
        { label: 'Active Keys', value: enabled, sub: `${keys.length} total`, color: SUCCESS },
        { label: 'Pending Deletion', value: pending, sub: 'Scheduled for removal', color: DANGER },
        { label: 'Auto-Rotation', value: autoRot, sub: `of ${keys.length} keys`, color: PURPLE },
        { label: 'Total Crypto Ops', value: totalOps.toLocaleString(), sub: 'Encrypt + Decrypt + Sign', color: BRAND },
      ].map(c => (
        <Grid size={{ xs: 6, sm: 3 }} key={c.label}>
          <Box sx={{ bgcolor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 1, p: 2 }}>
            <Typography sx={{ fontFamily: FONT, fontSize: '0.68rem', color: MUTED, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>{c.label}</Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: '1.6rem', fontWeight: 800, color: TEXT, lineHeight: 1 }}>{c.value}</Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: '0.7rem', color: MUTED, mt: 0.3 }}>{c.sub}</Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}

const KMSPage: React.FC = () => {
  const [tab, setTab]       = useState(0);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [newAlias, setNewAlias]     = useState('');
  const [newType,  setNewType]      = useState('SYMMETRIC_DEFAULT');
  const [newUsage, setNewUsage]     = useState('ENCRYPT_DECRYPT');

  const q = search.toLowerCase();

  const statusColor = (s: string) => KEY_COLORS[s] || MUTED;

  const renderKeys = () => {
    const filtered = MOCK_KEYS.filter(k =>
      k.key_id.toLowerCase().includes(q) ||
      k.alias.toLowerCase().includes(q) ||
      (k.description || '').toLowerCase().includes(q)
    );
    return (
      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.85rem', color: TEXT }}>{filtered.length} keys</Typography>
          <Button size="small" startIcon={<AddIcon />} variant="contained" onClick={() => setCreateOpen(true)}
            sx={{ fontFamily: FONT, textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', bgcolor: BRAND, '&:hover': { bgcolor: dashboardTokens.colors.brandPrimaryHover } }}>
            Create Key
          </Button>
        </Stack>
        <Table size="small">
          <TableHead>
            <TableRow>
              {['Key ID / Alias', 'Type', 'Usage', 'Status', 'Auto-Rotate', 'Crypto Ops', 'Created', ''].map(h => (
                <TableCell key={h} sx={HEAD_SX}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(k => {
              const totalOps = k.encryption_count + k.decryption_count;
              return (
                <TableRow key={k.id} sx={{ '&:hover': { bgcolor: SURFACE2 } }}>
                  <TableCell sx={CELL_SX}>
                    <Stack spacing={0.2}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.75rem', color: BRAND, fontWeight: 700 }}>{k.key_id}</Typography>
                        <Tooltip title="Copy Key ID">
                          <IconButton size="small" sx={{ color: MUTED, p: 0 }}><ContentCopyIcon sx={{ fontSize: 12 }} /></IconButton>
                        </Tooltip>
                      </Stack>
                      <Typography sx={{ fontFamily: FONT, fontSize: '0.72rem', color: MUTED }}>{k.alias}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ ...CELL_SX, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.72rem', color: MUTED }}>{k.key_type}</TableCell>
                  <TableCell sx={{ ...CELL_SX, color: MUTED, fontSize: '0.75rem' }}>{k.key_usage}</TableCell>
                  <TableCell sx={CELL_SX}>
                    <Chip label={KEY_STATUS_LABELS[k.status] || k.status} size="small"
                      sx={{ fontSize: '0.65rem', height: 20, fontWeight: 700, bgcolor: `${statusColor(k.status)}1a`, color: statusColor(k.status) }} />
                  </TableCell>
                  <TableCell sx={CELL_SX}>
                    {k.rotation_enabled
                      ? <Chip icon={<CheckCircleIcon sx={{ fontSize: 10, color: `${SUCCESS}!important` }} />} label={`Next: ${fmtDate(k.next_rotation_date)}`} size="small" sx={{ fontSize: '0.65rem', height: 18, bgcolor: `${SUCCESS}1a`, color: SUCCESS }} />
                      : <Chip label="Manual" size="small" sx={{ fontSize: '0.65rem', height: 18, bgcolor: `${MUTED}18`, color: MUTED }} />}
                  </TableCell>
                  <TableCell sx={CELL_SX}>
                    <Typography sx={{ fontFamily: FONT, fontSize: '0.78rem', fontWeight: 700, color: TEXT }}>{totalOps.toLocaleString()}</Typography>
                    <Typography sx={{ fontFamily: FONT, fontSize: '0.65rem', color: MUTED }}>↑{k.encryption_count.toLocaleString()} ↓{k.decryption_count.toLocaleString()}</Typography>
                  </TableCell>
                  <TableCell sx={{ ...CELL_SX, color: MUTED, fontSize: '0.72rem' }}>{fmtDate(k.created_at)}</TableCell>
                  <TableCell sx={CELL_SX}>
                    <Stack direction="row" spacing={0.3}>
                      <Tooltip title="Rotate Now">
                        <IconButton size="small" sx={{ color: MUTED, '&:hover': { color: SUCCESS } }}><AutorenewIcon sx={{ fontSize: 14 }} /></IconButton>
                      </Tooltip>
                      <Tooltip title={k.status === 'enabled' ? 'Disable' : 'Enable'}>
                        <IconButton size="small" sx={{ color: MUTED, '&:hover': { color: k.status === 'enabled' ? WARNING : SUCCESS } }}>
                          {k.status === 'enabled' ? <LockIcon sx={{ fontSize: 14 }} /> : <LockOpenIcon sx={{ fontSize: 14 }} />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Schedule Deletion">
                        <IconButton size="small" sx={{ color: MUTED, '&:hover': { color: DANGER } }}><ScheduleIcon sx={{ fontSize: 14 }} /></IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Create Key Dialog */}
        <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth
          PaperProps={{ sx: { bgcolor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 1 } }}>
          <DialogTitle sx={{ fontFamily: FONT, fontWeight: 700, color: TEXT, fontSize: '0.95rem', borderBottom: `1px solid ${BORDER}`, pb: 1.5 }}>
            Create Encryption Key
          </DialogTitle>
          <DialogContent sx={{ pt: 2.5 }}>
            <Stack spacing={2}>
              <TextField label="Key Alias" value={newAlias} onChange={e => setNewAlias(e.target.value)} size="small" fullWidth placeholder="prod/myservice/key-name"
                sx={{ '& .MuiInputBase-root': { fontFamily: FONT, bgcolor: SURFACE2 } }}
                InputLabelProps={{ sx: { fontFamily: FONT, fontSize: '0.8rem', color: MUTED } }} />
              <TextField select label="Key Type" value={newType} onChange={e => setNewType(e.target.value)} size="small" fullWidth
                sx={{ '& .MuiInputBase-root': { fontFamily: FONT, bgcolor: SURFACE2 } }}
                InputLabelProps={{ sx: { fontFamily: FONT, fontSize: '0.8rem', color: MUTED } }}>
                {['SYMMETRIC_DEFAULT', 'RSA_2048', 'RSA_4096', 'HMAC_256'].map(t => <MenuItem key={t} value={t} sx={{ fontFamily: FONT, fontSize: '0.8rem' }}>{t}</MenuItem>)}
              </TextField>
              <TextField select label="Key Usage" value={newUsage} onChange={e => setNewUsage(e.target.value)} size="small" fullWidth
                sx={{ '& .MuiInputBase-root': { fontFamily: FONT, bgcolor: SURFACE2 } }}
                InputLabelProps={{ sx: { fontFamily: FONT, fontSize: '0.8rem', color: MUTED } }}>
                {['ENCRYPT_DECRYPT', 'SIGN_VERIFY', 'GENERATE_VERIFY_MAC'].map(u => <MenuItem key={u} value={u} sx={{ fontFamily: FONT, fontSize: '0.8rem' }}>{u}</MenuItem>)}
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ borderTop: `1px solid ${BORDER}`, px: 3, py: 1.5 }}>
            <Button onClick={() => setCreateOpen(false)} sx={{ fontFamily: FONT, textTransform: 'none', color: MUTED }}>Cancel</Button>
            <Button variant="contained" sx={{ fontFamily: FONT, textTransform: 'none', bgcolor: BRAND }} onClick={() => setCreateOpen(false)}>Create</Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };

  const renderRotation = () => (
    <Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            {['Key', 'Alias', 'Rotated At', 'Version', 'Initiated By'].map(h => (
              <TableCell key={h} sx={HEAD_SX}>{h}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {MOCK_ROTATION.map(r => (
            <TableRow key={r.id} sx={{ '&:hover': { bgcolor: SURFACE2 } }}>
              <TableCell sx={{ ...CELL_SX, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.75rem', color: BRAND }}>{r.key}</TableCell>
              <TableCell sx={{ ...CELL_SX, color: MUTED }}>{r.alias}</TableCell>
              <TableCell sx={{ ...CELL_SX, color: MUTED, fontSize: '0.72rem' }}>{fmtDate(r.rotated_at)}</TableCell>
              <TableCell sx={CELL_SX}>
                <Typography sx={{ fontFamily: FONT, fontSize: '0.78rem', color: TEXT }}>v{r.previous_version} → v{r.new_version}</Typography>
              </TableCell>
              <TableCell sx={{ ...CELL_SX, color: MUTED }}>{r.initiated_by}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );

  const renderUsageLogs = () => (
    <Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            {['Timestamp', 'Key ID', 'Operation', 'Requester', 'Resource ARN'].map(h => (
              <TableCell key={h} sx={HEAD_SX}>{h}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {MOCK_USAGE_LOGS.map(l => {
            const opColor: Record<string, string> = { Encrypt: BRAND, Decrypt: SUCCESS, Sign: PURPLE, Verify: WARNING };
            return (
              <TableRow key={l.id} sx={{ '&:hover': { bgcolor: SURFACE2 } }}>
                <TableCell sx={{ ...CELL_SX, color: MUTED, fontSize: '0.72rem' }}>
                  {new Date(l.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </TableCell>
                <TableCell sx={{ ...CELL_SX, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.74rem', color: BRAND }}>{l.key}</TableCell>
                <TableCell sx={CELL_SX}>
                  <Chip label={l.operation} size="small"
                    sx={{ fontSize: '0.65rem', height: 18, fontWeight: 700, bgcolor: `${opColor[l.operation] || MUTED}1a`, color: opColor[l.operation] || MUTED }} />
                </TableCell>
                <TableCell sx={{ ...CELL_SX, color: MUTED, fontSize: '0.75rem' }}>{l.requester}</TableCell>
                <TableCell sx={{ ...CELL_SX, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.7rem', color: MUTED }}>{l.resource_arn}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: BG, pb: 6, fontFamily: FONT }}>
      <Box sx={{ bgcolor: SURFACE, borderBottom: `1px solid ${BORDER}`, px: { xs: 2, md: 4 }, py: 2.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack spacing={0.3}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <VpnKeyIcon sx={{ color: BRAND, fontSize: 22 }} />
              <Typography sx={{ fontFamily: FONT, fontWeight: 800, fontSize: '1.1rem', color: TEXT }}>
                Key Management Service
              </Typography>
            </Stack>
            <Typography sx={{ fontFamily: FONT, fontSize: '0.78rem', color: MUTED }}>
              Encryption keys · Rotation schedules · Usage audit
            </Typography>
          </Stack>
          <Tooltip title="Refresh">
            <IconButton size="small" sx={{ color: MUTED }}><RefreshIcon sx={{ fontSize: 18 }} /></IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
        <SummaryCards keys={MOCK_KEYS} />

        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}
            sx={{ minHeight: 36, '& .MuiTab-root': { fontFamily: FONT, fontWeight: 600, fontSize: '0.78rem', textTransform: 'none', minHeight: 36, color: MUTED, py: 0 }, '& .Mui-selected': { color: BRAND }, '& .MuiTabs-indicator': { bgcolor: BRAND } }}>
            {TABS.map(t => <Tab key={t} label={t} />)}
          </Tabs>
          <TextField size="small" placeholder="Search keys..." value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: MUTED }} /></InputAdornment>, sx: { fontFamily: FONT, fontSize: '0.8rem', bgcolor: SURFACE2 } }}
            sx={{ width: 220 }} />
        </Stack>

        <Box sx={{ bgcolor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 1, p: 2.5 }}>
          {tab === 0 && renderKeys()}
          {tab === 1 && renderRotation()}
          {tab === 2 && renderUsageLogs()}
        </Box>
      </Box>
    </Box>
  );
};

export default KMSPage;
