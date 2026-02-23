import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Stack,
} from '@mui/material';

const DevContainersPage: React.FC = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>Containers & Kubernetes</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Grouped operational state for clusters and workloads.
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4,1fr)' }, gap: 1.5, mb: 2 }}>
        <Card><CardContent><Typography variant="caption" color="text.secondary">Nodes</Typography><Typography variant="h6" sx={{ fontWeight: 800 }}>9</Typography></CardContent></Card>
        <Card><CardContent><Typography variant="caption" color="text.secondary">Pods</Typography><Typography variant="h6" sx={{ fontWeight: 800 }}>112</Typography></CardContent></Card>
        <Card><CardContent><Typography variant="caption" color="text.secondary">Namespaces</Typography><Typography variant="h6" sx={{ fontWeight: 800 }}>14</Typography></CardContent></Card>
        <Card><CardContent><Typography variant="caption" color="text.secondary">Cluster health</Typography><Typography variant="h6" sx={{ fontWeight: 800, color: 'success.main' }}>Healthy</Typography></CardContent></Card>
      </Box>

      <Card>
        <CardContent>
          <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 1 }}>
            <Tab label="Pods / Containers" />
            <Tab label="Workloads" />
            <Tab label="Vulnerabilities" />
          </Tabs>

          {tab === 0 && (
            <Table size="small">
              <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Status</TableCell><TableCell>Namespace</TableCell><TableCell>App</TableCell><TableCell>Node</TableCell></TableRow></TableHead>
              <TableBody>
                {[
                  ['pay-api-7c4d8', 'Running', 'payments', 'payment-service', 'node-2'],
                  ['web-frontend-89fd1', 'Running', 'frontend', 'web-frontend', 'node-4'],
                  ['events-worker-1', 'CrashLoopBackOff', 'events', 'events-worker', 'node-1'],
                ].map((row) => (
                  <TableRow key={row[0]}>
                    <TableCell>{row[0]}</TableCell>
                    <TableCell><Chip size="small" label={row[1]} color={row[1] === 'Running' ? 'success' : 'error'} /></TableCell>
                    <TableCell>{row[2]}</TableCell>
                    <TableCell>{row[3]}</TableCell>
                    <TableCell>{row[4]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {tab === 1 && (
            <Table size="small">
              <TableHead><TableRow><TableCell>Workload</TableCell><TableCell>Type</TableCell><TableCell>Desired</TableCell><TableCell>Ready</TableCell></TableRow></TableHead>
              <TableBody>
                {[
                  ['payment-service', 'Deployment', '4', '4'],
                  ['events-worker', 'Deployment', '2', '1'],
                  ['postgres-state', 'StatefulSet', '1', '1'],
                ].map((row) => (
                  <TableRow key={row[0]}>
                    <TableCell>{row[0]}</TableCell>
                    <TableCell>{row[1]}</TableCell>
                    <TableCell>{row[2]}</TableCell>
                    <TableCell>{row[3]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {tab === 2 && (
            <Stack gap={1}>
              {[
                ['registry/events:0.9.8', 'High', 'Critical package in base image'],
                ['registry/base/python:3.12', 'Medium', 'Outdated OpenSSL minor version'],
              ].map((item) => (
                <Card key={item[0]} variant="outlined">
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Typography sx={{ fontWeight: 700 }}>{item[0]}</Typography>
                    <Typography variant="body2"><strong>{item[1]}:</strong> {item[2]}</Typography>
                    <Typography variant="body2" color="primary">Learn more</Typography>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default DevContainersPage;
