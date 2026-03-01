import React, { useEffect, useState, useCallback } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  LinearProgress,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Code as CodeIcon,
  Delete as DeleteIcon,
  FolderOpen as FolderOpenIcon,
  Group as GroupIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Settings as SettingsIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getGroup,
  listMembers,
  listAuditLogs,
  removeMember,
  Group,
  GroupMember,
  GroupAuditLog,
  GroupRole,
} from '../services/groupsApi';
import { dashboardCardSx, dashboardSemanticColors, dashboardTokens } from '../styles/dashboardDesignSystem';

const FONT = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

// ── helpers ───────────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<GroupRole, string> = {
  owner: '#7c3aed',
  admin: '#dc2626',
  maintainer: '#d97706',
  developer: '#2563eb',
  viewer: '#6b7280',
};

const TYPE_LABELS: Record<string, string> = {
  developer: 'Developer',
  production: 'Production',
  marketing: 'Marketing',
  data: 'Data',
  custom: 'Custom',
};

const VISIBILITY_COLORS: Record<string, string> = {
  public: dashboardSemanticColors.success,
  internal: '#d97706',
  private: '#6b7280',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

// ── sub-components ────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color }) => {
  const t = dashboardTokens.colors;
  return (
    <Box sx={{ ...dashboardCardSx, flex: 1, minWidth: 160, p: 2.5 }}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
          {icon}
        </Box>
        <Box>
          <Typography sx={{ fontFamily: FONT, fontSize: '1.5rem', fontWeight: 800, color: t.textPrimary, lineHeight: 1 }}>{value}</Typography>
          <Typography sx={{ fontFamily: FONT, fontSize: '.78rem', color: t.textSecondary, mt: 0.25 }}>{label}</Typography>
        </Box>
      </Stack>
    </Box>
  );
};

// ── Overview tab ──────────────────────────────────────────────────────────────

