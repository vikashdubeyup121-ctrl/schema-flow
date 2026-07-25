import { queryOptions } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/apiClient';
import { Features } from '@/config/features';
import { MOCK_PROJECTS } from '../mock/mockProjects';
import { mapProjectResponseToProject } from './mapper';
import { projectKeys } from './keys';
import type { ProjectResponse } from '../types/ProjectDTO';
import type { Project } from '../types/Project';

async function fetchProjects(): Promise<Project[]> {
  if (Features.mockData) {
    return Promise.resolve(MOCK_PROJECTS);
  }
  const response = await apiClient.get<ProjectResponse[]>('/projects');
  return response.data.map(mapProjectResponseToProject);
}

export const projectsQueryOptions = queryOptions({
  queryKey: projectKeys.lists(),
  queryFn: fetchProjects,
  staleTime: 5 * 60 * 1000,
});
