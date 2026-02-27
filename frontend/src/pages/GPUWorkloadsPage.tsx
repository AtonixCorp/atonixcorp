// AtonixCorp Cloud – GPU Workloads Page
// GPU utilization, VRAM, temperature, job queue, per-GPU inventory

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Stack, Chip, Tabs, Tab,
  Table, TableHead, TableRow, TableCell, TableBody,
  Button, IconButton, Tooltip, Grid, LinearProgress,
} from '@mui/material';
import MemoryIcon     from '@mui/icons-material/Memory';
import PlayArrowIcon  from '@mui/icons-material/PlayArrow';
import StopIcon       from '@mui/icons-material/Stop';
import RefreshIcon    from '@mui/icons-material/Refresh';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import SpeedIcon      from '@mui/icons-material/Speed';
import {
  dashboardTokens,
  dashboardSemanticColors,
} from '../styles/dashboardDesignSystem';

const BG       = dashboardTokens.colors.background;
const SURFACE  = dashboardTokens.colors.surface;
const SURFACE2 = dashboardTokens.colors.surfaceSubtle;
const BORDER   = dashboardTokens.colors.border;
const TEXT     = dashboardTokens.colors.textPrimary;
const MUTED    = dashboardTokens.colors.textSecondary;
const BRAND    = dashboardTokens.colors.brandPrimary;
const SUCCESS  = dashboardSemanticColors.success;
const WARNING  = dashboardSemanticColors.warning;
const DANGER   = dashboardSemanticColors.danger;
const PURPLE   = dashboardSemanticColors.purple;
const FONT     = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const CELL_SX = { fontFamily: FONT, fontSize: '0.8rem', color: TEXT, borderColor: BORDER, py: 1.2 };
const HEAD_SX = { fontFamily: FONT, fontSize: '0.68rem', color: MUTED, fontWeight: 700, borderColor: BORDER, py: 1, textTransform: 'uppercase' as const, letterSpacing: '0.04em' };

const GPU_MODELS = [
  { id: 'gpu-01', model: 'NVIDIA H100 80GB', node: 'gpu-node-01', utilization: 87, vram_used: 68, vram_total: 80, temp: 72, power_w: 640, jobs: ['job-ml-train-01', 'job-inference-07'], status: 'running' },
  { id: 'gpu-02', model: 'NVIDIA H100 80GB', node: 'gpu-node-01', utilization: 94, vram_used: 74, vram_total: 80, temp: 78, power_w: 695, jobs: ['job-llm-finetune-02'], status: 'running' },
  { id: 'gpu-03', model: 'NVIDIA A100 40GB', node: 'gpu-node-02', utilization: 45, vram_used: 18, vram_total: 40, temp: 58, power_w: 280, jobs: ['job-batch-infer-03'], status: 'running' },
  { id: 'gpu-04', model: 'NVIDIA A100 40GB', node: 'gpu-node-02', utilization: 0,  vram_used: 0,  vram_total: 40, temp: 32, power_w: 40,  jobs: [], status: 'idle' },
  { id: 'gpu-05', model: 'NVIDIA RTX 4090',  node: 'gpu-node-03', utilization: 62, vram_used: 14, vram_total: 24, temp: 65, power_w: 350, jobs: ['job-render-04', 'job-sim-06'], status: 'running' },
  { id: 'gpu-06', model: 'NVIDIA RTX 4090',  node: 'gpu-node-03', utilization: 0,  vram_used: 0,  vram_total: 24, temp: 30, power_w: 38,  jobs: [], status: 'maintenance' },
];

const MOCK_JOBS = [
  { id: 'job-ml-train-01',   name: 'ResNet-152 Training',      user: 'alice.nguyen', gpus: 2, queue: 'high-priority', status: 'running', progress: 68, elapsed: '4h 22m', eta: '2h 10m' },
  { id: 'job-llm-finetune-02', name: 'LLaMA-3 Fine-tune',      user: 'bob.smith',    gpus: 1, queue: 'default',       status: 'running', progress: 34, elapsed: '1h 45m', eta: '3h 25m' },
  { id: 'job-batch-infer-03', name: 'Batch Embedding Gen.',    user: 'svc-ml',       gpus: 1, queue: 'batch',         status: 'running', progress: 82, elapsed: '0h 35m', eta: '0h 07m' },
  { id: 'job-render-04',     name: 'Volumetric Render Pass',   user: 'carol.jones',  gpus: 1, queue: 'default',       status: 'running', progress: 17, elapsed: '0h 20m', eta: '1h 38m' },
  { id: 'job-queued-05',     name: 'Stable Diffusion Batch',   user: 'dave.wilson',  gpus: 2, queue: 'batch',         status: 'queued',  progress: 0,  elapsed: '—',       eta: '~45m' },
  { id: 'job-sim-06',        name: 'Physics Simulation',       user: 'svc-sim',      gpus: 1, queue: 'default',       status: 'running', progress: 55, elapsed: '2h 08m', eta: '1h 45m' },
  { id: 'job-inference-07',  name: 'Real-time Inference API',  user: 'svc-api',      gpus: 1, queue: 'realtime',      status: 'running', progress: 99, elapsed: 'ongoing', eta: 'ongoing' },
];

