// AtonixCorp Cloud – Cloud Storage page
import React, { useEffect, useState, useCallback } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box, Typography, Button, Chip, Stack, Tabs, Tab,
  IconButton, Tooltip, Alert, CircularProgress,
  Table, TableHead, TableRow, TableCell, TableBody,
  TextField, MenuItem, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Switch, Snackbar,
  LinearProgress, Divider,
} from '@mui/material';
import StorageIcon          from '@mui/icons-material/Storage';
import AddIcon              from '@mui/icons-material/Add';
import DeleteIcon           from '@mui/icons-material/Delete';
import RefreshIcon          from '@mui/icons-material/Refresh';
import LockIcon             from '@mui/icons-material/Lock';
import PublicIcon           from '@mui/icons-material/Public';
import HistoryIcon          from '@mui/icons-material/History';
import ShieldIcon           from '@mui/icons-material/Shield';
import CloudSyncIcon        from '@mui/icons-material/CloudSync';
import LinkIcon             from '@mui/icons-material/Link';
import UploadIcon           from '@mui/icons-material/Upload';
import FolderOpenIcon       from '@mui/icons-material/FolderOpen';
import SearchIcon           from '@mui/icons-material/Search';
import ContentCopyIcon      from '@mui/icons-material/ContentCopy';
import WarningAmberIcon     from '@mui/icons-material/WarningAmber';
import CheckCircleIcon      from '@mui/icons-material/CheckCircle';
import AccessTimeIcon       from '@mui/icons-material/AccessTime';

import type { StorageBucket, S3Object, LifecycleRule } from '../types/storage';
import { storageApi } from '../services/cloudApi';
import CreateBucketModal   from '../components/Cloud/CreateBucketModal';

// ── colour helpers ────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  active:   'success',
  creating: 'warning',
  deleting: 'error',
};

const SC_LABEL: Record<string, string> = {
  'standard':            'Standard',
  'standard-ia':         'Standard-IA',
  'intelligent-tiering': 'Intelligent',
  'glacier':             'Glacier',
  'deep-archive':        'Deep Archive',
};
const SC_COLOR: Record<string, string> = {
  'standard':            '#60a5fa',
  'standard-ia':         '#a78bfa',
  'intelligent-tiering': '#34d399',
  'glacier':             '#f59e0b',
  'deep-archive':        '#ef4444',
};

const fmt = {
  bytes: (n: number) => {
    if (n < 1024) return `${n} B`;
    if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
    if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
    return `${(n / 1024 ** 3).toFixed(2)} GB`;
  },
  date: (s: string) => s ? new Date(s).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : '—',
};

// ── small atoms (receive tokens as props so they are theme-aware) ─────────────

const SectionLabel: React.FC<{ children: React.ReactNode; color: string }> = ({ children, color }) => (
  <Typography sx={{ fontSize: 10, color, letterSpacing: 1, fontWeight: 700 }}>{children}</Typography>
);

const KVRow: React.FC<{ label: string; value: React.ReactNode; border: string; muted: string; text: string }> =
  ({ label, value, border, muted, text }) => (
    <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', py:.75, borderBottom:`1px solid ${border}` }}>
      <Typography sx={{ fontSize:12, color: muted }}>{label}</Typography>
      <Typography sx={{ fontSize:13, color: text, fontWeight:500 }}>{value}</Typography>
    </Box>
  );

interface TabPanelProps { children?: React.ReactNode; index: number; value: number; }
const TabPanel: React.FC<TabPanelProps> = ({ children, index, value }) =>
  value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;

// ── main component ────────────────────────────────────────────────────────────

