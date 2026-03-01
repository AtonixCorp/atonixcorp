import React, { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AddIcon from '@mui/icons-material/Add';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CodeIcon from '@mui/icons-material/Code';
import CommitIcon from '@mui/icons-material/Commit';
import DataObjectIcon from '@mui/icons-material/DataObject';
import DescriptionIcon from '@mui/icons-material/Description';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import GitHubIcon from '@mui/icons-material/GitHub';
import HubIcon from '@mui/icons-material/Hub';
import LayersIcon from '@mui/icons-material/Layers';
import LinkIcon from '@mui/icons-material/Link';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PersonIcon from '@mui/icons-material/Person';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import StorageIcon from '@mui/icons-material/Storage';
import WebhookIcon from '@mui/icons-material/Webhook';
import DevicesIcon from '@mui/icons-material/Devices';
import TerminalIcon from '@mui/icons-material/Terminal';
import { useNavigate, useParams } from 'react-router-dom';
import { dashboardTokens, dashboardSemanticColors } from '../styles/dashboardDesignSystem';
import { getProject, type BackendProject } from '../services/projectsApi';

const FONT = dashboardTokens.typography.fontFamily;
const t = dashboardTokens.colors;

// ─── File tree ────────────────────────────────────────────────────────────────

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'dir';
  children?: FileNode[];
  lang?: string;
  content?: string;
}

const README_CONTENT = `# Project Dashboard

Welcome to your project! This repository was set up by the Atonix platform.

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
\`\`\`

## Project Structure

\`\`\`
src/
  index.ts      — Application entry point
  app.ts        — Express app configuration
  config.ts     — Environment & config loader
tests/
  app.test.ts   — Integration tests
Dockerfile      — Container image definition
\`\`\`

## CI/CD

This project is connected to the Atonix DevOps pipeline. Every push to \`main\` triggers a build, test, and deploy cycle.

## Environments

| Environment | URL | Status |
|-------------|-----|--------|
| Production  | https://app.example.com | ✅ Active |
| Staging     | https://staging.example.com | ✅ Active |
| Development | http://localhost:3000 | 🔧 Local |
`;

const DOCKERFILE_CONTENT = `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/index.js"]
`;

const INDEX_CONTENT = `import express from 'express';
import { createApp } from './app';
import { loadConfig } from './config';

const config = loadConfig();
const app = createApp(config);

app.listen(config.port, () => {
  console.log(\`Server running on port \${config.port}\`);
});
`;

const DEFAULT_FILE_TREE: FileNode[] = [
  {
    id: 'src', name: 'src', type: 'dir',
    children: [
      { id: 'src/index.ts',  name: 'index.ts',  type: 'file', lang: 'TypeScript', content: INDEX_CONTENT },
      { id: 'src/app.ts',    name: 'app.ts',    type: 'file', lang: 'TypeScript', content: '// App configuration\nexport function createApp(config) { ... }' },
      { id: 'src/config.ts', name: 'config.ts', type: 'file', lang: 'TypeScript', content: '// Config loader\nexport function loadConfig() { return { port: 3000 }; }' },
    ],
  },
  {
    id: 'tests', name: 'tests', type: 'dir',
    children: [
      { id: 'tests/app.test.ts', name: 'app.test.ts', type: 'file', lang: 'TypeScript', content: "import { createApp } from '../src/app';\ndescribe('app', () => { it('runs', () => { expect(true).toBe(true); }); });" },
    ],
  },
  {
    id: '.github', name: '.github', type: 'dir',
    children: [
      {
        id: '.github/workflows', name: 'workflows', type: 'dir',
        children: [
          { id: '.github/workflows/ci.yml', name: 'ci.yml', type: 'file', lang: 'YAML', content: 'name: CI\non: [push, pull_request]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - run: npm ci\n      - run: npm test' },
        ],
      },
    ],
  },
  { id: 'Dockerfile',    name: 'Dockerfile',    type: 'file', lang: 'Docker',     content: DOCKERFILE_CONTENT },
  { id: 'README.md',     name: 'README.md',     type: 'file', lang: 'Markdown',   content: README_CONTENT },
  { id: 'package.json',  name: 'package.json',  type: 'file', lang: 'JSON',       content: '{\n  "name": "my-project",\n  "version": "1.0.0",\n  "scripts": {\n    "dev": "ts-node src/index.ts",\n    "build": "tsc",\n    "test": "jest"\n  }\n}' },
  { id: 'tsconfig.json', name: 'tsconfig.json', type: 'file', lang: 'JSON',       content: '{\n  "compilerOptions": {\n    "target": "ES2020",\n    "module": "commonjs",\n    "strict": true,\n    "outDir": "dist"\n  }\n}' },
];

