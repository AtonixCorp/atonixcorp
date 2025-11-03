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
const FocusAreasPage: React.FC = () => {
  const location = useLocation();
  const isDashboardMode = location.pathname.startsWith('/dashboard');

  const [focusAreas, setFocusAreas] = useState<FocusArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const fetchFocusAreas = async () => {
      try {
        setLoading(true);
        const data = await mockFocusAreaService.getFocusAreas();
        setFocusAreas(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load focus areas');
        setFocusAreas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFocusAreas();
  }, []);

  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      'trending-up': <TrendingUp sx={{ fontSize: 24 }} />,
      'build': <Build sx={{ fontSize: 24 }} />,
      'science': <Science sx={{ fontSize: 24 }} />,
      'security': <Security sx={{ fontSize: 24 }} />,
      'agriculture': <Agriculture sx={{ fontSize: 24 }} />,
      'account-balance': <AccountBalance sx={{ fontSize: 24 }} />,
      'analytics': <Analytics sx={{ fontSize: 24 }} />,
      'code': <Code sx={{ fontSize: 24 }} />,
      'cloud': <Cloud sx={{ fontSize: 24 }} />,
    };
    return icons[iconName] || <Build sx={{ fontSize: 24 }} />;
  };

  const filteredFocusAreas = focusAreas;

  const categories = ['all'];

  if (loading) {
    return (
      <Box sx={{ px: 3, py: 4 }}>
        {isDashboardMode && (
          <Box sx={{ mb: 3 }}>
            <Skeleton variant="text" height={40} sx={{ mb: 2 }} />
            <Skeleton variant="text" height={30} />
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2, mb: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
          ))}
        </Box>

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

  return (
    <Box sx={{ px: isDashboardMode ? 2 : 3, py: 4 }}>
      {isDashboardMode && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Focus Areas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Explore our areas of expertise and specialized solutions
          </Typography>
        </Box>
      )}

      {!isDashboardMode && (
        <Box sx={{ mb: 6 }}>
          <Card sx={{ position: 'relative', overflow: 'hidden', minHeight: 400 }}>
            <CardMedia
              component="img"
              height="400"
              image="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
              alt="AtonixCorp Focus Areas"
              sx={{
                objectFit: 'cover',
                filter: 'brightness(0.4)'
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                p: 4
              }}
            >
              <Box>
                <Typography
                  variant="h2"
                  component="h1"
                  fontWeight="bold"
                  sx={{
                    color: 'white',
                    mb: 2,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                    fontSize: { xs: '2.5rem', md: '3.5rem' }
                  }}
                >
                  Areas of Expertise
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    color: 'white',
                    mb: 4,
                    opacity: 0.9,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                    maxWidth: 600,
                    mx: 'auto'
                  }}
                >
                  Discover our specialized solutions across technology, research, and industry sectors
                </Typography>
              </Box>
            </Box>
          </Card>
        </Box>
      )}

      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 4, textAlign: 'center' }}>
          All Focus Areas
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 4 }}>
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
                  sx={{
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.05)'
                    }
                  }}
                />
              )}

              <CardContent sx={{ flexGrow: 1, p: 3 }}>
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
      </Box>
    </Box>
  );
};

export default FocusAreasPage;
