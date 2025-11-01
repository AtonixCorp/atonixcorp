import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
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
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Alert,
} from '@mui/material';
import {
  Group,
  Person,
  Code,
  Assignment,
  Timeline,
  TrendingUp,
  Work,
  Business,
  AccessTime,
  Message,
  Email,
  Star,
  Settings,
  Payment,
  Dashboard,
  People,
  Folder,
  CalendarToday,
  BarChart,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { Team, TeamMembership, Project } from '../types/api';
import { teamsApi, projectsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/Layout/DashboardLayout';

interface TeamActivity {
  id: string;
  type: 'join' | 'project' | 'task' | 'message';
  user: string;
  description: string;
  timestamp: string;
  avatar?: string;
}

interface TeamProject {
  id: number;
  name: string;
  status: 'active' | 'completed' | 'on-hold';
  progress: number;
  members: number;
  deadline: string;
  description: string;
}

const TeamDashboardPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [membership, setMembership] = useState<TeamMembership | null>(null);
  const [projects, setProjects] = useState<TeamProject[]>([]);
  const [activities, setActivities] = useState<TeamActivity[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!slug) {
        setError('Team not found');
        setLoading(false);
        return;
      }

      try {
        // Fetch team details
        const teamResponse = await teamsApi.getBySlug(slug);
        setTeam(teamResponse.data);

        // Fetch user's membership status
        try {
          const membershipResponse = await teamsApi.getMembership(slug);
          setMembership(membershipResponse.data);
        } catch (membershipError) {
          // User might not be a member
          setMembership(null);
        }

        // Mock team projects (in real app, this would come from API)
        setProjects([
          {
            id: 1,
            name: 'AI-Powered Analytics Dashboard',
            status: 'active',
            progress: 75,
            members: 5,
            deadline: '2024-02-15',
            description: 'Building advanced analytics capabilities for the team',
          },
          {
            id: 2,
            name: 'Quantum Computing Research',
            status: 'active',
            progress: 45,
            members: 3,
            deadline: '2024-03-30',
            description: 'Exploring quantum algorithms for optimization problems',
          },
          {
            id: 3,
            name: 'Team Collaboration Platform',
            status: 'completed',
            progress: 100,
            members: 8,
            deadline: '2024-01-20',
            description: 'Internal platform for team communication and project management',
          },
        ]);

        // Mock team activities
        setActivities([
          {
            id: '1',
            type: 'join',
            user: 'Sarah Johnson',
            description: 'joined the team',
            timestamp: '2024-01-15T10:30:00Z',
          },
          {
            id: '2',
            type: 'project',
            user: 'Mike Chen',
            description: 'completed task "API Integration" in AI Analytics project',
            timestamp: '2024-01-14T14:20:00Z',
          },
          {
            id: '3',
            type: 'message',
            user: 'Emily Davis',
            description: 'posted in #general channel',
            timestamp: '2024-01-14T09:15:00Z',
          },
          {
            id: '4',
            type: 'join',
            user: 'Alex Rodriguez',
            description: 'joined the team',
            timestamp: '2024-01-13T16:45:00Z',
          },
        ]);

      } catch (err) {
        setError('Error loading team dashboard');
        console.error('Error fetching team data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [slug]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'primary';
      case 'on-hold': return 'warning';
      default: return 'default';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'join': return <Person color="primary" />;
      case 'project': return <Assignment color="secondary" />;
      case 'task': return <Work color="success" />;
      case 'message': return <Message color="info" />;
      default: return <Timeline />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography variant="h4" sx={{ mb: 4 }}>Loading Team Dashboard...</Typography>
        </Container>
      </DashboardLayout>
    );
  }

  if (error || !team) {
    return (
      <DashboardLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 4 }}>
            {error || 'Team not found'}
          </Alert>
        </Container>
      </DashboardLayout>
    );
  }

  // Check if user is a member
  if (!membership) {
    return (
      <DashboardLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="warning" sx={{ mb: 4 }}>
            You are not a member of this team. Please join the team first to access the dashboard.
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate(`/teams/${slug}`)}
          >
            View Team Details
          </Button>
        </Container>
      </DashboardLayout>
    );
  }

  const isAdmin = membership.membership_type === 'admin' || membership.membership_type === 'lead';
  const isPremium = membership.membership_type === 'premium' || isAdmin;

  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Team Header */}
        <Paper
          sx={{
            p: 4,
            mb: 4,
            background: `linear-gradient(135deg, ${team.color_theme} 0%, ${team.color_theme}CC 100%)`,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Group sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h3" component="h1" fontWeight="bold">
                    {team.name} Dashboard
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Welcome back, {user?.username}!
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {isAdmin && (
                  <Button
                    variant="contained"
                    startIcon={<Settings />}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                    onClick={() => navigate(`/teams/${slug}/admin`)}
                  >
                    Admin Panel
                  </Button>
                )}
                {!isPremium && (
                  <Button
                    variant="contained"
                    startIcon={<Payment />}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                    onClick={() => navigate(`/teams/${slug}/upgrade`)}
                  >
                    Upgrade to Premium
                  </Button>
                )}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Chip
                label={membership.membership_type}
                color={isPremium ? 'secondary' : 'default'}
                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
              />
              {membership.role && (
                <Chip
                  label={membership.role}
                  variant="outlined"
                  sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
                />
              )}
            </Box>
            <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: '60%' }}>
              {team.mission}
            </Typography>
          </Box>
        </Paper>

        {/* Quick Stats */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Group sx={{ fontSize: 48, color: team.color_theme, mb: 1 }} />
            <Typography variant="h4" fontWeight={700}>
              {team.members.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Team Members
            </Typography>
          </Card>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Work sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" fontWeight={700}>
              {projects.filter(p => p.status === 'active').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Projects
            </Typography>
          </Card>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <BarChart sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
            <Typography variant="h4" fontWeight={700}>
              {activities.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Recent Activities
            </Typography>
          </Card>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Star sx={{ fontSize: 48, color: 'info.main', mb: 1 }} />
            <Typography variant="h4" fontWeight={700}>
              {isPremium ? 'Premium' : 'Free'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Membership
            </Typography>
          </Card>
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
            <Tab icon={<Dashboard />} label="Overview" iconPosition="start" />
            <Tab icon={<Folder />} label="Projects" iconPosition="start" />
            <Tab icon={<People />} label="Team" iconPosition="start" />
            <Tab icon={<Timeline />} label="Activity" iconPosition="start" />
          </Tabs>

          {/* Overview Tab */}
          <Box sx={{ p: 3 }}>
            {tabValue === 0 && (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                      Recent Projects
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {projects.slice(0, 3).map((project) => (
                        <Box key={project.id} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="subtitle1" fontWeight="600">
                              {project.name}
                            </Typography>
                            <Chip
                              label={project.status}
                              size="small"
                              color={getStatusColor(project.status) as any}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {project.description}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                {project.members} members • Due {new Date(project.deadline).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <Box sx={{ minWidth: 100 }}>
                              <Typography variant="caption" color="text.secondary">
                                {project.progress}% complete
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={project.progress}
                                sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
                              />
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                      Recent Activity
                    </Typography>
                    <List dense>
                      {activities.slice(0, 5).map((activity) => (
                        <ListItem key={activity.id} sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: `${team.color_theme}20` }}>
                              {getActivityIcon(activity.type)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="body2">
                                <strong>{activity.user}</strong> {activity.description}
                              </Typography>
                            }
                            secondary={formatTimestamp(activity.timestamp)}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Box>
            )}

            {/* Projects Tab */}
            {tabValue === 1 && (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                {projects.map((project) => (
                  <Card key={project.id}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" fontWeight="600">
                          {project.name}
                        </Typography>
                        <Chip
                          label={project.status}
                          size="small"
                          color={getStatusColor(project.status) as any}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {project.description}
                      </Typography>
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
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          {project.members} members • Due {new Date(project.deadline).toLocaleDateString()}
                        </Typography>
                        <Button size="small" variant="outlined">
                          View Details
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}

            {/* Team Tab */}
            {tabValue === 2 && (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
                {team.members.map((member) => (
                  <Card key={member.id}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          src={member.avatar}
                          sx={{ width: 56, height: 56, mr: 2, bgcolor: team.color_theme }}
                        >
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight={600}>
                            {member.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {member.role}
                          </Typography>
                        </Box>
                        {member.is_lead && (
                          <Star color="warning" />
                        )}
                      </Box>
                      {member.bio && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {member.bio}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {member.email && (
                          <IconButton size="small" color="primary">
                            <Email fontSize="small" />
                          </IconButton>
                        )}
                        <IconButton size="small" color="primary">
                          <Message fontSize="small" />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}

            {/* Activity Tab */}
            {tabValue === 3 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                    Team Activity Feed
                  </Typography>
                  <List>
                    {activities.map((activity, index) => (
                      <React.Fragment key={activity.id}>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: `${team.color_theme}20` }}>
                              {getActivityIcon(activity.type)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="body1">
                                <strong>{activity.user}</strong> {activity.description}
                              </Typography>
                            }
                            secondary={formatTimestamp(activity.timestamp)}
                          />
                        </ListItem>
                        {index < activities.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}
          </Box>
        </Paper>
      </Container>
    </DashboardLayout>
  );

};

export default TeamDashboardPage;
