import React from 'react';
import { useNavigate } from 'react-router-dom';
import HomePage from './HomePage';

/**
 * UnifiedRegistrationPage redirects to HomePage
 * This page is kept for backward compatibility with routing
 * All registration functionality is now integrated into HomePage
 */
const UnifiedRegistrationPage: React.FC = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    // Redirect to home page which contains all registration functionality
    navigate('/', { replace: true });
  }, [navigate]);

  return <HomePage />;
};

export default UnifiedRegistrationPage;
