import { Project } from '@prisma/client';

export interface ProjectResponse {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export class ProjectMapper {
  static toResponse(project: Project): ProjectResponse {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    };
  }
}
