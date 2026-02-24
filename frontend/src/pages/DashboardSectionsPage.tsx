import React, { useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

type DashboardMode = 'cloud' | 'developer' | 'marketing';

interface DashboardSectionsPageProps {
  dashboardMode?: DashboardMode;
}

const SECTION_GROUPS: Array<{ category: string; items: string[] }> = [
  {
    category: 'Observability & Incidents',
    items: ['Alert Rules', 'Alerts', 'Incidents', 'Logs', 'Metrics', 'Monitoring'],
  },
  {
    category: 'Compute & Runtime',
    items: ['Auto Scaling Groups', 'Flavors', 'Images', 'Instances', 'Kubernetes Clusters', 'Serverless Functions', 'Snapshots'],
  },
  {
    category: 'Storage & Data',
    items: ['Backup Policies', 'Backups', 'Buckets', 'Databases', 'File Shares', 'S3 Objects', 'Volumes'],
  },
  {
    category: 'Network & Security',
    items: [
      'Cdn Distributions',
      'Dns Records',
      'Encryption Keys',
      'Internet Gateways',
      'Load Balancers',
      'Nat Gateways',
      'Route Tables',
      'Security Groups',
      'Ssl Certificates',
      'Subnets',
      'Target Groups',
      'Vpcs',
      'Vpn Connections',
      'Vpn Gateways',
    ],
  },
  {
    category: 'Platform & Automation',
    items: ['Automations', 'Cloud', 'Compliance', 'Onboarding', 'Orchestration', 'Registries'],
  },
  {
    category: 'Business & Engagement',
    items: ['Billing', 'Campaigns', 'Contact Lists', 'Contacts', 'Domains', 'Email Aliases', 'Email Domains', 'Email Templates', 'Mailboxes', 'Marketing'],
  },
];

const modeLabel: Record<DashboardMode, string> = {
  cloud: 'Cloud Dashboard',
  developer: 'Developer Dashboard',
  marketing: 'Marketing Dashboard',
};

const DashboardSectionsPage: React.FC<DashboardSectionsPageProps> = ({ dashboardMode = 'cloud' }) => {
  const [query, setQuery] = useState('');

  const filteredGroups = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return SECTION_GROUPS;
    }

    return SECTION_GROUPS
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.toLowerCase().includes(term)),
      }))
      .filter((group) => group.items.length > 0);
  }, [query]);

  const totalVisible = filteredGroups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#07121a', pb: 4 }}>
      <Box
        sx={{
          borderBottom: '1px solid rgba(20,184,166,0.22)',
          background: 'linear-gradient(135deg, #0b1220 0%, #07121a 100%)',
          px: { xs: 2, md: 4 },
          py: { xs: 2.2, md: 2.8 },
        }}
      >
        <Typography sx={{ color: '#e6eef7', fontWeight: 800, fontSize: { xs: '1.25rem', md: '1.55rem' } }}>
          Sections Directory
        </Typography>
        <Typography sx={{ color: '#9fb3c8', mt: 0.5, fontSize: { xs: '.88rem', md: '.95rem' } }}>
          {modeLabel[dashboardMode]} · Unified resource sections for navigation and implementation.
        </Typography>
      </Box>

      <Container maxWidth="xl" sx={{ pt: 0 }}>
        <Card
          sx={{
            mb: 0,
            borderRadius: 0,
            border: '1px solid rgba(20,184,166,0.2)',
            borderTop: 0,
            bgcolor: '#0b1220',
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between">
              <TextField
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search sections (e.g. Vpcs, Billing, Alerts)"
                size="small"
                fullWidth
                sx={{
                  maxWidth: { md: 460 },
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255,255,255,0.04)',
                    color: '#e6eef7',
                    borderRadius: 0,
                    '& fieldset': { borderColor: 'rgba(20,184,166,0.25)' },
                    '&:hover fieldset': { borderColor: 'rgba(20,184,166,0.45)' },
                    '&.Mui-focused fieldset': { borderColor: '#14b8a6' },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#9fb3c8', fontSize: '1rem' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Chip
                label={`${totalVisible} section${totalVisible === 1 ? '' : 's'} visible`}
                sx={{
                  alignSelf: { xs: 'flex-start', md: 'center' },
                  bgcolor: 'rgba(20,184,166,0.18)',
                  color: '#9be3d9',
                  fontWeight: 700,
                  borderRadius: 0,
                }}
              />
            </Stack>
          </CardContent>
        </Card>

        <Stack spacing={0}>
          {filteredGroups.map((group) => (
            <Card
              key={group.category}
              sx={{
                borderRadius: 0,
                border: '1px solid rgba(20,184,166,0.2)',
                borderTop: 0,
                bgcolor: '#0b1220',
              }}
            >
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <Typography sx={{ color: '#e6eef7', fontWeight: 700, mb: 1.4, fontSize: { xs: '1rem', md: '1.08rem' } }}>
                  {group.category}
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: '1fr 1fr',
                      md: '1fr 1fr 1fr',
                      lg: '1fr 1fr 1fr 1fr',
                    },
                    gap: 1,
                  }}
                >
                  {group.items.map((item) => (
                    <Box
                      key={item}
                      sx={{
                        border: '1px solid rgba(20,184,166,0.2)',
                        borderRadius: 0,
                        px: 1.2,
                        py: 0.95,
                        color: '#d9e6f5',
                        bgcolor: 'rgba(255,255,255,0.02)',
                        fontWeight: 600,
                        fontSize: '.9rem',
                        minHeight: 44,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {item}
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          ))}

          {totalVisible === 0 && (
            <Card
              sx={{
                borderRadius: 0,
                border: '1px dashed rgba(20,184,166,0.45)',
                borderTop: 0,
                bgcolor: '#0b1220',
              }}
            >
              <CardContent>
                <Typography sx={{ color: '#b9cbe0', fontWeight: 600 }}>No sections match your search.</Typography>
              </CardContent>
            </Card>
          )}
        </Stack>
      </Container>
    </Box>
  );
};

export default DashboardSectionsPage;
