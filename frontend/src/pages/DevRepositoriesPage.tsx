import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import SearchIcon           from '@mui/icons-material/Search';
import AccountTreeIcon      from '@mui/icons-material/AccountTree';
import AddIcon              from '@mui/icons-material/Add';
import FolderOpenIcon       from '@mui/icons-material/FolderOpenRounded';
import GitHubIcon           from '@mui/icons-material/GitHub';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import SyncIcon             from '@mui/icons-material/Sync';
import CallSplitIcon        from '@mui/icons-material/CallSplit';
import ScheduleIcon         from '@mui/icons-material/Schedule';
import LockIcon             from '@mui/icons-material/Lock';
import PublicIcon           from '@mui/icons-material/Public';
import GroupIcon            from '@mui/icons-material/Group';
import CheckCircleIcon      from '@mui/icons-material/CheckCircle';
import ErrorIcon            from '@mui/icons-material/Error';
import HourglassTopIcon     from '@mui/icons-material/HourglassTop';
import { useNavigate }      from 'react-router-dom';
import {
  listProjects,
  listProjectRepos,
  type BackendProject,
  type BackendRepository,
} from '../services/projectsApi';
import { dashboardTokens, dashboardSemanticColors } from '../styles/dashboardDesignSystem';

const FONT = dashboardTokens.typography.fontFamily;
const MONO = '"JetBrains Mono","Fira Code",monospace';
const t    = dashboardTokens.colors;

interface ProjectWithRepo {
  project:  BackendProject;
  repos:    BackendRepository[];
  loading:  boolean;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function relative(dateStr?: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

const PROVIDER_ICON: Record<string, React.ReactNode> = {
  github:   <GitHubIcon sx={{ fontSize: '1rem', color: t.textPrimary }} />,
  gitlab:   <Box component="span" sx={{ fontWeight: 900, fontSize: '.72rem', color: '#fc6d26', fontFamily: FONT }}>GL</Box>,
  bitbucket:<Box component="span" sx={{ fontWeight: 900, fontSize: '.72rem', color: '#0052cc', fontFamily: FONT }}>BB</Box>,
  atonix:   <AccountTreeIcon sx={{ fontSize: '1rem', color: t.brandPrimary }} />,
};

const VISIBILITY_ICON: Record<string, React.ReactNode> = {
  private: <LockIcon   sx={{ fontSize: '.75rem', color: t.textTertiary }} />,
  public:  <PublicIcon sx={{ fontSize: '.75rem', color: dashboardSemanticColors.success }} />,
  team:    <GroupIcon  sx={{ fontSize: '.75rem', color: dashboardSemanticColors.info }} />,
};

// ── Stat card ────────────────────────────────────────────────────────────────

const StatCard: React.FC<{ label: string; value: number | string; color: string }> = ({ label, value, color }) => (
  <Card sx={{ flex: 1, border: `1px solid ${t.border}`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '10px', p: '12px 16px' }}>
    <Typography sx={{ fontSize: '.7rem', fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: FONT }}>
      {label}
    </Typography>
    <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color, lineHeight: 1.2, fontFamily: FONT, mt: 0.25 }}>
      {value}
    </Typography>
  </Card>
);

// ── Pipeline badge ────────────────────────────────────────────────────────────

