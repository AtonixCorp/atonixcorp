import React from 'react';
import { Box, Card, CardContent, Typography, LinearProgress, Chip } from '@mui/material';
import {
  TrendingUp,
  CheckCircle,
  Warning,
  Shield,
} from '@mui/icons-material';

interface SecurityMetricsProps {
  controlsVerified: number;
  controlsTotal: number;
  complianceScore: number;
  activeIncidents: number;
  policiesActive: number;
}

const SecurityMetrics: React.FC<SecurityMetricsProps> = ({
  controlsVerified,
  controlsTotal,
  complianceScore,
  activeIncidents,
  policiesActive,
}) => {
  const controlsPercentage = controlsTotal > 0 ? (controlsVerified / controlsTotal) * 100 : 0;

  const getComplianceColor = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 50) return '#eab308';
    return '#dc2626';
  };

  return (
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)' } }}>
      <Box>
        <Card sx={{ borderRadius: '12px', height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Control Implementation
              </Typography>
              <CheckCircle sx={{ fontSize: 24, color: '#22c55e' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
              {controlsVerified}/{controlsTotal}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={controlsPercentage}
              sx={{ height: 8, borderRadius: '4px', mb: 1 }}
            />
            <Typography variant="caption" color="textSecondary">
              {controlsPercentage.toFixed(1)}% Complete
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box>
        <Card sx={{ borderRadius: '12px', height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Compliance Score
              </Typography>
              <TrendingUp sx={{ fontSize: 24, color: getComplianceColor(complianceScore) }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                mb: 1,
                color: getComplianceColor(complianceScore),
              }}
            >
              {complianceScore.toFixed(1)}%
            </Typography>
            <Chip
              label={complianceScore >= 80 ? 'Compliant' : complianceScore >= 50 ? 'At Risk' : 'Critical'}
              size="small"
              color={complianceScore >= 80 ? 'success' : complianceScore >= 50 ? 'warning' : 'error'}
              variant="outlined"
            />
          </CardContent>
        </Card>
      </Box>

      <Box>
        <Card sx={{ borderRadius: '12px', height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Active Incidents
              </Typography>
              <Warning
                sx={{
                  fontSize: 24,
                  color: activeIncidents > 0 ? '#ea580c' : '#22c55e',
                }}
              />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                mb: 1,
                color: activeIncidents > 0 ? '#ea580c' : '#22c55e',
              }}
            >
              {activeIncidents}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {activeIncidents === 0 ? 'All resolved' : 'Require attention'}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box>
        <Card sx={{ borderRadius: '12px', height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Policies
              </Typography>
              <Shield sx={{ fontSize: 24, color: '#3b82f6' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
              {policiesActive}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Active Policies
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default SecurityMetrics;
