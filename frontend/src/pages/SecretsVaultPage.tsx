// AtonixCorp Cloud – Secrets Vault Page
// Store, rotate, version, and audit secrets with lifecycle management

import React, { useState } from 'react';
import {
  Box, Typography, Stack, Chip, Tabs, Tab,
  Table, TableHead, TableRow, TableCell, TableBody,
  Button, IconButton, Tooltip, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, InputAdornment, Alert,
} from '@mui/material';
import ShieldIcon      from '@mui/icons-material/Shield';
import AddIcon         from '@mui/icons-material/Add';
import RefreshIcon     from '@mui/icons-material/Refresh';
import SearchIcon      from '@mui/icons-material/Search';
import AutorenewIcon   from '@mui/icons-material/Autorenew';
import DeleteIcon      from '@mui/icons-material/Delete';
import HistoryIcon     from '@mui/icons-material/History';
import VisibilityIcon  from '@mui/icons-material/Visibility';
import LockIcon        from '@mui/icons-material/Lock';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import WarningIcon     from '@mui/icons-material/Warning';
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

function isExpiringSoon(d: string | null) {
  if (!d) return false;
  const diff = new Date(d).getTime() - Date.now();
  return diff > 0 && diff < 30 * 86400000;
}

const SECRET_TYPE_COLORS: Record<string, string> = {
  text: BRAND, credential: PURPLE, api_key: WARNING, certificate: SUCCESS, ssh_key: '#06B6D4', database: DANGER,
};

const MOCK_SECRETS = [
  { id: 1, secret_id: 'atnx-sec-a1b2c3', name: 'prod/backend/db-password',      secret_type: 'database',    status: 'active', rotation_enabled: true,  rotation_interval_days: 30, version_count: 4, last_rotated_at: '2026-02-01', expiry_date: null, created_at: '2025-02-01' },
  { id: 2, secret_id: 'atnx-sec-d4e5f6', name: 'prod/integrations/stripe-key',   secret_type: 'api_key',     status: 'active', rotation_enabled: false, rotation_interval_days: null, version_count: 2, last_rotated_at: '2026-01-15', expiry_date: '2026-03-15', created_at: '2025-01-15' },
  { id: 3, secret_id: 'atnx-sec-g7h8i9', name: 'prod/ssl/wildcard-cert',          secret_type: 'certificate', status: 'active', rotation_enabled: true,  rotation_interval_days: 365, version_count: 3, last_rotated_at: '2025-11-01', expiry_date: '2026-11-01', created_at: '2024-11-01' },
  { id: 4, secret_id: 'atnx-sec-j0k1l2', name: 'prod/services/jwt-secret',        secret_type: 'text',        status: 'active', rotation_enabled: true,  rotation_interval_days: 90,  version_count: 6, last_rotated_at: '2026-01-05', expiry_date: null, created_at: '2024-07-05' },
  { id: 5, secret_id: 'atnx-sec-m3n4o5', name: 'prod/infra/ssh-deploy-key',       secret_type: 'ssh_key',     status: 'active', rotation_enabled: false, rotation_interval_days: null, version_count: 1, last_rotated_at: null, expiry_date: '2026-03-10', created_at: '2025-03-10' },
  { id: 6, secret_id: 'atnx-sec-p6q7r8', name: 'dev/backend/dev-password',        secret_type: 'credential',  status: 'deprecated', rotation_enabled: false, rotation_interval_days: null, version_count: 2, last_rotated_at: '2025-06-01', expiry_date: '2026-02-28', created_at: '2025-01-01' },
];

const MOCK_VERSIONS = [
  { version: 4, secret: 'atnx-sec-a1b2c3', status: 'current', created_at: '2026-02-01', created_by: 'auto-rotation', stage: 'ATNXCURRENT' },
  { version: 3, secret: 'atnx-sec-a1b2c3', status: 'previous', created_at: '2026-01-01', created_by: 'auto-rotation', stage: 'ATNXPREVIOUS' },
  { version: 2, secret: 'atnx-sec-a1b2c3', status: 'deprecated', created_at: '2025-12-01', created_by: 'auto-rotation', stage: 'ATNXDEPRECATED' },
];

