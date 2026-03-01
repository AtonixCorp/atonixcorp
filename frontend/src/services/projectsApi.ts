import apiClient from './apiClient';

export interface BackendProject {
  id: string;
  owner?: number;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateBackendProjectPayload {
  id?: string;
  project_key?: string;
  name: string;
  description?: string;
}

export async function listProjects(): Promise<BackendProject[]> {
  const response = await apiClient.get<BackendProject[]>('/api/services/pipelines/projects/');
  return response.data;
}

export async function createProject(payload: CreateBackendProjectPayload): Promise<BackendProject> {
  const response = await apiClient.post<BackendProject>('/api/services/pipelines/projects/', payload);
  return response.data;
}

export async function getProject(projectId: string): Promise<BackendProject> {
  const response = await apiClient.get<BackendProject>(`/api/services/pipelines/projects/${projectId}/`);
  return response.data;
}

export async function deleteProject(projectId: string): Promise<void> {
  await apiClient.delete(`/api/services/pipelines/projects/${projectId}/`);
}
