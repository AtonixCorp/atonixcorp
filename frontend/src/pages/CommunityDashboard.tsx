import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  Divider,
  IconButton,
  Badge,
  Tooltip,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  Code,
  People,
  Forum,
  Star,
  TrendingUp,
  Assignment,
  Notifications,
  Settings,
  Launch,
  GitHub,
  BugReport,
  Share,
  EmojiEvents,
  Book,
  Security,
  Speed,
  CloudDone,
  Info,
  Person,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { dashboardApi } from '../services/api';
import { Link } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';

interface DashboardStats {
  userContributions: number;
  communityRank: number;
  totalProjects: number;
  activeDiscussions: number;
  reputation: number;
  badges: string[];
}

interface Activity {
  id: number;
  type: 'contribution' | 'discussion' | 'project' | 'achievement';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  url?: string;
}

interface CommunityMetrics {
  totalMembers: number;
  activeProjects: number;
  monthlyContributions: number;
  discussionThreads: number;
  codeReviews: number;
  releases: number;
}

const CommunityDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [metrics, setMetrics] = useState<CommunityMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const response = await dashboardApi.getStats();
        const data = response.data;
        
        setStats(data.userStats);
        setActivities(data.recentActivities);
        setMetrics(data.communityMetrics);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fallback to mock data if API fails
        const mockStats: DashboardStats = {
          userContributions: 47,
          communityRank: 156,
          totalProjects: 8,
          activeDiscussions: 12,
          reputation: 2847,
          badges: ['Contributor', 'Code Reviewer', 'Community Helper'],
        };

        const mockActivities: Activity[] = [
          {
            id: 1,
            type: 'contribution',
            title: 'Merged PR #234 in SmartCity Platform',
            description: 'Fixed authentication middleware bug',
            timestamp: '2 hours ago',
            icon: 'code',
            url: '/projects/smartcity-analytics-platform',
          },
          {
            id: 2,
            type: 'discussion',
            title: 'Replied to "Best practices for microservices"',
            description: 'Shared insights on container orchestration',
            timestamp: '4 hours ago',
            icon: 'forum',
            url: '/community',
          },
          {
            id: 3,
            type: 'achievement',
            title: 'Earned "Code Reviewer" badge',
            description: 'Reviewed 10+ pull requests this month',
            timestamp: '1 day ago',
            icon: 'star',
          },
          {
            id: 4,
            type: 'project',
            title: 'Started new project: API Gateway',
            description: 'Cloud-native API gateway implementation',
            timestamp: '2 days ago',
            icon: 'assignment',
            url: '/projects',
          },
        ];

        const mockMetrics: CommunityMetrics = {
          totalMembers: 1247,
          activeProjects: 23,
          monthlyContributions: 156,
          discussionThreads: 89,
          codeReviews: 342,
          releases: 28,
        };

        setStats(mockStats);
        setActivities(mockActivities);
        setMetrics(mockMetrics);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getActivityIcon = (type: string, iconName: string) => {
    const iconProps = { sx: { color: 'primary.main', fontSize: 20 } };
    switch (iconName) {
      case 'code': return <Code {...iconProps} />;
      case 'forum': return <Forum {...iconProps} />;
      case 'star': return <Star {...iconProps} />;
      case 'assignment': return <Assignment {...iconProps} />;
      default: return <Info {...iconProps} />;
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Contributor': return 'primary';
      case 'Code Reviewer': return 'secondary';
      case 'Community Helper': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" height={50} width={300} />
          <Skeleton variant="text" height={30} width={600} />
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 3,
          }}
        >
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} variant="rectangular" height={200} />
          ))}
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
              <DashboardIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Welcome back, {user?.first_name || user?.username}!
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                AtonixCorp Community Dashboard
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Notifications">
              <IconButton>
                <Badge badgeContent={4} color="primary">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Settings">
              <IconButton>
                <Settings />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          🎉 Welcome to the AtonixCorp developer community! Collaborate on cutting-edge projects, share knowledge, and build the future of technology together.
        </Alert>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
          gap: 3,
        }}
      >
        {/* User Stats Cards */}
        <Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: 3,
            }}
          >
            {/* Contributions */}
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <Code sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats?.userContributions}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Contributions
              </Typography>
            </Card>

            {/* Community Rank */}
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                #{stats?.communityRank}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Community Rank
              </Typography>
            </Card>

            {/* Projects */}
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <Assignment sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats?.totalProjects}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Projects
              </Typography>
            </Card>

            {/* Reputation */}
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <Star sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats?.reputation}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Reputation
              </Typography>
            </Card>
          </Box>

          {/* Quick Actions */}
          <Card sx={{ mt: 3, p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Quick Actions
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 2,
              }}
            >
              <Button
                component={Link}
                to="/projects"
                variant="outlined"
                fullWidth
                startIcon={<Assignment />}
                sx={{ py: 1.5 }}
              >
                Browse Projects
              </Button>
              <Button
                component={Link}
                to="/community"
                variant="outlined"
                fullWidth
                startIcon={<Forum />}
                sx={{ py: 1.5 }}
              >
                Join Discussions
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Code />}
                sx={{ py: 1.5 }}
              >
                Submit PR
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<BugReport />}
                sx={{ py: 1.5 }}
              >
                Report Issue
              </Button>
            </Box>
          </Card>

          {/* Recent Activity */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Recent Activity
                </Typography>
                <Button size="small" endIcon={<Launch />}>
                  View All
                </Button>
              </Box>
              <List>
                {activities.map((activity, index) => (
                  <Box key={activity.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        {getActivityIcon(activity.type, activity.icon)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" fontWeight="medium">
                            {activity.title}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {activity.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {activity.timestamp}
                            </Typography>
                          </Box>
                        }
                      />
                      {activity.url && (
                        <IconButton
                          component={Link}
                          to={activity.url}
                          size="small"
                        >
                          <Launch fontSize="small" />
                        </IconButton>
                      )}
                    </ListItem>
                    {index < activities.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* Sidebar */}
        <Box>
          {/* User Profile Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}>
                <Person sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h6" fontWeight="bold">
                {user?.first_name} {user?.last_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                @{user?.username}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Member since {new Date().getFullYear() - 1}
              </Typography>
              
              {/* Badges */}
              <Box sx={{ mb: 2 }}>
                {stats?.badges.map((badge) => (
                  <Chip
                    key={badge}
                    label={badge}
                    size="small"
                    color={getBadgeColor(badge) as any}
                    sx={{ mr: 0.5, mb: 0.5 }}
                  />
                ))}
              </Box>
              
              <Button variant="outlined" size="small" fullWidth>
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Community Metrics */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Community Metrics
              </Typography>
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <People color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Total Members"
                    secondary={metrics?.totalMembers.toLocaleString()}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Assignment color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Active Projects"
                    secondary={metrics?.activeProjects}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Code color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Monthly Contributions"
                    secondary={metrics?.monthlyContributions}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Forum color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Discussion Threads"
                    secondary={metrics?.discussionThreads}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Featured Projects */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Featured Projects
              </Typography>
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                      <CloudDone sx={{ fontSize: 18 }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="SmartCity Platform"
                    secondary="Urban analytics & IoT"
                  />
                  <Chip label="Hot" size="small" color="error" />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                      <Security sx={{ fontSize: 18 }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Healthcare Integration"
                    secondary="HIPAA-compliant system"
                  />
                  <Chip label="New" size="small" color="success" />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'info.main', width: 32, height: 32 }}>
                      <Speed sx={{ fontSize: 18 }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="E-commerce Engine"
                    secondary="AI-powered optimization"
                  />
                </ListItem>
              </List>
              <Button
                component={Link}
                to="/projects"
                variant="text"
                size="small"
                fullWidth
                sx={{ mt: 1 }}
              >
                View All Projects
              </Button>
            </CardContent>
          </Card>

          {/* Community Links */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Community Links
              </Typography>
              <List dense>
                <ListItem
                  component="a"
                  href="https://github.com/atonixcorp"
                  target="_blank"
                  sx={{ px: 0, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <ListItemIcon>
                    <GitHub />
                  </ListItemIcon>
                  <ListItemText primary="GitHub Organization" />
                  <Launch fontSize="small" />
                </ListItem>
                <ListItem sx={{ px: 0, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                  <ListItemIcon>
                    <Book />
                  </ListItemIcon>
                  <ListItemText primary="Documentation" />
                  <Launch fontSize="small" />
                </ListItem>
                <ListItem sx={{ px: 0, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                  <ListItemIcon>
                    <EmojiEvents />
                  </ListItemIcon>
                  <ListItemText primary="Contributor Guide" />
                  <Launch fontSize="small" />
                </ListItem>
                <ListItem sx={{ px: 0, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                  <ListItemIcon>
                    <Share />
                  </ListItemIcon>
                  <ListItemText primary="Code of Conduct" />
                  <Launch fontSize="small" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default CommunityDashboard;