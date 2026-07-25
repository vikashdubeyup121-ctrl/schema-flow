# File

Projects/schemaFlow/docs/frontend/05-diagram-components/05-diagram-components_PART_7.md

---

# Workspace Layout Components

The Workspace is where users spend approximately 95% of their time.

Every layout component should be predictable, independent and replaceable.

The Workspace is composed of multiple widgets that communicate through stores rather than directly with each other.

---

# Workspace Layout

```
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│                            Canvas Toolbar                                  │
│                                                                            │
├──────────────┬────────────────────────────────────────────┬────────────────┤
│              │                                            │                │
│              │                                            │                │
│              │                                            │                │
│              │                                            │                │
│ Editor       │                                            │  Properties    │
│ Sidebar      │              Canvas                        │    Panel       │
│              │                                            │                │
│              │                                            │                │
│              │                                            │                │
│              │                                            │                │
├──────────────┴────────────────────────────────────────────┴────────────────┤
│ Status Bar                                             Mini Map            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

# Workspace Widget

Folder

```
widgets/

workspace/

WorkspaceWidget/

├── WorkspaceWidget.tsx
├── WorkspaceWidget.test.tsx
├── WorkspaceWidget.types.ts
└── index.ts
```

Responsibilities

- Layout composition
- Provider composition
- Feature initialization
- Route synchronization

Workspace Widget never owns business logic.

---

# Component Composition

```
WorkspaceWidget

│

├── Toolbar

├── Left Dock

│   └── Editor Sidebar

├── Center Region

│   └── Canvas

├── Right Dock

│   └── Properties Panel

├── MiniMap

├── Status Bar

└── Dialog Host
```

---

# Left Dock

Current content

```
Editor Sidebar
```

Future

```
Explorer

Assets

Templates

History
```

Dock architecture should support

Multiple panels.

---

# Right Dock

Current content

```
Properties Panel
```

Future

```
Review

Comments

Activity

Git History

AI Assistant
```

Panel switching should be supported.

---

# Bottom Region

Contains

```
Status Bar
```

Future

```
Notifications

Logs

Task Queue

Background Jobs
```

---

# Floating Components

Floating UI should never affect layout.

Supported

```
Mini Map

Context Menu

Dialogs

Tooltips

Command Palette

Toast Notifications
```

All rendered through portals.

---

# Dialog Host

Only one Dialog Host exists.

```
Dialog Store

↓

Dialog Host

↓

Specific Dialog
```

Never render dialogs

Inside feature components.

---

# Supported Dialogs

```
Rename

Delete Confirmation

Import

Export

Share

Publish

Review

Settings
```

Future

Plugin dialogs.

---

# Toast System

Folder

```
shared/

components/

Toast/
```

Types

```
Success

Info

Warning

Error
```

Maximum

```
3 visible toasts
```

Queue remaining.

---

# MiniMap Component

Folder

```
widgets/

workspace/

MiniMap/
```

Responsibilities

- Viewport visualization
- Viewport navigation

Never

Compute

Canvas state.

---

# MiniMap Rendering

Receives

```
Viewport

↓

Visible Nodes

↓

Render
```

Read only.

---

# Status Bar

Displays

```
Zoom

Selection Count

Current Tool

Grid Status

Autosave

Review Mode
```

Future

```
Connected Users

Latency

Server Status

FPS
```

---

# Status Bar Layout

```
Zoom

|

Selection

|

Grid

|

Autosave

|

Review

|

Users
```

Should remain compact.

---

# Empty Workspace

Shown when

Diagram contains

No tables.

Display

```
Create First Table

OR

Import Schema

OR

Use AI

OR

Paste DSL
```

Provide

Actionable entry points.

---

# Skeleton Components

Every async UI

Should have

Skeleton.

Supported

```
Dashboard

Project List

Diagram List

Workspace

Properties

Editor

Review
```

Never

Show blank screen.

---

# Error Boundary Placement

```
App

