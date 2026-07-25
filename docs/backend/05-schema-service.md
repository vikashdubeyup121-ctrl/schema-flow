# File

Projects/schemaFlow/docs/backend/05-schema-service.md

---

# Schema Service Engineering Specification

**Document:** 05-schema-service.md

**Project:** SchemaFlow

---

# Purpose

The Schema Service is the heart of SchemaFlow.

Every operation that modifies the schema passes through this service.

Unlike the Diagram Service, which manages diagram metadata, the Schema Service owns the actual database objects.

It is responsible for

- Tables
- Columns
- Relationships
- Notes
- Object Metadata
- Review State
- Schema Validation
- Patch Generation

The Schema Service is the **canonical source of truth** for every object inside a diagram version.

---

# Responsibilities

Owns

- Table CRUD
- Column CRUD
- Relationship CRUD
- Floating Notes
- Column Notes
- Schema Validation
- Review Metadata
- Patch Generation
- Object Lookup
- Object Ordering

Does NOT own

- Authentication
- Project Management
- Diagram Metadata
- Collaboration Transport
- Viewport

---

# High-Level Architecture

```
HTTP

↓

Schema Controller

↓

Schema Service

↓

Validation

↓

Repository

↓

PostgreSQL

↓

Mapper

↓

Response
```

---

# Folder Structure

```
modules/

schema/

├── controller/
│   └── schema.controller.ts
│
├── service/
│   ├── schema.service.ts
│   ├── table.service.ts
│   ├── column.service.ts
│   ├── relationship.service.ts
│   ├── note.service.ts
│   ├── validation.service.ts
│   └── patch.service.ts
│
├── repository/
│   ├── table.repository.ts
│   ├── column.repository.ts
│   ├── relationship.repository.ts
│   └── note.repository.ts
│
├── dto/
│
├── mapper/
│
├── validator/
│
├── routes/
│
├── tests/
│
└── index.ts
```

---

# Canonical Model

The backend never stores

```
ReactFlow Nodes

ReactFlow Edges
```

Instead it stores

```
Diagram Version

↓

Tables

↓

Columns

↓

Relationships

↓

Notes
```

The frontend is responsible for converting this canonical model into visual nodes and edges.

---

# Database Model

```
Diagram Version

↓

Tables

↓

Columns

↓

Relationships

↓

Notes
```

Every object belongs to

Exactly one

Diagram Version.

---

# Tables

```
schema_tables

-----------------------------------

id

version_id

name

description

color

x

y

width

collapsed

review_state

created_at

updated_at
```

---

# Columns

```
schema_columns

-----------------------------------

id

table_id

name

datatype

nullable

primary_key

unique_key

default_value

note

position

review_state

created_at

updated_at
```

---

# Relationships

```
schema_relationships

-----------------------------------

id

version_id

source_table_id

source_column_id

target_table_id

target_column_id

relationship_type

review_state

created_at

updated_at
```

---

# Floating Notes

```
schema_notes

-----------------------------------

id

version_id

title

markdown

color

x

y

width

height

review_state

created_at

updated_at
```

---

# Review State

Every schema object owns

```
UNCHANGED

CREATED

MODIFIED

DELETED
```

Never compute

Review state dynamically.

Persist it.

---

# Object Identity

Every object receives

```
UUID v7
```

IDs never change

Across draft lifetime.

Publishing

Creates new version records

While preserving logical lineage.

---

# Schema Retrieval

```
GET

/api/v1/versions/:versionId/schema
```

Returns

```
Tables

Columns

Relationships

Notes

Metadata
```

One request

Loads entire workspace.

---

# Schema Response

```json
{
  "tables": [],
  "relationships": [],
  "notes": [],
  "metadata": {
    "versionId": "...",
    "review": true
  }
}
```

Frontend reconstructs

Graph.

---

# Table Service

Responsibilities

- Create
- Rename
- Move
- Resize
- Change Color
- Delete
- Restore
- Duplicate

No column logic.

---

# Column Service

Responsibilities

- Create
- Rename
- Delete
- Reorder
- Change Datatype
- Constraints
- Notes

No table positioning.

