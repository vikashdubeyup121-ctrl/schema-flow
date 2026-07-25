# File

Projects/schemaFlow/docs/backend/11-api-contracts.md

---

# API Contracts Engineering Specification

**Document:** 11-api-contracts.md

**Project:** SchemaFlow

---

# Purpose

This document defines every public API exposed by the backend.

It serves as the contract between

- Frontend
- Backend
- Future Mobile Clients
- CLI
- Integrations

Every endpoint must be

- Versioned
- Typed
- Idempotent where applicable
- Documented
- Tested

---

# API Principles

REST is used for

- CRUD
- Authentication
- Versioning
- Import / Export
- Metadata

WebSockets are used for

- Collaboration
- Presence
- Cursor updates
- Live operations

---

# Base URL

```
/api/v1
```

Example

```
https://api.schemaflow.app/api/v1
```

---

# Authentication

Protected APIs require

```
Authorization

Bearer <JWT>
```

Refresh Token

Stored

HttpOnly Cookie.

---

# Standard Success Response

```json
{
  "success": true,
  "data": {}
}
```

---

# Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "PROJECT_NOT_FOUND",
    "message": "Project does not exist"
  }
}
```

---

# HTTP Status Codes

| Status | Meaning |
|---------|----------|
|200|Success|
|201|Created|
|204|No Content|
|400|Validation Error|
|401|Unauthenticated|
|403|Forbidden|
|404|Not Found|
|409|Conflict|
|422|Semantic Validation Failed|
|429|Rate Limited|
|500|Internal Server Error|

---

# Authentication APIs

---

## Google Login

```
GET

/api/v1/auth/google
```

Response

```
302 Redirect
```

---

## OAuth Callback

```
GET

/api/v1/auth/google/callback
```

Response

```json
{
    "success": true,
    "data": {

        "accessToken": "...",

        "user": {

            "id": "...",

            "email": "...",

            "name": "...",

            "pictureUrl": "..."

        }

    }
}
```

---

## Current User

```
GET

/api/v1/auth/me
```

---

## Refresh

```
POST

/api/v1/auth/refresh
```

---

## Logout

```
POST

/api/v1/auth/logout
```

---

# Project APIs

---

## Create Project

```
POST

/api/v1/projects
```

Request

```json
{
    "name": "Inventory System"
}
```

Response

```json
{
    "success": true,
    "data": {

        "id": "...",

        "name": "Inventory System"

    }
}
```

---

## List Projects

```
GET

/api/v1/projects
```

Query Parameters

```
page

limit

search

sort
```

---

## Get Project

```
GET

/api/v1/projects/:projectId
```

---

## Update Project

```
PATCH

/api/v1/projects/:projectId
```

---

## Delete Project

```
DELETE

/api/v1/projects/:projectId
```

Soft delete.

---

# Diagram APIs

---

## Create Diagram

```
POST

/api/v1/projects/:projectId/diagrams
```

---

## List Diagrams

```
GET

/api/v1/projects/:projectId/diagrams
```

---

## Get Diagram

```
GET

/api/v1/diagrams/:diagramId
```

---

## Update Diagram

```
PATCH

/api/v1/diagrams/:diagramId
```

---

## Delete Diagram

```
DELETE

/api/v1/diagrams/:diagramId
```

---

## Save Viewport

```
PATCH

/api/v1/diagrams/:diagramId/viewport
```

Request

```json
{
    "x": 124,

    "y": -540,

    "zoom": 1.2
}
```

---

# Schema APIs

---

## Load Schema

```
GET

/api/v1/versions/:versionId/schema
```

Response

```json
{

    "success": true,

    "data": {

        "tables": [],

        "relationships": [],

        "notes": []

    }

}
```

---

## Apply Operations

```
POST

/api/v1/versions/:versionId/operations
```

Request

```json
{

    "revision": 14,

    "operations": [

        {

            "id":"uuid",

            "type":"CREATE_TABLE",

            "payload": {}

        }

    ]

}
```

Response

```json
{

    "success": true,

    "data": {

        "revision":15

    }

}
```

---

## Batch Operations

Supports

```
Paste

