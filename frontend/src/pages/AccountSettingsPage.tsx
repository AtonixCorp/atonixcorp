// AtonixCorp Cloud – Account Settings Page
import React, { useState } from 'react';
import {
  Box, Typography, Stack, Divider, Avatar, TextField, Button,
  Switch, FormControlLabel, Chip, IconButton, Tooltip,
  List, ListItemButton, ListItemIcon, ListItemText, Paper,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useParams } from 'react-router-dom';
import PersonIcon        from '@mui/icons-material/Person';
import LockIcon          from '@mui/icons-material/Lock';
import KeyIcon           from '@mui/icons-material/Key';
import ApiIcon           from '@mui/icons-material/Api';
import TuneIcon          from '@mui/icons-material/Tune';
import NotificationsIcon from '@mui/icons-material/Notifications';
import GppGoodIcon       from '@mui/icons-material/GppGood';
import GroupIcon         from '@mui/icons-material/Group';
import AddIcon           from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ContentCopyIcon   from '@mui/icons-material/ContentCopy';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon    from '@mui/icons-material/Visibility';
import { useAuth }       from '../contexts/AuthContext';

// ── Section config ────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    group: 'Account',
    items: [
      { key: 'profile',        label: 'Profile',        icon: <PersonIcon fontSize="small" /> },
      { key: 'preferences',    label: 'Preferences',    icon: <TuneIcon fontSize="small" /> },
      { key: 'notifications',  label: 'Notifications',  icon: <NotificationsIcon fontSize="small" /> },
    ],
  },
  {
    group: 'Security',
    items: [
      { key: 'authentication', label: 'Authentication', icon: <LockIcon fontSize="small" /> },
      { key: 'ssh-keys',       label: 'SSH Keys',       icon: <KeyIcon fontSize="small" /> },
      { key: 'compliance',     label: 'Compliance',     icon: <GppGoodIcon fontSize="small" /> },
    ],
  },
  {
    group: 'Developer',
    items: [
      { key: 'api',   label: 'API',   icon: <ApiIcon fontSize="small" /> },
      { key: 'users', label: 'Users', icon: <GroupIcon fontSize="small" /> },
    ],
  },
];

// ── Shared field styles ────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Box>
      <Typography variant="caption" fontWeight={600} sx={{ color: isDark ? 'rgba(255,255,255,.55)' : '#6B7280', textTransform: 'uppercase', letterSpacing: '.07em', mb: .5, display: 'block' }}>
        {label}
      </Typography>
      {children}
    </Box>
  );
}

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Paper elevation={0} sx={{ bgcolor: isDark ? '#132336' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,.08)' : '#E5E7EB'}`, borderRadius: '12px', p: 3, mb: 3 }}>
      <Typography fontWeight={700} fontSize="1rem" color={isDark ? '#ffffff' : '#0A0F1F'} mb={subtitle ? .5 : 2}>{title}</Typography>
      {subtitle && <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,.55)' : '#6B7280', mb: 2 }}>{subtitle}</Typography>}
      <Stack spacing={2.5}>{children}</Stack>
    </Paper>
  );
}

// ── Input component ────────────────────────────────────────────────────────────
function StyledInput({ label, defaultValue, type, placeholder }: { label?: string; defaultValue?: string; type?: string; placeholder?: string }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <TextField
      size="small"
      label={label}
      defaultValue={defaultValue}
      type={type}
      placeholder={placeholder}
      fullWidth
      sx={{
        '& .MuiOutlinedInput-root': {
          bgcolor: isDark ? 'rgba(255,255,255,.04)' : '#F9FAFB',
          '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,.12)' : '#E5E7EB' },
          '&:hover fieldset': { borderColor: isDark ? 'rgba(255,255,255,.25)' : '#18366A' },
          '&.Mui-focused fieldset': { borderColor: '#18366A' },
          color: isDark ? '#ffffff' : '#0A0F1F',
        },
        '& .MuiInputLabel-root': { color: isDark ? 'rgba(255,255,255,.55)' : '#6B7280' },
        '& .MuiInputLabel-root.Mui-focused': { color: '#18366A' },
      }}
    />
  );
}

// ── Action button ──────────────────────────────────────────────────────────────
function SaveButton({ label = 'Save Changes' }: { label?: string }) {
  return (
    <Box display="flex" justifyContent="flex-end">
      <Button variant="contained" sx={{ bgcolor: '#18366A', '&:hover': { bgcolor: '#102548' }, borderRadius: '8px', px: 3, fontWeight: 600, textTransform: 'none' }}>
        {label}
      </Button>
    </Box>
  );
}

