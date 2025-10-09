import React, { useState, useEffect } from 'react';
import {
  Container,
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
} from '@mui/material';
import {
  Group,
  Person,
  Star,
  Code,
  LinkedIn,
  GitHub,
  Email,
  EmojiEvents,
  TrendingUp,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { Team } from '../types/api';
import { mockTeamService } from '../data/mockData';
import { teamsApi } from '../services/api';

const TeamsPage: React.FC = () => {
  const location = useLocation();
  const isDashboardMode = location.pathname.startsWith('/dashboard');

  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, []);

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

  if (loading) {
    return (
      <Box sx={{ py: isDashboardMode ? 0 : 4 }}>
        {!isDashboardMode && (
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Skeleton variant="text" height={60} sx={{ mb: 2 }} />
              <Skeleton variant="text" height={40} />
            </Box>
          </Container>
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
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant={isDashboardMode ? "h4" : "h2"} component="h1" fontWeight="bold" gutterBottom>
          Our Teams
        </Typography>
        <Typography variant={isDashboardMode ? "body1" : "h6"} color="text.secondary" sx={{ mb: 4 }}>
          Meet the talented teams behind AtonixCorp's success
        </Typography>
        
        {/* Team Stats */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3, mb: 6 }}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Group color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {teams.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Teams
            </Typography>
          </Paper>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Person color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {teams.reduce((total, team) => total + team.members.length, 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Team Members
            </Typography>
          </Paper>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Code color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {teams.reduce((total, team) => total + team.skills.length, 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Core Skills
            </Typography>
          </Paper>
        </Box>
      </Box>

      {/* Teams Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 4, mb: 6 }}>
        {teams.map((team) => (
          <Card
            key={team.id}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              },
            }}
          >
            {team.image && (
              <CardMedia
                component="img"
                height="200"
                image={team.image}
                alt={team.name}
                sx={{ objectFit: 'cover' }}
              />
            )}
            
            <CardContent sx={{ flexGrow: 1, p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h2" fontWeight="bold" sx={{ flexGrow: 1 }}>
                  {team.name}
                </Typography>
                <Chip
                  label={team.is_active ? 'Active' : 'Inactive'}
                  color={team.is_active ? 'success' : 'default'}
                  size="small"
                />
              </Box>

              <Typography
                variant="h6"
                color="primary"
                sx={{ mb: 2, fontWeight: 500 }}
              >
                {team.mission}
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
                      badgeContent={member.is_lead ? <Star color="warning" fontSize="small" /> : null}
                      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                      <Avatar
                        src={member.avatar}
                        alt={member.name}
                        sx={{ width: 50, height: 50 }}
                      >
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                    </Badge>
                  ))}
                  {team.members.length > 4 && (
                    <Avatar sx={{ bgcolor: 'grey.300', color: 'grey.600' }}>
                      +{team.members.length - 4}
                    </Avatar>
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Led by {team.members.find(m => m.is_lead)?.name}
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
                        sx={{ height: 6, borderRadius: 3 }}
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
                component={Link}
                to={isDashboardMode ? `/dashboard/teams/${team.slug}` : `/teams/${team.slug}`}
                variant="contained"
                fullWidth
                size="large"
                startIcon={<Group />}
              >
                Meet the Team
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Team Highlights Section */}
      <Paper sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 3, textAlign: 'center' }}>
          Why Our Teams Excel
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <EmojiEvents sx={{ fontSize: 60, mb: 2, opacity: 0.9 }} />
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
              Award-Winning Excellence
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Our teams have won multiple industry awards for innovation and technical excellence.
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <TrendingUp sx={{ fontSize: 60, mb: 2, opacity: 0.9 }} />
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
              Continuous Growth
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              We invest heavily in our team's professional development and cutting-edge training.
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Group sx={{ fontSize: 60, mb: 2, opacity: 0.9 }} />
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
              Collaborative Culture
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Cross-functional collaboration and knowledge sharing drive our innovative solutions.
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Recent Team Achievements */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
            Recent Team Achievements
          </Typography>
          <List>
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <EmojiEvents />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Pioneers Team - Platform Excellence Award"
                secondary="Recognized for outstanding contribution to infrastructure scalability and reliability"
              />
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Code />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Unity Developers - Innovation in AR/VR"
                secondary="Breakthrough immersive experience development recognized at TechCon 2025"
              />
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <TrendingUp />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Cross-Team Collaboration Success"
                secondary="Successful integration of medical AI with platform infrastructure"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Call to Action - Only show outside dashboard */}
      {!isDashboardMode && (
        <Card sx={{ textAlign: 'center', p: 4, background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)', color: 'white' }}>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
            Want to Join Our Teams?
          </Typography>
          <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
            We're always looking for talented individuals to join our innovative teams
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              component={Link}
              to="/contact"
              variant="contained"
              size="large"
              sx={{ 
                backgroundColor: 'white',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'grey.100',
                }
              }}
            >
              View Open Positions
            </Button>
            <Button
              component={Link}
              to="/community"
              variant="outlined"
              size="large"
              sx={{ 
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              Join Our Community
            </Button>
          </Box>
        </Card>
      )}
    </>
  );

  return isDashboardMode ? (
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {content}
    </Container>
  );
};

export default TeamsPage;