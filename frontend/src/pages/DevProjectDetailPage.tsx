import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Drawer,
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
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import GitBranchIcon from '@mui/icons-material/AccountTree';

import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import GitHubIcon from '@mui/icons-material/GitHub';
import CloseIcon from '@mui/icons-material/Close';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import TuneIcon from '@mui/icons-material/Tune';
import { useParams, useNavigate } from 'react-router-dom';
import { dashboardTokens, dashboardSemanticColors } from '../styles/dashboardDesignSystem';

const FONT = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const t = dashboardTokens.colors;

/* ── Mock data ───────────────────────────────────────────────────── */

const MOCK_PROJECT = {
  id: 'p1',
  name: 'api-gateway',
  description: 'Central API gateway for routing, auth, and rate limiting across all microservices.',
  status: 'active' as const,
  language: 'Go',
  branch: 'main',
  progress: 88,
  framework: 'Go Fiber',
  openIssues: 4,
  lastBuild: 'passing' as const,
  updatedAt: '1 hour ago',
  createdAt: '6 months ago',
  members: [
    { initial: 'F', name: 'Franklin', role: 'Lead' },
    { initial: 'J', name: 'Jordan',   role: 'Backend' },
    { initial: 'S', name: 'Sofia',    role: 'DevOps' },
  ],
  tags: ['infra', 'core'],
  provider: 'github' as const,
  repoUrl: 'https://github.com/atonixcorp/api-gateway',
  defaultBranch: 'main',
  lastCommit: { hash: 'a3f9c12', message: 'fix: timeout handling for upstream services', author: 'Franklin', ago: '1 hour ago' },
  installCmd: 'go mod download',
  buildCmd: 'go build -o bin/gateway ./cmd/gateway',
  outputDir: 'bin/',
  envVars: [
    { key: 'PORT', value: '8080', secret: false },
    { key: 'LOG_LEVEL', value: 'info', secret: false },
    { key: 'JWT_SECRET', value: '••••••••', secret: true },
    { key: 'RATE_LIMIT', value: '1000', secret: false },
  ],
  deployments: [
    { id: 'd1', env: 'production', status: 'success' as const, trigger: 'push · main', duration: '2m 18s', ago: '1 hour ago' },
    { id: 'd2', env: 'staging',    status: 'success' as const, trigger: 'push · main', duration: '1m 54s', ago: '3 hours ago' },
    { id: 'd3', env: 'production', status: 'failed'  as const, trigger: 'push · feat/timeout', duration: '1m 02s', ago: 'Yesterday' },
    { id: 'd4', env: 'staging',    status: 'running' as const, trigger: 'manual',        duration: '—',       ago: 'Just now' },
  ],
  environments: [
    { name: 'Production',  domain: 'api.atonixcorp.com',         status: 'healthy'   as const, lastDeploy: '1 hour ago',  branch: 'main' },
    { name: 'Staging',     domain: 'api-staging.atonixcorp.com', status: 'healthy'   as const, lastDeploy: '3 hours ago', branch: 'main' },
    { name: 'Development', domain: 'api-dev.atonixcorp.com',     status: 'degraded'  as const, lastDeploy: 'Yesterday',   branch: 'feat/timeout' },
    { name: 'Testing',     domain: 'api-test.atonixcorp.com',    status: 'inactive'  as const, lastDeploy: '1 week ago',  branch: 'test/load' },
  ],
};

const PIPELINE_STAGES = [
  { label: 'Install',  status: 'success' as const, duration: '12s' },
  { label: 'Build',    status: 'success' as const, duration: '38s' },
  { label: 'Test',     status: 'success' as const, duration: '52s' },
  { label: 'Package',  status: 'success' as const, duration: '14s' },
  { label: 'Deploy',   status: 'running' as const, duration: '—' },
];

