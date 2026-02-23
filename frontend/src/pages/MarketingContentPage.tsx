import React from 'react';
import { Box, Typography, Card, CardContent, Table, TableHead, TableRow, TableCell, TableBody, Button, Stack } from '@mui/material';

const MarketingContentPage: React.FC = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} mb={2}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>Content Distribution</Typography>
          <Typography variant="body2" color="text.secondary">Schedule and track delivery across email, SMS, push, and social channels.</Typography>
        </Box>
        <Button variant="contained">Schedule Content</Button>
      </Stack>

      <Card>
        <CardContent>
          <Table size="small">
            <TableHead><TableRow><TableCell>Title</TableCell><TableCell>Channel</TableCell><TableCell>Status</TableCell><TableCell>Scheduled</TableCell><TableCell>Engagement</TableCell></TableRow></TableHead>
            <TableBody>
              {[
                ['Blog: Market Update', 'email', 'scheduled', '2026-02-24 10:00', '—'],
                ['Offer Pulse Q1', 'social', 'sent', '2026-02-22 09:00', '4.8% CTR'],
                ['Product Tips', 'push', 'sending', '2026-02-23 08:00', 'Live'],
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

export default MarketingContentPage;
