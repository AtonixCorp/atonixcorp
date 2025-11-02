import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import {
  TableChart,
  Search,
  History,
} from '@mui/icons-material';

const AuditLogs: React.FC = () => {
  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, width: '100%' }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TableChart sx={{ fontSize: 40, color: '#3b82f6', mr: 2 }} />
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
              Audit Logs
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Comprehensive audit trail for security and compliance
            </Typography>
          </Box>
        </Box>
      </Box>

      <Card sx={{ borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <History sx={{ fontSize: 64, color: '#3b82f6', mb: 2, opacity: 0.7 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>
            Audit Logs Module
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Detailed audit logs for tracking user actions and system events.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Search />}
            sx={{
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1e293b 100%)',
            }}
          >
            View Logs
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AuditLogs;
