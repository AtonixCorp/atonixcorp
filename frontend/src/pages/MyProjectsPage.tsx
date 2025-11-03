import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Chip,
  Tabs,
  Tab,
  Paper,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Snackbar,
  Tooltip,
} from '@mui/material';
import {
  Business,
  Code,
  Terminal,
  VpnKey,
  ContentCopy,
  ExpandMore,
  Refresh,
  Settings,
  Add,
  Edit,
  Delete,
  Cloud,
  Security,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'archived';
  created_at: string;
  updated_at: string;
  api_endpoint: string;
  ssh_host: string;
  ssh_port: number;
  environment: 'development' | 'staging' | 'production';
  technologies: string[];
}

interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  status: 'active' | 'deprecated';
}

const MyProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [apiDialogOpen, setApiDialogOpen] = useState(false);
  const [sshDialogOpen, setSshDialogOpen] = useState(false);
  const [terminalDialogOpen, setTerminalDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockProjects: Project[] = [
      {
        id: '1',
        name: 'E-Commerce Platform',
        description: 'Full-stack e-commerce solution with React and Django',
        status: 'active',
        created_at: '2024-01-15',
        updated_at: '2024-09-25',
  api_endpoint: 'https://api.atonixcorp.org/projects/1',
        ssh_host: 'ec-platform.atonixcorp.com',
        ssh_port: 22,
        environment: 'production',
        technologies: ['React', 'Django', 'PostgreSQL', 'Redis'],
      },
      {
        id: '2',
        name: 'Analytics Dashboard',
        description: 'Real-time analytics and reporting dashboard',
        status: 'active',
        created_at: '2024-03-20',
        updated_at: '2024-09-24',
  api_endpoint: 'https://api.atonixcorp.org/projects/2',
        ssh_host: 'analytics.atonixcorp.com',
        ssh_port: 22,
        environment: 'staging',
        technologies: ['Vue.js', 'Node.js', 'MongoDB', 'Socket.io'],
      },
      {
        id: '3',
        name: 'Mobile App Backend',
        description: 'RESTful API for mobile application',
        status: 'inactive',
        created_at: '2024-05-10',
        updated_at: '2024-08-15',
  api_endpoint: 'https://api.atonixcorp.org/projects/3',
        ssh_host: 'mobile-api.atonixcorp.com',
        ssh_port: 22,
        environment: 'development',
        technologies: ['Express.js', 'MySQL', 'JWT', 'AWS'],
      },
    ];
    setProjects(mockProjects);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: `${label} copied to clipboard!`, severity: 'success' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'inactive': return '#f59e0b';
      case 'archived': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case 'production': return '#ef4444';
      case 'staging': return '#f59e0b';
      case 'development': return '#10b981';
      default: return '#64748b';
    }
  };

  const mockApiEndpoints: APIEndpoint[] = [
    { method: 'GET', path: '/api/projects', description: 'List all projects', status: 'active' },
    { method: 'POST', path: '/api/projects', description: 'Create new project', status: 'active' },
    { method: 'GET', path: '/api/projects/{id}', description: 'Get project details', status: 'active' },
    { method: 'PUT', path: '/api/projects/{id}', description: 'Update project', status: 'active' },
    { method: 'DELETE', path: '/api/projects/{id}', description: 'Delete project', status: 'deprecated' },
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
              }}
            >
              My Projects Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your personal projects, APIs, and infrastructure access
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{
              borderRadius: '12px',
              px: 3,
              background: 'linear-gradient(135deg, #3b82f6 0%, #1e293b 100%)',
              color: 'white',
            }}
          >
            New Project
          </Button>
        </Box>

        <Paper sx={{ borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                minHeight: 64,
              },
            }}
          >
            <Tab
              icon={<Business />}
              label="Projects Overview"
              iconPosition="start"
            />
            <Tab
              icon={<Code />}
              label="API Management"
              iconPosition="start"
            />
            <Tab
              icon={<Terminal />}
              label="SSH & Terminal"
              iconPosition="start"
            />
            <Tab
              icon={<Settings />}
              label="Project Settings"
              iconPosition="start"
            />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(2, 1fr)',
                  lg: 'repeat(3, 1fr)',
                },
                gap: 3,
              }}
            >
              {projects.map((project) => (
                <Card
                  key={project.id}
                  sx={{
                    height: '100%',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
                      borderColor: '#3b82f6',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          background: 'linear-gradient(135deg, #3b82f6 0%, #1e293b 100%)',
                          mr: 2,
                        }}
                      >
                        <Business />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                          {project.name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip
                            label={project.status}
                            size="small"
                            sx={{
                              backgroundColor: `${getStatusColor(project.status)}20`,
                              color: getStatusColor(project.status),
                              fontWeight: 500,
                            }}
                          />
                          <Chip
                            label={project.environment}
                            size="small"
                            sx={{
                              backgroundColor: `${getEnvironmentColor(project.environment)}20`,
                              color: getEnvironmentColor(project.environment),
                              fontWeight: 500,
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {project.description}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        Technologies:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {project.technologies.map((tech) => (
                          <Chip
                            key={tech}
                            label={tech}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        ))}
                      </Box>
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                      Last updated: {new Date(project.updated_at).toLocaleDateString()}
                    </Typography>
                  </CardContent>

                  <CardActions sx={{ p: 3, pt: 0, justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="API Access">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedProject(project);
                            setApiDialogOpen(true);
                          }}
                          sx={{
                            borderRadius: '8px',
                            backgroundColor: '#10b98120',
                            color: '#10b981',
                            '&:hover': { backgroundColor: '#10b98130' },
                          }}
                        >
                          <Code fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="SSH Access">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedProject(project);
                            setSshDialogOpen(true);
                          }}
                          sx={{
                            borderRadius: '8px',
                            backgroundColor: '#f59e0b20',
                            color: '#f59e0b',
                            '&:hover': { backgroundColor: '#f59e0b30' },
                          }}
                        >
                          <VpnKey fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Terminal">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedProject(project);
                            setTerminalDialogOpen(true);
                          }}
                          sx={{
                            borderRadius: '8px',
                            backgroundColor: '#8b5cf620',
                            color: '#8b5cf6',
                            '&:hover': { backgroundColor: '#8b5cf630' },
                          }}
                        >
                          <Terminal fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" variant="outlined" startIcon={<Edit />}>
                        Edit
                      </Button>
                      <Button size="small" color="error" startIcon={<Delete />}>
                        Delete
                      </Button>
                    </Box>
                  </CardActions>
                </Card>
              ))}
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                API Endpoints & Documentation
              </Typography>

              {selectedProject && (
                <Paper sx={{ p: 3, mb: 3, borderRadius: '12px', backgroundColor: '#f8fafc' }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {selectedProject.name} API
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <TextField
                      fullWidth
                      label="Base URL"
                      value={selectedProject.api_endpoint}
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                          <IconButton onClick={() => handleCopyToClipboard(selectedProject.api_endpoint, 'API URL')}>
                            <ContentCopy />
                          </IconButton>
                        ),
                      }}
                    />
                  </Box>
                </Paper>
              )}

              <Typography variant="h6" sx={{ mb: 2 }}>
                Available Endpoints
              </Typography>

              {mockApiEndpoints.map((endpoint, index) => (
                <Accordion key={index} sx={{ mb: 1, borderRadius: '8px !important' }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip
                        label={endpoint.method}
                        size="small"
                        sx={{
                          backgroundColor:
                            endpoint.method === 'GET' ? '#10b98120' :
                            endpoint.method === 'POST' ? '#3b82f620' :
                            endpoint.method === 'PUT' ? '#f59e0b20' : '#ef444420',
                          color:
                            endpoint.method === 'GET' ? '#10b981' :
                            endpoint.method === 'POST' ? '#3b82f6' :
                            endpoint.method === 'PUT' ? '#f59e0b' : '#ef4444',
                          fontWeight: 600,
                        }}
                      />
                      <Typography fontFamily="monospace">{endpoint.path}</Typography>
                      <Chip
                        label={endpoint.status}
                        size="small"
                        sx={{
                          backgroundColor: endpoint.status === 'active' ? '#10b98120' : '#ef444420',
                          color: endpoint.status === 'active' ? '#10b981' : '#ef4444',
                        }}
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary">
                      {endpoint.description}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                SSH Access & Terminal Management
              </Typography>

              {selectedProject && (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      md: 'repeat(2, 1fr)',
                    },
                    gap: 3,
                  }}
                >
                  <Paper sx={{ p: 3, borderRadius: '12px' }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <VpnKey color="primary" />
                      SSH Connection Details
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <TextField
                        fullWidth
                        label="Host"
                        value={selectedProject.ssh_host}
                        InputProps={{
                          readOnly: true,
                          endAdornment: (
                            <IconButton onClick={() => handleCopyToClipboard(selectedProject.ssh_host, 'SSH Host')}>
                              <ContentCopy />
                            </IconButton>
                          ),
                        }}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Port"
                        value={selectedProject.ssh_port}
                        InputProps={{
                          readOnly: true,
                          endAdornment: (
                            <IconButton onClick={() => handleCopyToClipboard(selectedProject.ssh_port.toString(), 'SSH Port')}>
                              <ContentCopy />
                            </IconButton>
                          ),
                        }}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Username"
                        value={user?.username || 'your-username'}
                        InputProps={{
                          readOnly: true,
                          endAdornment: (
                            <IconButton onClick={() => handleCopyToClipboard(user?.username || 'your-username', 'Username')}>
                              <ContentCopy />
                            </IconButton>
                          ),
                        }}
                      />
                    </Box>

                    <Button
                      variant="contained"
                      startIcon={<Terminal />}
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => setTerminalDialogOpen(true)}
                    >
                      Open Terminal
                    </Button>
                  </Paper>

                  <Paper sx={{ p: 3, borderRadius: '12px' }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Security color="primary" />
                      Security & Access
                    </Typography>

                    <Alert severity="info" sx={{ mb: 2 }}>
                      SSH access is secured with key-based authentication. Make sure your public key is added to the server.
                    </Alert>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button variant="outlined" startIcon={<VpnKey />}>
                        Generate SSH Key
                      </Button>
                      <Button variant="outlined" startIcon={<Cloud />}>
                        Upload Public Key
                      </Button>
                      <Button variant="outlined" startIcon={<Refresh />}>
                        Rotate Keys
                      </Button>
                    </Box>
                  </Paper>
                </Box>
              )}

              {!selectedProject && (
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '12px' }}>
                  <Terminal sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                    Select a Project
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Choose a project from the overview tab to access SSH and terminal features.
                  </Typography>
                </Paper>
              )}
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                Project Settings & Configuration
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    md: 'repeat(2, 1fr)',
                  },
                  gap: 3,
                }}
              >
                <Paper sx={{ p: 3, borderRadius: '12px' }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Environment Settings
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField label="Environment" value="Production" InputProps={{ readOnly: true }} />
                    <TextField label="Region" value="us-east-1" InputProps={{ readOnly: true }} />
                    <TextField label="Instance Type" value="t3.medium" InputProps={{ readOnly: true }} />
                  </Box>
                </Paper>

                <Paper sx={{ p: 3, borderRadius: '12px' }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Resource Allocation
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField label="CPU Cores" value="2" InputProps={{ readOnly: true }} />
                    <TextField label="Memory" value="4 GB" InputProps={{ readOnly: true }} />
                    <TextField label="Storage" value="50 GB" InputProps={{ readOnly: true }} />
                  </Box>
                </Paper>
              </Box>
            </Box>
          </TabPanel>
        </Paper>

        {/* API Dialog */}
        <Dialog
          open={apiDialogOpen}
          onClose={() => setApiDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6">
              API Access - {selectedProject?.name}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Use these credentials to access the project API programmatically.
            </Typography>
            <TextField
              fullWidth
              label="API Endpoint"
              value={selectedProject?.api_endpoint}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <IconButton onClick={() => handleCopyToClipboard(selectedProject?.api_endpoint || '', 'API Endpoint')}>
                    <ContentCopy />
                  </IconButton>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="API Key"
              value="••••••••••••••••"
              type="password"
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <IconButton onClick={() => handleCopyToClipboard('your-api-key-here', 'API Key')}>
                    <ContentCopy />
                  </IconButton>
                ),
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setApiDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* SSH Dialog */}
        <Dialog
          open={sshDialogOpen}
          onClose={() => setSshDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6">
              SSH Access - {selectedProject?.name}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Connect to your project server using SSH.
            </Typography>
            <TextField
              fullWidth
              label="SSH Command"
              value={`ssh ${user?.username || 'username'}@${selectedProject?.ssh_host} -p ${selectedProject?.ssh_port}`}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <IconButton onClick={() => handleCopyToClipboard(`ssh ${user?.username || 'username'}@${selectedProject?.ssh_host} -p ${selectedProject?.ssh_port}`, 'SSH Command')}>
                    <ContentCopy />
                  </IconButton>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <Alert severity="warning">
              Make sure your SSH public key is added to the server before connecting.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSshDialogOpen(false)}>Close</Button>
            <Button variant="contained" startIcon={<Terminal />}>
              Connect
            </Button>
          </DialogActions>
        </Dialog>

        {/* Terminal Dialog */}
        <Dialog
          open={terminalDialogOpen}
          onClose={() => setTerminalDialogOpen(false)}
          maxWidth="lg"
          fullWidth
          sx={{ '& .MuiDialog-paper': { height: '80vh' } }}
        >
          <DialogTitle>
            <Typography variant="h6">
              Terminal - {selectedProject?.name}
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            <Paper
              sx={{
                height: '100%',
                backgroundColor: '#1e293b',
                color: '#e2e8f0',
                p: 2,
                fontFamily: 'monospace',
                fontSize: '14px',
                overflow: 'auto',
              }}
            >
              <Typography sx={{ mb: 1 }}>
                {user?.username || 'user'}@{selectedProject?.ssh_host}:~$
              </Typography>
              <Typography sx={{ color: '#10b981' }}>
                Welcome to {selectedProject?.name} terminal session
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '12px', mt: 2 }}>
                Terminal functionality would be implemented here with WebSocket connection to the server.
              </Typography>
            </Paper>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTerminalDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
  );
};

export default MyProjectsPage;