const PipelineBadge: React.FC<{ status: string }> = ({ status }) => {
  const cfg: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    success: { color: dashboardSemanticColors.success, icon: <CheckCircleIcon sx={{ fontSize: '.75rem' }} />, label: 'Passing' },
    failure: { color: dashboardSemanticColors.danger,  icon: <ErrorIcon       sx={{ fontSize: '.75rem' }} />, label: 'Failing' },
    running: { color: dashboardSemanticColors.info,    icon: <SyncIcon        sx={{ fontSize: '.75rem', animation: 'spin 1.2s linear infinite', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />, label: 'Running' },
    pending: { color: dashboardSemanticColors.warning, icon: <HourglassTopIcon sx={{ fontSize: '.75rem' }} />, label: 'Pending' },
  };
  const c = cfg[status];
  if (!c) return null;
  return (
    <Stack direction="row" alignItems="center" spacing={0.35}
      sx={{ px: 0.75, py: 0.25, borderRadius: '5px', bgcolor: `${c.color}18` }}>
      {c.icon}
      <Typography sx={{ fontSize: '.68rem', fontWeight: 700, color: c.color, fontFamily: FONT }}>{c.label}</Typography>
    </Stack>
  );
};

// ── Repository row ────────────────────────────────────────────────────────────

const RepoRow: React.FC<{
  project: BackendProject;
  repo:    BackendRepository;
}> = ({ project, repo }) => {
  const navigate = useNavigate();
  return (
    <Box
      onClick={() => navigate(`/developer/Dashboard/projects/${project.id}/repo`)}
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr 120px 96px' },
        alignItems: 'center',
        gap: 1.5,
        px: 2, py: 1.5,
        cursor: 'pointer',
        transition: 'background .12s',
        '&:hover': { bgcolor: `${t.brandPrimary}08` },
        '&:not(:last-child)': { borderBottom: `1px solid ${t.border}` },
      }}
    >
      {/* Name + meta */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
        <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: '8px', bgcolor: `${t.brandPrimary}14` }}>
          {PROVIDER_ICON[repo.provider] ?? <AccountTreeIcon sx={{ fontSize: '1rem', color: t.brandPrimary }} />}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Typography sx={{ fontFamily: MONO, fontWeight: 700, fontSize: '.875rem', color: t.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {repo.repo_name}
            </Typography>
            <Tooltip title={project.visibility}>
              {VISIBILITY_ICON[project.visibility] as React.ReactElement}
            </Tooltip>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.2 }}>
            <FolderOpenIcon sx={{ fontSize: '.7rem', color: t.textTertiary }} />
            <Typography sx={{ fontSize: '.72rem', color: t.textTertiary, fontFamily: FONT }}>
              {project.name}
            </Typography>
            <Typography sx={{ fontSize: '.72rem', color: t.textTertiary }}>·</Typography>
            <Chip
              label={repo.provider}
              size="small"
              sx={{ height: 16, bgcolor: t.surfaceSubtle, border: `1px solid ${t.border}`, color: t.textSecondary, fontSize: '.62rem', fontWeight: 600, '& .MuiChip-label': { px: 0.6 } }}
            />
          </Stack>
        </Box>
      </Box>

      {/* Default branch */}
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ display: { xs: 'none', md: 'flex' } }}>
        <CallSplitIcon sx={{ fontSize: '.8rem', color: t.textTertiary }} />
        <Typography sx={{ fontFamily: MONO, fontSize: '.78rem', color: t.textSecondary }}>
          {repo.default_branch}
        </Typography>
      </Stack>

      {/* Pipeline (placeholder — real status loaded per-repo) */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <PipelineBadge status="" />
      </Box>

      {/* Updated */}
      <Stack direction="row" alignItems="center" spacing={0.4} sx={{ display: { xs: 'none', md: 'flex' } }}>
        <ScheduleIcon sx={{ fontSize: '.75rem', color: t.textTertiary }} />
        <Typography sx={{ fontSize: '.75rem', color: t.textTertiary, fontFamily: FONT, whiteSpace: 'nowrap' }}>
          {relative(repo.updated_at ?? repo.created_at)}
        </Typography>
      </Stack>

      {/* Action */}
      <Button
        size="small"
        variant="outlined"
        endIcon={<KeyboardArrowRightIcon sx={{ fontSize: '.8rem' }} />}
        onClick={(e) => { e.stopPropagation(); navigate(`/developer/Dashboard/projects/${project.id}/repo`); }}
        sx={{
          textTransform: 'none', fontWeight: 700, fontSize: '.73rem',
          color: t.brandPrimary, borderColor: `${t.brandPrimary}50`,
          borderRadius: '7px', py: 0.35, px: 1.25,
          '&:hover': { borderColor: t.brandPrimary, bgcolor: `${t.brandPrimary}0a` },
          whiteSpace: 'nowrap',
        }}
      >
        Open
      </Button>
    </Box>
  );
};

// ── Empty project row (no repo) ───────────────────────────────────────────────