const MOCK_ACCESS_LOGS = [
  { id: 1, secret: 'prod/backend/db-password',  event_type: 'GetSecretValue', accessor: 'backend/services/db', decision: 'allow', ip: '10.0.1.5', timestamp: '2026-02-27T11:10:00Z' },
  { id: 2, secret: 'prod/integrations/stripe-key', event_type: 'GetSecretValue', accessor: 'backend/services/billing', decision: 'allow', ip: '10.0.1.8', timestamp: '2026-02-27T11:05:00Z' },
  { id: 3, secret: 'prod/services/jwt-secret',  event_type: 'GetSecretValue', accessor: 'backend/services/auth', decision: 'allow', ip: '10.0.1.12', timestamp: '2026-02-27T10:58:00Z' },
  { id: 4, secret: 'prod/infra/ssh-deploy-key', event_type: 'GetSecretValue', accessor: 'unknown-service', decision: 'deny', ip: '198.51.100.9', timestamp: '2026-02-27T02:40:00Z' },
];

const TABS = ['Secrets', 'Version History', 'Access Logs'];

function SummaryCards({ secrets }: { secrets: any[] }) {
  const active   = secrets.filter(s => s.status === 'active').length;
  const expiring = secrets.filter(s => isExpiringSoon(s.expiry_date)).length;
  const autoRot  = secrets.filter(s => s.rotation_enabled).length;
  const versions = secrets.reduce((a, s) => a + s.version_count, 0);
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {[
        { label: 'Active Secrets', value: active, sub: `${secrets.length} total`, color: SUCCESS },
        { label: 'Expiring Soon', value: expiring, sub: 'Within 30 days', color: expiring > 0 ? DANGER : MUTED },
        { label: 'Auto-Rotation', value: autoRot, sub: `of ${secrets.length} have it`, color: PURPLE },
        { label: 'Total Versions', value: versions, sub: 'Across all secrets', color: BRAND },
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

const SecretsVaultPage: React.FC = () => {
  const [tab, setTab]         = useState(0);
  const [search, setSearch]   = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const q = search.toLowerCase();

  const renderSecrets = () => {
    const filtered = MOCK_SECRETS.filter(s => s.name.toLowerCase().includes(q) || s.secret_id.toLowerCase().includes(q));
    const statusColor: Record<string, string> = { active: SUCCESS, deprecated: MUTED, 'pending-deletion': DANGER };
    return (
      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.85rem', color: TEXT }}>{filtered.length} secrets</Typography>
          <Button size="small" startIcon={<AddIcon />} variant="contained" onClick={() => setCreateOpen(true)}
            sx={{ fontFamily: FONT, textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', bgcolor: BRAND, '&:hover': { bgcolor: dashboardTokens.colors.brandPrimaryHover } }}>
            Store Secret
          </Button>
        </Stack>

        {MOCK_SECRETS.filter(s => isExpiringSoon(s.expiry_date)).length > 0 && (
          <Alert severity="warning" icon={<WarningIcon fontSize="small" />} sx={{ fontFamily: FONT, fontSize: '0.78rem', mb: 2 }}>
            {MOCK_SECRETS.filter(s => isExpiringSoon(s.expiry_date)).length} secret(s) expiring within 30 days. Review and rotate them.
          </Alert>
        )}

        <Table size="small">
          <TableHead>
            <TableRow>
              {['Secret Name', 'Type', 'Status', 'Version', 'Auto-Rotate', 'Expires', 'Last Rotated', ''].map(h => (
                <TableCell key={h} sx={HEAD_SX}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(s => (
              <TableRow key={s.id} sx={{ '&:hover': { bgcolor: SURFACE2 } }}>
                <TableCell sx={CELL_SX}>
                  <Stack spacing={0.2}>
                    <Typography sx={{ fontFamily: FONT, fontSize: '0.8rem', color: TEXT, fontWeight: 600 }}>{s.name}</Typography>
                    <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.68rem', color: MUTED }}>{s.secret_id}</Typography>
                  </Stack>
                </TableCell>
                <TableCell sx={CELL_SX}>
                  <Chip label={s.secret_type} size="small"
                    sx={{ fontSize: '0.65rem', height: 18, fontWeight: 700, bgcolor: `${SECRET_TYPE_COLORS[s.secret_type] || BRAND}18`, color: SECRET_TYPE_COLORS[s.secret_type] || BRAND, textTransform: 'capitalize' }} />
                </TableCell>
                <TableCell sx={CELL_SX}>
                  <Chip label={s.status} size="small"
                    sx={{ fontSize: '0.65rem', height: 18, fontWeight: 700, bgcolor: `${statusColor[s.status] || MUTED}1a`, color: statusColor[s.status] || MUTED, textTransform: 'capitalize' }} />
                </TableCell>
                <TableCell sx={{ ...CELL_SX, fontWeight: 700, color: BRAND }}>v{s.version_count}</TableCell>
                <TableCell sx={CELL_SX}>
                  {s.rotation_enabled
                    ? <Chip label={`Every ${s.rotation_interval_days}d`} size="small" sx={{ fontSize: '0.65rem', height: 18, bgcolor: `${SUCCESS}1a`, color: SUCCESS }} />
                    : <Chip label="Manual" size="small" sx={{ fontSize: '0.65rem', height: 18, bgcolor: `${MUTED}18`, color: MUTED }} />}
                </TableCell>
                <TableCell sx={{ ...CELL_SX, color: isExpiringSoon(s.expiry_date) ? DANGER : MUTED, fontWeight: isExpiringSoon(s.expiry_date) ? 700 : 400, fontSize: '0.72rem' }}>
                  {fmtDate(s.expiry_date)}
                </TableCell>
                <TableCell sx={{ ...CELL_SX, color: MUTED, fontSize: '0.72rem' }}>{fmtDate(s.last_rotated_at)}</TableCell>
                <TableCell sx={CELL_SX}>
                  <Stack direction="row" spacing={0.3}>
                    <Tooltip title="Retrieve Value"><IconButton size="small" sx={{ color: MUTED, '&:hover': { color: BRAND } }}><VisibilityIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                    <Tooltip title="Rotate"><IconButton size="small" sx={{ color: MUTED, '&:hover': { color: SUCCESS } }}><AutorenewIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton size="small" sx={{ color: MUTED, '&:hover': { color: DANGER } }}><DeleteIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth
          PaperProps={{ sx: { bgcolor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 1 } }}>
          <DialogTitle sx={{ fontFamily: FONT, fontWeight: 700, color: TEXT, fontSize: '0.95rem', borderBottom: `1px solid ${BORDER}`, pb: 1.5 }}>Store New Secret</DialogTitle>
          <DialogContent sx={{ pt: 2.5 }}>
            <Stack spacing={2}>
              <TextField label="Secret Name" size="small" fullWidth placeholder="prod/service/my-secret"
                sx={{ '& .MuiInputBase-root': { fontFamily: FONT, bgcolor: SURFACE2 } }} InputLabelProps={{ sx: { fontFamily: FONT, fontSize: '0.8rem', color: MUTED } }} />
              <TextField select label="Secret Type" defaultValue="text" size="small" fullWidth
                sx={{ '& .MuiInputBase-root': { fontFamily: FONT, bgcolor: SURFACE2 } }} InputLabelProps={{ sx: { fontFamily: FONT, fontSize: '0.8rem', color: MUTED } }}>
                {['text', 'credential', 'api_key', 'certificate', 'ssh_key', 'database'].map(t => <MenuItem key={t} value={t} sx={{ fontFamily: FONT, fontSize: '0.8rem', textTransform: 'capitalize' }}>{t}</MenuItem>)}
              </TextField>
              <TextField label="Secret Value" size="small" fullWidth multiline rows={3} type="password"
                sx={{ '& .MuiInputBase-root': { fontFamily: '"JetBrains Mono", monospace', bgcolor: SURFACE2 } }} InputLabelProps={{ sx: { fontFamily: FONT, fontSize: '0.8rem', color: MUTED } }} />
              <TextField label="Encryption Key (KMS)" size="small" fullWidth placeholder="atnx-key-..."
                sx={{ '& .MuiInputBase-root': { fontFamily: FONT, bgcolor: SURFACE2 } }} InputLabelProps={{ sx: { fontFamily: FONT, fontSize: '0.8rem', color: MUTED } }} />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ borderTop: `1px solid ${BORDER}`, px: 3, py: 1.5 }}>
            <Button onClick={() => setCreateOpen(false)} sx={{ fontFamily: FONT, textTransform: 'none', color: MUTED }}>Cancel</Button>
            <Button variant="contained" sx={{ fontFamily: FONT, textTransform: 'none', bgcolor: BRAND }} onClick={() => setCreateOpen(false)}>Store</Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };

  const renderVersions = () => (
    <Box>
      <Alert severity="info" sx={{ fontFamily: FONT, fontSize: '0.78rem', mb: 2 }}>
        Showing version history for <strong>prod/backend/db-password</strong>. Select a secret to view its full version chain.
      </Alert>
      <Table size="small">
        <TableHead>
          <TableRow>
            {['Version', 'Secret ID', 'Stage', 'Status', 'Created', 'Created By'].map(h => (
              <TableCell key={h} sx={HEAD_SX}>{h}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {MOCK_VERSIONS.map(v => {
            const stageColor: Record<string, string> = { ATNXCURRENT: SUCCESS, ATNXPREVIOUS: WARNING, ATNXDEPRECATED: MUTED };
            const statusColor: Record<string, string> = { current: SUCCESS, previous: WARNING, deprecated: MUTED };
            return (
              <TableRow key={v.version} sx={{ '&:hover': { bgcolor: SURFACE2 } }}>
                <TableCell sx={{ ...CELL_SX, fontWeight: 800, color: BRAND }}>v{v.version}</TableCell>
                <TableCell sx={{ ...CELL_SX, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.74rem', color: MUTED }}>{v.secret}</TableCell>
                <TableCell sx={CELL_SX}>
                  <Chip label={v.stage} size="small" sx={{ fontSize: '0.65rem', height: 18, fontWeight: 700, bgcolor: `${stageColor[v.stage] || MUTED}1a`, color: stageColor[v.stage] || MUTED }} />
                </TableCell>
                <TableCell sx={CELL_SX}>
                  <Chip label={v.status} size="small" sx={{ fontSize: '0.65rem', height: 18, bgcolor: `${statusColor[v.status] || MUTED}1a`, color: statusColor[v.status] || MUTED, textTransform: 'capitalize' }} />
                </TableCell>
                <TableCell sx={{ ...CELL_SX, color: MUTED, fontSize: '0.72rem' }}>{fmtDate(v.created_at)}</TableCell>
                <TableCell sx={{ ...CELL_SX, color: MUTED }}>{v.created_by}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );

  const renderAccessLogs = () => (
    <Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            {['Timestamp', 'Secret', 'Operation', 'Accessor', 'IP', 'Decision'].map(h => (
              <TableCell key={h} sx={HEAD_SX}>{h}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {MOCK_ACCESS_LOGS.map(l => (
            <TableRow key={l.id} sx={{ '&:hover': { bgcolor: SURFACE2 } }}>
              <TableCell sx={{ ...CELL_SX, color: MUTED, fontSize: '0.72rem' }}>
                {new Date(l.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </TableCell>
              <TableCell sx={{ ...CELL_SX, color: BRAND, fontSize: '0.75rem' }}>{l.secret}</TableCell>
              <TableCell sx={{ ...CELL_SX, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.74rem', color: TEXT }}>{l.event_type}</TableCell>
              <TableCell sx={{ ...CELL_SX, color: MUTED }}>{l.accessor}</TableCell>
              <TableCell sx={{ ...CELL_SX, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.72rem', color: MUTED }}>{l.ip}</TableCell>
              <TableCell sx={CELL_SX}>
                <Chip label={l.decision} size="small" sx={{ fontSize: '0.65rem', height: 18, fontWeight: 700, bgcolor: `${l.decision === 'allow' ? SUCCESS : DANGER}1a`, color: l.decision === 'allow' ? SUCCESS : DANGER }} />
              </TableCell>
            </TableRow>
          ))}
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
              <LockIcon sx={{ color: BRAND, fontSize: 22 }} />
              <Typography sx={{ fontFamily: FONT, fontWeight: 800, fontSize: '1.1rem', color: TEXT }}>
                Secrets Vault
              </Typography>
            </Stack>
            <Typography sx={{ fontFamily: FONT, fontSize: '0.78rem', color: MUTED }}>
              Encrypted secrets · Rotation · Version history · Access audit
            </Typography>
          </Stack>
          <Tooltip title="Refresh">
            <IconButton size="small" sx={{ color: MUTED }}><RefreshIcon sx={{ fontSize: 18 }} /></IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
        <SummaryCards secrets={MOCK_SECRETS} />

        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}
            sx={{ minHeight: 36, '& .MuiTab-root': { fontFamily: FONT, fontWeight: 600, fontSize: '0.78rem', textTransform: 'none', minHeight: 36, color: MUTED, py: 0 }, '& .Mui-selected': { color: BRAND }, '& .MuiTabs-indicator': { bgcolor: BRAND } }}>
            {TABS.map(t => <Tab key={t} label={t} />)}
          </Tabs>
          <TextField size="small" placeholder="Search secrets..." value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: MUTED }} /></InputAdornment>, sx: { fontFamily: FONT, fontSize: '0.8rem', bgcolor: SURFACE2 } }}
            sx={{ width: 220 }} />
        </Stack>

        <Box sx={{ bgcolor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 1, p: 2.5 }}>
          {tab === 0 && renderSecrets()}
          {tab === 1 && renderVersions()}
          {tab === 2 && renderAccessLogs()}
        </Box>
      </Box>
    </Box>
  );
};

export default SecretsVaultPage;