// ── Sections ───────────────────────────────────────────────────────────────────

function ProfileSection() {
  const { user } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <>
      <SectionCard title="Personal Information" subtitle="Update your name, username, and contact information.">
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: '#18366A', fontSize: '1.5rem', fontWeight: 700 }}>
            {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
          </Avatar>
          <Stack>
            <Button size="small" variant="outlined" sx={{ textTransform: 'none', borderColor: '#18366A', color: '#18366A', '&:hover': { bgcolor: 'rgba(24,54,106,.05)' } }}>
              Change Avatar
            </Button>
            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,.45)' : '#9CA3AF', mt: .5 }}>JPG, PNG, GIF up to 2 MB</Typography>
          </Stack>
        </Box>
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
          <StyledInput label="First Name" defaultValue={user?.first_name || ''} />
          <StyledInput label="Last Name"  defaultValue={user?.last_name || ''} />
        </Box>
        <StyledInput label="Username"     defaultValue={user?.username || ''} />
        <StyledInput label="Email Address" defaultValue={user?.email || ''} type="email" />
        <SaveButton />
      </SectionCard>
      <SectionCard title="Danger Zone" subtitle="Permanently delete your account and all associated data.">
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Box>
            <Typography fontWeight={600} fontSize=".9rem" color={isDark ? '#ffffff' : '#0A0F1F'}>Delete Account</Typography>
            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,.45)' : '#9CA3AF' }}>This action is irreversible. All data will be lost.</Typography>
          </Box>
          <Button variant="outlined" color="error" size="small" sx={{ textTransform: 'none', borderRadius: '8px' }}>Delete Account</Button>
        </Box>
      </SectionCard>
    </>
  );
}

function AuthenticationSection() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <>
      <SectionCard title="Change Password" subtitle="Use a strong password with at least 12 characters.">
        <StyledInput label="Current Password"  type="password" />
        <StyledInput label="New Password"      type="password" />
        <StyledInput label="Confirm Password"  type="password" />
        <SaveButton label="Update Password" />
      </SectionCard>
      <SectionCard title="Two-Factor Authentication" subtitle="Add an extra layer of protection to your account.">
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Box>
            <Typography fontWeight={600} fontSize=".9rem" color={isDark ? '#ffffff' : '#0A0F1F'}>Authenticator App</Typography>
            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,.45)' : '#9CA3AF' }}>Use Google Authenticator, Authy, or any TOTP app.</Typography>
          </Box>
          <Button variant="contained" size="small" sx={{ bgcolor: '#18366A', '&:hover': { bgcolor: '#102548' }, textTransform: 'none', borderRadius: '8px' }}>Enable 2FA</Button>
        </Box>
        <Divider sx={{ borderColor: isDark ? 'rgba(255,255,255,.08)' : '#F3F4F6' }} />
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Box>
            <Typography fontWeight={600} fontSize=".9rem" color={isDark ? '#ffffff' : '#0A0F1F'}>SMS Verification</Typography>
            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,.45)' : '#9CA3AF' }}>Receive a code via SMS when logging in.</Typography>
          </Box>
          <Switch />
        </Box>
      </SectionCard>
      <SectionCard title="Active Sessions" subtitle="Devices currently logged in to your account.">
        {[
          { device: 'Chrome on Linux', location: 'Johannesburg, ZA', current: true },
          { device: 'Firefox on Windows', location: 'Cape Town, ZA', current: false },
        ].map((s, i) => (
          <Box key={i} display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
            <Box>
              <Typography fontWeight={600} fontSize=".88rem" color={isDark ? '#ffffff' : '#0A0F1F'}>{s.device}</Typography>
              <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,.45)' : '#9CA3AF' }}>{s.location}</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              {s.current && <Chip label="Current" size="small" sx={{ bgcolor: 'rgba(24,54,106,.12)', color: '#18366A', fontWeight: 700, fontSize: '.7rem' }} />}
              {!s.current && <Button size="small" color="error" sx={{ textTransform: 'none', fontSize: '.8rem' }}>Revoke</Button>}
            </Box>
          </Box>
        ))}
      </SectionCard>
    </>
  );
}

