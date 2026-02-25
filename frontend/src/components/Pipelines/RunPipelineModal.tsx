import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GitHubIcon from '@mui/icons-material/GitHub';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { dashboardTokens, dashboardSemanticColors } from '../../styles/dashboardDesignSystem';

const FONT = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const t = dashboardTokens.colors;

// Mock API data
const MOCK_PROJECTS = [
  { id: 'proj_123', name: 'atonix-api', description: 'API backend', createdAt: '2026-01-01T12:00:00Z' },
  { id: 'proj_124', name: 'atonix-web', description: 'Frontend application', createdAt: '2026-01-15T09:30:00Z' },
];

const MOCK_REPOS: Record<string, { id: string; provider: string; name: string; defaultBranch: string }[]> = {
  proj_123: [
    { id: 'repo_456', provider: 'github', name: 'atonix-api', defaultBranch: 'main' },
    { id: 'repo_457', provider: 'gitlab', name: 'atonix-api-mobile', defaultBranch: 'develop' },
  ],
  proj_124: [
    { id: 'repo_458', provider: 'github', name: 'atonix-web', defaultBranch: 'main' },
  ],
};

const MOCK_PIPELINE_FILES: Record<string, { id: string; path: string; type: string }[]> = {
  repo_456: [
    { id: 'file_789', path: '.atonix/pipeline.yaml', type: 'atonix' },
    { id: 'file_790', path: '.atonix/pipelines/deploy.yaml', type: 'atonix' },
  ],
  repo_457: [
    { id: 'file_791', path: '.atonix/pipeline.yaml', type: 'atonix' },
  ],
  repo_458: [
    { id: 'file_792', path: '.atonix/pipeline.yaml', type: 'atonix' },
  ],
};

const MOCK_PIPELINES: Record<string, { name: string; stages: string[]; file: string }[]> = {
  file_789: [
    { name: 'build', stages: ['install', 'build', 'test'], file: '.atonix/pipeline.yaml' },
    { name: 'deploy', stages: ['deploy'], file: '.atonix/pipeline.yaml' },
  ],
  file_790: [
    { name: 'deploy-prod', stages: ['deploy'], file: '.atonix/pipelines/deploy.yaml' },
  ],
  file_791: [
    { name: 'build', stages: ['install', 'build', 'test'], file: '.atonix/pipeline.yaml' },
  ],
  file_792: [
    { name: 'build-deploy', stages: ['install', 'build', 'test', 'deploy'], file: '.atonix/pipeline.yaml' },
  ],
};

const MOCK_BRANCHES: Record<string, string[]> = {
  repo_456: ['main', 'develop', 'feature/login'],
  repo_457: ['develop', 'main'],
  repo_458: ['main', 'staging'],
};

const PROVIDER_ICON: Record<string, React.ReactNode> = {
  github: <GitHubIcon sx={{ fontSize: '1.2rem' }} />,
  gitlab: <Box component="span" sx={{ fontWeight: 900, fontSize: '1rem', color: '#fc6d26' }}>GL</Box>,
  bitbucket: <Box component="span" sx={{ fontWeight: 900, fontSize: '1rem', color: '#0052cc' }}>BB</Box>,
};

interface RunPipelineModalProps {
  open: boolean;
  onClose: () => void;
  onPipelineStarted: (pipelineId: string) => void;
}

type Step = 'project' | 'repo' | 'files' | 'pipeline' | 'branch' | 'confirm';

