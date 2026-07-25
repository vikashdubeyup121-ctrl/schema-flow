# File

Projects/schemaFlow/docs/architecture/07-collaboration-state-machine.md

---

# Collaboration State Machine Engineering Specification

**Document:** 07-collaboration-state-machine.md

**Project:** SchemaFlow

**Version:** Phase 1

---

# Purpose

This document defines the runtime collaboration state machine for SchemaFlow.

It describes how a user's editing session transitions between various collaboration states, how synchronization is maintained, and how failures are recovered.

This document is the reference implementation for:

- Frontend collaboration store
- WebSocket Gateway
- Presence Service
- Command Bus integration
- Reconnection logic

---

# Goals

The collaboration engine must provide

- Live editing
- Low latency
- Eventual consistency
- Automatic recovery
- Safe optimistic updates
- Deterministic synchronization

---

# High Level State Machine

```
Disconnected

↓

Connecting

↓

Authenticating

↓

Joining Room

↓

Synchronizing

↓

Ready

↓

Editing

↓

Saving

↓

Ready

↓

Disconnected
```

Every user always exists in exactly one collaboration state.

---

# State Definitions

## DISCONNECTED

```
No socket connection.

No presence.

No collaboration.
```

Allowed actions

```
Reconnect

Logout
```

---

## CONNECTING

Socket.IO connection is being established.

Waiting for

```
TCP

↓

TLS

↓

Socket Upgrade
```

No user interaction blocked.

---

## AUTHENTICATING

Socket sends

```
JWT
```

Server validates

```
Signature

↓

Expiry

↓

Ownership
```

Failure

↓

Disconnected

---

## JOINING_ROOM

Socket requests

```
JOIN_DIAGRAM
```

Server verifies

- Diagram exists
- User owns project
- Draft exists

If valid

↓

Synchronizing

---

## SYNCHRONIZING

Client downloads

```
Revision

Presence

Active Users

Review Summary
```

No mutations allowed.

Read-only.

---

## READY

Workspace synchronized.

Socket healthy.

User can edit.

---

## EDITING

User is actively changing schema.

Possible operations

```
Create Table

Rename Column

Delete Relationship

Move Table

Resize Table

Create Note
```

Commands immediately enter

Command Bus.

---

## WAITING_FOR_ACK

Optimistic update already applied.

Waiting for

```
ACK
```

If ACK

↓

READY

If ERROR

↓

ROLLBACK

---

## ROLLBACK

Undo optimistic mutation.

Restore

Previous snapshot.

Show

Toast notification.

Return

READY.

---

## SAVING

Autosave currently running.

User

continues editing.

Saving

does not block UI.

---

## RECONNECTING

Connection lost.

Retry sequence

```
Connect

↓

Authenticate

↓

Join Room

↓

Revision Check
```

---

## OUT_OF_SYNC

Client revision differs.

Editing disabled.

Client reloads

Entire draft.

---

# Complete State Diagram

```
Disconnected

↓

Connecting

↓

Authenticating

↓

Joining Room

↓

Synchronizing

↓

Ready

↓

Editing

↓

Waiting ACK

├────────────┐

│            │

ACK        ERROR

│            │

▼            ▼

Ready    Rollback

             │

             ▼

          Ready
```

---

# Socket Lifecycle

```
Open Socket

↓

Authenticate

↓

Join Diagram

↓

Receive READY

↓

Heartbeat

↓

Disconnect
```

---

# Presence State

Every user maintains

```
Cursor

Selection

Viewport

Editing Object

Connection Status
```

---

# Presence Lifecycle

```
Join

↓

Broadcast Presence

↓

Cursor Updates

↓

Selection Updates

↓

Leave

↓

Remove Presence
```

---

# Cursor State Machine

```
Idle

↓

Move Mouse

↓

Throttle

↓

Broadcast

↓

Idle
```

Target

```
30 FPS
```

---

# Selection State

```
No Selection

↓

Select Objects

↓

Broadcast

↓

Selection Changed

↓

Idle
```

Selection updates only when

Selection actually changes.

---

# Revision State

Every command contains

```
Current Revision
```

Server compares

```
Client Revision

↓

Latest Revision
```

If mismatch

↓

OUT_OF_SYNC

---

# Synchronization Flow

```
READY

↓

Command

↓

Optimistic Update

↓

Persist

↓

ACK

↓

Revision++

↓

READY
```

---

# Error Recovery

Possible failures

```
Socket Closed

↓

Reconnect

↓

Revision Check

↓

Resume
```

---

Revision conflict

```
Conflict

↓

Reload Schema

↓

Resume
```

---

# Heartbeat

Every

```
30 Seconds
```

```
PING

↓

PONG
```

Missing

Two heartbeats

↓

Reconnect.

---

# Connection Retry

Retry schedule

```
1 sec

2 sec

4 sec

8 sec

16 sec

30 sec
```

Maximum

```
30 seconds
```

Backoff resets

After successful connection.

---

# Collaboration Locking

Phase 1

No hard locking.

Users may edit

Same object simultaneously.

Conflict resolution

```
Last Write Wins
```

Future

```
CRDT

Operational Transform

Field-level locks
```

---

# Optimistic Update Flow

```
Dispatch Command

↓

Apply Local

↓

Render

↓

Backend

↓

ACK

↓

Commit
```

Failure

↓

Rollback

---

# Remote Command Flow

```
Other User

↓

COMMAND

↓

Persist

↓

REMOTE_COMMAND

↓

Apply

↓

Render
```

Never generate

Duplicate history entries.

---

# Presence Timeout

User inactive

```
60 Seconds
```

↓

Presence removed.

Socket

Still connected.

---

# Disconnect Reasons

```
Network

Server Restart

Token Expired

Idle Timeout

Manual Logout
```

Each reason

Triggers different recovery.

---

# Logout Flow

```
Logout

↓

Leave Room

↓

Remove Presence

↓

Disconnect Socket

↓

Delete Tokens

↓

Redirect Login
```

---

# Server Restart Recovery

```
Socket Closed

↓

Reconnect

↓

Authenticate

↓

Join Room

↓

Reload Revision

↓

Continue Editing
```

Transparent

To user.

---

# State Ownership

Frontend Store

Owns

```
Socket State

Connection State

Presence

Retry Count

Revision
```

Backend

Owns

```
Truth

Revision

Room Members
```

---

# Metrics

Track

```
Connected Users

Reconnect Count

Revision Conflicts

ACK Latency

Heartbeat Failures

Presence Count
```

---

# Logging

Log transitions

```
CONNECTED

JOINED_ROOM

READY

EDITING

ROLLBACK

RECONNECTED

OUT_OF_SYNC
```

Include

```
User ID

Diagram ID

Revision

Latency
```

---

# Performance Targets

```
Join Room

<100 ms

Reconnect

<2 sec

ACK

<50 ms

Presence Broadcast

<20 ms

Rollback

<20 ms
```

---

# Testing

Unit Tests

- State transitions
- Retry logic
- Heartbeat
- Presence updates

Integration Tests

- Two-user collaboration
- Disconnect recovery
- Revision conflict
- Rollback

Load Tests

- 10 concurrent users
- 100 commands/sec
- Rapid reconnect

---

# Acceptance Criteria

- Collaboration state machine implemented
- Automatic reconnection
- Presence synchronization
- Revision validation
- Optimistic updates
- Rollback support
- Heartbeat monitoring
- Retry with exponential backoff
- Out-of-sync recovery
- Metrics and logging implemented

---

# End of Document

Continue with

```
Projects/schemaFlow/docs/architecture/

08-autosave-state-machine.md
```