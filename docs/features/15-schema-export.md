# Feature 15: Schema Export (Architecture & Implementation Plan)

## 1. Architectural Overview
The Export feature enables users to generate production-ready database schemas (Prisma, PostgreSQL, MongoDB, etc.) directly from their SchemaFlow diagram. 

**Architectural Decision:** Client-Side Generation
Rather than sending the DSL to the backend and returning a generated string, we will execute the generation entirely in the browser. 
*Pros:* Zero latency, offline capability, zero server cost, immediate UI updates when switching target languages.
*Cons:* Adds slight bundle weight to the frontend for syntax highlighting and generator logic.

## 2. Core Components

### 2.1 The Generator Strategy Pattern
We will implement a Strategy Pattern for our generators to ensure high extensibility.
*   **Interface:** `interface SchemaGenerator { generate(ast: SchemaAST): string; }`
*   **Location:** `frontend/src/features/export/services/generators/`
*   **Implementations:**
    *   `PrismaGenerator`: Converts AST to `.prisma` definitions, handling `@id`, `@relation`, and field attributes.
    *   `PostgresGenerator`: Produces standard SQL `CREATE TABLE` and `ALTER TABLE` statements for constraints.
    *   `MongoGenerator`: Outputs JavaScript/TypeScript strings defining Mongoose `Schema` and `model` objects.

### 2.2 Type Mapping Dictionary
Instead of hardcoding type conversions within the generators, we will abstract a `TypeMapper` utility. 
Our internal DSL types (e.g., `varchar`, `int`, `datetime`) must cleanly map to target-specific types.
*   `Prisma`: `String`, `Int`, `DateTime`
*   `Postgres`: `VARCHAR(255)`, `INTEGER`, `TIMESTAMP`
*   `Mongo`: `String`, `Number`, `Date`

### 2.3 AST Extraction
The generators depend on a clean Abstract Syntax Tree (AST). We will utilize the existing `dslParser.service.ts` to convert the raw DSL text into structured `Table`, `Column`, `Enum`, and `Relationship` objects. 

## 3. UI/UX Implementation

### 3.1 ExportSchemaModal (`frontend/src/features/export/components/`)
*   **State:** Tracks the selected `format` (prisma | postgres | mongo | dsl).
*   **Preview Window:** A scrollable code block displaying the generated schema in real-time. We will use `prismjs` for lightweight syntax highlighting.
*   **Tabs:** Let users click between "Prisma", "PostgreSQL", and "MongoDB" and instantly see the generated code swap.
*   **Actions:** 
    *   `Copy to Clipboard` (using `navigator.clipboard.writeText`)
    *   `Download File` (using a dynamically generated Blob and an injected `<a>` tag with appropriate extensions `.prisma`, `.sql`, `.js`).

### 3.2 Integration
*   Add an "Export Schema" button to the `Menu` dropdown in `WorkspaceCanvas.tsx`.
*   Pass the current `dslText` state into the `ExportSchemaModal`.

## 4. Execution Phases

*   **Phase 1: Domain & Interfaces**
    *   Define the `SchemaAST` types (if not fully covered by `dslParser`).
    *   Create the `SchemaGenerator` interface and `TypeMapper`.
*   **Phase 2: Generator Implementations**
    *   Build and unit-test `PrismaGenerator`, `PostgresGenerator`, and `MongoGenerator` against edge cases (1:1, 1:N, N:M relations, enums).
*   **Phase 3: UI & Modal**
    *   Build the `ExportSchemaModal` with instant tabs and syntax highlighting.
    *   Implement Clipboard and File Download utilities.
*   **Phase 4: Integration**
    *   Hook the modal into the Workspace canvas.
