# File

Projects/schemaFlow/docs/backend/06-versioning-service.md

---

# Versioning & Review Service Engineering Specification

**Document:** 06-versioning-service.md

**Project:** SchemaFlow

---

# Purpose

The Versioning Service is the defining feature of SchemaFlow.

Unlike traditional ER diagram tools where every edit immediately modifies the schema, SchemaFlow introduces a Git-inspired review workflow.

Every diagram always consists of two logical states:

```
Published Version

+

Draft Version
```

Users edit only the Draft.

The Published version is immutable.

Publishing atomically replaces the Published version with the Draft.

---

# Responsibilities

Owns

- Draft lifecycle
- Published versions
- Version history
- Review state
- Publish workflow
- Draft cloning
- Patch generation
- Rollback
- Version comparison
- Object lineage

Does NOT own

- Authentication
- Collaboration
- Canvas Rendering
- UI
- WebSocket

---

# High-Level Architecture

```
Diagram

↓

Version Service

↓

Draft Service

↓

Diff Service

↓

Publish Service

↓

Repository

↓

PostgreSQL
```

---

# Folder Structure

```
modules/

version/

├── controller/
│   └── version.controller.ts
│
├── service/
│   ├── version.service.ts
│   ├── draft.service.ts
│   ├── publish.service.ts
│   ├── diff.service.ts
│   ├── rollback.service.ts
│   ├── review.service.ts
│   └── lineage.service.ts
│
├── repository/
│   ├── version.repository.ts
│   └── draft.repository.ts
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

# Version Model

```ts
export interface DiagramVersion {

    id: string;

    diagramId: string;

    versionNumber: number;

    status:

        | "DRAFT"

        | "PUBLISHED";

    basedOnVersionId: string | null;

    createdBy: string;

    publishedBy: string | null;

    createdAt: Date;

    publishedAt: Date | null;

}
```

---

# Database Table

```
diagram_versions

--------------------------------------

id

diagram_id

version_number

status

based_on_version_id

created_by

published_by

created_at

published_at
```

---

# Version Lifecycle

```
Published V1

↓

Clone

↓

Draft

↓

Edit

↓

Review

↓

Publish

↓

Published V2

↓

New Draft
```

Only one active draft

Per diagram.

---

# Rules

Every diagram

Always has

```
1 Published Version
```

May have

```
0 or 1 Draft
```

Never allow

Multiple drafts

For the same diagram.

---

# Version Numbers

```
1

2

3

4
```

Monotonically increasing.

Never reused.

---

# Draft Creation

```
POST

/api/v1/diagrams/:id/draft
```

Flow

```
Latest Published

↓

Clone Metadata

↓

Clone Schema

↓

Create Draft

↓

Return Draft
```

---

# Clone Strategy

Draft cloning copies

```
Tables

Columns

Relationships

Notes
```

Review state becomes

```
UNCHANGED
```

Initially.

---

# Object Lineage

Every schema object stores

```
lineage_id
```

Example

```
Published

users

↓

Draft

users

↓

Published V2

users
```

All three records share

Same lineage.

This enables

Version comparison.

---

# Lineage Model

```ts
interface Lineage {

    lineageId: string;

    objectType: string;

}
```

Lineage never changes.

Object IDs

May change

Between published versions.

---

# Review State

Persisted

Per object.

```
UNCHANGED

CREATED

MODIFIED

DELETED
```

Never compute

Entire diagram diff

On every request.

---

# Review Detection

Every mutation

Updates review state.

Example

```
Rename Table

↓

MODIFIED
```

```
Create Table

↓

CREATED
```

```
Delete Table

↓

DELETED
```

---

# Review Summary

Service computes

```
Tables Created

Tables Modified

Tables Deleted

Columns Created

Relationships Deleted

Notes Modified
```

Used by

Publish dialog.

---

# Review Endpoint

```
GET