function SSHKeysSection() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const mockKeys = [
    { name: 'MacBook Pro', fingerprint: 'SHA256:3Kz8...aF94', added: 'Jan 12, 2026' },
    { name: 'Dev Server',  fingerprint: 'SHA256:7Pm1...bR62', added: 'Feb 3, 2026' },
  ];
  return (
    <>
      <SectionCard title="SSH Keys" subtitle="Manage public SSH keys used to authenticate with your servers.">
        <Stack spacing={1.5}>
          {mockKeys.map((k, i) => (
            <Box key={i} display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}
              sx={{ p: 1.5, bgcolor: isDark ? 'rgba(255,255,255,.04)' : '#F9FAFB', borderRadius: '8px', border: `1px solid ${isDark ? 'rgba(255,255,255,.08)' : '#E5E7EB'}` }}>
              <Box>
                <Typography fontWeight={600} fontSize=".88rem" color={isDark ? '#ffffff' : '#0A0F1F'}>{k.name}</Typography>
                <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,.45)' : '#9CA3AF', fontFamily: 'monospace' }}>{k.fingerprint}</Typography>
                <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,.35)' : '#9CA3AF', display: 'block' }}>Added {k.added}</Typography>
              </Box>
              <Tooltip title="Delete key">
                <IconButton size="small" sx={{ color: '#EF4444' }}><DeleteOutlineIcon fontSize="small" /></IconButton>
              </Tooltip>
            </Box>
          ))}
        </Stack>
        <Divider sx={{ borderColor: isDark ? 'rgba(255,255,255,.08)' : '#F3F4F6' }} />
        <Typography fontWeight={700} fontSize=".9rem" color={isDark ? '#ffffff' : '#0A0F1F'}>Add New SSH Key</Typography>
        <StyledInput label="Key Name" placeholder="e.g. My Laptop" />
        <TextField
          label="Public Key" multiline rows={3} fullWidth size="small"
          placeholder="ssh-rsa AAAA..."
          sx={{
            '& .MuiOutlinedInput-root': { bgcolor: isDark ? 'rgba(255,255,255,.04)' : '#F9FAFB', color: isDark ? '#ffffff' : '#0A0F1F', fontFamily: 'monospace', fontSize: '.82rem', '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,.12)' : '#E5E7EB' } },
            '& .MuiInputLabel-root': { color: isDark ? 'rgba(255,255,255,.55)' : '#6B7280' },
          }}
        />
        <Box display="flex" justifyContent="flex-end">
          <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: '#18366A', '&:hover': { bgcolor: '#102548' }, borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}>
            Add SSH Key
          </Button>
        </Box>
      </SectionCard>
    </>
  );
}

function APISection() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [show, setShow] = useState(false);
  const mockToken = 'atx_live_4f2a9b1c8e3d07f5a6b2c4d8e9f1a3b5c7d9e0f';
  return (
    <>
      <SectionCard title="API Tokens" subtitle="Authenticate programmatic access to AtonixCorp APIs.">
        <Box sx={{ p: 2, bgcolor: isDark ? 'rgba(255,255,255,.04)' : '#F9FAFB', borderRadius: '8px', border: `1px solid ${isDark ? 'rgba(255,255,255,.08)' : '#E5E7EB'}` }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography fontWeight={600} fontSize=".88rem" color={isDark ? '#ffffff' : '#0A0F1F'}>Personal Access Token</Typography>
            <Chip label="Active" size="small" sx={{ bgcolor: 'rgba(16,185,129,.12)', color: '#10B981', fontWeight: 700, fontSize: '.7rem' }} />
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: isDark ? 'rgba(255,255,255,.6)' : '#6B7280', flex: 1, wordBreak: 'break-all' }}>
              {show ? mockToken : mockToken.replace(/[^_]/g, (_, i) => i < 8 ? mockToken[i] : '•')}
            </Typography>
            <Tooltip title={show ? 'Hide' : 'Show'}>
              <IconButton size="small" onClick={() => setShow(p => !p)} sx={{ color: isDark ? 'rgba(255,255,255,.5)' : '#6B7280' }}>
                {show ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy token">
              <IconButton size="small" sx={{ color: isDark ? 'rgba(255,255,255,.5)' : '#6B7280' }}
                onClick={() => navigator.clipboard.writeText(mockToken)}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={1}>
          <Button variant="outlined" size="small" sx={{ textTransform: 'none', borderColor: isDark ? 'rgba(255,255,255,.2)' : '#E5E7EB', color: isDark ? '#ffffff' : '#374151', borderRadius: '8px' }}>
            Regenerate Token
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} size="small"
            sx={{ bgcolor: '#18366A', '&:hover': { bgcolor: '#102548' }, textTransform: 'none', borderRadius: '8px', fontWeight: 600 }}>
            Create New Token
          </Button>
        </Box>
      </SectionCard>
      <SectionCard title="API Documentation" subtitle="Learn how to integrate with AtonixCorp APIs.">
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={1.5}>
          {['REST API Reference', 'Authentication Guide', 'Rate Limits', 'Webhooks'].map(doc => (
            <Box key={doc} sx={{ p: 1.5, bgcolor: isDark ? 'rgba(255,255,255,.04)' : '#F9FAFB', borderRadius: '8px', border: `1px solid ${isDark ? 'rgba(255,255,255,.08)' : '#E5E7EB'}`, cursor: 'pointer', '&:hover': { borderColor: '#18366A' }, transition: 'border .15s' }}>
              <Typography fontWeight={600} fontSize=".85rem" color={isDark ? '#ffffff' : '#0A0F1F'}>{doc}</Typography>
            </Box>
          ))}
        </Box>
      </SectionCard>
    </>
  );
}

