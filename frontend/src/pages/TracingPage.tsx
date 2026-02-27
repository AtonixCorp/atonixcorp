// AtonixCorp Cloud – Distributed Tracing Page
// Trace spans, service map, latency breakdown, search by trace ID

import React, { useState } from 'react';
import {
  Box, Typography, Stack, Chip,
  Table, TableHead, TableRow, TableCell, TableBody,
  Button, IconButton, Tooltip, Grid, LinearProgress,
  InputAdornment, TextField,
} from '@mui/material';
import AccountTreeIcon   from '@mui/icons-material/AccountTree';
import RefreshIcon       from '@mui/icons-material/Refresh';
import SearchIcon        from '@mui/icons-material/Search';
import ErrorIcon         from '@mui/icons-material/Error';
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

const MOCK_TRACES = [
  { trace_id: 'a1b2c3d4e5f6a7b8', root_service: 'api-gateway', operation: 'POST /api/v1/auth/login', duration_ms: 48, span_count: 5, has_error: false, timestamp: '2026-02-27T11:10:01Z' },
  { trace_id: 'b2c3d4e5f6a7b8c9', root_service: 'api-gateway', operation: 'GET /api/v1/compute/instances', duration_ms: 142, span_count: 8, has_error: false, timestamp: '2026-02-27T11:09:55Z' },
  { trace_id: 'c3d4e5f6a7b8c9d0', root_service: 'api-gateway', operation: 'POST /api/v1/storage/upload', duration_ms: 832, span_count: 12, has_error: false, timestamp: '2026-02-27T11:09:42Z' },
  { trace_id: 'd4e5f6a7b8c9d0e1', root_service: 'api-gateway', operation: 'DELETE /api/v1/iam/user/5',  duration_ms: 287, span_count: 6,  has_error: true,  timestamp: '2026-02-27T11:08:30Z' },
  { trace_id: 'e5f6a7b8c9d0e1f2', root_service: 'api-gateway', operation: 'GET /api/v1/billing/usage',  duration_ms: 95,  span_count: 4,  has_error: false, timestamp: '2026-02-27T11:07:10Z' },
  { trace_id: 'f6a7b8c9d0e1f2a3', root_service: 'api-gateway', operation: 'GET /api/v1/monitoring/metrics', duration_ms: 224, span_count: 9, has_error: false, timestamp: '2026-02-27T11:06:55Z' },
];

const MOCK_SPANS = [
  { span_id: 's001', trace_id: 'a1b2c3d4e5f6a7b8', service: 'api-gateway',    operation: 'POST /auth/login',         duration_ms: 48,  status_code: 200, is_error: false, parent: null },
  { span_id: 's002', trace_id: 'a1b2c3d4e5f6a7b8', service: 'auth-service',   operation: 'ValidateCredentials',       duration_ms: 32,  status_code: 200, is_error: false, parent: 's001' },
  { span_id: 's003', trace_id: 'a1b2c3d4e5f6a7b8', service: 'postgres-auth',  operation: 'SELECT users WHERE email',  duration_ms: 18,  status_code: 200, is_error: false, parent: 's002' },
  { span_id: 's004', trace_id: 'a1b2c3d4e5f6a7b8', service: 'auth-service',   operation: 'GenerateJWT',               duration_ms: 5,   status_code: 200, is_error: false, parent: 's002' },
  { span_id: 's005', trace_id: 'a1b2c3d4e5f6a7b8', service: 'audit-logger',   operation: 'log.AuthSuccess',           duration_ms: 3,   status_code: 200, is_error: false, parent: 's001' },
];

const SERVICE_STATS = [
  { service: 'api-gateway',    req_rate: 1420, err_rate: 0.8,  p50: 12,  p95: 89,  p99: 245 },
  { service: 'auth-service',   req_rate: 890,  err_rate: 0.2,  p50: 28,  p95: 95,  p99: 180 },
  { service: 'backend-api',    req_rate: 2100, err_rate: 1.2,  p50: 45,  p95: 180, p99: 420 },
  { service: 'postgres-primary',req_rate: 3400, err_rate: 0.05, p50: 8,   p95: 42,  p99: 95  },
  { service: 'object-storage', req_rate: 540,  err_rate: 0.0,  p50: 120, p95: 450, p99: 820 },
  { service: 'audit-logger',   req_rate: 2800, err_rate: 0.0,  p50: 2,   p95: 8,   p99: 18  },
];

