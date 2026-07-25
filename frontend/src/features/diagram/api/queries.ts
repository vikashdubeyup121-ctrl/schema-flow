import { queryOptions } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/apiClient';
import { Features } from '@/config/features';
import { MOCK_DIAGRAMS } from '../mock/mockDiagrams';
import { mapDiagramResponseToDiagram } from './mapper';
import { diagramKeys } from './keys';
import type { DiagramResponse } from '../types/DiagramDTO';
import type { Diagram } from '../types/Diagram';

async function fetchDiagramsByProject(projectId: string): Promise<Diagram[]> {
  if (Features.mockData) {
    return Promise.resolve(MOCK_DIAGRAMS.filter((d) => d.projectId === projectId));
  }
  const response = await apiClient.get<DiagramResponse[]>(`/projects/${projectId}/diagrams`);
  return response.data.map(mapDiagramResponseToDiagram);
}

export const diagramsByProjectQueryOptions = (projectId: string) =>
  queryOptions({
    queryKey: diagramKeys.byProject(projectId),
    queryFn: () => fetchDiagramsByProject(projectId),
    staleTime: 5 * 60 * 1000,
    enabled: !!projectId,
  });

async function fetchDiagramById(diagramId: string): Promise<Diagram> {
  if (Features.mockData) {
    const diag = MOCK_DIAGRAMS.find((d) => d.id === diagramId);
    if (!diag) throw new Error('Not found');
    return Promise.resolve(diag);
  }
  const response = await apiClient.get<DiagramResponse>(`/diagrams/${diagramId}`);
  return mapDiagramResponseToDiagram(response.data);
}

export const diagramQueryOptions = (diagramId: string) =>
  queryOptions({
    queryKey: diagramKeys.detail(diagramId),
    queryFn: () => fetchDiagramById(diagramId),
    staleTime: 5 * 60 * 1000,
    enabled: !!diagramId,
  });
