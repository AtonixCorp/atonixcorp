// AtonixCorp Cloud Dashboard – Layout
// Enterprise-grade cloud dashboard layout following AtonixCorp design system.

import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  InputBase,
  Tooltip,
  Collapse,
  Stack,
  Chip,
} from '@mui/material';
import MenuIcon              from '@mui/icons-material/Menu';
import SearchIcon            from '@mui/icons-material/Search';
import NotificationsIcon     from '@mui/icons-material/Notifications';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import DashboardIcon         from '@mui/icons-material/Dashboard';
import ComputerIcon          from '@mui/icons-material/Computer';
import StorageIcon           from '@mui/icons-material/Storage';
import HubIcon               from '@mui/icons-material/Hub';
import ClusterIcon           from '@mui/icons-material/DeviceHub';
import FunctionsIcon         from '@mui/icons-material/Code';
import ContainerIcon         from '@mui/icons-material/ViewInAr';
import DatabaseIcon          from '@mui/icons-material/StorageRounded';
import BalancerIcon          from '@mui/icons-material/CompareArrows';
import CdnIcon               from '@mui/icons-material/PublicRounded';
import NetworkIcon           from '@mui/icons-material/RouterRounded';
import OrchestrateIcon       from '@mui/icons-material/AccountTree';
import SettingsIcon          from '@mui/icons-material/Settings';
import HelpIcon              from '@mui/icons-material/HelpOutline';
import PersonIcon            from '@mui/icons-material/Person';
import LogoutIcon            from '@mui/icons-material/Logout';
import BillingIcon           from '@mui/icons-material/ReceiptLong';
import TeamIcon              from '@mui/icons-material/Group';
import MonitorIcon           from '@mui/icons-material/QueryStats';
import { useAuth }           from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

// ── Constants ──────────────────────────────────────────────────────────────────

const SIDEBAR_WIDTH = 260;

// ── AtonixCorp unified design tokens ──────────────────────────────────────────
// Sidebar — Electric Blue family
const NAVY          = '#18366A';   // deep royal blue sidebar background
const NAVY2         = '#1C3E78';   // slightly lighter section areas
const NAVY3         = '#204585';   // org‑selector / hover depth
// Brand accent
const BLUE          = '#1A73FF';
const BLUE_DIM      = 'rgba(255,255,255,0.12)';  // active highlight on blue bg
const BLUE_HOVER    = 'rgba(255,255,255,0.07)';  // hover shimmer on blue bg
// Typography on blue sidebar
const TEXT_PRIMARY   = '#F0F4FF';
const TEXT_SECONDARY = '#93A8CC';
const DIVIDER_COLOR  = 'rgba(255,255,255,0.12)';
// Status
const SUCCESS = '#22C55E';
const WARNING = '#F59E0B';
const DANGER  = '#EF4444';

// ── Nav structure ──────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  badge?: string | number;
  badgeColor?: 'error' | 'warning' | 'success' | 'info';
  children?: NavItem[];
}

// ── Nav definition — exact order from spec ────────────────────────────────────
const I = (fontSize = '1.05rem') => ({ sx: { fontSize } });

const NAV: NavItem[] = [
  { label: 'Dashboard', icon: <DashboardIcon {...I()} />, path: '/dashboard' },
  {
    label: 'Products',
    icon: <ComputerIcon {...I()} />,
    children: [
      { label: 'Compute',           icon: <ComputerIcon  {...I('.95rem')} />, path: '/dashboard/compute'    },
      { label: 'Cloud Storage',     icon: <StorageIcon   {...I('.95rem')} />, path: '/dashboard/storage'    },
      { label: 'Kubernetes',        icon: <ClusterIcon   {...I('.95rem')} />, path: '/dashboard/kubernetes' },
      { label: 'Serverless',        icon: <FunctionsIcon {...I('.95rem')} />, path: '/dashboard/serverless', badge: 'New',  badgeColor: 'success' },
      { label: 'Container Registry',icon: <ContainerIcon {...I('.95rem')} />, path: '/dashboard/registry'   },
      { label: 'Databases',         icon: <DatabaseIcon  {...I('.95rem')} />, path: '/dashboard/databases'  },
      { label: 'Load Balancers',    icon: <BalancerIcon  {...I('.95rem')} />, path: '/dashboard/load-balancers' },
      { label: 'CDN',               icon: <CdnIcon       {...I('.95rem')} />, path: '/dashboard/cdn',  badge: 'Beta', badgeColor: 'warning' },
      { label: 'Network',           icon: <NetworkIcon   {...I('.95rem')} />, path: '/dashboard/network'    },
      { label: 'Orchestration',     icon: <OrchestrateIcon {...I('.95rem')} />, path: '/dashboard/orchestration' },
    ],
  },
  { label: 'Monitoring', icon: <MonitorIcon {...I()} />, path: '/dashboard/monitoring' },
];

