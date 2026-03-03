// AtonixCorp Cloud – Group Dashboard (Control Plane)
// 3-panel layout: Left Sidebar | Center Content | Right Panel
// Groups are the Source of Truth for every Workspace resource.

import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert, Avatar, Box, Button, Chip, CircularProgress,
  Divider, FormControl, IconButton, InputLabel, LinearProgress, List, ListItemButton,
  MenuItem, Select, Stack, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Tooltip, Typography,
} from '@mui/material';
import AccountTreeIcon         from '@mui/icons-material/AccountTree';
import AppsIcon               from '@mui/icons-material/Apps';
import ArrowBackIcon          from '@mui/icons-material/ArrowBack';
import ArticleIcon            from '@mui/icons-material/Article';
import BarChartIcon           from '@mui/icons-material/BarChart';
import ChevronLeftIcon        from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon       from '@mui/icons-material/ChevronRight';
import CheckCircleIcon        from '@mui/icons-material/CheckCircle';
import ErrorIcon              from '@mui/icons-material/Error';
import CloudQueueIcon         from '@mui/icons-material/CloudQueue';
import CodeIcon               from '@mui/icons-material/Code';
import DashboardIcon          from '@mui/icons-material/Dashboard';
import DeleteIcon             from '@mui/icons-material/Delete';
import DevicesIcon            from '@mui/icons-material/Devices';
import ExploreIcon            from '@mui/icons-material/Explore';
import FolderOpenIcon         from '@mui/icons-material/FolderOpen';
import GroupIcon              from '@mui/icons-material/Group';
import InsertDriveFileIcon    from '@mui/icons-material/InsertDriveFile';
import KeyIcon                from '@mui/icons-material/Key';
import LayersIcon             from '@mui/icons-material/Layers';
import LockIcon               from '@mui/icons-material/Lock';
import PeopleIcon             from '@mui/icons-material/People';
import PersonAddIcon          from '@mui/icons-material/PersonAdd';
import PlayCircleOutlineIcon  from '@mui/icons-material/PlayCircleOutline';
import RefreshIcon            from '@mui/icons-material/Refresh';
import RocketLaunchIcon       from '@mui/icons-material/RocketLaunch';
import SettingsIcon           from '@mui/icons-material/Settings';
import ShieldIcon             from '@mui/icons-material/Shield';
import TimelineIcon           from '@mui/icons-material/Timeline';
import TuneIcon               from '@mui/icons-material/Tune';
import WarningAmberIcon       from '@mui/icons-material/WarningAmber';
import WorkspacesIcon         from '@mui/icons-material/Workspaces';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getGroup, listMembers, listAuditLogs, removeMember, deleteGroup,
  getGroupResources, listGroupConfigFiles, listGroupWorkspaces,
  getGroupSidebar, triggerGroupDiscovery,
  inviteToGroup, listInvitations, cancelInvitation, updateMemberRole,
  Group, GroupMember, GroupAuditLog, GroupRole, GroupInvitation,
  GroupResourceBundle, GroupConfigFile, GroupWorkspaceSummary, GroupSidebarSection,
} from '../services/groupsApi';
import { listEnvironments, getEnvHealth, type ApiEnvironment, type EnvHealth } from '../services/environmentsApi';
import { useGroupPermissions } from '../hooks/useGroupPermissions';
import { dashboardCardSx, dashboardSemanticColors, dashboardTokens } from '../styles/dashboardDesignSystem';
import GroupPipelinesPanel from '../components/Pipelines/GroupPipelinesPanel';

const FONT = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const t    = dashboardTokens.colors;
const sc   = dashboardSemanticColors;
const BP   = t.brandPrimary;

// ── Constants ──────────────────────────────────────────────────────────────────

const ALL_ROLES: GroupRole[] = [
  'owner', 'admin', 'architect', 'devops_engineer', 'developer', 'data_scientist', 'finance', 'viewer',
];

const ROLE_COLORS: Record<GroupRole, string> = {
  owner:           '#7c3aed',
  admin:           '#dc2626',
  architect:       '#0891b2',
  devops_engineer: '#6d28d9',
  developer:       '#2563eb',
  data_scientist:  '#059669',
  finance:         '#d97706',
  viewer:          '#6b7280',
};

const TYPE_LABELS: Record<string, string> = {
  developer:  'Developer',
  enterprise: 'Enterprise',
  system:     'System',
  production: 'Production',
  marketing:  'Marketing',
  data:       'Data',
  custom:     'Custom',
};

const VISIBILITY_COLORS: Record<string, string> = {
  public:   sc.success,
  internal: '#d97706',
  private:  '#6b7280',
};

const CONFIG_TYPE_ICONS: Record<string, string> = {
  dockerfile:    'docker',
  pipeline_yaml: 'ci',
  k8s_manifest:  'k8s',
  helm_chart:    'helm',
  terraform:     'tf',
  env_template:  'file',
  buildpack:     'pkg',
  ansible:       'bot',
  compose:       'compose',
  config_generic:'cfg',
};

// ── Sidebar section definitions ────────────────────────────────────────────────

type SectionId =
  | 'overview' | 'projects' | 'pipelines' | 'environments' | 'containers'
  | 'kubernetes' | 'deployments' | 'metrics' | 'logs' | 'secrets'
  | 'env-vars' | 'access' | 'settings' | 'workspaces' | 'audit';

interface SidebarItem {
  id: SectionId;
  label: string;
  icon: React.ReactNode;
  dividerBefore?: boolean;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: 'overview',      label: 'Overview',         icon: <DashboardIcon sx={{ fontSize: '1.1rem' }} /> },
  { id: 'projects',      label: 'Projects',          icon: <FolderOpenIcon sx={{ fontSize: '1rem' }} /> },
  { id: 'pipelines',     label: 'CI/CD Pipelines',   icon: <PlayCircleOutlineIcon sx={{ fontSize: '1rem' }} /> },
  { id: 'environments',  label: 'Environments',      icon: <DevicesIcon sx={{ fontSize: '1rem' }} /> },
  { id: 'containers',    label: 'Containers',        icon: <AppsIcon sx={{ fontSize: '1rem' }} /> },
  { id: 'kubernetes',    label: 'Kubernetes',        icon: <CloudQueueIcon sx={{ fontSize: '1rem' }} /> },
  { id: 'deployments',   label: 'Deployments',       icon: <RocketLaunchIcon sx={{ fontSize: '1rem' }} /> },
  { id: 'metrics',       label: 'Metrics',           icon: <BarChartIcon sx={{ fontSize: '1rem' }} /> },
  { id: 'logs',          label: 'Logs',              icon: <ArticleIcon sx={{ fontSize: '1rem' }} /> },
  { id: 'secrets',       label: 'Secrets',           icon: <LockIcon sx={{ fontSize: '1rem' }} /> },
  { id: 'env-vars',      label: 'Environment Vars',  icon: <LayersIcon sx={{ fontSize: '1rem' }} /> },
  { id: 'access',        label: 'Access Control',    icon: <ShieldIcon sx={{ fontSize: '1rem' }} />, dividerBefore: true },
  { id: 'settings',      label: 'Settings',          icon: <SettingsIcon sx={{ fontSize: '1rem' }} /> },
  { id: 'workspaces',    label: 'Workspaces',        icon: <WorkspacesIcon sx={{ fontSize: '1rem' }} />, dividerBefore: true },
  { id: 'audit',         label: 'Audit Log',         icon: <TimelineIcon sx={{ fontSize: '1rem' }} /> },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function initials(name: string) {
  return name.split(' ').map((w) => w[0] ?? '').join('').toUpperCase().slice(0, 2) || '?';
}

// ── Stat card ─────────────────────────────────────────────────────────────────

