export interface ProjectResponse {
  id: string;
  name: string;
  ownerId: string;
  diagramCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
}

export interface UpdateProjectRequest {
  name: string;
}
