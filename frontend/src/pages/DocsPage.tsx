import React from 'react';
import { Box, Container, Stack, Typography } from '@mui/material';

type ServiceDoc = {
  name: string;
  route: string;
  summary: string;
};

type ServiceGroup = {
  title: string;
  description: string;
  services: ServiceDoc[];
};

const serviceGroups: ServiceGroup[] = [
  {
    title: 'Cloud Platform Services',
    description: 'Core infrastructure and networking services used in the cloud dashboard.',
    services: [
      { name: 'Compute', route: '/dashboard/compute', summary: 'Virtual machines, sizing, images, and lifecycle operations.' },
      { name: 'Cloud Storage', route: '/dashboard/storage', summary: 'Bucket and object workflows, policies, and data access patterns.' },
      { name: 'Kubernetes', route: '/dashboard/kubernetes', summary: 'Cluster provisioning, node pools, scaling, and upgrades.' },
      { name: 'Serverless', route: '/dashboard/serverless', summary: 'Functions, runtime config, triggers, and deployment pipelines.' },
      { name: 'Container Registry', route: '/dashboard/containers', summary: 'Image repositories, tags, retention, and access controls.' },
      { name: 'Databases', route: '/dashboard/databases', summary: 'Managed database provisioning, backups, and operations.' },
      { name: 'Load Balancers', route: '/dashboard/load-balancers', summary: 'L4/L7 traffic distribution, health checks, and listener setup.' },
      { name: 'CDN', route: '/dashboard/cdn', summary: 'Caching, edge delivery, origin config, and performance tuning.' },
      { name: 'Network', route: '/dashboard/network', summary: 'Network segmentation, routing, and secure connectivity.' },
      { name: 'Orchestration', route: '/dashboard/orchestration', summary: 'Automation workflows, job orchestration, and dependency control.' },
      { name: 'Domains', route: '/dashboard/domains', summary: 'Domain registration, DNS management, and routing records.' },
      { name: 'Email Hosting', route: '/dashboard/domains', summary: 'Business email setup, mailbox configuration, and delivery DNS.' },
    ],
  },
  {
    title: 'Developer Services',
    description: 'Tooling and workflows for engineering teams in developer dashboard mode.',
    services: [
      { name: 'Deployments', route: '/dev-dashboard/deployments', summary: 'Application deployment flows, release tracking, and rollout controls.' },
      { name: 'CI/CD Pipelines', route: '/dev-dashboard/cicd', summary: 'Build pipelines, automation steps, environments, and approvals.' },
      { name: 'Containers', route: '/dev-dashboard/containers', summary: 'Container lifecycle, image management, and vulnerability scanning.' },
      { name: 'Kubernetes', route: '/dev-dashboard/kubernetes', summary: 'Cluster health, nodes, workloads, and namespace management.' },
      { name: 'Developer Monitoring', route: '/dev-dashboard/monitoring', summary: 'Logs, metrics, traces, and alerting for workloads.' },
      { name: 'API Management', route: '/dev-dashboard/api-management', summary: 'API publication, policies, versioning, and access governance.' },
      { name: 'Resource Control', route: '/dev-dashboard/resource-control', summary: 'Quota management, capacity controls, and resource policy limits.' },
      { name: 'My Workspace', route: '/dev-dashboard/workspace', summary: 'Workspace setup, preferences, and developer environment controls.' },
    ],
  },
  {
    title: 'Marketing Services',
    description: 'Campaign, analytics, and growth workflows available in marketing dashboard mode.',
    services: [
      { name: 'Marketing Overview', route: '/marketing-dashboard/analytics', summary: 'Campaign and channel performance overview with KPI summaries.' },
      { name: 'Campaigns', route: '/marketing-dashboard/campaigns', summary: 'Campaign creation, scheduling, audience assignment, and delivery.' },
      { name: 'SEO & Domains', route: '/marketing-dashboard/seo-domains', summary: 'SEO operations and domain-level optimization workflows.' },
      { name: 'Audience Segmentation', route: '/marketing-dashboard/audience-segmentation', summary: 'Segment creation, targeting logic, and lifecycle groups.' },
      { name: 'Content Distribution', route: '/marketing-dashboard/content-distribution', summary: 'Content publication and multi-channel distribution operations.' },
      { name: 'A/B Testing', route: '/marketing-dashboard/ab-testing', summary: 'Experiment design, variant rollout, and result analysis.' },
    ],
  },
  {
    title: 'Core Platform & Account',
    description: 'Cross-service account, support, billing, and governance documentation.',
    services: [
      { name: 'Monitoring', route: '/dashboard/monitoring', summary: 'Global service health, incident timelines, and observability baselines.' },
      { name: 'Billing', route: '/dashboard/billing', summary: 'Usage metering, invoice workflows, and payment management.' },
      { name: 'Account Settings', route: '/dashboard/settings', summary: 'Profile, auth, notifications, and platform preference controls.' },
      { name: 'Support', route: '/support', summary: 'Support workflows, ticket severity guidance, and escalation paths.' },
      { name: 'Contact Sales', route: '/contact', summary: 'Enterprise onboarding, pricing discussions, and migration planning.' },
      { name: 'Compliance & Security', route: '/docs', summary: 'Security controls, audit readiness, and compliance reference materials.' },
    ],
  },
];

