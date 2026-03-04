// AtonixCorp Cloud – Enterprise Dashboard
// Business command center: org management, teams, marketing, email, domains,
// branding, billing, and compliance — all scoped to an organization (tenant).

import React, { useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CardHeader,
  Chip, Button, Avatar, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer, LinearProgress,
  TextField, MenuItem, Select, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Tabs, Tab, Divider, IconButton, Tooltip,
  Alert, Snackbar, Paper,
} from '@mui/material';
import AddIcon                from '@mui/icons-material/Add';
import EditIcon               from '@mui/icons-material/Edit';
import GroupsIcon             from '@mui/icons-material/Groups';
import PersonAddIcon          from '@mui/icons-material/PersonAdd';
import CampaignIcon           from '@mui/icons-material/Campaign';
import MailOutlineIcon        from '@mui/icons-material/MailOutline';
import DomainIcon             from '@mui/icons-material/Language';
import PaletteIcon            from '@mui/icons-material/Palette';
import ReceiptLongIcon        from '@mui/icons-material/ReceiptLong';
import GppGoodIcon            from '@mui/icons-material/GppGood';
import CheckCircleIcon        from '@mui/icons-material/CheckCircle';
import TrendingUpIcon         from '@mui/icons-material/TrendingUp';
import DnsIcon                from '@mui/icons-material/Dns';
import VerifiedIcon           from '@mui/icons-material/Verified';
import ContentCopyIcon        from '@mui/icons-material/ContentCopy';
import RefreshIcon            from '@mui/icons-material/Refresh';
import FilterListIcon         from '@mui/icons-material/FilterList';
import DownloadIcon           from '@mui/icons-material/Download';
import ColorLensIcon          from '@mui/icons-material/ColorLens';
import BusinessIcon           from '@mui/icons-material/Business';
import CalendarTodayIcon      from '@mui/icons-material/CalendarToday';
import { useParams, useNavigate } from 'react-router-dom';
import { dashboardTokens, dashboardSemanticColors } from '../styles/dashboardDesignSystem';

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  bg:      dashboardTokens.colors.background,
  card:    dashboardTokens.colors.surface,
  card2:   dashboardTokens.colors.surfaceSubtle,
  border:  dashboardTokens.colors.border,
  text:    dashboardTokens.colors.textPrimary,
  sub:     dashboardTokens.colors.textSecondary,
  brand:   dashboardTokens.colors.brandPrimary,
  green:   dashboardSemanticColors.success,
  yellow:  dashboardSemanticColors.warning,
  red:     dashboardSemanticColors.danger,
  blue:    '#3b82f6',
  purple:  '#8b5cf6',
  font:    '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const fmt$ = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

// ── Types ─────────────────────────────────────────────────────────────────────
type OrgStatus   = 'ACTIVE' | 'SUSPENDED' | 'TRIAL';
type MemberRole  = 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER' | 'VIEWER';
type MemberStatus = 'ACTIVE' | 'INVITED' | 'SUSPENDED';
type TeamType    = 'DEPARTMENT' | 'FUNCTION' | 'SQUAD';
type CampaignStatus = 'DRAFT' | 'SCHEDULED' | 'RUNNING' | 'PAUSED' | 'COMPLETED';
type DomainStatus = 'ACTIVE' | 'PENDING_DNS' | 'FAILED';
type EmailDomainStatus = 'VERIFIED' | 'PENDING_DNS' | 'FAILED';

