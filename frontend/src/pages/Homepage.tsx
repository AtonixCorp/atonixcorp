import React, { useState } from 'react';
import { Box, Container, Typography, Button, Stack, Card, CardContent, Chip } from '@mui/material';
import {
  Cloud as CloudIcon,
  Dns as DnsIcon,
  Bolt as BoltIcon,
  CheckCircle as CheckCircleIcon,
  ArrowRight as ArrowRightIcon,
} from '@mui/icons-material';
import LoginDialog from '../components/Auth/LoginDialog';
import SignupDialog from '../components/Auth/SignupDialog';

const Homepage: React.FC = () => {
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  const primaryBlue = '#06B6DA';
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
    { icon: '', title: 'Website Business', description: 'Host your websites and web applications' },
    { icon: '', title: 'HyperConverged Infrastructure', description: 'Integrated computing and storage' },
    { icon: '', title: 'Software Defined Storage', description: 'Flexible storage solutions' },
    { icon: '', title: 'Big Data & Analytics', description: 'Process and analyze large datasets' },
    { icon: '', title: 'Archiving & Backup', description: 'Secure data preservation' },
    { icon: '', title: 'Confidential Computing', description: 'Enhanced data privacy' },
    { icon: '', title: 'Databases on Bare Metal', description: 'High-performance database hosting' },
    { icon: '', title: 'Gaming on Bare Metal', description: 'Low-latency game server hosting' },
    { icon: '', title: 'High Performance Computing', description: 'Compute-intensive workloads' },
  ];

  const capabilities = [
    {
      title: 'High-Performance Compute',
      bullets: [
        'Virtual Machines',
        'Containers (Kubernetes / Docker)',
        'Serverless functions',
        'GPU‑accelerated workloads',
        'Auto‑scaling compute clusters',
      ],
    },
    {
      title: 'Scalable Storage Services',
      bullets: [
        'Object storage (S3‑compatible)',
        'Block storage',
        'File storage',
        'Intelligent caching',
        'Automated tiering',
      ],
    },
    {
      title: 'Advanced Networking',
      bullets: [
        'Software‑defined networking (SDN)',
        'Load balancers',
        'Private VPCs',
        'Global CDN',
        'DDoS protection',
      ],
    },
    {
      title: 'Automation & Orchestration',
      bullets: [
        'Infrastructure‑as‑Code',
        'CI/CD pipelines',
        'Auto‑scaling policies',
        'Self‑healing infrastructure',
        'Automated backups & snapshots',
      ],
    },
    {
      title: 'AI‑Driven Optimization',
      bullets: [
        'Predictive scaling',
        'Real‑time anomaly detection',
        'Intelligent resource allocation',
        'AI‑powered monitoring',
        'Autonomous security responses',
      ],
    },
    {
      title: 'Developer‑First Tools',
      bullets: [
        'REST & GraphQL APIs',
        'CLI tools',
        'SDKs (Python, Node.js, Go, Java)',
        'Pre‑built templates & blueprints',
        'Git‑based deployments',
      ],
    },
    {
      title: 'Security & Compliance',
      bullets: [
        'Zero‑trust architecture',
        'Encryption at rest & in transit',
        'Identity & Access Management (IAM)',
        'Role‑based access control (RBAC)',
        'SOC 2 / ISO 27001 / GDPR‑ready',
      ],
    },
    {
      title: 'Reliability & Performance',
      bullets: ['Multi‑region availability', '99.99% uptime SLA'],
    },
  ];

  return (
    <Box>
      {/* Main Hero — Professional Split Layout */}
      <Box
        id="hero"
        sx={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          color: 'white',
          py: { xs: 8, md: 12 },
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(2,6,23,0.55), rgba(2,6,23,0.38))',
            zIndex: 1,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 3 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: { xs: 4, md: 6 },
              alignItems: 'center',
            }}
          >
            {/* Left: Messaging */}
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 900,
                  lineHeight: 1.02,
                  fontSize: { xs: '2rem', md: '2.6rem' },
                  color: '#ffffff',
                  mb: 1,
                  textShadow: '0 6px 20px rgba(2,6,23,0.6)',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                }}
              >
                AtonixCorp
              </Typography>
              <Typography variant="h6" sx={{ color: accentCyan, fontWeight: 600, mb: 3, textShadow: '0 4px 14px rgba(2,6,23,0.45)' }}>
                Sovereign. Scalable. Intelligent.
              </Typography>

              <Typography variant="body1" sx={{ color: '#e6eef7', mb: 2, maxWidth: 760, textShadow: '0 4px 14px rgba(2,6,23,0.45)', overflowWrap: 'break-word' }}>
                AtonixCorp delivers a unified cloud infrastructure built for the businesses shaping tomorrow. Whether
                public, private, or hybrid, our platform empowers developers, enterprises, and innovators with secure
                compute, resilient storage, programmable networking, and AI‑driven automation — all orchestrated through a
                high‑performance control plane.
              </Typography>

              <Typography variant="body2" sx={{ color: '#cfeafe', mb: 3, fontStyle: 'italic', textShadow: '0 3px 10px rgba(2,6,23,0.4)' }}>
                Built on OpenStack. Powered by AMD, Intel, and NVIDIA. Secured by design.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                <Button variant="contained" sx={{ bgcolor: accentCyan, color: '#05243b', fontWeight: 700, px: 3 }} onClick={() => setSignupOpen(true)}>
                  Get Started
                </Button>
                <Button variant="outlined" sx={{ borderColor: '#2b6f8f', color: '#cfeafe' }} onClick={() => setLoginOpen(true)}>
                  Sign In
                </Button>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" sx={{ color: '#e6eef7', fontWeight: 700, mb: 0.5 }}>
                  From virtual machines to Kubernetes, from object storage to GPU‑accelerated AI —
                </Typography>
                <Stack direction="column" sx={{ color: '#ffffff', mt: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#ffffff' }}>Start building with confidence.</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#ffffff' }}>Deploy with precision.</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#ffffff' }}>Scale without compromise.</Typography>
                </Stack>
              </Box>
            </Box>

            {/* Right: Visual Accent / Feature Panel */}
            <Box>
              <Box
                sx={{
                  borderRadius: 3,
                  p: { xs: 3, md: 4 },
                  minHeight: 320,
                  bgcolor: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
                  border: '1px solid rgba(255,255,255,0.04)',
                  boxShadow: '0 10px 40px rgba(2,6,23,0.6)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#02102a22' }}>
                    <Typography sx={{ fontWeight: 700, color: '#e6eef7' }}>Compute</Typography>
                    <Typography variant="body2" sx={{ color: '#cfeafe', mt: 0.5 }}>
                      VMs, Containers, Serverless, GPU
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#02102a22' }}>
                    <Typography sx={{ fontWeight: 700, color: '#e6eef7' }}>Storage</Typography>
                    <Typography variant="body2" sx={{ color: '#cfeafe', mt: 0.5 }}>
                      Object, Block, File, Tiering
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#02102a22' }}>
                    <Typography sx={{ fontWeight: 700, color: '#e6eef7' }}>Networking</Typography>
                    <Typography variant="body2" sx={{ color: '#cfeafe', mt: 0.5 }}>
                      SDN, Load Balancers, Global CDN
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#02102a22' }}>
                    <Typography sx={{ fontWeight: 700, color: '#e6eef7' }}>AI & Automation</Typography>
                    <Typography variant="body2" sx={{ color: '#cfeafe', mt: 0.5 }}>
                      Predictive scaling & anomaly detection
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Product Showcase */}
      <Box id="products" sx={{ py: { xs: 6, md: 8 } }}>
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
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'linear-gradient(160deg, #0b1220 0%, #111827 100%)',
                  boxShadow: '0 10px 28px rgba(2, 6, 23, 0.35)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-12px)',
                    boxShadow: '0 14px 36px rgba(2, 6, 23, 0.45)',
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
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: '#ffffff' }}>
                    {product.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#ffffff',
                      fontWeight: 600,
                      opacity: 0.92,
                      mb: 2,
                    }}
                  >
                    {product.subtitle}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#ffffff', mb: 2, opacity: 0.88 }}>
                    {product.description}
                  </Typography>
                  <Stack gap={1} sx={{ mb: 3 }}>
                    {product.features.map((feature, fIdx) => (
                      <Stack key={fIdx} direction="row" gap={1} alignItems="flex-start">
                        <CheckCircleIcon sx={{ color: accentCyan, fontSize: 20, flexShrink: 0, mt: 0.3 }} />
                        <Typography variant="body2" sx={{ color: '#ffffff', opacity: 0.95 }}>
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
                        color: '#ffffff',
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

      {/* Platform Capabilities Section */}
      <Box id="capabilities" sx={{ py: { xs: 6, md: 10 }, bgcolor: '#fff' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            sx={{ fontWeight: 800, mb: 2, textAlign: 'center', color: primaryBlue }}
          >
            Platform Capabilities
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: 'center', color: darkGray, mb: 4, maxWidth: '760px', mx: 'auto' }}
          >
            Comprehensive, production‑ready infrastructure and developer tooling to power cloud‑native applications and enterprise workloads.
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
              gap: 2,
            }}
          >
            {capabilities.map((cap, idx) => (
              <Box
                key={idx}
                sx={{
                  p: 3,
                  bgcolor: 'white',
                  borderRadius: 2,
                  border: '1px solid #e6eef2',
                  minHeight: 180,
                }}
              >
                <Typography sx={{ fontWeight: 700, mb: 1, color: darkGray }}>{cap.title}</Typography>
                <Stack gap={0.75} sx={{ mt: 1 }}>
                  {cap.bullets.map((b, i) => (
                    <Stack key={i} direction="row" gap={1} alignItems="flex-start">
                      <CheckCircleIcon sx={{ color: accentCyan, fontSize: 18, mt: 0.3 }} />
                      <Typography variant="body2" sx={{ color: darkGray, fontSize: '0.95rem' }}>
                        {b}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Use Cases Section */}
      <Box id="use-cases" sx={{ py: { xs: 6, md: 8 }, bgcolor: lightGray }}>
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

      {/* CTA Section */}
      <Box
        id="cta"
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
              sx={{ bgcolor: accentCyan, color: primaryBlue, fontWeight: 700, px: 4 }}
              onClick={() => setSignupOpen(true)}
            >
              Get Started Free
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{ borderColor: 'white', color: 'white', fontWeight: 700, px: 4 }}
              onClick={() => setLoginOpen(true)}
            >
              Sign In
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Auth Dialogs */}
      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} onSwitchToSignup={() => { setLoginOpen(false); setSignupOpen(true); }} />
      <SignupDialog open={signupOpen} onClose={() => setSignupOpen(false)} onSwitchToLogin={() => { setSignupOpen(false); setLoginOpen(true); }} />
    </Box>
  );
};

export default Homepage;
