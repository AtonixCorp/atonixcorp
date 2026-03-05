// AtonixCorp Cloud Dashboard – Layout
// Enterprise-grade cloud dashboard layout following AtonixCorp design system.

import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  Collapse,
  Stack,
  Chip,
} from '@mui/material';
import MenuIcon              from '@mui/icons-material/Menu';

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
import MailOutlineIcon       from '@mui/icons-material/MailOutline';
import PaletteIcon           from '@mui/icons-material/Palette';
import HelpIcon              from '@mui/icons-material/HelpOutline';
import PersonIcon            from '@mui/icons-material/Person';
import BillingIcon           from '@mui/icons-material/ReceiptLong';
import LockIcon              from '@mui/icons-material/Lock';
import KeyIcon               from '@mui/icons-material/Key';
import TuneIcon              from '@mui/icons-material/Tune';
import GppGoodIcon           from '@mui/icons-material/GppGood';
import ApiIcon               from '@mui/icons-material/Api';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import TeamIcon              from '@mui/icons-material/Group';
import GroupsIcon            from '@mui/icons-material/Groups';
import FolderOpenIcon        from '@mui/icons-material/FolderOpenRounded';
import MonitorIcon           from '@mui/icons-material/QueryStats';
import DomainIcon            from '@mui/icons-material/Language';
import CampaignIcon          from '@mui/icons-material/Campaign';
import ViewListIcon          from '@mui/icons-material/ViewList';

import FirstPageIcon         from '@mui/icons-material/FirstPage';
import LastPageIcon          from '@mui/icons-material/LastPage';
import ArrowBackIcon         from '@mui/icons-material/ArrowBack'
import MemoryIcon            from '@mui/icons-material/Memory';
import TrackChangesIcon      from '@mui/icons-material/TrackChanges';
import SecurityIcon          from '@mui/icons-material/Security';

import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import SourceIcon              from '@mui/icons-material/Source';
import WorkspacesIcon         from '@mui/icons-material/Workspaces';
import ArticleIcon            from '@mui/icons-material/Article';

import { useAuth }           from '../../contexts/AuthContext';
import { useTheme as useColorMode } from '../../contexts/ThemeContext';
import { useOnboarding }    from '../../contexts/OnboardingContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { dashboardSemanticColors, dashboardTokens } from '../../styles/dashboardDesignSystem';
import DashboardTopBar, { TopBarSearch } from './DashboardTopBar';
import RightActivityPanel, { RightPanelExpandTab } from './RightActivityPanel';

// ── Constants ──────────────────────────────────────────────────────────────────

const SIDEBAR_WIDTH = 260;
const SIDEBAR_COLLAPSED_WIDTH = 76;
const FONT = '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

// ── AtonixCorp unified design tokens ──────────────────────────────────────────
// Sidebar / shell — Neutral enterprise palette
const NAVY          = dashboardTokens.colors.surface;
const NAVY2         = dashboardTokens.colors.surfaceSubtle;
// Brand accent
const BLUE          = dashboardTokens.colors.brandPrimary;
const BLUE_DIM      = 'rgba(21,61,117,0.12)';
const BLUE_HOVER    = 'rgba(21,61,117,0.08)';
const DARK_HOVER    = '#415a77';
// Typography on blue sidebar
const TEXT_PRIMARY   = dashboardTokens.colors.textPrimary;
const TEXT_SECONDARY = dashboardTokens.colors.textSecondary;
const DIVIDER_COLOR  = dashboardTokens.colors.border;
// Status
const SUCCESS = dashboardSemanticColors.success;
const WARNING = dashboardSemanticColors.warning;
const DANGER  = dashboardSemanticColors.danger;

// ── Nav structure ──────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  badge?: string | number;
  badgeColor?: 'error' | 'warning' | 'success' | 'info';
  children?: NavItem[];
}

