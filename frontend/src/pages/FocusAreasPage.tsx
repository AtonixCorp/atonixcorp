import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Skeleton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ArrowForward,
  TrendingUp,
  Build,
  Science,
  Security,
  Agriculture,
  AccountBalance,
  Analytics,
  Launch,
  CheckCircle,
  StarBorder,
  Code,
  Cloud,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { FocusArea } from '../types/api';
import { mockFocusAreaService } from '../data/mockData';
import { focusAreasApi } from '../services/api';

const FocusAreasPage: React.FC = () => {
  const location = useLocation();
  const isDashboardMode = location.pathname.startsWith('/dashboard');

  const [focusAreas, setFocusAreas] = useState<FocusArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const fetchFocusAreas = async () => {
      setLoading(true);
      try {
        // Try real API first, fallback to mock data if needed
        let areasData: FocusArea[];
        try {
          const response = await focusAreasApi.getAll();
          areasData = response.data;
        } catch (apiError) {
          console.warn('Failed to fetch from API, using mock data:', apiError);
          areasData = await mockFocusAreaService.getFocusAreas();
        }
        
        setFocusAreas(areasData);
      } catch (error) {
        console.error('Error fetching focus areas:', error);
        setError('Failed to load focus areas');
      } finally {
        setLoading(false);
      }
    };

    fetchFocusAreas();
  }, []);

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

  const categories = [
    { id: 'all', name: 'All Areas', count: focusAreas.length },
    { id: 'technology', name: 'Technology', count: focusAreas.filter(area => ['infrastructure', 'security', 'big-data'].includes(area.slug)).length },
    { id: 'ai-research', name: 'AI & Research', count: focusAreas.filter(area => ['medical-research', 'big-data'].includes(area.slug)).length },
    { id: 'industry', name: 'Industry Solutions', count: focusAreas.filter(area => ['agriculture', 'fintech'].includes(area.slug)).length },
  ];

  const filteredFocusAreas = selectedCategory === 'all' 
    ? focusAreas 
    : focusAreas.filter(area => {
        switch (selectedCategory) {
          case 'technology':
            return ['infrastructure', 'security', 'big-data'].includes(area.slug);
          case 'ai-research':
            return ['medical-research', 'big-data'].includes(area.slug);
          case 'industry':
            return ['agriculture', 'fintech'].includes(area.slug);
          default:
            return true;
        }
      });

  if (loading) {
    return (
      <Box sx={{ py: isDashboardMode ? 0 : 4 }}>
        {!isDashboardMode && (
          <Box sx={{ px: 3, py: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Skeleton variant="text" height={60} sx={{ mb: 2 }} />
              <Skeleton variant="text" height={40} />
            </Box>
          </Box>
        )}
        {isDashboardMode && (
          <Box sx={{ mb: 3 }}>
            <Skeleton variant="text" height={40} sx={{ mb: 2 }} />
            <Skeleton variant="text" height={30} />
          </Box>
        )}
        
        {/* Category filters skeleton */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
          ))}
        </Box>

        {/* Focus areas skeleton */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 4 }}>
          {[...Array(6)].map((_, index) => (
            <Card key={index}>
              <Skeleton variant="rectangular" height={200} />
              <CardContent>
                <Skeleton variant="text" height={40} sx={{ mb: 2 }} />
                <Skeleton variant="text" height={60} sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
                  ))}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    );
  }

  const content = (
    <>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant={isDashboardMode ? "h4" : "h2"} component="h1" fontWeight="bold" gutterBottom>
          Focus Areas
        </Typography>
        <Typography variant={isDashboardMode ? "body1" : "h6"} color="text.secondary" sx={{ mb: 4 }}>
          Explore our areas of expertise and specialized solutions
        </Typography>
        
        {/* Stats */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3, mb: 6 }}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <TrendingUp color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {focusAreas.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Specialized Areas
            </Typography>
          </Paper>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Code color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {focusAreas.reduce((total, area) => total + area.technologies.length, 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Technologies
            </Typography>
          </Paper>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <StarBorder color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {focusAreas.reduce((total, area) => total + area.solutions.length, 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Solutions
            </Typography>
          </Paper>
        </Box>
      </Box>

      {/* Category Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'contained' : 'outlined'}
            onClick={() => setSelectedCategory(category.id)}
            sx={{ 
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: selectedCategory === category.id ? 'bold' : 'normal'
            }}
          >
            {category.name} ({category.count})
          </Button>
        ))}
      </Box>

      {/* Focus Areas Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 4, mb: 6 }}>
        {filteredFocusAreas.map((area) => (
          <Card
            key={area.id}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: 6,
              },
              border: `2px solid ${area.color_theme}20`,
            }}
          >
            {area.image && (
              <CardMedia
                component="img"
                height="200"
                image={area.image}
                alt={area.name}
                sx={{ objectFit: 'cover' }}
              />
            )}
            
            <CardContent sx={{ flexGrow: 1, p: 3 }}>
              {/* Icon and Title */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ color: area.color_theme, mr: 2 }}>
                  {getIcon(area.icon || 'build')}
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
                    {area.name}
                  </Typography>
                  <Chip
                    label={area.is_active ? 'Active' : 'Inactive'}
                    color={area.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
              </Box>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                {area.description}
              </Typography>

              {/* Technologies Preview */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                  Key Technologies:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {area.technologies.slice(0, 3).map((tech) => (
                    <Chip
                      key={tech.id}
                      label={tech.name}
                      variant="outlined"
                      size="small"
                      sx={{ borderColor: area.color_theme, color: area.color_theme }}
                    />
                  ))}
                  {area.technologies.length > 3 && (
                    <Chip
                      label={`+${area.technologies.length - 3} more`}
                      variant="outlined"
                      size="small"
                      color="primary"
                    />
                  )}
                </Box>
              </Box>

              {/* Solutions Preview */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                  Solutions ({area.solutions.length}):
                </Typography>
                <List dense sx={{ py: 0 }}>
                  {area.solutions.slice(0, 2).map((solution) => (
                    <ListItem key={solution.id} sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 24 }}>
                        <CheckCircle sx={{ fontSize: 16, color: area.color_theme }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={solution.title}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                      />
                    </ListItem>
                  ))}
                  {area.solutions.length > 2 && (
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 24 }}>
                        <CheckCircle sx={{ fontSize: 16, color: 'grey.400' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`+${area.solutions.length - 2} more solutions`}
                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                      />
                    </ListItem>
                  )}
                </List>
              </Box>

              <Button
                component={Link}
                to={isDashboardMode ? `/dashboard/focus-areas/${area.slug}` : `/focus-areas/${area.slug}`}
                variant="contained"
                fullWidth
                size="large"
                endIcon={<ArrowForward />}
                sx={{ 
                  backgroundColor: area.color_theme,
                  '&:hover': {
                    backgroundColor: area.color_theme,
                    opacity: 0.9,
                  }
                }}
              >
                Explore {area.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Technology Showcase */}
      <Paper sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 3, textAlign: 'center' }}>
          Our Technology Stack
        </Typography>
        <Typography variant="h6" sx={{ mb: 4, textAlign: 'center', opacity: 0.9 }}>
          Cutting-edge technologies powering our solutions
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
          {/* Sample of key technologies across all focus areas */}
          {focusAreas.slice(0, 4).map((area) => (
            <Box key={area.id} sx={{ textAlign: 'center' }}>
              <Box sx={{ color: 'white', mb: 2 }}>
                {getIcon(area.icon || 'build')}
              </Box>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                {area.name}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {area.technologies.length} technologies
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Case Studies Preview */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 3, textAlign: 'center' }}>
            Success Stories
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
            Real-world applications of our expertise
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ color: '#1976d2', mb: 2 }}>
                <Cloud sx={{ fontSize: 50 }} />
              </Box>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                99.9% Uptime
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Infrastructure solutions delivering enterprise-grade reliability
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ color: '#4caf50', mb: 2 }}>
                <Science sx={{ fontSize: 50 }} />
              </Box>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                50% Faster Discovery
              </Typography>
              <Typography variant="body2" color="text.secondary">
                AI-powered medical research accelerating drug development
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ color: '#f44336', mb: 2 }}>
                <Security sx={{ fontSize: 50 }} />
              </Box>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                Zero Breaches
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Advanced security systems protecting critical infrastructure
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Call to Action - Only show outside dashboard */}
      {!isDashboardMode && (
        <Card sx={{ textAlign: 'center', p: 4, background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)', color: 'white' }}>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
            Ready to Innovate?
          </Typography>
          <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
            Let's discuss how our expertise can drive your next breakthrough
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              component={Link}
              to="/contact"
              variant="contained"
              size="large"
              sx={{ 
                backgroundColor: 'white',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'grey.100',
                }
              }}
            >
              Start a Project
            </Button>
            <Button
              component={Link}
              to="/projects"
              variant="outlined"
              size="large"
              sx={{ 
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              View Our Work
            </Button>
          </Box>
        </Card>
      )}
    </>
  );

  return isDashboardMode ? (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Focus Areas
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Explore our areas of expertise and specialized solutions
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

export default FocusAreasPage;