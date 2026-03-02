import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  InputAdornment,
  LinearProgress,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GitHubIcon from '@mui/icons-material/GitHub';
import LockIcon from '@mui/icons-material/Lock';
import SearchIcon from '@mui/icons-material/Search';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ForkRightIcon from '@mui/icons-material/ForkRight';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { dashboardTokens, dashboardSemanticColors } from '../styles/dashboardDesignSystem';
import { createProject } from '../services/projectsApi';

const FONT = dashboardTokens.typography.fontFamily;
const t = dashboardTokens.colors;

type Provider = 'github' | 'gitlab' | 'bitbucket';

interface ProviderConfig {
  id: Provider;
  label: string;
  color: string;
  tokenLabel: string;
  tokenPlaceholder: string;
  docsUrl: string;
  abbr?: string;
}

const PROVIDERS: ProviderConfig[] = [
  {
    id: 'github',
    label: 'GitHub',
    color: '#e6edf3',
    tokenLabel: 'Personal Access Token',
    tokenPlaceholder: 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    docsUrl: 'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens',
  },
  {
    id: 'gitlab',
    label: 'GitLab',
    color: '#fc6d26',
    abbr: 'GL',
    tokenLabel: 'Personal Access Token',
    tokenPlaceholder: 'glpat-xxxxxxxxxxxxxxxxxxxx',
    docsUrl: 'https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html',
  },
  {
    id: 'bitbucket',
    label: 'Bitbucket',
    color: '#0052cc',
    abbr: 'BB',
    tokenLabel: 'App Password',
    tokenPlaceholder: 'App password from Bitbucket settings',
    docsUrl: 'https://support.atlassian.com/bitbucket-cloud/docs/app-passwords/',
  },
];

interface MockRepo {
  id: string;
  name: string;
  fullName: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  private: boolean;
  updatedAt: string;
}

const MOCK_REPOS: Record<Provider, MockRepo[]> = {
  github: [
    { id: 'ghrepo-1', name: 'api-gateway',       fullName: 'myorg/api-gateway',       description: 'Central API routing and auth layer',  language: 'TypeScript', stars: 24, forks: 8,  private: false, updatedAt: '2h ago' },
    { id: 'ghrepo-2', name: 'payments-service',  fullName: 'myorg/payments-service',  description: 'Stripe + PayPal payment processing',   language: 'Python',     stars: 12, forks: 3,  private: true,  updatedAt: '1d ago' },
    { id: 'ghrepo-3', name: 'infra-terraform',   fullName: 'myorg/infra-terraform',   description: 'Cloud infrastructure as code',         language: 'HCL',        stars: 7,  forks: 2,  private: true,  updatedAt: '3d ago' },
    { id: 'ghrepo-4', name: 'frontend-portal',   fullName: 'myorg/frontend-portal',   description: 'React dashboard & customer portal',    language: 'TypeScript', stars: 56, forks: 14, private: false, updatedAt: '5h ago' },
    { id: 'ghrepo-5', name: 'ml-pipeline',       fullName: 'myorg/ml-pipeline',       description: 'MLflow training & serving pipeline',   language: 'Python',     stars: 33, forks: 9,  private: false, updatedAt: '2d ago' },
  ],
  gitlab: [
    { id: 'glrepo-1', name: 'backend-core',      fullName: 'acme/backend-core',       description: 'Core backend microservices',           language: 'Go',         stars: 18, forks: 5,  private: true,  updatedAt: '1h ago' },
    { id: 'glrepo-2', name: 'devops-tooling',    fullName: 'acme/devops-tooling',     description: 'CI/CD utilities and helpers',          language: 'Python',     stars: 9,  forks: 2,  private: false, updatedAt: '4d ago' },
    { id: 'glrepo-3', name: 'k8s-manifests',     fullName: 'acme/k8s-manifests',      description: 'Kubernetes deployment manifests',      language: 'YAML',       stars: 4,  forks: 1,  private: true,  updatedAt: '1w ago' },
  ],
  bitbucket: [
    { id: 'bbrepo-1', name: 'mobile-app',        fullName: 'teamspace/mobile-app',    description: 'React Native cross-platform app',      language: 'TypeScript', stars: 0,  forks: 0,  private: true,  updatedAt: '6h ago' },
    { id: 'bbrepo-2', name: 'data-warehouse',    fullName: 'teamspace/data-warehouse','description': 'dbt models and Snowflake schemas',  language: 'SQL',        stars: 0,  forks: 0,  private: true,  updatedAt: '3d ago' },
  ],
};

