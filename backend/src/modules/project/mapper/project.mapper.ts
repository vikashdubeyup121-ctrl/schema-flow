import { Project } from '@prisma/client';

export interface ProjectResponse {
  id: string;
  name: string;
  description?: string | null;
  diagramCount: number;
  createdAt: string;
  updatedAt: string;
}

export class ProjectMapper {
  static toResponse(project: any): ProjectResponse {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      diagramCount: project._count?.diagrams || 0,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    };
  }
}
