// AtonixCorp Cloud – SLO/SLA Monitoring Page
// Service Level Objectives, error budgets, burn rates, windows

import React, { useState } from 'react';
import {
  Box, Typography, Stack, Chip, Grid, LinearProgress,
  Table, TableHead, TableRow, TableCell, TableBody,
  Button, IconButton, Tooltip, InputAdornment, TextField,
} from '@mui/material';
import TrackChangesIcon  from '@mui/icons-material/TrackChanges';
import AddIcon           from '@mui/icons-material/Add';
import RefreshIcon       from '@mui/icons-material/Refresh';
import SearchIcon        from '@mui/icons-material/Search';
import WarningAmberIcon  from '@mui/icons-material/WarningAmber';
import CheckCircleIcon   from '@mui/icons-material/CheckCircle';
import WhatshotIcon      from '@mui/icons-material/Whatshot';
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

const MOCK_SLOS = [
  { id: 1, name: 'API Availability',      service: 'backend-api',      slo_type: 'availability', target_pct: 99.9, current_value: 99.97, error_budget_pct: 78.5, burn_rate: 0.28, breached: false, window_days: 30 },
  { id: 2, name: 'API p99 Latency ≤200ms', service: 'backend-api',     slo_type: 'latency',      target_pct: 99.0, current_value: 98.7,  error_budget_pct: 30.0, burn_rate: 1.85, breached: false, window_days: 30 },
  { id: 3, name: 'DB Query p95 ≤50ms',    service: 'postgres-primary', slo_type: 'latency',      target_pct: 95.0, current_value: 96.2,  error_budget_pct: 112.0,burn_rate: 0.0,  breached: false, window_days: 30 },
  { id: 4, name: 'Auth Service Uptime',    service: 'auth-service',     slo_type: 'availability', target_pct: 99.95,current_value: 99.91, error_budget_pct: -80.0,burn_rate: 4.2,  breached: true,  window_days: 30 },
  { id: 5, name: 'CDN Cache Hit Rate',     service: 'cdn-edge',         slo_type: 'quality',      target_pct: 85.0, current_value: 88.3,  error_budget_pct: 144.0,burn_rate: 0.0,  breached: false, window_days: 7  },
  { id: 6, name: 'Object Storage Durability', service: 'object-storage', slo_type: 'availability', target_pct: 99.9999, current_value: 99.9999, error_budget_pct: 100.0, burn_rate: 0.0, breached: false, window_days: 30 },
];

function BudgetBar({ pct, breached }: { pct: number; breached: boolean }) {
  const clamped = Math.min(100, Math.max(0, pct));
  const color   = breached ? DANGER : pct <= 10 ? WARNING : SUCCESS;
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 130 }}>
      <LinearProgress variant="determinate" value={clamped}
        sx={{ flexGrow: 1, height: 6, borderRadius: 4, bgcolor: `${color}22`, '& .MuiLinearProgress-bar': { bgcolor: color } }} />
      <Typography sx={{ fontFamily: FONT, fontSize: '0.74rem', fontWeight: 700, color, minWidth: 36 }}>
        {breached ? '-' : ''}{Math.abs(Math.round(pct))}%
      </Typography>
    </Stack>
  );
}

function BurnRate({ rate, breached }: { rate: number; breached: boolean }) {
  const color = rate >= 3 ? DANGER : rate >= 1.5 ? WARNING : SUCCESS;
  return (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      {rate >= 1.5 && <WhatshotIcon sx={{ fontSize: 13, color }} />}
      <Typography sx={{ fontFamily: FONT, fontSize: '0.78rem', fontWeight: 700, color }}>{rate.toFixed(2)}×</Typography>
    </Stack>
  );
}

