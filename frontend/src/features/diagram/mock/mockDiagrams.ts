import type { Diagram } from '../types/Diagram';

const mockDefaults = {
  dslText: null,
  publishedDslText: null,
  versionTag: 'v1',
  viewport: { x: 0, y: 0, zoom: 1 },
  updatedBy: null,
};

export const MOCK_DIAGRAMS: Diagram[] = [
  {
    id: 'diagram-001',
    name: 'Core Schema v1',
    projectId: 'project-001',
    createdAt: '2026-07-05T10:00:00Z',
    updatedAt: '2026-07-20T14:30:00Z',
    ...mockDefaults,
  },
  {
    id: 'diagram-002',
    name: 'Orders & Payments',
    projectId: 'project-001',
    createdAt: '2026-07-08T11:00:00Z',
    updatedAt: '2026-07-21T09:00:00Z',
    ...mockDefaults,
  },
  {
    id: 'diagram-003',
    name: 'User Management',
    projectId: 'project-001',
    createdAt: '2026-07-10T14:00:00Z',
    updatedAt: '2026-07-22T16:00:00Z',
    ...mockDefaults,
  },
  {
    id: 'diagram-004',
    name: 'Events Schema',
    projectId: 'project-002',
    createdAt: '2026-07-12T09:00:00Z',
    updatedAt: '2026-07-23T10:00:00Z',
    ...mockDefaults,
  },
  {
    id: 'diagram-005',
    name: 'Metrics',
    projectId: 'project-002',
    createdAt: '2026-07-14T08:00:00Z',
    updatedAt: '2026-07-24T11:00:00Z',
    ...mockDefaults,
  },
  {
    id: 'diagram-006',
    name: 'Internal DB',
    projectId: 'project-003',
    createdAt: '2026-07-16T08:00:00Z',
    updatedAt: '2026-07-25T08:00:00Z',
    ...mockDefaults,
  },
];
