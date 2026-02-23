import React from 'react';
import { Box, Typography, Card, CardContent, Stack, Button } from '@mui/material';

const DevApiManagementPage: React.FC = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} mb={2}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>API Management</Typography>
          <Typography variant="body2" color="text.secondary">Keys, gateways, and throttling in one place.</Typography>
        </Box>
        <Button variant="contained">Create API key</Button>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5 }}>
        <Card>
          <CardContent>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>Gateways</Typography>
            <Typography variant="body2" color="text.secondary">Active gateways: 3 · Healthy: 3</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>Throttling</Typography>
            <Typography variant="body2" color="text.secondary">Global default: 1200 req/min · Burst: 240</Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default DevApiManagementPage;
