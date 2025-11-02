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
import EnterpriseAIAnalyticsPrototype from './pages/enterprise/EnterpriseAIAnalyticsPrototype';
import EnterpriseCloudMigrationChecklist from './pages/enterprise/EnterpriseCloudMigrationChecklist';
import EnterpriseCloudMigrationRuns from './pages/enterprise/EnterpriseCloudMigrationRuns';
import EnterpriseMigrationRunDetails from './pages/enterprise/EnterpriseMigrationRunDetails';

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
const _ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

<<<<<<< HEAD
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
=======
const _AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
>>>>>>> cf817c2f425914921dfacd00e49554c630584992
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

<<<<<<< HEAD
=======
// Create premium professional theme for AtonixCorp
const _theme = createTheme({
  palette: {
    primary: {
      main: '#1e293b', // Modern dark slate
      dark: '#0f172a',
      light: '#334155',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#3b82f6', // Professional blue
      dark: '#2563eb',
      light: '#60a5fa',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    success: {
      main: '#10b981',
      dark: '#059669',
      light: '#34d399',
    },
    warning: {
      main: '#f59e0b',
      dark: '#d97706',
      light: '#fbbf24',
    },
    error: {
      main: '#ef4444',
      dark: '#dc2626',
      light: '#f87171',
    },
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", "Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '3.5rem',
      lineHeight: 1.1,
      letterSpacing: '-0.025em',
      background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.75rem',
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontWeight: 700,
      fontSize: '2.25rem',
      lineHeight: 1.25,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.875rem',
      lineHeight: 1.3,
      letterSpacing: '-0.015em',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.35,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
      letterSpacing: '-0.005em',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      letterSpacing: '0.01071em',
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0, 0, 0, 0.05)',
    '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)',
    '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
        },
        html: {
          scrollBehavior: 'smooth',
        },
        body: {
          backgroundColor: '#f8fafc',
          fontFeatureSettings: '"cv11", "ss01"',
          fontVariationSettings: '"opsz" 32',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          fontWeight: 600,
          padding: '10px 24px',
          boxShadow: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            borderColor: '#cbd5e1',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid #e2e8f0',
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        },
        elevation2: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
        elevation3: {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid #e2e8f0',
          color: '#1e293b',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          '&:hover': {
            transform: 'scale(1.05)',
          },
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'scale(1.05)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-1px)',
            },
            '&.Mui-focused': {
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1)',
            },
          },
        },
      },
    },
  },
});

>>>>>>> cf817c2f425914921dfacd00e49554c630584992
function App() {
  useEffect(() => {
    // Initialize telemetry on app startup
    initializeOpenTelemetry();
  }, []);

  return (
<<<<<<< HEAD
    <CustomThemeProvider>
=======
    <ThemeProvider theme={_theme}>
      <CssBaseline />
>>>>>>> cf817c2f425914921dfacd00e49554c630584992
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
<<<<<<< HEAD
                    <DashboardRoute>
                      <Dashboard />
                    </DashboardRoute>
=======
                    <_ProtectedRoute>
                      <Dashboard />
                    </_ProtectedRoute>
>>>>>>> cf817c2f425914921dfacd00e49554c630584992
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
