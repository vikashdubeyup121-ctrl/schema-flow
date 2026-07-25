export interface Diagram {
  id: string;
  projectId: string;
  name: string;
  description?: string | undefined;
  dslText?: string | null | undefined;
  publishedDslText?: string | null | undefined;
  createdAt: string;
  updatedAt: string;
}
