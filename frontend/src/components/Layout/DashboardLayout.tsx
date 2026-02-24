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
import LockIcon              from '@mui/icons-material/Lock';
import KeyIcon               from '@mui/icons-material/Key';
import TuneIcon              from '@mui/icons-material/Tune';
import GppGoodIcon           from '@mui/icons-material/GppGood';
import ApiIcon               from '@mui/icons-material/Api';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import TeamIcon              from '@mui/icons-material/Group';
import MonitorIcon           from '@mui/icons-material/QueryStats';
import DomainIcon            from '@mui/icons-material/Language';
import CampaignIcon          from '@mui/icons-material/Campaign';
import ViewListIcon          from '@mui/icons-material/ViewList';
import LightModeIcon         from '@mui/icons-material/LightMode';
import DarkModeIcon          from '@mui/icons-material/DarkMode';
import FirstPageIcon         from '@mui/icons-material/FirstPage';
import LastPageIcon          from '@mui/icons-material/LastPage';
import { useAuth }           from '../../contexts/AuthContext';
import { useTheme as useColorMode } from '../../contexts/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';

// ── Constants ──────────────────────────────────────────────────────────────────

const SIDEBAR_WIDTH = 260;
const SIDEBAR_COLLAPSED_WIDTH = 76;
const FONT = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

// ── AtonixCorp unified design tokens ──────────────────────────────────────────
// Sidebar — Homepage brand family
const NAVY          = '#0b1220';
const NAVY2         = '#07121a';
const NAVY3         = '#132336';
// Brand accent
const BLUE          = '#14b8a6';
const BLUE_DIM      = 'rgba(20,184,166,0.20)';
const BLUE_HOVER    = 'rgba(20,184,166,0.12)';
// Typography on blue sidebar
const TEXT_PRIMARY   = '#F0F4FF';
const TEXT_SECONDARY = '#9FB3C8';
const DIVIDER_COLOR  = 'rgba(20,184,166,0.22)';
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

type DashboardMode = 'cloud' | 'developer' | 'marketing';

// ── Nav definition — exact order from spec ────────────────────────────────────
const I = (fontSize = '1.05rem') => ({ sx: { fontSize } });

const CLOUD_NAV: NavItem[] = [
  { label: 'Dashboard', icon: <DashboardIcon {...I()} />, path: '/dashboard' },
  {
    label: 'Products',
    icon: <ComputerIcon {...I()} />,
    children: [
      { label: 'Compute',           icon: <ComputerIcon  {...I('.95rem')} />, path: '/dashboard/compute'    },
      { label: 'Cloud Storage',     icon: <StorageIcon   {...I('.95rem')} />, path: '/dashboard/storage'    },
      { label: 'Kubernetes',        icon: <ClusterIcon   {...I('.95rem')} />, path: '/dashboard/kubernetes' },
      { label: 'Serverless',        icon: <FunctionsIcon {...I('.95rem')} />, path: '/dashboard/serverless', badge: 'New',  badgeColor: 'success' },
      { label: 'Container Registry',icon: <ContainerIcon {...I('.95rem')} />, path: '/dashboard/containers' },
      { label: 'Databases',         icon: <DatabaseIcon  {...I('.95rem')} />, path: '/dashboard/databases'  },
      { label: 'Load Balancers',    icon: <BalancerIcon  {...I('.95rem')} />, path: '/dashboard/load-balancers' },
      { label: 'CDN',               icon: <CdnIcon       {...I('.95rem')} />, path: '/dashboard/cdn',  badge: 'Beta', badgeColor: 'warning' },
      { label: 'Network',           icon: <NetworkIcon   {...I('.95rem')} />, path: '/dashboard/network'    },
      { label: 'Orchestration',     icon: <OrchestrateIcon {...I('.95rem')} />, path: '/dashboard/orchestration' },
    ],
  },
  { label: 'Monitoring',     icon: <MonitorIcon  {...I()} />, path: '/dashboard/monitoring' },
  { label: 'Sections',       icon: <ViewListIcon {...I()} />, path: '/dashboard/sections' },
  { label: 'Domains',        icon: <DomainIcon   {...I()} />, path: '/dashboard/domains' },
  { label: 'Developer Tools', icon: <ComputerIcon {...I()} />, path: '/dev-dashboard/deployments' },
  { label: 'Marketing Tools', icon: <CampaignIcon {...I()} />, path: '/marketing-dashboard/analytics' },
];

