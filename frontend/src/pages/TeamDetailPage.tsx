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
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  LinkedIn,
  GitHub,
  Email,
  Star,
  Group,
  Code,
  EmojiEvents,
  Person,
  Business,
} from '@mui/icons-material';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Team } from '../types/api';
import { mockTeamService } from '../data/mockData';

const TeamDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeam = async () => {
      if (!slug) {
        setError('Team not found');
        setLoading(false);
        return;
      }

      try {
        const teamData = await mockTeamService.getTeamBySlug(slug);
        if (teamData) {
          setTeam(teamData);
        } else {
          setError('Team not found');
        }
      } catch (err) {
        setError('Error loading team details');
        console.error('Error fetching team:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [slug]);

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

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="text" height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={300} sx={{ mb: 4 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 4 }}>
          <Box>
            <Skeleton variant="text" height={60} sx={{ mb: 2 }} />
            <Skeleton variant="text" height={100} sx={{ mb: 2 }} />
            {[...Array(3)].map((_, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Skeleton variant="circular" width={60} height={60} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Skeleton variant="text" height={30} sx={{ mb: 1 }} />
                      <Skeleton variant="text" height={20} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
          <Box>
            <Card>
              <CardContent>
                <Skeleton variant="text" height={40} sx={{ mb: 2 }} />
                {[...Array(4)].map((_, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Skeleton variant="text" height={25} sx={{ mb: 1 }} />
                    <Skeleton variant="rectangular" height={8} />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    );
  }

  if (error || !team) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error || 'Team not found'}
        </Alert>
        <Button
          component={Link}
          to="/teams"
          variant="contained"
          startIcon={<ArrowBack />}
        >
          Back to Teams
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button
        onClick={() => navigate('/teams')}
        startIcon={<ArrowBack />}
        sx={{ mb: 3 }}
      >
        Back to Teams
      </Button>

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
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Group sx={{ fontSize: 40, mr: 2 }} />
            <Typography variant="h2" component="h1" fontWeight="bold">
              {team.name}
            </Typography>
            <Chip
              label={team.is_active ? 'Active' : 'Inactive'}
              color={team.is_active ? 'success' : 'default'}
              sx={{ ml: 2 }}
            />
          </Box>
          <Typography variant="h5" sx={{ mb: 3, opacity: 0.9 }}>
            {team.mission}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.6, maxWidth: '80%' }}>
            {team.description}
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 4 }}>
        {/* Main Content */}
        <Box>
          {/* Team Members */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                Team Members ({team.members.length})
              </Typography>
              <Box sx={{ display: 'grid', gap: 3 }}>
                {team.members.map((member) => (
                  <Card key={member.id} variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                      <Box sx={{ position: 'relative' }}>
                        <Avatar
                          src={member.avatar}
                          alt={member.name}
                          sx={{ width: 80, height: 80 }}
                        >
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        {member.is_lead && (
                          <Star
                            color="warning"
                            sx={{
                              position: 'absolute',
                              top: -5,
                              right: -5,
                              fontSize: 20,
                              backgroundColor: 'white',
                              borderRadius: '50%',
                            }}
                          />
                        )}
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6" fontWeight="bold">
                            {member.name}
                          </Typography>
                          {member.is_lead && (
                            <Chip label="Team Lead" color="primary" size="small" />
                          )}
                        </Box>
                        <Typography variant="subtitle1" color="primary" sx={{ mb: 1 }}>
                          {member.role}
                        </Typography>
                        {member.bio && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {member.bio}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Joined: {formatJoinDate(member.join_date)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {member.email && (
                            <IconButton
                              size="small"
                              href={`mailto:${member.email}`}
                              color="primary"
                            >
                              <Email />
                            </IconButton>
                          )}
                          {member.linkedin_url && (
                            <IconButton
                              size="small"
                              href={member.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              color="primary"
                            >
                              <LinkedIn />
                            </IconButton>
                          )}
                          {member.github_url && (
                            <IconButton
                              size="small"
                              href={member.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              color="primary"
                            >
                              <GitHub />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Card>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Sidebar */}
        <Box>
          {/* Team Skills */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Team Skills
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {team.skills.map((skill) => (
                  <Box key={skill.id}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
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
                      sx={{ height: 8, borderRadius: 4, mb: 1 }}
                    />
                    {skill.description && (
                      <Typography variant="caption" color="text.secondary">
                        {skill.description}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Team Stats */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Team Statistics
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                      <Person fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Members"
                    secondary={team.members.length}
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32 }}>
                      <Code fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Core Skills"
                    secondary={team.skills.length}
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'warning.main', width: 32, height: 32 }}>
                      <EmojiEvents fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Team Lead"
                    secondary={team.members.find(m => m.is_lead)?.name}
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'info.main', width: 32, height: 32 }}>
                      <Business fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Team Status"
                    secondary={team.is_active ? 'Active' : 'Inactive'}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Contact Team */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Get in Touch
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Interested in collaborating with the {team.name} team?
              </Typography>
              <Button
                component={Link}
                to="/contact"
                variant="contained"
                fullWidth
                startIcon={<Email />}
              >
                Contact Team
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default TeamDetailPage;