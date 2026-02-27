import React, { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GitHubIcon from '@mui/icons-material/GitHub';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import SearchIcon from '@mui/icons-material/Search';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LockIcon from '@mui/icons-material/Lock';
import PublicIcon from '@mui/icons-material/Public';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import LinkIcon from '@mui/icons-material/Link';
import { dashboardTokens, dashboardSemanticColors } from '../../styles/dashboardDesignSystem';

const FONT = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const t = dashboardTokens.colors;
const ACCENT = dashboardTokens.colors.brandPrimary;

// ── Types ─────────────────────────────────────────────────────────────────────

type Provider = 'github' | 'gitlab' | 'bitbucket' | null;

interface EnvVar { key: string; value: string; secret: boolean }

interface FormState {
  // Step 1
  name: string;
  description: string;
  visibility: 'private' | 'public';
  // Step 2
  provider: Provider;
  providerConnected: boolean;
  // Step 3
  repoSearch: string;
  selectedRepo: string | null;
  selectedBranch: string;
  // Step 4
  installCommand: string;
  buildCommand: string;
  outputDir: string;
  envVars: EnvVar[];
}

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (name: string, provider: Provider) => void;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_REPOS: Record<NonNullable<Provider>, Array<{ name: string; lang: string; private: boolean; updatedAt: string }>> = {
  github: [
    { name: 'api-gateway',       lang: 'Go',         private: false, updatedAt: '2h ago' },
    { name: 'payment-service',   lang: 'TypeScript',  private: true,  updatedAt: '1d ago' },
    { name: 'ml-pipeline',       lang: 'Python',      private: true,  updatedAt: '3d ago' },
    { name: 'web-frontend',      lang: 'TypeScript',  private: false, updatedAt: '4h ago' },
    { name: 'auth-service',      lang: 'Go',          private: true,  updatedAt: '2d ago' },
    { name: 'data-exporter',     lang: 'Python',      private: false, updatedAt: '1w ago' },
  ],
  gitlab: [
    { name: 'infra-terraform',   lang: 'HCL',         private: true,  updatedAt: '5h ago' },
    { name: 'events-worker',     lang: 'Java',         private: true,  updatedAt: '6h ago' },
    { name: 'kms-proxy',         lang: 'Rust',         private: true,  updatedAt: '1w ago' },
    { name: 'sdk-ci',            lang: 'TypeScript',   private: false, updatedAt: '2d ago' },
  ],
  bitbucket: [
    { name: 'legacy-api',        lang: 'Python',       private: true,  updatedAt: '2w ago' },
    { name: 'mobile-backend',    lang: 'Java',         private: true,  updatedAt: '3d ago' },
  ],
};

const BRANCHES = ['main', 'develop', 'feat/v2', 'release/1.0', 'hotfix/auth'];

const LANG_COLOR: Record<string, string> = {
  Go: '#00acd7', TypeScript: '#3178c6', Python: '#f7c948',
  Java: '#f89820', Rust: '#ce422b', HCL: '#7b42bc', React: '#61dafb',
};

const FRAMEWORK_DEFAULTS: Record<string, { install: string; build: string; output: string }> = {
  TypeScript: { install: 'npm install',   build: 'npm run build',   output: 'dist' },
  Python:     { install: 'pip install -r requirements.txt', build: 'python manage.py collectstatic', output: 'staticfiles' },
  Go:         { install: '',              build: 'go build ./...',  output: 'bin' },
  Java:       { install: 'mvn install',   build: 'mvn package',     output: 'target' },
  Rust:       { install: '',              build: 'cargo build --release', output: 'target/release' },
  HCL:        { install: 'terraform init', build: 'terraform plan', output: '.' },
};

// ── Shared input style ────────────────────────────────────────────────────────

const inputSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: t.surfaceSubtle,
    color: t.textPrimary,
    borderRadius: '8px',
    fontSize: '.875rem',
    '& fieldset': { borderColor: t.border },
    '&:hover fieldset': { borderColor: t.borderStrong },
    '&.Mui-focused fieldset': { borderColor: ACCENT, boxShadow: `0 0 0 3px rgba(21,61,117,0.13)` },
  },
  '& .MuiInputBase-input::placeholder': { color: t.textSecondary, opacity: 1 },
  '& .MuiInputLabel-root': { color: t.textSecondary, fontSize: '.875rem' },
  '& .MuiInputLabel-root.Mui-focused': { color: ACCENT },
};