const StatCard: React.FC<{ label: string; value: number | string; icon: React.ReactNode; color: string; onClick?: () => void }> = ({ label, value, icon, color, onClick }) => (
  <Box onClick={onClick} sx={{ ...dashboardCardSx, flex: 1, minWidth: 140, p: 2.5,
    ...(onClick ? { cursor: 'pointer', '&:hover': { borderColor: color, bgcolor: `${color}08`, transform: 'translateY(-1px)', transition: 'all .15s ease' } } : {}),
  }}>
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <Box sx={{ width: 38, height: 38, borderRadius: 1.5, bgcolor: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
        {icon}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontFamily: FONT, fontSize: '1.45rem', fontWeight: 800, color: t.textPrimary, lineHeight: 1 }}>{value}</Typography>
        <Typography sx={{ fontFamily: FONT, fontSize: '.75rem', color: t.textSecondary, mt: 0.2 }}>{label}</Typography>
      </Box>
      {onClick && <ChevronRightIcon sx={{ fontSize: '.9rem', color: t.textTertiary, opacity: .6, flexShrink: 0 }} />}
    </Stack>
  </Box>
);

// ── Empty state placeholder ───────────────────────────────────────────────────

const EmptySection: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string }> = ({ icon, title, subtitle }) => (
  <Box sx={{ ...dashboardCardSx, p: 4, textAlign: 'center' }}>
    <Box sx={{ fontSize: '3rem', color: t.textTertiary, opacity: 0.4, mb: 1.5 }}>{icon}</Box>
    <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '1rem', color: t.textPrimary, mb: 0.5 }}>{title}</Typography>
    {subtitle && <Typography sx={{ fontFamily: FONT, fontSize: '.85rem', color: t.textSecondary }}>{subtitle}</Typography>}
  </Box>
);

// ── Resource table ────────────────────────────────────────────────────────────

interface ResourceRow { id: string; name: string; status: string; region: string; environment: string; created_at: string | null }
const ResourceTable: React.FC<{ rows: ResourceRow[]; emptyIcon: React.ReactNode; emptyMsg: string }> = ({ rows, emptyIcon, emptyMsg }) => {
  if (rows.length === 0) return <EmptySection icon={emptyIcon} title={emptyMsg} subtitle="Resources linked to this group will appear here." />;
  return (
    <Box sx={{ ...dashboardCardSx, overflow: 'hidden' }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ '& th': { fontFamily: FONT, fontSize: '.74rem', fontWeight: 700, color: t.textSecondary, borderColor: t.border, bgcolor: t.surface } }}>
            <TableCell>Name</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Region</TableCell>
            <TableCell>Environment</TableCell>
            <TableCell>Created</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id} sx={{ '& td': { fontFamily: FONT, fontSize: '.83rem', borderColor: t.border } }}>
              <TableCell sx={{ fontWeight: 600, color: t.textPrimary }}>{r.name}</TableCell>
              <TableCell>
                <Chip label={r.status} size="small" sx={{
                  fontFamily: FONT, fontSize: '.7rem', textTransform: 'capitalize',
                  bgcolor: r.status === 'active' ? `${sc.success}18` : `${sc.warning}18`,
                  color: r.status === 'active' ? sc.success : t.textSecondary,
                  border: `1px solid ${r.status === 'active' ? sc.success : t.border}44`,
                }} />
              </TableCell>
              <TableCell sx={{ color: t.textSecondary }}>{r.region || '—'}</TableCell>
              <TableCell sx={{ color: t.textSecondary, textTransform: 'capitalize' }}>{r.environment || 'all'}</TableCell>
              <TableCell sx={{ color: t.textTertiary }}>{r.created_at ? fmtDate(r.created_at) : '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

// ── Overview section ──────────────────────────────────────────────────────────

const OverviewSection: React.FC<{
  group: Group;
  bundle: GroupResourceBundle | null;
  environments: ApiEnvironment[];
  workspaces: GroupWorkspaceSummary[];
  groupId: string;
  onNavigate: (section: string) => void;
}> = ({ group, bundle, environments, workspaces, groupId, onNavigate }) => {
  const enabledResources = Object.entries(group.resources || {}).filter(([, v]) => v).map(([k]) => k.replace(/_/g, ' '));
  const counts = bundle?.resource_counts ?? {};

  return (
    <Stack spacing={2.5}>
      {/* Top stats row — each card navigates to its section */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
        <StatCard label="Members"      value={group.member_count}  icon={<PeopleIcon sx={{ fontSize: '1.1rem' }} />}           color={BP}          onClick={() => onNavigate('access')} />
        <StatCard label="Projects"     value={group.project_count} icon={<FolderOpenIcon sx={{ fontSize: '1.1rem' }} />}        color={sc.info}     onClick={() => onNavigate('projects')} />
        <StatCard label="Pipelines"    value={group.pipeline_count} icon={<PlayCircleOutlineIcon sx={{ fontSize: '1.1rem' }} />} color={sc.success}  onClick={() => onNavigate('pipelines')} />
        <StatCard label="Environments" value={counts['environment'] ?? environments.length} icon={<DevicesIcon sx={{ fontSize: '1.1rem' }} />} color="#d97706" onClick={() => onNavigate('environments')} />
        <StatCard label="Workspaces"   value={workspaces.length}   icon={<WorkspacesIcon sx={{ fontSize: '1.1rem' }} />}        color="#7c3aed"     onClick={() => onNavigate('workspaces')} />
      </Stack>

      {/* Second row */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
        <StatCard label="Containers"   value={counts['container']   ?? 0} icon={<AppsIcon sx={{ fontSize: '1.1rem' }} />}          color="#0891b2" onClick={() => onNavigate('containers')} />
        <StatCard label="K8s Clusters" value={counts['k8s_cluster'] ?? 0} icon={<CloudQueueIcon sx={{ fontSize: '1.1rem' }} />}    color="#0f766e" onClick={() => onNavigate('kubernetes')} />
        <StatCard label="Deployments"  value={counts['deployment']  ?? 0} icon={<RocketLaunchIcon sx={{ fontSize: '1.1rem' }} />}  color="#7c3aed" onClick={() => onNavigate('deployments')} />
        <StatCard label="Secrets"      value={counts['secret']      ?? 0} icon={<LockIcon sx={{ fontSize: '1.1rem' }} />}           color={sc.danger} onClick={() => onNavigate('secrets')} />
        <StatCard label="Config Files" value={bundle?.config_files.length ?? 0} icon={<InsertDriveFileIcon sx={{ fontSize: '1.1rem' }} />} color="#9333ea" onClick={() => onNavigate('settings')} />
      </Stack>

      {/* Group identity card */}
      <Box sx={{ ...dashboardCardSx, p: 2.5 }}>
        <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '.9rem', color: t.textPrimary, mb: 2 }}>Group Identity</Typography>
        <Stack spacing={1.2}>
          {[
            ['Group ID',     group.id],
            ['Handle',       `@${group.handle}`],
            ['Type',         TYPE_LABELS[group.group_type] ?? group.group_type],
            ['Visibility',   group.visibility.charAt(0).toUpperCase() + group.visibility.slice(1)],
            ['Owner',        group.owner?.display_name || group.owner?.username || '—'],
            ['Created',      fmtDate(group.created_at)],
            ['Last updated', fmtDate(group.updated_at)],
          ].map(([label, value]) => (
            <Stack key={label as string} direction="row" spacing={1.5} alignItems="center">
              <Typography sx={{ fontFamily: FONT, fontSize: '.8rem', color: t.textSecondary, minWidth: 110 }}>{label}</Typography>
              <Typography sx={{ fontFamily: FONT, fontSize: '.83rem', color: t.textPrimary, fontWeight: 500, wordBreak: 'break-all' }}>{value}</Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* Enabled resources */}
      {enabledResources.length > 0 && (
        <Box sx={{ ...dashboardCardSx, p: 2.5 }}>
          <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '.9rem', color: t.textPrimary, mb: 1.5 }}>Enabled Resource Modules</Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {enabledResources.map((r) => (
              <Chip key={r} label={r} size="small" sx={{
                textTransform: 'capitalize', fontFamily: FONT, fontSize: '.75rem',
                bgcolor: `${BP}18`, color: BP, border: `1px solid ${BP}33`,
              }} />
            ))}
          </Stack>
        </Box>
      )}

      {/* Description */}
      {group.description && (
        <Box sx={{ ...dashboardCardSx, p: 2.5 }}>
          <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '.9rem', color: t.textPrimary, mb: 1 }}>Description</Typography>
          <Typography sx={{ fontFamily: FONT, fontSize: '.88rem', color: t.textSecondary, lineHeight: 1.6 }}>{group.description}</Typography>
        </Box>
      )}

      {/* Connected workspaces preview */}
      {workspaces.length > 0 && (
        <Box sx={{ ...dashboardCardSx, p: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '.9rem', color: t.textPrimary }}>Connected Workspaces</Typography>
            <Button size="small" endIcon={<ChevronRightIcon sx={{ fontSize: '.85rem' }} />}
              onClick={() => onNavigate('workspaces')}
              sx={{ fontFamily: FONT, textTransform: 'none', fontSize: '.75rem', color: BP, fontWeight: 600, p: 0. }}>
              View all
            </Button>
          </Stack>
          <Stack spacing={1}>
            {workspaces.slice(0, 4).map((ws) => (
              <Stack key={ws.workspace_id} direction="row" alignItems="center" justifyContent="space-between"
                sx={{ px: 1.5, py: 1, borderRadius: 1, bgcolor: t.surface, border: `1px solid ${t.border}` }}>
                <Box>
                  <Typography sx={{ fontFamily: FONT, fontSize: '.84rem', fontWeight: 600, color: t.textPrimary }}>{ws.display_name}</Typography>
                  <Typography sx={{ fontFamily: FONT, fontSize: '.72rem', color: t.textSecondary }}>{ws.workspace_id} · {ws.region}</Typography>
                </Box>
                <Chip label={ws.status} size="small" sx={{
                  fontFamily: FONT, fontSize: '.7rem', textTransform: 'capitalize',
                  bgcolor: ws.status === 'running' ? `${sc.success}18` : `${t.border}44`,
                  color: ws.status === 'running' ? sc.success : t.textSecondary,
                }} />
              </Stack>
            ))}
          </Stack>
        </Box>
      )}

      {/* Quick Navigate hub — matches Workspace overview style */}
      <Box sx={{ ...dashboardCardSx, p: 2.5 }}>
        <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '.8rem', color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '.06em', mb: 1.5 }}>Quick Navigate</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 1 }}>
          {SIDEBAR_ITEMS.filter(item => item.id !== 'overview').map((item) => (
            <Box key={item.id} onClick={() => onNavigate(item.id)}
              sx={{ p: 1.5, borderRadius: '10px', border: `1px solid ${t.border}`, bgcolor: t.surface, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 1.25,
                '&:hover': { borderColor: BP, bgcolor: `${BP}06`, transform: 'translateY(-1px)', transition: 'all .15s ease' },
              }}>
              <Box sx={{ color: t.textTertiary, display: 'flex', alignItems: 'center', flexShrink: 0 }}>{item.icon}</Box>
              <Typography sx={{ fontFamily: FONT, fontSize: '.8rem', color: t.textPrimary, fontWeight: 600 }}>{item.label}</Typography>
              <ChevronRightIcon sx={{ fontSize: '.8rem', color: t.textTertiary, ml: 'auto', opacity: .6 }} />
            </Box>
          ))}
        </Box>
      </Box>
    </Stack>
  );
};

