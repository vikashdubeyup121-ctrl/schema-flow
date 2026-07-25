# File

Projects/schemaFlow/docs/frontend/06-features/06-features_PART_12.md

---

# Workspace Performance & Scalability Feature

This document defines the performance architecture for SchemaFlow.

Unlike previous documents which describe **what** the application does, this document defines **how the application continues to feel instant** as diagrams grow from a few tables to thousands.

Performance is not an optimization.

Performance is a feature.

It must be designed from day one.

---

# Goals

Phase 1

Support

```
50 Tables

500 Columns

500 Relationships
```

without noticeable lag.

Architecture Goal

```
500 Tables

10,000 Columns

20,000 Relationships
```

without rewriting major systems.

---

# Performance Philosophy

Never optimize after problems appear.

Design every feature assuming

```
Large Diagram
```

Every algorithm should have a known complexity.

Unknown complexity is a bug.

---

# Performance Budget

| Action | Target |
|----------|--------|
| Initial Workspace Load | < 1 second |
| Table Drag | 60 FPS |
| Zoom | 60 FPS |
| Pan | 60 FPS |
| Hover Highlight | < 8ms |
| Selection | < 16ms |
| Search | < 50ms |
| Undo | < 30ms |
| Autosave Scheduling | < 5ms |
| Command Execution | < 20ms |

---

# Rendering Philosophy

Never rerender

Entire workspace.

Instead

```
Store Update

↓

Affected Object

↓

Affected Component

↓

Render
```

Everything else remains untouched.

---

# React Rendering Rules

Allowed

```
React.memo

useMemo

useCallback

Selectors

Context Splitting
```

Avoid

```
Global Context

Large Providers

Anonymous Objects

Anonymous Arrays
```

---

# Selector Philosophy

Never

```ts
const state = useStore();
```

Always

```ts
const table =
useTable(tableId);
```

or

```ts
const selected =
useSelectedTable(tableId);
```

Every selector

Should have

Minimal subscriptions.

---

# Store Design

Good

```
Table Store

Column Store

Review Store

Selection Store

Viewport Store

Search Store
```

Bad

```
Global Store
```

---

# Component Memoization

Every renderable object

Must use

```
React.memo()
```

Examples

```
Table

Column

Relationship

Floating Note

Selection Border

Review Badge
```

---

# Stable Props

Never

```tsx
<Table

table={table}

/>
```

Always

```tsx
<Table

tableId={table.id}

/>
```

Selectors

Load state.

---

# Callback Rules

Bad

```tsx
onClick={() => renameTable(id)}
```

Good

```tsx
const onRename =
useRenameTable(id);
```

Avoid recreating

Functions.

---

# Object Allocation

Never allocate

During render.

Bad

```tsx
const style = {

left: x,

top: y

};
```

Good

Memoized

Styles.

---

# Geometry Cache

Geometry calculations

Should be cached.

Examples

```
Table Bounds

Relationship Path

Anchor Positions

Visible Bounds
```

Invalidate

Only when required.

---

# Relationship Cache

Relationship paths

Do not change

Every render.

Cache

SVG paths.

Recompute

Only after

```
Move

Resize

Zoom (if required)
```

---

# Graph Cache

Cache

```
Connected Tables

Connected Columns

Dependency Tree

Traversal

Statistics
```

Never traverse

Entire graph

On hover.

---

# Search Index Cache

Search index

Incrementally updated.

Never rebuild

Entire index

After

Single rename.

---

# Review Cache

Changed objects

Stored

Incrementally.

Never diff

Whole diagram

On every render.

---

# Virtualization

Phase 1

Not required.

Architecture

Prepared.

Future

Virtualize

```
Properties

Search

Editor

Table List

Dashboard
```

---

# Canvas Virtualization

Future

Only render

Visible objects.

Pipeline

```
Viewport

↓

Visible Bounds

↓

Visible Objects

↓

Renderer
```

---

# Viewport Culling

Do not render

Objects outside viewport.

Future optimization.

---

# Lazy Loading

Lazy load

```
Markdown Renderer

Export Engine

Import Engine

Settings

Review History
```

Initial bundle

Should remain small.

---

# Route Code Splitting

Every page

Lazy loaded.

```
Dashboard

Workspace

Settings

Share

Login
```

---

# Feature Code Splitting

Future

Lazy load

```
AI Assistant

Review History

Plugins

Templates
```

---

# Image Optimization

Icons

Prefer

```
lucide-react
```

Avoid

Large SVG bundles.

---

# CSS Strategy

Use

```
Tailwind

CSS Variables
```

Avoid

Large CSS files.

---

# Animation Strategy

Allowed

```
Opacity

Transform

Scale
```

Avoid