type DashboardMode = 'cloud' | 'developer' | 'marketing' | 'domains' | 'monitor' | 'enterprise';

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
      { label: 'GPU Workloads',     icon: <MemoryIcon    {...I('.95rem')} />, path: '/dashboard/gpu', badge: 'New', badgeColor: 'success' },
      { label: 'Network',           icon: <NetworkIcon   {...I('.95rem')} />, path: '/dashboard/network'    },
      { label: 'Orchestration',     icon: <OrchestrateIcon {...I('.95rem')} />, path: '/dashboard/orchestration' },
      { label: 'Auto Scaling',      icon: <TuneIcon      {...I('.95rem')} />, path: '/dashboard/autoscaling' },
      { label: 'Snapshots',         icon: <StorageIcon   {...I('.95rem')} />, path: '/dashboard/snapshots'  },
      { label: 'Firewall',          icon: <SecurityIcon  {...I('.95rem')} />, path: '/dashboard/firewall'   },
    ],
  },
  { label: 'Sections',       icon: <ViewListIcon {...I()} />, path: '/dashboard/sections' },
  {
    label: 'Domains',
    icon: <DomainIcon {...I()} />,
    children: [
      { label: 'Domains',   icon: <DomainIcon {...I('.95rem')} />, path: '/dashboard/domains' },
      { label: 'DNS Zones', icon: <DomainIcon {...I('.95rem')} />, path: '/dashboard/dns'     },
    ],
  },
  { label: 'Billing',        icon: <BillingIcon  {...I()} />, path: '/dashboard/billing' },
  { label: 'Teams',          icon: <TeamIcon     {...I()} />, path: '/dashboard/teams' },
  {
    label: 'Observability',
    icon: <MonitorIcon {...I()} />,
    children: [
      { label: 'SLO / SLA',        icon: <TrackChangesIcon       {...I('.95rem')} />, path: '/dashboard/slo' },
      { label: 'Tracing',          icon: <AccountTreeOutlinedIcon {...I('.95rem')} />, path: '/dashboard/tracing' },
      { label: 'Monitoring',       icon: <MonitorIcon            {...I('.95rem')} />, path: '/monitor-dashboard/dashboards' },
    ],
  },
  { label: 'Compliance',     icon: <GppGoodIcon  {...I()} />, path: '/dashboard/compliance' },
  { label: 'Enterprise', icon: <GroupsIcon {...I()} />, path: '/enterprise' },
  { label: 'Developer', icon: <ComputerIcon {...I()} />, path: '/developer/Dashboard/repositories' },
];

const DEVELOPER_NAV: NavItem[] = [
  { label: 'Projects',        icon: <FolderOpenIcon  {...I()} />, path: '/developer/Dashboard/projects'        },
  { label: 'Repositories',    icon: <SourceIcon      {...I()} />, path: '/developer/Dashboard/repositories'    },
  { label: 'SSH Keys',        icon: <KeyIcon         {...I()} />, path: '/developer/Dashboard/ssh-keys'        },
  { label: 'CI/CD Pipelines', icon: <OrchestrateIcon {...I()} />, path: '/developer/Dashboard/cicd'           },
  { label: 'Containers',      icon: <ContainerIcon   {...I()} />, path: '/developer/Dashboard/containers'      },
  { label: 'Kubernetes',      icon: <ClusterIcon     {...I()} />, path: '/developer/Dashboard/kubernetes'      },
  { label: 'SDKs & Tools',    icon: <ApiIcon         {...I()} />, path: '/developer/Dashboard/sdks'            },
  { label: 'Infra as Code',   icon: <StorageIcon     {...I()} />, path: '/developer/Dashboard/iac'             },
  { label: 'Service Catalog', icon: <ViewListIcon    {...I()} />, path: '/developer/Dashboard/catalog'         },
  { label: 'Sandbox',         icon: <FunctionsIcon   {...I()} />, path: '/developer/Dashboard/sandbox'         },
  { label: 'Webhooks',        icon: <NetworkIcon     {...I()} />, path: '/developer/Dashboard/webhooks'        },
  { label: 'Groups',          icon: <GroupsIcon      {...I()} />, path: '/developer/Dashboard/groups'          },
  { label: 'Resource Control',icon: <TuneIcon        {...I()} />, path: '/developer/Dashboard/resource-control'},
  { label: 'Workplace',       icon: <PersonIcon      {...I()} />, path: '/developer/Dashboard/workspace'       },
  { label: 'Environment',     icon: <MemoryIcon      {...I()} />, path: '/developer/Dashboard/environment'     },
  { label: 'Operational',     icon: <GppGoodIcon     {...I()} />, path: '/developer/Dashboard/operational'     },
];

