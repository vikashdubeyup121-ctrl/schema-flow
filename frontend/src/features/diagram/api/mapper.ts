import type { DiagramResponse } from '../types/DiagramDTO';
import type { Diagram } from '../types/Diagram';

export function mapDiagramResponseToDiagram(dto: DiagramResponse): Diagram {
  return {
    id: dto.id,
    name: dto.name,
    projectId: dto.projectId,
    description: dto.description || undefined,
    dslText: dto.dslText,
    publishedDslText: dto.publishedDslText,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    updatedBy: dto.updatedBy,
    updatedByName: dto.updatedByName,
  };
}
