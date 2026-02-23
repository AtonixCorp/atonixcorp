import React from 'react';
import { Box, Typography, Card, CardContent, Table, TableHead, TableRow, TableCell, TableBody, Button, Stack } from '@mui/material';

const MarketingAbTestingPage: React.FC = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} mb={2}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>A/B Testing</Typography>
          <Typography variant="body2" color="text.secondary">Track experiments, variants, significance, and winners.</Typography>
        </Box>
        <Button variant="contained">Create Experiment</Button>
      </Stack>

      <Card>
        <CardContent>
          <Table size="small">
            <TableHead><TableRow><TableCell>Experiment</TableCell><TableCell>Status</TableCell><TableCell>Primary Metric</TableCell><TableCell>Traffic</TableCell><TableCell>Winner</TableCell></TableRow></TableHead>
            <TableBody>
              {[
                ['Landing Page Variant A/B', 'running', 'CTR', '50/50', 'Pending'],
                ['Subject Line Test - Feb', 'completed', 'Open Rate', '50/50', 'Variant B'],
              ].map((row) => (
                <TableRow key={row[0]}><TableCell>{row[0]}</TableCell><TableCell>{row[1]}</TableCell><TableCell>{row[2]}</TableCell><TableCell>{row[3]}</TableCell><TableCell>{row[4]}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MarketingAbTestingPage;
