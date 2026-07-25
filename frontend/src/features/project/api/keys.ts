export const projectKeys = {
  all: () => ['projects'] as const,
  lists: () => [...projectKeys.all(), 'list'] as const,
  detail: (id: string) => [...projectKeys.all(), 'detail', id] as const,
  members: (id: string) => [...projectKeys.all(), 'members', id] as const,
};
