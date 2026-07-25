# File

Projects/schemaFlow/docs/frontend/05-diagram-components/05-diagram-components_PART_5.md

---

# Floating Note Component Deep Dive

Floating Notes allow users to document architecture, assumptions, TODOs, business rules, migration plans, and other metadata directly on the canvas.

Unlike Column Notes, Floating Notes are free-positioned objects.

They behave similarly to sticky notes in tools like FigJam, Miro and Excalidraw.

Floating Notes are first-class canvas entities.

---

# Responsibilities

The Floating Note component renders

- Note Container
- Title
- Markdown Content
- Resize Handles
- Drag Preview
- Selection
- Hover
- Review State

The component never

- Saves notes
- Parses markdown
- Validates markdown
- Handles collaboration
- Performs autosave

---

# Directory Structure

```
features/

note/

components/

FloatingNote/

├── FloatingNote.tsx
├── FloatingNote.types.ts
├── FloatingNote.styles.ts
├── FloatingNote.constants.ts
├── FloatingNote.test.tsx
├── index.ts
│
├── NoteHeader/
│
├── NoteBody/
│
├── NoteFooter/
│
├── ResizeHandle/
│
├── ReviewOverlay/
│
├── SelectionOverlay/
│
└── HoverOverlay/
```

---

# Public API

Only expose

```
FloatingNote

FloatingNoteProps
```

Everything else remains private.

---

# Props

```ts
interface FloatingNoteProps {

    noteId: string;

}
```

Never pass

```
Complete Note Object
```

Selectors should provide

Current state.

---

# Note Model

```ts
interface Note {

    id: string;

    title: string;

    markdown: string;

    color: NoteColor;

    position: Point;

    width: number;

    height: number;

}
```

Future

```
Pinned

Locked

Collapsed

Archived
```

---

# Internal Component Tree

```
Floating Note

│

├── Selection Overlay

├── Review Overlay

├── Hover Overlay

├── Header

├── Markdown Body

├── Footer

└── Resize Handle
```

---

# Header

Displays

```
Title

Color

Context Menu
```

Future

```
Author

Timestamp

Presence

Comments
```

---

# Body

Markdown only.

Markdown rendering uses

```
react-markdown
```

Raw HTML

Disabled.

Always sanitize.

---

# Footer

Reserved for

Future

```
Created Date

Updated Date

Author

Word Count
```

Keep component separate.

---

# Markdown Features

Supported

```
Headings

Bold

Italic

Lists

Tables

Code Blocks

Inline Code

Links

Block Quotes
```

Unsupported

```
Raw HTML

Scripts

Embedded Iframes
```

Security first.

---

# Editing Flow

```
Double Click

↓

Edit Mode

↓

Markdown Editor

↓

Save

↓

Render Markdown
```

Only one note editable

At a time.

---

# Resize Rules

Minimum

```
200 x 120
```

Maximum

Unlimited.

---

# Color System

Colors

Configured

Through theme.

Examples

```
Yellow

Blue

Green

Purple

Gray
```

Future

User-defined palettes.

---

# Hover State

Hover reveals

```
Resize Handle

Context Menu

Quick Actions
```

Hover should never trigger

Expensive rerenders.

---

# Selection State

Selected notes display

```
Selection Border

Resize Handles
```

Selection logic belongs

Store.

---

# Review State

Supported

```
Created

Modified

Deleted

Published
```

Review styling

Same system

As tables.

---

# Dragging

Dragging uses

```
Transform

↓

Preview

↓

Commit
```

Never

top/left.

---

# Accessibility

Notes support

- Keyboard navigation
- Screen readers
- Focus outlines
- Markdown editing shortcuts

---

# Context Menu

```
Rename

Duplicate

Delete

Copy

Change Color
```

Future

```
Convert to Comment

Lock

Pin
```

---

# Toolbar Architecture

The Canvas Toolbar is the primary interaction surface.

Every editing action begins here.

---

# Responsibilities

Toolbar renders

- Pointer Tool
- Hand Tool
- Table Tool
- Relationship Tool
- Note Tool
- Zoom Controls
- Undo
- Redo
- Search
- Review
- Publish

Toolbar never

Manipulates

Canvas directly.

---

# Folder Structure

```
widgets/

workspace/

Toolbar/

├── CanvasToolbar.tsx
├── ToolbarButton.tsx
├── ToolbarGroup.tsx
├── ToolbarSeparator.tsx
├── ToolbarSearch.tsx
├── ToolbarZoom.tsx
├── ToolbarReview.tsx
├── ToolbarPublish.tsx
└── index.ts
```

---

# Toolbar Layout

```
+------------------------------------------------+

Pointer

Hand

+

Table

Relationship

Note

|

Undo

Redo

|

Zoom

Fit

|

Search

|

Review

Publish

+------------------------------------------------+
```

Toolbar should remain

Centered.

---

# Tool Registration

Every tool implements

```ts
interface WorkspaceTool {

    id: string;

    name: string;

    icon: ReactNode;

    shortcut: string;

    activate(): void;

}
```

Toolbar discovers tools.

Never hardcode.

---

# Active Tool

Only one active tool.

```
Pointer

Hand

Table

Relationship

Note
```

Canvas reads

Interaction Store.

---

# Zoom Controls

Supported

```
Zoom In

Zoom Out

Reset

Fit View
```

Future

```
Zoom To Selection
```

---

# Search

Search opens

```
Command Palette

or

Search Panel
```

Future

```
Ctrl + K
```

---

# Review Button

Displays

Current review status.

Future

Pending changes count.

---

# Publish Button

Visible only

If user has permission.

Future

Approval workflow.

---

# Responsive Behavior

Toolbar remains

Single row.

Overflow

Moves into

```
More Menu
```

Future.

---

# Toolbar Performance

Toolbar should never rerender

Because

Canvas changes.

Subscribe only

To

```
Current Tool

Zoom

Review Status
```

---

# Testing

Toolbar Tests

- Tool Switching
- Keyboard Shortcuts
- Zoom
- Publish
- Review
- Search

---

# Acceptance Criteria

- Floating Notes fully functional
- Markdown rendering secure
- Toolbar extensible
- Active Tool synchronized
- Independent rerenders
- Keyboard accessible
- Lint passes
- TypeScript passes

---