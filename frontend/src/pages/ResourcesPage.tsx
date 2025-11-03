import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Tab,
  Tabs,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Alert,
} from '@mui/material';
import {
  Code as CodeIcon,
  Description as DocumentationIcon,
  School as TutorialIcon,
  Build as ToolIcon,
  Link as LinkIcon,
  GitHub,
  Twitter,
  LinkedIn,
  Forum as Discord,
  Article,
  QuestionAnswer,
  Download,
  OpenInNew,
} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`resource-tabpanel-${index}`}
      aria-labelledby={`resource-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const ResourcesPage: React.FC = () => {
  const location = useLocation();
  const isDashboardMode = location.pathname.startsWith('/dashboard');

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay for demo purposes
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'documentation': return <DocumentationIcon />;
      case 'tutorial': return <TutorialIcon />;
      case 'tool': return <ToolIcon />;
      case 'link': return <LinkIcon />;
      default: return <CodeIcon />;
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'github': return <GitHub />;
      case 'twitter': return <Twitter />;
      case 'linkedin': return <LinkedIn />;
      case 'discord': return <Discord />;
      default: return <LinkIcon />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ py: isDashboardMode ? 0 : 4 }}>
        {!isDashboardMode && (
          <Box sx={{ px: 3, py: 4 }}>
            <Typography>Loading resources...</Typography>
          </Box>
        )}
        {isDashboardMode && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Resources
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Loading resources...
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  const content = (
    <>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant={isDashboardMode ? "h4" : "h2"} component="h1" sx={{ mb: 2, fontWeight: 600 }}>
          Developer Resources
        </Typography>
        <Typography variant={isDashboardMode ? "body1" : "h6"} color="text.secondary" sx={{ mb: 4 }}>
          Everything you need to build with AtonixCorp
        </Typography>

        <Alert severity="info" sx={{ mb: 4 }}>
          Welcome to the AtonixCorp Developer Hub! Find documentation, tutorials, tools, and connect with our community.
        </Alert>
      </Box>

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab label="Documentation" icon={<Article />} />
          <Tab label="Community" icon={<QuestionAnswer />} />
          <Tab label="Tools & Downloads" icon={<Download />} />
          <Tab label="FAQ" icon={<QuestionAnswer />} />
        </Tabs>
      </Box>

      {/* Documentation Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* Featured Resources */}
          <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
              Getting Started
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
              {[
                {
                  title: 'Development Guidelines',
                  description: 'Best practices and coding standards for AtonixCorp projects',
                  type: 'guideline',
                  featured: true
                },
                {
                  title: 'API Documentation',
                  description: 'Comprehensive API reference and examples',
                  type: 'documentation',
                  featured: true
                },
                {
                  title: 'Quick Start Tutorial',
                  description: 'Get up and running with AtonixCorp platform in 10 minutes',
                  type: 'tutorial',
                  featured: true
                }
              ].map((resource, index) => (
                <Card key={index} sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {getResourceIcon(resource.type)}
                      <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
                        {resource.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {resource.description}
                    </Typography>
                    <Chip
                      label={resource.type}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  </CardContent>
                  <CardActions>
                    <Button size="small" startIcon={<OpenInNew />}>
                      Read More
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>
          </Box>

          {/* Project Documentation */}
          <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
              Project Documentation
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
              {[
                'Atonixcorp-Platform',
                'Planivar',
                'Voltoraiq',
                'Osrovnet',
                'TujengePay'
              ].map((project, index) => (
                <Paper
                  key={index}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease'
                    }
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {project}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Technical documentation and implementation guides
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        </Box>
      </TabPanel>

      {/* Community Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
          {/* Community Links */}
          <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
              Join Our Community
            </Typography>
            <List>
              {[
                { platform: 'GitHub', name: 'AtonixCorp on GitHub', url: 'https://github.com/AtonixCorp', description: 'Contribute to our open source projects' },
                { platform: 'Twitter', name: '@AtonixCorp', url: 'https://twitter.com/AtonixCorp', description: 'Follow us for updates and announcements' },
                { platform: 'LinkedIn', name: 'AtonixCorp', url: 'https://linkedin.com/company/atonixcorp', description: 'Connect with our professional network' },
                { platform: 'Discord', name: 'AtonixCorp Community', url: '#', description: 'Join our developer discussions' }
              ].map((link, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemIcon>
                      {getSocialIcon(link.platform)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {link.name}
                          </Typography>
                          <IconButton
                            size="small"
                            component="a"
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <OpenInNew fontSize="small" />
                          </IconButton>
                        </Box>
                      }
                      secondary={link.description}
                    />
                  </ListItem>
                  {index < 3 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Box>

          {/* Contributing Guidelines */}
          <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
              Contributing
            </Typography>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  How to Contribute
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  We welcome contributions from the community! Here's how you can get involved:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="1. Fork our repositories on GitHub" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="2. Create a feature branch" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="3. Make your changes and test" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="4. Submit a pull request" />
                  </ListItem>
                </List>
              </CardContent>
              <CardActions>
                <Button variant="contained" startIcon={<GitHub />}>
                  View on GitHub
                </Button>
              </CardActions>
            </Card>
          </Box>
        </Box>
      </TabPanel>

      {/* Tools & Downloads Tab */}
      <TabPanel value={tabValue} index={2}>
        <Box>
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
            Development Tools
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            {[
              {
                name: 'AtonixCorp CLI',
                description: 'Command-line interface for managing AtonixCorp projects',
                version: 'v1.2.0',
                downloads: '2.5k'
              },
              {
                name: 'Project Templates',
                description: 'Starter templates for different project types',
                version: 'v2.0.1',
                downloads: '1.8k'
              },
              {
                name: 'Development Kit',
                description: 'Complete SDK with examples and documentation',
                version: 'v3.1.0',
                downloads: '4.2k'
              }
            ].map((tool, index) => (
              <Card key={index}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {tool.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {tool.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip label={tool.version} size="small" color="primary" />
                    <Chip label={`${tool.downloads} downloads`} size="small" variant="outlined" />
                  </Box>
                </CardContent>
                <CardActions>
                  <Button variant="contained" startIcon={<Download />}>
                    Download
                  </Button>
                  <Button size="small">
                    Docs
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        </Box>
      </TabPanel>

      {/* FAQ Tab */}
      <TabPanel value={tabValue} index={3}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Frequently Asked Questions
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {[
            {
              question: 'How do I get started with AtonixCorp?',
              answer: 'Start by reading our documentation and following the quick start tutorial. Join our community on Discord for support.'
            },
            {
              question: 'What technologies does AtonixCorp use?',
              answer: 'We primarily use Python, Django, React, TypeScript, Docker, and Kubernetes. Different projects may use additional technologies.'
            },
            {
              question: 'How can I contribute to AtonixCorp projects?',
              answer: 'Check out our contributing guidelines on GitHub. We welcome bug reports, feature requests, and pull requests.'
            },
            {
              question: 'Is AtonixCorp open source?',
              answer: 'Yes! Most of our projects are open source and available on GitHub under various licenses.'
            },
            {
              question: 'How do I report a bug or request a feature?',
              answer: 'Please create an issue on the relevant GitHub repository or contact us through our community channels.'
            }
          ].map((faq, index) => (
            <Card key={index}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  {faq.question}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {faq.answer}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </TabPanel>
    </>
  );

  return isDashboardMode ? (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Resources
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Everything you need to build with AtonixCorp
        </Typography>
      </Box>
      {content}
    </Box>
  ) : (
    <Box sx={{ px: 3, py: 4 }}>
      {content}
    </Box>
  );
};

export default ResourcesPage;
