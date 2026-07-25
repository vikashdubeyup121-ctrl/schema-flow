# File

Projects/schemaFlow/docs/architecture/08-autosave-state-machine.md

---

# Autosave State Machine Engineering Specification

**Document:** 08-autosave-state-machine.md

**Project:** SchemaFlow

**Version:** Phase 1

---

# Purpose

The Autosave Engine guarantees that users never lose work while editing a diagram.

Unlike traditional save mechanisms, SchemaFlow continuously persists draft changes without requiring manual intervention.

Autosave must be:

- Invisible to users
- Reliable
- Efficient
- Non-blocking
- Recoverable

Autosave only applies to **Draft Versions**.

Published versions are immutable.

---

# Design Goals

The autosave system should

- Never interrupt editing
- Batch rapid changes
- Prevent duplicate saves
- Recover after reconnect
- Avoid unnecessary API calls
- Preserve optimistic UX

---

# High Level Flow

```
User Edit

↓

Mark Dirty

↓

Debounce

↓

Generate Operations

↓

Persist

↓

Revision++

↓

Clean State
```

---

# State Machine

```
Clean

↓

Dirty

↓

Waiting

↓

Saving

↓

Saved

↓

Clean
```

Failure

```
Saving

↓

Failed

↓

Retry

↓

Saving
```

---

# States

## CLEAN

Workspace matches backend.

No unsaved changes.

```
Dirty = false
```

---

## DIRTY

A mutation has occurred.

Examples

```
Create Table

Rename Column

Delete Relationship

Resize Note

Move Table
```

The workspace contains unsaved changes.

---

## WAITING

Debounce timer is active.

No save request is sent yet.

Purpose

Batch multiple edits.

---

## SAVING

Autosave request is currently in progress.

User may continue editing.

UI never blocks.

---

## SAVED

Backend acknowledged the save.

Revision updated.

Immediately transitions back to

```
CLEAN
```

unless additional edits occurred.

---

## FAILED

Autosave request failed.

Possible reasons

```
Network

Timeout

Revision Conflict

Server Error
```

A retry is scheduled.

---

# Complete State Diagram

```
CLEAN

↓

DIRTY

↓

WAITING

↓

SAVING

├───────────────┐

│               │

Success      Failure

│               │

▼               ▼

SAVED        FAILED

│               │

▼               ▼

CLEAN      RETRY

                │

                ▼

             SAVING
```

---

# Dirty Detection

Every successful command marks

```
dirty = true
```

Examples

```
Create Table

Rename Column

Delete Note

Move Table

Resize Table

Change Datatype
```

Commands that do NOT mark dirty

```
Selection

Cursor

Viewport

Search

Zoom

Pan
```

---

# Debounce Strategy

Debounce duration

```
1500 ms
```

Every new edit resets the timer.

Example

```
Rename Column

↓

400 ms

↓

Rename Again

↓

700 ms

↓

Move Table

↓

1500 ms

↓

Save
```

Only one request.

---

# Save Trigger

Autosave starts when

```
dirty == true

AND

debounce elapsed

AND

not already saving
```

---

# Save Payload

Autosave sends

```json
{
  "revision": 42,
  "operations": [
    {
      "id": "...",
      "type": "RENAME_COLUMN",
      "payload": {}
    }
  ]
}
```

Only pending operations are transmitted.

---

# Revision Handling

Backend returns

```json
{
  "revision": 43
}
```

Frontend updates

Current revision.

---

# Concurrent Editing

User continues editing

while autosave runs.

New commands

remain in

Pending Queue.

After current save completes

another autosave begins

if pending operations exist.

---

# Pending Queue

```
Command

↓

Pending Queue

↓

Autosave

↓

ACK

↓

Remove
```

Queue preserves ordering.

---

# Queue Structure

```ts
interface PendingOperation {

    operationId: string;

    revision: number;

    command: Command;

}
```

FIFO.

---

# Optimistic Updates

UI updates immediately.

Autosave only confirms persistence.

Rollback occurs only if

Server rejects the operation.

---

# Retry Strategy

Retry delays

```
1 sec

↓

2 sec

↓

4 sec

↓

8 sec

↓

16 sec

↓

30 sec
```

Maximum interval

```
30 seconds
```

---

# Revision Conflict

If server responds

```
409 Conflict
```

Client transitions to

```
OUT_OF_SYNC
```

Flow

```
Reload Draft

↓

Replay Pending Commands

↓

Resume
```

---

# Network Loss

```
Disconnect

↓

Queue Commands

↓

Reconnect

↓

Autosave Pending Queue
```

User never loses work.

---

# Offline Support (Future)

Future state

```
OFFLINE
```

Commands stored locally.

After reconnect

```
Replay Queue
```

---

# Save Indicator

Status Bar displays

```
● Unsaved

↓

Saving...

↓

Saved

↓

Last saved 5 sec ago
```

No modal dialogs.

---

# Manual Save

Phase 1

Not required.

Future

```
Ctrl + S

↓

Immediate Autosave
```

Uses same pipeline.

---

# Operations Excluded

Never persisted through autosave

```
Cursor

Selection

Viewport

Presence

Temporary Guides
```

Viewport uses its own endpoint.

---

# Failure Handling

Failures

```
Network

↓

Retry
```

```
Validation

↓

Show Error

↓

Remain Dirty
```

```
Conflict

↓

Reload
```

---

# Recovery

On application restart

```
Load Draft

↓

Revision Check

↓

Resume Editing
```

Draft always reflects latest successful save.

---

# Metrics

Track

```
Autosave Count

Average Save Time

Retries

Failures

Revision Conflicts

Dropped Requests
```

---

# Logging

Log

```
Autosave Started

Autosave Completed

Autosave Failed

Retry Scheduled

Conflict Detected
```

Include

```
Diagram ID

Revision

Latency

Operation Count
```

---

# Performance Targets

| Operation | Target |
|-----------|---------|
| Debounce | 1500 ms |
| Save Request | <100 ms |
| ACK | <50 ms |
| Retry Scheduling | <5 ms |
| Queue Processing | <10 ms |

---

# Engineering Rules

- Autosave never blocks editing.
- Only pending operations are transmitted.
- One save request at a time.
- Commands remain ordered.
- Failed saves never discard operations.
- Published versions are never autosaved.
- Dirty state is derived from pending operations.

---

# Testing

Unit Tests

- Dirty detection
- Debounce
- Queue
- Retry
- Revision updates

Integration Tests

- Continuous editing
- Concurrent edits
- Network loss
- Revision conflict
- Recovery

Performance Tests

- 1,000 operations
- 100 queued commands
- Rapid typing
- Large paste operation

---

# Acceptance Criteria

- Autosave state machine implemented
- Dirty detection working
- Debounce implemented
- FIFO pending queue
- Retry strategy implemented
- Revision handling complete
- Save indicator supported
- Recovery documented
- Metrics defined
- Performance targets met

---

# End of Document

Continue with

```
Projects/schemaFlow/docs/architecture/

09-publish-sequence.md
```