# File

Projects/schemaFlow/docs/backend/08-websocket-gateway.md

---

# WebSocket Gateway Engineering Specification

**Document:** 08-websocket-gateway.md

**Project:** SchemaFlow

---

# Purpose

The WebSocket Gateway is the real-time communication layer of SchemaFlow.

Unlike the Collaboration Service, which contains business logic, the Gateway is responsible only for

- Managing socket connections
- Authenticating clients
- Routing events
- Broadcasting events
- Handling acknowledgements
- Managing rooms

It should contain **zero business logic**.

---

# Responsibilities

Owns

- Socket.IO initialization
- Authentication middleware
- Namespace management
- Room management
- Event routing
- ACK routing
- Error routing
- Connection lifecycle

Does NOT own

- Schema updates
- Review
- Versioning
- Database access
- Validation

---

# High-Level Architecture

```
                 Browser

                    │

             Socket.IO Client

                    │

────────────────────┼────────────────────

                    │

            Socket.IO Gateway

                    │

        Authentication Middleware

                    │

            Event Dispatcher

        ┌──────────┼──────────┐

        ▼          ▼          ▼

 Collaboration   Presence   Commands

        ▼          ▼          ▼

      Services    Services   Services
```

---

# Folder Structure

```
src/

websocket/

├── gateway/
│   ├── gateway.ts
│   ├── namespace.ts
│   ├── roomManager.ts
│   └── connectionManager.ts
│
├── middleware/
│   ├── authentication.ts
│   ├── authorization.ts
│   └── rateLimiter.ts
│
├── handlers/
│   ├── cursor.handler.ts
│   ├── presence.handler.ts
│   ├── operation.handler.ts
│   ├── viewport.handler.ts
│   └── heartbeat.handler.ts
│
├── dispatcher/
│   ├── eventDispatcher.ts
│   └── handlerRegistry.ts
│
├── events/
│   ├── clientEvents.ts
│   ├── serverEvents.ts
│   └── socketErrors.ts
│
├── dto/
├── types/
├── tests/
└── index.ts
```

---

# Gateway Lifecycle

```
Server Starts

↓

Initialize Socket.IO

↓

Register Middleware

↓

Register Handlers

↓

Accept Connections
```

---

# Namespace Strategy

Phase 1

Single namespace

```
/
```

Future

```
/workspace

/admin

/internal
```

Architecture

Supports

Multiple namespaces.

---

# Socket Authentication

Connection

↓

JWT Validation

↓

Load User

↓

Attach Context

↓

Allow Connection

Failure

↓

Disconnect

---

# Socket Context

```ts
interface AuthenticatedSocket {

    socketId: string;

    userId: string;

    email: string;

    connectedAt: number;

}
```

Attached

To every socket.

---

# Room Strategy

One room

Per diagram.

Example

```
diagram:

123

↓

diagram:123
```

Only users editing

Same diagram

Receive

Events.

---

# Connection Flow

```
Connect

↓

Authenticate

↓

Join Room

↓

Send Initial State

↓

Ready
```

---

# Disconnection Flow

```
Disconnect

↓

Leave Room

↓

Remove Presence

↓

Notify Others

↓

Cleanup
```

---

# Event Routing

Incoming event

↓

Dispatcher

↓

Registered Handler

↓

Business Service

↓

ACK

Handlers

Never access database directly.

---

# Client Events

Supported

```
JOIN_DIAGRAM

LEAVE_DIAGRAM

CURSOR_MOVE

SELECTION_CHANGE

VIEWPORT_CHANGE

COMMAND

PING
```

---

# Server Events

Supported

```
USER_JOINED

USER_LEFT

CURSOR_UPDATED

SELECTION_UPDATED

VIEWPORT_UPDATED

REMOTE_COMMAND

ACK

ERROR

PONG
```

---

# Event Envelope

Every event

Uses

```ts
interface SocketEnvelope<T> {

    eventId: string;

    type: string;

    timestamp: number;

    payload: T;

}
```

Allows

Tracing

And debugging.

---

# ACK Strategy

Every mutating event

Receives ACK.

```
COMMAND

↓

Persist

↓

ACK
```

ACK

Never broadcast.

---

# Broadcast Strategy

Origin socket

↓

ACK

Other sockets

↓

REMOTE_COMMAND

Avoid

Duplicate application.

---

# Heartbeat

Client

↓

PING

↓

Gateway

↓

PONG

Gateway

Does not persist

Heartbeat.

---

# Rate Limiting

Per socket

Limit

```
Cursor Updates

Selection

Commands
```

Excess

↓

Drop

Or disconnect.

---

# Error Routing

All socket errors

Use

```json
{
  "code": "...",
  "message": "...",
  "eventId": "..."
}
```

Never send

Stack traces.

---

# Handler Registry

Handlers

Registered

At startup.

```
JOIN_DIAGRAM

↓

joinHandler

COMMAND

↓

operationHandler
```

Avoid

Switch statements.

---

# Middleware Order

```
Authentication

↓

Authorization

↓

Rate Limit

↓

Dispatcher
```

Never bypass

Authentication.

---

# Authorization

Before

Joining room

Verify

```
User

↓

Owns Project

↓

Owns Diagram

↓

Allowed
```

Otherwise

Disconnect.

---

# Room Cleanup

If room

Has zero sockets

↓

Destroy room

↓

Release memory.

---

# Gateway Metrics

Track

```
Connected Clients

Rooms

Messages/sec

ACK Latency

Reconnects

Disconnects
```

---

# Logging

Log

```
Socket Connected

Socket Disconnected

Join Room

Leave Room

Command Routed

Authentication Failed
```

---

# Security

Never trust

Client payload.

Always validate

Before dispatch.

Never expose

Internal IDs

Outside required payload.

---

# Backpressure

If socket

Falls behind

Queue

Limited messages.

Overflow

↓

Disconnect

Prevent memory leaks.

---

# Scaling

Phase 1

Single server.

Future

```
Socket.IO Redis Adapter

↓

Multiple Nodes

↓

Shared Rooms
```

Gateway code

Should require

Minimal changes.

---

# Testing

Unit Tests

- Authentication
- Dispatcher
- Handler Registry
- ACK Routing

Integration Tests

- Connect
- Join Room
- Broadcast
- Disconnect

Load Tests

- 100 sockets
- 1000 commands/minute

---

# Performance Targets

```
Connection

<100ms

Join Room

<50ms

Broadcast

<100ms

ACK

<50ms
```

---

# Acceptance Criteria

- Socket gateway initialized
- JWT authentication enforced
- Event dispatcher implemented
- Room lifecycle managed
- ACK routing implemented
- Broadcast routing implemented
- Middleware pipeline complete
- Metrics exposed
- Logging complete
- TypeScript passes
- Lint passes
- Unit tests pass

---

# End of Document

Continue with

```
Projects/schemaFlow/docs/backend/

09-parser-service.md
```