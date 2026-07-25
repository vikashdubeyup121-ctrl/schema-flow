# Canvas Engine Specification

**Document:** 02-canvas-engine.md — Part 1
**Project:** SchemaFlow
**Status:** Final
**Version:** 1.0

---

# Table of Contents

1. Canvas Engine Overview
2. React Flow Architecture
3. Canvas Component Hierarchy
4. Canvas Feature Folder Structure
5. Node Types
6. Edge Types
7. Coordinate System
8. Canvas Provider Architecture
9. Background and Grid
10. Minimap
11. Toolbar
12. Properties Panel
13. Context Menu
14. Review State Visual System
15. Canvas Keyboard Shortcuts
16. Autosave Mechanism
17. Collaboration Integration
18. Canvas Performance Architecture

---

# 1. Canvas Engine Overview

The Canvas Engine is the core interactive surface of SchemaFlow.

It is responsible for:

- Rendering database tables as draggable, resizable nodes
- Rendering relationships as typed edges
- Rendering floating markdown notes
- Managing viewport (zoom, pan, fit)
- Managing selection, hover, drag, resize, and connection interactions
- Visualizing the Change Review System state on every entity
- Broadcasting position changes to collaborators in real time

The Canvas Engine is **not** responsible for:

- Business validation (belongs to feature services)
- Backend persistence (belongs to feature API layers)
- Authentication (belongs to the auth feature)
- Project or diagram metadata (belongs to project/diagram features)

The canvas is intentionally dumb about business rules.

It visualizes state.

It delegates decisions.

---

# 2. React Flow Architecture

SchemaFlow uses **React Flow** (`@xyflow/react`) as the canvas foundation.

React Flow provides:

- Viewport management (zoom, pan, fit)
- Node rendering with drag support
- Edge rendering with connection handles
- Minimap
- Background patterns
- Selection box

SchemaFlow wraps React Flow entirely inside the canvas feature.

**Nothing outside the canvas feature imports React Flow directly.**

All React Flow types are imported through

```
src/lib/reactflow.ts
```

---

## React Flow Configuration

```ts
<ReactFlow
  nodeTypes={nodeTypes}
  edgeTypes={edgeTypes}
  nodes={nodes}
  edges={edges}
  onNodesChange={onNodesChange}
  onEdgesChange={onEdgesChange}
  onConnect={onConnect}
  minZoom={0.1}
  maxZoom={2.0}
  defaultViewport={{ x: 0, y: 0, zoom: 1 }}
  panOnScroll={true}
  panOnDrag={[1, 2]}
  selectionOnDrag={false}
  selectNodesOnDrag={false}
  nodesDraggable={true}
  nodesConnectable={true}
  elementsSelectable={true}
  fitView={false}
  snapToGrid={false}
  proOptions={{ hideAttribution: true }}
/>
```

**Key decisions:**

- `panOnDrag={[1, 2]}` — middle mouse and right mouse pan only. Left mouse is reserved for selection and dragging nodes.
- `selectionOnDrag={false}` — selection box is handled by our own overlay engine, not React Flow's built-in.
- `selectNodesOnDrag={false}` — selection is managed by our Selection Store, not React Flow.
- `snapToGrid={false}` — snap is handled by our Snap Engine, not React Flow's built-in.

---

## Nodes and Edges are Derived State

React Flow `nodes` and `edges` arrays are **never stored directly** in any Zustand store.

They are **derived** from the feature stores on every render.

```
TableStore

↓

mapTablesToNodes()

↓

React Flow nodes
```

```
RelationshipStore

↓

mapRelationshipsToEdges()

↓

React Flow edges
```

```
NoteStore

↓

mapNotesToNodes()

↓

React Flow nodes
```

This keeps the source of truth in the feature stores, not React Flow's internal state.

---

## onNodesChange Handler

React Flow calls `onNodesChange` for every drag, resize, or position update.

SchemaFlow handles only:

```
NodeChange.type === 'position'
```

All other change types (add, remove) are ignored — those are handled by feature mutations.

Position changes during drag are **optimistic** — they update the store immediately and commit to the backend on drag end.

---

# 3. Canvas Component Hierarchy

