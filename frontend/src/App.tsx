import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';

// Context
import { CustomThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import DashboardLayout from './components/Layout/DashboardLayout';

// Observability
import { initializeOpenTelemetry } from './observability/telemetry';
import { TelemetryErrorBoundary } from './observability/hooks';

// Pages
import HomePage from './pages/HomePage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import TeamsPage from './pages/TeamsPage';
import TeamDetailPage from './pages/TeamDetailPage';
import FocusAreasPage from './pages/FocusAreasPage';
import FocusAreaDetailPage from './pages/FocusAreaDetailPage';
import ResourcesPage from './pages/ResourcesPage';
import CommunityPage from './pages/CommunityPage';
import ContactPage from './pages/ContactPage';
import Dashboard from './pages/Dashboard';
import UnifiedRegistrationPage from './pages/UnifiedRegistrationPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';

// Dashboard Pages
import AnalyticsPage from './pages/AnalyticsPage';
import TasksPage from './pages/TasksPage';
import SettingsPage from './pages/SettingsPage';
import SchedulePage from './pages/SchedulePage';
import SecurityPage from './pages/SecurityPage';
import ProfilePage from './pages/ProfilePage';
import MyProjectsPage from './pages/MyProjectsPage';
import ProjectAnalyticsPage from './pages/ProjectAnalyticsPage';
import HelpPage from './pages/HelpPage';
import DashboardTeamsPage from './pages/DashboardTeamsPage';
import ManagementDashboard from './pages/ManagementDashboard';
import AdminLoginPage from './pages/AdminLoginPage';

// Enterprise Components
import CompanyDashboard from './components/Enterprise/CompanyDashboard';
import TeamDashboard from './components/Enterprise/TeamDashboard';
import UserManagement from './components/Enterprise/UserManagement';
import GroupUserDashboard from './components/Enterprise/GroupUserDashboard';
import DataReports from './components/Enterprise/DataReports';
import DataMigration from './components/Enterprise/DataMigration';
import ModelRepository from './components/Enterprise/ModelRepository';
import MonitoringModule from './components/Enterprise/MonitoringModule';
import AuditLogs from './components/Enterprise/AuditLogs';
import FederationManagement from './components/Enterprise/FederationManagement';
import EnterpriseLayout from './components/Enterprise/EnterpriseLayout';

// Team Pages
import TeamDashboardPage from './pages/TeamDashboardPage';
import TeamAdminPage from './pages/TeamAdminPage';
import TeamLoginPage from './pages/TeamLoginPage';
import TeamUpgradePage from './pages/TeamUpgradePage';

// Auth Components
import SocialCallback from './components/Auth/SocialCallback';
import OrganizationRegistration from './components/Auth/OrganizationRegistration';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
};

// Dashboard Route Component - Redirects registered organizations to enterprise dashboard
const DashboardRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isOrganizationRegistered, isLoading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/');
      } else if (isOrganizationRegistered) {
        // Redirect registered organizations to enterprise dashboard
        navigate('/dashboard/enterprise');
      }
    }
  }, [isAuthenticated, isOrganizationRegistered, isLoading, navigate]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Only show regular dashboard for unregistered organizations
  return isOrganizationRegistered ? null : <>{children}</>;
};

