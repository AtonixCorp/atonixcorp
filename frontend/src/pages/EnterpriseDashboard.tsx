import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  IconButton,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Timeline,
  Add,
  MonetizationOn,
  Domain,
  People,
  Cloud,
  Security,
  Analytics,
  Assessment,
  Settings,
  MoreVert,
  CheckCircle,
  Launch,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface EnterpriseStatCardProps {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  color: string;
}

interface EnterpriseMetricProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}

interface DepartmentCardProps {
  name: string;
  headcount: number;
  budget: string;
  projects: number;
  performance: number;
}

const _EnterpriseStatCard: React.FC<EnterpriseStatCardProps> = ({ title, value, change, trend, icon, color }) => {
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

const _EnterpriseMetric: React.FC<EnterpriseMetricProps> = ({ title, value, subtitle, icon, color }) => {
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color,
            }}
          >
            {icon}
          </Box>
          <Typography variant="h4" fontWeight={800} color={color}>
            {value}
          </Typography>
        </Box>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );
};

const _DepartmentCard: React.FC<DepartmentCardProps> = ({ name, headcount, budget, projects, performance }) => {
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
          <Typography variant="h6" fontWeight={600}>
            {name}
          </Typography>
          <IconButton size="small">
            <MoreVert />
          </IconButton>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Performance
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {performance}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={performance}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: '#f1f5f9',
              '& .MuiLinearProgress-bar': {
                backgroundColor: performance >= 80 ? '#22c55e' : performance >= 60 ? '#f59e0b' : '#ef4444',
                borderRadius: 4,
              },
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {headcount} employees
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {projects} active projects
            </Typography>
          </Box>
          <Typography variant="h6" fontWeight={700} color="#3b82f6">
            {budget}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

const _EnterpriseDashboard: React.FC = () => {
  const { user } = useAuth();

  const enterpriseStats = [
    {
      title: 'Total Revenue',
      value: '$2.4M',
      change: '+18%',
      trend: 'up' as const,
      icon: <MonetizationOn sx={{ fontSize: 28 }} />,
      color: '#22c55e',
    },
    {
      title: 'Active Departments',
      value: '8',
      change: '+2',
      trend: 'up' as const,
      icon: <Domain sx={{ fontSize: 28 }} />,
      color: '#3b82f6',
    },
    {
      title: 'Total Employees',
      value: '247',
      change: '+12%',
      trend: 'up' as const,
      icon: <People sx={{ fontSize: 28 }} />,
      color: '#8b5cf6',
    },
    {
      title: 'System Uptime',
      value: '99.9%',
      change: '+0.1%',
      trend: 'up' as const,
      icon: <Cloud sx={{ fontSize: 28 }} />,
      color: '#f59e0b',
    },
  ];

  const enterpriseMetrics = [
    {
      title: 'Security Score',
      value: '95',
      subtitle: 'Enterprise-grade protection',
      icon: <Security sx={{ fontSize: 24 }} />,
      color: '#22c55e',
    },
    {
      title: 'Compliance Rate',
      value: '98%',
      subtitle: 'Regulatory standards met',
      icon: <Assessment sx={{ fontSize: 24 }} />,
      color: '#3b82f6',
    },
    {
      title: 'Resource Utilization',
      value: '87%',
      subtitle: 'Infrastructure efficiency',
      icon: <Analytics sx={{ fontSize: 24 }} />,
      color: '#f59e0b',
    },
    {
      title: 'Innovation Index',
      value: '92',
      subtitle: 'R&D performance score',
      icon: <Timeline sx={{ fontSize: 24 }} />,
      color: '#8b5cf6',
    },
  ];

  const departments = [
    {
      name: 'Engineering',
      headcount: 85,
      budget: '$1.2M',
      projects: 12,
      performance: 92,
    },
    {
      name: 'Product',
      headcount: 32,
      budget: '$450K',
      projects: 8,
      performance: 88,
    },
    {
      name: 'Marketing',
      headcount: 28,
      budget: '$320K',
      projects: 6,
      performance: 85,
    },
    {
      name: 'Sales',
      headcount: 45,
      budget: '$680K',
      projects: 4,
      performance: 94,
    },
    {
      name: 'Operations',
      headcount: 38,
      budget: '$290K',
      projects: 7,
      performance: 89,
    },
    {
      name: 'HR',
      headcount: 19,
      budget: '$180K',
      projects: 3,
      performance: 91,
    },
  ];

  const recentInitiatives = [
    {
      title: 'Cloud Migration Initiative',
      status: 'active' as const,
      priority: 'high' as const,
      progress: 75,
      dueDate: 'Q1 2026',
    },
    {
      title: 'AI Implementation Program',
      status: 'active' as const,
      priority: 'high' as const,
      progress: 60,
      dueDate: 'Q2 2026',
    },
    {
      title: 'Security Infrastructure Upgrade',
      status: 'completed' as const,
      priority: 'critical' as const,
      progress: 100,
      dueDate: 'Completed',
    },
    {
      title: 'Employee Training Program',
      status: 'active' as const,
      priority: 'medium' as const,
      progress: 45,
      dueDate: 'Q4 2025',
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
            background: 'linear-gradient(135deg, #1e293b 0%, #6366f1 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
          }}
        >
          Enterprise Dashboard 🏢
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Comprehensive overview of enterprise operations and performance metrics.
        </Typography>
      </Box>

      {/* Enterprise Stats Cards */}
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
        {enterpriseStats.map((stat, index) => (
          <_EnterpriseStatCard key={index} {...stat} />
        ))}
      </Box>

      {/* Enterprise Metrics Grid */}
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
        {enterpriseMetrics.map((metric, index) => (
          <_EnterpriseMetric key={index} {...metric} />
        ))}
      </Box>

      {/* Main Content Grid */}
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
        {/* Department Overview */}
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
                  Department Overview
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
                  View Details
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
                {departments.map((dept, index) => (
                  <_DepartmentCard key={index} {...dept} />
                ))}
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Enterprise Initiatives */}
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
                  Enterprise Initiatives
                </Typography>
                <IconButton
                  sx={{
                    backgroundColor: '#6366f620',
                    color: '#6366f6',
                    width: 36,
                    height: 36,
                    '&:hover': {
                      backgroundColor: '#6366f640',
                    },
                  }}
                >
                  <Add />
                </IconButton>
              </Box>
              <List sx={{ p: 0, width: '100%' }}>
                {recentInitiatives.map((initiative, index) => (
                  <ListItem
                    key={index}
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
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '8px',
                          backgroundColor: initiative.status === 'completed' ? '#22c55e20' : '#3b82f620',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {initiative.status === 'completed' ? (
                          <CheckCircle sx={{ color: '#22c55e' }} />
                        ) : (
                          <Timeline sx={{ color: '#3b82f6' }} />
                        )}
                      </Box>
                    </ListItemAvatar>
                    <ListItemText
                      primary={initiative.title}
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              Due: {initiative.dueDate}
                            </Typography>
                            <Chip
                              label={`${initiative.progress}%`}
                              size="small"
                              sx={{
                                backgroundColor: initiative.progress === 100 ? '#22c55e20' : '#3b82f620',
                                color: initiative.progress === 100 ? '#22c55e' : '#3b82f6',
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                height: 20,
                              }}
                            />
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={initiative.progress}
                            sx={{
                              height: 4,
                              borderRadius: 2,
                              backgroundColor: '#f1f5f9',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: initiative.progress === 100 ? '#22c55e' : '#3b82f6',
                                borderRadius: 2,
                              },
                            }}
                          />
                        </Box>
                      }
                      primaryTypographyProps={{
                        fontWeight: 500,
                        color: '#1e293b',
                      }}
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={initiative.priority.toUpperCase()}
                        size="small"
                        sx={{
                          backgroundColor:
                            initiative.priority === 'critical' ? '#ef444420' :
                            initiative.priority === 'high' ? '#f59e0b20' :
                            '#22c55e20',
                          color:
                            initiative.priority === 'critical' ? '#ef4444' :
                            initiative.priority === 'high' ? '#f59e0b' :
                            '#22c55e',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: 20,
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Enterprise Actions */}
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
              Enterprise Actions
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(4, 1fr)',
                },
                gap: { xs: 1.5, sm: 2, md: 2 },
                width: '100%',
              }}
            >
              <Button
                variant="contained"
                startIcon={<Domain />}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #6366f1 0%, #1e293b 100%)',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                  py: 1.5,
                  '&:hover': {
                    boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)',
                  },
                }}
              >
                Add Department
              </Button>
              <Button
                variant="outlined"
                startIcon={<Analytics />}
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
                Generate Report
              </Button>
              <Button
                variant="outlined"
                startIcon={<Security />}
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
                Security Audit
              </Button>
              <Button
                variant="outlined"
                startIcon={<Settings />}
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
                System Config
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default _EnterpriseDashboard;