---

# Relationship Service

Responsibilities

- Create
- Delete
- Validate
- Prevent duplicates
- Referential integrity

Never updates

Columns.

---

# Note Service

Owns

```
Floating Notes

Column Notes
```

Supports

Markdown validation.

---

# Validation Service

Runs

Before every mutation.

Checks

```
Duplicate Table Names

Duplicate Columns

Broken Relationships

Missing Tables

Missing Columns

Datatype Compatibility

Primary Key Rules
```

---

# Patch Service

The frontend never sends

Entire schema

After every change.

Instead

It sends

```
Commands
```

or

```
Patch Operations
```

The Patch Service applies

Only the delta.

---

# Patch Format

```json
{
  "operations": [
    {
      "type": "CREATE_TABLE",
      "payload": {}
    },
    {
      "type": "RENAME_COLUMN",
      "payload": {}
    }
  ]
}
```

Every operation

Is atomic.

---

# Mutation Pipeline

```
Request

↓

Validation

↓

Transaction

↓

Apply Operation

↓

Update Review State

↓

Commit

↓

Return Updated Object
```

---

# Batch Operations

Supported.

Example

```
Paste

↓

20 Tables

↓

120 Columns

↓

50 Relationships
```

Handled inside

One transaction.

---

# Object Ordering

Columns

Own

```
display_order
```

Tables

Rendered

Using coordinates.

Relationships

No explicit ordering.

---

# Duplicate Table

Pipeline

```
Clone Table

↓

Clone Columns

↓

Generate IDs

↓

Offset Position

↓

Mark Created
```

Relationships

Not cloned

Unless both endpoints

Exist in selection.

---

# Delete Table

Deleting a table

Automatically marks

```
Columns

Relationships

Column Notes
```

Deleted.

Transaction required.

---

# Restore Table

Restore

Also restores

```
Columns

Relationships

Notes
```

Unless independently deleted later.

---

# Referential Integrity

Relationships require

```
Source Table Exists

Source Column Exists

Target Table Exists

Target Column Exists
```

Validation

Always executed.

---

# Optimistic Concurrency

Every mutation includes

```
version_number
```

If outdated

Return

```
409 Conflict
```

Frontend reloads.

Future

Replace with

Operational Transform.

---

# Search Support

Indexes

```
Table Name

Column Name

Datatype

Note Content
```

Future

Descriptions.

---

# Autosave

Autosave stores

Draft changes only.

Published versions

Remain immutable.

---

# Audit Metadata

Every mutation records

```
User ID

Timestamp

Request ID

Operation Type
```

Useful for

Future activity history.

---

# Caching

Redis caches

```
Compiled Schema

Validation Results

Diagram Summary
```

Invalidate

On mutation.

---

# Transactions

Every schema mutation

Runs inside

A database transaction.

Example

```
Rename Table

↓

Update Relationships

↓

Update Review State

↓

Commit
```

---

# Error Handling

Possible Errors

```
Duplicate Name

Invalid Datatype

Broken Relationship

Object Not Found

Conflict

Validation Failure
```

Standard API response.

---

# Performance Targets

```
Load Schema

<250ms

Create Table

<80ms

Rename Column

<50ms

Batch Paste (100 Objects)

<400ms

Validation

<75ms
```

---

# Testing

Unit Tests

- Table CRUD
- Column CRUD
- Relationship CRUD
- Validation
- Patch Application

Integration Tests

- Full Schema Load
- Batch Operations
- Restore
- Delete Cascade

Database Tests

- Transactions
- Foreign Keys
- Index Usage

Performance Tests

- 500 Tables
- 10,000 Columns
- 20,000 Relationships

---

# Acceptance Criteria

- Canonical schema model implemented
- Table CRUD complete
- Column CRUD complete
- Relationship CRUD complete
- Notes supported
- Patch operations implemented
- Validation centralized
- Transactions enforced
- Optimistic concurrency supported
- Redis cache integrated
- Lint passes
- TypeScript passes
- Unit tests pass

---

# End of Document

Continue with

```
Projects/schemaFlow/docs/backend/

06-versioning-service.md
```