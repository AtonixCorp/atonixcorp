// AtonixCorp Cloud – Group Dashboard Page (standalone layout)

import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import AlertsIcon from '@mui/icons-material/NotificationsActiveOutlined';
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
import ArtifactsIcon from '@mui/icons-material/Inventory2Outlined';
import AuditIcon from '@mui/icons-material/PolicyOutlined';
import BillingIcon from '@mui/icons-material/ReceiptOutlined';
import BranchIcon from '@mui/icons-material/AltRouteOutlined';
import BuildIcon from '@mui/icons-material/ConstructionOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CicdIcon from '@mui/icons-material/TerminalOutlined';
import CommitIcon from '@mui/icons-material/CommitOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import DeployIcon from '@mui/icons-material/RocketLaunchOutlined';
import DeployKeyIcon from '@mui/icons-material/VpnKeyOutlined';
import EnvironmentsIcon from '@mui/icons-material/LayersOutlined';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GroupsIcon from '@mui/icons-material/Groups';
import InfraIcon from '@mui/icons-material/StorageOutlined';
import IntegrationsIcon from '@mui/icons-material/ExtensionOutlined';
import InviteIcon from '@mui/icons-material/MailOutlined';
import IssuesIcon from '@mui/icons-material/BugReportOutlined';
import KeyIcon from '@mui/icons-material/KeyOutlined';
import LogsIcon from '@mui/icons-material/SubjectOutlined';
import ManageIcon from '@mui/icons-material/ManageAccountsOutlined';
import MembersIcon from '@mui/icons-material/PeopleOutlined';
import MergeIcon from '@mui/icons-material/MergeOutlined';
import MetricsIcon from '@mui/icons-material/ShowChartOutlined';
import MilestonesIcon from '@mui/icons-material/FlagOutlined';
import MonitorIcon from '@mui/icons-material/MonitorHeartOutlined';
import OperateIcon from '@mui/icons-material/TuneOutlined';
import OverviewIcon from '@mui/icons-material/GridViewOutlined';
import PinIcon from '@mui/icons-material/PushPinOutlined';
import PipelineIcon from '@mui/icons-material/AccountTreeOutlined';
import PlanIcon from '@mui/icons-material/EventNoteOutlined';
import ReleasesIcon from '@mui/icons-material/NewReleasesOutlined';
import RepoIcon from '@mui/icons-material/FolderCopyOutlined';
import RequirementsIcon from '@mui/icons-material/ListAltOutlined';
import RoadmapIcon from '@mui/icons-material/TimelineOutlined';
import RunnersIcon from '@mui/icons-material/SpeedOutlined';
import SecretIcon from '@mui/icons-material/LockOutlined';
import ServerlessIcon from '@mui/icons-material/FlashOnOutlined';
import ServiceMapIcon from '@mui/icons-material/HubOutlined';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import SloBIcon from '@mui/icons-material/VerifiedOutlined';
import SnippetsIcon from '@mui/icons-material/CodeOutlined';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import TasksIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import TeamsIcon from '@mui/icons-material/GroupWorkOutlined';
import TokenIcon from '@mui/icons-material/TokenOutlined';
import TracingIcon from '@mui/icons-material/ScatterPlotOutlined';
import UptimeIcon from '@mui/icons-material/WatchLaterOutlined';
import WebhookIcon from '@mui/icons-material/WebhookOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import { getGroup, Group } from '../services/groupsApi';
import { dashboardTokens, dashboardSemanticColors } from '../styles/dashboardDesignSystem';

const FONT = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const SIDEBAR_EXPANDED = 220;
const SIDEBAR_COLLAPSED = 52;

// ─── Nav tree ─────────────────────────────────────────────────────────────────

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  badge?: string
}

interface NavGroup {
  id: string
  label: string
  icon: React.ReactNode
  items: NavItem[]
}

