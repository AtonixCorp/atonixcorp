import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Divider,
  Alert,
} from '@mui/material';
import {
  Business,
  People,
  TrendingUp,
  Security,
  Analytics,
  Settings,
  Add,
  CheckCircle,
  Schedule,
  Assessment,
  Timeline,
  MonetizationOn,
  LocationOn,
  Domain,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface CompanyMetric {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
  department: string;
  avatar?: string;
  status: 'active' | 'inactive';
}

interface Project {
  id: number;
  name: string;
  status: 'planning' | 'active' | 'completed' | 'on_hold';
  progress: number;
  dueDate: string;
  team: string[];
}

const CompanyDashboard: React.FC = () => {
  const { user, organization } = useAuth();
  const [metrics, setMetrics] = useState<CompanyMetric[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Mock data - in real app, this would come from API
    setMetrics([
      {
        title: 'Total Employees',
        value: '247',
        change: '+12%',
        trend: 'up',
        icon: <People sx={{ fontSize: 28 }} />,
        color: '#3b82f6',
      },
      {
        title: 'Active Projects',
        value: '34',
        change: '+8',
        trend: 'up',
        icon: <Timeline sx={{ fontSize: 28 }} />,
        color: '#22c55e',
      },
      {
        title: 'Revenue',
        value: '$2.4M',
        change: '+18%',
        trend: 'up',
        icon: <MonetizationOn sx={{ fontSize: 28 }} />,
        color: '#f59e0b',
      },
      {
        title: 'Security Score',
        value: '95/100',
        change: '+2',
        trend: 'up',
        icon: <Security sx={{ fontSize: 28 }} />,
        color: '#8b5cf6',
      },
    ]);

    setTeamMembers([
      {
        id: 1,
        name: 'John Doe',
        role: 'Engineering Manager',
        department: 'Engineering',
        status: 'active',
      },
      {
        id: 2,
        name: 'Sarah Chen',
        role: 'Product Manager',
        department: 'Product',
        status: 'active',
      },
      {
        id: 3,
        name: 'Mike Wilson',
        role: 'DevOps Engineer',
        department: 'Engineering',
        status: 'active',
      },
    ]);

    setProjects([
      {
        id: 1,
        name: 'Cloud Migration Initiative',
        status: 'active',
        progress: 75,
        dueDate: 'Q1 2026',
        team: ['John Doe', 'Mike Wilson'],
      },
      {
        id: 2,
        name: 'AI Implementation Program',
        status: 'active',
        progress: 60,
        dueDate: 'Q2 2026',
        team: ['Sarah Chen', 'John Doe'],
      },
      {
        id: 3,
        name: 'Security Infrastructure Upgrade',
        status: 'completed',
        progress: 100,
        dueDate: 'Completed',
        team: ['Mike Wilson'],
      },
    ]);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'primary';
      case 'planning':
        return 'info';
      case 'on_hold':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      case 'planning':
        return 'Planning';
      case 'on_hold':
        return 'On Hold';
      default:
        return status;
    }
  };

  if (!organization?.is_registered) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="h6">Organization Not Registered</Typography>
          <Typography>
            Your organization needs to be registered to access the enterprise dashboard.
            Please contact your administrator or register your organization.
          </Typography>
        </Alert>
        <Button variant="contained" size="large">
          Register Organization
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Business sx={{ fontSize: 40, color: '#3b82f6', mr: 2 }} />
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {organization.name} Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enterprise management and analytics for {organization.name}
            </Typography>
          </Box>
        </Box>

        {/* Organization Info */}
        <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Domain sx={{ mr: 1, color: '#64748b' }} />
                <Typography variant="body2" color="text.secondary">
                  Domain: {organization.domain}
                </Typography>
              </Box>
              {organization.industry && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Business sx={{ mr: 1, color: '#64748b' }} />
                  <Typography variant="body2" color="text.secondary">
                    Industry: {organization.industry}
                  </Typography>
                </Box>
              )}
            </Box>
            <Box>
              {organization.location && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ mr: 1, color: '#64748b' }} />
                  <Typography variant="body2" color="text.secondary">
                    Location: {organization.location}
                  </Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip
                  label={`${organization.size || 'Unknown'} employees`}
                  variant="outlined"
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Chip
                  label={organization.subscription_plan || 'Enterprise'}
                  color="primary"
                  size="small"
                />
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Metrics Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
        {metrics.map((metric, index) => (
          <Card
            key={index}
            sx={{
              height: '100%',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      fontSize: '2.5rem',
                      background: `linear-gradient(135deg, ${metric.color} 0%, ${metric.color}99 100%)`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 1,
                    }}
                  >
                    {metric.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 1 }}>
                    {metric.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {metric.trend === 'up' ? (
                      <TrendingUp sx={{ fontSize: 16, color: '#22c55e', mr: 0.5 }} />
                    ) : metric.trend === 'down' ? (
                      <TrendingUp sx={{ fontSize: 16, color: '#ef4444', mr: 0.5, transform: 'rotate(180deg)' }} />
                    ) : null}
                    <Typography
                      variant="caption"
                      sx={{
                        color: metric.trend === 'up' ? '#22c55e' : metric.trend === 'down' ? '#ef4444' : '#64748b',
                        fontWeight: 600,
                      }}
                    >
                      {metric.change}
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '16px',
                    background: `linear-gradient(135deg, ${metric.color}20 0%, ${metric.color}10 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: metric.color,
                  }}
                >
                  {metric.icon}
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Main Content Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {/* Team Members */}
        <Paper
          sx={{
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            height: '100%',
          }}
        >
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight={700}>
                Team Members
              </Typography>
              <Button
                startIcon={<Add />}
                variant="outlined"
                size="small"
                sx={{ borderRadius: '12px' }}
              >
                Add Member
              </Button>
            </Box>
            <List sx={{ p: 0 }}>
              {teamMembers.map((member) => (
                <ListItem
                  key={member.id}
                  sx={{
                    borderRadius: '12px',
                    mb: 2,
                    border: '1px solid #e2e8f0',
                    '&:hover': {
                      backgroundColor: '#f8fafc',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={member.avatar}
                      sx={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1e293b 100%)',
                      }}
                    >
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={member.name}
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {member.role}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          • {member.department}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Chip
                      label={member.status}
                      size="small"
                      color={member.status === 'active' ? 'success' : 'default'}
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        </Paper>

        {/* Active Projects */}
        <Paper
          sx={{
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            height: '100%',
          }}
        >
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight={700}>
                Active Projects
              </Typography>
              <Button
                startIcon={<Add />}
                variant="outlined"
                size="small"
                sx={{ borderRadius: '12px' }}
              >
                New Project
              </Button>
            </Box>
            <List sx={{ p: 0 }}>
              {projects.map((project) => (
                <ListItem
                  key={project.id}
                  sx={{
                    borderRadius: '12px',
                    mb: 2,
                    border: '1px solid #e2e8f0',
                    '&:hover': {
                      backgroundColor: '#f8fafc',
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {project.name}
                        </Typography>
                        <Chip
                          label={getStatusLabel(project.status)}
                          size="small"
                          color={getStatusColor(project.status) as any}
                          sx={{ fontSize: '0.7rem' }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Due: {project.dueDate}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {project.progress}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={project.progress}
                          sx={{
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: '#f1f5f9',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: project.status === 'completed' ? '#22c55e' : '#3b82f6',
                              borderRadius: 2,
                            },
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          Team: {project.team.join(', ')}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Paper>
      </Box>

      {/* Quick Actions */}
      <Paper
        sx={{
          mt: 4,
          p: 3,
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<Analytics />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #3b82f6 0%, #1e293b 100%)',
              py: 2,
            }}
          >
            View Analytics
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<People />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              py: 2,
            }}
          >
            Manage Team
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Security />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              py: 2,
            }}
          >
            Security Audit
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Settings />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              py: 2,
            }}
          >
            Settings
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CompanyDashboard;