// ── Members / Access Control section ──────────────────────────────────────────

const AccessSection: React.FC<{
  members: GroupMember[];
  myRole: GroupRole | null;
  groupId: string;
  onRemoved: (id: string) => void;
  onRoleChanged: (id: string, newRole: GroupRole) => void;
}> = ({ members, myRole, groupId, onRemoved, onRoleChanged }) => {
  const [busy,          setBusy]          = useState<string | null>(null);
  const [inviteEmail,   setInviteEmail]   = useState('');
  const [inviteRole,    setInviteRole]    = useState<GroupRole>('developer');
  const [inviting,      setInviting]      = useState(false);
  const [inviteError,   setInviteError]   = useState<string | null>(null);
  const [invitations,   setInvitations]   = useState<GroupInvitation[]>([]);
  const [loadInvites,   setLoadInvites]   = useState(false);
  const [cancelId,      setCancelId]      = useState<string | null>(null);
  const [changingId,    setChangingId]    = useState<string | null>(null);

  const canManage = myRole === 'owner' || myRole === 'admin';

  // Load pending invitations when canManage
  useEffect(() => {
    if (!canManage) return;
    setLoadInvites(true);
    listInvitations(groupId)
      .then(data => setInvitations(data.filter(i => i.status === 'pending')))
      .catch(() => {})
      .finally(() => setLoadInvites(false));
  }, [groupId, canManage]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true); setInviteError(null);
    try {
      const inv = await inviteToGroup(groupId, inviteEmail.trim(), inviteRole);
      setInvitations(prev => [inv, ...prev]);
      setInviteEmail('');
    } catch (err: any) {
      setInviteError(err?.response?.data?.error || err?.response?.data?.detail || 'Failed to send invite.');
    } finally { setInviting(false); }
  };

  const handleCancelInvite = async (invId: string) => {
    setCancelId(invId);
    try { await cancelInvitation(groupId, invId); setInvitations(prev => prev.filter(i => i.id !== invId)); }
    catch { /* ignore */ }
    finally { setCancelId(null); }
  };

  const handleRoleChange = async (m: GroupMember, newRole: GroupRole) => {
    setChangingId(m.id);
    try { await updateMemberRole(groupId, m.id, newRole); onRoleChanged(m.id, newRole); }
    catch { /* ignore */ }
    finally { setChangingId(null); }
  };

  const roleColor = (r: GroupRole) => ROLE_COLORS[r] ?? '#6b7280';

  return (
    <Stack spacing={2.5}>

      {/* ── Invite form ──────────────────────────────────────────────────── */}
      {canManage && (
        <Box sx={{ ...dashboardCardSx, p: 2.5 }}>
          <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '.88rem', color: t.textPrimary, mb: 2 }}>
            Invite member
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="flex-start">
            <TextField
              size="small"
              placeholder="Email address"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleInvite(); }}
              sx={{ flex: 1, '& input': { fontFamily: FONT, fontSize: '.85rem' } }}
            />
            <FormControl size="small" sx={{ minWidth: 170 }}>
              <InputLabel sx={{ fontFamily: FONT, fontSize: '.82rem' }}>Role</InputLabel>
              <Select
                label="Role"
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value as GroupRole)}
                sx={{ fontFamily: FONT, fontSize: '.82rem' }}
              >
                {ALL_ROLES.filter(r => r !== 'owner').map(r => (
                  <MenuItem key={r} value={r} sx={{ fontFamily: FONT, fontSize: '.82rem', textTransform: 'capitalize' }}>
                    {r.replace(/_/g, '\u00a0')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained" size="small"
              onClick={handleInvite}
              disabled={inviting || !inviteEmail.trim()}
              startIcon={inviting ? <CircularProgress size={12} color="inherit" /> : <PersonAddIcon sx={{ fontSize: '.9rem' }} />}
              sx={{ fontFamily: FONT, fontSize: '.82rem', textTransform: 'none', bgcolor: BP, '&:hover': { bgcolor: `${BP}dd` }, whiteSpace: 'nowrap', height: 40 }}
            >
              Send invite
            </Button>
          </Stack>
          {inviteError && (
            <Alert severity="error" sx={{ fontFamily: FONT, fontSize: '.8rem', mt: 1.5 }} onClose={() => setInviteError(null)}>
              {inviteError}
            </Alert>
          )}
        </Box>
      )}

      {/* ── Pending invitations ───────────────────────────────────────────── */}
      {canManage && (loadInvites || invitations.length > 0) && (
        <Box sx={{ ...dashboardCardSx, overflow: 'hidden' }}>
          <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${t.border}` }}>
            <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '.85rem', color: t.textPrimary }}>
              Pending Invitations {invitations.length > 0 && `(${invitations.length})`}
            </Typography>
          </Box>
          {loadInvites ? (
            <Box sx={{ p: 2 }}><LinearProgress sx={{ borderRadius: 1 }} /></Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { fontFamily: FONT, fontSize: '.74rem', fontWeight: 700, color: t.textSecondary, borderColor: t.border, bgcolor: t.surface } }}>
                  <TableCell>Email</TableCell><TableCell>Role</TableCell><TableCell>Sent</TableCell><TableCell align="right">Cancel</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invitations.map(inv => (
                  <TableRow key={inv.id} sx={{ '& td': { fontFamily: FONT, fontSize: '.82rem', borderColor: t.border } }}>
                    <TableCell sx={{ color: t.textPrimary, fontWeight: 600 }}>{inv.email}</TableCell>
                    <TableCell>
                      <Chip label={inv.role.replace(/_/g, ' ')} size="small" sx={{
                        fontFamily: FONT, fontSize: '.7rem', fontWeight: 600, textTransform: 'capitalize',
                        bgcolor: `${roleColor(inv.role)}22`, color: roleColor(inv.role), border: `1px solid ${roleColor(inv.role)}44`,
                      }} />
                    </TableCell>
                    <TableCell sx={{ color: t.textSecondary }}>{fmtDate(inv.created_at)}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Cancel invitation">
                        <IconButton size="small" onClick={() => handleCancelInvite(inv.id)} disabled={cancelId === inv.id}
                          sx={{ color: sc.danger, '&:hover': { bgcolor: `${sc.danger}18` } }}>
                          {cancelId === inv.id ? <CircularProgress size={12} /> : <DeleteIcon sx={{ fontSize: '.9rem' }} />}
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>
      )}

      {/* ── Members list ─────────────────────────────────────────────────── */}
      {members.length === 0 ? (
        <EmptySection icon={<PeopleIcon />} title="No members" />
      ) : (
        <Box sx={{ ...dashboardCardSx, overflow: 'hidden' }}>
          <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${t.border}` }}>
            <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '.85rem', color: t.textPrimary }}>
              Members ({members.length})
            </Typography>
          </Box>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontFamily: FONT, fontSize: '.74rem', fontWeight: 700, color: t.textSecondary, borderColor: t.border, bgcolor: t.surface } }}>
                <TableCell>Member</TableCell><TableCell>Role</TableCell><TableCell>Joined</TableCell>
                {canManage && <TableCell align="right">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {members.map(m => (
                <TableRow key={m.id} sx={{ '& td': { fontFamily: FONT, fontSize: '.83rem', borderColor: t.border } }}>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar sx={{ width: 28, height: 28, fontSize: '.68rem', bgcolor: `${roleColor(m.role)}33`, color: roleColor(m.role) }}>
                        {initials(m.user.display_name || m.user.username)}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontFamily: FONT, fontSize: '.83rem', fontWeight: 600, color: t.textPrimary }}>{m.user.display_name || m.user.username}</Typography>
                        <Typography sx={{ fontFamily: FONT, fontSize: '.72rem', color: t.textSecondary }}>{m.user.email}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {canManage && m.role !== 'owner' ? (
                      <FormControl size="small" variant="outlined" sx={{ minWidth: 160 }}>
                        <Select
                          value={m.role}
                          onChange={e => handleRoleChange(m, e.target.value as GroupRole)}
                          disabled={changingId === m.id}
                          sx={{ fontFamily: FONT, fontSize: '.78rem', '.MuiSelect-select': { py: '4px', px: 1 } }}
                        >
                          {ALL_ROLES.filter(r => r !== 'owner').map(r => (
                            <MenuItem key={r} value={r} sx={{ fontFamily: FONT, fontSize: '.82rem', textTransform: 'capitalize' }}>
                              {r.replace(/_/g, ' ')}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <Chip label={m.role.replace(/_/g, ' ')} size="small" sx={{
                        fontFamily: FONT, fontSize: '.7rem', fontWeight: 600, textTransform: 'capitalize',
                        bgcolor: `${roleColor(m.role)}22`, color: roleColor(m.role), border: `1px solid ${roleColor(m.role)}44`,
                      }} />
                    )}
                  </TableCell>
                  <TableCell sx={{ color: t.textSecondary }}>{fmtDate(m.created_at)}</TableCell>
                  {canManage && (
                    <TableCell align="right">
                      {m.role !== 'owner' && (
                        <Tooltip title="Remove member">
                          <IconButton size="small"
                            onClick={() => {
                              if (!window.confirm(`Remove ${m.user.display_name || m.user.username}?`)) return;
                              setBusy(m.id);
                              removeMember(groupId, m.id).then(() => onRemoved(m.id)).catch(() => {}).finally(() => setBusy(null));
                            }}
                            disabled={busy === m.id}
                            sx={{ color: sc.danger, '&:hover': { bgcolor: `${sc.danger}18` } }}>
                            {busy === m.id ? <CircularProgress size={12} /> : <DeleteIcon sx={{ fontSize: '.95rem' }} />}
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Stack>
  );
};

// ── Audit log section ─────────────────────────────────────────────────────────

const AuditSection: React.FC<{ logs: GroupAuditLog[] }> = ({ logs }) => {
  if (logs.length === 0) return <EmptySection icon={<TimelineIcon />} title="No audit events" subtitle="Group activity will be recorded here." />;
  return (
    <Box sx={{ ...dashboardCardSx, overflow: 'hidden' }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ '& th': { fontFamily: FONT, fontSize: '.74rem', fontWeight: 700, color: t.textSecondary, borderColor: t.border, bgcolor: t.surface } }}>
            <TableCell>Event</TableCell><TableCell>Actor</TableCell><TableCell>Target</TableCell><TableCell>Time</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id} sx={{ '& td': { fontFamily: FONT, fontSize: '.82rem', borderColor: t.border } }}>
              <TableCell sx={{ fontWeight: 600, color: t.textPrimary, textTransform: 'capitalize' }}>{log.action.replace(/_/g, ' ')}</TableCell>
              <TableCell sx={{ color: t.textSecondary }}>{log.actor}</TableCell>
              <TableCell sx={{ color: t.textSecondary }}>{log.target || '—'}</TableCell>
              <TableCell sx={{ color: t.textTertiary, whiteSpace: 'nowrap' }}>{fmtDateTime(log.created_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

// ── Environments section ──────────────────────────────────────────────────────

const EnvironmentsSection: React.FC<{ environments: ApiEnvironment[]; navigate: ReturnType<typeof useNavigate> }> = ({ environments, navigate }) => {
  const [healthMap, setHealthMap] = useState<Record<string, EnvHealth>>({});
  useEffect(() => {
    if (!environments.length) return;
    Promise.allSettled(environments.map(e => getEnvHealth(e.id).then(h => ({ id: e.id, h }))))
      .then(res => {
        const m: Record<string, EnvHealth> = {};
        res.forEach(r => { if (r.status === 'fulfilled') m[r.value.id] = r.value.h; });
        setHealthMap(m);
      });
  }, [environments]);

  if (!environments.length) return <EmptySection icon={<DevicesIcon />} title="No environments yet" subtitle="Environments owned by this group will appear here." />;

  return (
    <Box sx={{ ...dashboardCardSx, overflow: 'hidden' }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ '& th': { fontFamily: FONT, fontSize: '.74rem', fontWeight: 700, color: t.textSecondary, borderColor: t.border, bgcolor: t.surface } }}>
            <TableCell>Environment</TableCell><TableCell>Region</TableCell><TableCell>Strategy</TableCell>
            <TableCell>Health</TableCell><TableCell>Version</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {environments.map(env => {
            const health = healthMap[env.id];
            const hColor = health?.status === 'healthy' ? sc.success : health?.status === 'degraded' ? '#d97706' : health?.status === 'critical' ? sc.danger : t.textTertiary;
            const HIcon = health?.status === 'healthy' ? CheckCircleIcon : health?.status === 'degraded' ? WarningAmberIcon : health?.status === 'critical' ? ErrorIcon : null;
            return (
              <TableRow key={env.id} hover sx={{ cursor: 'pointer', '& td': { fontFamily: FONT, fontSize: '.83rem', borderColor: t.border } }}
                onClick={() => navigate(`/developer/Dashboard/environment/${env.id}`)}>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <DevicesIcon sx={{ fontSize: '.95rem', color: BP }} />
                    <Typography sx={{ fontFamily: FONT, fontSize: '.83rem', fontWeight: 600, color: t.textPrimary }}>{env.name}</Typography>
                  </Stack>
                </TableCell>
                <TableCell sx={{ color: t.textSecondary }}>{env.region || '—'}</TableCell>
                <TableCell>
                  <Chip label={env.deployment_strategy?.replace('_', ' ')} size="small" sx={{ fontFamily: FONT, fontSize: '.7rem', bgcolor: `${BP}18`, color: BP, border: `1px solid ${BP}33` }} />
                </TableCell>
                <TableCell>
                  {HIcon ? (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <HIcon sx={{ fontSize: '.95rem', color: hColor }} />
                      <Typography sx={{ fontFamily: FONT, fontSize: '.78rem', color: hColor, fontWeight: 600, textTransform: 'capitalize' }}>{health!.status}</Typography>
                    </Stack>
                  ) : <Typography sx={{ fontFamily: FONT, fontSize: '.75rem', color: t.textTertiary }}>—</Typography>}
                </TableCell>
                <TableCell sx={{ color: t.textSecondary }}>{health?.active_version ?? '—'}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
};

// ── Workspaces section ────────────────────────────────────────────────────────

const WorkspacesSection: React.FC<{ workspaces: GroupWorkspaceSummary[]; navigate: ReturnType<typeof useNavigate> }> = ({ workspaces, navigate }) => {
  if (!workspaces.length) return <EmptySection icon={<WorkspacesIcon />} title="No workspaces connected" subtitle="Create a workspace and connect it to this group." />;
  return (
    <Box sx={{ ...dashboardCardSx, overflow: 'hidden' }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ '& th': { fontFamily: FONT, fontSize: '.74rem', fontWeight: 700, color: t.textSecondary, borderColor: t.border, bgcolor: t.surface } }}>
            <TableCell>Workspace</TableCell><TableCell>Owner</TableCell><TableCell>Status</TableCell>
            <TableCell>Region</TableCell><TableCell>Created</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {workspaces.map(ws => (
            <TableRow key={ws.workspace_id} hover sx={{ cursor: 'pointer', '& td': { fontFamily: FONT, fontSize: '.83rem', borderColor: t.border } }}
              onClick={() => navigate(`/developer/workspace/${ws.workspace_id}`)}>
              <TableCell>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <WorkspacesIcon sx={{ fontSize: '.95rem', color: BP }} />
                  <Box>
                    <Typography sx={{ fontFamily: FONT, fontSize: '.83rem', fontWeight: 600, color: t.textPrimary }}>{ws.display_name}</Typography>
                    <Typography sx={{ fontFamily: FONT, fontSize: '.72rem', color: t.textSecondary }}>{ws.workspace_id}</Typography>
                  </Box>
                </Stack>
              </TableCell>
              <TableCell sx={{ color: t.textSecondary }}>{ws.owner}</TableCell>
              <TableCell>
                <Chip label={ws.status} size="small" sx={{
                  fontFamily: FONT, fontSize: '.7rem', textTransform: 'capitalize',
                  bgcolor: ws.status === 'running' ? `${sc.success}18` : `${t.border}44`,
                  color: ws.status === 'running' ? sc.success : t.textSecondary,
                }} />
              </TableCell>
              <TableCell sx={{ color: t.textSecondary }}>{ws.region}</TableCell>
              <TableCell sx={{ color: t.textTertiary }}>{fmtDate(ws.created_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

// ── Metrics section ───────────────────────────────────────────────────────────

const MetricsSection: React.FC<{ bundle: GroupResourceBundle | null }> = ({ bundle }) => {
  const streams = bundle?.metric_streams ?? [];
  if (!streams.length) return <EmptySection icon={<BarChartIcon />} title="No metric streams" subtitle="Link metric streams from the resource registry." />;
  return (
    <Stack spacing={2}>
      {streams.map((s) => (
        <Box key={s.id} sx={{ ...dashboardCardSx, p: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '.9rem', color: t.textPrimary }}>{s.name}</Typography>
            <Chip label={s.status} size="small" sx={{ fontFamily: FONT, fontSize: '.7rem', bgcolor: `${sc.success}18`, color: sc.success }} />
          </Stack>
          <LinearProgress variant="determinate" value={60} sx={{ height: 4, borderRadius: 2, bgcolor: `${BP}20`, '& .MuiLinearProgress-bar': { bgcolor: BP, borderRadius: 2 } }} />
        </Box>
      ))}
    </Stack>
  );
};

// ── Logs section ──────────────────────────────────────────────────────────────

const LogsSection: React.FC<{ bundle: GroupResourceBundle | null }> = ({ bundle }) => {
  const streams = bundle?.log_streams ?? [];
  if (!streams.length) return <EmptySection icon={<ArticleIcon />} title="No log streams" subtitle="Link log streams from the resource registry." />;
  return (
    <Stack spacing={2}>
      {streams.map((s) => (
        <Box key={s.id} sx={{ ...dashboardCardSx, p: 2.5 }}>
          <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '.85rem', color: t.textPrimary }}>{s.name}</Typography>
          <Typography sx={{ fontFamily: FONT, fontSize: '.8rem', color: t.textSecondary, mt: 0.5 }}>{s.region}</Typography>
        </Box>
      ))}
    </Stack>
  );
};

// ── Settings section ──────────────────────────────────────────────────────────

const SettingsSection: React.FC<{ group: Group; groupId: string; onDeleted: () => void }> = ({ group, groupId, onDeleted }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting,     setDeleting]   = useState(false);
  const [deleteError,  setDeleteError] = useState('');

  const handleDelete = async () => {
    if (confirmText !== group.name) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteGroup(groupId);
      onDeleted();
    } catch (e: any) {
      setDeleteError(e?.response?.data?.detail ?? e?.message ?? 'Delete failed.');
      setDeleting(false);
    }
  };

  return (
    <Stack spacing={2.5}>
      <Box sx={{ ...dashboardCardSx, p: 2.5 }}>
        <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '.9rem', color: t.textPrimary, mb: 2 }}>General Settings</Typography>
        <Stack spacing={1.2}>
          {[
            ['Name',       group.name],
            ['Handle',     `@${group.handle}`],
            ['Type',       TYPE_LABELS[group.group_type] ?? group.group_type],
            ['Visibility', group.visibility],
          ].map(([l, v]) => (
            <Stack key={l as string} direction="row" spacing={1.5} alignItems="center">
              <Typography sx={{ fontFamily: FONT, fontSize: '.8rem', color: t.textSecondary, minWidth: 100 }}>{l}</Typography>
              <Typography sx={{ fontFamily: FONT, fontSize: '.83rem', color: t.textPrimary, fontWeight: 500 }}>{v}</Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* ── Danger Zone ── */}
      <Box sx={{ ...dashboardCardSx, p: 2.5, border: `1px solid ${sc.danger}55`, bgcolor: `${sc.danger}04` }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <WarningAmberIcon sx={{ fontSize: '1rem', color: sc.danger }} />
          <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '.9rem', color: sc.danger }}>Danger Zone</Typography>
        </Stack>
        <Typography sx={{ fontFamily: FONT, fontSize: '.83rem', color: t.textSecondary, mb: 2, lineHeight: 1.6 }}>
          Deleting this group is <strong style={{ color: t.textPrimary }}>irreversible</strong>. All resources, members, and config files
          associated with <strong style={{ color: t.textPrimary }}>{group.name}</strong> will be permanently removed.
        </Typography>

        {!confirmOpen ? (
          <Button variant="outlined" size="small" startIcon={<DeleteIcon sx={{ fontSize: '.9rem' }} />}
            onClick={() => setConfirmOpen(true)}
            sx={{ fontFamily: FONT, textTransform: 'none', fontWeight: 600, borderColor: sc.danger, color: sc.danger,
              '&:hover': { bgcolor: `${sc.danger}10`, borderColor: sc.danger } }}>
            Delete Group
          </Button>
        ) : (
          <Stack spacing={1.5}>
            <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: `${sc.danger}0d`, border: `1px solid ${sc.danger}33` }}>
              <Typography sx={{ fontFamily: FONT, fontSize: '.8rem', color: t.textSecondary, mb: 1, lineHeight: 1.55 }}>
                To confirm, type the group name exactly:
              </Typography>
              <Typography sx={{ fontFamily: 'monospace', fontSize: '.85rem', fontWeight: 700, color: t.textPrimary, mb: 1.25,
                px: 1, py: 0.5, bgcolor: t.surface, borderRadius: .5, border: `1px solid ${t.border}`, display: 'inline-block' }}>
                {group.name}
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder={group.name}
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                autoFocus
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'monospace', fontSize: '.85rem',
                    bgcolor: t.surface, color: t.textPrimary,
                    '& fieldset': { borderColor: confirmText === group.name ? sc.danger : t.border },
                    '&:hover fieldset': { borderColor: sc.danger },
                    '&.Mui-focused fieldset': { borderColor: sc.danger },
                  },
                }}
              />
            </Box>

            {deleteError && (
              <Alert severity="error" sx={{ fontFamily: FONT, fontSize: '.8rem', py: 0.5 }}>{deleteError}</Alert>
            )}

            <Stack direction="row" spacing={1}>
              <Button variant="contained" size="small"
                disabled={confirmText !== group.name || deleting}
                startIcon={deleting ? <CircularProgress size={13} sx={{ color: 'inherit' }} /> : <DeleteIcon sx={{ fontSize: '.9rem' }} />}
                onClick={handleDelete}
                sx={{ fontFamily: FONT, textTransform: 'none', fontWeight: 700,
                  bgcolor: sc.danger, '&:hover': { bgcolor: '#b91c1c' },
                  '&.Mui-disabled': { bgcolor: `${sc.danger}40`, color: '#fff' },
                  borderRadius: '8px' }}>
                {deleting ? 'Deleting…' : 'Confirm Delete'}
              </Button>
              <Button size="small" onClick={() => { setConfirmOpen(false); setConfirmText(''); setDeleteError(''); }}
                sx={{ fontFamily: FONT, textTransform: 'none', color: t.textSecondary }}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        )}
      </Box>
    </Stack>
  );
};

// ── RIGHT PANEL ───────────────────────────────────────────────────────────────

const RightPanel: React.FC<{
  configFiles: GroupConfigFile[];
  tokens: { id: string; name: string; scopes: string[]; token_prefix: string }[];
  bundle: GroupResourceBundle | null;
  onDiscover: () => void;
  discovering: boolean;
  group: Group;
}> = ({ configFiles, tokens, bundle, onDiscover, discovering, group }) => {
  const counts = bundle?.resource_counts ?? {};

  const alertItems: { msg: string; level: 'warn' | 'error' | 'info' }[] = [];
  if (!group.description) alertItems.push({ msg: 'Group has no description', level: 'info' });
  if (group.member_count === 1) alertItems.push({ msg: 'Only one member — add teammates', level: 'warn' });
  if (group.pipeline_count === 0) alertItems.push({ msg: 'No pipelines linked to this group', level: 'info' });
  if ((counts['secret'] ?? 0) === 0) alertItems.push({ msg: 'No secrets registered', level: 'info' });

  return (
    <Stack spacing={2} sx={{ height: '100%', overflowY: 'auto', p: 2 }}>

      {/* Auto-Discovery */}
      <Box sx={{ ...dashboardCardSx, p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '.82rem', color: t.textPrimary }}>Auto-Discovery</Typography>
          <Tooltip title="Scan for new group resources">
            <IconButton size="small" onClick={onDiscover} disabled={discovering}
              sx={{ color: BP, '&:hover': { bgcolor: `${BP}18` } }}>
              {discovering ? <CircularProgress size={14} sx={{ color: BP }} /> : <ExploreIcon sx={{ fontSize: '1rem' }} />}
            </IconButton>
          </Tooltip>
        </Stack>
        <Typography sx={{ fontFamily: FONT, fontSize: '.75rem', color: t.textSecondary }}>
          Scans platform services for resources tagged with this group.
        </Typography>
      </Box>

      {/* Live metrics summary */}
      <Box sx={{ ...dashboardCardSx, p: 2 }}>
        <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '.82rem', color: t.textPrimary, mb: 1.5 }}>Resource Summary</Typography>
        <Stack spacing={0.8}>
          {[
            ['Projects',  counts['project']       ?? 0, BP],
            ['Pipelines', counts['pipeline']      ?? 0, sc.success],
            ['Containers',counts['container']     ?? 0, '#0891b2'],
            ['K8s',       counts['k8s_cluster']   ?? 0, '#0f766e'],
            ['Deploys',   counts['deployment']    ?? 0, '#7c3aed'],
            ['Secrets',   counts['secret']        ?? 0, sc.danger],
          ].map(([label, val, color]) => (
            <Stack key={label as string} direction="row" justifyContent="space-between" alignItems="center">
              <Typography sx={{ fontFamily: FONT, fontSize: '.76rem', color: t.textSecondary }}>{label}</Typography>
              <Chip label={val} size="small" sx={{ fontFamily: FONT, fontSize: '.72rem', height: 20, bgcolor: `${color}18`, color: color as string, border: `1px solid ${color}33` }} />
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* Config files */}
      <Box sx={{ ...dashboardCardSx, p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
          <InsertDriveFileIcon sx={{ fontSize: '1rem', color: BP }} />
          <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '.82rem', color: t.textPrimary }}>Config Files</Typography>
          <Chip label={configFiles.length} size="small" sx={{ fontFamily: FONT, fontSize: '.7rem', height: 18, bgcolor: `${BP}18`, color: BP }} />
        </Stack>
        {configFiles.length === 0 ? (
          <Typography sx={{ fontFamily: FONT, fontSize: '.76rem', color: t.textTertiary }}>No config files indexed yet.</Typography>
        ) : (
          <Stack spacing={0.8}>
            {configFiles.slice(0, 8).map((cf) => (
              <Stack key={cf.id} direction="row" alignItems="center" spacing={1}
                sx={{ px: 1, py: 0.6, borderRadius: 1, bgcolor: t.surface, border: `1px solid ${t.border}`, '&:hover': { borderColor: BP } }}>
                <Typography sx={{ fontSize: '.9rem' }}>{CONFIG_TYPE_ICONS[cf.file_type] ?? 'file'}</Typography>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontFamily: FONT, fontSize: '.76rem', fontWeight: 600, color: t.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {cf.file_name}
                  </Typography>
                  <Typography sx={{ fontFamily: FONT, fontSize: '.68rem', color: t.textTertiary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {cf.file_path}
                  </Typography>
                </Box>
              </Stack>
            ))}
            {configFiles.length > 8 && (
              <Typography sx={{ fontFamily: FONT, fontSize: '.72rem', color: t.textTertiary, textAlign: 'center' }}>
                +{configFiles.length - 8} more
              </Typography>
            )}
          </Stack>
        )}
      </Box>

      {/* Keys & Tokens */}
      <Box sx={{ ...dashboardCardSx, p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
          <KeyIcon sx={{ fontSize: '1rem', color: '#d97706' }} />
          <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '.82rem', color: t.textPrimary }}>API Keys</Typography>
          <Chip label={tokens.length} size="small" sx={{ fontFamily: FONT, fontSize: '.7rem', height: 18, bgcolor: '#d9770618', color: '#d97706' }} />
        </Stack>
        {tokens.length === 0 ? (
          <Typography sx={{ fontFamily: FONT, fontSize: '.76rem', color: t.textTertiary }}>No active API keys.</Typography>
        ) : (
          <Stack spacing={0.8}>
            {tokens.slice(0, 5).map((tk) => (
              <Stack key={tk.id} direction="row" alignItems="center" justifyContent="space-between"
                sx={{ px: 1, py: 0.6, borderRadius: 1, bgcolor: t.surface, border: `1px solid ${t.border}` }}>
                <Typography sx={{ fontFamily: FONT, fontSize: '.76rem', fontWeight: 600, color: t.textPrimary }}>{tk.name}</Typography>
                <Typography sx={{ fontFamily: 'monospace', fontSize: '.68rem', color: t.textTertiary }}>{tk.token_prefix}…</Typography>
              </Stack>
            ))}
          </Stack>
        )}
      </Box>

      {/* Alerts */}
      {alertItems.length > 0 && (
        <Box sx={{ ...dashboardCardSx, p: 2 }}>
          <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '.82rem', color: t.textPrimary, mb: 1 }}>Advisories</Typography>
          <Stack spacing={0.8}>
            {alertItems.map((a, i) => (
              <Stack key={i} direction="row" spacing={0.75} alignItems="flex-start">
                {a.level === 'error' ? <ErrorIcon sx={{ fontSize: '.85rem', color: sc.danger, mt: 0.1, flexShrink: 0 }} />
                  : a.level === 'warn' ? <WarningAmberIcon sx={{ fontSize: '.85rem', color: '#d97706', mt: 0.1, flexShrink: 0 }} />
                  : <CheckCircleIcon sx={{ fontSize: '.85rem', color: sc.info, mt: 0.1, flexShrink: 0 }} />}
                <Typography sx={{ fontFamily: FONT, fontSize: '.75rem', color: t.textSecondary, lineHeight: 1.4 }}>{a.msg}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      )}
    </Stack>
  );
};

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────

const GroupDashboardPage: React.FC = () => {
  const { groupId, section } = useParams<{ groupId: string; section?: string }>();
  const navigate = useNavigate();
  const { can: canGroup } = useGroupPermissions(groupId);

  const activeSection: SectionId = (SIDEBAR_ITEMS.some(s => s.id === section) ? section : 'overview') as SectionId;

  const [group,        setGroup]        = useState<Group | null>(null);
  const [members,      setMembers]      = useState<GroupMember[]>([]);
  const [auditLogs,    setAuditLogs]    = useState<GroupAuditLog[]>([]);
  const [environments, setEnvironments] = useState<ApiEnvironment[]>([]);
  const [bundle,       setBundle]       = useState<GroupResourceBundle | null>(null);
  const [configFiles,  setConfigFiles]  = useState<GroupConfigFile[]>([]);
  const [workspaces,   setWorkspaces]   = useState<GroupWorkspaceSummary[]>([]);
  const [sidebarCounts, setSidebarCounts] = useState<Record<string, number>>({});
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [rightOpen,    setRightOpen]    = useState(true);
  const [discovering,  setDiscovering]  = useState(false);

  const load = useCallback(async () => {
    if (!groupId) return;
    setLoading(true); setError('');
    try {
      const [grp, mems, logs, envs, bndl, cfgs, wss] = await Promise.all([
        getGroup(groupId),
        listMembers(groupId),
        listAuditLogs(groupId),
        listEnvironments(),
        getGroupResources(groupId).catch(() => null),
        listGroupConfigFiles(groupId).catch(() => [] as GroupConfigFile[]),
        listGroupWorkspaces(groupId).catch(() => [] as GroupWorkspaceSummary[]),
      ]);
      setGroup(grp);
      setMembers(mems);
      setAuditLogs(logs);
      setEnvironments(envs);
      setBundle(bndl);
      setConfigFiles(cfgs);
      setWorkspaces(wss);
      if (bndl) setSidebarCounts(bndl.resource_counts ?? {});
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to load group.');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => { load(); }, [load]);

  const handleDiscover = async () => {
    if (!groupId) return;
    setDiscovering(true);
    try {
      await triggerGroupDiscovery(groupId);
      await load();
    } finally {
      setDiscovering(false);
    }
  };

  const handleMemberRemoved = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    if (group) setGroup({ ...group, member_count: Math.max(0, group.member_count - 1) });
  };

  const handleMemberRoleChanged = (id: string, newRole: GroupRole) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, role: newRole } : m));
  };

  const sCount = (id: string): number => {
    const map: Record<string, number> = {
      projects:     group?.project_count ?? 0,
      pipelines:    group?.pipeline_count ?? 0,
      environments: environments.length,
      containers:   sidebarCounts['container'] ?? 0,
      kubernetes:   sidebarCounts['k8s_cluster'] ?? 0,
      deployments:  sidebarCounts['deployment'] ?? 0,
      metrics:      sidebarCounts['metric_stream'] ?? 0,
      logs:         sidebarCounts['log_stream'] ?? 0,
      secrets:      sidebarCounts['secret'] ?? 0,
      'env-vars':   sidebarCounts['env_var'] ?? 0,
      access:       group?.member_count ?? 0,
      workspaces:   workspaces.length,
      audit:        auditLogs.length,
    };
    return map[id] ?? 0;
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: t.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={36} sx={{ color: BP }} />
      </Box>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (error || !group) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: t.background, p: 3 }}>
        <Alert severity="error" sx={{ fontFamily: FONT, mb: 2 }}>{error || 'Group not found.'}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/developer/Dashboard/groups')}
          sx={{ fontFamily: FONT, textTransform: 'none', color: BP }}>Back to Groups</Button>
      </Box>
    );
  }

  // ── Render section content ──────────────────────────────────────────────────
  const renderCenter = () => {
    switch (activeSection) {
      case 'overview':     return <OverviewSection group={group} bundle={bundle} environments={environments} workspaces={workspaces} groupId={groupId!} onNavigate={(s) => navigate(`/groups/${groupId}/${s}`)} />;
      case 'projects':     return <ResourceTable rows={bundle?.projects ?? []} emptyIcon={<FolderOpenIcon />} emptyMsg="No projects linked" />;
      case 'pipelines':    return <GroupPipelinesPanel groupId={groupId!} />;
      case 'environments': return <EnvironmentsSection environments={environments} navigate={navigate} />;
      case 'containers':   return <ResourceTable rows={bundle?.containers ?? []} emptyIcon={<AppsIcon />} emptyMsg="No containers linked" />;
      case 'kubernetes':   return <ResourceTable rows={bundle?.k8s_clusters ?? []} emptyIcon={<CloudQueueIcon />} emptyMsg="No Kubernetes clusters linked" />;
      case 'deployments':  return <ResourceTable rows={bundle?.deployments ?? []} emptyIcon={<RocketLaunchIcon />} emptyMsg="No deployments linked" />;
      case 'metrics':      return <MetricsSection bundle={bundle} />;
      case 'logs':         return <LogsSection bundle={bundle} />;
      case 'secrets':      return <ResourceTable rows={bundle?.secrets ?? []} emptyIcon={<LockIcon />} emptyMsg="No secrets registered" />;
      case 'env-vars':     return <ResourceTable rows={bundle?.env_vars ?? []} emptyIcon={<LayersIcon />} emptyMsg="No environment variables registered" />;
      case 'access':       return <AccessSection members={members} myRole={group.my_role} groupId={groupId!} onRemoved={handleMemberRemoved} onRoleChanged={handleMemberRoleChanged} />;
      case 'settings':     return <SettingsSection group={group} groupId={groupId!} onDeleted={() => navigate('/developer/Dashboard/groups')} />;
      case 'workspaces':   return <WorkspacesSection workspaces={workspaces} navigate={navigate} />;
      case 'audit':        return <AuditSection logs={auditLogs} />;
      default:             return null;
    }
  };

  const tokens: any[] = []; // populated from listTokens in a full implementation

  // ── Main 3-panel layout ─────────────────────────────────────────────────────
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: t.background, fontFamily: FONT, overflow: 'hidden' }}>

      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: t.surface, borderBottom: `1px solid ${t.border}`, px: 2.5, py: 1.5, flexShrink: 0 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          {/* Breadcrumb */}
          <Button variant="text" size="small" startIcon={<ArrowBackIcon sx={{ fontSize: '.9rem' }} />}
            onClick={() => navigate('/developer/Dashboard/groups')}
            sx={{ fontFamily: FONT, fontSize: '.78rem', textTransform: 'none', color: t.textSecondary, p: 0, minWidth: 0, '&:hover': { color: BP, bgcolor: 'transparent' } }}>
            Groups
          </Button>
          <Typography sx={{ color: t.border, fontSize: '.78rem' }}>/</Typography>

          {/* Group avatar + name */}
          <Stack direction="row" alignItems="center" spacing={1.25} sx={{ flex: 1 }}>
            <Box sx={{
              width: 28, height: 28, borderRadius: 1, flexShrink: 0,
              bgcolor: group.avatar_url ? 'transparent' : `${BP}22`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${t.border}`, overflow: 'hidden',
            }}>
              {group.avatar_url
                ? <Box component="img" src={group.avatar_url} alt={group.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <GroupIcon sx={{ fontSize: '.9rem', color: BP }} />}
            </Box>
            <Typography sx={{ fontFamily: FONT, fontWeight: 800, fontSize: '1rem', color: t.textPrimary }}>{group.name}</Typography>
            <Chip label={TYPE_LABELS[group.group_type] ?? group.group_type} size="small" sx={{ fontFamily: FONT, fontSize: '.72rem', bgcolor: `${BP}18`, color: BP, border: `1px solid ${BP}33` }} />
            <Chip label={group.visibility} size="small" sx={{ fontFamily: FONT, fontSize: '.72rem', textTransform: 'capitalize', bgcolor: `${VISIBILITY_COLORS[group.visibility]}18`, color: VISIBILITY_COLORS[group.visibility], border: `1px solid ${VISIBILITY_COLORS[group.visibility]}33` }} />
            {group.my_role && (
              <Chip label={`You: ${group.my_role}`} size="small" sx={{ fontFamily: FONT, fontSize: '.7rem', textTransform: 'capitalize', bgcolor: `${ROLE_COLORS[group.my_role]}18`, color: ROLE_COLORS[group.my_role], border: `1px solid ${ROLE_COLORS[group.my_role]}33` }} />
            )}
            <Typography sx={{ fontFamily: FONT, fontSize: '.78rem', color: t.textSecondary }}>@{group.handle}</Typography>
          </Stack>

          {/* Actions */}
          <Stack direction="row" spacing={1}>
            {(group.my_role === 'owner' || group.my_role === 'admin') && (
              <Tooltip title="Invite member">
                <IconButton size="small" onClick={() => navigate(`/groups/${groupId}/access`)}
                  sx={{ bgcolor: `${BP}18`, color: BP, '&:hover': { bgcolor: `${BP}28` } }}>
                  <PersonAddIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={load} sx={{ bgcolor: `${t.border}33`, color: t.textSecondary, '&:hover': { bgcolor: t.border } }}>
                <RefreshIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title={rightOpen ? 'Hide right panel' : 'Show right panel'}>
              <IconButton size="small" onClick={() => setRightOpen(o => !o)} sx={{ bgcolor: `${t.border}33`, color: t.textSecondary, '&:hover': { bgcolor: t.border } }}>
                {rightOpen ? <ChevronRightIcon sx={{ fontSize: '1rem' }} /> : <ChevronLeftIcon sx={{ fontSize: '1rem' }} />}
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>

      {/* ── Body: Sidebar + Center + Right ──────────────────────────────────── */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* LEFT SIDEBAR */}
        <Box sx={{
          width: 220, flexShrink: 0, bgcolor: t.surface,
          borderRight: `1px solid ${t.border}`,
          overflowY: 'auto', py: 1,
        }}>
          <List dense disablePadding>
            {SIDEBAR_ITEMS.map((item) => {
              const count = sCount(item.id);
              const active = activeSection === item.id;
              return (
                <React.Fragment key={item.id}>
                  {item.dividerBefore && <Divider sx={{ my: 0.5, borderColor: t.border }} />}
                  <ListItemButton
                    onClick={() => navigate(`/groups/${groupId}/${item.id}`)}
                    sx={{
                      mx: 0.75, borderRadius: 1, mb: 0.2, py: 0.7, px: 1.25,
                      bgcolor: active ? `${BP}18` : 'transparent',
                      '&:hover': { bgcolor: active ? `${BP}22` : `${t.border}44` },
                    }}>
                    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ color: active ? BP : t.textSecondary, display: 'flex', flexShrink: 0 }}>{item.icon}</Box>
                      <Typography sx={{ fontFamily: FONT, fontSize: '.82rem', fontWeight: active ? 700 : 500, color: active ? BP : t.textSecondary, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.label}
                      </Typography>
                      {count > 0 && (
                        <Chip label={count} size="small" sx={{ height: 18, fontFamily: FONT, fontSize: '.68rem', fontWeight: 700, bgcolor: active ? `${BP}22` : `${t.border}66`, color: active ? BP : t.textTertiary, minWidth: 22 }} />
                      )}
                    </Stack>
                  </ListItemButton>
                </React.Fragment>
              );
            })}
          </List>
        </Box>

        {/* CENTER PANEL */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 2.5 } }}>
          {/* Section header */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1.25}>
              <Box sx={{ color: BP }}>
                {SIDEBAR_ITEMS.find(s => s.id === activeSection)?.icon}
              </Box>
              <Typography sx={{ fontFamily: FONT, fontWeight: 800, fontSize: '1.05rem', color: t.textPrimary }}>
                {SIDEBAR_ITEMS.find(s => s.id === activeSection)?.label}
              </Typography>
              {sCount(activeSection) > 0 && (
                <Chip label={sCount(activeSection)} size="small" sx={{ fontFamily: FONT, fontSize: '.74rem', bgcolor: `${BP}18`, color: BP, height: 20 }} />
              )}
            </Stack>
          </Stack>

          {renderCenter()}
        </Box>

        {/* RIGHT PANEL */}
        {rightOpen && (
          <Box sx={{
            width: 280, flexShrink: 0,
            bgcolor: t.surface, borderLeft: `1px solid ${t.border}`,
            overflowY: 'auto',
          }}>
            <RightPanel
              configFiles={configFiles}
              tokens={tokens}
              bundle={bundle}
              onDiscover={handleDiscover}
              discovering={discovering}
              group={group}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default GroupDashboardPage;