const MOCK_COMMITS = [
  { hash: 'a1b2c3d', message: 'feat: add Dockerfile', author: 'You', time: '2m ago' },
  { hash: 'e4f5g6h', message: 'chore: init project', author: 'You', time: '5m ago' },
];

// ─── Service sidebar links ────────────────────────────────────────────────────

interface ServiceLink {
  label: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
  badgeColor?: string;
}

const SERVICE_LINKS: ServiceLink[] = [
  { label: 'CI/CD Pipelines',      description: 'Build, test & deploy',         icon: <PlayCircleOutlineIcon />,    path: '/developer/Dashboard/cicd',        badge: 'Configured', badgeColor: dashboardSemanticColors.success },
  { label: 'Containers',           description: 'Container registry & images',   icon: <LayersIcon />,               path: '/developer/Dashboard/containers' },
  { label: 'Kubernetes',           description: 'Clusters & deployments',        icon: <HubIcon />,                  path: '/developer/Dashboard/kubernetes' },
  { label: 'Service Catalog',      description: 'Reusable service templates',    icon: <StorageIcon />,              path: '/developer/Dashboard/catalog' },
  { label: 'Webhooks',             description: 'Event integrations',            icon: <WebhookIcon />,              path: '/developer/Dashboard/webhooks' },
  { label: 'Groups',               description: 'Teams & access control',        icon: <PersonIcon />,               path: '/developer/Dashboard/groups' },
  { label: 'Developer Workspaces', description: 'Cloud dev environments',        icon: <TerminalIcon />,             path: '/developer/Dashboard/workspace' },
  { label: 'Environments',         description: 'Prod, staging & dev configs',   icon: <DevicesIcon />,              path: '/developer/Dashboard/environment' },
];

const QUICK_ACTIONS = [
  { label: 'New Pipeline',   icon: <RocketLaunchIcon sx={{ fontSize: '.9rem' }} />,      path: '/developer/Dashboard/cicd' },
  { label: 'Deploy',         icon: <SettingsEthernetIcon sx={{ fontSize: '.9rem' }} />,  path: '/developer/Dashboard/deployments' },
  { label: 'Open Workspace', icon: <TerminalIcon sx={{ fontSize: '.9rem' }} />,          path: '/developer/Dashboard/workspace' },
];

// ─── File icon helper ─────────────────────────────────────────────────────────

const FileIcon: React.FC<{ name: string; lang?: string }> = ({ name, lang }) => {
  const lower = name.toLowerCase();
  let color: string = t.textSecondary;
  if (lang === 'TypeScript' || lower.endsWith('.ts') || lower.endsWith('.tsx')) color = '#3178c6';
  else if (lang === 'Python' || lower.endsWith('.py')) color = '#f7c948';
  else if (lang === 'Go' || lower.endsWith('.go')) color = '#00acd7';
  else if (lang === 'Markdown' || lower.endsWith('.md')) color = '#60a5fa';
  else if (lang === 'YAML' || lower.endsWith('.yml') || lower.endsWith('.yaml')) color = '#cb171e';
  else if (lang === 'JSON' || lower.endsWith('.json')) color = '#f38518';
  else if (lang === 'Docker' || lower === 'dockerfile') color = '#2496ed';
  return <DescriptionIcon sx={{ fontSize: '.9rem', color, flexShrink: 0 }} />;
};

