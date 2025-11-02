import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Skeleton,
  SelectChangeEvent,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { Project, Technology, FocusArea } from '../types/api';
import { mockProjectService, mockTechnologyService, mockFocusAreaService } from '../data/mockData';
import { projectsApi } from '../services/api';

const ProjectsPage: React.FC = () => {
  const location = useLocation();
  const isDashboardMode = location.pathname.startsWith('/dashboard');

  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTechnology, setSelectedTechnology] = useState('');
  const [selectedFocusArea, setSelectedFocusArea] = useState('');
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Try real API first, fallback to mock data if needed
        let projectsData: Project[];
        try {
          const response = await projectsApi.getAll();
          projectsData = response.data;
        } catch (apiError) {
          console.warn('Failed to fetch from API, using mock data:', apiError);
          projectsData = await mockProjectService.getProjects();
        }

        setProjects(projectsData);

        // Fetch technologies and focus areas
        const techData = await mockTechnologyService.getTechnologies();
        setTechnologies(techData);

        const focusData = await mockFocusAreaService.getFocusAreas();
        setFocusAreas(focusData);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedTechnology) {
      filtered = filtered.filter(project =>
        project.technologies.some(tech => tech.id.toString() === selectedTechnology)
      );
    }

    if (selectedFocusArea) {
      filtered = filtered.filter(project =>
        project.focus_areas.some(area => area.id.toString() === selectedFocusArea)
      );
    }

    setFilteredProjects(filtered);
  }, [projects, searchTerm, selectedTechnology, selectedFocusArea]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleTechnologyChange = (event: SelectChangeEvent) => {
    setSelectedTechnology(event.target.value);
  };

  const handleFocusAreaChange = (event: SelectChangeEvent) => {
    setSelectedFocusArea(event.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTechnology('');
    setSelectedFocusArea('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'primary';
      case 'on_hold':
        return 'warning';
      case 'planning':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      case 'on_hold':
        return 'On Hold';
      case 'planning':
        return 'Planning';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Box sx={{ py: isDashboardMode ? 0 : 4 }}>
        {!isDashboardMode && (
          <Container maxWidth="lg">
            <Typography variant="h3" component="h1" gutterBottom>
              Projects
            </Typography>
            <Typography variant="h6" color="text.secondary" paragraph>
              Explore our innovative projects and initiatives
            </Typography>
          </Container>
        )}
        {isDashboardMode && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Projects
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Explore our innovative projects and initiatives
            </Typography>
          </Box>
        )}

        {/* Loading Skeleton */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
          {[...Array(6)].map((_, index) => (
            <Skeleton variant="rectangular" height={300} key={index} />
          ))}
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: isDashboardMode ? 0 : 4 }}>
        {!isDashboardMode && (
          <Container maxWidth="lg">
            <Typography variant="h3" component="h1" gutterBottom>
              Projects
            </Typography>
          </Container>
        )}
        {isDashboardMode && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Projects
            </Typography>
          </Box>
        )}
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            We're having trouble loading the projects. Please try again.
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setError(null);
              setLoading(true);
              // Re-run the fetch logic
              const fetchData = async () => {
                try {
                  let projectsData: Project[];
                  try {
                    const response = await projectsApi.getAll();
                    projectsData = response.data;
                  } catch (apiError) {
                    console.warn('Failed to fetch from API, using mock data:', apiError);
                    projectsData = await mockProjectService.getProjects();
                  }
                  setProjects(projectsData);

                  // Fetch technologies and focus areas
                  const techData = await mockTechnologyService.getTechnologies();
                  setTechnologies(techData);

                  const focusData = await mockFocusAreaService.getFocusAreas();
                  setFocusAreas(focusData);
                } catch (err) {
                  console.error('Error fetching projects:', err);
                  setError('Failed to load projects');
                } finally {
                  setLoading(false);
                }
              };
              fetchData();
            }}
          >
            Try Again
          </Button>
        </Box>
      </Box>
    );
  }

  const content = (
    <>
      {/* Filters Section */}
      <Card sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Filter Projects
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3, alignItems: 'center' }}>
          <TextField
            fullWidth
            label="Search projects..."
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
          />

          <FormControl fullWidth>
            <InputLabel>Technology</InputLabel>
            <Select
              value={selectedTechnology}
              label="Technology"
              onChange={handleTechnologyChange}
            >
              <MenuItem value="">All Technologies</MenuItem>
              {technologies.map((tech) => (
                <MenuItem key={tech.id} value={tech.id.toString()}>
                  {tech.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Focus Area</InputLabel>
            <Select
              value={selectedFocusArea}
              label="Focus Area"
              onChange={handleFocusAreaChange}
            >
              <MenuItem value="">All Focus Areas</MenuItem>
              {focusAreas.map((area) => (
                <MenuItem key={area.id} value={area.id.toString()}>
                  {area.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            onClick={clearFilters}
            disabled={!searchTerm && !selectedTechnology && !selectedFocusArea}
          >
            Clear Filters
          </Button>
        </Box>
      </Card>

      {/* Results Summary */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Showing {filteredProjects.length} of {projects.length} projects
        </Typography>
      </Box>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No projects found
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Try adjusting your filters or search terms.
          </Typography>
          <Button variant="contained" onClick={clearFilters}>
            Clear Filters
          </Button>
        </Card>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              {project.image && (
                <Box
                  component="img"
                  src={project.image}
                  alt={project.name}
                  sx={{
                    width: '100%',
                    height: 200,
                    objectFit: 'cover',
                  }}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={getStatusLabel(project.status)}
                    color={getStatusColor(project.status) as any}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                </Box>

                <Typography variant="h6" component="h3" gutterBottom>
                  {project.name}
                </Typography>

                <Typography variant="body2" color="text.secondary" paragraph>
                  {project.description.length > 150
                    ? `${project.description.substring(0, 150)}...`
                    : project.description}
                </Typography>

                {/* Technologies */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom component="div">
                    Technologies:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {project.technologies.slice(0, 3).map((tech) => (
                      <Chip
                        key={tech.id}
                        label={tech.name}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                    {project.technologies.length > 3 && (
                      <Chip
                        label={`+${project.technologies.length - 3} more`}
                        variant="outlined"
                        size="small"
                        color="primary"
                      />
                    )}
                  </Box>
                </Box>

                {/* Focus Areas */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom component="div">
                    Focus Areas:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {project.focus_areas.slice(0, 2).map((area) => (
                      <Chip
                        key={area.id}
                        label={area.name}
                        variant="filled"
                        size="small"
                        color="secondary"
                      />
                    ))}
                    {project.focus_areas.length > 2 && (
                      <Chip
                        label={`+${project.focus_areas.length - 2} more`}
                        variant="filled"
                        size="small"
                        color="secondary"
                      />
                    )}
                  </Box>
                </Box>

                {project.start_date && (
                  <Typography variant="caption" color="text.secondary">
                    Started: {formatDate(project.start_date)}
                  </Typography>
                )}
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  component={Link}
                  to={isDashboardMode ? `/dashboard/projects/${project.id}` : `/projects/${project.id}`}
                  variant="contained"
                  fullWidth
                >
                  View Details
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

      {/* Call to Action - Only show outside dashboard */}
      {!isDashboardMode && (
        <Card sx={{ mt: 6, p: 4, textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Typography variant="h5" gutterBottom>
            Have a Project Idea?
          </Typography>
          <Typography variant="body1" paragraph>
            We're always looking for innovative projects to work on. Get in touch with us!
          </Typography>
          <Button
            component={Link}
            to="/contact"
            variant="contained"
            color="inherit"
            size="large"
            sx={{
              color: 'primary.main',
              backgroundColor: 'white',
              '&:hover': {
                backgroundColor: 'grey.100',
              }
            }}
          >
            Contact Us
          </Button>
        </Card>
      )}
    </>
  );

  return isDashboardMode ? (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Projects
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Explore our innovative projects and initiatives
        </Typography>
      </Box>
      {content}
    </Box>
  ) : (
    <Box sx={{ px: 3, py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Projects
      </Typography>
      <Typography variant="h6" color="text.secondary" paragraph>
        Explore our innovative projects and initiatives
      </Typography>
      {content}
    </Box>
  );
};

export default ProjectsPage;
