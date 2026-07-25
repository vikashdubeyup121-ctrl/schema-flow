# File

Projects/schemaFlow/docs/backend/03-project-service.md

---

# Project Service Engineering Specification

**Document:** 03-project-service.md

**Project:** SchemaFlow

---

# Purpose

The Project Service is responsible for managing user projects.

A Project is the top-level container.

Hierarchy

```
User

↓

Projects

↓

Diagrams

↓

Versions

↓

Schema
```

A project never directly owns schema objects.

Schema objects belong to diagrams.

---

# Responsibilities

Owns

- Project CRUD
- Project Metadata
- Project Search
- Project Listing
- Soft Delete
- Ownership Validation
- Sharing (Future)

Does NOT own

- Diagrams
- Tables
- Columns
- Relationships
- Notes

---

# High Level Flow

```
HTTP Request

↓

Project Controller

↓

Project Service

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

project/

├── controller/
│   └── project.controller.ts
│
├── service/
│   └── project.service.ts
│
├── repository/
│   └── project.repository.ts
│
├── dto/
│   ├── createProject.dto.ts
│   ├── updateProject.dto.ts
│   └── project.response.ts
│
├── validator/
│   └── project.validator.ts
│
├── mapper/
│   └── project.mapper.ts
│
├── routes/
│   └── project.routes.ts
│
├── types/
│
├── tests/
│
└── index.ts
```

---

# Project Domain Model

```ts
export interface Project {

    id: string;

    ownerId: string;

    name: string;

    description?: string;

    createdAt: Date;

    updatedAt: Date;

}
```

Future

```
Archived

OrganizationId

Visibility

Tags

Favorite
```

---

# Database Table

```
projects

-------------------------

id

owner_id

name

description

created_at

updated_at

deleted_at
```

Soft delete

Uses

```
deleted_at
```

---

# Indexes

```
PRIMARY KEY (id)

INDEX(owner_id)

INDEX(created_at)

INDEX(updated_at)

INDEX(deleted_at)
```

Future

```
GIN(name)
```

For full-text search.

---

# Repository Interface

```ts
interface ProjectRepository {

    create()

    update()

    delete()

    findById()

    findByOwner()

    exists()

}
```

Repository never

Performs validation.

---

# Controller Endpoints

```
POST

/api/v1/projects

GET

/api/v1/projects

GET

/api/v1/projects/:id

PATCH

/api/v1/projects/:id

DELETE

/api/v1/projects/:id
```

---

# Create Project

Input

```json
{
    "name": "Backend Redesign"
}
```

Validation

- Required
- Trim whitespace
- Maximum length
- User authenticated

---

# Create Flow

```
Validate

↓

Auth Check

↓

Create Project

↓

Return Project
```

---

# Default Values

Description

↓

Empty

Project

Created

Immediately.

No default diagrams.

---

# Create Response

```json
{
    "success": true,
    "data": {
        "id": "...",
        "name": "...",
        "createdAt": "..."
    }
}
```

---

# Get Projects

Returns

Projects

Owned

By authenticated user.

Never

Return

Deleted projects.

---

# Pagination

Phase 1

Offset pagination.

```http
GET

/projects?page=1&limit=20
```

Future

Cursor pagination.

---

# Sorting

Supported

```
Recently Updated

Recently Created

Alphabetical
```

Default

Recently Updated.

---

# Search

Supported

```
Project Name
```

Case insensitive.

Future

Description

Tags.

---

# Get Single Project

Flow

```
Load

↓

Ownership Check

↓

Return
```

404

If project

Not found.

403

If not owner.

---

# Rename Project

Supports

```
PATCH

/projects/:id
```

Update fields

```
name

description
```

Validation

Before update.

---

# Delete Project

Delete

Never

Removes data immediately.

Instead

```
deleted_at

↓

Timestamp
```

Future

Permanent cleanup

Job.

---

# Delete Cascade

Deleting project

Soft deletes

```
Diagrams

↓

Versions

↓

Drafts
```

Schema remains

Recoverable.

---

# Restore Project

Future

Support

```
Restore

↓

deleted_at = NULL
```

---

# Ownership Validation

Every operation

Checks

```
project.owner_id

==

request.user.id
```

No exceptions.

---

# Duplicate Name

Allowed.

Users

May have

```
Project

Project

Project
```

IDs differentiate.

---

# Limits

Phase 1

Maximum

```
100 Projects

Per User
```

Configurable.

---

# Events

Project service

Publishes

```
ProjectCreated

ProjectUpdated

ProjectDeleted
```

Future

Analytics

Notifications.

---

# Caching

Project list

Cached

Briefly

In Redis.

Invalidate

On

```
Create

Update

Delete
```

---

# Transactions

Project deletion

Uses

Transaction.

```
Project

↓

Diagrams

↓

Versions

↓

Commit
```

---

# Error Handling

Possible Errors

```
Project Not Found

Unauthorized

Validation Error

Duplicate ID

Database Failure
```

Return

Standard API format.

---

# Logging

Log

```
Project Created

Project Updated

Project Deleted
```

Include

```
Project ID

User ID

Request ID
```

---

# Metrics

Track

```
Projects Created

Projects Deleted

Average Projects/User

API Latency
```

Future

Dashboard.

---

# Performance Targets

```
Create

<100ms

List

<50ms

Update

<100ms

Delete

<150ms
```

---

# Testing

Unit Tests

- Create
- Rename
- Delete
- Ownership
- Validation

Integration Tests

- CRUD
- Pagination
- Search
- Authorization

Database Tests

- Soft Delete
- Transactions
- Index Usage

---

# Acceptance Criteria

- Project CRUD complete
- Soft delete implemented
- Ownership enforced
- Pagination supported
- Search implemented
- Standard responses
- Transactions implemented
- Redis cache integrated
- Metrics emitted
- Lint passes
- TypeScript passes
- Unit tests pass

---

# End of Document

Continue with

```
Projects/schemaFlow/docs/backend/

04-diagram-service.md
```