# File

Projects/schemaFlow/docs/backend/09-parser-service.md

---

# Parser & Import/Export Service Engineering Specification

**Document:** 09-parser-service.md

**Project:** SchemaFlow

---

# Purpose

The Parser Service is responsible for converting external schema representations into SchemaFlow's canonical domain model and vice versa.

The Parser Service is **completely stateless**.

It never owns schema.

It never owns diagrams.

It only performs transformations.

The parser must support bidirectional conversion.

```
DBML

↓

Parser

↓

Canonical Model

↓

Serializer

↓

DBML
```

Future

```
SQL

Prisma

Drizzle

Hibernate

TypeORM

Entity Framework

OpenAPI
```

---

# Responsibilities

Owns

- DBML Parsing
- DSL Parsing
- Import Validation
- Serialization
- Export
- Canonical Conversion
- Diagnostics
- Formatting

Does NOT own

- Database
- Collaboration
- Authentication
- Review
- Versioning

---

# High Level Architecture

```
Uploaded File

↓

Parser Controller

↓

Parser Service

↓

Lexer

↓

Parser

↓

AST

↓

Validator

↓

Canonical Model

↓

Schema Service
```

Export

```
Canonical Model

↓

Serializer

↓

Formatter

↓

Response
```

---

# Folder Structure

```
modules/

parser/

├── controller/
│   └── parser.controller.ts
│
├── service/
│   ├── parser.service.ts
│   ├── serializer.service.ts
│   ├── formatter.service.ts
│   ├── import.service.ts
│   ├── export.service.ts
│   ├── validation.service.ts
│   └── diagnostics.service.ts
│
├── parser/
│   ├── lexer.ts
│   ├── parser.ts
│   ├── ast.ts
│   └── tokens.ts
│
├── serializers/
│   ├── dbml.serializer.ts
│   ├── json.serializer.ts
│   └── sql.serializer.ts (future)
│
├── dto/
├── mapper/
├── validator/
├── tests/
└── index.ts
```

---

# Canonical Model

Every parser outputs

Exactly one model.

```ts
interface SchemaDocument {

    tables: Table[];

    relationships: Relationship[];

    notes: FloatingNote[];

}
```

No parser

May bypass

Canonical Model.

---

# Import Pipeline

```
File

↓

Detect Format

↓

Lexer

↓

Parser

↓

AST

↓

Semantic Validation

↓

Canonical Model

↓

Schema Validation

↓

Preview

↓

Import
```

---

# Export Pipeline

```
Schema Version

↓

Canonical Model

↓

Serializer

↓

Formatter

↓

Download
```

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

Liquibase

Hibernate

OpenAPI
```

---

# Format Detection

Detection order

```
Explicit Format

↓

File Extension

↓

Content Detection
```

Examples

```
.schemaflow

↓

JSON

.dbml

↓

DBML
```

---

# Parser Interface

Every parser implements

```ts
interface Parser {

    parse(input: string): ParseResult;

}
```

---

# Serializer Interface

Every serializer implements

```ts
interface Serializer {

    serialize(schema: SchemaDocument): string;

}
```

---

# Parse Result

```ts
interface ParseResult {

    schema: SchemaDocument;

    diagnostics: Diagnostic[];

}
```

Parsing never throws

For user mistakes.

---

# Diagnostics

```ts
interface Diagnostic {

    severity:

        | "ERROR"

        | "WARNING"

        | "INFO";

    message: string;

    line: number;

    column: number;

}
```

---

# Import Preview

Before commit

Frontend receives

```json
{
    "tables": 12,
    "columns": 78,
    "relationships": 23,
    "warnings": [],
    "errors": []
}
```

No database writes yet.

---

# Validation Layers

Layer 1

Syntax

Checks

```
Unexpected Token

Missing Brace

Invalid Keyword
```

---

Layer 2

Semantic

Checks

```
Duplicate Table

Duplicate Column

Broken Relationship

Unknown Datatype
```

---

Layer 3

Business

Checks

```
Project Exists

Version Exists

Diagram Editable

Permission
```

---

# Transaction Boundary

Import

Runs inside

One transaction.

```
Parse

↓

Validate

↓

Create Objects

↓

Commit
```

Rollback

Everything

On failure.

---

# DBML Support

Supported

```
Table

Column

Ref

Note

Enum (future)
```

Future

```
Indexes

Check Constraints

Composite Keys
```

---

# JSON Export

SchemaFlow JSON

Stores

```
Metadata

Tables

Columns

Relationships

Notes

Versions
```

Stable

Machine-readable.

---

# DBML Export

Produces

Human-readable

Stable output.

Repeated exports

Must produce

Identical ordering.

---

# Formatter

Responsible only for

```
Indentation

Whitespace

Blank Lines
```

No semantic changes.

---

# Error Recovery

Malformed file

Should still return

Partial diagnostics.

Never crash parser.

---

# Streaming Imports

Phase 1

Whole file

In memory.

Future

Streaming parser

For very large schemas.

---

# Limits

Phase 1

```
File Size

10 MB

Tables

500

Columns

10,000

Relationships

20,000
```

Configurable.

---

# Caching

Cache

Compiled serializers.

Never cache

User files.

---

# Metrics

Track

```
Imports

Exports

Average Parse Time

Average Export Time

Validation Errors
```

---

# Logging

Log

```
Import Started

Import Completed

Export Started

Export Completed

Parse Failed
```

Never log

Uploaded schema contents.

---

# Security

Reject

```
Executable Files

Unexpected MIME Types

Oversized Payloads
```

Sanitize

Markdown

Before persistence.

---

# Performance Targets

```
DBML Parse

<150ms

DBML Export

<100ms

Validation

<75ms

Import Preview

<250ms
```

---

# Testing

Unit Tests

- Lexer
- Parser
- Serializer
- Formatter
- Diagnostics

Integration Tests

- DBML Import
- JSON Import
- DBML Export
- Round Trip

Performance Tests

- 500 Tables
- 10 MB Files
- 20k Relationships

---

# Acceptance Criteria

- DBML parser implemented
- JSON parser implemented
- Import preview supported
- Validation layered
- Stable serializer implemented
- Formatter implemented
- Canonical model enforced
- Transactional imports
- Standard diagnostics
- Lint passes
- TypeScript passes
- Unit tests pass

---

# End of Document

Continue with

```
Projects/schemaFlow/docs/backend/

10-storage-design.md
```