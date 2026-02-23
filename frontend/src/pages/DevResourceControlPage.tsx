import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const DevResourceControlPage: React.FC = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>Resource Control</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Compute, storage, and networking quotas and utilization.
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3,1fr)' }, gap: 1.5 }}>
        <Card>
          <CardContent>
            <Typography variant="caption" color="text.secondary">Compute</Typography>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>74 / 120 vCPU</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="caption" color="text.secondary">Storage</Typography>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>8.2 / 20 TB</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="caption" color="text.secondary">Networking</Typography>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>11 / 20 VPCs</Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default DevResourceControlPage;