// Organization Route Component
const OrganizationRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isOrganizationRegistered, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showRegistration, setShowRegistration] = useState(false);

  React.useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/');
      } else if (!isOrganizationRegistered) {
        setShowRegistration(true);
      }
    }
  }, [isAuthenticated, isOrganizationRegistered, isLoading, navigate]);

  const handleRegistrationSuccess = () => {
    setShowRegistration(false);
    navigate('/dashboard/enterprise');
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!isOrganizationRegistered) {
    return (
      <>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
            Organization Registration Required
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            To access the enterprise dashboard, your organization must be registered.
            Please complete the registration process below.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => setShowRegistration(true)}
            sx={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1e293b 100%)',
              px: 4,
              py: 2,
            }}
          >
            Register Organization
          </Button>
        </Box>
        <OrganizationRegistration
          open={showRegistration}
          onClose={() => setShowRegistration(false)}
          onSuccess={handleRegistrationSuccess}
        />
      </>
    );
  }

  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isLoading && (!isAuthenticated || (!((user as any)?.is_admin) && (user as any)?.role !== 'admin'))) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return isAuthenticated && ((user as any)?.is_admin || (user as any)?.role === 'admin') ? <>{children}</> : null;
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
              <Header />
              <Box component="main" sx={{ flex: 1 }}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<UnifiedRegistrationPage />} />
                  <Route path="/register/individual" element={<UnifiedRegistrationPage />} />
                  <Route path="/register/organization" element={<UnifiedRegistrationPage />} />
                  <Route path="/dashboard" element={
                    <DashboardRoute>
                      <Dashboard />
                    </DashboardRoute>
                  } />
                  <Route path="/dashboard/analytics" element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <AnalyticsPage />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/tasks" element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <TasksPage />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/teams" element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <DashboardTeamsPage />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/settings" element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <SettingsPage />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/schedule" element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <SchedulePage />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/security" element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <SecurityPage />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/profile" element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <ProfilePage />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/projects" element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <MyProjectsPage />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/project-analytics" element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <ProjectAnalyticsPage />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/help" element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <HelpPage />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/enterprise" element={
                    <OrganizationRoute>
                      <EnterpriseLayout>
                        <CompanyDashboard />
                      </EnterpriseLayout>
                    </OrganizationRoute>
                  } />
                  <Route path="/dashboard/enterprise/team" element={
                    <OrganizationRoute>
                      <EnterpriseLayout>
                        <TeamDashboard />
                      </EnterpriseLayout>
                    </OrganizationRoute>
                  } />
                  <Route path="/dashboard/enterprise/users" element={
                    <OrganizationRoute>
                      <EnterpriseLayout>
                        <UserManagement />
                      </EnterpriseLayout>
                    </OrganizationRoute>
                  } />
                  <Route path="/dashboard/enterprise/groups" element={
                    <OrganizationRoute>
                      <EnterpriseLayout>
                        <GroupUserDashboard />
                      </EnterpriseLayout>
                    </OrganizationRoute>
                  } />
                  <Route path="/dashboard/enterprise/reports" element={
                    <OrganizationRoute>
                      <EnterpriseLayout>
                        <DataReports />
                      </EnterpriseLayout>
                    </OrganizationRoute>
                  } />
                  <Route path="/dashboard/enterprise/migration" element={
                    <OrganizationRoute>
                      <EnterpriseLayout>
                        <DataMigration />
                      </EnterpriseLayout>
                    </OrganizationRoute>
                  } />
                  <Route path="/dashboard/enterprise/models" element={
                    <OrganizationRoute>
                      <EnterpriseLayout>
                        <ModelRepository />
                      </EnterpriseLayout>
                    </OrganizationRoute>
                  } />
                  <Route path="/dashboard/enterprise/monitoring" element={
                    <OrganizationRoute>
                      <EnterpriseLayout>
                        <MonitoringModule />
                      </EnterpriseLayout>
                    </OrganizationRoute>
                  } />
                  <Route path="/dashboard/enterprise/audit" element={
                    <OrganizationRoute>
                      <EnterpriseLayout>
                        <AuditLogs />
                      </EnterpriseLayout>
                    </OrganizationRoute>
                  } />
                  <Route path="/dashboard/enterprise/federation" element={
                    <OrganizationRoute>
                      <EnterpriseLayout>
                        <FederationManagement />
                      </EnterpriseLayout>
                    </OrganizationRoute>
                  } />
                  <Route path="/admin" element={
                    <AdminRoute>
                      <DashboardLayout>
                        <ManagementDashboard />
                      </DashboardLayout>
                    </AdminRoute>
                  } />
                  <Route path="/admin/login" element={<AdminLoginPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/projects/:slug" element={<ProjectDetailPage />} />
                  <Route path="/teams" element={<TeamsPage />} />
                  <Route path="/teams/:slug" element={<TeamDetailPage />} />
                  <Route path="/teams/:slug/dashboard" element={
                    <ProtectedRoute>
                      <TeamDashboardPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/teams/:slug/admin" element={
                    <ProtectedRoute>
                      <TeamAdminPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/teams/:slug/login" element={<TeamLoginPage />} />
                  <Route path="/teams/:slug/upgrade" element={
                    <ProtectedRoute>
                      <TeamUpgradePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/focus-areas" element={<FocusAreasPage />} />
                  <Route path="/focus-areas/:slug" element={<FocusAreaDetailPage />} />
                  <Route path="/resources" element={<ResourcesPage />} />
                  <Route path="/community" element={<CommunityPage />} />
                  <Route path="/contact" element={<ContactPage />} />

                  {/* OAuth Callback Routes */}
                  <Route path="/auth/github/callback" element={<SocialCallback provider="github" />} />
                  <Route path="/auth/google/callback" element={<SocialCallback provider="google" />} />
                  <Route path="/auth/gitlab/callback" element={<SocialCallback provider="gitlab" />} />
                  <Route path="/auth/linkedin/callback" element={<SocialCallback provider="linkedin" />} />
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
