# File

Projects/schemaFlow/docs/frontend/02-canvas-engine/02-canvas-engine_PART_5.md

---

# Event Architecture

The Canvas Engine is an event-driven system.

Every interaction inside the canvas is represented as an event.

No component should directly manipulate another component.

Everything flows through events.

```
Browser

↓

Canvas Event

↓

Canvas Service

↓

Feature Service

↓

Store

↓

Renderer
```

---

# Event Principles

Every event must be

- Immutable
- Serializable
- Replayable
- Debuggable
- Versioned

This enables

- Collaboration
- Undo / Redo
- Time Travel
- Event Replay
- Analytics

---

# Event Categories

```
Canvas Events

Selection Events

Table Events

Relationship Events

Column Events

Note Events

Viewport Events

Keyboard Events

Clipboard Events
```

Never mix unrelated categories.

---

# Canvas Events

Examples

```ts
CANVAS_CLICK

CANVAS_DOUBLE_CLICK

CANVAS_CONTEXT_MENU

CANVAS_PAN_START

CANVAS_PAN

CANVAS_PAN_END

CANVAS_ZOOM
```

---

# Table Events

```ts
TABLE_CREATED

TABLE_SELECTED

TABLE_MOVED

TABLE_RESIZED

TABLE_RENAMED

TABLE_COLOR_CHANGED

TABLE_DELETED
```

---

# Column Events

```ts
COLUMN_CREATED

COLUMN_UPDATED

COLUMN_MOVED

COLUMN_DELETED

COLUMN_NOTE_UPDATED
```

---

# Relationship Events

```ts
RELATIONSHIP_CREATED

RELATIONSHIP_UPDATED

RELATIONSHIP_DELETED

RELATIONSHIP_SELECTED
```

---

# Note Events

```ts
NOTE_CREATED

NOTE_UPDATED

NOTE_RESIZED

NOTE_MOVED

NOTE_DELETED
```

---

# Viewport Events

```ts
VIEWPORT_CHANGED

ZOOM_CHANGED

PAN_CHANGED

FIT_CONTENT

CENTER_VIEW
```

---

# Keyboard Events

```ts
DELETE

ESCAPE

COPY

PASTE

UNDO

REDO

SELECT_ALL
```

---

# Clipboard Events

```ts
COPY

CUT

PASTE

DUPLICATE
```

---

# Standard Event Interface

Every event should follow a common contract.

```ts
interface CanvasEvent<T> {

    id: string;

    type: string;

    timestamp: number;

    payload: T;

}
```

Future

User information

Session information

Correlation IDs

can be added without changing consumers.

---

# Event Lifecycle

```
User

↓

DOM Event

↓

Normalized Event

↓

Canvas Event

↓

Validation

↓

Execution

↓

Store Update

↓

Render

↓

Socket Broadcast

↓

Autosave
```

Every event follows this lifecycle.

---

# Event Validation

Every event must be validated.

Example

Bad

```
Move Table

↓

Negative Width
```

Reject.

Validation belongs to services.

Never components.

---

# Event Queue

Future architecture.

```
Incoming Events

↓

Queue

↓

Execution

↓

Completed
```

Benefits

- Replay
- Retry
- Logging
- Analytics

---

# Event Bus

Canvas should expose an internal event bus.

Structure

```
events/

eventBus.ts

eventTypes.ts

eventHandlers.ts

eventRegistry.ts
```

Purpose

Decouple producers from consumers.

---

# Event Registry

Each feature registers handlers.

Example

```
TABLE_MOVED

↓

Table Feature
```

```
VIEWPORT_CHANGED

↓

Canvas Feature
```

No switch statements containing every event.

---

# Event Ordering

Events must execute in order.

Example

Correct

```
TABLE_CREATED

↓

COLUMN_CREATED

↓

RELATIONSHIP_CREATED
```

Never

```
RELATIONSHIP_CREATED

↓

TABLE_CREATED
```

---

# Event Idempotency

Repeated events should produce the same final state.

Example

```
Move Table

↓

Same Position

↓

No Changes
```

Avoid duplicate processing.

---

# Event Logging

Development mode.

Every event logged.

Example

```
10:20:01

TABLE_MOVED

table_12

x=450

y=220
```

Production

Disabled.

Except

Errors.

---

# Event Replay

Future capability.

```
Event Log

↓

Replay

↓

Canvas Restored
```

Enables

- Debugging
- Bug reproduction
- Session playback

---

# Interaction Engine

The Interaction Engine coordinates all user interactions.

It does not own rendering.

It orchestrates

```
Mouse

Keyboard

Pointer

Clipboard

Selection
```

---

# Interaction Flow

```
Pointer Down

↓

Determine Target

↓

Determine Mode

↓

Execute Interaction

↓

Commit

↓

Cleanup
```

Every interaction follows identical flow.

---

# Interaction Modes

```
Idle

Hover

Selecting

Dragging

Resizing

Connecting

Editing

Panning
```

Only one active.

---

# Interaction Lock

Some interactions prevent others.

Example

While dragging

```
No Selection

No Context Menu

No Editing
```

Interaction store owns locking.

---

# Pointer Capture

During drag

Pointer should be captured.

Benefits

- Smooth drag
- No event loss
- Cursor outside canvas still tracked

Release capture

Immediately after interaction ends.

---

# Double Click Detection

Never rely on browser defaults.

Implement

```
Single Click

↓

Timer

↓

Second Click

↓

Double Click
```

Threshold configurable.

---

# Long Press

Reserved for future

Touch support.

Current MVP

Desktop only.

Architecture should support future addition.

---

# Context Menu Engine

Flow

```
Right Click

↓

Hit Test

↓

Determine Target

↓

Generate Menu

↓

Render
```

Context menu content determined by target.

---

# Context Menu Targets

```
Canvas

Table

Column

Relationship

Note
```

Each target contributes menu items.

---

# Command Pattern

Context menu actions should be represented as commands.

```ts
interface CanvasCommand {

    id: string;

    label: string;

    execute(): void;

}
```

Future

Command Palette

can reuse same commands.

---

# Cursor Management

Cursor reflects interaction.

Examples

```
Default

Pointer

Move

Grab

Grabbing

Resize

Crosshair

Text
```

Cursor controlled centrally.

Not individual components.

---

# Drag Cursor

Lifecycle

```
Grab

↓

Grabbing

↓

Grab
```

Do not manually update CSS in multiple components.

---

# Focus Management

Only one active focus owner.

Possible owners

```
Canvas

Property Panel

Dialog

Input

Context Menu
```

Keyboard shortcuts depend on focus owner.

---

# Focus Rules

If text input focused

Disable

```
Delete

Undo

Copy

Paste
```

Canvas shortcuts should never interfere with typing.

---

# Escape Behavior

Escape should consistently

```
Cancel Current Interaction

↓

Clear Temporary State

↓

Return Idle
```

Never perform unrelated actions.

---

# Interaction Performance

Target

```
Input

↓

Visual Response

<16ms
```

Users should perceive interactions as immediate.

---

# Interaction Anti-Patterns

Never

- Trigger API requests during drag
- Perform database synchronization on every pointer move
- Allocate objects every mouse move
- Traverse every table on pointer move
- Recreate event handlers every render
- Depend on DOM queries for interaction logic

Interactions should be predictable, stateless where possible, and coordinated through the Interaction Engine.

---