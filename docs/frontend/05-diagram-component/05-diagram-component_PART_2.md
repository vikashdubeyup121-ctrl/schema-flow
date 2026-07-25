# File

Projects/schemaFlow/docs/frontend/05-diagram-components/05-diagram-components_PART_2.md

---

# Table Component Deep Dive

The Table Component is the most important visual component in SchemaFlow.

Every database table is represented by exactly one Table component.

The Table Component should remain purely presentational.

It should never own business logic.

---

# Responsibilities

The Table component is responsible for rendering

- Table Container
- Table Header
- Column List
- Selection Border
- Review Border
- Connection Handles
- Resize Handles
- Hover Overlay

The Table component is NOT responsible for

- Creating tables
- Updating tables
- Deleting tables
- Loading data
- Saving changes
- Validation
- WebSocket synchronization

---

# Directory Structure

```
features/

table/

components/

Table/

├── Table.tsx
├── Table.types.ts
├── Table.constants.ts
├── Table.styles.ts
├── Table.test.tsx
├── index.ts
│
├── Header/
│   ├── TableHeader.tsx
│   ├── TableHeader.types.ts
│   ├── TableHeader.test.tsx
│   └── index.ts
│
├── Body/
│   ├── TableBody.tsx
│   ├── TableBody.types.ts
│   ├── TableBody.test.tsx
│   └── index.ts
│
├── Footer/
│   ├── TableFooter.tsx
│   └── index.ts
│
├── ResizeHandle/
│
├── ConnectionHandle/
│
├── ReviewIndicator/
│
├── HoverOverlay/
│
├── SelectionBorder/
│
└── ShadowLayer/
```

Every component should have its own folder.

---

# Public API

Only expose

```
Table

TableProps
```

Everything else remains private.

---

# Component Tree

```
Table

│

├── Shadow Layer

├── Selection Border

├── Review Border

├── Hover Overlay

├── Header

│

├── Body

│   │

│   └── Column List

│        │

│        ├── Column

│        ├── Column

│        └── Column

│

├── Footer

│

├── Left Handles

├── Right Handles

└── Resize Handle
```

---

# Table State

The Table component itself owns no business state.

Internal state allowed

```ts
const [isHovered, setHovered]
```

Everything else comes from

Selectors.

---

# Store Dependencies

Table subscribes only to

```
Table

Selection

Hover

Review
```

Never subscribe to

```
Projects

Authentication

Dashboard

Settings

Users
```

---

# Required Selectors

Example

```ts
const table = useTable(tableId);

const isSelected = useIsTableSelected(tableId);

const reviewState = useReviewState(tableId);

const isHovered = useHoveredTable(tableId);
```

Avoid

```ts
const state = useTableStore();
```

---

# Rendering Sequence

```
Receive tableId

↓

Load table

↓

Render Header

↓

Render Columns

↓

Render Handles

↓

Render Selection

↓

Render Review

↓

Commit
```

---

# Table Size

Every table has

```
Width

Height
```

Height should be derived.

```
Header

+

Rows

+

Footer
```

Never manually store height.

Future

Collapsed tables.

---

# Width Rules

Minimum

```
220px
```

Maximum

```
900px
```

Default

```
280px
```

Configurable.

---

# Height Rules

Minimum

```
Header

+

1 Row
```

Maximum

Unlimited.

Scrolling begins after configurable threshold.

---

# Table Background

Table background uses

Theme variables.

Never

```
bg-white

bg-gray
```

Use

```
surface-primary

surface-secondary
```

---

# Table Border

Border varies by state.

Normal

```
Neutral
```

Selected

```
Primary
```

Hover

```
Accent
```

Review

```
Review Color
```

---

# Border Priority

Highest priority

```
Review

↓

Selection

↓

Hover

↓

Default
```

Only one border rendered.

---

# Shadow Rules

Normal

Small elevation.

Selected

Higher elevation.

Dragging

Maximum elevation.

Review

No shadow changes.

---

# Drag Appearance

During dragging

Apply

```
translate3d()

↓

Elevation

↓

Cursor

↓

Opacity
```

Never

Change

```
left

top
```

---

# Opacity Rules

Normal

100%

Dragging

90%

Deleted

40%

Disabled

30%

---

# Hover Overlay

Hover overlay should render

```
Connected Tables

↓

Connected Relationships

↓

Connection Handles
```

Overlay never blocks pointer events.

---

# Review Overlay

Visualizes

```
Created

Modified

Deleted
```

Uses overlay.

Not inline styles.

---

# Table Header

Header owns

```
Name

Color

Context Menu

Collapse

Icon
```

Header never renders

Columns.

---

# Header Height

Constant.

```
40px
```

Future configurable.

---

# Header Layout

```
Icon

↓

Name

↓

Spacer

↓

Actions
```

Actions always right aligned.

---

# Editable Name

Double Click

↓

Inline Edit

↓

Save

↓

Exit

Escape

↓

Cancel

Enter

↓

Commit

---

# Name Validation

Rules

- Required
- Unique inside diagram
- Maximum length
- Trim whitespace

Validation belongs

Service.

---

# Color Indicator

Header displays

Current color.

Changing color opens

Color Picker.

Future

Custom palettes.

---

# Context Menu Trigger

Three-dot button.

Never

Right-click only.

Touch devices

Need explicit trigger.

---

# Table Icon

Future

Support

```
Table

View

Enum

Composite Type
```

Architecture should support icon changes.

---

# Collapse Button

Future

Collapse table.

Only

Header visible.

Relationships remain.

---

# Body Component

Receives

```
tableId
```

Responsible for

```
Column List

Empty State

Loading State
```

Nothing else.

---

# Empty Table

Display

```
No Columns

↓

+ Add Column
```

Avoid blank tables.

---

# Loading State

Skeleton rows.

Never

Spinner.

---

# Footer

Initially minimal.

Future

Displays

```
Row Count

Metadata

Table Stats
```

Keep separate.

---

# Resize Handle

Position

Bottom Right.

Hit area

Minimum

```
16 x 16
```

Visual

May remain

10 x 10.

Improves usability.

---

# Resize Cursor

```
nwse-resize
```

Always.

---

# Connection Handles

Each column owns

One handle.

Handles rendered separately.

Table never computes

Handle positions.

---

# Handle Visibility

Visible

When

- Hover
- Selected
- Connection Tool

Hidden otherwise.

---

# Table Animations

Allowed

```
Fade

Selection

Hover

Review

Open

Close
```

Forbidden

Dragging.

---

# Accessibility

Header

Keyboard accessible.

Actions

Tab reachable.

Inline edit

ARIA compliant.

---

# Testing

Unit Tests

- Render
- Hover
- Selection
- Review
- Resize Handle
- Header

Integration Tests

- Drag
- Rename
- Context Menu

Visual Tests

- Theme
- Review States
- Selection

---

# Acceptance Criteria

- Table renders using only `tableId`
- No unnecessary rerenders
- Header and Body independently memoized
- Selection overlay independent
- Hover overlay independent
- Review overlay independent
- Width constraints respected
- Height derived correctly
- All interactions keyboard accessible
- Component passes lint and typecheck

---