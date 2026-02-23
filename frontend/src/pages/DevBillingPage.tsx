import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const DevBillingPage: React.FC = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>Developer Billing</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Cost and usage for engineering resources, clusters, and build workloads.
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3,1fr)' }, gap: 1.5 }}>
        <Card><CardContent><Typography variant="caption" color="text.secondary">Compute Spend</Typography><Typography variant="h6" sx={{ fontWeight: 800 }}>$18,420</Typography></CardContent></Card>
        <Card><CardContent><Typography variant="caption" color="text.secondary">Kubernetes Spend</Typography><Typography variant="h6" sx={{ fontWeight: 800 }}>$9,170</Typography></CardContent></Card>
        <Card><CardContent><Typography variant="caption" color="text.secondary">CI/CD Spend</Typography><Typography variant="h6" sx={{ fontWeight: 800 }}>$2,090</Typography></CardContent></Card>
      </Box>
    </Box>
  );
};

export default DevBillingPage;
