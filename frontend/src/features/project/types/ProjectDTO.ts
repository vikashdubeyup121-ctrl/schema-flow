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

export interface ProjectMemberResponse {
  id: string;
  projectId: string;
  userId: string;
  role: 'OWNER' | 'EDITOR' | 'VIEWER';
  user: {
    id: string;
    name: string;
    email: string;
    pictureUrl: string | null;
  };
}

export interface AddMemberRequest {
  email: string;
  role: 'EDITOR' | 'VIEWER';
}

export interface UpdateMemberRoleRequest {
  role: 'EDITOR' | 'VIEWER';
}
