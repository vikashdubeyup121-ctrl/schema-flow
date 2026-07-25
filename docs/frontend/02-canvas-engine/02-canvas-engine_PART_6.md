# File

Projects/schemaFlow/docs/frontend/02-canvas-engine/02-canvas-engine_PART_6.md

---

# Coordinate System Architecture

One of the most critical architectural decisions in SchemaFlow is the use of a well-defined coordinate system.

Incorrect coordinate handling is one of the biggest reasons diagram editors become difficult to maintain.

---

# Coordinate Spaces

The application operates in four independent coordinate spaces.

```
Browser Coordinates

↓

Viewport Coordinates

↓

Canvas Coordinates

↓

Node Local Coordinates
```

Every calculation must explicitly know which coordinate space it belongs to.

Never mix coordinate systems.

---

# Browser Coordinates

Origin

```
Top Left of Browser Window
```

Obtained from

```
PointerEvent.clientX

PointerEvent.clientY
```

Used for

- Mouse Events
- Context Menu
- Tooltips
- Floating Panels

Never store browser coordinates.

---

# Viewport Coordinates

Viewport coordinates represent the visible region.

Affected by

- Zoom
- Pan

Viewport changes continuously.

Example

```ts
interface Viewport {

    x: number;

    y: number;

    zoom: number;

}
```

---

# World Coordinates

World Coordinates represent the absolute canvas.

Every persistent object uses world coordinates.

Example

```ts
interface Table {

    id: string;

    position: {

        x: number;

        y: number;

    };

}
```

Database stores only world coordinates.

Never persist viewport coordinates.

---

# Local Coordinates

Every table owns a local coordinate system.

Example

```
Table

↓

Column

↓

Connection Handle
```

Column positions

Relative to table.

Not world.

---

# Coordinate Conversion Pipeline

Every pointer movement follows

```
Browser

↓

Viewport

↓

World

↓

Hit Test

↓

Selection
```

Every service receives

Explicit coordinate type.

---

# Geometry Types

Never use plain objects.

Define explicit geometry.

```ts
interface Point {

    x: number;

    y: number;

}
```

---

```ts
interface Size {

    width: number;

    height: number;

}
```

---

```ts
interface Rectangle {

    x: number;

    y: number;

    width: number;

    height: number;

}
```

---

```ts
interface Bounds {

    minX: number;

    minY: number;

    maxX: number;

    maxY: number;

}
```

Every geometry function accepts these types.

---

# Geometry Module

```
geometry/

point.ts

rectangle.ts

bounds.ts

distance.ts

intersection.ts

transform.ts

viewport.ts

grid.ts
```

Each file owns one concept.

---

# Geometry Service Responsibilities

Responsible for

- Rectangle intersection
- Point inside rectangle
- Distance
- Bounding boxes
- Coordinate conversion
- Transform matrices
- Edge anchors
- Connection routing helpers

Never manipulate React state.

---

# Bounding Box Calculation

Every renderable object exposes

```ts
getBounds(): Rectangle
```

Used by

- Selection
- Collision
- Visibility
- Alignment
- Snap

Bounding boxes should be cached.

---

# Hit Testing

Hit testing determines

"What object is under the cursor?"

Pipeline

```
Pointer

↓

World Position

↓

Visible Objects

↓

Bounding Box

↓

Precise Hit Test

↓

Target
```

Never iterate every object if avoidable.

Future

Spatial indexing.

---

# Spatial Index (Future)

When diagrams become large

Use

```
QuadTree
```

or

```
R-Tree
```

Architecture should isolate this behind

```
HitTestService
```

Consumers never know implementation.

---

# Viewport Architecture

Viewport consists of

```ts
interface Viewport {

    x: number;

    y: number;

    zoom: number;

}
```

Viewport should never store

- Selection
- Hover
- Objects

---

# Camera System

Think of viewport as a camera.

```
World

↓

Camera

↓

Screen
```

Objects never move because of zoom.

Camera moves.

---

# Camera Operations

Supported

```
Pan

Zoom

Center

Fit View

Focus Object

Reset
```

