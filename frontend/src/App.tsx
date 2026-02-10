import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';

// Context
import { CustomThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';

// Observability
import { initializeOpenTelemetry } from './observability/telemetry';
import { TelemetryErrorBoundary } from './observability/hooks';

// Components
import CloudPlatformHeader from './components/Layout/CloudPlatformHeader';

// Pages
import EnhancedHomepage from './pages/EnhancedHomepage';
import FeaturesPage from './pages/FeaturesPage';
import DocsPage from './pages/DocsPage';
import AboutPage from './pages/AboutPage';

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
                  <Route path="/" element={<EnhancedHomepage />} />
                  <Route path="/features" element={<FeaturesPage />} />
                  <Route path="/docs" element={<DocsPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/resources" element={<DocsPage />} />
                  <Route path="/support" element={<DocsPage />} />
                  <Route path="/contact" element={<AboutPage />} />
                  <Route path="/account" element={<AboutPage />} />
                  <Route path="*" element={<EnhancedHomepage />} />
                </Routes>
              </Box>
            </Box>
          </Router>
        </AuthProvider>
      </TelemetryErrorBoundary>
    </CustomThemeProvider>
  );
}

export default App;
