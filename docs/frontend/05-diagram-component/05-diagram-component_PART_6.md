# File

Projects/schemaFlow/docs/frontend/05-diagram-components/05-diagram-components_PART_6.md

---

# Properties Panel Deep Dive

The Properties Panel is the primary editing interface for every object inside the workspace.

It acts as the inspector for the currently selected object.

Unlike inline editing, the Properties Panel exposes every configurable property.

The panel is always synchronized with the current selection.

---

# Responsibilities

The Properties Panel

- Displays properties of the current selection
- Performs client-side validation
- Emits update actions
- Displays read-only metadata
- Shows review information
- Shows collaboration information (future)

The panel never

- Calls APIs directly
- Owns business state
- Calculates geometry
- Performs graph traversal

---

# Directory Structure

```
widgets/

workspace/

PropertiesPanel/

├── PropertiesPanel.tsx
├── PropertiesPanel.types.ts
├── PropertiesPanel.test.tsx
├── index.ts
│
├── EmptySelection/
├── TableInspector/
├── ColumnInspector/
├── RelationshipInspector/
├── NoteInspector/
├── WorkspaceInspector/
│
├── PropertyRow/
├── PropertySection/
├── PropertyLabel/
├── PropertyInput/
├── PropertyDivider/
└── Shared/
```

---

# Component Hierarchy

```
Properties Panel

│

├── Header

├── Inspector Switch

│

├── Table Inspector

├── Column Inspector

├── Relationship Inspector

├── Note Inspector

└── Footer
```

Only one inspector renders at a time.

---

# Inspector Resolution

Resolution order

```
Column Selected

↓

Column Inspector

Relationship Selected

↓

Relationship Inspector

Table Selected

↓

Table Inspector

Note Selected

↓

Note Inspector

Nothing Selected

↓

Workspace Inspector
```

Column has higher priority than table.

---

# Panel Width

Default

```
340px
```

Resizable

Future

Minimum

```
300px
```

Maximum

```
520px
```

---

# Table Inspector

Displays

```
Table Name

Table Color

Description

Schema

Tags (Future)

Metadata

Review State
```

Never render

Columns.

Columns belong

Column Inspector.

---

# Column Inspector

Displays

```
Column Name

Datatype

Nullable

Primary Key

Foreign Key

Unique

Default Value

Generated

Note

Review State
```

Future

```
Index

Check Constraint

Comment
```

---

# Relationship Inspector

Displays

```
Relationship Name

Relationship Type

Source

Target

Delete Rule

Update Rule

Review State
```

Future

```
Constraint Name

Deferrable

Initially Deferred
```

---

# Note Inspector

Displays

```
Title

Markdown

Color

Size

Review State
```

Future

```
Pinned

Locked

Author
```

---

# Workspace Inspector

Displayed when

Nothing selected.

Shows

```
Diagram Name

Canvas Theme

Grid

Snap

Statistics

Review Status
```

Future

Workspace Settings.

---

# Property Sections

Properties grouped.

Example

```
General

↓

Keys

↓

Constraints

↓

Metadata

↓

Review
```

Large inspectors should never become long flat forms.

---

# Property Row

Reusable component.

```
Label

↓

Input
```

Every row

Exactly one editable property.

---

# Validation

Validation occurs

Immediately.

Rules

```
Required

Maximum Length

Unique

Valid Identifier

Datatype Rules
```

Validation errors displayed inline.

---

# Save Strategy

Changes

Optimistic.

```
Edit

↓

Local Store

↓

Backend

↓

Success

↓

Persist

or

↓

Rollback
```

---

# Dirty State

Inspector tracks

Unsaved edits.

Future

```
Auto Save

Manual Save
```

Current MVP

Immediate save.

---

# Keyboard Support

Supported

```
Tab

Shift+Tab

Enter

Escape
```

Every field

Keyboard accessible.

---

# Context Awareness

Inspector automatically changes

When selection changes.

Unsaved edits

Prompt user

Future.

---

# Footer

Reserved for

```
Created At

Updated At

Created By

Object ID
```

Useful during debugging.

---

# Context Menu System

Every canvas object exposes a context menu.

Context menus are dynamically assembled.

---

# Architecture

```
Right Click

↓

Hit Test

↓

Target

↓

Menu Builder

↓

Context Menu

↓

Command
```

---

# Folder Structure

```
features/

context-menu/

├── ContextMenuProvider.tsx
├── ContextMenuRenderer.tsx
├── ContextMenuRegistry.ts
├── ContextMenu.types.ts
├── index.ts
│
├── builders/
├── commands/
├── hooks/
└── services/
```

---

# Menu Targets

Supported

```
Canvas

Table

Column

Relationship

Note

Multiple Selection
```

Every target contributes

Its own menu items.

---

# Canvas Menu

```
Paste

New Table

New Note

Fit View

Reset Zoom

Workspace Settings
```

---

# Table Menu

```
Rename

Duplicate

Copy

Delete

Change Color

Properties
```

---

# Column Menu

```
Rename

Duplicate

Delete

Add Note

Create Relationship

Properties
```

---

# Relationship Menu

```
Delete

Reverse Direction

Properties
```

Future

```
Convert Relationship Type
```

---

# Note Menu

```
Rename

Duplicate

Delete

Color

Properties
```

---

# Multiple Selection Menu

```
Delete

Duplicate

Copy

Align

Distribute

Group (Future)
```

---

# Command Pattern

Every menu action

Implements

```ts
interface WorkspaceCommand {

    id: string;

    label: string;

    execute(): Promise<void>;

}
```

Toolbar

Context Menu

Command Palette

All reuse

Same commands.

---

# Dynamic Registration

Every feature registers

Commands.

Example

```
Table Feature

↓

Rename Table

Duplicate Table

Delete Table
```

Context Menu

Discovers

Registered commands.

---

# Enable / Disable Rules

Commands decide

Whether

Enabled.

Example

```
Delete

Disabled

↓

Published Review

↓

Read Only
```

---

# Icons

Every command

Provides icon.

Icons come from

Shared Icon Library.

---

# Nested Menus

Supported

Future.

Example

```
Change Color

↓

Blue

Green

Purple

Orange
```

Architecture should support

Infinite nesting.

---

# Keyboard Hints

Every command

May expose

Shortcut.

Example

```
Delete      Del

Duplicate   Ctrl+D

Rename      F2
```

Displayed automatically.

---

# Searchable Commands

Future

Command Palette

Searches

Registered commands.

No additional work

Needed.

---

# Accessibility

Context Menu supports

- Keyboard navigation
- Arrow navigation
- Enter
- Escape
- Screen readers

Focus trapped

While open.

---

# Performance

Menu items

Computed only

When menu opens.

Avoid recomputing

Every render.

---

# Acceptance Criteria

- Inspector switches automatically
- Property validation inline
- Commands reusable
- Context menu dynamic
- Keyboard accessible
- No unnecessary rerenders
- Fully typed
- Lint passes
- Typecheck passes

---