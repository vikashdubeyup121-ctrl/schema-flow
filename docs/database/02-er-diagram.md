# File

Projects/schemaFlow/docs/database/02-er-diagram.md

---

# Entity Relationship Diagram Engineering Specification

**Document:** 02-er-diagram.md

**Project:** SchemaFlow

---

# Purpose

This document explains the logical Entity Relationship (ER) model for SchemaFlow.

Unlike the Prisma schema, which focuses on implementation details, this document focuses on:

- Business entities
- Relationships
- Cardinality
- Ownership
- Data lifecycle
- Referential integrity

This document should be treated as the canonical data model for the application.

---

# High-Level Entity Relationship Diagram

```text
                                    +----------------+
                                    |     User       |
                                    +----------------+
                                    | id             |
                                    | email          |
                                    | name           |
                                    +----------------+
                                             |
                                         1   |
                                             | N
                                             ▼
                                    +----------------+
                                    |    Project     |
                                    +----------------+
                                    | id             |
                                    | ownerId        |
                                    | name           |
                                    | description    |
                                    +----------------+
                                             |
                                         1   |
                                             | N
                                             ▼
                                    +----------------+
                                    |    Diagram     |
                                    +----------------+
                                    | id             |
                                    | projectId      |
                                    | name           |
                                    | viewport       |
                                    +----------------+
                                             |
                                         1   |
                                             | N
                                             ▼
                              +------------------------------+
                              |     DiagramVersion           |
                              +------------------------------+
                              | id                           |
                              | diagramId                    |
                              | versionNumber                |
                              | status                       |
                              | revisionNumber               |
                              +------------------------------+
                     _____________|______________|______________
                    /             |              |              \
                   /              |              |               \
                  ▼               ▼              ▼                ▼

          +--------------+ +----------------+ +-------------+ +-------------+
          | SchemaTable  | |Relationship    | | SchemaNote  | | AuditLog*   |
          +--------------+ +----------------+ +-------------+ +-------------+
          | versionId    | | versionId      | | versionId   | | entityId    |
          | lineageId    | | lineageId      | | lineageId   | | operation   |
          +--------------+ +----------------+ +-------------+ +-------------+
                 |
             1   |
                 | N
                 ▼
          +----------------+
          | SchemaColumn   |
          +----------------+
          | tableId        |
          | lineageId      |
          +----------------+
```

---

# Entity Ownership

Every entity has exactly one owner.

Ownership never skips levels.

```
User

owns

↓

Project

owns

↓

Diagram

owns

↓

DiagramVersion

owns

↓

Tables

↓

Relationships

↓

Notes

↓

Columns
```

---

# Cardinality

## User → Project

```
1 : N
```

One user can own many projects.

Every project belongs to exactly one user.

---

## Project → Diagram

```
1 : N
```

A project can contain many diagrams.

A diagram cannot belong to multiple projects.

---

## Diagram → Version

```
1 : N
```

Every diagram has

- One or more published versions
- Zero or one active draft

---

## Version → Tables

```
1 : N
```

A version owns all tables.

Tables cannot belong to multiple versions.

---

## Table → Columns

```
1 : N
```

A table contains ordered columns.

Columns cannot exist without a table.

---

## Version → Relationships

```
1 : N
```

Relationships belong directly to a version.

This simplifies cloning and publishing.

---

## Version → Notes

```
1 : N
```

Floating notes belong to the version.

---

# Why Relationships Do Not Belong to Tables

A relationship connects two independent tables.

If relationships belonged to a table, deleting or cloning tables would become much more complex.

Instead

```
Version

↓

Relationship

↓

Source Table

↓

Target Table
```

This also simplifies

- Import
- Export
- Version cloning
- Publish

---

# Lineage Model

Every editable object has two identities.

## Runtime Identity

Changes every version.

```
id
```

---

## Logical Identity

Never changes.

```
lineageId
```

Example

```
Published V1

Table

id = A

lineage = USERS

↓

Draft

id = B

lineage = USERS

↓

Published V2

id = C

lineage = USERS
```

This enables

- Diff
- Review
- Rollback
- History

---

# Draft Lifecycle

```
Published V5

↓

Clone

↓

Draft

↓

Edit

↓

Publish

↓

Published V6

↓

New Draft
```

Published versions

Never change.

---

# Review State

Every editable object owns

```
UNCHANGED

CREATED

MODIFIED

DELETED
```

Persisting review state enables

- Fast review
- Colored borders
- Change statistics
- Publish preview

without expensive comparisons.

---

# Soft Delete

Projects

Diagrams

Versions

may be soft deleted.

Schema objects inside a draft

are marked

```
DELETED
```

instead of being removed immediately.

Published versions

are never modified.

---

# Referential Integrity Rules

Every relationship must satisfy

```
Source Table Exists

AND

Target Table Exists

AND

Source Column Exists

AND

Target Column Exists
```

Validation occurs

before persistence.

---

# Version Isolation

Objects from one version

must never reference

objects from another version.

Example

```
Relationship

↓

Source Table

↓

Same Version

✓
```

```
Relationship

↓

Target Table

↓

Different Version

✗
```

This is enforced in the service layer.

---

# Collaboration Model

Collaboration is tied to

Draft Versions

Only.

```
Diagram

↓

Draft Version

↓

Room

↓

Connected Users
```

Published versions

cannot be collaboratively edited.

---

# Search Scope

Search indexes

```
Projects

Diagrams

Tables

Columns

Notes
```

Search never indexes

Published history separately.

---

# Publish Flow

```text
Draft

↓

Validate

↓

Create New Version

↓

Copy Objects

↓

Update Diagram Pointer

↓

Archive Draft

↓

Create Fresh Draft
```

---

# Entity Lifecycle

## Table

```text
Create

↓

Modify

↓

Publish

↓

Clone

↓

Modify

↓

Publish

↓

Archive
```

---

## Column

```text
Create

↓

Datatype Change

↓

Rename

↓

Delete

↓

Publish
```

---

## Relationship

```text
Create

↓

Modify

↓

Delete

↓

Publish
```

---

## Floating Note

```text
Create

↓

Resize

↓

Edit

↓

Delete

↓

Publish
```

---

# Audit Trail

Every mutation creates

one immutable audit log entry.

Example

```
Rename Table

↓

Audit Log

↓

User

↓

Timestamp

↓

Request ID
```

Audit logs are append-only.

---

# Future Extensions

The data model supports future additions without redesign.

Examples

```
Organizations

Teams

Permissions

Comments

Mentions

AI Suggestions

Templates

Plugins

Database Connectors
```

These entities would attach at the appropriate ownership level without changing the existing hierarchy.

---

# Data Ownership Summary

| Entity | Owner |
|---------|-------|
| User | System |
| Project | User |
| Diagram | Project |
| Version | Diagram |
| Table | Version |
| Column | Table |
| Relationship | Version |
| Note | Version |
| Refresh Token | User |
| Audit Log | System |

---

# Acceptance Criteria

- Ownership hierarchy clearly defined
- Cardinality documented
- Version isolation explained
- Review lifecycle documented
- Lineage strategy defined
- Referential integrity rules specified
- Draft/publish workflow represented
- Future extensibility identified

---

# End of Document

Continue with

```
Projects/schemaFlow/docs/database/

03-indexing-strategy.md
```