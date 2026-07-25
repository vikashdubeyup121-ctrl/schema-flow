# File

docs/frontend/03-dashboard/03-dashboard.md

---

# Dashboard Module

The Dashboard is the primary landing page after authentication.

It enables the user to:

- View all their projects
- Create, rename, and delete projects
- Open a project to see its diagrams
- Create, rename, and delete diagrams
- Navigate to the canvas workspace to open a diagram

---

# User Journey

```
Login

↓

Dashboard

↓

Select Project

↓

View Diagrams

↓

Open Diagram

↓

Canvas
```

---

# Module Boundaries

The Dashboard module consists of:

```
features/project/       — project CRUD, types, API, store
features/diagram/       — diagram CRUD, types, API, store
widgets/dashboard/      — DashboardWidget composing both
pages/dashboard/        — DashboardPage (thin shell)
```

---

# Dependency Rules

```
pages/dashboard
    ↓
widgets/dashboard
    ↓
features/project
features/diagram
    ↓
shared/
```

Pages only import widgets.

Widgets compose features.

Features never import other features.

---

# Feature Flags

Both project and diagram features support mock mode.

```ts
Features.mockData = true  // returns mock data from queryFn
```

When `Features.mockData` is true, `queryFn` returns hardcoded mock data instead of calling the API.

This allows full UI development without a backend.

---

# Project Domain Type

```ts
// features/project/types/Project.ts

export interface Project {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}
```

---

# Project DTO

```ts
// features/project/types/ProjectDTO.ts

export interface ProjectResponse {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectRequest {
  name: string;
}

export interface UpdateProjectRequest {
  name: string;
}
```

---

# Project Query Keys

```ts
// features/project/api/keys.ts

export const projectKeys = {
  all: () => ['projects'] as const,
  lists: () => [...projectKeys.all(), 'list'] as const,
  detail: (id: string) => [...projectKeys.all(), 'detail', id] as const,
};
```

---

# Project Queries

```ts
// features/project/api/queries.ts

export const projectsQueryOptions = queryOptions({
  queryKey: projectKeys.lists(),
  queryFn: fetchProjects,
  staleTime: 5 * 60 * 1000,
});
```

When `Features.mockData` is true, `fetchProjects` returns `MOCK_PROJECTS`.

---

# Project Mutations

Three mutations:

- `createProject(name)` — POST `/projects`
- `updateProject(id, name)` — PATCH `/projects/:id`
- `deleteProject(id)` — DELETE `/projects/:id`

All mutations invalidate `projectKeys.lists()` on success.

---

# Project Store

```ts
// features/project/stores/project.store.ts

interface ProjectState {
  selectedProjectId: string | null;
  setSelectedProject: (id: string | null) => void;
}
```

Used to track which project is currently expanded in the dashboard.

---

# Diagram Domain Type

```ts
// features/diagram/types/Diagram.ts

export interface Diagram {
  id: string;
  name: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}
```

---

# Diagram DTO

```ts
// features/diagram/types/DiagramDTO.ts

export interface DiagramResponse {
  id: string;
  name: string;
  project_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDiagramRequest {
  name: string;
  project_id: string;
}

export interface UpdateDiagramRequest {
  name: string;
}
```

---

# Diagram Query Keys

```ts
// features/diagram/api/keys.ts

export const diagramKeys = {
  all: () => ['diagrams'] as const,
  byProject: (projectId: string) => [...diagramKeys.all(), 'project', projectId] as const,
  detail: (id: string) => [...diagramKeys.all(), 'detail', id] as const,
};
```

---

# Diagram Queries

```ts
// features/diagram/api/queries.ts

export const diagramsByProjectQueryOptions = (projectId: string) =>
  queryOptions({
    queryKey: diagramKeys.byProject(projectId),
    queryFn: () => fetchDiagramsByProject(projectId),
    staleTime: 5 * 60 * 1000,
    enabled: !!projectId,
  });
```

---

# Diagram Mutations

Three mutations:

- `createDiagram(name, projectId)` — POST `/diagrams`
- `updateDiagram(id, name)` — PATCH `/diagrams/:id`
- `deleteDiagram(id, projectId)` — DELETE `/diagrams/:id`

All mutations invalidate `diagramKeys.byProject(projectId)` on success.

---

# Mock Data

```ts
// features/project/mock/mockProjects.ts
// features/diagram/mock/mockDiagrams.ts
```

Provide 2–3 realistic mock projects with matching mock diagrams.

Mock data is only used when `Features.mockData` is true.

---

# Dashboard Widget

```
widgets/dashboard/
  DashboardWidget.tsx
  index.ts
```

