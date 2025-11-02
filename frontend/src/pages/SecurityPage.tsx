import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Security } from '@mui/icons-material';

const SecurityPage: React.FC = () => {
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
          Security Center
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Monitor and manage your account security.
        </Typography>

        <Paper
          sx={{
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            p: { xs: 2.5, sm: 3, md: 4 },
            textAlign: 'center',
            width: '100%',
          }}
        >
          <Security sx={{ fontSize: 64, color: '#22c55e', mb: 2 }} />
          <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
            Security Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Security monitoring and management features.
          </Typography>
        </Paper>
      </Box>
  );
};

export default SecurityPage;
