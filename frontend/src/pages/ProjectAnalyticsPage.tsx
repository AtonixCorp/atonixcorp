import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Timeline } from '@mui/icons-material';
import DashboardLayout from '../components/Layout/DashboardLayout';

const ProjectAnalyticsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
          }}
        >
          Project Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Detailed analytics and insights for your projects.
        </Typography>

        <Paper
          sx={{
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            p: 4,
            textAlign: 'center',
          }}
        >
          <Timeline sx={{ fontSize: 64, color: '#ef4444', mb: 2 }} />
          <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
            Analytics Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Advanced project analytics and reporting tools.
          </Typography>
        </Paper>
      </Box>
    </DashboardLayout>
  );
};

export default ProjectAnalyticsPage;
