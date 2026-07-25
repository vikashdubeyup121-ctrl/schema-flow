# File

Projects/schemaFlow/docs/backend/01-backend-foundation.md

---

# Backend Foundation Engineering Specification

**Document:** 01-backend-foundation.md

**Project:** SchemaFlow

**Backend Stack**

- Node.js
- TypeScript
- Fastify
- PostgreSQL
- Prisma ORM
- Redis
- Socket.IO
- Google OAuth
- JWT
- Docker
- Google Cloud Run (Future)

---

# Purpose

The backend is responsible for

- Authentication
- Project Management
- Diagram Management
- Schema Storage
- Review Workflow
- Versioning
- Collaboration
- Autosave
- Import / Export
- Search
- Authorization

The backend is **not** responsible for

- Rendering
- UI
- Canvas
- Geometry
- DSL Editing

---

# High Level Architecture

```
                     Browser

                        │

                        ▼

                Fastify API Gateway

         ┌──────────────┼──────────────┐

         ▼              ▼              ▼

 Authentication     REST APIs      WebSocket

         │              │              │

         └──────────────┼──────────────┘

                        ▼

                 Application Layer

                        │

        ┌───────────────┼────────────────┐

        ▼               ▼                ▼

   Project Service   Diagram Service   Review Service

        ▼               ▼                ▼

        └───────────────┼────────────────┘

                        ▼

                 Repository Layer

                        ▼

                  PostgreSQL

                        │

             ┌──────────┴──────────┐

             ▼                     ▼

           Redis             Object Storage
```

---

# Backend Principles

Every request follows

```
HTTP Request

↓

Controller

↓

Validation

↓

Service

↓

Repository

↓

Database

↓

Mapper

↓

Response
```

Never skip layers.

---

# Folder Structure

```
backend/

src/

├── app/
│
├── config/
│
├── common/
│
├── modules/
│
├── middleware/
│
├── plugins/
│
├── infrastructure/
│
├── websocket/
│
├── jobs/
│
├── scripts/
│
├── types/
│
├── utils/
│
├── tests/
│
└── server.ts
```

---

# Module Structure

Every module follows

```
modules/

project/

├── controller/
│
├── service/
│
├── repository/
│
├── dto/
│
├── mapper/
│
├── validator/
│
├── routes/
│
├── types/
│
├── errors/
│
├── tests/
│
└── index.ts
```

Every module looks identical.

---

# Layer Responsibilities

## Controller

Responsible for

- HTTP
- Status Codes
- DTO Parsing
- Validation Trigger
- Response Mapping

Never

Contains business logic.

---

## Service

Owns

Business logic.

Responsible for

- Validation
- Transactions
- Commands
- Events
- Rules

Never

Returns Prisma models.

---

## Repository

Responsible only for

Persistence.

Methods

```
findById()

create()

update()

delete()

findMany()
```

Never

Business logic.

---

## Mapper

Converts

```
Database

↓

Domain

↓

Response DTO
```

Never expose

Database schema.

---

# Domain Model

The Service Layer only works with

Domain Models.

Never

Database Models.

Example

```
Prisma

↓

Mapper

↓

Project

↓

Service
```

---

# Request Flow

```
Browser

↓

JWT

↓

Fastify Route

↓

Authentication

↓

Validation

↓

Controller

↓

Service

↓

Repository

↓

Database

↓

Mapper

↓

JSON
```

---

# Configuration

```
config/

app.ts

auth.ts

database.ts

redis.ts

socket.ts

review.ts

storage.ts

logger.ts
```

Each config

Single responsibility.

---

# Environment Variables

```
PORT

DATABASE_URL

REDIS_URL

JWT_SECRET

GOOGLE_CLIENT_ID

GOOGLE_CLIENT_SECRET

GOOGLE_CALLBACK_URL

COOKIE_SECRET

NODE_ENV
```

Future

```
S3_BUCKET

PUBSUB

METRICS
```

---

# Error Handling

Centralized.

```
Throw

↓

Global Error Handler

↓

JSON Response
```

Never

Catch errors

Inside every controller.

---

# Error Model

```ts
interface ApiError {

    code: string;

    message: string;

    details?: unknown;

}
```

---

# HTTP Response Format

Every endpoint returns

Success

```json
{
  "success": true,
  "data": {}
}
```

Failure

```json
{
  "success": false,
  "error": {
    "code": "...",
    "message": "..."
  }
}
```

Never

Return raw exceptions.

---

# Logging

Every request

Logs

```
Request ID

Method

Path

Latency

Status

User ID
```

Never

Log

JWT

Passwords

Secrets.

---

# Request ID

Every request gets

```
UUID
```

Propagated

Across

- Logs
- WebSocket
- Jobs
- Events

Useful

For debugging.

---

# Validation

Every request

Validated

Before controller.

Libraries

```
Zod
```

Validation

Never

Inside service.

---

# Dependency Injection

Services

Receive

Repositories.

Repositories

Receive

Prisma.

Avoid

Global singletons.

---

# Transactions

Every multi-table operation

Uses

Prisma Transaction.

Example

```
Create Diagram

↓

Create Version

↓

Create Root Schema

↓

Commit
```

Rollback

If anything fails.

---

# Background Jobs

Future

Jobs

```
Autosave Cleanup

Export

Import

Email

Analytics
```

Run outside

Request lifecycle.

---

# Redis Usage

Phase 1

Redis stores

```
Socket Sessions

Rate Limits

Temporary Presence

Draft Locks

Refresh Tokens (optional)
```

Never

Primary data.

---

# Security

Always

- Helmet
- CORS
- CSRF (cookie auth)
- Rate limiting
- Input validation
- SQL injection prevention
- XSS-safe responses

---

# API Versioning

All APIs

Prefixed

```
/api/v1
```

Future

```
/api/v2
```

---

# Health Endpoints

```
GET

/health
```

Returns

```
API

Database

Redis

Version
```

---

# Readiness Endpoint

```
GET

/ready
```

Checks

```
Database

Redis
```

Used

By Kubernetes

Future.

---

# Graceful Shutdown

On SIGTERM

```
Stop Accepting Requests

↓

Close WebSockets

↓

Finish Requests

↓

Close Database

↓

Exit
```

No data loss.

---

# Performance Targets

```
P95 API

<150ms

Simple Reads

<50ms

Authentication

<100ms

Create Diagram

<200ms
```

---

# Testing

Unit Tests

- Services
- Validators
- Mappers

Integration Tests

- Routes
- Database
- Transactions

E2E

- Login
- Create Project
- Create Diagram
- Publish

---

# Acceptance Criteria

- Layered architecture
- Modules isolated
- DTO validation
- Global error handler
- Standard response format
- Transactions supported
- Logging implemented
- Health endpoints implemented
- Graceful shutdown implemented
- Lint passes
- TypeScript passes
- Tests pass

---

# End of Document

Continue with

```
Projects/schemaFlow/docs/backend/

02-authentication.md
```