const MARKETING_NAV: NavItem[] = [
  { label: 'Marketing Overview', icon: <MonitorIcon {...I()} />, path: '/marketing-dashboard/analytics' },
  { label: 'Campaigns', icon: <CampaignIcon {...I()} />, path: '/marketing-dashboard/campaigns' },
  { label: 'Sections', icon: <ViewListIcon {...I()} />, path: '/marketing-dashboard/sections' },
  { label: 'SEO & Domains', icon: <DomainIcon {...I()} />, path: '/marketing-dashboard/seo-domains' },
  { label: 'Audience Segmentation', icon: <TeamIcon {...I()} />, path: '/marketing-dashboard/audience-segmentation' },
  { label: 'Content Distribution', icon: <CdnIcon {...I()} />, path: '/marketing-dashboard/content-distribution' },
  { label: 'A/B Testing', icon: <TuneIcon {...I()} />, path: '/marketing-dashboard/ab-testing' },
  { label: 'Teams', icon: <TeamIcon {...I()} />, path: '/dashboard/teams' },
];

const DOMAINS_NAV: NavItem[] = [
  { label: 'Domain Service', icon: <DomainIcon   {...I()} />, path: '/domains/dashboard' },
  { label: 'Sections',       icon: <ViewListIcon {...I()} />, path: '/domains/dashboard/sections' },
  { label: 'Billing',        icon: <BillingIcon  {...I()} />, path: '/domains/dashboard' },
  { label: 'Admin Console',  icon: <SettingsIcon {...I()} />, path: '/domains/dashboard' },
];

const DOMAINS_ACCOUNT_NAV: NavItem[] = [
  { label: 'Billing',  icon: <BillingIcon  {...I()} />, path: '/dashboard/billing' },
];

const MONITOR_NAV: NavItem[] = [
  { label: 'Dashboards',    icon: <DashboardIcon         {...I()} />, path: '/monitor-dashboard/dashboards' },
  { label: 'Alerts',        icon: <NotificationsNoneIcon {...I()} />, path: '/monitor-dashboard/alerts'    , badge: 3, badgeColor: 'error' },
  { label: 'Incidents',     icon: <GppGoodIcon           {...I()} />, path: '/monitor-dashboard/incidents'  },
  { label: 'Logs',          icon: <StorageIcon           {...I()} />, path: '/monitor-dashboard/logs'       },
  { label: 'Metrics',       icon: <TuneIcon              {...I()} />, path: '/monitor-dashboard/metrics'    },
  { label: 'Developer Monitor', icon: <MonitorIcon           {...I()} />, path: '/developer/monitor' },
  { label: 'Sections',      icon: <ViewListIcon          {...I()} />, path: '/monitor-dashboard/sections'   },
];

const MONITOR_ACCOUNT_NAV: NavItem[] = [];

const MONITOR_SUPPORT_NAV: NavItem[] = [];

const DOMAINS_SUPPORT_NAV: NavItem[] = [];

const ACCOUNT_NAV: NavItem[] = [];

// ── Enterprise nav (org-slug is injected at runtime) ────────────────────────
const ENTERPRISE_NAV = (orgSlug: string): NavItem[] => {
  const p = (section: string) => orgSlug ? `/enterprise/${orgSlug}/${section}` : '/enterprise';
  return [
    { label: 'Overview',      icon: <DashboardIcon   {...I()} />, path: p('overview')      },
    { label: 'Organization',  icon: <TeamIcon        {...I()} />, path: p('organization')  },
    { label: 'Marketing',     icon: <CampaignIcon    {...I()} />, path: p('marketing')     },
    { label: 'Email Service', icon: <MailOutlineIcon {...I()} />, path: p('email')         },
    { label: 'Domains',       icon: <DomainIcon      {...I()} />, path: p('domains')       },
    { label: 'Branding',      icon: <PaletteIcon     {...I()} />, path: p('branding')      },
    { label: 'Workspace',     icon: <WorkspacesIcon  {...I()} />, path: p('workspace')     },
    { label: 'Docs',          icon: <ArticleIcon     {...I()} />, path: p('docs')          },
    { label: 'Billing',       icon: <BillingIcon     {...I()} />, path: '/billing'          },
    { label: 'Compliance',    icon: <GppGoodIcon     {...I()} />, path: p('compliance')    },
  ];
};

