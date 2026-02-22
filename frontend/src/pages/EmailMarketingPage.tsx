// AtonixCorp Cloud – Email Marketing Page
// Tabs: Overview | Campaigns | Contacts | Templates | Automations

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Tab, Tabs, Button, Grid, Card, CardContent,
  Chip, IconButton, TextField, InputAdornment, Dialog, DialogTitle,
  DialogContent, DialogActions, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, MenuItem, Alert,
  Switch, FormControlLabel, Tooltip, CircularProgress, Divider,
  LinearProgress, Avatar,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import CampaignIcon        from '@mui/icons-material/Campaign';
import AddIcon             from '@mui/icons-material/Add';
import SearchIcon          from '@mui/icons-material/Search';
import DeleteIcon          from '@mui/icons-material/Delete';
import EditIcon            from '@mui/icons-material/Edit';
import SendIcon            from '@mui/icons-material/Send';
import ContentCopyIcon     from '@mui/icons-material/ContentCopy';
import UploadFileIcon      from '@mui/icons-material/UploadFile';
import DownloadIcon        from '@mui/icons-material/Download';
import CheckCircleIcon     from '@mui/icons-material/CheckCircle';
import PauseCircleIcon     from '@mui/icons-material/PauseCircle';
import ErrorOutlineIcon    from '@mui/icons-material/ErrorOutline';
import ScheduleIcon        from '@mui/icons-material/Schedule';
import AutorenewIcon       from '@mui/icons-material/Autorenew';
import DraftsIcon          from '@mui/icons-material/Drafts';
import PeopleAltIcon       from '@mui/icons-material/PeopleAlt';
import BarChartIcon        from '@mui/icons-material/BarChart';
import PlayArrowIcon       from '@mui/icons-material/PlayArrow';
import StopIcon            from '@mui/icons-material/Stop';
import AlternateEmailIcon  from '@mui/icons-material/AlternateEmail';

import { marketingApi } from '../services/cloudApi';
import type {
  Campaign, ContactList, Contact, EmailTemplate, Automation,
  AccountStats, CampaignStatus, CreateCampaignPayload,
} from '../types/marketing';

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatusChip({ status }: { status: CampaignStatus }) {
  const map: Record<CampaignStatus, { label: string; color: string; icon: React.ReactElement }> = {
    draft:     { label: 'Draft',     color: '#6B7280', icon: <DraftsIcon sx={{ fontSize: 13 }} /> },
    scheduled: { label: 'Scheduled', color: '#F59E0B', icon: <ScheduleIcon sx={{ fontSize: 13 }} /> },
    sending:   { label: 'Sending',   color: '#3B82F6', icon: <AutorenewIcon sx={{ fontSize: 13 }} /> },
    sent:      { label: 'Sent',      color: '#10B981', icon: <CheckCircleIcon sx={{ fontSize: 13 }} /> },
    paused:    { label: 'Paused',    color: '#F97316', icon: <PauseCircleIcon sx={{ fontSize: 13 }} /> },
    cancelled: { label: 'Cancelled', color: '#EF4444', icon: <ErrorOutlineIcon sx={{ fontSize: 13 }} /> },
    error:     { label: 'Error',     color: '#EF4444', icon: <ErrorOutlineIcon sx={{ fontSize: 13 }} /> },
  };
  const m = map[status] || map.draft;
  return (
    <Chip
      label={m.label}
      size="small"
      icon={m.icon}
      sx={{ bgcolor: `${m.color}22`, color: m.color,
            '& .MuiChip-icon': { color: m.color }, fontSize: 11 }}
    />
  );
}

