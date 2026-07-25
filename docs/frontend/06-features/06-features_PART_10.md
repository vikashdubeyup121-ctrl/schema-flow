# File

Projects/schemaFlow/docs/frontend/06-features/06-features_PART_10.md

---

# DSL Engine Feature

The DSL Engine is one of the core pillars of SchemaFlow.

Unlike traditional ERD tools that are purely visual, SchemaFlow maintains a **bi-directional synchronization** between the visual canvas and a text-based schema language.

The DSL Engine is responsible for

- Parsing
- Validation
- Serialization
- Incremental synchronization
- Error recovery
- Diagnostics
- Auto formatting
- Auto completion (Future)

The Canvas is **not** the source of truth.

The Editor is **not** the source of truth.

The Canonical Diagram Model is the source of truth.

---

# Responsibilities

The DSL Engine owns

- Lexer
- Parser
- AST
- Semantic Validation
- Serializer
- Incremental Updates
- Diagnostics
- Formatting

The DSL Engine never owns

- Canvas
- React Components
- WebSocket
- Review
- Rendering

---

# High-Level Architecture

```
             Editor

                │

                ▼

            Lexer

                │

                ▼

            Parser

                │

                ▼

               AST

                │

      ┌─────────┴──────────┐

      ▼                    ▼

Validation           Serializer

      ▼                    ▼

Canonical Graph      DSL Output

      │

      ▼

Canvas
```

The Graph is the bridge between

Editor

and

Canvas.

---

# Folder Structure

```
features/

dsl/

├── lexer/
│   ├── lexer.ts
│   ├── token.ts
│   ├── tokenType.ts
│   └── lexer.test.ts
│
├── parser/
│   ├── parser.ts
│   ├── parserContext.ts
│   ├── parserErrors.ts
│   └── parser.test.ts
│
├── serializer/
│   ├── serializer.ts
│   ├── formatter.ts
│   └── serializer.test.ts
│
├── validator/
│   ├── semanticValidator.ts
│   ├── datatypeValidator.ts
│   ├── relationshipValidator.ts
│   └── validator.test.ts
│
├── diagnostics/
│
├── completion/
│
├── formatter/
│
├── ast/
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

# DSL Pipeline

```
User Types

↓

Lexer

↓

Tokens

↓

Parser

↓

AST

↓

Validation

↓

Graph

↓

Canvas
```

Reverse

```
Canvas

↓

Graph

↓

Serializer

↓

Editor
```

---

# Lexer

The lexer converts

Text

↓

Tokens.

Example

Input

```
Table users {

id uuid [pk]

}
```

Tokens

```
TABLE

IDENTIFIER

OPEN_BRACE

IDENTIFIER

DATATYPE

ATTRIBUTE

CLOSE_BRACE
```

Lexer

Never

Builds AST.

---

# Parser

Input

```
Tokens
```

Output

```
AST
```

Parser

Never

Touches

Canvas.

---

# AST

AST should be

Immutable.

Example

```ts
interface TableNode {

    id: string;

    name: string;

    columns: ColumnNode[];

}
```

AST

Contains

No rendering information.

---

# Semantic Validation

Parser

Only validates

Syntax.

Semantic validator

Checks

```
Duplicate Tables

Duplicate Columns

Broken References

Unknown Datatypes

Missing PK

Duplicate Relationships
```

---

# Error Recovery

Malformed DSL

Should never

Destroy

Current Diagram.

Instead

```
Parse

↓

Recover

↓

Continue

↓

Diagnostics
```

---

# Diagnostics

Editor displays

```
Errors

Warnings

Hints
```

Each diagnostic

Contains

```ts
interface Diagnostic {

    severity:

        | "error"

        | "warning"

        | "info";

    line: number;

    column: number;

    message: string;

}
```

---

# Supported Errors

```
Unknown datatype

Duplicate table

Duplicate column

Unexpected token

Missing brace

Broken relationship

Reserved keyword
```

---

# Incremental Parsing

Never

Parse

Entire file

After every keystroke.

Instead

```
Changed Region

↓

Incremental Parse

↓

Patch AST
```

Current MVP

Full parse

Debounced.

Architecture

Prepared

For incremental parser.

---

# Synchronization Strategy

There are two directions.

Editor

↓

Canvas

Canvas

↓

Editor

Both use

Graph.

Never

Synchronize directly.

---

# Synchronization Lock

To avoid loops

Use

```
isSynchronizing
```

Flow

```
Editor

↓

Graph

↓

Canvas

↓

Ignore

↓

Unlock
```

---

# DSL Formatting

Support

```
Indentation

Blank Lines

Alignment

Consistent Attributes
```

Future

Auto format

```
Shift + Alt + F
```

---

# Serializer

Graph

↓

DSL.

Serializer

Must generate

Stable output.

Two serializations

Of same graph

Must be identical.

---

# Stable Ordering

Objects

Sorted

```
Tables

↓

Columns

↓

Relationships
```

Ensures

Minimal Git diff.

---

# Relationship Serialization

Support

```
Inline

or

Ref Statements
```

Configurable.

---

# Formatter

Responsible only for

Whitespace.

Never

Business logic.

---

# Datatype Registry

Datatypes

Should not be hardcoded.

Registry

Provides

```
Supported Types

Validation Rules

Formatting Rules
```

Future

Database plugins.

---

# Reserved Keywords

Registry

Contains

```
select

table

where

group

index

constraint
```

Validation

Uses registry.

---

# Auto Completion (Future)

Suggest

```
Datatypes

Attributes

Tables

Columns

Keywords
```

Example

Typing

```
var
```

Suggests

```
varchar
```

---

# Hover Information (Future)

Hover

```
users.id
```

Displays

```
Referenced by

orders.user_id

payments.user_id
```

Uses

Graph Engine.

---

# Code Folding (Future)

Fold

```
Table

Enum

Note
```

Large schemas

Become manageable.

---

# Performance Targets

```
5,000 Lines

↓

Parse

<100ms
```

Validation

```
<50ms
```

Serialization

```
<50ms
```

---

# Testing

Lexer Tests

- Keywords
- Tokens
- Comments

Parser Tests

- Tables
- Columns
- Relationships

Validator Tests

- Duplicate Tables
- Broken References
- Unknown Types

Serializer Tests

- Round Trip
- Stable Ordering

Performance Tests

- 5,000 Lines
- Large Schemas
- Rapid Typing

---

# Acceptance Criteria

- Lexer implemented
- Parser implemented
- AST immutable
- Validation complete
- Diagnostics displayed
- Serializer deterministic
- Synchronization loop prevented
- Round-trip verified
- Stable formatting
- Lint passes
- TypeScript passes
- Unit tests pass

---

# End of Document

Continue with

```
Projects/schemaFlow/docs/frontend/06-features/

06-features_PART_11.md
```