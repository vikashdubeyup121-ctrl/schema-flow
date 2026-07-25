# File

Projects/schemaFlow/docs/backend/04-diagram-service.md

---

# Diagram Service Engineering Specification

**Document:** 04-diagram-service.md

**Project:** SchemaFlow

---

# Purpose

The Diagram Service manages diagrams within a project.

A project may contain multiple diagrams.

Examples

```
Project

Backend System

↓

ER Diagram

↓

Microservice Diagram

↓

Billing Schema

↓

Audit Database
```

Each diagram is an independent workspace with its own

- Draft
- Published Version
- Review State
- Canvas Viewport
- Collaboration Session

---

# Responsibilities

Owns

- Diagram CRUD
- Diagram Metadata
- Draft Creation
- Viewport Persistence
- Active Version
- Review Status
- Autosave Metadata

Does NOT own

- Tables
- Columns
- Relationships
- Notes
- Collaboration Messages

---

# High-Level Architecture

```
Request

↓

Diagram Controller

↓

Diagram Service

↓

Version Service

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

diagram/

├── controller/
│   └── diagram.controller.ts
│
├── service/
│   ├── diagram.service.ts
│   ├── viewport.service.ts
│   └── draft.service.ts
│
├── repository/
│   └── diagram.repository.ts
│
├── dto/
│   ├── createDiagram.dto.ts
│   ├── updateDiagram.dto.ts
│   ├── viewport.dto.ts
│   └── diagram.response.ts
│
├── mapper/
│   └── diagram.mapper.ts
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

# Domain Model

```ts
export interface Diagram {

    id: string;

    projectId: string;

    name: string;

    description?: string;

    latestPublishedVersionId: string | null;

    activeDraftVersionId: string | null;

    createdAt: Date;

    updatedAt: Date;

}
```

---

# Viewport Model

```ts
export interface DiagramViewport {

    zoom: number;

    x: number;

    y: number;

}
```

This stores

User's last camera position.

---

# Database Table

```
diagrams

---------------------------------

id

project_id

name

description

latest_published_version_id

active_draft_version_id

viewport_x

viewport_y

viewport_zoom

created_at

updated_at

deleted_at
```

---

# Relationships

```
Project

1

↓

N

Diagram
```

```
Diagram

1

↓

N

Versions
```

---

# Indexes

```
PRIMARY KEY(id)

INDEX(project_id)

INDEX(updated_at)

INDEX(deleted_at)
```

---

# Repository

```ts
interface DiagramRepository {

    create()

    update()

    delete()

    findById()

    findByProject()

    saveViewport()

}
```

---

# REST Endpoints

```
POST

/api/v1/projects/:projectId/diagrams

GET

/api/v1/projects/:projectId/diagrams

GET

/api/v1/diagrams/:diagramId

PATCH

/api/v1/diagrams/:diagramId

DELETE

/api/v1/diagrams/:diagramId
```

---

# Create Diagram

Input

```json
{
    "name": "Billing Schema"
}
```

---

# Create Pipeline

```
Validate

↓

Project Exists

↓

Ownership Check

↓

Create Diagram

↓

Create Version 1

↓

Create Draft

↓

Return
```

Every diagram starts with

```
Version 1

Published
```

and

```
Draft Version
```

---

# Default Diagram State

Immediately after creation

```
Tables

0

Columns

0

Relationships

0

Notes

0
```

Viewport

```
Zoom = 1

X = 0

Y = 0
```

---

# List Diagrams

Returns

```
Diagram Name

Updated At

Last Published Version

Review Status

Object Count
```

Future

Thumbnail.

---

# Get Diagram

Returns

```
Diagram

+

Current Draft

+

Viewport

+

Review Summary
```

Does NOT return

Collaboration data.

---

# Rename Diagram

Supports

```
PATCH

/diagrams/:id
```

Updates

```
Name

Description
```

Validation

- Required
- Trim
- Max Length

---

# Delete Diagram

Soft delete.

```
deleted_at

↓

Timestamp
```

Never permanently delete.

---

# Delete Cascade

Soft delete

```
Versions

↓

Drafts

↓

Review Metadata
```

---

# Viewport Persistence

Whenever user stops moving canvas

Frontend calls

```
PATCH

/diagrams/:id/viewport
```

Payload

```json
{
    "x": 1240,
    "y": -420,
    "zoom": 1.2
}
```

---

# Viewport Service

Responsibilities

- Save viewport
- Restore viewport
- Validate zoom range

---

# Zoom Constraints

Allowed

```
0.1

↓

4.0
```

Reject

Outside range.

---

# Diagram Metadata

Stores

```
Created By

Created At

Updated At

Object Counts

Current Version
```

Future

```
Last Reviewer

Published By
```

---

# Ownership Validation

Every request verifies

```
Diagram

↓

Project

↓

Owner

↓

Authenticated User
```

---

# Draft Detection

Every diagram

May have

```
No Draft

↓

Published Only

or

Draft Exists
```

Frontend displays

Review badge.

---

# Autosave Metadata

Diagram stores

```
Last Autosave

Last Published

Dirty Flag
```

Used by

Status Bar.

---

# Object Counts

Diagram summary caches

```
Table Count

Column Count

Relationship Count

Note Count
```

Updated asynchronously.

Avoid expensive queries.

---

# Search

Supports

```
Diagram Name
```

Future

Description

Tags.

---

# Cache

Redis caches

```
Diagram Metadata

Viewport

Summary
```

Invalidated

On update.

---

# Events

Diagram Service emits

```
DiagramCreated

DiagramUpdated

DiagramDeleted

ViewportUpdated
```

---

# Transactions

Diagram creation

Uses transaction.

```
Create Diagram

↓

Create Version

↓

Create Draft

↓

Commit
```

---

# Error Handling

Possible Errors

```
Project Not Found

Diagram Not Found

Unauthorized

Invalid Viewport

Validation Failure
```

---

# Logging

Log

```
Diagram Created

Diagram Updated

Viewport Saved

Diagram Deleted
```

Include

```
Diagram ID

Project ID

User ID

Request ID
```

---

# Performance Targets

```
Create Diagram

<150ms

Load Diagram

<200ms

Viewport Save

<50ms

Rename

<80ms
```

---

# Testing

Unit Tests

- Create Diagram
- Rename
- Delete
- Save Viewport
- Ownership

Integration Tests

- CRUD
- Transactions
- Viewport
- Summary

Database Tests

- Soft Delete
- Indexes
- Cascade

---

# Acceptance Criteria

- Diagram CRUD complete
- Viewport persistence implemented
- Default version created
- Draft initialized
- Ownership enforced
- Soft delete implemented
- Object counts cached
- Transactions implemented
- Events emitted
- Lint passes
- TypeScript passes
- Unit tests pass

---

# End of Document

Continue with

```
Projects/schemaFlow/docs/backend/

05-schema-service.md
```