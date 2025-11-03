import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  Avatar,
  Chip,
  Skeleton,
  Badge,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Divider,
  Fade,
  Grow,
  Slide,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Group,
  Person,
  Star,
  Code,
  TrendingUp,
  Rocket,
  Security,
  AccountBalance,
  Public,
  Support,
  Login,
  EmojiEvents,
  Construction,
  Lock,
  CreditCard,
  Handshake,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { Team, TeamJoinRequest, TeamMembership } from '../types/api';
import { mockTeamService } from '../data/mockData';
import { teamsApi } from '../services/api';

const TeamsPage: React.FC = () => {
  const location = useLocation();
  const isDashboardMode = location.pathname.startsWith('/dashboard');

  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);

  // Join dialog state
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [joinForm, setJoinForm] = useState<TeamJoinRequest>({
    membership_type: 'free',
    role: '',
    bio: ''
  });
  const [joining, setJoining] = useState(false);

  // Team memberships state
  const [teamMemberships, setTeamMemberships] = useState<{[key: string]: TeamMembership}>({});

  // Notifications
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Try real API first, fallback to mock data if needed
        let teamsData: Team[];
        try {
          const response = await teamsApi.getAll();
          teamsData = response.data;
        } catch (apiError) {
          console.warn('Failed to fetch from API, using mock data:', apiError);
          teamsData = await mockTeamService.getTeams();
        }

        setTeams(teamsData);
      } catch (error) {
        console.error('Error fetching teams:', error);
        setError('Failed to load teams');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    loadTeamMemberships();
  }, []);

  const getTeamIcon = (teamName: string) => {
    switch (teamName) {
      case 'Planivarum':
        return <Public sx={{ fontSize: 40 }} />;
      case 'Stratovyn Collective':
        return <TrendingUp sx={{ fontSize: 40 }} />;
      case 'Cosmodyne Guild':
        return <Security sx={{ fontSize: 40 }} />;
      case 'SovraGrid':
        return <AccountBalance sx={{ fontSize: 40 }} />;
      case 'Tony Core':
        return <Support sx={{ fontSize: 40 }} />;
      default:
        return <Group sx={{ fontSize: 40 }} />;
    }
  };

  const getTeamGradient = (teamName: string) => {
    switch (teamName) {
      case 'Planivarum':
        return 'linear-gradient(135deg, #0f172a 0%, #1e40af 50%, #3730a3 100%)';
      case 'Stratovyn Collective':
        return 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%)';
      case 'Cosmodyne Guild':
        return 'linear-gradient(135deg, #7c2d12 0%, #dc2626 50%, #b91c1c 100%)';
      case 'SovraGrid':
        return 'linear-gradient(135deg, #166534 0%, #16a34a 50%, #eab308 100%)';
      case 'Tony Core':
        return 'linear-gradient(135deg, #1976d2 0%, #2563eb 50%, #3b82f6 100%)';
      default:
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  };

  const getProficiencyColor = (level: string) => {
    switch (level) {
      case 'expert': return 'success';
      case 'advanced': return 'primary';
      case 'intermediate': return 'warning';
      case 'beginner': return 'info';
      default: return 'default';
    }
  };

  const getProficiencyValue = (level: string) => {
    switch (level) {
      case 'expert': return 100;
      case 'advanced': return 80;
      case 'intermediate': return 60;
      case 'beginner': return 40;
      default: return 0;
    }
  };

  // Check if user is a member of a team
  const isTeamMember = (teamSlug: string) => {
    return !!teamMemberships[teamSlug];
  };

  // Handle opening join dialog
  const handleJoinClick = (team: Team) => {
    if (isTeamMember(team.slug)) {
      // If already a member, show login option
      handleTeamLogin(team);
    } else {
      // Open join dialog
      setSelectedTeam(team);
      setJoinForm({
        membership_type: 'free',
        role: '',
        bio: ''
      });
      setJoinDialogOpen(true);
    }
  };

  // Handle joining a team
  const handleJoinTeam = async () => {
    if (!selectedTeam) return;

    setJoining(true);
    try {
      const response = await teamsApi.join(selectedTeam.slug, joinForm);
      const membership = response.data;

      // Update memberships state
      setTeamMemberships(prev => ({
        ...prev,
        [selectedTeam.slug]: membership
      }));

      setJoinDialogOpen(false);
      setSnackbar({
        open: true,
        message: `Successfully joined ${selectedTeam.name}!`,
        severity: 'success'
      });

      // Refresh teams data to update member counts
      const teamsResponse = await teamsApi.getAll();
      setTeams(teamsResponse.data);

    } catch (error: any) {
      console.error('Error joining team:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || 'Failed to join team. Please try again.',
        severity: 'error'
      });
    } finally {
      setJoining(false);
    }
  };

  // Handle team-specific login
  const handleTeamLogin = (team: Team) => {
    // For now, redirect to a team login page or show login dialog
    // In a real implementation, this would open a team-specific login form
    setSnackbar({
      open: true,
      message: `Login functionality for ${team.name} would be implemented here.`,
      severity: 'info'
    });
  };

  // Load user's team memberships
  const loadTeamMemberships = async () => {
    try {
      // This would be implemented when we have the memberships API endpoint
      // For now, we'll check membership status when needed
    } catch (error) {
      console.error('Error loading team memberships:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ py: isDashboardMode ? 0 : 4 }}>
        {!isDashboardMode && (
          <Box sx={{ px: 3, py: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Skeleton variant="text" height={60} sx={{ mb: 2 }} />
              <Skeleton variant="text" height={40} />
            </Box>
          </Box>
        )}
        {isDashboardMode && (
          <Box sx={{ mb: 3 }}>
            <Skeleton variant="text" height={40} sx={{ mb: 2 }} />
            <Skeleton variant="text" height={30} />
          </Box>
        )}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 4 }}>
          {[...Array(2)].map((_, index) => (
            <Card key={index}>
              <Skeleton variant="rectangular" height={200} />
              <CardContent>
                <Skeleton variant="text" height={40} sx={{ mb: 2 }} />
                <Skeleton variant="text" height={60} sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} variant="circular" width={40} height={40} />
                  ))}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    );
  }

  const content = (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
          color: 'white',
          py: 8,
          mb: 6,
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }
        }}
      >
        <Box sx={{ px: 3 }}>
          <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <Fade in={true} timeout={1000}>
              <Box>
                <Typography
                  variant={isDashboardMode ? "h4" : "h2"}
                  component="h1"
                  fontWeight="bold"
                  gutterBottom
                  sx={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 3
                  }}
                >
                  AtonixCorp Teams
                </Typography>
                <Typography
                  variant={isDashboardMode ? "body1" : "h6"}
                  sx={{
                    mb: 4,
                    opacity: 0.9,
                    maxWidth: '800px',
                    mx: 'auto',
                    lineHeight: 1.6
                  }}
                >
                  Join independent, sovereign teams driving innovation across space research, energy systems,
                  cybersecurity, fintech, and community building. Each team operates with complete autonomy
                  while contributing to our shared mission.
                </Typography>
              </Box>
            </Fade>

            {/* Team Stats */}
            <Slide direction="up" in={true} timeout={1200}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3, mt: 6 }}>
                <Paper sx={{
                  p: 3,
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 3
                }}>
                  <Group sx={{ fontSize: 48, mb: 2, color: 'primary.light' }} />
                  <Typography variant="h3" fontWeight="bold" sx={{ color: 'white' }}>
                    {teams.length}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.8 }}>
                    Sovereign Teams
                  </Typography>
                </Paper>
                <Paper sx={{
                  p: 3,
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 3
                }}>
                  <Person sx={{ fontSize: 48, mb: 2, color: 'secondary.light' }} />
                  <Typography variant="h3" fontWeight="bold" sx={{ color: 'white' }}>
                    {teams.reduce((total, team) => total + team.members.length, 0)}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.8 }}>
                    Team Members
                  </Typography>
                </Paper>
                <Paper sx={{
                  p: 3,
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 3
                }}>
                  <Code sx={{ fontSize: 48, mb: 2, color: 'success.light' }} />
                  <Typography variant="h3" fontWeight="bold" sx={{ color: 'white' }}>
                    {teams.reduce((total, team) => total + team.skills.length, 0)}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.8 }}>
                    Core Skills
                  </Typography>
                </Paper>
              </Box>
            </Slide>
          </Box>
        </Box>
      </Box>

      {/* Teams Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 4, mb: 6 }}>
        {teams.map((team, index) => (
          <Grow in={true} timeout={800 + index * 200} key={team.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                  '& .team-overlay': {
                    opacity: 1,
                  }
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: getTeamGradient(team.name),
                }
              }}
            >
              {team.image && (
                <>
                  <CardMedia
                    component="img"
                    height="220"
                    image={team.image}
                    alt={team.name}
                    sx={{
                      objectFit: 'cover',
                      filter: 'brightness(0.9)',
                      transition: 'filter 0.3s ease',
                    }}
                  />
                  <Box
                    className="team-overlay"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: getTeamGradient(team.name),
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box sx={{ textAlign: 'center', color: 'white' }}>
                      {getTeamIcon(team.name)}
                      <Typography variant="h6" sx={{ mt: 1, fontWeight: 'bold' }}>
                        Join {team.name}
                      </Typography>
                    </Box>
                  </Box>
                </>
              )}

              <CardContent sx={{ flexGrow: 1, p: 3, position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ mr: 2, color: team.color_theme }}>
                    {getTeamIcon(team.name)}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h4" component="h2" fontWeight="bold" sx={{ mb: 1 }}>
                      {team.name}
                    </Typography>
                    <Chip
                      label={team.is_active ? 'Active' : 'Inactive'}
                      color={team.is_active ? 'success' : 'default'}
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                </Box>

                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: 500,
                    color: team.color_theme,
                    fontStyle: 'italic'
                  }}
                >
                  "{team.mission}"
                </Typography>

                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                  {team.description}
                </Typography>

                {/* Team Members Preview */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                    Team Members ({team.members.length})
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    {team.members.slice(0, 4).map((member) => (
                      <Badge
                        key={member.id}
                        badgeContent={member.is_lead ? <Star sx={{ fontSize: 14 }} /> : null}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        sx={{
                          '& .MuiBadge-badge': {
                            backgroundColor: team.color_theme,
                            color: 'white',
                          }
                        }}
                      >
                        <Avatar
                          src={member.avatar}
                          sx={{
                            width: 50,
                            height: 50,
                            border: `2px solid ${team.color_theme}20`,
                            transition: 'transform 0.2s ease',
                            '&:hover': {
                              transform: 'scale(1.1)',
                            }
                          }}
                        >
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                      </Badge>
                    ))}
                    {team.members.length > 4 && (
                      <Avatar sx={{
                        bgcolor: team.color_theme,
                        color: 'white',
                        fontWeight: 'bold'
                      }}>
                        +{team.members.length - 4}
                      </Avatar>
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Led by <strong>{team.members.find(m => m.is_lead)?.name}</strong>
                  </Typography>
                </Box>

                {/* Core Skills */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                    Core Skills
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {team.skills.slice(0, 3).map((skill) => (
                      <Box key={skill.id}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" fontWeight="500">
                            {skill.name}
                          </Typography>
                          <Chip
                            label={skill.proficiency_level}
                            size="small"
                            color={getProficiencyColor(skill.proficiency_level) as any}
                            variant="outlined"
                          />
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={getProficiencyValue(skill.proficiency_level)}
                          color={getProficiencyColor(skill.proficiency_level) as any}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: `${team.color_theme}20`,
                          }}
                        />
                      </Box>
                    ))}
                    {team.skills.length > 3 && (
                      <Typography variant="caption" color="text.secondary">
                        +{team.skills.length - 3} more skills
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Button
                  onClick={() => handleJoinClick(team)}
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{
                    mt: 'auto',
                    background: getTeamGradient(team.name),
                    color: 'white',
                    fontWeight: 'bold',
                    py: 1.5,
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                    }
                  }}
                  startIcon={isTeamMember(team.slug) ? <Login /> : <Group />}
                >
                  {isTeamMember(team.slug) ? `Login to ${team.name}` : `Join ${team.name}`}
                </Button>
              </CardContent>
            </Card>
          </Grow>
        ))}
      </Box>

      {/* Team Architecture Overview */}
      <Paper sx={{
        p: 6,
        mb: 6,
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        borderRadius: 4,
        border: '1px solid rgba(148, 163, 184, 0.2)'
      }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 4, textAlign: 'center', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <Construction sx={{ fontSize: 28 }} />
          Team Architecture & Isolation
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 4 }}>
          <Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: 'secondary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Lock sx={{ fontSize: 22 }} />
                Complete Isolation
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                Each team operates with full sovereignty - dedicated databases, isolated user spaces,
                and independent dashboards. Your data and interactions remain completely private
                within your chosen team environment.
              </Typography>
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: 'success.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Rocket sx={{ fontSize: 22 }} />
                Seamless Onboarding
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                Join any team instantly without complex registration processes. Simply choose your
                area of interest and you're immediately positioned in that team's dedicated environment
                with full access to their community and tools.
              </Typography>
            </Box>
          </Box>
          <Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: 'warning.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                <CreditCard sx={{ fontSize: 22 }} />
                Flexible Participation
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                Teams can be configured as free or premium experiences. Premium teams may require
                payment before granting full access, while maintaining the same seamless onboarding flow.
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: 'info.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Handshake sx={{ fontSize: 22 }} />
                Cross-Team Collaboration
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                While teams operate independently, Tony Core serves as the central hub for
                inter-team communication, support, and shared resources. Connect across all
                AtonixCorp initiatives through our unified community platform.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Team Highlights Section */}
      <Paper sx={{
        p: 6,
        mb: 6,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: 4
      }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 4, textAlign: 'center' }}>
          Why Join AtonixCorp Teams?
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Security sx={{ fontSize: 60, mb: 2, opacity: 0.9 }} />
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
              Sovereign Innovation
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Work on cutting-edge projects with complete data sovereignty and independent operation.
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Rocket sx={{ fontSize: 60, mb: 2, opacity: 0.9 }} />
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
              Mission-Driven Teams
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Join focused teams tackling real-world challenges in space, energy, security, and finance.
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Group sx={{ fontSize: 60, mb: 2, opacity: 0.9 }} />
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
              Community First
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Connect with like-minded innovators while maintaining privacy and team autonomy.
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Recent Team Achievements */}
      <Card sx={{ mb: 6, borderRadius: 4, overflow: 'hidden' }}>
        <Box sx={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          p: 3,
          color: 'white'
        }}>
          <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmojiEvents sx={{ fontSize: 26 }} />
            Recent Achievements
          </Typography>
        </Box>
        <CardContent sx={{ p: 4 }}>
          <List>
            <ListItem sx={{ px: 0 }}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <Rocket />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Planivarum - Breakthrough in Satellite Communication"
                secondary="Successfully deployed autonomous satellite communication systems enabling real-time space research data transmission"
              />
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem sx={{ px: 0 }}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <TrendingUp />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Stratovyn Collective - AI Energy Optimization Patent"
                secondary="Filed patent for revolutionary AI-driven solar panel optimization system, reducing energy costs by 40%"
              />
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem sx={{ px: 0 }}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <Security />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Cosmodyne Guild - Zero-Day Threat Prevention"
                secondary="Successfully prevented major cyber attack through advanced threat intelligence and autonomous defense systems"
              />
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem sx={{ px: 0 }}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  <AccountBalance />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="SovraGrid - Sovereign Payment Infrastructure Launch"
                secondary="Launched first fully sovereign digital payment platform with integrated cryptocurrency support"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Call to Action - Only show outside dashboard */}
      {!isDashboardMode && (
        <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: 4 }}>
          <Paper sx={{
            p: 6,
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
            color: 'white',
            textAlign: 'center',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z"/%3E%3C/g%3E%3C/svg%3E")',
              opacity: 0.1,
            }
          }}>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
              Ready to Join a Sovereign Team?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, maxWidth: '600px', mx: 'auto' }}>
              Choose your domain of innovation and join a team of passionate experts.
              Experience complete sovereignty while contributing to groundbreaking projects.
            </Typography>
            <Box sx={{
              display: 'flex',
              gap: 3,
              justifyContent: 'center',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <Button
                component={Link}
                to="/contact"
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: 'white',
                  color: 'primary.main',
                  fontWeight: 'bold',
                  px: 4,
                  py: 2,
                  borderRadius: 3,
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'grey.100',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                  }
                }}
              >
                Start Your Journey
              </Button>
              <Typography variant="body1" sx={{ opacity: 0.8, fontStyle: 'italic' }}>
                "Join the future of sovereign innovation"
              </Typography>
            </Box>
          </Paper>
        </Box>
      )}
    </>
  );

  return (
    <>
      {isDashboardMode ? (
        <Box>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Our Teams
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Meet the talented teams behind AtonixCorp's success
            </Typography>
          </Box>
          {content}
        </Box>
      ) : (
        <Box sx={{ px: 3, py: 4 }}>
          {content}
        </Box>
      )}

      {/* Join Team Dialog */}
      <Dialog
        open={joinDialogOpen}
        onClose={() => setJoinDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Join {selectedTeam?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Join {selectedTeam?.name} and become part of their sovereign innovation community.
            </Typography>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Membership Type</InputLabel>
              <Select
                value={joinForm.membership_type}
                label="Membership Type"
                onChange={(e) => setJoinForm(prev => ({
                  ...prev,
                  membership_type: e.target.value as 'free' | 'premium' | 'lead' | 'admin'
                }))}
              >
                <MenuItem value="free">Free Member</MenuItem>
                <MenuItem value="premium">Premium Member</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Your Role (Optional)"
              placeholder="e.g., Software Engineer, Data Scientist, etc."
              value={joinForm.role}
              onChange={(e) => setJoinForm(prev => ({ ...prev, role: e.target.value }))}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Bio (Optional)"
              placeholder="Tell us about yourself and your interest in this team..."
              multiline
              rows={3}
              value={joinForm.bio}
              onChange={(e) => setJoinForm(prev => ({ ...prev, bio: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJoinDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleJoinTeam}
            variant="contained"
            disabled={joining}
            sx={{
              background: selectedTeam ? getTeamGradient(selectedTeam.name) : undefined
            }}
          >
            {joining ? 'Joining...' : 'Join Team'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TeamsPage;