DashboardWidget is the top-level composition.

It renders:

```
DashboardHeader
  ↓
ProjectList
  ↓
  ProjectCard
    ↓
    DiagramList
      ↓
      DiagramCard
```

---

# Dashboard Layout

```
┌──────────────────────────────────────────────┐
│  SchemaFlow          [+ New Project]  Avatar  │
├──────────────────────────────────────────────┤
│                                              │
│  Projects                                    │
│                                              │
│  ┌──────────────────┐  ┌──────────────────┐  │
│  │ Project Alpha    │  │ Project Beta     │  │
│  │ 3 diagrams ···   │  │ 1 diagram  ···   │  │
│  └──────────────────┘  └──────────────────┘  │
│                                              │
│  ▼ Project Alpha (selected)                  │
│                                              │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │ Schema v1│  │ Schema v2│  │    +      │  │
│  │          │  │          │  │ New Diagram│  │
│  └──────────┘  └──────────┘  └───────────┘  │
│                                              │
└──────────────────────────────────────────────┘
```

---

# DashboardHeader Component

Props:

```ts
interface DashboardHeaderProps {
  user: User;
  onCreateProject: () => void;
  onLogout: () => void;
}
```

Renders app name, user avatar, and New Project button.

---

# ProjectCard Component

```ts
interface ProjectCardProps {
  project: Project;
  diagramCount: number;
  isSelected: boolean;
  onSelect: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}
```

Displays project name, diagram count, and a context menu with Rename and Delete.

---

# DiagramCard Component

```ts
interface DiagramCardProps {
  diagram: Diagram;
  onOpen: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}
```

Clicking the card opens the workspace for that diagram.

---

# Create Project Modal

Controlled from DashboardWidget.

```ts
interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
  isLoading: boolean;
}
```

Contains a single text input for the project name.

Submits on Enter or button click.

---

# Create Diagram Modal

```ts
interface CreateDiagramModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
  isLoading: boolean;
}
```

Same pattern as Create Project Modal.

---

# Navigation

After creating or clicking a diagram:

```ts
navigate(`/workspace/${diagramId}`)
```

Uses `react-router-dom` `useNavigate`.

Never import `navigate` outside of components or hooks.

---

# DashboardPage

```tsx
// pages/dashboard/DashboardPage.tsx

export function DashboardPage(): ReactNode {
  return <DashboardWidget />;
}
```

Pages are thin shells.

All logic lives in the widget.

---

# Loading States

Every async operation shows a loading state:

- Projects loading: skeleton cards
- Diagrams loading: skeleton cards inside expanded project
- Mutation pending: button spinner, form disabled

---

# Error States

- Query error: inline error message with retry button
- Mutation error: toast notification

---

# Empty States

- No projects: call-to-action to create first project
- No diagrams in project: call-to-action to create first diagram

---

# Folder Structure

```
features/project/
  api/
    index.ts
    keys.ts
    mapper.ts
    mutations.ts
    queries.ts
  components/
    ProjectCard/
      ProjectCard.tsx
      index.ts
    CreateProjectModal/
      CreateProjectModal.tsx
      index.ts
  hooks/
    index.ts
    useProjects.ts
    useProjectMutations.ts
  mock/
    mockProjects.ts
  stores/
    index.ts
    project.store.ts
  types/
    index.ts
    Project.ts
    ProjectDTO.ts
  index.ts

features/diagram/
  api/
    index.ts
    keys.ts
    mapper.ts
    mutations.ts
    queries.ts
  components/
    DiagramCard/
      DiagramCard.tsx
      index.ts
    CreateDiagramModal/
      CreateDiagramModal.tsx
      index.ts
  hooks/
    index.ts
    useDiagrams.ts
    useDiagramMutations.ts
  mock/
    mockDiagrams.ts
  stores/
    index.ts
    diagram.store.ts
  types/
    index.ts
    Diagram.ts
    DiagramDTO.ts
  index.ts

widgets/dashboard/
  DashboardWidget.tsx
  index.ts

pages/dashboard/
  DashboardPage.tsx     (update existing)
  index.ts              (update existing)
```

---

# Acceptance Criteria

- Projects load on page mount
- New project can be created
- Project can be renamed inline or via menu
- Project can be deleted with confirmation
- Clicking a project expands it and loads its diagrams
- New diagram can be created within a project
- Diagram can be renamed
- Diagram can be deleted
- Clicking a diagram navigates to `/workspace/:diagramId`
- All operations work with `Features.mockData = true`
- `pnpm lint` passes
- `pnpm typecheck` passes