function UsersSection() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const members = [
    { name: 'Admin User', email: 'admin@atonixcorp.com', role: 'Owner', initials: 'A' },
    { name: 'Dev Team',   email: 'dev@atonixcorp.com',   role: 'Editor', initials: 'D' },
  ];
  return (
    <>
      <SectionCard title="Team Members" subtitle="Manage who has access to your organisation.">
        <Stack spacing={1.5}>
          {members.map((m, i) => (
            <Box key={i} display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}
              sx={{ p: 1.5, bgcolor: isDark ? 'rgba(255,255,255,.04)' : '#F9FAFB', borderRadius: '8px', border: `1px solid ${isDark ? 'rgba(255,255,255,.08)' : '#E5E7EB'}` }}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: '#18366A', fontSize: '.85rem', fontWeight: 700 }}>{m.initials}</Avatar>
                <Box>
                  <Typography fontWeight={600} fontSize=".88rem" color={isDark ? '#ffffff' : '#0A0F1F'}>{m.name}</Typography>
                  <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,.45)' : '#9CA3AF' }}>{m.email}</Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip label={m.role} size="small" sx={{ bgcolor: m.role === 'Owner' ? 'rgba(24,54,106,.12)' : 'rgba(0,0,0,.06)', color: m.role === 'Owner' ? '#18366A' : isDark ? '#ffffff' : '#374151', fontWeight: 700, fontSize: '.7rem' }} />
                {m.role !== 'Owner' && <Button size="small" color="error" sx={{ textTransform: 'none', fontSize: '.8rem', minWidth: 0 }}>Remove</Button>}
              </Box>
            </Box>
          ))}
        </Stack>
        <Box display="flex" justifyContent="flex-end">
          <Button variant="contained" startIcon={<AddIcon />}
            sx={{ bgcolor: '#18366A', '&:hover': { bgcolor: '#102548' }, borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}>
            Invite Member
          </Button>
        </Box>
      </SectionCard>
    </>
  );
}

