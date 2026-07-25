# File

Projects/schemaFlow/docs/frontend/06-features/06-features_PART_1.md

---

# Workspace Features Engineering Specification

**Document:** 06-features.md

**Part:** 1

---

# Table of Contents

1. Feature Philosophy
2. Feature Architecture
3. Feature Boundaries
4. Table Management
5. Table Lifecycle
6. Table Creation
7. Table Rename
8. Table Delete
9. Table Duplicate
10. Table Color
11. Table Collapse

---

# Purpose

This document defines every business feature inside SchemaFlow.

Unlike Components,

Features contain business logic.

Unlike Canvas,

Features own data.

Every feature should be independently implementable.

---

# Feature Philosophy

A feature owns

- Domain Model
- Store
- API
- Business Rules
- Services
- Components
- Tests

A feature should never depend on another feature's implementation.

Communication happens through

- Public APIs
- Shared Events
- Shared Types

---

# Feature Directory

```
features/

table/

├── api/
├── components/
├── constants/
├── hooks/
├── mock/
├── services/
├── stores/
├── types/
├── validation/
├── utils/
├── tests/
└── index.ts
```

Every feature follows this exact structure.

---

# Public API

Only export

```
components/

hooks/

types/

public services
```

Never expose

Stores

Utilities

Private helpers.

---

# Table Domain Model

```ts
export interface Table {

    id: string;

    diagramId: string;

    name: string;

    color: TableColor;

    position: Point;

    width: number;

    collapsed: boolean;

    createdAt: string;

    updatedAt: string;

}
```

Future

```
description

tags

owner

locked
```

---

# Table DTO

Backend response

```ts
interface TableResponse {

    id: string;

    diagram_id: string;

    name: string;

    color: string;

    x: number;

    y: number;

    width: number;

    collapsed: boolean;

}
```

Never expose DTOs

to components.

---

# Mapper

```
TableResponse

↓

TableMapper

↓

Table
```

All DTO conversion

belongs here.

---

# Query Keys

```
tables

↓

diagram

↓

table

↓

columns
```

Example

```ts
tableKeys = {

    all,

    byDiagram,

    detail,

    columns

}
```

Never hardcode query keys.

---

# Table Store

Owns

```
Selected Table

Editing Table

Hovered Table

Expanded State
```

Never own

Server state.

Server state belongs

React Query.

---

# Table Lifecycle

```
Create

↓

Edit

↓

Review

↓

Publish

↓

Archive (Future)

↓

Delete
```

Every table follows

same lifecycle.

---

# Table Creation

Entry points

```
Toolbar

Canvas Context Menu

Editor DSL

Paste

Duplicate

Import

AI (Future)
```

Every creation path

uses same service.

---

# Creation Pipeline

```
User Action

↓

CreateTableCommand

↓

Validation

↓

Create Table Service

↓

Optimistic Update

↓

API

↓

Success

↓

React Query

↓

Render
```

No component

creates tables directly.

---

# Default Table

Created with

```
Name

↓

NewTable1
```

Width

```
280
```

Color

```
Default Theme
```

Contains

One default column

```
id

uuid

PK
```

Configurable.

---

# Naming Strategy

Names

Auto increment.

Example

```
NewTable1

NewTable2

NewTable3
```

Never duplicate names.

---

# Position Strategy

Default position

```
Viewport Center
```

If collision detected

Offset

```
+40

+40
```

Repeat until free.

Future

Smart placement.

---

# Validation

Rules

```
Name Required

↓

Unique

↓

Length

↓

Reserved Keywords
```

Validation belongs

```
table.validation.ts
```

---

# Optimistic Creation

Immediately render

table.

If API fails

Rollback.

Never wait

for server response.

---

# Undo Support

Creation registers

history event.

```
Undo

↓

Remove Table

Redo

↓

Restore Table
```

Future implementation.

---

# Table Rename

Entry points

```
Double Click

Properties

Context Menu

Editor
```

All use same command.

---

# Rename Flow

```
User

↓

Rename Command

↓

Validation

↓

Optimistic Update

↓

API

↓

Success

↓

Invalidate Query
```

---

# Rename Validation

Rules

- Required
- Unique
- Trim whitespace
- Maximum length

Future

Reserved SQL keywords.

---

# Rename Propagation

Changing table name

updates

```
Canvas

↓

Editor DSL

↓

Relationships

↓

Properties

↓

Search Index

↓

Review State
```

Single source of truth.

---

# Table Delete

Delete

Never immediate.

Flow

```
Delete

↓

Confirmation

↓

Soft Delete

↓

Review

↓

Publish

↓

Permanent Delete
```

Nothing disappears immediately.

---

# Delete Confirmation

Display

```
Table Name

Affected Relationships

Affected Columns
```

Future

Impact analysis.

---

# Delete Behavior

Current draft

Mark

```
Deleted
```

Published version

Still visible

until publish.

---

# Relationship Handling

Deleting table

marks

connected relationships

deleted.

No orphan relationships.

---

# Undo Delete

Before publish

```
Restore
```

removes

deleted state.

No data loss.

---

# Table Duplicate

Entry points

```
Context Menu

Ctrl + D

Toolbar
```

---

# Duplicate Flow

```
Clone

↓

Generate IDs

↓

Offset Position

↓

Create Review State

↓

Render
```

---

# What Gets Copied

```
Columns

Notes

Color

Width
```

Not copied

```
Relationships

Review Metadata

Audit Fields
```

Relationships recreated manually.

---

# Duplicate Naming

Example

```
Users

↓

Users Copy

↓

Users Copy 2
```

Future

Configurable.

---

# Duplicate Position

Offset

```
+40

+40
```

Prevent overlap.

---

# Table Color

Purpose

Visual organization.

---

# Supported Colors

```
Default

Blue

Green

Orange

Purple

Gray

Red

Pink
```

Future

Custom colors.

---

# Color Change Flow

```
Color Picker

↓

Update Store

↓

Optimistic Update

↓

API

↓

Review

↓

Render
```

---

# Color Validation

Theme validates

supported colors.

Never allow

invalid tokens.

---

# Collapse Table

Future

Support

```
Expanded

↓

Collapsed

↓

Expanded
```

Collapsed table

Displays only

Header.

Relationships remain connected.

---

# Collapse State

Stored

per table.

Persisted.

---

# Acceptance Criteria

- Tables created from all entry points
- Optimistic updates implemented
- Rename synchronized across workspace
- Delete uses review workflow
- Duplicate generates new IDs
- Colors configurable
- Position collision avoided
- Lint passes
- TypeScript passes
- Unit tests pass

---