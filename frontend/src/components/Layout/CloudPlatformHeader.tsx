import React, { useMemo, useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  Fade,
  IconButton,
  InputBase,
  List,
  ListItemButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LanguageIcon from '@mui/icons-material/Language';
import PublicIcon from '@mui/icons-material/Public';
import SearchIcon from '@mui/icons-material/Search';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginDialog from '../Auth/LoginDialog';
import SignupDialog from '../Auth/SignupDialog';
import { useAuth } from '../../contexts/AuthContext';


type MegaLink = {
  label: string;
  path: string;
};

type MegaColumn = {
  title: string;
  links: MegaLink[];
};

type MegaCategory = {
  key: string;
  label: string;
  columns: MegaColumn[];
};

const IMPERIAL_MIDNIGHT = '#0A0F1F';
const QUANTUM_CYAN = '#276fd3';
const CLOUD_SILVER = '#E5E7EB';
const WHITE = '#FFFFFF';

const utilityLinks = [
  { label: 'Developer', path: '/developer' },
  { label: 'Support', path: '/support' },
  { label: 'Resources', path: '/resources' },
  { label: 'Documentation', path: '/docs' },
  { label: 'Contact Sales', path: '/contact' },
];

const categories: MegaCategory[] = [
  {
    key: 'bare-metal-vps',
    label: 'Bare Metal & VPS',
    columns: [
      {
        title: 'Bare Metal Servers',
        links: [
          { label: 'High-Performance Compute', path: '/bare-metal-vps/high-performance-compute' },
          { label: 'GPU-Accelerated Servers', path: '/bare-metal-vps/gpu-accelerated-servers' },
          { label: 'Storage-Optimized Servers', path: '/bare-metal-vps/storage-optimized-servers' },
          { label: 'Network-Optimized Servers', path: '/bare-metal-vps/network-optimized-servers' },
          { label: 'Dedicated AI Nodes', path: '/bare-metal-vps/dedicated-ai-nodes' },
        ],
      },
      {
        title: 'VPS',
        links: [
          { label: 'General Purpose VPS', path: '/bare-metal-vps/general-purpose-vps' },
          { label: 'Compute-Optimized VPS', path: '/bare-metal-vps/compute-optimized-vps' },
          { label: 'Memory-Optimized VPS', path: '/bare-metal-vps/memory-optimized-vps' },
          { label: 'GPU VPS', path: '/bare-metal-vps/gpu-vps' },
          { label: 'Container-Ready VPS', path: '/bare-metal-vps/container-ready-vps' },
        ],
      },
      {
        title: 'Quick Access',
        links: [
          { label: 'Compare Server Types', path: '/bare-metal-vps/compare-server-types' },
          { label: 'Pricing', path: '/bare-metal-vps/pricing' },
          { label: 'Availability by Region', path: '/bare-metal-vps/availability-by-region' },
          { label: 'Documentation', path: '/bare-metal-vps/documentation' },
        ],
      },
    ],
  },
  {
    key: 'public-cloud',
    label: 'Public Cloud',
    columns: [
      {
        title: 'Compute',
        links: [
          { label: 'Virtual Machines', path: '/features' },
          { label: 'Serverless Functions', path: '/features' },
          { label: 'Kubernetes', path: '/features' },
          { label: 'GPU Instances', path: '/features' },
        ],
      },
      {
        title: 'Storage',
        links: [
          { label: 'Object Storage', path: '/features' },
          { label: 'Block Storage', path: '/features' },
          { label: 'File Storage', path: '/features' },
          { label: 'Backup & Snapshots', path: '/features' },
        ],
      },
      {
        title: 'Networking',
        links: [
          { label: 'Load Balancers', path: '/features' },
          { label: 'Global CDN', path: '/features' },
          { label: 'VPC', path: '/features' },
          { label: 'Floating IPs', path: '/features' },
        ],
      },
      {
        title: 'Quick Access',
        links: [
          { label: 'Pricing', path: '/features' },
          { label: 'Free Trial', path: '/features' },
          { label: 'Documentation', path: '/docs' },
          { label: 'Compliance', path: '/docs' },
        ],
      },
    ],
  },
  {
    key: 'private-cloud',
    label: 'Private Cloud',
    columns: [
      {
        title: 'Hosted Private Cloud',
        links: [
          { label: 'VMware on AtonixCorp', path: '/features' },
          { label: 'OpenStack Private Cloud', path: '/features' },
          { label: 'Hyper-Converged Infrastructure', path: '/features' },
        ],
      },
      {
        title: 'Security',
        links: [
          { label: 'Identity & Access', path: '/docs' },
          { label: 'Encryption', path: '/docs' },
          { label: 'Compliance', path: '/docs' },
        ],
      },
      {
        title: 'Migration',
        links: [
          { label: 'Datacenter Extension', path: '/features' },
          { label: 'Hybrid Cloud', path: '/features' },
          { label: 'Disaster Recovery', path: '/features' },
        ],
      },
    ],
  },
  {
    key: 'enterprise',
    label: 'Enterprise',
    columns: [
      {
        title: 'Solutions',
        links: [
          { label: 'Government Cloud', path: '/features' },
          { label: 'Banking & Finance', path: '/features' },
          { label: 'Telecom & ISP', path: '/features' },
          { label: 'Oil & Gas', path: '/features' },
          { label: 'Healthcare', path: '/features' },
        ],
      },
      {
        title: 'Services',
        links: [
          { label: 'Managed Cloud', path: '/features' },
          { label: 'Professional Services', path: '/features' },
          { label: 'Architecture Consulting', path: '/features' },
        ],
      },
      {
        title: 'Quick Access',
        links: [
          { label: 'Certifications', path: '/docs' },
          { label: 'Case Studies', path: '/resources' },
          { label: 'Enterprise Support', path: '/support' },
        ],
      },
    ],
  },
  {
    key: 'ecosystem',
    label: 'Ecosystem',
    columns: [
      {
        title: 'Partner Program',
        links: [
          { label: 'Resellers', path: '/about' },
          { label: 'Integrators', path: '/about' },
          { label: 'Consultants', path: '/about' },
        ],
      },
      {
        title: 'Startup Program',
        links: [
          { label: 'Startup Credits', path: '/about' },
          { label: 'Scaleup Support', path: '/about' },
          { label: 'Mentorship', path: '/about' },
        ],
      },
      {
        title: 'Quick Access',
        links: [
          { label: 'Join Partner Program', path: '/contact' },
          { label: 'Join Startup Program', path: '/contact' },
        ],
      },
    ],
  },
  {
    key: 'domains',
    label: 'Domains',
    columns: [
      {
        title: 'Domain Services',
        links: [
          { label: 'Domain Registration', path: '/domains' },
          { label: 'DNS Management', path: '/domains' },
          { label: 'WHOIS Privacy', path: '/domains' },
          { label: 'Domain Transfer', path: '/domains' },
        ],
      },
      {
        title: 'Web Hosting',
        links: [
          { label: 'Shared Hosting', path: '/features' },
          { label: 'WordPress Hosting', path: '/features' },
          { label: 'Email Hosting', path: '/features' },
        ],
      },
    ],
  },
  {
    key: 'email-host',
    label: 'Email Host',
    columns: [
      {
        title: 'Email Hosting',
        links: [
          { label: 'Business Email Hosting', path: '/domains' },
          { label: 'Custom Domain Mailboxes', path: '/domains' },
          { label: 'DNS & MX Configuration', path: '/domains' },
          { label: 'Migration & Transfer', path: '/domains' },
        ],
      },
      {
        title: 'Quick Access',
        links: [
          { label: 'Email Hosting Plans', path: '/domains' },
          { label: 'Setup Documentation', path: '/docs' },
          { label: 'Contact Sales', path: '/contact' },
        ],
      },
    ],
  },
  {
    key: 'about',
    label: 'About',
    columns: [
      {
        title: 'Company',
        links: [
          { label: 'Company Overview', path: '/about' },
          { label: 'Leadership Team', path: '/about' },
          { label: 'Careers', path: '/about' },
          { label: 'Press', path: '/about' },
        ],
      },
      {
        title: 'Infrastructure',
        links: [
          { label: 'Global Datacenters', path: '/about' },
          { label: 'Backbone Network', path: '/about' },
          { label: 'Local Zones', path: '/about' },
        ],
      },
      {
        title: 'Legal',
        links: [
          { label: 'Privacy Policy', path: '/docs' },
          { label: 'Compliance', path: '/docs' },
          { label: 'Terms of Service', path: '/docs' },
        ],
      },
    ],
  },
];

const languageOptions = ['EN', 'FR', 'PT', 'AR'];
const regionOptions = ['Global', 'US-East', 'EU-West', 'Africa-1', 'Asia-1'];

const CloudPlatformHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMega, setOpenMega] = useState<string | null>(null);

  const [lang, setLang] = useState('EN');
  const [region, setRegion] = useState('Global');
  const [langAnchor, setLangAnchor] = useState<null | HTMLElement>(null);
  const [regionAnchor, setRegionAnchor] = useState<null | HTMLElement>(null);
  const [accountAnchor, setAccountAnchor] = useState<null | HTMLElement>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | false>(false);

  const selectedMega = useMemo(
    () => categories.find((category) => category.key === openMega) || null,
    [openMega]
  );

  const go = (path: string) => {
    navigate(path);
    setOpenMega(null);
    setMobileOpen(false);
  };

  const openCategory = (key: string) => {
    if (isMobile) {
      return;
    }
    setOpenMega(key);
  };

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: (muiTheme) => muiTheme.zIndex.appBar + 2,
        borderBottom: `1px solid ${CLOUD_SILVER}`,
        fontFamily: 'Inter, sans-serif',
      }}
      onMouseLeave={() => {
        if (!isMobile) {
          setOpenMega(null);
        }
      }}
    >
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: IMPERIAL_MIDNIGHT,
          color: CLOUD_SILVER,
          height: 38,
          justifyContent: 'center',
          borderRadius: 0,
          boxShadow: 'none',
          borderBottom: `1px solid ${CLOUD_SILVER}`,
        }}
      >
        <Container maxWidth="xl" sx={{ height: '100%' }}>
          <Toolbar disableGutters sx={{ minHeight: '38px !important', height: '100%' }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
              <Button
                onClick={() => go('/')}
                sx={{
                  minWidth: 0,
                  p: 0,
                  color: CLOUD_SILVER,
                  fontSize: 14,
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': { color: QUANTUM_CYAN, bgcolor: 'transparent' },
                }}
              >
                ATONIXCORP
              </Button>

              <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(229,231,235,.32)' }} />

              <Button
                onClick={(event) => setLangAnchor(event.currentTarget)}
                startIcon={<LanguageIcon sx={{ fontSize: 16 }} />}
                endIcon={<ExpandMoreIcon sx={{ fontSize: 16 }} />}
                sx={{
                  color: CLOUD_SILVER,
                  fontSize: 14,
                  fontWeight: 500,
                  textTransform: 'none',
                  px: 1,
                  minWidth: 0,
                  '&:hover': { color: QUANTUM_CYAN, bgcolor: 'transparent' },
                }}
              >
                {lang}
              </Button>

              <Button
                onClick={(event) => setRegionAnchor(event.currentTarget)}
                startIcon={<PublicIcon sx={{ fontSize: 16 }} />}
                endIcon={<ExpandMoreIcon sx={{ fontSize: 16 }} />}
                sx={{
                  color: CLOUD_SILVER,
                  fontSize: 14,
                  fontWeight: 500,
                  textTransform: 'none',
                  px: 1,
                  minWidth: 0,
                  '&:hover': { color: QUANTUM_CYAN, bgcolor: 'transparent' },
                }}
              >
                {region}
              </Button>
            </Stack>

            {!isMobile && (
              <Stack direction="row" spacing={0.25} alignItems="center">
                {utilityLinks.map((item) => (
                  <Button
                    key={item.label}
                    onClick={() => go(item.path)}
                    sx={{
                      color: CLOUD_SILVER,
                      fontSize: 14,
                      fontWeight: 500,
                      textTransform: 'none',
                      minWidth: 0,
                      px: 1.1,
                      '&:hover': { color: QUANTUM_CYAN, bgcolor: 'transparent' },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}

                <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: 'rgba(229,231,235,.32)' }} />

                {!user && (
                  <>
                    <Button
                      onClick={() => setSignupOpen(true)}
                      variant="contained"
                      sx={{
                        ml: 0.8,
                        height: 28,
                        borderRadius: 0,
                        boxShadow: 'none',
                        bgcolor: QUANTUM_CYAN,
                        color: IMPERIAL_MIDNIGHT,
                        textTransform: 'none',
                        fontSize: 14,
                        fontWeight: 600,
                        '&:hover': { bgcolor: '#1e5daa', boxShadow: 'none' },
                      }}
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </Stack>
            )}

            {isMobile && (
              <IconButton
                onClick={() => setMobileOpen(true)}
                sx={{ color: CLOUD_SILVER, ml: 1 }}
                aria-label="Open navigation"
              >
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: WHITE,
          color: IMPERIAL_MIDNIGHT,
          borderRadius: 0,
          boxShadow: 'none',
          borderBottom: `1px solid ${CLOUD_SILVER}`,
          height: 64,
          justifyContent: 'center',
        }}
      >
        <Container maxWidth="xl" sx={{ height: '100%' }}>
          <Toolbar disableGutters sx={{ minHeight: '64px !important', height: '100%' }}>
            {!isMobile && (
              <Stack direction="row" spacing={0} alignItems="center" sx={{ flex: 1 }}>
                {categories.map((category) => {
                  const active = openMega === category.key;
                  return (
                    <Button
                      key={category.key}
                      onMouseEnter={() => openCategory(category.key)}
                      onFocus={() => openCategory(category.key)}
                      onClick={() => setOpenMega((prev) => (prev === category.key ? null : category.key))}
                      sx={{
                        color: IMPERIAL_MIDNIGHT,
                        fontSize: 15,
                        fontWeight: 600,
                        textTransform: 'none',
                        px: 2,
                        mx: 0.5,
                        minWidth: 'fit-content',
                        height: 64,
                        borderRadius: 0,
                        borderBottom: active ? `2px solid ${QUANTUM_CYAN}` : '2px solid transparent',
                        '&:hover': {
                          color: QUANTUM_CYAN,
                          bgcolor: 'transparent',
                          borderBottom: `2px solid ${QUANTUM_CYAN}`,
                        },
                      }}
                      aria-expanded={active}
                      aria-haspopup="true"
                    >
                      {category.label}
                    </Button>
                  );
                })}
              </Stack>
            )}

            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ ml: 'auto' }}>
              <IconButton
                aria-label="Search"
                sx={{
                  color: IMPERIAL_MIDNIGHT,
                  borderRadius: 0,
                  '&:hover': { color: QUANTUM_CYAN, bgcolor: 'transparent' },
                }}
              >
                <SearchIcon />
              </IconButton>

              {user && (
                <IconButton
                  onClick={(event) => setAccountAnchor(event.currentTarget)}
                  aria-label="Account"
                  sx={{
                    color: IMPERIAL_MIDNIGHT,
                    borderRadius: 0,
                    '&:hover': { color: QUANTUM_CYAN, bgcolor: 'transparent' },
                  }}
                >
                  <PersonOutlineIcon />
                </IconButton>
              )}
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Fade in={Boolean(selectedMega) && !isMobile} timeout={100} unmountOnExit>
        <Box
          role="menu"
          aria-label="Mega menu"
          sx={{
            position: 'absolute',
            top: 102,
            left: 0,
            right: 0,
            zIndex: (muiTheme) => muiTheme.zIndex.appBar + 1,
            bgcolor: WHITE,
            borderBottom: `1px solid ${CLOUD_SILVER}`,
            borderTop: `1px solid ${CLOUD_SILVER}`,
            borderRadius: 0,
            boxShadow: 'none',
          }}
        >
          <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, lg: 6 } }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: `repeat(${selectedMega?.columns.length || 3}, minmax(0, 1fr))`,
                gap: 4,
              }}
            >
              {selectedMega?.columns.map((column) => (
                <Box key={column.title}>
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: IMPERIAL_MIDNIGHT,
                      mb: 1.2,
                      lineHeight: 1.3,
                    }}
                  >
                    {column.title}
                  </Typography>
                  <Stack spacing={0.25}>
                    {column.links.map((link) => (
                      <Button
                        key={link.label}
                        onClick={() => go(link.path)}
                        startIcon={<ChevronRightIcon sx={{ fontSize: 17 }} />}
                        sx={{
                          justifyContent: 'flex-start',
                          px: 0,
                          py: 0.55,
                          minHeight: 30,
                          minWidth: 0,
                          borderRadius: 0,
                          color: IMPERIAL_MIDNIGHT,
                          textTransform: 'none',
                          fontSize: 14,
                          fontWeight: 400,
                          lineHeight: 1.35,
                          '& .MuiButton-startIcon': {
                            color: IMPERIAL_MIDNIGHT,
                            mr: 0.5,
                          },
                          '&:hover': {
                            bgcolor: 'transparent',
                            color: QUANTUM_CYAN,
                            '& .MuiButton-startIcon': { color: QUANTUM_CYAN },
                          },
                        }}
                      >
                        {link.label}
                      </Button>
                    ))}
                  </Stack>
                </Box>
              ))}
            </Box>
          </Container>
        </Box>
      </Fade>

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            width: '100vw',
            maxWidth: '100vw',
            bgcolor: WHITE,
            borderRadius: 0,
            boxShadow: 'none',
          },
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box
            sx={{
              bgcolor: IMPERIAL_MIDNIGHT,
              color: CLOUD_SILVER,
              px: 2,
              py: 1.25,
              borderBottom: `1px solid ${CLOUD_SILVER}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: 16 }}>ATONIXCORP</Typography>
            <IconButton onClick={() => setMobileOpen(false)} sx={{ color: CLOUD_SILVER }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ px: 2, py: 1.25, borderBottom: `1px solid ${CLOUD_SILVER}` }}>
            <Stack direction="row" spacing={1.5}>
              <Button
                onClick={() => setLangAnchor(document.body as unknown as HTMLElement)}
                startIcon={<LanguageIcon sx={{ fontSize: 16 }} />}
                sx={{ px: 0, minWidth: 0, color: IMPERIAL_MIDNIGHT, textTransform: 'none' }}
              >
                {lang}
              </Button>
              <Button
                onClick={() => setRegionAnchor(document.body as unknown as HTMLElement)}
                startIcon={<PublicIcon sx={{ fontSize: 16 }} />}
                sx={{ px: 0, minWidth: 0, color: IMPERIAL_MIDNIGHT, textTransform: 'none' }}
              >
                {region}
              </Button>
            </Stack>
          </Box>

          <Box sx={{ px: 2, py: 1.25, borderBottom: `1px solid ${CLOUD_SILVER}` }}>
            <Box
              sx={{
                height: 40,
                border: `1px solid ${CLOUD_SILVER}`,
                display: 'flex',
                alignItems: 'center',
                px: 1.25,
                borderRadius: 0,
              }}
            >
              <SearchIcon sx={{ color: IMPERIAL_MIDNIGHT, mr: 1 }} />
              <InputBase placeholder="Search" sx={{ flex: 1, fontSize: 14 }} />
            </Box>
          </Box>

          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            {categories.map((category) => (
              <Accordion
                key={category.key}
                disableGutters
                elevation={0}
                expanded={mobileExpanded === category.key}
                onChange={(_, expanded) => setMobileExpanded(expanded ? category.key : false)}
                sx={{
                  borderRadius: 0,
                  boxShadow: 'none',
                  borderBottom: `1px solid ${CLOUD_SILVER}`,
                  '&::before': { display: 'none' },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontSize: 15, fontWeight: 600 }}>{category.label}</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, pb: 1.25 }}>
                  {category.columns.map((column) => (
                    <Box key={column.title} sx={{ mb: 1.25 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.5, color: IMPERIAL_MIDNIGHT }}>
                        {column.title}
                      </Typography>
                      <List disablePadding>
                        {column.links.map((link) => (
                          <ListItemButton
                            key={link.label}
                            onClick={() => go(link.path)}
                            sx={{ px: 0.5, borderRadius: 0 }}
                          >
                            <Typography sx={{ fontSize: 14 }}>{link.label}</Typography>
                          </ListItemButton>
                        ))}
                      </List>
                    </Box>
                  ))}
                </AccordionDetails>
              </Accordion>
            ))}

            <Box sx={{ px: 2, py: 1.25 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1 }}>Global Links</Typography>
              <Stack spacing={0.5}>
                {utilityLinks.map((item) => (
                  <Button
                    key={item.label}
                    onClick={() => go(item.path)}
                    sx={{
                      justifyContent: 'flex-start',
                      px: 0,
                      color: IMPERIAL_MIDNIGHT,
                      textTransform: 'none',
                      fontSize: 14,
                      borderRadius: 0,
                      '&:hover': { color: QUANTUM_CYAN, bgcolor: 'transparent' },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Stack>
            </Box>
          </Box>

          {!user ? (
            <Box sx={{ p: 2, borderTop: `1px solid ${CLOUD_SILVER}` }}>
              <Button
                fullWidth
                onClick={() => {
                  setMobileOpen(false);
                  setSignupOpen(true);
                }}
                variant="contained"
                sx={{ borderRadius: 0, boxShadow: 'none', bgcolor: QUANTUM_CYAN, color: '#FFFFFF', textTransform: 'none', '&:hover': { boxShadow: 'none', bgcolor: '#1e5daa' } }}
              >
                Get Started
              </Button>
            </Box>
          ) : (
            <Box sx={{ p: 2, borderTop: `1px solid ${CLOUD_SILVER}` }}>
              <Button
                fullWidth
                onClick={() => {
                  setMobileOpen(false);
                  go('/dashboard');
                }}
                sx={{ borderRadius: 0, border: `1px solid ${IMPERIAL_MIDNIGHT}`, color: IMPERIAL_MIDNIGHT, textTransform: 'none', mb: 1 }}
                startIcon={<DashboardIcon />}
              >
                Open Dashboard
              </Button>
              <Button
                fullWidth
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                }}
                sx={{ borderRadius: 0, border: `1px solid #ef4444`, color: '#ef4444', textTransform: 'none' }}
                startIcon={<LogoutIcon />}
              >
                Sign Out
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>

      <Menu
        anchorEl={langAnchor}
        open={Boolean(langAnchor)}
        onClose={() => setLangAnchor(null)}
        PaperProps={{ sx: { borderRadius: 0, boxShadow: 'none', border: `1px solid ${CLOUD_SILVER}` } }}
      >
        {languageOptions.map((option) => (
          <MenuItem
            key={option}
            onClick={() => {
              setLang(option);
              setLangAnchor(null);
            }}
            sx={{ fontSize: 14 }}
          >
            {option}
          </MenuItem>
        ))}
      </Menu>

      <Menu
        anchorEl={regionAnchor}
        open={Boolean(regionAnchor)}
        onClose={() => setRegionAnchor(null)}
        PaperProps={{ sx: { borderRadius: 0, boxShadow: 'none', border: `1px solid ${CLOUD_SILVER}` } }}
      >
        {regionOptions.map((option) => (
          <MenuItem
            key={option}
            onClick={() => {
              setRegion(option);
              setRegionAnchor(null);
            }}
            sx={{ fontSize: 14 }}
          >
            {option}
          </MenuItem>
        ))}
      </Menu>

      <Menu
        anchorEl={accountAnchor}
        open={Boolean(accountAnchor)}
        onClose={() => setAccountAnchor(null)}
        PaperProps={{ sx: { borderRadius: 0, boxShadow: 'none', border: `1px solid ${CLOUD_SILVER}`, minWidth: 220 } }}
      >
        <Box sx={{ px: 2, py: 1.25 }}>
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Avatar sx={{ width: 30, height: 30, bgcolor: IMPERIAL_MIDNIGHT, color: WHITE, borderRadius: 0 }}>
              {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.35 }}>
                {user?.first_name
                  ? `${user.first_name} ${user.last_name || ''}`.trim()
                  : user?.username}
              </Typography>
              <Typography sx={{ fontSize: 12, color: '#6b7280' }}>{user?.email}</Typography>
            </Box>
          </Stack>
        </Box>
        <Divider />
        <MenuItem
          onClick={() => {
            setAccountAnchor(null);
            go('/dashboard');
          }}
          sx={{ fontSize: 14, py: 1 }}
        >
          <DashboardIcon sx={{ fontSize: 18, mr: 1 }} /> Dashboard
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAccountAnchor(null);
            logout();
          }}
          sx={{ fontSize: 14, py: 1, color: '#ef4444' }}
        >
          <LogoutIcon sx={{ fontSize: 18, mr: 1 }} /> Sign Out
        </MenuItem>
      </Menu>

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

export default CloudPlatformHeader;
