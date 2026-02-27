// AtonixCorp Cloud – Compliance Dashboard
// SOC 2, ISO 27001, GDPR, PCI DSS posture, controls, evidence packs

import React, { useState } from 'react';
import {
  Box, Typography, Stack, Chip, Tabs, Tab,
  Table, TableHead, TableRow, TableCell, TableBody,
  Button, IconButton, Tooltip, Grid, LinearProgress,
  InputAdornment, TextField,
} from '@mui/material';
import GppGoodIcon        from '@mui/icons-material/GppGood';
import GppBadIcon         from '@mui/icons-material/GppBad';
import AssignmentIcon     from '@mui/icons-material/Assignment';
import DownloadIcon       from '@mui/icons-material/Download';
import RefreshIcon        from '@mui/icons-material/Refresh';
import SearchIcon         from '@mui/icons-material/Search';
import CheckCircleIcon    from '@mui/icons-material/CheckCircle';
import CancelIcon         from '@mui/icons-material/Cancel';
import AccessTimeIcon     from '@mui/icons-material/AccessTime';
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

const FRAMEWORKS = [
  { id: 'soc2',      name: 'SOC 2 Type II', controls: 24, passing: 22, failing: 1, pending: 1, last_audit: '2025-12-01', next_audit: '2026-12-01', color: BRAND,  icon: '🛡️' },
  { id: 'iso27001',  name: 'ISO 27001',     controls: 18, passing: 17, failing: 0, pending: 1, last_audit: '2025-11-15', next_audit: '2026-11-15', color: SUCCESS, icon: '✅' },
  { id: 'gdpr',      name: 'GDPR',          controls: 15, passing: 13, failing: 2, pending: 0, last_audit: '2026-01-10', next_audit: '2027-01-10', color: WARNING, icon: '🇪🇺' },
  { id: 'pci_dss',   name: 'PCI DSS v4.0',  controls: 20, passing: 18, failing: 1, pending: 1, last_audit: '2025-10-20', next_audit: '2026-10-20', color: PURPLE,  icon: '💳' },
];

const MOCK_CONTROLS = [
  { id: 1, framework: 'SOC 2',  control_id: 'CC6.1', name: 'Logical and Physical Access Controls', status: 'passing', category: 'Access', last_checked: '2026-02-27', evidence_count: 8 },
  { id: 2, framework: 'SOC 2',  control_id: 'CC6.2', name: 'New User Access Provisioning',         status: 'passing', category: 'Access', last_checked: '2026-02-27', evidence_count: 5 },
  { id: 3, framework: 'SOC 2',  control_id: 'CC7.1', name: 'Vulnerability Detection',              status: 'failing', category: 'Monitor', last_checked: '2026-02-26', evidence_count: 2 },
  { id: 4, framework: 'GDPR',   control_id: 'Art.25', name: 'Data Protection by Design',           status: 'failing', category: 'Data', last_checked: '2026-02-25', evidence_count: 1 },
  { id: 5, framework: 'GDPR',   control_id: 'Art.17', name: 'Right to Erasure Implementation',     status: 'failing', category: 'Data', last_checked: '2026-02-24', evidence_count: 0 },
  { id: 6, framework: 'ISO 27001', control_id: 'A.9.1', name: 'Access Control Policy',            status: 'passing', category: 'Access', last_checked: '2026-02-27', evidence_count: 6 },
  { id: 7, framework: 'PCI DSS', control_id: 'Req 3', name: 'Protect Stored Account Data',        status: 'passing', category: 'Crypto', last_checked: '2026-02-27', evidence_count: 7 },
  { id: 8, framework: 'PCI DSS', control_id: 'Req 8', name: 'User Authentication Management',     status: 'pending', category: 'Access', last_checked: '2026-02-20', evidence_count: 3 },
];

const TABS = ['Frameworks', 'Controls', 'Evidence'];