const ACCOUNT_NAV: NavItem[] = [
  { label: 'Billing',   icon: <BillingIcon {...I()} />, path: '/dashboard/billing'  },
  { label: 'Team',      icon: <TeamIcon    {...I()} />, path: '/dashboard/team'     },
  { label: 'Settings',  icon: <SettingsIcon {...I()} />, path: '/dashboard/settings' },
];

const SUPPORT_NAV: NavItem[] = [
  { label: 'Support',          icon: <HelpIcon    {...I()} />, path: '/dashboard/help'     },
  { label: 'Referral Program', icon: <TeamIcon    {...I()} />, path: '/dashboard/referral', badge: '$25', badgeColor: 'success' },
];
// Suppress unused-var — tokens are exported for child components to import if needed
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _tokens = { NAVY2, SUCCESS, WARNING, DANGER, BLUE_HOVER };

// ── Helpers ────────────────────────────────────────────────────────────────────
const NavSectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography
    sx={{
      px: 2.5, mb: 0.5, mt: 0.25,
      fontSize: '.62rem', fontWeight: 700,
      letterSpacing: '.1em', textTransform: 'uppercase',
      color: TEXT_SECONDARY,
    }}
  >
    {children}
  </Typography>
);
// ── NavRow ─────────────────────────────────────────────────────────────────────

interface NavRowProps {
  item: NavItem;
  depth?: number;
  defaultOpen?: boolean;
}

