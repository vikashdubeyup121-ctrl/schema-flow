export const diagramKeys = {
  all: () => ['diagrams'] as const,
  byProject: (projectId: string) => [...diagramKeys.all(), 'project', projectId] as const,
  detail: (id: string) => [...diagramKeys.all(), 'detail', id] as const,
};
