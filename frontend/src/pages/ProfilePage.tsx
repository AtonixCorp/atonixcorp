import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';

const ProfilePage: React.FC = () => {
  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, width: '100%' }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
          }}
        >
          Profile Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Manage your personal information and preferences.
        </Typography>

        <Paper
          sx={{
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            p: { xs: 2, sm: 2.5, md: 3 },
            textAlign: 'center',
          }}
        >
          <AccountCircle sx={{ fontSize: 64, color: '#8b5cf6', mb: 2 }} />
          <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
            Profile Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Update your profile information and settings.
          </Typography>
        </Paper>
      </Box>
  );
};

export default ProfilePage;
