import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Paper,
  Stack,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  BarChart,
  PieChart,
  Timeline,
  Group,
  Business,
  Assignment
} from '@mui/icons-material';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  color: string;
}

const ____MetricCard: React.FC<MetricCardProps> = ({ title, value, change, trend, icon, color }) => {
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
      <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
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

const AnalyticsPage: React.FC = () => {
  const metrics = [
    {
      title: 'Total Projects',
      value: '24',
      change: '+12%',
      trend: 'up' as const,
      icon: <Business sx={{ fontSize: 28 }} />,
      color: '#3b82f6',
    },
    {
      title: 'Active Tasks',
      value: '156',
      change: '+8%',
      trend: 'up' as const,
      icon: <Assignment sx={{ fontSize: 28 }} />,
      color: '#22c55e',
    },
    {
      title: 'Team Members',
      value: '42',
      change: '+15%',
      trend: 'up' as const,
      icon: <Group sx={{ fontSize: 28 }} />,
      color: '#f59e0b',
    },
    {
      title: 'Completion Rate',
      value: '87%',
      change: '+5%',
      trend: 'up' as const,
      icon: <Timeline sx={{ fontSize: 28 }} />,
      color: '#8b5cf6',
    },
  ];

  const projectProgress = [
    { name: 'Cloud Migration', progress: 85, status: 'On Track' },
    { name: 'AI Dashboard', progress: 60, status: 'In Progress' },
    { name: 'Mobile App', progress: 100, status: 'Completed' },
    { name: 'Security Audit', progress: 30, status: 'Delayed' },
  ];

  const recentActivities = [
    {
      user: 'John Doe',
      action: 'Completed task "Database optimization"',
      time: '2 hours ago',
      avatar: 'J',
    },
    {
      user: 'Sarah Wilson',
      action: 'Created new project "API Gateway"',
      time: '4 hours ago',
      avatar: 'S',
    },
    {
      user: 'Mike Johnson',
      action: 'Updated team permissions',
      time: '6 hours ago',
      avatar: 'M',
    },
    {
      user: 'Emma Davis',
      action: 'Submitted code review',
      time: '8 hours ago',
      avatar: 'E',
    },
  ];

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
            Analytics Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your team's performance and project progress.
          </Typography>
        </Box>

        {/* Metrics Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: { xs: 2, sm: 2.5, md: 3 },
            mb: 4,
            width: '100%',
          }}
        >
          {metrics.map((metric, index) => (
            <Box key={index}>
              <____MetricCard {...metric} />
            </Box>
          ))}
        </Box>

        {/* Charts and Progress */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: { xs: 2.5, sm: 3, md: 3 }, width: '100%' }}>
          {/* Project Progress */}
          <Box sx={{ flex: { xs: '1', lg: '2' } }}>
            <Paper
              sx={{
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                p: { xs: 2, sm: 2.5, md: 3 },
              }}
            >
              <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                Project Progress Overview
              </Typography>
              <Stack spacing={3}>
                {projectProgress.map((project, index) => (
                  <Box key={index}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1" fontWeight={600}>
                        {project.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {project.progress}%
                        </Typography>
                        <Chip
                          label={project.status}
                          size="small"
                          sx={{
                            backgroundColor:
                              project.status === 'Completed' ? '#22c55e20' :
                              project.status === 'On Track' ? '#3b82f620' :
                              project.status === 'Delayed' ? '#ef444420' : '#f59e0b20',
                            color:
                              project.status === 'Completed' ? '#22c55e' :
                              project.status === 'On Track' ? '#3b82f6' :
                              project.status === 'Delayed' ? '#ef4444' : '#f59e0b',
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={project.progress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#f1f5f9',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor:
                            project.status === 'Completed' ? '#22c55e' :
                            project.status === 'On Track' ? '#3b82f6' :
                            project.status === 'Delayed' ? '#ef4444' : '#f59e0b',
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Box>

          {/* Recent Activities */}
          <Box sx={{ flex: '1' }}>
            <Paper
              sx={{
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                p: { xs: 2, sm: 2.5, md: 3 },
                height: 'fit-content',
              }}
            >
              <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                Recent Activities
              </Typography>
              <List sx={{ p: 0 }}>
                {recentActivities.map((activity, index) => (
                  <React.Fragment key={index}>
                    <ListItem sx={{ px: 0, py: 2 }}>
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            backgroundColor: '#3b82f6',
                            fontWeight: 600,
                          }}
                        >
                          {activity.avatar}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight={600}>
                            {activity.user}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              {activity.action}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {activity.time}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentActivities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Box>
        </Box>

        {/* Additional Analytics Sections */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: { xs: 2, sm: 2.5, md: 3 },
            mt: 2,
            width: '100%',
          }}
        >
          <Paper
            sx={{
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              p: { xs: 2, sm: 2.5, md: 3 },
              textAlign: 'center',
            }}
          >
            <BarChart sx={{ fontSize: 48, color: '#3b82f6', mb: 2 }} />
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
              Project Distribution
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View detailed breakdowns of project types and categories
            </Typography>
          </Paper>

          <Paper
            sx={{
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              p: { xs: 2, sm: 2.5, md: 3 },
              textAlign: 'center',
            }}
          >
            <PieChart sx={{ fontSize: 48, color: '#22c55e', mb: 2 }} />
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
              Team Performance
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Analyze individual and team productivity metrics
            </Typography>
          </Paper>
        </Box>
      </Box>
  );
};

export default AnalyticsPage;
