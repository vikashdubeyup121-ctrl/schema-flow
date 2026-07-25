# Application Bootstrap Architecture

The application bootstrap is responsible for initializing the frontend exactly once.

No business logic should exist here.

The bootstrap layer should remain stable regardless of how many features are added.

---

## Directory Structure

```
src/

app/

│

├── App.tsx

├── providers/

├── router/

├── bootstrap/

├── errorBoundary/

└── index.ts
```

---

## main.tsx

Responsibilities

- Create React Root
- Import global styles
- Render App
- Nothing else

Good

```tsx
createRoot(...).render(<App />);
```

Bad

```tsx
initializeAuth();

loadProjects();

render();
```

No initialization logic.

---

## App.tsx

Purpose

Application composition.

Responsibilities

- Register Providers
- Register Router
- Register Global Components

App.tsx should never exceed approximately 100 lines.

Good

```
<App>

↓

Providers

↓

Router

↓

Routes
```

Bad

```
App

↓

Business Logic

↓

API Calls

↓

Authentication

↓

Dialogs

↓

Rendering
```

---

# Provider Architecture

Providers are initialized only once.

Order matters.

```
App

↓

ErrorBoundary

↓

ThemeProvider

↓

QueryProvider

↓

AuthProvider

↓

KeyboardProvider

↓

ToastProvider

↓

Router
```

Each provider has a single responsibility.

---

## ErrorBoundary

Purpose

Prevent application crashes.

Responsibilities

- Catch unexpected render errors
- Display fallback UI
- Log errors

Must never

- Retry requests
- Authenticate users
- Show dialogs

---

## ThemeProvider

Responsibilities

- Dark Mode
- Theme variables
- Theme persistence

Must never

Know anything about

- Tables
- Projects
- Canvas

---

## QueryProvider

Responsible for

TanStack Query.

Owns

```
QueryClient
```

Configuration

Retries

Cache

Garbage Collection

Devtools

---

## AuthProvider

Purpose

Current logged-in user.

Responsible for

- Login status
- User profile
- JWT
- Refresh session

Must NOT

Load projects.

---

## KeyboardProvider

Global keyboard shortcuts.

Registers

```
Ctrl + Z

Ctrl + Shift + Z

Delete

Escape

Space

Ctrl + C

Ctrl + V
```

Feature-specific shortcuts register through this provider.

---

## ToastProvider

Central notification system.

Never

```
alert(...)
```

Use

```
Toast.success()

Toast.error()

Toast.warning()
```

---

# Routing Architecture

```
/

↓

Login

↓

Dashboard

↓

Workspace
```

Structure

```
router/

index.tsx

protected.tsx

public.tsx

routes.ts
```

---

## Public Routes

Accessible without authentication.

```
/

login

privacy

terms
```

---

## Protected Routes

Require authentication.

```
dashboard

workspace

settings

profile
```

---

## Route Layout

```
App

↓

Router

↓

Layout

↓

Page

↓

Widgets

↓

Features
```

Pages never directly render feature internals.

---

## Lazy Loading

Every page

Lazy loaded.

Example

```
Dashboard

Workspace

Settings
```

Do not lazy load

- Button
- Dialog
- Shared components

---

# Global State Rules

Three kinds of state exist.

## Local State

Component only.

Examples

```
Input value

Popover open

Hovered row
```

Use

```
useState()
```

---

## Shared UI State

Multiple components.

Examples

```
Sidebar

Theme

Zoom

Selection

Context Menu

Keyboard
```

Use

Zustand.

---

## Server State

Backend owned.

Examples

```
Projects

Users

Tables

Diagrams

Invitations
```

Use

TanStack Query.

---

Decision Matrix

| State | Storage |
|---------|----------|
| Form input | useState |
| Theme | Zustand |
| Selected Table | Zustand |
| Projects | React Query |
| User Profile | React Query |
| Hover | useState |
| Viewport | Zustand |
| Canvas Tool | Zustand |

---

Never duplicate state.

Bad

```
Project

↓

React Query

↓

Copy

↓

Zustand
```

Single source of truth.

---

# API Layer Architecture

Every feature owns its own API layer.

Example

```
table/

api/

queries.ts

mutations.ts

keys.ts

mapper.ts
```

---

## queries.ts

Contains

Read operations.

```
getTable()

getTables()
```

---

## mutations.ts

Contains

Write operations.

```
createTable()

deleteTable()

moveTable()

resizeTable()
```

---

## mapper.ts

Responsible for

DTO

↓

Frontend Model

Example

Backend

```
created_at
```

Frontend

```
createdAt
```

Never expose DTOs to UI.

---

## keys.ts

Every query key centralized.

Example

```ts
tableKeys = {

all(),

list(),

detail(id)

}
```

Never use strings.

Bad

```ts
["table"]
```

---

# Authentication Flow

```
Google Login

↓

Google Token

↓

Backend

↓

JWT

↓

Frontend

↓

Query Current User

↓

Application Ready
```

The frontend never stores the Google token.

Only stores

JWT

Refresh Token (if applicable).

---

# API Client

Single client.

```
shared/api/apiClient.ts
```

Responsibilities

- Base URL
- JWT injection
- Timeout
- Retry
- Error parsing

Never

Create multiple Axios instances.

---

# Request Interceptor

Automatically

Adds

```
Authorization

Bearer JWT
```

Every request.

Components never manually attach tokens.

---

# Response Interceptor

Transforms

```
401

↓

Logout
```

```
403

↓

Permission Error
```

```
500

↓

Friendly Message
```

No component parses HTTP status codes.

---

# DTO Mapping

Backend model

```
created_at
```

↓

Mapper

↓

Frontend model

```
createdAt
```

Every feature owns its mapper.

Never access backend response directly.

---

# Event System

The frontend communicates internally through explicit events.

Examples

```
TABLE_CREATED

TABLE_UPDATED

TABLE_MOVED

TABLE_SELECTED

COLUMN_CREATED

COLUMN_DELETED
```

Benefits

- Easier debugging
- Better logging
- Future analytics

Avoid anonymous callback chains for complex interactions.

---

# Service Layer

Business logic that does not belong in hooks or components lives in feature services.

Example

```
features/table/services/

tableLayout.service.ts

tableValidation.service.ts

tableGeometry.service.ts
```

Rules

Services

- Pure where possible
- No JSX
- No DOM
- No React dependencies

Services may be reused by hooks, stores, and API mappers.

---

# Store and Service Interaction

Recommended flow

```
User Action

↓

Component

↓

Hook

↓

Service (optional)

↓

Store Action

↓

API Mutation

↓

Optimistic Update

↓

Server Response

↓

Store Synchronization
```

Stores should not call services that perform network requests.

Services should not mutate Zustand directly.

They should return values or commands.

---