export interface DiagramResponse {
  id: string;
  name: string;
  projectId: string;
  dslText?: string | null;
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
