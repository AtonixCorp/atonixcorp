import React, { useEffect } from 'react';
import { Box, Container, Paper, Typography, Stepper, Step, StepLabel, Button, Alert } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useAuth } from '../../contexts/AuthContext';

// Import onboarding components
import AccountCreationForm from './AccountCreationForm';
import ProjectInitialization from './ProjectInitialization';
import OnboardingChecklist from './OnboardingChecklist';
import FirstDeploymentWizard from './FirstDeploymentWizard';
import GroundingLayer from './GroundingLayer';
import PostDeploymentSurface from './PostDeploymentSurface';

const steps = [
  'Create Account',
  'Initialize Project',
  'Complete Checklist',
  'Deploy First Instance',
  'Explore Dashboard',
  'Advanced Features'
];

const OnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth() as any;
  const { state, actions } = useOnboarding();

  // Determine current phase from URL or state
  useEffect(() => {
    const pathPhase = getPhaseFromPath(location.pathname);
    if (pathPhase && pathPhase !== state.currentPhase) {
      actions.setCurrentPhase(pathPhase);
    }
  }, [location.pathname, state.currentPhase, actions]);

  // Redirect to appropriate phase based on completion
  useEffect(() => {
    if (!user) {
      navigate('/onboarding/account');
      return;
    }

    // If user is logged in but hasn't completed account creation
    if (!state.accountData && state.currentPhase > 1) {
      navigate('/onboarding/account');
      return;
    }

    // If account is created but no project, go to project init
    if (state.accountData && !state.projectData && state.currentPhase > 2) {
      navigate('/onboarding/project');
      return;
    }

    // Auto-advance based on completion status
    if (state.accountData && !state.completedPhases.includes(1)) {
      actions.completePhase(1);
    }
    if (state.projectData && !state.completedPhases.includes(2)) {
      actions.completePhase(2);
    }
  }, [user, state, actions, navigate]);

  const getPhaseFromPath = (path: string): number | null => {
    if (path.includes('/account')) return 1;
    if (path.includes('/project')) return 2;
    if (path.includes('/checklist')) return 3;
    if (path.includes('/deploy')) return 4;
    if (path.includes('/dashboard')) return 5;
    if (path.includes('/advanced')) return 6;
    return null;
  };

  const handlePhaseComplete = (phase: number, data?: any) => {
    actions.completePhase(phase);

    // Store data based on phase
    switch (phase) {
      case 1:
        if (data) actions.updateAccountData(data);
        navigate('/onboarding/project');
        break;
      case 2:
        if (data) actions.updateProjectData(data);
        navigate('/onboarding/checklist');
        break;
      case 3:
        navigate('/onboarding/deploy');
        break;
      case 4:
        if (data) actions.updateDeploymentData(data);
        navigate('/onboarding/dashboard');
        break;
      case 5:
        navigate('/onboarding/advanced');
        break;
      case 6:
        // Onboarding complete - redirect to main dashboard
        navigate('/dashboard');
        break;
    }
  };

  const handleSkipToDashboard = () => {
    navigate('/dashboard');
  };

  const renderCurrentPhase = () => {
    switch (state.currentPhase) {
      case 1:
        return (
          <AccountCreationForm
            onComplete={(data) => handlePhaseComplete(1, data)}
            initialData={state.accountData || undefined}
          />
        );
      case 2:
        return (
          <ProjectInitialization
            onComplete={(data) => handlePhaseComplete(2, data)}
          />
        );
      case 3:
        return (
          <OnboardingChecklist
            onComplete={() => handlePhaseComplete(3)}
          />
        );
      case 4:
        return (
          <FirstDeploymentWizard
            onComplete={() => handlePhaseComplete(4)}
          />
        );
      case 5:
        return (
          <GroundingLayer
            onComplete={() => handlePhaseComplete(5)}
          />
        );
      case 6:
        return (
          <PostDeploymentSurface
            onComplete={() => handlePhaseComplete(6)}
          />
        );
      default:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h5" gutterBottom>
              Onboarding Complete! 🎉
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              You're all set to start building with AtonixCorp Cloud.
            </Typography>
            <Button variant="contained" size="large" onClick={handleSkipToDashboard}>
              Go to Dashboard
            </Button>
          </Box>
        );
    }
  };

  // Don't show stepper for account creation (phase 1)
  const showStepper = state.currentPhase > 1;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {showStepper && (
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom align="center">
              AtonixCorp Cloud Onboarding
            </Typography>
            <Stepper activeStep={state.currentPhase - 1} sx={{ mb: 2 }}>
              {steps.map((label, index) => (
                <Step key={label} completed={state.completedPhases.includes(index + 1)}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Step {state.currentPhase} of {steps.length}
              </Typography>
              <Button variant="outlined" onClick={handleSkipToDashboard}>
                Skip to Dashboard
              </Button>
            </Box>
          </Paper>
        )}

        {state.error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {state.error}
          </Alert>
        )}

        {renderCurrentPhase()}
      </Container>
    </Box>
  );
};

export default OnboardingFlow;
