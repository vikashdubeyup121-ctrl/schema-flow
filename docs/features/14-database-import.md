# Database Import Implementation Plan

## Overview
This feature allows users to import existing database schemas. To keep the scope manageable and the architecture scalable, we will **not** attempt to hardcode support for every database in the world (e.g., MongoDB, Oracle). 

Instead, we will build a **Pluggable Parser Architecture**. This means each supported database/format will be an independent "plugin" containing its own instructions, error-handling rules, and parsing logic.

## Initial Scope
For MVP, we will support three parser plugins:
1. **Prisma Schema** (Highly versatile, covers Postgres/MySQL/etc. automatically if the user uses Prisma)
2. **PostgreSQL (Raw SQL Dump)** 
3. **MongoDB (NoSQL)** (A raw schema export or Mongoose schema parser to demonstrate NoSQL support)

## 1. Pluggable Parser Architecture (Backend)
**Directory Structure:** `backend/src/modules/parser/plugins/`

Each parser will implement a standard `IParserPlugin` interface:
```typescript
interface IParserPlugin {
  id: string; // e.g., 'postgres-sql', 'prisma'
  name: string; // e.g., 'PostgreSQL (SQL)', 'Prisma Schema'
  
  // The exact terminal command we show the user to extract their schema
  getImportCommand(): string; 
  
  // Instructions on how to fix common errors if parsing fails
  getTroubleshootingGuide(): string; 
  
  // The actual parsing logic. Throws an error if invalid, returns DSL string if successful.
  parse(content: string): Promise<string>; 
}
```

By using this interface, adding support for MongoDB or MySQL in the future simply requires dropping a new class into the `plugins` folder.

## 2. Frontend: Import Modal UI
**Component:** `ImportSchemaModal.tsx`
- **Dynamic Tabs**: The modal will fetch the list of available plugins from the backend (`GET /api/v1/parser/plugins`) to populate the database selection dropdown.
- **Step 1: Instructions**: When the user selects a plugin (e.g., "PostgreSQL"), the modal displays the `getImportCommand()` provided by that specific plugin.
- **Step 2: Paste & Validate**: The user pastes the extracted text into an editor.
- **Step 3: Error Handling**: 
## 3. Backend: Parser API & Database Architecture
To preserve the user's import history without bloating the `Diagram` model, we will create a new `ImportHistory` table:
- `id String @id @default(cuid())`
- `diagramId String` (Relation to Diagram)
- `pluginId String` (e.g. 'prisma', 'mongodb')
- `rawContent String` (The raw pasted schema)
- `createdAt DateTime @default(now())`

**Endpoints:**
1. `GET /api/v1/parser/plugins`
   - Returns a list of available parsers.
2. `POST /api/v1/parser/import/:diagramId`
   - **Request**: `{ "pluginId": "prisma", "content": "...", "action": "append" | "replace" }`
   - **Payload Limit**: Strictly limited to 1MB to prevent Node.js event loop blocking.
   - **Service Logic**: 
     - Look up the plugin by `pluginId`.
     - Execute `plugin.parse(content)`. For MongoDB, map collections to tables and ObjectIds to foreign key Refs.
     - Depending on `action`, either overwrite the diagram's `dslText` or append the new DSL to the existing `dslText` (resolving duplicates).
     - Save a new record in `ImportHistory`.
     - Emit the `diagram-updated` WebSocket event.
     - **Response**: `{ "success": true, "data": { "dslText": "..." } }`

## 4. Canvas Integration
- Upon a successful `POST /import` response, the backend will have updated the database and broadcasted a WebSocket event.
- The frontend will receive the new `dslText` (either via the API response or WebSocket), triggering our `useEditorSync` hook.
- This will completely re-render the code editor and use `dagre` to auto-layout the imported tables perfectly on the canvas.

## Execution Steps
1. **Branch**: `feature/database-import`
2. **Database Update**: Add `ImportHistory` model to `schema.prisma` and run `npx prisma db push`.
3. **Backend Architecture**: Define the `IParserPlugin` interface and register the `Prisma`, `Postgres`, and `MongoDB` parser plugins. Ensure NoSQL mapping logic in MongoDB.
4. **Backend Endpoints**: Build the API routes in `parser.routes.ts` with 1MB payload limits and Append vs Replace logic.
5. **Frontend UI**: Build the dynamic `ImportSchemaModal` component with tabs for 'Append' vs 'Replace'.
6. **Integration**: Connect frontend to backend.