function FrameworkCard({ fw }: { fw: typeof FRAMEWORKS[0] }) {
  const total = fw.controls;
  const pct   = Math.round((fw.passing / total) * 100);
  const barColor = fw.failing > 0 ? (fw.failing >= 3 ? DANGER : WARNING) : SUCCESS;
  return (
    <Box sx={{ bgcolor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 1, p: 2.5 }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Stack spacing={0.3}>
          <Typography sx={{ fontFamily: FONT, fontSize: '1.1rem' }}>{fw.icon}</Typography>
          <Typography sx={{ fontFamily: FONT, fontWeight: 800, fontSize: '0.9rem', color: TEXT }}>{fw.name}</Typography>
          <Typography sx={{ fontFamily: FONT, fontSize: '0.7rem', color: MUTED }}>Last audit: {fw.last_audit}</Typography>
        </Stack>
        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={{ fontFamily: FONT, fontSize: '1.8rem', fontWeight: 900, color: pct >= 90 ? SUCCESS : pct >= 70 ? WARNING : DANGER, lineHeight: 1 }}>{pct}%</Typography>
          <Typography sx={{ fontFamily: FONT, fontSize: '0.68rem', color: MUTED }}>compliance</Typography>
        </Box>
      </Stack>
      <LinearProgress variant="determinate" value={pct}
        sx={{ height: 6, borderRadius: 4, bgcolor: `${barColor}22`, mb: 1.5, '& .MuiLinearProgress-bar': { bgcolor: barColor, borderRadius: 4 } }} />
      <Stack direction="row" spacing={2}>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <CheckCircleIcon sx={{ fontSize: 12, color: SUCCESS }} />
          <Typography sx={{ fontFamily: FONT, fontSize: '0.72rem', color: SUCCESS, fontWeight: 700 }}>{fw.passing}</Typography>
          <Typography sx={{ fontFamily: FONT, fontSize: '0.68rem', color: MUTED }}>passing</Typography>
        </Stack>
        {fw.failing > 0 && (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <CancelIcon sx={{ fontSize: 12, color: DANGER }} />
            <Typography sx={{ fontFamily: FONT, fontSize: '0.72rem', color: DANGER, fontWeight: 700 }}>{fw.failing}</Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: '0.68rem', color: MUTED }}>failing</Typography>
          </Stack>
        )}
        {fw.pending > 0 && (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <AccessTimeIcon sx={{ fontSize: 12, color: WARNING }} />
            <Typography sx={{ fontFamily: FONT, fontSize: '0.72rem', color: WARNING, fontWeight: 700 }}>{fw.pending}</Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: '0.68rem', color: MUTED }}>pending</Typography>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}

