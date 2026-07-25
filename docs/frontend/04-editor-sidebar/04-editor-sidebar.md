# File

docs/frontend/04-editor-sidebar/04-editor-sidebar.md

---

# Editor Sidebar

The Editor Sidebar provides a text-based interface for defining database schemas using a DSL, similar to dbdiagram.io.

Users can define tables by typing code, and the canvas updates in real time.

Conversely, adding or renaming tables on the canvas updates the DSL text.

---

# DSL Syntax

```
Table users {
  id uuid [pk]
  email varchar [not null, unique]
  name varchar
  created_at timestamp [default: `now()`]
}

Table posts {
  id uuid [pk]
  user_id uuid [ref: > users.id]
  title varchar
  body text
  created_at timestamp
}

Ref: posts.user_id > users.id
```

---

# DSL Rules

## Table Definition

```
Table <name> {
  <column> <type> [<constraints>]
}
```

## Column Constraints

| Constraint | Meaning |
|------------|---------|
| `[pk]` | Primary key |
| `[not null]` | Non-nullable |
| `[unique]` | Unique |
| `[ref: > <table>.<col>]` | One-to-many relationship |
| `[ref: < <table>.<col>]` | Many-to-one relationship |
| `[ref: - <table>.<col>]` | One-to-one relationship |

## Ref Statement

```
Ref: <table1>.<col1> > <table2>.<col2>
```

## Comments

```
// This is a comment
```

---

# Architecture

```
features/editor/
  components/
    EditorPanel/
      EditorPanel.tsx
      index.ts
  hooks/
    useEditorSync.ts
    index.ts
  services/
    dslParser.service.ts     — DSL text → AST
    dslSerializer.service.ts — canvas state → DSL text
    index.ts
  stores/
    editor.store.ts          — dsl text, sidebar open/width state
    index.ts
  types/
    DslAst.ts                — parsed AST types
    index.ts
  index.ts
```

---

# DSL AST

```ts
// features/editor/types/DslAst.ts

export interface DslColumn {
  name: string;
  dataType: string;
  primaryKey: boolean;
  notNull: boolean;
  unique: boolean;
  defaultValue: string | null;
  refTarget: string | null;   // "table.column" string
  refType: '>' | '<' | '-' | null;
}

export interface DslTable {
  name: string;
  columns: DslColumn[];
}

export interface DslRef {
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  type: '>' | '<' | '-';
}

export interface DslAst {
  tables: DslTable[];
  refs: DslRef[];
}
```

---

# Parser

```
services/dslParser.service.ts
```

Input: DSL string

Output: `DslAst`

Rules:
- Lines starting with `//` are comments, ignored
- `Table <name> {` opens a table block
- `}` closes the current block
- Inside a table block, each non-empty line is a column definition
- `Ref:` lines define explicit relationships

Parser is pure (no side effects).

Parser is fault-tolerant: malformed lines are skipped rather than throwing.

---

# Serializer

```
services/dslSerializer.service.ts
```

Input: canvas nodes (`Node[]`) and edges (`Edge[]`)

Output: DSL string

Converts the current canvas state back into valid DSL text.

Used when the canvas is updated outside the editor (e.g., adding a table via toolbar).

---

# Editor Store

```ts
interface EditorState {
  dslText: string;
  isOpen: boolean;
  width: number;

  setDslText: (text: string) => void;
  toggleSidebar: () => void;
  setSidebarWidth: (width: number) => void;
}
```

Default values:
- `isOpen: true`
- `width: 320` (px)

---

# useEditorSync Hook

```ts
interface UseEditorSyncOptions {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
}
```

Responsibilities:
1. When `dslText` changes (debounced 600ms): parse DSL → update nodes and edges
2. When nodes or edges change from outside (toolbar add, rename): serialize → update `dslText`

Prevents circular updates using a `isSyncingRef` flag.

---

# EditorPanel Component

```tsx
interface EditorPanelProps {
  width: number;
  onWidthChange: (width: number) => void;
}
```

Renders:
- CodeMirror editor (full height)
- Resize handle on the right edge
- Drag handle updates `width` via `onWidthChange`

Width constraints:
- Minimum: 240px
- Maximum: 600px

---

# Workspace Layout with Sidebar

```
┌─────────────────────────────────────────────────────┐
│  [Toolbar — centered at top]                        │
│  ┌──────────────┬────────────────────────────────┐  │
│  │ Editor Panel │         Canvas                 │  │
│  │ (resizable)  │  [MiniMap bottom-right]        │  │
│  │              │  [StatusBar bottom-left]       │  │
│  └──────────────┴────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

When sidebar is closed, the canvas takes full width.

Sidebar toggle button is placed in the CanvasToolbar.

---

# Canvas Panning Fix

Current behavior (broken):
- `panOnDrag={[1, 2]}` — only middle/right mouse pans
- Left mouse on empty canvas does nothing

Correct Figma-like behavior:

| Tool | Left drag on canvas | Left drag on node | Middle drag |
|------|--------------------|--------------------|-------------|
| Pointer | Selection box | Move node | Pan |
| Hand | Pan | Pan | Pan |

ReactFlow props to set per tool:

```
Pointer tool:
  panOnDrag={[1, 2]}      ← middle/right mouse pans
  selectionOnDrag={true}  ← left drag = selection box

Hand tool:
  panOnDrag={true}        ← left drag anywhere pans
  selectionOnDrag={false}
```

Space key panning (hold Space → temporary hand mode):

```
panActivationKeyCode="Space"
```

This is built-in to ReactFlow. When Space is held, dragging pans regardless of active tool.

---

# CanvasCore Changes

CanvasCore reads `activeTool` from `useCanvasInteractionStore`.

Based on `activeTool`:

```ts
const isPanMode = activeTool === 'hand';

<ReactFlow
  panOnDrag={isPanMode ? true : [1, 2]}
  selectionOnDrag={!isPanMode}
  panActivationKeyCode="Space"
  ...
/>
```

---

# CodeMirror Setup

Library: `codemirror` (v6 bundled)

Extensions used:
- `basicSetup` — line numbers, bracket matching, undo/redo, search
- Custom theme matching the app dark/light theme
- No language server — the DSL is simple enough for basic editing

---

# Acceptance Criteria

- Typing `Table users { id uuid [pk] }` creates a `users` table node on canvas
- Adding a table via toolbar inserts a corresponding block in the editor
- Editor sidebar can be toggled open/closed
- Editor sidebar width can be resized by dragging the handle (240–600px)
- Left drag on empty canvas with pointer tool creates a selection box
- Left drag with hand tool pans the canvas
- Space + drag always pans regardless of active tool
- `pnpm lint` passes
- `pnpm typecheck` passes
