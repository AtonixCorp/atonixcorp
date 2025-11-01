import axios from 'axios';
import { config } from '../config/environment';
import {
  Project,
  Team,
  FocusArea,
  Resource,
  ResourceCategory,
  CommunityLink,
  FAQ,
  ContactPerson,
  ContactMessage,
  OfficeLocation,
  Technology
} from '../types/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: config.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  // Enable credentials for CORS in production
  withCredentials: config.ENVIRONMENT === 'production',
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Projects API
export const projectsApi = {
  getAll: () => api.get<Project[]>('/projects/'),
  getBySlug: (slug: string) => api.get<Project>(`/projects/${slug}/`),
  getFeatured: () => api.get<Project[]>('/projects/?featured=true'),
  getByStatus: () => api.get<{[key: string]: Project[]}>('/projects/by_status/'),
};

// Teams API
export const teamsApi = {
  getAll: () => api.get<Team[]>('/teams/'),
  getBySlug: (slug: string) => api.get<Team>(`/teams/${slug}/`),
  getMembers: (slug: string) => api.get(`/teams/${slug}/members/`),
  getSkills: (slug: string) => api.get(`/teams/${slug}/skills/`),
  join: (slug: string, data?: { membership_type?: string; role?: string; bio?: string }) =>
    api.post(`/teams/${slug}/join/`, data),
  getMembership: (slug: string) => api.get(`/teams/${slug}/membership/`),
  leave: (slug: string) => api.post(`/teams/${slug}/leave/`),
  teamLogin: (data: { username: string; password: string; team_slug: string }) =>
    api.post('/auth/team-login/', data),
};

// Focus Areas API
export const focusAreasApi = {
  getAll: () => api.get<FocusArea[]>('/focus-areas/'),
  getBySlug: (slug: string) => api.get<FocusArea>(`/focus-areas/${slug}/`),
  getTechnologies: (slug: string) => api.get(`/focus-areas/${slug}/technologies/`),
  getSolutions: (slug: string) => api.get(`/focus-areas/${slug}/solutions/`),
};

// Resources API
export const resourcesApi = {
  getCategories: () => api.get<ResourceCategory[]>('/resource-categories/'),
  getResources: () => api.get<Resource[]>('/resources/'),
  getResourceBySlug: (slug: string) => api.get<Resource>(`/resources/${slug}/`),
  getFeaturedResources: () => api.get<Resource[]>('/resources/?featured=true'),
  getResourcesByCategory: () => api.get('/resources/by_category/'),
  getCommunityLinks: () => api.get<CommunityLink[]>('/community-links/'),
  getFAQs: () => api.get<FAQ[]>('/faqs/'),
  getFeaturedFAQs: () => api.get<FAQ[]>('/faqs/?featured=true'),
  getFAQsByCategory: () => api.get('/faqs/by_category/'),
};

// Contact API
export const contactApi = {
  getContacts: () => api.get<ContactPerson[]>('/contact-persons/'),
  getPrimaryContacts: () => api.get<ContactPerson[]>('/contact-persons/?is_primary=true'),
  getOfficeLocations: () => api.get<OfficeLocation[]>('/office-locations/'),
  getHeadquarters: () => api.get<OfficeLocation>('/office-locations/?is_headquarters=true'),
  sendMessage: (message: ContactMessage) => api.post('/contact-messages/', message),
};

// Dashboard API
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats/'),
  getUserProfile: () => api.get('/dashboard/profile/'),
};

// Service functions for easier use
export const projectService = {
  getProjects: async (): Promise<Project[]> => {
    const response = await projectsApi.getAll();
    return response.data;
  },
  getProject: async (slug: string): Promise<Project> => {
    const response = await projectsApi.getBySlug(slug);
    return response.data;
  },
  getFeaturedProjects: async (): Promise<Project[]> => {
    const response = await projectsApi.getFeatured();
    return response.data;
  }
};

export const technologyService = {
  getTechnologies: async (): Promise<Technology[]> => {
    // For now, return a mock list since we don't have a technologies endpoint yet
    return [
      { id: 1, name: 'React', description: 'Frontend framework' },
      { id: 2, name: 'Django', description: 'Backend framework' },
      { id: 3, name: 'TypeScript', description: 'Programming language' },
      { id: 4, name: 'Python', description: 'Programming language' },
      { id: 5, name: 'PostgreSQL', description: 'Database' },
      { id: 6, name: 'Docker', description: 'Containerization' },
    ];
  }
};

export const focusAreaService = {
  getFocusAreas: async (): Promise<FocusArea[]> => {
    const response = await focusAreasApi.getAll();
    return response.data;
  },
  getFocusArea: async (slug: string): Promise<FocusArea> => {
    const response = await focusAreasApi.getBySlug(slug);
    return response.data;
  }
};

export default api;
