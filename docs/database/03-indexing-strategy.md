# File

Projects/schemaFlow/docs/database/03-indexing-strategy.md

---

# Database Indexing Strategy Engineering Specification

**Document:** 03-indexing-strategy.md

**Project:** SchemaFlow

---

# Purpose

This document defines the indexing strategy for SchemaFlow.

The primary goals are:

- Fast lookups
- Fast project loading
- Fast diagram loading
- Fast review generation
- Fast collaboration synchronization
- Predictable query performance

Indexes should be added only for actual query patterns.

Every index has a write cost.

The objective is **minimum indexes with maximum benefit**.

---

# Indexing Philosophy

Indexes exist because of queries.

Never create an index because

> "we might need it later."

Every index in this document corresponds to a real query executed by the application.

---

# Query Categories

The application mainly performs

```
Authentication

Project Listing

Diagram Listing

Workspace Loading

Review

Publishing

Search

Autosave

Collaboration

Audit
```

These determine every index.

---

# Database Growth Estimates

Phase 1

```
Users

<100

Projects

<5,000

Diagrams

<25,000

Versions

<150,000

Tables

<1,500,000

Columns

<15,000,000

Relationships

<10,000,000
```

Future growth is already considered.

---

# users

Typical Queries

```
SELECT *

FROM users

WHERE email = ?
```

Indexes

```sql
PRIMARY KEY(id)

UNIQUE(email)
```

No additional indexes required.

---

# projects

Typical Queries

```
List projects

for one user

ordered by updated_at
```

SQL

```sql
SELECT *

FROM projects

WHERE owner_id = ?

AND deleted_at IS NULL

ORDER BY updated_at DESC;
```

Indexes

```sql
(owner_id, deleted_at, updated_at DESC)
```

Better than

three independent indexes.

---

# diagrams

Typical Queries

```
Load project diagrams

ORDER BY updated_at
```

SQL

```sql
SELECT *

FROM diagrams

WHERE project_id = ?

AND deleted_at IS NULL

ORDER BY updated_at DESC;
```

Composite Index

```sql
(project_id, deleted_at, updated_at DESC)
```

---

# diagram_versions

Typical Queries

```
Load latest draft

Load latest published

Version history
```

Indexes

```sql
(diagram_id, status)

(diagram_id, version_number DESC)

(diagram_id, created_at DESC)
```

---

# schema_tables

Typical Queries

```
Load all tables

for one version
```

SQL

```sql
SELECT *

FROM schema_tables

WHERE version_id = ?
```

Index

```sql
(version_id)
```

---

Additional

```
Review

↓

Find modified tables
```

Composite Index

```sql
(version_id, review_state)
```

---

Lineage Lookup

```
Find historical versions
```

Index

```sql
(lineage_id)
```

---

# schema_columns

Most queried table.

Queries

```
Columns by Table

Columns by Lineage

Primary Keys

Review
```

Indexes

```sql
(table_id)

(lineage_id)

(table_id, display_order)

(table_id, primary_key)
```

---

# schema_relationships

Queries

```
Relationships

For Version

Incoming

Outgoing
```

Indexes

```sql
(version_id)

(source_column_id)

(target_column_id)

(lineage_id)
```

Future

Composite

```sql
(source_column_id, target_column_id)
```

---

# schema_notes

Queries

```
Load Notes

For Version
```

Index

```sql
(version_id)
```

Lineage

```sql
(lineage_id)
```

---

# refresh_tokens

Queries

```
Find token

↓

Revoke token
```

Indexes

```sql
(user_id)

(token_hash)

(expires_at)
```

---

# audit_logs

Queries

```
Audit

By Object

Audit

By User

Audit

By Date
```

Indexes

```sql
(entity_type, entity_id)

(user_id)

(created_at DESC)
```

---

# Collaboration Tables

Redis

No SQL indexes.

---

# Composite Index Strategy

Prefer

```
(owner_id, updated_at)

```

instead of

```
(owner_id)

(updated_at)
```

when both columns always appear together.

---

# Covering Indexes

Useful

For project dashboard.

Example

```sql
(owner_id, deleted_at, updated_at, id, name)
```

Allows

Index-only scan.

Future optimization.

---

# Partial Indexes

Useful

For soft delete.

Example