const NoRepoRow: React.FC<{ project: BackendProject }> = ({ project }) => {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr 120px 96px' },
        alignItems: 'center',
        gap: 1.5,
        px: 2, py: 1.5,
        opacity: 0.72,
        '&:not(:last-child)': { borderBottom: `1px solid ${t.border}` },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: '8px', bgcolor: t.surfaceSubtle, border: `1px dashed ${t.border}` }}>
          <AccountTreeIcon sx={{ fontSize: '.9rem', color: t.textTertiary }} />
        </Box>
        <Box>
          <Typography sx={{ fontFamily: MONO, fontWeight: 600, fontSize: '.875rem', color: t.textSecondary }}>{project.name}</Typography>
          <Typography sx={{ fontSize: '.72rem', color: t.textTertiary, fontFamily: FONT, mt: 0.2 }}>No repository connected</Typography>
        </Box>
      </Box>
      <Box sx={{ display: { xs: 'none', md: 'block' } }} />
      <Box sx={{ display: { xs: 'none', md: 'block' } }} />
      <Box sx={{ display: { xs: 'none', md: 'block' } }} />
      <Button
        size="small"
        variant="outlined"
        startIcon={<AddIcon sx={{ fontSize: '.8rem' }} />}
        onClick={() => navigate(`/developer/Dashboard/projects/${project.id}/repo`)}
        sx={{
          textTransform: 'none', fontWeight: 700, fontSize: '.73rem',
          color: t.textSecondary, borderColor: t.border,
          borderRadius: '7px', py: 0.35, px: 1.25,
          '&:hover': { borderColor: t.brandPrimary, color: t.brandPrimary },
          whiteSpace: 'nowrap',
        }}
      >
        Set up
      </Button>
    </Box>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────

const DevRepositoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [items,   setItems]   = useState<ProjectWithRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [query,   setQuery]   = useState('');
  const [filter,  setFilter]  = useState<'all' | 'connected' | 'empty'>('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const projects = await listProjects();

      // Initial state — repos loading
      const initial: ProjectWithRepo[] = projects.map(p => ({ project: p, repos: [], loading: p.has_repo }));
      setItems(initial);
      setLoading(false);

      // Fetch repos for projects that have them in parallel
      const withRepo = projects.filter(p => p.has_repo);
      await Promise.allSettled(
        withRepo.map(async (p) => {
          try {
            const repos = await listProjectRepos(p.id);
            setItems(prev => prev.map(it => it.project.id === p.id ? { ...it, repos, loading: false } : it));
          } catch {
            setItems(prev => prev.map(it => it.project.id === p.id ? { ...it, loading: false } : it));
          }
        })
      );
    } catch {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Derived ──────────────────────────────────────────────────────────────

  const totalRepos     = items.reduce((n, it) => n + it.repos.length, 0);
  const connectedCount = items.filter(it => it.repos.length > 0).length;
  const emptyCount     = items.filter(it => it.repos.length === 0).length;

  const filtered = items.filter(it => {
    if (filter === 'connected' && it.repos.length === 0) return false;
    if (filter === 'empty' && it.repos.length > 0)       return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      it.project.name.toLowerCase().includes(q) ||
      it.repos.some(r => r.repo_name.toLowerCase().includes(q) || r.provider.toLowerCase().includes(q))
    );
  });

  // Flatten to rows: each repo = 1 row; no-repo projects = 1 row
  type RepoRow = { project: BackendProject; repo: BackendRepository | null };
  const rows: RepoRow[] = filtered.flatMap<RepoRow>(it =>
    it.repos.length > 0
      ? it.repos.map(r => ({ project: it.project, repo: r as BackendRepository | null }))
      : [{ project: it.project, repo: null }]
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, fontFamily: FONT }}>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.2rem', md: '1.35rem' }, color: t.textPrimary, fontFamily: FONT, letterSpacing: '-.02em' }}>
            Repositories
          </Typography>
          <Typography sx={{ color: t.textSecondary, fontSize: '.875rem', mt: 0.3, fontFamily: FONT }}>
            All source repositories across your projects — browse files, commits, branches, and pipelines.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<SyncIcon sx={{ fontSize: '.85rem' }} />}
            onClick={load}
            sx={{ textTransform: 'none', fontSize: '.8rem', color: t.textSecondary, borderColor: t.border, borderRadius: '7px', fontWeight: 600, '&:hover': { borderColor: t.brandPrimary, color: t.brandPrimary } }}
          >
            Refresh
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/developer/Dashboard/projects/new')}
            sx={{ bgcolor: t.brandPrimary, '&:hover': { bgcolor: dashboardTokens.colors.brandPrimaryHover }, fontWeight: 700, fontSize: '.8rem', borderRadius: '7px', textTransform: 'none', boxShadow: 'none' }}
          >
            New Project
          </Button>
        </Stack>
      </Box>

      {/* Stats */}
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5} sx={{ mb: 3 }}>
        <StatCard label="Total Projects"       value={items.length}   color={t.textPrimary} />
        <StatCard label="With Repositories"    value={connectedCount} color={dashboardSemanticColors.success} />
        <StatCard label="Total Repositories"   value={totalRepos}     color={t.brandPrimary} />
        <StatCard label="Awaiting Setup"        value={emptyCount}     color={dashboardSemanticColors.warning} />
      </Stack>

      {/* Filter + search */}
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} alignItems={{ sm: 'center' }} sx={{ mb: 2.5 }}>
        <Stack direction="row" gap={0.5}>
          {([
            { id: 'all',       label: `All (${items.length})` },
            { id: 'connected', label: `Connected (${connectedCount})` },
            { id: 'empty',     label: `No Repo (${emptyCount})` },
          ] as const).map(f => (
            <Button
              key={f.id}
              size="small"
              onClick={() => setFilter(f.id)}
              sx={{
                textTransform: 'none', fontWeight: filter === f.id ? 700 : 500, fontSize: '.78rem',
                borderRadius: '6px', px: 1.25,
                color:  filter === f.id ? t.brandPrimary : t.textSecondary,
                bgcolor: filter === f.id ? `${t.brandPrimary}12` : 'transparent',
                border: `1px solid ${filter === f.id ? t.brandPrimary + '44' : 'transparent'}`,
                '&:hover': { bgcolor: `${t.brandPrimary}08` },
              }}
            >
              {f.label}
            </Button>
          ))}
        </Stack>
        <TextField
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search repositories, projects…"
          size="small"
          sx={{
            ml: { sm: 'auto' }, minWidth: 240,
            '& .MuiOutlinedInput-root': {
              bgcolor: t.surface, color: t.textPrimary, borderRadius: '8px', fontSize: '.875rem',
              '& fieldset': { borderColor: t.border },
              '&:hover fieldset': { borderColor: t.borderStrong },
              '&.Mui-focused fieldset': { borderColor: t.brandPrimary, boxShadow: `0 0 0 3px ${t.brandPrimary}22` },
            },
            '& .MuiInputBase-input::placeholder': { color: t.textSecondary, opacity: 1 },
          }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: t.textSecondary, fontSize: '1rem' }} /></InputAdornment> }}
        />
      </Stack>

      {/* Table */}
      <Card sx={{ border: `1px solid ${t.border}`, bgcolor: t.surface, boxShadow: 'none', borderRadius: '10px', overflow: 'hidden' }}>

        {/* Column headers */}
        <Box
          sx={{
            display: { xs: 'none', md: 'grid' },
            gridTemplateColumns: '2fr 1fr 1fr 120px 96px',
            gap: 1.5, px: 2, py: 1,
            borderBottom: `1px solid ${t.border}`,
            bgcolor: t.surfaceSubtle,
          }}
        >
          {['Repository', 'Branch', 'Pipeline', 'Updated', ''].map(col => (
            <Typography key={col} sx={{ fontSize: '.7rem', fontWeight: 700, color: t.textTertiary, textTransform: 'uppercase', letterSpacing: '.07em', fontFamily: FONT }}>
              {col}
            </Typography>
          ))}
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: t.brandPrimary }} size={28} />
          </Box>
        ) : rows.length === 0 ? (
          <Box sx={{ py: 5, textAlign: 'center' }}>
            <AccountTreeIcon sx={{ fontSize: '2rem', color: t.textTertiary, mb: 1 }} />
            <Typography sx={{ color: t.textSecondary, fontFamily: FONT, fontWeight: 600 }}>No repositories found</Typography>
            <Typography sx={{ color: t.textTertiary, fontFamily: FONT, fontSize: '.82rem', mt: 0.5 }}>
              Create a project and connect a repository to get started.
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => navigate('/developer/Dashboard/projects/new')}
              sx={{ mt: 2, bgcolor: t.brandPrimary, '&:hover': { bgcolor: dashboardTokens.colors.brandPrimaryHover }, textTransform: 'none', fontWeight: 700, borderRadius: '8px', boxShadow: 'none' }}
            >
              New Project
            </Button>
          </Box>
        ) : (
          rows.map(({ project, repo }, i) =>
            repo
              ? <RepoRow key={`${project.id}-${repo.id}`} project={project} repo={repo} />
              : <NoRepoRow key={project.id} project={project} />
          )
        )}
      </Card>

      {/* Footer count */}
      {rows.length > 0 && (
        <Typography sx={{ mt: 1.5, fontSize: '.75rem', color: t.textTertiary, fontFamily: FONT, textAlign: 'right' }}>
          Showing {rows.length} {rows.length === 1 ? 'entry' : 'entries'}{query ? ` matching "${query}"` : ''}
        </Typography>
      )}
    </Box>
  );
};

export default DevRepositoriesPage;
