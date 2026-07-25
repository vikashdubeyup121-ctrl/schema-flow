import type { ProjectResponse } from '../types/ProjectDTO';
import type { Project } from '../types/Project';

export function mapProjectResponseToProject(dto: ProjectResponse): Project {
  return {
    id: dto.id,
    name: dto.name,
    ownerId: dto.ownerId,
    diagramCount: dto.diagramCount,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}