Every operation belongs to

```
ViewportService
```

---

# Pan Architecture

Pan updates

```
Viewport.x

Viewport.y
```

Never modify object positions.

---

# Zoom Architecture

Zoom centered around

Pointer Position.

Flow

```
Wheel

↓

Current Zoom

↓

Target Zoom

↓

Transform

↓

Viewport
```

Objects remain fixed.

---

# Zoom Levels

Configuration

```
20%

25%

33%

50%

67%

75%

100%

125%

150%

200%

300%
```

Future

Smooth continuous zoom.

---

# Fit View

Fit View computes

```
All Object Bounds

↓

Combined Bounds

↓

Viewport

↓

Animation
```

Never calculate inside component.

---

# Center View

Centers viewport around

```
Canvas Center

or

Selected Objects
```

Future

```
Ctrl + Shift + C
```

---

# Focus Object

Used by

Search

Review

Navigation

Example

```
Search Result

↓

Focus Table

↓

Center Camera

↓

Highlight
```

---

# Grid System

Grid is visual only.

Grid never affects stored coordinates.

Responsibilities

- Background
- Snap Reference
- Orientation

---

# Dynamic Grid

Grid spacing adapts to zoom.

Example

```
Zoom 20%

↓

Large Grid

Zoom 100%

↓

Medium Grid

Zoom 300%

↓

Fine Grid
```

Avoid visual clutter.

---

# Snap Architecture

Snap consists of

```
Grid

Objects

Guides

Alignment
```

Pipeline

```
Pointer

↓

Candidate Position

↓

Snap Service

↓

Adjusted Position

↓

Preview

↓

Commit
```

Never modify original until commit.

---

# Alignment Guides

Future

Display guides when

```
Centers Align

Edges Align

Spacing Matches
```

Guides belong to overlay.

---

# Collision Detection

Future capability.

Detect

```
Rectangle

↓

Rectangle

↓

Intersection
```

May support

- Prevent overlap
- Smart placement

Do not implement for MVP.

---

# Visible Region Calculation

Future optimization.

```
Viewport

↓

Visible Bounds

↓

Visible Objects

↓

Renderer
```

Required for virtualization.

---

# Minimap Architecture

Minimap observes

```
Viewport

↓

Visible Objects
```

Never

Own state.

Minimap interactions

Forward commands

to

Viewport Service.

---

# Scroll Behavior

Trackpad

↓

Pan

Mouse Wheel

↓

Zoom

Shift + Wheel

↓

Horizontal Pan

Behavior configurable.

---

# Coordinate Precision

Store coordinates

As floating point.

Render

Rounded values where necessary.

Avoid cumulative precision errors.

---

# World Size

World should be effectively unbounded.

Do not define

```
MAX_X

MAX_Y
```

Users should never hit invisible walls.

---

# Geometry Testing

Every geometry function must have unit tests.

Examples

```
Rectangle Intersection

Point Containment

Distance

Bounds Merge

Coordinate Conversion

Grid Snap
```

Geometry bugs become interaction bugs.

---

# Coordinate Anti-Patterns

Never

- Mix browser and world coordinates
- Persist viewport coordinates
- Compute geometry inside React components
- Hardcode grid spacing
- Use DOM measurements as source of truth
- Modify world coordinates during zoom

The Geometry Layer should be completely independent of React and reusable in any rendering engine.

---

# End of Document

**Document Complete**

```
Projects/schemaFlow/docs/frontend/

├── 01-frontend-foundation.md
└── 02-canvas-engine.md
```

**Next Document**

```
Projects/schemaFlow/docs/frontend/

03-diagram-components.md
```

This document will define every visual component in the application, including the complete architecture, responsibilities, props, state ownership, lifecycle, styling rules, file structure, event flow, rendering strategy, and verification checklist for:

- Table
- Column
- Relationship
- Note
- Toolbar
- Sidebar
- Properties Panel
- Context Menu
- Floating Toolbar
- Search Panel
- Minimap
- Review Indicators
- Connection Handles
- Resize Handles
- Selection Components
