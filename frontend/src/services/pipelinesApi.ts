import apiClient from './apiClient';

/* ───────── shared types ───────── */

export interface BackendPipeline {
  id: string;
  project: string;
  repo: string;
  pipeline_name: string;
  pipeline_file: string;
  branch: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
  triggered_by: string;
  started_at: string;
  finished_at: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BackendPipelineJob {
  id: string;
  pipeline: string;
  name: string;
  stage: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
  started_at: string | null;
  finished_at: string | null;
}

export interface BackendJobLog {
  id: number;
  job: string;
  log: string;
  timestamp: string;
}

export interface BackendRepository {
  id: string;
  project: string;
  provider: 'github' | 'gitlab' | 'bitbucket';
  repo_name: string;
  default_branch: string;
  created_at?: string;
  updated_at?: string;
}

export interface BackendPipelineFile {
  id: string;
  repo: string;
  path: string;
  file_type: string;
}

export interface BackendPipelineArtifact {
  id: string;
  pipeline: string;
  name: string;
  path: string;
  size: number;
  created_at?: string;
}

/* ───────── Pipeline runs ───────── */

export async function listPipelines(params?: {
  project?: string;
  status?: string;
  branch?: string;
}): Promise<BackendPipeline[]> {
  const response = await apiClient.get<BackendPipeline[]>('/api/services/pipelines/runs/', { params });
  return response.data;
}

export async function getPipeline(pipelineId: string): Promise<BackendPipeline> {
  const response = await apiClient.get<BackendPipeline>(`/api/services/pipelines/runs/${pipelineId}/`);
  return response.data;
}

export async function triggerPipeline(data: {
  pipeline_file: string;
  branch: string;
  environment?: string;
}): Promise<BackendPipeline> {
  const response = await apiClient.post<BackendPipeline>('/api/services/pipelines/runs/run/', data);
  return response.data;
}

export async function cancelPipeline(pipelineId: string): Promise<void> {
  await apiClient.post(`/api/services/pipelines/runs/${pipelineId}/cancel/`);
}

export async function approvePipeline(pipelineId: string, type = 'manual'): Promise<void> {
  await apiClient.post(`/api/services/pipelines/runs/${pipelineId}/approve/`, { type });
}

/* ───────── Jobs ───────── */

export async function listPipelineJobs(pipelineId: string): Promise<BackendPipelineJob[]> {
  const response = await apiClient.get<BackendPipelineJob[]>(`/api/services/pipelines/runs/${pipelineId}/jobs/`);
  return response.data;
}

export async function getJobLogs(jobId: string): Promise<BackendJobLog[]> {
  const response = await apiClient.get<BackendJobLog[]>(`/api/services/pipelines/jobs/${jobId}/logs/`);
  return response.data;
}

/* ───────── Repositories ───────── */

export async function listRepositories(): Promise<BackendRepository[]> {
  const response = await apiClient.get<BackendRepository[]>('/api/services/pipelines/repositories/');
  return response.data;
}

export async function getRepositoryBranches(repoId: string): Promise<{ name: string; commit: string }[]> {
  const response = await apiClient.get<{ name: string; commit: string }[]>(
    `/api/services/pipelines/repositories/${repoId}/branches/`,
  );
  return response.data;
}

/* ───────── Pipeline files ───────── */

export async function listPipelineFiles(): Promise<BackendPipelineFile[]> {
  const response = await apiClient.get<BackendPipelineFile[]>('/api/services/pipelines/files/');
  return response.data;
}

/* ───────── Artifacts ───────── */

export async function listArtifacts(params?: { pipeline?: string }): Promise<BackendPipelineArtifact[]> {
  const response = await apiClient.get<BackendPipelineArtifact[]>('/api/services/pipelines/artifacts/', { params });
  return response.data;
}
