// AtonixCorp – Enterprise Entry Route Guard
// Resolves the user's organization context before entering the Enterprise section.
// Rules:
//   • No org    → show org-switcher with empty state (dialog is optional / dismissible)
//   • 1 org     → redirect to /enterprise/:slug/overview
//   • Many orgs → show org-switcher (choose which org to open)

import React, { useEffect, useState } from 'react';
import {
  Box, Typography, CircularProgress, Paper, Avatar,
  Button, Chip, Divider,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddIcon from '@mui/icons-material/Add';
import { Navigate, useNavigate } from 'react-router-dom';
import { enterpriseEntryApi } from '../services/enterpriseApi';
import type { OrgData } from '../services/enterpriseApi';
import { dashboardTokens, dashboardSemanticColors } from '../styles/dashboardDesignSystem';
import CreateOrganizationDialog from '../components/CreateOrganizationDialog';

const T = {
  bg:     dashboardTokens.colors.background,
  card:   dashboardTokens.colors.surface,
  card2:  dashboardTokens.colors.surfaceSubtle,
  border: dashboardTokens.colors.border,
  text:   dashboardTokens.colors.textPrimary,
  sub:    dashboardTokens.colors.textSecondary,
  brand:  dashboardTokens.colors.brandPrimary,
  green:  dashboardSemanticColors.success,
  font:   '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

type State = 'loading' | 'single' | 'switcher' | 'error';

export default function EnterpriseEntryRoute() {
  const navigate                    = useNavigate();
  const [state, setState]           = useState<State>('loading');
  const [orgs,  setOrgs]            = useState<OrgData[]>([]);
  const [singleSlug, setSingleSlug] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    enterpriseEntryApi.resolve()
      .then(({ organizations }) => {
        if (cancelled) return;
        setOrgs(organizations);
        if (organizations.length === 1) {
          setSingleSlug(organizations[0].slug);
          setState('single');
        } else {
          // 0 orgs: show empty state — dialog opens only when user clicks the button
          // 2+ orgs: switcher to choose one
          setState('switcher');
        }
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });

    return () => { cancelled = true; };
  }, []);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (state === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: T.brand }} />
      </Box>
    );
  }

  // ── Single org → go directly to dashboard ────────────────────────────────
  if (state === 'single') {
    return <Navigate to={`/enterprise/${singleSlug}/overview`} replace />;
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (state === 'error') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: 2 }}>
        <Typography sx={{ color: T.sub }}>Failed to load your organizations.</Typography>
        <Button variant="outlined" onClick={() => setState('loading')} sx={{ borderColor: T.brand, color: T.brand }}>
          Retry
        </Button>
      </Box>
    );
  }

  // ── Multiple orgs → org switcher ─────────────────────────────────────────
  return (
    <Box sx={{
      minHeight: '100vh', bgcolor: T.bg, display: 'flex',
      alignItems: 'center', justifyContent: 'center', p: 3,
    }}>
      <Box sx={{ width: '100%', maxWidth: 520 }}>

        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: `${T.brand}18`, borderRadius: '50%', p: 2, mb: 2,
          }}>
            <BusinessIcon sx={{ color: T.brand, fontSize: '2rem' }} />
          </Box>
          <Typography sx={{ color: T.text, fontWeight: 800, fontSize: '1.6rem', fontFamily: T.font, mb: 0.5 }}>
            {orgs.length === 0 ? 'Welcome to Enterprise' : 'Choose an organization'}
          </Typography>
          <Typography sx={{ color: T.sub }}>
            {orgs.length === 0
              ? 'Create your first organization to get started, or explore the platform.'
              : 'Select an organization to continue, or create a new one.'}
          </Typography>
        </Box>

        <Paper sx={{ bgcolor: T.card, border: `1px solid ${T.border}`, borderRadius: 2, overflow: 'hidden' }}>
          {orgs.length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <BusinessIcon sx={{ color: T.sub, fontSize: '3rem', opacity: 0.4, mb: 1 }} />
              <Typography sx={{ color: T.sub, mb: 2 }}>No organizations yet.</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateOpen(true)}
                sx={{ bgcolor: T.brand, '&:hover': { bgcolor: T.brand, opacity: 0.9 } }}
              >
                Create your first organization
              </Button>
            </Box>
          )}
          {orgs.map((org, idx) => (
            <React.Fragment key={org.id}>
              {idx > 0 && <Divider sx={{ borderColor: T.border }} />}
              <Box
                onClick={() => navigate(`/enterprise/${org.slug}/overview`)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 2, p: 2.5, cursor: 'pointer',
                  transition: 'all .15s',
                  '&:hover': { bgcolor: `${T.brand}08` },
                }}>
                <Avatar sx={{ bgcolor: T.brand, fontWeight: 800, width: 44, height: 44 }}>
                  {org.name.slice(0, 2).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ color: T.text, fontWeight: 700, fontSize: '1rem', fontFamily: T.font }}>{org.name}</Typography>
                  <Typography variant="caption" sx={{ color: T.sub, display: 'block' }}>
                    {org.primary_domain || org.slug}
                    {org.industry ? ` · ${org.industry}` : ''}
                    {org.country ? ` · ${org.country}` : ''}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                  <Chip
                    label={org.status}
                    size="small"
                    sx={{
                      bgcolor: org.status === 'ACTIVE' ? `${T.green}22` : `${T.sub}22`,
                      color:   org.status === 'ACTIVE' ? T.green : T.sub,
                      fontWeight: 700, fontSize: '.7rem',
                    }}
                  />
                  <ArrowForwardIcon sx={{ color: T.sub, fontSize: '1.1rem' }} />
                </Box>
              </Box>
            </React.Fragment>
          ))}
        </Paper>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
            sx={{ color: T.sub, '&:hover': { color: T.brand } }}>
            Create a new organization
          </Button>
        </Box>
      </Box>

      {/* Create org dialog – always dismissible */}
      <CreateOrganizationDialog
        open={createOpen}
        onSuccess={slug => navigate(`/enterprise/${slug}/overview`, { replace: true })}
        onClose={() => setCreateOpen(false)}
      />
    </Box>
  );
}
