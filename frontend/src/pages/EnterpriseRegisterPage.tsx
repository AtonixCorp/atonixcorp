import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import enterpriseService from '../services/enterpriseService';

function normalizeDomain(input: string) {
  if (!input) return '';
  let candidate = input.trim();
  // remove protocol
  candidate = candidate.replace(/^https?:\/\//i, '');
  // remove path
  const slashIndex = candidate.indexOf('/');
  if (slashIndex !== -1) candidate = candidate.slice(0, slashIndex);
  return candidate.toLowerCase();
}

function isValidDomain(domain: string) {
  // basic domain validation (no protocol, allow subdomains)
  const re = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
  return re.test(domain);
}

const EnterpriseRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');
  const [country, setCountry] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [directorName, setDirectorName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!companyName) {
      setError('Company name is required.');
      return;
    }

    const domain = normalizeDomain(companyUrl || '');
    if (!domain) {
      setError('Company URL is required and must be a valid domain (e.g. domain.com).');
      return;
    }
    if (!isValidDomain(domain)) {
      setError('Company URL must be a valid domain (e.g. domain.com).');
      return;
    }

    if (!companyEmail) {
      setError('Company email is required and must use the company domain.');
      return;
    }
    const emailParts = companyEmail.split('@');
    if (emailParts.length !== 2) {
      setError('Company email is not a valid email address.');
      return;
    }
    const emailDomain = emailParts[1].toLowerCase();
    // Accept emails that match the domain or a subdomain of it
    if (!(emailDomain === domain || emailDomain.endsWith('.' + domain))) {
      setError(`Company email must belong to the company domain: ${domain}`);
      return;
    }

    const record = enterpriseService.createEnterprise({ companyName, companyUrl: domain, country, companyEmail, directorName });
    // Redirect to new enterprise dashboard
    navigate(`/enterprise/${record.id}/dashboard`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, maxWidth: 720, mx: 'auto' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Register your Company</Typography>
        <form onSubmit={handleSubmit}>
          <TextField label="Company Name" fullWidth required value={companyName} onChange={(e) => setCompanyName(e.target.value)} sx={{ mb: 2 }} />
          <TextField label="Company URL" fullWidth value={companyUrl} onChange={(e) => setCompanyUrl(e.target.value)} sx={{ mb: 2 }} />
          <TextField label="Country" fullWidth value={country} onChange={(e) => setCountry(e.target.value)} sx={{ mb: 2 }} />
          <TextField label="Company Email" fullWidth required value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} sx={{ mb: 2 }} />
          <TextField label="Name of Director" fullWidth value={directorName} onChange={(e) => setDirectorName(e.target.value)} sx={{ mb: 2 }} />
          {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button type="submit" variant="contained">Register</Button>
            <Button variant="outlined" onClick={() => { setCompanyName(''); setCompanyUrl(''); setCountry(''); setCompanyEmail(''); setDirectorName(''); }}>Reset</Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default EnterpriseRegisterPage;
