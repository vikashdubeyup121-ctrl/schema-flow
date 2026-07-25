import { apiClient } from '@/shared/api/apiClient';
import { queryClient } from '@/shared/api/queryClient';
import { Features } from '@/config/features';
import { mapDiagramResponseToDiagram } from './mapper';
import { diagramKeys } from './keys';
import type { DiagramResponse, CreateDiagramRequest, UpdateDiagramRequest } from '../types/DiagramDTO';
import type { Diagram } from '../types/Diagram';

export async function createDiagram(name: string, projectId: string): Promise<Diagram> {
  if (Features.mockData) {
    const mock: Diagram = {
      id: crypto.randomUUID(),
      name,
      projectId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    queryClient.setQueryData<Diagram[]>(diagramKeys.byProject(projectId), (prev = []) => [
      ...prev,
      mock,
    ]);
    return Promise.resolve(mock);
  }
  const body: CreateDiagramRequest = { name, project_id: projectId };
  const response = await apiClient.post<DiagramResponse>('/diagrams', body);
  const diagram = mapDiagramResponseToDiagram(response.data);
  await queryClient.invalidateQueries({ queryKey: diagramKeys.byProject(projectId) });
  return diagram;
}

export async function updateDiagram(id: string, name: string, projectId: string): Promise<Diagram> {
  if (Features.mockData) {
    queryClient.setQueryData<Diagram[]>(diagramKeys.byProject(projectId), (prev = []) =>
      prev.map((d) => (d.id === id ? { ...d, name, updatedAt: new Date().toISOString() } : d)),
    );
    return Promise.resolve({ id, name, projectId, createdAt: '', updatedAt: '' });
  }
  const body: UpdateDiagramRequest = { name };
  const response = await apiClient.patch<DiagramResponse>(`/diagrams/${id}`, body);
  const diagram = mapDiagramResponseToDiagram(response.data);
  await queryClient.invalidateQueries({ queryKey: diagramKeys.byProject(projectId) });
  return diagram;
}

export async function deleteDiagram(id: string, projectId: string): Promise<void> {
  if (Features.mockData) {
    queryClient.setQueryData<Diagram[]>(diagramKeys.byProject(projectId), (prev = []) =>
      prev.filter((d) => d.id !== id),
    );
    return Promise.resolve();
  }
  await apiClient.delete(`/diagrams/${id}`);
  await queryClient.invalidateQueries({ queryKey: diagramKeys.byProject(projectId) });
}
