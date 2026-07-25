# File

Projects/schemaFlow/docs/frontend/02-canvas-engine/02-canvas-engine_PART_3.md

---

# Canvas Store Architecture

The Canvas Engine is composed of multiple independent stores.

Each store manages exactly one concern.

```
Canvas

├── Viewport Store
├── Selection Store
├── Interaction Store
├── Hover Store
├── Context Menu Store
├── Clipboard Store
├── Guide Store
└── History Store (Future)
```

Each store should be independently testable.

Never merge unrelated responsibilities.

---

# Recommended Store Structure

```
features/

canvas/

stores/

├── canvasViewport.store.ts
├── canvasSelection.store.ts
├── canvasInteraction.store.ts
├── canvasHover.store.ts
├── canvasContextMenu.store.ts
├── canvasClipboard.store.ts
├── canvasGuide.store.ts
└── index.ts
```

---

# Canvas Viewport Store

Purpose

Owns the camera.

Nothing else.

```ts
interface CanvasViewportState {

    viewport: Viewport;

    zoomLevel: number;

    setViewport()

    zoom()

    zoomIn()

    zoomOut()

    pan()

    fitContent()

    centerContent()

}
```

Never add

- tables
- selection
- hover

---

# Selection Store

Selection is independent from rendering.

Selection should survive rerenders.

```ts
interface CanvasSelectionState {

    selectedTables: Set<string>;

    selectedRelationships: Set<string>;

    selectedNotes: Set<string>;

}
```

Actions

```
select()

toggle()

clear()

selectMany()

invertSelection()

selectAll()
```

---

# Interaction Store

Tracks user interaction.

```ts
enum InteractionMode {

    Idle,

    Selecting,

    Dragging,

    Resizing,

    Connecting,

    Editing,

    Panning

}
```

Only one interaction allowed.

---

# Hover Store

Hover state disappears immediately.

Contains

```ts
hoveredTableId

hoveredColumnId

hoveredRelationshipId
```

Never persist hover.

---

# Clipboard Store

Stores copied objects.

```ts
Clipboard

↓

Item Type

↓

Serialized Payload
```

Supports

- Table
- Relationship
- Note

Future

- Multiple Objects

---

# Guide Store

Responsible for

```
Snap Lines

Alignment Lines

Distance Guides

Drop Preview
```

Only visual.

No business logic.

---

# Future History Store

Reserved for

Undo

Redo

Operations

Snapshots

---

# Store Communication

Stores never call each other directly.

Bad

```
Selection Store

↓

Viewport Store
```

Good

```
Action

↓

Canvas Service

↓

Store A

↓

Store B
```

Communication happens through services.

---

# Canvas Services

Canvas Services contain all calculations.

Structure

```
canvas/

services/

├── viewport.service.ts
├── geometry.service.ts
├── hitTest.service.ts
├── drag.service.ts
├── resize.service.ts
├── snap.service.ts
├── guide.service.ts
├── hover.service.ts
├── selection.service.ts
├── keyboard.service.ts
└── clipboard.service.ts
```

---

# Viewport Service

Responsible for

- Zoom calculations
- Coordinate conversion
- Fit View
- Center View
- Camera animations

Never updates store directly.

Returns values.

---

# Geometry Service

One of the most important services.

Responsibilities

- Bounding boxes
- Rectangle intersection
- Point intersection
- Distance
- Center calculation
- Edge anchor calculation
- Handle position

Every geometric calculation belongs here.

---

# Hit Test Service

Purpose

Determine

"What is under the cursor?"

Flow

```
Mouse Position

↓

Geometry

↓

Hit Test

↓

Target
```

Returns

```
Canvas

Table

Column

Relationship

Handle

Note
```

---

# Selection Service

Responsible for

Selection rules.

Examples

```
Single Selection

Ctrl Selection

Shift Selection

Area Selection

Toggle Selection
```

Never implement these inside components.

---

# Drag Service

Calculates

- Delta
- New Position
- Snap
- Constraints

Returns

```
Updated Position
```

Component applies result.

---

# Resize Service

Responsible for

```
Minimum Width

Maximum Width

Resize Direction

Constraints
```

Never manipulate DOM.

---

# Snap Service

Initial MVP

Grid Snap.

Future

```
Grid

↓

Table Edge

↓

Table Center

↓

Alignment Guides

↓

Equal Spacing
```

Snap calculations belong only here.

---

# Hover Service

Computes

```
Hovered Object

↓

Connected Objects

↓

Highlight Set
```

No rendering.

Only calculations.

---

# Keyboard Service

Responsible for

```
Delete

Escape

Ctrl+C

Ctrl+V

Ctrl+A

Ctrl+D

Ctrl+Z

Ctrl+Shift+Z
```

Features register shortcuts.

Keyboard service executes them.

---

# Clipboard Service

Responsible for

Serialization.

```
Object

↓

Clipboard Format

↓

Clipboard Store
```

Future

Browser clipboard integration.

---

# Utility Structure

```
canvas/

utils/

coordinate.ts

viewport.ts

selection.ts

ids.ts

mouse.ts

keyboard.ts

zoom.ts

edge.ts
```

Utilities

Pure.

No React.

---

# Constants

```
canvas.constants.ts
```

Contains

```
MIN_ZOOM

MAX_ZOOM

GRID_SIZE

SNAP_DISTANCE

SELECTION_COLOR

DOUBLE_CLICK_DELAY

DRAG_THRESHOLD

DEFAULT_ZOOM

DEFAULT_TABLE_WIDTH
```

Never hardcode these values.

---

# Renderers

Separate rendering from logic.

```
renderers/

tableRenderer.ts

relationshipRenderer.ts

selectionRenderer.ts

guideRenderer.ts

overlayRenderer.ts
```

React components consume renderers.

---

# Canvas Events

Every interaction becomes an event.

Examples

```
CANVAS_CLICK

CANVAS_DOUBLE_CLICK

TABLE_SELECTED

TABLE_MOVED

TABLE_RESIZED

EDGE_CREATED

EDGE_DELETED

NOTE_CREATED

VIEWPORT_CHANGED
```

Events are immutable.

---

# Canvas Event Pipeline

```
Browser Event

↓

Normalize Event

↓

Canvas Event

↓

Service

↓

Store

↓

Render
```

No component should directly react to browser events.

---

# Pointer Event Standard

Use Pointer Events.

Never mix

```