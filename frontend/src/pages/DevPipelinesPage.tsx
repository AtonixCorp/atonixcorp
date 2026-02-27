import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Chip,
  Stack,
  Snackbar,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { dashboardTokens, dashboardSemanticColors } from '../styles/dashboardDesignSystem';
import RunPipelineModal from '../components/Pipelines/RunPipelineModal';
import PipelineDetail from '../components/Pipelines/PipelineDetail';

const FONT = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const t = dashboardTokens.colors;

type RunStatus = 'success' | 'failed' | 'running' | 'pending';

interface PipelineRun {
  id: string;
  pipelineId: string;
  name: string;
  repoBranch: string;
  startedAt: string;
  status: RunStatus;
  trigger: 'manual' | 'auto';
  project: string;
  repo: string;
  branch: string;
  triggeredBy: string;
}

const MOCK_PIPELINE_RUNS: PipelineRun[] = [
  {
    id: 'run-41',
    pipelineId: 'pipe_001',
    name: 'payments-release',
    repoBranch: 'payments/main',
    startedAt: '2026-02-23T07:04:00Z',
    status: 'success',
    trigger: 'auto',
    project: 'atonix-api',
    repo: 'atonix-api',
    branch: 'main',
    triggeredBy: 'samuel',
  },
  {
    id: 'run-40',
    pipelineId: 'pipe_002',
    name: 'frontend-ci',
    repoBranch: 'web/release/stage',
    startedAt: '2026-02-23T06:21:00Z',
    status: 'running',
    trigger: 'manual',
    project: 'atonix-web',
    repo: 'atonix-web',
    branch: 'main',
    triggeredBy: 'jordan',
  },
  {
    id: 'run-39',
    pipelineId: 'pipe_003',
    name: 'security-scan',
    repoBranch: 'security/main',
    startedAt: '2026-02-22T16:11:00Z',
    status: 'failed',
    trigger: 'auto',
    project: 'atonix-security',
    repo: 'atonix-security',
    branch: 'main',
    triggeredBy: 'system',
  },
];

const STATUS_CONFIG = {
  success: { color: dashboardSemanticColors.success, bg: 'rgba(34,197,94,.12)', label: 'Success' },
  failed: { color: dashboardSemanticColors.danger, bg: 'rgba(239,68,68,.12)', label: 'Failed' },
  running: { color: dashboardSemanticColors.info, bg: 'rgba(0,224,255,.12)', label: 'Running' },
  pending: { color: dashboardTokens.colors.textSecondary, bg: 'rgba(100,116,139,.12)', label: 'Pending' },
};

