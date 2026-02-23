import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
} from '@mui/material';

type RunStatus = 'Success' | 'Failed' | 'Running';

interface Pipeline {
  id: string;
  name: string;
  repoBranch: string;
  lastRun: string;
  status: RunStatus;
  trigger: 'manual' | 'auto';
  description: string;
  environments: string[];
  runs: Array<{ id: string; startedAt: string; status: RunStatus }>;
}

const PIPELINES: Pipeline[] = [
  {
    id: 'pl-1',
    name: 'payments-release',
    repoBranch: 'payments/main',
    lastRun: '2026-02-23 07:04',
    status: 'Success',
    trigger: 'auto',
    description: 'Build, test, security scan, deploy to stage/prod',
    environments: ['stage', 'prod'],
    runs: [
      { id: 'run-41', startedAt: '2026-02-23 07:04', status: 'Success' },
      { id: 'run-40', startedAt: '2026-02-22 16:11', status: 'Success' },
      { id: 'run-39', startedAt: '2026-02-22 10:29', status: 'Failed' },
    ],
  },
  {
    id: 'pl-2',
    name: 'frontend-ci',
    repoBranch: 'web/release/stage',
    lastRun: '2026-02-23 06:21',
    status: 'Running',
    trigger: 'manual',
    description: 'Build and push web image',
    environments: ['stage'],
    runs: [
      { id: 'run-88', startedAt: '2026-02-23 06:21', status: 'Running' },
      { id: 'run-87', startedAt: '2026-02-22 19:42', status: 'Success' },
    ],
  },
];

const statusColor = (status: RunStatus) => {
  if (status === 'Success') return 'success';
  if (status === 'Failed') return 'error';
  return 'warning';
};

const DevPipelinesPage: React.FC = () => {
  const [selected, setSelected] = useState<Pipeline | null>(null);

  const summary = useMemo(() => {
    return {
      total: PIPELINES.length,
      lastStatus: PIPELINES[0]?.status || 'N/A',
    };
  }, []);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} mb={2}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>CI/CD Pipelines</Typography>
          <Typography variant="body2" color="text.secondary">Run pipelines and inspect status without noise.</Typography>
        </Box>
        <Button variant="contained">Run pipeline</Button>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5, mb: 2 }}>
        <Card><CardContent><Typography variant="caption" color="text.secondary">Pipelines</Typography><Typography variant="h6" sx={{ fontWeight: 800 }}>{summary.total}</Typography></CardContent></Card>
        <Card><CardContent><Typography variant="caption" color="text.secondary">Last run status</Typography><Typography variant="h6" sx={{ fontWeight: 800 }}>{summary.lastStatus}</Typography></CardContent></Card>
      </Box>

      <Card>
        <CardContent>
          <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Pipelines</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Repo / Branch</TableCell>
                  <TableCell>Last Run</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Trigger</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {PIPELINES.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.repoBranch}</TableCell>
                    <TableCell>{item.lastRun}</TableCell>
                    <TableCell><Chip size="small" label={item.status} color={statusColor(item.status)} /></TableCell>
                    <TableCell>{item.trigger}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" justifyContent="flex-end" gap={1}>
                        <Button size="small" onClick={() => setSelected(item)}>View</Button>
                        <Button size="small" variant="outlined">Run pipeline</Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} maxWidth="md" fullWidth>
        <DialogTitle>{selected?.name}</DialogTitle>
        <DialogContent>
          {selected && (
            <Stack gap={1.5}>
              <Typography><strong>Overview:</strong> {selected.description}</Typography>
              <Typography><strong>Connected repo:</strong> {selected.repoBranch}</Typography>
              <Typography><strong>Environments:</strong> {selected.environments.join(', ')}</Typography>
              <Divider />
              <Typography sx={{ fontWeight: 700 }}>Runs history</Typography>
              {selected.runs.map((run) => (
                <Stack key={run.id} direction="row" justifyContent="space-between" alignItems="center">
                  <Typography>{run.id} · {run.startedAt}</Typography>
                  <Chip size="small" label={run.status} color={statusColor(run.status)} />
                </Stack>
              ))}
              <Stack direction="row" gap={1}>
                <Button variant="contained">Run pipeline</Button>
                <Button variant="outlined">View logs</Button>
              </Stack>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DevPipelinesPage;