function StatCard({ label, value, sub, color }:
  { label: string; value: string | number; sub?: string; color?: string }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Card sx={{ bgcolor: isDark ? '#132336' : '#FFFFFF',
                border: `1px solid ${isDark ? '#1E3A5F' : '#E5E7EB'}`,
                borderRadius: 2, height: '100%' }}>
      <CardContent>
        <Typography variant="caption" sx={{ color: isDark ? '#6b8aab' : '#6B7280', textTransform: 'uppercase', letterSpacing: 1 }}>
          {label}
        </Typography>
        <Typography variant="h4" fontWeight={700} sx={{ color: color || (isDark ? '#e0e9f4' : '#0A0F1F'), mt: 0.5 }}>
          {value}
        </Typography>
        {sub && (
          <Typography variant="caption" sx={{ color: isDark ? '#6b8aab' : '#6B7280' }}>
            {sub}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────────────────

const EMPTY_STATS: AccountStats = {
  campaigns: 0, sent_campaigns: 0, draft_campaigns: 0,
  contact_lists: 0, total_contacts: 0, total_sent: 0,
  avg_open_rate: 0, avg_click_rate: 0, avg_bounce_rate: 0,
  total_unsubscribes: 0,
};

function OverviewTab({ stats, loading }: { stats: AccountStats | null; loading: boolean }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const t = {
    cardBg: isDark ? '#132336' : '#FFFFFF',
    border:  isDark ? '#1E3A5F' : '#E5E7EB',
    text:    isDark ? '#e0e9f4' : '#0A0F1F',
    muted:   isDark ? '#6b8aab' : '#6B7280',
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>;
  }

  const st = stats ?? EMPTY_STATS;

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Sent',       value: st.total_sent.toLocaleString(),    color: '#3B82F6' },
          { label: 'Avg Open Rate',    value: `${st.avg_open_rate}%`,             color: '#10B981' },
          { label: 'Avg Click Rate',   value: `${st.avg_click_rate}%`,            color: '#F59E0B' },
          { label: 'Subscribers',      value: st.total_contacts.toLocaleString(), color: '#8B5CF6' },
        ].map(s => (
          <Grid size={{  }} key={s.label}>
            <StatCard {...s} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        {[
          { label: 'Campaigns',      value: st.campaigns },
          { label: 'Sent',           value: st.sent_campaigns },
          { label: 'Drafts',         value: st.draft_campaigns },
          { label: 'Contact Lists',  value: st.contact_lists },
          { label: 'Unsubscribes',   value: st.total_unsubscribes },
          { label: 'Avg Bounce',     value: `${st.avg_bounce_rate}%` },
        ].map(s => (
          <Grid size={{  }} key={s.label}>
            <Card sx={{ bgcolor: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 2 }}>
              <CardContent sx={{ py: 2 }}>
                <Typography sx={{ color: t.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
                  {s.label}
                </Typography>
                <Typography variant="h5" fontWeight={700} sx={{ color: t.text }}>
                  {s.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

// ── Campaigns Tab ─────────────────────────────────────────────────────────────

function CampaignsTab() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const t = {
    panelBg: isDark ? '#0D1826' : '#F9FAFB',
    cardBg:  isDark ? '#132336' : '#FFFFFF',
    border:  isDark ? '#1E3A5F' : '#E5E7EB',
    text:    isDark ? '#e0e9f4' : '#0A0F1F',
    muted:   isDark ? '#6b8aab' : '#6B7280',
    hover:   isDark ? '#102548' : '#EFF6FF',
  };

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState<Campaign | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [sending, setSending]     = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [testOpen, setTestOpen]   = useState(false);
  const [testTarget, setTestTarget] = useState<string | null>(null);
  const [err, setErr]             = useState('');
  const [ok, setOk]               = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await marketingApi.listCampaigns();
      setCampaigns((res as any).data || []);
    } catch { /* no-op */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = campaigns.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.subject.toLowerCase().includes(search.toLowerCase()));

  const handleSend = async (id: string) => {
    setSending(id);
    setErr(''); setOk('');
    try {
      const res: any = await marketingApi.sendCampaign(id);
      setOk(`Sent to ${res.data?.sent ?? 0} contacts.`);
      await load();
    } catch (e: any) {
      setErr(e.response?.data?.error || 'Send failed.');
    }
    setSending(null);
  };

  const handleDuplicate = async (id: string) => {
    try {
      await marketingApi.duplicateCampaign(id);
      await load();
    } catch { /* no-op */ }
  };

  const handleDelete = async (id: string) => {
    try {
      await marketingApi.deleteCampaign(id);
      setCampaigns(p => p.filter(c => c.resource_id !== id));
      if (selected?.resource_id === id) setSelected(null);
    } catch { /* no-op */ }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
      {/* List panel */}
      <Box sx={{ width: 340, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            size="small" placeholder="Search campaigns…" value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: t.muted, fontSize: 18 }} /></InputAdornment> }}
            sx={{ flex: 1 }}
          />
          <Button variant="contained" size="small"
            sx={{ bgcolor: '#18366A', '&:hover': { bgcolor: '#1E4D9B' }, whiteSpace: 'nowrap' }}
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}>New</Button>
        </Box>

        {err && <Alert severity="error" sx={{ mb: 1 }} onClose={() => setErr('')}>{err}</Alert>}
        {ok  && <Alert severity="success" sx={{ mb: 1 }} onClose={() => setOk('')}>{ok}</Alert>}

        {loading ? <LinearProgress /> : (
          filtered.map(c => (
            <Card key={c.resource_id}
              onClick={() => setSelected(c)}
              sx={{
                bgcolor: selected?.resource_id === c.resource_id ? t.hover : t.cardBg,
                border: `1px solid ${selected?.resource_id === c.resource_id ? '#18366A' : t.border}`,
                borderRadius: 2, mb: 1, cursor: 'pointer',
                '&:hover': { borderColor: '#18366A' },
              }}>
              <CardContent sx={{ py: '10px !important', px: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography fontWeight={600} sx={{ color: t.text, fontSize: 14, flex: 1, mr: 1 }}
                    noWrap>{c.name}</Typography>
                  <StatusChip status={c.status} />
                </Box>
                <Typography variant="caption" sx={{ color: t.muted }}>{c.subject}</Typography>
                {c.analytics && (
                  <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#10B981' }}>{c.analytics.open_rate}% opens</Typography>
                    <Typography variant="caption" sx={{ color: '#3B82F6' }}>{c.analytics.click_rate}% clicks</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </Box>

      {/* Detail / editor panel */}
      <Box sx={{ flex: 1, bgcolor: t.cardBg, border: `1px solid ${t.border}`,
                 borderRadius: 2, p: 3, minHeight: 400 }}>
        {selected ? (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={700} sx={{ color: t.text }}>{selected.name}</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Send test email">
                  <IconButton size="small" sx={{ color: '#F59E0B' }}
                    onClick={() => { setTestTarget(selected.resource_id); setTestOpen(true); }}>
                    <AlternateEmailIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Duplicate">
                  <IconButton size="small" sx={{ color: t.muted }}
                    onClick={() => handleDuplicate(selected.resource_id)}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" sx={{ color: '#EF4444' }}
                    onClick={() => handleDelete(selected.resource_id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                {['draft', 'scheduled'].includes(selected.status) && (
                  <Button variant="contained" size="small"
                    disabled={sending === selected.resource_id}
                    startIcon={sending === selected.resource_id
                      ? <CircularProgress size={14} /> : <SendIcon />}
                    sx={{ bgcolor: '#18366A', '&:hover': { bgcolor: '#1E4D9B' } }}
                    onClick={() => handleSend(selected.resource_id)}>
                    Send Now
                  </Button>
                )}
              </Box>
            </Box>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              {[
                { label: 'From',    value: `${selected.from_name} <${selected.from_email}>` },
                { label: 'Subject', value: selected.subject },
                { label: 'Lists',   value: selected.contact_lists?.map(l => l.name).join(', ') || '—' },
                { label: 'Sent',    value: selected.sent_at ? new Date(selected.sent_at).toLocaleString() : '—' },
              ].map(r => (
                <Grid size={{  }} key={r.label}>
                  <Typography variant="caption" sx={{ color: t.muted }}>{r.label}</Typography>
                  <Typography sx={{ color: t.text, fontSize: 14 }}>{r.value}</Typography>
                </Grid>
              ))}
            </Grid>

            {selected.analytics && (
              <>
                <Divider sx={{ my: 2, borderColor: t.border }} />
                <Typography variant="subtitle2" sx={{ color: t.muted, mb: 1 }}>Analytics</Typography>
                <Grid container spacing={1}>
                  {[
                    { k: 'Sent',     v: selected.analytics.total_sent,   c: '#3B82F6' },
                    { k: 'Opens',    v: `${selected.analytics.open_rate}%`, c: '#10B981' },
                    { k: 'Clicks',   v: `${selected.analytics.click_rate}%`, c: '#F59E0B' },
                    { k: 'Bounced',  v: `${selected.analytics.bounce_rate}%`, c: '#EF4444' },
                  ].map(s => (
                    <Grid size={{  }} key={s.k}>
                      <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: t.panelBg, borderRadius: 1 }}>
                        <Typography variant="h6" fontWeight={700} sx={{ color: s.c }}>{s.v}</Typography>
                        <Typography variant="caption" sx={{ color: t.muted }}>{s.k}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}

            <Divider sx={{ my: 2, borderColor: t.border }} />
            <Typography variant="caption" sx={{ color: t.muted }}>Preview (HTML body)</Typography>
            <Box sx={{ mt: 1, p: 2, bgcolor: '#fff', borderRadius: 1, maxHeight: 340, overflow: 'auto',
                       border: `1px solid ${t.border}` }}>
              <div dangerouslySetInnerHTML={{ __html: selected.html_body || '<em>No HTML body.</em>' }} />
            </Box>
          </>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
                     justifyContent: 'center', height: '100%', py: 8 }}>
            <CampaignIcon sx={{ fontSize: 60, color: t.muted, mb: 2 }} />
            <Typography sx={{ color: t.muted }}>Select a campaign to view details</Typography>
          </Box>
        )}
      </Box>

      {/* Send test dialog */}
      <Dialog open={testOpen} onClose={() => setTestOpen(false)}>
        <DialogTitle>Send Test Email</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Recipient email" value={testEmail}
            onChange={e => setTestEmail(e.target.value)} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestOpen(false)}>Cancel</Button>
          <Button variant="contained"
            onClick={async () => {
              if (testTarget) await marketingApi.sendTest(testTarget, testEmail);
              setTestOpen(false); setTestEmail('');
            }}>Send</Button>
        </DialogActions>
      </Dialog>

      {/* Create campaign dialog */}
      <CreateCampaignDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreated={load} />
    </Box>
  );
}

// ── Create Campaign Dialog ────────────────────────────────────────────────────

function CreateCampaignDialog({ open, onClose, onCreated }:
  { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState<Partial<CreateCampaignPayload>>({
    campaign_type: 'regular', track_opens: true, track_clicks: true,
    from_name: 'AtonixCorp', utm_medium: 'email',
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [lists, setLists] = useState<ContactList[]>([]);
  const [selectedLists, setSelectedLists] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      marketingApi.listContactLists().then((r: any) => setLists(r.data || [])).catch(() => {});
    }
  }, [open]);

  const set = (k: keyof CreateCampaignPayload) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }));

  const handleCreate = async () => {
    if (!form.name || !form.subject || !form.from_email) {
      setErr('Name, Subject and From Email are required.'); return;
    }
    setLoading(true); setErr('');
    try {
      await marketingApi.createCampaign({
        ...form,
        contact_list_ids: selectedLists,
      } as CreateCampaignPayload);
      onCreated(); onClose();
    } catch (e: any) {
      setErr(e.response?.data?.detail || 'Failed to create campaign.');
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>New Campaign</DialogTitle>
      <DialogContent>
        {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12 }}><TextField fullWidth label="Campaign Name *" value={form.name || ''} onChange={set('name')} /></Grid>
          <Grid size={{ xs: 6 }}><TextField fullWidth label="From Name *" value={form.from_name || ''} onChange={set('from_name')} /></Grid>
          <Grid size={{ xs: 6 }}><TextField fullWidth label="From Email *" value={form.from_email || ''} onChange={set('from_email')} /></Grid>
          <Grid size={{ xs: 12 }}><TextField fullWidth label="Subject *" value={form.subject || ''} onChange={set('subject')} /></Grid>
          <Grid size={{ xs: 12 }}><TextField fullWidth label="Preview Text" value={form.preview_text || ''} onChange={set('preview_text')} /></Grid>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth select label="Contact Lists" value={selectedLists} SelectProps={{ multiple: true }}
              onChange={e => setSelectedLists(typeof e.target.value === 'string' ? [e.target.value] : e.target.value as string[])}>
              {lists.map(l => <MenuItem key={l.resource_id} value={l.resource_id}>{l.name} ({l.subscriber_count})</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth multiline minRows={5} label="HTML Body"
              value={form.html_body || ''} onChange={set('html_body')}
              placeholder="<p>Hello {{ first_name }},</p>" />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={loading} onClick={handleCreate}
          sx={{ bgcolor: '#18366A', '&:hover': { bgcolor: '#1E4D9B' } }}>
          {loading ? <CircularProgress size={20} /> : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Contacts Tab ──────────────────────────────────────────────────────────────

function ContactsTab() {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const t = {
    cardBg: isDark ? '#132336' : '#FFFFFF',
    border: isDark ? '#1E3A5F' : '#E5E7EB',
    text:   isDark ? '#e0e9f4' : '#0A0F1F',
    muted:  isDark ? '#6b8aab' : '#6B7280',
    hover:  isDark ? '#102548' : '#EFF6FF',
  };

  const [lists, setLists]       = useState<ContactList[]>([]);
  const [selected, setSelected] = useState<ContactList | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch]     = useState('');
  const [csv, setCsv]           = useState('');
  const [importOpen, setImportOpen] = useState(false);
  const [addOpen, setAddOpen]   = useState(false);
  const [newList, setNewList]   = useState('');
  const [newContact, setNewContact] = useState({ email: '', first_name: '', last_name: '' });
  const [listDialogOpen, setListDialogOpen] = useState(false);

  useEffect(() => {
    marketingApi.listContactLists().then((r: any) => setLists(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (selected) {
      marketingApi.listContacts(selected.resource_id).then((r: any) => setContacts(r.data || [])).catch(() => {});
    }
  }, [selected]);

  const filtered = contacts.filter(c =>
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase()));

  const handleImport = async () => {
    if (!selected || !csv) return;
    await marketingApi.importContacts(selected.resource_id, csv);
    setImportOpen(false); setCsv('');
    const r: any = await marketingApi.listContacts(selected.resource_id);
    setContacts(r.data || []);
  };

  const handleAddContact = async () => {
    if (!selected || !newContact.email) return;
    await marketingApi.createContact({ ...newContact, contact_list_id: selected.resource_id });
    const r: any = await marketingApi.listContacts(selected.resource_id);
    setContacts(r.data || []);
    setAddOpen(false); setNewContact({ email: '', first_name: '', last_name: '' });
  };

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      {/* Lists sidebar */}
      <Box sx={{ width: 260, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography fontWeight={600} sx={{ color: t.text }}>Lists</Typography>
          <IconButton size="small" sx={{ color: '#18366A' }} onClick={() => setListDialogOpen(true)}>
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
        {lists.map(l => (
          <Card key={l.resource_id} onClick={() => { setSelected(l); setSearch(''); }}
            sx={{ bgcolor: selected?.resource_id === l.resource_id ? t.hover : t.cardBg,
                  border: `1px solid ${selected?.resource_id === l.resource_id ? '#18366A' : t.border}`,
                  borderRadius: 2, mb: 1, cursor: 'pointer', '&:hover': { borderColor: '#18366A' } }}>
            <CardContent sx={{ py: '10px !important', px: 2 }}>
              <Typography fontWeight={600} sx={{ color: t.text, fontSize: 14 }}>{l.name}</Typography>
              <Typography variant="caption" sx={{ color: t.muted }}>
                {l.subscriber_count} subscribers
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Contacts panel */}
      <Box sx={{ flex: 1 }}>
        {selected ? (
          <>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField size="small" placeholder="Search contacts…" value={search}
                onChange={e => setSearch(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: t.muted, fontSize: 18 }} /></InputAdornment> }}
                sx={{ flex: 1 }} />
              <Button variant="outlined" size="small" startIcon={<UploadFileIcon />}
                onClick={() => setImportOpen(true)}>Import CSV</Button>
              <Button variant="contained" size="small" startIcon={<AddIcon />}
                sx={{ bgcolor: '#18366A', '&:hover': { bgcolor: '#1E4D9B' } }}
                onClick={() => setAddOpen(true)}>Add</Button>
            </Box>

            <TableContainer component={Paper} sx={{ bgcolor: t.cardBg, border: `1px solid ${t.border}` }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: isDark ? '#0D1826' : '#F3F4F6' }}>
                    {['Email', 'Name', 'Status', 'Subscribed', ''].map(h => (
                      <TableCell key={h} sx={{ color: t.muted, fontWeight: 600, fontSize: 12 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map(c => (
                    <TableRow key={c.id} sx={{ '&:hover': { bgcolor: t.hover } }}>
                      <TableCell sx={{ color: t.text, fontSize: 13 }}>{c.email}</TableCell>
                      <TableCell sx={{ color: t.text, fontSize: 13 }}>{c.first_name} {c.last_name}</TableCell>
                      <TableCell>
                        <Chip label={c.status} size="small"
                          sx={{ bgcolor: c.status === 'subscribed' ? '#10B98122' : '#EF444422',
                                color: c.status === 'subscribed' ? '#10B981' : '#EF4444', fontSize: 11 }} />
                      </TableCell>
                      <TableCell sx={{ color: t.muted, fontSize: 12 }}>
                        {c.subscribed_at ? new Date(c.subscribed_at).toLocaleDateString() : '—'}
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" sx={{ color: '#EF4444' }}
                          onClick={() => marketingApi.deleteContact(c.id).then(() =>
                            setContacts(p => p.filter(x => x.id !== c.id))).catch(() => {})}>
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
            <Typography sx={{ color: t.muted }}>Select a contact list</Typography>
          </Box>
        )}
      </Box>

      {/* Import CSV dialog */}
      <Dialog open={importOpen} onClose={() => setImportOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import Contacts (CSV)</DialogTitle>
        <DialogContent>
          <Typography variant="caption" sx={{ color: t.muted }}>
            Header row: email, first_name, last_name (extra columns → custom fields)
          </Typography>
          <TextField fullWidth multiline minRows={6} sx={{ mt: 1 }}
            placeholder="email,first_name,last_name&#10;alice@example.com,Alice,Smith"
            value={csv} onChange={e => setCsv(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleImport}
            sx={{ bgcolor: '#18366A', '&:hover': { bgcolor: '#1E4D9B' } }}>Import</Button>
        </DialogActions>
      </Dialog>

      {/* Add contact dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)}>
        <DialogTitle>Add Contact</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12 }}><TextField fullWidth label="Email *" value={newContact.email}
              onChange={e => setNewContact(p => ({ ...p, email: e.target.value }))} /></Grid>
            <Grid size={{ xs: 6 }}><TextField fullWidth label="First Name" value={newContact.first_name}
              onChange={e => setNewContact(p => ({ ...p, first_name: e.target.value }))} /></Grid>
            <Grid size={{ xs: 6 }}><TextField fullWidth label="Last Name" value={newContact.last_name}
              onChange={e => setNewContact(p => ({ ...p, last_name: e.target.value }))} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddContact}
            sx={{ bgcolor: '#18366A', '&:hover': { bgcolor: '#1E4D9B' } }}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* New list dialog */}
      <Dialog open={listDialogOpen} onClose={() => setListDialogOpen(false)}>
        <DialogTitle>New Contact List</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth label="List Name" sx={{ mt: 1 }}
            value={newList} onChange={e => setNewList(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setListDialogOpen(false)}>Cancel</Button>
          <Button variant="contained"
            onClick={async () => {
              await marketingApi.createContactList({ name: newList });
              const r: any = await marketingApi.listContactLists();
              setLists(r.data || []);
              setListDialogOpen(false); setNewList('');
            }}
            sx={{ bgcolor: '#18366A', '&:hover': { bgcolor: '#1E4D9B' } }}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ── Templates Tab ─────────────────────────────────────────────────────────────

function TemplatesTab() {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const t = {
    cardBg: isDark ? '#132336' : '#FFFFFF',
    border: isDark ? '#1E3A5F' : '#E5E7EB',
    text:   isDark ? '#e0e9f4' : '#0A0F1F',
    muted:  isDark ? '#6b8aab' : '#6B7280',
  };

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [editOpen, setEditOpen]   = useState(false);
  const [editing, setEditing]     = useState<Partial<EmailTemplate> | null>(null);
  const [search, setSearch]       = useState('');

  useEffect(() => {
    marketingApi.listTemplates().then((r: any) => setTemplates(r.data || [])).catch(() => {});
  }, []);

  const load = () => marketingApi.listTemplates().then((r: any) => setTemplates(r.data || [])).catch(() => {});

  const filtered = templates.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async () => {
    if (!editing) return;
    if (editing.resource_id) {
      await marketingApi.updateTemplate(editing.resource_id, editing as any);
    } else {
      await marketingApi.createTemplate(editing as any);
    }
    setEditOpen(false); setEditing(null); load();
  };

  const CATEGORY_COLOR: Record<string, string> = {
    newsletter: '#3B82F6', promotional: '#F59E0B', transactional: '#10B981',
    welcome: '#8B5CF6', announcement: '#EF4444', custom: '#6B7280',
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField size="small" placeholder="Search templates…" value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: t.muted, fontSize: 18 }} /></InputAdornment> }}
          sx={{ width: 280 }} />
        <Button variant="contained" size="small" startIcon={<AddIcon />}
          sx={{ bgcolor: '#18366A', '&:hover': { bgcolor: '#1E4D9B' } }}
          onClick={() => { setEditing({ category: 'newsletter' }); setEditOpen(true); }}>
          New Template
        </Button>
      </Box>

      <Grid container spacing={2}>
        {filtered.map(tpl => (
          <Grid size={{  }} key={tpl.resource_id}>
            <Card sx={{ bgcolor: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 2 }}>
              <Box sx={{ height: 120, bgcolor: isDark ? '#0D1826' : '#F3F4F6',
                         display: 'flex', alignItems: 'center', justifyContent: 'center',
                         borderRadius: '8px 8px 0 0', overflow: 'hidden' }}>
                {tpl.thumbnail_url
                  ? <img src={tpl.thumbnail_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <Typography sx={{ color: t.muted, fontSize: 12 }}>No preview</Typography>}
              </Box>
              <CardContent sx={{ pt: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography fontWeight={600} sx={{ color: t.text, fontSize: 14 }} noWrap>{tpl.name}</Typography>
                  <Chip label={tpl.category} size="small"
                    sx={{ bgcolor: `${CATEGORY_COLOR[tpl.category] || '#6B7280'}22`,
                          color: CATEGORY_COLOR[tpl.category] || '#6B7280', fontSize: 10 }} />
                </Box>
                <Typography variant="caption" sx={{ color: t.muted }}>{tpl.subject}</Typography>
                <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                  <Tooltip title="Edit"><IconButton size="small" sx={{ color: '#3B82F6' }}
                    onClick={() => { setEditing({ ...tpl }); setEditOpen(true); }}>
                    <EditIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                  <Tooltip title="Duplicate"><IconButton size="small" sx={{ color: t.muted }}
                    onClick={() => marketingApi.duplicateTemplate(tpl.resource_id).then(load).catch(() => {})}>
                    <ContentCopyIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton size="small" sx={{ color: '#EF4444' }}
                    onClick={() => marketingApi.deleteTemplate(tpl.resource_id).then(load).catch(() => {})}>
                    <DeleteIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Edit dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing?.resource_id ? 'Edit Template' : 'New Template'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 8 }}><TextField fullWidth label="Name" value={editing?.name || ''}
              onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} /></Grid>
            <Grid size={{ xs: 4 }}><TextField fullWidth select label="Category" value={editing?.category || 'newsletter'}
              onChange={e => setEditing(p => ({ ...p, category: e.target.value as any }))}>
              {['newsletter','promotional','transactional','welcome','announcement','custom']
                .map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField></Grid>
            <Grid size={{ xs: 12 }}><TextField fullWidth label="Subject" value={editing?.subject || ''}
              onChange={e => setEditing(p => ({ ...p, subject: e.target.value }))} /></Grid>
            <Grid size={{ xs: 12 }}><TextField fullWidth label="Preview Text" value={editing?.preview_text || ''}
              onChange={e => setEditing(p => ({ ...p, preview_text: e.target.value }))} /></Grid>
            <Grid size={{ xs: 12 }}><TextField fullWidth multiline minRows={8} label="HTML Body"
              value={editing?.html_body || ''}
              onChange={e => setEditing(p => ({ ...p, html_body: e.target.value }))} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}
            sx={{ bgcolor: '#18366A', '&:hover': { bgcolor: '#1E4D9B' } }}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ── Automations Tab ───────────────────────────────────────────────────────────

function AutomationsTab() {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const t = {
    cardBg: isDark ? '#132336' : '#FFFFFF',
    border: isDark ? '#1E3A5F' : '#E5E7EB',
    text:   isDark ? '#e0e9f4' : '#0A0F1F',
    muted:  isDark ? '#6b8aab' : '#6B7280',
  };

  const [automations, setAutomations] = useState<Automation[]>([]);

  useEffect(() => {
    marketingApi.listAutomations().then((r: any) => setAutomations(r.data || [])).catch(() => {});
  }, []);

  const load = () => marketingApi.listAutomations().then((r: any) => setAutomations(r.data || [])).catch(() => {});

  const TRIGGER_COLOR: Record<string, string> = {
    subscribe: '#10B981', unsubscribe: '#EF4444', date_field: '#F59E0B',
    campaign_open: '#3B82F6', campaign_click: '#8B5CF6', manual: '#6B7280',
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" size="small" startIcon={<AddIcon />}
          sx={{ bgcolor: '#18366A', '&:hover': { bgcolor: '#1E4D9B' } }}>
          New Automation
        </Button>
      </Box>

      {automations.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <AutorenewIcon sx={{ fontSize: 60, color: t.muted, mb: 2 }} />
          <Typography sx={{ color: t.muted }}>No automations yet. Create one to get started.</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {automations.map(a => (
            <Grid size={{  }} key={a.resource_id}>
              <Card sx={{ bgcolor: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography fontWeight={600} sx={{ color: t.text }}>{a.name}</Typography>
                      <Chip label={a.trigger.replace('_', ' ')} size="small"
                        sx={{ mt: 0.5,
                              bgcolor: `${TRIGGER_COLOR[a.trigger] || '#6B7280'}22`,
                              color: TRIGGER_COLOR[a.trigger] || '#6B7280', fontSize: 11 }} />
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch checked={a.is_active} size="small" color="primary"
                          onChange={() => (a.is_active
                            ? marketingApi.deactivateAutomation(a.resource_id)
                            : marketingApi.activateAutomation(a.resource_id)
                          ).then(load).catch(() => {})}
                        />
                      }
                      label={<Typography variant="caption" sx={{ color: t.muted }}>
                        {a.is_active ? 'Active' : 'Inactive'}
                      </Typography>}
                    />
                  </Box>

                  <Typography variant="caption" sx={{ color: t.muted, display: 'block', mt: 1 }}>
                    {a.steps.length} step{a.steps.length !== 1 ? 's' : ''}
                  </Typography>

                  {/* Steps timeline */}
                  <Box sx={{ mt: 1.5 }}>
                    {a.steps.map((step, i) => (
                      <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 1 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Avatar sx={{ width: 24, height: 24, bgcolor: '#18366A', fontSize: 11 }}>{i + 1}</Avatar>
                          {i < a.steps.length - 1 && (
                            <Box sx={{ width: 2, flex: 1, bgcolor: t.border, minHeight: 16 }} />
                          )}
                        </Box>
                        <Box sx={{ pb: i < a.steps.length - 1 ? 1 : 0 }}>
                          <Typography sx={{ color: t.text, fontSize: 13 }}>{step.subject}</Typography>
                          <Typography variant="caption" sx={{ color: t.muted }}>
                            {step.delay_days === 0 ? 'Immediately' : `After ${step.delay_days} day${step.delay_days !== 1 ? 's' : ''}`}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <IconButton size="small" sx={{ color: '#EF4444' }}
                      onClick={() => marketingApi.deleteAutomation(a.resource_id).then(load).catch(() => {})}>
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function EmailMarketingPage() {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const t = {
    panelBg: isDark ? '#0D1826' : '#F9FAFB',
    text:    isDark ? '#e0e9f4' : '#0A0F1F',
    muted:   isDark ? '#6b8aab' : '#6B7280',
    border:  isDark ? '#1E3A5F' : '#E5E7EB',
  };

  const [tab, setTab]          = useState(0);
  const [stats, setStats]       = useState<AccountStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    marketingApi.accountStats()
      .then((r: any) => setStats(r.data))
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  return (
    <Box sx={{ p: 3, bgcolor: t.panelBg, minHeight: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <CampaignIcon sx={{ color: '#18366A', fontSize: 32 }} />
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ color: t.text }}>
            Email Marketing
          </Typography>
          <Typography variant="body2" sx={{ color: t.muted }}>
            Campaigns · Contact Lists · Templates · Automations
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tab} onChange={(_, v) => setTab(v)}
        sx={{
          mb: 3,
          borderBottom: `1px solid ${t.border}`,
          '& .MuiTab-root': { color: t.muted, textTransform: 'none', fontWeight: 500 },
          '& .Mui-selected': { color: '#18366A !important' },
          '& .MuiTabs-indicator': { bgcolor: '#18366A' },
        }}>
        <Tab label="Overview" icon={<BarChartIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
        <Tab label="Campaigns" icon={<CampaignIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
        <Tab label="Contacts" icon={<PeopleAltIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
        <Tab label="Templates" icon={<EditIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
        <Tab label="Automations" icon={<AutorenewIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
      </Tabs>

      {/* Tab content */}
      {tab === 0 && <OverviewTab stats={stats} loading={statsLoading} />}
      {tab === 1 && <CampaignsTab />}
      {tab === 2 && <ContactsTab />}
      {tab === 3 && <TemplatesTab />}
      {tab === 4 && <AutomationsTab />}
    </Box>
  );
}
