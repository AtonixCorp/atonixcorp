import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import DashboardLayout from './components/Layout/DashboardLayout';

// Pages
import Homepage from './pages/Homepage';
import FeaturesPage from './pages/FeaturesPage';
import DocsPage from './pages/DocsPage';
import DeveloperPage from './pages/DeveloperPage';
import ResourcesPage from './pages/ResourcesPage';
import BareMetalVpsPage from './pages/BareMetalVpsPage';
import AboutPage from './pages/AboutPage';
import ContactSalesPage from './pages/ContactSalesPage';
import SupportPage from './pages/SupportPage';
import OnboardingDashboard  from './pages/OnboardingDashboard';
import AccountSettingsPage       from './pages/AccountSettingsPage';
import DatabasePage              from './pages/DatabasePage';
import ContainerRegistryPage     from './pages/ContainerRegistryPage';
import ComputePage               from './pages/ComputePage';
import StoragePage               from './pages/StoragePage';
import KubernetesPage            from './pages/KubernetesPage';
import ServerlessPage from './pages/ServerlessPage';
import DomainPage from './pages/DomainPage';
import DomainsLandingPage from './pages/DomainsLandingPage';
import DomainsServiceDashboardPage from './pages/DomainsServiceDashboardPage';
import DomainDetailPage from './pages/DomainDetailPage';
import EmailMarketingPage from './pages/EmailMarketingPage';
import MonitoringPage from './pages/MonitoringPage';
import BillingPage               from './pages/BillingPage';
import LoadBalancersPage         from './pages/LoadBalancersPage';
import CDNPage                   from './pages/CDNPage';
import NetworkPage               from './pages/NetworkPage';
import OrchestrationPage         from './pages/OrchestrationPage';
import DevDeploymentsPage        from './pages/DevDeploymentsPage';
import DevPipelinesPage          from './pages/DevPipelinesPage';
import DevContainersPage        from './pages/DevContainersPage';
import DevKubernetesPage        from './pages/DevKubernetesPage';
import KubernetesSetupPage      from './pages/KubernetesSetupPage';
import KubernetesMonitorPage    from './pages/KubernetesMonitorPage';
import DevMonitoringPage         from './pages/DevMonitoringPage';
import DevApiManagementPage      from './pages/DevApiManagementPage';
import DevResourceControlPage    from './pages/DevResourceControlPage';
import DevWorkspacePage          from './pages/DevWorkspacePage';
import DevSettingsPage           from './pages/DevSettingsPage';
import MarketingSettingsPage     from './pages/MarketingSettingsPage';
import MarketingOverviewPage     from './pages/MarketingOverviewPage';
import MarketingAudiencePage     from './pages/MarketingAudiencePage';
import MarketingAbTestingPage    from './pages/MarketingAbTestingPage';
import MarketingContentPage      from './pages/MarketingContentPage';
import MarketingSeoPage          from './pages/MarketingSeoPage';
import DashboardSectionsPage     from './pages/DashboardSectionsPage';
import MonitorSettingsPage        from './pages/MonitorSettingsPage';
import TeamsPage                  from './pages/TeamsPage';
import DevGroupsPage              from './pages/DevGroupsPage';
import GroupCreatePage            from './pages/GroupCreatePage';
import GroupDashboardPage         from './pages/GroupDashboardPage';
import DevProjectsPage            from './pages/DevProjectsPage';
import DevProjectDetailPage       from './pages/DevProjectDetailPage';
import DevEnvironmentPage         from './pages/DevEnvironmentPage';
import DevOperationalPage         from './pages/DevOperationalPage';
import TeamDetailPage             from './pages/TeamDetailPage';

// Protected route – redirects to home if not authenticated
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isInitializing } = useAuth() as any;
  if (isInitializing) return null; // wait for token verification before deciding
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