/api/v1/versions/:id/review
```

Returns

```json
{
  "summary": {
    "tablesCreated": 2,
    "columnsModified": 8
  }
}
```

---

# Publish Endpoint

```
POST

/api/v1/versions/:id/publish
```

Requires

```
Authenticated Owner
```

---

# Publish Pipeline

```
Validate Draft

↓

Generate Patch

↓

Transaction

↓

Create Published Version

↓

Copy Schema

↓

Mark Published

↓

Delete Draft

↓

Create New Empty Draft

↓

Commit
```

Everything

Atomic.

---

# Publish Validation

Checks

```
Duplicate Tables

Duplicate Columns

Broken Relationships

Invalid References

Missing PK

Invalid Datatypes
```

Any failure

Stops publish.

---

# Patch Generation

Diff Service compares

```
Published

↓

Draft
```

Generates

```
CREATE

UPDATE

DELETE
```

Operations.

Useful for

Audit

Analytics

Future Git export.

---

# Diff Model

```ts
interface DiffOperation {

    type:

        | "CREATE"

        | "UPDATE"

        | "DELETE";

    objectType: string;

    objectId: string;

}
```

---

# Publish Transaction

One transaction

Creates

```
Published Version

↓

Schema

↓

Metadata

↓

Review Cleanup

↓

Commit
```

Rollback

Everything

On failure.

---

# Draft Cleanup

After publish

Old draft

Removed.

Frontend

Receives

Fresh draft.

---

# Discard Draft

```
DELETE

/api/v1/versions/:id/draft
```

Flow

```
Confirmation

↓

Delete Draft

↓

Reload Published
```

No partial discard.

---

# Rollback

Future

Support

```
Version 10

↓

Rollback

↓

Version 11
```

Rollback never edits

Old versions.

Creates

A new version.

---

# Version History

```
GET

/api/v1/diagrams/:id/versions
```

Returns

```
Version Number

Published By

Published At

Summary
```

---

# Compare Versions

Future

```
GET

/versions/:a/compare/:b
```

Returns

Object differences.

Uses

Lineage IDs.

---

# Object Restore

Deleted objects

Before publish

Can be restored.

Review state becomes

```
UNCHANGED

or

MODIFIED
```

Depending on history.

---

# Autosave Integration

Autosave

Always saves

Draft.

Never

Published version.

---

# Collaboration Integration

Multiple users

Edit

Same draft.

Publish

Requires

Latest draft revision.

---

# Optimistic Concurrency

Draft

Owns

```
revision_number
```

Publish request includes

Current revision.

Mismatch

↓

409 Conflict.

---

# Audit Trail

Every publish records

```
User

Timestamp

Request ID

Version

Patch Summary
```

---

# Notifications

Future

Emit

```
VersionPublished

DraftCreated

DraftDiscarded
```

Useful for

Teams.

---

# Caching

Redis caches

```
Latest Published Version

Review Summary

Version Metadata
```

Invalidate

On publish.

---

# Performance Targets

```
Create Draft

<300ms

Publish

<500ms

Review Summary

<50ms

Version History

<100ms
```

---

# Testing

Unit Tests

- Draft creation
- Publish
- Discard
- Diff generation
- Review state

Integration Tests

- Full publish workflow
- Transaction rollback
- Concurrent publish

Database Tests

- Version lineage
- Review persistence
- Cascade cleanup

Performance Tests

- 500 tables
- 20k objects
- Publish timing

---

# Acceptance Criteria

- Single active draft enforced
- Published versions immutable
- Draft cloning implemented
- Review state persisted
- Patch generation implemented
- Atomic publish workflow
- Version history available
- Lineage tracking implemented
- Optimistic concurrency enforced
- Redis cache integrated
- Lint passes
- TypeScript passes
- Unit tests pass

---

# End of Document

Continue with

```
Projects/schemaFlow/docs/backend/

07-collaboration-service.md
```