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
import EnterpriseRegisterPage from './pages/EnterpriseRegisterPage';
import EnterpriseHome from './pages/EnterpriseHome';
import EnterpriseGroups from './pages/EnterpriseGroups';
import EnterpriseTeams from './pages/EnterpriseTeams';
import EnterpriseFocusAreas from './pages/EnterpriseFocusAreas';
import EnterpriseResources from './pages/EnterpriseResources';
import EnterpriseMarketplace from './pages/EnterpriseMarketplace';
import MarketplacePage from './pages/MarketplacePage';
// enterprise prototypes (import specific pages where needed)
import EnterpriseSecurity from './pages/enterprise/EnterpriseSecurity';
import EnterpriseOverview from './pages/enterprise/EnterpriseOverview';
import EnterpriseHelp from './pages/enterprise/EnterpriseHelp';
import OrganizationRegistration from './components/Auth/OrganizationRegistration';

// Enterprise dashboard components (layout + internal components)
import EnterpriseLayout from './components/Enterprise/EnterpriseLayout';
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

// Team pages
import TeamDashboardPage from './pages/TeamDashboardPage';
import TeamAdminPage from './pages/TeamAdminPage';
import TeamLoginPage from './pages/TeamLoginPage';
import TeamUpgradePage from './pages/TeamUpgradePage';

// OAuth callback component
import SocialCallback from './components/Auth/SocialCallback';

// Enterprise prototype pages
import EnterpriseAIAnalyticsPrototype from './pages/enterprise/EnterpriseAIAnalyticsPrototype';
import EnterpriseCloudMigrationChecklist from './pages/enterprise/EnterpriseCloudMigrationChecklist';
import EnterpriseCloudMigrationRuns from './pages/enterprise/EnterpriseCloudMigrationRuns';
import EnterpriseMigrationRunDetails from './pages/enterprise/EnterpriseMigrationRunDetails';

// Route guards and helpers
const _ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate('/');
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

// Backwards-compatible alias used in routes (some files reference ProtectedRoute)
const ProtectedRoute = _ProtectedRoute;

// Dashboard Route: redirect registered organizations to enterprise dashboard
const DashboardRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isOrganizationRegistered, isLoading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) navigate('/');
      else if (isOrganizationRegistered) navigate('/dashboard/enterprise');
    }
  }, [isAuthenticated, isOrganizationRegistered, isLoading, navigate]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!isAuthenticated) return null;
  return isOrganizationRegistered ? null : <>{children}</>;
};

const OrganizationRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isOrganizationRegistered, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showRegistration, setShowRegistration] = useState(false);

  React.useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) navigate('/');
      else if (!isOrganizationRegistered) setShowRegistration(true);
    }
  }, [isAuthenticated, isOrganizationRegistered, isLoading, navigate]);

  const handleRegistrationSuccess = () => { setShowRegistration(false); navigate('/dashboard/enterprise'); };

  if (isLoading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Typography>Loading...</Typography>
    </Box>
  );

  if (!isAuthenticated) return null;

  if (!isOrganizationRegistered) {
    return (
      <>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>Organization Registration Required</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            To access the enterprise dashboard, your organization must be registered. Please complete the registration process below.
          </Typography>
          <Button variant="contained" size="large" onClick={() => setShowRegistration(true)} sx={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1e293b 100%)', px: 4, py: 2 }}>Register Organization</Button>
        </Box>
        <OrganizationRegistration open={showRegistration} onClose={() => setShowRegistration(false)} onSuccess={handleRegistrationSuccess} />
      </>
    );
  }

  return <>{children}</>;
};

