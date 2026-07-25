import { apiClient } from '@/shared/api/apiClient';
import { queryClient } from '@/shared/api/queryClient';
import { Features } from '@/config/features';
import { mapProjectResponseToProject } from './mapper';
import { projectKeys } from './keys';
import type { ProjectResponse, CreateProjectRequest, UpdateProjectRequest } from '../types/ProjectDTO';
import type { Project } from '../types/Project';

export async function createProject(name: string): Promise<Project> {
  if (Features.mockData) {
    const mock: Project = {
      id: crypto.randomUUID(),
      name,
      ownerId: 'mock-user-001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    queryClient.setQueryData<Project[]>(projectKeys.lists(), (prev = []) => [...prev, mock]);
    return Promise.resolve(mock);
  }
  const body: CreateProjectRequest = { name };
  const response = await apiClient.post<ProjectResponse>('/projects', body);
  const project = mapProjectResponseToProject(response.data);
  await queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
  return project;
}

export async function updateProject(id: string, name: string): Promise<Project> {
  if (Features.mockData) {
    queryClient.setQueryData<Project[]>(projectKeys.lists(), (prev = []) =>
      prev.map((p) => (p.id === id ? { ...p, name, updatedAt: new Date().toISOString() } : p)),
    );
    return Promise.resolve({ id, name, ownerId: 'mock-user-001', createdAt: '', updatedAt: '' });
  }
  const body: UpdateProjectRequest = { name };
  const response = await apiClient.patch<ProjectResponse>(`/projects/${id}`, body);
  const project = mapProjectResponseToProject(response.data);
  await queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
  return project;
}

export async function deleteProject(id: string): Promise<void> {
  if (Features.mockData) {
    queryClient.setQueryData<Project[]>(projectKeys.lists(), (prev = []) =>
      prev.filter((p) => p.id !== id),
    );
    return Promise.resolve();
  }
  await apiClient.delete(`/projects/${id}`);
  await queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
}
