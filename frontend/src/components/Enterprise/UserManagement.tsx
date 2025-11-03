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
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Person,
  Add,
  MoreVert,
  Edit,
  Delete,
  Security,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
}

const UserManagement: React.FC = () => {
  const { organization: _organization } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [_selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    // Mock data - in real app, this would come from API
    setUsers([
      {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@company.com',
        role: 'admin',
        status: 'active',
        lastLogin: '2024-01-15',
      },
      {
        id: 2,
        name: 'Sarah Chen',
        email: 'sarah.chen@company.com',
        role: 'manager',
        status: 'active',
        lastLogin: '2024-01-14',
      },
      {
        id: 3,
        name: 'Mike Wilson',
        email: 'mike.wilson@company.com',
        role: 'user',
        status: 'active',
        lastLogin: '2024-01-13',
      },
      {
        id: 4,
        name: 'Lisa Park',
        email: 'lisa.park@company.com',
        role: 'user',
        status: 'pending',
        lastLogin: 'Never',
      },
    ]);
  }, []);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'manager':
        return 'warning';
      case 'user':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'inactive':
        return 'default';
      default:
        return 'default';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <AdminPanelSettings sx={{ fontSize: 16 }} />;
      case 'manager':
        return <Security sx={{ fontSize: 16 }} />;
      default:
        return <Person sx={{ fontSize: 16 }} />;
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Person sx={{ fontSize: 40, color: '#3b82f6', mr: 2 }} />
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
              User Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage user accounts, roles, and permissions for your organization
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* User Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
        <Card sx={{ borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#3b82f6' }}>
              {users.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Users
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#22c55e' }}>
              {users.filter(u => u.status === 'active').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Users
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#f59e0b' }}>
              {users.filter(u => u.role === 'admin').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Administrators
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#ef4444' }}>
              {users.filter(u => u.status === 'pending').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pending Users
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Users List */}
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
              User Accounts
            </Typography>
            <Button
              startIcon={<Add />}
              variant="contained"
              sx={{
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1e293b 100%)',
              }}
            >
              Add User
            </Button>
          </Box>
          <List sx={{ p: 0 }}>
            {users.map((user) => (
              <ListItem
                key={user.id}
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
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={user.name}
                  secondary={
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {user.email}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        • Last login: {user.lastLogin}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      icon={getRoleIcon(user.role)}
                      label={user.role}
                      size="small"
                      color={getRoleColor(user.role) as any}
                      sx={{ fontSize: '0.7rem' }}
                    />
                    <Chip
                      label={user.status}
                      size="small"
                      color={getStatusColor(user.status) as any}
                      sx={{ fontSize: '0.7rem' }}
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, user)}
                      sx={{ color: 'text.secondary' }}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      </Paper>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            color: 'white',
          },
        }}
      >
        <MenuItem onClick={handleMenuClose} sx={{ borderRadius: '8px', mx: 1 }}>
          <Edit sx={{ mr: 2 }} />
          Edit User
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ borderRadius: '8px', mx: 1 }}>
          <Security sx={{ mr: 2 }} />
          Change Role
        </MenuItem>
        <MenuItem
          onClick={handleMenuClose}
          sx={{
            borderRadius: '8px',
            mx: 1,
            color: '#ef4444',
            '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.1)' }
          }}
        >
          <Delete sx={{ mr: 2 }} />
          Delete User
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UserManagement;

