import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Link,
  IconButton,
  Divider,
  Chip,
} from '@mui/material';
import {
  Twitter,
  GitHub,
  LinkedIn,
  Business as BusinessIcon,
  Email,
  Phone,
  LocationOn,
  ArrowUpward,
} from '@mui/icons-material';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'Twitter', icon: <Twitter />, url: 'https://twitter.com/AtonixCorp' },
    { name: 'GitHub', icon: <GitHub />, url: 'https://github.com/AtonixCorp' },
    { name: 'LinkedIn', icon: <LinkedIn />, url: 'https://linkedin.com/company/atonixcorp' },
  ];

  const quickLinks = [
    { name: 'Projects', path: '/projects', description: 'View our latest projects' },
    { name: 'Teams', path: '/teams', description: 'Meet our talented teams' },
    { name: 'Focus Areas', path: '/focus-areas', description: 'Our areas of expertise' },
    { name: 'Resources', path: '/resources', description: 'Helpful resources and tools' },
    { name: 'Community', path: '/community', description: 'Join our community' },
    { name: 'Contact', path: '/contact', description: 'Get in touch with us' },
  ];

  const focusAreas = [
    { name: 'Agriculture', path: '/focus-areas/agriculture' },
    { name: 'Fintech', path: '/focus-areas/fintech' },
    { name: 'Medical Research', path: '/focus-areas/medical-research' },
    { name: 'Security', path: '/focus-areas/security' },
    { name: 'Big Data', path: '/focus-areas/big-data' },
    { name: 'Cloud Computing', path: '/focus-areas/cloud-computing' },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)',
        color: 'white',
        py: 8,
        mt: 'auto',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 4,
          flexWrap: 'wrap'
        }}>
          {/* Company Info */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 40%' }, mb: 3 }}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BusinessIcon sx={{ mr: 1, fontSize: 32 }} />
                <Typography variant="h5" component="div" fontWeight={700}>
                  AtonixCorp
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6, opacity: 0.9 }}>
                A forward-thinking infrastructure and systems engineering organization 
                dedicated to building secure, scalable, and autonomous cloud solutions.
              </Typography>
              
              {/* Contact Info */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" component="div" fontWeight={600} sx={{ mb: 2 }}>
                  Contact Information
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Email sx={{ mr: 1, fontSize: 16, opacity: 0.8 }} />
                  <Link
                    href="mailto:guxegdsa@atonixcorp.com"
                    color="inherit"
                    underline="hover"
                    sx={{ 
                      fontSize: '0.875rem', 
                      opacity: 0.8,
                      '&:hover': { opacity: 1 },
                      transition: 'opacity 0.2s ease-in-out',
                    }}
                  >
                    guxegdsa@atonixcorp.com
                  </Link>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ mr: 1, fontSize: 16, opacity: 0.8 }} />
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Global Remote Operations
                  </Typography>
                </Box>
              </Box>

              {/* Social Links */}
              <Box>
                <Typography variant="h6" component="div" fontWeight={600} sx={{ mb: 2 }}>
                  Follow Us
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
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                      title={`Follow us on ${social.name}`}
                    >
                      {social.icon}
                    </IconButton>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Quick Links */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 25%' } }}>
            <Typography variant="h6" component="div" fontWeight={600} sx={{ mb: 3 }}>
              Quick Links
            </Typography>
            {quickLinks.map((link) => (
              <Box key={link.name} sx={{ mb: 2 }}>
                <Link
                  component={RouterLink}
                  to={link.path}
                  color="inherit"
                  underline="none"
                  sx={{
                    display: 'block',
                    opacity: 0.8,
                    '&:hover': { 
                      opacity: 1,
                      transform: 'translateX(4px)',
                    },
                    transition: 'all 0.2s ease-in-out',
                    fontSize: '1rem',
                    fontWeight: 500,
                  }}
                >
                  {link.name}
                </Link>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    opacity: 0.6,
                    fontSize: '0.75rem',
                    lineHeight: 1.2,
                  }}
                >
                  {link.description}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Focus Areas */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 25%' } }}>
            <Typography variant="h6" component="div" fontWeight={600} sx={{ mb: 3 }}>
              Focus Areas
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {focusAreas.map((area) => (
                <Chip
                  key={area.name}
                  label={area.name}
                  component={RouterLink}
                  to={area.path}
                  clickable
                  variant="outlined"
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    fontSize: '0.75rem',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      transform: 'scale(1.05)',
                    },
                    '&.MuiChip-clickable:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Company Stats & CTA */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 auto' } }}>
            <Typography variant="h6" component="div" fontWeight={600} sx={{ mb: 3 }}>
              Company
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                Founded: 2024
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                Projects: 15+
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                Team Members: 25+
              </Typography>
            </Box>
            
            {/* Scroll to Top Button */}
            <IconButton
              onClick={scrollToTop}
              sx={{
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
              title="Scroll to top"
            >
              <ArrowUpward />
            </IconButton>
          </Box>
        </Box>

        <Divider sx={{ my: 4, backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            textAlign: { xs: 'center', md: 'left' },
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            © {currentYear} AtonixCorp. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: { xs: 2, md: 0 } }}>
            <Link
              component={RouterLink}
              to="/privacy"
              color="inherit"
              underline="hover"
              sx={{ fontSize: '0.875rem', opacity: 0.8 }}
            >
              Privacy Policy
            </Link>
            <Link
              component={RouterLink}
              to="/terms"
              color="inherit"
              underline="hover"
              sx={{ fontSize: '0.875rem', opacity: 0.8 }}
            >
              Terms of Service
            </Link>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.8, mt: { xs: 1, md: 0 } }}>
            Leading the way in technological evolution
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;