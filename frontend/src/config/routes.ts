export const ROUTES = {
  ROOT: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  WORKSPACE: '/workspace/:diagramId',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  PRIVACY: '/privacy',
  TERMS: '/terms',
} as const;

export function workspaceRoute(diagramId: string): string {
  return `/workspace/${diagramId}`;
}