const DevPipelinesPage: React.FC = () => {
  const [runs, setRuns] = useState<PipelineRun[]>(MOCK_PIPELINE_RUNS);
  const [runModalOpen, setRunModalOpen] = useState(false);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [snack, setSnack] = useState<string | null>(null);

  const summary = useMemo(() => {
    const total = runs.length;
    const running = runs.filter(r => r.status === 'running').length;
    const failed = runs.filter(r => r.status === 'failed').length;
    const success = runs.filter(r => r.status === 'success').length;
    return { total, running, failed, success };
  }, [runs]);

  const handlePipelineStarted = (pipelineId: string) => {
    // Add new run to the list
    const newRun: PipelineRun = {
      id: `run-${Date.now()}`,
      pipelineId,
      name: 'New Pipeline Run',
      repoBranch: 'unknown/main',
      startedAt: new Date().toISOString(),
      status: 'running',
      trigger: 'manual',
      project: 'unknown',
      repo: 'unknown',
      branch: 'main',
      triggeredBy: 'current-user',
    };
    setRuns(prev => [newRun, ...prev]);
    setSelectedPipelineId(pipelineId);
    setDetailOpen(true);
    setSnack(`Pipeline started successfully!`);
  };

  const handleViewPipeline = (run: PipelineRun) => {
    setSelectedPipelineId(run.pipelineId);
    setDetailOpen(true);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, fontFamily: FONT }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.2rem', md: '1.35rem' }, color: t.textPrimary, fontFamily: FONT, letterSpacing: '-.02em' }}>
            CI/CD Pipelines
          </Typography>
          <Typography sx={{ color: t.textSecondary, fontSize: '.875rem', mt: 0.3, fontFamily: FONT }}>
            Run pipelines, monitor builds, and inspect logs across all projects.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PlayArrowIcon />}
          onClick={() => setRunModalOpen(true)}
          sx={{
            bgcolor: dashboardTokens.colors.brandPrimary,
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '.8rem',
            borderRadius: '6px',
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': { bgcolor: dashboardTokens.colors.brandPrimaryHover, boxShadow: 'none' },
          }}
        >
          Run Pipeline
        </Button>
      </Box>

      {/* Stats bar */}
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5} sx={{ mb: 3 }}>
        {[
          { label: 'Total Runs', value: summary.total, color: dashboardSemanticColors.info },
          { label: 'Running', value: summary.running, color: dashboardSemanticColors.info },
          { label: 'Success', value: summary.success, color: dashboardSemanticColors.success },
          { label: 'Failed', value: summary.failed, color: dashboardSemanticColors.danger },
        ].map((s) => (
          <Card key={s.label} sx={{ flex: 1, border: `1px solid ${t.border}`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '8px' }}>
            <CardContent sx={{ p: '12px 16px !important' }}>
              <Typography sx={{ fontSize: '.72rem', fontWeight: 600, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: FONT }}>
                {s.label}
              </Typography>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, lineHeight: 1.2, fontFamily: FONT }}>
                {s.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Pipeline Runs Table */}
      <Card sx={{ border: `1px solid ${t.border}`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '10px' }}>
        <CardContent sx={{ p: '20px !important' }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: t.textPrimary, mb: 2, fontFamily: FONT }}>
            Recent Pipeline Runs
          </Typography>
          <Box sx={{ border: `1px solid ${t.border}`, borderRadius: '8px', overflow: 'hidden' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: t.surfaceSubtle }}>
                  <TableCell sx={{ fontFamily: FONT, fontSize: '.72rem', fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '.06em', borderColor: t.border, py: 1.5 }}>Pipeline</TableCell>
                  <TableCell sx={{ fontFamily: FONT, fontSize: '.72rem', fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '.06em', borderColor: t.border, py: 1.5 }}>Project / Repo</TableCell>
                  <TableCell sx={{ fontFamily: FONT, fontSize: '.72rem', fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '.06em', borderColor: t.border, py: 1.5 }}>Branch</TableCell>
                  <TableCell sx={{ fontFamily: FONT, fontSize: '.72rem', fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '.06em', borderColor: t.border, py: 1.5 }}>Status</TableCell>
                  <TableCell sx={{ fontFamily: FONT, fontSize: '.72rem', fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '.06em', borderColor: t.border, py: 1.5 }}>Triggered</TableCell>
                  <TableCell sx={{ fontFamily: FONT, fontSize: '.72rem', fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '.06em', borderColor: t.border, py: 1.5 }}>Started</TableCell>
                  <TableCell sx={{ fontFamily: FONT, fontSize: '.72rem', fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '.06em', borderColor: t.border, py: 1.5 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {runs.map((run) => {
                  const cfg = STATUS_CONFIG[run.status];
                  return (
                    <TableRow key={run.id} sx={{ '&:hover': { bgcolor: t.surfaceSubtle }, '& td': { borderColor: t.border } }}>
                      <TableCell sx={{ fontFamily: FONT, fontSize: '.85rem', fontWeight: 600, color: t.textPrimary, py: 1.5 }}>
                        {run.name}
                      </TableCell>
                      <TableCell sx={{ fontFamily: FONT, fontSize: '.8rem', color: t.textSecondary, py: 1.5 }}>
                        {run.project} / {run.repo}
                      </TableCell>
                      <TableCell sx={{ fontFamily: FONT, fontSize: '.8rem', color: t.textSecondary, py: 1.5 }}>
                        {run.branch}
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Chip
                          label={cfg.label}
                          size="small"
                          sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: '.7rem', height: 20 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontFamily: FONT, fontSize: '.8rem', color: t.textSecondary, py: 1.5 }}>
                        {run.trigger} · {run.triggeredBy}
                      </TableCell>
                      <TableCell sx={{ fontFamily: FONT, fontSize: '.8rem', color: t.textSecondary, py: 1.5 }}>
                        {new Date(run.startedAt).toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Button
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewPipeline(run)}
                          sx={{
                            fontSize: '.7rem',
                            fontFamily: FONT,
                            textTransform: 'none',
                            color: dashboardTokens.colors.brandPrimary,
                            borderRadius: '6px',
                            py: 0.25,
                            '&:hover': { bgcolor: 'rgba(0,224,255,.1)' },
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        </CardContent>
      </Card>

      {/* Modals */}
      <RunPipelineModal
        open={runModalOpen}
        onClose={() => setRunModalOpen(false)}
        onPipelineStarted={handlePipelineStarted}
      />

      <PipelineDetail
        pipelineId={selectedPipelineId || ''}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />

      <Snackbar
        open={!!snack}
        autoHideDuration={5000}
        onClose={() => setSnack(null)}
        message={snack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        ContentProps={{ sx: { bgcolor: dashboardSemanticColors.success, color: '#fff', fontFamily: FONT, fontSize: '.82rem', fontWeight: 600 } }}
      />
    </Box>
  );
};

export default DevPipelinesPage;
