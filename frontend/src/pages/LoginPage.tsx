import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Alert,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  Divider,
  Select,
  MenuItem,
  Card,
  CardContent,
  Link,
} from '@mui/material';
import {
  Person,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Business,
  Domain,
  Web,
  LocationOn,
  ArrowBack,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SignupRequest, OrganizationRegistrationRequest } from '../types/auth';
import { SelectChangeEvent } from '@mui/material';

type RegistrationType = 'individual' | 'organization';

const LoginPage: React.FC = () => {
  const { signup, signupOrganization } = useAuth();
  const navigate = useNavigate();

  const [registrationType, setRegistrationType] = useState<RegistrationType>('individual');

  // Individual registration state
  const [individualData, setIndividualData] = useState<SignupRequest>({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
  });

  // Organization registration state - combined user and org data
  const [orgUserData, setOrgUserData] = useState<SignupRequest>({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
  });

  const [organizationData, setOrganizationData] = useState<OrganizationRegistrationRequest>({
    name: '',
    domain: '',
    description: '',
    website: '',
    industry: '',
    size: '',
    location: '',
    admin_email: '', // Will be set to orgUserData.email
    admin_first_name: '', // Will be set to orgUserData.first_name
    admin_last_name: '', // Will be set to orgUserData.last_name
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRegistrationType(event.target.value as RegistrationType);
    setError(null); // Clear any existing errors
  };

  const handleIndividualInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setIndividualData((prev: SignupRequest) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(null);
  };

  const handleOrgUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOrgUserData((prev: SignupRequest) => ({
      ...prev,
      [name]: value,
    }));

    // Also update organization admin fields when user fields change
    if (name === 'email') {
      setOrganizationData((prev: OrganizationRegistrationRequest) => ({ ...prev, admin_email: value }));
    } else if (name === 'first_name') {
      setOrganizationData((prev: OrganizationRegistrationRequest) => ({ ...prev, admin_first_name: value }));
    } else if (name === 'last_name') {
      setOrganizationData((prev: OrganizationRegistrationRequest) => ({ ...prev, admin_last_name: value }));
    }

    if (error) setError(null);
  };

  const handleOrganizationSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setOrganizationData((prev: OrganizationRegistrationRequest) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOrganizationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOrganizationData((prev: OrganizationRegistrationRequest) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(null);
  };

  const validateIndividualForm = (): string | null => {
    if (!individualData.username) return 'Username is required';
    if (individualData.username.length < 3) return 'Username must be at least 3 characters';
    if (!individualData.email) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(individualData.email)) return 'Please enter a valid email';
    if (!individualData.first_name) return 'First name is required';
    if (!individualData.last_name) return 'Last name is required';
    if (!individualData.password) return 'Password is required';
    if (individualData.password.length < 8) return 'Password must be at least 8 characters';
    if (individualData.password !== individualData.confirm_password) return 'Passwords do not match';
    if (!acceptTerms) return 'Please accept the terms and conditions';
    return null;
  };

  const validateOrganizationForm = (): string | null => {
    // Validate user data
    if (!orgUserData.username) return 'Username is required';
    if (orgUserData.username.length < 3) return 'Username must be at least 3 characters';
    if (!orgUserData.email) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(orgUserData.email)) return 'Please enter a valid email';
    if (!orgUserData.first_name) return 'First name is required';
    if (!orgUserData.last_name) return 'Last name is required';
    if (!orgUserData.password) return 'Password is required';
    if (orgUserData.password.length < 8) return 'Password must be at least 8 characters';
    if (orgUserData.password !== orgUserData.confirm_password) return 'Passwords do not match';

    // Validate organization data
    if (!organizationData.name) return 'Organization name is required';
    if (!organizationData.domain) return 'Domain is required';
    if (!acceptTerms) return 'Please accept the terms and conditions';

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let validationError: string | null = null;
    if (registrationType === 'individual') {
      validationError = validateIndividualForm();
    } else {
      validationError = validateOrganizationForm();
    }

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (registrationType === 'individual') {
        console.log('Individual registration submitting:', individualData);
        await signup(individualData);
        console.log('Individual registration success!');
        navigate('/dashboard');
      } else {
        console.log('Organization registration submitting:', { userData: orgUserData, orgData: organizationData });
        await signupOrganization(orgUserData, organizationData);
        console.log('Organization registration success!');
        navigate('/dashboard/enterprise');
      }
    } catch (err: any) {
      console.error(`${registrationType} registration error:`, err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Manufacturing',
    'Retail',
    'Consulting',
    'Government',
    'Non-profit',
    'Other',
  ];

  const companySizes = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-500 employees',
    '501-1000 employees',
    '1000+ employees',
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ mb: 4 }}>
          <Button
            component={RouterLink}
            to="/"
            startIcon={<ArrowBack />}
            sx={{
              color: '#64748b',
              '&:hover': {
                backgroundColor: 'rgba(59, 130, 246, 0.08)',
              },
            }}
          >
            Back to Home
          </Button>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Card
            elevation={0}
            sx={{
              maxWidth: 800,
              width: '100%',
              borderRadius: '24px',
              border: '1px solid #e2e8f0',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <CardContent sx={{ p: { xs: 4, md: 6 } }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Person sx={{ fontSize: 48, color: '#3b82f6', mb: 2 }} />
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Join AtonixCorp
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Create your account and become part of our community
                </Typography>
              </Box>

              {/* Registration Type Selection */}
              <Box sx={{ mb: 4 }}>
                <FormControl component="fieldset">
                  <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600, color: '#1e293b' }}>
                    Choose Registration Type
                  </FormLabel>
                  <RadioGroup
                    row
                    value={registrationType}
                    onChange={handleTypeChange}
                    sx={{ justifyContent: 'center' }}
                  >
                    <FormControlLabel
                      value="individual"
                      control={<Radio sx={{ color: '#3b82f6', '&.Mui-checked': { color: '#3b82f6' } }} />}
                      label={
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="body1" fontWeight={600}>Individual</Typography>
                          <Typography variant="caption" color="text.secondary">Free Account</Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="organization"
                      control={<Radio sx={{ color: '#3b82f6', '&.Mui-checked': { color: '#3b82f6' } }} />}
                      label={
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="body1" fontWeight={600}>Organization</Typography>
                          <Typography variant="caption" color="text.secondary">Enterprise Features</Typography>
                        </Box>
                      }
                    />
                  </RadioGroup>
                </FormControl>
              </Box>

              <Divider sx={{ mb: 4 }} />

              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                {registrationType === 'individual' ? (
                  /* Individual Registration Form */
                  <>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: '#1e293b' }}>
                      Personal Information
                    </Typography>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, mb: 3 }}>
                      <TextField
                        fullWidth
                        label="First Name"
                        name="first_name"
                        value={individualData.first_name}
                        onChange={handleIndividualInputChange}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person sx={{ color: '#64748b' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                          },
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Last Name"
                        name="last_name"
                        value={individualData.last_name}
                        onChange={handleIndividualInputChange}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person sx={{ color: '#64748b' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                          },
                        }}
                      />
                    </Box>

                    <TextField
                      fullWidth
                      label="Username"
                      name="username"
                      value={individualData.username}
                      onChange={handleIndividualInputChange}
                      required
                      helperText="Choose a unique username (minimum 3 characters)"
                      sx={{ mb: 3 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person sx={{ color: '#64748b' }} />
                          </InputAdornment>
                        ),
                      }}
                      inputProps={{
                        style: { borderRadius: '12px' },
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={individualData.email}
                      onChange={handleIndividualInputChange}
                      required
                      sx={{ mb: 3 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email sx={{ color: '#64748b' }} />
                          </InputAdornment>
                        ),
                      }}
                      inputProps={{
                        style: { borderRadius: '12px' },
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={individualData.password}
                      onChange={handleIndividualInputChange}
                      required
                      helperText="Minimum 8 characters"
                      sx={{ mb: 3 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: '#64748b' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      inputProps={{
                        style: { borderRadius: '12px' },
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Confirm Password"
                      name="confirm_password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={individualData.confirm_password}
                      onChange={handleIndividualInputChange}
                      required
                      sx={{ mb: 3 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: '#64748b' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      inputProps={{
                        style: { borderRadius: '12px' },
                      }}
                    />
                  </>
                ) : (
                  /* Organization Registration Form */
                  <>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: '#1e293b' }}>
                      Account Information
                    </Typography>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, mb: 3 }}>
                      <TextField
                        fullWidth
                        label="First Name"
                        name="first_name"
                        value={orgUserData.first_name}
                        onChange={handleOrgUserInputChange}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person sx={{ color: '#64748b' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                          },
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Last Name"
                        name="last_name"
                        value={orgUserData.last_name}
                        onChange={handleOrgUserInputChange}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person sx={{ color: '#64748b' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                          },
                        }}
                      />
                    </Box>

                    <TextField
                      fullWidth
                      label="Username"
                      name="username"
                      value={orgUserData.username}
                      onChange={handleOrgUserInputChange}
                      required
                      helperText="Choose a unique username (minimum 3 characters)"
                      sx={{ mb: 3 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person sx={{ color: '#64748b' }} />
                          </InputAdornment>
                        ),
                      }}
                      inputProps={{
                        style: { borderRadius: '12px' },
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={orgUserData.email}
                      onChange={handleOrgUserInputChange}
                      required
                      sx={{ mb: 3 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email sx={{ color: '#64748b' }} />
                          </InputAdornment>
                        ),
                      }}
                      inputProps={{
                        style: { borderRadius: '12px' },
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={orgUserData.password}
                      onChange={handleOrgUserInputChange}
                      required
                      helperText="Minimum 8 characters"
                      sx={{ mb: 3 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: '#64748b' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      inputProps={{
                        style: { borderRadius: '12px' },
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Confirm Password"
                      name="confirm_password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={orgUserData.confirm_password}
                      onChange={handleOrgUserInputChange}
                      required
                      sx={{ mb: 4 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: '#64748b' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      inputProps={{
                        style: { borderRadius: '12px' },
                      }}
                    />

                    <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: '#1e293b' }}>
                      Organization Details
                    </Typography>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
                      <TextField
                        fullWidth
                        label="Organization Name"
                        name="name"
                        value={organizationData.name}
                        onChange={handleOrganizationInputChange}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Business sx={{ color: '#64748b' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                          },
                        }}
                      />

                      <TextField
                        fullWidth
                        label="Domain"
                        name="domain"
                        value={organizationData.domain}
                        onChange={handleOrganizationInputChange}
                        required
                        placeholder="example.com"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Domain sx={{ color: '#64748b' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                          },
                        }}
                      />

                      <TextField
                        fullWidth
                        label="Website (Optional)"
                        name="website"
                        value={organizationData.website}
                        onChange={handleOrganizationInputChange}
                        placeholder="https://www.example.com"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Web sx={{ color: '#64748b' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                          },
                        }}
                      />

                      <FormControl fullWidth>
                        <Select
                          name="industry"
                          value={organizationData.industry}
                          onChange={handleOrganizationSelectChange}
                          displayEmpty
                          sx={{
                            borderRadius: '12px',
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                            },
                          }}
                        >
                          <MenuItem value="" disabled>Select Industry</MenuItem>
                          {industries.map((industry) => (
                            <MenuItem key={industry} value={industry}>
                              {industry}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth>
                        <Select
                          name="size"
                          value={organizationData.size}
                          onChange={handleOrganizationSelectChange}
                          displayEmpty
                          sx={{
                            borderRadius: '12px',
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px',
                            },
                          }}
                        >
                          <MenuItem value="" disabled>Select Company Size</MenuItem>
                          {companySizes.map((size) => (
                            <MenuItem key={size} value={size}>
                              {size}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <TextField
                        fullWidth
                        label="Location (Optional)"
                        name="location"
                        value={organizationData.location}
                        onChange={handleOrganizationInputChange}
                        placeholder="City, Country"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOn sx={{ color: '#64748b' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                          },
                        }}
                      />
                    </Box>

                    <TextField
                      fullWidth
                      label="Description (Optional)"
                      name="description"
                      value={organizationData.description}
                      onChange={handleOrganizationInputChange}
                      multiline
                      rows={3}
                      placeholder="Brief description of your organization..."
                      sx={{ mb: 4, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                  </>
                )}

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      sx={{
                        color: '#3b82f6',
                        '&.Mui-checked': {
                          color: '#3b82f6',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I agree to the{' '}
                      <Link href="#" sx={{ color: '#3b82f6' }}>
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="#" sx={{ color: '#3b82f6' }}>
                        Privacy Policy
                      </Link>
                    </Typography>
                  }
                  sx={{ mb: 3 }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1e293b 100%)',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2563eb 0%, #1e293b 100%)',
                      boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
                    },
                    '&:disabled': {
                      background: '#94a3b8',
                    },
                  }}
                >
                  {loading ? 'Creating Account...' : `Create ${registrationType === 'individual' ? 'Free' : 'Organization'} Account`}
                </Button>
              </Box>

              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link component={RouterLink} to="/login" sx={{ color: '#3b82f6', fontWeight: 600 }}>
                    Sign in here
                  </Link>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;
