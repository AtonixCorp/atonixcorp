// AtonixCorp – Create Organization Page
// Shown when a user has no organization yet (first-time enterprise setup).
// On success, redirects to /enterprise/:orgSlug/overview

import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, Paper, Grid,
  CircularProgress, Alert, Stepper, Step, StepLabel,
  InputAdornment, Divider, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import DomainIcon from '@mui/icons-material/Language';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import { organizationApi } from '../services/enterpriseApi';
import { dashboardTokens, dashboardSemanticColors } from '../styles/dashboardDesignSystem';

const T = {
  bg:     dashboardTokens.colors.background,
  card:   dashboardTokens.colors.surface,
  border: dashboardTokens.colors.border,
  text:   dashboardTokens.colors.textPrimary,
  sub:    dashboardTokens.colors.textSecondary,
  brand:  dashboardTokens.colors.brandPrimary,
  green:  dashboardSemanticColors.success,
  red:    dashboardSemanticColors.danger,
  font:   '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

export const INDUSTRIES = [
  'Technology & Software',
  'Finance & Banking',
  'Healthcare & Life Sciences',
  'Energy & Utilities',
  'Oil & Gas',
  'Manufacturing & Industrial',
  'Retail & E-commerce',
  'Transportation & Logistics',
  'Media & Entertainment',
  'Telecommunications',
  'Education & Research',
  'Government & Public Sector',
  'Agriculture & Food',
  'Real Estate & Construction',
  'Hospitality & Tourism',
  'Sports & Recreation',
  'Legal & Compliance',
  'Nonprofit & NGOs',
  'Automotive',
  'Aerospace & Defense',
  'Pharmaceuticals',
  'Insurance',
  'Cybersecurity',
  'Consulting & Professional Services',
];

export const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Antigua and Barbuda',
  'Argentina','Armenia','Australia','Austria','Azerbaijan','Bahamas','Bahrain',
  'Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bhutan',
  'Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria',
  'Burkina Faso','Burundi','Cabo Verde','Cambodia','Cameroon','Canada',
  'Central African Republic','Chad','Chile','China','Colombia','Comoros',
  'Congo (Brazzaville)','Congo (Kinshasa)','Costa Rica','Croatia','Cuba',
  'Cyprus','Czech Republic','Denmark','Djibouti','Dominica','Dominican Republic',
  'Ecuador','Egypt','El Salvador','Equatorial Guinea','Eritrea','Estonia',
  'Eswatini','Ethiopia','Fiji','Finland','France','Gabon','Gambia','Georgia',
  'Germany','Ghana','Greece','Grenada','Guatemala','Guinea','Guinea-Bissau',
  'Guyana','Haiti','Honduras','Hungary','Iceland','India','Indonesia','Iran',
  'Iraq','Ireland','Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan',
  'Kenya','Kiribati','Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon','Lesotho',
  'Liberia','Libya','Liechtenstein','Lithuania','Luxembourg','Madagascar',
  'Malawi','Malaysia','Maldives','Mali','Malta','Marshall Islands','Mauritania',
  'Mauritius','Mexico','Micronesia','Moldova','Monaco','Mongolia','Montenegro',
  'Morocco','Mozambique','Myanmar','Namibia','Nauru','Nepal','Netherlands',
  'New Zealand','Nicaragua','Niger','Nigeria','North Korea','North Macedonia',
  'Norway','Oman','Pakistan','Palau','Palestine','Panama','Papua New Guinea',
  'Paraguay','Peru','Philippines','Poland','Portugal','Qatar',
  'Romania','Russia','Rwanda','Saint Kitts and Nevis','Saint Lucia',
  'Saint Vincent and the Grenadines','Samoa','San Marino','Sao Tome and Principe',
  'Saudi Arabia','Senegal','Serbia','Seychelles','Sierra Leone','Singapore',
  'Slovakia','Slovenia','Solomon Islands','Somalia','South Africa','South Korea',
  'South Sudan','Spain','Sri Lanka','Sudan','Suriname','Sweden','Switzerland',
  'Syria','Taiwan','Tajikistan','Tanzania','Thailand','Timor-Leste','Togo',
  'Tonga','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan','Tuvalu',
  'Uganda','Ukraine','United Arab Emirates','United Kingdom','United States',
  'Uruguay','Uzbekistan','Vanuatu','Vatican City','Venezuela','Vietnam',
  'Yemen','Zambia','Zimbabwe',
];
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 64);
}

