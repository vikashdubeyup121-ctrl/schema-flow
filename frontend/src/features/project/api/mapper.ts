import type { ProjectResponse } from '../types/ProjectDTO';
import type { Project } from '../types/Project';

export function mapProjectResponseToProject(dto: ProjectResponse): Project {
  return {
    id: dto.id,
    name: dto.name,
    ownerId: dto.owner_id,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}