// ── Provider card ─────────────────────────────────────────────────────────────

const ProviderCard: React.FC<{
  id: NonNullable<Provider>;
  label: string;
  logo: React.ReactNode;
  color: string;
  selected: boolean;
  connected: boolean;
  onSelect: () => void;
  onConnect: () => void;
}> = ({ id: _id, label, logo, color, selected, connected, onSelect, onConnect }) => (
  <Box
    onClick={onSelect}
    sx={{
      flex: 1,
      minWidth: 140,
      border: `2px solid ${selected ? color : t.border}`,
      borderRadius: '10px',
      p: 2,
      cursor: 'pointer',
      bgcolor: selected ? `${color}0e` : t.surfaceSubtle,
      transition: 'all .13s',
      '&:hover': { borderColor: color, bgcolor: `${color}0e` },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
      <Box sx={{ color: selected ? color : t.textSecondary, display: 'flex' }}>{logo}</Box>
      <Typography sx={{ fontWeight: 700, fontSize: '.875rem', color: selected ? t.textPrimary : t.textSecondary, fontFamily: FONT }}>
        {label}
      </Typography>
      {connected && (
        <Chip label="Connected" size="small" sx={{ ml: 'auto', bgcolor: 'rgba(34,197,94,.14)', color: dashboardSemanticColors.success, fontWeight: 700, fontSize: '.65rem', height: 16, '& .MuiChip-label': { px: 0.6 } }} />
      )}
    </Box>
    <Button
      size="small"
      variant={connected ? 'outlined' : 'contained'}
      fullWidth
      onClick={(e) => { e.stopPropagation(); onConnect(); }}
      startIcon={connected ? <CheckCircleIcon sx={{ fontSize: '.8rem' }} /> : <LinkIcon sx={{ fontSize: '.8rem' }} />}
      sx={{
        fontSize: '.72rem',
        borderRadius: '6px',
        textTransform: 'none',
        fontWeight: 700,
        boxShadow: 'none',
        bgcolor: connected ? 'transparent' : color,
        color: connected ? dashboardSemanticColors.success : '#fff',
        borderColor: connected ? dashboardSemanticColors.success : color,
        '&:hover': { boxShadow: 'none', bgcolor: connected ? 'rgba(34,197,94,.08)' : `${color}dd` },
      }}
    >
      {connected ? 'Connected' : `Connect ${label}`}
    </Button>
  </Box>
);

// ── Main Modal ────────────────────────────────────────────────────────────────

const STEPS = ['Project Info', 'Git Provider', 'Repository', 'Build Config', 'Review & Deploy'];

const DEFAULT_FORM: FormState = {
  name: '', description: '', visibility: 'private',
  provider: null, providerConnected: false,
  repoSearch: '', selectedRepo: null, selectedBranch: 'main',
  installCommand: '', buildCommand: '', outputDir: '',
  envVars: [{ key: 'NODE_ENV', value: 'production', secret: false }],
};

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ open, onClose, onCreated }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [creating, setCreating] = useState(false);

  const patch = (partial: Partial<FormState>) => setForm((f) => ({ ...f, ...partial }));

  const repoList = form.provider ? MOCK_REPOS[form.provider] : [];
  const visibleRepos = repoList.filter((r) => r.name.toLowerCase().includes(form.repoSearch.toLowerCase()));

  const selectedRepoObj = repoList.find((r) => r.name === form.selectedRepo) ?? null;
  const autoBuild = selectedRepoObj ? FRAMEWORK_DEFAULTS[selectedRepoObj.lang] ?? null : null;

  const canNext = () => {
    if (step === 0) return form.name.trim().length >= 2;
    if (step === 1) return form.provider !== null && form.providerConnected;
    if (step === 2) return form.selectedRepo !== null;
    if (step === 3) return true;
    return true;
  };

  const handleNext = () => {
    if (step === 2 && autoBuild && !form.buildCommand) {
      patch({ installCommand: autoBuild.install, buildCommand: autoBuild.build, outputDir: autoBuild.output });
    }
    setStep((s) => s + 1);
  };

  const handleCreate = () => {
    setCreating(true);
    setTimeout(() => {
      setCreating(false);
      onCreated(form.name, form.provider);
      setForm(DEFAULT_FORM);
      setStep(0);
      onClose();
    }, 1800);
  };

  const handleClose = () => {
    if (!creating) { setForm(DEFAULT_FORM); setStep(0); onClose(); }
  };

  const addEnvVar = () => patch({ envVars: [...form.envVars, { key: '', value: '', secret: false }] });
  const removeEnvVar = (i: number) => patch({ envVars: form.envVars.filter((_, idx) => idx !== i) });
  const updateEnvVar = (i: number, field: keyof EnvVar, value: string | boolean) => {
    const updated = [...form.envVars];
    updated[i] = { ...updated[i], [field]: value };
    patch({ envVars: updated });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: t.background,
          border: `1px solid ${t.border}`,
          borderRadius: '12px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ px: 3, pt: 2.5, pb: 2, borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(21,61,117,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: ACCENT }}>
          <RocketLaunchIcon sx={{ fontSize: '1rem' }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: t.textPrimary, fontFamily: FONT, lineHeight: 1.2 }}>
            Create New Project
          </Typography>
          <Typography sx={{ fontSize: '.78rem', color: t.textSecondary, fontFamily: FONT }}>
            Step {step + 1} of {STEPS.length} — {STEPS[step]}
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleClose} disabled={creating} sx={{ color: t.textSecondary }}>
          <CloseIcon sx={{ fontSize: '1rem' }} />
        </IconButton>
      </Box>

      {/* Progress */}
      <LinearProgress
        variant="determinate"
        value={((step + 1) / STEPS.length) * 100}
        sx={{ height: 2, bgcolor: t.border, '& .MuiLinearProgress-bar': { bgcolor: ACCENT } }}
      />

      {/* Stepper */}
      <Box sx={{ px: 3, py: 1.5, borderBottom: `1px solid ${t.border}` }}>
        <Stepper activeStep={step} alternativeLabel>
          {STEPS.map((label, i) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  '& .MuiStepLabel-label': { fontSize: '.7rem', fontFamily: FONT, color: i <= step ? t.textPrimary : t.textSecondary },
                  '& .MuiStepIcon-root': { color: i < step ? dashboardSemanticColors.success : i === step ? ACCENT : t.border, fontSize: '1.1rem' },
                  '& .MuiStepIcon-root.Mui-active': { color: ACCENT },
                  '& .MuiStepIcon-root.Mui-completed': { color: dashboardSemanticColors.success },
                  '& .MuiStepConnector-line': { borderColor: t.border },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <DialogContent sx={{ px: 3, py: 2.5, minHeight: 340 }}>

        {/* ── STEP 0: Project Info ── */}
        {step === 0 && (
          <Stack spacing={2}>
            <TextField label="Project Name *" value={form.name} onChange={(e) => patch({ name: e.target.value })} fullWidth size="small" sx={inputSx} placeholder="e.g. payment-service" />
            <TextField label="Description" value={form.description} onChange={(e) => patch({ description: e.target.value })} fullWidth size="small" multiline rows={2} sx={inputSx} placeholder="Brief description of this project…" />
            <Box>
              <Typography sx={{ fontSize: '.78rem', fontWeight: 600, color: t.textSecondary, mb: 1, fontFamily: FONT, textTransform: 'uppercase', letterSpacing: '.07em' }}>Visibility</Typography>
              <Stack direction="row" gap={1}>
                {([['private', 'Private', <LockIcon sx={{ fontSize: '1rem' }} />], ['public', 'Public', <PublicIcon sx={{ fontSize: '1rem' }} />]] as const).map(([val, label, icon]) => (
                  <Box
                    key={val}
                    onClick={() => patch({ visibility: val })}
                    sx={{
                      flex: 1,
                      border: `2px solid ${form.visibility === val ? ACCENT : t.border}`,
                      borderRadius: '8px',
                      p: 1.5,
                      cursor: 'pointer',
                      bgcolor: form.visibility === val ? 'rgba(21,61,117,0.08)' : t.surfaceSubtle,
                      display: 'flex', alignItems: 'center', gap: 1,
                      transition: 'all .12s',
                    }}
                  >
                    <Box sx={{ color: form.visibility === val ? ACCENT : t.textSecondary }}>{icon}</Box>
                    <Box>
                      <Typography sx={{ fontSize: '.82rem', fontWeight: 700, color: form.visibility === val ? t.textPrimary : t.textSecondary, fontFamily: FONT }}>{label}</Typography>
                      <Typography sx={{ fontSize: '.7rem', color: t.textSecondary, fontFamily: FONT }}>{val === 'private' ? 'Only you and collaborators' : 'Visible to everyone'}</Typography>
                    </Box>
                    {form.visibility === val && <CheckCircleIcon sx={{ ml: 'auto', color: ACCENT, fontSize: '1rem' }} />}
                  </Box>
                ))}
              </Stack>
            </Box>
          </Stack>
        )}

        {/* ── STEP 1: Git Provider ── */}
        {step === 1 && (
          <Stack spacing={2}>
            <Typography sx={{ fontSize: '.82rem', color: t.textSecondary, fontFamily: FONT }}>
              Connect a Git provider to import your repository. OAuth tokens are encrypted at rest using AES-256.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5}>
              <ProviderCard
                id="github" label="GitHub" color="#e8eaed"
                logo={<GitHubIcon sx={{ fontSize: '1.25rem' }} />}
                selected={form.provider === 'github'}
                connected={form.provider === 'github' && form.providerConnected}
                onSelect={() => patch({ provider: 'github', providerConnected: false })}
                onConnect={() => patch({ provider: 'github', providerConnected: true })}
              />
              <ProviderCard
                id="gitlab" label="GitLab" color="#fc6d26"
                logo={<Box component="span" sx={{ fontWeight: 900, fontSize: '1rem', color: '#fc6d26' }}>GL</Box>}
                selected={form.provider === 'gitlab'}
                connected={form.provider === 'gitlab' && form.providerConnected}
                onSelect={() => patch({ provider: 'gitlab', providerConnected: false })}
                onConnect={() => patch({ provider: 'gitlab', providerConnected: true })}
              />
              <ProviderCard
                id="bitbucket" label="Bitbucket" color="#0052cc"
                logo={<Box component="span" sx={{ fontWeight: 900, fontSize: '1rem', color: '#0052cc' }}>BB</Box>}
                selected={form.provider === 'bitbucket'}
                connected={form.provider === 'bitbucket' && form.providerConnected}
                onSelect={() => patch({ provider: 'bitbucket', providerConnected: false })}
                onConnect={() => patch({ provider: 'bitbucket', providerConnected: true })}
              />
            </Stack>
            {form.provider && form.providerConnected && (
              <Box sx={{ border: `1px solid rgba(34,197,94,.3)`, borderRadius: '8px', p: 1.5, bgcolor: 'rgba(34,197,94,.07)', display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon sx={{ color: dashboardSemanticColors.success, fontSize: '1rem' }} />
                <Typography sx={{ fontSize: '.82rem', color: dashboardSemanticColors.success, fontWeight: 600, fontFamily: FONT }}>
                  Successfully connected. Your OAuth token is encrypted and stored securely.
                </Typography>
              </Box>
            )}
            <Box sx={{ border: `1px solid ${t.border}`, borderRadius: '8px', p: 1.5, bgcolor: t.surfaceSubtle }}>
              <Typography sx={{ fontSize: '.75rem', color: t.textSecondary, fontFamily: FONT }}>
                <strong style={{ color: t.textPrimary }}>Security note:</strong> AtonixCorp only requests the minimum scopes needed (repo read, user:email). Tokens are encrypted with AES-256 and never exposed in logs.
              </Typography>
            </Box>
          </Stack>
        )}

        {/* ── STEP 2: Repository ── */}
        {step === 2 && (
          <Stack spacing={2}>
            <TextField
              value={form.repoSearch}
              onChange={(e) => patch({ repoSearch: e.target.value })}
              placeholder="Search repositories…"
              size="small"
              fullWidth
              sx={inputSx}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: t.textSecondary, fontSize: '1rem' }} /></InputAdornment> }}
            />
            <Box sx={{ maxHeight: 220, overflowY: 'auto', border: `1px solid ${t.border}`, borderRadius: '8px', bgcolor: t.surfaceSubtle }}>
              {visibleRepos.length === 0 && (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography sx={{ color: t.textSecondary, fontSize: '.82rem', fontFamily: FONT }}>No repositories found.</Typography>
                </Box>
              )}
              {visibleRepos.map((repo, i) => (
                <Box
                  key={repo.name}
                  onClick={() => patch({ selectedRepo: repo.name })}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1.1,
                    borderBottom: i < visibleRepos.length - 1 ? `1px solid ${t.border}` : 'none',
                    cursor: 'pointer',
                    bgcolor: form.selectedRepo === repo.name ? 'rgba(21,61,117,0.08)' : 'transparent',
                    '&:hover': { bgcolor: form.selectedRepo === repo.name ? 'rgba(21,61,117,0.10)' : t.surfaceHover },
                  }}
                >
                  {form.selectedRepo === repo.name
                    ? <CheckCircleIcon sx={{ color: ACCENT, fontSize: '1rem', flexShrink: 0 }} />
                    : <RadioButtonUncheckedIcon sx={{ color: t.textSecondary, fontSize: '1rem', flexShrink: 0 }} />}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '.875rem', color: t.textPrimary, fontFamily: FONT }}>{repo.name}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.2 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: LANG_COLOR[repo.lang] ?? '#888', flexShrink: 0 }} />
                      <Typography sx={{ fontSize: '.72rem', color: t.textSecondary, fontFamily: FONT }}>{repo.lang}</Typography>
                      {repo.private && <LockIcon sx={{ fontSize: '.7rem', color: t.textSecondary }} />}
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: '.72rem', color: t.textSecondary, fontFamily: FONT, whiteSpace: 'nowrap' }}>{repo.updatedAt}</Typography>
                </Box>
              ))}
            </Box>
            {form.selectedRepo && (
              <Box>
                <Typography sx={{ fontSize: '.78rem', fontWeight: 600, color: t.textSecondary, mb: 0.75, fontFamily: FONT, textTransform: 'uppercase', letterSpacing: '.07em' }}>
                  Branch
                </Typography>
                <Select
                  value={form.selectedBranch}
                  onChange={(e) => patch({ selectedBranch: e.target.value })}
                  size="small"
                  fullWidth
                  startAdornment={<InputAdornment position="start"><AccountTreeIcon sx={{ color: t.textSecondary, fontSize: '.9rem' }} /></InputAdornment>}
                  sx={{
                    bgcolor: t.surfaceSubtle, color: t.textPrimary, borderRadius: '8px', fontSize: '.875rem',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: t.border },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: t.borderStrong },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: ACCENT },
                    '& .MuiSvgIcon-root': { color: t.textSecondary },
                  }}
                  MenuProps={{ PaperProps: { sx: { bgcolor: t.surface, border: `1px solid ${t.border}`, borderRadius: '8px' } } }}
                >
                  {BRANCHES.map((b) => (
                    <MenuItem key={b} value={b} sx={{ fontSize: '.875rem', color: t.textPrimary, '&:hover': { bgcolor: t.surfaceHover } }}>{b}</MenuItem>
                  ))}
                </Select>
              </Box>
            )}
          </Stack>
        )}

        {/* ── STEP 3: Build Config ── */}
        {step === 3 && (
          <Stack spacing={2}>
            {autoBuild && (
              <Box sx={{ border: `1px solid rgba(21,61,117,.25)`, borderRadius: '8px', p: 1.5, bgcolor: 'rgba(21,61,117,.06)', display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon sx={{ color: ACCENT, fontSize: '1rem' }} />
                <Typography sx={{ fontSize: '.8rem', color: ACCENT, fontFamily: FONT }}>
                  Framework auto-detected: <strong>{selectedRepoObj?.lang}</strong>. Build settings pre-filled — adjust if needed.
                </Typography>
              </Box>
            )}
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5}>
              <TextField label="Install Command" value={form.installCommand} onChange={(e) => patch({ installCommand: e.target.value })} fullWidth size="small" sx={inputSx} placeholder="npm install" />
              <TextField label="Build Command" value={form.buildCommand} onChange={(e) => patch({ buildCommand: e.target.value })} fullWidth size="small" sx={inputSx} placeholder="npm run build" />
            </Stack>
            <TextField label="Output Directory" value={form.outputDir} onChange={(e) => patch({ outputDir: e.target.value })} fullWidth size="small" sx={inputSx} placeholder="dist" />
            <Divider sx={{ borderColor: t.border }} />
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontSize: '.78rem', fontWeight: 700, color: t.textSecondary, fontFamily: FONT, textTransform: 'uppercase', letterSpacing: '.07em' }}>
                  Environment Variables
                </Typography>
                <Button size="small" startIcon={<AddIcon sx={{ fontSize: '.8rem' }} />} onClick={addEnvVar} sx={{ fontSize: '.72rem', textTransform: 'none', color: ACCENT, '&:hover': { bgcolor: 'rgba(21,61,117,.08)' } }}>
                  Add Variable
                </Button>
              </Box>
              <Stack spacing={0.75}>
                {form.envVars.map((ev, i) => (
                  <Stack key={i} direction="row" gap={0.75} alignItems="center">
                    <TextField
                      value={ev.key} onChange={(e) => updateEnvVar(i, 'key', e.target.value)}
                      placeholder="KEY" size="small" sx={{ ...inputSx, flex: 1 }}
                    />
                    <TextField
                      value={ev.value} onChange={(e) => updateEnvVar(i, 'value', e.target.value)}
                      placeholder={ev.secret ? '••••••••' : 'value'} size="small"
                      type={ev.secret ? 'password' : 'text'}
                      sx={{ ...inputSx, flex: 2 }}
                    />
                    <Tooltip title={ev.secret ? 'Mark as plain' : 'Mark as secret'}>
                      <IconButton size="small" onClick={() => updateEnvVar(i, 'secret', !ev.secret)} sx={{ color: ev.secret ? dashboardSemanticColors.danger : t.textSecondary }}>
                        <LockIcon sx={{ fontSize: '.85rem' }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Remove">
                      <IconButton size="small" onClick={() => removeEnvVar(i)} sx={{ color: t.textSecondary }}>
                        <DeleteOutlineIcon sx={{ fontSize: '.85rem' }} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Stack>
        )}

        {/* ── STEP 4: Review & Deploy ── */}
        {step === 4 && (
          <Stack spacing={2}>
            <Box sx={{ border: `1px solid ${t.border}`, borderRadius: '10px', overflow: 'hidden' }}>
              {[
                { label: 'Project Name',   value: form.name },
                { label: 'Visibility',     value: form.visibility },
                { label: 'Git Provider',   value: form.provider ?? '—' },
                { label: 'Repository',     value: form.selectedRepo ?? '—' },
                { label: 'Branch',         value: form.selectedBranch },
                { label: 'Install',        value: form.installCommand || '(none)' },
                { label: 'Build',          value: form.buildCommand   || '(none)' },
                { label: 'Output Dir',     value: form.outputDir      || '(none)' },
                { label: 'Env Variables',  value: `${form.envVars.length} variable${form.envVars.length !== 1 ? 's' : ''}` },
              ].map((row, i, arr) => (
                <Box
                  key={row.label}
                  sx={{
                    display: 'flex', alignItems: 'center', px: 2, py: 1.1,
                    borderBottom: i < arr.length - 1 ? `1px solid ${t.border}` : 'none',
                    bgcolor: i % 2 === 0 ? t.surfaceSubtle : t.surface,
                  }}
                >
                  <Typography sx={{ fontSize: '.78rem', fontWeight: 600, color: t.textSecondary, fontFamily: FONT, width: 130, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                    {row.label}
                  </Typography>
                  <Typography sx={{ fontSize: '.875rem', color: t.textPrimary, fontFamily: FONT, fontWeight: 500 }}>
                    {row.value}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{ border: `1px solid ${t.border}`, borderRadius: '8px', p: 1.5, bgcolor: t.surfaceSubtle }}>
              <Typography sx={{ fontSize: '.78rem', color: t.textSecondary, fontFamily: FONT }}>
                On creation, AtonixCorp will: <strong style={{ color: t.textPrimary }}>import repository ZIP → detect framework → provision 4 environments (dev/staging/testing/prod) → create CI/CD pipeline → trigger first deployment.</strong>
              </Typography>
            </Box>
            {creating && (
              <Box>
                <LinearProgress sx={{ borderRadius: 2, height: 4, bgcolor: t.border, '& .MuiLinearProgress-bar': { bgcolor: ACCENT } }} />
                <Typography sx={{ fontSize: '.75rem', color: t.textSecondary, mt: 0.75, fontFamily: FONT, textAlign: 'center' }}>
                  Importing repository and provisioning project…
                </Typography>
              </Box>
            )}
          </Stack>
        )}
      </DialogContent>

      {/* Footer actions */}
      <Box sx={{ px: 3, py: 2, borderTop: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          startIcon={<ArrowBackIcon sx={{ fontSize: '.85rem' }} />}
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0 || creating}
          sx={{ textTransform: 'none', color: t.textSecondary, fontSize: '.8rem', '&:hover': { bgcolor: t.surfaceHover } }}
        >
          Back
        </Button>
        {step < 4 ? (
          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon sx={{ fontSize: '.85rem' }} />}
            onClick={handleNext}
            disabled={!canNext()}
            sx={{
              bgcolor: ACCENT, color: '#0a0f1a', fontWeight: 700, fontSize: '.82rem',
              borderRadius: '7px', textTransform: 'none', boxShadow: 'none',
              '&:hover': { bgcolor: dashboardTokens.colors.brandPrimaryHover, boxShadow: 'none' },
              '&.Mui-disabled': { opacity: 0.45 },
            }}
          >
            {step === 3 ? 'Review' : 'Continue'}
          </Button>
        ) : (
          <Button
            variant="contained"
            startIcon={<RocketLaunchIcon sx={{ fontSize: '.85rem' }} />}
            onClick={handleCreate}
            disabled={creating}
            sx={{
              bgcolor: dashboardSemanticColors.success, color: '#fff', fontWeight: 700, fontSize: '.82rem',
              borderRadius: '7px', textTransform: 'none', boxShadow: 'none',
              '&:hover': { bgcolor: '#16a34a', boxShadow: 'none' },
              '&.Mui-disabled': { opacity: 0.45 },
            }}
          >
            {creating ? 'Creating…' : 'Create & Deploy'}
          </Button>
        )}
      </Box>
    </Dialog>
  );
};

export default CreateProjectModal;
