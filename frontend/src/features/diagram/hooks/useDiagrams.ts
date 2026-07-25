import { useQuery } from '@tanstack/react-query';
import { diagramsByProjectQueryOptions } from '../api/queries';
import type { Diagram } from '../types/Diagram';

interface UseDiagramsReturn {
  diagrams: Diagram[];
  isLoading: boolean;
  isError: boolean;
}

export function useDiagrams(projectId: string | null): UseDiagramsReturn {
  const { data, isLoading, isError } = useQuery({
    ...diagramsByProjectQueryOptions(projectId ?? ''),
    enabled: !!projectId,
  });

  return {
    diagrams: data ?? [],
    isLoading,
    isError,
  };
}