const OverviewTab: React.FC<{ group: Group }> = ({ group }) => {
  const t = dashboardTokens.colors;
  const BP = t.brandPrimary;

  const enabledResources = Object.entries(group.resources || {})
    .filter(([, v]) => v)
    .map(([k]) => k.replace(/_/g, ' '));

  return (
    <Stack spacing={2.5}>
      {/* Stats */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <StatCard label="Members" value={group.member_count} icon={<PeopleIcon sx={{ fontSize: '1.2rem' }} />} color={BP} />
        <StatCard label="Projects" value={group.project_count} icon={<FolderOpenIcon sx={{ fontSize: '1.2rem' }} />} color={dashboardSemanticColors.info} />
        <StatCard label="Pipelines" value={group.pipeline_count} icon={<TimelineIcon sx={{ fontSize: '1.2rem' }} />} color={dashboardSemanticColors.success} />
      </Stack>

      {/* Info card */}
      <Box sx={{ ...dashboardCardSx, p: 2.5 }}>
        <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '.9rem', color: t.textPrimary, mb: 2 }}>Group Details</Typography>
        <Stack spacing={1.25}>
          {[
            ['Handle', `@${group.handle}`],
            ['Type', TYPE_LABELS[group.group_type] ?? group.group_type],
            ['Visibility', group.visibility.charAt(0).toUpperCase() + group.visibility.slice(1)],
            ['Owner', group.owner?.display_name || group.owner?.username || '—'],
            ['Created', formatDate(group.created_at)],
            ['Last updated', formatDate(group.updated_at)],
          ].map(([label, value]) => (
            <Stack key={label} direction="row" spacing={1.5} alignItems="center">
              <Typography sx={{ fontFamily: FONT, fontSize: '.82rem', color: t.textSecondary, minWidth: 110 }}>{label}</Typography>
              <Typography sx={{ fontFamily: FONT, fontSize: '.85rem', color: t.textPrimary, fontWeight: 500 }}>{value}</Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* Resources */}
      {enabledResources.length > 0 && (
        <Box sx={{ ...dashboardCardSx, p: 2.5 }}>
          <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '.9rem', color: t.textPrimary, mb: 1.5 }}>Enabled Resources</Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {enabledResources.map((r) => (
              <Chip key={r} label={r} size="small"
                sx={{ textTransform: 'capitalize', fontFamily: FONT, fontSize: '.75rem', bgcolor: `${BP}18`, color: BP, border: `1px solid ${BP}33` }} />
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
    </Stack>
  );
};

// ── Projects tab ─────────────────────────────────────────────────────────────

const ProjectsTab: React.FC<{ group: Group }> = ({ group }) => {
  const t = dashboardTokens.colors;
  const BP = t.brandPrimary;

  return (
    <Box sx={{ ...dashboardCardSx, p: 3, textAlign: 'center' }}>
      <FolderOpenIcon sx={{ fontSize: '3rem', color: t.textSecondary, mb: 1.5, opacity: 0.5 }} />
      <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '1rem', color: t.textPrimary, mb: 0.75 }}>No projects yet</Typography>
      <Typography sx={{ fontFamily: FONT, fontSize: '.85rem', color: t.textSecondary, mb: 2.5 }}>
        Projects for <strong>{group.name}</strong> will appear here once the project model is connected.
      </Typography>
      <Chip label="Project API coming soon" size="small"
        sx={{ fontFamily: FONT, fontSize: '.75rem', bgcolor: `${BP}18`, color: BP, border: `1px solid ${BP}33` }} />
    </Box>
  );
};

// ── Members tab ───────────────────────────────────────────────────────────────

interface MembersTabProps {
  members: GroupMember[];
  myRole: GroupRole | null;
  groupId: string;
  onRemoved: (memberId: string) => void;
}

const MembersTab: React.FC<MembersTabProps> = ({ members, myRole, groupId, onRemoved }) => {
  const t = dashboardTokens.colors;
  const [busy, setBusy] = useState<string | null>(null);
  const canManage = myRole === 'owner' || myRole === 'admin';

  const handleRemove = async (member: GroupMember) => {
    if (!window.confirm(`Remove ${member.user.display_name || member.user.username} from the group?`)) return;
    setBusy(member.id);
    try {
      await removeMember(groupId, member.id);
      onRemoved(member.id);
    } catch {
      // no-op — user stays in list
    } finally {
      setBusy(null);
    }
  };

  if (members.length === 0) {
    return (
      <Box sx={{ ...dashboardCardSx, p: 3, textAlign: 'center' }}>
        <PeopleIcon sx={{ fontSize: '3rem', color: t.textSecondary, mb: 1.5, opacity: 0.5 }} />
        <Typography sx={{ fontFamily: FONT, fontWeight: 700, color: t.textPrimary }}>No members</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ ...dashboardCardSx, overflow: 'hidden' }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ '& th': { fontFamily: FONT, fontSize: '.75rem', fontWeight: 700, color: t.textSecondary, borderColor: t.border, bgcolor: t.surface } }}>
            <TableCell>Member</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Joined</TableCell>
            {canManage && <TableCell align="right">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {members.map((m) => (
            <TableRow key={m.id} sx={{ '& td': { fontFamily: FONT, fontSize: '.84rem', borderColor: t.border } }}>
              <TableCell>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Avatar sx={{ width: 30, height: 30, fontSize: '.7rem', bgcolor: ROLE_COLORS[m.role] + '33', color: ROLE_COLORS[m.role] }}>
                    {initials(m.user.display_name || m.user.username)}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontFamily: FONT, fontSize: '.84rem', fontWeight: 600, color: t.textPrimary }}>
                      {m.user.display_name || m.user.username}
                    </Typography>
                    <Typography sx={{ fontFamily: FONT, fontSize: '.72rem', color: t.textSecondary }}>{m.user.email}</Typography>
                  </Box>
                </Stack>
              </TableCell>
              <TableCell>
                <Chip label={m.role} size="small"
                  sx={{ fontFamily: FONT, fontSize: '.72rem', fontWeight: 600, textTransform: 'capitalize', bgcolor: `${ROLE_COLORS[m.role]}22`, color: ROLE_COLORS[m.role], border: `1px solid ${ROLE_COLORS[m.role]}44` }} />
              </TableCell>
              <TableCell sx={{ color: t.textSecondary }}>{formatDate(m.created_at)}</TableCell>
              {canManage && (
                <TableCell align="right">
                  {m.role !== 'owner' && (
                    <Tooltip title="Remove member">
                      <IconButton size="small" onClick={() => handleRemove(m)} disabled={busy === m.id}
                        sx={{ color: dashboardSemanticColors.danger, '&:hover': { bgcolor: `${dashboardSemanticColors.danger}18` } }}>
                        {busy === m.id ? <CircularProgress size={14} /> : <DeleteIcon sx={{ fontSize: '1rem' }} />}
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
  );
};

// ── Audit tab ─────────────────────────────────────────────────────────────────

const AuditTab: React.FC<{ logs: GroupAuditLog[] }> = ({ logs }) => {
  const t = dashboardTokens.colors;

  if (logs.length === 0) {
    return (
      <Box sx={{ ...dashboardCardSx, p: 3, textAlign: 'center' }}>
        <TimelineIcon sx={{ fontSize: '3rem', color: t.textSecondary, mb: 1.5, opacity: 0.5 }} />
        <Typography sx={{ fontFamily: FONT, fontWeight: 700, color: t.textPrimary }}>No audit events</Typography>
        <Typography sx={{ fontFamily: FONT, fontSize: '.85rem', color: t.textSecondary, mt: 0.5 }}>Group activity will be recorded here.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ ...dashboardCardSx, overflow: 'hidden' }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ '& th': { fontFamily: FONT, fontSize: '.75rem', fontWeight: 700, color: t.textSecondary, borderColor: t.border, bgcolor: t.surface } }}>
            <TableCell>Event</TableCell>
            <TableCell>Actor</TableCell>
            <TableCell>Target</TableCell>
            <TableCell>Time</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id} sx={{ '& td': { fontFamily: FONT, fontSize: '.83rem', borderColor: t.border } }}>
              <TableCell>
                <Typography sx={{ fontFamily: FONT, fontSize: '.83rem', fontWeight: 600, color: t.textPrimary, textTransform: 'replace' }}>
                  {log.action.replace(/_/g, ' ')}
                </Typography>
              </TableCell>
              <TableCell sx={{ color: t.textSecondary }}>{log.actor}</TableCell>
              <TableCell sx={{ color: t.textSecondary }}>{log.target || '—'}</TableCell>
              <TableCell sx={{ color: t.textSecondary, whiteSpace: 'nowrap' }}>{formatDateTime(log.created_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────

const TABS = ['overview', 'projects', 'members', 'audit'] as const;
type TabKey = typeof TABS[number];

const GroupDashboardPage: React.FC = () => {
  const { groupId, section } = useParams<{ groupId: string; section?: string }>();
  const navigate = useNavigate();
  const t = dashboardTokens.colors;
  const BP = t.brandPrimary;

  const activeTab: TabKey = (TABS.includes(section as TabKey) ? section : 'overview') as TabKey;

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [auditLogs, setAuditLogs] = useState<GroupAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadGroup = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    setError('');
    try {
      const [grp, mems, logs] = await Promise.all([
        getGroup(groupId),
        listMembers(groupId),
        listAuditLogs(groupId),
      ]);
      setGroup(grp);
      setMembers(mems);
      setAuditLogs(logs);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to load group.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => { loadGroup(); }, [loadGroup]);

  const handleTabChange = (_: React.SyntheticEvent, tab: TabKey) => {
    navigate(`/groups/${groupId}/${tab}`, { replace: true });
  };

  const handleMemberRemoved = (memberId: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    if (group) setGroup({ ...group, member_count: Math.max(0, group.member_count - 1) });
  };

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: t.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={36} sx={{ color: BP }} />
      </Box>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────────
  if (error || !group) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: t.background, p: { xs: 2, md: 3 } }}>
        <Alert severity="error" sx={{ fontFamily: FONT, mb: 2 }}>{error || 'Group not found.'}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/developer/Dashboard/groups')}
          sx={{ fontFamily: FONT, textTransform: 'none', color: BP }}>Back to Groups</Button>
      </Box>
    );
  }

  // ── Main layout ──────────────────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: t.background, fontFamily: FONT }}>

      {/* Header band */}
      <Box sx={{ bgcolor: t.surface, borderBottom: `1px solid ${t.border}`, px: { xs: 2, md: 3 }, pt: 2.5, pb: 0 }}>

        {/* Breadcrumb */}
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 2 }}>
          <Button variant="text" size="small" startIcon={<ArrowBackIcon sx={{ fontSize: '1rem' }} />}
            onClick={() => navigate('/developer/Dashboard/groups')}
            sx={{ fontFamily: FONT, fontSize: '.78rem', textTransform: 'none', color: t.textSecondary, p: 0, minWidth: 0, '&:hover': { color: BP, bgcolor: 'transparent' } }}>
            Groups
          </Button>
          <Typography sx={{ color: t.textSecondary, fontSize: '.78rem' }}>/</Typography>
          <Typography sx={{ fontFamily: FONT, fontSize: '.78rem', color: t.textPrimary }}>{group.name}</Typography>
        </Stack>

        {/* Group identity row */}
        <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ mb: 2.5 }}>
          <Box sx={{
            width: 52, height: 52, borderRadius: 2, flexShrink: 0,
            bgcolor: group.avatar_url ? 'transparent' : `${BP}22`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${t.border}`, overflow: 'hidden',
          }}>
            {group.avatar_url
              ? <Box component="img" src={group.avatar_url} alt={group.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <GroupIcon sx={{ fontSize: '1.6rem', color: BP }} />
            }
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
              <Typography sx={{ fontFamily: FONT, fontWeight: 800, fontSize: '1.2rem', color: t.textPrimary, letterSpacing: '-.02em' }}>
                {group.name}
              </Typography>
              <Chip label={TYPE_LABELS[group.group_type] ?? group.group_type} size="small"
                sx={{ fontFamily: FONT, fontSize: '.72rem', bgcolor: `${BP}18`, color: BP, border: `1px solid ${BP}33` }} />
              <Chip label={group.visibility} size="small"
                sx={{ fontFamily: FONT, fontSize: '.72rem', textTransform: 'capitalize',
                  bgcolor: `${VISIBILITY_COLORS[group.visibility]}22`,
                  color: VISIBILITY_COLORS[group.visibility],
                  border: `1px solid ${VISIBILITY_COLORS[group.visibility]}44` }} />
              {group.my_role && (
                <Chip label={`You: ${group.my_role}`} size="small"
                  sx={{ fontFamily: FONT, fontSize: '.72rem', textTransform: 'capitalize',
                    bgcolor: `${ROLE_COLORS[group.my_role]}22`, color: ROLE_COLORS[group.my_role],
                    border: `1px solid ${ROLE_COLORS[group.my_role]}44` }} />
              )}
            </Stack>
            <Typography sx={{ fontFamily: FONT, fontSize: '.82rem', color: t.textSecondary, mt: 0.25 }}>
              @{group.handle}
              {group.description && ` · ${group.description}`}
            </Typography>
          </Box>

          {/* Action buttons */}
          <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
            {(group.my_role === 'owner' || group.my_role === 'admin') && (
              <Tooltip title="Invite member">
                <IconButton size="small" onClick={() => navigate(`/groups/${groupId}/members`)}
                  sx={{ bgcolor: `${BP}18`, color: BP, '&:hover': { bgcolor: `${BP}30` } }}>
                  <PersonAddIcon sx={{ fontSize: '1.1rem' }} />
                </IconButton>
              </Tooltip>
            )}
            {group.my_role === 'owner' && (
              <Tooltip title="Settings">
                <IconButton size="small" onClick={() => navigate(`/groups/${groupId}/settings`)}
                  sx={{ bgcolor: t.border + '44', color: t.textSecondary, '&:hover': { bgcolor: t.border } }}>
                  <SettingsIcon sx={{ fontSize: '1.1rem' }} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={handleTabChange}
          sx={{
            minHeight: 38,
            '& .MuiTab-root': { fontFamily: FONT, fontSize: '.82rem', textTransform: 'none', minHeight: 38, fontWeight: 600, color: t.textSecondary, px: 1.5 },
            '& .Mui-selected': { color: BP },
            '& .MuiTabs-indicator': { bgcolor: BP, height: 2 },
          }}>
          <Tab value="overview" label="Overview" icon={<CodeIcon sx={{ fontSize: '1rem' }} />} iconPosition="start" />
          <Tab value="projects" label={`Projects${group.project_count > 0 ? ` · ${group.project_count}` : ''}`} icon={<FolderOpenIcon sx={{ fontSize: '1rem' }} />} iconPosition="start" />
          <Tab value="members" label={`Members · ${group.member_count}`} icon={<PeopleIcon sx={{ fontSize: '1rem' }} />} iconPosition="start" />
          <Tab value="audit" label="Audit Log" icon={<TimelineIcon sx={{ fontSize: '1rem' }} />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Tab content */}
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {activeTab === 'overview' && <OverviewTab group={group} />}
        {activeTab === 'projects' && <ProjectsTab group={group} />}
        {activeTab === 'members' && (
          <MembersTab
            members={members}
            myRole={group.my_role}
            groupId={groupId!}
            onRemoved={handleMemberRemoved}
          />
        )}
        {activeTab === 'audit' && <AuditTab logs={auditLogs} />}
      </Box>
    </Box>
  );
};

export default GroupDashboardPage;
