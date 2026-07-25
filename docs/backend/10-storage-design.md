# File

Projects/schemaFlow/docs/backend/10-storage-design.md

---

# Storage & Database Design Engineering Specification

**Document:** 10-storage-design.md

**Project:** SchemaFlow

---

# Purpose

The Storage Layer is responsible for persisting every piece of data inside SchemaFlow.

It is the single source of truth for

- Users
- Projects
- Diagrams
- Versions
- Drafts
- Schema Objects
- Collaboration Metadata
- Audit Logs

The storage layer should be designed to support Phase 1 (50 users, ~10 concurrent collaborators) while scaling to thousands of users without major schema redesign.

---

# Storage Principles

The database should store

- Canonical domain objects
- Immutable published versions
- Mutable draft versions
- Minimal duplication
- Strong referential integrity

The database should never store

- ReactFlow Nodes
- ReactFlow Edges
- Canvas UI state
- Component-specific metadata

---

# Technology Stack

Database

```
PostgreSQL 17
```

ORM

```
Prisma
```

Cache

```
Redis
```

Search

```
PostgreSQL Trigram Search

Future

OpenSearch
```

Blob Storage

```
GCS / S3

Future
```

---

# High Level Storage Architecture

```
                API

                 │

                 ▼

          Repository Layer

        ┌────────┴─────────┐

        ▼                  ▼

   PostgreSQL           Redis

        │

        ▼

  Persistent Storage
```

---

# Database Schema Overview

```
users

↓

projects

↓

diagrams

↓

diagram_versions

↓

tables

↓

columns

↓

relationships

↓

notes

↓

audit_logs
```

---

# Entity Relationship

```
User

  │

  └──────< Project

              │

              └──────< Diagram

                          │

                          └──────< Version

                                      │

               ┌───────────┬──────────┴────────────┐

               ▼           ▼                       ▼

            Tables      Relationships          Notes

               │

               ▼

            Columns
```

---

# users

```
id

email

name

picture_url

created_at

updated_at
```

Indexes

```
PK(id)

UNIQUE(email)
```

---

# projects

```
id

owner_id

name

description

deleted_at

created_at

updated_at
```

Indexes

```
PK(id)

INDEX(owner_id)

INDEX(updated_at)
```

---

# diagrams

```
id

project_id

name

description

published_version_id

draft_version_id

viewport_x

viewport_y

viewport_zoom

created_at

updated_at

deleted_at
```

---

# diagram_versions

```
id

diagram_id

version_number

status

based_on_version_id

revision_number

created_by

published_by

created_at

published_at
```

---

# schema_tables

```
id

version_id

lineage_id

name

description

color

position_x

position_y

width

collapsed

review_state

created_at

updated_at
```

---

# schema_columns

```
id

table_id

lineage_id

name

datatype

nullable

primary_key

unique_key

default_value

note

display_order

review_state

created_at

updated_at
```

---

# schema_relationships

```
id

version_id

lineage_id

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

# schema_notes

```
id

version_id

lineage_id

title

markdown

color

position_x

position_y

width

height

review_state

created_at

updated_at
```

---

# audit_logs

```
id

user_id

entity_type

entity_id

operation

request_id

payload

created_at
```

Never updated.

Append only.

---

# refresh_tokens

```
id

user_id

token_hash

expires_at

created_at

revoked_at
```

Never store

Plain refresh tokens.

Store only

Hashed tokens.

---

# collaboration_presence

Redis only.

```
diagram_id

↓

user_id

↓

presence
```

TTL

```
60 seconds
```

---

# collaboration_rooms

Redis

```
room

↓

connected sockets

↓

metadata
```

---

# Entity Relationships

```
Project

1:N

Diagram

Diagram

1:N

Version

Version

1:N

Table

Table

1:N

Column

Version

1:N

Relationship

Version

1:N

Note
```

---

# Foreign Keys

```
projects.owner_id

→ users.id

diagrams.project_id

→ projects.id

versions.diagram_id

→ diagrams.id

tables.version_id

→ versions.id

columns.table_id

→ tables.id

relationships.version_id

→ versions.id

notes.version_id

→ versions.id
```

All FK constraints

Enabled.

---

# Cascade Rules

Delete Project

↓

Soft delete

Diagrams

↓

Soft delete

Versions

↓

Soft delete

Objects

Published history

Never physically removed.

---

# Soft Delete Strategy

Every major table owns

```
deleted_at
```

Queries

Always filter

```
deleted_at IS NULL
```

Cleanup job

Future.

---

# Review State Storage

Never computed.

Persisted.

```
UNCHANGED

CREATED

MODIFIED

DELETED
```

Allows

Fast review screens.

---

# Version Storage

Published versions

Immutable.

Draft versions

Mutable.

Never update

Published rows.

---

# Object Lineage

Each object owns

```
lineage_id
```

Example

```
Version 1

Users

↓

Version 2

Users

↓

Version 3

Users
```

Different object IDs.

Same lineage.

---

# Revision Numbers

Each draft owns

```
revision_number
```

Incremented

On every mutation.

Used for

Optimistic concurrency.

---

# Database Transactions

Every mutation

Uses

Prisma transaction.

Example

```
Rename Table

↓

Update Review State

↓

Update Revision

↓

Audit Log

↓

Commit
```

---

# Redis Usage

Store

```
Presence

Room Metadata

Socket Sessions

Rate Limits

Temporary Locks
```

Never

Schema.

---

# Search Strategy

Phase 1

Use PostgreSQL

```
ILIKE

+

pg_trgm
```

Future

```
OpenSearch
```

---

# Full Text Search

Indexes

```
Project Name

Diagram Name

Table Name

Column Name

Note Markdown
```

---

# Index Strategy

High-frequency indexes

```
owner_id

project_id

diagram_id

version_id

lineage_id

updated_at

deleted_at
```

Avoid

Over-indexing.

---

# JSON Columns

Allowed only for

```
Audit Payload

Future Settings

Future Preferences
```

Never store

Schema

As JSON.

---

# Large Objects

Future

Exports

Images

Attachments

Stored

Outside PostgreSQL.

Reference only

Stored in DB.

---

# Migration Strategy

Every schema change

Uses

Prisma Migrations.

Never modify

Production DB manually.

---

# Seed Data

Development

Creates

```
Demo User

Demo Project

Demo Diagram

Demo Version

Sample Tables
```

Useful

For onboarding.

---

# Backup Strategy

Daily

PostgreSQL backups.

Retention

```
30 days
```

Future

Point-in-time recovery.

---

# Performance Targets

```
Load Diagram

<250ms

Insert Table

<50ms

Publish

<500ms

Search

<50ms
```

---

# Database Constraints

Enforce

```
Foreign Keys

Unique Email

Positive Zoom

Valid Review State

Version Status Enum
```

Business validation

Still occurs

In services.

---

# Monitoring

Track

```
Slow Queries

Deadlocks

Connection Pool

Transaction Time

Cache Hit Ratio
```

---

# Connection Pool

Prisma

```
20 Connections

Default
```

Configurable

Per environment.

---

# Acceptance Criteria

- Fully normalized schema
- Referential integrity enforced
- Published versions immutable
- Draft revisions supported
- Lineage IDs implemented
- Redis separated from PostgreSQL
- Search indexes created
- Soft delete implemented
- Transactions enforced
- Prisma migrations used
- Backup strategy defined
- Performance targets documented

---

# End of Document

Continue with

```
Projects/schemaFlow/docs/backend/

11-api-contracts.md
```