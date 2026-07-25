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
}

export interface CreateDiagramRequest {
  name: string;
  projectId: string;
}

export interface UpdateDiagramRequest {
  name?: string;
  dslText?: string;
}
