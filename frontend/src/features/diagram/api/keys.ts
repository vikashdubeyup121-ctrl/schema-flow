export const diagramKeys = {
  all: () => ['diagrams'] as const,
  byProject: (projectId: string) => [...diagramKeys.all(), 'project', projectId] as const,
  detail: (id: string) => [...diagramKeys.all(), 'detail', id] as const,
  version: (diagramId: string, versionId: string) => [...diagramKeys.detail(diagramId), 'version', versionId] as const,
};
