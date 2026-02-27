// AtonixCorp Cloud – Zero-Trust Network Access Page
// Policies, device posture, access decisions, trust scores

import React, { useState } from 'react';
import {
  Box, Typography, Stack, Chip, Tabs, Tab,
  Table, TableHead, TableRow, TableCell, TableBody,
  Button, IconButton, Tooltip, Grid, LinearProgress,
  InputAdornment, TextField,
} from '@mui/material';
import VerifiedUserIcon  from '@mui/icons-material/VerifiedUser';
import DevicesIcon       from '@mui/icons-material/Devices';
import PolicyIcon        from '@mui/icons-material/Policy';
import HistoryIcon       from '@mui/icons-material/History';
import AddIcon           from '@mui/icons-material/Add';
import RefreshIcon       from '@mui/icons-material/Refresh';
import SearchIcon        from '@mui/icons-material/Search';
import EditIcon          from '@mui/icons-material/Edit';
import DeleteIcon        from '@mui/icons-material/Delete';
import PlayArrowIcon     from '@mui/icons-material/PlayArrow';
import StopIcon          from '@mui/icons-material/Stop';
import {
  dashboardTokens,
  dashboardSemanticColors,
} from '../styles/dashboardDesignSystem';

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

const CELL_SX = { fontFamily: FONT, fontSize: '0.8rem', color: TEXT, borderColor: BORDER, py: 1.2 };
const HEAD_SX = { fontFamily: FONT, fontSize: '0.68rem', color: MUTED, fontWeight: 700, borderColor: BORDER, py: 1, textTransform: 'uppercase' as const, letterSpacing: '0.04em' };

function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtTs(d: string) {
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const MOCK_POLICIES = [
  { id: 1, name: 'Block Unmanaged Devices', description: 'Deny access for devices not enrolled in MDM', rule_type: 'geo_block', action: 'deny', priority: 10, is_active: true, match_count: 142 },
  { id: 2, name: 'Require MFA for Admin',   description: 'Force MFA step-up for AdminRole access',      rule_type: 'mfa_challenge', action: 'challenge', priority: 20, is_active: true, match_count: 48 },
  { id: 3, name: 'Geo-Block Risk Countries', description: 'Block access from high-risk geographies',    rule_type: 'geo_block', action: 'deny', priority: 30, is_active: true, match_count: 386 },
  { id: 4, name: 'Allow Corporate Subnets',  description: 'Permit all traffic from 10.0.0.0/8',       rule_type: 'ip_allowlist', action: 'allow', priority: 5, is_active: true, match_count: 24820 },
  { id: 5, name: 'Quarantine Low-Posture',   description: 'Limit access for devices scoring < 40',    rule_type: 'posture_check', action: 'deny', priority: 15, is_active: false, match_count: 0 },
];

const MOCK_DEVICES = [
  { id: 1, device_name: 'macbook-alice-01',   device_type: 'laptop',  os_name: 'macOS', os_version: '14.3',   owner: 'alice.nguyen', is_managed: true,  is_enrolled: true,  posture_score: 96, compliance_status: 'compliant',     last_seen: '2026-02-27T10:55:00Z' },
  { id: 2, device_name: 'macbook-bob-01',     device_type: 'laptop',  os_name: 'macOS', os_version: '14.2',   owner: 'bob.smith',    is_managed: true,  is_enrolled: true,  posture_score: 88, compliance_status: 'compliant',     last_seen: '2026-02-27T10:00:00Z' },
  { id: 3, device_name: 'windows-carol-01',   device_type: 'desktop', os_name: 'Windows', os_version: '11',   owner: 'carol.jones',  is_managed: true,  is_enrolled: true,  posture_score: 72, compliance_status: 'at-risk',       last_seen: '2026-02-26T14:20:00Z' },
  { id: 4, device_name: 'iphone-dave-01',     device_type: 'mobile',  os_name: 'iOS',   os_version: '17.3',   owner: 'dave.wilson',   is_managed: false, is_enrolled: false, posture_score: 35, compliance_status: 'non-compliant',  last_seen: '2026-02-25T09:10:00Z' },
  { id: 5, device_name: 'ubuntu-svc-01',      device_type: 'server',  os_name: 'Ubuntu', os_version: '22.04', owner: 'system',       is_managed: true,  is_enrolled: true,  posture_score: 99, compliance_status: 'compliant',     last_seen: '2026-02-27T11:00:00Z' },
];

const MOCK_ACCESS_LOGS = [
  { id: 1, user: 'alice.nguyen', device: 'macbook-alice-01', source_ip: '10.0.1.5', destination: 'prod-backend:8080', policy: 'Allow Corporate Subnets', decision: 'allow', risk_score: 5,  timestamp: '2026-02-27T11:05:00Z' },
  { id: 2, user: 'bob.smith',    device: 'macbook-bob-01',   source_ip: '10.0.1.12', destination: 'prod-db:5432',    policy: 'Allow Corporate Subnets', decision: 'allow', risk_score: 8,  timestamp: '2026-02-27T10:52:00Z' },
  { id: 3, user: 'unknown',      device: 'unknown',          source_ip: '198.51.100.4', destination: 'admin:443',   policy: 'Geo-Block Risk Countries', decision: 'deny', risk_score: 95, timestamp: '2026-02-27T04:30:00Z' },
  { id: 4, user: 'carol.jones',  device: 'windows-carol-01', source_ip: '10.0.2.8',  destination: 'prod-backend:8080', policy: 'Require MFA for Admin', decision: 'mfa_challenge', risk_score: 32, timestamp: '2026-02-26T15:10:00Z' },
  { id: 5, user: 'dave.wilson',  device: 'iphone-dave-01',   source_ip: '203.0.113.5', destination: 'prod-api:443', policy: 'Block Unmanaged Devices', decision: 'deny', risk_score: 72, timestamp: '2026-02-26T08:44:00Z' },
];

const TABS = ['Policies', 'Device Posture', 'Access Log'];

function PostureBar({ score }: { score: number }) {
  const color = score >= 80 ? SUCCESS : score >= 50 ? WARNING : DANGER;
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 120 }}>
      <LinearProgress variant="determinate" value={score}
        sx={{ flexGrow: 1, height: 5, borderRadius: 4, bgcolor: `${color}22`, '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 } }} />
      <Typography sx={{ fontFamily: FONT, fontSize: '0.75rem', fontWeight: 700, color, minWidth: 28 }}>{score}</Typography>
    </Stack>
  );
}

