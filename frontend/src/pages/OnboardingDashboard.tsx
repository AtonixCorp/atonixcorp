// AtonixCorp Cloud – Onboarding Dashboard Page

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, Stack, Alert, Snackbar,
  Breadcrumbs, Link,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';

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
    <Box
      sx={{
        minHeight: '100vh',
        background: '#f8fafc',
        pb: 8,
      }}
    >
      <Container maxWidth="xl" sx={{ pt: { xs: 3, md: 4 } }}>

        {/* Breadcrumb */}
        <Breadcrumbs sx={{ mb: 2.5, '& .MuiBreadcrumbs-separator': { color: '#94a3b8' } }}>
          <Link href="/" underline="hover" sx={{ color: '#64748b', fontSize: '.8rem' }}>
            Home
          </Link>
          <Stack direction="row" alignItems="center" spacing={.5}>
            <DashboardIcon sx={{ fontSize: '.85rem', color: '#14b8a6' }} />
            <Typography fontSize=".8rem" color="#14b8a6" fontWeight={600}>Dashboard</Typography>
          </Stack>
        </Breadcrumbs>

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
              bgcolor: toast.type === 'success' ? 'rgba(20,184,166,.08)' : undefined,
              border: `1px solid ${toast.type === 'success' ? 'rgba(20,184,166,.4)' : 'rgba(244,63,94,.4)'}`,
              color: toast.type === 'success' ? '#0f766e' : undefined,
            }}
          >
            {toast.msg}
          </Alert>
        ) : <span />}
      </Snackbar>
    </Box>
  );
};

const SectionHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography
    fontWeight={700}
    fontSize=".8rem"
    letterSpacing=".08em"
    textTransform="uppercase"
    sx={{ color: '#64748b', mb: 1.5 }}
  >
    {children}
  </Typography>
);

export default OnboardingDashboard;
