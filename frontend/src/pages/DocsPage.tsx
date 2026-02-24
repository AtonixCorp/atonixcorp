import React from 'react';
import { Box, Container, Typography, Card, CardContent, Stack } from '@mui/material';
import { Code as CodeIcon, AutoStories as AutoStoriesIcon } from '@mui/icons-material';

const DocsPage: React.FC = () => {
  const primaryBlue = '#0A0F1F';
  const accentCyan = '#00E0FF';
  const darkGray = '#1F2937';
  const lightGray = '#F3F4F6';

  const sections = [
    {
      title: 'Getting Started',
      subsections: [
        {
          title: 'Installation',
          content: 'Install the official SDKs (Python, Node.js, Go, Java) and start building in minutes.',
        },
        {
          title: 'Authentication',
          content: 'Secure your applications with our authentication and authorization system.',
        },
        {
          title: 'Your First API Call',
          content: 'Make your first API call with our simple REST and GraphQL endpoints.',
        },
      ],
    },
    {
      title: 'API Reference',
      subsections: [
        {
          title: 'REST API',
          content: 'Comprehensive documentation for all REST endpoints with examples.',
        },
        {
          title: 'GraphQL API',
          content: 'Query exactly what you need with our GraphQL endpoint at /api/graphql/.',
        },
        {
          title: 'Compliance APIs',
          content: 'Collect evidence packs, control status, and attestations for SOC 2 / ISO 27001 / GDPR programs.',
        },
      ],
    },
    {
      title: 'Advanced Topics',
      subsections: [
        {
          title: 'Performance Optimization',
          content: 'Best practices for optimizing your applications for maximum performance.',
        },
        {
          title: 'Scaling & Load Testing',
          content: 'Learn how to scale your applications and prepare for high traffic.',
        },
        {
          title: 'Security Best Practices',
          content: 'Implement security best practices for your atonixcorp applications.',
        },
      ],
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${primaryBlue} 0%, ${darkGray} 100%)`,
          color: 'white',
          py: { xs: 4, md: 6 },
          textAlign: 'left',
        }}
      >
        <Container maxWidth="lg" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' }, gap: { xs: 3, md: 5 }, alignItems: 'center' }}>
          <Box>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, color: '#FFFFFF', lineHeight: { xs: 1.12, md: 1.08 }, letterSpacing: { xs: '-0.5px', md: '-1px' }, fontSize: { xs: '2.2rem', sm: '2.7rem', md: '3.35rem' }, maxWidth: 620 }}>
            Documentation
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 400, color: '#FFFFFF', maxWidth: 620, lineHeight: { xs: 1.42, md: 1.4 } }}>
            Everything you need to build amazing applications with atonixcorp
          </Typography>
          </Box>
        </Container>
      </Box>

      {/* Documentation Sections */}
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 4 }}>
            {sections.map((section, idx) => (
              <Box key={idx}>
                <Stack direction="row" gap={1} alignItems="center" sx={{ mb: 3 }}>
                  <AutoStoriesIcon sx={{ color: accentCyan, fontSize: 28 }} />
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: darkGray,
                    }}
                  >
                    {section.title}
                  </Typography>
                </Stack>
                <Stack gap={2}>
                  {section.subsections.map((sub, subIdx) => (
                    <Box
                      key={subIdx}
                      sx={{
                        p: 2.5,
                        bgcolor: lightGray,
                        borderRadius: 1.5,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        borderLeft: `3px solid transparent`,
                        '&:hover': {
                          borderLeftColor: accentCyan,
                          bgcolor: `${accentCyan}11`,
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: darkGray,
                          mb: 0.5,
                          fontSize: '0.95rem',
                        }}
                      >
                        {sub.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: darkGray,
                          opacity: 0.7,
                          fontSize: '0.85rem',
                        }}
                      >
                        {sub.content}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Code Examples */}
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
            Code Examples
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
            {[
              {
                title: 'REST API Request',
                code: `// Create a new resource
const response = await fetch(
  'https://api.atonixcorp.com/v1/resources',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'My Resource',
      type: 'database',
    }),
  }
);`,
              },
              {
                title: 'GraphQL Query',
                code: `query GetResources {
  resources(limit: 10) {
    id
    name
    type
    status
    createdAt
    metadata {
      region
      size
    }
  }
}`,
              },
            ].map((example, idx) => (
              <Card
                key={idx}
                sx={{
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" gap={1} alignItems="center" sx={{ mb: 3 }}>
                    <CodeIcon sx={{ color: accentCyan, fontSize: 24 }} />
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: darkGray,
                      }}
                    >
                      {example.title}
                    </Typography>
                  </Stack>
                  <Box
                    sx={{
                      bgcolor: '#1F2937',
                      color: '#10b981',
                      p: 2.5,
                      borderRadius: 1,
                      overflow: 'auto',
                      fontSize: '0.875rem',
                      fontFamily: 'monospace',
                      lineHeight: 1.6,
                    }}
                  >
                    <code>{example.code}</code>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Resources */}
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
            Additional Resources
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            {[
              { title: 'API Status', desc: 'Check real-time status of all atonixcorp services' },
              { title: 'Community Forum', desc: 'Ask questions and get help from our community' },
              { title: 'GitHub Repository', desc: 'Access SDKs, examples, and contribute to open source' },
              { title: 'Support Portal', desc: 'Get help from our support team 24/7' },
            ].map((resource, idx) => (
              <Box
                key={idx}
                sx={{
                  p: 3,
                  border: `1px solid #e5e7eb`,
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: accentCyan,
                    boxShadow: `0 0 0 3px ${accentCyan}22`,
                  },
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: darkGray,
                    mb: 1,
                  }}
                >
                  {resource.title}
                </Typography>
                <Typography variant="body2" sx={{ color: darkGray, opacity: 0.75 }}>
                  {resource.desc}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default DocsPage;