const ENTERPRISE_ACCOUNT_NAV: NavItem[] = [];
const ENTERPRISE_SUPPORT_NAV: NavItem[] = [];

const DEVELOPER_ACCOUNT_NAV: NavItem[] = [];

const MARKETING_ACCOUNT_NAV: NavItem[] = [];

const SUPPORT_NAV: NavItem[] = [
  { label: 'Support',          icon: <HelpIcon    {...I()} />, path: '/dashboard/help'     },
  { label: 'Referral Program', icon: <TeamIcon    {...I()} />, path: '/dashboard/referral', badge: '$25', badgeColor: 'success' },
];

const DEVELOPER_SUPPORT_NAV: NavItem[] = [];

const MARKETING_SUPPORT_NAV: NavItem[] = [];
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
  const { mode: navMode } = useColorMode();
  const isDarkNav = navMode === 'dark';
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
          borderRadius: '2px',
          cursor: 'pointer',
          userSelect: 'none',
          background: isActive && !hasChildren ? (isDarkNav ? DARK_HOVER : '#F3F4F6') : 'transparent',
          borderLeft: isActive && !hasChildren ? `3px solid ${BLUE}` : '3px solid transparent',
          transition: 'background .12s',
          '&:hover': {
            background: isActive && !hasChildren ? (isDarkNav ? DARK_HOVER : BLUE_DIM) : (isDarkNav ? DARK_HOVER : BLUE_HOVER),
          },
        }}
      >
        <Box
          sx={{
            color: isActive ? BLUE : TEXT_SECONDARY,
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
              fontWeight: isActive ? 700 : 500,
              color: isActive ? '#111827' : TEXT_PRIMARY,
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
  const loc       = useLocation();
  const { mode: _mode }  = useColorMode();
  const isDarkSidebar = _mode === 'dark';
  const { state: onboardingState } = useOnboarding();
  const isDeveloperPlan = onboardingState.userPlan === 'developer';
  const enterpriseOrgSlug = dashboardMode === 'enterprise'
    ? (loc.pathname.split('/')[2] || '')
    : '';

  const routeBase = dashboardMode === 'developer'
    ? '/developer/Dashboard'
    : dashboardMode === 'marketing'
      ? '/marketing-dashboard'
      : dashboardMode === 'domains'
        ? '/domains/dashboard'
        : dashboardMode === 'monitor'
          ? '/monitor-dashboard'
          : dashboardMode === 'enterprise'
            ? (enterpriseOrgSlug ? `/enterprise/${enterpriseOrgSlug}/overview` : '/enterprise')
            : '/dashboard';

  const navItems = dashboardMode === 'developer'
    ? DEVELOPER_NAV
    : dashboardMode === 'marketing'
      ? MARKETING_NAV
      : dashboardMode === 'domains'
        ? DOMAINS_NAV
        : dashboardMode === 'monitor'
          ? MONITOR_NAV
          : dashboardMode === 'enterprise'
            ? ENTERPRISE_NAV(enterpriseOrgSlug)
            : CLOUD_NAV;

  const accountNav = dashboardMode === 'developer'
    ? DEVELOPER_ACCOUNT_NAV
    : dashboardMode === 'marketing'
      ? MARKETING_ACCOUNT_NAV
      : dashboardMode === 'domains'
        ? DOMAINS_ACCOUNT_NAV
        : dashboardMode === 'monitor'
          ? MONITOR_ACCOUNT_NAV
          : dashboardMode === 'enterprise'
            ? ENTERPRISE_ACCOUNT_NAV
            : ACCOUNT_NAV;

  const supportNav = dashboardMode === 'developer'
    ? DEVELOPER_SUPPORT_NAV
    : dashboardMode === 'marketing'
      ? MARKETING_SUPPORT_NAV
      : dashboardMode === 'domains'
        ? DOMAINS_SUPPORT_NAV
        : dashboardMode === 'monitor'
          ? MONITOR_SUPPORT_NAV
          : dashboardMode === 'enterprise'
            ? ENTERPRISE_SUPPORT_NAV
            : SUPPORT_NAV;

  // Sidebar surface colours switch with the theme
  const SB_BG     = NAVY;
  const SB_ORG    = NAVY2;
  const SB_DIV    = DIVIDER_COLOR;

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
            width: 32, height: 32, borderRadius: '2px',
            background: BLUE,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, color: '#fff', fontSize: '.85rem',
            letterSpacing: '-.02em', flexShrink: 0,
          }}
        >
          A
        </Box>
        {!collapsed && (
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#f4f4f4', lineHeight: 1.15, letterSpacing: '-.02em', fontFamily: FONT }}>
              AtonixCorp
            </Typography>
            <Typography sx={{ fontSize: '.67rem', color: TEXT_SECONDARY, lineHeight: 1, fontFamily: FONT, letterSpacing: '.02em' }}>
              {dashboardMode === 'developer'
                ? 'Developer Dashboard'
                : dashboardMode === 'marketing'
                  ? 'Marketing Dashboard'
                  : dashboardMode === 'domains'
                    ? 'Domains Service'
                    : dashboardMode === 'monitor'
                      ? 'Monitor Dashboard'
                      : 'Cloud Platform'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Back to Cloud Dashboard — shown in developer / marketing / monitor modes (cloud-plan only) */}
      {(dashboardMode === 'developer' || dashboardMode === 'marketing' || dashboardMode === 'monitor') && !isDeveloperPlan && (
        <Box
          onClick={() => navigate('/dashboard')}
          sx={{
            px: collapsed ? 0 : 1.5,
            py: 0.75,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 1,
            borderBottom: `1px solid ${SB_DIV}`,
            cursor: 'pointer',
            flexShrink: 0,
            '&:hover': { bgcolor: isDarkSidebar ? DARK_HOVER : BLUE_HOVER },
            transition: 'background .15s',
          }}
        >
          <Tooltip title={collapsed ? 'Back to Cloud Dashboard' : ''} placement="right">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', justifyContent: collapsed ? 'center' : 'flex-start' }}>
              <ArrowBackIcon sx={{ fontSize: '.9rem', color: TEXT_SECONDARY, flexShrink: 0 }} />
              {!collapsed && (
                <Typography sx={{ fontSize: '.78rem', fontWeight: 600, color: TEXT_SECONDARY, fontFamily: FONT, letterSpacing: '.01em' }}>
                  Cloud Dashboard
                </Typography>
              )}
            </Box>
          </Tooltip>
        </Box>
      )}

      {/* Upgrade to Cloud — shown for developer-plan users at bottom of sidebar header */}
      {isDeveloperPlan && !collapsed && (
        <Box
          sx={{
            mx: 1.5, my: 1,
            p: 1.5,
            borderRadius: '6px',
            background: 'rgba(37,99,235,0.10)',
            border: '1px solid rgba(37,99,235,0.25)',
            cursor: 'pointer',
            flexShrink: 0,
            '&:hover': { background: 'rgba(37,99,235,0.18)' },
            transition: 'background .18s',
          }}
          onClick={() => navigate('/onboarding/plan')}
        >
          <Typography sx={{ fontSize: '.72rem', fontWeight: 700, color: BLUE, fontFamily: FONT, mb: 0.25 }}>
            Upgrade to Cloud
          </Typography>
          <Typography sx={{ fontSize: '.68rem', color: TEXT_SECONDARY, fontFamily: FONT, lineHeight: 1.4 }}>
            Unlock compute, storage, Kubernetes, billing and more.
          </Typography>
        </Box>
      )}
      {isDeveloperPlan && collapsed && (
        <Tooltip title="Upgrade to Cloud" placement="right">
          <Box
            onClick={() => navigate('/onboarding/plan')}
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              py: 0.85, borderBottom: `1px solid ${SB_DIV}`,
              cursor: 'pointer',
              '&:hover': { bgcolor: isDarkSidebar ? DARK_HOVER : BLUE_HOVER },
              transition: 'background .15s',
            }}
          >
            <LockIcon sx={{ fontSize: '1rem', color: BLUE }} />
          </Box>
        </Tooltip>
      )}

      {/* Navigation */}
      <Box
        sx={{
          flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 1,
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
          '&::-webkit-scrollbar-thumb': { bgcolor: dashboardTokens.colors.borderStrong, borderRadius: 1 },
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

        {accountNav.length > 0 && (
          <>
            {!collapsed && <Divider sx={{ borderColor: SB_DIV, my: 1, mx: 2 }} />}
            <NavSectionLabel collapsed={collapsed}>Account</NavSectionLabel>
            <List disablePadding>
              {accountNav.map(item => (
                <NavRow key={item.label} item={item} collapsed={collapsed} />
              ))}
            </List>
          </>
        )}

        {supportNav.length > 0 && (
          <>
            {!collapsed && <Divider sx={{ borderColor: SB_DIV, my: 1, mx: 2 }} />}

            <NavSectionLabel collapsed={collapsed}>Support</NavSectionLabel>
            <List disablePadding>
              {supportNav.map(item => (
                <NavRow key={item.label} item={item} collapsed={collapsed} />
              ))}
            </List>
          </>
        )}
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
  const navigate           = useNavigate();
  const location           = useLocation();
  const { mode } = useColorMode();

  const isDark             = mode === 'dark';
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightCollapsed,   setRightCollapsed]   = useState(false);
  const routeBase = dashboardMode === 'developer'
    ? '/developer/Dashboard'
    : dashboardMode === 'marketing'
      ? '/marketing-dashboard'
      : dashboardMode === 'domains'
        ? '/domains/dashboard'
        : dashboardMode === 'monitor'
          ? '/monitor-dashboard'
          : '/dashboard';

  // Enterprise sidebar is always visible for all sections
  const enterpriseOrgSlug = dashboardMode === 'enterprise'
    ? location.pathname.split('/')[2] || ''
    : '';

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: dashboardTokens.colors.background,
        ...(isDark
          ? {
              color: '#FFFFFF',
              '& .MuiTypography-root, & .MuiTableCell-root, & .MuiInputBase-input, & .MuiFormLabel-root, & .MuiInputLabel-root, & .MuiListItemText-primary, & .MuiListItemText-secondary': {
                color: '#FFFFFF',
              },
            }
          : {}),
      }}
    >

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <Box component="nav" sx={{ width: { lg: sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH }, flexShrink: { lg: 0 } }}>
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
          <SidebarContent dashboardMode={dashboardMode} />
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': {
              width: sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH, border: 'none',
              borderRight: `1px solid ${DIVIDER_COLOR}`,
              bgcolor: NAVY,
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
          overflow: 'hidden',
          transition: 'width .2s ease',
        }}
      >

        {/* ── Top AppBar ─────────────────────────────────────────────────────── */}
        <DashboardTopBar
          routeBase={routeBase}
          showMobileMenu
          onMobileMenuOpen={() => setMobileOpen(true)}
          leftContent={
            <>
              {/* Sidebar collapse toggle */}
              <Tooltip title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
                <IconButton
                  onClick={() => setSidebarCollapsed(prev => !prev)}
                  sx={{ display: { xs: 'none', lg: 'inline-flex' }, color: TEXT_SECONDARY }}
                >
                  {sidebarCollapsed ? <LastPageIcon /> : <FirstPageIcon />}
                </IconButton>
              </Tooltip>

              {/* Global search */}
              <TopBarSearch />
            </>
          }
        />

        {/* ── Page content ──────────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
          <Box component="main" sx={{ flexGrow: 1, overflow: 'auto', bgcolor: dashboardTokens.colors.background }}>
            {children}
          </Box>

          {/* ── Right activity panel ─────────────────────────────────────────── */}
          {dashboardMode !== 'enterprise' && (
            <>
              <RightActivityPanel
                collapsed={rightCollapsed}
                onToggle={() => setRightCollapsed(true)}
              />
              {rightCollapsed && <RightPanelExpandTab onClick={() => setRightCollapsed(false)} />}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
