import { useQuery } from '@tanstack/react-query';
import { projectsQueryOptions } from '../api/queries';
import type { Project } from '../types/Project';

interface UseProjectsReturn {
  projects: Project[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useProjects(): UseProjectsReturn {
  const { data, isLoading, isError, refetch } = useQuery(projectsQueryOptions);

  return {
    projects: data ?? [],
    isLoading,
    isError,
    refetch,
  };
}