// Renders the correct shell depending on whether we are inside /dashboard/*
const AppShell: React.FC = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isDeveloperDashboard = location.pathname.startsWith('/developer/Dashboard');
  const isMarketingDashboard = location.pathname.startsWith('/marketing-dashboard');
  const isDomainsDashboard = location.pathname.startsWith('/domains/dashboard');
  const isMonitorDashboard = location.pathname.startsWith('/monitor-dashboard');
  const isGroupsPage = location.pathname.startsWith('/groups');

  if (isGroupsPage) {
    return (
      <ProtectedRoute>
        <Routes>
          <Route path="/groups/new"                      element={<GroupCreatePage />} />
          <Route path="/groups/:groupId"                 element={<GroupDashboardPage />} />
          <Route path="/groups/:groupId/:section"        element={<GroupDashboardPage />} />
          <Route path="/groups/:groupId/:section/:sub"   element={<GroupDashboardPage />} />
          <Route path="/groups/*"                        element={<Navigate to="/developer/Dashboard/groups" replace />} />
        </Routes>
      </ProtectedRoute>
    );
  }

  if (isDeveloperDashboard) {
    return (
      <ProtectedRoute>
        <DashboardLayout dashboardMode="developer">
          <Routes>
            <Route path="/developer/Dashboard" element={<Navigate to="/developer/Dashboard/deployments" replace />} />
            <Route path="/developer/Dashboard/deployments" element={<DevDeploymentsPage />} />
            <Route path="/developer/Dashboard/projects"     element={<DevProjectsPage />} />
            <Route path="/developer/Dashboard/projects/:id"  element={<DevProjectDetailPage />} />
            <Route path="/developer/Dashboard/cicd" element={<DevPipelinesPage />} />
            <Route path="/developer/Dashboard/containers" element={<DevContainersPage />} />
            <Route path="/developer/Dashboard/kubernetes" element={<DevKubernetesPage />} />
            <Route path="/developer/Dashboard/kubernetes/setup/:projectId" element={<KubernetesSetupPage />} />
            <Route path="/developer/Dashboard/kubernetes/monitor/:configId" element={<KubernetesMonitorPage />} />
            <Route path="/developer/Dashboard/monitoring" element={<DevMonitoringPage />} />
            <Route path="/developer/Dashboard/api-management" element={<DevApiManagementPage />} />
            <Route path="/developer/Dashboard/resource-control" element={<DevResourceControlPage />} />
            <Route path="/developer/Dashboard/workspace" element={<DevWorkspacePage />} />
            <Route path="/developer/Dashboard/groups" element={<DevGroupsPage />} />
            <Route path="/developer/Dashboard/environment" element={<DevEnvironmentPage />} />
            <Route path="/developer/Dashboard/operational" element={<DevOperationalPage />} />
            <Route path="/developer/Dashboard/sections" element={<DashboardSectionsPage dashboardMode="developer" />} />
            <Route path="/developer/Dashboard/settings/*" element={<DevSettingsPage />} />
            <Route path="/developer/Dashboard/*" element={<Navigate to="/developer/Dashboard/deployments" replace />} />
          </Routes>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (isMarketingDashboard) {
    return (
      <ProtectedRoute>
        <DashboardLayout dashboardMode="marketing">
          <Routes>
            <Route path="/marketing-dashboard" element={<Navigate to="/marketing-dashboard/analytics" replace />} />
            <Route path="/marketing-dashboard/analytics" element={<MarketingOverviewPage />} />
            <Route path="/marketing-dashboard/campaigns" element={<EmailMarketingPage />} />
            <Route path="/marketing-dashboard/seo-domains" element={<MarketingSeoPage />} />
            <Route path="/marketing-dashboard/audience-segmentation" element={<MarketingAudiencePage />} />
            <Route path="/marketing-dashboard/content-distribution" element={<MarketingContentPage />} />
            <Route path="/marketing-dashboard/ab-testing" element={<MarketingAbTestingPage />} />
            <Route path="/marketing-dashboard/sections" element={<DashboardSectionsPage dashboardMode="marketing" />} />
            <Route path="/marketing-dashboard/settings/*" element={<MarketingSettingsPage />} />
            <Route path="/marketing-dashboard/*" element={<Navigate to="/marketing-dashboard/analytics" replace />} />
          </Routes>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (isDashboard) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <Routes>
            <Route path="/dashboard"                         element={<OnboardingDashboard />} />
            <Route path="/dashboard/compute"                 element={<ComputePage />} />
            <Route path="/dashboard/compute/create"          element={<ComputePage />} />
            <Route path="/dashboard/kubernetes"              element={<KubernetesPage />} />
            <Route path="/dashboard/kubernetes/:id"          element={<KubernetesPage />} />
            <Route path="/dashboard/serverless"              element={<ServerlessPage />} />
            <Route path="/dashboard/serverless/:id"          element={<ServerlessPage />} />
            <Route path="/dashboard/settings"                element={<AccountSettingsPage />} />
            <Route path="/dashboard/settings/:section"       element={<AccountSettingsPage />} />
            <Route path="/dashboard/databases"               element={<DatabasePage />} />
            <Route path="/dashboard/databases/:id"           element={<DatabasePage />} />
            <Route path="/dashboard/containers"              element={<ContainerRegistryPage />} />
            <Route path="/dashboard/containers/:id"          element={<ContainerRegistryPage />} />
            <Route path="/dashboard/storage"                  element={<StoragePage />} />
            <Route path="/dashboard/storage/:id"              element={<StoragePage />} />
            <Route path="/dashboard/domain"                   element={<Navigate to="/dashboard/domains" replace />} />
            <Route path="/dashboard/domains"                  element={<DomainPage />} />
            <Route path="/dashboard/domains/:id"              element={<DomainPage />} />
            <Route path="/dashboard/email-marketing"          element={<Navigate to="/marketing-dashboard/campaigns" replace />} />
            <Route path="/dashboard/developer-tools"          element={<Navigate to="/developer/Dashboard/deployments" replace />} />
            <Route path="/dashboard/marketing-tools"          element={<Navigate to="/marketing-dashboard/analytics" replace />} />
            <Route path="/dashboard/monitoring"               element={<MonitoringPage />} />
            <Route path="/dashboard/load-balancers"           element={<LoadBalancersPage />} />
            <Route path="/dashboard/cdn"                      element={<CDNPage />} />
            <Route path="/dashboard/network"                  element={<NetworkPage />} />
            <Route path="/dashboard/orchestration"            element={<OrchestrationPage />} />
            <Route path="/dashboard/billing"                  element={<BillingPage />} />
            <Route path="/dashboard/sections"                 element={<DashboardSectionsPage dashboardMode="cloud" />} />
            <Route path="/dashboard/teams"                    element={<TeamsPage />} />
            <Route path="/dashboard/teams/:teamId"            element={<TeamDetailPage />} />
            <Route path="/dashboard/*"                       element={<OnboardingDashboard />} />
          </Routes>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (isDomainsDashboard) {
    return (
      <ProtectedRoute>
        <DashboardLayout dashboardMode="domains">
          <Routes>
            <Route path="/domains/dashboard"          element={<DomainsServiceDashboardPage />} />
            <Route path="/domains/dashboard/sections" element={<DashboardSectionsPage dashboardMode="domains" />} />
            <Route path="/domains/dashboard/:id"      element={<DomainDetailPage />} />
            <Route path="/domains/dashboard/*"        element={<DomainsServiceDashboardPage />} />
          </Routes>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (isMonitorDashboard) {
    return (
      <ProtectedRoute>
        <DashboardLayout dashboardMode="monitor">
          <Routes>
            <Route path="/monitor-dashboard"           element={<Navigate to="/monitor-dashboard/overview" replace />} />
            <Route path="/monitor-dashboard/overview"  element={<MonitoringPage defaultTab={0} />} />
            <Route path="/monitor-dashboard/incidents" element={<MonitoringPage defaultTab={1} />} />
            <Route path="/monitor-dashboard/alerts"    element={<MonitoringPage defaultTab={2} />} />
            <Route path="/monitor-dashboard/metrics"   element={<MonitoringPage defaultTab={3} />} />
            <Route path="/monitor-dashboard/logs"      element={<MonitoringPage defaultTab={4} />} />
            <Route path="/monitor-dashboard/sections"  element={<DashboardSectionsPage dashboardMode="monitor" />} />
            <Route path="/monitor-dashboard/settings"  element={<MonitorSettingsPage />} />
            <Route path="/monitor-dashboard/*"         element={<Navigate to="/monitor-dashboard/overview" replace />} />
          </Routes>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CloudPlatformHeader />
      <Box component="main" sx={{ flex: 1 }}>
        <Routes>
          <Route path="/"          element={<Homepage />} />
          <Route path="/features"  element={<FeaturesPage />} />
          <Route path="/bare-metal-vps/:slug" element={<BareMetalVpsPage />} />
          <Route path="/developer" element={<DeveloperPage />} />
          <Route path="/docs"      element={<DocsPage />} />
          <Route path="/about"     element={<AboutPage />} />
          <Route path="/domains"   element={<DomainsLandingPage />} />
          <Route path="/domains/dashboard" element={<ProtectedRoute><DomainsServiceDashboardPage /></ProtectedRoute>} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/support"   element={<SupportPage />} />
          <Route path="/contact"   element={<ContactSalesPage />} />
          <Route path="/account"   element={<AboutPage />} />
          <Route path="*"          element={<Homepage />} />
        </Routes>
      </Box>
      <Footer />
    </Box>
  );
};

function App() {
  useEffect(() => {
    initializeOpenTelemetry();
  }, []);

  return (
    <TelemetryErrorBoundary componentName="App">
      <Router>
        <CustomThemeProvider>
          <AuthProvider>
            <AppShell />
          </AuthProvider>
        </CustomThemeProvider>
      </Router>
    </TelemetryErrorBoundary>
  );
}

export default App;
