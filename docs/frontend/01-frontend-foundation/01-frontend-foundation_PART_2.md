# TypeScript Standards

TypeScript is mandatory.

Strict mode must always remain enabled.

Never disable strict mode to bypass compiler errors.

---

## tsconfig

Mandatory compiler options.

```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "exactOptionalPropertyTypes": true,
  "noUncheckedIndexedAccess": true
}
```

---

## General Rules

Never use

```ts
any
```

Allowed only if wrapped inside a generic utility library.

Prefer

```ts
unknown
```

followed by proper type narrowing.

---

Always create interfaces.

Good

```ts
interface Table {
    id: string;
    name: string;
}
```

Bad

```ts
const table: any = ...
```

---

Prefer interfaces over type aliases for objects.

Use type aliases only for

- unions
- utility types
- mapped types

---

## Folder Specific Types

Never create

```
types.ts
```

containing everything.

Instead

```
types/

Table.ts

Column.ts

Relationship.ts

Canvas.ts

Viewport.ts
```

Each file owns exactly one domain.

---

## DTOs

Separate frontend models from backend DTOs.

Bad

```
Table
```

used everywhere.

Good

```
Table

TableDTO

CreateTableRequest

UpdateTableRequest

MoveTableRequest
```

Never expose backend DTOs directly to UI.

---

# ESLint Standards

ESLint is mandatory.

Compilation success is not enough.

No warnings allowed in CI.

Rules

```
No any

No unused imports

No console.log

No debugger

Prefer const

No duplicate imports

No circular imports
```

---

Allowed logging

```
Logger.debug()

Logger.info()

Logger.error()
```

Never

```ts
console.log(...)
```

---

# Prettier

Formatting must be automatic.

Developers never manually align code.

Settings

- 2 spaces
- single quote
- semicolon
- trailing commas

---

# File Naming

Folders

```
camelCase
```

Files

Components

```
PascalCase.tsx
```

Hooks

```
useSomething.ts
```

Stores

```
table.store.ts
```

Services

```
table.service.ts
```

Validation

```
table.schema.ts
```

Constants

```
table.constants.ts
```

Tests

```
Table.test.tsx
```

Utilities

```
geometry.ts
```

Never

```
helpers.ts

misc.ts

common.ts

utils.ts
```

These become dumping grounds.

---

# Component Standards

A component must have one purpose.

Component maximum size

Approximately

```
300 lines
```

If larger

Split it.

---

Example

Bad

```
Workspace.tsx

1200 lines
```

Good

```
Workspace

↓

Toolbar

↓

Sidebar

↓

Canvas

↓

Properties

↓

Context Menu

↓

Minimap
```

---

Every component owns

```
Component.tsx

Component.types.ts

Component.test.tsx

index.ts
```

Optional

```
Component.styles.ts

Component.constants.ts
```

---

# Component Responsibilities

Components may

- render
- receive props
- emit callbacks

Components must NOT

- call APIs
- perform business validation
- manipulate unrelated state
- parse backend responses

---

Bad

```tsx
<Button
    onClick={() => {
        await axios.post(...)
    }}
/>
```

Good

```tsx
<Button
    onClick={createTable}
/>
```

---

# Hook Standards

Hooks contain behavior.

Components contain rendering.

Example

Good

```
useTableDrag()

↓

mouse events

↓

store updates

↓

callbacks
```

Component

```
render table
```

---

Hooks should be

Composable.

Never create

```
useEverything()
```

---

Good

```
useDrag()

useSelection()

useResize()

useKeyboard()

useViewport()
```

---

Hook Rules

Hooks may

- call APIs
- update stores
- subscribe sockets
- coordinate logic

Hooks should never

Return JSX.

---

# Store Architecture

Every feature owns one Zustand slice.

Example

```
table.store.ts

column.store.ts

canvas.store.ts

selection.store.ts

review.store.ts
```

Never create

```
global.store.ts
```

---

Store Structure

```ts
State

↓

Actions

↓

Selectors
```

Example

```ts
interface TableState {

    tables: Table[];

    selectedTableId?: string;

    createTable()

    deleteTable()

    moveTable()

    updateTable()

}
```

---

Store Rules

Stores

May

- update state
- expose selectors

Stores

Must NOT

- call backend APIs
- open dialogs
- manipulate DOM

---

Derived values belong in selectors.

Example

Bad

```ts
component.filter(...)
```

Good

```ts
store.visibleTables
```

---

# React Query Standards

Every backend resource has

```
queries.ts

mutations.ts

keys.ts
```

Example

```
features/project/api/

queries.ts

mutations.ts

keys.ts
```

---

Keys

```
projects

project

diagram

tables

relationships
```

Never hardcode query keys.

---

Mutation Flow

```
Mutation

↓

Optimistic Update

↓

Backend

↓

Success

↓

Invalidate Query
```

---

No direct fetch inside components.

Bad

```tsx
await fetch(...)
```

---

Good

```
useCreateProjectMutation()
```

---

# Error Handling

Every API call returns

Either

```
Success

or

Failure
```

Never throw raw backend messages.

Transform

```
Backend

↓

API Layer

↓

Friendly Error

↓

Toast
```

---

Global Errors

Use

```
ErrorBoundary
```

Application should never crash.

---

Network Errors

Show

```
Retry

Cancel
```

Never silently fail.

---

# Logging

Frontend logger

```
Logger.info()

Logger.warn()

Logger.error()

Logger.debug()
```

Logger disabled in production except

```
error
```

---

# Environment Variables

Never

```
process.env
```

inside components.

Access through

```
config/env.ts
```

Example

```
export const API_URL = ...
```

---

# Feature Flags

Future proof.

```
config/features.ts
```

Example

```ts
export const Features = {

    collaboration: true,

    review: true,

    sqlImport: false

}
```

Never scatter feature flags.

---

# Theme System

Dark mode supported from day one.

Colors

Never hardcode

```
#ffffff
```

Instead

Use CSS Variables.

```
--background

--foreground

--primary

--secondary

--border

--danger
```

Tailwind maps to variables.

---

# Icons

All icons wrapped.

Never directly import

```tsx
import { Trash2 } from "lucide-react";
```

Instead

```
shared/icons/

DeleteIcon.tsx
```

Allows replacing icon library later.

---

# Accessibility

Every interactive component must support

- Keyboard
- Screen readers
- Focus state

Buttons

Must have

```
aria-label
```

Dialogs

Must trap focus.

Canvas shortcuts must never interfere with text input.

---

# Performance Principles

Never prematurely optimize.

But follow these rules.

Large objects

↓

Memoize.

Heavy calculations

↓

Services.

Frequent callbacks

↓

useCallback.

Expensive derived state

↓

useMemo.

Lists

↓

Virtualize when required.

Never rerender entire canvas for one table movement.

Canvas rendering optimizations are covered in
`02-canvas-engine.md`.

---