import type { Project } from '../types/Project';

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'project-001',
    name: 'E-commerce Platform',
    ownerId: 'mock-user-001',
    diagramCount: 3,
    createdAt: '2026-07-01T10:00:00Z',
    updatedAt: '2026-07-20T14:30:00Z',
  },
  {
    id: 'project-002',
    name: 'Analytics Dashboard',
    ownerId: 'mock-user-001',
    diagramCount: 1,
    createdAt: '2026-07-10T09:00:00Z',
    updatedAt: '2026-07-22T11:00:00Z',
  },
  {
    id: 'project-003',
    name: 'Internal Tools',
    ownerId: 'mock-user-001',
    diagramCount: 5,
    createdAt: '2026-07-15T08:00:00Z',
    updatedAt: '2026-07-24T16:00:00Z',
  },
];
