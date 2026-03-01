import React from 'react';
import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { dashboardSemanticColors, dashboardTokens } from '../styles/dashboardDesignSystem';

const FONT = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
const t = dashboardTokens.colors;

const ZeroTrustPage: React.FC = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, fontFamily: FONT }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
        <Stack direction="row" spacing={1.2} alignItems="center">
          <VerifiedUserIcon sx={{ color: dashboardTokens.colors.brandPrimary }} />
          <Typography sx={{ fontWeight: 800, color: t.textPrimary }}>Zero Trust Access</Typography>
        </Stack>
        <Chip label="No Mock Data" size="small" sx={{ bgcolor: 'rgba(34,197,94,.12)', color: dashboardSemanticColors.success, fontWeight: 700 }} />
      </Stack>

      <Card sx={{ border: `1px solid ${t.border}`, bgcolor: t.surface, boxShadow: 'none' }}>
        <CardContent>
          <Typography sx={{ color: t.textPrimary, fontWeight: 700, mb: 0.8 }}>Real data mode enabled</Typography>
          <Typography sx={{ color: t.textSecondary, fontSize: '.9rem' }}>
            Mock policies, devices, and access logs were removed. Connect this page to zero-trust backend endpoints for live testing.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ZeroTrustPage;