function NotificationsSection() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const rows = [
    { label: 'Server alerts',           desc: 'Downtime, high CPU/RAM, failures' },
    { label: 'Billing notifications',   desc: 'Invoices, payment failures, usage limits' },
    { label: 'Security alerts',         desc: 'Login attempts, 2FA events' },
    { label: 'Product updates',         desc: 'New features and platform announcements' },
    { label: 'Team activity',           desc: 'Member invitations, role changes' },
  ];
  return (
    <SectionCard title="Notification Preferences" subtitle="Choose how and when you receive notifications.">
      <Box display="grid" gridTemplateColumns="1fr auto auto" alignItems="center" gap={1} sx={{ '& > *:nth-of-type(3n+2), & > *:nth-of-type(3n+3)': { textAlign: 'center' } }}>
        <Typography variant="caption" fontWeight={700} sx={{ color: isDark ? 'rgba(255,255,255,.45)' : '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.07em' }}>Notification</Typography>
        <Typography variant="caption" fontWeight={700} sx={{ color: isDark ? 'rgba(255,255,255,.45)' : '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.07em', px: 1 }}>Email</Typography>
        <Typography variant="caption" fontWeight={700} sx={{ color: isDark ? 'rgba(255,255,255,.45)' : '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.07em', px: 1 }}>In-App</Typography>
      </Box>
      <Divider sx={{ borderColor: isDark ? 'rgba(255,255,255,.08)' : '#F3F4F6' }} />
      {rows.map((r, i) => (
        <Box key={i} display="grid" gridTemplateColumns="1fr auto auto" alignItems="center" gap={1}>
          <Box>
            <Typography fontWeight={600} fontSize=".88rem" color={isDark ? '#ffffff' : '#0A0F1F'}>{r.label}</Typography>
            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,.45)' : '#9CA3AF' }}>{r.desc}</Typography>
          </Box>
          <Switch defaultChecked size="small" sx={{ mx: 'auto' }} />
          <Switch defaultChecked={i < 3} size="small" sx={{ mx: 'auto' }} />
        </Box>
      ))}
      <SaveButton label="Save Preferences" />
    </SectionCard>
  );
}

function ComplianceSection() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const items = [
    { label: 'GDPR Compliance',   status: 'Compliant',     color: '#10B981' },
    { label: 'SOC 2 Type II',     status: 'In Progress',   color: '#F59E0B' },
    { label: 'ISO 27001',         status: 'Compliant',     color: '#10B981' },
    { label: 'PCI DSS',           status: 'Not Applicable',color: '#6B7280' },
  ];
  return (
    <>
      <SectionCard title="Compliance Status" subtitle="Overview of your organisation's regulatory compliance.">
        <Stack spacing={1.5}>
          {items.map((item, i) => (
            <Box key={i} display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}
              sx={{ p: 1.5, bgcolor: isDark ? 'rgba(255,255,255,.04)' : '#F9FAFB', borderRadius: '8px', border: `1px solid ${isDark ? 'rgba(255,255,255,.08)' : '#E5E7EB'}` }}>
              <Typography fontWeight={600} fontSize=".88rem" color={isDark ? '#ffffff' : '#0A0F1F'}>{item.label}</Typography>
              <Chip label={item.status} size="small" sx={{ bgcolor: `${item.color}18`, color: item.color, fontWeight: 700, fontSize: '.72rem' }} />
            </Box>
          ))}
        </Stack>
      </SectionCard>
      <SectionCard title="Data Residency" subtitle="Choose where your data is stored.">
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Box>
            <Typography fontWeight={600} fontSize=".88rem" color={isDark ? '#ffffff' : '#0A0F1F'}>Primary Region</Typography>
            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,.45)' : '#9CA3AF' }}>Africa South (Johannesburg)</Typography>
          </Box>
          <Button size="small" variant="outlined" sx={{ textTransform: 'none', borderColor: '#18366A', color: '#18366A', borderRadius: '8px' }}>Change Region</Button>
        </Box>
      </SectionCard>
    </>
  );
}

function PreferencesSection() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <SectionCard title="Interface Preferences" subtitle="Customise your dashboard experience.">
      {[
        { label: 'Compact mode',         desc: 'Reduce spacing for denser layouts' },
        { label: 'Show resource IDs',    desc: 'Display internal UUIDs on resource cards' },
        { label: 'Auto-refresh data',    desc: 'Refresh dashboard metrics every 60 seconds' },
        { label: 'Developer mode',       desc: 'Show additional technical details and raw API output' },
      ].map((pref, i) => (
        <Box key={i} display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
          <Box>
            <Typography fontWeight={600} fontSize=".88rem" color={isDark ? '#ffffff' : '#0A0F1F'}>{pref.label}</Typography>
            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,.45)' : '#9CA3AF' }}>{pref.desc}</Typography>
          </Box>
          <Switch />
        </Box>
      ))}
      <Divider sx={{ borderColor: isDark ? 'rgba(255,255,255,.08)' : '#F3F4F6' }} />
      <Field label="Default Landing Page">
        <Box display="flex" gap={1} flexWrap="wrap">
          {['Dashboard', 'Servers', 'Kubernetes', 'Billing'].map(p => (
            <Chip key={p} label={p} size="small" clickable
              sx={{ bgcolor: p === 'Dashboard' ? '#18366A' : isDark ? 'rgba(255,255,255,.08)' : '#F3F4F6', color: p === 'Dashboard' ? '#fff' : isDark ? '#ffffff' : '#374151', fontWeight: 600 }} />
          ))}
        </Box>
      </Field>
      <SaveButton label="Save Preferences" />
    </SectionCard>
  );
}

