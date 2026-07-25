# File

Projects/schemaFlow/docs/frontend/02-canvas-engine/02-canvas-engine_PART_4.md

---

# Rendering Architecture

Rendering is the most performance-sensitive subsystem of SchemaFlow.

The renderer should only render what has actually changed.

Never rerender the complete canvas because a single table moved.

The rendering engine must be deterministic.

```
State

↓

Compute

↓

Render

↓

Browser Paint
```

Rendering must never modify state.

---

# Rendering Layers

Canvas is rendered in independent layers.

```
Canvas Root

│

├── Background Layer

├── Edge Layer

├── Node Layer

├── Selection Layer

├── Guide Layer

├── Overlay Layer

├── Context Menu Layer

├── Floating UI Layer

└── Dialog Layer
```

Every layer owns its rendering.

Never mix responsibilities.

---

# Layer Responsibilities

## Background Layer

Responsible for

- Grid
- Background Color

Never

- Tables
- Relationships
- Notes

---

## Edge Layer

Responsible for

Rendering

- Relationships
- Temporary Relationships
- Hover Relationships

Nothing else.

---

## Node Layer

Responsible for

- Tables
- Notes

Nothing else.

---

## Selection Layer

Responsible for

- Selection Rectangle
- Selected Borders
- Multi Select Preview

---

## Guide Layer

Responsible for

- Snap Guides
- Alignment Guides
- Equal Distance Guides

---

## Overlay Layer

Contains

- Drag Preview
- Resize Preview
- Temporary Connection
- Drop Indicators

---

## Floating UI Layer

Contains

- Tooltips
- Hover Cards
- Floating Toolbar

---

## Dialog Layer

Highest priority.

Contains

- Dialogs
- Confirmation
- Import Window
- Export Window

---

# Render Pipeline

```
Store Changed

↓

Selector

↓

Diff

↓

Affected Objects

↓

Renderer

↓

Browser Paint
```

Never

```
Store

↓

Entire Canvas

↓

Render
```

---

# Render Diffing

Every render starts by determining

"What actually changed?"

Possible changes

```
Table Position

Table Color

Table Name

Column Name

Relationship

Selection

Viewport
```

Only affected renderer executes.

---

# Dirty Object Tracking

Each feature marks objects as dirty.

Example

```
Table 14

↓

Moved

↓

Dirty

↓

Render

↓

Clean
```

This allows future partial rendering optimizations.

---

# React.memo Strategy

Every major component

```
Canvas

Table

Column

Relationship

Selection

Guide
```

should be wrapped with

```
React.memo()
```

when props are stable.

---

# Selector Strategy

Never subscribe to an entire store.

Bad

```ts
const state = useCanvasStore();
```

Good

```ts
const viewport = useCanvasStore(
    state => state.viewport
);
```

Always subscribe to the smallest possible slice.

---

# Derived Data

Never compute inside render.

Bad

```tsx
const connected =
relationships.filter(...);
```

Good

```
Selector

↓

Memoized

↓

Component
```

---

# Expensive Calculations

Move to services.

Examples

```
Relationship Routing

Bounding Boxes

Hit Testing

Snap Detection

Alignment
```

Never perform inside React render.

---

# Table Rendering Architecture

```
Table

│

├── Header

├── Body

│   ├── Column

│   ├── Column

│   └── Column

├── Connection Handles

├── Resize Handles

└── Review Indicator
```

Each child should be independently memoized.

---

# Column Rendering

Column rendering should remain lightweight.

Each row should only receive

```
Column ID
```

Component loads data using selector.

Reason

Stable props.

Minimal rerenders.

---

# Relationship Rendering

Relationship rendering should never depend on table components.

Relationship

↓

Geometry Service

↓

Coordinates

↓

Renderer

Renderer should only receive

```
Source

Target

Style
```

---

# Connection Handle Rendering

Handles should only appear

When

- Table Selected
- Table Hovered
- User Creating Relationship

Otherwise

Do not render.

---

# Review Mode Rendering

Objects render differently based on review state.

Published

```
Normal Border
```

Created

```
Green Border
```

Modified

```
Yellow Border
```

Deleted

```
Red Border

Reduced Opacity
```

Review renderer decides style.

Business component should not.

---

# Visibility Culling

Future optimization.

Only render objects inside viewport.

```
World Objects

↓

Viewport

↓

Visible Objects

↓

Renderer
```

Do not implement for MVP.

Architecture should support it.

---

# Relationship Routing

Relationship path should be calculated by

```
Relationship Service

↓

Renderer
```

Never

Inside component.

Future

Support

- Straight
- Bezier
- Orthogonal
- Smart Routing

---

# Node Virtualization

Future optimization.

When

```
5000+

Tables
```

Only visible nodes should mount.

Current MVP

Render all.

Architecture must support virtualization.

---

# Rendering Cache

Future optimization.

Cache

```
Bounding Boxes

Edge Paths

Selection Bounds

Relationship Anchors
```

Invalidated only when necessary.

---

# Hover Rendering

Hover should never trigger expensive recomputation.

Flow

```
Hover

↓

Lookup

↓

Highlight Set

↓

Render
```

No graph traversal during render.

---

# Connected Highlight

Requirement

Hovering a table should highlight

```
Incoming Relationships

Outgoing Relationships

Connected Tables
```

Future

Support

```
2nd Degree Connections

Entire Connected Component
```

---

# Animation Strategy

Canvas animations

Only for

```
Selection

Viewport

Fade

Relationship Creation
```

Never animate

Dragging.

Dragging must remain immediate.

---

# Resize Rendering

During resize

```
Current Size

↓

Preview

↓

Render

↓

Commit
```

Preview should not trigger backend updates.

---

# Drag Rendering

Dragging should update

```
Transform

instead of

top/left
```

Reason

GPU acceleration.

---

# GPU Acceleration

Prefer

```css
transform:
translate3d(...)
```

Avoid

```css
top

left
```

Browser performs better.

---

# Frame Budget

Target

```
60 FPS

↓

16.67 ms

per frame
```

Approximate allocation

```
JS

5 ms

Layout

3 ms

Paint

5 ms

Buffer

3 ms
```

Heavy calculations should never execute every frame.

---

# Reconciliation Rules

Stable Keys

Always.

Bad

```tsx
index
```

Good

```tsx
table.id
```

Never recreate arrays unnecessarily.

---

# React Key Strategy

Tables

```
table.id
```

Columns

```
column.id
```

Relationships

```
relationship.id
```

Notes

```
note.id
```

IDs must never change during object lifetime.

---

# Render Monitoring

Development only.

Track

```
Render Count

Render Time

Frame Drops
```

Future

React Profiler integration.

---

# Canvas Performance Checklist

Every new rendering feature must answer

- Does this rerender unrelated tables?
- Does this allocate new arrays?
- Does this create new callbacks?
- Does this perform graph traversal?
- Does this trigger layout?
- Does this allocate large objects?

If yes,

Refactor before merge.

---

# Render Anti-Patterns

Never

- Traverse every relationship during render
- Filter thousands of tables in JSX
- Compute geometry inside components
- Create objects inside render loops
- Create anonymous functions for every row
- Mutate props
- Store React elements in Zustand

All rendering should be predictable, memoized where appropriate, and isolated to the smallest affected region.

---