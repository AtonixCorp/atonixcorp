// AtonixCorp Cloud – IAM (Identity & Access Management) Page
// Users, Groups, Roles, Policies, Access Keys, MFA, Audit Logs

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Stack, Chip, Tabs, Tab,
  Table, TableHead, TableRow, TableCell, TableBody,
  Button, IconButton, Tooltip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, InputAdornment, Alert,
  Switch, FormControlLabel, Divider, Grid,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PersonIcon          from '@mui/icons-material/Person';
import GroupsIcon          from '@mui/icons-material/Groups';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PolicyIcon          from '@mui/icons-material/Policy';
import KeyIcon             from '@mui/icons-material/Key';
import SecurityIcon        from '@mui/icons-material/Security';
import HistoryIcon         from '@mui/icons-material/History';
import AddIcon             from '@mui/icons-material/Add';
import DeleteIcon          from '@mui/icons-material/Delete';
import EditIcon            from '@mui/icons-material/Edit';
import RefreshIcon         from '@mui/icons-material/Refresh';
import SearchIcon          from '@mui/icons-material/Search';
import CheckCircleIcon     from '@mui/icons-material/CheckCircle';
import CancelIcon          from '@mui/icons-material/Cancel';
import LockIcon            from '@mui/icons-material/Lock';
import LockOpenIcon        from '@mui/icons-material/LockOpen';
import ContentCopyIcon     from '@mui/icons-material/ContentCopy';
import SimCardDownloadIcon from '@mui/icons-material/SimCardDownload';
import PlayArrowIcon       from '@mui/icons-material/PlayArrow';
import {
  dashboardTokens,
  dashboardSemanticColors,
} from '../styles/dashboardDesignSystem';
import { iamApi } from '../services/cloudApi';

// ── Design tokens ─────────────────────────────────────────────────────────────
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

// ── Status helpers ────────────────────────────────────────────────────────────
const CELL_SX = { fontFamily: FONT, fontSize: '0.8rem', color: TEXT, borderColor: BORDER, py: 1.2 };
const HEAD_SX = { fontFamily: FONT, fontSize: '0.68rem', color: MUTED, fontWeight: 700, borderColor: BORDER, py: 1, textTransform: 'uppercase' as const, letterSpacing: '0.04em' };

function MFAChip({ enabled }: { enabled: boolean }) {
  return (
    <Chip
      icon={enabled ? <CheckCircleIcon sx={{ fontSize: 12, color: `${SUCCESS}!important` }} /> : <CancelIcon sx={{ fontSize: 12, color: `${MUTED}!important` }} />}
      label={enabled ? 'MFA On' : 'No MFA'}
      size="small"
      sx={{
        fontFamily: FONT, fontSize: '0.65rem', fontWeight: 700, height: 20,
        bgcolor: enabled ? `${SUCCESS}1a` : `${MUTED}18`,
        color: enabled ? SUCCESS : MUTED,
        border: `1px solid ${enabled ? SUCCESS : MUTED}33`,
      }}
    />
  );
}

