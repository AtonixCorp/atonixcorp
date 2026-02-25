import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import { dashboardTokens, dashboardSemanticColors } from '../../styles/dashboardDesignSystem';

const FONT = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const t = dashboardTokens.colors;

// Mock data
const MOCK_PIPELINE = {
  pipelineId: 'pipe_001',
  status: 'running',
  branch: 'main',
  triggeredBy: 'samuel',
  startedAt: '2026-02-25T10:00:00Z',
  project: 'atonix-api',
  repo: 'atonix-api',
  pipelineName: 'deploy',
};

const MOCK_JOBS = [
  { id: 'job_001', name: 'install', status: 'success', startedAt: '2026-02-25T10:00:00Z', finishedAt: '2026-02-25T10:02:00Z' },
  { id: 'job_002', name: 'build', status: 'running', startedAt: '2026-02-25T10:02:00Z' },
  { id: 'job_003', name: 'test', status: 'pending' },
  { id: 'job_004', name: 'deploy', status: 'pending' },
];

const MOCK_LOGS = `Installing dependencies...
go: downloading github.com/gofiber/fiber v2.51.0
go: downloading github.com/golang-jwt/jwt v4.5.0
✓ Dependencies installed

Building binary...
go build -o bin/gateway ./cmd/gateway
✓ Build successful (7.4 MB)

Running tests...
--- PASS: TestAuth (0.03s)
--- PASS: TestRateLimit (0.07s)
--- PASS: TestRouting (0.12s)
✓ All tests passed (38/38)

Deploying to production...
Waiting for rollout...`;

const STATUS_CONFIG = {
  success: { color: dashboardSemanticColors.success, bg: 'rgba(34,197,94,.12)', label: 'Success', icon: <CheckCircleIcon sx={{ fontSize: '1rem' }} /> },
  failed: { color: dashboardSemanticColors.danger, bg: 'rgba(239,68,68,.12)', label: 'Failed', icon: <CancelIcon sx={{ fontSize: '1rem' }} /> },
  running: { color: dashboardSemanticColors.info, bg: 'rgba(0,224,255,.12)', label: 'Running', icon: <HourglassTopIcon sx={{ fontSize: '1rem' }} /> },
  pending: { color: dashboardTokens.colors.textSecondary, bg: 'rgba(100,116,139,.12)', label: 'Pending', icon: <HourglassTopIcon sx={{ fontSize: '1rem', opacity: 0.5 }} /> },
};

interface PipelineDetailProps {
  pipelineId: string;
  open: boolean;
  onClose: () => void;
}