const CompliancePage: React.FC = () => {
  const [tab, setTab]       = useState(0);
  const [search, setSearch] = useState('');
  const q = search.toLowerCase();

  const renderFrameworks = () => (
    <Box>
      <Grid container spacing={2.5}>
        {FRAMEWORKS.map(fw => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={fw.id}>
            <FrameworkCard fw={fw} />
          </Grid>
        ))}
      </Grid>

      {/* Summary row */}
      <Box sx={{ bgcolor: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 1, p: 2, mt: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.85rem', color: TEXT }}>Overall Compliance Posture</Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: '0.75rem', color: MUTED }}>
              {FRAMEWORKS.reduce((s, f) => s + f.passing, 0)} of {FRAMEWORKS.reduce((s, f) => s + f.controls, 0)} controls passing across {FRAMEWORKS.length} frameworks
            </Typography>
          </Box>
          <Button startIcon={<DownloadIcon />} variant="outlined" size="small"
            sx={{ fontFamily: FONT, textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', borderColor: BORDER, color: TEXT }}>
            Export Evidence Pack
          </Button>
        </Stack>
      </Box>
    </Box>
  );

  const renderControls = () => {
    const filtered = MOCK_CONTROLS.filter(c =>
      c.name.toLowerCase().includes(q) || c.control_id.toLowerCase().includes(q) || c.framework.toLowerCase().includes(q)
    );
    const statusColor: Record<string, string> = { passing: SUCCESS, failing: DANGER, pending: WARNING };
    const statusIcon: Record<string, React.ReactNode> = {
      passing: <CheckCircleIcon sx={{ fontSize: 12, color: SUCCESS }} />,
      failing: <CancelIcon sx={{ fontSize: 12, color: DANGER }} />,
      pending: <AccessTimeIcon sx={{ fontSize: 12, color: WARNING }} />,
    };
    return (
      <Box>
        <Table size="small">
          <TableHead>
            <TableRow>
              {['Control ID', 'Framework', 'Name', 'Category', 'Status', 'Evidence', 'Last Checked', ''].map(h => (
                <TableCell key={h} sx={HEAD_SX}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(c => (
              <TableRow key={c.id} sx={{ '&:hover': { bgcolor: SURFACE2 } }}>
                <TableCell sx={{ ...CELL_SX, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.78rem', color: BRAND, fontWeight: 700 }}>{c.control_id}</TableCell>
                <TableCell sx={{ ...CELL_SX, color: MUTED }}>{c.framework}</TableCell>
                <TableCell sx={{ ...CELL_SX, fontWeight: 500, maxWidth: 280 }}>{c.name}</TableCell>
                <TableCell sx={CELL_SX}>
                  <Chip label={c.category} size="small" sx={{ fontSize: '0.65rem', height: 18, bgcolor: `${BRAND}18`, color: BRAND }} />
                </TableCell>
                <TableCell sx={CELL_SX}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    {statusIcon[c.status]}
                    <Chip label={c.status} size="small"
                      sx={{ fontSize: '0.65rem', height: 18, fontWeight: 700, bgcolor: `${statusColor[c.status]}1a`, color: statusColor[c.status], textTransform: 'capitalize' }} />
                  </Stack>
                </TableCell>
                <TableCell sx={{ ...CELL_SX, fontWeight: c.evidence_count === 0 ? 700 : 400, color: c.evidence_count === 0 ? DANGER : TEXT }}>
                  {c.evidence_count} file{c.evidence_count !== 1 ? 's' : ''}
                </TableCell>
                <TableCell sx={{ ...CELL_SX, color: MUTED, fontSize: '0.72rem' }}>{c.last_checked}</TableCell>
                <TableCell sx={CELL_SX}>
                  <Tooltip title="Upload Evidence">
                    <IconButton size="small" sx={{ color: MUTED, '&:hover': { color: BRAND } }}><DownloadIcon sx={{ fontSize: 14, transform: 'rotate(180deg)' }} /></IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    );
  };

  const renderEvidence = () => (
    <Box>
      <Grid container spacing={2.5}>
        {FRAMEWORKS.map(fw => (
          <Grid size={{ xs: 12, sm: 6 }} key={fw.id}>
            <Box sx={{ bgcolor: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 1, p: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack spacing={0.3}>
                  <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.85rem', color: TEXT }}>{fw.name} Evidence Pack</Typography>
                  <Typography sx={{ fontFamily: FONT, fontSize: '0.72rem', color: MUTED }}>
                    {fw.passing + fw.failing + fw.pending} controls · Last audit {fw.last_audit}
                  </Typography>
                </Stack>
                <Button size="small" startIcon={<DownloadIcon />} variant="outlined"
                  sx={{ fontFamily: FONT, textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', borderColor: BORDER, color: TEXT }}>
                  Download
                </Button>
              </Stack>
              <Stack direction="row" spacing={2} sx={{ mt: 1.5 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontFamily: FONT, fontWeight: 800, fontSize: '1.2rem', color: SUCCESS }}>{fw.passing}</Typography>
                  <Typography sx={{ fontFamily: FONT, fontSize: '0.65rem', color: MUTED }}>Passing</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontFamily: FONT, fontWeight: 800, fontSize: '1.2rem', color: DANGER }}>{fw.failing}</Typography>
                  <Typography sx={{ fontFamily: FONT, fontSize: '0.65rem', color: MUTED }}>Failing</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontFamily: FONT, fontWeight: 800, fontSize: '1.2rem', color: WARNING }}>{fw.pending}</Typography>
                  <Typography sx={{ fontFamily: FONT, fontSize: '0.65rem', color: MUTED }}>Pending</Typography>
                </Box>
              </Stack>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: BG, pb: 6, fontFamily: FONT }}>
      <Box sx={{ bgcolor: SURFACE, borderBottom: `1px solid ${BORDER}`, px: { xs: 2, md: 4 }, py: 2.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack spacing={0.3}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <GppGoodIcon sx={{ color: BRAND, fontSize: 22 }} />
              <Typography sx={{ fontFamily: FONT, fontWeight: 800, fontSize: '1.1rem', color: TEXT }}>
                Compliance &amp; Audit
              </Typography>
            </Stack>
            <Typography sx={{ fontFamily: FONT, fontSize: '0.78rem', color: MUTED }}>
              SOC 2 · ISO 27001 · GDPR · PCI DSS · Evidence packs
            </Typography>
          </Stack>
          <Tooltip title="Refresh"><IconButton size="small" sx={{ color: MUTED }}><RefreshIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
        </Stack>
      </Box>

      <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}
            sx={{ minHeight: 36, '& .MuiTab-root': { fontFamily: FONT, fontWeight: 600, fontSize: '0.78rem', textTransform: 'none', minHeight: 36, color: MUTED, py: 0 }, '& .Mui-selected': { color: BRAND }, '& .MuiTabs-indicator': { bgcolor: BRAND } }}>
            {TABS.map(t => <Tab key={t} label={t} />)}
          </Tabs>
          {tab === 1 && (
            <TextField size="small" placeholder="Search controls..." value={search} onChange={e => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: MUTED }} /></InputAdornment>, sx: { fontFamily: FONT, fontSize: '0.8rem', bgcolor: SURFACE2 } }}
              sx={{ width: 220 }} />
          )}
        </Stack>

        <Box sx={{ bgcolor: tab === 0 ? 'transparent' : SURFACE, border: tab === 0 ? 'none' : `1px solid ${BORDER}`, borderRadius: 1, p: tab === 0 ? 0 : 2.5 }}>
          {tab === 0 && renderFrameworks()}
          {tab === 1 && renderControls()}
          {tab === 2 && renderEvidence()}
        </Box>
      </Box>
    </Box>
  );
};

export default CompliancePage;