const DocsPage: React.FC = () => {
  const primaryBlue = '#0A0F1F';
  const darkGray = '#1F2937';
  const lightGray = '#F3F4F6';
  const accentCyan = '#00E0FF';

  return (
    <Box>
      <Box
        sx={{
          background: `linear-gradient(135deg, ${primaryBlue} 0%, ${darkGray} 100%)`,
          color: 'white',
          py: { xs: 4, md: 6 },
          textAlign: 'left',
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' },
            gap: { xs: 3, md: 5 },
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 2,
                color: '#FFFFFF',
                lineHeight: { xs: 1.12, md: 1.08 },
                letterSpacing: { xs: '-0.5px', md: '-1px' },
                fontSize: { xs: '2.2rem', sm: '2.7rem', md: '3.35rem' },
                maxWidth: 700,
              }}
            >
              Developer & Service Documentation
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 400,
                color: '#FFFFFF',
                maxWidth: 700,
                lineHeight: { xs: 1.42, md: 1.4 },
              }}
            >
              Complete documentation index for all AtonixCorp services. Each section is intentionally structured for easy future edits.
            </Typography>
          </Box>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: lightGray }}>
        <Container maxWidth="lg">
          <Stack spacing={3}>
            {serviceGroups.map((group) => (
              <Box key={group.title} sx={{ bgcolor: 'white', border: '1px solid #E5E7EB', borderRadius: '2px', p: { xs: 2.5, md: 3 } }}>
                <Typography sx={{ fontSize: { xs: '1.25rem', md: '1.4rem' }, fontWeight: 700, color: primaryBlue, mb: 0.75 }}>
                  {group.title}
                </Typography>
                <Typography sx={{ color: darkGray, opacity: 0.78, mb: 2 }}>
                  {group.description}
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5 }}>
                  {group.services.map((service) => (
                    <Box
                      key={service.name}
                      sx={{
                        border: '1px solid #E5E7EB',
                        borderRadius: '2px',
                        p: 2,
                        transition: 'border-color 120ms cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          borderColor: accentCyan,
                        },
                      }}
                    >
                      <Typography sx={{ fontWeight: 700, color: primaryBlue, mb: 0.5 }}>{service.name}</Typography>
                      <Typography sx={{ color: darkGray, opacity: 0.78, fontSize: '.9rem', lineHeight: 1.5, mb: 0.9 }}>
                        {service.summary}
                      </Typography>
                      <Typography sx={{ color: '#0f766e', fontSize: '.78rem', fontWeight: 600 }}>
                        Route: {service.route}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default DocsPage;
