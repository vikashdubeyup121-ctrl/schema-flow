import type { DiagramResponse } from '../types/DiagramDTO';
import type { Diagram } from '../types/Diagram';

export function mapDiagramResponseToDiagram(dto: DiagramResponse): Diagram {
  return {
    id: dto.id,
    name: dto.name,
    projectId: dto.project_id,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}
