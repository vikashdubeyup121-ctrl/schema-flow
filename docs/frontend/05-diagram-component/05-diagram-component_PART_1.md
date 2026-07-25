# File

Projects/schemaFlow/docs/frontend/05-diagram-components.md

---

# Diagram Components Engineering Specification

**Document:** 05-diagram-components.md

**Version:** 1.0

---

# Table of Contents

1. Purpose
2. Component Philosophy
3. Component Ownership
4. Table Components
5. Column Components
6. Relationship Components
7. Note Components
8. Toolbar Components
9. Property Panel
10. Context Menu
11. Floating Components
12. Shared Components
13. Rendering Rules
14. Verification Checklist

---

# Purpose

This document defines every visual component used inside the Workspace.

The goal is to ensure

- Consistent UI
- Predictable ownership
- Reusable components
- Minimal rerenders
- Clear responsibilities

Every visible object inside the workspace should be documented here.

---

# Workspace Component Hierarchy

```
WorkspacePage

↓

WorkspaceWidget

│

├── CanvasToolbar

├── EditorSidebar

├── Canvas

│   ├── Table
│   ├── Relationship
│   ├── FloatingNote
│   ├── SelectionOverlay
│   ├── AlignmentGuides
│   ├── TemporaryRelationship
│   └── ContextMenu
│
├── PropertiesPanel

├── MiniMap

└── StatusBar
```

No component should bypass this hierarchy.

---

# Component Directory Structure

```
features/

table/
relationship/
note/

shared/

components/

widgets/

workspace/
```

Each feature owns its own components.

Shared UI belongs inside `shared/components`.

---

# Component Categories

Every component belongs to exactly one category.

```
Primitive

Shared

Feature

Widget

Page
```

No exceptions.

---

# Primitive Components

Primitive components are wrappers around shadcn/ui.

Examples

```
Button

Input

Textarea

Dialog

Popover

Tooltip

Badge

Avatar

Card

ScrollArea

Tabs

Separator
```

These components contain no business logic.

---

# Shared Components

Reusable application components.

Examples

```
ConfirmDialog

RenameDialog

LoadingOverlay

ErrorBoundary

EmptyState

SearchInput

UserAvatar

ColorPicker

MarkdownPreview

IconButton
```

Reusable across every feature.

---

# Feature Components

Business-specific components.

Examples

```
Table

Relationship

Column

FloatingNote

ReviewBadge
```

Feature components own business rendering.

---

# Widget Components

Widgets compose multiple features.

Examples

```
WorkspaceWidget

DashboardWidget

PropertyPanel

CanvasToolbar
```

Widgets orchestrate features.

Never implement business logic.

---

# Table Component

The Table component represents one database table.

One table

↓

One React component

---

## Responsibilities

Render

- Header
- Columns
- Connection Handles
- Resize Handles
- Review Badge
- Selection Border

Never

- Load API
- Validate schema
- Create relationships

---

## Folder

```
features/table/components/Table/

Table.tsx

Table.types.ts

Table.styles.ts

Table.constants.ts

Table.test.tsx

index.ts
```

---

## Props

```ts
interface TableProps {

    tableId: string;

}
```

Never pass

```
Table
```

Pass only

```
tableId
```

Component loads data using selectors.

---

# Table Internal Hierarchy

```
Table

│

├── SelectionBorder

├── ReviewBorder

├── TableHeader

├── ColumnList

├── ResizeHandle

├── ConnectionHandles

└── HoverOverlay
```

Each child is independently memoized.

---

# Table Header

Displays

```
Table Icon

Table Name

Color

Collapse Button

Context Menu Trigger
```

Future

```
Presence

Lock State

Reviewer Count
```

---

# Table Header Rules

Editable

Only

Table Name.

Everything else

Actions.

Header height

Constant.

Configured in

```
table.constants.ts
```

---

# Table Body

Contains

```
ColumnList
```

Nothing else.

Body owns

Scrolling.

Future

Column virtualization.

---

# Column List

Receives

```
tableId
```

Loads columns

using selector.

Should never receive

```
Column[]
```

Reason

Stable props.

---

# Column Row

One database column.

Structure

```
ColumnRow

│

├── PK Badge

├── FK Badge

├── Name

├── Type

├── Nullable

├── Note Icon

└── Connection Handle
```

---

# Column Row Props

```ts
interface ColumnRowProps {

    columnId: string;

}
```

Never pass

Complete column.

---

# Column States

Possible states

```
Normal

Selected

Hovered

Review Added

Review Modified

Review Deleted
```

Renderer determines appearance.

---

# Relationship Component

One relationship

↓

One component.

