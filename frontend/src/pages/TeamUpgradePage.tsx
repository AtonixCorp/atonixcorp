import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Group,
  Check,
  Star,
  Payment,
  CreditCard,
  Security,
  ArrowBack,
  Info,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { Team, TeamMembership } from '../types/api';
import { teamsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/Layout/DashboardLayout';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
  savings?: number;
}

const TeamUpgradePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [team, setTeam] = useState<Team | null>(null);
  const [membership, setMembership] = useState<TeamMembership | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutStep, setCheckoutStep] = useState(0);
  const [paymentDialog, setPaymentDialog] = useState(false);

  // Payment form state
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [billingAddress, setBillingAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  });

  const pricingPlans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      interval: 'month',
      features: [
        'Up to 5 team members',
        'Basic project management',
        'Team chat',
        'File sharing (5GB)',
        'Community support',
      ],
    },
    {
      id: 'premium-monthly',
      name: 'Premium',
      price: 29,
      interval: 'month',
      features: [
        'Up to 50 team members',
        'Advanced project management',
        'Priority support',
        'File sharing (100GB)',
        'Team analytics',
        'Custom integrations',
        'Advanced security',
      ],
      popular: true,
    },
    {
      id: 'premium-yearly',
      name: 'Premium Yearly',
      price: 290,
      interval: 'year',
      features: [
        'Up to 50 team members',
        'Advanced project management',
        'Priority support',
        'File sharing (100GB)',
        'Team analytics',
        'Custom integrations',
        'Advanced security',
      ],
      savings: 20, // 20% savings
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99,
      interval: 'month',
      features: [
        'Unlimited team members',
        'All Premium features',
        'Dedicated support',
        'Unlimited storage',
        'Custom branding',
        'API access',
        'Advanced analytics',
        'SSO integration',
      ],
    },
  ];

  const checkoutSteps = ['Select Plan', 'Payment Details', 'Confirmation'];

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!slug) {
        setError('Team not found');
        setLoading(false);
        return;
      }

      try {
        // Fetch team details
        const teamResponse = await teamsApi.getBySlug(slug);
        setTeam(teamResponse.data);

        // Fetch user's membership status
        try {
          const membershipResponse = await teamsApi.getMembership(slug);
          setMembership(membershipResponse.data);
        } catch (membershipError) {
          // User might not be a member
          setMembership(null);
        }
      } catch (err) {
        setError('Error loading team upgrade page');
        console.error('Error fetching team data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [slug]);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setCheckoutStep(1);
  };

  const handlePaymentSubmit = async () => {
    // Mock payment processing
    setCheckoutStep(2);

    // Simulate payment processing delay
    setTimeout(() => {
      setPaymentDialog(true);
    }, 2000);
  };

  const handlePaymentComplete = () => {
    setPaymentDialog(false);
    // In real app, this would update the membership status
    navigate(`/teams/${slug}/dashboard`);
  };

  const formatPrice = (price: number, interval: string) => {
    if (price === 0) return 'Free';
    return `$${price}/${interval === 'year' ? 'year' : 'mo'}`;
  };

  const getSelectedPlan = () => {
    return pricingPlans.find(plan => plan.id === selectedPlan);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography variant="h4" sx={{ mb: 4 }}>Loading Team Upgrade...</Typography>
        </Container>
      </DashboardLayout>
    );
  }

  if (error || !team) {
    return (
      <DashboardLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 4 }}>
            {error || 'Team not found'}
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate(`/teams/${slug}/dashboard`)}
          >
            Back to Team Dashboard
          </Button>
        </Container>
      </DashboardLayout>
    );
  }

  // Check if user is already premium
  if (membership?.membership_type === 'premium' || membership?.membership_type === 'admin' || membership?.membership_type === 'lead') {
    return (
      <DashboardLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="success" sx={{ mb: 4 }}>
            You already have premium access to {team.name}!
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate(`/teams/${slug}/dashboard`)}
          >
            Go to Team Dashboard
          </Button>
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Paper
          sx={{
            p: 4,
            mb: 4,
            background: `linear-gradient(135deg, ${team.color_theme} 0%, ${team.color_theme}CC 100%)`,
            color: 'white',
            textAlign: 'center',
          }}
        >
          <Star sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h3" component="h1" fontWeight="bold" sx={{ mb: 2 }}>
            Upgrade {team.name}
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Unlock premium features and take your team to the next level
          </Typography>
        </Paper>

        {/* Checkout Progress */}
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={checkoutStep} alternativeLabel>
            {checkoutSteps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {checkoutStep === 0 && (
          /* Plan Selection */
          <Box>
            <Typography variant="h4" fontWeight="bold" textAlign="center" sx={{ mb: 4 }}>
              Choose Your Plan
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
              {pricingPlans.map((plan) => (
                <Card
                  key={plan.id}
                  sx={{
                    height: '100%',
                    position: 'relative',
                    border: plan.popular ? `2px solid ${team.color_theme}` : '1px solid #e2e8f0',
                    transform: plan.popular ? 'scale(1.05)' : 'none',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: plan.popular ? 'scale(1.07)' : 'scale(1.02)',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    },
                  }}
                >
                  {plan.popular && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -12,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        bgcolor: team.color_theme,
                        color: 'white',
                        px: 2,
                        py: 0.5,
                        borderRadius: 2,
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                      }}
                    >
                      MOST POPULAR
                    </Box>
                  )}

                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                      {plan.name}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h3" fontWeight="bold" color="primary">
                        {formatPrice(plan.price, plan.interval)}
                      </Typography>
                      {plan.savings && (
                        <Typography variant="body2" color="success.main" fontWeight="600">
                          Save {plan.savings}%
                        </Typography>
                      )}
                    </Box>

                    <List dense sx={{ mb: 3 }}>
                      {plan.features.map((feature, index) => (
                        <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <Check color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={feature}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                    </List>

                    <Button
                      variant={plan.id === 'free' ? 'outlined' : 'contained'}
                      fullWidth
                      onClick={() => handlePlanSelect(plan.id)}
                      disabled={plan.id === 'free'}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                      {plan.id === 'free' ? 'Current Plan' : 'Select Plan'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        )}

        {checkoutStep === 1 && (
          /* Payment Details */
          <Box>
            <Typography variant="h4" fontWeight="bold" textAlign="center" sx={{ mb: 4 }}>
              Payment Details
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 4 }}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                    <Payment sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Payment Information
                  </Typography>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, mb: 3 }}>
                    <TextField
                      label="Cardholder Name"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      fullWidth
                      required
                    />
                    <TextField
                      label="Card Number"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      fullWidth
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                    <TextField
                      label="Expiry Date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      fullWidth
                      placeholder="MM/YY"
                      required
                    />
                    <TextField
                      label="CVV"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      fullWidth
                      required
                    />
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                    Billing Address
                  </Typography>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                    <TextField
                      label="Address Line 1"
                      value={billingAddress.line1}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, line1: e.target.value }))}
                      fullWidth
                      required
                    />
                    <TextField
                      label="Address Line 2 (Optional)"
                      value={billingAddress.line2}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, line2: e.target.value }))}
                      fullWidth
                    />
                    <TextField
                      label="City"
                      value={billingAddress.city}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, city: e.target.value }))}
                      fullWidth
                      required
                    />
                    <TextField
                      label="State"
                      value={billingAddress.state}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, state: e.target.value }))}
                      fullWidth
                      required
                    />
                    <TextField
                      label="ZIP Code"
                      value={billingAddress.zipCode}
                      onChange={(e) => setBillingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                      fullWidth
                      required
                    />
                  </Box>
                </CardContent>
              </Card>

              <Card sx={{ position: 'sticky', top: 20 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    Order Summary
                  </Typography>

                  {getSelectedPlan() && (
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body1">{getSelectedPlan()?.name}</Typography>
                        <Typography variant="body1" fontWeight="600">
                          {formatPrice(getSelectedPlan()!.price, getSelectedPlan()!.interval)}
                        </Typography>
                      </Box>

                      {getSelectedPlan()!.savings && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="body2" color="success.main">
                            Yearly savings
                          </Typography>
                          <Typography variant="body2" color="success.main" fontWeight="600">
                            -${getSelectedPlan()!.price * 0.2}
                          </Typography>
                        </Box>
                      )}

                      <Divider sx={{ my: 2 }} />

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant="h6" fontWeight="bold">Total</Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          {formatPrice(getSelectedPlan()!.price, getSelectedPlan()!.interval)}
                        </Typography>
                      </Box>

                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={handlePaymentSubmit}
                        startIcon={<CreditCard />}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          py: 1.5,
                        }}
                      >
                        Complete Payment
                      </Button>
                    </Box>
                  )}

                  <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Security sx={{ fontSize: 16, mr: 1, color: 'success.main' }} />
                      <Typography variant="body2" fontWeight="600">
                        Secure Payment
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Your payment information is encrypted and secure. We use industry-standard security measures.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button
                onClick={() => setCheckoutStep(0)}
                startIcon={<ArrowBack />}
                sx={{ textTransform: 'none' }}
              >
                Back to Plans
              </Button>
            </Box>
          </Box>
        )}

        {checkoutStep === 2 && (
          /* Processing Payment */
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
              Processing Your Payment
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Please wait while we securely process your payment...
            </Typography>

            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  border: '4px solid #e2e8f0',
                  borderTop: '4px solid #3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  mr: 2,
                }}
              />
              <Typography variant="h6">Processing...</Typography>
            </Box>
          </Box>
        )}

        {/* Payment Success Dialog */}
        <Dialog open={paymentDialog} onClose={handlePaymentComplete} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
            Payment Successful!
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Welcome to Premium!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your team {team.name} now has premium access. You can start using all the advanced features immediately.
            </Typography>

            <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 2, color: 'success.contrastText' }}>
              <Typography variant="body2" fontWeight="600">
                ✓ Premium features activated
              </Typography>
              <Typography variant="body2" fontWeight="600">
                ✓ Unlimited team members
              </Typography>
              <Typography variant="body2" fontWeight="600">
                ✓ Advanced analytics
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center' }}>
            <Button
              onClick={handlePaymentComplete}
              variant="contained"
              size="large"
              sx={{ minWidth: 200 }}
            >
              Go to Team Dashboard
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardLayout>
  );
};



export default TeamUpgradePage;
