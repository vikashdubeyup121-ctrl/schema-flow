# File

Projects/schemaFlow/docs/frontend/05-diagram-components/05-diagram-components_PART_3.md

---

# Column Component Deep Dive

The Column Component represents a single database column inside a table.

A Column is the smallest editable database object in the diagram.

Most user interactions happen at the column level.

Examples

- Rename column
- Change datatype
- Toggle Primary Key
- Toggle Nullable
- Create Relationship
- Add Note
- Reorder
- Delete

The component should remain lightweight.

---

# Responsibilities

The Column component renders

- Column Name
- Data Type
- PK Badge
- FK Badge
- Nullable Indicator
- Default Value Indicator
- Note Indicator
- Review State
- Connection Handle

It must never

- Update backend
- Validate schema
- Compute relationships
- Parse DSL
- Save changes

---

# Directory Structure

```
features/

column/

components/

Column/

├── Column.tsx
├── Column.types.ts
├── Column.constants.ts
├── Column.styles.ts
├── Column.test.tsx
├── index.ts
│
├── ColumnName/
├── ColumnType/
├── ColumnBadges/
├── ColumnHandle/
├── ColumnNote/
├── ColumnReview/
├── ColumnSelection/
└── ColumnHover/
```

---

# Public API

Only expose

```
Column

ColumnProps
```

Everything else remains private.

---

# Component Tree

```
Column

│

├── Selection Overlay

├── Hover Overlay

├── Review Overlay

├── PK Badge

├── FK Badge

├── Name

├── Datatype

├── Nullable Indicator

├── Default Indicator

├── Note Indicator

└── Connection Handle
```

---

# Props

```ts
interface ColumnProps {

    columnId: string;

}
```

Never pass

```
Column
```

Always

```
columnId
```

---

# Required Selectors

```ts
const column = useColumn(columnId);

const isHovered = useHoveredColumn(columnId);

const isSelected = useSelectedColumn(columnId);

const reviewState = useColumnReview(columnId);
```

Never subscribe to

Entire store.

---

# Column Layout

```
┌──────────────────────────────────────────────┐

 PK   FK   name            varchar       📝

└──────────────────────────────────────────────┘
```

Future

```
Default Value

Unique

Index

Generated

Auto Increment
```

---

# Column Height

Fixed.

Configuration

```
ROW_HEIGHT = 32px
```

Never compute dynamically.

---

# Column Width

Inherited from table.

Columns never own width.

---

# Badge System

Badges are independent components.

```
PK Badge

FK Badge

UQ Badge

IDX Badge
```

Each badge decides

Only its own rendering.

---

# Badge Rules

Priority

```
PK

↓

FK

↓

UQ

↓

IDX
```

Never overlap.

---

# PK Badge

Visible only when

```
column.primaryKey === true
```

Color

Configured through theme.

Never hardcoded.

---

# FK Badge

Visible only when

Relationship exists.

Do not determine this inside render.

Use selector.

---

# Nullable Indicator

Represented as

```
NULL

or

NOT NULL
```

Configurable.

Future

Hide nullable labels.

---

# Datatype Rendering

Display only.

Validation belongs

Schema Service.

Future

Support

```
Enum

JSON

UUID

Geometry

Arrays
```

No UI changes required.

---

# Long Text Handling

Long names

Ellipsis.

Hover

↓

Tooltip.

Never wrap rows.

---

# Inline Editing

Double Click

↓

Input

↓

Edit

↓

Enter

↓

Commit

↓

Escape

↓

Cancel
```
Normal

↓

Editing

↓

Saving

↓

Normal
```

---

# Editing Rules

Only one column editable

At a time.

Store owns

Editing state.

---

# Validation

Rules

- Required
- Unique inside table
- Maximum length
- Valid identifier

Validation belongs

Column Service.

---

# Note Indicator

Visual

```
📝
```

Visible

Only if note exists.

Hover

↓

Preview

Click

↓

Property Panel

Never open modal.

---

# Connection Handle

Every column owns exactly one connection handle.

```
Column

↓

Handle

↓

Relationship
```

Position calculated by

Geometry Service.

---

# Handle Visibility

Visible when

- Table Selected
- Column Hovered
- Relationship Tool Active

Otherwise

Hidden.

---

# Hover State

Hover affects

- Background
- Handle Visibility
- Connected Relationships

Hover never mutates state.

---

# Selection State

Selected column

Receives

```
Selection Overlay
```

Do not change layout.

---

# Review State

Possible states

```
Published

Created

Modified

Deleted
```

Review overlay

Determines appearance.

---

# Deleted Column

Render

```
Reduced Opacity

Strike Through

Red Border
```

Still visible

Until publish.

---

# Created Column

Green border.

Future

Animation

Fade In.

---

# Modified Column

Yellow border.

Highlight

Changed properties.

---

# Drag Reordering

Future

Support

```
Mouse Drag

↓

Preview

↓

Drop

↓

Update Order
```

Architecture should support

Independent row movement.

---

# Context Menu

Column menu

```
Rename

Duplicate

Delete

Add Note

Copy

Paste

Create Relationship
```

Generated dynamically.

---

# Keyboard Support

Supported

```
Delete

F2 Rename

Ctrl+C

Ctrl+V

Tab Navigation
```

Future

Arrow navigation.

---

# Accessibility

Every row

Keyboard focusable.

Every action

Accessible.

Tooltips

Screen reader friendly.

---

# Performance

Each Column

Memoized.

Changing one column

Must not rerender

Entire table.

---

# Render Rules

Never

- Traverse relationships
- Validate datatype
- Compute geometry
- Allocate arrays
- Create callbacks repeatedly

Column render

Must remain O(1).

---

# Testing

Unit Tests

- PK badge
- FK badge
- Note icon
- Hover
- Selection
- Review

Integration Tests

- Rename
- Relationship creation
- Keyboard navigation

Visual Tests

- Long names
- Theme
- Review states

---

# Acceptance Criteria

- Component receives only `columnId`
- Selector-based rendering
- Independent memoization
- Keyboard accessible
- No unnecessary rerenders
- Supports inline editing
- Supports future drag reordering
- Passes lint
- Passes typecheck
- Fully unit tested

---