const StoragePage: React.FC = () => {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // ── colour tokens ────────────────────────────────────────────────────────
  const tokens = {
    panelBg: isDark ? '#0D1826' : '#F9FAFB',
    cardBg:  isDark ? '#132336' : '#FFFFFF',
    border:  isDark ? '#1E3A5F' : '#E5E7EB',
    brand:   '#18366A',
    hover:   isDark ? '#102548' : '#EFF6FF',
    text:    isDark ? '#e0e9f4' : '#0A0F1F',
    muted:   isDark ? '#6b8aab' : '#6B7280',
    subBg:   isDark ? '#060d18' : '#F3F4F6',
    codeBg:  isDark ? '#060d18' : '#1e1e2e',
    chipBg:  isDark ? '#1a2d47' : '#EFF6FF',
    snackBg: isDark ? '#132336' : '#FFFFFF',
  };
  const [buckets,     setBuckets]     = useState<StorageBucket[]>([]);
  const [selected,    setSelected]    = useState<StorageBucket | null>(null);
  const [tabIdx,      setTabIdx]      = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [search,      setSearch]      = useState('');
  const [objects,     setObjects]     = useState<S3Object[]>([]);
  const [objLoading,  setObjLoading]  = useState(false);
  const [createOpen,  setCreateOpen]  = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StorageBucket | null>(null);
  const [deleteInput,  setDeleteInput]  = useState('');
  const [deleting,     setDeleting]     = useState(false);
  const [snack,        setSnack]        = useState('');
  const [syncLoading,  setSyncLoading]  = useState(false);
  const [syncResult,   setSyncResult]   = useState<string>('');
  const [lifecycleRules, setLifecycleRules] = useState<LifecycleRule[]>([]);
  const [lcLoading,    setLcLoading]    = useState(false);

  // ── data fetching ──────────────────────────────────────────────────────────

  const loadBuckets = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await storageApi.list();
      const data: StorageBucket[] = Array.isArray(res.data)
        ? res.data : (res.data as any).results ?? [];
      setBuckets(data);
    } catch {
      setError('Failed to load buckets.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBuckets(); }, [loadBuckets]);

  const loadObjects = useCallback(async (b: StorageBucket) => {
    setObjLoading(true);
    try {
      const res = await storageApi.objects(b.resource_id);
      const data: S3Object[] = Array.isArray(res.data)
        ? res.data : (res.data as any).results ?? [];
      setObjects(data);
    } catch {
      setObjects([]);
    } finally {
      setObjLoading(false);
    }
  }, []);

  const loadLifecycle = useCallback(async (b: StorageBucket) => {
    setLcLoading(true);
    try {
      const res = await storageApi.getLifecycle(b.resource_id);
      setLifecycleRules(res.data.rules ?? []);
    } catch {
      setLifecycleRules([]);
    } finally {
      setLcLoading(false);
    }
  }, []);

  const selectBucket = (b: StorageBucket) => {
    setSelected(b); setTabIdx(0); setObjects([]); setSyncResult('');
  };

  const handleTabChange = (_: React.SyntheticEvent, v: number) => {
    setTabIdx(v);
    if (v === 1 && selected && objects.length === 0) loadObjects(selected);
    if (v === 3 && selected) loadLifecycle(selected);
  };

  // ── actions ────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await storageApi.delete(deleteTarget.resource_id);
      setBuckets(bs => bs.filter(b => b.resource_id !== deleteTarget.resource_id));
      if (selected?.resource_id === deleteTarget.resource_id) setSelected(null);
      setSnack('Bucket deleted.');
    } catch {
      setSnack('Failed to delete bucket.');
    } finally {
      setDeleting(false); setDeleteTarget(null); setDeleteInput('');
    }
  };

  const handleSwiftSync = async () => {
    if (!selected) return;
    setSyncLoading(true); setSyncResult('');
    try {
      const res = await storageApi.swiftSync(selected.resource_id);
      const d = res.data as any;
      setSyncResult(d.success
        ? `Synced  ${d.mock ? '(mock)' : ''}  →  ${d.endpoint || ''}`
        : `Error: ${d.error}`);
      if (d.success) {
        setBuckets(bs => bs.map(b =>
          b.resource_id === selected.resource_id ? { ...b, status: 'active' } : b));
        setSelected(s => s ? { ...s, status: 'active' } : s);
      }
    } catch {
      setSyncResult('Swift sync failed.');
    } finally {
      setSyncLoading(false);
    }
  };

  const handlePresignedUrl = async (obj: S3Object) => {
    if (!selected) return;
    try {
      const res = await storageApi.presignedUrl(selected.resource_id, obj.object_key);
      await navigator.clipboard.writeText((res.data as any).url);
      setSnack('Pre-signed URL copied to clipboard.');
    } catch {
      setSnack('Failed to generate URL.');
    }
  };

  // ── filtered list ──────────────────────────────────────────────────────────

  const filtered = search
    ? buckets.filter(b => b.bucket_name.toLowerCase().includes(search.toLowerCase()) ||
                          b.region.includes(search.toLowerCase()))
    : buckets;

  // ── endpoint helper ────────────────────────────────────────────────────────

  const endpoint = (b: StorageBucket) =>
    `https://storage.atonixcorp.com/${b.region}/${b.bucket_name}`;

  const boto3Snippet = (b: StorageBucket) =>