// ─── Recursive file-tree node ─────────────────────────────────────────────────

const FileTreeNode: React.FC<{
  node: FileNode;
  depth: number;
  selectedId: string | null;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (node: FileNode) => void;
}> = ({ node, depth, selectedId, expandedIds, onToggle, onSelect }) => {
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;

  if (node.type === 'dir') {
    return (
      <>
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
          onClick={() => onToggle(node.id)}
          sx={{
            pl: `${depth * 12 + 8}px`,
            pr: 1,
            py: 0.4,
            cursor: 'pointer',
            borderRadius: '6px',
            mx: 0.5,
            bgcolor: 'transparent',
            '&:hover': { bgcolor: t.surfaceHover },
            userSelect: 'none',
          }}
        >
          {isExpanded
            ? <FolderOpenIcon sx={{ fontSize: '.95rem', color: '#f59e0b', flexShrink: 0 }} />
            : <FolderIcon sx={{ fontSize: '.95rem', color: '#f59e0b', flexShrink: 0 }} />
          }
          <Typography sx={{ fontSize: '.8rem', color: t.textPrimary, flex: 1 }}>{node.name}</Typography>
          {isExpanded
            ? <ExpandMoreIcon sx={{ fontSize: '.75rem', color: t.textTertiary }} />
            : <ChevronRightIcon sx={{ fontSize: '.75rem', color: t.textTertiary }} />
          }
        </Stack>
        <Collapse in={isExpanded}>
          {node.children?.map((child) => (
            <FileTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </Collapse>
      </>
    );
  }

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.75}
      onClick={() => onSelect(node)}
      sx={{
        pl: `${depth * 12 + 8}px`,
        pr: 1,
        py: 0.4,
        cursor: 'pointer',
        borderRadius: '6px',
        mx: 0.5,
        bgcolor: isSelected ? 'rgba(21,61,117,.12)' : 'transparent',
        '&:hover': { bgcolor: isSelected ? 'rgba(21,61,117,.16)' : t.surfaceHover },
        userSelect: 'none',
      }}
    >
      <FileIcon name={node.name} lang={node.lang} />
      <Typography
        sx={{
          fontSize: '.8rem',
          color: isSelected ? t.brandPrimary : t.textPrimary,
          fontWeight: isSelected ? 600 : 400,
          flex: 1,
        }}
      >
        {node.name}
      </Typography>
    </Stack>
  );
};

// ─── Markdown-ish renderer (simplified) ──────────────────────────────────────

const SimpleMarkdown: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCode = false;
  let codeLines: string[] = [];
  let codeKey = 0;

  lines.forEach((line, i) => {
    if (line.startsWith('```')) {
      if (inCode) {
        elements.push(
          <Box
            key={`code-${codeKey++}`}
            component="pre"
            sx={{
              bgcolor: t.surfaceSubtle,
              border: `1px solid ${t.border}`,
              borderRadius: '8px',
              p: 2,
              overflowX: 'auto',
              fontSize: '.78rem',
              color: t.textSecondary,
              fontFamily: '"Fira Code", "Consolas", monospace',
              mb: 2,
              mt: 0.5,
              lineHeight: 1.6,
            }}
          >
            {codeLines.join('\n')}
          </Box>,
        );
        codeLines = [];
        inCode = false;
      } else {
        inCode = true;
      }
      return;
    }
    if (inCode) { codeLines.push(line); return; }

    if (line.startsWith('### ')) {
      elements.push(<Typography key={i} sx={{ fontWeight: 700, fontSize: '1rem', color: t.textPrimary, mt: 2.5, mb: 0.5 }}>{line.slice(4)}</Typography>);
    } else if (line.startsWith('## ')) {
      elements.push(<Typography key={i} sx={{ fontWeight: 700, fontSize: '1.15rem', color: t.textPrimary, mt: 3, mb: 0.75 }}>{line.slice(3)}</Typography>);
    } else if (line.startsWith('# ')) {
      elements.push(<Typography key={i} sx={{ fontWeight: 800, fontSize: '1.4rem', color: t.textPrimary, mb: 1 }}>{line.slice(2)}</Typography>);
    } else if (line.startsWith('| ')) {
      // Table row
      const cells = line.split('|').filter(Boolean).map(c => c.trim());
      const isHeader = lines[i + 1]?.includes('---');
      elements.push(
        <Box key={i} component="div" sx={{ display: 'flex', borderBottom: `1px solid ${t.border}` }}>
          {cells.map((cell, ci) => (
            <Typography
              key={ci}
              sx={{
                flex: 1,
                px: 1.5,
                py: 0.75,
                fontSize: '.82rem',
                color: isHeader ? t.textPrimary : t.textSecondary,
                fontWeight: isHeader ? 700 : 400,
                bgcolor: isHeader ? t.surfaceSubtle : 'transparent',
              }}
            >
              {cell}
            </Typography>
          ))}
        </Box>,
      );
    } else if (line.startsWith('|---') || line.startsWith('| ---')) {
      // skip separator
    } else if (line.trim() === '') {
      elements.push(<Box key={i} sx={{ height: 8 }} />);
    } else {
      elements.push(
        <Typography key={i} sx={{ color: t.textSecondary, fontSize: '.875rem', lineHeight: 1.7 }}>
          {line}
        </Typography>,
      );
    }
  });

  return <Box>{elements}</Box>;
};

