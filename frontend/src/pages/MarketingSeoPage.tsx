import React from 'react';
import { Box, Typography, Card, CardContent, Table, TableHead, TableRow, TableCell, TableBody, Button, Stack } from '@mui/material';

const MarketingSeoPage: React.FC = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} mb={2}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>SEO & Domains</Typography>
          <Typography variant="body2" color="text.secondary">Domain health, keyword ranking, and SEO optimization opportunities.</Typography>
        </Box>
        <Button variant="contained">Add Domain</Button>
      </Stack>

      <Card>
        <CardContent>
          <Table size="small">
            <TableHead><TableRow><TableCell>Domain</TableCell><TableCell>Status</TableCell><TableCell>SEO Score</TableCell><TableCell>Organic Traffic</TableCell><TableCell>Keywords Ranked</TableCell></TableRow></TableHead>
            <TableBody>
              {[
                ['atonixcorp.com', 'verified', '82', '43,220', '1,120'],
                ['platform.atonixcorp.com', 'verified', '76', '8,450', '330'],
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

export default MarketingSeoPage;
