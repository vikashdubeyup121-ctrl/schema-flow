# File

Projects/schemaFlow/docs/architecture/09-publish-sequence.md

---

# Publish Sequence Engineering Specification

**Document:** 09-publish-sequence.md

**Project:** SchemaFlow

**Version:** Phase 1

---

# Purpose

Publishing is the most critical operation in SchemaFlow.

Unlike normal save operations, publishing creates an immutable snapshot of the current draft while preserving complete history.

Publishing must satisfy the following guarantees:

- Atomic
- Consistent
- Isolated
- Durable
- Idempotent
- Recoverable

If any step fails, nothing should be published.

---

# Publish Overview

```
Published Version (V4)

↓

Create Draft

↓

Edit Draft

↓

Review

↓

Validate

↓

Publish

↓

Published Version (V5)

↓

Fresh Draft
```

Only the Draft is editable.

Published versions never change.

---

# Actors

```
User

↓

Frontend

↓

Backend API

↓

Publish Service

↓

Schema Service

↓

Version Service

↓

Database

↓

Redis

↓

WebSocket Gateway
```

---

# High-Level Publish Sequence

```
User

↓

Publish Button

↓

Review Dialog

↓

Publish Request

↓

Validation

↓

Transaction

↓

Clone Schema

↓

Create Version

↓

Update Diagram

↓

Audit Log

↓

Commit

↓

Broadcast

↓

Refresh Client
```

---

# Publish Preconditions

Publishing is allowed only if

- User is authenticated
- User owns the project
- Diagram exists
- Draft exists
- Draft revision is current
- Validation passes
- No publish currently running

---

# Validation Pipeline

```
Duplicate Tables

↓

Duplicate Columns

↓

Broken Relationships

↓

Missing Primary Keys

↓

Invalid Datatypes

↓

Circular References (future)

↓

Validation Passed
```

Any failure aborts the publish.

---

# Frontend Flow

```
Publish Click

↓

Fetch Review Summary

↓

Confirmation Dialog

↓

POST /publish

↓

Disable Publish Button

↓

Show Progress

↓

Receive Success

↓

Reload Workspace
```

---

# Publish API

```
POST

/api/v1/versions/:versionId/publish
```

Request

```json
{
    "revision": 42
}
```

Response

```json
{
    "success": true,
    "data": {
        "publishedVersion": 5,
        "newDraftVersion": 6
    }
}
```

---

# Backend Publish Flow

```
Receive Request

↓

Authenticate

↓

Authorize

↓

Load Draft

↓

Validate

↓

Begin Transaction

↓

Create Published Version

↓

Copy Schema

↓

Update Diagram Pointer

↓

Create Audit Log

↓

Create Fresh Draft

↓

Commit

↓

Emit Events

↓

Return Response
```

---

# Transaction Scope

The following operations occur inside **one database transaction**.

```
Create Published Version

↓

Copy Tables

↓

Copy Columns

↓

Copy Relationships

↓

Copy Notes

↓

Update Diagram

↓

Insert Audit Log

↓

Create Draft

↓

Commit
```

No external calls occur inside the transaction.

---

# Draft Promotion

Current State

```
Published V4

Draft V5
```

After Publish

```
Published V5

Draft V6
```

V5 becomes immutable.

V6 becomes editable.

---

# Review State Reset

During draft creation

Every object changes

```
CREATED

↓

UNCHANGED

MODIFIED

↓

UNCHANGED

DELETED

↓

Removed
```

The new draft starts clean.

---

# Object Copy Strategy

Published Version

```
Tables

Columns

Relationships

Notes
```

Copied using

```
lineage_id
```

Every copied object receives

- New object ID
- Same lineage ID

---

# Version Number Allocation

Current

```
Version 5
```

Publish

↓

Next

```
Version 6
```

Numbers are sequential.

They are never reused.

---

# Diagram Update

Diagram record changes

```
published_version_id

↓

newVersionId

draft_version_id

↓

newDraftId
```

This update occurs only after all copies succeed.

---

# Audit Logging

One audit entry is created.

```json
{
    "operation": "PUBLISH_VERSION",
    "diagramId": "...",
    "version": 5
}
```

Audit logging is transactional.

---

# Domain Events

After commit

Publish Service emits

```
VersionPublished

↓

DraftCreated

↓

ReviewCleared
```

Events are emitted only after the transaction commits.

---

# WebSocket Broadcast

Connected collaborators receive

```json
{
    "type": "VERSION_PUBLISHED",
    "payload": {
        "version": 5
    }
}
```

Clients reload automatically.

---

# Collaboration Behavior

If multiple users are editing

```
Publish

↓

Broadcast

↓

Reload Draft

↓

Continue Editing
```

The new draft becomes the shared editing target.

---

# Failure Scenarios

## Validation Failure

```
Publish

↓

Validation Failed

↓

Return 422

↓

Stay in Draft
```

---

## Database Failure

```
Publish

↓

Transaction Error

↓

Rollback

↓

Return 500
```

No partial version exists.

---

## Revision Conflict

```
Revision Mismatch

↓

409 Conflict

↓

Reload Draft

↓

Retry Publish
```

---

# Idempotency

Publish supports

```
Idempotency-Key
```

Duplicate requests

Return the same result.

Never publish twice.

---

# Performance Optimizations

Instead of copying object-by-object

Use

```
Batch Inserts

↓

Bulk Copy

↓

Single Transaction
```

Minimize database round trips.

---

# Metrics

Track

```
Publish Duration

Validation Time

Objects Copied

Failures

Retries

Average Version Size
```

---

# Logging

Log

```
Publish Requested

Validation Complete

Transaction Started

Transaction Committed

Events Emitted

Publish Completed
```

Include

```
User ID

Diagram ID

Version Number

Revision

Latency
```

---

# Performance Targets

| Operation | Target |
|------------|---------|
| Validation | <100 ms |
| Copy Objects | <250 ms |
| Transaction | <400 ms |
| Publish API | <500 ms |
| Client Reload | <2 s |

---

# Testing

Unit Tests

- Validation
- Version creation
- Draft creation
- Review reset
- Event emission

Integration Tests

- Successful publish
- Validation failure
- Rollback
- Concurrent publish
- Idempotency

Performance Tests

- 500 tables
- 20,000 objects
- Publish under load

---

# Acceptance Criteria

- Atomic publish transaction
- Immutable published versions
- Fresh draft automatically created
- Review state reset
- Audit log generated
- Domain events emitted
- Collaboration notified
- Idempotency supported
- Rollback on failure
- Performance targets achieved

---

# End of Document

Continue with

```
Projects/schemaFlow/docs/architecture/

10-disaster-recovery.md
```