Duplicate

Import
```

Maximum

```
500 Operations
```

Per request.

---

# Version APIs

---

## Create Draft

```
POST

/api/v1/diagrams/:diagramId/draft
```

---

## Publish

```
POST

/api/v1/versions/:versionId/publish
```

---

## Discard Draft

```
DELETE

/api/v1/versions/:versionId/draft
```

---

## Review Summary

```
GET

/api/v1/versions/:versionId/review
```

---

## Version History

```
GET

/api/v1/diagrams/:diagramId/versions
```

---

# Import APIs

---

## Import DBML

```
POST

/api/v1/import/dbml
```

Multipart Form

```
file
```

Response

Import Preview.

---

## Import JSON

```
POST

/api/v1/import/schemaflow
```

---

# Export APIs

---

## Export DBML

```
GET

/api/v1/export/dbml/:versionId
```

---

## Export JSON

```
GET

/api/v1/export/schemaflow/:versionId
```

---

## Export SVG

```
GET

/api/v1/export/svg/:versionId
```

---

## Export PNG

```
GET

/api/v1/export/png/:versionId
```

Future

Async export jobs.

---

# Search APIs

---

## Workspace Search

```
GET

/api/v1/search
```

Query

```
q

diagramId

limit
```

Response

```json
{

    "results":[

        {

            "type":"TABLE",

            "id":"...",

            "title":"Users"

        }

    ]

}
```

---

# Health APIs

```
GET

/health
```

```
GET

/ready
```

---

# Rate Limits

Authentication

```
20/minute
```

CRUD

```
300/minute
```

Search

```
120/minute
```

Import

```
10/minute
```

Export

```
20/minute
```

---

# WebSocket Events

Client → Server

```
JOIN_DIAGRAM

LEAVE_DIAGRAM

COMMAND

CURSOR_MOVE

SELECTION_CHANGE

VIEWPORT_CHANGE

PING
```

---

Server → Client

```
USER_JOINED

USER_LEFT

REMOTE_COMMAND

CURSOR_UPDATED

SELECTION_UPDATED

VIEWPORT_UPDATED

ACK

ERROR

PONG
```

---

# Operation Contract

```ts
interface OperationEnvelope {

    id: string;

    revision: number;

    type: string;

    payload: unknown;

    timestamp: number;

}
```

Every mutation

Uses

Same envelope.

---

# Pagination Contract

```json
{

    "data":[

    ],

    "pagination":{

        "page":1,

        "limit":20,

        "total":54

    }

}
```

---

# Idempotency

Supported

For

```
Create Project

Create Diagram

Import
```

Using

```
Idempotency-Key
```

Header.

Future

All mutations.

---

# Validation Errors

Example

```json
{

  "success": false,

  "error": {

      "code":"VALIDATION_ERROR",

      "fields":[

          {

              "field":"name",

              "message":"Required"

          }

      ]

  }

}
```

---

# API Versioning Strategy

```
/api/v1

↓

/api/v2
```

Old versions

Supported

Until deprecation.

---

# OpenAPI

Every endpoint

Documented

Using

```
OpenAPI 3.1
```

Generate

```
Swagger UI

TypeScript SDK

Postman Collection
```

Automatically.

---

# Performance Targets

```
Read APIs

<50ms

Create APIs

<100ms

Schema Load

<250ms

Publish

<500ms
```

---

# Testing

Contract Tests

- Authentication
- CRUD
- Import
- Export
- Review
- Collaboration

OpenAPI Validation

- Schema correctness
- Required fields
- Examples

Integration

- Frontend compatibility

---

# Acceptance Criteria

- Consistent response envelope
- Standard HTTP codes
- Versioned APIs
- Pagination standardized
- Batch operations supported
- Idempotency supported
- OpenAPI generated
- Contract tests implemented
- Type-safe DTOs
- Lint passes
- TypeScript passes
- Tests pass

---

# End of Document

Continue with

```
Projects/schemaFlow/docs/backend/

12-deployment.md
```