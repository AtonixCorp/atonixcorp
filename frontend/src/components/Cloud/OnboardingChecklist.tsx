// AtonixCorp Cloud – Onboarding Checklist (AWS-style)

import React, { useState } from 'react';
import {
  Box, Typography, Paper, Stack, Chip, Button,
  LinearProgress, Tooltip, Collapse, IconButton,
  CircularProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useNavigate } from 'react-router-dom';
import { OnboardingProgress, OnboardingStepDef } from '../../types/cloud';
import { onboardingApi } from '../../services/cloudApi';

interface OnboardingChecklistProps {
  progress: OnboardingProgress | null;
  loading: boolean;
  onRefresh: () => void;
}

const STEPS: OnboardingStepDef[] = [
  {
    key: 'verify_email',
    label: 'Verify Account Email',
    description: 'Confirm your email address to activate your account and receive important notifications.',
    actionLabel: 'Verified automatically',
  },
  {
    key: 'add_ssh_key',
    label: 'Add SSH Key',
    description: 'Upload your public SSH key to securely connect to virtual machines via terminal.',
    actionLabel: 'Add SSH Key',
    actionPath: '/dashboard/account/ssh-keys',
  },
  {
    key: 'create_vm',
    label: 'Create Your First VM',
    description: 'Deploy a virtual machine in seconds. Choose your OS, size, and region.',
    actionLabel: 'Create VM',
    actionPath: '/dashboard/compute/create',
  },
  {
    key: 'configure_network',
    label: 'Configure Networking',
    description: 'Set up a Virtual Private Cloud (VPC) to isolate and secure your resources.',
    actionLabel: 'Configure Network',
    actionPath: '/dashboard/networking',
  },
  {
    key: 'attach_volume',
    label: 'Attach a Volume',
    description: 'Create and attach a persistent block storage volume to your VM for data.',
    actionLabel: 'Create Volume',
    actionPath: '/dashboard/storage',
  },
  {
    key: 'explore_dashboard',
    label: 'Explore the Dashboard',
    description: 'Familiarise yourself with monitoring, billing, and team management features.',
    actionLabel: 'Mark Complete',
  },
];

const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({ progress, loading, onRefresh }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(true);
  const [marking, setMarking] = useState<string | null>(null);

  const pct = progress?.completion_pct ?? 0;
  const allDone = pct === 100;

  const isComplete = (key: string) =>
    progress ? (progress as any)[key] === true : false;

  const handleMark = async (key: string) => {
    if (marking) return;
    setMarking(key);
    try {
      await onboardingApi.updateChecklist({ [key]: true } as any);
      onRefresh();
    } catch (e) {
      console.error('Failed to update checklist', e);
    } finally {
      setMarking(null);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: allDone ? 'rgba(20,184,166,.4)' : 'rgba(255,255,255,.08)',
        borderRadius: 3,
        overflow: 'hidden',
        background: '#0b1220',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,.06)',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded((p) => !p)}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h6" fontWeight={700} color="#fff" fontSize="1rem">
            Getting Started Checklist
          </Typography>
          <Chip
            label={`${pct}% Complete`}
            size="small"
            sx={{
              bgcolor: allDone ? 'rgba(20,184,166,.2)' : 'rgba(255,255,255,.07)',
              color: allDone ? '#14b8a6' : '#9ca3af',
              fontWeight: 700, fontSize: '.7rem',
            }}
          />
        </Stack>
        <IconButton size="small" sx={{ color: '#9ca3af' }}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      {/* Progress bar */}
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 3,
          bgcolor: 'rgba(255,255,255,.06)',
          '& .MuiLinearProgress-bar': { bgcolor: '#14b8a6' },
        }}
      />

      <Collapse in={expanded}>
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress size={28} sx={{ color: '#14b8a6' }} />
          </Box>
        ) : (
          <Stack divider={<Box sx={{ borderTop: '1px solid rgba(255,255,255,.05)' }} />}>
            {STEPS.map((step) => {
              const done = isComplete(step.key as string);
              return (
                <Box
                  key={step.key}
                  sx={{
                    px: 3, py: 2, display: 'flex', alignItems: 'flex-start',
                    gap: 2, opacity: done ? 0.65 : 1,
                    transition: 'opacity .2s',
                  }}
                >
                  {done ? (
                    <CheckCircleIcon sx={{ color: '#14b8a6', mt: .3, flexShrink: 0 }} />
                  ) : (
                    <RadioButtonUncheckedIcon sx={{ color: '#4b5563', mt: .3, flexShrink: 0 }} />
                  )}

                  <Box sx={{ flex: 1 }}>
                    <Typography
                      fontWeight={600}
                      sx={{
                        color: done ? '#6b7280' : '#e6eef7',
                        textDecoration: done ? 'line-through' : 'none',
                        fontSize: '.92rem',
                      }}
                    >
                      {step.label}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9ca3af', mt: .3, lineHeight: 1.5 }}>
                      {step.description}
                    </Typography>
                  </Box>

                  {!done && (
                    <Tooltip title={step.description}>
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={marking === step.key}
                        onClick={() => {
                          if (step.actionPath) {
                            navigate(step.actionPath);
                          } else {
                            handleMark(step.key as string);
                          }
                        }}
                        sx={{
                          borderColor: 'rgba(20,184,166,.4)', color: '#14b8a6',
                          fontWeight: 600, fontSize: '.78rem', borderRadius: 1.5,
                          whiteSpace: 'nowrap', flexShrink: 0,
                          '&:hover': { borderColor: '#14b8a6', bgcolor: 'rgba(20,184,166,.08)' },
                        }}
                      >
                        {marking === step.key
                          ? <CircularProgress size={14} sx={{ color: '#14b8a6' }} />
                          : step.actionLabel}
                      </Button>
                    </Tooltip>
                  )}
                </Box>
              );
            })}
          </Stack>
        )}
      </Collapse>
    </Paper>
  );
};

export default OnboardingChecklist;
