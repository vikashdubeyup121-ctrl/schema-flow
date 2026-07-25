import type { DiagramResponse } from '../types/DiagramDTO';
import type { Diagram } from '../types/Diagram';

export function mapDiagramResponseToDiagram(dto: DiagramResponse): Diagram {
  return {
    id: dto.id,
    name: dto.name,
    projectId: dto.projectId,
    dslText: dto.dslText,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}
