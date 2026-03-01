import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { dashboardSemanticColors, dashboardTokens } from '../styles/dashboardDesignSystem';
import { listDevWorkspaces, startDevWorkspace, stopDevWorkspace, deleteDevWorkspace, type DevWorkspace } from '../services/devWorkspaceApi';

const FONT = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const t = dashboardTokens.colors;

const DevWorkspacePage: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<DevWorkspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listDevWorkspaces();
      setWorkspaces(data || []);
    } catch {
      setError('Unable to fetch workspaces from backend.');
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleStart = async (id: string) => {
    await startDevWorkspace(id);
    await load();
  };

  const handleStop = async (id: string) => {
    await stopDevWorkspace(id);
    await load();
  };

  const handleDelete = async (id: string) => {
    await deleteDevWorkspace(id);
    await load();
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, fontFamily: FONT }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, color: t.textPrimary, fontSize: '1.2rem' }}>Developer Workspace</Typography>
          <Typography sx={{ color: t.textSecondary, fontSize: '.85rem' }}>No mock data. Showing backend workspace records only.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Chip label="Real Data Only" size="small" sx={{ bgcolor: 'rgba(34,197,94,.12)', color: dashboardSemanticColors.success, fontWeight: 700 }} />
          <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={load} sx={{ textTransform: 'none', borderColor: t.borderStrong, color: t.textSecondary }}>
            Refresh
          </Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ border: `1px solid ${t.border}`, bgcolor: t.surface, boxShadow: 'none' }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Stack alignItems="center" sx={{ py: 4 }}>
              <CircularProgress size={24} sx={{ color: dashboardTokens.colors.brandPrimary, mb: 1 }} />
              <Typography sx={{ color: t.textSecondary }}>Loading workspaces…</Typography>
            </Stack>
          ) : workspaces.length === 0 ? (
            <Box sx={{ p: 3 }}>
              <Typography sx={{ color: t.textSecondary }}>No workspaces found from backend.</Typography>
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: t.textSecondary, fontWeight: 700 }}>ID</TableCell>
                  <TableCell sx={{ color: t.textSecondary, fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ color: t.textSecondary, fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ color: t.textSecondary, fontWeight: 700 }}>Region</TableCell>
                  <TableCell sx={{ color: t.textSecondary, fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {workspaces.map((ws: any) => (
                  <TableRow key={ws.id || ws.workspace_id}>
                    <TableCell>{ws.id || ws.workspace_id || '—'}</TableCell>
                    <TableCell>{ws.name || ws.workspace_name || '—'}</TableCell>
                    <TableCell>{ws.status || 'unknown'}</TableCell>
                    <TableCell>{ws.region || '—'}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" onClick={() => handleStart(ws.id || ws.workspace_id)} sx={{ textTransform: 'none' }}>Start</Button>
                        <Button size="small" onClick={() => handleStop(ws.id || ws.workspace_id)} sx={{ textTransform: 'none' }}>Stop</Button>
                        <Button size="small" color="error" onClick={() => handleDelete(ws.id || ws.workspace_id)} sx={{ textTransform: 'none' }}>Delete</Button>
                      </Stack>
                    </TableCell>
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

export default DevWorkspacePage;
