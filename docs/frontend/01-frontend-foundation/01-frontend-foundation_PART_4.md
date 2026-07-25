# File

docs/01-frontend-foundation/01-frontend-foundation-part-4.md

---

# Component Communication Architecture

One of the most common causes of an unmaintainable React codebase is uncontrolled communication between components.

SchemaFlow follows **strict communication rules**.

```
Page

↓

Widget

↓

Feature Component

↓

Shared Component
```

Communication only flows downward.

Callbacks flow upward.

No component should directly manipulate another component.

---

## Parent → Child Communication

Allowed

```
WorkspacePage

↓

WorkspaceCanvas

↓

Table

↓

Column
```

Through

- Props
- Context (only when appropriate)

Never

```
import Table from "../Table"

↓

Call methods directly
```

---

## Sibling Communication

Bad

```
Toolbar

↓

calls

↓

Canvas
```

Good

```
Toolbar

↓

Store Action

↓

Canvas observes Store
```

Everything communicates through

- Zustand
- React Query
- Events

---

## Cross Feature Communication

Bad

```
Table

↓

imports

↓

Project
```

Good

```
Table

↓

Diagram Store

↓

Project Store

↓

Project Feature
```

Features should never know implementation details of other features.

---

# Component Categories

Every React component belongs to one category.

---

## 1. Shared Components

Reusable UI.

Examples

```
Button

Input

Dialog

Popover

Dropdown

Badge

Avatar

Loader
```

Rules

- Stateless whenever possible
- No business logic
- No API
- No Store

---

## 2. Feature Components

Business-specific.

Examples

```
Table

Relationship

Column

FloatingNote

ReviewBadge
```

Rules

May consume

- Hooks
- Stores
- Services

Must never

Know about other unrelated features.

---

## 3. Widget Components

Compose multiple features.

Example

```
WorkspaceCanvas

↓

Canvas

↓

Toolbar

↓

Properties

↓

Sidebar
```

Widgets coordinate.

Widgets do not implement business logic.

---

## 4. Page Components

Represent routes.

Responsibilities

- Route params
- Initial data loading
- Widget composition

Nothing else.

---

# Component Lifecycle

Every interactive component follows

```
Mount

↓

Initialize

↓

Subscribe

↓

Render

↓

Update

↓

Unmount

↓

Cleanup
```

Cleanup is mandatory.

Always remove

- Event listeners
- Timers
- Subscriptions
- Observers

---

# Custom Hooks Architecture

Hooks encapsulate behavior.

Example

```
useTableSelection()

↓

selection logic

↓

component
```

instead of

```
Table.tsx

↓

500 lines

↓

selection

↓

resize

↓

drag

↓

hover
```

---

## Hook Categories

### UI Hooks

Examples

```
useModal()

usePopover()

useHover()

useContextMenu()
```

---

### Feature Hooks

Examples

```
useCreateTable()

useDeleteColumn()

useMoveRelationship()

useReviewChanges()
```

---

### Infrastructure Hooks

Examples

```
useWebSocket()

useQuery()

useKeyboard()

useResizeObserver()
```

---

## Hook Rules

Hooks should

- expose state
- expose actions

Hooks should not

Return JSX

---

Good

```ts
const {

    move,

    dragging

} = useDrag();
```

Bad

```tsx
return <Dialog />;
```

---

# Context Usage

React Context is intentionally limited.

Allowed

```
Theme

Keyboard

Query

Authentication
```

Not allowed

```
Tables

Projects

Canvas

Relationships
```

Those belong in Zustand.

---

# Styling Architecture

Every component follows the same styling philosophy.

```
Tailwind

↓

Design Tokens

↓

Variants

↓

Component
```

Never

```
inline styles

unless dynamic positioning
```

---

# Design Tokens

All colors originate from design tokens.

Never

```
bg-blue-500
```

inside business components.

Instead

```
bg-primary

bg-secondary

bg-danger
```

Mapped through CSS variables.

---

## Spacing Scale

Standard spacing.

```
4

8

12

16

24

32

48

64
```

Avoid arbitrary values.

Bad

```
17px
```

---

## Border Radius

Use only predefined values.

```
sm

md

lg

xl
```

Never invent

```
11px
```

---

## Shadow Levels

```
Level 1

Cards

Level 2

Floating Panels

Level 3

Dialogs
```

Maintain consistency.

---

# Animation Standards

Animations should communicate state.

Never animate for decoration.

Examples

Good

```
Open Dialog

Collapse Table

Selection

Hover

Fade
```

Avoid

- bouncing
- spinning
- excessive movement

---

Animation Library

Framer Motion.

---

Duration

```
100ms

150ms

200ms

300ms
```

No animation longer than

```
500ms
```

without explicit reason.

---

# Canvas Styling Rules

Canvas is not styled like the rest of the application.

Rules

No shadows.

Minimal gradients.

High contrast.

Grid should remain subtle.

Selection color must match brand color.

---

# Design System Hierarchy

```
CSS Variables

↓

Tailwind Utilities

↓

Primitive Components

↓

Shared Components

↓

Feature Components

↓

Widgets

↓

Pages
```

Business components never define visual language.

Only consume it.

---

# Forms

Every form uses

React Hook Form

+

Zod.

Never

```
useState

↓

20 fields
```

Validation belongs inside schemas.

```
validation/

createProject.schema.ts

createTable.schema.ts

login.schema.ts
```

---

# Modal Architecture

Only one modal manager exists.

```
Dialog Store

↓

Modal Renderer

↓

Specific Modal
```

Never

```
<Component>

↓

opens

↓

another modal

↓

opens another modal
```

Nested modals are prohibited.

---

# Notification Architecture

Toast system only.

Categories

```
Success

Warning

Error

Info
```

Maximum

```
3

visible simultaneously.
```

Toast duration

```
3–5 seconds
```

unless action required.

---

# Search Architecture

Search must be generic.

```
SearchProvider

↓

SearchInput

↓

Feature Adapter
```

Features expose searchable items.

Search engine remains independent.

---

# Command Palette (Future Ready)

Reserve architecture for

```
Ctrl + K
```

Commands represented as

```ts
interface Command {

    id: string;

    title: string;

    category: string;

    execute(): void;

}
```

Every feature may register commands.

---

# Keyboard Shortcuts

Keyboard shortcuts are centralized.

```
KeyboardProvider

↓

Feature Registration

↓

Execution
```

Never attach

```
window.addEventListener

↓

inside random components
```

All shortcuts unregister on unmount.

---

# Clipboard Architecture

Future-proof clipboard.

Supports

```
Copy

Paste

Duplicate

Cut
```

Clipboard model

```ts
ClipboardItem

↓

type

↓

payload
```

Allows future support for

- Tables
- Columns
- Notes
- Relationships

using the same API.

---

# Feature Registration

Every feature exports exactly one public interface.

```
features/table/

index.ts
```

Example

```ts
export {

    Table,

    useTable,

    useCreateTable,

    TableProvider

};
```

Consumers import only from

```
index.ts
```

Deep imports are prohibited.

---

# Public vs Private APIs

Every feature has

Public

```
index.ts
```

Private

Everything else.

Only

```
index.ts
```

may be imported externally.

This prevents tight coupling between modules.

---

# Code Ownership Philosophy

Every folder should have a clear owner.

Example

```
table/

↓

owns

↓

everything related to tables.
```

Another feature must never modify internal implementation.

If shared functionality emerges,

extract it into

```
shared/
```

Never duplicate implementations across features.

---