---

## Responsibilities

Render

- Path
- Arrow
- Hover
- Selection
- Review Border

Never

Calculate

Geometry.

---

# Folder

```
features/

relationship/

components/

Relationship/

RelationshipLabel/

RelationshipArrow/

RelationshipSelection/

RelationshipPreview/
```

---

# Relationship Props

```ts
interface RelationshipProps {

    relationshipId: string;

}
```

Component loads everything else.

---

# Relationship Rendering

Pipeline

```
relationshipId

↓

Selector

↓

Geometry Service

↓

Renderer
```

No calculations

inside render.

---

# Relationship Styles

Supported

```
Straight

Bezier

Orthogonal (Future)

Smart Route (Future)
```

Current MVP

Bezier.

---

# Temporary Relationship

Rendered while user creates connection.

```
Source

↓

Cursor
```

Never

Persisted.

Never

Stored.

Overlay only.

---

# Floating Note

Represents free-form documentation.

Structure

```
Title

Markdown

Resize Handle
```

---

# Note Props

```ts
interface NoteProps {

    noteId: string;

}
```

---

# Note Features

Supports

- Markdown
- Resize
- Drag
- Color
- Collapse (Future)

---

# Note Rendering

Markdown rendered using

```
react-markdown
```

Sanitize all HTML.

Never render raw HTML.

---

# Note Context Menu

```
Rename

Duplicate

Delete

Change Color
```

Future

Convert to Comment.

---

# Canvas Toolbar

Primary toolbar.

Contains

```
Pointer Tool

Hand Tool

Table Tool

Relationship Tool

Note Tool

Zoom

Fit View

Undo

Redo

Review

Publish
```

Toolbar should be extensible.

Every tool registers itself.

---

# Tool Registration

```ts
interface CanvasTool {

    id: string;

    icon: ReactNode;

    tooltip: string;

    activate(): void;

}
```

Future tools

Require

No toolbar modification.

---

# Active Tool

Only one active tool.

```
Pointer

Hand

Table

Relationship

Note
```

Stored in

Canvas Interaction Store.

---

# MiniMap

Presentation only.

Receives

```
Viewport

Nodes
```

Never

Store state.

---

# Status Bar

Displays

```
Zoom

Selection Count

Current Tool

Autosave Status

Review Status
```

Read only.

---

# Properties Panel

Displays editable properties.

Content depends on selection.

```
No Selection

↓

Workspace Settings

Table Selected

↓

Table Properties

Relationship Selected

↓

Relationship Properties

Note Selected

↓

Note Properties
```

Panel never owns data.

---

# Table Properties

Editable

```
Name

Color

Description (Future)

Tags (Future)
```

---

# Column Properties

Editable

```
Name

Type

Nullable

Primary Key

Foreign Key

Unique

Default

Note
```

---

# Relationship Properties

Editable

```
Name

Type

Delete Rule (Future)

Update Rule (Future)
```

---

# Note Properties

Editable

```
Title

Markdown

Color
```

---

# Context Menu

Generated dynamically.

Target types

```
Canvas

Table

Column

Relationship

Note
```

Each feature contributes menu items.

Canvas assembles.

---

# Floating Toolbar

Appears

When objects selected.

Contains

```
Delete

Duplicate

Copy

Change Color
```

Future

Bulk Edit.

---

# Hover Overlay

Independent component.

Renders

```
Connected Tables

Connected Relationships

Hover Highlight
```

Never

Determines

Connections.

---

# Review Indicator

Visual only.

Displays

```
Created

Modified

Deleted
```

Business state comes from

Review Store.

---

# Empty Components

Workspace should define

```
Empty Canvas

Empty Selection

Empty Search

Empty Properties
```

Never leave blank regions.

Guide users.

---

# Accessibility

Every component supports

- Keyboard navigation
- Screen readers
- Focus states
- High contrast mode

Interactive elements require

```
aria-label
```

---

# Rendering Rules

Components should

- Use selectors
- Be memoized where needed
- Avoid anonymous callbacks
- Never compute geometry
- Never perform graph traversal
- Never call APIs

Rendering should remain deterministic.

---

# Verification Checklist

Every component should be verified for

- Rendering
- Hover
- Selection
- Keyboard
- Context Menu
- Theme
- Review State
- Loading State
- Error State
- Accessibility
- Memoization
- Cleanup

---

# Definition of Done

A diagram component is complete only when

- Responsibility is clear
- Rendering is isolated
- Props are minimal
- Business logic is absent
- Unit tests pass
- Component tests pass
- Lint passes
- TypeScript passes
- Accessibility verified
- No unnecessary rerenders

---