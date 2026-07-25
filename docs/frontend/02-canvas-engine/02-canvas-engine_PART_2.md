# File

Projects/schemaFlow/docs/frontend/02-canvas-engine/02-canvas-engine_PART_2.md

---

# Canvas State Management Architecture

The Canvas Engine is composed of multiple independent state machines rather than one monolithic store.

Each subsystem owns its own state.

```
Canvas

├── Viewport
├── Selection
├── Interaction
├── Context Menu
├── Hover
├── Clipboard
├── Keyboard
└── Drag Session
```

Never create

```
canvas.store.ts

↓

Everything
```

Instead

```
stores/

canvasViewport.store.ts

canvasSelection.store.ts

canvasInteraction.store.ts

canvasContextMenu.store.ts

canvasClipboard.store.ts
```

Every store has one responsibility.

---

# Viewport Store

Responsible only for viewport.

```ts
interface ViewportState {

    viewport: Viewport;

    zoomIn(): void;

    zoomOut(): void;

    setViewport(): void;

    centerCanvas(): void;

    fitContent(): void;

}
```

Never store

- selected node
- hovered node
- dragging node

---

# Selection Store

Selection is completely independent.

```ts
interface SelectionState {

    selectedTables: string[];

    selectedRelationships: string[];

    selectedNotes: string[];

}
```

Future support

- Multi-selection
- Area selection
- Copy/Paste
- Bulk delete

depends on this separation.

---

Selection Rules

Only one active selection exists.

```
Table

OR

Relationship

OR

Mixed Selection
```

Selection should never exist inside

React Flow.

React Flow only renders it.

---

# Hover Store

Hover state is transient.

Should never be persisted.

Example

```
Hovered Table

Hovered Column

Hovered Relationship
```

Hover disappears

```
Mouse Leave

↓

Clear Hover
```

Never debounce hover.

---

# Interaction Store

Tracks the current interaction.

```ts
enum InteractionMode {

    Idle,

    Dragging,

    Resizing,

    Connecting,

    Selecting,

    Panning,

    Editing

}
```

Exactly one interaction mode is active.

Never allow

```
Dragging

+

Resizing
```

simultaneously.

---

# Context Menu Store

Contains

```ts
interface ContextMenuState {

    open: boolean;

    x: number;

    y: number;

    targetId?: string;

    targetType?: CanvasTargetType;

}
```

Canvas renders menu.

Feature decides menu contents.

---

# Clipboard Store

Future-proof.

Supports

```ts
interface ClipboardItem {

    type:

        | "table"

        | "relationship"

        | "note"

        | "column";

    payload: unknown;

}
```

Clipboard should remain generic.

---

# Drag Session Architecture

Dragging is not simply

```
Mouse Move

↓

Update Position
```

Instead

```
Mouse Down

↓

Start Drag Session

↓

Track Delta

↓

Update Preview

↓

Commit

↓

End Session
```

This enables

- Snap
- Guides
- Undo
- Multi-drag

without rewriting.

---

# Drag Session

```ts
interface DragSession {

    active: boolean;

    startPosition: Point;

    currentPosition: Point;

    delta: Point;

    draggedObjects: string[];

}
```

Session destroyed after

Mouse Up.

---

# Resize Session

Resize is identical.

```
Mouse Down

↓

Resize Session

↓

Update Preview

↓

Commit

↓

Destroy
```

Separate from dragging.

Never mix.

---

# Selection Engine

Selection is one of the largest subsystems.

Supported

✓ Click

✓ Ctrl Click

✓ Shift Click

✓ Drag Selection

✓ Select All

✓ Deselect

---

Selection Flow

```
Mouse Click

↓

Hit Test

↓

Selection Service

↓

Selection Store

↓

Canvas Render
```

Selection logic never belongs in components.

---

# Hit Testing

Every click passes through

Hit Testing.

```
Mouse

↓

Canvas

↓

Hit Test

↓

Object

↓

Selection
```

Possible targets

```
Canvas

Table

Column

Relationship

Resize Handle

Connection Handle

Note
```

Hit testing belongs to

```
services/hitTest.service.ts
```

---

# Multi Selection

Future architecture.

Selection represented as

```ts
Set<string>
```

instead of array.

Reason

Fast lookup.

Fast deletion.

Fast toggle.

---

# Area Selection

Area Selection uses

Bounding Rectangle.

```
Mouse Down

↓

Rectangle

↓

Intersect Objects

↓

Update Selection
```

Selection rectangle belongs to

Overlay Layer.

Not

Canvas Layer.

---

# Selection Priority

When multiple objects overlap

Priority

```
Resize Handle

↓

Connection Handle

↓

Column

↓

Table

↓

Relationship

↓

Canvas
```

This prevents accidental selections.

---

# Interaction State Machine

```
Idle

↓

Mouse Down

↓

Determine Target

↓

Dragging

↓

Mouse Up

↓

Idle
```

Every interaction must return

Idle.

Never remain

Dragging.

---

# Drag Engine

Dragging consists of

```
Mouse Down

↓

Capture

↓

Movement

↓

Preview

↓

Commit

↓

Broadcast

↓

Autosave
```

Movement updates

Store.

Commit updates

Backend.

---

# Drag Threshold

Ignore accidental movement.

Threshold

```
5 px
```

Configurable.

Small mouse jitter should not begin dragging.

---

# Snap Engine

Future-ready.

Supported

```
Grid

Objects

Alignment Lines

Center

Spacing
```

Initial MVP

Grid only.

---

Grid Snap

```
Mouse

↓

Nearest Grid

↓

Preview

↓

Commit
```

Never mutate original coordinates until commit.

---

# Resize Engine

Resize owns

```
Minimum Width

Maximum Width

Minimum Height

Aspect Rules

Handle Positions
```

Table resizing should never affect

Viewport.

---

# Resize Handles

Handle positions

```
Bottom Right

Bottom

Right
```

Future

Left

Top

Corner

---

# Resize Constraints

Configuration

```
Minimum Width

200px

Maximum Width

1200px
```

Table should never become unusable.

---

# Connection Engine

Connection process

```
Mouse Down

↓

Source Handle

↓

Drag Preview

↓

Target Handle

↓

Validate

↓

Create Relationship
```

Relationship validation belongs to

Relationship Feature.

Canvas only visualizes.

---

# Connection Preview

During dragging

Display temporary edge.

Temporary edge

Never persisted.

Never stored.

Only rendered.

---

# Edge Preview

```
Source

↓

Temporary Edge

↓

Cursor
```

Destroy immediately

after

Drop

or

Escape.

---

# Hover Highlighting

One of the core UX features.

Requirement

Hovering a table highlights

- Incoming relationships
- Outgoing relationships
- Connected tables

Exactly like dbdiagram.

Flow

```
Hover Table

↓

Relationship Service

↓

Connected IDs

↓

Selection Overlay

↓

Render Highlight
```

Never calculate relationships

inside component render.

---

# Connected Graph

Every table owns

```
Incoming

Outgoing
```

Hover service computes

```
Connected Graph

↓

Highlight Set
```

Future optimization

Cache adjacency map.

---

# Highlight Rules

Hovered table

Primary Color

Connected tables

Secondary Color

Disconnected tables

Reduced opacity.

Configurable through

Theme.

---