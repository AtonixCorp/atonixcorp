import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  PlayArrow as StartIcon,
  Lock as LockIcon,
  VpnKey as KeyIcon,
  Computer as ComputerIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkIcon,
  CloudUpload as CloudIcon,
  Code as CodeIcon,
  Terminal as TerminalIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Button as DSButton } from '../design-system/Button';
import { Card as DSCard } from '../design-system/Card';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  locked: boolean;
  action: string;
  route?: string;
  estimatedTime: string;
}

interface OnboardingChecklistProps {
  projectId: string;
  onComplete: () => void;
}

export const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({ projectId, onComplete }) => {
  const navigate = useNavigate();
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([
    {
      id: 'ssh-key',
      title: 'Add SSH Key',
      description: 'Securely connect to your instances with SSH key authentication',
      icon: <KeyIcon />,
      completed: false,
      locked: false,
      action: 'Add SSH Key',
      route: '/developer/ssh-keys',
      estimatedTime: '2 min',
    },
    {
      id: 'first-instance',
      title: 'Create First Instance',
      description: 'Launch your first virtual machine in the cloud',
      icon: <ComputerIcon />,
      completed: false,
      locked: false,
      action: 'Create Instance',
      route: '/developer/compute/instances/create',
      estimatedTime: '5 min',
    },
    {
      id: 'first-volume',
      title: 'Create First Volume',
      description: 'Add persistent storage to your instances',
      icon: <StorageIcon />,
      completed: false,
      locked: true,
      action: 'Create Volume',
      route: '/developer/storage/volumes/create',
      estimatedTime: '3 min',
    },
    {
      id: 'private-network',
      title: 'Create Private Network',
      description: 'Set up isolated networking for your resources',
      icon: <NetworkIcon />,
      completed: false,
      locked: true,
      action: 'Create Network',
      route: '/developer/networking/networks/create',
      estimatedTime: '4 min',
    },
    {
      id: 'object-storage',
      title: 'Explore Object Storage',
      description: 'Store and serve files, backups, and static content',
      icon: <CloudIcon />,
      completed: false,
      locked: true,
      action: 'Explore Storage',
      route: '/developer/storage/object-storage',
      estimatedTime: '3 min',
    },
    {
      id: 'api-token',
      title: 'Generate API Token',
      description: 'Create API credentials for automation and integrations',
      icon: <CodeIcon />,
      completed: false,
      locked: true,
      action: 'Generate Token',
      route: '/developer/settings/api-tokens',
      estimatedTime: '2 min',
    },
    {
      id: 'cli-tools',
      title: 'Install CLI Tools',
      description: 'Set up command-line tools for advanced management',
      icon: <TerminalIcon />,
      completed: false,
      locked: true,
      action: 'Install CLI',
      route: '/developer/tools/cli',
      estimatedTime: '5 min',
    },
  ]);

  // Simulate progress updates (in real app, this would come from API)
  useEffect(() => {
    const interval = setInterval(() => {
      setChecklistItems(prev => prev.map(item => {
        if (item.id === 'ssh-key' && Math.random() > 0.8) {
          return { ...item, completed: true };
        }
        if (item.id === 'first-instance' && Math.random() > 0.9) {
          return { ...item, completed: true };
        }
        return item;
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Update locked status based on completion
  useEffect(() => {
    setChecklistItems(prev => prev.map((item, index) => {
      if (index === 0) return { ...item, locked: false }; // First item always unlocked

      const previousItem = prev[index - 1];
      return {
        ...item,
        locked: !previousItem.completed,
      };
    }));
  }, [checklistItems]);

  const completedCount = checklistItems.filter(item => item.completed).length;
  const totalCount = checklistItems.length;
  const progress = (completedCount / totalCount) * 100;

  const handleAction = (item: ChecklistItem) => {
    if (item.locked) return;

    if (item.route) {
      navigate(item.route);
    } else {
      // Handle other actions
      console.log(`Starting ${item.id}`);
    }
  };

  const allCompleted = completedCount === totalCount;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <DSCard variant="form" title="Welcome to Your Project!">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Complete these steps to get started with AtonixCorp Cloud
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Follow this guided checklist to explore the platform and set up your infrastructure.
            Each step builds on the previous one to ensure a smooth onboarding experience.
          </Typography>

          {/* Progress Overview */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" fontWeight="medium">
                Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {completedCount} of {totalCount} completed
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                },
              }}
            />
          </Box>

          {/* Checklist Items */}
          <List sx={{ width: '100%' }}>
            {checklistItems.map((item, index) => (
              <ListItem
                key={item.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 2,
                  bgcolor: item.completed ? 'success.light' : 'background.paper',
                  opacity: item.locked ? 0.6 : 1,
                }}
              >
                <ListItemIcon sx={{ color: item.completed ? 'success.main' : item.locked ? 'text.disabled' : 'primary.main' }}>
                  {item.completed ? <CheckCircleIcon /> : item.locked ? <LockIcon /> : <UncheckedIcon />}
                </ListItemIcon>

                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {item.title}
                      </Typography>
                      <Chip
                        size="small"
                        label={item.estimatedTime}
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  }
                />

                <ListItemSecondaryAction>
                  <Tooltip title={item.locked ? 'Complete previous steps first' : item.action}>
                    <span>
                      <IconButton
                        edge="end"
                        onClick={() => handleAction(item)}
                        disabled={item.locked}
                        color={item.completed ? 'success' : 'primary'}
                      >
                        {item.completed ? <CheckCircleIcon /> : <StartIcon />}
                      </IconButton>
                    </span>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>

          {/* Completion Message */}
          {allCompleted && (
            <DSCard variant="dashboard" sx={{ mt: 3, bgcolor: 'success.light', borderColor: 'success.main' }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <CheckCircleIcon sx={{ fontSize: '3rem', color: 'success.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom color="success.main">
                  Congratulations! 🎉
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  You've completed all onboarding steps. You're now ready to build amazing things
                  with AtonixCorp Cloud.
                </Typography>
                <DSButton variant="primary" onClick={onComplete}>
                  Explore Dashboard
                </DSButton>
              </CardContent>
            </DSCard>
          )}

          {/* Quick Actions */}
          {!allCompleted && (
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button variant="outlined" onClick={() => navigate('/developer/dashboard')}>
                Skip to Dashboard
              </Button>
              <DSButton
                variant="primary"
                onClick={() => navigate('/developer/compute/instances/create')}
              >
                Create Your First Instance
              </DSButton>
            </Box>
          )}
        </CardContent>
      </DSCard>
    </Box>
  );
};

export default OnboardingChecklist;
