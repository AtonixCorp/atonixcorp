// AtonixCorp Cloud – API service for onboarding dashboard

import axios from 'axios';
import { config } from '../config/environment';
import type {
  ManagedDatabase, CreateDatabasePayload, ScaleDatabasePayload,
  DBEngineCatalogue, MigratePayload, DBMigrationResult,
} from '../types/database';
import type {
  ContainerRepository, CreateRepositoryPayload, CreateTokenPayload,
  ReplicatePayload, RegistryToken, ScanResult,
} from '../types/registry';
import {
  OnboardingProgress,
  DashboardStats,
  WizardOptions,
  CreateServerPayload,
  VMInstance,
  CreateVMPayload,
} from '../types/cloud';

// Cloud API client – routes under /api/services/*
const cloudClient = axios.create({
  baseURL: config.API_BASE_URL + '/services',
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

// ---- Managed Databases ----
export const databaseApi = {
  // CRUD
  list:    ()                         => cloudClient.get<ManagedDatabase[]>('/databases/'),
  get:     (id: string)               => cloudClient.get<ManagedDatabase>(`/databases/${id}/`),
  create:  (p: CreateDatabasePayload) => cloudClient.post<ManagedDatabase>('/databases/', p),
  delete:  (id: string)               => cloudClient.delete(`/databases/${id}/`),
  // Lifecycle actions
  scale:   (id: string, p: ScaleDatabasePayload) => cloudClient.post<ManagedDatabase>(`/databases/${id}/scale/`, p),
  restart: (id: string)               => cloudClient.post(`/databases/${id}/restart/`),
  // Credentials
  credentials: (id: string)           => cloudClient.get(`/databases/${id}/credentials/`),
  rotate:  (id: string, username?: string) => cloudClient.post(`/databases/${id}/rotate/`, { username }),
  // Backups
  backups: (id: string)               => cloudClient.get(`/databases/${id}/backups/`),
  backup:  (id: string, type = 'manual') => cloudClient.post(`/databases/${id}/backup/`, { backup_type: type }),
  restore: (id: string, backup_id: string) => cloudClient.post(`/databases/${id}/restore/`, { backup_id }),
  // Metrics
  metrics: (id: string)               => cloudClient.get(`/databases/${id}/metrics/`),
  // Migration
  migrate: (id: string, p: MigratePayload) => cloudClient.post<DBMigrationResult>(`/databases/${id}/migrate/`, p),
  // Catalogue
  engines: ()                         => cloudClient.get<DBEngineCatalogue[]>('/databases/engines/'),
  regions: ()                         => cloudClient.get('/databases/regions/'),
};

// ---- OpenStack VM management (/cloud/*) ----
export const vmApi = {
  list:         ()              => cloudClient.get<VMInstance[]>('/cloud/servers/'),
  create:       (p: CreateVMPayload) => cloudClient.post<VMInstance>('/cloud/servers/', p),
  get:          (id: string)   => cloudClient.get<VMInstance>(`/cloud/servers/${id}/`),
  delete:       (id: string)   => cloudClient.delete(`/cloud/servers/${id}/`),
  start:        (id: string)   => cloudClient.post(`/cloud/servers/${id}/start/`),
  stop:         (id: string)   => cloudClient.post(`/cloud/servers/${id}/stop/`),
  reboot:       (id: string)   => cloudClient.post(`/cloud/servers/${id}/reboot/`),
  listFlavors:  ()             => cloudClient.get('/cloud/flavors/'),
  listImages:   ()             => cloudClient.get('/cloud/images/'),
  listNetworks: ()             => cloudClient.get('/cloud/networks/'),
  cloudStatus:  ()             => cloudClient.get('/cloud/status/'),
};

// ---- Container Registry ----
export const registryApi = {
  // Repositories
  list:         ()                              => cloudClient.get<ContainerRepository[]>('/registries/'),
  get:          (id: string)                    => cloudClient.get<ContainerRepository>(`/registries/${id}/`),
  create:       (p: CreateRepositoryPayload)    => cloudClient.post<ContainerRepository>('/registries/', p),
  delete:       (id: string)                    => cloudClient.delete(`/registries/${id}/`),
  // Images
  images:       (id: string)                    => cloudClient.get(`/registries/${id}/images/`),
  deleteTag:    (id: string, tag: string)       => cloudClient.post(`/registries/${id}/delete_tag/`, { tag }),
  // Tokens (repo-scoped)
  tokens:       (id: string)                    => cloudClient.get<RegistryToken[]>(`/registries/${id}/tokens/`),
  createToken:  (id: string, p: CreateTokenPayload) => cloudClient.post<RegistryToken>(`/registries/${id}/create_token/`, p),
  revokeToken:  (id: string, token_id: string)  => cloudClient.post(`/registries/${id}/revoke_token/`, { token_id }),
  // Global tokens
  myTokens:           ()                        => cloudClient.get<RegistryToken[]>('/registries/my_tokens/'),
  createGlobalToken:  (p: CreateTokenPayload)   => cloudClient.post<RegistryToken>('/registries/create_global_token/', p),
  revokeGlobalToken:  (token_id: string)        => cloudClient.post('/registries/revoke_global_token/', { token_id }),
  // Replication
  replication:  (id: string)                    => cloudClient.get(`/registries/${id}/replication/`),
  replicate:    (id: string, p: ReplicatePayload) => cloudClient.post(`/registries/${id}/replicate/`, p),
  // Usage & scan
  usage:        (id: string)                    => cloudClient.get(`/registries/${id}/usage/`),
  scan:         (id: string, tag: string)       => cloudClient.post<ScanResult>(`/registries/${id}/scan/`, { tag }),
  // Catalogue
  regions:      ()                              => cloudClient.get('/registries/regions/'),
};
