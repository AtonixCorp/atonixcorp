import React, { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import {
  ArrowRight as ArrowRightIcon,
  Cloud as CloudIcon,
  Storage as StorageIcon,
  Lan as LanIcon,
  AutoAwesome as AutoAwesomeIcon,
  Memory as MemoryIcon,
  Security as SecurityIcon,
  Public as PublicIcon,
  Insights as InsightsIcon,
  Workspaces as WorkspacesIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import LoginDialog from '../components/Auth/LoginDialog';
import SignupDialog from '../components/Auth/SignupDialog';
import {
  dashboardSemanticColors,
  dashboardTokens,
  computeUiTokens,
} from '../styles/dashboardDesignSystem';

const RADIUS = '2px';
const SPEED = '120ms cubic-bezier(0.4, 0, 0.2, 1)';

const COLORS = {
  navy: computeUiTokens.neutralStrong,
  blue: '#153d75',
  blueHover: '#0f2d5a',
  white: dashboardTokens.colors.white,
  graphite: dashboardTokens.colors.textPrimary,
  silver: dashboardTokens.colors.border,
  slate: dashboardTokens.colors.textSecondary,
  cyan: dashboardSemanticColors.cyan,
  success: dashboardSemanticColors.success,
};

const pillars = [
  {
    title: 'Compute',
    text: 'Elastic virtual compute, bare metal tiers, and GPU capacity for high-throughput workloads.',
    icon: <CloudIcon sx={{ fontSize: 24 }} aria-label="Compute pillar icon" />,
  },
  {
    title: 'Storage',
    text: 'Object, block, and file services with policy-driven lifecycle, replication, and durability.',
    icon: <StorageIcon sx={{ fontSize: 24 }} aria-label="Storage pillar icon" />,
  },
  {
    title: 'Networking',
    text: 'Private networking, global ingress, load balancing, and deterministic traffic control.',
    icon: <LanIcon sx={{ fontSize: 24 }} aria-label="Networking pillar icon" />,
  },
  {
    title: 'AI & Automation',
    text: 'Predictive scaling, anomaly detection, and orchestration for continuous optimization.',
    icon: <AutoAwesomeIcon sx={{ fontSize: 24 }} aria-label="Automation pillar icon" />,
  },
];

const features = [
  'Sovereign tenancy and policy controls',
  'Kubernetes-native service topology',
  'GPU and high-memory compute pools',
  'S3-compatible object storage APIs',
  'Zero-trust identity and RBAC',
  'Global observability and incident workflows',
];

const industries = [
  'Financial Services',
  'Public Sector',
  'Telecommunications',
  'Healthcare & Life Sciences',
];

const stack = [
  { title: 'Control Plane', items: ['API-first', 'RBAC', 'Audit Logs', 'Policy Engine'] },
  { title: 'Compute Layer', items: ['VMs', 'Kubernetes', 'GPU Nodes', 'Auto Scaling'] },
  { title: 'Data Layer', items: ['Object Storage', 'Block Storage', 'Managed Databases', 'Backups'] },
  { title: 'Edge & Network', items: ['VPC', 'L4/L7 Balancers', 'CDN', 'DDoS Protection'] },
];

const caseStudies = [
  {
    org: 'Continental Payments Group',
    result: '38% latency reduction across regional payment APIs.',
  },
  {
    org: 'Northern Grid Utility',
    result: '99.99% uptime with policy-based failover across two regions.',
  },
  {
    org: 'Apex Retail Systems',
    result: '2.7x faster analytics workloads on GPU-backed clusters.',
  },
];

const infraRegions = ['Johannesburg', 'Frankfurt', 'Singapore', 'New York', 'São Paulo', 'Sydney'];

const sectionTitleSx = {
  fontWeight: 600,
  lineHeight: { xs: 1.13, md: 1.08 },
  letterSpacing: { xs: '-0.4px', md: '-0.7px' },
  fontSize: { xs: '1.9rem', sm: '2.15rem', md: '2.5rem' },
  color: COLORS.graphite,
};

const sectionSubSx = {
  fontWeight: 400,
  fontSize: { xs: '1rem', md: '1.125rem' },
  lineHeight: { xs: 1.42, md: 1.4 },
  letterSpacing: '-0.1px',
  color: COLORS.slate,
  maxWidth: 760,
};

const cardSx = {
  border: `1px solid ${COLORS.silver}`,
  borderRadius: RADIUS,
  bgcolor: COLORS.white,
  p: 3,
  transition: `border-color ${SPEED}, color ${SPEED}, transform ${SPEED}`,
  '&:hover': {
    borderColor: COLORS.blue,
    transform: 'translateY(-1px)',
  },
};

const Homepage: React.FC = () => {
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  return (
    <Box sx={{ bgcolor: COLORS.white }}>
      <Box
        id="hero"
        sx={{
          bgcolor: COLORS.navy,
          color: COLORS.white,
          borderBottom: `1px solid ${COLORS.silver}`,
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' },
              gap: { xs: 3, md: 5 },
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography
                component="h1"
                sx={{
                  fontWeight: 600,
                  lineHeight: { xs: 1.12, sm: 1.1, md: 1.08 },
                  letterSpacing: { xs: '-0.5px', md: '-1px' },
                  fontSize: { xs: '2.35rem', sm: '2.9rem', md: '3.85rem' },
                  maxWidth: 620,
                  color: COLORS.white,
                }}
              >
                Sovereign Cloud Infrastructure for Enterprise-Grade Scale
              </Typography>
              <Typography
                sx={{
                  mt: 2,
                  fontWeight: 400,
                  fontSize: { xs: '1.02rem', md: '1.22rem' },
                  lineHeight: { xs: 1.42, md: 1.4 },
                  letterSpacing: '-0.1px',
                  maxWidth: 540,
                  color: COLORS.white,
                }}
              >
                AtonixCorp unifies compute, storage, networking, and AI automation into a
                high-performance control plane designed for regulated, global workloads.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  endIcon={<ArrowRightIcon />}
                  onClick={() => setSignupOpen(true)}
                  aria-label="Get started with AtonixCorp"
                  sx={{
                    bgcolor: COLORS.blue,
                    color: COLORS.white,
                    borderRadius: RADIUS,
                    py: 1.5,
                    px: 3,
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': { bgcolor: COLORS.blueHover },
                  }}
                >
                  Get Started
                </Button>
              </Stack>
            </Box>

            <Box sx={{ border: '1px solid rgba(255,255,255,.16)', borderRadius: RADIUS, p: 3 }}>
              <Typography sx={{ fontSize: '.75rem', fontWeight: 500, letterSpacing: '.08em', color: COLORS.white }}>
                GLOBAL CONTROL PLANE
              </Typography>
              <Divider sx={{ borderColor: 'rgba(255,255,255,.16)', my: 2 }} />
              <Stack spacing={2}>
                {[
                  { icon: <MemoryIcon sx={{ color: COLORS.cyan, fontSize: 18 }} />, text: 'Compute orchestration across sovereign zones' },
                  { icon: <SecurityIcon sx={{ color: COLORS.cyan, fontSize: 18 }} />, text: 'Policy-enforced zero-trust access controls' },
                  { icon: <PublicIcon sx={{ color: COLORS.cyan, fontSize: 18 }} />, text: 'Multi-region failover and traffic governance' },
                  { icon: <InsightsIcon sx={{ color: COLORS.cyan, fontSize: 18 }} />, text: 'Real-time telemetry and predictive operations' },
                ].map((row) => (
                  <Stack key={row.text} direction="row" spacing={1.5} alignItems="center">
                    {row.icon}
                    <Typography sx={{ fontSize: '.94rem', lineHeight: 1.4, letterSpacing: '-0.05px', color: COLORS.white }}>{row.text}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 7, md: 10 } }}>
        <Typography component="h2" sx={sectionTitleSx}>Product Pillars</Typography>
        <Typography sx={{ ...sectionSubSx, mt: 1.5, mb: 4 }}>
          The AtonixCorp platform is engineered as a cohesive infrastructure fabric with
          deterministic operations, strict governance, and developer-grade velocity.
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4,1fr)' }, gap: 2 }}>
          {pillars.map((pillar) => (
            <Box key={pillar.title} sx={cardSx}>
              <Box sx={{ color: COLORS.blue }}>{pillar.icon}</Box>
              <Typography component="h3" sx={{ mt: 1.5, fontWeight: 600, fontSize: { xs: '1.02rem', md: '1.06rem' }, lineHeight: 1.16, letterSpacing: '-0.2px' }}>
                {pillar.title}
              </Typography>
              <Typography sx={{ mt: 1, fontSize: '.94rem', lineHeight: 1.4, letterSpacing: '-0.05px', color: COLORS.slate }}>
                {pillar.text}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>

      <Box sx={{ bgcolor: dashboardTokens.colors.surfaceSubtle, borderTop: `1px solid ${COLORS.silver}`, borderBottom: `1px solid ${COLORS.silver}` }}>
        <Container maxWidth="lg" sx={{ py: { xs: 7, md: 9 } }}>
          <Typography component="h2" sx={sectionTitleSx}>Feature Grid</Typography>
          <Box sx={{ mt: 4, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
            {features.map((feature) => (
              <Box key={feature} sx={{ ...cardSx, p: 2 }}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <CheckCircleIcon sx={{ color: COLORS.success, fontSize: 18 }} aria-label="Feature check" />
                  <Typography sx={{ fontSize: '.94rem', lineHeight: 1.38, letterSpacing: '-0.05px' }}>{feature}</Typography>
                </Stack>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 7, md: 10 } }}>
        <Typography component="h2" sx={sectionTitleSx}>Industry Solutions</Typography>
        <Typography sx={{ ...sectionSubSx, mt: 1.5, mb: 4 }}>
          Built for regulated, mission-critical environments where reliability, compliance,
          and performance are non-negotiable.
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4,1fr)' }, gap: 2 }}>
          {industries.map((industry) => (
            <Box key={industry} sx={{ ...cardSx, p: 2.5 }}>
              <Typography sx={{ fontWeight: 600, fontSize: '.98rem', lineHeight: 1.22, letterSpacing: '-0.15px' }}>{industry}</Typography>
            </Box>
          ))}
        </Box>
      </Container>

      <Box sx={{ bgcolor: COLORS.navy, color: COLORS.white, borderTop: `1px solid ${COLORS.silver}`, borderBottom: `1px solid ${COLORS.silver}` }}>
        <Container maxWidth="lg" sx={{ py: { xs: 7, md: 9 } }}>
          <Typography component="h2" sx={{ ...sectionTitleSx, color: COLORS.white }}>Technology Stack</Typography>
          <Box sx={{ mt: 4, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4,1fr)' }, gap: 2 }}>
            {stack.map((layer) => (
              <Box key={layer.title} sx={{ border: '1px solid rgba(255,255,255,.18)', borderRadius: RADIUS, p: 2.5 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <WorkspacesIcon sx={{ fontSize: 18, color: COLORS.cyan }} aria-label="Stack layer icon" />
                  <Typography sx={{ fontWeight: 600, fontSize: '.98rem', lineHeight: 1.2, letterSpacing: '-0.15px' }}>{layer.title}</Typography>
                </Stack>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 2 }}>
                  {layer.items.map((item) => (
                    <Chip
                      key={item}
                      label={item}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255,255,255,.08)',
                        color: COLORS.white,
                        borderRadius: RADIUS,
                        border: '1px solid rgba(255,255,255,.2)',
                        fontSize: '.7rem',
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 7, md: 10 } }}>
        <Typography component="h2" sx={sectionTitleSx}>Case Studies</Typography>
        <Box sx={{ mt: 4, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3,1fr)' }, gap: 2 }}>
          {caseStudies.map((item) => (
            <Box key={item.org} sx={cardSx}>
              <Typography sx={{ fontWeight: 600, fontSize: '.98rem', lineHeight: 1.2, letterSpacing: '-0.15px' }}>{item.org}</Typography>
              <Typography sx={{ mt: 1.5, fontSize: '.94rem', lineHeight: 1.4, letterSpacing: '-0.05px', color: COLORS.slate }}>{item.result}</Typography>
            </Box>
          ))}
        </Box>
      </Container>

      <Box sx={{ bgcolor: dashboardTokens.colors.surfaceSubtle, borderTop: `1px solid ${COLORS.silver}`, borderBottom: `1px solid ${COLORS.silver}` }}>
        <Container maxWidth="lg" sx={{ py: { xs: 7, md: 9 } }}>
          <Typography component="h2" sx={sectionTitleSx}>Global Infrastructure Map</Typography>
          <Typography sx={{ ...sectionSubSx, mt: 1.5, mb: 4 }}>
            Strategically distributed cloud regions for low latency, resilience, and sovereign
            deployment requirements.
          </Typography>
          <Box sx={{ border: `1px solid ${COLORS.silver}`, borderRadius: RADIUS, p: 3, bgcolor: COLORS.white }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(6,1fr)' }, gap: 1.5 }}>
              {infraRegions.map((region) => (
                <Box key={region} sx={{ border: `1px solid ${COLORS.silver}`, borderRadius: RADIUS, p: 1.5, textAlign: 'center' }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '.84rem', lineHeight: 1.2, letterSpacing: '-0.1px' }}>{region}</Typography>
                </Box>
              ))}
            </Box>
            <Typography sx={{ mt: 2, fontSize: '.84rem', lineHeight: 1.4, letterSpacing: '-0.05px', color: COLORS.slate }}>
              Multi-region availability · 99.99% uptime target · Enterprise SLA-backed operations
            </Typography>
          </Box>
        </Container>
      </Box>

      <Box component="footer" sx={{ bgcolor: COLORS.navy, color: COLORS.white, py: 5 }}>
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
          >
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: { xs: '.98rem', md: '1rem' }, lineHeight: 1.2, letterSpacing: '-0.3px' }}>
                AtonixCorp — Sovereign Cloud Infrastructure
              </Typography>
              <Typography sx={{ mt: 0.5, fontSize: '.88rem', lineHeight: 1.38, letterSpacing: '-0.05px', color: 'rgba(255,255,255,.72)' }}>
                Clean architecture. Enterprise reliability. Global scale.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5}>
              <Button sx={{ color: COLORS.white, textTransform: 'none' }} aria-label="Open platform documentation">Docs</Button>
              <Button sx={{ color: COLORS.white, textTransform: 'none' }} aria-label="Open security documentation">Security</Button>
              <Button sx={{ color: COLORS.white, textTransform: 'none' }} aria-label="Open contact page">Contact</Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <LoginDialog
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToSignup={() => {
          setLoginOpen(false);
          setSignupOpen(true);
        }}
      />
      <SignupDialog
        open={signupOpen}
        onClose={() => setSignupOpen(false)}
        onSwitchToLogin={() => {
          setSignupOpen(false);
          setLoginOpen(true);
        }}
      />
    </Box>
  );
};

export default Homepage;
