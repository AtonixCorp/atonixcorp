import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, BrowserRouter as Router } from 'react-router-dom';
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
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import Dashboard from './pages/Dashboard';
import UnifiedRegistrationPage from './pages/UnifiedRegistrationPage';
import SignupPage from './pages/SignupPage';
import AuthLoginPage from './pages/AuthLoginPage';

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
import EnterpriseOverview, { EnterpriseOverviewDashboard } from './pages/enterprise/EnterpriseOverview';
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

// Conditional Footer Component
const ConditionalFooter: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  // Don't show footer when user is authenticated
  if (isAuthenticated) {
    return null;
  }
  
  return <Footer />;
};

// Route guards and helpers
const ____ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
const ___ProtectedRoute = ____ProtectedRoute;

// Strict Dashboard Separation Routes
const ___IndividualDashboardRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isIndividualUser, isOrganizationUser, isLoading, userDashboardType } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/');
      } else if (userDashboardType === 'organization') {
        // Organization users cannot access individual dashboard
        navigate('/dashboard/enterprise');
      } else if (userDashboardType !== 'individual') {
        // Unknown user type, redirect to home
        navigate('/');
      }
    }
  }, [isAuthenticated, userDashboardType, isLoading, navigate]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  // Only allow individual users to access individual dashboard
  return isAuthenticated && userDashboardType === 'individual' ? <>{children}</> : null;
};

const ___OrganizationDashboardRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isOrganizationUser, userDashboardType, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showRegistration, setShowRegistration] = useState(false);

  React.useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/');
      } else if (userDashboardType === 'individual') {
        // Individual users cannot access organization dashboard
        navigate('/dashboard');
      } else if (userDashboardType !== 'organization') {
        // Unknown user type, redirect to home
        navigate('/');
      }
    }
  }, [isAuthenticated, userDashboardType, isLoading, navigate]);

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

  if (!isAuthenticated) return null;

  // If user is organization type but organization is not registered, show registration
  if (userDashboardType === 'organization' && !isOrganizationUser) {
    return (
      <>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>Organization Registration Required</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            To access the enterprise dashboard, your organization must be registered. Please complete the registration process below.
          </Typography>
          <Button variant="contained" size="large" onClick={() => setShowRegistration(true)} sx={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1e293b 100%)', px: 4, py: 2, color: 'white' }}>Register Organization</Button>
        </Box>
        <OrganizationRegistration open={showRegistration} onClose={() => setShowRegistration(false)} onSuccess={handleRegistrationSuccess} />
      </>
    );
  }

  // Only allow organization users to access organization dashboard
  return isAuthenticated && userDashboardType === 'organization' ? <>{children}</> : null;
};

