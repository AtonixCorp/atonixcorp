import React from 'react';
import { Box, Container, Typography, Card, CardContent } from '@mui/material';
import { People as PeopleIcon, Flag as FlagIcon, Lightbulb as LightbulbIcon } from '@mui/icons-material';

const AboutPage: React.FC = () => {
  const primaryBlue = '#1E3A8A';
  const accentCyan = '#06B6D4';
  const darkGray = '#1F2937';
  const lightGray = '#F3F4F6';

  const values = [
    {
      icon: <LightbulbIcon sx={{ fontSize: 48, color: accentCyan }} />,
      title: 'Innovation',
      description: 'We constantly innovate to bring the latest cloud technologies to our platform.',
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 48, color: accentCyan }} />,
      title: 'Community',
      description: 'We believe in the power of community and open collaboration.',
    },
    {
      icon: <FlagIcon sx={{ fontSize: 48, color: accentCyan }} />,
      title: 'Reliability',
      description: 'Reliability is at the core of everything we do. We never compromise on uptime.',
    },
  ];

  const team = [
    { name: 'Jane Smith', role: 'CEO & Founder', image: '👩‍💼' },
    { name: 'John Chen', role: 'CTO', image: '👨‍💻' },
    { name: 'Sarah Johnson', role: 'VP Product', image: '👩‍🔬' },
    { name: 'Mike Rodriguez', role: 'VP Engineering', image: '👨‍🔧' },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${primaryBlue} 0%, ${darkGray} 100%)`,
          color: 'white',
          py: { xs: 6, md: 10 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
            About atonixcorp
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 300, opacity: 0.9 }}>
            Building the future of cloud infrastructure
          </Typography>
        </Container>
      </Box>

      {/* Story Section */}
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="md">
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                mb: 3,
                color: primaryBlue,
              }}
            >
              Our Story
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: '1.1rem',
                color: darkGray,
                lineHeight: 1.8,
                mb: 2,
              }}
            >
              atonixcorp was founded in 2024 with a simple mission: to make cloud infrastructure accessible, simple, and affordable for everyone. We saw that existing solutions were too complex, too expensive, and didn't focus enough on developer experience.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: '1.1rem',
                color: darkGray,
                lineHeight: 1.8,
              }}
            >
              Today, atonixcorp is trusted by thousands of companies worldwide, from startups to enterprises. We're committed to continuing to innovate and provide the best cloud experience possible.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Values Section */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: lightGray }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              mb: 6,
              textAlign: 'center',
              color: primaryBlue,
            }}
          >
            Our Values
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
              gap: 4,
            }}
          >
            {values.map((value, idx) => (
              <Card
                key={idx}
                sx={{
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(30, 58, 138, 0.15)',
                  },
                }}
              >
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                    {value.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      color: darkGray,
                    }}
                  >
                    {value.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: darkGray,
                      opacity: 0.75,
                      lineHeight: 1.6,
                    }}
                  >
                    {value.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Team Section */}
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              mb: 6,
              textAlign: 'center',
              color: primaryBlue,
            }}
          >
            Leadership Team
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
              gap: 3,
            }}
          >
            {team.map((member, idx) => (
              <Card
                key={idx}
                sx={{
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  textAlign: 'center',
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography sx={{ fontSize: '3rem', mb: 2 }}>
                    {member.image}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: darkGray,
                      mb: 0.5,
                    }}
                  >
                    {member.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: accentCyan,
                      fontWeight: 600,
                    }}
                  >
                    {member.role}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: lightGray }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
              gap: 3,
            }}
          >
            {[
              { label: 'Customers', value: '10,000+' },
              { label: 'Deployments', value: '1M+' },
              { label: 'API Calls', value: '100B+' },
              { label: 'Uptime', value: '99.99%' },
            ].map((stat, idx) => (
              <Box
                key={idx}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  borderRadius: 2,
                  border: `2px solid ${accentCyan}`,
                  bgcolor: 'white',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '2.5rem',
                    fontWeight: 800,
                    color: primaryBlue,
                    mb: 1,
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 600,
                    color: darkGray,
                  }}
                >
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default AboutPage;
