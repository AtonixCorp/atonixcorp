import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Badge,
  LinearProgress,
} from '@mui/material';
import {
  Group,
  Person,
  Code,
  Email,
  Message,
  Assignment,
  Timeline,
  TrendingUp,
  Work,
  Business,
  AccessTime,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  status: 'online' | 'offline' | 'busy';
  skills: string[];
  projects: number;
  tasks_completed: number;
  department: string;
}

interface TeamProject {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'on-hold';
  progress: number;
  members: number;
  deadline: string;
}

interface Department {
  id: string;
  name: string;
  memberCount: number;
  projectCount: number;
  manager: string;
}

const DashboardTeamsPage: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);

  // Mock data for workplace teams
  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Senior Developer',
      avatar: '',
      status: 'online',
      skills: ['React', 'TypeScript', 'Node.js'],
      projects: 5,
      tasks_completed: 127,
      department: 'Engineering',
    },
    {
      id: '2',
      name: 'Mike Chen',
      role: 'Product Manager',
      avatar: '',
      status: 'busy',
      skills: ['Product Strategy', 'Agile', 'Analytics'],
      projects: 8,
      tasks_completed: 89,
      department: 'Product',
    },
    {
      id: '3',
      name: 'Emily Davis',
      role: 'UX Designer',
      avatar: '',
      status: 'online',
      skills: ['Figma', 'User Research', 'Prototyping'],
      projects: 6,
      tasks_completed: 156,
      department: 'Design',
    },
    {
      id: '4',
      name: 'Alex Rodriguez',
      role: 'DevOps Engineer',
      avatar: '',
      status: 'offline',
      skills: ['Docker', 'Kubernetes', 'AWS'],
      projects: 4,
      tasks_completed: 93,
      department: 'Infrastructure',
    },
    {
      id: '5',
      name: 'Lisa Wang',
      role: 'QA Engineer',
      avatar: '',
      status: 'online',
      skills: ['Testing', 'Automation', 'Quality Assurance'],
      projects: 7,
      tasks_completed: 203,
      department: 'Quality',
    },
  ];

  const teamProjects: TeamProject[] = [
    {
      id: '1',
      name: 'E-commerce Platform Redesign',
      status: 'active',
      progress: 75,
      members: 8,
      deadline: '2024-02-15',
    },
    {
      id: '2',
      name: 'Mobile App Development',
      status: 'active',
      progress: 45,
      members: 5,
      deadline: '2024-03-30',
    },
    {
      id: '3',
      name: 'API Integration Project',
      status: 'completed',
      progress: 100,
      members: 3,
      deadline: '2024-01-20',
    },
    {
      id: '4',
      name: 'Security Audit & Updates',
      status: 'on-hold',
      progress: 20,
      members: 4,
      deadline: '2024-04-10',
    },
  ];

  const departments: Department[] = [
    {
      id: '1',
      name: 'Engineering',
      memberCount: 12,
      projectCount: 8,
      manager: 'John Smith',
    },
    {
      id: '2',
      name: 'Product',
      memberCount: 6,
      projectCount: 5,
      manager: 'Sarah Johnson',
    },
    {
      id: '3',
      name: 'Design',
      memberCount: 4,
      projectCount: 6,
      manager: 'Emily Davis',
    },
    {
      id: '4',
      name: 'Infrastructure',
      memberCount: 3,
      projectCount: 4,
      manager: 'Alex Rodriguez',
    },
  ];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#10b981';
      case 'busy': return '#f59e0b';
      case 'offline': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'primary';
      case 'on-hold': return 'warning';
      default: return 'default';
    }
  };

  const TabPanel: React.FC<{ children?: React.ReactNode; index: number; value: number }> = ({
    children,
    value,
    index,
    ...other
  }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`team-tabpanel-${index}`}
      aria-labelledby={`team-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, width: '100%' }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
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
            Workplace Teams
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your organization's teams, projects, and departmental structure
          </Typography>
        </Box>

        {/* Quick Stats */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: { xs: 2, sm: 2.5, md: 3 },
            mb: 4,
            width: '100%',
          }}
        >
          <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 }, borderRadius: '16px', textAlign: 'center' }}>
            <Group sx={{ fontSize: 48, color: '#3b82f6', mb: 1 }} />
            <Typography variant="h4" fontWeight={700}>
              {teamMembers.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Team Members
            </Typography>
          </Paper>

          <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 }, borderRadius: '16px', textAlign: 'center' }}>
            <Work sx={{ fontSize: 48, color: '#10b981', mb: 1 }} />
            <Typography variant="h4" fontWeight={700}>
              {teamProjects.filter(p => p.status === 'active').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Projects
            </Typography>
          </Paper>

          <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 }, borderRadius: '16px', textAlign: 'center' }}>
            <Business sx={{ fontSize: 48, color: '#f59e0b', mb: 1 }} />
            <Typography variant="h4" fontWeight={700}>
              {departments.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Departments
            </Typography>
          </Paper>

          <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 }, borderRadius: '16px', textAlign: 'center' }}>
            <TrendingUp sx={{ fontSize: 48, color: '#8b5cf6', mb: 1 }} />
            <Typography variant="h4" fontWeight={700}>
              94%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Team Productivity
            </Typography>
          </Paper>
        </Box>

        {/* Main Content Tabs */}
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
              icon={<Group />}
              label="Team Members"
              iconPosition="start"
            />
            <Tab
              icon={<Work />}
              label="Projects"
              iconPosition="start"
            />
            <Tab
              icon={<Business />}
              label="Departments"
              iconPosition="start"
            />
          </Tabs>

          {/* Team Members Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(2, 1fr)',
                  lg: 'repeat(3, 1fr)',
                },
                gap: { xs: 2, sm: 2.5, md: 3 },
                width: '100%',
              }}
            >
              {teamMembers.map((member) => (
                <Card
                  key={member.id}
                  sx={{
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
                  <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Badge
                        variant="dot"
                        sx={{
                          '& .MuiBadge-badge': {
                            backgroundColor: getStatusColor(member.status),
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                          },
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 56,
                            height: 56,
                            mr: 2,
                            background: 'linear-gradient(135deg, #3b82f6 0%, #1e293b 100%)',
                          }}
                        >
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                      </Badge>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                          {member.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {member.role}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        Department: {member.department}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {member.skills.slice(0, 3).map((skill) => (
                          <Chip
                            key={skill}
                            label={skill}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        ))}
                        {member.skills.length > 3 && (
                          <Chip
                            label={`+${member.skills.length - 3}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        )}
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {member.projects} Projects
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                          {member.tasks_completed} Tasks
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" color="primary">
                          <Message fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="primary">
                          <Email fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </TabPanel>

          {/* Projects Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(2, 1fr)',
                },
                gap: { xs: 2, sm: 2.5, md: 3 },
                width: '100%',
              }}
            >
              {teamProjects.map((project) => (
                <Card
                  key={project.id}
                  sx={{
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                          {project.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Chip
                            label={project.status}
                            size="small"
                            color={getProjectStatusColor(project.status)}
                            sx={{
                              textTransform: 'capitalize',
                              fontWeight: 500,
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {project.members} members
                          </Typography>
                        </Box>
                      </Box>
                      <Assignment sx={{ color: '#64748b', fontSize: 24 }} />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Progress
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {project.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={project.progress}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#e2e8f0',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            backgroundColor: project.status === 'completed' ? '#10b981' : '#3b82f6',
                          },
                        }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTime sx={{ fontSize: 16, color: '#64748b' }} />
                        <Typography variant="caption" color="text.secondary">
                          Due: {new Date(project.deadline).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Button size="small" variant="outlined">
                        View Details
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </TabPanel>

          {/* Departments Tab */}
          <TabPanel value={tabValue} index={2}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(2, 1fr)',
                },
                gap: { xs: 2, sm: 2.5, md: 3 },
                width: '100%',
              }}
            >
              {departments.map((dept) => (
                <Card
                  key={dept.id}
                  sx={{
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
                          width: 48,
                          height: 48,
                          mr: 2,
                          background: 'linear-gradient(135deg, #3b82f6 0%, #1e293b 100%)',
                        }}
                      >
                        <Business />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                          {dept.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Manager: {dept.manager}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box>
                        <Typography variant="h4" fontWeight={700} color="primary">
                          {dept.memberCount}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Members
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="h4" fontWeight={700} color="secondary">
                          {dept.projectCount}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Projects
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                      View Department Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </TabPanel>
        </Paper>
      </Box>
  );
};

export default DashboardTeamsPage;
