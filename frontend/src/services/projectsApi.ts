import apiClient from './apiClient';

export interface BackendProject {
  id:             string;
  owner?:         number;
  owner_username?: string;
  name:           string;
  project_key:    string;
  namespace:      string;
  description:    string;
  visibility:     'private' | 'team' | 'public';
  avatar_color:   string;
  last_activity:  string | null;
  repo_count:     number;
  pipeline_count: number;
  has_repo:       boolean;
  created_at?:    string;
  updated_at?:    string;
}

export interface ProjectStats {
  repo_count:        number;
  pipeline_count:    number;
  environment_count: number;
  has_repo:          boolean;
}

export interface CreateBackendProjectPayload {
  name:        string;
  project_key?: string;
  description?: string;
  visibility?:  'private' | 'team' | 'public';
  avatar_color?: string;
}

export async function listProjects(): Promise<BackendProject[]> {
  const response = await apiClient.get<BackendProject[] | { results: BackendProject[]; count: number }>(
    '/api/services/pipelines/projects/',
  );
  const d = response.data;
  return Array.isArray(d) ? d : (d as any).results ?? [];
}

export async function createProject(payload: CreateBackendProjectPayload): Promise<BackendProject> {
  const response = await apiClient.post<BackendProject>('/api/services/pipelines/projects/', payload);
  return response.data;
}

export async function getProject(projectId: string): Promise<BackendProject> {
  if (!projectId || projectId === 'new' || projectId === 'create') {
    throw new Error('Invalid project id for detail endpoint.');
  }
  const response = await apiClient.get<BackendProject>(`/api/services/pipelines/projects/${projectId}/`);
  return response.data;
}

export async function updateProject(projectId: string, payload: Partial<CreateBackendProjectPayload>): Promise<BackendProject> {
  const response = await apiClient.patch<BackendProject>(`/api/services/pipelines/projects/${projectId}/`, payload);
  return response.data;
}

export async function deleteProject(projectId: string): Promise<void> {
  if (!projectId || projectId === 'new' || projectId === 'create') {
    throw new Error('Invalid project id for delete endpoint.');
  }
  await apiClient.delete(`/api/services/pipelines/projects/${projectId}/`);
}

export async function getProjectStats(projectId: string): Promise<ProjectStats> {
  const response = await apiClient.get<ProjectStats>(`/api/services/pipelines/projects/${projectId}/stats/`);
  return response.data;
}

export interface BackendRepository {
  id:             string;
  project:        string;
  project_name?:  string;
  provider:       string;
  repo_name:      string;
  default_branch: string;
  created_at?:    string;
  updated_at?:    string;
}

export async function listProjectRepos(projectId: string): Promise<BackendRepository[]> {
  const response = await apiClient.get<BackendRepository[] | { results: BackendRepository[] }>(
    `/api/services/pipelines/repositories/?project=${projectId}`,
  );
  const d = response.data;
  return Array.isArray(d) ? d : (d as any).results ?? [];
}

export async function updateRepo(repoId: string, payload: Partial<Pick<BackendRepository, 'repo_name' | 'default_branch'>>): Promise<BackendRepository> {
  const response = await apiClient.patch<BackendRepository>(`/api/services/pipelines/repositories/${repoId}/`, payload);
  return response.data;
}

export async function deleteRepo(repoId: string): Promise<void> {
  await apiClient.delete(`/api/services/pipelines/repositories/${repoId}/`);
}

export interface TreeNode {
  name:      string;
  type:      'file' | 'dir';
  path:      string;
  content?:  string;
  children?: TreeNode[];
}

export async function getRepoTree(repoId: string): Promise<TreeNode[]> {
  const response = await apiClient.get<TreeNode[]>(
    `/api/services/pipelines/repositories/${repoId}/tree/`,
  );
  return response.data;
}
