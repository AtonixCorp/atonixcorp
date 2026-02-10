import React from 'react';
import { Box, Container, Typography, Button, Card, CardContent, Stack, Chip } from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';

const PricingPage: React.FC = () => {
  const primaryBlue = '#1E3A8A';
  const accentCyan = '#06B6D4';
  const darkGray = '#1F2937';
  const lightGray = '#F3F4F6';

  const pricingPlans = [
    {
      name: 'Starter',
      price: '$29',
      period: '/month',
      description: 'Perfect for small projects and development',
      features: [
        'Up to 10 GB storage',
        '100,000 API calls/day',
        '1 GB bandwidth/month',
        'Basic support',
        'Community access',
      ],
      cta: 'Get Started',
      highlighted: false,
    },
    {
      name: 'Professional',
      price: '$99',
      period: '/month',
      description: 'For growing teams and applications',
      features: [
        'Up to 1 TB storage',
        '10M API calls/day',
        '100 GB bandwidth/month',
        'Priority support',
        'Advanced analytics',
        'Custom domains',
      ],
      cta: 'Start Free Trial',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'For large-scale deployments',
      features: [
        'Unlimited storage',
        'Unlimited API calls',
        'Unlimited bandwidth',
        '24/7 dedicated support',
        'Custom SLA',
        'On-premise option',
      ],
      cta: 'Contact Sales',
      highlighted: false,
    },
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
            Simple, Transparent Pricing
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 300, opacity: 0.9 }}>
            Choose the perfect plan for your needs. Always flexible to scale.
          </Typography>
        </Container>
      </Box>

      {/* Pricing Plans */}
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
              gap: 3,
            }}
          >
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                sx={{
                  height: '100%',
                  border: plan.highlighted ? `2px solid ${accentCyan}` : '1px solid #e5e7eb',
                  boxShadow: plan.highlighted ? `0 12px 24px ${accentCyan}33` : '0 4px 12px rgba(0, 0, 0, 0.08)',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                  },
                }}
              >
                {plan.highlighted && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -15,
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}
                  >
                    <Chip
                      label="MOST POPULAR"
                      sx={{
                        bgcolor: accentCyan,
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                      }}
                    />
                  </Box>
                )}
                <CardContent sx={{ p: 3, pt: plan.highlighted ? 4 : 3 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      color: darkGray,
                    }}
                  >
                    {plan.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: darkGray,
                      mb: 2,
                      opacity: 0.7,
                    }}
                  >
                    {plan.description}
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      sx={{
                        fontSize: '2.5rem',
                        fontWeight: 800,
                        color: primaryBlue,
                      }}
                    >
                      {plan.price}
                      <Typography
                        component="span"
                        sx={{
                          fontSize: '1rem',
                          fontWeight: 400,
                          color: darkGray,
                          ml: 1,
                        }}
                      >
                        {plan.period}
                      </Typography>
                    </Typography>
                  </Box>
                  <Button
                    fullWidth
                    variant={plan.highlighted ? 'contained' : 'outlined'}
                    sx={{
                      bgcolor: plan.highlighted ? accentCyan : 'transparent',
                      color: plan.highlighted ? primaryBlue : accentCyan,
                      borderColor: plan.highlighted ? 'transparent' : accentCyan,
                      fontWeight: 700,
                      mb: 3,
                      '&:hover': {
                        bgcolor: plan.highlighted ? '#0891b2' : `${accentCyan}15`,
                      },
                    }}
                  >
                    {plan.cta}
                  </Button>
                  <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                    {plan.features.map((feature, fIndex) => (
                      <Box
                        component="li"
                        key={fIndex}
                        sx={{
                          display: 'flex',
                          gap: 1,
                          mb: 1,
                          color: darkGray,
                          fontSize: '0.95rem',
                        }}
                      >
                        <CheckCircleIcon
                          sx={{
                            fontSize: 20,
                            color: accentCyan,
                            flexShrink: 0,
                          }}
                        />
                        <span>{feature}</span>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: lightGray }}>
        <Container maxWidth="md">
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              mb: 6,
              textAlign: 'center',
              color: primaryBlue,
            }}
          >
            Frequently Asked Questions
          </Typography>
          <Stack gap={2}>
            {[
              {
                q: 'Can I change plans anytime?',
                a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.',
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes, all plans come with a 30-day free trial. No credit card required to get started.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, ACH transfers, and wire transfers for enterprise customers.',
              },
              {
                q: 'Do you offer discounts for annual billing?',
                a: 'Yes! Annual plans get 20% off. Contact our sales team for volume discounts.',
              },
            ].map((faq, idx) => (
              <Box
                key={idx}
                sx={{
                  p: 3,
                  bgcolor: 'white',
                  borderRadius: 2,
                  border: `1px solid #e5e7eb`,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: darkGray,
                    mb: 1,
                  }}
                >
                  {faq.q}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: darkGray,
                    opacity: 0.75,
                  }}
                >
                  {faq.a}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default PricingPage;
