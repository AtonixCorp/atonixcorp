<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  People,
  Add,
  Group,
  TrendingUp,
  Assessment,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  department: string;
  status: 'active' | 'inactive';
  performance: number;
}

const TeamDashboard: React.FC = () => {
  const { organization } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    // Mock data - in real app, this would come from API
    setTeamMembers([
      {
        id: 1,
        name: 'John Doe',
        role: 'Engineering Manager',
        department: 'Engineering',
        status: 'active',
        performance: 95,
      },
      {
        id: 2,
        name: 'Sarah Chen',
        role: 'Product Manager',
        department: 'Product',
        status: 'active',
        performance: 88,
      },
      {
        id: 3,
        name: 'Mike Wilson',
        role: 'DevOps Engineer',
        department: 'Engineering',
        status: 'active',
        performance: 92,
      },
      {
        id: 4,
        name: 'Lisa Park',
        role: 'Designer',
        department: 'Design',
        status: 'active',
        performance: 90,
      },
    ]);
  }, []);

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'default';
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <People sx={{ fontSize: 40, color: '#3b82f6', mr: 2 }} />
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
              Team Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage and monitor your organization's team performance
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Team Overview */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
        <Card sx={{ borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#3b82f6' }}>
                  {teamMembers.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Team Members
                </Typography>
              </Box>
              <Group sx={{ fontSize: 40, color: '#3b82f6', opacity: 0.7 }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#22c55e' }}>
                  {Math.round(teamMembers.reduce((acc, member) => acc + member.performance, 0) / teamMembers.length)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average Performance
                </Typography>
              </Box>
              <TrendingUp sx={{ fontSize: 40, color: '#22c55e', opacity: 0.7 }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#f59e0b' }}>
                  {teamMembers.filter(m => m.status === 'active').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Members
                </Typography>
              </Box>
              <Assessment sx={{ fontSize: 40, color: '#f59e0b', opacity: 0.7 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Team Members List */}
      <Paper
        sx={{
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" fontWeight={700}>
              Team Members
            </Typography>
            <Button
              startIcon={<Add />}
              variant="contained"
              sx={{
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1e293b 100%)',
              }}
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
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.5)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar
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
                        {member.role} • {member.department}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={member.performance}
                          sx={{
                            flex: 1,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: 'rgba(255, 255, 255, 0.3)',
                          }}
                        />
                        <Typography variant="caption" sx={{ minWidth: '35px' }}>
                          {member.performance}%
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Chip
                    label={member.status}
                    size="small"
                    color={getStatusColor(member.status) as any}
                    sx={{ fontSize: '0.7rem' }}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      </Paper>
    </Box>
  );
=======
import React from 'react';
import { Box, Paper, Typography, List, ListItem, ListItemText, TextField, Button } from '@mui/material';
import { teamsApi } from '../../services/teamsApi';

const TeamDashboard: React.FC = () => {
	const [teams, setTeams] = React.useState<any[]>([]);
	const [name, setName] = React.useState('');

	React.useEffect(() => {
		let mounted = true;
		// enterpriseId will be provided by the page wrapper; try reading from URL if available
		const parts = window.location.pathname.split('/');
		const id = parts.includes('enterprise') ? parts[parts.indexOf('enterprise') + 1] : 'default';
		teamsApi.list(id).then(r => { if (mounted) setTeams(r || []); });
		return () => { mounted = false; };
	}, []);

	const create = async () => {
		const parts = window.location.pathname.split('/');
		const id = parts.includes('enterprise') ? parts[parts.indexOf('enterprise') + 1] : 'default';
		const t = await teamsApi.create(id, { name });
		setTeams(s => [...s, t]);
		setName('');
	};

	return (
		<Box>
			<Typography variant="h5">Teams</Typography>
			<Paper sx={{ mt: 2, p: 2 }}>
				<List>
					{teams.map(t => (
						<ListItem key={t.id}><ListItemText primary={t.name || `Team ${t.id}`} /></ListItem>
					))}
				</List>
				<Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
					<TextField size="small" value={name} onChange={(e) => setName(e.target.value)} placeholder="New team name" />
					<Button variant="contained" onClick={create}>Create</Button>
				</Box>
			</Paper>
		</Box>
	);
>>>>>>> cf817c2f425914921dfacd00e49554c630584992
};

export default TeamDashboard;