const DEVELOPER_NAV: NavItem[] = [
  { label: 'Deployments', icon: <ComputerIcon {...I()} />, path: '/dev-dashboard/deployments' },
  { label: 'CI/CD Pipelines', icon: <OrchestrateIcon {...I()} />, path: '/dev-dashboard/cicd' },
  { label: 'Containers & Kubernetes', icon: <ClusterIcon {...I()} />, path: '/dev-dashboard/containers-k8s' },
  { label: 'Monitoring', icon: <MonitorIcon {...I()} />, path: '/dev-dashboard/monitoring' },
  { label: 'API Management', icon: <ApiIcon {...I()} />, path: '/dev-dashboard/api-management' },
  { label: 'Sections', icon: <ViewListIcon {...I()} />, path: '/dev-dashboard/sections' },
  { label: 'Resource Control', icon: <NetworkIcon {...I()} />, path: '/dev-dashboard/resource-control' },
  { label: 'My Workspace', icon: <PersonIcon {...I()} />, path: '/dev-dashboard/workspace' },
];

const MARKETING_NAV: NavItem[] = [
  { label: 'Marketing Overview', icon: <MonitorIcon {...I()} />, path: '/marketing-dashboard/analytics' },
  { label: 'Campaigns', icon: <CampaignIcon {...I()} />, path: '/marketing-dashboard/campaigns' },
  { label: 'Sections', icon: <ViewListIcon {...I()} />, path: '/marketing-dashboard/sections' },
  { label: 'SEO & Domains', icon: <DomainIcon {...I()} />, path: '/marketing-dashboard/seo-domains' },
  { label: 'Audience Segmentation', icon: <TeamIcon {...I()} />, path: '/marketing-dashboard/audience-segmentation' },
  { label: 'Content Distribution', icon: <CdnIcon {...I()} />, path: '/marketing-dashboard/content-distribution' },
  { label: 'A/B Testing', icon: <TuneIcon {...I()} />, path: '/marketing-dashboard/ab-testing' },
];

const ACCOUNT_NAV: NavItem[] = [
  { label: 'Billing',   icon: <BillingIcon {...I()} />, path: '/dashboard/billing'  },
  { label: 'Team',      icon: <TeamIcon    {...I()} />, path: '/dashboard/team'     },
  { label: 'Settings',  icon: <SettingsIcon {...I()} />, path: '/dashboard/settings' },
];

const DEVELOPER_ACCOUNT_NAV: NavItem[] = [
  { label: 'Developer Billing',  icon: <BillingIcon {...I()} />, path: '/dev-dashboard/billing' },
  { label: 'Developer Team',     icon: <TeamIcon {...I()} />, path: '/dev-dashboard/team' },
  { label: 'Developer Settings', icon: <SettingsIcon {...I()} />, path: '/dev-dashboard/settings' },
];

const MARKETING_ACCOUNT_NAV: NavItem[] = [
  { label: 'Marketing Billing',  icon: <BillingIcon {...I()} />, path: '/marketing-dashboard/billing' },
  { label: 'Marketing Team',     icon: <TeamIcon {...I()} />, path: '/marketing-dashboard/team' },
  { label: 'Marketing Settings', icon: <SettingsIcon {...I()} />, path: '/marketing-dashboard/settings' },
];

const SUPPORT_NAV: NavItem[] = [
  { label: 'Support',          icon: <HelpIcon    {...I()} />, path: '/dashboard/help'     },
  { label: 'Referral Program', icon: <TeamIcon    {...I()} />, path: '/dashboard/referral', badge: '$25', badgeColor: 'success' },
];

const DEVELOPER_SUPPORT_NAV: NavItem[] = [
  { label: 'Developer Support', icon: <HelpIcon {...I()} />, path: '/dev-dashboard/help' },
  { label: 'Developer Referral', icon: <TeamIcon {...I()} />, path: '/dev-dashboard/referral', badge: '$25', badgeColor: 'success' },
];

