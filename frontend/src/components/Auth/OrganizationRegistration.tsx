import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import {
  Business,
  Email,
  Person,
  LocationOn,
  Web,
  Domain,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { OrganizationRegistrationRequest } from '../../types/auth';

interface OrganizationRegistrationProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const OrganizationRegistration: React.FC<OrganizationRegistrationProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const { registerOrganization, user } = useAuth();
  const [formData, setFormData] = useState<OrganizationRegistrationRequest>({
    name: '',
    domain: '',
    description: '',
    website: '',
    industry: '',
    size: '',
    location: '',
    admin_email: user?.email || '',
    admin_first_name: user?.first_name || '',
    admin_last_name: user?.last_name || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.name) return 'Organization name is required';
    if (!formData.domain) return 'Domain is required';
    if (!formData.admin_email) return 'Admin email is required';
    if (!/\S+@\S+\.\S+/.test(formData.admin_email)) return 'Please enter a valid email';
    if (!formData.admin_first_name) return 'Admin first name is required';
    if (!formData.admin_last_name) return 'Admin last name is required';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Submitting organization registration:', formData);
      await registerOrganization(formData);
      console.log('Organization registration successful!');
      onClose();
      onSuccess?.();
    } catch (err) {
      console.error('Organization registration failed:', err);
      setError('Failed to register organization. Please try again.');
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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Business sx={{ mr: 2, color: '#3b82f6' }} />
          <Typography variant="h5" fontWeight={700}>
            Register Your Organization
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Set up your organization to access enterprise features and dashboards
        </Typography>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
            Organization Details
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
            <TextField
              fullWidth
              label="Organization Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Business sx={{ color: '#64748b' }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Domain"
              name="domain"
              value={formData.domain}
              onChange={handleInputChange}
              required
              placeholder="example.com"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Domain sx={{ color: '#64748b' }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Website (Optional)"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="https://www.example.com"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Web sx={{ color: '#64748b' }} />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl fullWidth>
              <InputLabel>Industry</InputLabel>
              <Select
                name="industry"
                value={formData.industry}
                label="Industry"
                onChange={handleSelectChange}
              >
                {industries.map((industry) => (
                  <MenuItem key={industry} value={industry}>
                    {industry}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Company Size</InputLabel>
              <Select
                name="size"
                value={formData.size}
                label="Company Size"
                onChange={handleSelectChange}
              >
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
              value={formData.location}
              onChange={handleInputChange}
              placeholder="City, Country"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn sx={{ color: '#64748b' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <TextField
            fullWidth
            label="Description (Optional)"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            multiline
            rows={3}
            placeholder="Brief description of your organization..."
            sx={{ mb: 4 }}
          />

          <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
            Administrator Details
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
            <TextField
              fullWidth
              label="First Name"
              name="admin_first_name"
              value={formData.admin_first_name}
              onChange={handleInputChange}
              required
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
              label="Last Name"
              name="admin_last_name"
              value={formData.admin_last_name}
              onChange={handleInputChange}
              required
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
              label="Email"
              name="admin_email"
              type="email"
              value={formData.admin_email}
              onChange={handleInputChange}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: '#64748b' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
            <Button
              onClick={onClose}
              variant="outlined"
              sx={{ borderRadius: '12px', px: 4 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                borderRadius: '12px',
                px: 4,
                background: 'linear-gradient(135deg, #3b82f6 0%, #1e293b 100%)',
              }}
            >
              {loading ? 'Registering...' : 'Register Organization'}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default OrganizationRegistration;
