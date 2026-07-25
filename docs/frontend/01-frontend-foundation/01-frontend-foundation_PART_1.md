# Frontend Engineering Specification

**Document:** 01-frontend-foundation.md

**Project:** SchemaFlow

**Status:** Draft

**Version:** 1.0

---

# Table of Contents

1. Purpose
2. Frontend Philosophy
3. Engineering Principles
4. Technology Stack
5. Architecture Decision Records
6. High Level Architecture
7. Project Structure
8. Module Responsibilities
9. Dependency Rules
10. Coding Standards
11. Naming Conventions
12. TypeScript Standards
13. Component Standards
14. State Management Standards
15. Styling Standards
16. Routing Standards
17. Shared Libraries
18. Verification Checklist

---

# 1. Purpose

This document defines the frontend architecture of SchemaFlow.

It acts as the single source of truth for:

- Folder organization
- Component hierarchy
- State management
- Shared utilities
- Coding standards
- Architectural decisions
- Dependency rules

Every engineer contributing to the frontend must follow this document.

---

# 2. Frontend Philosophy

The frontend is **not** responsible for business logic.

Its responsibilities are limited to:

- Rendering UI
- Managing local interaction state
- Calling backend APIs
- Rendering websocket updates
- Managing canvas interactions

Business rules must remain inside dedicated services or stores.

Examples:

✅ Good

```
Component

↓

Store Action

↓

API

↓

Backend
```

❌ Bad

```
Component

↓

fetch()

↓

Business Logic

↓

State Mutation
```

Components should remain as dumb as possible.

---

# 3. Engineering Principles

The frontend follows these principles.

## 3.1 Feature First

Code is grouped by business capability.

Never by type.

Bad

```
components/

hooks/

utils/

pages/
```

Good

```
features/

shared/

widgets/

pages/

app/
```

Reason:

As the project grows, engineers work inside one feature instead of touching dozens of folders.

---

## 3.2 Single Responsibility

Every module has one responsibility.

Example

Table component

Responsibilities

- Render table

Not responsible for

- Saving
- API calls
- Business validation

---

## 3.3 Composition Over Inheritance

Prefer

```
<Table>

    <TableHeader/>

    <ColumnList/>

</Table>
```

instead of giant configurable components.

---

## 3.4 Unidirectional Data Flow

All changes follow the same path.

```
User

↓

Component

↓

Store

↓

API

↓

Backend

↓

Response

↓

Store

↓

UI
```

Never mutate state directly.

---

## 3.5 Shared Before Duplicate

If two features require identical functionality, move it to Shared.

Examples

Buttons

Dialogs

Popover

Tooltip

Icons

---

## 3.6 Strict Typing

Every public interface must be typed.

No `any`.

Avoid `unknown` unless unavoidable.

---

# 4. Technology Stack

## Core

React 19

TypeScript

Vite

---

## UI

Tailwind CSS v4

shadcn/ui

Lucide Icons

Framer Motion

---

## State

Zustand

Purpose

Client state.

Examples

- Current tool
- Selected table
- Zoom level
- Context menu
- Sidebar

---

TanStack Query

Purpose

Server state.

Examples

Projects

Diagrams

Users

Invitations

Never store server state inside Zustand.

---

## Forms

React Hook Form

Zod

---

## Canvas

React Flow

Reason

Provides

- viewport
- minimap
- edges
- nodes
- selection
- zoom
- pan

which would otherwise take months to build.

---

## Markdown

react-markdown

Used only for Notes.

---

## Build

Vite

Package Manager

pnpm

---

# 5. Architecture Decision Records

---

## ADR-001

Decision

Use React Flow.

Status

Accepted.

Alternatives

Konva

Pixi

Fabric

Reason

React Flow already solves

- node rendering
- edge rendering
- viewport
- drag
- selection

Tradeoffs

Less control than custom canvas.

Accepted.

---

## ADR-002

Decision

Use Zustand.

Status

Accepted.

Alternatives

Redux

MobX

Context

Reason

Small API.

Minimal boilerplate.

Excellent performance.

---

## ADR-003

Decision

Use TanStack Query.

Reason

Caching.

Mutations.

Optimistic updates.

Retries.

Automatic invalidation.

---

## ADR-004

Decision

Use Feature First architecture.

Reason

Reduces coupling.

Improves scalability.

Supports independent teams.

---

## ADR-005

Decision

Dark mode from Day One.

Reason

Avoid expensive refactoring later.

---

# 6. High Level Architecture