```
Width

Height

Top

Left
```

GPU accelerated.

---

# Drag Performance

Dragging

Uses

```
translate3d()
```

Never

```
left

top
```

---

# Zoom Performance

Zoom

Implemented

Through viewport transform.

Never

Individually transform

Objects.

---

# Pan Performance

Pan

Moves

Camera.

Never

Objects.

---

# Search Performance

Target

```
5,000 Objects

↓

Search

<50ms
```

Future

Worker Thread.

---

# Parsing Performance

DSL parsing

Debounced.

Future

Web Worker.

---

# Export Performance

Large exports

Should not block UI.

Future

Worker.

---

# Import Performance

Import

Parses

Off main thread.

Future

Worker.

---

# Memory Strategy

Store IDs.

Avoid

Duplicating objects.

Graph

Owns

Relationships.

Stores

Reference

IDs.

---

# React Query Strategy

Cache

Server state.

Never

Duplicate

Inside Zustand.

---

# Zustand Strategy

Owns

Only

UI state.

Never

Persist

Server entities.

---

# WebSocket Performance

Batch

Incoming operations.

Never

Render

After every packet.

---

# Collaboration Performance

Cursor updates

Throttle

```
30 FPS
```

Selection

Debounce.

Presence

Independent.

---

# Autosave Performance

Multiple edits

↓

One save.

Debounce

```
1500ms
```

---

# Profiling

Every release

Profile

```
Workspace Open

Drag

Zoom

Selection

Search

Publish
```

Performance regressions

Block release.

---

# Monitoring

Development

Expose

```
FPS

Render Count

Store Updates

Command Duration

Selector Hits
```

Future

Developer overlay.

---

# Testing

Performance Tests

```
100 Tables

500 Tables

1000 Tables

5000 Relationships

10 Concurrent Users
```

Measure

```
FPS

CPU

Memory

Render Count
```

---

# Anti-Patterns

Never

- Store server data in multiple stores
- Traverse every table on hover
- Use array index as React key
- Pass large objects as props
- Calculate geometry in React components
- Perform synchronous heavy work during rendering
- Trigger network requests from presentation components
- Create one global Zustand store
- Rebuild the graph after every small update
- Diff the complete diagram every render
- Serialize the whole diagram on every keystroke

---

# Engineering Checklist

Every new feature must answer

- What is the time complexity?
- What rerenders?
- What cache is invalidated?
- What selectors are affected?
- What store owns this state?
- Is this undoable?
- Is this collaborative?
- Is this review-aware?
- Is it accessible?
- Is it tested?

If any answer is unknown,

the implementation is incomplete.

---

# Final Acceptance Criteria

The frontend architecture is complete when

- Feature boundaries are respected
- Components remain presentation-only
- Business logic lives in feature services
- Commands are the only mutation path
- Graph is the canonical in-memory model
- DSL and Canvas synchronize through the Graph
- Review workflow is isolated
- Collaboration is event-driven
- Rendering is selector-based
- No unnecessary rerenders occur
- Performance budgets are met
- Accessibility requirements are met
- Lint passes
- TypeScript passes
- Unit tests pass
- Integration tests pass
- Performance tests pass

---

# Frontend Handbook Complete

```
Projects/schemaFlow/docs/frontend/

01-frontend-foundation.md

02-canvas-engine/
    ├── PART_1.md
    ├── PART_2.md
    ├── PART_3.md
    ├── PART_4.md
    ├── PART_5.md
    └── PART_6.md

03-dashboard/
    └── 03-dashboard.md

04-editor-sidebar/
    └── 04-editor-sidebar.md

05-diagram-components/
    ├── PART_1.md
    ├── PART_2.md
    ├── PART_3.md
    ├── PART_4.md
    ├── PART_5.md
    ├── PART_6.md
    └── PART_7.md

06-features/
    ├── PART_1.md
    ├── PART_2.md
    ├── PART_3.md
    ├── PART_4.md
    ├── PART_5.md
    ├── PART_6.md
    ├── PART_7.md
    ├── PART_8.md
    ├── PART_9.md
    ├── PART_10.md
    ├── PART_11.md
    └── PART_12.md
```

---

# Next Phase

The frontend engineering handbook is now complete.

The next documents should move to the backend:

```
Projects/schemaFlow/docs/backend/

01-backend-foundation.md
02-authentication.md
03-project-service.md
04-diagram-service.md
05-schema-service.md
06-versioning-service.md
07-collaboration-service.md
08-websocket-gateway.md
09-parser-service.md
10-storage-design.md
11-api-contracts.md
12-deployment.md
```

These documents will define the complete Node.js architecture, database schema, WebSocket protocol, API contracts, synchronization strategy, versioning, and deployment for SchemaFlow.