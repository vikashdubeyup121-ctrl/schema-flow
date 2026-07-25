# File

Projects/schemaFlow/docs/frontend/06-features/06-features_PART_4.md

---

# Note Management Feature

The Note Feature provides rich documentation capabilities inside a diagram.

SchemaFlow supports two distinct types of notes.

```
1. Floating Notes

2. Column Notes
```

These serve different purposes and should never share the same implementation.

---

# Floating Notes vs Column Notes

## Floating Note

Free positioned object on canvas.

```
┌──────────────────────┐
│ Payment Service      │
│                      │
│ Uses Saga Pattern    │
│ Retry = 3            │
│                      │
└──────────────────────┘
```

---

## Column Note

Attached to exactly one column.

```
users

-----------------

id

email      📝

created_at
```

Hover

↓

Tooltip

Click

↓

Property Panel

---

# Responsibilities

The Note Feature owns

- Floating Notes
- Column Notes
- Markdown
- Colors
- Position
- Resize
- Review State
- Import / Export
- Search

It does NOT own

- Canvas Rendering
- Geometry
- Selection
- Dragging

---

# Directory Structure

```
features/

note/

├── api/
│
├── commands/
│
├── components/
│
├── hooks/
│
├── services/
│
├── stores/
│
├── validation/
│
├── markdown/
│
├── mock/
│
├── tests/
│
├── types/
│
└── index.ts
```

---

# Domain Models

## Floating Note

```ts
export interface FloatingNote {

    id: string;

    diagramId: string;

    title: string;

    markdown: string;

    color: NoteColor;

    position: Point;

    width: number;

    height: number;

    createdAt: string;

    updatedAt: string;

}
```

---

## Column Note

```ts
export interface ColumnNote {

    id: string;

    columnId: string;

    markdown: string;

    createdAt: string;

    updatedAt: string;

}
```

A column can have

```
0

or

1

Column Note
```

---

# Store Ownership

Owns

```
Hovered Note

Selected Note

Editing Note

Expanded Note
```

Server State

Belongs

React Query.

---

# Note Lifecycle

```
Create

↓

Edit

↓

Review

↓

Publish

↓

Delete
```

---

# Floating Note Creation

Entry Points

```
Toolbar

Canvas Context Menu

Paste

Duplicate
```

---

# Creation Pipeline

```
User

↓

Create Note Command

↓

Default Values

↓

Optimistic Update

↓

API

↓

Render
```

---

# Default Note

Created with

```
Title

↓

Untitled Note
```

Color

↓

Yellow

Width

↓

280

Height

↓

180

Markdown

↓

Empty

---

# Markdown Support

Supported

```
Headings

Bold

Italic

Lists

Tables

Blockquotes

Code Blocks

Inline Code

Links
```

---

Unsupported

```
HTML

Scripts

Iframes

Embedded CSS
```

Security

Always sanitize.

---

# Markdown Renderer

Library

```
react-markdown
```

Plugins

Future

```
GitHub Markdown

Task Lists

Mermaid

Math
```

---

# Markdown Editing

Editor

Future

May support

```
Split View

Preview

Live Preview
```

Current MVP

Single editor.

---

# Floating Note Colors

Supported

```
Yellow

Blue

Green

Orange

Purple

Gray

Pink
```

Configured

Through theme.

---

# Resize Rules

Minimum

```
200 x 120
```

Maximum

Unlimited.

---

# Position Rules

New note

Appears

Viewport center.

Collision

↓

Offset.

---

# Rename Note

Supported

Inline

Properties

Context Menu

---

# Delete Note

Delete

↓

Review Deleted

↓

Publish

↓

Permanent Delete

Never

Immediate deletion.

---

# Duplicate Note

Copies

```
Title

Markdown

Color

Size
```

Offset

```
+40

+40
```

New ID

Generated.

---

# Column Note Lifecycle

```
Open

↓

Edit

↓

Save

↓

Review

↓

Publish
```

---

# Opening Column Note

Methods

```
Note Icon

Properties Panel

Keyboard Shortcut
```

---

# Column Note Rendering

Canvas

Displays

```
📝
```

Hover

↓

Preview

Click

↓

Property Panel

No modal.

---

# Search Integration

Search indexes

Floating Notes

```
Title

Markdown
```

Column Notes

```
Markdown
```

---

# Review Integration

Notes support

```
Created

Modified

Deleted

Published
```

Review

Uses

Same overlay system

As tables.

---

# Import

Supported

Future

```
DBML

JSON

SchemaFlow

Markdown Bundle
```

---

# Export

Supported

```
SchemaFlow JSON

Markdown

PDF (Future)
```

---

# Copy / Paste

Copy

↓

Duplicate Markdown

↓

Generate IDs

↓

Offset Position

↓

Render

---

# Keyboard Support

```
Ctrl+C

Ctrl+V

Ctrl+D

Delete

F2

Escape
```

---

# Validation

Rules

```
Maximum Length

Markdown Valid

Title Length
```

Future

Markdown linting.

---

# Error Handling

Possible Errors

```
Markdown Too Large

Network Error

Permission Denied

Validation Error
```

---

# Performance

Target

```
500 Notes

↓

60 FPS
```

Markdown

Parsed lazily.

---

# Testing

Unit

- Create
- Edit
- Delete
- Duplicate
- Markdown

Integration

- Search
- Review
- Properties

Visual

- Themes
- Large Notes

---

# Acceptance Criteria

- Floating notes supported
- Column notes supported
- Markdown secure
- Review integrated
- Search indexed
- Import/export ready
- Optimistic updates
- Lint passes
- Typecheck passes
- Unit tests pass

---

# Clipboard Feature

The Clipboard Feature enables users to duplicate and transfer schema objects efficiently.

Supported Operations

```
Copy

Cut (Future)

Paste

Duplicate
```

The clipboard must work consistently across

- Tables
- Columns
- Floating Notes

Future

- Relationships
- Groups
- Frames

---

# Clipboard Architecture

```
Selection

↓

Clipboard Service

↓

Clipboard Store

↓

Paste Service

↓

Commands

↓

Canvas
```

The clipboard should never depend on React components.

---

# Clipboard Data Model

```ts
interface ClipboardPayload {

    version: 1;

    objects: ClipboardObject[];

}
```

Each object

Contains

```
Type

Data

Metadata
```

Versioning allows future schema evolution.

---

# Clipboard Object Types

Supported

```
TABLE

COLUMN

FLOATING_NOTE
```

Future

```
RELATIONSHIP

FRAME

GROUP

COMMENT
```

---

# Copy Operation

Flow

```
Selection

↓

Serialize

↓

Clipboard Payload

↓

Store

↓

Browser Clipboard (Future)
```

Selection order

Must be preserved.

---

# Paste Operation

Flow

```
Clipboard

↓

Deserialize

↓

Generate IDs

↓

Offset Position

↓

Create Commands

↓

Canvas
```

Every pasted object receives new identifiers.

---

# Duplicate Operation

Duplicate is implemented internally as

```
Copy

↓

Immediate Paste
```

Without touching the browser clipboard.

---

# Clipboard Validation

Reject

```
Unknown Version

Unsupported Object

Corrupted Payload
```

Never crash the application.

---

# Clipboard Offset Strategy

Every paste

Offsets

```
+40

+40
```

Subsequent pastes continue offsetting.

---

# Acceptance Criteria

- Copy tables
- Copy notes
- Copy columns
- Duplicate uses clipboard pipeline
- New IDs generated
- Offset applied
- Invalid clipboard safely ignored
- Fully typed
- Lint passes
- Typecheck passes

---