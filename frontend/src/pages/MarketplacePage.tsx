import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import DashboardLayout from '../components/Layout/DashboardLayout';

const __MarketplaceCard: React.FC<{ title: string; description: string; cta?: string }> = ({ title, description, cta = 'Install' }) => (
  <Card sx={{ borderRadius: 4, border: '1px solid #e2e8f0' }}>
    <CardContent>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{description}</Typography>
      <Button variant="contained" size="small">{cta}</Button>
    </CardContent>
  </Card>
);

const MarketplacePage: React.FC = () => {
  const integrations = [
    { title: 'Analytics Pack', description: 'Extended dashboards and widgets for advanced analytics.' },
    { title: 'Time Tracker', description: 'Track and report team hours with invoices and exports.' },
    { title: 'Model Hub', description: 'Pre-built ML models and deployment pipeline integrations.' },
  ];

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight={800} sx={{ mb: 2 }}>Marketplace</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Discover add-ons, integrations and official extensions for AtonixCorp Platform.
        </Typography>

        <Grid container spacing={3}>
          {integrations.map((it, i) => (
            <Grid
              key={i}
              component="div"
              sx={{
                flexBasis: { xs: '100%', md: '50%', lg: '33.3333%' },
                maxWidth: { xs: '100%', md: '50%', lg: '33.3333%' },
                p: 0,
              }}
            >
              <Box sx={{ p: 1 }}>
                <__MarketplaceCard {...it} />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default MarketplacePage;