```
WorkspacePage

↓

WorkspaceCanvas (widget)

├── CanvasProvider

│   ├── ReactFlowProvider

│   │   └── CanvasCore

│   │       ├── ReactFlow

│   │       │   ├── Background

│   │       │   ├── MiniMap

│   │       │   ├── Controls (hidden, custom controls used)

│   │       │   ├── [TableNode] ×N

│   │       │   ├── [NoteNode] ×N

│   │       │   └── [RelationshipEdge] ×N

│   │       └── CanvasOverlay

│   │           ├── SelectionBox

│   │           └── ConnectionPreview

│   ├── CanvasToolbar

│   ├── CanvasContextMenu

│   └── CanvasStatusBar

└── PropertiesPanel (conditional)
```

---

## Layer Responsibilities

| Component | Responsibility |
|-----------|----------------|
| `WorkspaceCanvas` | Widget shell. Composes all canvas sub-components. |
| `CanvasProvider` | Initializes canvas stores and provides React Flow context. |
| `CanvasCore` | Renders the ReactFlow instance. Owns node/edge arrays. |
| `CanvasOverlay` | Renders non-node UI on top of canvas (selection box, connection preview). |
| `CanvasToolbar` | Tool selection, zoom controls, fit/center actions. |
| `CanvasContextMenu` | Right-click context menus for canvas, tables, relationships. |
| `CanvasStatusBar` | Zoom level display, node count, collaboration indicators. |
| `PropertiesPanel` | Sidebar showing properties of the selected entity. Rendered by WorkspaceCanvas, populated by the active selection. |

---

# 4. Canvas Feature Folder Structure

```
features/canvas/

├── components/
│   ├── CanvasCore/
│   ├── CanvasOverlay/
│   ├── CanvasToolbar/
│   ├── CanvasContextMenu/
│   ├── CanvasStatusBar/
│   └── CanvasProvider/

├── hooks/
│   ├── useCanvasDrag.ts
│   ├── useCanvasResize.ts
│   ├── useCanvasConnection.ts
│   ├── useCanvasHover.ts
│   ├── useCanvasKeyboard.ts
│   ├── useCanvasContextMenu.ts
│   └── useCanvasAutosave.ts

├── services/
│   ├── hitTest.service.ts
│   ├── snapEngine.service.ts
│   ├── selectionEngine.service.ts
│   ├── hoverGraph.service.ts
│   └── dragSession.service.ts

├── stores/
│   ├── canvasViewport.store.ts
│   ├── canvasSelection.store.ts
│   ├── canvasInteraction.store.ts
│   ├── canvasHover.store.ts
│   ├── canvasContextMenu.store.ts
│   └── canvasClipboard.store.ts

├── types/
│   ├── Canvas.ts
│   ├── CanvasNode.ts
│   ├── CanvasEdge.ts
│   └── InteractionMode.ts

├── constants/
│   └── canvas.constants.ts

└── index.ts
```

---

# 5. Node Types

SchemaFlow registers two custom node types with React Flow.

```ts
const nodeTypes = {
  table: TableNode,
  note: NoteNode,
};
```

---

## TableNode

The `TableNode` is the primary canvas entity.

### Structure

```
TableNode

├── TableHeader
│   ├── ColorBar (left accent)
│   ├── TableName (editable inline)
│   ├── CollapseButton
│   └── ReviewBadge (Created / Modified / Deleted)

├── ColumnList (hidden when collapsed)
│   └── ColumnRow ×N
│       ├── KeyIcon (PK / FK indicator)
│       ├── ColumnName
│       ├── DataType
│       ├── NullableIndicator
│       └── ConnectionHandle (source + target)

└── ResizeHandle (bottom-right)
```

### Props (from React Flow NodeProps)

```ts
interface TableNodeData {
  tableId: string;
  name: string;
  color: string;
  collapsed: boolean;
  reviewState: ReviewState;
  columns: CanvasColumn[];
}
```

### Rules

- `TableNode` reads data from `NodeProps.data`.
- It never reads from Zustand directly.
- All interactions (click, drag, right-click) are delegated to hooks.
- The node component is purely presentational.
- Inline editing of the table name triggers a store action, not a direct API call.

### Connection Handles

Every column row renders two React Flow `Handle` components:

```
Left Handle  — relationship target (type: "target")
Right Handle — relationship source (type: "source")
```

Handle ID format:

