import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Link,
  IconButton,
} from '@mui/material';
import {
  Twitter,
  GitHub,
  LinkedIn,
  Email,
  LocationOn,
} from '@mui/icons-material';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'Twitter', icon: <Twitter />, url: 'https://twitter.com/AtonixCorp' },
    { name: 'GitHub', icon: <GitHub />, url: 'https://github.com/AtonixCorp' },
    { name: 'LinkedIn', icon: <LinkedIn />, url: 'https://linkedin.com/company/atonixcorp' },
  ];

  const quickLinks = [
    { name: 'Projects', path: '/projects' },
    { name: 'Teams', path: '/teams' },
    { name: 'Focus Areas', path: '/focus-areas' },
    { name: 'Resources', path: '/resources' },
    { name: 'Community', path: '/community' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#0f172a',
        color: 'white',
        py: 3,
        mt: 'auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
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
                  '&:hover': { opacity: 1 },
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
                    '&:hover': { opacity: 1 },
                    transition: 'opacity 0.2s ease-in-out',
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
            <Box sx={{ display: 'flex', gap: 1 }}>
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
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    transition: 'all 0.2s ease-in-out',
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
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
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
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link
              component={RouterLink}
              to="/privacy"
              color="inherit"
              underline="hover"
              sx={{ fontSize: '0.875rem', opacity: 0.7 }}
            >
              Privacy
            </Link>
            <Link
              component={RouterLink}
              to="/terms"
              color="inherit"
              underline="hover"
              sx={{ fontSize: '0.875rem', opacity: 0.7 }}
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