const NAV_SECTIONS: NavGroup[] = [
  {
    id: 'manage',
    label: 'Manage',
    icon: <ManageIcon />,
    items: [
      { id: 'overview',      label: 'Overview',       icon: <OverviewIcon /> },
      { id: 'members',       label: 'Members',         icon: <MembersIcon /> },
      { id: 'teams',         label: 'Teams',           icon: <TeamsIcon /> },
      { id: 'invitations',   label: 'Invitations',     icon: <InviteIcon /> },
      { id: 'tokens',        label: 'Access Tokens',   icon: <TokenIcon /> },
      { id: 'billing',       label: 'Billing',         icon: <BillingIcon /> },
    ],
  },
  {
    id: 'plan',
    label: 'Plan',
    icon: <PlanIcon />,
    items: [
      { id: 'roadmap',       label: 'Roadmap',         icon: <RoadmapIcon /> },
      { id: 'milestones',    label: 'Milestones',      icon: <MilestonesIcon /> },
      { id: 'issues',        label: 'Issues',          icon: <IssuesIcon /> },
      { id: 'tasks',         label: 'Tasks',           icon: <TasksIcon /> },
      { id: 'requirements',  label: 'Requirements',    icon: <RequirementsIcon /> },
    ],
  },
  {
    id: 'code',
    label: 'Code',
    icon: <RepoIcon />,
    items: [
      { id: 'repositories',  label: 'Repositories',    icon: <RepoIcon /> },
      { id: 'branches',      label: 'Branches',        icon: <BranchIcon /> },
      { id: 'commits',       label: 'Commits',         icon: <CommitIcon /> },
      { id: 'merge-requests',label: 'Merge Requests',  icon: <MergeIcon /> },
      { id: 'snippets',      label: 'Snippets',        icon: <SnippetsIcon /> },
    ],
  },
  {
    id: 'build',
    label: 'Build',
    icon: <BuildIcon />,
    items: [
      { id: 'pipelines',     label: 'Pipelines',       icon: <PipelineIcon /> },
      { id: 'pipeline-editor',label: 'Pipeline Editor',icon: <CicdIcon /> },
      { id: 'artifacts',     label: 'Artifacts',       icon: <ArtifactsIcon /> },
      { id: 'runners',       label: 'Runners',         icon: <RunnersIcon /> },
    ],
  },
  {
    id: 'deploy',
    label: 'Deploy',
    icon: <DeployIcon />,
    items: [
      { id: 'environments',  label: 'Environments',    icon: <EnvironmentsIcon /> },
      { id: 'releases',      label: 'Releases',        icon: <ReleasesIcon /> },
      { id: 'deploy-keys',   label: 'Deploy Keys',     icon: <DeployKeyIcon /> },
      { id: 'infrastructure',label: 'Infrastructure',  icon: <InfraIcon /> },
      { id: 'serverless',    label: 'Serverless',      icon: <ServerlessIcon /> },
    ],
  },
  {
    id: 'operate',
    label: 'Operate',
    icon: <OperateIcon />,
    items: [
      { id: 'monitoring',    label: 'Monitoring',      icon: <MonitorIcon /> },
      { id: 'logs',          label: 'Logs',            icon: <LogsIcon /> },
      { id: 'metrics',       label: 'Metrics',         icon: <MetricsIcon /> },
      { id: 'tracing',       label: 'Tracing',         icon: <TracingIcon /> },
      { id: 'alerts',        label: 'Alerts',          icon: <AlertsIcon /> },
    ],
  },
  {
    id: 'observability',
    label: 'Observability',
    icon: <DashboardOutlinedIcon />,
    items: [
      { id: 'dashboards',    label: 'Dashboards',      icon: <AppsOutlinedIcon /> },
      { id: 'service-map',   label: 'Service Map',     icon: <ServiceMapIcon /> },
      { id: 'uptime',        label: 'Uptime',          icon: <UptimeIcon /> },
      { id: 'slos',          label: 'SLOs',            icon: <SloBIcon /> },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <SettingsIcon />,
    items: [
      { id: 'settings',           label: 'General',            icon: <SettingsIcon /> },
      { id: 'integrations',       label: 'Integrations',       icon: <IntegrationsIcon /> },
      { id: 'webhooks',           label: 'Webhooks',           icon: <WebhookIcon /> },
      { id: 'secrets',            label: 'Secrets',            icon: <SecretIcon /> },
      { id: 'cicd-settings',      label: 'CI/CD Settings',     icon: <CicdIcon /> },
      { id: 'repo-settings',      label: 'Repository Settings',icon: <RepoIcon /> },
      { id: 'audit',              label: 'Audit Logs',         icon: <AuditIcon /> },
    ],
  },
];

// ─── Section content map ──────────────────────────────────────────────────────

function SectionContent({ section, group }: { section: string; group: Group | null }) {
  const t = dashboardTokens.colors;

  if (!group) return null;

  if (section === 'overview') {
    return (
      <Box>
        <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: t.textPrimary, fontFamily: FONT, letterSpacing: '-.02em', mb: 0.5 }}>
          {group.name}
        </Typography>
        <Typography sx={{ color: t.textSecondary, fontSize: '.875rem', fontFamily: FONT, mb: 3 }}>
          {group.description || 'No description set.'}
        </Typography>

        {/* Quick stats */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
          {[
            { label: 'Members',   value: group.member_count,  color: dashboardSemanticColors.purple },
            { label: 'Projects',  value: group.project_count, color: dashboardSemanticColors.info },
            { label: 'Pipelines', value: group.pipeline_count,color: dashboardSemanticColors.success },
          ].map((stat) => (
            <Box
              key={stat.label}
              sx={{ flex: '1 1 140px', border: `1px solid ${t.border}`, borderRadius: '8px', p: '12px 16px', bgcolor: t.surface }}
            >
              <Typography sx={{ fontSize: '.72rem', color: t.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: FONT }}>
                {stat.label}
              </Typography>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color, fontFamily: FONT, lineHeight: 1.2 }}>
                {stat.value}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Meta */}
        <Box sx={{ border: `1px solid ${t.border}`, borderRadius: '8px', overflow: 'hidden' }}>
          {[
            { label: 'Handle',     value: `@${group.handle}` },
            { label: 'Visibility', value: group.visibility },
            { label: 'Type',       value: group.group_type },
            { label: 'Owner',      value: group.owner?.display_name ?? group.owner?.username ?? '—' },
            { label: 'Your Role',  value: group.my_role ?? '—' },
            { label: 'Created',    value: new Date(group.created_at).toLocaleDateString() },
          ].map(({ label, value }, i) => (
            <Box
              key={label}
              sx={{ display: 'flex', gap: 2, px: 2, py: 1.25, bgcolor: i % 2 === 0 ? 'transparent' : t.surfaceSubtle, borderBottom: i < 5 ? `1px solid ${t.border}` : 'none' }}
            >
              <Typography sx={{ fontWeight: 600, fontSize: '.8rem', color: t.textSecondary, minWidth: 100, fontFamily: FONT }}>{label}</Typography>
              <Typography sx={{ fontSize: '.875rem', color: t.textPrimary, textTransform: 'capitalize', fontFamily: FONT }}>{value}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  // Generic placeholder for all other sections
  const sectionLabel = NAV_SECTIONS
    .flatMap((g) => g.items)
    .find((item) => item.id === section)?.label ?? section;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10 }}>
      <GroupsIcon sx={{ fontSize: '3rem', color: dashboardTokens.colors.textTertiary ?? t.textSecondary, mb: 2, opacity: .4 }} />
      <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: t.textSecondary, fontFamily: FONT }}>
        {sectionLabel}
      </Typography>
      <Typography sx={{ fontSize: '.875rem', color: t.textSecondary, fontFamily: FONT, mt: 0.5, opacity: .7 }}>
        This section is coming soon.
      </Typography>
    </Box>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const GroupDashboardPage: React.FC = () => {
  const { groupId, section = 'overview' } = useParams<{ groupId: string; section: string }>();
  const navigate = useNavigate();
  const t = dashboardTokens.colors;

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['manage']));
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    if (groupId) {
      setLoading(true);
      getGroup(groupId)
        .then((g) => { if (isMounted.current) { setGroup(g); setLoading(false); } })
        .catch(() => { if (isMounted.current) setLoading(false); });
    }
    return () => { isMounted.current = false; };
  }, [groupId]);

  // Auto-expand the section containing the active item
  useEffect(() => {
    const parent = NAV_SECTIONS.find((s) => s.items.some((i) => i.id === section));
    if (parent) setExpandedSections((prev) => new Set(Array.from(prev).concat(parent.id)));
  }, [section]);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const goTo = (sectionId: string) => {
    navigate(`/groups/${groupId}/${sectionId}`);
  };

  const sidebarWidth = sidebarOpen ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: dashboardTokens.colors.background, fontFamily: FONT }}>

      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      <Box
        sx={{
          width: sidebarWidth,
          minWidth: sidebarWidth,
          transition: 'width .2s, min-width .2s',
          borderRight: `1px solid ${t.border}`,
          bgcolor: t.surface,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Sidebar header */}
        <Box
          sx={{
            px: sidebarOpen ? 1.5 : 0.75,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            borderBottom: `1px solid ${t.border}`,
            minHeight: 56,
          }}
        >
          {loading ? (
            <CircularProgress size={20} sx={{ color: dashboardTokens.colors.brandPrimary, mx: 'auto' }} />
          ) : (
            <>
              <Box
                sx={{
                  width: 30, height: 30, borderRadius: '7px', flexShrink: 0,
                  bgcolor: group?.avatar_url ? 'transparent' : 'rgba(0,224,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: dashboardTokens.colors.brandPrimary, overflow: 'hidden',
                  cursor: 'pointer',
                }}
                onClick={() => goTo('overview')}
              >
                {group?.avatar_url
                  ? <Box component="img" src={group.avatar_url} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <GroupsIcon sx={{ fontSize: '1rem' }} />
                }
              </Box>
              {sidebarOpen && (
                <Box sx={{ flex: 1, overflow: 'hidden' }}>
                  <Typography
                    sx={{
                      fontWeight: 700, fontSize: '.82rem', color: t.textPrimary, fontFamily: FONT,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      cursor: 'pointer',
                    }}
                    onClick={() => goTo('overview')}
                  >
                    {group?.name ?? 'Loading…'}
                  </Typography>
                  <Typography sx={{ fontSize: '.7rem', color: t.textSecondary, fontFamily: FONT, lineHeight: 1 }}>
                    @{group?.handle ?? '…'}
                  </Typography>
                </Box>
              )}
            </>
          )}
          <Tooltip title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}>
            <IconButton
              size="small"
              onClick={() => setSidebarOpen((v) => !v)}
              sx={{ color: t.textSecondary, ml: 'auto', flexShrink: 0, '&:hover': { color: t.textPrimary } }}
            >
              {sidebarOpen ? <ChevronLeftIcon sx={{ fontSize: '1rem' }} /> : <ChevronRightIcon sx={{ fontSize: '1rem' }} />}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Back button */}
        <Box
          sx={{ px: sidebarOpen ? 1 : 0.5, py: 0.75, borderBottom: `1px solid ${t.border}` }}
          onClick={() => navigate('/developer/Dashboard/groups')}
        >
          <Tooltip title="All Groups" placement="right" disableHoverListener={sidebarOpen}>
            <ListItemButton
              sx={{
                borderRadius: '6px',
                px: sidebarOpen ? 1 : 0,
                py: 0.6,
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                '&:hover': { bgcolor: t.surfaceHover },
              }}
            >
              <ListItemIcon sx={{ minWidth: 0, mr: sidebarOpen ? 1 : 0, color: t.textSecondary }}>
                <ArrowBackIcon sx={{ fontSize: '.9rem' }} />
              </ListItemIcon>
              {sidebarOpen && <ListItemText primary="All Groups" primaryTypographyProps={{ fontSize: '.8rem', color: t.textSecondary, fontFamily: FONT }} />}
            </ListItemButton>
          </Tooltip>
        </Box>

        {/* Nav items */}
        <Box sx={{ flex: 1, overflowY: 'auto', py: 0.5 }}>
          {NAV_SECTIONS.map((navGroup) => {
            const isExpanded = expandedSections.has(navGroup.id);
            return (
              <Box key={navGroup.id}>
                {/* Group header (click to expand/collapse) */}
                {sidebarOpen ? (
                  <Box
                    onClick={() => toggleSection(navGroup.id)}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1,
                      px: 2, py: 0.6, cursor: 'pointer',
                      '&:hover': { bgcolor: t.surfaceHover },
                    }}
                  >
                    <Box sx={{ color: t.textSecondary, display: 'flex', fontSize: '.85rem' }}>{navGroup.icon}</Box>
                    <Typography sx={{ flex: 1, fontSize: '.72rem', fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: FONT }}>
                      {navGroup.label}
                    </Typography>
                    {isExpanded ? <ExpandLessIcon sx={{ fontSize: '.8rem', color: t.textSecondary }} /> : <ExpandMoreIcon sx={{ fontSize: '.8rem', color: t.textSecondary }} />}
                  </Box>
                ) : (
                  <Divider sx={{ borderColor: t.border, my: 0.5 }} />
                )}

                {/* Items */}
                <Collapse in={sidebarOpen ? isExpanded : true}>
                  <List dense disablePadding sx={{ px: sidebarOpen ? 0.5 : 0.25 }}>
                    {navGroup.items.map((item) => {
                      const active = section === item.id;
                      return (
                        <Tooltip key={item.id} title={sidebarOpen ? '' : item.label} placement="right">
                          <ListItemButton
                            selected={active}
                            onClick={() => goTo(item.id)}
                            sx={{
                              borderRadius: '6px',
                              px: sidebarOpen ? 1.5 : 0,
                              py: 0.55,
                              mb: 0.15,
                              justifyContent: sidebarOpen ? 'flex-start' : 'center',
                              bgcolor: active ? 'rgba(0,224,255,0.1)' : 'transparent',
                              '&:hover': { bgcolor: active ? 'rgba(0,224,255,0.14)' : t.surfaceHover },
                              '&.Mui-selected': { bgcolor: 'rgba(0,224,255,0.1)', '&:hover': { bgcolor: 'rgba(0,224,255,0.14)' } },
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                minWidth: 0,
                                mr: sidebarOpen ? 1.25 : 0,
                                color: active ? dashboardTokens.colors.brandPrimary : t.textSecondary,
                              }}
                            >
                              <Box sx={{ fontSize: '1rem', display: 'flex' }}>{item.icon}</Box>
                            </ListItemIcon>
                            {sidebarOpen && (
                              <ListItemText
                                primary={item.label}
                                primaryTypographyProps={{
                                  fontSize: '.82rem',
                                  fontWeight: active ? 700 : 500,
                                  color: active ? dashboardTokens.colors.brandPrimary : t.textPrimary,
                                  fontFamily: FONT,
                                  noWrap: true,
                                }}
                              />
                            )}
                            {sidebarOpen && item.badge && (
                              <Chip label={item.badge} size="small" sx={{ height: 16, fontSize: '.65rem', bgcolor: 'rgba(0,224,255,.15)', color: dashboardTokens.colors.brandPrimary }} />
                            )}
                          </ListItemButton>
                        </Tooltip>
                      );
                    })}
                  </List>
                </Collapse>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
        {/* Top bar */}
        <Box
          sx={{
            px: 3, py: 1.5,
            borderBottom: `1px solid ${t.border}`,
            bgcolor: t.surface,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            minHeight: 56,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography
              sx={{ fontSize: '.82rem', color: t.textSecondary, fontFamily: FONT, cursor: 'pointer', '&:hover': { color: t.textPrimary } }}
              onClick={() => navigate('/developer/Dashboard/groups')}
            >
              Groups
            </Typography>
            <Typography sx={{ color: t.textSecondary, mx: 0.25 }}>/</Typography>
            <Typography
              sx={{ fontSize: '.82rem', color: t.textSecondary, fontFamily: FONT, cursor: 'pointer', '&:hover': { color: t.textPrimary } }}
              onClick={() => goTo('overview')}
            >
              {group?.name ?? groupId}
            </Typography>
            {section !== 'overview' && (
              <>
                <Typography sx={{ color: t.textSecondary, mx: 0.25 }}>/</Typography>
                <Typography sx={{ fontSize: '.82rem', color: t.textPrimary, fontFamily: FONT, fontWeight: 600, textTransform: 'capitalize' }}>
                  {NAV_SECTIONS.flatMap((g) => g.items).find((i) => i.id === section)?.label ?? section}
                </Typography>
              </>
            )}
          </Box>
          <Box sx={{ flex: 1 }} />
          {group && (
            <Stack direction="row" gap={1} alignItems="center">
              <Chip
                label={group.visibility}
                size="small"
                sx={{ textTransform: 'capitalize', bgcolor: t.surfaceSubtle, color: t.textSecondary, fontSize: '.72rem', height: 20, border: `1px solid ${t.border}` }}
              />
              <Chip
                label={group.group_type}
                size="small"
                sx={{ textTransform: 'capitalize', bgcolor: t.surfaceSubtle, color: t.textSecondary, fontSize: '.72rem', height: 20, border: `1px solid ${t.border}` }}
              />
              {group.my_role && (
                <Chip
                  label={group.my_role}
                  size="small"
                  sx={{ textTransform: 'capitalize', bgcolor: 'rgba(0,224,255,0.1)', color: dashboardTokens.colors.brandPrimary, fontSize: '.72rem', height: 20, fontWeight: 700 }}
                />
              )}
            </Stack>
          )}
        </Box>

        {/* Page content */}
        <Box sx={{ p: { xs: 2, md: 3 }, flex: 1 }}>
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
              <CircularProgress size={28} sx={{ color: dashboardTokens.colors.brandPrimary }} />
            </Box>
          ) : (
            <SectionContent section={section} group={group} />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default GroupDashboardPage;
