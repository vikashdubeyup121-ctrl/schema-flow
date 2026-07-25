export interface Diagram {
  id: string;
  projectId: string;
  name: string;
  description?: string | undefined;
  dslText?: string | null | undefined;
  publishedDslText?: string | null | undefined;
  viewport: { x: number; y: number; zoom: number };
  createdAt: string;
  updatedAt: string;
  updatedBy: string | null;
  updatedByName?: string;
}
