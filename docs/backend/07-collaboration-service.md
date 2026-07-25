# File

Projects/schemaFlow/docs/backend/07-collaboration-service.md

---

# Collaboration Service Engineering Specification

**Document:** 07-collaboration-service.md

**Project:** SchemaFlow

---

# Purpose

The Collaboration Service enables multiple users to edit the same draft diagram simultaneously.

For Phase 1, the target is:

- Up to 10 concurrent users per diagram
- Last Write Wins conflict resolution
- Live cursor sharing
- Presence
- Selection synchronization
- Command synchronization
- Automatic reconnection

The backend never synchronizes ReactFlow objects.

It synchronizes **domain operations**.

---

# Responsibilities

Owns

- WebSocket lifecycle
- Presence management
- Diagram rooms
- Operation broadcasting
- ACK handling
- Revision validation
- Operation ordering
- Heartbeats
- Connection recovery

Does NOT own

- Authentication logic
- Schema persistence
- Rendering
- Review workflow
- Undo history

---

# High Level Architecture

```
Browser

↓

Socket.IO Gateway

↓

Authentication

↓

Room Manager

↓

Operation Dispatcher

↓

Schema Service

↓

Database

↓

Broadcast

↓

Clients
```

---

# Folder Structure

```
modules/

collaboration/

├── gateway/
│   ├── collaboration.gateway.ts
│   ├── socketAuth.ts
│   └── socketEvents.ts
│
├── service/
│   ├── collaboration.service.ts
│   ├── room.service.ts
│   ├── presence.service.ts
│   ├── operation.service.ts
│   ├── revision.service.ts
│   └── heartbeat.service.ts
│
├── repository/
│   └── presence.repository.ts
│
├── dto/
│
├── types/
│
├── validator/
│
├── tests/
│
└── index.ts
```

---

# Connection Flow

```
Browser

↓

Socket Connect

↓

JWT Validation

↓

Load User

↓

Join Diagram Room

↓

Presence Broadcast

↓

Ready
```

---

# Authentication

Socket authentication

Uses

JWT.

Handshake

```
Authorization

Bearer JWT
```

Server validates

Before allowing

Connection.

---

# Socket Context

Every socket receives

```ts
interface SocketUser {

    socketId: string;

    userId: string;

    email: string;

}
```

Stored

In memory.

---

# Room Model

Every diagram

Creates one room.

```
diagram

↓

diagram_123
```

Users editing

The same diagram

Join

Same room.

---

# Room State

```ts
interface DiagramRoom {

    diagramId: string;

    users: Set<UserId>;

    sockets: Set<SocketId>;

}
```

---

# Presence Model

```ts
interface Presence {

    userId: string;

    name: string;

    avatarUrl: string;

    color: string;

    cursor: Point;

    viewport: Viewport;

    selectedObjects: string[];

    connectedAt: number;

}
```

Stored

In Redis

For fast lookup.

---

# Redis Structure

```
diagram_presence:

diagramId

↓

Hash

↓

userId

↓

Presence JSON
```

TTL

```
60 seconds
```

Refreshed

By heartbeat.

---

# Heartbeat

Every

```
30 seconds
```

Client sends

```
PING
```

Server replies

```
PONG
```

Missed heartbeat

↓

Disconnect.

---

# Presence Events

Client

↓

Server

```
CURSOR_MOVE

SELECTION_CHANGE

VIEWPORT_CHANGE
```

Server

↓

Clients

Broadcasts

Same events.

---

# Cursor Updates

Throttle

```
30 FPS
```

Never

Every mouse move.

---

# Selection Updates

Payload

```json
{
  "selectedObjectIds": [
    "...",
    "..."
  ]
}
```

Only broadcast

When changed.

---

# Viewport Updates

Future

Used for

```
Follow User
```

Phase 1

Store only.

---

# Operation Model

Every mutation

Sent as

```ts
interface CollaborationOperation {

    operationId: string;

    revision: number;

    userId: string;

    type: string;

    payload: unknown;

    timestamp: number;

}
```

---

# Supported Operations