const MARKETING_SUPPORT_NAV: NavItem[] = [
  { label: 'Marketing Support', icon: <HelpIcon {...I()} />, path: '/marketing-dashboard/help' },
  { label: 'Marketing Referral', icon: <TeamIcon {...I()} />, path: '/marketing-dashboard/referral', badge: '$25', badgeColor: 'success' },
];
// Suppress unused-var — tokens are exported for child components to import if needed
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _tokens = { NAVY2, SUCCESS, WARNING, DANGER, BLUE_HOVER };

// ── Helpers ────────────────────────────────────────────────────────────────────
const NavSectionLabel: React.FC<{ children: React.ReactNode; collapsed?: boolean }> = ({ children, collapsed = false }) => (
  collapsed ? null : (
  <Typography
    sx={{
      px: 2.5, mb: 0.5, mt: 0.25,
      fontSize: '.62rem', fontWeight: 700,
      letterSpacing: '.1em', textTransform: 'uppercase',
      color: TEXT_SECONDARY,
      fontFamily: FONT,
    }}
  >
    {children}
  </Typography>
  )
);
// ── NavRow ─────────────────────────────────────────────────────────────────────

interface NavRowProps {
  item: NavItem;
  depth?: number;
  defaultOpen?: boolean;
  collapsed?: boolean;
}

