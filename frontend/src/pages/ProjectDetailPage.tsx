import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Breadcrumbs,
  Link,
  Skeleton,
  Alert,
} from '@mui/material';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  GitHub as GitHubIcon,
  Launch as LaunchIcon,
  Description as DocsIcon,
  Star as StarIcon,
  CheckCircle as CheckIcon,
  Timeline as TimelineIcon,
  Code as CodeIcon,
  Architecture as ArchIcon,
} from '@mui/icons-material';
import { projectsApi } from '../services/api';
import { Project } from '../types/api';

const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!slug) return;

      try {
        const response = await projectsApi.getBySlug(slug);
        setProject(response.data);
      } catch (error) {
        console.error('Error fetching project:', error);
        // Use mock data based on slug if API fails
        const mockProjectData: { [key: string]: Project } = {
          'atonixcorp-project': {
            id: 1,
            name: 'Atonixcorp-project',
            slug: 'atonixcorp-project',
            overview: 'The backbone of AtonixCorp\'s infrastructure strategy.',
            description: 'This modular stack powers scalable services, persistent data layers, and distributed orchestration across domains like medicine, agriculture, security, and advanced analytics. It\'s not just a system—it\'s the foundation of our technical sovereignty.\n\nThe project encompasses a comprehensive suite of microservices, containerized applications, and cloud-native solutions designed to handle enterprise-scale workloads. With built-in monitoring, automated scaling, and robust security features, it provides the infrastructure backbone that supports all other AtonixCorp initiatives.',
            status: 'active',
            is_featured: true,
            technologies: [
              { id: 1, name: 'Python' },
              { id: 2, name: 'Django' },
              { id: 3, name: 'React' },
              { id: 4, name: 'Docker' },
              { id: 5, name: 'Kubernetes' },
              { id: 6, name: 'PostgreSQL' },
              { id: 7, name: 'Redis' },
              { id: 8, name: 'Nginx' }
            ],
            focus_areas: [
              { id: 1, name: 'Infrastructure', slug: 'infrastructure', description: 'Core platform infrastructure', icon: '', image: '', color_theme: '#1976d2', is_active: true, order: 1, created_at: '2024-01-01', updated_at: '2024-01-01', technologies: [], solutions: [] }
            ],
            start_date: '2024-01-01',
            github_url: 'https://github.com/AtonixCorp/atonixcorp-project',
            documentation_url: 'https://docs.atonixcorp.org/atonixcorp-project',
            website_url: 'https://platform.atonixcorp.org',
            created_at: '2024-01-01',
            updated_at: '2024-12-01',
            features: [
              {
                id: 1,
                title: 'Microservices Architecture',
                description: 'Scalable, modular design with independent service deployment',
                icon: 'architecture',
                order: 1
              },
              {
                id: 2,
                title: 'Container Orchestration',
                description: 'Kubernetes-based deployment with automated scaling and load balancing',
                icon: 'cloud',
                order: 2
              },
              {
                id: 3,
                title: 'Real-time Analytics',
                description: 'Built-in monitoring and analytics for performance optimization',
                icon: 'analytics',
                order: 3
              },
              {
                id: 4,
                title: 'Security Framework',
                description: 'Enterprise-grade security with authentication and authorization',
                icon: 'security',
                order: 4
              }
            ],
            images: []
          },
          'tmsvic-discovery': {
            id: 2,
            name: 'Tmsvic-Discovery',
            slug: 'tmsvic-discovery',
            overview: 'A storytelling engine for the future.',
            description: 'Tmsvic Discovery explores the cosmos, technology, and sovereign infrastructure through deep science and motivational insight. From quantum physics to climate resilience, it\'s a portal to bold ideas and timeless truths that shape tomorrow.\n\nThis innovative platform combines advanced natural language processing, machine learning algorithms, and data visualization to create compelling narratives from complex scientific and technological data. It serves as both an educational tool and a research platform for understanding emerging trends in science and technology.',
            status: 'active',
            is_featured: true,
            technologies: [
              { id: 1, name: 'Python' },
              { id: 9, name: 'AI/ML' },
              { id: 10, name: 'Natural Language Processing' },
              { id: 11, name: 'Data Analytics' },
              { id: 12, name: 'TensorFlow' },
              { id: 13, name: 'Jupyter' }
            ],
            focus_areas: [
              { id: 2, name: 'Medical Research', slug: 'medical-research', description: 'AI-powered medical research', icon: '', image: '', color_theme: '#4caf50', is_active: true, order: 2, created_at: '2024-01-01', updated_at: '2024-01-01', technologies: [], solutions: [] }
            ],
            start_date: '2024-02-01',
            github_url: 'https://github.com/AtonixCorp/tmsvic-discovery',
            documentation_url: 'https://docs.atonixcorp.org/tmsvic-discovery',
            created_at: '2024-02-01',
            updated_at: '2024-11-01',
            features: [
              {
                id: 1,
                title: 'AI-Powered Storytelling',
                description: 'Generate compelling narratives from scientific data using advanced NLP',
                icon: 'story',
                order: 1
              },
              {
                id: 2,
                title: 'Interactive Visualizations',
                description: 'Dynamic charts and graphs that bring data to life',
                icon: 'chart',
                order: 2
              },
              {
                id: 3,
                title: 'Research Integration',
                description: 'Connect with scientific databases and research repositories',
                icon: 'research',
                order: 3
              }
            ],
            images: []
          },

          'atonixcorp-security': {
            id: 3,
            name: 'Osrovnet',
            slug: 'atonixcorp-security',
            overview: 'Osrovnet is built for sovereign systems and mission-critical environments. It empowers organizations to defend from protocol to perimeter with precision, insight, and autonomy.',
            description: 'Osrovnet provides comprehensive threat intelligence, real-time network monitoring, and automated response capabilities. With advanced machine learning algorithms for anomaly detection and a robust API for integration with existing security infrastructure, Osrovnet represents the next generation of cybersecurity solutions.',

            status: 'active',
            is_featured: true,
            technologies: [
              { id: 14, name: 'Cybersecurity' },
              { id: 15, name: 'Network Analysis' },
              { id: 16, name: 'Threat Intelligence' },
              { id: 17, name: 'DevSecOps' },
              { id: 1, name: 'Python' },
              { id: 18, name: 'Go' }
            ],
            focus_areas: [
              { id: 3, name: 'Security', slug: 'security', description: 'Cybersecurity and network protection', icon: '', image: '', color_theme: '#f44336', is_active: true, order: 3, created_at: '2024-01-01', updated_at: '2024-01-01', technologies: [], solutions: [] }
            ],
            start_date: '2024-03-01',

            github_url: 'https://github.com/AtonixCorp/atonixcorp-security',
            documentation_url: 'https://docs.atonixcorp.org/atonixcorp-security',
            created_at: '2024-03-01',
            updated_at: '2024-10-01',
            features: [
              {
                id: 1,
                title: 'Threat Intelligence',
                description: 'Real-time threat detection and analysis with ML-powered insights',
                icon: 'shield',
                order: 1
              },
              {
                id: 2,
                title: 'Network Monitoring',
                description: 'Comprehensive network traffic analysis and visualization',
                icon: 'network',
                order: 2
              },
              {
                id: 3,
                title: 'Automated Response',
                description: 'Intelligent incident response with customizable workflows',
                icon: 'automation',
                order: 3
              }
            ],
            images: []
          }
        };

        const mockProject = mockProjectData[slug];
        if (mockProject) {
          setProject(mockProject);
        } else {
          setError('Project not found');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [slug]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'development': return 'warning';
      case 'completed': return 'info';
      case 'paused': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ px: 3, py: 4 }}>
        <Skeleton variant="text" width="200px" height={30} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="400px" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={300} sx={{ mb: 4 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 4 }}>
          <Skeleton variant="rectangular" height={400} />
          <Skeleton variant="rectangular" height={400} />
        </Box>
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Box sx={{ px: 3, py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error || 'Project not found'}
        </Alert>
        <Button component={RouterLink} to="/projects" variant="contained">
          Back to Projects
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 3, py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/" underline="hover">
          Home
        </Link>
        <Link component={RouterLink} to="/projects" underline="hover">
          Projects
        </Link>
        <Typography color="text.primary">{project.name}</Typography>
      </Breadcrumbs>

      {/* Project Header */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h2" component="h1" sx={{ fontWeight: 600, mr: 2 }}>
            {project.name}
          </Typography>
          {project.is_featured && <StarIcon color="primary" fontSize="large" />}
        </Box>


        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          <Chip
            label={project.status}
            color={getStatusColor(project.status) as any}
          />
          {project.is_featured && (
            <Chip label="Featured" variant="outlined" color="primary" />
          )}
        </Box>

        <Typography variant="h5" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
          {project.overview}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {project.github_url && (
            <Button
              variant="contained"
              startIcon={<GitHubIcon />}
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Source
            </Button>
          )}
          {project.website_url && (
            <Button
              variant="outlined"
              startIcon={<LaunchIcon />}
              href={project.website_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Live Demo
            </Button>
          )}
          {project.documentation_url && (
            <Button
              variant="outlined"
              startIcon={<DocsIcon />}
              href={project.documentation_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Documentation
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 4 }}>
        {/* Main Content */}
        <Box>
          {/* Description */}
          <Paper sx={{ p: 4, mb: 4 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
              About This Project
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}>
              {project.description}
            </Typography>
          </Paper>

          {/* Features */}
          {project.features && project.features.length > 0 && (
            <Paper sx={{ p: 4, mb: 4 }}>
              <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                Key Features
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
                {project.features.map((feature) => (
                  <Card variant="outlined" sx={{ height: '100%' }} key={feature.id}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CheckIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {feature.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Paper>
          )}

          {/* Technologies */}
          <Paper sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
              Technologies Used
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {project.technologies.map((tech, index) => (
                <Chip
                  key={index}
                  label={tech.name}
                  variant="outlined"
                  color="primary"
                  icon={<CodeIcon />}
                />
              ))}
            </Box>
          </Paper>
        </Box>

        {/* Sidebar */}
        <Box>
          {/* Project Info */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Project Information
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <TimelineIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Status"
                  secondary={

                    <Chip
                      label={project.status}
                      size="small"
                      color={getStatusColor(project.status) as any}
                    />
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ArchIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Architecture"
                  secondary="Microservices, Cloud-Native"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <StarIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Featured"
                  secondary={project.is_featured ? 'Yes' : 'No'}
                />
              </ListItem>
            </List>
          </Paper>

          {/* Quick Links */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Quick Links
            </Typography>
            <List dense>
              {project.github_url && (
                <ListItem>
                  <ListItemIcon>
                    <GitHubIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Link href={project.github_url} target="_blank" rel="noopener noreferrer">
                        Source Code
                      </Link>
                    }
                  />
                </ListItem>
              )}
              {project.documentation_url && (
                <ListItem>
                  <ListItemIcon>
                    <DocsIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Link href={project.documentation_url} target="_blank" rel="noopener noreferrer">
                        Documentation
                      </Link>
                    }
                  />
                </ListItem>
              )}
              {project.website_url && (
                <ListItem>
                  <ListItemIcon>
                    <LaunchIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Link href={project.website_url} target="_blank" rel="noopener noreferrer">
                        Live Demo
                      </Link>
                    }
                  />
                </ListItem>
              )}
            </List>
          </Paper>

          {/* Call to Action */}
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Get Involved
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Interested in contributing to {project.name}?
            </Typography>
            <Button
              variant="contained"
              fullWidth
              component={RouterLink}
              to="/contact"
              sx={{ mb: 2 }}
            >
              Contact Us
            </Button>
            <Button
              variant="outlined"
              fullWidth
              component={RouterLink}
              to="/resources"
            >
              Developer Guide
            </Button>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};


export default ProjectDetailPage;
