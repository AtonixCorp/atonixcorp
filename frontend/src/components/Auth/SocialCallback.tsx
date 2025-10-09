import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { SocialProvider } from '../../types/auth';

interface SocialCallbackProps {
  provider: SocialProvider;
}

const SocialCallback: React.FC<SocialCallbackProps> = ({ provider }) => {
  const navigate = useNavigate();
  const { socialLogin } = useAuth();
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await socialLogin(provider);
        // Redirect to dashboard or home page after successful login
        navigate('/');
      } catch (err) {
        console.error(`${provider} callback error:`, err);
        setError(err instanceof Error ? err.message : `${provider} login failed`);
        
        // Redirect back to login after a delay
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    };

    handleCallback();
  }, [provider, socialLogin, navigate]);

  if (error) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '50vh',
          px: 3,
        }}
      >
        <Alert severity="error" sx={{ mb: 3, maxWidth: 400 }}>
          <Typography variant="body1">
            {error}
          </Typography>
        </Alert>
        <Typography variant="body2" color="text.secondary">
          Redirecting you back to the home page...
        </Typography>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '50vh' 
      }}
    >
      <CircularProgress size={60} sx={{ mb: 3 }} />
      <Typography variant="h6" sx={{ mb: 1 }}>
        Completing {provider} login...
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Please wait while we verify your account
      </Typography>
    </Box>
  );
};

export default SocialCallback;