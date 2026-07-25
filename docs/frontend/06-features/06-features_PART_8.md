# File

Projects/schemaFlow/docs/frontend/06-features/06-features_PART_8.md

---

# Canvas Interaction Feature

The Canvas Interaction Feature is responsible for every user interaction inside the workspace.

It is the orchestration layer between

- User Input
- Canvas
- Commands
- Selection
- Features

This is one of the most critical modules in the application.

---

# Responsibilities

Owns

- Mouse interactions
- Keyboard interactions
- Selection
- Dragging
- Resizing
- Multi Selection
- Panning
- Zooming
- Tool Switching
- Clipboard Shortcuts

Does NOT own

- Rendering
- Business Logic
- Networking
- Review Logic

---

# Directory Structure

```
features/

interaction/

├── commands/
│
├── hooks/
│
├── services/
│   ├── interaction.service.ts
│   ├── drag.service.ts
│   ├── resize.service.ts
│   ├── selection.service.ts
│   ├── keyboard.service.ts
│   ├── pointer.service.ts
│   ├── clipboard.service.ts
│   ├── hitTest.service.ts
│   └── hover.service.ts
│
├── stores/
│   ├── interaction.store.ts
│   ├── selection.store.ts
│   ├── keyboard.store.ts
│   └── hover.store.ts
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

# Architecture

```
Browser Event

↓

Pointer Service

↓

Interaction Service

↓

Command

↓

Store

↓

Canvas
```

Every interaction follows this pipeline.

---

# Interaction Modes

Only one interaction mode can be active.

```ts
enum InteractionMode {

    Idle,

    Hover,

    Selecting,

    Dragging,

    Resizing,

    Connecting,

    Editing,

    Panning,

}
```

Mode transitions are controlled by the Interaction Service.

---

# Active Tool

Current tool

```ts
enum WorkspaceTool {

    Pointer,

    Hand,

    Table,

    Relationship,

    Note,

}
```

Changing tools changes interaction behavior.

---

# Pointer Tool

Behavior

```
Click

↓

Selection

Drag

↓

Selection Box

Drag Table

↓

Move

Double Click

↓

Rename
```

---

# Hand Tool

Behavior

```
Mouse Drag

↓

Pan

Click

↓

Nothing

Selection

↓

Disabled
```

---

# Table Tool

Behavior

```
Click Canvas

↓

Create Table

↓

Return Pointer Tool
```

Configurable

Future

Persistent creation mode.

---

# Note Tool

Behavior

```
Click Canvas

↓

Create Note

↓

Return Pointer Tool
```

---

# Relationship Tool

Behavior

```
Click Handle

↓

Drag

↓

Drop

↓

Relationship Created
```

Invalid target

↓

Cancel.

---

# Selection Store

Owns

```
Selected Tables

Selected Columns

Selected Relationships

Selected Notes
```

Single source of truth.

---

# Selection Rules

Supported

```
Single Selection

Ctrl + Click

Shift + Click

Selection Box

Select All
```

---

# Multi Selection

Selection

Maintains

Stable order.

Useful for

```
Copy

Delete

Alignment

Distribution
```

---

# Selection Priority

Priority

```
Column

↓

Relationship

↓

Table

↓

Note

↓

Canvas
```

Only one inspector

Displayed.

---

# Selection Box

Flow

```
Pointer Down

↓

Drag

↓

Bounding Box

↓

Hit Test

↓

Selection
```

Selection box

Never mutates

Objects.

---

# Hit Testing

Order

```
Resize Handle

↓

Connection Handle

↓

Column

↓

Relationship

↓

Table

↓

Note

↓

Canvas
```

Most specific target wins.

---

# Dragging

Drag Pipeline

```
Pointer Down

↓

Capture

↓

Preview

↓

Move Command

↓

Commit
```

Never

Update backend

Per mouse move.

---

# Drag Threshold

Prevent accidental drags.

Default

```
4 pixels
```

Below threshold

Treat as click.

---

# Drag Preview

During dragging

Use

```
transform: translate3d(...)
```

Avoid

```
left

