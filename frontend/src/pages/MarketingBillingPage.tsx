import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const MarketingBillingPage: React.FC = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>Marketing Billing</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Budget and spend tracking for campaigns, channels, and acquisition programs.
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3,1fr)' }, gap: 1.5 }}>
        <Card><CardContent><Typography variant="caption" color="text.secondary">Campaign Spend</Typography><Typography variant="h6" sx={{ fontWeight: 800 }}>$12,860</Typography></CardContent></Card>
        <Card><CardContent><Typography variant="caption" color="text.secondary">Ad Platforms</Typography><Typography variant="h6" sx={{ fontWeight: 800 }}>$8,330</Typography></CardContent></Card>
        <Card><CardContent><Typography variant="caption" color="text.secondary">Content Production</Typography><Typography variant="h6" sx={{ fontWeight: 800 }}>$3,210</Typography></CardContent></Card>
      </Box>
    </Box>
  );
};

export default MarketingBillingPage;