const PipelineDetail: React.FC<PipelineDetailProps> = ({ pipelineId, open, onClose }) => {
  const [pipeline, setPipeline] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsOpen, setLogsOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  useEffect(() => {
    if (open && pipelineId) {
      loadPipeline();
      loadJobs();
    }
  }, [open, pipelineId]);

  const loadPipeline = async () => {
    setLoading(true);
    // Mock API call
    setTimeout(() => {
      setPipeline(MOCK_PIPELINE);
      setLoading(false);
    }, 500);
  };

  const loadJobs = async () => {
    // Mock API call
    setTimeout(() => {
      setJobs(MOCK_JOBS);
    }, 500);
  };

  const handleViewLogs = (job: any) => {
    setSelectedJob(job);
    setLogsOpen(true);
  };

  const handleCancel = async () => {
    // Mock API call
    alert('Pipeline cancelled');
  };

  if (loading) {
    return (
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{ sx: { width: 600, bgcolor: t.surface } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      </Drawer>
    );
  }

  const pipelineCfg = STATUS_CONFIG[pipeline.status as keyof typeof STATUS_CONFIG];

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{ sx: { width: 600, bgcolor: t.surface } }}
      >
        <Box sx={{ p: 3, fontFamily: FONT }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: t.textPrimary }}>
              Pipeline {pipeline.pipelineId}
            </Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Status Card */}
          <Card sx={{ mb: 3, border: `1px solid ${t.border}`, boxShadow: 'none', borderRadius: '10px' }}>
            <CardContent sx={{ p: '20px !important' }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {pipelineCfg.icon}
                  <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: pipelineCfg.color }}>
                    {pipelineCfg.label}
                  </Typography>
                  <Chip label={pipeline.status} size="small" sx={{ bgcolor: pipelineCfg.bg, color: pipelineCfg.color, fontWeight: 600 }} />
                </Box>

                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: t.textSecondary }}>Project:</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{pipeline.project}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: t.textSecondary }}>Repository:</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{pipeline.repo}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: t.textSecondary }}>Branch:</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{pipeline.branch}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: t.textSecondary }}>Pipeline:</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{pipeline.pipelineName}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: t.textSecondary }}>Triggered by:</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{pipeline.triggeredBy}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: t.textSecondary }}>Started:</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{new Date(pipeline.startedAt).toLocaleString()}</Typography>
                  </Box>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Actions */}
          <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              startIcon={<StopIcon />}
              onClick={handleCancel}
              sx={{ borderColor: dashboardSemanticColors.danger, color: dashboardSemanticColors.danger, '&:hover': { borderColor: dashboardSemanticColors.danger, bgcolor: `${dashboardSemanticColors.danger}0a` } }}
            >
              Cancel Pipeline
            </Button>
          </Stack>

          {/* Jobs Table */}
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: t.textPrimary, mb: 2 }}>
            Jobs
          </Typography>
          <Box sx={{ border: `1px solid ${t.border}`, borderRadius: '10px', overflow: 'hidden' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: t.surfaceSubtle }}>
                  <TableCell sx={{ fontFamily: FONT, fontSize: '.72rem', fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '.06em', borderColor: t.border, py: 1.5 }}>Job</TableCell>
                  <TableCell sx={{ fontFamily: FONT, fontSize: '.72rem', fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '.06em', borderColor: t.border, py: 1.5 }}>Status</TableCell>
                  <TableCell sx={{ fontFamily: FONT, fontSize: '.72rem', fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '.06em', borderColor: t.border, py: 1.5 }}>Duration</TableCell>
                  <TableCell sx={{ fontFamily: FONT, fontSize: '.72rem', fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '.06em', borderColor: t.border, py: 1.5 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobs.map((job) => {
                  const cfg = STATUS_CONFIG[job.status as keyof typeof STATUS_CONFIG];
                  const duration = job.finishedAt && job.startedAt ?
                    Math.round((new Date(job.finishedAt).getTime() - new Date(job.startedAt).getTime()) / 1000) + 's' :
                    job.startedAt ? 'Running...' : '—';

                  return (
                    <TableRow key={job.id} sx={{ '& td': { borderColor: t.border } }}>
                      <TableCell sx={{ fontFamily: FONT, fontSize: '.85rem', fontWeight: 600, color: t.textPrimary, py: 1.5 }}>
                        {job.name}
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: cfg.color }}>
                          {cfg.icon}
                          <Typography sx={{ fontSize: '.8rem', fontWeight: 600, color: cfg.color, fontFamily: FONT }}>
                            {cfg.label}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontFamily: FONT, fontSize: '.8rem', color: t.textSecondary, py: 1.5 }}>
                        {duration}
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleViewLogs(job)}
                          sx={{ fontSize: '.7rem', fontFamily: FONT, textTransform: 'none', borderColor: t.border, color: t.textSecondary, borderRadius: '6px', py: 0.25, '&:hover': { borderColor: dashboardTokens.colors.brandPrimary, color: dashboardTokens.colors.brandPrimary } }}
                        >
                          View Logs
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        </Box>
      </Drawer>

      {/* Logs Drawer */}
      <Drawer
        anchor="right"
        open={logsOpen}
        onClose={() => setLogsOpen(false)}
        PaperProps={{ sx: { width: 600, bgcolor: '#0d1117' } }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${t.border}` }}>
          <Typography sx={{ fontWeight: 700, color: '#e6edf3', fontFamily: FONT, fontSize: '.9rem', flex: 1 }}>
            Job Logs · {selectedJob?.name}
          </Typography>
          <IconButton onClick={() => setLogsOpen(false)} sx={{ color: '#8b949e' }}>
            <CloseIcon sx={{ fontSize: '1rem' }} />
          </IconButton>
        </Box>
        <Box sx={{ p: 2, fontFamily: 'monospace', fontSize: '.78rem', color: '#e6edf3', lineHeight: 1.8, whiteSpace: 'pre-wrap', overflow: 'auto', flex: 1 }}>
          {MOCK_LOGS}
          <Box component="span" sx={{ display: 'inline-block', width: 8, height: '1em', bgcolor: '#00E0FF', animation: 'blink 1s step-end infinite', '@keyframes blink': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0 } } }} />
        </Box>
      </Drawer>
    </>
  );
};

export default PipelineDetail;
