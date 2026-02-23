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
import EnhancedHomepage from './pages/EnhancedHomepage';
import FeaturesPage from './pages/FeaturesPage';
import DocsPage from './pages/DocsPage';
import AboutPage from './pages/AboutPage';
import OnboardingDashboard  from './pages/OnboardingDashboard';
import AccountSettingsPage       from './pages/AccountSettingsPage';
import DatabasePage              from './pages/DatabasePage';
import ContainerRegistryPage     from './pages/ContainerRegistryPage';
import ComputePage               from './pages/ComputePage';
import StoragePage               from './pages/StoragePage';
import KubernetesPage            from './pages/KubernetesPage';
import ServerlessPage            from './pages/ServerlessPage';
import DomainPage                from './pages/DomainPage';
import EmailMarketingPage        from './pages/EmailMarketingPage';
import MonitoringPage            from './pages/MonitoringPage';
import BillingPage               from './pages/BillingPage';
import LoadBalancersPage         from './pages/LoadBalancersPage';
import CDNPage                   from './pages/CDNPage';
import NetworkPage               from './pages/NetworkPage';
import OrchestrationPage         from './pages/OrchestrationPage';
import ToolPlaceholderPage       from './pages/ToolPlaceholderPage';
import DevDeploymentsPage        from './pages/DevDeploymentsPage';
import DevPipelinesPage          from './pages/DevPipelinesPage';
import DevContainersPage         from './pages/DevContainersPage';
import DevMonitoringPage         from './pages/DevMonitoringPage';
import DevApiManagementPage      from './pages/DevApiManagementPage';
import DevResourceControlPage    from './pages/DevResourceControlPage';
import DevWorkspacePage          from './pages/DevWorkspacePage';
import DevSettingsPage           from './pages/DevSettingsPage';
import DevTeamPage               from './pages/DevTeamPage';
import DevBillingPage            from './pages/DevBillingPage';
import MarketingSettingsPage     from './pages/MarketingSettingsPage';
import MarketingTeamPage         from './pages/MarketingTeamPage';
import MarketingBillingPage      from './pages/MarketingBillingPage';
import MarketingOverviewPage     from './pages/MarketingOverviewPage';
import MarketingAudiencePage     from './pages/MarketingAudiencePage';
import MarketingAbTestingPage    from './pages/MarketingAbTestingPage';
import MarketingContentPage      from './pages/MarketingContentPage';
import MarketingSeoPage          from './pages/MarketingSeoPage';

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
  const isDeveloperDashboard = location.pathname.startsWith('/dev-dashboard');
  const isMarketingDashboard = location.pathname.startsWith('/marketing-dashboard');

  if (isDeveloperDashboard) {
    return (
      <ProtectedRoute>
        <DashboardLayout dashboardMode="developer">
          <Routes>
            <Route path="/dev-dashboard" element={<Navigate to="/dev-dashboard/deployments" replace />} />
            <Route path="/dev-dashboard/deployments" element={<DevDeploymentsPage />} />
            <Route path="/dev-dashboard/cicd" element={<DevPipelinesPage />} />
            <Route path="/dev-dashboard/containers-k8s" element={<DevContainersPage />} />
            <Route path="/dev-dashboard/monitoring" element={<DevMonitoringPage />} />
            <Route path="/dev-dashboard/api-management" element={<DevApiManagementPage />} />
            <Route path="/dev-dashboard/resource-control" element={<DevResourceControlPage />} />
            <Route path="/dev-dashboard/workspace" element={<DevWorkspacePage />} />
            <Route path="/dev-dashboard/settings/*" element={<DevSettingsPage />} />
            <Route path="/dev-dashboard/team" element={<DevTeamPage />} />
            <Route path="/dev-dashboard/help" element={<ToolPlaceholderPage title="Developer Support" description="Developer support resources and help center." />} />
            <Route path="/dev-dashboard/referral" element={<ToolPlaceholderPage title="Developer Referral" description="Developer referral and partner programs." />} />
            <Route path="/dev-dashboard/billing" element={<DevBillingPage />} />
            <Route path="/dev-dashboard/*" element={<Navigate to="/dev-dashboard/deployments" replace />} />
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
            <Route path="/marketing-dashboard/settings/*" element={<MarketingSettingsPage />} />
            <Route path="/marketing-dashboard/team" element={<MarketingTeamPage />} />
            <Route path="/marketing-dashboard/help" element={<ToolPlaceholderPage title="Marketing Support" description="Marketing support resources and help center." />} />
            <Route path="/marketing-dashboard/referral" element={<ToolPlaceholderPage title="Marketing Referral" description="Marketing referral and partner programs." />} />
            <Route path="/marketing-dashboard/billing" element={<MarketingBillingPage />} />
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
            <Route path="/dashboard/developer-tools"          element={<Navigate to="/dev-dashboard/deployments" replace />} />
            <Route path="/dashboard/marketing-tools"          element={<Navigate to="/marketing-dashboard/analytics" replace />} />
            <Route path="/dashboard/monitoring"               element={<MonitoringPage />} />
            <Route path="/dashboard/load-balancers"           element={<LoadBalancersPage />} />
            <Route path="/dashboard/cdn"                      element={<CDNPage />} />
            <Route path="/dashboard/network"                  element={<NetworkPage />} />
            <Route path="/dashboard/orchestration"            element={<OrchestrationPage />} />
            <Route path="/dashboard/billing"                  element={<BillingPage />} />
            <Route path="/dashboard/*"                       element={<OnboardingDashboard />} />
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
          <Route path="/"          element={<EnhancedHomepage />} />
          <Route path="/features"  element={<FeaturesPage />} />
          <Route path="/docs"      element={<DocsPage />} />
          <Route path="/about"     element={<AboutPage />} />
          <Route path="/domains"   element={<Navigate to="/dashboard/domains" replace />} />
          <Route path="/resources" element={<DocsPage />} />
          <Route path="/support"   element={<DocsPage />} />
          <Route path="/contact"   element={<AboutPage />} />
          <Route path="/account"   element={<AboutPage />} />
          <Route path="*"          element={<EnhancedHomepage />} />
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
    <CustomThemeProvider>
      <TelemetryErrorBoundary componentName="App">
        <AuthProvider>
          <Router>
            <AppShell />
          </Router>
        </AuthProvider>
      </TelemetryErrorBoundary>
    </CustomThemeProvider>
  );
}

export default App;
