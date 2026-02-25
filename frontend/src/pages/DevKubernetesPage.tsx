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

const DevKubernetesPage: React.FC = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>Kubernetes</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Cluster health, node status, workloads, and namespace management.
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
            <Tab label="Nodes" />
            <Tab label="Workloads" />
            <Tab label="Namespaces" />
          </Tabs>

          {tab === 0 && (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Node</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>CPU</TableCell>
                  <TableCell>Memory</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  ['node-1', 'Ready', 'worker', '62%', '74%'],
                  ['node-2', 'Ready', 'worker', '45%', '58%'],
                  ['node-3', 'Ready', 'worker', '81%', '67%'],
                  ['node-4', 'Ready', 'worker', '38%', '42%'],
                  ['control-plane-1', 'Ready', 'control-plane', '21%', '33%'],
                ].map((row) => (
                  <TableRow key={row[0]}>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '.82rem' }}>{row[0]}</TableCell>
                    <TableCell><Chip size="small" label={row[1]} color={row[1] === 'Ready' ? 'success' : 'error'} /></TableCell>
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
              <TableHead>
                <TableRow>
                  <TableCell>Workload</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Namespace</TableCell>
                  <TableCell>Desired</TableCell>
                  <TableCell>Ready</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  ['payment-service', 'Deployment', 'payments', '4', '4'],
                  ['events-worker', 'Deployment', 'events', '2', '1'],
                  ['postgres-state', 'StatefulSet', 'data', '1', '1'],
                  ['redis-cache', 'Deployment', 'cache', '2', '2'],
                  ['ingress-nginx', 'DaemonSet', 'ingress', '5', '5'],
                ].map((row) => (
                  <TableRow key={row[0]}>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '.82rem' }}>{row[0]}</TableCell>
                    <TableCell>{row[1]}</TableCell>
                    <TableCell>{row[2]}</TableCell>
                    <TableCell>{row[3]}</TableCell>
                    <TableCell>
                      <Chip size="small" label={row[4]} color={row[3] === row[4] ? 'success' : 'warning'} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {tab === 2 && (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Namespace</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Pods</TableCell>
                  <TableCell>Services</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  ['default', 'Active', '0', '1'],
                  ['payments', 'Active', '28', '4'],
                  ['events', 'Active', '14', '3'],
                  ['frontend', 'Active', '22', '2'],
                  ['data', 'Active', '18', '5'],
                  ['cache', 'Active', '8', '2'],
                  ['ingress', 'Active', '10', '1'],
                  ['monitoring', 'Active', '12', '4'],
                ].map((row) => (
                  <TableRow key={row[0]}>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '.82rem' }}>{row[0]}</TableCell>
                    <TableCell><Chip size="small" label={row[1]} color="success" /></TableCell>
                    <TableCell>{row[2]}</TableCell>
                    <TableCell>{row[3]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default DevKubernetesPage;
