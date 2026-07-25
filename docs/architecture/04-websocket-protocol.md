# File

Projects/schemaFlow/docs/architecture/04-websocket-protocol.md

---

# WebSocket Protocol Engineering Specification

**Document:** 04-websocket-protocol.md

**Project:** SchemaFlow

**Version:** Phase 1

---

# Purpose

This document defines the complete WebSocket protocol used by SchemaFlow.

Unlike the REST API, which is request-response based, the WebSocket protocol enables:

- Real-time collaboration
- Live cursor synchronization
- Presence
- Selection synchronization
- Optimistic updates
- Command acknowledgements
- Recovery after reconnection

The protocol is intentionally designed to be transport-independent.

Today it runs over Socket.IO.

In the future it could run over:

- Native WebSocket
- WebRTC Data Channels
- gRPC Streams

without changing the message contract.

---

# Protocol Goals

The protocol must provide:

- Ordered operations
- Low latency
- Reliable acknowledgements
- Duplicate protection
- Automatic reconnection
- Stateless messages
- Forward compatibility

---

# Connection Lifecycle

```
Client

↓

Connect Socket

↓

Authenticate

↓

Join Diagram

↓

Receive Initial State

↓

Realtime Editing

↓

Heartbeat

↓

Disconnect

↓

Reconnect

↓

Resume Editing
```

---

# Connection URL

```
wss://api.schemaflow.app/socket.io
```

Development

```
ws://localhost:3000
```

---

# Authentication

JWT is sent during connection.

Example

```ts
const socket = io(API_URL, {

    auth: {

        token: accessToken

    }

});
```

Server validates JWT before allowing the socket to connect.

---

# Connection State Machine

```
Disconnected

↓

Connecting

↓

Authenticating

↓

Connected

↓

Joined Room

↓

Synchronizing

↓

Ready
```

Disconnect returns

```
Disconnected
```

---

# Message Envelope

Every message follows the same structure.

```ts
interface SocketMessage<T> {

    id: string;

    type: string;

    revision: number;

    timestamp: number;

    correlationId: string;

    payload: T;

}
```

---

# Message Rules

Every message

Must contain

```
id

type

revision

timestamp

payload
```

No exceptions.

---

# Client → Server Messages

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

# Server → Client Messages

```
READY

ACK

ERROR

REMOTE_COMMAND

USER_JOINED

USER_LEFT

CURSOR_UPDATED

SELECTION_UPDATED

VIEWPORT_UPDATED

PONG
```

---

# JOIN_DIAGRAM

Client

```json
{
  "type": "JOIN_DIAGRAM",
  "payload": {
    "diagramId": "diagram_123"
  }
}
```

Server validates

- JWT
- Ownership
- Draft existence

---

# READY

Server

```json
{
  "type": "READY",
  "payload": {
    "diagramId": "diagram_123",
    "revision": 42,
    "users": []
  }
}
```

Sent once

After joining succeeds.

---

# COMMAND

Represents any schema mutation.

```json
{
  "type": "COMMAND",
  "revision": 42,
  "payload": {
    "operationId": "...",
    "command": {
      "type": "CREATE_TABLE",
      "payload": {}
    }
  }
}
```

Only commands mutate schema.

---

# ACK

Server acknowledges successful persistence.

```json
{
  "type": "ACK",
  "payload": {
    "operationId": "...",
    "revision": 43
  }
}
```

Revision increments

Only after persistence.

---

# ERROR

```json
{
  "type": "ERROR",
  "payload": {
    "code": "REVISION_CONFLICT",
    "message": "Revision mismatch."
  }
}
```

Errors never disconnect the client unless authentication fails.

---

# REMOTE_COMMAND

Broadcast to every other collaborator.

```json
{
  "type": "REMOTE_COMMAND",
  "payload": {
    "operationId": "...",
    "command": {}
  }
}
```

Originating client never receives this message.

---

# CURSOR_MOVE

Client

```json
{
  "type": "CURSOR_MOVE",
  "payload": {
    "x": 1042,
    "y": 532
  }
}
```

Broadcast frequency

```
30 FPS
```

Never send

Every mouse movement.

---