const RunPipelineModal: React.FC<RunPipelineModalProps> = ({ open, onClose, onPipelineStarted }) => {
  const [step, setStep] = useState<Step>('project');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Selection state
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedRepo, setSelectedRepo] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [selectedPipeline, setSelectedPipeline] = useState<any>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>('');

  // Data state
  const [projects, setProjects] = useState<any[]>([]);
  const [repos, setRepos] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [branches, setBranches] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      reset();
      loadProjects();
    }
  }, [open]);

  const reset = () => {
    setStep('project');
    setSelectedProject(null);
    setSelectedRepo(null);
    setSelectedFile(null);
    setSelectedPipeline(null);
    setSelectedBranch('');
    setSearch('');
  };

  const loadProjects = async () => {
    setLoading(true);
    // Mock API call
    setTimeout(() => {
      setProjects(MOCK_PROJECTS);
      setLoading(false);
    }, 500);
  };

  const loadRepos = async (projectId: string) => {
    setLoading(true);
    setTimeout(() => {
      setRepos(MOCK_REPOS[projectId] || []);
      setLoading(false);
    }, 500);
  };

  const loadPipelineFiles = async (repoId: string) => {
    setLoading(true);
    setTimeout(() => {
      setFiles(MOCK_PIPELINE_FILES[repoId] || []);
      setLoading(false);
    }, 1000);
  };

  const loadPipelines = async (fileId: string) => {
    setLoading(true);
    setTimeout(() => {
      setPipelines(MOCK_PIPELINES[fileId] || []);
      setLoading(false);
    }, 500);
  };

  const loadBranches = async (repoId: string) => {
    setLoading(true);
    setTimeout(() => {
      const repoBranches = MOCK_BRANCHES[repoId] || [];
      setBranches(repoBranches);
      setSelectedBranch(repoBranches[0] || '');
      setLoading(false);
    }, 500);
  };

  const handleProjectSelect = (project: any) => {
    setSelectedProject(project);
    setStep('repo');
    loadRepos(project.id);
  };

  const handleRepoSelect = (repo: any) => {
    setSelectedRepo(repo);
    setStep('files');
    loadPipelineFiles(repo.id);
  };

  const handleFileSelect = (file: any) => {
    setSelectedFile(file);
    setStep('pipeline');
    loadPipelines(file.id);
  };

  const handlePipelineSelect = (pipeline: any) => {
    setSelectedPipeline(pipeline);
    setStep('branch');
    loadBranches(selectedRepo.id);
  };

  const handleRun = async () => {
    setLoading(true);
    // Mock API call
    setTimeout(() => {
      const pipelineId = `pipe_${Date.now()}`;
      onPipelineStarted(pipelineId);
      onClose();
      setLoading(false);
    }, 1000);
  };

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  const renderStepContent = () => {
    switch (step) {
      case 'project':
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontFamily: FONT, fontWeight: 600 }}>
              Select Project
            </Typography>
            <TextField
              fullWidth
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ mb: 2 }}
            />
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {filteredProjects.map((project) => (
                  <ListItem key={project.id} disablePadding>
                    <ListItemButton onClick={() => handleProjectSelect(project)}>
                      <ListItemText
                        primary={project.name}
                        secondary={project.description}
                      />
                      <ArrowForwardIcon sx={{ color: t.textSecondary }} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        );

      case 'repo':
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontFamily: FONT, fontWeight: 600 }}>
              Select Repository
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {repos.map((repo) => (
                  <ListItem key={repo.id} disablePadding>
                    <ListItemButton onClick={() => handleRepoSelect(repo)}>
                      <ListItemIcon>
                        {PROVIDER_ICON[repo.provider]}
                      </ListItemIcon>
                      <ListItemText
                        primary={repo.name}
                        secondary={`Default: ${repo.defaultBranch}`}
                      />
                      <ArrowForwardIcon sx={{ color: t.textSecondary }} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        );

      case 'files':
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontFamily: FONT, fontWeight: 600 }}>
              {loading ? 'Scanning repository for pipeline files...' : 'Select Pipeline File'}
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {files.map((file) => (
                  <ListItem key={file.id} disablePadding>
                    <ListItemButton onClick={() => handleFileSelect(file)}>
                      <ListItemText
                        primary={file.path}
                        secondary={`Type: ${file.type}`}
                      />
                      <ArrowForwardIcon sx={{ color: t.textSecondary }} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        );

      case 'pipeline':
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontFamily: FONT, fontWeight: 600 }}>
              Select Pipeline
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {pipelines.map((pipeline, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemButton onClick={() => handlePipelineSelect(pipeline)}>
                      <ListItemText
                        primary={pipeline.name}
                        secondary={`Stages: ${pipeline.stages.join(' → ')}`}
                      />
                      <ArrowForwardIcon sx={{ color: t.textSecondary }} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        );

      case 'branch':
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontFamily: FONT, fontWeight: 600 }}>
              Select Branch
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {branches.map((branch) => (
                  <ListItem key={branch} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        setSelectedBranch(branch);
                        setStep('confirm');
                      }}
                      selected={selectedBranch === branch}
                    >
                      <ListItemText primary={branch} />
                      {selectedBranch === branch && <CheckCircleIcon sx={{ color: dashboardSemanticColors.success }} />}
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        );

      case 'confirm':
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontFamily: FONT, fontWeight: 600 }}>
              Confirm Pipeline Run
            </Typography>
            <Card sx={{ mb: 2, border: `1px solid ${t.border}`, bgcolor: t.surface }}>
              <CardContent sx={{ p: '16px !important' }}>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontFamily: FONT, color: t.textSecondary }}>Project:</Typography>
                    <Typography sx={{ fontFamily: FONT, fontWeight: 600 }}>{selectedProject?.name}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontFamily: FONT, color: t.textSecondary }}>Repository:</Typography>
                    <Typography sx={{ fontFamily: FONT, fontWeight: 600 }}>{selectedRepo?.name}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontFamily: FONT, color: t.textSecondary }}>Pipeline:</Typography>
                    <Typography sx={{ fontFamily: FONT, fontWeight: 600 }}>{selectedPipeline?.name}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontFamily: FONT, color: t.textSecondary }}>Branch:</Typography>
                    <Typography sx={{ fontFamily: FONT, fontWeight: 600 }}>{selectedBranch}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontFamily: FONT, color: t.textSecondary }}>Stages:</Typography>
                    <Typography sx={{ fontFamily: FONT, fontWeight: 600 }}>{selectedPipeline?.stages.join(' → ')}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
            <Button
              fullWidth
              variant="contained"
              onClick={handleRun}
              disabled={loading}
              sx={{
                bgcolor: dashboardTokens.colors.brandPrimary,
                color: '#0a0f1a',
                fontWeight: 700,
                fontSize: '.9rem',
                borderRadius: '8px',
                textTransform: 'none',
                '&:hover': { bgcolor: dashboardTokens.colors.brandPrimaryHover },
              }}
            >
              {loading ? <CircularProgress size={20} /> : 'Run Pipeline'}
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'project': return 'Run Pipeline - Select Project';
      case 'repo': return 'Run Pipeline - Select Repository';
      case 'files': return 'Run Pipeline - Detect Pipeline Files';
      case 'pipeline': return 'Run Pipeline - Select Pipeline';
      case 'branch': return 'Run Pipeline - Select Branch';
      case 'confirm': return 'Run Pipeline - Confirm';
      default: return 'Run Pipeline';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          minHeight: '500px',
        },
      }}
    >
      <DialogTitle sx={{ fontFamily: FONT, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {getStepTitle()}
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 3 }}>
        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
};

export default RunPipelineModal;
