# File

Projects/schemaFlow/docs/frontend/06-features/06-features_PART_2.md

---

# Column Management Feature

The Column Feature is responsible for the complete lifecycle of a database column.

A column is the smallest schema unit inside a table.

Every column belongs to exactly one table.

Columns can never exist independently.

---

# Responsibilities

The Column Feature owns

- Column CRUD
- Ordering
- Validation
- Datatype Management
- Constraints
- Default Values
- Notes
- Review State
- Synchronization

The feature does NOT own

- Relationship rendering
- Table rendering
- Canvas rendering

---

# Directory Structure

```
features/

column/

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
├── types/
│
├── mock/
│
├── tests/
│
└── index.ts
```

---

# Domain Model

```ts
export interface Column {

    id: string;

    tableId: string;

    name: string;

    datatype: ColumnType;

    nullable: boolean;

    primaryKey: boolean;

    unique: boolean;

    defaultValue?: string;

    note?: string;

    order: number;

    createdAt: string;

    updatedAt: string;

}
```

Future

```
checkConstraint

generatedColumn

index

foreignKey

comment
```

---

# DTO

```ts
export interface ColumnResponse {

    id: string;

    table_id: string;

    name: string;

    datatype: string;

    nullable: boolean;

    primary_key: boolean;

    unique: boolean;

    default_value: string | null;

    note: string | null;

    order: number;

}
```

Never expose DTOs

Outside

Mapper.

---

# Query Keys

```
columns

↓

table

↓

column
```

Example

```ts
columnKeys = {

    all,

    byTable,

    detail

}
```

---

# Store Ownership

Local Store owns

```
Hovered Column

Editing Column

Selected Column
```

Server State

Belongs

React Query.

---

# Column Lifecycle

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

# Column Creation

Entry Points

```
Table Footer

Context Menu

Properties Panel

Editor DSL

Duplicate Table

Import
```

All routes

Call

```
CreateColumnCommand
```

---

# Default Column

When created

```
name

↓

column1
```

Datatype

```
varchar
```

Nullable

```
true
```

Primary Key

```
false
```

Unique

```
false
```

---

# Naming Strategy

Auto-generated

```
column1

column2

column3
```

Within

Current Table.

Never duplicate names.

---

# Column Position

New columns

Always inserted

After selected column.

If no selection

Append

To end.

---

# Creation Pipeline

```
User

↓

Create Command

↓

Validation

↓

Optimistic Update

↓

API

↓

React Query

↓

Render
```

---

# Rename Column

Entry Points

```
Double Click

Properties

Context Menu

DSL

Keyboard
```

Every path

Uses

Same command.

---

# Rename Rules

Required

Maximum Length

Unique

Valid Identifier

Reserved Keyword Check

---

# Rename Propagation

Rename updates

```
Canvas

↓

Relationship Labels

↓

DSL

↓

Properties

↓

Search

↓

Review
```

Single source of truth.

---

# Delete Column

Deletion

Never immediate.

```
Delete

↓

Review Deleted

↓

Publish

↓

Permanent Delete
```

---

# Delete Restrictions

Cannot delete

Last Primary Key

Unless

User confirms.

Cannot orphan

Relationship.

Validation required.

---

# Restore Column

Before publish

Deleted column

Can be restored.

History preserved.

---

# Duplicate Column

Supported.

Flow

```
Copy

↓

Generate ID

↓

Insert Below

↓

Rename

↓

Render
```

---

# Duplicate Naming

```
email

↓

email_copy

↓

email_copy_2
```

Configurable

Future.

---

# Column Ordering

Supported

```
Drag

↓

Preview

↓

Drop

↓

Persist
```

Current MVP

Optional.

Architecture

Must support.

---

# Ordering Strategy

Every column

Owns

```
order
```

Sorting

Always

Ascending.

Never

Depend

On array index.

---

# Datatype Management

Supported Types

```
uuid

varchar

text

boolean

integer

bigint

decimal

float

date

timestamp

json

jsonb

enum

blob
```

Future

Plugin datatypes.

---

# Datatype Groups

```
Text

Numbers

Date

Boolean

JSON

Binary

Custom
```

Property Panel

Displays

Grouped selector.

---

# Datatype Validation

Validation

By

Datatype Service.

Example

```
varchar

↓

Length

decimal

↓

Precision

enum

↓

Values
```

---

# Default Value

Supported

```
NULL

Literal

Expression
```

Examples

```
now()

uuid_generate_v4()

CURRENT_TIMESTAMP
```

Validation

Database-specific.

Future.

---

# Nullable

Toggle

```
Nullable

↓

Not Nullable
```

Validation

Cannot make

Existing NULL values

Invalid.

Backend validates.

---

# Primary Key

Rules

Only one

Simple PK

Allowed

MVP.

Future

Composite Keys.

---

# Primary Key Changes

Changing PK

Updates

```
Relationships

↓

DSL

↓

Review

↓

Canvas
```

---

# Unique

Toggle

```
Unique

↓

Not Unique
```

Future

Named Constraints.

---

# Notes

Every column

Supports

Markdown notes.

Maximum Length

Configurable.

---

# Review Integration

Review States

```
Created

Modified

Deleted

Published
```

Visualized

By

Review Overlay.

---

# Search Integration

Column Search

Indexes

```
Name

Datatype

Note
```

Future

Default Value.

---

# Import Integration

Import

Automatically creates

Columns.

Validation

Runs

Before commit.

---

# Export Integration

Export

Reads

Canonical model.

Never

Reads

Rendered UI.

---

# Keyboard Support

```
F2

Rename

Delete

Delete

Ctrl+D

Duplicate

Ctrl+C

Copy

Ctrl+V

Paste
```

---

# Optimistic Updates

Every mutation

Updates

UI immediately.

Rollback

On failure.

---

# Error Handling

Possible Errors

```
Duplicate Name

Invalid Datatype

Reserved Keyword

Relationship Conflict

Network Error
```

Display

Inline

Whenever possible.

---

# Testing

Unit Tests

- Create
- Rename
- Delete
- Duplicate
- Validation
- Datatype

Integration Tests

- Properties Panel
- DSL Sync
- Relationships

Performance

- Large tables
- 500+ columns

---

# Acceptance Criteria

- Create column
- Rename column
- Delete column
- Restore deleted column
- Duplicate column
- Datatype updates
- PK toggle
- Nullable toggle
- Unique toggle
- Notes supported
- Review integrated
- Search indexed
- Optimistic updates
- Lint passes
- TypeScript passes
- Unit tests pass

---