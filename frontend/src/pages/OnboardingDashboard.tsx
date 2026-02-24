// AtonixCorp Cloud – Dashboard Overview Page

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, Stack, Alert, Snackbar,
  Breadcrumbs, Link, Button,
} from '@mui/material';
import DashboardIcon      from '@mui/icons-material/Dashboard';
import AddIcon            from '@mui/icons-material/Add';
import NavigateNextIcon   from '@mui/icons-material/NavigateNext';

import { useAuth } from '../contexts/AuthContext';
import { onboardingApi, dashboardApi } from '../services/cloudApi';
import { OnboardingProgress, DashboardStats } from '../types/cloud';

import WelcomeHero         from '../components/Cloud/WelcomeHero';
import OnboardingChecklist from '../components/Cloud/OnboardingChecklist';
import CloudOverviewCards  from '../components/Cloud/CloudOverviewCards';
import DeployWizardModal   from '../components/Cloud/DeployWizardModal';
import DocsSupportPanel    from '../components/Cloud/DocsSupportPanel';
import VMListPanel         from '../components/Cloud/VMListPanel';

const OnboardingDashboard: React.FC = () => {
  const { user } = useAuth() as any;

  const [progress, setProgress]   = useState<OnboardingProgress | null>(null);
  const [stats, setStats]         = useState<DashboardStats | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [loadingStats, setLoadingStats]       = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [vmRefreshKey, setVmRefreshKey] = useState(0);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!user) return;
    setLoadingProgress(true);
    try {
      const res = await onboardingApi.getChecklist();
      setProgress(res.data);
    } catch {
      // silently fail – user may not be authenticated yet
    } finally {
      setLoadingProgress(false);
    }
  }, [user]);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    setLoadingStats(true);
    try {
      const res = await dashboardApi.getStats();
      setStats(res.data);
    } catch {
      // silently fail
    } finally {
      setLoadingStats(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProgress();
    fetchStats();
  }, [fetchProgress, fetchStats]);

  const handleDeploySuccess = () => {
    setToast({ msg: 'Server is being provisioned! Check Virtual Machines for status.', type: 'success' });
    setVmRefreshKey(k => k + 1);
    fetchProgress();
    fetchStats();
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', pb: 6 }}>

      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <Box
        sx={{
          bgcolor: '#fff',
          borderBottom: '1px solid #E5E7EB',
          px: { xs: 2, md: 4 },
          pt: 2.5,
          pb: 2,
        }}
      >
        {/* Breadcrumbs — 12px, Graphite Gray */}
        <Breadcrumbs
          separator={<NavigateNextIcon sx={{ fontSize: '.75rem', color: '#9CA3AF' }} />}
          sx={{ mb: 1.5 }}
        >
          <Link
            href="/"
            underline="hover"
            sx={{ fontSize: '12px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            Home
          </Link>
          <Typography
            sx={{ fontSize: '12px', color: '#111827', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <DashboardIcon sx={{ fontSize: '.8rem' }} />
            Dashboard
          </Typography>
        </Breadcrumbs>

        {/* Title row — title left, actions right */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1.5}>
          <Typography
            sx={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#111827',
              letterSpacing: '-.02em',
              lineHeight: 1.2,
            }}
          >
            Dashboard
          </Typography>

          {/* Right-aligned action buttons — primary first */}
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setWizardOpen(true)}
              sx={{
                bgcolor: '#2563EB',
                color: '#fff',
                fontWeight: 500,
                fontSize: '.82rem',
                textTransform: 'none',
                borderRadius: '6px',
                px: 2,
                boxShadow: 'none',
                '&:hover': { bgcolor: '#1D4ED8', boxShadow: 'none' },
              }}
            >
              Deploy Server
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <Container maxWidth="xl" sx={{ pt: 4 }}>
        <Stack spacing={3.5}>

          {/* 1 ── Welcome Hero */}
          <WelcomeHero
            username={user?.username || user?.first_name}
            onDeployClick={() => setWizardOpen(true)}
          />

          {/* 2 ── Onboarding Checklist */}
          {user && (
            <Box>
              <SectionHeading>Getting Started</SectionHeading>
              <OnboardingChecklist
                progress={progress}
                loading={loadingProgress}
                onRefresh={fetchProgress}
              />
            </Box>
          )}

          {/* 3 ── Cloud Resource Overview */}
          <Box>
            <SectionHeading>Cloud Overview</SectionHeading>
            <CloudOverviewCards stats={stats} loading={loadingStats} />
          </Box>

          {/* 4 –– Virtual Machines */}
          <Box>
            <SectionHeading>Virtual Machines</SectionHeading>
            <VMListPanel
              refreshKey={vmRefreshKey}
              onCreateClick={() => setWizardOpen(true)}
            />
          </Box>

          {/* 5 –– Documentation & Support */}
          <Box>
            <SectionHeading>Documentation & Support</SectionHeading>
            <DocsSupportPanel />
          </Box>

        </Stack>
      </Container>

      {/* Deploy Wizard Modal */}
      <DeployWizardModal
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onSuccess={handleDeploySuccess}
      />

      {/* Toast */}
      <Snackbar
        open={!!toast}
        autoHideDuration={5000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {toast ? (
          <Alert
            severity={toast.type}
            onClose={() => setToast(null)}
            sx={{
              bgcolor: toast.type === 'success' ? '#FFFFFF' : undefined,
              border: `1px solid ${toast.type === 'success' ? '#D1D5DB' : 'rgba(239,68,68,.4)'}`,
              color: toast.type === 'success' ? '#111827' : undefined,
            }}
          >
            {toast.msg}
          </Alert>
        ) : <span />}
      </Snackbar>
    </Box>
  );
};

const SectionHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Typography
      fontWeight={700}
      fontSize="12px"
      letterSpacing=".08em"
      textTransform="uppercase"
      sx={{ color: '#6B7280', mb: 1.5 }}
    >
      {children}
    </Typography>
  );
};

export default OnboardingDashboard;