↓

Workspace

↓

Canvas

↓

Properties

↓

Editor
```

Failure in Editor

Should not crash

Canvas.

---

# Theme Support

All components support

```
Light

Dark
```

Future

```
High Contrast

Custom Themes

Organization Themes
```

Never hardcode colors.

---

# Responsive Strategy

Phase 1

Desktop only.

Minimum width

```
1280px
```

Future

Tablet.

Mobile

Not supported.

---

# Focus Management

Workspace owns focus.

Possible focus targets

```
Canvas

Editor

Properties

Dialog

Command Palette

Context Menu
```

Only one active.

---

# Portal Strategy

Always render

Outside workspace

```
Dialog

Popover

Tooltip

Context Menu

Toast
```

Using React Portal.

Avoid

```
overflow:hidden
```

Issues.

---

# Global Shortcut Priority

Priority

```
Dialog

↓

Editor

↓

Command Palette

↓

Canvas

↓

Workspace
```

Example

Typing

Inside Editor

Should never trigger

Canvas Delete.

---

# Workspace Initialization

Flow

```
Route

↓

Load Diagram

↓

Initialize Stores

↓

Restore Viewport

↓

Render Canvas

↓

Connect Socket

↓

Enable Autosave
```

Initialization order

Must remain deterministic.

---

# Workspace Cleanup

On exit

```
Disconnect Socket

↓

Remove Listeners

↓

Clear Selection

↓

Flush Pending Saves

↓

Destroy Stores
```

Prevent memory leaks.

---

# Loading Strategy

Workspace loading

```
Load Diagram

↓

Skeleton

↓

Canvas

↓

Restore Viewport

↓

Fade In
```

Never

Flash

Empty canvas.

---

# Error Recovery

Failures

```
Network

↓

Retry

Permission

↓

Redirect

Diagram Missing

↓

404

Server Error

↓

Retry Dialog
```

Never

Leave user

On broken screen.

---

# Performance Targets

Workspace

```
Open Diagram

< 1 second
```

Canvas

```
Drag

60 FPS
```

Zoom

```
No frame drops
```

Selection

```
<16ms
```

---

# Accessibility

Workspace supports

- Full keyboard navigation
- Screen readers
- Focus outlines
- High contrast
- ARIA landmarks

---

# Verification Checklist

Verify

- Workspace Layout
- Toolbar
- Editor
- Canvas
- Properties
- MiniMap
- Status Bar
- Dialog Host
- Responsive Layout
- Keyboard Navigation
- Theme Switching
- Error Boundaries
- Performance

---

# Definition of Done

Workspace components are complete when

- Layout is stable
- Components are isolated
- Communication occurs only through stores
- All floating UI uses portals
- No direct feature coupling
- Performance targets met
- Accessibility verified
- Unit tests pass
- Component tests pass
- Lint passes
- TypeScript passes

---

# End of Document

**Document Complete**

```
Projects/schemaFlow/docs/frontend/

05-diagram-components/

├── 05-diagram-components_PART_1.md
├── 05-diagram-components_PART_2.md
├── 05-diagram-components_PART_3.md
├── 05-diagram-components_PART_4.md
├── 05-diagram-components_PART_5.md
├── 05-diagram-components_PART_6.md
└── 05-diagram-components_PART_7.md
```

**Next Document**

```
Projects/schemaFlow/docs/frontend/

06-features/

06-features_PART_1.md
```

The next document will be the largest in the frontend handbook. It will specify every business feature in detail, including:

- Table Management
- Column Management
- Relationship Management
- Note Management
- Canvas Tools
- Undo / Redo
- Copy / Paste
- Duplicate
- Delete
- Search
- Import / Export
- Autosave
- Command Palette
- Keyboard Shortcuts
- DSL Synchronization
- Review Workflow Integration

Each feature will include architecture, state ownership, APIs, events, UI flow, edge cases, testing strategy, and verification checklist.