const STEPS = ['Organization identity', 'Contact & domain', 'Review & create'];

export default function CreateOrganizationPage() {
  const navigate = useNavigate();

  // form state
  const [step, setStep]                 = useState(0);
  const [name, setName]                 = useState('');
  const [slug, setSlug]                 = useState('');
  const [slugEdited, setSlugEdited]     = useState(false);
  const [country, setCountry]           = useState('');
  const [industry, setIndustry]         = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [primaryDomain, setPrimaryDomain] = useState('');
  const [logoUrl, setLogoUrl]           = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // Auto-sync slug from name unless user has manually edited it
  const handleNameChange = (val: string) => {
    setName(val);
    if (!slugEdited) setSlug(toSlug(val));
  };

  const step0Valid = name.trim().length > 0 && slug.trim().length > 0 && country.trim().length > 0;
  const step1Valid = contactEmail.trim().length > 0 && contactEmail.includes('@');

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    try {
      const org = await organizationApi.create({
        name:           name.trim(),
        slug:           slug.trim(),
        country:        country.trim(),
        industry:       industry.trim() || undefined,
        contact_email:  contactEmail.trim(),
        primary_domain: primaryDomain.trim() || undefined,
        logo_url:       logoUrl.trim() || undefined,
      });
      navigate(`/enterprise/${org.slug}/overview`, { replace: true });
    } catch (err: any) {
      const detail = err?.response?.data;
      if (detail && typeof detail === 'object') {
        const msgs = Object.entries(detail).map(([k, v]) => `${k}: ${v}`).join(' | ');
        setError(msgs);
      } else {
        setError('Failed to create organization. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh', bgcolor: T.bg, display: 'flex',
      alignItems: 'center', justifyContent: 'center', p: 3,
    }}>
      <Box sx={{ width: '100%', maxWidth: 660 }}>

        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: `${T.brand}18`, borderRadius: '50%', p: 2, mb: 2,
          }}>
            <BusinessIcon sx={{ color: T.brand, fontSize: '2.2rem' }} />
          </Box>
          <Typography sx={{ color: T.text, fontWeight: 800, fontSize: '1.8rem', fontFamily: T.font, mb: 0.5 }}>
            Create your organization
          </Typography>
          <Typography sx={{ color: T.sub, fontSize: '1rem' }}>
            Your organization is the root context for all enterprise features.
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={step} sx={{ mb: 4 }}>
          {STEPS.map(label => (
            <Step key={label}>
              <StepLabel
                sx={{
                  '& .MuiStepLabel-label': { color: T.sub, fontFamily: T.font },
                  '& .MuiStepLabel-label.Mui-active': { color: T.text, fontWeight: 700 },
                  '& .MuiStepLabel-label.Mui-completed': { color: T.green },
                  '& .MuiStepIcon-root': { color: T.border },
                  '& .MuiStepIcon-root.Mui-active': { color: T.brand },
                  '& .MuiStepIcon-root.Mui-completed': { color: T.green },
                }}>
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Paper sx={{ bgcolor: T.card, border: `1px solid ${T.border}`, borderRadius: 2, p: 4 }}>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          {/* ── Step 0: Identity ── */}
          {step === 0 && (
            <Box>
              <Typography sx={{ color: T.text, fontWeight: 700, fontSize: '1.1rem', mb: 3, fontFamily: T.font }}>
                Organization identity
              </Typography>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Organization name *"
                    value={name}
                    onChange={e => handleNameChange(e.target.value)}
                    fullWidth
                    InputProps={{ startAdornment: <InputAdornment position="start"><BusinessIcon sx={{ color: T.sub }} /></InputAdornment> }}
                    helperText="This will appear across dashboards, emails, and invoices."
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Slug *"
                    value={slug}
                    onChange={e => { setSlug(e.target.value); setSlugEdited(true); }}
                    fullWidth
                    helperText="Used in your enterprise URLs, e.g. /enterprise/my-org/overview"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">
                        <Typography sx={{ color: T.sub, fontSize: '.85rem', mr: 0.5 }}>/enterprise/</Typography>
                      </InputAdornment>,
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Country *</InputLabel>
                    <Select
                      value={country}
                      label="Country *"
                      onChange={e => setCountry(e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value=""><em style={{ color: T.sub }}>Select country…</em></MenuItem>
                      {COUNTRIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Industry</InputLabel>
                    <Select
                      value={industry}
                      label="Industry"
                      onChange={e => setIndustry(e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value=""><em style={{ color: T.sub }}>Select industry…</em></MenuItem>
                      {INDUSTRIES.map(ind => (
                        <MenuItem key={ind} value={ind}>{ind}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                <Button
                  variant="contained"
                  disabled={!step0Valid}
                  onClick={handleNext}
                  sx={{ bgcolor: T.brand, fontWeight: 700, px: 4 }}>
                  Next
                </Button>
              </Box>
            </Box>
          )}

          {/* ── Step 1: Contact & Domain ── */}
          {step === 1 && (
            <Box>
              <Typography sx={{ color: T.text, fontWeight: 700, fontSize: '1.1rem', mb: 3, fontFamily: T.font }}>
                Contact & domain
              </Typography>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Contact email *"
                    value={contactEmail}
                    type="email"
                    onChange={e => setContactEmail(e.target.value)}
                    fullWidth
                    InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: T.sub }} /></InputAdornment> }}
                    helperText="Used for billing notifications, compliance alerts, and team invitations."
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Primary domain"
                    value={primaryDomain}
                    onChange={e => setPrimaryDomain(e.target.value)}
                    fullWidth
                    InputProps={{ startAdornment: <InputAdornment position="start"><DomainIcon sx={{ color: T.sub }} /></InputAdornment> }}
                    helperText="Optional — e.g. acme.com. You can add and verify domains later."
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Logo URL"
                    value={logoUrl}
                    onChange={e => setLogoUrl(e.target.value)}
                    fullWidth
                    helperText="Optional — a publicly accessible URL to your organization logo."
                  />
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button onClick={handleBack} sx={{ color: T.sub }}>Back</Button>
                <Button
                  variant="contained"
                  disabled={!step1Valid}
                  onClick={handleNext}
                  sx={{ bgcolor: T.brand, fontWeight: 700, px: 4 }}>
                  Review
                </Button>
              </Box>
            </Box>
          )}

          {/* ── Step 2: Review ── */}
          {step === 2 && (
            <Box>
              <Typography sx={{ color: T.text, fontWeight: 700, fontSize: '1.1rem', mb: 3, fontFamily: T.font }}>
                Review & create
              </Typography>

              {/* Summary */}
              <Box sx={{ bgcolor: `${T.brand}08`, border: `1px solid ${T.brand}22`, borderRadius: 2, p: 3, mb: 3 }}>
                {[
                  ['Organization name',  name],
                  ['Slug',               slug],
                  ['Country',            country],
                  ['Industry',           industry   || '—'],
                  ['Contact email',      contactEmail],
                  ['Primary domain',     primaryDomain || '—'],
                  ['Logo URL',           logoUrl    || '—'],
                ].map(([label, val]) => (
                  <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: `1px solid ${T.border}`, '&:last-child': { borderBottom: 'none' } }}>
                    <Typography variant="body2" sx={{ color: T.sub, fontWeight: 600 }}>{label}</Typography>
                    <Typography variant="body2" sx={{ color: T.text, fontWeight: 700, textAlign: 'right', maxWidth: '55%', wordBreak: 'break-all' }}>{val}</Typography>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ borderColor: T.border, my: 2 }} />

              <Typography variant="caption" sx={{ color: T.sub, display: 'block', mb: 3 }}>
                Creating this organization will automatically set you as the OWNER and seed a default
                <strong> General</strong> department, <strong>Core Team</strong>, and <strong>Default Group</strong>.
                You can customise these later.
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={handleBack} sx={{ color: T.sub }} disabled={loading}>Back</Button>
                <Button
                  variant="contained"
                  onClick={handleCreate}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <CheckCircleIcon />}
                  sx={{ bgcolor: T.brand, fontWeight: 700, px: 4 }}>
                  {loading ? 'Creating…' : 'Create organization'}
                </Button>
              </Box>
            </Box>
          )}

        </Paper>
      </Box>
    </Box>
  );
}
