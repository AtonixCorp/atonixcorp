import React from 'react';
import { Box, Typography, Card, CardContent, Stack, Button } from '@mui/material';

const DevWorkspacePage: React.FC = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>My Workspace</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Personal quick actions and saved developer views.
      </Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} gap={1.5}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>Quick Actions</Typography>
            <Stack direction="row" gap={1} flexWrap="wrap">
              <Button size="small" variant="contained">Deploy now</Button>
              <Button size="small" variant="outlined">Restart pod</Button>
              <Button size="small" variant="outlined">View failed builds</Button>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>Saved Views</Typography>
            <Typography variant="body2" color="text.secondary">Production Deployments · High Error Alerts · Pipeline Failures</Typography>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default DevWorkspacePage;
