# File

Projects/schemaFlow/docs/frontend/06-features/06-features_PART_7.md

---

# Collaboration Feature

The Collaboration Feature enables multiple users to work on the same diagram simultaneously.

Unlike versioning, collaboration deals with **live editing**.

Unlike autosave, collaboration synchronizes edits between users in real time.

The architecture should support collaborative editing from the beginning, even if the MVP only targets **10 concurrent users**.

---

# Phase 1 Goals

Support

- 10 concurrent users
- Presence indicators
- Live cursor
- Live selections
- Real-time object updates
- Conflict prevention
- Automatic reconnection

Future

```
100+

Concurrent Users

Offline Collaboration

Operational Transform

CRDT
```

---

# Collaboration Principles

The frontend is never the source of truth.

```
User

↓

Command

↓

Local Store

↓

WebSocket

↓

Backend

↓

Broadcast

↓

Other Clients
```

Every mutation follows this path.

---

# Architecture

```
Workspace

↓

Socket Provider

↓

Collaboration Service

↓

Presence Store

↓

Operation Store

↓

Canvas
```

The Collaboration Service is the only layer that communicates with the WebSocket.

No feature should directly access sockets.

---

# Folder Structure

```
features/

collaboration/

├── api/
│
├── hooks/
│
├── services/
│   ├── collaboration.service.ts
│   ├── websocket.service.ts
│   ├── operationQueue.service.ts
│   ├── reconnect.service.ts
│   └── heartbeat.service.ts
│
├── stores/
│   ├── collaboration.store.ts
│   ├── presence.store.ts
│   └── operation.store.ts
│
├── types/
│
├── utils/
│
├── tests/
│
└── index.ts
```

---

# Collaboration Responsibilities

Owns

- WebSocket connection
- User presence
- Remote selections
- Cursor positions
- Remote operations
- Reconnection
- Heartbeat

Does NOT own

- Review
- History
- Rendering
- Geometry

---

# Collaboration Session

Every workspace creates

One collaboration session.

```ts
interface CollaborationSession {

    diagramId: string;

    sessionId: string;

    userId: string;

    connectedAt: string;

}
```

---

# Presence Model

```ts
interface UserPresence {

    userId: string;

    userName: string;

    avatarUrl?: string;

    cursor: Point;

    viewport: Viewport;

    selectedObjectIds: string[];

    color: string;

    online: boolean;

}
```

---

# Presence Store

Tracks

```
Connected Users

↓

Cursor

↓

Selection

↓

Viewport
```

Never

Diagram objects.

---

# Socket Lifecycle

```
Workspace Opens

↓

Authenticate

↓

Connect

↓

Join Diagram

↓

Heartbeat

↓

Receive Events

↓

Leave Diagram

↓

Disconnect
```

---

# Join Diagram

Immediately after connection

Client sends

```json
{
    "type": "JOIN_DIAGRAM",
    "diagramId": "...",
    "userId": "..."
}
```

---

# Leave Diagram

On workspace exit

Send

```
LEAVE_DIAGRAM
```

before disconnecting.

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

Missed heartbeats

Trigger reconnection.

---

# Reconnection Strategy

```
Disconnect

↓

Retry

↓

2 sec

↓

4 sec

↓

8 sec

↓

16 sec

↓

Reconnect
```

Maximum retry interval

```
30 seconds
```

---

# Connection States

```
Connecting

Connected

Disconnected

Reconnecting

Offline
```

Displayed

Inside Status Bar.

---

# Cursor Synchronization

Every user broadcasts

Cursor position.

Throttle

```
30 FPS
```

Never

Every mouse event.

---

# Cursor Model

```ts
interface RemoteCursor {

    userId: string;

    x: number;

    y: number;

}
```

Future

```
Current Tool

Dragging

Typing
```

---

# Cursor Rendering

Render

```
Cursor

↓

User Name

↓

Color
```

Never

Block pointer events.

---

# Selection Synchronization

Broadcast

```
Selected Objects
```

Example

```
User A

↓

Table

↓

users

↓

User B

Sees

Blue Outline
```

Selection

Read-only.

---

# Presence Colors

Each user

Receives

Stable color.

Examples

```
Blue

Green

Orange

Purple

Pink
```

Configured

Server side.

---

# Remote Viewport

Future

Support

```
Follow User
```

Useful during reviews.

---

# Operation Model

Every collaborative change

Is represented as an operation.

```ts
interface CollaborationOperation {

    id: string;

    type: string;

    payload: unknown;

    version: number;

    userId: string;

}
```

---

# Supported Operations

```
Create Table

Rename Table

Delete Table

Move Table

Resize Table

Create Column

Delete Column

Rename Column

Create Relationship

Delete Relationship

Move Note

Edit Note
```

Every feature contributes operations.

---

# Local Operation Flow

```
User Action

↓

Execute Command

↓

Optimistic Update

↓

Queue Operation

↓

Socket

↓

Server ACK

↓

Confirmed
```

---

# Remote Operation Flow

```
Socket

↓

Receive Operation

↓

Validation

↓

Apply Command

↓

Update Store

↓

Render
```

---

# Operation Queue

If disconnected

Operations are queued.

```
Command

↓

Queue

↓

Reconnect

↓

Replay
```

Queue order

Must be preserved.

---

# Operation IDs

Every operation

Owns

```
UUID
```

Useful for

Deduplication.

---

# Server ACK

Every operation

Receives

```
ACK
```

Until ACK

Operation remains pending.

---

# Duplicate Protection

Ignore

Operation IDs

Already processed.

Never

Apply twice.

---

# Conflict Strategy (Phase 1)

Simple

```
Last Write Wins
```

Future

```
Operational Transform

CRDT
```

Architecture should make replacement possible.

---

# Live Table Movement

Dragging

Broadcast

Throttled positions.

On drop

Broadcast

Final position.

Avoid flooding.

---

# Live Typing

Phase 1

Do NOT synchronize

Every keystroke.

Instead

```
Rename Complete

↓

Broadcast
```

Future

Character-level collaboration.

---

# Object Locking

Phase 1

No locking.

Future

Soft locking.

Example

```
User A

Editing

↓

Show

"Vinay is editing..."
```

---

# Review Integration

Review state

Broadcast

Like any other operation.

---

# Autosave Integration

Autosave

Independent.

Receiving remote updates

Must not trigger

Autosave.

---

# History Integration

Remote operations

Never enter

Local Undo Stack.

Only local commands

Are undoable.

---

# Search Integration

Search index

Updates

After remote operations.

---

# Error Handling

Failures

```
Socket Lost

Reconnect

↓

Invalid Operation

Ignore

↓

Permission Denied

Refresh

↓

Version Mismatch

Reload Diagram
```

---

# Performance Targets

Support

```
10 Active Users
```

Latency

```
<150ms
```

Cursor Updates

```
30 FPS
```

Operation Apply

```
<10ms
```

---

# Testing

Unit Tests

- Join
- Leave
- Heartbeat
- Reconnect
- Queue
- ACK

Integration Tests

- Two Users
- Cursor Sync
- Selection Sync
- Operations
- Reconnect

Performance Tests

- 10 Users
- 1,000 Operations
- Cursor Broadcast

---

# Acceptance Criteria

- Users join workspace
- Presence visible
- Cursor synchronized
- Selection synchronized
- Operations synchronized
- Reconnection works
- Queue replay works
- ACK handling works
- Duplicate protection implemented
- Local undo unaffected
- Lint passes
- TypeScript passes
- Unit tests pass

---

# End of Document

Continue with

```
Projects/schemaFlow/docs/frontend/06-features/

06-features_PART_8.md
```