// ─── Main component ───────────────────────────────────────────────────────────

const ProjectDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [project, setProject] = useState<BackendProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tree] = useState<FileNode[]>(DEFAULT_FILE_TREE);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['src']));
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(() =>
    DEFAULT_FILE_TREE.find((n) => n.name === 'README.md') ?? null,
  );
  const [branch] = useState('main');

  // Load project
  useEffect(() => {
    if (!id) { setError('No project ID.'); setLoading(false); return; }
    const lsKey = 'atonix:projects:list:v1';
    const cached = JSON.parse(localStorage.getItem(lsKey) || '[]');
    const local = cached.find((p: { id: string }) => p.id === id);

    const loadFromApi = async () => {
      try {
        const result = await getProject(id);
        setProject(result);
      } catch {
        if (local) {
          setProject({ id: local.id, name: local.name, description: local.description });
        } else {
          setError('Could not load project.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (local) {
      setProject({ id: local.id, name: local.name, description: local.description });
      setLoading(false);
    } else {
      loadFromApi();
    }
  }, [id]);

  const toggleDir = (nodeId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId); else next.add(nodeId);
      return next;
    });
  };

  const projectKey = project?.name
    ? project.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/(^-|-$)/g, '')
    : 'project';

  // ── Loading / Error states ──
  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <CircularProgress sx={{ color: t.brandPrimary }} />
      </Box>
    );
  }
  if (error && !project) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: t.background,
        fontFamily: FONT,
        minHeight: 0,
      }}
    >
      {/* ─────────────────────── TOP BAR ─────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 1.25,
          borderBottom: `1px solid ${t.border}`,
          bgcolor: t.surface,
          gap: 1.5,
          flexShrink: 0,
          flexWrap: 'wrap',
        }}
      >
        <Button
          size="small"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/developer/Dashboard/projects')}
          sx={{ textTransform: 'none', color: t.textSecondary, '&:hover': { color: t.textPrimary }, minWidth: 0 }}
        >
          Projects
        </Button>

        <Typography sx={{ color: t.textTertiary, fontSize: '.8rem' }}>/</Typography>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 28, height: 28, borderRadius: '8px',
              bgcolor: t.brandPrimary,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Typography sx={{ color: '#fff', fontSize: '.72rem', fontWeight: 800 }}>
              {project?.name?.[0]?.toUpperCase() ?? 'P'}
            </Typography>
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '.95rem', color: t.textPrimary }}>
            {project?.name}
          </Typography>
          <Chip
            label="Active"
            size="small"
            icon={<CheckCircleIcon sx={{ fontSize: '.75rem !important', color: `${dashboardSemanticColors.success} !important` }} />}
            sx={{
              bgcolor: 'rgba(34,197,94,.1)',
              color: dashboardSemanticColors.success,
              fontWeight: 700,
              fontSize: '.65rem',
              height: 20,
            }}
          />
        </Stack>

        {/* Branch badge */}
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ ml: 0.5 }}>
          <CallSplitIcon sx={{ fontSize: '.85rem', color: t.textSecondary }} />
          <Chip
            label={branch}
            size="small"
            sx={{
              bgcolor: t.surfaceSubtle,
              border: `1px solid ${t.border}`,
              color: t.textSecondary,
              fontWeight: 600,
              fontSize: '.72rem',
              cursor: 'default',
            }}
          />
        </Stack>

        {/* Quick actions */}
        <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
          {QUICK_ACTIONS.map((action) => (
            <Button
              key={action.label}
              size="small"
              variant="outlined"
              startIcon={action.icon}
              onClick={() => navigate(action.path)}
              sx={{
                textTransform: 'none',
                color: t.textSecondary,
                borderColor: t.border,
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '.75rem',
                py: 0.4,
                '&:hover': { borderColor: t.brandPrimary, color: t.brandPrimary },
              }}
            >
              {action.label}
            </Button>
          ))}
          <Button
            size="small"
            variant="contained"
            startIcon={<RocketLaunchIcon sx={{ fontSize: '.85rem' }} />}
            onClick={() => navigate('/developer/Dashboard/cicd')}
            sx={{
              bgcolor: t.brandPrimary,
              '&:hover': { bgcolor: t.brandPrimaryHover },
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '8px',
              fontSize: '.75rem',
              py: 0.5,
            }}
          >
            Deploy
          </Button>
        </Stack>
      </Box>

      {/* ─────────────────────── THREE-PANEL BODY ─────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        {/* ── LEFT SIDEBAR: File Tree ── */}
        <Box
          sx={{
            width: 230,
            flexShrink: 0,
            borderRight: `1px solid ${t.border}`,
            bgcolor: t.surface,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Repository header */}
          <Box sx={{ px: 1.5, pt: 1.5, pb: 1 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <AccountTreeIcon sx={{ fontSize: '.9rem', color: t.textSecondary }} />
                <Typography sx={{ fontWeight: 700, fontSize: '.78rem', color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                  Repository
                </Typography>
              </Stack>
              <Tooltip title="Create Repository">
                <IconButton
                  size="small"
                  onClick={() => navigate('/developer/Dashboard/projects/create')}
                  sx={{
                    color: t.brandPrimary,
                    bgcolor: 'rgba(21,61,117,.08)',
                    borderRadius: '6px',
                    width: 24, height: 24,
                    '&:hover': { bgcolor: 'rgba(21,61,117,.16)' },
                  }}
                >
                  <AddIcon sx={{ fontSize: '.85rem' }} />
                </IconButton>
              </Tooltip>
            </Stack>

            {/* Repo name */}
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 1, mb: 0.5 }}>
              <GitHubIcon sx={{ fontSize: '.9rem', color: t.textSecondary }} />
              <Typography sx={{ fontSize: '.8rem', color: t.textPrimary, fontWeight: 600 }}>
                {projectKey}
              </Typography>
            </Stack>

            {/* Branch */}
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
              <CallSplitIcon sx={{ fontSize: '.75rem', color: t.textTertiary }} />
              <Typography sx={{ fontSize: '.75rem', color: t.textTertiary }}>{branch}</Typography>
              <Box sx={{ ml: 'auto' }}>
                <Chip
                  label="↑1 / ↓0"
                  size="small"
                  sx={{ height: 16, fontSize: '.6rem', bgcolor: t.surfaceSubtle, color: t.textTertiary, px: 0.25 }}
                />
              </Box>
            </Stack>
          </Box>

          <Divider sx={{ borderColor: t.border, mx: 1 }} />

          {/* File tree */}
          <Box sx={{ flex: 1, overflowY: 'auto', py: 0.75 }}>
            {tree.map((node) => (
              <FileTreeNode
                key={node.id}
                node={node}
                depth={0}
                selectedId={selectedFile?.id ?? null}
                expandedIds={expandedIds}
                onToggle={toggleDir}
                onSelect={setSelectedFile}
              />
            ))}
          </Box>

          <Divider sx={{ borderColor: t.border, mx: 1 }} />

          {/* Recent commits */}
          <Box sx={{ px: 1.5, py: 1.25 }}>
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
              <CommitIcon sx={{ fontSize: '.85rem', color: t.textSecondary }} />
              <Typography sx={{ fontWeight: 700, fontSize: '.72rem', color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                Recent Commits
              </Typography>
            </Stack>
            <Stack spacing={1}>
              {MOCK_COMMITS.map((c) => (
                <Box key={c.hash}>
                  <Typography noWrap sx={{ fontSize: '.75rem', color: t.textPrimary, fontWeight: 500 }}>
                    {c.message}
                  </Typography>
                  <Typography sx={{ fontSize: '.68rem', color: t.textTertiary }}>
                    {c.hash.slice(0, 7)} · {c.author} · {c.time}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>

        {/* ── CENTER: File / README viewer ── */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minWidth: 0,
          }}
        >
          {/* File path bar */}
          <Box
            sx={{
              px: 2.5,
              py: 1,
              borderBottom: `1px solid ${t.border}`,
              bgcolor: t.surface,
              flexShrink: 0,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              {selectedFile ? (
                <>
                  <CodeIcon sx={{ fontSize: '.85rem', color: t.textSecondary }} />
                  <Typography sx={{ fontSize: '.8rem', color: t.textSecondary }}>
                    {selectedFile.id}
                  </Typography>
                  {selectedFile.lang && (
                    <Chip
                      label={selectedFile.lang}
                      size="small"
                      sx={{ height: 18, fontSize: '.62rem', bgcolor: t.surfaceSubtle, color: t.textSecondary, ml: 'auto' }}
                    />
                  )}
                </>
              ) : (
                <Typography sx={{ fontSize: '.8rem', color: t.textSecondary }}>
                  Select a file to view its contents
                </Typography>
              )}
            </Stack>
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
            {selectedFile ? (
              selectedFile.name.endsWith('.md') ? (
                <SimpleMarkdown content={selectedFile.content ?? ''} />
              ) : (
                <Box
                  component="pre"
                  sx={{
                    fontFamily: '"Fira Code", "Consolas", monospace',
                    fontSize: '.8rem',
                    color: t.textSecondary,
                    bgcolor: t.surfaceSubtle,
                    border: `1px solid ${t.border}`,
                    borderRadius: '10px',
                    p: 2.5,
                    overflowX: 'auto',
                    whiteSpace: 'pre',
                    lineHeight: 1.65,
                    m: 0,
                  }}
                >
                  {selectedFile.content}
                </Box>
              )
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <DataObjectIcon sx={{ fontSize: '3rem', color: t.textTertiary, mb: 1 }} />
                <Typography sx={{ color: t.textSecondary }}>No file selected</Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* ── RIGHT SIDEBAR: Service navigation ── */}
        <Box
          sx={{
            width: 250,
            flexShrink: 0,
            borderLeft: `1px solid ${t.border}`,
            bgcolor: t.surface,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Project info */}
          <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
              <LinkIcon sx={{ fontSize: '.85rem', color: t.textSecondary }} />
              <Typography sx={{ fontWeight: 700, fontSize: '.72rem', color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                Project Links
              </Typography>
            </Stack>
            {project?.description && (
              <Typography
                sx={{
                  color: t.textSecondary,
                  fontSize: '.78rem',
                  lineHeight: 1.5,
                  mb: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {project.description}
              </Typography>
            )}
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Avatar sx={{ width: 20, height: 20, bgcolor: t.brandPrimary, fontSize: '.65rem', fontWeight: 800 }}>
                {project?.name?.[0]?.toUpperCase()}
              </Avatar>
              <Typography sx={{ fontSize: '.75rem', color: t.textTertiary }}>{project?.name}</Typography>
            </Stack>
          </Box>

          <Divider sx={{ borderColor: t.border, mx: 1.5 }} />

          {/* Service links */}
          <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
            {SERVICE_LINKS.map((link) => (
              <Stack
                key={link.label}
                direction="row"
                alignItems="center"
                spacing={1.25}
                onClick={() => navigate(link.path)}
                sx={{
                  px: 1.75,
                  py: 1,
                  cursor: 'pointer',
                  borderRadius: '8px',
                  mx: 0.75,
                  transition: 'background .15s',
                  '&:hover': { bgcolor: t.surfaceHover },
                  '&:hover .arrow-icon': { opacity: 1, transform: 'translateX(2px)' },
                }}
              >
                <Box
                  sx={{
                    width: 32, height: 32,
                    borderRadius: '8px',
                    bgcolor: 'rgba(21,61,117,.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    '& .MuiSvgIcon-root': { fontSize: '1rem', color: t.brandPrimary },
                  }}
                >
                  {link.icon}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '.82rem', color: t.textPrimary, lineHeight: 1.2 }}>
                    {link.label}
                  </Typography>
                  <Typography noWrap sx={{ fontSize: '.72rem', color: t.textSecondary, lineHeight: 1.2 }}>
                    {link.description}
                  </Typography>
                  {link.badge && (
                    <Chip
                      label={link.badge}
                      size="small"
                      sx={{
                        height: 15,
                        fontSize: '.58rem',
                        bgcolor: `${link.badgeColor}20`,
                        color: link.badgeColor,
                        fontWeight: 700,
                        mt: 0.25,
                        '& .MuiChip-label': { px: 0.75 },
                      }}
                    />
                  )}
                </Box>
                <OpenInNewIcon
                  className="arrow-icon"
                  sx={{
                    fontSize: '.75rem',
                    color: t.textTertiary,
                    opacity: 0,
                    transition: 'opacity .15s, transform .15s',
                    flexShrink: 0,
                  }}
                />
              </Stack>
            ))}
          </Box>

          <Divider sx={{ borderColor: t.border, mx: 1.5 }} />

          {/* Create repository button */}
          <Box sx={{ p: 1.5 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GitHubIcon sx={{ fontSize: '1rem' }} />}
              onClick={() => navigate('/developer/Dashboard/projects/create')}
              sx={{
                textTransform: 'none',
                color: t.textPrimary,
                borderColor: t.border,
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '.8rem',
                bgcolor: t.surfaceSubtle,
                justifyContent: 'flex-start',
                py: 1,
                '&:hover': { borderColor: t.brandPrimary, bgcolor: 'rgba(21,61,117,.06)' },
              }}
            >
              Create Repository
            </Button>

            {/* Project settings shortcut */}
            <Button
              fullWidth
              variant="text"
              startIcon={<DataObjectIcon sx={{ fontSize: '.9rem' }} />}
              onClick={() => navigate('/developer/Dashboard/settings')}
              sx={{
                mt: 0.75,
                textTransform: 'none',
                color: t.textSecondary,
                borderRadius: '10px',
                fontWeight: 500,
                fontSize: '.78rem',
                justifyContent: 'flex-start',
                py: 0.75,
                '&:hover': { color: t.textPrimary, bgcolor: t.surfaceHover },
              }}
            >
              Project Settings
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ProjectDashboardPage;