const NavRow: React.FC<NavRowProps> = ({ item, depth = 0, defaultOpen = false, collapsed = false }) => {
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
    if (collapsed && hasChildren) {
      const firstPath = item.children?.[0]?.path;
      if (firstPath) navigate(firstPath);
      return;
    }
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
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: collapsed ? 0 : 1.25,
          px: collapsed ? 0.75 : (depth === 0 ? 1.5 : 2.25),
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

        {!collapsed && (
          <Typography
            sx={{
              flex: 1,
              fontSize: depth === 0 ? '.875rem' : '.82rem',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? '#fff' : TEXT_PRIMARY,
              letterSpacing: depth === 0 ? '-.01em' : '-.005em',
              lineHeight: 1.2,
              fontFamily: FONT,
            }}
          >
            {item.label}
          </Typography>
        )}

        {!collapsed && item.badge && (
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

        {!collapsed && hasChildren && (
          <Box sx={{ color: TEXT_SECONDARY, display: 'flex', alignItems: 'center' }}>
            {open
              ? <KeyboardArrowDownIcon  sx={{ fontSize: '.85rem' }} />
              : <KeyboardArrowRightIcon sx={{ fontSize: '.85rem' }} />}
          </Box>
        )}
      </Box>

      {hasChildren && !collapsed && (
        <Collapse in={open} timeout={0} unmountOnExit>
          <Box sx={{ ml: 1.5, borderLeft: `1px solid ${DIVIDER_COLOR}`, mb: 0.5 }}>
            {item.children!.map(child => (
              <NavRow key={child.label} item={child} depth={depth + 1} collapsed={collapsed} />
            ))}
          </Box>
        </Collapse>
      )}
    </>
  );
};

// ── Sidebar ────────────────────────────────────────────────────────────────────

const SidebarContent: React.FC<{ collapsed?: boolean; dashboardMode: DashboardMode }> = ({
  collapsed = false,
  dashboardMode,
}) => {
  const { user } = useAuth() as any;
  const navigate  = useNavigate();
  const { mode }  = useColorMode();
  const isDark    = mode === 'dark';
  const routeBase = dashboardMode === 'developer'
    ? '/dev-dashboard'
    : dashboardMode === 'marketing'
      ? '/marketing-dashboard'
      : '/dashboard';

  const navItems = dashboardMode === 'developer'
    ? DEVELOPER_NAV
    : dashboardMode === 'marketing'
      ? MARKETING_NAV
      : CLOUD_NAV;

  const accountNav = dashboardMode === 'developer'
    ? DEVELOPER_ACCOUNT_NAV
    : dashboardMode === 'marketing'
      ? MARKETING_ACCOUNT_NAV
      : ACCOUNT_NAV;

  const supportNav = dashboardMode === 'developer'
    ? DEVELOPER_SUPPORT_NAV
    : dashboardMode === 'marketing'
      ? MARKETING_SUPPORT_NAV
      : SUPPORT_NAV;

  // Sidebar surface colours switch with the theme
  const SB_BG     = isDark ? NAVY2 : NAVY;
  const SB_ORG    = isDark ? NAVY3 : NAVY3;
  const SB_DIV    = isDark ? 'rgba(255,255,255,0.08)' : DIVIDER_COLOR;

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: SB_BG,
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <Box
        onClick={() => navigate(routeBase)}
        sx={{
          px: collapsed ? 1 : 2.5,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: collapsed ? 0 : 1.5,
          cursor: 'pointer',
          borderBottom: `1px solid ${SB_DIV}`,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            width: 32, height: 32, borderRadius: '8px',
            background: 'linear-gradient(135deg, #14b8a6 0%, #0ea5a4 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, color: '#fff', fontSize: '.85rem',
            letterSpacing: '-.02em', flexShrink: 0,
          }}
        >
          A
        </Box>
        {!collapsed && (
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#fff', lineHeight: 1.15, letterSpacing: '-.02em', fontFamily: FONT }}>
              AtonixCorp
            </Typography>
            <Typography sx={{ fontSize: '.67rem', color: TEXT_SECONDARY, lineHeight: 1, fontFamily: FONT, letterSpacing: '.02em' }}>
              {dashboardMode === 'developer'
                ? 'Developer Dashboard'
                : dashboardMode === 'marketing'
                  ? 'Marketing Dashboard'
                  : 'Cloud Platform'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Org selector */}
      <Box sx={{ px: collapsed ? 1 : 2, py: 1.25, borderBottom: `1px solid ${SB_DIV}`, flexShrink: 0 }}>
        <Box
          sx={{
            display: 'flex', alignItems: 'center', gap: 1,
            px: collapsed ? 0 : 1.5, py: 0.75, borderRadius: '6px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            border: '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer', bgcolor: SB_ORG,
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
          {!collapsed && (
            <>
              <Typography sx={{ flex: 1, fontSize: '.82rem', fontWeight: 500, color: TEXT_PRIMARY, fontFamily: FONT, letterSpacing: '-.01em' }} noWrap>
                {user?.username || 'My Organization'}
              </Typography>
              <KeyboardArrowDownIcon sx={{ fontSize: '.85rem', color: TEXT_SECONDARY, flexShrink: 0 }} />
            </>
          )}
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
          {navItems.map(item => (
            <NavRow
              key={item.label}
              item={item}
              defaultOpen={item.label === 'Products'}
              collapsed={collapsed}
            />
          ))}
        </List>

        {!collapsed && <Divider sx={{ borderColor: SB_DIV, my: 1, mx: 2 }} />}

        <NavSectionLabel collapsed={collapsed}>Account</NavSectionLabel>
        <List disablePadding>
          {accountNav.map(item => (
            <NavRow key={item.label} item={item} collapsed={collapsed} />
          ))}
        </List>

        {!collapsed && <Divider sx={{ borderColor: SB_DIV, my: 1, mx: 2 }} />}

        <NavSectionLabel collapsed={collapsed}>Support</NavSectionLabel>
        <List disablePadding>
          {supportNav.map(item => (
            <NavRow key={item.label} item={item} collapsed={collapsed} />
          ))}
        </List>
      </Box>

      {/* User strip */}
      <Box
        sx={{
          px: 2, py: 1.5,
          borderTop: `1px solid ${SB_DIV}`,
          flexShrink: 0,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.25}>
          <Avatar sx={{ width: 30, height: 30, bgcolor: BLUE, fontSize: '.8rem', fontWeight: 700 }}>
            {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
          </Avatar>
          {!collapsed && (
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: '.82rem', fontWeight: 700, color: '#fff', fontFamily: FONT, letterSpacing: '-.01em' }} noWrap>
                {user?.first_name
                  ? `${user.first_name} ${user.last_name || ''}`.trim()
                  : user?.username}
              </Typography>
              <Typography sx={{ fontSize: '.7rem', color: TEXT_SECONDARY, fontFamily: FONT, letterSpacing: '.005em' }} noWrap>
                {user?.email || ''}
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

// ── Main layout ────────────────────────────────────────────────────────────────

interface DashboardLayoutProps {
  children: React.ReactNode;
  dashboardMode?: DashboardMode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, dashboardMode = 'cloud' }) => {
  const { user, logout }  = useAuth() as any;
  const navigate           = useNavigate();
  const { mode, toggleTheme } = useColorMode();
  const isDark             = mode === 'dark';
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  const [notifAnchor,   setNotifAnchor]   = useState<null | HTMLElement>(null);
  const routeBase = dashboardMode === 'developer'
    ? '/dev-dashboard'
    : dashboardMode === 'marketing'
      ? '/marketing-dashboard'
      : '/dashboard';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: isDark ? NAVY2 : '#ffffff' }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <Box component="nav" sx={{ width: { lg: sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH }, flexShrink: { lg: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, border: 'none', bgcolor: isDark ? NAVY2 : NAVY },
          }}
        >
          <SidebarContent dashboardMode={dashboardMode} />
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': {
              width: sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH, border: 'none',
              borderRight: `1px solid ${isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.08)'}`,
              bgcolor: isDark ? NAVY2 : NAVY,
              transition: 'width .2s ease',
            },
          }}
          open
        >
          <SidebarContent collapsed={sidebarCollapsed} dashboardMode={dashboardMode} />
        </Drawer>
      </Box>

      {/* ── Right column ─────────────────────────────────────────────────────── */}
      <Box
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH}px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width .2s ease',
        }}
      >

        {/* ── Top AppBar ─────────────────────────────────────────────────────── */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #0b1220 0%, #07121a 100%)',
            borderBottom: `1px solid ${BLUE}33`,
            color: '#ffffff',
            zIndex: (theme) => theme.zIndex.drawer - 1,
          }}
        >
          <Toolbar sx={{ gap: { xs: 1, md: 1.5 }, px: { xs: 1.25, md: 3 }, minHeight: '64px !important' }}>

            <IconButton
                onClick={() => setMobileOpen(true)}
                sx={{ display: { lg: 'none' }, color: '#e6eef7' }}
              >
              <MenuIcon />
            </IconButton>

            <Tooltip title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
              <IconButton
                onClick={() => setSidebarCollapsed(prev => !prev)}
                sx={{ display: { xs: 'none', lg: 'inline-flex' }, color: '#e6eef7' }}
              >
                {sidebarCollapsed ? <LastPageIcon /> : <FirstPageIcon />}
              </IconButton>
            </Tooltip>

            {/* Global search */}
            <Box
              sx={{
                display: { xs: 'none', sm: 'flex' }, alignItems: 'center',
                flex: 1, maxWidth: 420,
                minWidth: 0,
                width: { xs: '100%', sm: 'auto' },
                bgcolor: 'rgba(255,255,255,.08)',
                borderRadius: '6px',
                px: 1.5, py: 0.5, gap: 1,
                border: '1px solid rgba(255,255,255,.14)',
                transition: 'border .15s',
                '&:focus-within': { border: `1px solid ${BLUE}`, bgcolor: 'rgba(255,255,255,.12)' },
              }}
            >
              <SearchIcon sx={{ color: '#9CA3AF', fontSize: '1rem', flexShrink: 0 }} />
              <InputBase
                placeholder="Search resources…"
                sx={{
                  flex: 1, fontSize: '.875rem', color: '#ffffff',
                  '& input::placeholder': { color: '#c5d4e6' },
                }}
              />
              <Typography
                sx={{
                  fontSize: '.7rem', color: '#d7e4f2',
                  bgcolor: 'rgba(255,255,255,.12)', px: 0.75, py: 0.25,
                  borderRadius: '4px', flexShrink: 0,
                  display: { xs: 'none', md: 'block' },
                }}
              >
                Ctrl K
              </Typography>
            </Box>

            <Box sx={{ flex: 1 }} />

            {/* Dark / Light mode toggle */}
            <Tooltip title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <IconButton
                onClick={toggleTheme}
                sx={{
                  color: '#e6eef7',
                  bgcolor: 'rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                  '&:hover': {
                    bgcolor: 'rgba(20,184,166,0.18)',
                    color: '#14b8a6',
                  },
                  transition: 'all .15s',
                }}
              >
                {isDark
                  ? <LightModeIcon sx={{ fontSize: '1.15rem' }} />
                  : <DarkModeIcon  sx={{ fontSize: '1.15rem' }} />}
              </IconButton>
            </Tooltip>

            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton
                onClick={(e) => setNotifAnchor(e.currentTarget)}
                sx={{ color: '#e6eef7', '&:hover': { color: '#14b8a6' } }}
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
                sx: { width: 'min(320px, calc(100vw - 24px))', mt: 1, borderRadius: '10px', boxShadow: '0 10px 30px rgba(0,0,0,.25)', border: `1px solid ${isDark ? 'rgba(255,255,255,.1)' : '#E5E7EB'}`, bgcolor: isDark ? '#132336' : '#ffffff' },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,.08)' : '#F3F4F6'}` }}>
                <Typography fontWeight={700} fontSize=".9rem">Notifications</Typography>
              </Box>
              {[
                { title: 'VM atonix-prod-01 is running', time: '2 min ago',  dot: '#22C55E' },
                { title: 'Snapshot backup completed',    time: '1 hr ago',   dot: '#14b8a6' },
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
                cursor: 'pointer', border: `1px solid ${isDark ? 'rgba(255,255,255,.12)' : '#E5E7EB'}`,
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
                  fontSize: '.82rem', fontWeight: 600, color: isDark ? '#ffffff' : '#111827',
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                {user?.first_name || user?.username}
              </Typography>
              <KeyboardArrowDownIcon
                sx={{ fontSize: '.85rem', color: isDark ? '#ffffff' : '#6B7280', display: { xs: 'none', sm: 'block' } }}
              />
            </Box>
            <Menu
              anchorEl={profileAnchor}
              open={Boolean(profileAnchor)}
              onClose={() => setProfileAnchor(null)}
              PaperProps={{
                sx: { minWidth: 'min(240px, calc(100vw - 24px))', mt: 1, borderRadius: '10px', boxShadow: '0 10px 30px rgba(0,0,0,.25)', border: `1px solid ${isDark ? 'rgba(255,255,255,.1)' : '#E5E7EB'}`, bgcolor: isDark ? '#132336' : '#ffffff' },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              {/* User info header */}
              <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,.1)' : '#F3F4F6'}` }}>
                <Typography fontWeight={700} fontSize=".875rem" color={isDark ? '#ffffff' : '#0A0F1F'}>
                  {user?.first_name
                    ? `${user.first_name} ${user.last_name || ''}`.trim()
                    : user?.username}
                </Typography>
                <Typography fontSize=".75rem" color="text.secondary">{user?.email}</Typography>
              </Box>

              {/* Account group */}
              <Box sx={{ px: 1.5, pt: 1, pb: .25 }}>
                <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,.35)' : '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', fontSize: '.65rem' }}>Account</Typography>
              </Box>
              {[
                { label: 'Profile',       icon: <PersonIcon />,            path: `${routeBase}/settings/profile` },
                { label: 'Preferences',   icon: <TuneIcon />,              path: `${routeBase}/settings/preferences` },
                { label: 'Notifications', icon: <NotificationsNoneIcon />, path: `${routeBase}/settings/notifications` },
              ].map(item => (
                <MenuItem key={item.label} onClick={() => { setProfileAnchor(null); navigate(item.path); }}
                  sx={{ gap: 1.5, fontSize: '.85rem', py: .75, mx: .5, borderRadius: '6px',
                    '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,.06)' : 'rgba(20,184,166,.10)' } }}>
                  {React.cloneElement(item.icon, { sx: { fontSize: '1rem', color: isDark ? '#ffffff' : '#6B7280' } })}
                  <Typography fontSize=".85rem" color={isDark ? '#ffffff' : '#374151'}>{item.label}</Typography>
                </MenuItem>
              ))}

              <Divider sx={{ my: .75, mx: 1.5, borderColor: isDark ? 'rgba(255,255,255,.08)' : '#F3F4F6' }} />

              {/* Security group */}
              <Box sx={{ px: 1.5, pb: .25 }}>
                <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,.35)' : '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', fontSize: '.65rem' }}>Security</Typography>
              </Box>
              {[
                { label: 'Authentication', icon: <LockIcon />,    path: `${routeBase}/settings/authentication` },
                { label: 'SSH Keys',       icon: <KeyIcon />,     path: `${routeBase}/settings/ssh-keys` },
                { label: 'Compliance',     icon: <GppGoodIcon />, path: `${routeBase}/settings/compliance` },
              ].map(item => (
                <MenuItem key={item.label} onClick={() => { setProfileAnchor(null); navigate(item.path); }}
                  sx={{ gap: 1.5, fontSize: '.85rem', py: .75, mx: .5, borderRadius: '6px',
                    '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,.06)' : 'rgba(20,184,166,.10)' } }}>
                  {React.cloneElement(item.icon, { sx: { fontSize: '1rem', color: isDark ? '#ffffff' : '#6B7280' } })}
                  <Typography fontSize=".85rem" color={isDark ? '#ffffff' : '#374151'}>{item.label}</Typography>
                </MenuItem>
              ))}

              <Divider sx={{ my: .75, mx: 1.5, borderColor: isDark ? 'rgba(255,255,255,.08)' : '#F3F4F6' }} />

              {/* Developer group */}
              <Box sx={{ px: 1.5, pb: .25 }}>
                <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,.35)' : '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', fontSize: '.65rem' }}>Developer</Typography>
              </Box>
              {[
                { label: 'API',   icon: <ApiIcon />,    path: `${routeBase}/settings/api` },
                { label: 'Users', icon: <TeamIcon />, path: `${routeBase}/settings/users` },
              ].map(item => (
                <MenuItem key={item.label} onClick={() => { setProfileAnchor(null); navigate(item.path); }}
                  sx={{ gap: 1.5, fontSize: '.85rem', py: .75, mx: .5, borderRadius: '6px',
                    '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,.06)' : 'rgba(20,184,166,.10)' } }}>
                  {React.cloneElement(item.icon, { sx: { fontSize: '1rem', color: isDark ? '#ffffff' : '#6B7280' } })}
                  <Typography fontSize=".85rem" color={isDark ? '#ffffff' : '#374151'}>{item.label}</Typography>
                </MenuItem>
              ))}

              <Divider sx={{ my: .75, mx: 1.5, borderColor: isDark ? 'rgba(255,255,255,.08)' : '#F3F4F6' }} />

              {/* Billing + Sign out */}
              <MenuItem onClick={() => { setProfileAnchor(null); navigate(`${routeBase}/billing`); }}
                sx={{ gap: 1.5, fontSize: '.85rem', py: .75, mx: .5, borderRadius: '6px',
                  '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,.06)' : 'rgba(20,184,166,.10)' } }}>
                <BillingIcon sx={{ fontSize: '1rem', color: isDark ? '#ffffff' : '#6B7280' }} />
                <Typography fontSize=".85rem" color={isDark ? '#ffffff' : '#374151'}>Billing</Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}
                sx={{ gap: 1.5, fontSize: '.85rem', py: .75, mx: .5, mb: .5, borderRadius: '6px',
                  '&:hover': { bgcolor: 'rgba(239,68,68,.08)' } }}>
                <LogoutIcon sx={{ fontSize: '1rem', color: '#EF4444' }} />
                <Typography fontSize=".85rem" color="#EF4444">Sign Out</Typography>
              </MenuItem>
            </Menu>

          </Toolbar>
        </AppBar>

        {/* ── Page content ──────────────────────────────────────────────────── */}
        <Box component="main" sx={{ flexGrow: 1, overflow: 'auto', bgcolor: isDark ? NAVY2 : '#ffffff' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