```
App

│

├── Providers

├── Router

├── Pages

│

└── Shared Infrastructure

        │

        ├── Features

        ├── Widgets

        ├── Shared Components

        └── Stores
```

The frontend consists of five layers.

Layer 1

Application.

Layer 2

Pages.

Layer 3

Widgets.

Layer 4

Features.

Layer 5

Shared.

Dependencies always move downward.

Never upward.

---

# 7. Project Structure

```
src/

├── app/

├── pages/

├── widgets/

├── features/

├── shared/

├── assets/

├── styles/

├── types/

├── config/

├── lib/

└── main.tsx
```

No folder should exceed approximately 20–30 direct children. If it does, split it into submodules.

---

# 8. Layer Responsibilities

## app/

Responsible for application bootstrap.

Contains

```
app/

App.tsx

providers/

router/

theme/

query/

store/

error-boundary/
```

Rules

Never place business components here.

Only application infrastructure.

---

## pages/

Represents route-level screens.

Example

```
DashboardPage

WorkspacePage

LoginPage

SettingsPage
```

Rules

Pages compose widgets.

Pages should never contain business logic.

Maximum responsibility:

- Layout
- Routing
- Data orchestration

---

## widgets/

Widgets combine multiple features into reusable page sections.

Example

```
WorkspaceCanvas

DashboardSidebar

ProjectToolbar

DiagramInspector
```

A widget may depend on multiple features.

A feature must never depend on a widget.

---

## features/

Contains all business capabilities.

Examples

```
auth/

project/

diagram/

table/

column/

relationship/

note/

review/

collaboration/

canvas/

selection/
```

Every feature owns

- UI
- Store slice
- API layer
- Hooks
- Types
- Validation
- Tests

A feature should be independently understandable.

## shared/

The `shared/` layer contains reusable modules that are **generic** and **not tied to any business feature**.

Nothing in `shared/` should know about:

- Tables
- Projects
- Relationships
- Diagrams
- Authentication
- Review

If it does, it belongs in a Feature.

---

### Structure

```
shared/

├── api/
├── components/
├── hooks/
├── icons/
├── layouts/
├── providers/
├── services/
├── stores/
├── types/
├── utils/
├── constants/
├── validations/
└── index.ts
```

---

## shared/api/

Contains reusable API infrastructure.

```
shared/api/

apiClient.ts

authInterceptor.ts

queryClient.ts

errorHandler.ts

request.ts

response.ts

types.ts
```

### Responsibilities

- Axios instance
- Request interceptors
- JWT injection
- Error parsing
- Common API helpers

### Must NOT contain

- Table APIs
- Project APIs
- Diagram APIs

Those belong inside Features.

---

## shared/components/

Contains reusable UI components.

Structure

```
shared/components/

Button/

Input/

Modal/

Dropdown/

Dialog/

Tooltip/

Popover/

Badge/

Avatar/

Spinner/

Skeleton/

SearchInput/

VirtualList/

EmptyState/

ErrorState/
```

Every component owns

```
Button/

Button.tsx

Button.test.tsx

Button.types.ts

Button.styles.ts

index.ts
```

Rules

- No API calls
- No Zustand
- No React Query
- No feature logic

---

## shared/hooks/

Contains reusable hooks.

Examples

```
useDebounce()

useThrottle()

useResizeObserver()

usePrevious()

useClickOutside()

useWindowSize()

useKeyboardShortcut()

useIntersection()

useEventListener()

useBoolean()
```

Must never contain

```
useCreateTable()

useProject()

useDiagram()
```

Those belong to Features.

---

## shared/icons/

Wraps Lucide icons.

Purpose

Single location for icons.

Allows swapping libraries later.

Example

```
shared/icons/

TableIcon.tsx

ColumnIcon.tsx

DeleteIcon.tsx

SearchIcon.tsx
```

---

## shared/layouts/

Reusable layouts.

```
AuthLayout

DashboardLayout

WorkspaceLayout

EmptyLayout
```

Pages consume layouts.

Layouts consume widgets.

---

## shared/providers/

Contains application-wide providers.

```
ThemeProvider

QueryProvider

ToastProvider

AuthProvider

KeyboardProvider
```

Providers never contain business logic.

---

## shared/services/

Contains cross-feature services.

Examples

```
ClipboardService

StorageService

DownloadService

UploadService

LoggerService

ShortcutService
```

Not feature specific.

---

## shared/stores/

Contains global UI state only.

Examples

```
ThemeStore

ToastStore

DialogStore

KeyboardStore
```

