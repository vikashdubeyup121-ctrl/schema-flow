export interface Diagram {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  dslText?: string | null;
  publishedDslText?: string | null;
  createdAt: string;
  updatedAt: string;
}