function SummaryRow({ slos }: { slos: typeof MOCK_SLOS }) {
  const breached  = slos.filter(s => s.breached).length;
  const warning   = slos.filter(s => !s.breached && s.error_budget_pct < 20).length;
  const healthy   = slos.filter(s => !s.breached && s.error_budget_pct >= 20).length;
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {[
        { label: 'Total SLOs', value: slos.length, sub: 'Tracked objectives', color: BRAND },
        { label: 'Healthy', value: healthy, sub: 'Budget > 20%', color: SUCCESS },
        { label: 'At Risk', value: warning, sub: 'Budget < 20%', color: WARNING },
        { label: 'Breached', value: breached, sub: 'Error budget exhausted', color: DANGER },
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

const SLOPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const q = search.toLowerCase();
  const filtered = MOCK_SLOS.filter(s => s.name.toLowerCase().includes(q) || s.service.toLowerCase().includes(q));

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: BG, pb: 6, fontFamily: FONT }}>
      <Box sx={{ bgcolor: SURFACE, borderBottom: `1px solid ${BORDER}`, px: { xs: 2, md: 4 }, py: 2.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack spacing={0.3}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <TrackChangesIcon sx={{ color: BRAND, fontSize: 22 }} />
              <Typography sx={{ fontFamily: FONT, fontWeight: 800, fontSize: '1.1rem', color: TEXT }}>SLO / SLA Monitoring</Typography>
            </Stack>
            <Typography sx={{ fontFamily: FONT, fontSize: '0.78rem', color: MUTED }}>
              Service objectives · Error budgets · Burn rates · Compliance windows
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh"><IconButton size="small" sx={{ color: MUTED }}><RefreshIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
            <Button size="small" startIcon={<AddIcon />} variant="contained"
              sx={{ fontFamily: FONT, textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', bgcolor: BRAND }}>
              Add SLO
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
        <SummaryRow slos={MOCK_SLOS} />

        <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
          <TextField size="small" placeholder="Search SLOs..." value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: MUTED }} /></InputAdornment>, sx: { fontFamily: FONT, fontSize: '0.8rem', bgcolor: SURFACE2 } }}
            sx={{ width: 220 }} />
        </Stack>

        <Box sx={{ bgcolor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 1, p: 2.5 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['SLO Name', 'Service', 'Type', 'Target', 'Current', 'Error Budget', 'Burn Rate', 'Window', 'Status'].map(h => (
                  <TableCell key={h} sx={HEAD_SX}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(s => {
                const onTarget = s.current_value >= s.target_pct;
                return (
                  <TableRow key={s.id} sx={{ '&:hover': { bgcolor: SURFACE2 }, bgcolor: s.breached ? `${DANGER}06` : undefined }}>
                    <TableCell sx={{ ...CELL_SX, fontWeight: 600 }}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        {s.breached
                          ? <WarningAmberIcon sx={{ fontSize: 14, color: DANGER }} />
                          : <CheckCircleIcon sx={{ fontSize: 14, color: SUCCESS }} />}
                        <span>{s.name}</span>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ ...CELL_SX, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.74rem', color: BRAND }}>{s.service}</TableCell>
                    <TableCell sx={CELL_SX}>
                      <Chip label={s.slo_type} size="small" sx={{ fontSize: '0.65rem', height: 18, bgcolor: `${BRAND}18`, color: BRAND, textTransform: 'capitalize' }} />
                    </TableCell>
                    <TableCell sx={{ ...CELL_SX, fontWeight: 700 }}>{s.target_pct}%</TableCell>
                    <TableCell sx={{ ...CELL_SX, fontWeight: 700, color: onTarget ? SUCCESS : DANGER }}>{s.current_value}%</TableCell>
                    <TableCell sx={CELL_SX}><BudgetBar pct={s.error_budget_pct} breached={s.breached} /></TableCell>
                    <TableCell sx={CELL_SX}><BurnRate rate={s.burn_rate} breached={s.breached} /></TableCell>
                    <TableCell sx={{ ...CELL_SX, color: MUTED }}>{s.window_days}d</TableCell>
                    <TableCell sx={CELL_SX}>
                      <Chip label={s.breached ? 'Breached' : 'OK'} size="small"
                        sx={{ fontSize: '0.65rem', height: 18, fontWeight: 700, bgcolor: s.breached ? `${DANGER}1a` : `${SUCCESS}1a`, color: s.breached ? DANGER : SUCCESS }} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
};

export default SLOPage;
