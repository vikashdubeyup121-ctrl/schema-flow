export interface Project {
  id: string;
  name: string;
  ownerId: string;
  diagramCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
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
