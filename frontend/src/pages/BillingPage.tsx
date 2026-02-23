import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Tabs, Tab, Grid, Card, CardContent, CardHeader,
  Chip, Button, CircularProgress, Alert as MuiAlert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, FormControl, InputLabel,
  IconButton, Tooltip, LinearProgress, Paper, Divider,
  Switch, FormControlLabel,
} from '@mui/material';
import RefreshIcon      from '@mui/icons-material/Refresh';
import AddIcon          from '@mui/icons-material/Add';
import CreditCardIcon   from '@mui/icons-material/CreditCard';
import DeleteIcon       from '@mui/icons-material/Delete';
import DownloadIcon     from '@mui/icons-material/Download';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { billingApi }   from '../services/cloudApi';
import type {
  BillingOverview, Invoice, PaymentMethod,
  CurrentUsage, PlanTier, ServiceCost,
} from '../types/billing';

// ── Theme tokens ──────────────────────────────────────────────────────────────

function useT() {
  const theme  = useMuiTheme();
  const isDark = theme.palette.mode === 'dark';
  return {
    isDark,
    panelBg: isDark ? '#0D1826' : '#F9FAFB',
    cardBg:  isDark ? '#132336' : '#FFFFFF',
    border:  isDark ? '#1E3A5F' : '#E5E7EB',
    text:    isDark ? '#e0e9f4' : '#0A0F1F',
    sub:     isDark ? '#8BAAC8' : '#6B7280',
    brand:   '#18366A',
    green:   '#22c55e',
    yellow:  '#f59e0b',
    red:     '#ef4444',
    blue:    '#3b82f6',
    purple:  '#8b5cf6',
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const INVOICE_STATUS_COLOR: Record<string, string> = {
  draft: '#8b5cf6', open: '#f59e0b', paid: '#22c55e',
  void: '#6b7280', uncollectable: '#ef4444',
};

const PLAN_COLOR: Record<PlanTier, string> = {
  free: '#6b7280', starter: '#3b82f6', professional: '#8b5cf6', enterprise: '#f59e0b',
};



const SERVICE_COLORS: Record<string, string> = {
  compute: '#3b82f6', storage: '#22c55e', database: '#8b5cf6',
  networking: '#f59e0b', containers: '#f97316', email: '#06b6d4',
  dns: '#ec4899', api: '#14b8a6',
};

function fmt(n: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n);
}

function StatusChip({ label, color }: { label: string; color: string }) {
  return (
    <Chip label={label.toUpperCase()} size="small"
      sx={{ bgcolor: `${color}22`, color, border: `1px solid ${color}44`, fontWeight: 700, fontSize: '0.65rem' }} />
  );
}

// ── Mini sparkline (SVG) ──────────────────────────────────────────────────────

function TrendBar({ trend }: { trend: { month: string; amount: number }[] }) {
  const t = useT();
  if (!trend.length) return null;
  const max = Math.max(...trend.map(p => p.amount), 1);
  const w = 260, h = 60;
  const step = w / (trend.length - 1 || 1);
  const pts = trend.map((p, i) => ({
    x: i * step,
    y: h - (p.amount / max) * (h - 8) - 4,
  }));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${d} L${w},${h} L0,${h} Z`;
  return (
    <Box>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: h }}>
        <path d={area} fill={`${t.brand}33`} />
        <path d={d} stroke={t.brand} strokeWidth="2" fill="none" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill={t.brand} />
        ))}
      </svg>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
        {trend.map((p) => (
          <Box key={p.month} sx={{ textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: t.sub, fontSize: '0.65rem', display: 'block' }}>{p.month}</Typography>
            <Typography variant="caption" sx={{ color: t.text, fontSize: '0.7rem', fontWeight: 600 }}>{fmt(p.amount)}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ── Usage Donut (CSS-only bar chart) ─────────────────────────────────────────

function UsageServiceChart({ items }: { items: ServiceCost[] }) {
  const t = useT();
  const total = items.reduce((s, i) => s + i.cost, 0) || 1;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {items.slice(0, 8).map((item) => (
        <Box key={item.service}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: SERVICE_COLORS[item.service] ?? t.brand }} />
              <Typography variant="caption" sx={{ color: t.text, textTransform: 'capitalize' }}>{item.service}</Typography>
            </Box>
            <Typography variant="caption" sx={{ color: t.text, fontWeight: 700 }}>{fmt(item.cost)}</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={(item.cost / total) * 100}
            sx={{
              height: 6, borderRadius: 3,
              bgcolor: `${SERVICE_COLORS[item.service] ?? t.brand}22`,
              '& .MuiLinearProgress-bar': { bgcolor: SERVICE_COLORS[item.service] ?? t.brand, borderRadius: 3 },
            }}
          />
        </Box>
      ))}
    </Box>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────────────────

function OverviewTab({ data, loading }: { data: BillingOverview | null; loading: boolean }) {
  const t = useT();
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (!data) return null;
  const { account, current_spend, projected, open_balance, credit_balance, trend, usage_breakdown } = data;
  const byService: ServiceCost[] = Object.values(
    (usage_breakdown ?? []).reduce<Record<string, ServiceCost>>((acc, i) => {
      acc[i.service] = { service: i.service, cost: (acc[i.service]?.cost ?? 0) + i.cost };
      return acc;
    }, {})
  ).sort((a, b) => b.cost - a.cost);

  return (
    <Box>
      {/* Stat cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'This Month', value: fmt(current_spend), color: t.blue },
          { label: 'Projected', value: fmt(projected), color: t.yellow },
          { label: 'Open Balance', value: fmt(open_balance), color: open_balance > 0 ? t.red : t.green },
          { label: 'Credits', value: fmt(credit_balance), color: t.purple },
          { label: 'Plan', value: account.plan.toUpperCase(), color: PLAN_COLOR[account.plan] },
        ].map((s) => (
          <Grid key={s.label} size={{ xs: 12, sm: 6, md: 2 }}>
            <Card sx={{ bgcolor: t.cardBg, border: `1px solid ${t.border}` }}>
              <CardContent sx={{ textAlign: 'center', p: 2, '&:last-child': { pb: 2 } }}>
                <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</Typography>
                <Typography variant="caption" sx={{ color: t.sub, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Spend trend */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ bgcolor: t.cardBg, border: `1px solid ${t.border}`, height: '100%' }}>
            <CardHeader title={<Typography sx={{ color: t.text, fontWeight: 700 }}>Monthly Spend Trend</Typography>} />
            <CardContent>
              <TrendBar trend={trend ?? []} />
            </CardContent>
          </Card>
        </Grid>

        {/* Spend by service */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ bgcolor: t.cardBg, border: `1px solid ${t.border}`, height: '100%' }}>
            <CardHeader title={<Typography sx={{ color: t.text, fontWeight: 700 }}>Spend by Service</Typography>} />
            <CardContent>
              <UsageServiceChart items={byService} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

// ── Invoices Tab ──────────────────────────────────────────────────────────────

function InvoicesTab() {
  const t = useT();
  const [invoices, setInvoices]   = useState<Invoice[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState<Invoice | null>(null);
  const [paying, setPaying]       = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    billingApi.listInvoices()
      .then(r => setInvoices((r.data as any).results ?? r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openDetail = (inv: Invoice) => {
    billingApi.getInvoice(inv.id)
      .then(r => setSelected(r.data as any))
      .catch(() => {});
  };

  const payNow = (inv: Invoice, e: React.MouseEvent) => {
    e.stopPropagation();
    setPaying(inv.id);
    billingApi.payInvoice(inv.id)
      .then(() => load())
      .catch(() => {})
      .finally(() => setPaying(null));
  };

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ color: t.text }}>Invoice History</Typography>
          <IconButton onClick={load} sx={{ color: t.sub }}><RefreshIcon /></IconButton>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : (
          <TableContainer component={Paper} sx={{ bgcolor: t.cardBg, border: `1px solid ${t.border}` }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Invoice #','Period','Status','Subtotal','Tax','Total','Due','Actions'].map(h => (
                    <TableCell key={h} sx={{ color: t.sub, borderColor: t.border, fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map(inv => (
                  <TableRow key={inv.id} hover onClick={() => openDetail(inv)}
                    selected={selected?.id === inv.id}
                    sx={{ cursor: 'pointer', '& td': { borderColor: t.border }, '&.Mui-selected': { bgcolor: `${t.brand}22` } }}>
                    <TableCell sx={{ color: t.blue, fontFamily: 'monospace', fontSize: '0.75rem' }}>{inv.invoice_number}</TableCell>
                    <TableCell sx={{ color: t.sub, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{inv.period_start} – {inv.period_end}</TableCell>
                    <TableCell><StatusChip label={inv.status} color={INVOICE_STATUS_COLOR[inv.status] ?? t.sub} /></TableCell>
                    <TableCell sx={{ color: t.text }}>{fmt(Number(inv.subtotal))}</TableCell>
                    <TableCell sx={{ color: t.sub }}>{fmt(Number(inv.tax_amount))}</TableCell>
                    <TableCell sx={{ color: t.text, fontWeight: 700 }}>{fmt(Number(inv.total))}</TableCell>
                    <TableCell sx={{ color: t.sub, fontSize: '0.75rem' }}>{inv.due_date ?? '—'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {inv.status === 'open' && (
                          <Tooltip title="Pay now">
                            <Button size="small" variant="contained" onClick={(e) => payNow(inv, e)}
                              disabled={paying === inv.id}
                              sx={{ bgcolor: t.green, fontSize: '0.65rem', px: 1, minWidth: 0 }}>
                              {paying === inv.id ? <CircularProgress size={12} /> : 'Pay'}
                            </Button>
                          </Tooltip>
                        )}
                        {inv.pdf_url && (
                          <Tooltip title="Download PDF">
                            <IconButton size="small" sx={{ color: t.sub }}><DownloadIcon fontSize="small" /></IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {invoices.length === 0 && (
                  <TableRow><TableCell colSpan={8} sx={{ textAlign: 'center', color: t.sub, py: 4, borderColor: t.border }}>No invoices yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Invoice detail */}
      {selected && (
        <Box sx={{ width: 360, flexShrink: 0 }}>
          <Card sx={{ bgcolor: t.cardBg, border: `1px solid ${t.border}` }}>
            <CardHeader
              title={<Typography sx={{ color: t.text, fontWeight: 700, fontFamily: 'monospace' }}>{selected.invoice_number}</Typography>}
              subheader={<Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                <StatusChip label={selected.status} color={INVOICE_STATUS_COLOR[selected.status]} />
                <Chip label={selected.currency} size="small" sx={{ color: t.sub, bgcolor: 'transparent', border: `1px solid ${t.border}` }} />
              </Box>}
              action={<IconButton size="small" onClick={() => setSelected(null)} sx={{ color: t.sub }}>✕</IconButton>}
            />
            <CardContent sx={{ pt: 0 }}>
              <Typography variant="caption" sx={{ color: t.sub }}>Period: {selected.period_start} – {selected.period_end}</Typography>
              <Divider sx={{ borderColor: t.border, my: 1.5 }} />
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: t.sub, borderColor: t.border, fontSize: '0.7rem' }}>Description</TableCell>
                      <TableCell align="right" sx={{ color: t.sub, borderColor: t.border, fontSize: '0.7rem' }}>Qty</TableCell>
                      <TableCell align="right" sx={{ color: t.sub, borderColor: t.border, fontSize: '0.7rem' }}>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(selected.line_items ?? []).map(li => (
                      <TableRow key={li.id} sx={{ '& td': { borderColor: t.border } }}>
                        <TableCell sx={{ color: t.text, fontSize: '0.75rem' }}>{li.description}</TableCell>
                        <TableCell align="right" sx={{ color: t.sub, fontSize: '0.75rem' }}>{Number(li.quantity).toFixed(1)} {li.unit}</TableCell>
                        <TableCell align="right" sx={{ color: t.text, fontSize: '0.75rem', fontWeight: 600 }}>{fmt(Number(li.amount))}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Divider sx={{ borderColor: t.border, my: 1.5 }} />
              {[
                ['Subtotal', fmt(Number(selected.subtotal))],
                ['Tax (8%)', fmt(Number(selected.tax_amount))],
                ['Credits', `- ${fmt(Number(selected.credits_applied))}`],
              ].map(([l, v]) => (
                <Box key={l} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: t.sub }}>{l}</Typography>
                  <Typography variant="caption" sx={{ color: t.text }}>{v}</Typography>
                </Box>
              ))}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography sx={{ color: t.text, fontWeight: 700 }}>Total</Typography>
                <Typography sx={{ color: t.text, fontWeight: 800, fontSize: '1.1rem' }}>{fmt(Number(selected.total))}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
}

// ── Usage Tab ─────────────────────────────────────────────────────────────────

function UsageTab() {
  const t = useT();
  const [usage, setUsage]   = useState<CurrentUsage | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    billingApi.currentUsage()
      .then(r => setUsage(r.data as any))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (!usage) return null;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ color: t.text }}>Current Usage — {usage.period}</Typography>
          <Typography variant="body2" sx={{ color: t.sub }}>Estimated charges for the current month</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography sx={{ color: t.text, fontWeight: 800, fontSize: '1.5rem' }}>{fmt(usage.total)}</Typography>
          <IconButton onClick={load} sx={{ color: t.sub }}><RefreshIcon /></IconButton>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* By service */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ bgcolor: t.cardBg, border: `1px solid ${t.border}` }}>
            <CardHeader title={<Typography sx={{ color: t.text, fontWeight: 700 }}>By Service</Typography>} />
            <CardContent>
              <UsageServiceChart items={usage.by_service ?? []} />
            </CardContent>
          </Card>
        </Grid>

        {/* Line items */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ bgcolor: t.cardBg, border: `1px solid ${t.border}` }}>
            <CardHeader title={<Typography sx={{ color: t.text, fontWeight: 700 }}>Usage Breakdown</Typography>} />
            <CardContent sx={{ pt: 0 }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {['Service','Metric','Quantity','Unit Price','Cost'].map(h => (
                        <TableCell key={h} sx={{ color: t.sub, borderColor: t.border, fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase' }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(usage.line_items ?? []).map((li, i) => (
                      <TableRow key={i} sx={{ '& td': { borderColor: t.border } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: SERVICE_COLORS[li.service] ?? t.brand }} />
                            <Typography variant="caption" sx={{ color: t.text, textTransform: 'capitalize' }}>{li.service}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: t.sub, fontSize: '0.75rem' }}>{li.description}</TableCell>
                        <TableCell sx={{ color: t.text, fontFamily: 'monospace' }}>{Number(li.quantity).toLocaleString()} {li.unit}</TableCell>
                        <TableCell sx={{ color: t.sub, fontFamily: 'monospace', fontSize: '0.75rem' }}>${li.unit_price}/unit</TableCell>
                        <TableCell sx={{ color: t.text, fontWeight: 700 }}>{fmt(li.cost)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

// ── Payment Methods Tab ───────────────────────────────────────────────────────

const CARD_BRAND_COLORS: Record<string, string> = {
  visa: '#1A1F71', mastercard: '#EB001B', amex: '#007BC1',
  discover: '#F76F20', default: '#6b7280',
};

function AddCardDialog({ open, onClose, onAdded }: { open: boolean; onClose: () => void; onAdded: () => void }) {
  const t = useT();
  const [form, setForm] = useState({ card_last4: '', card_brand: 'visa', card_exp_month: '', card_exp_year: '', display_name: '', is_default: false });
  const [busy, setBusy] = useState(false);

  const handle = (f: string) => (e: React.ChangeEvent<HTMLInputElement | { value: unknown }>) =>
    setForm(p => ({ ...p, [f]: (e.target as any).value }));

  const submit = () => {
    setBusy(true);
    billingApi.addPaymentMethod({
      type: 'card',
      card_brand:     form.card_brand,
      card_last4:     form.card_last4,
      card_exp_month: Number(form.card_exp_month),
      card_exp_year:  Number(form.card_exp_year),
      display_name:   form.display_name,
      is_default:     form.is_default,
    })
      .then(() => { onAdded(); onClose(); })
      .catch(() => {})
      .finally(() => setBusy(false));
  };

  const inputSx = { '& .MuiInputLabel-root': { color: t.sub }, '& .MuiOutlinedInput-root': { color: t.text, '& fieldset': { borderColor: t.border } } };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { bgcolor: t.cardBg, color: t.text, minWidth: 420 } }}>
      <DialogTitle>Add Payment Method</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
        <TextField label="Cardholder / Display Name" value={form.display_name} onChange={handle('display_name')} fullWidth sx={inputSx} />
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <FormControl fullWidth size="small" sx={inputSx}>
              <InputLabel>Card Brand</InputLabel>
              <Select value={form.card_brand} label="Card Brand" onChange={handle('card_brand') as any} sx={{ color: t.text }}>
                {['visa','mastercard','amex','discover'].map(b => <MenuItem key={b} value={b}>{b.charAt(0).toUpperCase()+b.slice(1)}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField label="Last 4 digits" value={form.card_last4} onChange={handle('card_last4')} inputProps={{ maxLength: 4 }} fullWidth size="small" sx={inputSx} />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField label="Exp Month (MM)" type="number" value={form.card_exp_month} onChange={handle('card_exp_month')} fullWidth size="small" sx={inputSx} />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField label="Exp Year (YYYY)" type="number" value={form.card_exp_year} onChange={handle('card_exp_year')} fullWidth size="small" sx={inputSx} />
          </Grid>
        </Grid>
        <FormControlLabel
          control={<Switch checked={form.is_default} onChange={e => setForm(p => ({ ...p, is_default: e.target.checked }))} />}
          label={<Typography variant="body2" sx={{ color: t.text }}>Set as default</Typography>}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: t.sub }}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={busy || !form.card_last4} sx={{ bgcolor: t.brand }}>
          {busy ? <CircularProgress size={16} /> : 'Add Card'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function PaymentMethodsTab() {
  const t = useT();
  const [methods, setMethods]   = useState<PaymentMethod[]>([]);
  const [loading, setLoading]   = useState(true);
  const [addOpen, setAddOpen]   = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    billingApi.listPaymentMethods()
      .then(r => setMethods((r.data as any).results ?? r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const setDefault = (id: number) => {
    billingApi.setDefaultPaymentMethod(id).then(() => load()).catch(() => {});
  };

  const remove = (id: number) => {
    billingApi.deletePaymentMethod(id).then(() => load()).catch(() => {});
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ color: t.text }}>Payment Methods</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)} sx={{ bgcolor: t.brand }}>
          Add Card
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
      ) : methods.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CreditCardIcon sx={{ fontSize: 48, color: t.sub, mb: 2 }} />
          <Typography sx={{ color: t.sub }}>No payment methods added yet.</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)} sx={{ mt: 2, bgcolor: t.brand }}>
            Add Your First Card
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {methods.map(pm => (
            <Grid key={pm.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{
                bgcolor: t.cardBg, border: `1px solid ${pm.is_default ? t.brand : t.border}`,
                position: 'relative',
              }}>
                {pm.is_default && (
                  <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                    <Chip label="DEFAULT" size="small" sx={{ bgcolor: `${t.brand}33`, color: t.brand, fontWeight: 700, fontSize: '0.6rem' }} />
                  </Box>
                )}
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Box sx={{
                      width: 40, height: 26, borderRadius: 1,
                      bgcolor: CARD_BRAND_COLORS[pm.card_brand] ?? CARD_BRAND_COLORS.default,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <CreditCardIcon sx={{ fontSize: 16, color: '#fff' }} />
                    </Box>
                    <Box>
                      <Typography sx={{ color: t.text, fontWeight: 700, textTransform: 'capitalize' }}>
                        {pm.card_brand} •••• {pm.card_last4}
                      </Typography>
                      {pm.card_exp_month && (
                        <Typography variant="caption" sx={{ color: t.sub }}>
                          Exp {String(pm.card_exp_month).padStart(2, '0')}/{pm.card_exp_year}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  {pm.display_name && (
                    <Typography variant="caption" sx={{ color: t.sub, display: 'block', mb: 1.5 }}>{pm.display_name}</Typography>
                  )}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {!pm.is_default && (
                      <Button size="small" variant="outlined" onClick={() => setDefault(pm.id)}
                        sx={{ fontSize: '0.7rem', borderColor: t.border, color: t.sub, flex: 1 }}>
                        Set Default
                      </Button>
                    )}
                    <IconButton size="small" onClick={() => remove(pm.id)} sx={{ color: t.red, border: `1px solid ${t.red}33` }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <AddCardDialog open={addOpen} onClose={() => setAddOpen(false)} onAdded={load} />
    </Box>
  );
}



// ── Main BillingPage ──────────────────────────────────────────────────────────

const TABS = ['Overview', 'Invoices', 'Usage', 'Payment Methods'] as const;

export default function BillingPage() {
  const t = useT();
  const [tab, setTab]           = useState(0);
  const [overview, setOverview] = useState<BillingOverview | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const loadOverview = useCallback(() => {
    setLoading(true);
    billingApi.overview()
      .then(r => setOverview(r.data as any))
      .catch(() => setError('Failed to load billing data.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadOverview(); }, [loadOverview]);

  return (
    <Box sx={{ bgcolor: t.panelBg, minHeight: '100vh', p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ color: t.text, fontWeight: 700 }}>Billing & Payments</Typography>
          <Typography variant="body2" sx={{ color: t.sub }}>
            Manage your plan, invoices, usage and payment methods
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {overview && (
            <Chip
              label={`Balance: ${fmt(overview.open_balance)}`}
              sx={{
                bgcolor: overview.open_balance > 0 ? `${t.red}22` : `${t.green}22`,
                color:   overview.open_balance > 0 ? t.red : t.green,
                border:  `1px solid ${overview.open_balance > 0 ? t.red : t.green}44`,
                fontWeight: 700,
              }}
            />
          )}
          <Tooltip title="Refresh"><IconButton onClick={loadOverview} sx={{ color: t.sub }}><RefreshIcon /></IconButton></Tooltip>
        </Box>
      </Box>

      {error && <MuiAlert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</MuiAlert>}

      {/* Tabs */}
      <Tabs
        value={tab} onChange={(_, v) => setTab(v)}
        sx={{
          mb: 3, borderBottom: `1px solid ${t.border}`,
          '& .MuiTab-root': { color: t.sub, textTransform: 'none', fontWeight: 600 },
          '& .Mui-selected': { color: t.brand },
          '& .MuiTabs-indicator': { bgcolor: t.brand },
        }}
      >
        {TABS.map(l => <Tab key={l} label={l} />)}
      </Tabs>

      {tab === 0 && <OverviewTab data={overview} loading={loading} />}
      {tab === 1 && <InvoicesTab />}
      {tab === 2 && <UsageTab />}
      {tab === 3 && <PaymentMethodsTab />}

    </Box>
  );
}