const TABS = ['GPU Inventory', 'Job Queue'];

type LiveMetrics = { [id: string]: { utilization: number; temp: number } };

function UtilBar({ value, color }: { value: number; color: string }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 110 }}>
      <LinearProgress variant="determinate" value={value}
        sx={{ flexGrow: 1, height: 5, borderRadius: 4, bgcolor: `${color}22`, '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 } }} />
      <Typography sx={{ fontFamily: FONT, fontSize: '0.74rem', fontWeight: 700, color, minWidth: 32 }}>{value}%</Typography>
    </Stack>
  );
}

function SummaryCards({ gpus }: { gpus: typeof GPU_MODELS }) {
  const running  = gpus.filter(g => g.status === 'running').length;
  const avgUtil  = Math.round(gpus.reduce((s, g) => s + g.utilization, 0) / gpus.length);
  const totalVram = gpus.reduce((s, g) => s + g.vram_total, 0);
  const usedVram  = gpus.reduce((s, g) => s + g.vram_used, 0);
  const totalPower = gpus.reduce((s, g) => s + g.power_w, 0);
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {[
        { label: 'Active GPUs', value: `${running}/${gpus.length}`, sub: 'Running workloads', color: SUCCESS },
        { label: 'Avg Utilization', value: `${avgUtil}%`, sub: 'Across all GPUs', color: avgUtil > 80 ? WARNING : BRAND },
        { label: 'VRAM Used', value: `${usedVram}GB`, sub: `of ${totalVram}GB total`, color: PURPLE },
        { label: 'Power Draw', value: `${totalPower}W`, sub: 'Combined GPU power', color: WARNING },
      ].map(c => (
        <Grid size={{ xs: 6, sm: 3 }} key={c.label}>
          <Box sx={{ bgcolor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 1, p: 2 }}>
            <Typography sx={{ fontFamily: FONT, fontSize: '0.68rem', color: MUTED, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>{c.label}</Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: '1.5rem', fontWeight: 800, color: TEXT, lineHeight: 1 }}>{c.value}</Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: '0.7rem', color: MUTED, mt: 0.3 }}>{c.sub}</Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}

const GPUWorkloadsPage: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics>({});

  useEffect(() => {
    const tick = () => {
      const updated: LiveMetrics = {};
      GPU_MODELS.forEach(g => {
        updated[g.id] = {
          utilization: g.status === 'running' ? Math.min(100, g.utilization + Math.round((Math.random() - 0.5) * 8)) : 0,
          temp: g.status === 'running' ? Math.min(90, g.temp + Math.round((Math.random() - 0.5) * 4)) : g.temp,
        };
      });
      setLiveMetrics(updated);
    };
    tick();
    const id = setInterval(tick, 4000);
    return () => clearInterval(id);
  }, []);

  const statusColor: Record<string, string> = { running: SUCCESS, idle: MUTED, maintenance: WARNING };

  const renderInventory = () => (
    <Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            {['GPU', 'Model', 'Node', 'Status', 'Utilization', 'VRAM', 'Temp', 'Power', 'Jobs'].map(h => (
              <TableCell key={h} sx={HEAD_SX}>{h}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {GPU_MODELS.map(g => {
            const util = liveMetrics[g.id]?.utilization ?? g.utilization;
            const temp = liveMetrics[g.id]?.temp ?? g.temp;
            const vramPct = Math.round((g.vram_used / g.vram_total) * 100);
            const tempColor = temp >= 85 ? DANGER : temp >= 70 ? WARNING : SUCCESS;
            const utilColor = util >= 90 ? DANGER : util >= 70 ? WARNING : SUCCESS;
            return (
              <TableRow key={g.id} sx={{ '&:hover': { bgcolor: SURFACE2 } }}>
                <TableCell sx={{ ...CELL_SX, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.75rem', color: BRAND, fontWeight: 700 }}>{g.id}</TableCell>
                <TableCell sx={{ ...CELL_SX, fontSize: '0.75rem', fontWeight: 600 }}>{g.model}</TableCell>
                <TableCell sx={{ ...CELL_SX, color: MUTED, fontSize: '0.75rem' }}>{g.node}</TableCell>
                <TableCell sx={CELL_SX}>
                  <Chip label={g.status} size="small"
                    sx={{ fontSize: '0.65rem', height: 18, fontWeight: 700, bgcolor: `${statusColor[g.status]}1a`, color: statusColor[g.status], textTransform: 'capitalize' }} />
                </TableCell>
                <TableCell sx={CELL_SX}><UtilBar value={util} color={utilColor} /></TableCell>
                <TableCell sx={CELL_SX}>
                  <Stack spacing={0.2}>
                    <UtilBar value={vramPct} color={PURPLE} />
                    <Typography sx={{ fontFamily: FONT, fontSize: '0.65rem', color: MUTED }}>{g.vram_used}/{g.vram_total} GB</Typography>
                  </Stack>
                </TableCell>
                <TableCell sx={CELL_SX}>
                  <Stack direction="row" alignItems="center" spacing={0.4}>
                    <ThermostatIcon sx={{ fontSize: 13, color: tempColor }} />
                    <Typography sx={{ fontFamily: FONT, fontSize: '0.78rem', fontWeight: 700, color: tempColor }}>{temp}°C</Typography>
                  </Stack>
                </TableCell>
                <TableCell sx={{ ...CELL_SX, color: TEXT, fontWeight: 600 }}>{g.power_w}W</TableCell>
                <TableCell sx={{ ...CELL_SX, color: MUTED, fontSize: '0.72rem' }}>{g.jobs.length || '—'}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );

  const renderJobs = () => {
    const jobStatusColor: Record<string, string> = { running: SUCCESS, queued: WARNING, failed: DANGER, completed: MUTED };
    return (
      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.85rem', color: TEXT }}>{MOCK_JOBS.length} jobs</Typography>
        </Stack>
        <Table size="small">
          <TableHead>
            <TableRow>
              {['Job ID', 'Name', 'User', 'GPUs', 'Queue', 'Status', 'Progress', 'Elapsed', 'ETA'].map(h => (
                <TableCell key={h} sx={HEAD_SX}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {MOCK_JOBS.map(j => (
              <TableRow key={j.id} sx={{ '&:hover': { bgcolor: SURFACE2 } }}>
                <TableCell sx={{ ...CELL_SX, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.74rem', color: BRAND }}>{j.id}</TableCell>
                <TableCell sx={{ ...CELL_SX, fontWeight: 600 }}>{j.name}</TableCell>
                <TableCell sx={{ ...CELL_SX, color: MUTED }}>{j.user}</TableCell>
                <TableCell sx={{ ...CELL_SX, fontWeight: 700 }}>{j.gpus}</TableCell>
                <TableCell sx={{ ...CELL_SX, color: MUTED, fontSize: '0.75rem' }}>{j.queue}</TableCell>
                <TableCell sx={CELL_SX}>
                  <Chip label={j.status} size="small"
                    sx={{ fontSize: '0.65rem', height: 18, fontWeight: 700, bgcolor: `${jobStatusColor[j.status]}1a`, color: jobStatusColor[j.status], textTransform: 'capitalize' }} />
                </TableCell>
                <TableCell sx={CELL_SX}>
                  {j.status === 'running' ? (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <LinearProgress variant="determinate" value={j.progress}
                        sx={{ width: 80, height: 5, borderRadius: 4, bgcolor: `${SUCCESS}22`, '& .MuiLinearProgress-bar': { bgcolor: SUCCESS } }} />
                      <Typography sx={{ fontFamily: FONT, fontSize: '0.72rem', fontWeight: 700, color: SUCCESS }}>{j.progress}%</Typography>
                    </Stack>
                  ) : <Typography sx={{ fontFamily: FONT, fontSize: '0.72rem', color: MUTED }}>—</Typography>}
                </TableCell>
                <TableCell sx={{ ...CELL_SX, color: MUTED, fontSize: '0.75rem' }}>{j.elapsed}</TableCell>
                <TableCell sx={{ ...CELL_SX, color: MUTED, fontSize: '0.75rem' }}>{j.eta}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: BG, pb: 6, fontFamily: FONT }}>
      <Box sx={{ bgcolor: SURFACE, borderBottom: `1px solid ${BORDER}`, px: { xs: 2, md: 4 }, py: 2.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack spacing={0.3}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <MemoryIcon sx={{ color: BRAND, fontSize: 22 }} />
              <Typography sx={{ fontFamily: FONT, fontWeight: 800, fontSize: '1.1rem', color: TEXT }}>GPU Workloads</Typography>
            </Stack>
            <Typography sx={{ fontFamily: FONT, fontSize: '0.78rem', color: MUTED }}>
              GPU inventory · VRAM · Temperature · Job queue · Utilization
            </Typography>
          </Stack>
          <Tooltip title="Refresh"><IconButton size="small" sx={{ color: MUTED }}><RefreshIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
        </Stack>
      </Box>

      <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
        <SummaryCards gpus={GPU_MODELS} />

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ minHeight: 36, mb: 2, '& .MuiTab-root': { fontFamily: FONT, fontWeight: 600, fontSize: '0.78rem', textTransform: 'none', minHeight: 36, color: MUTED, py: 0 }, '& .Mui-selected': { color: BRAND }, '& .MuiTabs-indicator': { bgcolor: BRAND } }}>
          {TABS.map(t => <Tab key={t} label={t} />)}
        </Tabs>

        <Box sx={{ bgcolor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 1, p: 2.5 }}>
          {tab === 0 && renderInventory()}
          {tab === 1 && renderJobs()}
        </Box>
      </Box>
    </Box>
  );
};

export default GPUWorkloadsPage;
