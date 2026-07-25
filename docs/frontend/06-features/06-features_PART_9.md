# File

Projects/schemaFlow/docs/frontend/06-features/06-features_PART_9.md

---

# Graph Engine Feature

The Graph Engine is the canonical representation of the diagram.

Every feature in SchemaFlow ultimately operates on the graph.

The graph is **not** React Flow.

The graph is the application's domain model.

React Flow is only a renderer.

---

# Responsibilities

The Graph Engine owns

- Graph construction
- Node indexing
- Relationship indexing
- Parent-child traversal
- Connected component lookup
- Dependency graph
- Graph validation
- Fast object lookup

The Graph Engine does NOT own

- Rendering
- React Components
- API
- WebSocket
- Review
- History

---

# Why a Graph Engine?

Without a graph engine every feature eventually becomes

```
for every table

↓

for every column

↓

for every relationship

↓

find...
```

which quickly becomes

```
O(n²)

or worse
```

Instead every lookup should be

```
O(1)

or

O(log n)
```

---

# Directory Structure

```
features/

graph/

├── engine/
│   ├── graph.engine.ts
│   ├── graph.builder.ts
│   ├── graph.index.ts
│   ├── graph.cache.ts
│   └── graph.validator.ts
│
├── services/
│   ├── traversal.service.ts
│   ├── dependency.service.ts
│   ├── highlight.service.ts
│   ├── lookup.service.ts
│   ├── cycle.service.ts
│   └── statistics.service.ts
│
├── stores/
│
├── hooks/
│
├── tests/
│
├── types/
│
└── index.ts
```

---

# Canonical Graph

Everything is represented as a graph.

```
Diagram

↓

Tables

↓

Columns

↓

Relationships
```

Relationships connect

Columns.

Not tables.

---

# Graph Model

```ts
interface DiagramGraph {

    tables: Map<TableId, GraphTable>;

    columns: Map<ColumnId, GraphColumn>;

    relationships:
        Map<RelationshipId, GraphRelationship>;

}
```

Never

Store arrays

For lookups.

Always index.

---

# Graph Table

```ts
interface GraphTable {

    id: string;

    columnIds: ColumnId[];

}
```

---

# Graph Column

```ts
interface GraphColumn {

    id: string;

    tableId: string;

    incoming: RelationshipId[];

    outgoing: RelationshipId[];

}
```

---

# Graph Relationship

```ts
interface GraphRelationship {

    id: string;

    sourceColumnId: string;

    targetColumnId: string;

}
```

---

# Graph Builder

Every diagram load

Builds graph.

```
Diagram

↓

Tables

↓

Columns

↓

Relationships

↓

Graph
```

Builder

Never

Mutates existing graph.

---

# Immutable Graph

Graph is immutable.

Every mutation

Produces

New graph.

Benefits

- Easier debugging
- Time travel
- Collaboration
- Memoization

---

# Graph Cache

Graph cache stores

```
Connected Tables

Connected Columns

Statistics

Traversal Results
```

Invalidate

Only affected entries.

---

# Lookup Service

Supports

```
Table By Id

Column By Id

Relationship By Id

Columns Of Table

Relationships Of Column

Relationships Of Table
```

Target

```
O(1)
```

---

# Traversal Service

Supports

```
DFS

BFS

Parents

Children

Neighbors
```

Future

Shortest path.

---

# Connected Tables

Example

```
Orders

↓

Users

↓

Addresses
```

Hovering

Orders

Should immediately return

```
Users

Addresses
```

Without scanning

Entire diagram.

---

# Incoming Relationships

Example

```
users.id

↓

orders.user_id

↓

payments.user_id
```

Lookup

```
Incoming

↓

O(1)
```

---

# Outgoing Relationships

Lookup

```
users.id

↓

orders.user_id
```

Should never

Scan every relationship.

---

# Dependency Service

Responsible for

```
Parent Tables

Child Tables

Dependency Order

Impact Analysis
```

Used by

Delete

Review

Import

Publish

---

# Delete Impact

Deleting

```
Users
```

Immediately returns

```
Orders

Payments

Addresses
```

No expensive search.

---

# Highlight Service

Hover

↓

Highlight

Uses graph.

Never

Renderer.

---

# Highlight Pipeline

```
Hovered Object

↓

Lookup

↓

Connected Objects

↓

Highlight Store

↓

Renderer
```

---

# Cycle Detection

Supports

```
A

↓

B

↓

C

↓

A
```

Used by

Validation.

Current MVP

Warn only.

---

# Statistics Service

Provides

```
Table Count

Column Count

Relationship Count

Orphan Tables

Disconnected Components

Average Columns
```

Used by

Dashboard

Future Analytics.

---

# Search Integration

Search

Uses graph

For ranking.

Example

Searching

```
Users
```

Can also rank

Connected

Orders

Higher.

---

# Review Integration

Graph

Knows

Published

and

Draft

Separately.

Diff

Never

Traverses React components.

---

# Collaboration Integration

Incoming operations

Update

Graph

Before

Rendering.

Graph remains

Single source of truth.

---

# DSL Integration

Parser

↓

Graph

↓

Renderer

Serializer

↓

Graph

↓

DSL

Graph

Always

Middle layer.

---

# Import Integration

Import

Creates

Graph

First.

Validation

Runs

On graph.

Only then

Canvas updates.

---

# Export Integration

Export

Reads graph.

Never

Canvas.

---

# Graph Validation

Validate

```
Broken Relationships

Missing Tables

Missing Columns

Duplicate IDs

Duplicate Relationships

Cycles (optional)
```

---

# Performance Targets

Diagram Size

```
500 Tables

10,000 Columns

20,000 Relationships
```

Lookup

```
<1ms
```

Traversal

```
<20ms
```

Highlight

```
<8ms
```

---

# Memory Strategy

Avoid

Duplicate references.

Store

IDs.

Resolve

Through indexes.

---

# Testing

Unit Tests

- Graph Build
- Lookup
- Traversal
- Dependencies
- Highlight
- Cache

Integration Tests

- Review
- Import
- Export
- Search

Performance Tests

- 20k Relationships
- 10k Columns
- Deep Traversal

---

# Acceptance Criteria

- Immutable graph
- Indexed lookups
- Graph builder implemented
- Traversal service complete
- Dependency service complete
- Highlight service complete
- Validation implemented
- Cache implemented
- O(1) lookups achieved
- Lint passes
- TypeScript passes
- Unit tests pass

---

# End of Document

Continue with

```
Projects/schemaFlow/docs/frontend/06-features/

06-features_PART_10.md
```