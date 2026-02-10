import React from 'react';
import { Box, Container, Typography, Button, Stack, Card, CardContent, Chip } from '@mui/material';
import {
  Cloud as CloudIcon,
  Dns as DnsIcon,
  Bolt as BoltIcon,
  CheckCircle as CheckCircleIcon,
  ArrowRight as ArrowRightIcon,
  Public as PublicIcon,
} from '@mui/icons-material';

const EnhancedHomepage: React.FC = () => {
  const primaryBlue = '#1E3A8A';
  const accentCyan = '#06B6D4';
  const darkGray = '#1F2937';
  const lightGray = '#F3F4F6';

  // static hero uses a clean gradient background (no external images)


  const products = [
    {
      badge: 'New',
      title: 'Advance Dedicated Servers',
      subtitle: 'Next-gen bare metal performance',
      description: 'Get more power, bandwidth, and efficiency with our new Advance Dedicated Servers.',
      features: [
        'Up to 15% higher performance with AMD EPYC 4005 Zen 5 CPUs',
        '3x more bandwidth, included in your plan',
        'Full configuration flexibility from CPU to storage',
        'Liquid cooling for optimal performance',
      ],
      cta: 'Explore the Range',
      icon: <DnsIcon sx={{ fontSize: 48, color: accentCyan }} />,
    },
    {
      badge: 'Popular',
      title: 'Cloud VPS Platform',
      subtitle: 'Scalable virtual private servers',
      description: 'Local hosting for increased responsiveness and control across 15+ locations.',
      features: [
        'Low latency for smooth user experiences',
        'Data hosted close to you and your customers',
        'Daily backups included + unlimited traffic',
        'Anti-DDoS protection standard',
      ],
      price: 'Starting at $4.20/month',
      cta: 'Configure My VPS',
      icon: <BoltIcon sx={{ fontSize: 48, color: accentCyan }} />,
    },
    {
      badge: 'Scalable',
      title: 'Public Cloud Solutions',
      subtitle: 'Open-source cloud infrastructure',
      description: 'Scaling made simple for any cloud setup with no vendor lock-in.',
      features: [
        'No Vendor Lock-In with flexible open-source options',
        'Transparent pricing with no surprise bills',
        'Enterprise-grade security and compliance',
      ],
      cta: 'Find Out More',
      icon: <CloudIcon sx={{ fontSize: 48, color: accentCyan }} />,
    },
  ];

  const useCases = [
    { icon: '🌐', title: 'Website Business', description: 'Host your websites and web applications' },
    { icon: '⚙️', title: 'HyperConverged Infrastructure', description: 'Integrated computing and storage' },
    { icon: '📦', title: 'Software Defined Storage', description: 'Flexible storage solutions' },
    { icon: '📊', title: 'Big Data & Analytics', description: 'Process and analyze large datasets' },
    { icon: '💾', title: 'Archiving & Backup', description: 'Secure data preservation' },
    { icon: '🔐', title: 'Confidential Computing', description: 'Enhanced data privacy' },
    { icon: '🗄️', title: 'Databases on Bare Metal', description: 'High-performance database hosting' },
    { icon: '🎮', title: 'Gaming on Bare Metal', description: 'Low-latency game server hosting' },
    { icon: '⚡', title: 'High Performance Computing', description: 'Compute-intensive workloads' },
  ];

  return (
    <Box>
      {/* Main Hero Section with Carousel as Centerpiece */}
      <Box
        sx={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&h=900&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          color: 'white',
          py: { xs: 8, md: 10 },
          minHeight: '600px',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(30, 58, 138, 0.75)',
            zIndex: 1,
          },
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
          {/* Hero Header */}
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                mb: 2,
                fontSize: { xs: '2.5rem', md: '4rem' },
                background: `linear-gradient(135deg, ${accentCyan}, #60a5fa)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              atonixcorp
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 300,
                color: accentCyan,
                mb: 2,
              }}
            >
              Intelligent Infrastructure for the Future
            </Typography>
          </Box>

          {/* Hero: clean gradient background with centered write-up */}
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mb: 6 }}>
            <Box sx={{ width: '100%', maxWidth: 1100, position: 'relative', borderRadius: 3, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.25)' }}>
              <Box sx={{
                height: { xs: 320, md: 480 },
                background: `linear-gradient(135deg, ${primaryBlue} 0%, ${darkGray} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 3,
              }}>
                <Box sx={{ color: 'white', textAlign: 'center', maxWidth: 760 }}>
                  <Typography variant="h2" sx={{ fontWeight: 800, mb: 1, fontSize: { xs: '2rem', md: '3rem' } }}>
                    atonixcorp
                  </Typography>
                  <Typography variant="h5" sx={{ color: 'white', fontWeight: 300, mb: 2 }}>
                    Intelligent Infrastructure for the Future
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'white', opacity: 0.95, mb: 3, fontSize: '1.05rem', lineHeight: 1.6 }}>
                    At atonixcorp, we unify compute, storage, networking, automation, and AI-driven intelligence into one secure, scalable ecosystem. Built for developers and enterprises who demand reliability without complexity.
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} gap={2} justifyContent="center">
                    <Button variant="contained" size="large" sx={{ bgcolor: accentCyan, color: primaryBlue, fontWeight: 700, px: 4 }}>
                      Get Started
                    </Button>
                    <Button variant="outlined" size="large" sx={{ borderColor: 'rgba(255,255,255,0.85)', color: 'white', px: 4 }}>
                      Learn More
                    </Button>
                  </Stack>
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Product Showcase */}
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
              gap: 3,
            }}
          >
            {products.map((product, idx) => (
              <Card
                key={idx}
                sx={{
                  position: 'relative',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-12px)',
                    boxShadow: '0 12px 32px rgba(30, 58, 138, 0.15)',
                  },
                }}
              >
                {product.badge && (
                  <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                    <Chip
                      label={product.badge}
                      size="small"
                      sx={{
                        bgcolor: accentCyan,
                        color: 'white',
                        fontWeight: 700,
                      }}
                    />
                  </Box>
                )}
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ mb: 2 }}>{product.icon}</Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: darkGray }}>
                    {product.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: accentCyan,
                      fontWeight: 600,
                      mb: 2,
                    }}
                  >
                    {product.subtitle}
                  </Typography>
                  <Typography variant="body2" sx={{ color: darkGray, mb: 2, opacity: 0.8 }}>
                    {product.description}
                  </Typography>
                  <Stack gap={1} sx={{ mb: 3 }}>
                    {product.features.map((feature, fIdx) => (
                      <Stack key={fIdx} direction="row" gap={1} alignItems="flex-start">
                        <CheckCircleIcon sx={{ color: accentCyan, fontSize: 20, flexShrink: 0, mt: 0.3 }} />
                        <Typography variant="body2" sx={{ color: darkGray }}>
                          {feature}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                  {product.price && (
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: primaryBlue,
                        mb: 2,
                      }}
                    >
                      {product.price}
                    </Typography>
                  )}
                  <Button
                    fullWidth
                    variant="contained"
                    endIcon={<ArrowRightIcon />}
                    sx={{
                      bgcolor: accentCyan,
                      color: primaryBlue,
                      fontWeight: 700,
                      '&:hover': { bgcolor: '#0891b2' },
                    }}
                  >
                    {product.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Use Cases Section */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: lightGray }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 2,
              textAlign: 'center',
              color: primaryBlue,
            }}
          >
            Built for Every Use Case
          </Typography>
          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              color: darkGray,
              mb: 6,
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            Whether you're building a website, running HPC workloads, or managing enterprise databases, we have the infrastructure you need.
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
              gap: 2,
            }}
          >
            {useCases.map((useCase, idx) => (
              <Box key={idx}>
                <Box
                  sx={{
                    p: 3,
                    bgcolor: 'white',
                    borderRadius: 2,
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: accentCyan,
                      boxShadow: `0 0 0 3px ${accentCyan}22`,
                    },
                  }}
                >
                  <Typography sx={{ fontSize: '2rem', mb: 1 }}>{useCase.icon}</Typography>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: darkGray,
                      mb: 0.5,
                    }}
                  >
                    {useCase.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: darkGray, opacity: 0.75 }}>
                    {useCase.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Global Availability */}
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: 'column', md: 'row' }} gap={4} alignItems="center">
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  mb: 3,
                  color: primaryBlue,
                }}
              >
                Global Infrastructure
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: '1.1rem',
                  color: darkGray,
                  lineHeight: 1.8,
                  mb: 3,
                }}
              >
                Our global presence spans 46 data centers across 4 continents, ensuring low-latency access from anywhere in the world.
              </Typography>
              <Stack gap={2}>
                {[
                  'Americas: USA, Canada, Brazil',
                  'Europe: France, Germany, UK, more',
                  'Asia-Pacific: Singapore, Sydney, Tokyo',
                  'Anti-DDoS protection included',
                  'vRack private network connectivity',
                ].map((item, idx) => (
                  <Stack key={idx} direction="row" gap={2} alignItems="center">
                    <PublicIcon sx={{ color: accentCyan, fontSize: 24 }} />
                    <Typography sx={{ color: darkGray, fontWeight: 500 }}>{item}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
            <Box
              sx={{
                flex: 1,
                bgcolor: lightGray,
                p: 4,
                borderRadius: 2,
                textAlign: 'center',
                minHeight: { xs: '300px', md: '400px' },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography
                sx={{
                  fontSize: '4rem',
                  fontWeight: 800,
                  color: accentCyan,
                }}
              >
                🌍 46 Data Centers
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${primaryBlue} 0%, ${darkGray} 100%)`,
          color: 'white',
          py: { xs: 6, md: 8 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
            Ready to Scale?
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 300, mb: 4, opacity: 0.95 }}>
            Join thousands of businesses running their infrastructure on atonixcorp
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} gap={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: accentCyan,
                color: primaryBlue,
                fontWeight: 700,
                px: 4,
              }}
            >
              Get $200 Credit
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'white',
                color: 'white',
                fontWeight: 700,
                px: 4,
              }}
            >
              Schedule Demo
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default EnhancedHomepage;