function fmtTs(d: string) {
  return new Date(d).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function LatencyBar({ value, max }: { value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  const color = value > 400 ? DANGER : value > 150 ? WARNING : SUCCESS;
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <LinearProgress variant="determinate" value={pct}
        sx={{ width: 60, height: 4, borderRadius: 4, bgcolor: `${color}22`, '& .MuiLinearProgress-bar': { bgcolor: color } }} />
      <Typography sx={{ fontFamily: FONT, fontSize: '0.74rem', fontWeight: 600, color }}>{value}ms</Typography>
    </Stack>
  );
}

const TracingPage: React.FC = () => {
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const q = search.toLowerCase();

  const filtered = MOCK_TRACES.filter(t =>
    t.trace_id.includes(q) || t.operation.toLowerCase().includes(q) || t.root_service.toLowerCase().includes(q)
  );

  const maxP99 = Math.max(...SERVICE_STATS.map(s => s.p99));

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: BG, pb: 6, fontFamily: FONT }}>
      <Box sx={{ bgcolor: SURFACE, borderBottom: `1px solid ${BORDER}`, px: { xs: 2, md: 4 }, py: 2.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack spacing={0.3}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <AccountTreeIcon sx={{ color: BRAND, fontSize: 22 }} />
              <Typography sx={{ fontFamily: FONT, fontWeight: 800, fontSize: '1.1rem', color: TEXT }}>Distributed Tracing</Typography>
            </Stack>
            <Typography sx={{ fontFamily: FONT, fontSize: '0.78rem', color: MUTED }}>
              Traces · Spans · Service map · Latency percentiles
            </Typography>
          </Stack>
          <Tooltip title="Refresh"><IconButton size="small" sx={{ color: MUTED }}><RefreshIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
        </Stack>
      </Box>

      <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
        {/* Service map summary */}
        <Box sx={{ bgcolor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 1, p: 2.5, mb: 3 }}>
          <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.85rem', color: TEXT, mb: 2 }}>Service Latency Overview</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Service', 'Req/s', 'Error Rate', 'p50', 'p95', 'p99'].map(h => (
                  <TableCell key={h} sx={HEAD_SX}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {SERVICE_STATS.map(s => (
                <TableRow key={s.service} sx={{ '&:hover': { bgcolor: SURFACE2 } }}>
                  <TableCell sx={{ ...CELL_SX, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.76rem', color: BRAND, fontWeight: 600 }}>{s.service}</TableCell>
                  <TableCell sx={{ ...CELL_SX, fontWeight: 700 }}>{s.req_rate.toLocaleString()}</TableCell>
                  <TableCell sx={{ ...CELL_SX, color: s.err_rate > 1 ? DANGER : s.err_rate > 0 ? WARNING : SUCCESS, fontWeight: 700 }}>{s.err_rate}%</TableCell>
                  <TableCell sx={CELL_SX}><LatencyBar value={s.p50} max={maxP99} /></TableCell>
                  <TableCell sx={CELL_SX}><LatencyBar value={s.p95} max={maxP99} /></TableCell>
                  <TableCell sx={CELL_SX}><LatencyBar value={s.p99} max={maxP99} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        {/* Trace list */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.85rem', color: TEXT }}>Recent Traces</Typography>
          <TextField size="small" placeholder="Search traces or trace ID…" value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: MUTED }} /></InputAdornment>, sx: { fontFamily: FONT, fontSize: '0.8rem', bgcolor: SURFACE2 } }}
            sx={{ width: 280 }} />
        </Stack>

        <Box sx={{ bgcolor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 1, p: 2.5 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Trace ID', 'Service', 'Operation', 'Duration', 'Spans', 'Time', ''].map(h => (
                  <TableCell key={h} sx={HEAD_SX}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(t => (
                <React.Fragment key={t.trace_id}>
                  <TableRow sx={{ '&:hover': { bgcolor: SURFACE2 }, cursor: 'pointer', bgcolor: selected === t.trace_id ? `${BRAND}0a` : undefined }}
                    onClick={() => setSelected(selected === t.trace_id ? null : t.trace_id)}>
                    <TableCell sx={{ ...CELL_SX, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.74rem', color: BRAND }}>{t.trace_id.slice(0, 16)}</TableCell>
                    <TableCell sx={{ ...CELL_SX, color: MUTED }}>{t.root_service}</TableCell>
                    <TableCell sx={{ ...CELL_SX, fontWeight: 500, fontSize: '0.78rem' }}>{t.operation}</TableCell>
                    <TableCell sx={CELL_SX}>
                      <Typography sx={{ fontFamily: FONT, fontSize: '0.78rem', fontWeight: 700, color: t.duration_ms > 500 ? DANGER : t.duration_ms > 200 ? WARNING : SUCCESS }}>
                        {t.duration_ms}ms
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ ...CELL_SX, color: MUTED }}>{t.span_count}</TableCell>
                    <TableCell sx={{ ...CELL_SX, color: MUTED, fontSize: '0.72rem' }}>{fmtTs(t.timestamp)}</TableCell>
                    <TableCell sx={CELL_SX}>
                      {t.has_error && <ErrorIcon sx={{ fontSize: 16, color: DANGER }} />}
                    </TableCell>
                  </TableRow>

                  {/* Span detail inline expansion */}
                  {selected === t.trace_id && (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ bgcolor: SURFACE2, p: 0, borderColor: BORDER }}>
                        <Box sx={{ p: 2 }}>
                          <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.78rem', color: TEXT, mb: 1 }}>Span Breakdown</Typography>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                {['Span ID', 'Service', 'Operation', 'Duration', 'Status', 'Parent'].map(h => (
                                  <TableCell key={h} sx={{ ...HEAD_SX, bgcolor: 'transparent' }}>{h}</TableCell>
                                ))}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {MOCK_SPANS.filter(s => s.trace_id === t.trace_id).map(s => (
                                <TableRow key={s.span_id}>
                                  <TableCell sx={{ ...CELL_SX, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.73rem', color: PURPLE }}>{s.span_id}</TableCell>
                                  <TableCell sx={{ ...CELL_SX, color: BRAND, fontSize: '0.75rem' }}>{s.service}</TableCell>
                                  <TableCell sx={{ ...CELL_SX, fontSize: '0.75rem' }}>{s.operation}</TableCell>
                                  <TableCell sx={{ ...CELL_SX, fontWeight: 700, color: s.duration_ms > 100 ? WARNING : SUCCESS }}>{s.duration_ms}ms</TableCell>
                                  <TableCell sx={CELL_SX}>
                                    <Chip label={`HTTP ${s.status_code}`} size="small" sx={{ fontSize: '0.65rem', height: 16, bgcolor: s.is_error ? `${DANGER}1a` : `${SUCCESS}1a`, color: s.is_error ? DANGER : SUCCESS }} />
                                  </TableCell>
                                  <TableCell sx={{ ...CELL_SX, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.7rem', color: MUTED }}>{s.parent ?? '(root)'}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
};

export default TracingPage;