```
CREATE_TABLE

UPDATE_TABLE

DELETE_TABLE

MOVE_TABLE

CREATE_COLUMN

UPDATE_COLUMN

DELETE_COLUMN

CREATE_RELATIONSHIP

DELETE_RELATIONSHIP

CREATE_NOTE

UPDATE_NOTE

DELETE_NOTE
```

---

# Operation Pipeline

```
Receive

↓

Authenticate

↓

Validate

↓

Revision Check

↓

Schema Service

↓

Persist

↓

ACK Sender

↓

Broadcast Others
```

Server

Never broadcasts

Invalid operations.

---

# Revision Validation

Every operation

Contains

```
Draft Revision
```

Server compares

Latest revision.

Mismatch

↓

409 Equivalent Socket Error

↓

Client Reload.

---

# ACK Flow

Client

↓

Operation

↓

Server

↓

Persist

↓

ACK

```json
{
    "operationId":"...",
    "status":"SUCCESS"
}
```

---

# Failure ACK

```json
{
    "operationId":"...",
    "status":"FAILED",
    "reason":"REVISION_CONFLICT"
}
```

Frontend

Rolls back

Optimistic update.

---

# Broadcasting

Originating socket

Receives

ACK only.

Other sockets

Receive

```
REMOTE_OPERATION
```

Avoid duplicate updates.

---

# Duplicate Protection

Maintain

Processed Operations

LRU Cache

```
operationId

↓

Processed
```

Ignore duplicates.

---

# Ordering

Operations

Applied

In order

Per room.

Simple FIFO queue

Sufficient

For MVP.

---

# Queue

```
Room Queue

↓

Operation

↓

Persist

↓

Broadcast

↓

Next
```

Ensures

Sequential consistency.

---

# Conflict Resolution

Phase 1

```
Last Write Wins
```

Future

Replace with

```
Operational Transform

CRDT
```

Architecture

Keeps operation layer

Independent.

---

# Reconnection

Reconnect Flow

```
Socket Lost

↓

Reconnect

↓

Authenticate

↓

Join Room

↓

Fetch Latest Revision

↓

Resume
```

---

# Initial Sync

After reconnect

Server returns

```
Latest Draft Revision

Current Presence

Pending Review Summary
```

Client decides

If reload required.

---

# Disconnect

```
Socket Closed

↓

Remove Presence

↓

Broadcast User Left

↓

Cleanup Room
```

Empty rooms

Destroyed.

---

# Rate Limiting

Protect

```
Cursor Updates

Operations

Join Requests
```

Prevent abuse.

---

# Metrics

Track

```
Connected Users

Operations/Second

Average Latency

Reconnect Count

Presence Count

ACK Time
```

---

# Logging

Log

```
Join Room

Leave Room

Operation Applied

Revision Conflict

Reconnect
```

Include

```
Request ID

Socket ID

Diagram ID

User ID
```

---

# Error Handling

Possible Errors

```
Invalid JWT

Diagram Not Found

Unauthorized

Revision Conflict

Malformed Operation

Room Missing
```

Return

Structured socket error.

---

# Redis Usage

Store

```
Presence

Room Metadata

Temporary Locks

Processed Operations
```

Never

Canonical schema.

---

# Scalability

Phase 1

```
Single Node
```

Future

Multiple instances

Using

```
Redis Pub/Sub

Socket.IO Adapter
```

Allows

Horizontal scaling.

---

# Performance Targets

```
Socket Connect

<100ms

Operation ACK

<50ms

Broadcast

<100ms

Cursor Update

30 FPS

Reconnect

<2s
```

---

# Testing

Unit Tests

- Presence
- Room Service
- ACK
- Revision Validation
- Queue

Integration Tests

- Two Users
- Ten Users
- Disconnect
- Reconnect
- Broadcast

Performance Tests

- 10 concurrent users
- 100 operations/sec
- Rapid cursor movement

---

# Acceptance Criteria

- JWT socket authentication
- Diagram rooms implemented
- Presence synchronization
- Cursor synchronization
- Selection synchronization
- Operation broadcasting
- ACK handling
- Revision validation
- Duplicate prevention
- Automatic reconnection
- Redis-backed presence
- Lint passes
- TypeScript passes
- Unit tests pass

---

# End of Document

Continue with

```
Projects/schemaFlow/docs/backend/

08-websocket-gateway.md
```