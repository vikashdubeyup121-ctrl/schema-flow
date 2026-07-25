# File

docs/01-frontend-foundation/01-frontend-foundation-part-5.md

---

# Error Boundary Strategy

The application should never present a blank white screen to the user.

Every unexpected runtime error should be isolated.

```
App

↓

Global Error Boundary

↓

Page Error Boundary

↓

Feature Error Boundary
```

---

## Global Error Boundary

Responsible for

- Rendering fallback page
- Logging unexpected errors
- Allowing application reload

Must NOT

- Retry API calls
- Display business errors

---

## Feature Error Boundary

Some features can fail independently.

Example

```
Workspace

├── Sidebar
├── Canvas
├── Properties
└── Minimap
```

If Minimap crashes

Only Minimap should fail.

The remaining Workspace continues functioning.

---

# Loading State Architecture

Every async operation must expose loading state.

Never

```
await api();

↓

hope user waits.
```

---

Loading States

```
Initial Loading

Refreshing

Saving

Deleting

Publishing

Importing

Exporting
```

Each state should have its own UI.

---

Good

```
Loading Diagram...

Saving...

Publishing...
```

Bad

```
Loading...
```

---

# Empty States

Every page must define an empty state.

Example

Dashboard

```
No Projects

↓

Create First Project
```

Diagram

```
No Tables

↓

Create First Table
```

Search

```
No Results Found
```

Empty states should guide users.

---

# Responsive Design Principles

Desktop-first.

Minimum supported width

```
1280px
```

Tablet

Future.

Mobile

Out of scope.

Never break desktop UX to support mobile.

---

# Workspace Layout

```
+------------------------------------------------------+

Toolbar

+---------+--------------------------+-----------------+

Sidebar   |                          |  Properties

          |                          |

          |       Canvas             |

          |                          |

          |                          |

+---------+--------------------------+-----------------+

Status Bar
```

Layout regions should never overlap.

---

# Z-Index Management

Never hardcode z-index values.

Centralize them.

```
z-index/

canvas.ts

dialogs.ts

popover.ts

tooltip.ts

contextMenu.ts
```

Example

```ts
export const Z_INDEX = {

    CANVAS: 1,

    EDGE: 2,

    NODE: 3,

    SELECTION: 4,

    CONTEXT_MENU: 100,

    TOOLTIP: 200,

    DIALOG: 1000,

};
```

---

# Color Management

All colors originate from theme tokens.

Never

```
text-red-500
```

inside features.

Instead

```
text-danger

border-selected

bg-surface

bg-canvas
```

This enables

- Theme switching
- White labeling
- Future branding

---

# Icon Management

Every icon wrapped.

```
shared/icons/

TableIcon

DeleteIcon

ZoomIcon

NoteIcon
```

Feature components never import Lucide directly.

---

# Configuration Management

Application configuration

```
config/

editor.ts

canvas.ts

keyboard.ts

theme.ts

limits.ts

features.ts
```

Business logic never hardcodes configuration.

Example

Bad

```ts
zoom = 0.2
```

Good

```ts
EDITOR.MIN_ZOOM
```

---

# Application Constants

Examples

```
MAX_TABLE_WIDTH

MIN_TABLE_WIDTH

DEFAULT_TABLE_COLOR

MAX_NOTE_LENGTH

AUTOSAVE_INTERVAL

MAX_ZOOM

MIN_ZOOM
```

Constants belong inside configuration.

---

# Feature Configuration

Every feature owns configuration.

Example

```
table/

constants/

table.constants.ts
```

Examples

```
HEADER_HEIGHT

ROW_HEIGHT

DEFAULT_WIDTH

MIN_WIDTH

MAX_WIDTH
```

---

# Business Rules

Business rules should never exist inside components.

Bad

```tsx
if(column.primaryKey){

...
}
```

Good

```ts
TableService.validateColumn(...)
```

Components render.

Services decide.

---

# Validation Strategy

Validation exists at three levels.

---

## UI Validation

Examples

Required fields.

Maximum length.

Instant feedback.

---

## Schema Validation

Using Zod.

Example

```
Create Table

↓

Schema

↓

API
```

---

## Backend Validation

Backend is always authoritative.

Frontend validation exists for UX only.

---

# State Synchronization

There should never be two competing sources of truth.

Example

Bad

```
React Query

↓

Copy

↓

Local State

↓

Copy

↓

Store
```

Good

```
Server

↓

React Query

↓

UI
```

or

```
Store

↓

UI
```

Choose one owner.

---