function StatusChip({ active }: { active: boolean }) {
  return (
    <Chip
      label={active ? 'Active' : 'Inactive'}
      size="small"
      sx={{
        fontFamily: FONT, fontSize: '0.65rem', fontWeight: 700, height: 20,
        bgcolor: active ? `${SUCCESS}1a` : `${DANGER}1a`,
        color: active ? SUCCESS : DANGER,
        border: `1px solid ${active ? SUCCESS : DANGER}33`,
      }}
    />
  );
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_USERS = [
  { id: 1, username: 'alice.nguyen', email: 'alice@atonixcorp.com', is_active: true, mfa_enabled: true, groups: ['Admins', 'DevOps'], access_key_count: 2, last_login: '2026-02-27T10:30:00Z', console_access: true, programmatic_access: true },
  { id: 2, username: 'bob.smith', email: 'bob@atonixcorp.com', is_active: true, mfa_enabled: true, groups: ['Developers'], access_key_count: 1, last_login: '2026-02-26T14:22:00Z', console_access: true, programmatic_access: true },
  { id: 3, username: 'carol.jones', email: 'carol@atonixcorp.com', is_active: true, mfa_enabled: false, groups: ['Analysts'], access_key_count: 0, last_login: '2026-02-25T09:15:00Z', console_access: true, programmatic_access: false },
  { id: 4, username: 'svc-deploy', email: 'svc-deploy@system', is_active: true, mfa_enabled: false, groups: ['ServiceAccounts'], access_key_count: 1, last_login: null, console_access: false, programmatic_access: true },
  { id: 5, username: 'dave.wilson', email: 'dave@atonixcorp.com', is_active: false, mfa_enabled: false, groups: [], access_key_count: 0, last_login: '2026-01-10T11:00:00Z', console_access: false, programmatic_access: false },
];

const MOCK_GROUPS = [
  { id: 1, name: 'Admins',          member_count: 3,  policies: ['AtonixFullAccess'],              description: 'Full platform administrators' },
  { id: 2, name: 'Developers',      member_count: 12, policies: ['ComputeAccess', 'StorageAccess'], description: 'Engineering team' },
  { id: 3, name: 'DevOps',          member_count: 5,  policies: ['InfraAccess', 'DeployAccess'],    description: 'Infrastructure and CI/CD' },
  { id: 4, name: 'Analysts',        member_count: 7,  policies: ['ReadOnly'],                      description: 'Business analytics' },
  { id: 5, name: 'ServiceAccounts', member_count: 4,  policies: ['ServicePolicy'],                  description: 'Automated service accounts' },
];

const MOCK_ROLES = [
  { id: 1, name: 'AtonixAdminRole',        trust_principal_type: 'user',    is_service_role: false, permission_policies: ['AtonixFullAccess'], last_used: '2026-02-27T08:00:00Z' },
  { id: 2, name: 'DeploymentServiceRole',  trust_principal_type: 'service', is_service_role: true,  permission_policies: ['DeployAccess', 'ContainerAccess'], last_used: '2026-02-27T10:15:00Z' },
  { id: 3, name: 'BackupServiceRole',      trust_principal_type: 'service', is_service_role: true,  permission_policies: ['StorageReadWrite'], last_used: '2026-02-26T23:00:00Z' },
  { id: 4, name: 'ReadOnlyCrossAccount',   trust_principal_type: 'cross_account', is_service_role: false, permission_policies: ['ReadOnly'], last_used: null },
];

const MOCK_POLICIES = [
  { id: 1, name: 'AtonixFullAccess',    policy_type: 'managed', is_atonix_managed: true,  attachment_count: 1 },
  { id: 2, name: 'ComputeAccess',       policy_type: 'managed', is_atonix_managed: false, attachment_count: 3 },
  { id: 3, name: 'StorageAccess',       policy_type: 'managed', is_atonix_managed: false, attachment_count: 5 },
  { id: 4, name: 'ReadOnly',            policy_type: 'managed', is_atonix_managed: true,  attachment_count: 8 },
  { id: 5, name: 'DeployAccess',        policy_type: 'inline',  is_atonix_managed: false, attachment_count: 2 },
  { id: 6, name: 'InfraAccess',         policy_type: 'managed', is_atonix_managed: false, attachment_count: 1 },
];

const MOCK_AUDIT = [
  { id: 1, event_id: 'a1', actor_username: 'alice.nguyen', event_type: 'iam.CreateUser', resource_type: 'User', resource_id: 'dave.wilson', outcome: 'success', actor_ip: '10.0.1.5', created_at: '2026-02-27T11:00:00Z' },
  { id: 2, event_id: 'a2', actor_username: 'alice.nguyen', event_type: 'iam.AttachPolicy', resource_type: 'Group', resource_id: 'Developers', outcome: 'success', actor_ip: '10.0.1.5', created_at: '2026-02-27T10:45:00Z' },
  { id: 3, event_id: 'a3', actor_username: 'bob.smith',   event_type: 'iam.CreateAccessKey', resource_type: 'User', resource_id: 'svc-deploy', outcome: 'success', actor_ip: '10.0.1.12', created_at: '2026-02-26T16:30:00Z' },
  { id: 4, event_id: 'a4', actor_username: 'unknown',     event_type: 'iam.AssumeRole', resource_type: 'Role', resource_id: 'AtonixAdminRole', outcome: 'denied', actor_ip: '198.51.100.42', created_at: '2026-02-26T03:12:00Z' },
  { id: 5, event_id: 'a5', actor_username: 'carol.jones', event_type: 'iam.DeleteAccessKey', resource_type: 'AccessKey', resource_id: 'AKD4F...', outcome: 'success', actor_ip: '10.0.2.8', created_at: '2026-02-25T11:20:00Z' },
];

const TABS = [
  { label: 'Users',      icon: <PersonIcon sx={{ fontSize: 16 }} /> },
  { label: 'Groups',     icon: <GroupsIcon sx={{ fontSize: 16 }} /> },
  { label: 'Roles',      icon: <AdminPanelSettingsIcon sx={{ fontSize: 16 }} /> },
  { label: 'Policies',   icon: <PolicyIcon sx={{ fontSize: 16 }} /> },
  { label: 'Access Keys',icon: <KeyIcon sx={{ fontSize: 16 }} /> },
  { label: 'Audit Log',  icon: <HistoryIcon sx={{ fontSize: 16 }} /> },
];

function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── IAM Overview Cards ────────────────────────────────────────────────────────
function OverviewCards({ users, groups, roles, policies }: { users: any[]; groups: any[]; roles: any[]; policies: any[] }) {
  const mfaEnabled = users.filter(u => u.mfa_enabled).length;
  const mfaPct = users.length ? Math.round((mfaEnabled / users.length) * 100) : 0;
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {[
        { label: 'Total Users', value: users.length, sub: `${users.filter(u => u.is_active).length} active`, color: BRAND, icon: <PersonIcon /> },
        { label: 'MFA Coverage', value: `${mfaPct}%`, sub: `${mfaEnabled}/${users.length} users`, color: mfaPct >= 80 ? SUCCESS : mfaPct >= 50 ? WARNING : DANGER, icon: <SecurityIcon /> },
        { label: 'Groups', value: groups.length, sub: `${groups.reduce((s, g) => s + g.member_count, 0)} memberships`, color: PURPLE, icon: <GroupsIcon /> },
        { label: 'Roles', value: roles.length, sub: `${roles.filter(r => r.is_service_role).length} service roles`, color: '#06B6D4', icon: <AdminPanelSettingsIcon /> },
        { label: 'Policies', value: policies.length, sub: `${policies.filter(p => p.is_atonix_managed).length} managed`, color: WARNING, icon: <PolicyIcon /> },
        { label: 'No MFA Users', value: users.filter(u => u.is_active && !u.mfa_enabled).length, sub: 'Require attention', color: users.filter(u => u.is_active && !u.mfa_enabled).length > 0 ? DANGER : SUCCESS, icon: <LockOpenIcon /> },
      ].map(c => (
        <Grid size={{ xs: 6, sm: 4, md: 2 }} key={c.label}>
          <Box sx={{ bgcolor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 1, p: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography sx={{ fontFamily: FONT, fontSize: '0.68rem', color: MUTED, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>{c.label}</Typography>
                <Typography sx={{ fontFamily: FONT, fontSize: '1.5rem', fontWeight: 800, color: TEXT, lineHeight: 1 }}>{c.value}</Typography>
                <Typography sx={{ fontFamily: FONT, fontSize: '0.7rem', color: MUTED, mt: 0.3 }}>{c.sub}</Typography>
              </Box>
              <Box sx={{ color: c.color, bgcolor: `${c.color}18`, borderRadius: 1, p: 0.75 }}>{c.icon}</Box>
            </Stack>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
const IAMPage: React.FC = () => {
  const [tab, setTab]         = useState(0);
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(false);
  const [users,    setUsers]    = useState<any[]>(MOCK_USERS);
  const [groups,   setGroups]   = useState<any[]>(MOCK_GROUPS);
  const [roles,    setRoles]    = useState<any[]>(MOCK_ROLES);
  const [policies, setPolicies] = useState<any[]>(MOCK_POLICIES);
  const [audit,    setAudit]    = useState<any[]>(MOCK_AUDIT);
  const [snackMsg, setSnackMsg] = useState('');

  // Simulate policy simulator dialog
  const [simOpen,    setSimOpen]    = useState(false);
  const [simAction,  setSimAction]  = useState('compute.StartInstance');
  const [simPolicy,  setSimPolicy]  = useState<string>('');
  const [simResult,  setSimResult]  = useState<string | null>(null);

  const handleSimulate = () => {
    // Mock result
    setSimResult(simAction.startsWith('compute') ? 'allow' : 'implicit_deny');
  };

  const q = search.toLowerCase();

  // ── Render users tab ───────────────────────────────────────────────────────
  const renderUsers = () => {
    const filtered = users.filter(u => u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    return (
      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.85rem', color: TEXT }}>
            {filtered.length} user{filtered.length !== 1 ? 's' : ''}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button size="small" startIcon={<AddIcon />} variant="contained"
              sx={{ fontFamily: FONT, textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', bgcolor: BRAND, '&:hover': { bgcolor: dashboardTokens.colors.brandPrimaryHover } }}>
              Add User
            </Button>
          </Stack>
        </Stack>
        <Table size="small">
          <TableHead>
            <TableRow>
              {['Username', 'Email', 'Status', 'MFA', 'Groups', 'Keys', 'Console', 'Last Login', ''].map(h => (
                <TableCell key={h} sx={HEAD_SX}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(u => (
              <TableRow key={u.id} sx={{ '&:hover': { bgcolor: SURFACE2 } }}>
                <TableCell sx={{ ...CELL_SX, fontWeight: 600 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: `${BRAND}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: BRAND }}>
                        {u.username.charAt(0).toUpperCase()}
                      </Typography>
                    </Box>
                    <span>{u.username}</span>
                  </Stack>
                </TableCell>
                <TableCell sx={{ ...CELL_SX, color: MUTED }}>{u.email}</TableCell>
                <TableCell sx={CELL_SX}><StatusChip active={u.is_active} /></TableCell>
                <TableCell sx={CELL_SX}><MFAChip enabled={u.mfa_enabled} /></TableCell>
                <TableCell sx={{ ...CELL_SX, color: MUTED }}>{u.groups.join(', ') || '—'}</TableCell>
                <TableCell sx={{ ...CELL_SX, color: TEXT }}>{u.access_key_count}</TableCell>
                <TableCell sx={CELL_SX}>
                  <Chip label={u.console_access ? 'Yes' : 'No'} size="small"
                    sx={{ fontSize: '0.65rem', height: 18, bgcolor: u.console_access ? `${SUCCESS}1a` : `${MUTED}18`, color: u.console_access ? SUCCESS : MUTED }} />
                </TableCell>
                <TableCell sx={{ ...CELL_SX, color: MUTED, fontSize: '0.72rem' }}>{fmtDate(u.last_login)}</TableCell>
                <TableCell sx={CELL_SX}>
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Edit">
                      <IconButton size="small" sx={{ color: MUTED, '&:hover': { color: BRAND } }}><EditIcon sx={{ fontSize: 14 }} /></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" sx={{ color: MUTED, '&:hover': { color: DANGER } }}><DeleteIcon sx={{ fontSize: 14 }} /></IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    );
  };

  // ── Render groups tab ──────────────────────────────────────────────────────
  const renderGroups = () => {
    const filtered = groups.filter(g => g.name.toLowerCase().includes(q));
    return (
      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.85rem', color: TEXT }}>{filtered.length} groups</Typography>
          <Button size="small" startIcon={<AddIcon />} variant="contained" sx={{ fontFamily: FONT, textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', bgcolor: BRAND, '&:hover': { bgcolor: dashboardTokens.colors.brandPrimaryHover } }}>
            Create Group
          </Button>
        </Stack>
        <Table size="small">
          <TableHead>
            <TableRow>
              {['Group Name', 'Description', 'Members', 'Policies', ''].map(h => (
                <TableCell key={h} sx={HEAD_SX}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(g => (
              <TableRow key={g.id} sx={{ '&:hover': { bgcolor: SURFACE2 } }}>
                <TableCell sx={{ ...CELL_SX, fontWeight: 600 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <GroupsIcon sx={{ fontSize: 16, color: PURPLE }} />
                    <span>{g.name}</span>
                  </Stack>
                </TableCell>
                <TableCell sx={{ ...CELL_SX, color: MUTED }}>{g.description}</TableCell>
                <TableCell sx={{ ...CELL_SX, fontWeight: 700 }}>{g.member_count}</TableCell>
                <TableCell sx={CELL_SX}>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                    {g.policies.map((p: string) => (
                      <Chip key={p} label={p} size="small" sx={{ fontSize: '0.65rem', height: 18, bgcolor: `${BRAND}18`, color: BRAND, mb: 0.3 }} />
                    ))}
                  </Stack>
                </TableCell>
                <TableCell sx={CELL_SX}>
                  <Stack direction="row" spacing={0.5}>
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

  // ── Render roles tab ───────────────────────────────────────────────────────
  const renderRoles = () => {
    const filtered = roles.filter(r => r.name.toLowerCase().includes(q));
    return (
      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.85rem', color: TEXT }}>{filtered.length} roles</Typography>
          <Button size="small" startIcon={<AddIcon />} variant="contained" sx={{ fontFamily: FONT, textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', bgcolor: BRAND, '&:hover': { bgcolor: dashboardTokens.colors.brandPrimaryHover } }}>
            Create Role
          </Button>
        </Stack>
        <Table size="small">
          <TableHead>
            <TableRow>
              {['Role Name', 'Trust Principal', 'Type', 'Policies', 'Last Used', ''].map(h => (
                <TableCell key={h} sx={HEAD_SX}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(r => (
              <TableRow key={r.id} sx={{ '&:hover': { bgcolor: SURFACE2 } }}>
                <TableCell sx={{ ...CELL_SX, fontWeight: 600 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <AdminPanelSettingsIcon sx={{ fontSize: 16, color: '#06B6D4' }} />
                    <span>{r.name}</span>
                  </Stack>
                </TableCell>
                <TableCell sx={{ ...CELL_SX, color: MUTED, textTransform: 'capitalize' }}>
                  {r.trust_principal_type.replace('_', ' ')}
                </TableCell>
                <TableCell sx={CELL_SX}>
                  <Chip label={r.is_service_role ? 'Service' : 'User'} size="small"
                    sx={{ fontSize: '0.65rem', height: 18, bgcolor: r.is_service_role ? `${WARNING}18` : `${BRAND}18`, color: r.is_service_role ? WARNING : BRAND }} />
                </TableCell>
                <TableCell sx={{ ...CELL_SX, color: MUTED }}>{r.permission_policies.join(', ')}</TableCell>
                <TableCell sx={{ ...CELL_SX, color: MUTED, fontSize: '0.72rem' }}>{fmtDate(r.last_used)}</TableCell>
                <TableCell sx={CELL_SX}>
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Assume Role">
                      <IconButton size="small" sx={{ color: MUTED, '&:hover': { color: SUCCESS } }}><PlayArrowIcon sx={{ fontSize: 14 }} /></IconButton>
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

  // ── Render policies tab ────────────────────────────────────────────────────
  const renderPolicies = () => {
    const filtered = policies.filter(p => p.name.toLowerCase().includes(q));
    const typeColor: Record<string, string> = { managed: BRAND, inline: PURPLE, service: WARNING };
    return (
      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.85rem', color: TEXT }}>{filtered.length} policies</Typography>
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="outlined" startIcon={<PlayArrowIcon />}
              onClick={() => setSimOpen(true)}
              sx={{ fontFamily: FONT, textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', borderColor: BORDER, color: TEXT }}>
              Policy Simulator
            </Button>
            <Button size="small" startIcon={<AddIcon />} variant="contained" sx={{ fontFamily: FONT, textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', bgcolor: BRAND, '&:hover': { bgcolor: dashboardTokens.colors.brandPrimaryHover } }}>
              Create Policy
            </Button>
          </Stack>
        </Stack>
        <Table size="small">
          <TableHead>
            <TableRow>
              {['Policy Name', 'Type', 'Managed By', 'Attachments', ''].map(h => (
                <TableCell key={h} sx={HEAD_SX}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(p => (
              <TableRow key={p.id} sx={{ '&:hover': { bgcolor: SURFACE2 } }}>
                <TableCell sx={{ ...CELL_SX, fontWeight: 600 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <PolicyIcon sx={{ fontSize: 16, color: typeColor[p.policy_type] || BRAND }} />
                    <span>{p.name}</span>
                  </Stack>
                </TableCell>
                <TableCell sx={CELL_SX}>
                  <Chip label={p.policy_type} size="small"
                    sx={{ fontSize: '0.65rem', height: 18, bgcolor: `${typeColor[p.policy_type]}18`, color: typeColor[p.policy_type], textTransform: 'capitalize' }} />
                </TableCell>
                <TableCell sx={CELL_SX}>
                  <Chip label={p.is_atonix_managed ? 'AtonixCorp' : 'Customer'} size="small"
                    sx={{ fontSize: '0.65rem', height: 18, bgcolor: `${p.is_atonix_managed ? SUCCESS : MUTED}18`, color: p.is_atonix_managed ? SUCCESS : MUTED }} />
                </TableCell>
                <TableCell sx={{ ...CELL_SX, fontWeight: 700 }}>{p.attachment_count}</TableCell>
                <TableCell sx={CELL_SX}>
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Edit"><IconButton size="small" sx={{ color: MUTED, '&:hover': { color: BRAND } }}><EditIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton size="small" sx={{ color: MUTED, '&:hover': { color: DANGER } }}><DeleteIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Policy Simulator Dialog */}
        <Dialog open={simOpen} onClose={() => { setSimOpen(false); setSimResult(null); }} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 1 } }}>
          <DialogTitle sx={{ fontFamily: FONT, fontWeight: 700, color: TEXT, fontSize: '0.95rem', borderBottom: `1px solid ${BORDER}`, pb: 1.5 }}>
            Policy Simulator
          </DialogTitle>
          <DialogContent sx={{ pt: 2.5 }}>
            <Stack spacing={2}>
              <TextField select label="Policy" value={simPolicy} onChange={e => setSimPolicy(e.target.value)} size="small" fullWidth
                sx={{ '& .MuiInputBase-root': { fontFamily: FONT, bgcolor: SURFACE2 } }}
                InputLabelProps={{ sx: { fontFamily: FONT, fontSize: '0.8rem', color: MUTED } }}>
                {policies.map(p => <MenuItem key={p.id} value={p.name} sx={{ fontFamily: FONT, fontSize: '0.8rem' }}>{p.name}</MenuItem>)}
              </TextField>
              <TextField label="Action (e.g. compute.StartInstance)" value={simAction} onChange={e => setSimAction(e.target.value)} size="small" fullWidth
                sx={{ '& .MuiInputBase-root': { fontFamily: FONT, bgcolor: SURFACE2 } }}
                InputLabelProps={{ sx: { fontFamily: FONT, fontSize: '0.8rem', color: MUTED } }} />
              {simResult && (
                <Box sx={{ bgcolor: simResult === 'allow' ? `${SUCCESS}18` : `${DANGER}18`, border: `1px solid ${simResult === 'allow' ? SUCCESS : DANGER}33`, borderRadius: 1, p: 1.5 }}>
                  <Typography sx={{ fontFamily: FONT, fontWeight: 700, color: simResult === 'allow' ? SUCCESS : DANGER, fontSize: '0.85rem' }}>
                    Result: {simResult.replace('_', ' ').toUpperCase()}
                  </Typography>
                </Box>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ borderTop: `1px solid ${BORDER}`, px: 3, py: 1.5 }}>
            <Button onClick={() => { setSimOpen(false); setSimResult(null); }} sx={{ fontFamily: FONT, textTransform: 'none', color: MUTED }}>Cancel</Button>
            <Button onClick={handleSimulate} variant="contained" sx={{ fontFamily: FONT, textTransform: 'none', bgcolor: BRAND }}>Simulate</Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };

  // ── Render audit log tab ───────────────────────────────────────────────────
  const renderAudit = () => {
    const filtered = audit.filter(a =>
      a.event_type.toLowerCase().includes(q) ||
      a.actor_username.toLowerCase().includes(q)
    );
    const outcomeColor: Record<string, string> = { success: SUCCESS, failure: DANGER, denied: DANGER };
    return (
      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.85rem', color: TEXT }}>{filtered.length} events</Typography>
          <Button size="small" startIcon={<SimCardDownloadIcon />} variant="outlined"
            sx={{ fontFamily: FONT, textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', borderColor: BORDER, color: TEXT }}>
            Export
          </Button>
        </Stack>
        <Table size="small">
          <TableHead>
            <TableRow>
              {['Time', 'Actor', 'Event Type', 'Resource', 'IP', 'Outcome'].map(h => (
                <TableCell key={h} sx={HEAD_SX}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(a => (
              <TableRow key={a.id} sx={{ '&:hover': { bgcolor: SURFACE2 } }}>
                <TableCell sx={{ ...CELL_SX, color: MUTED, fontSize: '0.72rem' }}>{fmtDate(a.created_at)}</TableCell>
                <TableCell sx={{ ...CELL_SX, fontWeight: 600 }}>{a.actor_username}</TableCell>
                <TableCell sx={{ ...CELL_SX, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.75rem', color: BRAND }}>{a.event_type}</TableCell>
                <TableCell sx={{ ...CELL_SX, color: MUTED }}>{a.resource_type}: {a.resource_id}</TableCell>
                <TableCell sx={{ ...CELL_SX, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.72rem', color: MUTED }}>{a.actor_ip}</TableCell>
                <TableCell sx={CELL_SX}>
                  <Chip label={a.outcome} size="small"
                    sx={{ fontSize: '0.65rem', height: 18, fontWeight: 700, textTransform: 'capitalize', bgcolor: `${outcomeColor[a.outcome] || MUTED}1a`, color: outcomeColor[a.outcome] || MUTED }} />
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

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: SURFACE, borderBottom: `1px solid ${BORDER}`, px: { xs: 2, md: 4 }, py: 2.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack spacing={0.3}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <SecurityIcon sx={{ color: BRAND, fontSize: 22 }} />
              <Typography sx={{ fontFamily: FONT, fontWeight: 800, fontSize: '1.1rem', color: TEXT }}>
                Identity & Access Management
              </Typography>
            </Stack>
            <Typography sx={{ fontFamily: FONT, fontSize: '0.78rem', color: MUTED }}>
              Users · Groups · Roles · Policies · MFA · Audit Trail
            </Typography>
          </Stack>
          <Tooltip title="Refresh">
            <IconButton size="small" sx={{ color: MUTED }}><RefreshIcon sx={{ fontSize: 18 }} /></IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
        <OverviewCards users={users} groups={groups} roles={roles} policies={policies} />

        {/* ── Toolbar ─────────────────────────────────────────────────────── */}
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => { setTab(v); setSearch(''); }}
            sx={{
              minHeight: 36,
              '& .MuiTab-root': { fontFamily: FONT, fontWeight: 600, fontSize: '0.78rem', textTransform: 'none', minHeight: 36, color: MUTED, py: 0 },
              '& .Mui-selected': { color: BRAND },
              '& .MuiTabs-indicator': { bgcolor: BRAND },
            }}
          >
            {TABS.map((t, i) => (
              <Tab key={t.label} label={<Stack direction="row" alignItems="center" spacing={0.5}>{t.icon}<span>{t.label}</span></Stack>} />
            ))}
          </Tabs>
          <TextField
            size="small"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: MUTED }} /></InputAdornment>,
              sx: { fontFamily: FONT, fontSize: '0.8rem', bgcolor: SURFACE2 },
            }}
            sx={{ width: 220 }}
          />
        </Stack>

        {/* ── Tab Content ─────────────────────────────────────────────────── */}
        <Box sx={{ bgcolor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 1, p: 2.5 }}>
          {tab === 0 && renderUsers()}
          {tab === 1 && renderGroups()}
          {tab === 2 && renderRoles()}
          {tab === 3 && renderPolicies()}
          {tab === 4 && (
            <Box>
              <Alert severity="info" sx={{ fontFamily: FONT, mb: 2, fontSize: '0.8rem' }}>
                Access keys are shown without the secret. The secret is only visible at creation time.
              </Alert>
              <Stack spacing={1.5}>
                {users.filter(u => u.access_key_count > 0).flatMap(u =>
                  Array.from({ length: u.access_key_count }, (_, i) => ({
                    key_id: `AK${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
                    owner: u.username,
                    status: 'active',
                    last_used: '2026-02-26T10:00:00Z',
                  }))
                ).map((key, i) => (
                  <Box key={i} sx={{ bgcolor: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 1, p: 1.5 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <KeyIcon sx={{ fontSize: 16, color: WARNING }} />
                        <Box>
                          <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.8rem', color: TEXT, fontWeight: 700 }}>{key.key_id}</Typography>
                          <Typography sx={{ fontFamily: FONT, fontSize: '0.7rem', color: MUTED }}>Owner: {key.owner} · Last used {fmtDate(key.last_used)}</Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <StatusChip active={key.status === 'active'} />
                        <Tooltip title="Copy Key ID"><IconButton size="small" sx={{ color: MUTED }}><ContentCopyIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                        <Tooltip title="Deactivate"><IconButton size="small" sx={{ color: MUTED, '&:hover': { color: WARNING } }}><LockIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                        <Tooltip title="Delete"><IconButton size="small" sx={{ color: MUTED, '&:hover': { color: DANGER } }}><DeleteIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
          {tab === 5 && renderAudit()}
        </Box>
      </Box>
    </Box>
  );
};

export default IAMPage;