`import boto3
s3 = boto3.client(
    's3',
    endpoint_url='${endpoint(b)}',
    aws_access_key_id='<ACCESS_KEY>',
    aws_secret_access_key='<SECRET_KEY>',
)
# List objects
response = s3.list_objects_v2(Bucket='${b.bucket_name}')`;

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════════

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', bgcolor: tokens.panelBg, overflow: 'hidden' }}>

      {/* ── Header ── */}
      <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${tokens.border}`, display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
        <StorageIcon sx={{ color: '#60a5fa', fontSize: 26 }} />
        <Box flex={1}>
          <Typography sx={{ fontSize: 18, fontWeight: 700, color: tokens.text }}>Cloud Storage</Typography>
          <Typography sx={{ fontSize: 12, color: tokens.muted }}>
            OpenStack Swift — S3-compatible object storage
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadBuckets}
          sx={{ border: `1px solid ${tokens.border}`, color: tokens.muted, fontSize: 12, height: 34, '&:hover': { borderColor: '#60a5fa', color: '#60a5fa' } }}>
          Refresh
        </Button>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}
          sx={{ bgcolor: tokens.brand, '&:hover': { bgcolor: tokens.hover }, height: 34, fontSize: 12 }}>
          Create Bucket
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mx: 3, mt: 1 }}>{error}</Alert>}
      {loading && <LinearProgress sx={{ bgcolor: tokens.border, '& .MuiLinearProgress-bar': { bgcolor: '#60a5fa' } }} />}

      {/* ── Two-panel body ── */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ════ LEFT PANEL – bucket list ════ */}
        <Box sx={{ width: 320, flexShrink: 0, borderRight: `1px solid ${tokens.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* search */}
          <Box sx={{ p: 1.5, borderBottom: `1px solid ${tokens.border}` }}>
            <TextField size="small" fullWidth placeholder="Filter buckets…"
              value={search} onChange={e => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: tokens.muted }} /></InputAdornment>,
                sx: { bgcolor: tokens.cardBg, color: tokens.text, fontSize: 13, borderRadius: 1,
                      '& fieldset': { borderColor: tokens.border } },
              }}
            />
          </Box>

          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            {!loading && filtered.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <FolderOpenIcon sx={{ fontSize: 48, color: tokens.muted, mb: 1 }} />
                <Typography sx={{ color: tokens.muted, fontSize: 13, mb: 2 }}>No buckets yet</Typography>
                <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}
                  sx={{ bgcolor: tokens.brand, '&:hover': { bgcolor: tokens.hover }, fontSize: 12 }}>
                  Create Bucket
                </Button>
              </Box>
            ) : filtered.map(b => (
              <Box key={b.resource_id} onClick={() => selectBucket(b)}
                sx={{
                  px: 2, py: 1.5, cursor: 'pointer', borderBottom: `1px solid ${tokens.border}`,
                  bgcolor: selected?.resource_id === b.resource_id ? tokens.hover : 'transparent',
                  '&:hover': { bgcolor: tokens.hover },
                  borderLeft: selected?.resource_id === b.resource_id ? `3px solid #60a5fa` : '3px solid transparent',
                }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: tokens.text, wordBreak: 'break-all' }}>
                    {b.bucket_name}
                  </Typography>
                  <Chip label={b.status || 'active'} size="small"
                    color={STATUS_COLOR[b.status ?? 'active'] ?? 'default'}
                    sx={{ fontSize: 10, height: 18, ml: 1 }} />
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: .5 }}>
                  <Typography sx={{ fontSize: 11, color: tokens.muted }}>{b.region}</Typography>
                  <Typography sx={{ fontSize: 11, color: tokens.muted }}>·</Typography>
                  <Typography sx={{ fontSize: 11, color: tokens.muted }}>{b.total_objects} objects</Typography>
                  <Typography sx={{ fontSize: 11, color: tokens.muted }}>·</Typography>
                  <Typography sx={{ fontSize: 11, color: tokens.muted }}>{(b.total_size_gb ?? 0).toFixed(2)} GB</Typography>
                </Stack>
                <Stack direction="row" spacing={.5} sx={{ mt: .75 }}>
                  {b.versioning_enabled &&
                    <Chip icon={<HistoryIcon sx={{ fontSize: 10 }} />} label="Versioning" size="small"
                      sx={{ fontSize: 10, height: 18, bgcolor: tokens.chipBg, color: '#a78bfa' }} />}
                  {b.encryption_enabled &&
                    <Chip icon={<ShieldIcon sx={{ fontSize: 10 }} />} label="Encrypted" size="small"
                      sx={{ fontSize: 10, height: 18, bgcolor: tokens.chipBg, color: '#34d399' }} />}
                  {b.acl !== 'private' &&
                    <Chip icon={<PublicIcon sx={{ fontSize: 10 }} />} label={b.acl} size="small"
                      sx={{ fontSize: 10, height: 18, bgcolor: isDark ? '#2d1a1a' : '#FEF2F2', color: '#f87171' }} />}
                </Stack>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ════ RIGHT PANEL – detail ════ */}
        {selected ? (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* bucket header */}
            <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${tokens.border}`, display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
              <StorageIcon sx={{ color: '#60a5fa' }} />
              <Box flex={1}>
                <Typography sx={{ fontSize: 16, fontWeight: 700, color: tokens.text }}>{selected.bucket_name}</Typography>
                <Typography sx={{ fontSize: 12, color: tokens.muted }}>
                  {selected.region} · {selected.total_objects} objects · {(selected.total_size_gb ?? 0).toFixed(4)} GB
                </Typography>
              </Box>
              <Tooltip title="Delete bucket">
                <IconButton size="small" onClick={() => setDeleteTarget(selected)}
                  sx={{ color: '#f87171', '&:hover': { bgcolor: '#2d1515' } }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            {/* tabs */}
            <Tabs value={tabIdx} onChange={handleTabChange}
              sx={{
                px: 2, borderBottom: `1px solid ${tokens.border}`, flexShrink: 0,
                '& .MuiTab-root': { fontSize: 12, color: tokens.muted, minHeight: 42, textTransform: 'none' },
                '& .Mui-selected': { color: tokens.text },
                '& .MuiTabs-indicator': { bgcolor: '#60a5fa' },
              }}>
              <Tab label="Overview" />
              <Tab label="Objects" />
              <Tab label="Settings" />
              <Tab label="Lifecycle" />
              <Tab label="Swift Sync" />
            </Tabs>

            <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2 }}>

              {/* ── Tab 0: Overview ── */}
              <TabPanel value={tabIdx} index={0}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                  {[
                    { label: 'Objects',    value: selected.total_objects },
                    { label: 'Total Size', value: `${(selected.total_size_gb ?? 0).toFixed(4)} GB` },
                    { label: 'Region',     value: selected.region },
                    { label: 'Access',     value: selected.acl },
                  ].map(s => (
                    <Box key={s.label} sx={{ bgcolor: tokens.cardBg, border: `1px solid ${tokens.border}`, borderRadius: 2, p: 2 }}>
                      <SectionLabel color={tokens.muted}>{s.label}</SectionLabel>
                      <Typography sx={{ fontSize: 22, fontWeight: 700, color: tokens.text, mt: .5 }}>{s.value}</Typography>
                    </Box>
                  ))}
                </Box>

                <Box sx={{ mb: 3 }}>
                  <SectionLabel color={tokens.muted}>ENDPOINT URL</SectionLabel>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: .5 }}>
                    <Typography sx={{ fontSize: 12, color: '#60a5fa', fontFamily: 'monospace', flex: 1, wordBreak: 'break-all' }}>
                      {endpoint(selected)}
                    </Typography>
                    <Tooltip title="Copy">
                      <IconButton size="small" onClick={() => { navigator.clipboard.writeText(endpoint(selected)); setSnack('Copied.'); }}
                        sx={{ color: tokens.muted }}>
                        <ContentCopyIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <SectionLabel color={tokens.muted}>CONFIGURATION</SectionLabel>
                  <Box sx={{ bgcolor: tokens.cardBg, border: `1px solid ${tokens.border}`, borderRadius: 2, p: 2, mt: .5 }}>
                    <KVRow label="Access Control"  value={selected.acl} border={tokens.border} muted={tokens.muted} text={tokens.text} />
                    <KVRow label="Encryption"      value={selected.encryption_enabled ? selected.encryption_type?.toUpperCase() : 'Disabled'} border={tokens.border} muted={tokens.muted} text={tokens.text} />
                    <KVRow label="Versioning"       value={selected.versioning_enabled ? 'Enabled' : 'Disabled'} border={tokens.border} muted={tokens.muted} text={tokens.text} />
                    <KVRow label="Logging"          value={selected.logging_enabled ? selected.log_target_bucket || 'Enabled' : 'Disabled'} border={tokens.border} muted={tokens.muted} text={tokens.text} />
                    <KVRow label="Owner"            value={selected.owner_username} border={tokens.border} muted={tokens.muted} text={tokens.text} />
                    <KVRow label="Created"          value={fmt.date(selected.created_at)} border={tokens.border} muted={tokens.muted} text={tokens.text} />
                  </Box>
                </Box>

                <Box>
                  <SectionLabel color={tokens.muted}>QUICK START (PYTHON / BOTO3)</SectionLabel>
                  <Box component="pre" sx={{
                    mt: .5, p: 2, bgcolor: tokens.codeBg, border: `1px solid ${tokens.border}`, borderRadius: 2,
                    fontSize: 11, color: '#63f576', fontFamily: 'monospace', overflowX: 'auto', lineHeight: 1.6,
                  }}>
                    {boto3Snippet(selected)}
                  </Box>
                </Box>
              </TabPanel>

              {/* ── Tab 1: Objects ── */}
              <TabPanel value={tabIdx} index={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography sx={{ fontSize: 13, color: tokens.muted }}>{objects.length} objects</Typography>
                  <Button size="small" startIcon={<UploadIcon />} variant="outlined"
                    sx={{ border: `1px solid ${tokens.border}`, color: tokens.muted, fontSize: 11, height: 30 }}>
                    Upload Object
                  </Button>
                </Stack>
                {objLoading ? (
                  <Box sx={{ textAlign: 'center', pt: 4 }}><CircularProgress size={24} sx={{ color: '#60a5fa' }} /></Box>
                ) : objects.length === 0 ? (
                  <Box sx={{ textAlign: 'center', pt: 4 }}>
                    <FolderOpenIcon sx={{ fontSize: 40, color: tokens.muted, mb: 1 }} />
                    <Typography sx={{ color: tokens.muted, fontSize: 13 }}>No objects in this bucket.</Typography>
                  </Box>
                ) : (
                  <Table size="small" sx={{ '& td, & th': { borderColor: tokens.border, fontSize: 12 } }}>
                    <TableHead>
                      <TableRow>
                        {['Key', 'Size', 'Type', 'Storage Class', 'Access', 'Modified', ''].map(h => (
                          <TableCell key={h} sx={{ color: tokens.muted, fontWeight: 700 }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {objects.map(o => (
                        <TableRow key={o.id} sx={{ '&:hover': { bgcolor: tokens.hover } }}>
                          <TableCell sx={{ color: tokens.text, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {o.object_key}
                          </TableCell>
                          <TableCell sx={{ color: tokens.muted }}>{fmt.bytes(o.size_bytes)}</TableCell>
                          <TableCell sx={{ color: tokens.muted }}>{o.content_type || '—'}</TableCell>
                          <TableCell>
                            <Chip label={SC_LABEL[o.storage_class] || o.storage_class} size="small"
                              sx={{ fontSize: 10, height: 18, bgcolor: tokens.chipBg, color: SC_COLOR[o.storage_class] || tokens.muted }} />
                          </TableCell>
                          <TableCell>
                            {o.is_public
                              ? <Chip icon={<PublicIcon sx={{ fontSize: 10 }} />} label="Public" size="small"
                                  sx={{ fontSize: 10, height: 18, color: '#f87171', bgcolor: isDark ? '#2d1a1a' : '#FEF2F2' }} />
                              : <Chip icon={<LockIcon sx={{ fontSize: 10 }} />} label="Private" size="small"
                                  sx={{ fontSize: 10, height: 18, color: tokens.muted, bgcolor: tokens.chipBg }} />}
                          </TableCell>
                          <TableCell sx={{ color: tokens.muted }}>{fmt.date(o.last_modified)}</TableCell>
                          <TableCell>
                            <Tooltip title="Copy pre-signed URL">
                              <IconButton size="small" onClick={() => handlePresignedUrl(o)} sx={{ color: tokens.muted }}>
                                <LinkIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabPanel>

              {/* ── Tab 2: Settings ── */}
              <TabPanel value={tabIdx} index={2}>
                <Box sx={{ bgcolor: tokens.cardBg, border: `1px solid ${tokens.border}`, borderRadius: 2, p: 2.5 }}>
                  <Stack spacing={2.5}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: tokens.text }}>Object Versioning</Typography>
                        <Typography sx={{ fontSize: 11, color: tokens.muted }}>Keep multiple copies of every object</Typography>
                      </Box>
                      <Switch checked={selected.versioning_enabled} size="small"
                        onChange={async (e) => {
                          if (e.target.checked) {
                            try {
                              await storageApi.enableVersioning(selected.resource_id);
                              setSelected(s => s ? { ...s, versioning_enabled: true } : s);
                              setSnack('Versioning enabled.');
                            } catch { setSnack('Failed.'); }
                          }
                        }}
                      />
                    </Box>
                    <Divider sx={{ borderColor: tokens.border }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: tokens.text }}>Server-side Encryption</Typography>
                        <Typography sx={{ fontSize: 11, color: tokens.muted }}>Encrypt objects at rest · {selected.encryption_type?.toUpperCase()}</Typography>
                      </Box>
                      <Chip label={selected.encryption_enabled ? 'Enabled' : 'Disabled'} size="small"
                        color={selected.encryption_enabled ? 'success' : 'default'}
                        sx={{ fontSize: 11 }} />
                    </Box>
                    <Divider sx={{ borderColor: tokens.border }} />
                    <Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, color: tokens.text, mb: .5 }}>Access Control</Typography>
                      <TextField select size="small" value={selected.acl} fullWidth
                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: tokens.subBg, color: tokens.text }, '& fieldset': { borderColor: tokens.border } }}>
                        {['private','public-read','public-read-write','authenticated-read'].map(v => (
                          <MenuItem key={v} value={v} sx={{ fontSize: 12 }}>{v}</MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  </Stack>
                </Box>
              </TabPanel>

              {/* ── Tab 3: Lifecycle ── */}
              <TabPanel value={tabIdx} index={3}>
                {lcLoading ? (
                  <Box sx={{ textAlign: 'center', pt: 4 }}><CircularProgress size={24} sx={{ color: '#60a5fa' }} /></Box>
                ) : (
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography sx={{ fontSize: 13, color: tokens.muted }}>{lifecycleRules.length} rule{lifecycleRules.length !== 1 ? 's' : ''}</Typography>
                      <Button size="small" startIcon={<AddIcon />} variant="outlined"
                        sx={{ border: `1px solid ${tokens.border}`, color: tokens.muted, fontSize: 11, height: 30 }}>
                        Add Rule
                      </Button>
                    </Stack>
                    {lifecycleRules.length === 0 ? (
                      <Box sx={{ textAlign: 'center', pt: 4 }}>
                        <AccessTimeIcon sx={{ fontSize: 40, color: tokens.muted, mb: 1 }} />
                        <Typography sx={{ color: tokens.muted, fontSize: 13 }}>No lifecycle rules configured.</Typography>
                        <Typography sx={{ color: tokens.muted, fontSize: 12, mt: .5 }}>
                          Lifecycle rules auto-transition objects to cheaper tiers over time.
                        </Typography>
                      </Box>
                    ) : (
                      <Table size="small" sx={{ '& td, & th': { borderColor: tokens.border, fontSize: 12 } }}>
                        <TableHead>
                          <TableRow>
                            {['Prefix','Status','Days → Cold','Days → Archive','Expiration'].map(h => (
                              <TableCell key={h} sx={{ color: tokens.muted, fontWeight: 700 }}>{h}</TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {lifecycleRules.map(r => (
                            <TableRow key={r.id}>
                              <TableCell sx={{ color: tokens.text }}>{r.prefix || '(all)'}</TableCell>
                              <TableCell>
                                <Chip label={r.status} size="small" color={r.status === 'Enabled' ? 'success' : 'default'} sx={{ fontSize: 10, height: 18 }} />
                              </TableCell>
                              <TableCell sx={{ color: tokens.muted }}>{r.transition_days_cold}d</TableCell>
                              <TableCell sx={{ color: tokens.muted }}>{r.transition_days_archive}d</TableCell>
                              <TableCell sx={{ color: tokens.muted }}>{r.expiration_days > 0 ? `${r.expiration_days}d` : '—'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </Stack>
                )}
              </TabPanel>

              {/* ── Tab 4: Swift Sync ── */}
              <TabPanel value={tabIdx} index={4}>
                <Box sx={{ bgcolor: tokens.cardBg, border: `1px solid ${tokens.border}`, borderRadius: 2, p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                    <CloudSyncIcon sx={{ color: '#60a5fa', fontSize: 28 }} />
                    <Box>
                      <Typography sx={{ fontSize: 14, fontWeight: 700, color: tokens.text }}>OpenStack Swift Sync</Typography>
                      <Typography sx={{ fontSize: 12, color: tokens.muted }}>
                        Provision or update the Swift container corresponding to this bucket.
                      </Typography>
                    </Box>
                  </Stack>
                  <Divider sx={{ borderColor: tokens.border, mb: 2 }} />
                  <KVRow label="Container name" value={selected.bucket_name} border={tokens.border} muted={tokens.muted} text={tokens.text} />
                  <KVRow label="Swift region"   value={selected.region} border={tokens.border} muted={tokens.muted} text={tokens.text} />
                  <KVRow label="ACL policy"     value={selected.acl === 'public-read' ? '.r:*' : 'private'} border={tokens.border} muted={tokens.muted} text={tokens.text} />
                  <KVRow label="Last sync status" value={
                    selected.status === 'active'
                      ? <Chip icon={<CheckCircleIcon sx={{ fontSize: 12 }} />} label="Active" size="small" color="success" sx={{ fontSize: 10, height: 18 }} />
                      : <Chip icon={<WarningAmberIcon sx={{ fontSize: 12 }} />} label={selected.status || 'Unknown'} size="small" color="warning" sx={{ fontSize: 10, height: 18 }} />
                  } border={tokens.border} muted={tokens.muted} text={tokens.text} />

                  {syncResult && (
                    <Alert severity={syncResult.startsWith('Error') || syncResult.startsWith('Swift') ? 'error' : 'success'}
                      sx={{ mt: 2, fontSize: 12 }}>
                      {syncResult}
                    </Alert>
                  )}

                  <Button variant="contained" startIcon={syncLoading ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <CloudSyncIcon />}
                    disabled={syncLoading} onClick={handleSwiftSync}
                    sx={{ mt: 2.5, bgcolor: tokens.brand, '&:hover': { bgcolor: tokens.hover } }}>
                    {syncLoading ? 'Syncing…' : 'Sync to Swift'}
                  </Button>
                </Box>
              </TabPanel>

            </Box>
          </Box>
        ) : (
          /* ── empty right panel ── */
          !loading && (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <StorageIcon sx={{ fontSize: 52, color: tokens.muted }} />
              <Typography sx={{ fontSize: 16, color: tokens.muted, fontWeight: 600 }}>Select a bucket</Typography>
              <Typography sx={{ fontSize: 13, color: tokens.muted, textAlign: 'center', maxWidth: 300 }}>
                Choose a bucket from the list, or create a new one to get started.
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}
                sx={{ bgcolor: tokens.brand, '&:hover': { bgcolor: tokens.hover }, mt: 1 }}>
                Create Bucket
              </Button>
            </Box>
          )
        )}
      </Box>

      {/* ── Modals & snackbar ── */}
      <CreateBucketModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => { setCreateOpen(false); loadBuckets(); setSnack('Bucket created.'); }}
      />

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onClose={() => { setDeleteTarget(null); setDeleteInput(''); }}
        PaperProps={{ sx: { bgcolor: tokens.cardBg, border: `1px solid ${tokens.border}` } }}>
        <DialogTitle sx={{ color: '#f87171' }}>Delete Bucket</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2, fontSize: 12 }}>
            This will permanently delete <strong>{deleteTarget?.bucket_name}</strong> and all its objects.
          </Alert>
          <Typography sx={{ fontSize: 12, color: tokens.muted, mb: 1 }}>
            Type <strong style={{ color: tokens.text }}>{deleteTarget?.bucket_name}</strong> to confirm.
          </Typography>
          <TextField size="small" fullWidth value={deleteInput} onChange={e => setDeleteInput(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: tokens.cardBg, color: tokens.text }, '& fieldset': { borderColor: tokens.border } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setDeleteTarget(null); setDeleteInput(''); }} sx={{ color: tokens.muted }}>Cancel</Button>
          <Button variant="contained" color="error" disabled={deleteInput !== deleteTarget?.bucket_name || deleting}
            onClick={handleDelete}>
            {deleting ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3500} onClose={() => setSnack('')}
        message={snack} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        ContentProps={{ sx: { bgcolor: tokens.snackBg, color: tokens.text, border: `1px solid ${tokens.border}` } }}
      />
    </Box>
  );
};

export default StoragePage;
