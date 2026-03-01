import React, { useState, useEffect, useMemo } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { dashboardCardSx, dashboardPrimaryButtonSx, dashboardSemanticColors, dashboardTokens } from '../styles/dashboardDesignSystem';
import {
  listPipelines,
  triggerPipeline,
  cancelPipeline,
  listPipelineFiles,
  type BackendPipeline,
  type BackendPipelineFile,
} from '../services/pipelinesApi';
import { listProjects, type BackendProject } from '../services/projectsApi';

const FONT = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const t = dashboardTokens.colors;

type PipelineStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled';

const STATUS_CONFIG: Record<PipelineStatus, { color: string; bg: string; label: string }> = {
  pending:   { color: '#6B7280', bg: 'rgba(107,114,128,.12)', label: 'Pending' },
  running:   { color: dashboardSemanticColors.info, bg: 'rgba(21,61,117,.12)', label: 'Running' },
  success:   { color: dashboardSemanticColors.success, bg: 'rgba(34,197,94,.12)', label: 'Success' },
  failed:    { color: dashboardSemanticColors.danger, bg: 'rgba(239,68,68,.12)', label: 'Failed' },
  cancelled: { color: '#6B7280', bg: 'rgba(107,114,128,.12)', label: 'Cancelled' },
};

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.round(diff)}s ago`;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  return `${Math.round(diff / 86400)}d ago`;
}

const DevPipelinesPage: React.FC = () => {
  const [pipelines, setPipelines] = useState<BackendPipeline[]>([]);
  const [projects, setProjects] = useState<BackendProject[]>([]);
  const [pipelineFiles, setPipelineFiles] = useState<BackendPipelineFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [triggerDialogOpen, setTriggerDialogOpen] = useState(false);
  const [triggerForm, setTriggerForm] = useState({ pipeline_file: '', branch: '', environment: '' });
  const [triggerLoading, setTriggerLoading] = useState(false);
  const [triggerError, setTriggerError] = useState<string | null>(null);
  const [filterProject, setFilterProject] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterBranch, setFilterBranch] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pipelinesData, projectsData, filesData] = await Promise.all([
        listPipelines({
          project: filterProject || undefined,
          status: filterStatus || undefined,
          branch: filterBranch || undefined,
        }),
        listProjects(),
        listPipelineFiles(),
      ]);
      setPipelines(Array.isArray(pipelinesData) ? pipelinesData : []);
      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setPipelineFiles(Array.isArray(filesData) ? filesData : []);
    } catch (err) {
      setError('Failed to load pipeline data. Please try again.');
      setPipelines([]);
      setProjects([]);
      setPipelineFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterProject, filterStatus, filterBranch]);

  const handleTriggerPipeline = async () => {
    if (!triggerForm.pipeline_file || !triggerForm.branch) {
      setTriggerError('Pipeline file and branch are required.');
      return;
    }
    setTriggerLoading(true);
    setTriggerError(null);
    try {
      await triggerPipeline({
        pipeline_file: triggerForm.pipeline_file,
        branch: triggerForm.branch,
        environment: triggerForm.environment || undefined,
      });
      setTriggerDialogOpen(false);
      setTriggerForm({ pipeline_file: '', branch: '', environment: '' });
      loadData();
    } catch (err) {
      setTriggerError('Failed to trigger pipeline. Please try again.');
    } finally {
      setTriggerLoading(false);
    }
  };

  const handleCancelPipeline = async (pipelineId: string) => {
    try {
      await cancelPipeline(pipelineId);
      loadData();
    } catch (err) {
      setError('Failed to cancel pipeline.');
    }
  };

  const summary = useMemo(() => {
    if (!Array.isArray(pipelines)) {
      return { total: 0, running: 0, success: 0, failed: 0 };
    }
    const total = pipelines.length;
    const running = pipelines.filter((p) => p.status === 'running').length;
    const success = pipelines.filter((p) => p.status === 'success').length;
    const failed = pipelines.filter((p) => p.status === 'failed').length;
    return { total, running, success, failed };
  }, [pipelines]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: t.background, fontFamily: FONT, minHeight: '100vh' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} mb={2} gap={1}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: t.textPrimary }}>CI/CD Pipelines</Typography>
          <Typography variant="body2" sx={{ color: t.textSecondary }}>Manage and monitor pipeline runs across projects.</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PlayArrowIcon />}
          sx={dashboardPrimaryButtonSx}
          onClick={() => setTriggerDialogOpen(true)}
        >
          Trigger Pipeline
        </Button>
      </Stack>

      {/* Summary cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4,1fr)' }, gap: 1.5, mb: 2 }}>
        <Card sx={dashboardCardSx}>
          <CardContent>
            <Typography variant="caption" sx={{ color: t.textSecondary }}>Total Runs</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: t.textPrimary }}>{summary.total}</Typography>
          </CardContent>
        </Card>
        <Card sx={dashboardCardSx}>
          <CardContent>
            <Typography variant="caption" sx={{ color: t.textSecondary }}>Running</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: dashboardSemanticColors.info }}>{summary.running}</Typography>
          </CardContent>
        </Card>
        <Card sx={dashboardCardSx}>
          <CardContent>
            <Typography variant="caption" sx={{ color: t.textSecondary }}>Success</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: dashboardSemanticColors.success }}>{summary.success}</Typography>
          </CardContent>
        </Card>
        <Card sx={dashboardCardSx}>
          <CardContent>
            <Typography variant="caption" sx={{ color: t.textSecondary }}>Failed</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: summary.failed > 0 ? dashboardSemanticColors.danger : t.textPrimary }}>{summary.failed}</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Filters */}
      <Card sx={{ ...dashboardCardSx, mb: 2 }}>
        <CardContent>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel sx={{ color: t.textSecondary }}>Project</InputLabel>
              <Select
                value={filterProject}
                label="Project"
                onChange={(e) => setFilterProject(e.target.value)}
                sx={{ color: t.textPrimary, bgcolor: t.surfaceSubtle }}
              >
                <MenuItem value="">All Projects</MenuItem>
                {Array.isArray(projects) && projects.map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel sx={{ color: t.textSecondary }}>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
                sx={{ color: t.textPrimary, bgcolor: t.surfaceSubtle }}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="running">Running</MenuItem>
                <MenuItem value="success">Success</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="Branch"
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              sx={{ minWidth: 160, '& .MuiInputBase-root': { bgcolor: t.surfaceSubtle, color: t.textPrimary } }}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Pipeline runs table */}
      <Card sx={dashboardCardSx}>
        <CardContent>
          <Typography sx={{ fontWeight: 700, mb: 1.5, color: t.textPrimary }}>Pipeline Runs</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={32} sx={{ color: t.brandPrimary }} />
            </Box>
          ) : pipelines.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography sx={{ color: t.textSecondary }}>No pipeline runs found. Trigger a pipeline to get started.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: t.surfaceSubtle }}>
                    <TableCell sx={{ color: t.textPrimary, fontWeight: 700 }}>Pipeline</TableCell>
                    <TableCell sx={{ color: t.textPrimary, fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ color: t.textPrimary, fontWeight: 700 }}>Branch</TableCell>
                    <TableCell sx={{ color: t.textPrimary, fontWeight: 700 }}>Triggered By</TableCell>
                    <TableCell sx={{ color: t.textPrimary, fontWeight: 700 }}>Started</TableCell>
                    <TableCell align="right" sx={{ color: t.textPrimary, fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.isArray(pipelines) && pipelines.map((pipeline) => {
                    const config = STATUS_CONFIG[pipeline.status];
                    return (
                      <TableRow key={pipeline.id} hover sx={{ '&:hover': { bgcolor: t.surfaceHover } }}>
                        <TableCell sx={{ color: t.textPrimary }}>
                          <Typography sx={{ fontWeight: 600, fontSize: '.9rem' }}>{pipeline.pipeline_name}</Typography>
                          <Typography sx={{ fontSize: '.75rem', color: t.textTertiary }}>{pipeline.pipeline_file}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={config.label}
                            sx={{
                              bgcolor: config.bg,
                              color: config.color,
                              fontWeight: 700,
                              fontSize: '.75rem',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: t.textSecondary, fontSize: '.85rem' }}>{pipeline.branch}</TableCell>
                        <TableCell sx={{ color: t.textSecondary, fontSize: '.85rem' }}>{pipeline.triggered_by}</TableCell>
                        <TableCell sx={{ color: t.textSecondary, fontSize: '.85rem' }}>{timeAgo(pipeline.started_at)}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" justifyContent="flex-end" gap={1}>
                            <Button size="small" sx={{ color: t.brandPrimary, textTransform: 'none' }}>
                              View
                            </Button>
                            {(pipeline.status === 'running' || pipeline.status === 'pending') && (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleCancelPipeline(pipeline.id)}
                                sx={{ textTransform: 'none', borderColor: t.border, color: t.textSecondary }}
                              >
                                Cancel
                              </Button>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Trigger Pipeline Dialog */}
      <Dialog open={triggerDialogOpen} onClose={() => setTriggerDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: t.surface, color: t.textPrimary }}>Trigger Pipeline Run</DialogTitle>
        <DialogContent sx={{ bgcolor: t.surface }}>
          {triggerError && <Alert severity="error" sx={{ mb: 2, mt: 2 }}>{triggerError}</Alert>}
          <Stack spacing={2} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: t.textSecondary }}>Pipeline File</InputLabel>
              <Select
                value={triggerForm.pipeline_file}
                label="Pipeline File"
                onChange={(e) => setTriggerForm({ ...triggerForm, pipeline_file: e.target.value })}
                sx={{ color: t.textPrimary, bgcolor: t.surfaceSubtle }}
              >
                {Array.isArray(pipelineFiles) && pipelineFiles.map((file) => (
                  <MenuItem key={file.id} value={file.id}>{file.path}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Branch"
              value={triggerForm.branch}
              onChange={(e) => setTriggerForm({ ...triggerForm, branch: e.target.value })}
              placeholder="main"
              sx={{ '& .MuiInputBase-root': { bgcolor: t.surfaceSubtle, color: t.textPrimary } }}
            />
            <TextField
              fullWidth
              label="Environment (optional)"
              value={triggerForm.environment}
              onChange={(e) => setTriggerForm({ ...triggerForm, environment: e.target.value })}
              placeholder="production"
              sx={{ '& .MuiInputBase-root': { bgcolor: t.surfaceSubtle, color: t.textPrimary } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ bgcolor: t.surface }}>
          <Button onClick={() => setTriggerDialogOpen(false)} sx={{ color: t.textSecondary }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleTriggerPipeline}
            disabled={triggerLoading}
            sx={dashboardPrimaryButtonSx}
          >
            {triggerLoading ? <CircularProgress size={20} /> : 'Trigger'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DevPipelinesPage;
