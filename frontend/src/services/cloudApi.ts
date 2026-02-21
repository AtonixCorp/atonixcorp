// AtonixCorp Cloud – API service for onboarding dashboard

import axios from 'axios';
import { config } from '../config/environment';
import {
  OnboardingProgress,
  DashboardStats,
  WizardOptions,
  CreateServerPayload,
} from '../types/cloud';

const cloudClient = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: config.API_TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

// Attach auth token on every request
cloudClient.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('authToken');
  if (token) cfg.headers.Authorization = `Token ${token}`;
  return cfg;
});

// On 401 redirect to home
cloudClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

// ---- Onboarding checklist ----
export const onboardingApi = {
  getChecklist: () =>
    cloudClient.get<OnboardingProgress>('/onboarding/checklist/'),

  updateChecklist: (updates: Partial<OnboardingProgress>) =>
    cloudClient.patch<OnboardingProgress>('/onboarding/checklist/update/', updates),
};

// ---- Dashboard stats ----
export const dashboardApi = {
  getStats: () =>
    cloudClient.get<DashboardStats>('/onboarding/stats/'),

  getWizardOptions: () =>
    cloudClient.get<WizardOptions>('/onboarding/wizard-options/'),
};

// ---- Server management ----
export const serversApi = {
  list: () => cloudClient.get('/instances/'),
  create: (payload: CreateServerPayload) => cloudClient.post('/instances/', payload),
  get: (id: string) => cloudClient.get(`/instances/${id}/`),
  delete: (id: string) => cloudClient.delete(`/instances/${id}/`),
};

// ---- Storage ----
export const volumesApi = {
  list: () => cloudClient.get('/volumes/'),
};

// ---- Networking ----
export const networksApi = {
  list: () => cloudClient.get('/vpcs/'),
};
