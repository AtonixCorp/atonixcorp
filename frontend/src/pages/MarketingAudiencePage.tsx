import React from 'react';
import { Box, Typography, Card, CardContent, Table, TableHead, TableRow, TableCell, TableBody, Button, Stack } from '@mui/material';

const MarketingAudiencePage: React.FC = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} mb={2}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>Audience Segmentation</Typography>
          <Typography variant="body2" color="text.secondary">Manage static/dynamic segments and rebuild audience membership.</Typography>
        </Box>
        <Button variant="contained">Create Segment</Button>
      </Stack>

      <Card>
        <CardContent>
          <Table size="small">
            <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Type</TableCell><TableCell>Size</TableCell><TableCell>Last Built</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
            <TableBody>
              {[
                ['High LTV – Africa', 'dynamic', '12,430', '2026-02-23 06:00', 'Fresh'],
                ['Newsletter Active', 'static', '31,200', '2026-02-22 23:00', 'Fresh'],
                ['Winback 90d', 'dynamic', '4,800', '2026-02-21 10:00', 'Needs rebuild'],
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

export default MarketingAudiencePage;
