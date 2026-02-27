// AtonixCorp Cloud – DDoS Protection Page
// Protection rules, attack events, blocked IPs, traffic analysis

import React, { useState } from 'react';
import {
  Box, Typography, Stack, Chip, Tabs, Tab,
  Table, TableHead, TableRow, TableCell, TableBody,
  Button, IconButton, Tooltip, Grid,
  InputAdornment, TextField,
} from '@mui/material';
import SecurityIcon    from '@mui/icons-material/Security';
import ShieldIcon      from '@mui/icons-material/Shield';
import AddIcon         from '@mui/icons-material/Add';
import RefreshIcon     from '@mui/icons-material/Refresh';
import SearchIcon      from '@mui/icons-material/Search';
import EditIcon        from '@mui/icons-material/Edit';
import DeleteIcon      from '@mui/icons-material/Delete';
import PlayArrowIcon   from '@mui/icons-material/PlayArrow';
import StopIcon        from '@mui/icons-material/Stop';
import BlockIcon       from '@mui/icons-material/Block';
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

function fmtTs(d: string) {
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const MOCK_RULES = [
  { id: 1, name: 'Rate Limit API Gateway',    rule_type: 'rate_limit',  action: 'rate_limit', priority: 10, threshold_rps: 5000,   is_active: true,  match_count: 4820 },
  { id: 2, name: 'Block High-Risk Countries', rule_type: 'geo_block',   action: 'block',      priority: 20, threshold_rps: null,   is_active: true,  match_count: 2410 },
  { id: 3, name: 'Block Tor Exit Nodes',      rule_type: 'ip_block',    action: 'block',      priority: 15, threshold_rps: null,   is_active: true,  match_count: 680  },
  { id: 4, name: 'JS Challenge Bots',         rule_type: 'challenge',   action: 'challenge',  priority: 30, threshold_rps: null,   is_active: true,  match_count: 1245 },
  { id: 5, name: 'AtonixCorp Managed Ruleset',rule_type: 'managed',     action: 'block',      priority: 5,  threshold_rps: null,   is_active: true,  match_count: 9820 },
  { id: 6, name: 'Experimental: SQL Blind',   rule_type: 'challenge',   action: 'challenge',  priority: 40, threshold_rps: null,   is_active: false, match_count: 0    },
];

const MOCK_ATTACKS = [
  { id: 1, attack_type: 'UDP Flood',         source_ip: '185.220.x.x',  target: 'api.atonixcorp.com', peak_rps: 186000, peak_bps: 2400000, packets_dropped: 4820000, duration_secs: 142,  mitigated: true,  started_at: '2026-02-26T03:10:00Z' },
  { id: 2, attack_type: 'HTTP Flood',        source_ip: 'Distributed',  target: 'api.atonixcorp.com', peak_rps: 48000,  peak_bps: 95000,   packets_dropped: 1200000, duration_secs: 420,  mitigated: true,  started_at: '2026-02-24T22:00:00Z' },
  { id: 3, attack_type: 'SYN Flood',         source_ip: '45.95.x.x',    target: 'ws.atonixcorp.com',  peak_rps: 320000, peak_bps: 8500000, packets_dropped: 8400000, duration_secs: 75,   mitigated: true,  started_at: '2026-02-20T17:15:00Z' },
  { id: 4, attack_type: 'Credential Stuffing',source_ip: 'Distributed', target: 'auth.atonixcorp.com',peak_rps: 4200,   peak_bps: 2100,    packets_dropped: 38000,   duration_secs: 1800, mitigated: false, started_at: '2026-02-15T09:00:00Z' },
];

const RULE_TYPE_COLORS: Record<string, string> = {
  rate_limit: BRAND, geo_block: WARNING, ip_block: DANGER, challenge: PURPLE, managed: SUCCESS,
};

const TABS = ['Protection Rules', 'Attack Events'];

function SummaryCards() {
  const blocked = MOCK_ATTACKS.reduce((s, a) => s + a.packets_dropped, 0);
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {[
        { label: 'Active Rules', value: MOCK_RULES.filter(r => r.is_active).length, sub: `${MOCK_RULES.length} total`, color: SUCCESS },
        { label: 'Attacks Blocked', value: MOCK_ATTACKS.filter(a => a.mitigated).length, sub: 'Last 30 days', color: DANGER },
        { label: 'Packets Dropped', value: `${(blocked / 1e6).toFixed(1)}M`, sub: 'Total mitigated', color: BRAND },
        { label: 'Rule Matches', value: MOCK_RULES.reduce((s, r) => s + r.match_count, 0).toLocaleString(), sub: 'All-time requests blocked', color: PURPLE },
      ].map(c => (
        <Grid size={{ xs: 6, sm: 3 }} key={c.label}>
          <Box sx={{ bgcolor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 1, p: 2 }}>
            <Typography sx={{ fontFamily: FONT, fontSize: '0.68rem', color: MUTED, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>{c.label}</Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: '1.5rem', fontWeight: 800, color: TEXT, lineHeight: 1 }}>{c.value}</Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: '0.7rem', color: MUTED, mt: 0.3 }}>{c.sub}</Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}

const DDoSPage: React.FC = () => {
  const [tab, setTab]       = useState(0);
  const [search, setSearch] = useState('');
  const q = search.toLowerCase();

  const renderRules = () => {
    const filtered = MOCK_RULES.filter(r => r.name.toLowerCase().includes(q) || r.rule_type.toLowerCase().includes(q));
    const actionColor: Record<string, string> = { block: DANGER, rate_limit: WARNING, challenge: PURPLE, managed: SUCCESS };
    return (
      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.85rem', color: TEXT }}>{filtered.length} rules</Typography>
          <Button size="small" startIcon={<AddIcon />} variant="contained"
            sx={{ fontFamily: FONT, textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', bgcolor: BRAND }}>
            Add Rule
          </Button>
        </Stack>
        <Table size="small">
          <TableHead>
            <TableRow>
              {['Priority', 'Rule Name', 'Type', 'Action', 'Threshold', 'Matches', 'Status', ''].map(h => (
                <TableCell key={h} sx={HEAD_SX}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.sort((a, b) => a.priority - b.priority).map(r => (
              <TableRow key={r.id} sx={{ '&:hover': { bgcolor: SURFACE2 } }}>
                <TableCell sx={{ ...CELL_SX, fontWeight: 800, color: BRAND }}>{r.priority}</TableCell>
                <TableCell sx={{ ...CELL_SX, fontWeight: 600 }}>
                  <Stack direction="row" alignItems="center" spacing={0.8}>
                    <BlockIcon sx={{ fontSize: 14, color: RULE_TYPE_COLORS[r.rule_type] || BRAND }} />
                    <span>{r.name}</span>
                  </Stack>
                </TableCell>
                <TableCell sx={CELL_SX}>
                  <Chip label={r.rule_type.replace('_', ' ')} size="small"
                    sx={{ fontSize: '0.65rem', height: 18, bgcolor: `${RULE_TYPE_COLORS[r.rule_type]}18`, color: RULE_TYPE_COLORS[r.rule_type], textTransform: 'capitalize' }} />
                </TableCell>
                <TableCell sx={CELL_SX}>
                  <Chip label={r.action.replace('_', ' ')} size="small"
                    sx={{ fontSize: '0.65rem', height: 18, fontWeight: 700, bgcolor: `${actionColor[r.action]}1a`, color: actionColor[r.action], textTransform: 'capitalize' }} />
                </TableCell>
                <TableCell sx={{ ...CELL_SX, color: MUTED }}>
                  {r.threshold_rps ? `${r.threshold_rps.toLocaleString()} rps` : '—'}
                </TableCell>
                <TableCell sx={{ ...CELL_SX, fontWeight: 700 }}>{r.match_count.toLocaleString()}</TableCell>
                <TableCell sx={CELL_SX}>
                  <Chip label={r.is_active ? 'Active' : 'Disabled'} size="small"
                    sx={{ fontSize: '0.65rem', height: 18, bgcolor: r.is_active ? `${SUCCESS}1a` : `${MUTED}18`, color: r.is_active ? SUCCESS : MUTED }} />
                </TableCell>
                <TableCell sx={CELL_SX}>
                  <Stack direction="row" spacing={0.3}>
                    <Tooltip title={r.is_active ? 'Disable' : 'Enable'}>
                      <IconButton size="small" sx={{ color: MUTED, '&:hover': { color: r.is_active ? WARNING : SUCCESS } }}>
                        {r.is_active ? <StopIcon sx={{ fontSize: 14 }} /> : <PlayArrowIcon sx={{ fontSize: 14 }} />}
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

  const renderAttacks = () => {
    const filtered = MOCK_ATTACKS.filter(a => a.attack_type.toLowerCase().includes(q) || a.target.toLowerCase().includes(q));
    return (
      <Box>
        <Table size="small">
          <TableHead>
            <TableRow>
              {['Time', 'Attack Type', 'Source', 'Target', 'Peak RPS', 'Peak BPS', 'Dropped', 'Duration', 'Status'].map(h => (
                <TableCell key={h} sx={HEAD_SX}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(a => (
              <TableRow key={a.id} sx={{ '&:hover': { bgcolor: SURFACE2 }, bgcolor: !a.mitigated ? `${DANGER}06` : undefined }}>
                <TableCell sx={{ ...CELL_SX, color: MUTED, fontSize: '0.72rem' }}>{fmtTs(a.started_at)}</TableCell>
                <TableCell sx={{ ...CELL_SX, fontWeight: 700 }}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <SecurityIcon sx={{ fontSize: 14, color: DANGER }} />
                    <span>{a.attack_type}</span>
                  </Stack>
                </TableCell>
                <TableCell sx={{ ...CELL_SX, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.73rem', color: MUTED }}>{a.source_ip}</TableCell>
                <TableCell sx={{ ...CELL_SX, color: BRAND, fontSize: '0.75rem' }}>{a.target}</TableCell>
                <TableCell sx={{ ...CELL_SX, fontWeight: 700, color: DANGER }}>{(a.peak_rps / 1000).toFixed(0)}K</TableCell>
                <TableCell sx={{ ...CELL_SX, color: WARNING, fontWeight: 700 }}>
                  {a.peak_bps >= 1e6 ? `${(a.peak_bps / 1e6).toFixed(1)}M` : `${(a.peak_bps / 1e3).toFixed(0)}K`}
                </TableCell>
                <TableCell sx={{ ...CELL_SX, color: MUTED }}>
                  {(a.packets_dropped / 1e6).toFixed(1)}M
                </TableCell>
                <TableCell sx={{ ...CELL_SX, color: MUTED }}>{a.duration_secs}s</TableCell>
                <TableCell sx={CELL_SX}>
                  <Chip label={a.mitigated ? 'Mitigated' : 'Ongoing'} size="small"
                    sx={{ fontSize: '0.65rem', height: 18, fontWeight: 700, bgcolor: a.mitigated ? `${SUCCESS}1a` : `${DANGER}1a`, color: a.mitigated ? SUCCESS : DANGER }} />
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
              <ShieldIcon sx={{ color: BRAND, fontSize: 22 }} />
              <Typography sx={{ fontFamily: FONT, fontWeight: 800, fontSize: '1.1rem', color: TEXT }}>DDoS Protection</Typography>
            </Stack>
            <Typography sx={{ fontFamily: FONT, fontSize: '0.78rem', color: MUTED }}>
              Firewall rules · Rate limiting · Geo-blocking · Attack mitigation
            </Typography>
          </Stack>
          <Tooltip title="Refresh"><IconButton size="small" sx={{ color: MUTED }}><RefreshIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
        </Stack>
      </Box>

      <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
        <SummaryCards />

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
          {tab === 0 && renderRules()}
          {tab === 1 && renderAttacks()}
        </Box>
      </Box>
    </Box>
  );
};

export default DDoSPage;
