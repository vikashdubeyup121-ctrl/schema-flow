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
  versionTag: string;
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
    let versionTag = 'Draft';
    if (diagram.latestPublishedVersionId && Array.isArray(diagram.versions)) {
      const publishedVersion = diagram.versions.find((v: any) => v.id === diagram.latestPublishedVersionId);
      
      if (publishedVersion) {
        // If it's version 1 and hasn't been explicitly published (no publishedDslText), 
        // treat it entirely as a 'Draft'.
        if (publishedVersion.versionNumber === 1 && !diagram.publishedDslText) {
          versionTag = 'Draft';
        } else {
          versionTag = `v${publishedVersion.versionNumber}.0`;
          
          // If the current DSL differs from the published DSL, it means there are unpublished changes
          if (diagram.dslText !== diagram.publishedDslText) {
            versionTag = `${versionTag} (Draft)`;
          }
        }
      }
    } else if (diagram.dslText !== diagram.publishedDslText) {
       versionTag = 'Draft';
    }

    return {
      id: diagram.id,
      projectId: diagram.projectId,
      name: diagram.name,
      description: diagram.description,
      latestPublishedVersionId: diagram.latestPublishedVersionId,
      activeDraftVersionId: diagram.activeDraftVersionId,
      dslText: diagram.dslText,
      publishedDslText: diagram.publishedDslText,
      versionTag,
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
