import { apiClient } from '@/shared/api/apiClient';
import { queryClient } from '@/shared/api/queryClient';
import { Features } from '@/config/features';
import { mapProjectResponseToProject } from './mapper';
import { projectKeys } from './keys';
import type { ProjectResponse, CreateProjectRequest, UpdateProjectRequest, AddMemberRequest, UpdateMemberRoleRequest, ProjectMemberResponse } from '../types/ProjectDTO';
import type { Project, ProjectMember } from '../types/Project';

export async function createProject(name: string): Promise<Project> {
  if (Features.mockData) {
    const mock: Project = {
      id: crypto.randomUUID(),
      name,
      ownerId: 'mock-user-001',
      diagramCount: 0,
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
    return Promise.resolve({ id, name, ownerId: 'mock-user-001', diagramCount: 0, createdAt: '', updatedAt: '' });
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

export async function addMember(projectId: string, email: string, role: 'EDITOR' | 'VIEWER'): Promise<ProjectMember> {
  if (Features.mockData) {
    return Promise.resolve({} as ProjectMember);
  }
  const body: AddMemberRequest = { email, role };
  const response = await apiClient.post<ProjectMemberResponse>(`/projects/${projectId}/members`, body);
  await queryClient.invalidateQueries({ queryKey: projectKeys.members(projectId) });
  return response.data as unknown as ProjectMember;
}

export async function updateMemberRole(projectId: string, userId: string, role: 'EDITOR' | 'VIEWER'): Promise<ProjectMember> {
  if (Features.mockData) {
    return Promise.resolve({} as ProjectMember);
  }
  const body: UpdateMemberRoleRequest = { role };
  const response = await apiClient.put<ProjectMemberResponse>(`/projects/${projectId}/members/${userId}`, body);
  await queryClient.invalidateQueries({ queryKey: projectKeys.members(projectId) });
  return response.data as unknown as ProjectMember;
}

export async function removeMember(projectId: string, userId: string): Promise<void> {
  if (Features.mockData) {
    return Promise.resolve();
  }
  await apiClient.delete(`/projects/${projectId}/members/${userId}`);
  await queryClient.invalidateQueries({ queryKey: projectKeys.members(projectId) });
}