interface Org {
  id: string; name: string; slug: string; primary_domain: string;
  industry: string; country: string; plan: string; status: OrgStatus;
  created_at: string;
}
interface Member {
  id: string; name: string; email: string; avatar: string;
  role: MemberRole; status: MemberStatus; joined: string;
}
interface Team {
  id: string; name: string; type: TeamType; members: number; description: string;
}
interface Campaign {
  id: string; name: string; status: CampaignStatus; channel: string;
  audience: number; sent: number; opens: number; clicks: number; start: string;
}
interface EmailDomain {
  id: string; domain: string; status: EmailDomainStatus; dkim: string; spf: string;
}
interface DomainEntry {
  id: string; name: string; type: string; status: DomainStatus; linked: string[];
}
interface AuditEntry {
  id: string; actor: string; action: string; target: string; timestamp: string; ip: string;
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const mockOrg: Org = {
  id: 'org-001', name: 'AtonixCorp', slug: 'atonixcorp',
  primary_domain: 'atonixcorp.com', industry: 'Cloud Infrastructure',
  country: 'United States', plan: 'Enterprise', status: 'ACTIVE',
  created_at: '2023-01-15',
};

const mockMembers: Member[] = [
  { id: 'm1', name: 'Alice Nakamura', email: 'alice@atonixcorp.com', avatar: 'AN', role: 'OWNER',   status: 'ACTIVE',   joined: '2023-01-15' },
  { id: 'm2', name: 'Bob Reeves',     email: 'bob@atonixcorp.com',   avatar: 'BR', role: 'ADMIN',   status: 'ACTIVE',   joined: '2023-03-01' },
  { id: 'm3', name: 'Clara Singh',    email: 'clara@atonixcorp.com', avatar: 'CS', role: 'MANAGER', status: 'ACTIVE',   joined: '2023-06-10' },
  { id: 'm4', name: 'Dan Okafor',     email: 'dan@atonixcorp.com',   avatar: 'DO', role: 'MEMBER',  status: 'ACTIVE',   joined: '2024-01-20' },
  { id: 'm5', name: 'Eve Huang',      email: 'eve@atonixcorp.com',   avatar: 'EH', role: 'VIEWER',  status: 'INVITED',  joined: '2026-02-28' },
];

const mockTeams: Team[] = [
  { id: 't1', name: 'Engineering',  type: 'DEPARTMENT', members: 38, description: 'Platform, backend, frontend and SRE.' },
  { id: 't2', name: 'Marketing',    type: 'DEPARTMENT', members: 12, description: 'Brand, demand gen, content.' },
  { id: 't3', name: 'Sales',        type: 'DEPARTMENT', members: 18, description: 'AEs, SDRs, solutions engineers.' },
  { id: 't4', name: 'Finance',      type: 'FUNCTION',   members: 8,  description: 'FP&A, accounts payable, audit.' },
  { id: 't5', name: 'AI & Research',type: 'SQUAD',      members: 6,  description: 'ML models, data science, R&D.' },
];

const mockCampaigns: Campaign[] = [
  { id: 'c1', name: 'Q1 Product Launch',      status: 'RUNNING',   channel: 'EMAIL', audience: 12400, sent: 12400, opens: 4340, clicks: 892, start: '2026-02-01' },
  { id: 'c2', name: 'March Newsletter',        status: 'SCHEDULED', channel: 'EMAIL', audience: 8900,  sent: 0,     opens: 0,    clicks: 0,   start: '2026-03-05' },
  { id: 'c3', name: 'Feature Announcement V2', status: 'DRAFT',     channel: 'EMAIL', audience: 0,     sent: 0,     opens: 0,    clicks: 0,   start: '—' },
  { id: 'c4', name: 'Year-End Recap',          status: 'COMPLETED', channel: 'EMAIL', audience: 15000, sent: 14950, opens: 6200, clicks: 1380, start: '2025-12-15' },
];

const mockEmailDomains: EmailDomain[] = [
  { id: 'ed1', domain: 'mail.atonixcorp.com',    status: 'VERIFIED',    dkim: 'v=DKIM1; k=rsa; p=MIIBIj...', spf: 'v=spf1 include:_spf.atonixcorp.com ~all' },
  { id: 'ed2', domain: 'outbound.atonixcorp.com', status: 'PENDING_DNS', dkim: 'v=DKIM1; k=rsa; p=MIIBIj...', spf: 'v=spf1 include:_spf.atonixcorp.com ~all' },
];

const mockDomains: DomainEntry[] = [
  { id: 'd1', name: 'atonixcorp.com',      type: 'MIXED',     status: 'ACTIVE',  linked: ['App', 'Marketing', 'Email'] },
  { id: 'd2', name: 'app.atonixcorp.com',  type: 'APP',       status: 'ACTIVE',  linked: ['App'] },
  { id: 'd3', name: 'go.atonixcorp.com',   type: 'MARKETING', status: 'ACTIVE',  linked: ['Marketing'] },
  { id: 'd4', name: 'beta.atonixcorp.com', type: 'APP',       status: 'PENDING_DNS', linked: [] },
];

const mockAudit: AuditEntry[] = [
  { id: 'a1', actor: 'Alice Nakamura', action: 'MEMBER_INVITED',  target: 'eve@atonixcorp.com', timestamp: '2026-03-03 09:12', ip: '203.0.113.5' },
  { id: 'a2', actor: 'Bob Reeves',     action: 'CAMPAIGN_SENT',   target: 'Q1 Product Launch',  timestamp: '2026-03-02 14:30', ip: '203.0.113.8' },
  { id: 'a3', actor: 'Clara Singh',    action: 'DOMAIN_ADDED',    target: 'beta.atonixcorp.com', timestamp: '2026-03-01 11:00', ip: '203.0.113.12' },
  { id: 'a4', actor: 'Alice Nakamura', action: 'TEAM_CREATED',    target: 'AI & Research',       timestamp: '2026-02-28 16:45', ip: '203.0.113.5' },
  { id: 'a5', actor: 'Bob Reeves',     action: 'BILLING_UPDATED', target: 'Enterprise Plan',     timestamp: '2026-02-27 09:00', ip: '203.0.113.8' },
  { id: 'a6', actor: 'Dan Okafor',     action: 'TEMPLATE_CREATED', target: 'Newsletter Template', timestamp: '2026-02-26 13:22', ip: '203.0.113.19' },
];

const branding = {
  primary_color: '#153d75', secondary_color: '#1e5fa8', accent_color: '#00d4aa',
  logo_url: '', font_family: 'IBM Plex Sans',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function StatusChip({ status }: { status: string }) {
  const map: Record<string, [string, string]> = {
    ACTIVE: [T.green, 'Active'], VERIFIED: [T.green, 'Verified'],
    RUNNING: [T.blue, 'Running'], COMPLETED: [T.sub, 'Completed'],
    PENDING_DNS: [T.yellow, 'Pending DNS'], SCHEDULED: [T.blue, 'Scheduled'],
    INVITED: [T.yellow, 'Invited'], DRAFT: [T.sub, 'Draft'],
    PAUSED: [T.yellow, 'Paused'], SUSPENDED: [T.red, 'Suspended'],
    TRIAL: [T.yellow, 'Trial'], FAILED: [T.red, 'Failed'],
  };
  const [color, label] = map[status] ?? [T.sub, status];
  return (
    <Chip label={label} size="small"
      sx={{ bgcolor: `${color}22`, color, fontWeight: 700, fontSize: '.75rem', border: `1px solid ${color}44` }} />
  );
}

function SectionCard({ title, icon, children, action }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <Card sx={{ bgcolor: T.card, border: `1px solid ${T.border}`, mb: 3 }}>
      <CardHeader
        avatar={<Box sx={{ color: T.brand }}>{icon}</Box>}
        title={<Typography sx={{ color: T.text, fontWeight: 700, fontFamily: T.font }}>{title}</Typography>}
        action={action}
      />
      <CardContent sx={{ pt: 0 }}>{children}</CardContent>
    </Card>
  );
}

function MetricCard({ label, value, color, sub }: { label: string; value: string | number; color?: string; sub?: string }) {
  return (
    <Card sx={{ bgcolor: T.card, border: `1px solid ${T.border}` }}>
      <CardContent sx={{ textAlign: 'center', p: 2, '&:last-child': { pb: 2 } }}>
        <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: color ?? T.brand, fontFamily: T.font }}>{value}</Typography>
        <Typography variant="caption" sx={{ color: T.sub, textTransform: 'uppercase', fontFamily: T.font, letterSpacing: '.05em' }}>{label}</Typography>
        {sub && <Typography variant="caption" sx={{ display: 'block', color: T.sub, fontSize: '.7rem', mt: 0.25 }}>{sub}</Typography>}
      </CardContent>
    </Card>
  );
}

