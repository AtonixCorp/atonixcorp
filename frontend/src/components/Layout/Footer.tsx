import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, IconButton, Link, Stack, Typography } from '@mui/material';
import { Twitter, GitHub, LinkedIn, Instagram, Facebook } from '@mui/icons-material';
import { dashboardTokens, computeUiTokens } from '../../styles/dashboardDesignSystem';

type FooterLink = {
  label: string;
  path: string;
};

type FooterSection = {
  title: string;
  links: FooterLink[];
};

const sections: FooterSection[] = [
  {
    title: 'Platform',
    links: [
      { label: 'Compute & Virtual Machines', path: '/dashboard/compute' },
      { label: 'Kubernetes & Container Orchestration', path: '/dashboard/kubernetes' },
      { label: 'Object, Block & Archive Storage', path: '/dashboard/storage' },
      { label: 'Networking, Load Balancing & CDN', path: '/dashboard/network' },
      { label: 'Identity, Access & Security', path: '/dashboard/settings' },
      { label: 'AI, Automation & Developer Tools', path: '/developer' },
    ],
  },
  {
    title: 'Build & Deploy',
    links: [
      { label: 'Drag-and-Drop App Builder', path: '/developer' },
      { label: 'AI-Assisted Development', path: '/developer' },
      { label: 'Email Hosting & Low-Cost Mail Services', path: '/dashboard/domains' },
      { label: 'Domain Registration (ResellerClub Integration)', path: '/dashboard/domains' },
      { label: 'API-First Architecture', path: '/developer' },
      { label: 'Global Deployment Zones', path: '/docs' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About AtonixCorp', path: '/about' },
      { label: 'Leadership & Vision', path: '/about' },
      { label: 'Compliance & Security', path: '/docs' },
      { label: 'Careers & Partnerships', path: '/about' },
      { label: 'Press & Media', path: '/resources' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Documentation', path: '/docs' },
      { label: 'Developer Guides', path: '/developer' },
      { label: 'Status & Monitoring', path: '/dashboard/monitoring' },
      { label: 'Billing & Account Management', path: '/dashboard/billing' },
      { label: 'Contact Support', path: '/support' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', path: '/docs' },
      { label: 'Privacy Policy', path: '/docs' },
      { label: 'Acceptable Use Policy', path: '/docs' },
      { label: 'Security & Compliance Standards', path: '/docs' },
    ],
  },
];

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const primaryNavy = computeUiTokens.neutralStrong;
  const accentBlue = dashboardTokens.colors.brandPrimary;
  const socialLinks = [
    { name: 'Twitter', icon: <Twitter fontSize="small" />, url: 'https://twitter.com/AtonixCorp' },
    { name: 'GitHub', icon: <GitHub fontSize="small" />, url: 'https://github.com/AtonixCorp' },
    { name: 'LinkedIn', icon: <LinkedIn fontSize="small" />, url: 'https://linkedin.com/company/atonixcorp' },
    { name: 'Instagram', icon: <Instagram fontSize="small" />, url: 'https://instagram.com/atonixcorp' },
    { name: 'Facebook', icon: <Facebook fontSize="small" />, url: 'https://facebook.com/atonixcorp' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        background: primaryNavy,
        color: dashboardTokens.colors.white,
        mt: 'auto',
        borderTop: `1px solid ${dashboardTokens.colors.border}`,
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
        <Box
          sx={{
            pb: { xs: 4, md: 5 },
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(5, 1fr)' },
            gap: { xs: 3, md: 4 },
            borderBottom: `1px solid ${dashboardTokens.colors.border}`,
          }}
        >
          {sections.map((section) => (
            <Box key={section.title}>
              <Typography
                sx={{
                  fontSize: '.9rem',
                  fontWeight: 700,
                  letterSpacing: '.02em',
                  textTransform: 'uppercase',
                  color: dashboardTokens.colors.white,
                  mb: 1.4,
                }}
              >
                {section.title}
              </Typography>
              <Stack spacing={0.8}>
                {section.links.map((item) => (
                  <Link
                    key={item.label}
                    component={RouterLink}
                    to={item.path}
                    underline="none"
                    sx={{
                      color: 'rgba(255,255,255,.82)',
                      fontSize: '.88rem',
                      lineHeight: 1.45,
                      transition: 'color 120ms cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': { color: accentBlue },
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </Stack>
            </Box>
          ))}
        </Box>

        <Box sx={{ pt: 3.25 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, flexDirection: { xs: 'column', md: 'row' }, gap: 1.25 }}>
            <Typography sx={{ color: 'rgba(255,255,255,.74)', fontSize: '.86rem' }}>
              © {currentYear} AtonixCorp. All rights reserved.
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              {socialLinks.map((social) => (
                <IconButton
                  key={social.name}
                  component="a"
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  aria-label={social.name}
                  sx={{
                    color: 'rgba(255,255,255,.75)',
                    '&:hover': {
                      color: accentBlue,
                      backgroundColor: 'rgba(0,224,255,.14)',
                    },
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
              <Typography sx={{ color: 'rgba(255,255,255,.65)', fontSize: '.8rem', ml: 0.5 }}>
                Sovereign • Scalable • Enterprise-Grade
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