const MOCK_LOG = `[00:01] Installing dependencies...
go: downloading github.com/gofiber/fiber v2.51.0
go: downloading github.com/golang-jwt/jwt v4.5.0
[00:12] ✓ Dependencies installed

[00:13] Building binary...
go build -o bin/gateway ./cmd/gateway
[00:50] ✓ Build successful (7.4 MB)

[00:51] Running tests...
--- PASS: TestAuth (0.03s)
--- PASS: TestRateLimit (0.07s)
--- PASS: TestRouting (0.12s)
[01:43] ✓ All tests passed (38/38)

[01:44] Packaging container...
[02:02] ✓ Image pushed: registry.atonixcorp.com/api-gateway:a3f9c12

[02:03] Deploying to production...
Waiting for rollout...`;

/* ── Sub-configs ─────────────────────────────────────────────────── */

const STATUS_CONFIG = {
  success:  { color: dashboardSemanticColors.success, bg: 'rgba(34,197,94,.12)',   label: 'Success',  icon: <CheckCircleIcon  sx={{ fontSize: '1rem' }} /> },
  failed:   { color: dashboardSemanticColors.danger,  bg: 'rgba(239,68,68,.12)',   label: 'Failed',   icon: <CancelIcon       sx={{ fontSize: '1rem' }} /> },
  running:  { color: dashboardSemanticColors.info,    bg: 'rgba(0,224,255,.12)',   label: 'Running',  icon: <HourglassTopIcon sx={{ fontSize: '1rem' }} /> },
};

const ENV_STATUS_CONFIG = {
  healthy:  { color: dashboardSemanticColors.success,                             label: 'Healthy'  },
  degraded: { color: dashboardSemanticColors.warning,                             label: 'Degraded' },
  inactive: { color: dashboardTokens.colors.textSecondary,                        label: 'Inactive' },
};

const STAGE_STATUS_CONFIG = {
  success: { color: dashboardSemanticColors.success, icon: <CheckCircleIcon  sx={{ fontSize: '.9rem' }} /> },
  failed:  { color: dashboardSemanticColors.danger,  icon: <CancelIcon       sx={{ fontSize: '.9rem' }} /> },
  running: { color: dashboardSemanticColors.info,    icon: <HourglassTopIcon sx={{ fontSize: '.9rem' }} /> },
  pending: { color: dashboardTokens.colors.textSecondary, icon: <HourglassTopIcon sx={{ fontSize: '.9rem', opacity: 0.35 }} /> },
};

const MEMBER_COLORS = ['#00E0FF', '#8B5CF6', '#F97316', '#22C55E', '#EC4899'];

/* ── Component ───────────────────────────────────────────────────── */

