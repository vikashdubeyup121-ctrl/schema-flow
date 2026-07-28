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

export interface CreateDiagramRequest {
  name: string;
  projectId: string;
}

export interface UpdateDiagramRequest {
  name?: string | undefined;
  dslText?: string | undefined;
  nodesData?: Record<string, {x: number, y: number}> | undefined;
}
