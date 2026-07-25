# File

Projects/schemaFlow/docs/architecture/06-command-bus.md

---

# Command Bus Engineering Specification

**Document:** 06-command-bus.md

**Project:** SchemaFlow

**Version:** Phase 1

---

# Purpose

The Command Bus is the central mutation pipeline of SchemaFlow.

Every write operation in the application must pass through the Command Bus.

No component, hook, store, or service may directly mutate the schema.

This architecture provides:

- Centralized validation
- Undo/Redo support
- Optimistic UI
- Collaboration synchronization
- Event generation
- Audit logging
- Consistent mutation pipeline

---

# Why a Command Bus?

Without a Command Bus

```
Toolbar

↓

Store

↓

Canvas

↓

Backend

↓

Socket
```

Every component owns mutation logic.

Problems

- Duplicate code
- Hard to test
- Difficult undo/redo
- No centralized validation
- Inconsistent collaboration

---

With Command Bus

```
Toolbar

↓

Command

↓

Command Bus

↓

Validation

↓

Execute

↓

Store

↓

Backend

↓

Socket

↓

Events
```

Every mutation follows one path.

---

# Design Principles

Every mutation is

- Intent based
- Immutable
- Serializable
- Replayable
- Undoable
- Testable

---

# Responsibilities

Owns

- Command dispatch
- Validation
- Optimistic execution
- Rollback
- Undo
- Redo
- History
- Event generation

Does NOT own

- Business rules
- Persistence
- Rendering

---

# High-Level Architecture

```
UI

↓

Command

↓

Command Bus

↓

Command Handler

↓

Validation

↓

Optimistic Update

↓

Backend

↓

ACK

↓

Commit

or

Rollback
```

---

# Folder Structure

```
features/

commands/

├── bus/
│   ├── commandBus.ts
│   ├── dispatcher.ts
│   └── registry.ts
│
├── handlers/
│   ├── createTable.handler.ts
│   ├── renameTable.handler.ts
│   ├── deleteTable.handler.ts
│   ├── moveTable.handler.ts
│   ├── createColumn.handler.ts
│   ├── updateColumn.handler.ts
│   ├── deleteColumn.handler.ts
│   └── publish.handler.ts
│
├── history/
│   ├── historyManager.ts
│   ├── undo.ts
│   └── redo.ts
│
├── validators/
│
├── types/
│
└── index.ts
```

---

# Command Interface

Every command implements

```ts
interface Command<T = unknown> {

    id: string;

    type: string;

    revision: number;

    timestamp: number;

    payload: T;

}
```

Commands are immutable.

---

# Handler Interface

```ts
interface CommandHandler<T> {

    validate(command: T): Promise<void>;

    execute(command: T): Promise<void>;

    rollback(command: T): Promise<void>;

}
```

---

# Dispatcher

The dispatcher receives commands.

```
Dispatch

↓

Lookup Handler

↓

Validate

↓

Execute

↓

Persist

↓

Emit Event
```

No switch statements.

Handlers are registered in a registry.

---

# Registry

```
CREATE_TABLE

↓

CreateTableHandler

MOVE_TABLE

↓

MoveTableHandler

DELETE_COLUMN

↓

DeleteColumnHandler
```

---

# Command Categories

Workspace

```
CreateTable

RenameTable

MoveTable

ResizeTable

DeleteTable
```

Columns

```
CreateColumn

RenameColumn

DeleteColumn

ReorderColumn

UpdateDatatype
```

Relationships

```
CreateRelationship

DeleteRelationship
```

Notes

```
CreateNote

UpdateNote

DeleteNote
```

Version

```
Publish

DiscardDraft
```

---

# Command Lifecycle

```
Create Command

↓

Validate

↓

Optimistic Update

↓

Backend

↓

ACK

↓

Commit
```

If backend rejects

↓

Rollback

---

# Validation

Two stages.

Frontend

- Required fields
- Basic constraints

Backend

- Business rules
- Permissions
- Referential integrity

---

# Optimistic Execution

Immediately after dispatch

```
Store Updated

↓

Canvas Updates

↓

User Sees Result

↓

Backend Persists
```

ACK confirms success.

---

# Rollback

If backend returns error

```
Rollback

↓

Restore Previous State

↓

Notify User
```

Rollback uses the previous snapshot.

---

# Undo

History Manager stores

```
Executed Commands
```

Undo

```
History

↓

Inverse Command

↓

Execute

↓

Persist
```

---

# Redo

Redo

```
Redo Stack

↓

Replay Command

↓

Persist
```

---

# History Manager

```ts
interface HistoryManager {

    undoStack: Command[];

    redoStack: Command[];

}
```

Maximum stack size

```
100 Commands
```

Configurable.

---

# Command Examples

Create Table

```ts
{
    type: "CREATE_TABLE",

    payload: {

        id: "...",

        name: "users",

        x: 200,

        y: 300

    }
}
```

---

Rename Column

```ts
{
    type: "RENAME_COLUMN",

    payload: {

        columnId: "...",

        newName: "email"

    }
}
```

---

Move Table

```ts
{
    type: "MOVE_TABLE",

    payload: {

        tableId: "...",

        x: 900,

        y: 420

    }
}
```

Sent only when drag ends.

---

# Collaboration

Every command

is serialized

and sent through WebSocket.

Other clients

receive

```
REMOTE_COMMAND
```

They execute the same command locally.

---

# Event Generation

Successful execution emits

```
TableCreated

↓

Audit

↓

Socket

↓

Metrics
```

Events are generated only after persistence.

---

# Failure Cases

Validation Error

↓

Reject

Permission Error

↓

Reject

Revision Conflict

↓

Reload

Server Error

↓

Rollback

---

# Idempotency

Every command owns

```
commandId
```

Backend ignores

duplicates.

---

# Replayability

Commands can be replayed

to rebuild the draft state.

Future

Supports

- Time travel
- Audit replay
- Debugging

---

# Performance Targets

```
Dispatch

< 2 ms

Validation

< 5 ms

Optimistic Update

< 16 ms

Rollback

< 20 ms

Undo

< 30 ms
```

---

# Testing

Unit Tests

- Dispatcher
- Registry
- Validation
- Rollback
- Undo
- Redo

Integration Tests

- Full mutation pipeline
- Collaboration replay
- ACK handling

Performance Tests

- 1,000 commands
- 100 undo operations
- 100 redo operations

---

# Engineering Rules

- Components never mutate state directly.
- Hooks never call repositories.
- Every mutation is a command.
- Every command has one handler.
- Every successful command emits events.
- Every failed optimistic update rolls back.
- Every command supports history.

---

# Acceptance Criteria

- Command bus implemented
- Handler registry implemented
- Validation pipeline complete
- Optimistic updates supported
- Rollback implemented
- Undo/Redo implemented
- Collaboration integration complete
- Event generation implemented
- Command replay supported
- Performance targets documented

---

# End of Document

Continue with

```
Projects/schemaFlow/docs/architecture/

07-collaboration-state-machine.md
```