top
```

GPU acceleration.

---

# Multi Drag

Dragging multiple objects

Moves

Entire selection.

Relative positions

Remain unchanged.

---

# Resize Feature

Resizable

```
Tables

Notes
```

Future

Frames.

---

# Resize Rules

Minimum sizes

Validated

Before commit.

Never allow

Negative dimensions.

---

# Hover Feature

Hover Store

Owns

```
Hovered Table

Hovered Column

Hovered Relationship

Hovered Note
```

Hover

Cleared

On pointer leave.

---

# Connected Highlighting

Hovering

A column

Highlights

```
Source Table

↓

Relationship

↓

Target Table

↓

Target Column
```

Computed

By graph service.

---

# Keyboard Service

Owns

Global shortcuts.

Never

Directly manipulates

Stores.

---

# Supported Shortcuts

```
Delete

Ctrl+C

Ctrl+V

Ctrl+D

Ctrl+Z

Ctrl+Shift+Z

Ctrl+Y

Ctrl+A

Ctrl+K

F2

Escape

Space
```

---

# Shortcut Priority

```
Dialog

↓

Editor

↓

Property Panel

↓

Canvas

↓

Workspace
```

Typing inside editor

Must never

Delete tables.

---

# Escape Behavior

Escape

Cancels

```
Selection Box

Drag

Resize

Connection

Rename

Context Menu
```

Returns

Idle state.

---

# Clipboard Shortcuts

Supported

```
Ctrl+C

Ctrl+V

Ctrl+D
```

Future

```
Ctrl+X
```

---

# Double Click

Double clicking

```
Table Header

↓

Rename Table

Column

↓

Rename Column

Note

↓

Rename Note
```

Double click

Threshold

```
250ms
```

---

# Context Menu Trigger

```
Right Click

↓

Hit Test

↓

Menu

↓

Command
```

---

# Scroll Wheel

Behavior

```
Wheel

↓

Zoom

Shift + Wheel

↓

Horizontal Pan

Trackpad

↓

Native Pan
```

Configurable.

---

# Zoom Shortcuts

```
Ctrl + +

Ctrl + -

Ctrl + 0

Ctrl + Mouse Wheel
```

---

# Focus Management

Only one component

May own keyboard focus.

Possible owners

```
Canvas

Editor

Property Panel

Dialog

Context Menu
```

---

# Interaction Cancellation

Any interaction

Can be cancelled.

Example

```
Drag

↓

Escape

↓

Restore Original Position
```

---

# Interaction Locking

While dragging

Disable

```
Rename

Context Menu

Selection Box

Properties Editing
```

Prevents

Conflicting interactions.

---

# Pointer Capture

Always capture pointer

During

```
Drag

Resize

Relationship Creation
```

Release

On completion.

---

# Browser Compatibility

Support

```
Chrome

Edge

Safari

Firefox
```

Desktop only.

---

# Performance Targets

Interaction latency

```
<16ms
```

Drag

```
60 FPS
```

Selection

```
<10ms
```

Hover

```
<8ms
```

---

# Testing

Unit Tests

- Selection
- Drag
- Resize
- Hover
- Keyboard
- Tool Switching

Integration Tests

- Multi Selection
- Copy/Paste
- Drag Multiple
- Resize
- Relationship Creation

Performance Tests

- 5,000 Objects
- Continuous Drag
- Zoom
- Selection

---

# Acceptance Criteria

- All interaction modes implemented
- Selection works correctly
- Multi-selection supported
- Dragging optimized
- Resize validated
- Keyboard shortcuts functional
- Pointer capture implemented
- GPU transforms used
- Lint passes
- TypeScript passes
- Unit tests pass

---

# End of Document

Continue with

```
Projects/schemaFlow/docs/frontend/06-features/

06-features_PART_9.md
```