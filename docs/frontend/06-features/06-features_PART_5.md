# File

Projects/schemaFlow/docs/frontend/06-features/06-features_PART_5.md

---

# Undo / Redo Feature

Undo and Redo are core editor capabilities.

Every user action that modifies the diagram must be reversible.

Undo is implemented using the Command Pattern.

Never snapshot the entire diagram after every change.

Instead, record operations.

---

# Responsibilities

The History Feature owns

- Undo
- Redo
- Command History
- Transaction Grouping
- History Limits
- Command Replay

The History Feature does NOT own

- Rendering
- Canvas
- API
- WebSockets

---

# Directory Structure

```
features/

history/

├── commands/
│
├── services/
│
├── stores/
│
├── types/
│
├── hooks/
│
├── tests/
│
└── index.ts
```

---

# Command Pattern

Every mutating action implements

```ts
interface Command {

    id: string;

    type: string;

    execute(): Promise<void>;

    undo(): Promise<void>;

    redo(): Promise<void>;

}
```

Every feature should expose commands.

Never mutate stores directly.

---

# Examples

```
Create Table Command

Rename Table Command

Delete Table Command

Create Column Command

Move Table Command

Resize Table Command

Create Relationship Command

Delete Relationship Command
```

---

# History Store

```ts
interface HistoryState {

    undoStack: Command[];

    redoStack: Command[];

}
```

History size configurable.

---

# History Flow

```
User Action

↓

Command

↓

Execute

↓

Push Undo Stack

↓

Clear Redo Stack
```

---

# Undo Flow

```
Undo

↓

Pop Undo

↓

Undo Command

↓

Push Redo
```

---

# Redo Flow

```
Redo

↓

Pop Redo

↓

Redo Command

↓

Push Undo
```

---

# Transaction Grouping

Typing

```
hello
```

should NOT create

```
5 undo operations
```

Instead

```
Typing Session

↓

One Command
```

Grouping window

```
500ms
```

Configurable.

---

# Composite Commands

Some actions create

Multiple commands.

Example

Delete Table

↓

Delete Relationships

↓

Delete Notes

↓

Delete Columns

↓

Delete Table

These execute as

One Composite Command.

---

# Command IDs

Every command owns

```
UUID
```

Useful for

- Logging
- Replay
- Collaboration

---

# History Limit

Default

```
100 Operations
```

Oldest commands

Discarded first.

Configurable.

---

# Non-Undoable Operations

Examples

```
Login

Logout

Theme Change

Viewport Movement
```

Should never enter

History.

---

# Autosave Integration

Undo

Should NOT

Trigger autosave

For every intermediate state.

Autosave

Debounced.

---

# Collaboration Integration

History

Is local.

Remote edits

Never appear

Inside local undo stack.

Future

Operational Transform.

---

# Review Integration

Undo

Before publish

Allowed.

After publish

History cleared.

---

# Acceptance Criteria

- Undo works
- Redo works
- Composite commands supported
- Typing grouped
- History capped
- Lint passes
- TypeScript passes

---

# Search Feature

Search enables users to quickly navigate large diagrams.

Search should feel instantaneous.

---

# Responsibilities

Search indexes

```
Tables

Columns

Relationships

Floating Notes

Column Notes
```

Future

```
Comments

History

Users
```

---

# Directory Structure

```
features/

search/

├── components/
├── hooks/
├── services/
├── stores/
├── types/
├── tests/
└── index.ts
```

---

# Search Architecture

```
Objects

↓

Indexer

↓

Search Index

↓

Query

↓

Results
```

Index

Always derived.

Never manually maintained.

---

# Search Index

Indexes

```
Table Name

Column Name

Relationship

Datatype

Notes
```

Future

```
Descriptions

Tags
```

---

# Search Service

Responsibilities

```
Index

Search

Highlight

Ranking
```

No rendering.

---

# Search Ranking

Priority

```
Exact Match

↓

Starts With

↓

Contains

↓

Fuzzy
```

Future

Levenshtein.

---

# Search Results

Result

Contains

```
Object ID

Object Type

Title

Subtitle

Highlight Ranges
```

---

# Search Navigation

Selecting result

```
Center Camera

↓

Highlight Object

↓

Open Inspector
```

---

# Keyboard Shortcut

```
Ctrl + K
```

Opens search.

---

# Empty Search

Display

```
No Results Found
```

Suggest

Closest matches.

---

# Search Performance

Target

```
5000 Objects

↓

<50ms
```

---

# Acceptance Criteria

- Search tables
- Search columns
- Search notes
- Camera centers
- Keyboard shortcut
- Fully typed

---

# Import Feature

Import allows existing schemas to be brought into SchemaFlow.

---

# Supported Formats

Phase 1

```
DBML

SchemaFlow JSON
```

Future

```
SQL

Prisma

Drizzle

Hibernate

Entity Framework
```

---

# Import Pipeline

```
File

↓

Parser

↓

AST

↓

Validation

↓

Commands

↓

Canvas
```

Never

Manipulate stores directly.

---

# Validation

Checks

```
Duplicate Tables

Duplicate Columns

Broken Relationships

Unknown Types
```

Reject

Invalid imports.

---

# Import Preview

Before importing

Show

```
Tables

Columns

Relationships

Warnings

Errors
```

User confirms.

---

# Acceptance Criteria

- DBML import
- JSON import
- Validation
- Preview
- Rollback on failure

---

# Export Feature

Export always uses

Canonical Model.

Never

Canvas.

---

# Supported Formats

Phase 1

```
DBML

SchemaFlow JSON

PNG

SVG
```

Future

```
PDF

SQL

Prisma

Drizzle
```

---

# Export Pipeline

```
Diagram

↓

Serializer

↓

Formatter

↓

Download
```

---

# PNG Export

Uses

Viewport

or

Entire Diagram

Configurable.

---

# SVG Export

Vector export.

Supports

Infinite zoom.

---

# DBML Export

Uses

DSL Serializer.

Generated output

Must round-trip.

Meaning

```
Import

↓

Export

↓

Import

↓

Same Diagram
```

---

# Acceptance Criteria

- Export DBML
- Export JSON
- Export PNG
- Export SVG
- Round-trip verified

---

# Autosave Feature

Autosave continuously protects user work.

Users should never think about saving.

---

# Save Triggers

```
Table Create

Rename

Move

Resize

Column Edit

Relationship

Note Edit
```

---

# Debounce

Default

```
1500ms
```

Configurable.

---

# Autosave Pipeline

```
Change

↓

Dirty State

↓

Debounce

↓

API

↓

Success

↓

Clear Dirty
```

---

# Dirty State

Every diagram

Tracks

```
isDirty
```

Status Bar

Displays

```
Saving...

Saved

Offline
```

---

# Failure Handling

Failures

Retry

Exponential Backoff.

Never lose

User changes.

---

# Offline Support

Future

Queue mutations

Until online.

---

# Acceptance Criteria

- Autosave works
- Debounced
- Status visible
- Retry on failure
- Optimistic UI
- Type-safe

---

# End of Document

Continue with

```
Projects/schemaFlow/docs/frontend/06-features/

06-features_PART_6.md
```