# Optimistic Updates

Every mutation follows

```
User Action

↓

Optimistic UI

↓

API Request

↓

Success

↓

Commit

or

↓

Rollback
```

Rollback strategy must exist before optimistic updates are introduced.

---

# File Size Guidelines

Maximum recommended sizes.

| File | Recommended |
|------|-------------|
| Component | 300 LOC |
| Hook | 250 LOC |
| Store | 300 LOC |
| Service | 400 LOC |
| Utility | 200 LOC |

If exceeded,

Refactor.

---

# Folder Size Guidelines

Maximum direct children

```
20
```

If exceeded

Split.

Example

```
components/

↓

dialog/

↓

inputs/

↓

layout/
```

---

# Circular Dependency Policy

Circular dependencies are prohibited.

Example

Bad

```
Table

↓

Column

↓

Relationship

↓

Table
```

Instead

Extract shared logic.

---

# Dependency Injection

Services receive dependencies.

Example

Good

```ts
new TableService(repository)
```

Avoid hidden globals.

Although frontend DI is lightweight,

Services should remain testable.

---

# Testability Rules

Every service

Should be unit testable.

Every hook

Should be mockable.

Every component

Should be renderable in isolation.

No component should require the entire application to test.

---

# Developer Experience

Running

```
pnpm dev
```

Should

- Start application
- Enable HMR
- Show source maps
- Preserve component state when possible

Linting

```
pnpm lint
```

Formatting

```
pnpm format
```

Type checking

```
pnpm typecheck
```

All commands must succeed before merge.

---

# Pull Request Checklist

Every Pull Request should answer

- What changed?
- Why?
- Screenshots?
- Breaking changes?
- Tests added?
- Performance impact?
- Documentation updated?

---

# Git Commit Convention

Use Conventional Commits.

Examples

```
feat(table): implement draggable table

fix(canvas): correct zoom centering

refactor(project): simplify store

docs(frontend): update architecture

test(review): add publish tests
```

Avoid

```
fix

changes

update

done
```

---

# Frontend Verification Checklist

Before marking any feature complete

## Architecture

- Correct folder?
- Correct layer?
- Correct dependency direction?
- No duplicated logic?

---

## TypeScript

- Strict mode passes
- No any
- No ts-ignore
- No compiler warnings

---

## Lint

- Zero ESLint warnings
- Zero formatting issues

---

## Component

- Single responsibility
- Accessible
- Responsive
- Proper cleanup

---

## State

- Correct owner
- No duplication
- No stale state

---

## Performance

- No unnecessary rerenders
- Memoization where needed
- Stable callbacks
- No infinite effects

---

## Testing

- Component tested
- Hook tested
- Service tested

where applicable.

---

## Documentation

Update

- README
- ADR (if architectural)
- Feature documentation

---

# Definition of Done

A frontend task is complete only when

- Code implemented
- Architecture respected
- Tests pass
- Lint passes
- Type check passes
- Documentation updated
- Manual verification completed
- Pull Request approved

---

# Anti-Patterns

Never

- Call APIs from Components
- Store Server State in Zustand
- Use `any`
- Deep relative imports
- Duplicate components
- Duplicate business logic
- Hardcode colors
- Hardcode dimensions
- Hardcode query keys
- Mutate Zustand state directly
- Create God Components
- Create God Hooks
- Create God Stores

If any of these occur,

Refactor before merging.

---

# Frontend Foundation Completion Checklist

Before starting implementation, verify:

- Project structure created
- Path aliases configured
- ESLint configured
- Prettier configured
- TypeScript strict mode enabled
- Tailwind configured
- shadcn/ui initialized
- React Flow installed
- Zustand installed
- TanStack Query installed
- React Hook Form installed
- Zod installed
- Folder structure created
- Provider architecture implemented
- Routing configured
- Theme system configured
- Logger configured
- API client configured
- Query client configured

Only after this checklist is complete should feature development begin.

---

# End of Document

**Document Complete**

```
docs/01-frontend-foundation/

├── 01-frontend-foundation-part-1.md
├── 01-frontend-foundation-part-2.md
├── 01-frontend-foundation-part-3.md
├── 01-frontend-foundation-part-4.md
└── 01-frontend-foundation-part-5.md
```

**Next Document**

```
docs/02-canvas-engine/

02-canvas-engine-part-1.md
```

This document will define the complete canvas subsystem, including React Flow architecture, coordinate systems, viewport management, node rendering, edge rendering, interaction engine, selection engine, drag engine, resize engine, performance optimizations, and extension points.