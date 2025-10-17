import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import {
  Rocket as RocketIcon,
  Group as GroupIcon,
  TrackChanges as TargetIcon,
  FlashOn as FlashIcon,
} from '@mui/icons-material';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleStatClick = (path: string) => {
    navigate(path);
  };

  const stats = [
    { number: '15+', label: 'Active Projects', icon: <RocketIcon />, color: '#3b82f6', path: '/projects' },
    { number: '2', label: 'Expert Teams', icon: <GroupIcon />, color: '#8b5cf6', path: '/teams' },
    { number: '6', label: 'Focus Areas', icon: <TargetIcon />, color: '#06d6a0', path: '/focus-areas' },
    { number: '100%', label: 'Innovation Driven', icon: <FlashIcon />, color: '#f59e0b', path: '/community' },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 50%, #6366f1 100%)',
          color: 'white',
          py: { xs: 8, md: 16 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '20%',
            right: '10%',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(96, 165, 250, 0.3) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Box className="fade-in-up">
            <Typography 
              variant="h1" 
              component="h1" 
              sx={{ 
                mb: 4, 
                fontWeight: 900,
                fontSize: { xs: '2.5rem', md: '4rem', lg: '4.5rem' },
                lineHeight: 1.1,
                textShadow: '0 4px 8px rgba(0,0,0,0.3)',
              }}
            >
              Welcome to{' '}
              <Box 
                component="span" 
                sx={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #60a5fa 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                AtonixCorp
              </Box>
            </Typography>
            <Typography 
              variant="h3" 
              component="h2" 
              sx={{ 
                mb: 4, 
                opacity: 0.95, 
                fontWeight: 400,
                fontSize: { xs: '1.5rem', md: '2.25rem' },
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              Leading the way in technological evolution
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 6, 
                maxWidth: '900px', 
                mx: 'auto', 
                lineHeight: 1.7,
                opacity: 0.9,
                fontSize: { xs: '1rem', md: '1.25rem' },
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
              }}
            >
              A forward-thinking infrastructure and systems engineering organization dedicated to 
              building secure, scalable, and autonomous cloud solutions that power the future.
            </Typography>
            <Box 
              sx={{ 
                display: 'flex', 
                gap: 3, 
                justifyContent: 'center', 
                flexWrap: 'wrap',
                mt: 6,
              }}
            >
              <Button
                component={Link}
                to="/projects"
                variant="contained"
                size="large"
                sx={{ 
                  px: 6, 
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    background: 'rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.3)',
                  },
                }}
              >
                Explore Projects
              </Button>
              <Button
                component={Link}
                to="/teams"
                variant="outlined"
                size="large"
                sx={{ 
                  px: 6, 
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  color: 'white',
                  borderRadius: '16px',
                  borderWidth: '2px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': { 
                    transform: 'translateY(-3px)',
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: '2px',
                    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.2)',
                  },
                }}
              >
                Meet Our Teams
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Mission Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, px: 2 }}>
        <Container maxWidth="lg">
          <Box className="fade-in-up" sx={{ textAlign: 'center', mb: 8 }}>
            <Typography 
              variant="h2" 
              component="h2" 
              sx={{ 
                mb: 4, 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Our Mission
            </Typography>
            <Box
              sx={{
                width: '100px',
                height: '4px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                borderRadius: '2px',
                mx: 'auto',
                mb: 6,
              }}
            />
            <Typography 
              variant="h5" 
              sx={{ 
                maxWidth: '1000px', 
                mx: 'auto', 
                lineHeight: 1.7, 
                color: 'text.secondary',
                fontWeight: 400,
                fontSize: { xs: '1.1rem', md: '1.4rem' },
              }}
            >
              We design and deploy{' '}
              <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
                resilient architectures
              </Box>{' '}
              that adapt seamlessly across diverse environments—from smart cities to high-performance clusters. 
              With a strong emphasis on{' '}
              <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
                edge computing
              </Box>,{' '}
              next-generation observability, and future-ready design, our mission is to empower organizations 
              with infrastructure that evolves intelligently, operates reliably, and unlocks new frontiers 
              in connectivity and computation.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Enhanced Stats Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          py: { xs: 8, md: 12 },
          position: 'relative',
        }}
      >
        <Container maxWidth="lg">
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 4,
            }}
          >
            {stats.map((stat, index) => (
              <Paper
                key={index}
                elevation={0}
                className="hover-lift"
                onClick={() => handleStatClick(stat.path)}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.9)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    transform: 'translateY(-8px) scale(1.02)',
                  },
                }}
              >
                <Box
                  sx={{
                    fontSize: '3rem',
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'center',
                    color: stat.color,
                    '& .MuiSvgIcon-root': {
                      fontSize: '3rem',
                    },
                  }}
                >
                  {stat.icon}
                </Box>
                <Typography 
                  variant="h2" 
                  component="div" 
                  sx={{ 
                    fontWeight: 800, 
                    color: stat.color,
                    mb: 1,
                    fontSize: { xs: '2rem', md: '2.5rem' },
                    background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}99 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {stat.number}
                </Typography>
                <Typography 
                  variant="h6" 
                  component="div" 
                  sx={{ 
                    color: '#64748b',
                    fontWeight: 600,
                  }}
                >
                  {stat.label}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Enhanced Call to Action */}
      <Box sx={{ py: { xs: 8, md: 12 }, px: 2 }}>
        <Container maxWidth="lg">
          <Paper
            elevation={0}
            sx={{
              background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)',
              p: { xs: 6, md: 10 },
              textAlign: 'center',
              borderRadius: '24px',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.1) 0%, transparent 70%)',
                pointerEvents: 'none',
              },
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 2 }}>
              <Typography 
                variant="h3" 
                component="h2" 
                sx={{ 
                  mb: 4, 
                  fontWeight: 700,
                  fontSize: { xs: '2rem', md: '3rem' },
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              >
                Ready to innovate with us?
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 6, 
                  opacity: 0.9,
                  maxWidth: '700px',
                  mx: 'auto',
                  lineHeight: 1.7,
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                }}
              >
                Discover our cutting-edge projects and join us in shaping the future of technology. 
                Let's build something extraordinary together.
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  component={Link}
                  to="/contact"
                  variant="contained"
                  size="large"
                  sx={{ 
                    px: 6, 
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    borderRadius: '16px',
                    boxShadow: 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      background: 'rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 16px 40px rgba(0, 0, 0, 0.3)',
                    },
                  }}
                >
                  Get In Touch
                </Button>
                <Button
                  component={Link}
                  to="/projects"
                  variant="outlined"
                  size="large"
                  sx={{ 
                    px: 6, 
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    color: 'white',
                    borderRadius: '16px',
                    borderWidth: '2px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': { 
                      transform: 'translateY(-3px)',
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderWidth: '2px',
                      boxShadow: '0 16px 40px rgba(0, 0, 0, 0.2)',
                    },
                  }}
                >
                  View Projects
                </Button>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;