// ── Section router ─────────────────────────────────────────────────────────────
function renderSection(section: string) {
  switch (section) {
    case 'profile':        return <ProfileSection />;
    case 'authentication': return <AuthenticationSection />;
    case 'ssh-keys':       return <SSHKeysSection />;
    case 'api':            return <APISection />;
    case 'users':          return <UsersSection />;
    case 'notifications':  return <NotificationsSection />;
    case 'compliance':     return <ComplianceSection />;
    case 'preferences':    return <PreferencesSection />;
    default:               return <ProfileSection />;
  }
}

function sectionLabel(key: string): string {
  return SECTIONS.flatMap(g => g.items).find(i => i.key === key)?.label ?? 'Profile';
}

// ── Main page ──────────────────────────────────────────────────────────────────
const AccountSettingsPage: React.FC = () => {
  const theme    = useTheme();
  const isDark   = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const { section = 'profile' } = useParams<{ section?: string }>();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: isDark ? '#0D1826' : '#ffffff', pb: 6 }}>
      {/* Header */}
      <Box sx={{ bgcolor: isDark ? '#0F1E30' : '#ffffff', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,.08)' : '#E5E7EB'}`, px: 4, py: 2.5 }}>
        <Typography fontWeight={800} fontSize="1.25rem" color={isDark ? '#ffffff' : '#0A0F1F'}>Account Settings</Typography>
        <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,.55)' : '#6B7280', mt: .25 }}>
          Manage your profile, security, and platform preferences
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 4 }, pt: 4, display: 'flex', gap: 3, alignItems: 'flex-start' }}>
        {/* Sidebar nav */}
        <Box sx={{ width: 220, flexShrink: 0, display: { xs: 'none', md: 'block' } }}>
          <Paper elevation={0} sx={{ bgcolor: isDark ? '#132336' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,.08)' : '#E5E7EB'}`, borderRadius: '12px', overflow: 'hidden', position: 'sticky', top: 24 }}>
            {SECTIONS.map((group, gi) => (
              <Box key={group.group}>
                {gi > 0 && <Divider sx={{ borderColor: isDark ? 'rgba(255,255,255,.06)' : '#F3F4F6' }} />}
                <Typography variant="caption" fontWeight={700} sx={{ px: 2, pt: 2, pb: .5, display: 'block', color: isDark ? 'rgba(255,255,255,.4)' : '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.07em' }}>
                  {group.group}
                </Typography>
                <List dense disablePadding sx={{ pb: 1 }}>
                  {group.items.map(item => {
                    const active = section === item.key;
                    return (
                      <ListItemButton
                        key={item.key}
                        selected={active}
                        onClick={() => navigate(`/dashboard/settings/${item.key}`)}
                        sx={{
                          mx: 1, borderRadius: '8px', mb: .25, minHeight: 36,
                          bgcolor: active ? (isDark ? 'rgba(24,54,106,.5)' : 'rgba(24,54,106,.08)') : 'transparent',
                          '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,.06)' : 'rgba(24,54,106,.05)' },
                          '&.Mui-selected': { bgcolor: isDark ? 'rgba(24,54,106,.5)' : 'rgba(24,54,106,.08)' },
                          '&.Mui-selected:hover': { bgcolor: isDark ? 'rgba(24,54,106,.65)' : 'rgba(24,54,106,.12)' },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 30, color: active ? '#18366A' : isDark ? 'rgba(255,255,255,.55)' : '#6B7280' }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{ fontSize: '.85rem', fontWeight: active ? 700 : 500, color: active ? (isDark ? '#ffffff' : '#18366A') : isDark ? '#ffffff' : '#374151' }}
                        />
                      </ListItemButton>
                    );
                  })}
                </List>
              </Box>
            ))}
          </Paper>
        </Box>

        {/* Content */}
        <Box flex={1} minWidth={0}>
          <Typography fontWeight={700} fontSize="1.1rem" color={isDark ? '#ffffff' : '#0A0F1F'} mb={2.5}>
            {sectionLabel(section)}
          </Typography>
          {renderSection(section)}
        </Box>
      </Box>
    </Box>
  );
};

export default AccountSettingsPage;