Never

```
TableStore

ProjectStore

DiagramStore
```

Those belong to Features.

---

## shared/utils/

Pure utility functions.

Examples

```
array.ts

color.ts

date.ts

number.ts

math.ts

string.ts

clipboard.ts

download.ts

geometry.ts
```

Rules

- Pure functions only
- No React
- No DOM
- No APIs

---

## shared/constants/

```
Routes.ts

Colors.ts

Keyboard.ts

Limits.ts

Regex.ts

Storage.ts
```

Never hardcode strings.

---

## shared/types/

Global reusable types.

Examples

```
ApiResponse

ApiError

Nullable

Optional

DeepPartial

UUID

Point

Rectangle

Size
```

Business types belong to Features.

---

## config/

Contains application configuration.

```
config/

env.ts

routes.ts

theme.ts

query.ts

features.ts

editor.ts

keyboard.ts
```

No runtime logic.

Only configuration.

---

## assets/

```
assets/

images/

fonts/

logos/

illustrations/

animations/
```

Rules

No feature assets.

Feature-specific assets stay with the feature.

---

## styles/

```
styles/

globals.css

tailwind.css

variables.css

animations.css

editor.css
```

Purpose

Global styles only.

Never create feature styles here.

---

## lib/

Third-party wrappers.

```
lib/

reactflow.ts

axios.ts

markdown.ts

motion.ts

google.ts
```

Purpose

If a library changes later,

only this folder changes.

---

## types/

Top-level project-wide types.

```
types/

api.ts

common.ts

events.ts

geometry.ts

pagination.ts
```

Do not place feature models here.

---

# Feature Folder Standard

Every feature follows exactly the same structure.

Example

```
features/table/

api/

components/

hooks/

services/

stores/

types/

utils/

validation/

constants/

tests/

index.ts
```

---

## api/

Contains backend communication.

```
createTable.ts

deleteTable.ts

updateTable.ts

moveTable.ts

resizeTable.ts
```

Only network code.

---

## components/

Contains UI.

```
Table.tsx

TableHeader.tsx

TableBody.tsx

ColumnList.tsx

ResizeHandle.tsx

SelectionBorder.tsx

ChangeIndicator.tsx
```

Only rendering.

---

## hooks/

Business hooks.

```
useCreateTable()

useDeleteTable()

useMoveTable()

useResizeTable()

useTableSelection()
```

Hooks coordinate UI + Store + API.

---

## services/

Business rules.

Example

```
calculateTableSize()

validateColumn()

computeRelationshipPoints()

sortColumns()
```

Complex calculations belong here.

---

## stores/

Feature Zustand slice.

```
table.store.ts
```

Contains

- state
- actions
- selectors

No API calls.

---

## types/

```
Table.ts

TableDTO.ts

TableEvents.ts

TableProps.ts
```

Keep feature contracts together.

---

## utils/

Feature-specific helpers.

```
tableGeometry.ts

tableColors.ts
```

If reusable,

move to shared.

---

## validation/

```
table.schema.ts
```

Contains

Zod schemas.

---

## constants/

```
table.constants.ts
```

Feature constants.

---

## tests/

```
Table.test.tsx

table.store.test.ts

table.service.test.ts
```

Feature tests remain with the feature.

---

# Dependency Rules

Dependencies are strictly one-directional.

```
Pages

↓

Widgets

↓

Features

↓

Shared
```

Allowed

```
Feature

↓

Shared
```

Not allowed

```
Shared

↓

Feature
```

---

Allowed

```
Widget

↓

Feature A

↓

Feature B
```

Not allowed

```
Feature A

↓

Widget
```

---

Pages may consume

- Widgets
- Features
- Shared

Pages must never be consumed.

---

# Import Rules

Always prefer aliases.

Good

```ts
import { Button } from "@/shared/components";
```

Bad

```ts
import Button from "../../../../components/Button";
```

Aliases

```
@/app

@/pages

@/widgets

@/features

@/shared

@/config

@/types

@/assets
```

No relative imports longer than two levels.

Bad

```
../../../../../../
```

Refactor instead.

---

# Barrel Exports

Every folder exports through `index.ts`.

Example

```
components/

Button/

Input/

index.ts
```

index.ts

```ts
export * from "./Button";
export * from "./Input";
```

Never import deep paths across modules unless necessary.

Good

```ts
import { Button } from "@/shared/components";
```

Bad

```ts
import Button from "@/shared/components/Button/Button";
```