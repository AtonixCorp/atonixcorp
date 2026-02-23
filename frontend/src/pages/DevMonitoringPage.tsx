import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

const DevMonitoringPage: React.FC = () => {
  const [range, setRange] = useState<'1h' | '24h' | '7d'>('24h');
  const [app, setApp] = useState('payment-service');

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>Monitoring</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        High-signal health and performance view for developers.
      </Typography>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} gap={1}>
            <Stack direction="row" alignItems="center" gap={1}>
              <Typography sx={{ fontWeight: 700 }}>System Health</Typography>
              <Chip size="small" color="success" label="Green" />
            </Stack>
            <ToggleButtonGroup value={range} exclusive size="small" onChange={(_, value) => value && setRange(value)}>
              <ToggleButton value="1h">1h</ToggleButton>
              <ToggleButton value="24h">24h</ToggleButton>
              <ToggleButton value="7d">7d</ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4,1fr)' }, gap: 1.5, mt: 2 }}>
            <Card variant="outlined"><CardContent><Typography variant="caption" color="text.secondary">CPU</Typography><Typography variant="h6">48%</Typography></CardContent></Card>
            <Card variant="outlined"><CardContent><Typography variant="caption" color="text.secondary">Memory</Typography><Typography variant="h6">64%</Typography></CardContent></Card>
            <Card variant="outlined"><CardContent><Typography variant="caption" color="text.secondary">Error Rate</Typography><Typography variant="h6" color="warning.main">1.2%</Typography></CardContent></Card>
            <Card variant="outlined"><CardContent><Typography variant="caption" color="text.secondary">Request Rate</Typography><Typography variant="h6">890 rps</Typography></CardContent></Card>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Per-app view</Typography>
          <FormControl size="small" sx={{ minWidth: 240, mb: 2 }}>
            <InputLabel>Application</InputLabel>
            <Select value={app} label="Application" onChange={(event) => setApp(event.target.value)}>
              <MenuItem value="payment-service">payment-service</MenuItem>
              <MenuItem value="web-frontend">web-frontend</MenuItem>
              <MenuItem value="events-worker">events-worker</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary">
            Showing charts for {app} over {range}. (Chart widgets can be attached to live telemetry next.)
          </Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>Alerts</Typography>
          <Stack gap={1}>
            <Typography>App X — high error rate</Typography>
            <Typography>App Y — CPU {'>'} 80%</Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DevMonitoringPage;
