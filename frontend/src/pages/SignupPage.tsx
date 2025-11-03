import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Alert,
  FormControlLabel,
  Checkbox,
  Card,
  CardContent,
  Link,
  Select,
  MenuItem,
  FormControl,
  Divider,
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
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SignupRequest, OrganizationRegistrationRequest } from '../types/auth';
import { SelectChangeEvent } from '@mui/material';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup, signupOrganization } = useAuth();

  // Registration type state
  const [registrationType, setRegistrationType] = useState<'individual' | 'organization'>('individual');

  // Individual registration state
  const [individualData, setIndividualData] = useState<SignupRequest>({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
  });

  // Organization registration state
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
    admin_email: '',
    admin_first_name: '',
    admin_last_name: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);

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

  const handleTypeChange = (type: 'individual' | 'organization') => {
    setRegistrationType(type);
    setError(null);
  };

  const handleIndividualInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setIndividualData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(null);
  };

  const handleOrgUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOrgUserData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Also update organization admin fields
    if (name === 'email') {
      setOrganizationData((prev) => ({ ...prev, admin_email: value }));
    } else if (name === 'first_name') {
      setOrganizationData((prev) => ({ ...prev, admin_first_name: value }));
    } else if (name === 'last_name') {
      setOrganizationData((prev) => ({ ...prev, admin_last_name: value }));
    }

    if (error) setError(null);
  };

  const handleOrganizationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOrganizationData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(null);
  };

  const handleOrganizationSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setOrganizationData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
    if (!orgUserData.username) return 'Username is required';
    if (orgUserData.username.length < 3) return 'Username must be at least 3 characters';
    if (!orgUserData.email) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(orgUserData.email)) return 'Please enter a valid email';
    if (!orgUserData.first_name) return 'First name is required';
    if (!orgUserData.last_name) return 'Last name is required';
    if (!orgUserData.password) return 'Password is required';
    if (orgUserData.password.length < 8) return 'Password must be at least 8 characters';
    if (orgUserData.password !== orgUserData.confirm_password) return 'Passwords do not match';
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
        await signup(individualData);
        navigate('/dashboard');
      } else {
        await signupOrganization(orgUserData, organizationData);
        navigate('/dashboard/enterprise');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 4, md: 8 }, px: 2, backgroundColor: '#f8fafc' }}>
      <Box sx={{ maxWidth: 900, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              mb: 3,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '2rem', md: '3rem' },
            }}
          >
            Join AtonixCorp
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Create your account and become part of our community
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose the account type that best fits your needs
          </Typography>
        </Box>

        {/* Registration Type Selection - TWO PROMINENT CARDS */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 4 }}>
            {/* Individual Registration Card */}
            <Paper
              elevation={registrationType === 'individual' ? 8 : 2}
              onClick={() => handleTypeChange('individual')}
              sx={{
                p: 4,
                borderRadius: '20px',
                border: registrationType === 'individual' ? '3px solid #3b82f6' : '2px solid #cbd5e1',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                backgroundColor: registrationType === 'individual' ? '#eff6ff' : '#ffffff',
                transform: registrationType === 'individual' ? 'scale(1.02)' : 'scale(1)',
                '&:hover': {
                  borderColor: '#3b82f6',
                  backgroundColor: '#eff6ff',
                  boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
                  transform: 'scale(1.02)',
                },
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Person sx={{ fontSize: 60, color: '#3b82f6', mb: 3 }} />
                <Typography variant="h5" fontWeight={800} sx={{ mb: 2, color: '#1e293b' }}>
                  Individual
                </Typography>
                <Typography variant="h6" sx={{ mb: 3, color: '#3b82f6', fontWeight: 600 }}>
                  Free Account
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.95rem' }}>
                  Perfect for personal projects
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                  and independent developers
                </Typography>
              </Box>
            </Paper>

            {/* Organization Registration Card */}
            <Paper
              elevation={registrationType === 'organization' ? 8 : 2}
              onClick={() => handleTypeChange('organization')}
              sx={{
                p: 4,
                borderRadius: '20px',
                border: registrationType === 'organization' ? '3px solid #3b82f6' : '2px solid #cbd5e1',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                backgroundColor: registrationType === 'organization' ? '#eff6ff' : '#ffffff',
                transform: registrationType === 'organization' ? 'scale(1.02)' : 'scale(1)',
                '&:hover': {
                  borderColor: '#3b82f6',
                  backgroundColor: '#eff6ff',
                  boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
                  transform: 'scale(1.02)',
                },
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Business sx={{ fontSize: 60, color: '#3b82f6', mb: 3 }} />
                <Typography variant="h5" fontWeight={800} sx={{ mb: 2, color: '#1e293b' }}>
                  Organization
                </Typography>
                <Typography variant="h6" sx={{ mb: 3, color: '#3b82f6', fontWeight: 600 }}>
                  Enterprise Features
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.95rem' }}>
                  For teams and businesses
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                  with advanced management tools
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* Signup Form Card */}
        <Card
          elevation={0}
          sx={{
            borderRadius: '24px',
            border: '1px solid #e2e8f0',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <CardContent sx={{ p: { xs: 4, md: 6 } }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              {registrationType === 'individual' ? (
                /* Individual Registration Form */
                <>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 4, color: '#1e293b' }}>
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
                                        <Person sx={{ color: 'text.secondary' }} />
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
                            <Person sx={{ color: 'text.secondary' }} />
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
                          <Person sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
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
                          <Email sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
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
                          <Lock sx={{ color: 'text.secondary' }} />
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
                          <Lock sx={{ color: 'text.secondary' }} />
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
                  />
                </>
              ) : (
                /* Organization Registration Form */
                <>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 4, color: '#1e293b' }}>
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
                            <Person sx={{ color: 'text.secondary' }} />
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
                            <Person sx={{ color: 'text.secondary' }} />
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
                  />

                  <Divider sx={{ my: 4 }} />

                  <Typography variant="h6" fontWeight={600} sx={{ mb: 4, color: '#1e293b' }}>
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
                            <Business sx={{ color: 'text.secondary' }} />
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
                            <Domain sx={{ color: 'text.secondary' }} />
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
                            <Web sx={{ color: 'text.secondary' }} />
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
                            <LocationOn sx={{ color: 'text.secondary' }} />
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

            <Box sx={{ textAlign: 'center', mt: 4 }}>
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
    </Box>
  );
};

export default SignupPage;
