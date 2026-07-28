export interface Diagram {
  id: string;
  projectId: string;
  name: string;
  description?: string | undefined;
  dslText: string | null;
  publishedDslText: string | null;
  versionTag: string;
  nodesData?: any;
  viewport: { x: number; y: number; zoom: number };
  createdAt: string;
  updatedAt: string;
  updatedBy: string | null;
  updatedByName?: string;
}