const _AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
                    <_ProtectedRoute>
                      <DashboardLayout>
                        <AnalyticsPage />
                      </DashboardLayout>
                    </_ProtectedRoute>
                  } />
                  <Route path="/dashboard/tasks" element={
                    <_ProtectedRoute>
                      <DashboardLayout>
                        <TasksPage />
                      </DashboardLayout>
                    </_ProtectedRoute>
                  } />
                  <Route path="/dashboard/teams" element={
                    <_ProtectedRoute>
                      <DashboardLayout>
                        <DashboardTeamsPage />
                      </DashboardLayout>
                    </_ProtectedRoute>
                  } />
                  <Route path="/dashboard/settings" element={
                    <_ProtectedRoute>
                      <DashboardLayout>
                        <SettingsPage />
                      </DashboardLayout>
                    </_ProtectedRoute>
                  } />
                  <Route path="/dashboard/schedule" element={
                    <_ProtectedRoute>
                      <DashboardLayout>
                        <SchedulePage />
                      </DashboardLayout>
                    </_ProtectedRoute>
                  } />
                  <Route path="/dashboard/security" element={
                    <_ProtectedRoute>
                      <DashboardLayout>
                        <SecurityPage />
                      </DashboardLayout>
                    </_ProtectedRoute>
                  } />
                  <Route path="/dashboard/profile" element={
                    <_ProtectedRoute>
                      <DashboardLayout>
                        <ProfilePage />
                      </DashboardLayout>
                    </_ProtectedRoute>
                  } />
                  <Route path="/dashboard/projects" element={
                    <_ProtectedRoute>
                      <DashboardLayout>
                        <MyProjectsPage />
                      </DashboardLayout>
                    </_ProtectedRoute>
                  } />
                  <Route path="/dashboard/project-analytics" element={
                    <_ProtectedRoute>
                      <DashboardLayout>
                        <ProjectAnalyticsPage />
                      </DashboardLayout>
                    </_ProtectedRoute>
                  } />
                  <Route path="/enterprise/register" element={<EnterpriseRegisterPage />} />
                  <Route path="/enterprise/:id/dashboard" element={
                    <_ProtectedRoute>
                      <EnterpriseHome />
                    </_ProtectedRoute>
                  } />
                  <Route path="/enterprise/:id/overview" element={
                    <_ProtectedRoute>
                      <EnterpriseOverview />
                    </_ProtectedRoute>
                  } />
                  <Route path="/enterprise/:id/users" element={
                    <_ProtectedRoute>
                      <EnterpriseHome />
                    </_ProtectedRoute>
                  } />
                  <Route path="/enterprise/:id/groups" element={
                    <_ProtectedRoute>
                      <EnterpriseGroups />
                    </_ProtectedRoute>
                  } />
                  <Route path="/enterprise/:id/ai-analytics" element={
                    <_ProtectedRoute>
                      <EnterpriseAIAnalyticsPrototype />
                    </_ProtectedRoute>
                  } />
                  <Route path="/enterprise/:id/cloud-migration" element={
                    <_ProtectedRoute>
                      <EnterpriseCloudMigrationChecklist />
                    </_ProtectedRoute>
                  } />
                  <Route path="/enterprise/:id/migration" element={
                    <_ProtectedRoute>
                      <EnterpriseCloudMigrationRuns />
                    </_ProtectedRoute>
                  } />
                  <Route path="/enterprise/:id/migration/run/:runId" element={
                    <_ProtectedRoute>
                      <EnterpriseMigrationRunDetails />
                    </_ProtectedRoute>
                  } />
                  <Route path="/enterprise/:id/security" element={
                    <_ProtectedRoute>
                      <EnterpriseSecurity />
                    </_ProtectedRoute>
                  } />
                  <Route path="/enterprise/:id/help" element={
                    <_ProtectedRoute>
                      <EnterpriseHelp />
                    </_ProtectedRoute>
                  } />
                  <Route path="/enterprise/:id/teams" element={
                    <_ProtectedRoute>
                      <EnterpriseTeams />
                    </_ProtectedRoute>
                  } />
                  <Route path="/enterprise/:id/focus-areas" element={
                    <_ProtectedRoute>
                      <EnterpriseFocusAreas />
                    </_ProtectedRoute>
                  } />
                  <Route path="/enterprise/:id/resources" element={
                    <_ProtectedRoute>
                      <EnterpriseResources />
                    </_ProtectedRoute>
                  } />
                  <Route path="/enterprise/:id/marketplace" element={
                    <_ProtectedRoute>
                      <EnterpriseMarketplace />
                    </_ProtectedRoute>
                  } />
                  <Route path="/dashboard/marketplace" element={
                    <_ProtectedRoute>
                      <DashboardLayout>
                        <MarketplacePage />
                      </DashboardLayout>
                    </_ProtectedRoute>
                  } />
                  <Route path="/dashboard/help" element={
                    <_ProtectedRoute>
                      <DashboardLayout>
                        <HelpPage />
                      </DashboardLayout>
                    </_ProtectedRoute>
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
                    <_AdminRoute>
                      <DashboardLayout>
                        <ManagementDashboard />
                      </DashboardLayout>
                    </_AdminRoute>
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