const LANG_COLOR: Record<string, string> = {
  TypeScript: '#3178c6',
  Python: '#f7c948',
  Go: '#00acd7',
  Rust: '#ce412b',
  Java: '#b07219',
  HCL: '#844fba',
  YAML: '#cb171e',
  SQL: '#e38c00',
  Ruby: '#701516',
};

const STEPS = ['Choose Provider', 'Connect Account', 'Select Repository', 'Configure & Import'];

const ProviderBadge: React.FC<{ provider: ProviderConfig; size?: number; selected?: boolean; onClick?: () => void }> = ({
  provider, size = 40, selected = false, onClick,
}) => (
  <Tooltip title={provider.label}>
    <Box
      onClick={onClick}
      sx={{
        width: size, height: size, borderRadius: '10px',
        border: `2px solid ${selected ? t.brandPrimary : t.border}`,
        bgcolor: selected ? 'rgba(21,61,117,.08)' : t.surfaceSubtle,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color .15s, background .15s',
        flexShrink: 0,
        '&:hover': onClick ? { borderColor: t.brandPrimary, bgcolor: 'rgba(21,61,117,.06)' } : {},
      }}
    >
      {provider.id === 'github'
        ? <GitHubIcon sx={{ fontSize: size * 0.5, color: selected ? t.brandPrimary : t.textPrimary }} />
        : (
          <Typography sx={{ fontWeight: 900, fontSize: size * 0.3, color: selected ? t.brandPrimary : provider.color }}>
            {provider.abbr}
          </Typography>
        )
      }
    </Box>
  </Tooltip>
);

const inputSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: t.surfaceSubtle,
    color: t.textPrimary,
    borderRadius: '10px',
    fontSize: '.875rem',
    '& fieldset': { borderColor: t.border },
    '&:hover fieldset': { borderColor: t.borderStrong },
    '&.Mui-focused fieldset': { borderColor: t.brandPrimary, boxShadow: '0 0 0 3px rgba(21,61,117,.12)' },
  },
  '& .MuiInputLabel-root': { color: t.textSecondary, fontSize: '.875rem' },
};

const ProjectImportPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialProvider = (searchParams.get('provider') as Provider) || 'github';
  const [step, setStep] = useState(initialProvider ? 1 : 0);
  const [provider, setProvider] = useState<Provider>(initialProvider);
  const [token, setToken] = useState('');
  const [tokenVisible, setTokenVisible] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<MockRepo | null>(null);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const cfg = PROVIDERS.find((p) => p.id === provider)!;

  useEffect(() => {
    setConnected(false);
    setToken('');
    setConnectError(null);
    setSelectedRepo(null);
  }, [provider]);

  useEffect(() => {
    if (selectedRepo) {
      setProjectName(selectedRepo.name);
      setProjectDesc(selectedRepo.description);
    }
  }, [selectedRepo]);

  const repos = MOCK_REPOS[provider].filter(
    (r) => !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase()),
  );

  const handleConnect = () => {
    if (!token.trim()) {
      setConnectError('Please enter a valid access token.');
      return;
    }
    setConnecting(true);
    setConnectError(null);
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
      setStep(2);
    }, 1400);
  };

  const handleSelectRepo = (repo: MockRepo) => {
    setSelectedRepo(repo);
    setStep(3);
  };

  const handleImport = async () => {
    if (!projectName.trim()) return;
    setImporting(true);
    setImportError(null);
    try {
      const project = await createProject({
        name: projectName.trim(),
        description: projectDesc.trim(),
      });
      // Persist to localStorage so DevProjectsPage can pick it up
      const lsKey = 'atonix:projects:list:v1';
      const existing = JSON.parse(localStorage.getItem(lsKey) || '[]');
      const merged = [
        ...existing.filter((p: { id: string }) => p.id !== project.id),
        {
          id: project.id,
          name: project.name,
          description: project.description,
          status: 'active',
          language: selectedRepo?.language || 'TypeScript',
          branch: 'main',
          progress: 100,
          openIssues: 0,
          lastBuild: 'passing',
          updatedAt: 'Just now',
          members: ['Y'],
          tags: [provider],
          provider,
          importedFrom: selectedRepo?.fullName || '',
        },
      ];
      localStorage.setItem(lsKey, JSON.stringify(merged));
      localStorage.setItem('atonix:projects:snack:v1', `Project "${project.name}" imported successfully!`);
      navigate(`/developer/Dashboard/projects/${project.id}`);
    } catch {
      setImportError('Failed to create project. Make sure the backend is running.');
      setImporting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: t.background, fontFamily: FONT, p: { xs: 2, md: 4 } }}>
      {/* Back */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/developer/Dashboard/projects/new')}
        sx={{ textTransform: 'none', color: t.textSecondary, mb: 3, '&:hover': { color: t.textPrimary } }}
      >
        Back
      </Button>

      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 4 }}>
        <ProviderBadge provider={cfg} size={44} />
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.4rem', color: t.textPrimary, lineHeight: 1.2 }}>
            Import from {cfg.label}
          </Typography>
          <Typography sx={{ color: t.textSecondary, fontSize: '.85rem' }}>
            Connect your {cfg.label} account and select a repository to import
          </Typography>
        </Box>

        {/* Provider switcher */}
        <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
          {PROVIDERS.map((p) => (
            <ProviderBadge
              key={p.id}
              provider={p}
              size={36}
              selected={p.id === provider}
              onClick={() => { setProvider(p.id as Provider); setStep(1); }}
            />
          ))}
        </Stack>
      </Stack>

      {/* Stepper */}
      <Stepper activeStep={step} sx={{ mb: 4, maxWidth: 700 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel
              sx={{
                '& .MuiStepLabel-label': { color: t.textSecondary, fontSize: '.8rem', fontFamily: FONT },
                '& .MuiStepLabel-label.Mui-active': { color: t.textPrimary, fontWeight: 700 },
                '& .MuiStepLabel-label.Mui-completed': { color: dashboardSemanticColors.success },
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ maxWidth: 700 }}>
        {/* ── Step 1: Connect account ── */}
        {step === 1 && (
          <Card sx={{ border: `1px solid ${t.border}`, bgcolor: t.surface, borderRadius: '14px', boxShadow: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                <LockIcon sx={{ color: t.brandPrimary, fontSize: '1.1rem' }} />
                <Typography sx={{ fontWeight: 700, color: t.textPrimary, fontSize: '1rem' }}>
                  Connect your {cfg.label} account
                </Typography>
              </Stack>
              <Typography sx={{ color: t.textSecondary, fontSize: '.85rem', mb: 3 }}>
                Enter your {cfg.tokenLabel} with <code>repo</code> and <code>read:user</code> scopes.{' '}
                <Box
                  component="a"
                  href={cfg.docsUrl}
                  target="_blank"
                  rel="noreferrer"
                  sx={{ color: t.brandPrimary, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  How to create a token
                </Box>
              </Typography>

              <TextField
                fullWidth
                label={cfg.tokenLabel}
                placeholder={cfg.tokenPlaceholder}
                type={tokenVisible ? 'text' : 'password'}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                sx={inputSx}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Box
                        onClick={() => setTokenVisible((v) => !v)}
                        sx={{ cursor: 'pointer', color: t.textSecondary, display: 'flex' }}
                      >
                        {tokenVisible ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </Box>
                    </InputAdornment>
                  ),
                }}
              />

              {connectError && (
                <Alert severity="error" sx={{ mt: 1.5, fontSize: '.82rem' }}>{connectError}</Alert>
              )}

              <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }}>
                <Button
                  variant="contained"
                  onClick={handleConnect}
                  disabled={connecting || !token.trim()}
                  endIcon={connecting ? <CircularProgress size={14} color="inherit" /> : <ArrowForwardIcon />}
                  sx={{
                    bgcolor: t.brandPrimary,
                    '&:hover': { bgcolor: t.brandPrimaryHover },
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: '10px',
                  }}
                >
                  {connecting ? 'Connecting…' : `Connect ${cfg.label}`}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/developer/Dashboard/projects/new')}
                  sx={{ textTransform: 'none', color: t.textSecondary, borderColor: t.border, borderRadius: '10px' }}
                >
                  Cancel
                </Button>
              </Stack>

              <Divider sx={{ borderColor: t.border, my: 3 }} />

              <Typography sx={{ color: t.textTertiary, fontSize: '.78rem' }}>
                [Secure] Your token is used only for this session and is never stored on our servers.
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* ── Step 2: Select repository ── */}
        {step === 2 && connected && (
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <CheckCircleIcon sx={{ color: dashboardSemanticColors.success, fontSize: '1.1rem' }} />
              <Typography sx={{ color: dashboardSemanticColors.success, fontWeight: 600, fontSize: '.875rem' }}>
                Connected to {cfg.label}
              </Typography>
              <Button
                size="small"
                onClick={() => setStep(1)}
                sx={{ ml: 'auto', textTransform: 'none', color: t.textSecondary, fontSize: '.78rem' }}
              >
                Disconnect
              </Button>
            </Stack>

            <TextField
              fullWidth
              placeholder="Search repositories…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ ...inputSx, mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: t.textSecondary, fontSize: '1.1rem' }} />
                  </InputAdornment>
                ),
              }}
            />

            <Stack spacing={1.5}>
              {repos.length === 0 ? (
                <Typography sx={{ color: t.textSecondary, fontSize: '.875rem', textAlign: 'center', py: 4 }}>
                  No repositories found.
                </Typography>
              ) : (
                repos.map((repo) => (
                  <Card
                    key={repo.id}
                    onClick={() => handleSelectRepo(repo)}
                    sx={{
                      border: `1px solid ${t.border}`,
                      bgcolor: t.surface,
                      borderRadius: '12px',
                      boxShadow: 'none',
                      cursor: 'pointer',
                      transition: 'border-color .15s, background .15s',
                      '&:hover': { borderColor: t.brandPrimary, bgcolor: 'rgba(21,61,117,.03)' },
                    }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.25 }}>
                            <Typography
                              noWrap
                              sx={{ fontWeight: 700, fontSize: '.9rem', color: t.textPrimary }}
                            >
                              {repo.fullName}
                            </Typography>
                            {repo.private && (
                              <Chip
                                icon={<LockIcon sx={{ fontSize: '.7rem !important' }} />}
                                label="Private"
                                size="small"
                                sx={{ height: 18, fontSize: '.62rem', bgcolor: t.surfaceSubtle, color: t.textSecondary }}
                              />
                            )}
                          </Stack>
                          <Typography noWrap sx={{ color: t.textSecondary, fontSize: '.8rem', mb: 0.5 }}>
                            {repo.description}
                          </Typography>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <Box
                                sx={{
                                  width: 10, height: 10, borderRadius: '50%',
                                  bgcolor: LANG_COLOR[repo.language] || t.textSecondary,
                                  flexShrink: 0,
                                }}
                              />
                              <Typography sx={{ color: t.textSecondary, fontSize: '.75rem' }}>{repo.language}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.3} alignItems="center">
                              <StarBorderIcon sx={{ fontSize: '.8rem', color: t.textTertiary }} />
                              <Typography sx={{ color: t.textTertiary, fontSize: '.75rem' }}>{repo.stars}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.3} alignItems="center">
                              <ForkRightIcon sx={{ fontSize: '.8rem', color: t.textTertiary }} />
                              <Typography sx={{ color: t.textTertiary, fontSize: '.75rem' }}>{repo.forks}</Typography>
                            </Stack>
                            <Typography sx={{ color: t.textTertiary, fontSize: '.72rem', ml: 'auto' }}>
                              Updated {repo.updatedAt}
                            </Typography>
                          </Stack>
                        </Box>
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{
                            textTransform: 'none',
                            color: t.brandPrimary,
                            borderColor: t.brandPrimary,
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '.78rem',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                          }}
                        >
                          Select
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                ))
              )}
            </Stack>
          </Box>
        )}

        {/* ── Step 3: Configure & Import ── */}
        {step === 3 && selectedRepo && (
          <Card sx={{ border: `1px solid ${t.border}`, bgcolor: t.surface, borderRadius: '14px', boxShadow: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ fontWeight: 700, color: t.textPrimary, fontSize: '1rem', mb: 0.5 }}>
                Configure your project
              </Typography>
              <Typography sx={{ color: t.textSecondary, fontSize: '.85rem', mb: 3 }}>
                Importing{' '}
                <Box component="span" sx={{ fontWeight: 700, color: t.textPrimary }}>
                  {selectedRepo.fullName}
                </Box>{' '}
                from {cfg.label}
              </Typography>

              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  label="Project Name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  sx={inputSx}
                />
                <TextField
                  fullWidth
                  label="Description (optional)"
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  multiline
                  rows={2}
                  sx={inputSx}
                />

                {/* Summary card */}
                <Box
                  sx={{
                    bgcolor: t.surfaceSubtle,
                    border: `1px solid ${t.border}`,
                    borderRadius: '10px',
                    p: 2,
                  }}
                >
                  <Typography sx={{ fontWeight: 600, color: t.textPrimary, fontSize: '.85rem', mb: 1 }}>
                    Import summary
                  </Typography>
                  <Stack spacing={0.75}>
                    {[
                      ['Repository', selectedRepo.fullName],
                      ['Provider', cfg.label],
                      ['Language', selectedRepo.language],
                      ['Visibility', selectedRepo.private ? 'Private' : 'Public'],
                      ['Branch', 'main'],
                    ].map(([k, v]) => (
                      <Stack key={k} direction="row" spacing={1}>
                        <Typography sx={{ color: t.textSecondary, fontSize: '.8rem', width: 90, flexShrink: 0 }}>
                          {k}
                        </Typography>
                        <Typography sx={{ color: t.textPrimary, fontSize: '.8rem', fontWeight: 600 }}>{v}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>

                {importError && (
                  <Alert severity="error" sx={{ fontSize: '.82rem' }}>{importError}</Alert>
                )}

                {importing && <LinearProgress sx={{ borderRadius: '4px' }} />}

                <Stack direction="row" spacing={1.5}>
                  <Button
                    variant="contained"
                    disabled={!projectName.trim() || importing}
                    onClick={handleImport}
                    endIcon={importing ? <CircularProgress size={14} color="inherit" /> : <ArrowForwardIcon />}
                    sx={{
                      bgcolor: t.brandPrimary,
                      '&:hover': { bgcolor: t.brandPrimaryHover },
                      textTransform: 'none',
                      fontWeight: 700,
                      borderRadius: '10px',
                    }}
                  >
                    {importing ? 'Importing…' : 'Import Project'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setStep(2)}
                    sx={{ textTransform: 'none', color: t.textSecondary, borderColor: t.border, borderRadius: '10px' }}
                  >
                    Back to Repos
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default ProjectImportPage;
