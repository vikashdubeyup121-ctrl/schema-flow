export interface DiagramResponse {
  id: string;
  name: string;
  project_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDiagramRequest {
  name: string;
  project_id: string;
}

export interface UpdateDiagramRequest {
  name: string;
}
