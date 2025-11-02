import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  Chip,
  Divider,
} from '@mui/material';
import {
  Group,
  ArrowBack,
  Info,
} from '@mui/icons-material';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Team } from '../types/api';
import { teamsApi } from '../services/api';

const TeamLoginPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [team, setTeam] = useState<Team | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [teamLoading, setTeamLoading] = useState(true);
  const [loginMode, setLoginMode] = useState<'team' | 'global'>('team');

  // Check if user was redirected here for team-specific login
  const returnUrl = searchParams.get('returnUrl') || `/teams/${slug}/dashboard`;

  useEffect(() => {
    const fetchTeam = async () => {
      if (!slug) {
        setError('Team not found');
        setTeamLoading(false);
        return;
      }

      try {
        const teamData = await teamsApi.getBySlug(slug);
        setTeam(teamData.data);
      } catch (err) {
        setError('Team not found');
        console.error('Error fetching team:', err);
      } finally {
        setTeamLoading(false);
      }
    };

    fetchTeam();
  }, [slug]);

  const handleTeamLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Use team-specific login API
      const response = await teamsApi.teamLogin({
        username,
        password,
        team_slug: slug!,
      });

      // Store team-specific token
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('teamSlug', slug!);
      localStorage.setItem('teamMembership', JSON.stringify(response.data.team));

      // Navigate to return URL or team dashboard
      navigate(returnUrl);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Team login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGlobalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });

      // After global login, check if user is a member of this team
      try {
        const membershipResponse = await teamsApi.getMembership(slug!);
        if (membershipResponse.data.is_active) {
          // User is a member, redirect to team dashboard
          navigate(returnUrl);
        } else {
          // User is not a member, redirect to team join page
          navigate(`/teams/${slug}?join=true`);
        }
      } catch (membershipError) {
        // User is not a member
        navigate(`/teams/${slug}?join=true`);
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (teamLoading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography>Loading team information...</Typography>
        </Box>
      </Container>
    );
  }

  if (!team) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          Team not found
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
    <Container maxWidth="sm" sx={{ py: 4 }}>
      {/* Team Header */}
      <Paper
        sx={{
          p: 4,
          mb: 4,
          textAlign: 'center',
          background: `linear-gradient(135deg, ${team.color_theme} 0%, ${team.color_theme}CC 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Group sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
            {team.name}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
            {team.mission}
          </Typography>
          <Chip
            label="Team Login"
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          />
        </Box>
      </Paper>

      {/* Login Options */}
      <Paper sx={{ p: 4, borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
            Sign in to {team.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose how you'd like to access your team account
          </Typography>
        </Box>

        {/* Login Mode Toggle */}
        <Box sx={{ display: 'flex', mb: 4, border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
          <Button
            fullWidth
            variant={loginMode === 'team' ? 'contained' : 'text'}
            onClick={() => setLoginMode('team')}
            sx={{
              py: 2,
              borderRadius: 0,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Team Account
          </Button>
          <Button
            fullWidth
            variant={loginMode === 'global' ? 'contained' : 'text'}
            onClick={() => setLoginMode('global')}
            sx={{
              py: 2,
              borderRadius: 0,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Global Account
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {loginMode === 'team' ? (
          /* Team-Specific Login */
          <Box component="form" onSubmit={handleTeamLogin}>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Info sx={{ fontSize: 16, mr: 1 }} />
              Use your team-specific username and password to access {team.name}
            </Alert>

            <TextField
              label="Team Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
              required
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              sx={{ mb: 3 }}
              required
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{
                mb: 2,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                background: `linear-gradient(135deg, ${team.color_theme} 0%, ${team.color_theme}CC 100%)`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${team.color_theme}CC 0%, ${team.color_theme} 100%)`,
                },
              }}
            >
              {loading ? 'Signing in...' : `Sign in to ${team.name}`}
            </Button>
          </Box>
        ) : (
          /* Global Account Login */
          <Box component="form" onSubmit={handleGlobalLogin}>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Info sx={{ fontSize: 16, mr: 1 }} />
              Sign in with your global AtonixCorp account to access {team.name}
            </Alert>

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
              required
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              sx={{ mb: 3 }}
              required
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{
                mb: 2,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                background: `linear-gradient(135deg, ${team.color_theme} 0%, ${team.color_theme}CC 100%)`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${team.color_theme}CC 0%, ${team.color_theme} 100%)`,
                },
              }}
            >
              {loading ? 'Signing in...' : 'Sign in with Global Account'}
            </Button>
          </Box>
        )}

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            or
          </Typography>
        </Divider>

        {/* Additional Options */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Don't have an account?
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              component={Link}
              to={`/teams/${slug}`}
              variant="outlined"
              fullWidth
              startIcon={<Group />}
              sx={{ textTransform: 'none' }}
            >
              Join {team.name}
            </Button>

            <Button
              component={Link}
              to="/"
              variant="text"
              fullWidth
              startIcon={<ArrowBack />}
              sx={{ textTransform: 'none' }}
            >
              Back to Home
            </Button>
          </Box>
        </Box>

        {/* Help Text */}
        <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            <strong>Team Account:</strong> Specific to {team.name} with team-only access
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Global Account:</strong> Your main AtonixCorp account with access to all teams
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};



export default TeamLoginPage;
