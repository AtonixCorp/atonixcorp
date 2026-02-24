import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Link,
  IconButton,
  SvgIcon,
} from '@mui/material';
import {
  Twitter,
  GitHub,
  LinkedIn,
  Email,
  LocationOn,
  Instagram,
  Facebook,
} from '@mui/icons-material';
import { dashboardTokens, computeUiTokens } from '../../styles/dashboardDesignSystem';

// Custom Discord Icon
const DiscordIcon = (props: any) => (
  <SvgIcon {...props}>
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0189 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
  </SvgIcon>
);

// Custom Slack Icon
const SlackIcon = (props: any) => (
  <SvgIcon {...props}>
    <path d="M6 15a2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1 2-2h2v2zM6 7H4a2 2 0 0 0-2 2 2 2 0 0 0 2 2h2V7zM14 7a2 2 0 0 1 2-2 2 2 0 0 1 2 2v2h-2V7zM14 15h2a2 2 0 0 0 2-2 2 2 0 0 0-2-2h-2v4zM10 9a2 2 0 0 0-2 2 2 2 0 0 0 2 2h8V9H10zM8 9H0v4a2 2 0 0 0 2 2h6V9z"/>
  </SvgIcon>
);

// Simple GitLab Icon (SVG)
const GitLabIcon = (props: any) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M12 0l-2.4 7.2L2 8.4l6 4.8L5.6 21.6 12 17.4 18.4 21.6 16 13.2 22 8.4l-7.6-.9L12 0z" />
  </SvgIcon>
);

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const primaryNavy = computeUiTokens.neutralStrong;
  const accentBlue = dashboardTokens.colors.brandPrimary;

  const socialLinks = [
    { name: 'Twitter', icon: <Twitter />, url: 'https://twitter.com/AtonixCorp' },
    { name: 'GitHub', icon: <GitHub />, url: 'https://github.com/AtonixCorp' },
    { name: 'LinkedIn', icon: <LinkedIn />, url: 'https://linkedin.com/company/atonixcorp' },
    { name: 'Instagram', icon: <Instagram />, url: 'https://instagram.com/atonixcorp' },
    { name: 'Facebook', icon: <Facebook />, url: 'https://facebook.com/atonixcorp' },
    { name: 'GitLab', icon: <GitLabIcon />, url: 'https://gitlab.com/atonixcorpvm' },
    { name: 'Slack', icon: <SlackIcon />, url: 'https://atonixcorp.slack.com' },
    { name: 'Discord', icon: <DiscordIcon />, url: 'https://discord.gg/YYVWydDcx' },
  ];

  const quickLinks = [
    { name: 'Projects', path: '/projects' },
    { name: 'Teams', path: '/teams' },
    { name: 'Focus Areas', path: '/focus-areas' },
    { name: 'Resources', path: '/resources' },
    { name: 'Community', path: '/community' },
    { name: 'Contact', path: '/contact' },
    { name: 'Roadmap', path: '/roadmap' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        background: primaryNavy,
        color: 'white',
        py: 3,
        mt: 'auto',
        borderTop: '1px solid rgba(255,255,255,.16)',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3,
          flexWrap: 'wrap'
        }}>
          {/* Company Info */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 40%' }, mb: 2 }}>
            <Typography variant="h6" component="div" fontWeight={600} sx={{ mb: 2, color: 'white' }}>
              AtonixCorp
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.8, lineHeight: 1.5, color: 'white' }}>
              Building secure, scalable, and autonomous cloud solutions for forward-thinking organizations.
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Email sx={{ mr: 1, fontSize: 16, opacity: 0.7 }} />
              <Link
                href="mailto:support@atonixcorp.com"
                color="inherit"
                underline="hover"
                sx={{
                  fontSize: '0.875rem',
                  opacity: 0.8,
                  '&:hover': { opacity: 1, color: accentBlue },
                }}
              >
                support@atonixcorp.com
              </Link>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOn sx={{ mr: 1, fontSize: 16, opacity: 0.7 }} />
              <Typography variant="body2" sx={{ opacity: 0.8, color: 'white' }}>
                Global Remote Operations
              </Typography>
            </Box>
          </Box>

          {/* Quick Links */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 20%' } }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2, color: 'white' }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {quickLinks.map((link) => (
                <Link
                  key={link.name}
                  component={RouterLink}
                  to={link.path}
                  color="inherit"
                  underline="none"
                  sx={{
                    fontSize: '0.875rem',
                    opacity: 0.8,
                    '&:hover': { opacity: 1, color: accentBlue },
                    transition: 'opacity 0.12s cubic-bezier(0.4, 0, 0.2, 1), color 0.12s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {link.name}
                </Link>
              ))}
            </Box>
          </Box>

          {/* Company Stats & Social */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' } }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2, color: 'white' }}>
              Company
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 3 }}>
              <Typography variant="body2" sx={{ opacity: 0.8, color: 'white' }}>Founded: 2024</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, color: 'white' }}>Projects: 15+</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, color: 'white' }}>Team: 25+</Typography>
            </Box>

            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2, color: 'white' }}>
              Connect With Us
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {socialLinks.map((social) => (
                <IconButton
                  key={social.name}
                  component="a"
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: 'white',
                    opacity: 0.7,
                    '&:hover': {
                      opacity: 1,
                      color: accentBlue,
                      backgroundColor: 'rgba(0,224,255,.18)',
                    },
                    transition: 'background-color 0.12s cubic-bezier(0.4, 0, 0.2, 1), color 0.12s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.12s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  size="small"
                  title={`Follow us on ${social.name}`}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Bottom Section */}
        <Box
          sx={{
            mt: 4,
            pt: 2,
            borderTop: '1px solid rgba(255,255,255,.16)',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.7, color: 'white' }}>
            © {currentYear} AtonixCorp. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-end' } }}>
            <Link
              component={RouterLink}
              to="/privacy"
              color="inherit"
              underline="hover"
              sx={{ fontSize: '0.875rem', opacity: 0.7, '&:hover': { color: accentBlue, opacity: 1 } }}
            >
              Privacy
            </Link>
            <Link
              component={RouterLink}
              to="/terms"
              color="inherit"
              underline="hover"
              sx={{ fontSize: '0.875rem', opacity: 0.7, '&:hover': { color: accentBlue, opacity: 1 } }}
            >
              Terms
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