const ____AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
                  <Route path="/login" element={<AuthLoginPage />} />
                  <Route path="/register" element={<UnifiedRegistrationPage />} />
                  <Route path="/register/individual" element={<UnifiedRegistrationPage />} />
                  <Route path="/register/organization" element={<UnifiedRegistrationPage />} />
                  <Route path="/dashboard" element={
                    <___IndividualDashboardRoute>
                      <Dashboard />
                    </___IndividualDashboardRoute>
                  } />
                  <Route path="/dashboard/analytics" element={
                    <___IndividualDashboardRoute>
                      <DashboardLayout>
                        <AnalyticsPage />
                      </DashboardLayout>
                    </___IndividualDashboardRoute>
                  } />
                  <Route path="/dashboard/tasks" element={
                    <___IndividualDashboardRoute>
                      <DashboardLayout>
                        <TasksPage />
                      </DashboardLayout>
                    </___IndividualDashboardRoute>
                  } />
                  <Route path="/dashboard/teams" element={
                    <___IndividualDashboardRoute>
                      <DashboardLayout>
                        <DashboardTeamsPage />
                      </DashboardLayout>
                    </___IndividualDashboardRoute>
                  } />
                  <Route path="/dashboard/settings" element={
                    <___IndividualDashboardRoute>
                      <DashboardLayout>
                        <SettingsPage />
                      </DashboardLayout>
                    </___IndividualDashboardRoute>
                  } />
                  <Route path="/dashboard/schedule" element={
                    <___IndividualDashboardRoute>
                      <DashboardLayout>
                        <SchedulePage />
                      </DashboardLayout>
                    </___IndividualDashboardRoute>
                  } />
                  <Route path="/dashboard/security" element={
                    <___IndividualDashboardRoute>
                      <DashboardLayout>
                        <SecurityPage />
                      </DashboardLayout>
                    </___IndividualDashboardRoute>
                  } />
                  <Route path="/dashboard/profile" element={
                    <___IndividualDashboardRoute>
                      <DashboardLayout>
                        <ProfilePage />
                      </DashboardLayout>
                    </___IndividualDashboardRoute>
                  } />
                  <Route path="/dashboard/projects" element={
                    <___IndividualDashboardRoute>
                      <DashboardLayout>
                        <MyProjectsPage />
                      </DashboardLayout>
                    </___IndividualDashboardRoute>
                  } />
                  <Route path="/dashboard/project-analytics" element={
                    <___IndividualDashboardRoute>
                      <DashboardLayout>
                        <ProjectAnalyticsPage />
                      </DashboardLayout>
                    </___IndividualDashboardRoute>
                  } />
                  <Route path="/enterprise/register" element={<EnterpriseRegisterPage />} />
                  <Route path="/enterprise/:id/dashboard" element={
                    <____ProtectedRoute>
                      <EnterpriseHome />
                    </____ProtectedRoute>
                  } />
                  <Route path="/enterprise/:id/overview" element={
                    <____ProtectedRoute>
                      <EnterpriseOverview />
                    </____ProtectedRoute>
                  } />
                  <Route path="/enterprise/:id/users" element={
                    <____ProtectedRoute>
                      <EnterpriseHome />
                    </____ProtectedRoute>
                  } />
                  <Route path="/enterprise/:id/groups" element={
                    <____ProtectedRoute>
                      <EnterpriseGroups />
                    </____ProtectedRoute>
                  } />
                  <Route path="/enterprise/:id/ai-analytics" element={
                    <____ProtectedRoute>
                      <EnterpriseAIAnalyticsPrototype />
                    </____ProtectedRoute>
                  } />
                  <Route path="/enterprise/:id/cloud-migration" element={
                    <____ProtectedRoute>
                      <EnterpriseCloudMigrationChecklist />
                    </____ProtectedRoute>
                  } />
                  <Route path="/enterprise/:id/migration" element={
                    <____ProtectedRoute>
                      <EnterpriseCloudMigrationRuns />
                    </____ProtectedRoute>
                  } />
                  <Route path="/enterprise/:id/migration/run/:runId" element={
                    <____ProtectedRoute>
                      <EnterpriseMigrationRunDetails />
                    </____ProtectedRoute>
                  } />
                  <Route path="/enterprise/:id/security" element={
                    <____ProtectedRoute>
                      <EnterpriseSecurity />
                    </____ProtectedRoute>
                  } />
                  <Route path="/enterprise/:id/help" element={
                    <____ProtectedRoute>
                      <EnterpriseHelp />
                    </____ProtectedRoute>
                  } />
                  <Route path="/enterprise/:id/teams" element={
                    <____ProtectedRoute>
                      <EnterpriseTeams />
                    </____ProtectedRoute>
                  } />
                  <Route path="/enterprise/:id/focus-areas" element={
                    <____ProtectedRoute>
                      <EnterpriseFocusAreas />
                    </____ProtectedRoute>
                  } />
                  <Route path="/enterprise/:id/resources" element={
                    <____ProtectedRoute>
                      <EnterpriseResources />
                    </____ProtectedRoute>
                  } />
                  <Route path="/enterprise/:id/marketplace" element={
                    <____ProtectedRoute>
                      <EnterpriseMarketplace />
                    </____ProtectedRoute>
                  } />
                  <Route path="/dashboard/marketplace" element={
                    <___IndividualDashboardRoute>
                      <DashboardLayout>
                        <MarketplacePage />
                      </DashboardLayout>
                    </___IndividualDashboardRoute>
                  } />
                  <Route path="/dashboard/help" element={
                    <___IndividualDashboardRoute>
                      <DashboardLayout>
                        <HelpPage />
                      </DashboardLayout>
                    </___IndividualDashboardRoute>
                  } />
                  <Route path="/dashboard/enterprise" element={
                    <___OrganizationDashboardRoute>
                      <EnterpriseLayout>
                        <EnterpriseOverviewDashboard />
                      </EnterpriseLayout>
                    </___OrganizationDashboardRoute>
                  } />
                  <Route path="/dashboard/enterprise/team" element={
                    <___OrganizationDashboardRoute>
                      <EnterpriseLayout>
                        <TeamDashboard />
                      </EnterpriseLayout>
                    </___OrganizationDashboardRoute>
                  } />
                  <Route path="/dashboard/enterprise/users" element={
                    <___OrganizationDashboardRoute>
                      <EnterpriseLayout>
                        <UserManagement />
                      </EnterpriseLayout>
                    </___OrganizationDashboardRoute>
                  } />
                  <Route path="/dashboard/enterprise/groups" element={
                    <___OrganizationDashboardRoute>
                      <EnterpriseLayout>
                        <GroupUserDashboard />
                      </EnterpriseLayout>
                    </___OrganizationDashboardRoute>
                  } />
                  <Route path="/dashboard/enterprise/reports" element={
                    <___OrganizationDashboardRoute>
                      <EnterpriseLayout>
                        <DataReports />
                      </EnterpriseLayout>
                    </___OrganizationDashboardRoute>
                  } />
                  <Route path="/dashboard/enterprise/migration" element={
                    <___OrganizationDashboardRoute>
                      <EnterpriseLayout>
                        <DataMigration />
                      </EnterpriseLayout>
                    </___OrganizationDashboardRoute>
                  } />
                  <Route path="/dashboard/enterprise/models" element={
                    <___OrganizationDashboardRoute>
                      <EnterpriseLayout>
                        <ModelRepository />
                      </EnterpriseLayout>
                    </___OrganizationDashboardRoute>
                  } />
                  <Route path="/dashboard/enterprise/monitoring" element={
                    <___OrganizationDashboardRoute>
                      <EnterpriseLayout>
                        <MonitoringModule />
                      </EnterpriseLayout>
                    </___OrganizationDashboardRoute>
                  } />
                  <Route path="/dashboard/enterprise/audit" element={
                    <___OrganizationDashboardRoute>
                      <EnterpriseLayout>
                        <AuditLogs />
                      </EnterpriseLayout>
                    </___OrganizationDashboardRoute>
                  } />
                  <Route path="/dashboard/enterprise/federation" element={
                    <___OrganizationDashboardRoute>
                      <EnterpriseLayout>
                        <FederationManagement />
                      </EnterpriseLayout>
                    </___OrganizationDashboardRoute>
                  } />
                  <Route path="/admin" element={
                    <____AdminRoute>
                      <DashboardLayout>
                        <ManagementDashboard />
                      </DashboardLayout>
                    </____AdminRoute>
                  } />
                  <Route path="/admin/login" element={<AdminLoginPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/projects/:slug" element={<ProjectDetailPage />} />
                  <Route path="/teams" element={<TeamsPage />} />
                  <Route path="/teams/:slug" element={<TeamDetailPage />} />
                  <Route path="/teams/:slug/dashboard" element={
                    <___ProtectedRoute>
                      <TeamDashboardPage />
                    </___ProtectedRoute>
                  } />
                  <Route path="/teams/:slug/admin" element={
                    <___ProtectedRoute>
                      <TeamAdminPage />
                    </___ProtectedRoute>
                  } />
                  <Route path="/teams/:slug/login" element={<TeamLoginPage />} />
                  <Route path="/teams/:slug/upgrade" element={
                    <___ProtectedRoute>
                      <TeamUpgradePage />
                    </___ProtectedRoute>
                  } />
                  <Route path="/focus-areas" element={<FocusAreasPage />} />
                  <Route path="/focus-areas/:slug" element={<FocusAreaDetailPage />} />
                  <Route path="/resources" element={<ResourcesPage />} />
                  <Route path="/community" element={<CommunityPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms" element={<TermsOfServicePage />} />

                  {/* OAuth Callback Routes */}
                  <Route path="/auth/github/callback" element={<SocialCallback provider="github" />} />
                  <Route path="/auth/google/callback" element={<SocialCallback provider="google" />} />
                  <Route path="/auth/gitlab/callback" element={<SocialCallback provider="gitlab" />} />
                  <Route path="/auth/linkedin/callback" element={<SocialCallback provider="linkedin" />} />
                </Routes>
              </Box>
              <ConditionalFooter />
            </Box>
          </Router>
        </AuthProvider>
      </TelemetryErrorBoundary>
    </CustomThemeProvider>
  );
}

export default App;