const DevProjectDetailPage: React.FC = () => {
  const { id: _id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [logOpen, setLogOpen] = useState(false);
  const [selectedDeployment, setSelectedDeployment] = useState<string | null>(null);

  // In a real app you'd fetch by id; using mock for now
  const project = MOCK_PROJECT;

  const statCards = [
    { label: 'Progress',     value: `${project.progress}%`,         color: dashboardSemanticColors.success },
    { label: 'Open Issues',  value: project.openIssues,             color: project.openIssues > 8 ? dashboardSemanticColors.danger : dashboardSemanticColors.info },
    { label: 'Deployments',  value: project.deployments.length,     color: dashboardSemanticColors.purple },
    { label: 'Environments', value: project.environments.length,    color: dashboardSemanticColors.info   },
    { label: 'Members',      value: project.members.length,         color: dashboardTokens.colors.brandPrimary },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, fontFamily: FONT }}>

      {/* Back + header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 3 }}>
        <IconButton
          size="small"
          onClick={() => navigate('/developer/Dashboard/projects')}
          sx={{ color: t.textSecondary, border: `1px solid ${t.border}`, borderRadius: '7px', mt: 0.2 }}
        >
          <ArrowBackIcon sx={{ fontSize: '1rem' }} />
        </IconButton>

        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.1rem', md: '1.3rem' }, color: t.textPrimary, fontFamily: FONT, letterSpacing: '-.02em' }}>
              {project.name}
            </Typography>
            <Chip
              label="Active"
              size="small"
              sx={{ bgcolor: 'rgba(34,197,94,.12)', color: dashboardSemanticColors.success, fontWeight: 700, fontSize: '.7rem', height: 20 }}
            />
            <Chip
              label={project.language}
              size="small"
              sx={{ bgcolor: t.surfaceSubtle, color: t.textSecondary, border: `1px solid ${t.border}`, fontSize: '.7rem', height: 20 }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <GitHubIcon sx={{ fontSize: '.8rem', color: t.textSecondary }} />
              <Typography
                component="a"
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ fontSize: '.78rem', color: dashboardTokens.colors.brandPrimary, fontFamily: FONT, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                {project.repoUrl.replace('https://github.com/', '')}
              </Typography>
              <OpenInNewIcon sx={{ fontSize: '.7rem', color: t.textSecondary }} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <GitBranchIcon sx={{ fontSize: '.75rem', color: t.textSecondary }} />
              <Typography sx={{ fontSize: '.78rem', color: t.textSecondary, fontFamily: FONT }}>{project.branch}</Typography>
            </Box>
            <Typography sx={{ fontSize: '.78rem', color: t.textTertiary, fontFamily: FONT }}>
              Created {project.createdAt} · Updated {project.updatedAt}
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          size="small"
          startIcon={<RocketLaunchIcon sx={{ fontSize: '.85rem' }} />}
          sx={{
            bgcolor: dashboardTokens.colors.brandPrimary,
            color: '#0a0f1a',
            fontWeight: 700,
            fontSize: '.78rem',
            borderRadius: '7px',
            textTransform: 'none',
            boxShadow: 'none',
            whiteSpace: 'nowrap',
            '&:hover': { bgcolor: dashboardTokens.colors.brandPrimaryHover, boxShadow: 'none' },
          }}
        >
          Deploy
        </Button>
      </Box>

      {/* Stat cards */}
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5} sx={{ mb: 3 }}>
        {statCards.map((s) => (
          <Card key={s.label} sx={{ flex: 1, border: `1px solid ${t.border}`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '8px' }}>
            <CardContent sx={{ p: '12px 16px !important' }}>
              <Typography sx={{ fontSize: '.7rem', fontWeight: 600, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: FONT }}>
                {s.label}
              </Typography>
              <Typography sx={{ fontSize: '1.45rem', fontWeight: 800, color: s.color, lineHeight: 1.2, fontFamily: FONT }}>
                {s.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 2.5,
          borderBottom: `1px solid ${t.border}`,
          minHeight: 36,
          '& .MuiTabs-indicator': { bgcolor: dashboardTokens.colors.brandPrimary, height: 2 },
          '& .MuiTab-root': { fontFamily: FONT, fontSize: '.82rem', fontWeight: 600, textTransform: 'none', color: t.textSecondary, minHeight: 36, py: 0, px: 1.5, '&.Mui-selected': { color: dashboardTokens.colors.brandPrimary } },
        }}
      >
        {['Overview', 'Deployments', 'Environments', 'Pipelines', 'Repository', 'Settings'].map((label) => (
          <Tab key={label} label={label} />
        ))}
      </Tabs>

      {/* ── Tab 0: Overview ──────────────────────────────────────── */}
      {tab === 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          {/* Description */}
          <Card sx={{ border: `1px solid ${t.border}`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '10px', gridColumn: { md: '1 / -1' } }}>
            <CardContent sx={{ p: '16px !important' }}>
              <Typography sx={{ fontSize: '.72rem', fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: FONT, mb: 0.75 }}>
                About
              </Typography>
              <Typography sx={{ fontSize: '.875rem', color: t.textPrimary, fontFamily: FONT, lineHeight: 1.6 }}>
                {project.description}
              </Typography>
              <Stack direction="row" gap={0.5} sx={{ mt: 1 }}>
                {project.tags.map((tag) => (
                  <Chip key={tag} label={tag} size="small" sx={{ bgcolor: t.surfaceSubtle, color: t.textSecondary, border: `1px solid ${t.border}`, fontSize: '.7rem', height: 20 }} />
                ))}
              </Stack>
            </CardContent>
          </Card>

          {/* Last Commit */}
          <Card sx={{ border: `1px solid ${t.border}`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '10px' }}>
            <CardContent sx={{ p: '16px !important' }}>
              <Typography sx={{ fontSize: '.72rem', fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: FONT, mb: 1 }}>
                Last Commit
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Box sx={{ width: 30, height: 30, borderRadius: '7px', bgcolor: 'rgba(0,224,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: dashboardTokens.colors.brandPrimary, flexShrink: 0 }}>
                  <GitBranchIcon sx={{ fontSize: '.9rem' }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '.82rem', fontWeight: 600, color: t.textPrimary, fontFamily: FONT }}>
                    {project.lastCommit.message}
                  </Typography>
                  <Typography sx={{ fontSize: '.72rem', color: t.textSecondary, fontFamily: FONT, mt: 0.3 }}>
                    <Box component="span" sx={{ color: dashboardTokens.colors.brandPrimary, fontFamily: 'monospace' }}>{project.lastCommit.hash}</Box>
                    {' · '}{project.lastCommit.author}{' · '}{project.lastCommit.ago}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Members */}
          <Card sx={{ border: `1px solid ${t.border}`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '10px' }}>
            <CardContent sx={{ p: '16px !important' }}>
              <Typography sx={{ fontSize: '.72rem', fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: FONT, mb: 1 }}>
                Team
              </Typography>
              <Stack gap={1}>
                {project.members.map((m, i) => (
                  <Box key={m.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 26, height: 26, fontSize: '.65rem', fontWeight: 700, bgcolor: MEMBER_COLORS[i % MEMBER_COLORS.length], color: '#0a0f1a' }}>{m.initial}</Avatar>
                    <Box>
                      <Typography sx={{ fontSize: '.82rem', fontWeight: 600, color: t.textPrimary, fontFamily: FONT, lineHeight: 1.2 }}>{m.name}</Typography>
                      <Typography sx={{ fontSize: '.7rem', color: t.textSecondary, fontFamily: FONT }}>{m.role}</Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          {/* Build progress */}
          <Card sx={{ border: `1px solid ${t.border}`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '10px', gridColumn: { md: '1 / -1' } }}>
            <CardContent sx={{ p: '16px !important' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontSize: '.72rem', fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: FONT }}>
                  Overall Progress
                </Typography>
                <Typography sx={{ fontSize: '.78rem', fontWeight: 700, color: dashboardSemanticColors.success, fontFamily: FONT }}>{project.progress}%</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={project.progress}
                sx={{
                  height: 6, borderRadius: 3,
                  bgcolor: 'rgba(34,197,94,.12)',
                  '& .MuiLinearProgress-bar': { bgcolor: dashboardSemanticColors.success, borderRadius: 3 },
                }}
              />
            </CardContent>
          </Card>
        </Box>
      )}

      {/* ── Tab 1: Deployments ───────────────────────────────────── */}
      {tab === 1 && (
        <Box>
          <Box sx={{ border: `1px solid ${t.border}`, borderRadius: '10px', overflow: 'hidden' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: t.surfaceSubtle }}>
                  {['Status', 'Environment', 'Trigger', 'Duration', 'When', 'Logs'].map((h) => (
                    <TableCell key={h} sx={{ fontFamily: FONT, fontSize: '.72rem', fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '.06em', borderColor: t.border, py: 1 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {project.deployments.map((d) => {
                  const cfg = STATUS_CONFIG[d.status];
                  return (
                    <TableRow key={d.id} sx={{ '&:hover': { bgcolor: t.surfaceSubtle }, '& td': { borderColor: t.border } }}>
                      <TableCell sx={{ py: 1.25 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: cfg.color }}>
                          {cfg.icon}
                          <Typography sx={{ fontSize: '.8rem', fontWeight: 600, color: cfg.color, fontFamily: FONT }}>{cfg.label}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={d.env} size="small" sx={{ bgcolor: t.surfaceSubtle, color: t.textPrimary, border: `1px solid ${t.border}`, fontSize: '.72rem', height: 20, fontWeight: 600 }} />
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '.78rem', color: t.textSecondary }}>{d.trigger}</TableCell>
                      <TableCell sx={{ fontFamily: FONT, fontSize: '.78rem', color: t.textSecondary }}>{d.duration}</TableCell>
                      <TableCell sx={{ fontFamily: FONT, fontSize: '.78rem', color: t.textSecondary, whiteSpace: 'nowrap' }}>{d.ago}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => { setSelectedDeployment(d.id); setLogOpen(true); }}
                          sx={{ fontSize: '.72rem', fontFamily: FONT, textTransform: 'none', borderColor: t.border, color: t.textSecondary, borderRadius: '6px', py: 0.25, '&:hover': { borderColor: dashboardTokens.colors.brandPrimary, color: dashboardTokens.colors.brandPrimary } }}
                        >
                          View logs
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>

          {/* Log drawer */}
          <Drawer
            anchor="right"
            open={logOpen}
            onClose={() => setLogOpen(false)}
            PaperProps={{ sx: { width: 520, bgcolor: '#0d1117', borderLeft: `1px solid ${t.border}` } }}
          >
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justify: 'space-between', borderBottom: `1px solid ${t.border}` }}>
              <Typography sx={{ fontWeight: 700, color: '#e6edf3', fontFamily: FONT, fontSize: '.9rem', flex: 1 }}>
                Deployment Log · {selectedDeployment}
              </Typography>
              <IconButton size="small" onClick={() => setLogOpen(false)} sx={{ color: '#8b949e' }}>
                <CloseIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
            </Box>
            <Box sx={{ p: 2, fontFamily: 'monospace', fontSize: '.78rem', color: '#e6edf3', lineHeight: 1.8, whiteSpace: 'pre-wrap', overflow: 'auto', flex: 1 }}>
              {MOCK_LOG}
              <Box component="span" sx={{ display: 'inline-block', width: 8, height: '1em', bgcolor: '#00E0FF', animation: 'blink 1s step-end infinite', '@keyframes blink': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0 } } }} />
            </Box>
          </Drawer>
        </Box>
      )}

      {/* ── Tab 2: Environments ──────────────────────────────────── */}
      {tab === 2 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
          {project.environments.map((env) => {
            const cfg = ENV_STATUS_CONFIG[env.status];
            return (
              <Card key={env.name} sx={{ border: `1px solid ${t.border}`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '10px', '&:hover': { borderColor: dashboardTokens.colors.brandPrimary + '55' } }}>
                <CardContent sx={{ p: '16px !important' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '.9rem', color: t.textPrimary, fontFamily: FONT }}>{env.name}</Typography>
                    <Chip label={cfg.label} size="small" sx={{ bgcolor: `${cfg.color}18`, color: cfg.color, fontWeight: 700, fontSize: '.7rem', height: 20 }} />
                  </Box>
                  <Typography
                    component="a"
                    href={`https://${env.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ fontSize: '.78rem', color: dashboardTokens.colors.brandPrimary, fontFamily: FONT, textDecoration: 'none', display: 'block', mb: 0.75, '&:hover': { textDecoration: 'underline' } }}
                  >
                    {env.domain}
                  </Typography>
                  <Divider sx={{ borderColor: t.border, mb: 0.75 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography sx={{ fontSize: '.68rem', color: t.textSecondary, fontFamily: FONT }}>Branch</Typography>
                      <Typography sx={{ fontSize: '.78rem', fontWeight: 600, color: t.textPrimary, fontFamily: FONT }}>{env.branch}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ fontSize: '.68rem', color: t.textSecondary, fontFamily: FONT }}>Last Deploy</Typography>
                      <Typography sx={{ fontSize: '.78rem', fontWeight: 600, color: t.textPrimary, fontFamily: FONT }}>{env.lastDeploy}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* ── Tab 3: Pipelines ─────────────────────────────────────── */}
      {tab === 3 && (
        <Box>
          <Card sx={{ border: `1px solid ${t.border}`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '10px', mb: 2 }}>
            <CardContent sx={{ p: '20px !important' }}>
              <Typography sx={{ fontSize: '.72rem', fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: FONT, mb: 2 }}>
                Latest Run · main · {project.lastCommit.hash} · {project.lastCommit.ago}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto' }}>
                {PIPELINE_STAGES.map((stage, idx) => {
                  const cfg = STAGE_STATUS_CONFIG[stage.status];
                  return (
                    <React.Fragment key={stage.label}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, minWidth: 80 }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: '50%', border: `2px solid ${cfg.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.color, bgcolor: `${cfg.color}12` }}>
                          {cfg.icon}
                        </Box>
                        <Typography sx={{ fontSize: '.72rem', fontWeight: 700, color: t.textPrimary, fontFamily: FONT }}>{stage.label}</Typography>
                        <Typography sx={{ fontSize: '.68rem', color: t.textSecondary, fontFamily: FONT }}>{stage.duration}</Typography>
                      </Box>
                      {idx < PIPELINE_STAGES.length - 1 && (
                        <Box sx={{ flex: 1, height: 2, bgcolor: idx < PIPELINE_STAGES.length - 2 ? dashboardSemanticColors.success : t.border, mx: 0.5, minWidth: 20 }} />
                      )}
                    </React.Fragment>
                  );
                })}
              </Box>
            </CardContent>
          </Card>

          {/* Stage detail list */}
          <Box sx={{ border: `1px solid ${t.border}`, borderRadius: '10px', overflow: 'hidden' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: t.surfaceSubtle }}>
                  {['Stage', 'Status', 'Duration'].map((h) => (
                    <TableCell key={h} sx={{ fontFamily: FONT, fontSize: '.72rem', fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '.06em', borderColor: t.border, py: 1 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {PIPELINE_STAGES.map((stage) => {
                  const cfg = STAGE_STATUS_CONFIG[stage.status];
                  return (
                    <TableRow key={stage.label} sx={{ '& td': { borderColor: t.border } }}>
                      <TableCell sx={{ fontFamily: FONT, fontSize: '.82rem', fontWeight: 600, color: t.textPrimary, py: 1.25 }}>{stage.label}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, color: cfg.color }}>
                          {cfg.icon}
                          <Typography sx={{ fontSize: '.78rem', fontWeight: 600, color: cfg.color, fontFamily: FONT, textTransform: 'capitalize' }}>{stage.status}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontFamily: FONT, fontSize: '.78rem', color: t.textSecondary }}>{stage.duration}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        </Box>
      )}

      {/* ── Tab 4: Repository ────────────────────────────────────── */}
      {tab === 4 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Card sx={{ border: `1px solid ${t.border}`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '10px' }}>
            <CardContent sx={{ p: '16px !important' }}>
              <Typography sx={{ fontSize: '.72rem', fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: FONT, mb: 1 }}>
                Connection
              </Typography>
              {[
                { label: 'Provider',        value: 'GitHub' },
                { label: 'Repository',      value: project.repoUrl.replace('https://github.com/', '') },
                { label: 'Default Branch',  value: project.defaultBranch },
                { label: 'Last Commit',     value: project.lastCommit.hash },
                { label: 'Framework',       value: project.framework },
              ].map(({ label, value }) => (
                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, borderBottom: `1px solid ${t.border}` }}>
                  <Typography sx={{ fontSize: '.78rem', color: t.textSecondary, fontFamily: FONT }}>{label}</Typography>
                  <Typography sx={{ fontSize: '.78rem', fontWeight: 600, color: t.textPrimary, fontFamily: FONT, fontFamily2: 'monospace' }}>{value}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>

          <Card sx={{ border: `1px solid ${t.border}`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '10px' }}>
            <CardContent sx={{ p: '16px !important' }}>
              <Typography sx={{ fontSize: '.72rem', fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: FONT, mb: 1 }}>
                Build Configuration
              </Typography>
              {[
                { label: 'Install',    value: project.installCmd },
                { label: 'Build',      value: project.buildCmd   },
                { label: 'Output Dir', value: project.outputDir  },
              ].map(({ label, value }) => (
                <Box key={label} sx={{ mb: 1.25 }}>
                  <Typography sx={{ fontSize: '.7rem', color: t.textSecondary, fontFamily: FONT, mb: 0.3 }}>{label}</Typography>
                  <Box sx={{ bgcolor: t.surfaceSubtle, border: `1px solid ${t.border}`, borderRadius: '6px', px: 1.25, py: 0.75 }}>
                    <Typography sx={{ fontFamily: 'monospace', fontSize: '.78rem', color: dashboardTokens.colors.brandPrimary }}>{value}</Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Box>
      )}

      {/* ── Tab 5: Settings ──────────────────────────────────────── */}
      {tab === 5 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          {/* Environment Variables */}
          <Card sx={{ border: `1px solid ${t.border}`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '10px', gridColumn: { md: '1 / -1' } }}>
            <CardContent sx={{ p: '16px !important' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography sx={{ fontSize: '.72rem', fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: FONT }}>
                  Environment Variables
                </Typography>
                <Button size="small" startIcon={<TuneIcon sx={{ fontSize: '.85rem' }} />} sx={{ fontSize: '.72rem', fontFamily: FONT, textTransform: 'none', color: dashboardTokens.colors.brandPrimary, borderRadius: '6px' }}>
                  Edit
                </Button>
              </Box>
              <Box sx={{ border: `1px solid ${t.border}`, borderRadius: '8px', overflow: 'hidden' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: t.surfaceSubtle }}>
                      {['Key', 'Value', 'Secret'].map((h) => (
                        <TableCell key={h} sx={{ fontFamily: FONT, fontSize: '.72rem', fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase', borderColor: t.border, py: 0.75 }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {project.envVars.map((ev) => (
                      <TableRow key={ev.key} sx={{ '& td': { borderColor: t.border } }}>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '.78rem', color: dashboardTokens.colors.brandPrimary, py: 1 }}>{ev.key}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '.78rem', color: t.textPrimary }}>{ev.value}</TableCell>
                        <TableCell>
                          <Chip
                            label={ev.secret ? 'Secret' : 'Plain'}
                            size="small"
                            sx={{ bgcolor: ev.secret ? 'rgba(239,68,68,.1)' : t.surfaceSubtle, color: ev.secret ? dashboardSemanticColors.danger : t.textSecondary, fontSize: '.68rem', height: 18 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </CardContent>
          </Card>

          {/* Danger zone */}
          <Card sx={{ border: `1px solid ${dashboardSemanticColors.danger}33`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '10px', gridColumn: { md: '1 / -1' } }}>
            <CardContent sx={{ p: '16px !important' }}>
              <Typography sx={{ fontSize: '.72rem', fontWeight: 700, color: dashboardSemanticColors.danger, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: FONT, mb: 1.5 }}>
                Danger Zone
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
                <Button variant="outlined" size="small" sx={{ fontFamily: FONT, textTransform: 'none', fontSize: '.78rem', borderColor: `${dashboardSemanticColors.danger}55`, color: dashboardSemanticColors.danger, borderRadius: '7px', '&:hover': { borderColor: dashboardSemanticColors.danger, bgcolor: `${dashboardSemanticColors.danger}0a` } }}>
                  Archive Project
                </Button>
                <Button variant="outlined" size="small" sx={{ fontFamily: FONT, textTransform: 'none', fontSize: '.78rem', borderColor: `${dashboardSemanticColors.danger}55`, color: dashboardSemanticColors.danger, borderRadius: '7px', '&:hover': { borderColor: dashboardSemanticColors.danger, bgcolor: `${dashboardSemanticColors.danger}0a` } }}>
                  Delete Project
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      )}

    </Box>
  );
};

export default DevProjectDetailPage;
