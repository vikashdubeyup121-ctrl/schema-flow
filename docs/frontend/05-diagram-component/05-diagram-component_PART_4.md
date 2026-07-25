# File

Projects/schemaFlow/docs/frontend/05-diagram-components/05-diagram-components_PART_4.md

---

# Relationship Component Deep Dive

The Relationship Component represents a database relationship between two columns.

A relationship is a visual representation of a foreign key constraint.

The Relationship component is responsible only for rendering.

Business logic belongs to the Relationship Feature.

---

# Responsibilities

The Relationship component renders

- Relationship Path
- Arrow Head
- Hover State
- Selection State
- Review State
- Connection Preview
- Label (Future)

It must never

- Validate relationships
- Compute routing
- Calculate anchor points
- Create/Delete relationships
- Update backend

---

# Directory Structure

```
features/

relationship/

components/

Relationship/

├── Relationship.tsx
├── Relationship.types.ts
├── Relationship.constants.ts
├── Relationship.styles.ts
├── Relationship.test.tsx
├── index.ts
│
├── RelationshipPath/
│
├── RelationshipArrow/
│
├── RelationshipLabel/
│
├── RelationshipSelection/
│
├── RelationshipHover/
│
├── RelationshipReview/
│
└── TemporaryRelationship/
```

---

# Public API

Expose only

```
Relationship

RelationshipProps
```

Everything else remains private.

---

# Props

```ts
interface RelationshipProps {

    relationshipId: string;

}
```

Never pass

```
Relationship Model
```

Always

```
relationshipId
```

Relationship data should be retrieved through selectors.

---

# Required Selectors

```ts
const relationship =
    useRelationship(relationshipId);

const isSelected =
    useRelationshipSelected(relationshipId);

const isHovered =
    useRelationshipHovered(relationshipId);

const reviewState =
    useRelationshipReview(relationshipId);
```

Never subscribe to the complete relationship store.

---

# Internal Hierarchy

```
Relationship

│

├── Path

├── Arrow Head

├── Hover Overlay

├── Selection Overlay

├── Review Overlay

└── Label (Future)
```

Every child component has a single responsibility.

---

# Relationship Data

A relationship contains

```ts
interface Relationship {

    id: string;

    sourceColumnId: string;

    targetColumnId: string;

    type: RelationshipType;

}
```

Future

```
Delete Rule

Update Rule

Constraint Name

Cardinality Label
```

---

# Relationship Types

Supported

```
One To One

One To Many

Many To One
```

Future

```
Many To Many

Inheritance

Composition

Aggregation
```

The renderer should support extension without modification.

---

# Rendering Pipeline

```
relationshipId

↓

Selector

↓

Geometry Service

↓

Path Generator

↓

Relationship Renderer

↓

ReactFlow Edge
```

The component should never calculate geometry.

---

# Path Generation

Path generation belongs to

```
RelationshipGeometryService
```

Input

```
Source Handle

Target Handle

Viewport
```

Output

```
SVG Path
```

The renderer consumes the SVG path.

---

# Arrow Head

Arrow Head is an independent component.

Future support

```
Filled Arrow

Open Arrow

Diamond

Circle

Crow's Foot
```

Renderer should be configurable.

---

# Current MVP

Arrow style

```
Simple Arrow
```

Future

Database-specific notation.

---

# Path Styling

Normal

```
Neutral Border
```

Hovered

```
Primary Color
```

Selected

```
Selection Color
```

Review

```
Review Color
```

Deleted

```
Dashed

Reduced Opacity
```

---

# Hover State

Hovering a relationship should

Highlight

- Relationship
- Source Table
- Target Table

No graph traversal inside component.

Relationship Service provides connected entities.

---

# Selection State

Selected relationship

Displays

```
Thicker Stroke

Selection Color

Handles (Future)
```

Selection overlay is separate from path rendering.

---

# Review State

Possible values

```
Published

Created

Modified

Deleted
```

Visual representation only.

Business state belongs to Review Feature.

---

# Temporary Relationship

Displayed while user is dragging.

Lifecycle

```
Mouse Down

↓

Temporary Edge

↓

Cursor

↓

Drop

↓

Create Relationship

↓

Destroy Temporary Edge
```

Never persist.

Never synchronize.

Never autosave.

---

# Temporary Relationship Component

Receives

```ts
interface TemporaryRelationshipProps {

    sourcePoint: Point;

    targetPoint: Point;

}
```

No store subscription required.

---

# Labels (Future)

Support

```
Relationship Name

Cardinality

Delete Rule

Update Rule
```

Labels should be independently rendered.

---

# Relationship Routing

Current MVP

```
Bezier
```

Future

```
Straight

Orthogonal

Smart Routing

Obstacle Avoidance
```

Routing algorithm must be replaceable.

---

# Handle Anchoring

Anchors

Never calculated inside component.

Geometry Service provides

```
Source Anchor

Target Anchor
```

Future

Dynamic anchors.

---

# Connection Animation

Allowed

```
Fade In

Selection

Hover
```

Forbidden

```
Continuous Animation

Pulse

Bounce
```

Relationships should remain visually calm.

---

# Hit Area

Relationship path should have

Invisible hit area.

Example

Visible

```
2px
```

Interactive

```
12px
```

Improves usability.

---

# Context Menu

Relationship context menu

```
Rename (Future)

Delete

Reverse Direction

Convert Type

Properties
```

Menu generated by Relationship Feature.

---

# Accessibility

Relationship should support

- Keyboard selection
- Screen reader description
- Focus outline

Future

Arrow key navigation.

---

# Performance

Relationship rendering should

- Use React.memo()
- Avoid geometry calculations
- Avoid allocations during render
- Use cached SVG paths where possible

Rendering thousands of relationships should remain performant.

---

# Testing

Unit Tests

- Render
- Hover
- Selection
- Review State
- Arrow Rendering

Integration Tests

- Relationship Creation
- Relationship Deletion
- Connection Preview

Visual Tests

- Theme
- Zoom
- Review States

---

# Acceptance Criteria

- Component receives only `relationshipId`
- Geometry calculated externally
- SVG path rendered correctly
- Hover highlights connected tables
- Selection overlay independent
- Temporary relationship works
- Memoized rendering
- Keyboard accessible
- Lint passes
- TypeScript passes
- Unit tests pass

---