```sql
CREATE INDEX idx_active_projects

ON projects(owner_id, updated_at DESC)

WHERE deleted_at IS NULL;
```

Very effective.

Recommended.

---

# Trigram Search

Enable

```
pg_trgm
```

For

```
Projects

Diagrams

Tables

Columns

Notes
```

---

Example

```sql
CREATE INDEX idx_project_name_trgm

ON projects

USING gin(name gin_trgm_ops);
```

---

# Full Text Search

Future

Store

```
tsvector
```

Columns

For

```
Notes

Descriptions

Documentation
```

---

# Unique Constraints

Enforce

```
users.email
```

Future

```
organization_slug
```

Do NOT enforce

Unique project names.

---

# Foreign Key Indexes

Every foreign key

Must also have

An index.

Examples

```
project_id

diagram_id

version_id

table_id

owner_id
```

---

# Hot Queries

These must always be

Index-backed.

```
Open Dashboard

↓

Projects

Open Diagram

↓

Versions

Open Workspace

↓

Tables

↓

Columns

↓

Relationships

Publish

↓

Review

Autosave

↓

Draft
```

---

# Explain Analyze

Every new repository query

Must be verified using

```sql
EXPLAIN ANALYZE
```

Target

```
Index Scan

or

Bitmap Index Scan
```

Avoid

Sequential scans

on production-sized tables.

---

# Query Complexity Targets

| Query | Target |
|---------|--------|
| User Lookup | O(log n) |
| Project List | O(log n) |
| Diagram List | O(log n) |
| Version Lookup | O(log n) |
| Workspace Load | O(log n) |
| Relationship Lookup | O(log n) |

---

# Write Performance

Indexes slow writes.

Expected write ratio

```
Read

90%

Write

10%
```

This justifies additional read indexes.

---

# Index Maintenance

Quarterly

Review

```
Unused Indexes

Duplicate Indexes

Slow Queries

Bloat
```

Tools

```
pg_stat_user_indexes

pg_stat_statements
```

---

# Database Statistics

Enable

```
auto_analyze

auto_vacuum
```

Default PostgreSQL settings are sufficient for Phase 1.

---

# Vacuum Strategy

Use

```
Autovacuum
```

Future

Tune

```
schema_columns

schema_relationships
```

because they change most frequently.

---

# Connection Pooling

Prisma

```
20 Connections
```

Phase 1.

Future

PgBouncer

for large deployments.

---

# Query Guidelines

Repositories must

- Never use `SELECT *` in production code
- Select only required columns
- Paginate list APIs
- Use composite indexes where appropriate
- Avoid N+1 queries
- Batch related reads
- Use transactions only when necessary

---

# Slow Query Threshold

Log queries exceeding

```
100 ms
```

Investigate

```
Execution Plan

Missing Index

Large Payload

Lock Contention
```

---

# Monitoring

Track

```
Index Usage

Sequential Scans

Cache Hit Ratio

Average Query Time

Rows Returned

Rows Examined
```

---

# Performance Targets

| Operation | Target |
|------------|--------|
| Dashboard Load | < 50 ms |
| Diagram List | < 50 ms |
| Workspace Load | < 250 ms |
| Publish | < 500 ms |
| Search | < 50 ms |
| Autosave | < 75 ms |

---

# Acceptance Criteria

- Composite indexes defined for all hot paths
- Foreign key indexes present
- Trigram search indexes documented
- Partial indexes for soft deletes
- Review queries optimized
- Explain Analyze required for new queries
- Monitoring strategy defined
- Connection pooling configured
- Performance targets documented

---

# Database Documentation Complete

The database design documentation is now complete.

## Database Documentation Index

```
Projects/schemaFlow/docs/database/

01-prisma-schema.md
02-er-diagram.md
03-indexing-strategy.md
```

---

# Recommended Next Documentation

The next highest-value documents to generate are:

```
Projects/schemaFlow/docs/architecture/

01-system-overview.md
02-sequence-diagrams.md
03-event-flow.md
04-websocket-protocol.md
05-review-workflow.md
06-command-bus.md
07-collaboration-state-machine.md
08-autosave-state-machine.md
09-publish-sequence.md
10-disaster-recovery.md
```

These documents will define the runtime behavior of SchemaFlow and complete the engineering specification for implementation.