const NavRow: React.FC<NavRowProps> = ({ item, depth = 0, defaultOpen = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(defaultOpen);

  const hasChildren = !!item.children?.length;
  const isActive =
    item.path
      ? location.pathname === item.path || location.pathname.startsWith(item.path + '/')
      : item.children?.some(
          c => c.path && (location.pathname === c.path || location.pathname.startsWith(c.path + '/'))
        );

  const handleClick = () => {
    if (hasChildren) {
      setOpen(p => !p);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <>
      <Box
        onClick={handleClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          px: depth === 0 ? 1.5 : 2.25,
          py: 0.75,
          mx: 1,
          mb: 0.25,
          borderRadius: '6px',
          cursor: 'pointer',
          userSelect: 'none',
          background: isActive && !hasChildren ? BLUE_DIM : 'transparent',
          borderLeft: isActive && !hasChildren ? `2px solid ${BLUE}` : '2px solid transparent',
          transition: 'background .12s',
          '&:hover': {
            background: isActive && !hasChildren ? BLUE_DIM : BLUE_HOVER,
          },
        }}
      >
        <Box
          sx={{
            color: isActive ? '#fff' : TEXT_SECONDARY,
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          {item.icon}
        </Box>

        <Typography
          sx={{
            flex: 1,
            fontSize: depth === 0 ? '.875rem' : '.8rem',
            fontWeight: isActive ? 600 : 400,
            color: isActive ? '#fff' : TEXT_PRIMARY,
            letterSpacing: '.01em',
            lineHeight: 1,
          }}
        >
          {item.label}
        </Typography>

        {item.badge && (
          <Chip
            label={item.badge}
            size="small"
            sx={{
              height: 16,
              fontSize: '.6rem',
              fontWeight: 700,
              px: 0.25,
              bgcolor:
                item.badgeColor === 'success' ? 'rgba(34,197,94,.2)'
                : item.badgeColor === 'warning' ? 'rgba(245,158,11,.2)'
                : item.badgeColor === 'error'   ? 'rgba(239,68,68,.2)'
                : BLUE_DIM,
              color:
                item.badgeColor === 'success' ? '#22C55E'
                : item.badgeColor === 'warning' ? '#F59E0B'
                : item.badgeColor === 'error'   ? '#EF4444'
                : BLUE,
            }}
          />
        )}

        {hasChildren && (
          <Box sx={{ color: TEXT_SECONDARY, display: 'flex', alignItems: 'center' }}>
            {open
              ? <KeyboardArrowDownIcon  sx={{ fontSize: '.85rem' }} />
              : <KeyboardArrowRightIcon sx={{ fontSize: '.85rem' }} />}
          </Box>
        )}
      </Box>

      {hasChildren && (
        <Collapse in={open} timeout={0} unmountOnExit>
          <Box sx={{ ml: 1.5, borderLeft: `1px solid ${DIVIDER_COLOR}`, mb: 0.5 }}>
            {item.children!.map(child => (
              <NavRow key={child.label} item={child} depth={depth + 1} />
            ))}
          </Box>
        </Collapse>
      )}
    </>
  );
};

// ── Sidebar ────────────────────────────────────────────────────────────────────

const SidebarContent: React.FC = () => {
  const { user } = useAuth() as any;
  const navigate  = useNavigate();

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: NAVY,
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <Box
        onClick={() => navigate('/dashboard')}
        sx={{
          px: 2.5,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          cursor: 'pointer',
          borderBottom: `1px solid ${DIVIDER_COLOR}`,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            width: 32, height: 32, borderRadius: '8px',
            background: 'linear-gradient(135deg, #1A73FF 0%, #0ea5e9 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, color: '#fff', fontSize: '.85rem',
            letterSpacing: '-.02em', flexShrink: 0,
          }}
        >
          Ax
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '.95rem', color: '#fff', lineHeight: 1.1 }}>
            AtonixCorp
          </Typography>
          <Typography sx={{ fontSize: '.65rem', color: TEXT_SECONDARY, lineHeight: 1 }}>
            Cloud Platform
          </Typography>
        </Box>
      </Box>

      {/* Org selector */}
      <Box sx={{ px: 2, py: 1.25, borderBottom: `1px solid ${DIVIDER_COLOR}`, flexShrink: 0 }}>
        <Box
          sx={{
            display: 'flex', alignItems: 'center', gap: 1,
            px: 1.5, py: 0.75, borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer', bgcolor: NAVY3,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
            transition: 'background .15s',
          }}
        >
          <Box
            sx={{
              width: 22, height: 22, borderRadius: '4px',
              bgcolor: BLUE, display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
            }}
          >
            <Typography sx={{ fontSize: '.6rem', fontWeight: 800, color: '#fff' }}>
              {(user?.username || 'U')[0].toUpperCase()}
            </Typography>
          </Box>
          <Typography sx={{ flex: 1, fontSize: '.8rem', fontWeight: 500, color: TEXT_PRIMARY }} noWrap>
            {user?.username || 'My Organization'}
          </Typography>
          <KeyboardArrowDownIcon sx={{ fontSize: '.85rem', color: TEXT_SECONDARY, flexShrink: 0 }} />
        </Box>
      </Box>

      {/* Navigation */}
      <Box
        sx={{
          flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 1,
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,.1)', borderRadius: 2 },
        }}
      >
        <List disablePadding>
          {NAV.map(item => (
            <NavRow
              key={item.label}
              item={item}
              defaultOpen={item.label === 'Products' || item.label === 'Network'}
            />
          ))}
        </List>

        <Divider sx={{ borderColor: DIVIDER_COLOR, my: 1, mx: 2 }} />

        <NavSectionLabel>Account</NavSectionLabel>
        <List disablePadding>
          {ACCOUNT_NAV.map(item => (
            <NavRow key={item.label} item={item} />
          ))}
        </List>

        <Divider sx={{ borderColor: DIVIDER_COLOR, my: 1, mx: 2 }} />

        <NavSectionLabel>Support</NavSectionLabel>
        <List disablePadding>
          {SUPPORT_NAV.map(item => (
            <NavRow key={item.label} item={item} />
          ))}
        </List>
      </Box>

      {/* User strip */}
      <Box
        sx={{
          px: 2, py: 1.5,
          borderTop: `1px solid ${DIVIDER_COLOR}`,
          flexShrink: 0,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.25}>
          <Avatar sx={{ width: 30, height: 30, bgcolor: BLUE, fontSize: '.8rem', fontWeight: 700 }}>
            {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: '.8rem', fontWeight: 600, color: '#fff' }} noWrap>
              {user?.first_name
                ? `${user.first_name} ${user.last_name || ''}`.trim()
                : user?.username}
            </Typography>
            <Typography sx={{ fontSize: '.68rem', color: TEXT_SECONDARY }} noWrap>
              {user?.email || ''}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

// ── Main layout ────────────────────────────────────────────────────────────────

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout }  = useAuth() as any;
  const navigate           = useNavigate();
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  const [notifAnchor,   setNotifAnchor]   = useState<null | HTMLElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F9FAFB' }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <Box component="nav" sx={{ width: { lg: SIDEBAR_WIDTH }, flexShrink: { lg: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, border: 'none', bgcolor: NAVY },
          }}
        >
          <SidebarContent />
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': {
              width: SIDEBAR_WIDTH, border: 'none',
              borderRight: '1px solid rgba(0,0,0,.08)', bgcolor: NAVY,
            },
          }}
          open
        >
          <SidebarContent />
        </Drawer>
      </Box>

      {/* ── Right column ─────────────────────────────────────────────────────── */}
      <Box
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${SIDEBAR_WIDTH}px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >

        {/* ── Top AppBar ─────────────────────────────────────────────────────── */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: '#fff',
            borderBottom: '1px solid #E5E7EB',
            color: '#111827',
            zIndex: (theme) => theme.zIndex.drawer - 1,
          }}
        >
          <Toolbar sx={{ gap: 1.5, px: { xs: 2, md: 3 }, minHeight: '64px !important' }}>

            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{ display: { lg: 'none' }, color: '#6B7280' }}
            >
              <MenuIcon />
            </IconButton>

            {/* Global search */}
            <Box
              sx={{
                display: 'flex', alignItems: 'center',
                flex: 1, maxWidth: 420,
                bgcolor: '#F3F4F6', borderRadius: '6px',
                px: 1.5, py: 0.5, gap: 1,
                border: '1px solid transparent',
                transition: 'border .15s',
                '&:focus-within': { border: `1px solid ${BLUE}`, bgcolor: '#fff' },
              }}
            >
              <SearchIcon sx={{ color: '#9CA3AF', fontSize: '1rem', flexShrink: 0 }} />
              <InputBase
                placeholder="Search resources…"
                sx={{
                  flex: 1, fontSize: '.875rem', color: '#111827',
                  '& input::placeholder': { color: '#9CA3AF' },
                }}
              />
              <Typography
                sx={{
                  fontSize: '.7rem', color: '#9CA3AF',
                  bgcolor: '#E5E7EB', px: 0.75, py: 0.25,
                  borderRadius: '4px', flexShrink: 0,
                  display: { xs: 'none', md: 'block' },
                }}
              >
                ⌘K
              </Typography>
            </Box>

            <Box sx={{ flex: 1 }} />

            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton
                onClick={(e) => setNotifAnchor(e.currentTarget)}
                sx={{ color: '#6B7280', '&:hover': { color: '#111827' } }}
              >
                <Badge
                  badgeContent={3}
                  color="error"
                  sx={{ '& .MuiBadge-badge': { fontSize: '.6rem', minWidth: 16, height: 16 } }}
                >
                  <NotificationsIcon sx={{ fontSize: '1.2rem' }} />
                </Badge>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={notifAnchor}
              open={Boolean(notifAnchor)}
              onClose={() => setNotifAnchor(null)}
              PaperProps={{
                sx: { width: 320, mt: 1, borderRadius: '10px', boxShadow: '0 10px 30px rgba(0,0,0,.12)', border: '1px solid #E5E7EB' },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #F3F4F6' }}>
                <Typography fontWeight={700} fontSize=".9rem">Notifications</Typography>
              </Box>
              {[
                { title: 'VM atonix-prod-01 is running', time: '2 min ago',  dot: '#22C55E' },
                { title: 'Snapshot backup completed',    time: '1 hr ago',   dot: '#1A73FF' },
                { title: 'Billing invoice available',   time: '2 days ago',  dot: '#F59E0B' },
              ].map((n, i) => (
                <MenuItem key={i} sx={{ py: 1.25, gap: 1.5, alignItems: 'flex-start' }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: n.dot, mt: 0.75, flexShrink: 0 }} />
                  <Box>
                    <Typography fontSize=".82rem" fontWeight={500}>{n.title}</Typography>
                    <Typography fontSize=".72rem" color="text.secondary">{n.time}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Menu>

            {/* User profile */}
            <Box
              onClick={(e) => setProfileAnchor(e.currentTarget)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1,
                px: 1, py: 0.5, borderRadius: '8px',
                cursor: 'pointer', border: '1px solid #E5E7EB',
                transition: 'border .15s',
                '&:hover': { borderColor: BLUE },
              }}
            >
              <Avatar
                sx={{ width: 28, height: 28, bgcolor: BLUE, fontSize: '.75rem', fontWeight: 700 }}
              >
                {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
              </Avatar>
              <Typography
                sx={{
                  fontSize: '.82rem', fontWeight: 600, color: '#111827',
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                {user?.first_name || user?.username}
              </Typography>
              <KeyboardArrowDownIcon
                sx={{ fontSize: '.85rem', color: '#6B7280', display: { xs: 'none', sm: 'block' } }}
              />
            </Box>
            <Menu
              anchorEl={profileAnchor}
              open={Boolean(profileAnchor)}
              onClose={() => setProfileAnchor(null)}
              PaperProps={{
                sx: { minWidth: 220, mt: 1, borderRadius: '10px', boxShadow: '0 10px 30px rgba(0,0,0,.12)', border: '1px solid #E5E7EB' },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #F3F4F6' }}>
                <Typography fontWeight={700} fontSize=".875rem">
                  {user?.first_name
                    ? `${user.first_name} ${user.last_name || ''}`.trim()
                    : user?.username}
                </Typography>
                <Typography fontSize=".75rem" color="text.secondary">{user?.email}</Typography>
              </Box>
              <MenuItem
                onClick={() => { setProfileAnchor(null); navigate('/dashboard/settings'); }}
                sx={{ gap: 1.5, fontSize: '.85rem', py: 1 }}
              >
                <PersonIcon sx={{ fontSize: '1rem', color: '#6B7280' }} /> Account Settings
              </MenuItem>
              <MenuItem
                onClick={() => { setProfileAnchor(null); navigate('/dashboard/billing'); }}
                sx={{ gap: 1.5, fontSize: '.85rem', py: 1 }}
              >
                <BillingIcon sx={{ fontSize: '1rem', color: '#6B7280' }} /> Billing
              </MenuItem>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem
                onClick={handleLogout}
                sx={{ gap: 1.5, fontSize: '.85rem', py: 1, color: '#EF4444' }}
              >
                <LogoutIcon sx={{ fontSize: '1rem', color: '#EF4444' }} /> Sign Out
              </MenuItem>
            </Menu>

          </Toolbar>
        </AppBar>

        {/* ── Page content ──────────────────────────────────────────────────── */}
        <Box component="main" sx={{ flexGrow: 1, overflow: 'auto', bgcolor: '#F9FAFB' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
