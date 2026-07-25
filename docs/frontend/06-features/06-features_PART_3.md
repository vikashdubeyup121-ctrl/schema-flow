# File

Projects/schemaFlow/docs/frontend/06-features/06-features_PART_3.md

---

# Relationship Management Feature

The Relationship Feature manages every connection between two database columns.

A relationship represents a database constraint.

Unlike visual edges, relationships are business objects.

The Canvas only renders relationships.

The Relationship Feature owns the business rules.

---

# Responsibilities

The Relationship Feature owns

- Relationship CRUD
- Relationship Validation
- Relationship Types
- Referential Integrity Rules
- Relationship Synchronization
- Review Integration
- Import / Export
- DSL Synchronization

The Relationship Feature never owns

- Edge Rendering
- Geometry
- Viewport
- Canvas Interaction

---

# Directory Structure

```
features/

relationship/

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
├── mock/
│
├── types/
│
├── utils/
│
├── tests/
│
└── index.ts
```

---

# Domain Model

```ts
export interface Relationship {

    id: string;

    diagramId: string;

    sourceTableId: string;

    sourceColumnId: string;

    targetTableId: string;

    targetColumnId: string;

    type: RelationshipType;

    name?: string;

    createdAt: string;

    updatedAt: string;

}
```

Future

```
Delete Rule

Update Rule

Constraint Name

Comment

Database Specific Metadata
```

---

# DTO

```ts
export interface RelationshipResponse {

    id: string;

    source_table_id: string;

    source_column_id: string;

    target_table_id: string;

    target_column_id: string;

    relationship_type: string;

}
```

DTOs never leave

Mapper layer.

---

# Relationship Types

Phase 1

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

---

# Relationship Store

Owns

```
Hovered Relationship

Selected Relationship

Editing Relationship

Temporary Relationship
```

Server state

Belongs

React Query.

---

# Relationship Lifecycle

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

# Relationship Creation

Entry Points

```
Column Handle Drag

Context Menu

Editor DSL

Import

Paste
```

Every entry point

Uses

```
CreateRelationshipCommand
```

---

# Creation Pipeline

```
Drag

↓

Source Column

↓

Target Column

↓

Validation

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

---

# Connection Rules

Allowed

```
Column

↓

Column
```

Not Allowed

```
Table

↓

Table

Column

↓

Canvas

Relationship

↓

Relationship
```

Connections are always

Column-to-column.

---

# Validation Pipeline

```
Source Exists

↓

Target Exists

↓

Not Same Column

↓

Compatible Types

↓

No Duplicate

↓

Create
```

Validation belongs

Relationship Validation Service.

---

# Compatible Datatypes

Examples

Allowed

```
uuid

↓

uuid
```

```
integer

↓

integer
```

```
varchar

↓

varchar
```

Rejected

```
uuid

↓

timestamp
```

Validation configurable.

Future

Database-specific compatibility.

---

# Duplicate Prevention

Prevent

```
users.id

↓

orders.user_id
```

being created twice.

Duplicate relationships

Rejected.

---

# Self Relationships

Allowed.

Example

```
employees.manager_id

↓

employees.id
```

Useful for

Tree structures.

---

# Circular Relationships

Allowed.

Example

```
A

↓

B

↓

C

↓

A
```

Business logic

Should not prohibit.

Database

May support.

---

# Relationship Rename

Future

Support

Named constraints.

Current MVP

Anonymous.

---

# Relationship Delete

Flow

```
Delete

↓

Review Deleted

↓

Publish

↓

Permanent Delete
```

Never remove immediately.

---

# Relationship Restore

Before publish

Relationship

Can be restored.

Review metadata preserved.

---

# Relationship Direction

Source

Always

Foreign Key.

Target

Always

Referenced Key.

Renderer

Uses direction

For arrow.

---

# Reverse Direction

Supported

Future.

Flow

```
Swap Source

↓

Swap Target

↓

Validate

↓

Persist
```

---

# Connection Preview

During dragging

Render

Temporary relationship.

Never create

Business object

Until drop succeeds.

---

# Hover Behaviour

Hovering a relationship

Highlights

```
Relationship

↓

Source Table

↓

Target Table

↓

Source Column

↓

Target Column
```

Highlight set

Computed

By service.

---

# Selection Behaviour

Selected relationship

Shows

```
Selection Overlay

Properties

Keyboard Shortcuts
```

Only one relationship

Editable

At a time.

---

# Review Integration

Relationship

Supports

```
Created

Modified

Deleted

Published
```

Visualized

By

Relationship Review Overlay.

---

# DSL Synchronization

Relationship creation

Updates

```
Canvas

↓

Relationship Store

↓

DSL Serializer

↓

Editor
```

Reverse path

```
Editor

↓

Parser

↓

Relationship Commands

↓

Canvas
```

---

# Import Integration

Importer

Creates relationships

After

Tables

Columns

Exist.

Order

Matters.

---

# Export Integration

Exporter

Uses

Canonical model.

Never

Reads

Canvas edges.

---

# Copy / Paste

Copying tables

Does NOT

Automatically recreate

Relationships

Outside copied set.

Example

```
Users

↓

Orders
```

Copy only

Users

↓

No relationship.

Copy both

↓

Relationship recreated.

---

# Duplicate Table Integration

Duplicating a table

Copies

Internal metadata

Only.

Relationships

Remain disconnected.

User decides

New relationships.

---

# Delete Table Integration

Deleting a table

Marks

All connected relationships

Deleted.

No dangling relationships.

---

# Column Delete Integration

Deleting a column

Marks

Connected relationships

Deleted.

Validation

Prevents

Broken graph.

---

# Search Integration

Relationship search

Indexes

```
Relationship Name

Source Table

Target Table

Source Column

Target Column
```

Future

Constraint name.

---

# Properties Panel

Displays

```
Relationship Type

Source

Target

Delete Rule (Future)

Update Rule (Future)

Review State
```

---

# Context Menu

```
Delete

Properties

Reverse Direction (Future)

Convert Type (Future)
```

---

# Keyboard Support

```
Delete

Ctrl+C

Ctrl+V

Escape

Arrow Navigation (Future)
```

---

# Optimistic Updates

Relationship operations

Immediately reflected

On canvas.

Rollback

If API fails.

---

# Error Handling

Possible failures

```
Duplicate Relationship

Invalid Datatype

Missing Column

Network Failure

Permission Denied
```

Errors

Displayed

Through

Toast

+

Inline validation

Where applicable.

---

# Performance Targets

Support

```
5,000 Relationships
```

Target

```
Relationship Creation

<100ms
```

Hover

```
<16ms
```

Selection

```
<16ms
```

---

# Testing

Unit Tests

- Create
- Delete
- Restore
- Validation
- Duplicate Prevention
- Datatype Compatibility

Integration Tests

- Drag Connection
- DSL Sync
- Import
- Export

Performance Tests

- 5,000 Relationships
- Hover
- Selection

---

# Acceptance Criteria

- Relationships created by drag
- Relationships created by DSL
- Validation enforced
- Duplicate prevention works
- Self relationships supported
- Circular relationships supported
- Delete integrated with review
- Copy/Paste behaves correctly
- Import/Export supported
- Optimistic updates implemented
- Lint passes
- TypeScript passes
- Unit tests pass

---