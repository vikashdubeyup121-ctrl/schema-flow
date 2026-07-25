# File

Projects/schemaFlow/docs/frontend/06-features/06-features_PART_11.md

---

# Command Framework & Workspace Actions

The Command Framework is the execution engine of SchemaFlow.

Every user action that mutates the diagram must be represented as a command.

This architecture provides

- Undo / Redo
- Collaboration
- Analytics
- Auditability
- Replay
- Testing
- Extensibility

The UI should never modify stores directly.

Everything executes through commands.

---

# Why Commands?

Instead of

```
Button

↓

Store.setState(...)
```

Every mutation follows

```
Button

↓

Command

↓

Validation

↓

Domain Service

↓

Store

↓

History

↓

Collaboration

↓

Autosave
```

This ensures every mutation follows the exact same pipeline.

---

# Responsibilities

The Command Framework owns

- Command Registration
- Command Execution
- Validation
- Middleware
- History Integration
- Collaboration Integration
- Analytics Events

The framework never owns

- Rendering
- Business Logic
- React Components
- API Implementation

---

# Folder Structure

```
features/

command/

├── commands/
│
├── registry/
│
├── dispatcher/
│
├── middleware/
│
├── services/
│
├── hooks/
│
├── types/
│
├── tests/
│
└── index.ts
```

---

# High-Level Architecture

```
Toolbar

Context Menu

Keyboard

Editor

Properties

↓

Workspace Command

↓

Dispatcher

↓

Middleware

↓

Domain Service

↓

Store

↓

History

↓

Autosave

↓

Collaboration
```

Every execution path is identical.

---

# Base Command

Every command implements

```ts
interface WorkspaceCommand {

    id: string;

    type: string;

    execute(): Promise<void>;

}
```

Undoable commands additionally implement

```ts
interface UndoableCommand
    extends WorkspaceCommand {

    undo(): Promise<void>;

    redo(): Promise<void>;

}
```

---

# Command Categories

```
Table Commands

Column Commands

Relationship Commands

Note Commands

Review Commands

Clipboard Commands

Navigation Commands

Workspace Commands
```

Each category owns its own implementation.

---

# Table Commands

```
CreateTableCommand

RenameTableCommand

MoveTableCommand

ResizeTableCommand

DeleteTableCommand

DuplicateTableCommand

ChangeTableColorCommand

CollapseTableCommand
```

---

# Column Commands

```
CreateColumnCommand

RenameColumnCommand

DeleteColumnCommand

DuplicateColumnCommand

MoveColumnCommand

ChangeDatatypeCommand

ToggleNullableCommand

TogglePrimaryKeyCommand

ToggleUniqueCommand

UpdateColumnNoteCommand
```

---

# Relationship Commands

```
CreateRelationshipCommand

DeleteRelationshipCommand

ReverseRelationshipCommand

UpdateRelationshipCommand
```

Future

```
ConvertRelationshipTypeCommand
```

---

# Note Commands

```
CreateNoteCommand

UpdateNoteCommand

ResizeNoteCommand

MoveNoteCommand

DeleteNoteCommand

DuplicateNoteCommand
```

---

# Review Commands

```
StartReviewCommand

PublishCommand

DiscardDraftCommand

RestoreObjectCommand
```

---

# Clipboard Commands

```
CopyCommand

PasteCommand

DuplicateCommand
```

Future

```
CutCommand
```

---

# Navigation Commands

```
FitViewCommand

ZoomInCommand

ZoomOutCommand

CenterSelectionCommand

FocusObjectCommand
```

These commands

Do not enter

History.

---

# Dispatcher

The dispatcher is the only object allowed to execute commands.

```
execute(command)
```

Responsibilities

- Validation
- Middleware
- Logging
- Metrics
- Execution

---

# Command Registry

Commands are registered once.

```
Registry

↓

Command Type

↓

Constructor
```

Allows future

Plugin support.

---

# Middleware Pipeline

Every command passes through middleware.

```
Validation

↓

Permissions

↓

Review

↓

History

↓

Autosave

↓

Collaboration

↓

Execution
```

Each middleware has one responsibility.

---

# Validation Middleware

Checks

```
Required Fields

Permissions

Current Workspace

Selection

Diagram State
```

Rejects invalid commands.

---

# Permission Middleware

Future

Supports

```
Owner

Editor

Reviewer

Viewer
```

Viewers

Cannot execute

Mutating commands.

---

# Review Middleware

Rejects

Commands

If

Diagram

Is

Publishing.

---

# History Middleware

Undoable commands

Automatically pushed

Into history.

Navigation commands

Ignored.

---

# Autosave Middleware

Marks

Diagram dirty.

Schedules

Autosave.

Never saves immediately.

---

# Collaboration Middleware

Serializes command

↓

Creates

Operation

↓

Queues

↓

Socket

---

# Analytics Middleware

Future

Captures

```
Command Type

Duration

Result

Failure

Latency
```

Useful for

Product analytics.

---

# Error Handling

Command execution

Returns

```ts
type CommandResult =

    | Success

    | Failure;
```

Failure

Contains

```
Code

Message

Details
```

Never throw

User-facing errors.

---

# Retry Strategy

Commands

Should never

Retry automatically

Unless

Marked

Retryable.

Example

```
Network Failure

↓

Retry
```

Validation failures

Never retry.

---

# Transactions

Multiple commands

Can execute

Inside one transaction.

```
Transaction

↓

Command

↓

Command

↓

Command

↓

Commit
```

Rollback

If

Any command fails.

---

# Composite Commands

Example

Duplicate Table

Internally

```
Create Table

↓

Create Columns

↓

Offset Position

↓

Select Table
```

User sees

One action.

---

# Command Context

Every command

Receives

```ts
interface CommandContext {

    userId: string;

    diagramId: string;

    timestamp: number;

}
```

Future

```
Session ID

Workspace Version

Correlation ID
```

---

# Idempotency

Commands

Should be idempotent

Where possible.

Receiving

Same command twice

Must not

Duplicate objects.

---

# Logging

Development

Log

```
Command Name

↓

Duration

↓

Result
```

Production

Log only

Failures.

---

# Feature Integration

Every feature

Owns

Its own commands.

Example

```
features/

table/

commands/

CreateTableCommand.ts

RenameTableCommand.ts
```

No shared

Business commands.

---

# Keyboard Integration

Keyboard shortcuts

Never

Modify stores.

Instead

```
Ctrl+D

↓

DuplicateCommand

↓

Dispatcher
```

---

# Toolbar Integration

Toolbar buttons

Execute commands.

Never

Call services.

---

# Context Menu Integration

Menu Items

Reference

Commands.

No duplicate logic.

---

# Properties Panel Integration

Property changes

Generate

Commands.

Every field

Uses same pipeline.

---

# Editor Integration

DSL parsing

Produces

Commands.

Parser

Never

Touches stores.

---

# Testing

Unit Tests

- Dispatcher
- Middleware
- Registry
- Transactions
- Composite Commands

Integration Tests

- Toolbar
- Keyboard
- Context Menu
- Properties
- DSL

Performance Tests

- 10,000 Commands
- Replay
- Batch Execution

---

# Acceptance Criteria

- Central dispatcher implemented
- Middleware pipeline operational
- Feature commands isolated
- Composite commands supported
- Transactions supported
- History integration complete
- Collaboration integration complete
- Autosave integration complete
- Analytics hooks ready
- Fully typed
- Lint passes
- TypeScript passes
- Unit tests pass

---

# End of Document

Continue with

```
Projects/schemaFlow/docs/frontend/06-features/

06-features_PART_12.md
```