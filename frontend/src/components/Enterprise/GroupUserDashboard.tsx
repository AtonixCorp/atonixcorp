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
  Paper,
  Chip,
} from '@mui/material';
import {
  Group,
  Add,
  People,
  Business,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface UserGroup {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  permissions: string[];
}

const GroupUserDashboard: React.FC = () => {
  const { organization } = useAuth();
  const [groups, setGroups] = useState<UserGroup[]>([]);

  useEffect(() => {
    // Mock data - in real app, this would come from API
    setGroups([
      {
        id: 1,
        name: 'Engineering Team',
        description: 'Core engineering and development team',
        memberCount: 12,
        permissions: ['code_access', 'deploy', 'admin'],
      },
      {
        id: 2,
        name: 'Product Team',
        description: 'Product management and design',
        memberCount: 8,
        permissions: ['product_access', 'analytics'],
      },
      {
        id: 3,
        name: 'Operations',
        description: 'System operations and maintenance',
        memberCount: 6,
        permissions: ['ops_access', 'monitoring'],
      },
    ]);
  }, []);

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Group sx={{ fontSize: 40, color: '#3b82f6', mr: 2 }} />
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
              Group Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage user groups and their permissions within your organization
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Groups Overview */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
        <Card sx={{ borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#3b82f6' }}>
              {groups.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Groups
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#22c55e' }}>
              {groups.reduce((acc, group) => acc + group.memberCount, 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Members
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#f59e0b' }}>
              {groups.reduce((acc, group) => acc + group.permissions.length, 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Permissions
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Groups List */}
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
              User Groups
            </Typography>
            <Button
              startIcon={<Add />}
              variant="contained"
              sx={{
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1e293b 100%)',
              }}
            >
              Create Group
            </Button>
          </Box>
          <List sx={{ p: 0 }}>
            {groups.map((group) => (
              <ListItem
                key={group.id}
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
                    <People />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={group.name}
                  secondary={
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {group.description}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                        <Chip
                          label={`${group.memberCount} members`}
                          size="small"
                          sx={{ fontSize: '0.7rem' }}
                        />
                        {group.permissions.slice(0, 2).map((permission) => (
                          <Chip
                            key={permission}
                            label={permission}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        ))}
                        {group.permissions.length > 2 && (
                          <Chip
                            label={`+${group.permissions.length - 2} more`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    </Box>
                  }
                />
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
import { groupsApi } from '../../services/groupsApi';

const GroupUserDashboard: React.FC = () => {
	const [groups, setGroups] = React.useState<any[]>([]);
	const [name, setName] = React.useState('');

	React.useEffect(() => {
		let mounted = true;
		const parts = window.location.pathname.split('/');
		const id = parts.includes('enterprise') ? parts[parts.indexOf('enterprise') + 1] : 'default';
		groupsApi.list(id).then(r => { if (mounted) setGroups(r || []); });
		return () => { mounted = false; };
	}, []);

	const create = async () => {
		const parts = window.location.pathname.split('/');
		const id = parts.includes('enterprise') ? parts[parts.indexOf('enterprise') + 1] : 'default';
		const g = await groupsApi.create(id, { name });
		setGroups(s => [...s, g]);
		setName('');
	};

	return (
		<Box>
			<Typography variant="h5">Groups</Typography>
			<Paper sx={{ mt: 2, p: 2 }}>
				<List>
					{groups.map(g => (
						<ListItem key={g.id}><ListItemText primary={g.name || `Group ${g.id}`} /></ListItem>
					))}
				</List>
				<Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
					<TextField size="small" value={name} onChange={(e) => setName(e.target.value)} placeholder="New group name" />
					<Button variant="contained" onClick={create}>Create</Button>
				</Box>
			</Paper>
		</Box>
	);
>>>>>>> cf817c2f425914921dfacd00e49554c630584992
};

export default GroupUserDashboard;
