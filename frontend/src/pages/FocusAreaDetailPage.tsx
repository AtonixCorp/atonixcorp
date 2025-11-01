import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Skeleton,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  ExpandMore,
  Launch,
  CheckCircle,
  TrendingUp,
  Build,
  Science,
  Security,
  Agriculture,
  AccountBalance,
  Analytics,
  Cloud,
  Code,
  Star,
} from '@mui/icons-material';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FocusArea } from '../types/api';
import { mockFocusAreaService } from '../data/mockData';
import { focusAreasApi } from '../services/api';

const FocusAreaDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [focusArea, setFocusArea] = useState<FocusArea | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSolution, setExpandedSolution] = useState<number | false>(false);

  useEffect(() => {
    const fetchFocusArea = async () => {
      if (!slug) {
        setError('Focus area not found');
        setLoading(false);
        return;
      }

      try {
        // Try real API first, fallback to mock data if needed
        let area: FocusArea | undefined;
        try {
          const response = await focusAreasApi.getBySlug(slug);
          area = response.data;
        } catch (apiError) {
          console.warn('Failed to fetch from API, using mock data:', apiError);
          // For now, find from mock data
          const allAreas = await mockFocusAreaService.getFocusAreas();
          area = allAreas.find(a => a.slug === slug);
        }
        
        if (area) {
          setFocusArea(area);
        } else {
          setError('Focus area not found');
        }
      } catch (err) {
        setError('Error loading focus area details');
        console.error('Error fetching focus area:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFocusArea();
  }, [slug]);

  const getIcon = (iconName: string) => {
    const iconProps = { sx: { fontSize: 40 } };
    switch (iconName) {
      case 'cloud': return <Cloud {...iconProps} />;
      case 'medical': return <Science {...iconProps} />;
      case 'security': return <Security {...iconProps} />;
      case 'agriculture': return <Agriculture {...iconProps} />;
      case 'finance': return <AccountBalance {...iconProps} />;
      case 'analytics': return <Analytics {...iconProps} />;
      default: return <Build {...iconProps} />;
    }
  };

  const handleSolutionChange = (panel: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedSolution(isExpanded ? panel : false);
  };

  if (loading) {
    return (
      <Box sx={{ px: 3, py: 4 }}>
        <Skeleton variant="text" height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={300} sx={{ mb: 4 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 4 }}>
          <Box>
            <Skeleton variant="text" height={60} sx={{ mb: 2 }} />
            <Skeleton variant="text" height={100} sx={{ mb: 4 }} />
            {[...Array(3)].map((_, index) => (
              <Skeleton key={index} variant="rectangular" height={100} sx={{ mb: 2 }} />
            ))}
          </Box>
          <Box>
            <Card>
              <CardContent>
                <Skeleton variant="text" height={40} sx={{ mb: 2 }} />
                {[...Array(4)].map((_, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Skeleton variant="text" height={25} sx={{ mb: 1 }} />
                    <Skeleton variant="rectangular" height={8} />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    );
  }

  if (error || !focusArea) {
    return (
      <Box sx={{ px: 3, py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error || 'Focus area not found'}
        </Alert>
        <Button
          component={Link}
          to="/focus-areas"
          variant="contained"
          startIcon={<ArrowBack />}
        >
          Back to Focus Areas
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 3, py: 4 }}>
      {/* Back Button */}
      <Button
        onClick={() => navigate('/focus-areas')}
        startIcon={<ArrowBack />}
        sx={{ mb: 3 }}
      >
        Back to Focus Areas
      </Button>

      {/* Focus Area Header */}
      <Paper 
        sx={{ 
          p: 4, 
          mb: 4,
          background: `linear-gradient(135deg, ${focusArea.color_theme} 0%, ${focusArea.color_theme}CC 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {focusArea.image && (
          <Box
            component="img"
            src={focusArea.image}
            alt={focusArea.name}
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '40%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.2,
              zIndex: 0,
            }}
          />
        )}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ color: 'white', mr: 2 }}>
              {getIcon(focusArea.icon || 'build')}
            </Box>
            <Typography variant="h2" component="h1" fontWeight="bold">
              {focusArea.name}
            </Typography>
            <Chip
              label={focusArea.is_active ? 'Active' : 'Inactive'}
              color={focusArea.is_active ? 'success' : 'default'}
              sx={{ ml: 2 }}
            />
          </Box>
          <Typography variant="h5" sx={{ mb: 3, opacity: 0.9 }}>
            {focusArea.description}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.6, maxWidth: '80%' }}>
            {focusArea.detailed_description}
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 4 }}>
        {/* Main Content */}
        <Box>
          {/* Solutions */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                Our Solutions ({focusArea.solutions.length})
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Comprehensive solutions designed to address specific challenges in {focusArea.name.toLowerCase()}.
              </Typography>
              
              {focusArea.solutions.map((solution, index) => (
                <Accordion
                  key={solution.id}
                  expanded={expandedSolution === solution.id}
                  onChange={handleSolutionChange(solution.id)}
                  sx={{ mb: 2, '&:before': { display: 'none' } }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore />}
                    sx={{ 
                      backgroundColor: `${focusArea.color_theme}10`,
                      '&:hover': { backgroundColor: `${focusArea.color_theme}20` }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
                        {solution.title}
                      </Typography>
                      <Chip 
                        label={`Solution ${index + 1}`} 
                        size="small" 
                        sx={{ 
                          backgroundColor: focusArea.color_theme,
                          color: 'white',
                          mr: 2
                        }} 
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 2 }}>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                      {solution.description}
                    </Typography>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                      {/* Benefits */}
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                          <Star sx={{ mr: 1, color: focusArea.color_theme }} />
                          Key Benefits
                        </Typography>
                        <List dense>
                          {solution.benefits.map((benefit, idx) => (
                            <ListItem key={idx} sx={{ px: 0 }}>
                              <ListItemIcon sx={{ minWidth: 24 }}>
                                <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                              </ListItemIcon>
                              <ListItemText 
                                primary={benefit}
                                primaryTypographyProps={{ variant: 'body2' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                      
                      {/* Use Cases */}
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                          <TrendingUp sx={{ mr: 1, color: focusArea.color_theme }} />
                          Use Cases
                        </Typography>
                        <List dense>
                          {solution.use_cases.map((useCase, idx) => (
                            <ListItem key={idx} sx={{ px: 0 }}>
                              <ListItemIcon sx={{ minWidth: 24 }}>
                                <CheckCircle sx={{ fontSize: 16, color: focusArea.color_theme }} />
                              </ListItemIcon>
                              <ListItemText 
                                primary={useCase}
                                primaryTypographyProps={{ variant: 'body2' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </CardContent>
          </Card>
        </Box>

        {/* Sidebar */}
        <Box>
          {/* Technologies */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Key Technologies ({focusArea.technologies.length})
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {focusArea.technologies.map((tech) => (
                  <Paper key={tech.id} variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {tech.name}
                      </Typography>
                      {tech.website_url && (
                        <Tooltip title="Visit website">
                          <IconButton
                            size="small"
                            href={tech.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ color: focusArea.color_theme }}
                          >
                            <Launch fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                    {tech.description && (
                      <Typography variant="body2" color="text.secondary">
                        {tech.description}
                      </Typography>
                    )}
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Quick Facts
              </Typography>
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Code sx={{ color: focusArea.color_theme }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Technologies"
                    secondary={`${focusArea.technologies.length} core technologies`}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Build sx={{ color: focusArea.color_theme }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Solutions"
                    secondary={`${focusArea.solutions.length} specialized solutions`}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <TrendingUp sx={{ color: focusArea.color_theme }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Status"
                    secondary={focusArea.is_active ? 'Actively developing' : 'In planning'}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Get Started */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Get Started
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Ready to explore {focusArea.name.toLowerCase()} solutions for your organization?
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  component={Link}
                  to="/contact"
                  variant="contained"
                  fullWidth
                  sx={{ 
                    backgroundColor: focusArea.color_theme,
                    '&:hover': {
                      backgroundColor: focusArea.color_theme,
                      opacity: 0.9,
                    }
                  }}
                >
                  Contact Our Experts
                </Button>
                <Button
                  component={Link}
                  to="/projects"
                  variant="outlined"
                  fullWidth
                  sx={{ 
                    borderColor: focusArea.color_theme,
                    color: focusArea.color_theme,
                    '&:hover': {
                      borderColor: focusArea.color_theme,
                      backgroundColor: `${focusArea.color_theme}10`,
                    }
                  }}
                >
                  View Related Projects
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default FocusAreaDetailPage;