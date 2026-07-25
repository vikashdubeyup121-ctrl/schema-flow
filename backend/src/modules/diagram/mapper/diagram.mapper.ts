import { Diagram } from '@prisma/client';

export interface DiagramResponse {
  id: string;
  projectId: string;
  name: string;
  description?: string | null;
  latestPublishedVersionId: string | null;
  activeDraftVersionId: string | null;
  dslText: string | null;
  publishedDslText: string | null;
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  createdAt: string;
  updatedAt: string;
  updatedBy: string | null;
  updatedByName?: string;
}

export class DiagramMapper {
  static toResponse(diagram: any): DiagramResponse {
    return {
      id: diagram.id,
      projectId: diagram.projectId,
      name: diagram.name,
      description: diagram.description,
      latestPublishedVersionId: diagram.latestPublishedVersionId,
      activeDraftVersionId: diagram.activeDraftVersionId,
      dslText: diagram.dslText,
      publishedDslText: diagram.publishedDslText,
      viewport: {
        x: diagram.viewportX,
        y: diagram.viewportY,
        zoom: diagram.viewportZoom,
      },
      createdAt: diagram.createdAt.toISOString(),
      updatedAt: diagram.updatedAt.toISOString(),
      updatedBy: diagram.updatedBy,
      updatedByName: diagram.updatedByUser?.name,
    };
  }
}
