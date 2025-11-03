import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  useTheme,
  Paper
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Assignment,
  Group,
  TrackChanges,
  Timeline,
  MoreVert,
  CheckCircle,
  Schedule,
  Warning,
  Add,
  Launch,
  CalendarToday,
  AccessTime,
  Business,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/Layout/DashboardLayout';

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  color: string;
}

interface ProjectCardProps {
  name: string;
  status: 'active' | 'completed' | 'pending';
  progress: number;
  dueDate: string;
  team: string[];
}

interface TaskItemProps {
  title: string;
  status: 'completed' | 'pending' | 'overdue';
  priority: 'high' | 'medium' | 'low';
  dueTime: string;
}

const ____StatCard: React.FC<StatCardProps> = ({ title, value, change, trend, icon, color }) => {
  return (
    <Card
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
                background: `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 1 }}>
              {title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {trend === 'up' ? (
                <TrendingUp sx={{ fontSize: 16, color: '#22c55e', mr: 0.5 }} />
              ) : (
                <TrendingDown sx={{ fontSize: 16, color: '#ef4444', mr: 0.5 }} />
              )}
              <Typography
                variant="caption"
                sx={{
                  color: trend === 'up' ? '#22c55e' : '#ef4444',
                  fontWeight: 600,
                }}
              >
                {change}
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '16px',
              background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const ____ProjectCard: React.FC<ProjectCardProps> = ({ name, status, progress, dueDate, team }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#3b82f6';
      case 'completed': return '#22c55e';
      case 'pending': return '#f59e0b';
      default: return 'text.secondary';
    }
  };

  return (
    <Card
      sx={{
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
            {name}
          </Typography>
          <IconButton size="small">
            <MoreVert />
          </IconButton>
        </Box>

        <Chip
          label={status.toUpperCase()}
          size="small"
          sx={{
            backgroundColor: `${getStatusColor(status)}20`,
            color: getStatusColor(status),
            fontWeight: 600,
            fontSize: '0.75rem',
            mb: 2,
          }}
        />

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {progress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: '#f1f5f9',
              '& .MuiLinearProgress-bar': {
                backgroundColor: getStatusColor(status),
                borderRadius: 4,
              },
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CalendarToday sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
            <Typography variant="caption" color="text.secondary">
              {dueDate}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {team.slice(0, 3).map((member, index) => (
              <Avatar
                key={index}
                sx={{
                  width: 24,
                  height: 24,
                  fontSize: '0.75rem',
                  ml: index > 0 ? -1 : 0,
                  border: '2px solid white',
                  backgroundColor: '#3b82f6',
                }}
              >
                {member[0]}
              </Avatar>
            ))}
            {team.length > 3 && (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                +{team.length - 3}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const ____TaskItem: React.FC<TaskItemProps> = ({ title, status, priority, dueTime }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#22c55e';
      default: return 'text.secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle sx={{ color: '#22c55e' }} />;
      case 'overdue': return <Warning sx={{ color: '#ef4444' }} />;
  default: return <Schedule sx={{ color: 'text.secondary' }} />;
    }
  };

  return (
    <ListItem
      sx={{
        borderRadius: '12px',
        mb: 1,
        '&:hover': {
          backgroundColor: '#f8fafc',
        },
      }}
    >
      <ListItemAvatar>
        {getStatusIcon(status)}
      </ListItemAvatar>
      <ListItemText
        primary={title}
        secondary={
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
            <AccessTime sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {dueTime}
            </Typography>
          </Box>
        }
        primaryTypographyProps={{
          fontWeight: 500,
          sx: {
            textDecoration: status === 'completed' ? 'line-through' : 'none',
          },
          color: status === 'completed' ? 'text.secondary' : '#1e293b',
        }}
      />
      <ListItemSecondaryAction>
        <Chip
          label={priority.toUpperCase()}
          size="small"
          sx={{
            backgroundColor: `${getPriorityColor(priority)}20`,
            color: getPriorityColor(priority),
            fontWeight: 600,
            fontSize: '0.7rem',
            height: 20,
          }}
        />
      </ListItemSecondaryAction>
    </ListItem>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const _theme = useTheme();

  const stats = [
    {
      title: 'Active Projects',
      value: '15+',
      change: '+12%',
      trend: 'up' as const,
      icon: <Business sx={{ fontSize: 28 }} />,
      color: '#3b82f6',
    },
    {
      title: 'Expert Teams',
      value: '2',
      change: '+8%',
      trend: 'up' as const,
      icon: <Group sx={{ fontSize: 28 }} />,
      color: '#22c55e',
    },
    {
      title: 'Focus Areas',
      value: '6',
      change: '+15%',
      trend: 'up' as const,
      icon: <TrackChanges sx={{ fontSize: 28 }} />,
      color: '#f59e0b',
    },
    {
      title: 'Innovation Score',
      value: '100%',
      change: '+5%',
      trend: 'up' as const,
      icon: <Timeline sx={{ fontSize: 28 }} />,
      color: '#8b5cf6',
    },
  ];

  const recentProjects = [
    {
      name: 'Cloud Migration Platform',
      status: 'active' as const,
      progress: 85,
      dueDate: 'Dec 15, 2025',
      team: ['John', 'Sarah', 'Mike', 'Lisa'],
    },
    {
      name: 'AI Analytics Dashboard',
      status: 'active' as const,
      progress: 60,
      dueDate: 'Jan 20, 2026',
      team: ['Alex', 'Emma', 'David'],
    },
    {
      name: 'Mobile App Redesign',
      status: 'completed' as const,
      progress: 100,
      dueDate: 'Nov 30, 2025',
      team: ['Sophie', 'Ryan'],
    },
  ];

  const todayTasks = [
    {
      title: 'Review code for authentication module',
      status: 'completed' as const,
      priority: 'high' as const,
      dueTime: '10:00 AM',
    },
    {
      title: 'Team standup meeting',
      status: 'completed' as const,
      priority: 'medium' as const,
      dueTime: '11:30 AM',
    },
    {
      title: 'Update project documentation',
      status: 'pending' as const,
      priority: 'medium' as const,
      dueTime: '2:00 PM',
    },
    {
      title: 'Client presentation preparation',
      status: 'pending' as const,
      priority: 'high' as const,
      dueTime: '4:00 PM',
    },
    {
      title: 'Database backup verification',
      status: 'overdue' as const,
      priority: 'low' as const,
      dueTime: 'Yesterday',
    },
  ];

  return (
    <DashboardLayout>
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
            Welcome back, {user?.first_name}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening with your projects today.
          </Typography>
        </Box>

        {/* Stats Cards - Responsive Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: { xs: 2, sm: 2.5, md: 3 },
            mb: 4,
            width: '100%',
          }}
        >
          {stats.map((stat, index) => (
            <____StatCard key={index} {...stat} />
          ))}
        </Box>

        {/* Main Content Grid - Full Width with Wrapping */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: '1fr 1fr',
              lg: '2fr 1fr',
            },
            gap: { xs: 2.5, sm: 3, md: 3, lg: 3 },
            mb: 4,
            width: '100%',
          }}
        >
          {/* Recent Projects */}
          <Box sx={{ width: '100%' }}>
            <Paper
              sx={{
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                height: '100%',
              }}
            >
              <Box sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="h6" fontWeight={700}>
                    Recent Projects
                  </Typography>
                  <Button
                    startIcon={<Launch />}
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: { xs: '0.875rem', md: '1rem' },
                    }}
                  >
                    View All
                  </Button>
                </Box>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, 1fr)',
                      md: '1fr',
                      lg: 'repeat(2, 1fr)',
                      xl: 'repeat(3, 1fr)',
                    },
                    gap: { xs: 2, sm: 2.5, md: 2.5 },
                    width: '100%',
                  }}
                >
                  {recentProjects.map((project, index) => (
                    <____ProjectCard key={index} {...project} />
                  ))}
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* Today's Tasks */}
          <Box sx={{ width: '100%' }}>
            <Paper
              sx={{
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                height: '100%',
              }}
            >
              <Box sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" fontWeight={700}>
                    Today's Tasks
                  </Typography>
                  <IconButton
                    sx={{
                      backgroundColor: '#3b82f620',
                      color: '#3b82f6',
                      width: 36,
                      height: 36,
                      '&:hover': {
                        backgroundColor: '#3b82f640',
                      },
                    }}
                  >
                    <Add />
                  </IconButton>
                </Box>
                <List sx={{ p: 0, width: '100%' }}>
                  {todayTasks.map((task, index) => (
                    <____TaskItem key={index} {...task} />
                  ))}
                </List>
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* Quick Actions - Full Width */}
        <Box sx={{ width: '100%' }}>
          <Paper
            sx={{
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                Quick Actions
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(2, 1fr)',
                    lg: 'repeat(4, 1fr)',
                  },
                  gap: { xs: 1.5, sm: 2, md: 2 },
                  width: '100%',
                }}
              >
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1e293b 100%)',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                    py: 1.5,
                    '&:hover': {
                      boxShadow: '0 8px 20px rgba(59, 130, 246, 0.4)',
                    },
                  }}
                >
                  New Project
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Group />}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: '#22c55e',
                    color: '#22c55e',
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: '#22c55e10',
                      borderColor: '#22c55e',
                    },
                  }}
                >
                  Invite Team
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Timeline />}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: '#f59e0b',
                    color: '#f59e0b',
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: '#f59e0b10',
                      borderColor: '#f59e0b',
                    },
                  }}
                >
                  View Analytics
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Assignment />}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: '#8b5cf6',
                    color: '#8b5cf6',
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: '#8b5cf610',
                      borderColor: '#8b5cf6',
                    },
                  }}
                >
                  Generate Report
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard;
