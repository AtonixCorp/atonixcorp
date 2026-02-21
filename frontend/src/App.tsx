import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';

// Context
import { CustomThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Observability
import { initializeOpenTelemetry } from './observability/telemetry';
import { TelemetryErrorBoundary } from './observability/hooks';

// Components
import CloudPlatformHeader from './components/Layout/CloudPlatformHeader';
import Footer from './components/Layout/Footer';

// Pages
import EnhancedHomepage from './pages/EnhancedHomepage';
import FeaturesPage from './pages/FeaturesPage';
import DocsPage from './pages/DocsPage';
import AboutPage from './pages/AboutPage';
import OnboardingDashboard from './pages/OnboardingDashboard';

// Protected route – redirects to home if not authenticated
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth() as any;
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

function App() {
  useEffect(() => {
    // Initialize telemetry on app startup
    initializeOpenTelemetry();
  }, []);

  return (
    <CustomThemeProvider>
      <TelemetryErrorBoundary componentName="App">
        <AuthProvider>
          <Router>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <CloudPlatformHeader />
              <Box component="main" sx={{ flex: 1 }}>
                <Routes>
                  <Route path="/"          element={<EnhancedHomepage />} />
                  <Route path="/features"  element={<FeaturesPage />} />
                  <Route path="/docs"      element={<DocsPage />} />
                  <Route path="/about"     element={<AboutPage />} />
                  <Route path="/dashboard" element={<ProtectedRoute><OnboardingDashboard /></ProtectedRoute>} />
                  <Route path="/resources" element={<DocsPage />} />
                  <Route path="/support"   element={<DocsPage />} />
                  <Route path="/contact"   element={<AboutPage />} />
                  <Route path="/account"   element={<AboutPage />} />
                  <Route path="*"          element={<EnhancedHomepage />} />
                </Routes>
              </Box>
              <Footer />
            </Box>
          </Router>
        </AuthProvider>
      </TelemetryErrorBoundary>
    </CustomThemeProvider>
  );
}

export default App;