// ── Section: Overview ─────────────────────────────────────────────────────────
function OverviewSection({ org, navigate, orgSlug }: { org: Org; navigate: ReturnType<typeof useNavigate>; orgSlug: string }) {
  return (
    <Box>
      {/* Org identity */}
      <Card sx={{ bgcolor: T.card, border: `1px solid ${T.border}`, mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: T.brand, fontSize: '1.5rem' }}>
              {org.name.slice(0, 2).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography sx={{ color: T.text, fontWeight: 800, fontSize: '1.4rem', fontFamily: T.font }}>{org.name}</Typography>
                <StatusChip status={org.status} />
                <Chip label={org.plan} size="small" sx={{ bgcolor: `${T.brand}22`, color: T.brand, fontWeight: 700 }} />
              </Box>
              <Typography variant="body2" sx={{ color: T.sub, mt: 0.5 }}>
                {org.primary_domain} · {org.industry} · {org.country}
              </Typography>
              <Typography variant="caption" sx={{ color: T.sub }}>Member since {org.created_at}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* KPI metrics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 2 }}><MetricCard label="Members"    value={mockMembers.length}   color={T.brand}  /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><MetricCard label="Teams"      value={mockTeams.length}     color={T.blue}   /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><MetricCard label="Campaigns"  value={mockCampaigns.filter(c => c.status === 'RUNNING').length} color={T.green} sub="active" /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><MetricCard label="Emails 30d" value="26.8k"                color={T.purple} /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><MetricCard label="Domains"    value={mockDomains.filter(d => d.status === 'ACTIVE').length} color={T.yellow} sub="active" /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><MetricCard label="Audit Events" value={mockAudit.length}   color={T.sub}    /></Grid>
      </Grid>

      {/* Quick links */}
      <Grid container spacing={2}>
        {[
          { label: 'Manage Teams',           path: `teams`,        color: T.blue,   icon: <GroupsIcon /> },
          { label: 'Create Campaign',         path: `marketing`,    color: T.green,  icon: <CampaignIcon /> },
          { label: 'Configure Email Domain',  path: `email`,        color: T.purple, icon: <MailOutlineIcon /> },
          { label: 'View Billing',            path: `billing`,      color: T.yellow, icon: <ReceiptLongIcon /> },
        ].map(item => (
          <Grid key={item.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <Button
              fullWidth variant="outlined" startIcon={item.icon}
              onClick={() => navigate(`/enterprise/${orgSlug}/${item.path}`)}
              sx={{
                py: 2, borderColor: T.border, color: item.color,
                fontFamily: T.font, fontWeight: 600, justifyContent: 'flex-start',
                '&:hover': { bgcolor: `${item.color}11`, borderColor: item.color },
              }}
            >{item.label}</Button>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

// ── Section: Organization (Members) ──────────────────────────────────────────
function OrganizationSection() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<MemberRole>('MEMBER');
  const [snack, setSnack] = useState('');

  const handleInvite = () => {
    setSnack(`Invitation sent to ${inviteEmail}`);
    setInviteOpen(false);
    setInviteEmail('');
  };

  const roleColors: Record<MemberRole, string> = {
    OWNER: T.brand, ADMIN: T.blue, MANAGER: T.purple, MEMBER: T.green, VIEWER: T.sub,
  };

  return (
    <Box>
      <SectionCard title="Organization Members" icon={<GroupsIcon />}
        action={
          <Button startIcon={<PersonAddIcon />} variant="contained" size="small"
            sx={{ bgcolor: T.brand }} onClick={() => setInviteOpen(true)}>
            Invite Member
          </Button>
        }
      >
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Member', 'Email', 'Role', 'Status', 'Joined', ''].map(h => (
                  <TableCell key={h} sx={{ color: T.sub, fontFamily: T.font, fontSize: '.8rem', borderColor: T.border }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {mockMembers.map(m => (
                <TableRow key={m.id} hover sx={{ '& td': { borderColor: T.border } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: T.brand, fontSize: '.8rem' }}>{m.avatar}</Avatar>
                      <Typography variant="body2" sx={{ color: T.text, fontWeight: 600 }}>{m.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell><Typography variant="body2" sx={{ color: T.sub }}>{m.email}</Typography></TableCell>
                  <TableCell>
                    <Chip label={m.role} size="small"
                      sx={{ bgcolor: `${roleColors[m.role]}22`, color: roleColors[m.role], fontWeight: 700, fontSize: '.7rem' }} />
                  </TableCell>
                  <TableCell><StatusChip status={m.status} /></TableCell>
                  <TableCell><Typography variant="caption" sx={{ color: T.sub }}>{m.joined}</Typography></TableCell>
                  <TableCell>
                    <IconButton size="small"><EditIcon sx={{ fontSize: '1rem', color: T.sub }} /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </SectionCard>

      {/* Role matrix */}
      <SectionCard title="Role Permissions" icon={<GppGoodIcon />}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: T.sub, borderColor: T.border }}>Permission</TableCell>
                {(['OWNER','ADMIN','MANAGER','MEMBER','VIEWER'] as MemberRole[]).map(r => (
                  <TableCell key={r} align="center" sx={{ color: roleColors[r], borderColor: T.border, fontWeight: 700 }}>{r}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                ['Manage Organization', true, true, false, false, false],
                ['Manage Teams', true, true, true, false, false],
                ['Manage Marketing', true, true, true, true, false],
                ['Manage Email', true, true, true, true, false],
                ['Manage Domains', true, true, true, false, false],
                ['Manage Billing', true, true, false, false, false],
                ['View Compliance', true, true, true, false, false],
              ].map(([perm, ...vals]) => (
                <TableRow key={String(perm)} sx={{ '& td': { borderColor: T.border } }}>
                  <TableCell sx={{ color: T.text }}>{perm}</TableCell>
                  {(vals as boolean[]).map((v, i) => (
                    <TableCell key={i} align="center">
                      {v
                        ? <CheckCircleIcon sx={{ fontSize: '1rem', color: T.green }} />
                        : <Box sx={{ width: 8, height: 2, bgcolor: T.border, mx: 'auto', borderRadius: 1 }} />
                      }
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </SectionCard>

      {/* Invite dialog */}
      <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)} PaperProps={{ sx: { bgcolor: T.card, border: `1px solid ${T.border}` } }}>
        <DialogTitle sx={{ color: T.text }}>Invite Team Member</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important', minWidth: 380 }}>
          <TextField label="Email address" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
            fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { color: T.text } }} />
          <FormControl size="small" fullWidth>
            <InputLabel>Role</InputLabel>
            <Select value={inviteRole} label="Role" onChange={e => setInviteRole(e.target.value as MemberRole)}>
              {(['ADMIN','MANAGER','MEMBER','VIEWER'] as MemberRole[]).map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteOpen(false)} sx={{ color: T.sub }}>Cancel</Button>
          <Button variant="contained" sx={{ bgcolor: T.brand }} onClick={handleInvite} disabled={!inviteEmail}>Send Invite</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} message={snack} />
    </Box>
  );
}

// ── Section: Teams ────────────────────────────────────────────────────────────
function TeamsSection() {
  const [createOpen, setCreateOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamType, setTeamType] = useState<TeamType>('DEPARTMENT');
  const [teamDesc, setTeamDesc] = useState('');
  const [snack, setSnack] = useState('');

  const typeColor: Record<TeamType, string> = { DEPARTMENT: T.brand, FUNCTION: T.blue, SQUAD: T.purple };

  return (
    <Box>
      <SectionCard title="Teams & Departments" icon={<GroupsIcon />}
        action={
          <Button startIcon={<AddIcon />} variant="contained" size="small"
            sx={{ bgcolor: T.brand }} onClick={() => setCreateOpen(true)}>
            New Team
          </Button>
        }
      >
        <Grid container spacing={2}>
          {mockTeams.map(team => (
            <Grid key={team.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper sx={{ p: 2, bgcolor: T.card2, border: `1px solid ${T.border}`, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography sx={{ color: T.text, fontWeight: 700, fontFamily: T.font }}>{team.name}</Typography>
                  <Chip label={team.type} size="small"
                    sx={{ bgcolor: `${typeColor[team.type]}22`, color: typeColor[team.type], fontWeight: 700, fontSize: '.7rem' }} />
                </Box>
                <Typography variant="body2" sx={{ color: T.sub, mb: 1.5, fontSize: '.82rem' }}>{team.description}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: T.sub }}>{team.members} members</Typography>
                  <Button size="small" sx={{ color: T.brand, minWidth: 0, px: 1 }}>Manage</Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </SectionCard>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} PaperProps={{ sx: { bgcolor: T.card, border: `1px solid ${T.border}` } }}>
        <DialogTitle sx={{ color: T.text }}>Create Team</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important', minWidth: 380 }}>
          <TextField label="Team name" value={teamName} onChange={e => setTeamName(e.target.value)} fullWidth size="small" />
          <FormControl size="small" fullWidth>
            <InputLabel>Type</InputLabel>
            <Select value={teamType} label="Type" onChange={e => setTeamType(e.target.value as TeamType)}>
              <MenuItem value="DEPARTMENT">Department</MenuItem>
              <MenuItem value="FUNCTION">Function</MenuItem>
              <MenuItem value="SQUAD">Squad</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Description" value={teamDesc} onChange={e => setTeamDesc(e.target.value)} fullWidth size="small" multiline rows={2} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)} sx={{ color: T.sub }}>Cancel</Button>
          <Button variant="contained" sx={{ bgcolor: T.brand }} disabled={!teamName}
            onClick={() => { setSnack(`Team "${teamName}" created`); setCreateOpen(false); setTeamName(''); }}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} message={snack} />
    </Box>
  );
}

// ── Section: Marketing ────────────────────────────────────────────────────────
function MarketingSection() {
  const [tab, setTab] = useState(0);

  const totalSent  = mockCampaigns.reduce((s, c) => s + c.sent, 0);
  const totalOpens = mockCampaigns.reduce((s, c) => s + c.opens, 0);
  const totalClicks = mockCampaigns.reduce((s, c) => s + c.clicks, 0);
  const openRate  = totalSent ? ((totalOpens  / totalSent) * 100).toFixed(1) : '0';
  const clickRate = totalSent ? ((totalClicks / totalSent) * 100).toFixed(1) : '0';

  const statusColor: Record<CampaignStatus, string> = {
    RUNNING: T.green, SCHEDULED: T.blue, DRAFT: T.sub, PAUSED: T.yellow, COMPLETED: T.sub,
  };

  return (
    <Box>
      {/* Summary metrics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}><MetricCard label="Campaigns"  value={mockCampaigns.length}     color={T.brand}  /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><MetricCard label="Emails Sent" value={totalSent.toLocaleString()} color={T.blue}  /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><MetricCard label="Open Rate"   value={`${openRate}%`}           color={T.green}  /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><MetricCard label="Click Rate"  value={`${clickRate}%`}          color={T.purple} /></Grid>
      </Grid>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, '& .MuiTab-root': { color: T.sub }, '& .Mui-selected': { color: T.brand } }}>
        <Tab label="Campaigns" />
        <Tab label="Audiences" />
      </Tabs>

      {tab === 0 && (
        <SectionCard title="Campaigns" icon={<CampaignIcon />}
          action={<Button startIcon={<AddIcon />} variant="contained" size="small" sx={{ bgcolor: T.brand }}>New Campaign</Button>}
        >
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Campaign', 'Status', 'Audience', 'Sent', 'Opens', 'Clicks', 'Start'].map(h => (
                    <TableCell key={h} sx={{ color: T.sub, borderColor: T.border, fontSize: '.8rem' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {mockCampaigns.map(c => (
                  <TableRow key={c.id} hover sx={{ '& td': { borderColor: T.border } }}>
                    <TableCell sx={{ color: T.text, fontWeight: 600 }}>{c.name}</TableCell>
                    <TableCell>
                      <Chip label={c.status} size="small"
                        sx={{ bgcolor: `${statusColor[c.status]}22`, color: statusColor[c.status], fontWeight: 700, fontSize: '.7rem' }} />
                    </TableCell>
                    <TableCell sx={{ color: T.sub }}>{c.audience.toLocaleString()}</TableCell>
                    <TableCell sx={{ color: T.text }}>{c.sent.toLocaleString()}</TableCell>
                    <TableCell sx={{ color: T.green }}>{c.opens.toLocaleString()}</TableCell>
                    <TableCell sx={{ color: T.blue }}>{c.clicks.toLocaleString()}</TableCell>
                    <TableCell sx={{ color: T.sub }}>{c.start}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </SectionCard>
      )}

      {tab === 1 && (
        <SectionCard title="Audiences" icon={<GroupsIcon />}
          action={<Button startIcon={<AddIcon />} variant="contained" size="small" sx={{ bgcolor: T.brand }}>New Audience</Button>}
        >
          {[
            { name: 'All Subscribers',  count: 28500, source: 'IMPORT', active: 27100 },
            { name: 'Trial Users',      count: 4200,  source: 'INTEGRATION', active: 3900 },
            { name: 'Enterprise Leads', count: 620,   source: 'MANUAL', active: 580 },
          ].map(a => (
            <Box key={a.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: `1px solid ${T.border}` }}>
              <Box>
                <Typography sx={{ color: T.text, fontWeight: 600, fontSize: '.9rem' }}>{a.name}</Typography>
                <Typography variant="caption" sx={{ color: T.sub }}>Source: {a.source}</Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ color: T.text, fontWeight: 700 }}>{a.count.toLocaleString()}</Typography>
                <Typography variant="caption" sx={{ color: T.green }}>{a.active.toLocaleString()} active</Typography>
              </Box>
            </Box>
          ))}
        </SectionCard>
      )}
    </Box>
  );
}

// ── Section: Email Service ────────────────────────────────────────────────────
function EmailSection() {
  const [tab, setTab] = useState(0);
  const [snack, setSnack] = useState('');

  return (
    <Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, '& .MuiTab-root': { color: T.sub }, '& .Mui-selected': { color: T.brand } }}>
        <Tab label="Sending Domains" />
        <Tab label="Sender Identities" />
        <Tab label="Templates" />
        <Tab label="Logs & Analytics" />
      </Tabs>

      {tab === 0 && (
        <SectionCard title="Email Sending Domains" icon={<DnsIcon />}
          action={<Button startIcon={<AddIcon />} variant="contained" size="small" sx={{ bgcolor: T.brand }}>Add Domain</Button>}
        >
          {mockEmailDomains.map(d => (
            <Paper key={d.id} sx={{ p: 2, bgcolor: T.card2, border: `1px solid ${T.border}`, borderRadius: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <DomainIcon sx={{ color: T.brand }} />
                  <Typography sx={{ color: T.text, fontWeight: 700 }}>{d.domain}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <StatusChip status={d.status} />
                  <Tooltip title="Check DNS"><IconButton size="small" onClick={() => setSnack('DNS check triggered')}><RefreshIcon sx={{ fontSize: '1rem', color: T.sub }} /></IconButton></Tooltip>
                </Box>
              </Box>
              {d.status === 'PENDING_DNS' && (
                <Alert severity="warning" sx={{ mb: 1.5, fontSize: '.82rem', py: 0.5 }}>
                  Add the following DNS records to verify this domain.
                </Alert>
              )}
              {[['DKIM (TXT)', d.dkim], ['SPF (TXT)', d.spf]].map(([type, val]) => (
                <Box key={String(type)} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                  <Typography variant="caption" sx={{ color: T.sub, width: 90, flexShrink: 0 }}>{type}</Typography>
                  <Box sx={{ flex: 1, bgcolor: T.bg, borderRadius: 1, px: 1.5, py: 0.5, fontFamily: 'monospace', fontSize: '.72rem', color: T.sub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val}</Box>
                  <Tooltip title="Copy"><IconButton size="small" onClick={() => { navigator.clipboard?.writeText(String(val)); setSnack('Copied!'); }}><ContentCopyIcon sx={{ fontSize: '.9rem', color: T.sub }} /></IconButton></Tooltip>
                </Box>
              ))}
            </Paper>
          ))}
        </SectionCard>
      )}

      {tab === 1 && (
        <SectionCard title="Sender Identities" icon={<VerifiedIcon />}
          action={<Button startIcon={<AddIcon />} variant="contained" size="small" sx={{ bgcolor: T.brand }}>Add Sender</Button>}
        >
          {[
            { name: 'AtonixCorp Platform', email: 'noreply@atonixcorp.com', verified: true },
            { name: 'AtonixCorp Marketing', email: 'hello@atonixcorp.com',  verified: true },
            { name: 'AtonixCorp Support',   email: 'support@atonixcorp.com', verified: false },
          ].map(s => (
            <Box key={s.email} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: `1px solid ${T.border}` }}>
              <Box>
                <Typography sx={{ color: T.text, fontWeight: 600 }}>{s.name}</Typography>
                <Typography variant="caption" sx={{ color: T.sub }}>{s.email}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {s.verified
                  ? <Chip label="Verified" size="small" icon={<CheckCircleIcon sx={{ fontSize: '.9rem' }} />} sx={{ bgcolor: `${T.green}22`, color: T.green }} />
                  : <Button size="small" variant="outlined" sx={{ borderColor: T.yellow, color: T.yellow, fontSize: '.75rem' }}>Verify</Button>
                }
              </Box>
            </Box>
          ))}
        </SectionCard>
      )}

      {tab === 2 && (
        <SectionCard title="Email Templates" icon={<MailOutlineIcon />}
          action={<Button startIcon={<AddIcon />} variant="contained" size="small" sx={{ bgcolor: T.brand }}>New Template</Button>}
        >
          <Grid container spacing={2}>
            {[
              { name: 'Welcome Email',     subject: 'Welcome to AtonixCorp!',         vars: ['name', 'plan'], updated: '2026-02-20' },
              { name: 'Newsletter',        subject: 'AtonixCorp Monthly Update',       vars: ['name', 'month'], updated: '2026-03-01' },
              { name: 'Trial Expiry',      subject: 'Your trial ends in {{days}} days', vars: ['name', 'days'], updated: '2026-01-15' },
            ].map(t => (
              <Grid key={t.name} size={{ xs: 12, md: 4 }}>
                <Paper sx={{ p: 2, bgcolor: T.card2, border: `1px solid ${T.border}`, borderRadius: 2, height: '100%' }}>
                  <Typography sx={{ color: T.text, fontWeight: 700, mb: 0.5 }}>{t.name}</Typography>
                  <Typography variant="caption" sx={{ color: T.sub, display: 'block', mb: 1 }}>{t.subject}</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                    {t.vars.map(v => <Chip key={v} label={`{{${v}}}`} size="small" sx={{ bgcolor: `${T.brand}22`, color: T.brand, fontSize: '.7rem' }} />)}
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: T.sub }}>Updated {t.updated}</Typography>
                    <Button size="small" sx={{ color: T.brand, minWidth: 0, px: 1 }}>Edit</Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </SectionCard>
      )}

      {tab === 3 && (
        <SectionCard title="Email Analytics (Last 30 Days)" icon={<TrendingUpIcon />}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 6, md: 3 }}><MetricCard label="Sent"        value="26,812" color={T.brand}  /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><MetricCard label="Delivered"   value="26,490" color={T.green}  /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><MetricCard label="Open Rate"   value="34.2%"  color={T.blue}   /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><MetricCard label="Click Rate"  value="7.1%"   color={T.purple} /></Grid>
          </Grid>
          <Box>
            {[['Bounce Rate', '1.2%', T.yellow], ['Unsubscribe Rate', '0.4%', T.red], ['Spam Rate', '0.02%', T.sub]].map(([label, val, color]) => (
              <Box key={String(label)} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: `1px solid ${T.border}` }}>
                <Typography variant="body2" sx={{ color: T.sub }}>{label}</Typography>
                <Typography variant="body2" sx={{ color, fontWeight: 700 }}>{val}</Typography>
              </Box>
            ))}
          </Box>
        </SectionCard>
      )}
      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack('')} message={snack} />
    </Box>
  );
}

// ── Section: Domains ──────────────────────────────────────────────────────────
function DomainsSection() {
  return (
    <SectionCard title="Organization Domains" icon={<DomainIcon />}
      action={<Button startIcon={<AddIcon />} variant="contained" size="small" sx={{ bgcolor: T.brand }}>Add Domain</Button>}
    >
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {['Domain', 'Type', 'Status', 'Used For', ''].map(h => (
                <TableCell key={h} sx={{ color: T.sub, borderColor: T.border, fontSize: '.8rem' }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {mockDomains.map(d => (
              <TableRow key={d.id} hover sx={{ '& td': { borderColor: T.border } }}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DomainIcon sx={{ fontSize: '1rem', color: T.brand }} />
                    <Typography variant="body2" sx={{ color: T.text, fontWeight: 600 }}>{d.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell><Typography variant="caption" sx={{ color: T.sub }}>{d.type}</Typography></TableCell>
                <TableCell><StatusChip status={d.status} /></TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {d.linked.map(l => <Chip key={l} label={l} size="small" sx={{ bgcolor: `${T.brand}22`, color: T.brand, fontSize: '.7rem' }} />)}
                  </Box>
                </TableCell>
                <TableCell>
                  <Button size="small" sx={{ color: T.brand, minWidth: 0, px: 1 }}>Records</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </SectionCard>
  );
}

// ── Section: Branding ─────────────────────────────────────────────────────────
function BrandingSection() {
  const [primary, setPrimary]     = useState(branding.primary_color);
  const [secondary, setSecondary] = useState(branding.secondary_color);
  const [accent, setAccent]       = useState(branding.accent_color);
  const [snack, setSnack]         = useState('');

  return (
    <Box>
      <SectionCard title="Brand Identity" icon={<PaletteIcon />}
        action={
          <Button variant="contained" size="small" sx={{ bgcolor: T.brand }}
            onClick={() => setSnack('Branding profile saved')}>
            Save Changes
          </Button>
        }
      >
        <Grid container spacing={3}>
          {/* Color palette */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography variant="body2" sx={{ color: T.sub, mb: 2, fontWeight: 600 }}>Color Palette</Typography>
            {[
              { label: 'Primary Color',   value: primary,   set: setPrimary },
              { label: 'Secondary Color', value: secondary, set: setSecondary },
              { label: 'Accent Color',    value: accent,    set: setAccent },
            ].map(c => (
              <Box key={c.label} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box component="input" type="color" value={c.value}
                  onChange={(e: any) => c.set(e.target.value)}
                  sx={{ width: 40, height: 40, borderRadius: 1, border: `2px solid ${T.border}`, cursor: 'pointer', p: 0.25 }} />
                <Box>
                  <Typography variant="body2" sx={{ color: T.text, fontWeight: 600 }}>{c.label}</Typography>
                  <Typography variant="caption" sx={{ color: T.sub, fontFamily: 'monospace' }}>{c.value.toUpperCase()}</Typography>
                </Box>
              </Box>
            ))}
          </Grid>

          {/* Preview */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant="body2" sx={{ color: T.sub, mb: 2, fontWeight: 600 }}>Live Preview</Typography>
            <Paper sx={{ bgcolor: primary, borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1, borderBottom: `1px solid ${secondary}` }}>
                <Box sx={{ width: 28, height: 28, borderRadius: 1, bgcolor: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '.75rem' }}>A</Typography>
                </Box>
                <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '.9rem', fontFamily: T.font }}>AtonixCorp</Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Button variant="contained" size="small" sx={{ bgcolor: accent, color: '#fff', mb: 1, mr: 1, '&:hover': { bgcolor: accent } }}>
                  Get Started
                </Button>
                <Button variant="outlined" size="small" sx={{ borderColor: 'rgba(255,255,255,.4)', color: '#fff', '&:hover': { borderColor: '#fff' } }}>
                  Learn More
                </Button>
                <Typography variant="caption" sx={{ display: 'block', color: 'rgba(255,255,255,.6)', mt: 1.5, fontFamily: branding.font_family }}>
                  {branding.font_family} · Enterprise branding preview
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </SectionCard>

      {/* Brand assets */}
      <SectionCard title="Brand Assets" icon={<ColorLensIcon />}
        action={<Button startIcon={<AddIcon />} variant="outlined" size="small" sx={{ borderColor: T.border, color: T.text }}>Upload Asset</Button>}
      >
        <Grid container spacing={2}>
          {[
            { type: 'LOGO', label: 'Primary Logo', size: '512×512 PNG' },
            { type: 'ICON', label: 'App Icon',     size: '192×192 PNG' },
            { type: 'IMAGE', label: 'OG Image',   size: '1200×630 PNG' },
          ].map(a => (
            <Grid key={a.type} size={{ xs: 12, sm: 4 }}>
              <Paper sx={{ p: 2, bgcolor: T.card2, border: `2px dashed ${T.border}`, borderRadius: 2, textAlign: 'center' }}>
                <Box sx={{ width: 64, height: 64, bgcolor: `${T.brand}22`, borderRadius: 2, mx: 'auto', mb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ColorLensIcon sx={{ color: T.brand }} />
                </Box>
                <Typography variant="body2" sx={{ color: T.text, fontWeight: 600 }}>{a.label}</Typography>
                <Typography variant="caption" sx={{ color: T.sub }}>{a.size}</Typography>
                <Box sx={{ mt: 1.5 }}>
                  <Button size="small" sx={{ color: T.brand, fontSize: '.75rem' }}>Upload</Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </SectionCard>
      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} message={snack} />
    </Box>
  );
}

// ── Section: Billing ──────────────────────────────────────────────────────────
function BillingSection({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const invoices = [
    { id: 'INV-2026-03', period: 'Mar 2026', amount: 2199, status: 'DUE',  due: '2026-04-01' },
    { id: 'INV-2026-02', period: 'Feb 2026', amount: 2199, status: 'PAID', due: '2026-03-01' },
    { id: 'INV-2026-01', period: 'Jan 2026', amount: 2099, status: 'PAID', due: '2026-02-01' },
  ];

  return (
    <Box>
      {/* Plan card */}
      <Card sx={{ bgcolor: `${T.brand}11`, border: `1px solid ${T.brand}44`, mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography sx={{ color: T.text, fontWeight: 800, fontSize: '1.3rem', fontFamily: T.font }}>Enterprise Plan</Typography>
              <Typography variant="body2" sx={{ color: T.sub, mt: 0.5 }}>Next renewal: April 1, 2026 · Annual contract</Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ color: T.brand, fontWeight: 800, fontSize: '1.6rem', fontFamily: T.font }}>{fmt$(2199)}<Typography component="span" variant="caption" sx={{ color: T.sub }}>/mo</Typography></Typography>
              <Button variant="outlined" size="small" sx={{ borderColor: T.brand, color: T.brand, mt: 1 }}
                onClick={() => navigate('/billing')}>
                Manage Billing
              </Button>
            </Box>
          </Box>

          {/* Usage meters */}
          <Divider sx={{ my: 2, borderColor: T.border }} />
          <Grid container spacing={2}>
            {[
              { label: 'Members',    used: 287, limit: 500 },
              { label: 'Teams',      used: 5,   limit: 50  },
              { label: 'Campaigns',  used: 12,  limit: 100 },
              { label: 'Domains',    used: 4,   limit: 25  },
            ].map(m => (
              <Grid key={m.label} size={{ xs: 12, sm: 6, md: 3 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ color: T.sub }}>{m.label}</Typography>
                    <Typography variant="caption" sx={{ color: T.text }}>{m.used} / {m.limit}</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={(m.used / m.limit) * 100}
                    sx={{ height: 6, borderRadius: 3, bgcolor: `${T.brand}22`, '& .MuiLinearProgress-bar': { bgcolor: T.brand, borderRadius: 3 } }} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Invoices */}
      <SectionCard title="Recent Invoices" icon={<ReceiptLongIcon />}
        action={<Button startIcon={<DownloadIcon />} size="small" sx={{ color: T.sub }}>Export All</Button>}
      >
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Invoice', 'Period', 'Amount', 'Status', 'Due Date', ''].map(h => (
                  <TableCell key={h} sx={{ color: T.sub, borderColor: T.border, fontSize: '.8rem' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map(inv => (
                <TableRow key={inv.id} hover sx={{ '& td': { borderColor: T.border } }}>
                  <TableCell sx={{ color: T.text, fontFamily: 'monospace', fontWeight: 600 }}>{inv.id}</TableCell>
                  <TableCell sx={{ color: T.sub }}>{inv.period}</TableCell>
                  <TableCell sx={{ color: T.text, fontWeight: 700 }}>{fmt$(inv.amount)}</TableCell>
                  <TableCell><StatusChip status={inv.status} /></TableCell>
                  <TableCell sx={{ color: T.sub }}>{inv.due}</TableCell>
                  <TableCell>
                    <Tooltip title="Download PDF"><IconButton size="small"><DownloadIcon sx={{ fontSize: '1rem', color: T.sub }} /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </SectionCard>
    </Box>
  );
}

// ── Section: Compliance ───────────────────────────────────────────────────────
function ComplianceSection() {
  const [filter, setFilter] = useState('');
  const filtered = mockAudit.filter(e =>
    !filter || e.action.toLowerCase().includes(filter.toLowerCase()) || e.actor.toLowerCase().includes(filter.toLowerCase())
  );

  const actionColor: Record<string, string> = {
    MEMBER_INVITED: T.blue, CAMPAIGN_SENT: T.green, DOMAIN_ADDED: T.purple,
    TEAM_CREATED: T.brand, BILLING_UPDATED: T.yellow, TEMPLATE_CREATED: T.sub,
  };

  return (
    <Box>
      {/* Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}><MetricCard label="Audit Events"  value={mockAudit.length}  color={T.brand} /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><MetricCard label="Active Users"  value={mockMembers.filter(m => m.status === 'ACTIVE').length} color={T.green} /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><MetricCard label="Action Types"  value={new Set(mockAudit.map(a => a.action)).size} color={T.blue} /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><MetricCard label="Days Retained" value="90"  color={T.sub} sub="audit log" /></Grid>
      </Grid>

      <SectionCard title="Audit Log" icon={<GppGoodIcon />}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField size="small" placeholder="Filter events…" value={filter}
              onChange={e => setFilter(e.target.value)}
              sx={{ width: 200, '& .MuiOutlinedInput-root': { color: T.text } }}
              InputProps={{ startAdornment: <FilterListIcon sx={{ mr: 1, color: T.sub, fontSize: '1rem' }} /> }}
            />
            <Button startIcon={<DownloadIcon />} size="small" sx={{ color: T.sub }}>Export</Button>
          </Box>
        }
      >
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Actor', 'Action', 'Target', 'Timestamp', 'IP'].map(h => (
                  <TableCell key={h} sx={{ color: T.sub, borderColor: T.border, fontSize: '.8rem' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(e => (
                <TableRow key={e.id} hover sx={{ '& td': { borderColor: T.border } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: '.65rem', bgcolor: T.brand }}>
                        {e.actor.split(' ').map(w => w[0]).join('')}
                      </Avatar>
                      <Typography variant="body2" sx={{ color: T.text }}>{e.actor}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={e.action} size="small"
                      sx={{ bgcolor: `${actionColor[e.action] ?? T.sub}22`, color: actionColor[e.action] ?? T.sub, fontWeight: 700, fontSize: '.7rem', fontFamily: 'monospace' }} />
                  </TableCell>
                  <TableCell sx={{ color: T.sub }}>{e.target}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarTodayIcon sx={{ fontSize: '.8rem', color: T.sub }} />
                      <Typography variant="caption" sx={{ color: T.sub }}>{e.timestamp}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: T.sub, fontFamily: 'monospace', fontSize: '.78rem' }}>{e.ip}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </SectionCard>
    </Box>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const SECTION_META: Record<string, { label: string; icon: React.ReactNode }> = {
  overview:     { label: 'Overview',      icon: <BusinessIcon /> },
  organization: { label: 'Organization',  icon: <GroupsIcon /> },
  teams:        { label: 'Teams',         icon: <GroupsIcon /> },
  marketing:    { label: 'Marketing',     icon: <CampaignIcon /> },
  email:        { label: 'Email Service', icon: <MailOutlineIcon /> },
  domains:      { label: 'Domains',       icon: <DomainIcon /> },
  branding:     { label: 'Branding',      icon: <PaletteIcon /> },
  billing:      { label: 'Billing',       icon: <ReceiptLongIcon /> },
  compliance:   { label: 'Compliance',    icon: <GppGoodIcon /> },
};

const EnterpriseDashboardPage: React.FC = () => {
  const { orgSlug = 'atonixcorp', section = 'overview' } = useParams<{ orgSlug: string; section: string }>();
  const navigate = useNavigate();
  const meta = SECTION_META[section] ?? SECTION_META.overview;

  return (
    <Box sx={{ bgcolor: T.bg, minHeight: '100vh', p: { xs: 2, md: 3 }, fontFamily: T.font }}>
      {/* Page header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <Box sx={{ color: T.brand }}>{meta.icon}</Box>
          <Typography sx={{ color: T.text, fontWeight: 800, fontSize: '1.35rem', fontFamily: T.font }}>
            {meta.label}
          </Typography>
          <Chip label={mockOrg.name} size="small"
            sx={{ bgcolor: `${T.brand}22`, color: T.brand, fontWeight: 700, ml: 0.5 }} />
        </Box>
        <Typography variant="body2" sx={{ color: T.sub, fontFamily: T.font }}>
          Enterprise Dashboard · {mockOrg.primary_domain} · {mockOrg.plan}
        </Typography>
      </Box>

      {/* Section content */}
      {section === 'overview'     && <OverviewSection     org={mockOrg} navigate={navigate} orgSlug={orgSlug} />}
      {section === 'organization' && <OrganizationSection />}
      {section === 'teams'        && <TeamsSection />}
      {section === 'marketing'    && <MarketingSection />}
      {section === 'email'        && <EmailSection />}
      {section === 'domains'      && <DomainsSection />}
      {section === 'branding'     && <BrandingSection />}
      {section === 'billing'      && <BillingSection navigate={navigate} />}
      {section === 'compliance'   && <ComplianceSection />}

      {/* Fallback */}
      {!SECTION_META[section] && (
        <Alert severity="info">
          Section "{section}" not found. <Button size="small" onClick={() => navigate(`/enterprise/${orgSlug}/overview`)}>Go to Overview</Button>
        </Alert>
      )}
    </Box>
  );
};

export default EnterpriseDashboardPage;