function SummaryCards({ devices, logs }: { devices: any[]; logs: any[] }) {
  const compliant  = devices.filter(d => d.compliance_status === 'compliant').length;
  const atRisk     = devices.filter(d => d.compliance_status === 'at-risk').length;
  const nonComp    = devices.filter(d => d.compliance_status === 'non-compliant').length;
  const denied24h  = logs.filter(l => l.decision === 'deny').length;
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {[
        { label: 'Compliant Devices',    value: compliant, sub: `${devices.length} total enrolled`, color: SUCCESS },
        { label: 'At-Risk Devices',      value: atRisk,    sub: 'Review recommended',               color: WARNING },
        { label: 'Non-Compliant',        value: nonComp,   sub: 'Access restricted',                color: DANGER  },
        { label: 'Blocked Requests',     value: denied24h, sub: 'Last 24h',                          color: PURPLE  },
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

const ZeroTrustPage: React.FC = () => {
  const [tab, setTab]       = useState(0);
  const [search, setSearch] = useState('');
  const q = search.toLowerCase();

  const renderPolicies = () => {
    const filtered = MOCK_POLICIES.filter(p => p.name.toLowerCase().includes(q));
    const actionColor: Record<string, string> = { allow: SUCCESS, deny: DANGER, challenge: WARNING, mfa_challenge: WARNING };
    return (
      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.85rem', color: TEXT }}>{filtered.length} policies</Typography>
          <Button size="small" startIcon={<AddIcon />} variant="contained"
            sx={{ fontFamily: FONT, textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', bgcolor: BRAND, '&:hover': { bgcolor: dashboardTokens.colors.brandPrimaryHover } }}>
            New Policy
          </Button>
        </Stack>
        <Table size="small">
          <TableHead>
            <TableRow>
              {['Priority', 'Policy Name', 'Type', 'Action', 'Status', 'Matches', ''].map(h => (
                <TableCell key={h} sx={HEAD_SX}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.sort((a, b) => a.priority - b.priority).map(p => (
              <TableRow key={p.id} sx={{ '&:hover': { bgcolor: SURFACE2 } }}>
                <TableCell sx={{ ...CELL_SX, fontWeight: 800, color: BRAND }}>{p.priority}</TableCell>
                <TableCell sx={CELL_SX}>
                  <Typography sx={{ fontFamily: FONT, fontSize: '0.8rem', fontWeight: 600, color: TEXT }}>{p.name}</Typography>
                  <Typography sx={{ fontFamily: FONT, fontSize: '0.7rem', color: MUTED }}>{p.description}</Typography>
                </TableCell>
                <TableCell sx={{ ...CELL_SX, color: MUTED, fontSize: '0.75rem', textTransform: 'capitalize' }}>{p.rule_type.replace('_', ' ')}</TableCell>
                <TableCell sx={CELL_SX}>
                  <Chip label={p.action.replace('_', ' ')} size="small"
                    sx={{ fontSize: '0.65rem', height: 18, fontWeight: 700, bgcolor: `${actionColor[p.action]}1a`, color: actionColor[p.action], textTransform: 'capitalize' }} />
                </TableCell>
                <TableCell sx={CELL_SX}>
                  <Chip label={p.is_active ? 'Active' : 'Disabled'} size="small"
                    sx={{ fontSize: '0.65rem', height: 18, bgcolor: p.is_active ? `${SUCCESS}1a` : `${MUTED}18`, color: p.is_active ? SUCCESS : MUTED }} />
                </TableCell>
                <TableCell sx={{ ...CELL_SX, fontWeight: 700 }}>{p.match_count.toLocaleString()}</TableCell>
                <TableCell sx={CELL_SX}>
                  <Stack direction="row" spacing={0.3}>
                    <Tooltip title={p.is_active ? 'Disable' : 'Enable'}>
                      <IconButton size="small" sx={{ color: MUTED, '&:hover': { color: p.is_active ? WARNING : SUCCESS } }}>
                        {p.is_active ? <StopIcon sx={{ fontSize: 14 }} /> : <PlayArrowIcon sx={{ fontSize: 14 }} />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit"><IconButton size="small" sx={{ color: MUTED, '&:hover': { color: BRAND } }}><EditIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton size="small" sx={{ color: MUTED, '&:hover': { color: DANGER } }}><DeleteIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    );
  };

  const renderDevices = () => {
    const filtered = MOCK_DEVICES.filter(d => d.device_name.toLowerCase().includes(q) || d.owner.toLowerCase().includes(q));
    const complianceColor: Record<string, string> = { compliant: SUCCESS, 'at-risk': WARNING, 'non-compliant': DANGER };
    return (
      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.85rem', color: TEXT }}>{filtered.length} devices</Typography>
        </Stack>
        <Table size="small">
          <TableHead>
            <TableRow>
              {['Device', 'OS', 'Owner', 'Managed', 'Posture Score', 'Compliance', 'Last Seen'].map(h => (
                <TableCell key={h} sx={HEAD_SX}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(d => (
              <TableRow key={d.id} sx={{ '&:hover': { bgcolor: SURFACE2 } }}>
                <TableCell sx={CELL_SX}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <DevicesIcon sx={{ fontSize: 16, color: BRAND }} />
                    <Box>
                      <Typography sx={{ fontFamily: FONT, fontSize: '0.8rem', fontWeight: 600, color: TEXT }}>{d.device_name}</Typography>
                      <Typography sx={{ fontFamily: FONT, fontSize: '0.68rem', color: MUTED, textTransform: 'capitalize' }}>{d.device_type}</Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell sx={{ ...CELL_SX, color: MUTED }}>{d.os_name} {d.os_version}</TableCell>
                <TableCell sx={{ ...CELL_SX, color: TEXT }}>{d.owner}</TableCell>
                <TableCell sx={CELL_SX}>
                  <Chip label={d.is_managed ? 'MDM' : 'Unmanaged'} size="small"
                    sx={{ fontSize: '0.65rem', height: 18, bgcolor: d.is_managed ? `${SUCCESS}1a` : `${DANGER}1a`, color: d.is_managed ? SUCCESS : DANGER }} />
                </TableCell>
                <TableCell sx={CELL_SX}><PostureBar score={d.posture_score} /></TableCell>
                <TableCell sx={CELL_SX}>
                  <Chip label={d.compliance_status} size="small"
                    sx={{ fontSize: '0.65rem', height: 18, fontWeight: 700, bgcolor: `${complianceColor[d.compliance_status] || MUTED}1a`, color: complianceColor[d.compliance_status] || MUTED, textTransform: 'capitalize' }} />
                </TableCell>
                <TableCell sx={{ ...CELL_SX, color: MUTED, fontSize: '0.72rem' }}>{fmtTs(d.last_seen)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    );
  };

  const renderAccessLogs = () => {
    const filtered = MOCK_ACCESS_LOGS.filter(l => l.user.toLowerCase().includes(q) || l.destination.toLowerCase().includes(q));
    const decisionColor: Record<string, string> = { allow: SUCCESS, deny: DANGER, mfa_challenge: WARNING };
    return (
      <Box>
        <Table size="small">
          <TableHead>
            <TableRow>
              {['Timestamp', 'User', 'Device', 'Source IP', 'Destination', 'Policy', 'Risk', 'Decision'].map(h => (
                <TableCell key={h} sx={HEAD_SX}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(l => (
              <TableRow key={l.id} sx={{ '&:hover': { bgcolor: SURFACE2 }, bgcolor: l.decision === 'deny' ? `${DANGER}08` : undefined }}>
                <TableCell sx={{ ...CELL_SX, color: MUTED, fontSize: '0.72rem' }}>{fmtTs(l.timestamp)}</TableCell>
                <TableCell sx={{ ...CELL_SX, fontWeight: 600 }}>{l.user}</TableCell>
                <TableCell sx={{ ...CELL_SX, color: MUTED, fontSize: '0.75rem' }}>{l.device}</TableCell>
                <TableCell sx={{ ...CELL_SX, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.74rem', color: MUTED }}>{l.source_ip}</TableCell>
                <TableCell sx={{ ...CELL_SX, color: BRAND, fontSize: '0.75rem' }}>{l.destination}</TableCell>
                <TableCell sx={{ ...CELL_SX, color: MUTED, fontSize: '0.72rem' }}>{l.policy}</TableCell>
                <TableCell sx={CELL_SX}>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 20, borderRadius: 0.5,
                    bgcolor: l.risk_score >= 70 ? `${DANGER}18` : l.risk_score >= 40 ? `${WARNING}18` : `${SUCCESS}18`,
                    color: l.risk_score >= 70 ? DANGER : l.risk_score >= 40 ? WARNING : SUCCESS }}>
                    <Typography sx={{ fontFamily: FONT, fontSize: '0.7rem', fontWeight: 800 }}>{l.risk_score}</Typography>
                  </Box>
                </TableCell>
                <TableCell sx={CELL_SX}>
                  <Chip label={l.decision.replace('_', ' ')} size="small"
                    sx={{ fontSize: '0.65rem', height: 18, fontWeight: 700, bgcolor: `${decisionColor[l.decision]}1a`, color: decisionColor[l.decision], textTransform: 'capitalize' }} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: BG, pb: 6, fontFamily: FONT }}>
      <Box sx={{ bgcolor: SURFACE, borderBottom: `1px solid ${BORDER}`, px: { xs: 2, md: 4 }, py: 2.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack spacing={0.3}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <VerifiedUserIcon sx={{ color: BRAND, fontSize: 22 }} />
              <Typography sx={{ fontFamily: FONT, fontWeight: 800, fontSize: '1.1rem', color: TEXT }}>
                Zero-Trust Access
              </Typography>
            </Stack>
            <Typography sx={{ fontFamily: FONT, fontSize: '0.78rem', color: MUTED }}>
              Policies · Device posture · Access decisions · Risk scoring
            </Typography>
          </Stack>
          <Tooltip title="Refresh">
            <IconButton size="small" sx={{ color: MUTED }}><RefreshIcon sx={{ fontSize: 18 }} /></IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
        <SummaryCards devices={MOCK_DEVICES} logs={MOCK_ACCESS_LOGS} />

        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}
            sx={{ minHeight: 36, '& .MuiTab-root': { fontFamily: FONT, fontWeight: 600, fontSize: '0.78rem', textTransform: 'none', minHeight: 36, color: MUTED, py: 0 }, '& .Mui-selected': { color: BRAND }, '& .MuiTabs-indicator': { bgcolor: BRAND } }}>
            {TABS.map(t => <Tab key={t} label={t} />)}
          </Tabs>
          <TextField size="small" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: MUTED }} /></InputAdornment>, sx: { fontFamily: FONT, fontSize: '0.8rem', bgcolor: SURFACE2 } }}
            sx={{ width: 220 }} />
        </Stack>

        <Box sx={{ bgcolor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 1, p: 2.5 }}>
          {tab === 0 && renderPolicies()}
          {tab === 1 && renderDevices()}
          {tab === 2 && renderAccessLogs()}
        </Box>
      </Box>
    </Box>
  );
};

export default ZeroTrustPage;