```
`col-{columnId}-source`
`col-{columnId}-target`
```

Handles are only visible on hover.

---

## NoteNode

Floating markdown note.

### Structure

```
NoteNode

├── NoteHeader
│   ├── DragHandle
│   └── DeleteButton

├── NoteContent
│   ├── MarkdownRenderer (view mode)
│   └── TextArea (edit mode)

└── ResizeHandle (bottom-right)
```

### Props

```ts
interface NoteNodeData {
  noteId: string;
  content: string;
  reviewState: ReviewState;
  isEditing: boolean;
}
```

### Rules

- Double-click activates edit mode.
- Markdown rendered using `react-markdown` from `lib/markdown.ts`.
- Minimum size: 160px × 100px.
- Maximum size: 600px × 800px.

---

# 6. Edge Types

SchemaFlow registers one custom edge type.

```ts
const edgeTypes = {
  relationship: RelationshipEdge,
};
```

---

## RelationshipEdge

Custom edge rendering database relationship cardinality.

### Cardinality Markers

| Type | Source Marker | Target Marker |
|------|---------------|---------------|
| ONE_TO_ONE | `|` (single) | `|` (single) |
| ONE_TO_MANY | `|` (single) | `<` (crow's foot) |
| MANY_TO_ONE | `<` (crow's foot) | `|` (single) |

Markers are rendered as SVG path elements at each end of the edge.

### Props

```ts
interface RelationshipEdgeData {
  relationshipId: string;
  relationshipType: RelationshipType;
  sourceColumnId: string;
  targetColumnId: string;
  reviewState: ReviewState;
}
```

### Routing

Edges use **smooth step** routing by default.

Edges never pass through nodes.

On hover: edge becomes highlighted (brighter stroke, thicker).

On table hover: all connected edges of that table highlight.

### Review State Styling

| Review State | Edge Color |
|------|------|
| Published | `--muted-foreground` |
| Created | `--color-review-created` (green) |
| Modified | `--color-review-modified` (yellow) |
| Deleted | `--color-review-deleted` (red), dashed stroke |

---

# 7. Coordinate System

React Flow uses its own internal coordinate system.

**Flow coordinates** — the position of nodes in the infinite canvas space. Stored in the backend.

**Screen coordinates** — pixel positions on the user's screen. Used for context menus and overlays.

**Conversion**

```ts
screenToFlow(screenPoint, viewport): Point
flowToScreen(flowPoint, viewport): Point
```

Both utility functions live in

```
features/canvas/services/coordinateSystem.service.ts
```

Drag sessions track positions in **flow coordinates**.

Context menus open at **screen coordinates**.

---

# 8. Canvas Provider Architecture

The canvas initializes in a specific order.

```
CanvasProvider

↓

Initialize canvas stores

↓

Load diagram nodes and edges from server

↓

Populate React Flow nodes/edges arrays

↓

Render canvas

↓

Fit view (if new diagram)
```

`CanvasProvider` is a React context that:

- Holds the `ReactFlowInstance` reference
- Provides `zoomIn`, `zoomOut`, `fitView`, `center` actions to child components
- Registers canvas-level keyboard shortcuts

```ts
interface CanvasContextValue {
  instance: ReactFlowInstance | null;
  zoomIn: () => void;
  zoomOut: () => void;
  fitView: () => void;
  center: () => void;
}
```

---

# 9. Background and Grid

```tsx
<Background
  variant={BackgroundVariant.Dots}
  gap={20}
  size={1}
  color="hsl(var(--border))"
/>
```

Grid:

- Dot pattern, 20px gap
- Dot color matches `--border` token
- Grid always visible regardless of zoom level
- Grid dot size stays constant (does not scale with zoom)

Snap-to-grid (MVP): positions are snapped to the nearest 20px grid point on drag commit.

---

# 10. Minimap

```tsx
<MiniMap
  nodeColor={getMinimapNodeColor}
  maskColor="hsl(var(--background) / 0.7)"
  style={{ background: 'hsl(var(--surface))' }}
  position="bottom-right"
/>
```

`getMinimapNodeColor` returns the table's color property, so the minimap reflects actual table colors.

Minimap is always visible.

Clicking the minimap pans the viewport.

---

# 11. Toolbar

The `CanvasToolbar` is a floating panel anchored to the top of the canvas.

### Tools

| Tool | Icon | Keyboard | Description |
|------|------|----------|-------------|
| Pointer | `MoveIcon` | `V` | Default. Select and drag tables. |
| Hand | `MoveIcon` | `H` | Pan mode. Click and drag to pan. |

### Actions

| Action | Icon | Keyboard | Description |
|--------|------|----------|-------------|
| Add Table | `AddIcon` | `T` | Creates a new table at canvas center. |
| Add Note | `NoteIcon` | `N` | Creates a new note at canvas center. |
| Zoom In | `ZoomInIcon` | `Ctrl +` | Increase zoom. |
| Zoom Out | `ZoomOutIcon` | `Ctrl -` | Decrease zoom. |
| Fit View | `MaximizeIcon` | `Ctrl Shift F` | Fit all content in viewport. |
| Center | `GridIcon` | `Ctrl 0` | Reset viewport to origin. |

### Tool State

The active tool is stored in `canvasInteraction.store.ts` under `activeTool`.

```ts
type CanvasTool = 'pointer' | 'hand';
```

---

# 12. Properties Panel

The `PropertiesPanel` renders on the right side of the canvas when an entity is selected.

### Behavior

| Selection | Panel Content |
|-----------|---------------|
| None | Panel hidden |
| Table selected | TableProperties |
| Relationship selected | RelationshipProperties |
| Note selected | NoteProperties |
| Multiple selected | BulkProperties (future) |

### TableProperties

Editable fields:

- Table name (text input)
- Table color (color picker — 8 preset colors)
- Columns list (add, remove, reorder)
- Per-column: name, data type, primary key, nullable, unique, default value, note

### RelationshipProperties

Readable fields:

- Source table / column
- Target table / column
- Relationship type (dropdown: ONE_TO_ONE, ONE_TO_MANY, MANY_TO_ONE)

### NoteProperties

- Content (markdown editor)
- Font size (future)

### Rules

- Properties panel is a widget-level concern, not a canvas-level concern.
- Canvas knows what is selected.
- The properties panel reads the selection and renders the correct feature component.
- Properties panel never directly mutates canvas state — it calls feature store actions.

---

# 13. Context Menu

Right-clicking on the canvas opens the `CanvasContextMenu`.

### Target: Canvas (empty space)

```
Add Table
Add Note
Paste     (if clipboard has content)
Select All
Fit View
```

### Target: Table

```
Rename Table
Change Color
Duplicate Table
Delete Table
─────────────
Copy
```

### Target: Relationship

```
Delete Relationship
```

### Target: Note

```
Edit Note
Delete Note
─────────────
Copy
```

### Implementation

Context menu state lives in `canvasContextMenu.store.ts`.

Menu content is determined by `targetType` from the store.

Each menu item calls a feature hook action — not a direct API call.

---

# 14. Review State Visual System

Every entity on the canvas carries a `ReviewState`.

```ts
type ReviewState = 'published' | 'created' | 'modified' | 'deleted';
```

### CSS Variables for Review States

```css
--color-review-published: hsl(var(--muted-foreground));
--color-review-created: 142 76% 36%;    /* green */
--color-review-modified: 38 92% 50%;    /* amber */
--color-review-deleted: 0 72% 51%;      /* red */
```

### Visual Rules

| State | Table Border | Column Row | Relationship Edge | Note Border |
|-------|-------------|-----------|------------------|-------------|
| Published | `--border` (no highlight) | Normal | `--muted-foreground` | `--border` |
| Created | `2px solid --review-created` | Row background tinted green | Green stroke | Green border |
| Modified | `2px solid --review-modified` | Modified rows tinted amber | Amber stroke | Amber border |
| Deleted | `2px solid --review-deleted` + opacity 0.6 | Strike-through text | Red dashed stroke | Red border + opacity 0.6 |

### Review Badge

When a table's review state is not Published, a small colored badge appears in the table header.

```
Created   → green "New" badge
Modified  → amber "Modified" badge
Deleted   → red "Deleted" badge
```

### Deleted Entities

Deleted entities remain visible on the canvas during review.

They are rendered with:

- Red border
- 60% opacity
- Strike-through on name and column names

They cannot be selected for editing.

They can only be "restored" (removing the deleted state) or published (removing them permanently).

---

# 15. Canvas Keyboard Shortcuts

Canvas keyboard shortcuts are registered through the `KeyboardProvider`.

They are registered on canvas mount and unregistered on canvas unmount.

| Shortcut | Action | Notes |
|----------|--------|-------|
| `V` | Switch to Pointer tool | Canvas-scoped |
| `H` | Switch to Hand tool | Canvas-scoped |
| `T` | Add new table | Canvas-scoped |
| `N` | Add new note | Canvas-scoped |
| `Delete` or `Backspace` | Delete selected | Canvas-scoped, ignores text inputs |
| `Escape` | Deselect all / cancel interaction | Canvas-scoped |
| `Ctrl + A` | Select all | Canvas-scoped |
| `Ctrl + D` | Duplicate selected table | Canvas-scoped |
| `Ctrl + =` | Zoom in | Canvas-scoped |
| `Ctrl + -` | Zoom out | Canvas-scoped |
| `Ctrl + Shift + F` | Fit view | Canvas-scoped |
| `Ctrl + 0` | Center / reset zoom | Canvas-scoped |

**Canvas-scoped** means: these shortcuts are only active when no text input is focused.

Text input fields (table name edit, column name edit) suppress all canvas shortcuts.

---

# 16. Autosave Mechanism

Autosave is triggered by **inactivity after a change**.

```
User Action (drag, rename, add, delete)

↓

Mark diagram as dirty

↓

Reset 2-second inactivity timer

↓

Timer expires

↓

Flush pending changes to backend

↓

Mark diagram as clean
```

### Implementation

`useCanvasAutosave.ts` manages this lifecycle.

```ts
interface AutosaveState {
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;
}
```

The autosave hook:

- Listens to changes in the table, column, relationship, and note stores.
- Debounces with a 2-second window.
- Calls the diagram save mutation on flush.
- Shows a "Saving..." indicator in the status bar during save.
- Shows "Saved" with timestamp after success.
- Shows "Error — retry" on failure.

Autosave interval is configured in

```ts
config/editor.ts → EDITOR.AUTOSAVE_INTERVAL_MS = 2000
```

---

# 17. Collaboration Integration

Canvas collaboration uses **Socket.IO**.

### Events Emitted by Canvas

```
canvas:table-moved       { diagramId, tableId, x, y }
canvas:table-resized     { diagramId, tableId, width }
canvas:table-created     { diagramId, table }
canvas:table-deleted     { diagramId, tableId }
canvas:column-added      { diagramId, tableId, column }
canvas:column-deleted    { diagramId, tableId, columnId }
canvas:relationship-created  { diagramId, relationship }
canvas:relationship-deleted  { diagramId, relationshipId }
canvas:note-moved        { diagramId, noteId, x, y }
canvas:note-updated      { diagramId, noteId, content }
```

### Events Received by Canvas

The canvas listens for the same events from other collaborators and applies changes to the local store.

**Conflict resolution (MVP):** Last write wins. No CRDT.

### Collaboration Hook

```ts
useCanvasCollaboration(diagramId: string): void
```

Lives in `features/collaboration/hooks/useCanvasCollaboration.ts`.

Canvas mounts this hook.

Canvas does not know about Socket.IO internals.

---

# 18. Canvas Performance Architecture

### Node Rendering

Each node is individually memoized.

```tsx
export const TableNode = memo(function TableNode(...) {})
```

React Flow renders only visible nodes (internal viewport culling).

### Avoiding Unnecessary Rerenders

- Canvas stores use **Zustand selectors**, not full store subscriptions.
- Stable callbacks via `useCallback`.
- `nodeTypes` and `edgeTypes` are defined **outside** the component — never recreated on render.

### Large Diagrams

For diagrams with 100+ tables, React Flow's internal virtualization handles viewport culling automatically.

Future optimization: adjacency map caching in `hoverGraph.service.ts`.

### Drag Performance

During drag:

- Position updates are batched per animation frame.
- Store updates happen on `requestAnimationFrame`.
- Backend commit happens only on `mouseup`.

Never commit to backend on every `mousemove`.

---

# End of Part 1

**Next:** Part 2 — Canvas State Management Architecture (stores, sessions, selection engine, drag engine, connection engine, hover highlighting)