# CURSOR_UPDATED

Server

```json
{
  "type": "CURSOR_UPDATED",
  "payload": {
    "userId": "...",
    "x": 1042,
    "y": 532
  }
}
```

---

# SELECTION_CHANGE

Client

```json
{
  "type": "SELECTION_CHANGE",
  "payload": {
    "selectedIds": [
      "table1",
      "table2"
    ]
  }
}
```

Only send

When selection actually changes.

---

# VIEWPORT_CHANGE

```json
{
  "type": "VIEWPORT_CHANGE",
  "payload": {
    "x": 500,
    "y": -320,
    "zoom": 1.2
  }
}
```

Used later for

Follow User.

---

# USER_JOINED

Broadcast

```json
{
  "type": "USER_JOINED",
  "payload": {
    "userId": "...",
    "name": "Vinay"
  }
}
```

---

# USER_LEFT

Broadcast

```json
{
  "type": "USER_LEFT",
  "payload": {
    "userId": "..."
  }
}
```

---

# Heartbeat

Client

```
PING
```

Server

```
PONG
```

Interval

```
30 seconds
```

Missing

Two heartbeats

↓

Disconnect.

---

# Revision Protocol

Every command contains

```
revision
```

Server validates

```
Client Revision

==

Latest Revision
```

If mismatch

Return

```
REVISION_CONFLICT
```

Client reloads latest draft.

---

# Duplicate Detection

Every command owns

```
operationId
```

Server stores

Recent operation IDs

using Redis.

Duplicate operations

Ignored.

---

# Ordering Guarantees

Within one diagram room

```
FIFO
```

Commands are applied sequentially.

No parallel mutation execution.

---

# Optimistic Updates

Frontend

Immediately updates UI.

```
User Action

↓

Local Update

↓

Send COMMAND

↓

ACK

↓

Keep

or

Rollback
```

Rollback only occurs

On ERROR.

---

# Reconnection Flow

```
Disconnect

↓

Reconnect

↓

Authenticate

↓

Join Room

↓

Receive READY

↓

Revision Check

↓

Resume
```

---

# Recovery Protocol

If revision differs

Server responds

```json
{
  "type": "ERROR",
  "payload": {
    "code": "OUT_OF_SYNC"
  }
}
```

Client

Reloads

Entire schema.

---

# Compression

Enable

```
permessage-deflate
```

Phase 1.

Useful for

Large operations.

---

# Maximum Payload

Single message

```
256 KB
```

Larger payloads

Must use REST.

Example

```
Import DBML

Export

Image Upload
```

---

# Rate Limits

| Message | Limit |
|----------|-------|
| Cursor | 30/sec |
| Selection | 10/sec |
| Viewport | 10/sec |
| Commands | 50/sec |
| Join | 5/min |

---

# Timeouts

| Action | Timeout |
|----------|---------|
| ACK | 5 s |
| Join | 10 s |
| Authentication | 5 s |
| Heartbeat | 30 s |

---

# Error Codes

```
UNAUTHORIZED

FORBIDDEN

ROOM_NOT_FOUND

DIAGRAM_NOT_FOUND

REVISION_CONFLICT

OUT_OF_SYNC

INVALID_COMMAND

RATE_LIMITED

SERVER_ERROR
```

---

# Logging

Every socket message logs

```
Socket ID

User ID

Diagram ID

Message Type

Latency

Revision
```

Payloads

Are never fully logged.

---

# Metrics

Track

```
Connected Clients

Rooms

Commands/sec

ACK Latency

Reconnect Count

Heartbeat Failures

Revision Conflicts
```

---

# Future Extensions

Protocol already supports

```
Voice Presence

Video Presence

Screen Following

Comments

Mentions

AI Suggestions

Live Review Sessions
```

without breaking compatibility.

---

# Acceptance Criteria

- Standard message envelope
- JWT authentication
- Ordered command execution
- ACK protocol
- Revision validation
- Duplicate protection
- Heartbeat protocol
- Automatic recovery
- Rate limiting
- Logging and metrics defined

---

# End of Document

Continue with

```
Projects/schemaFlow/docs/architecture/

05-review-workflow.md
```