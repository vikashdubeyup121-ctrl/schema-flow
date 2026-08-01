# Implementation Plan: Time Travel / Version History

## Overview
This feature introduces a "Time Travel" mechanism, allowing users to browse previously published versions of their schema, preview them visually on the canvas, and seamlessly restore historical states.

## 1. Database Schema Updates
To make restoring and rendering historical snapshots highly performant and simple, we will snapshot the DSL text at the time of publishing.
- **File**: `backend/prisma/schema.prisma`
- **Action**: Add `dslText String? @map("dsl_text")` to the `DiagramVersion` model.
- **Migration**: Run `npx prisma db push` (or generate a migration) and `npx prisma generate`.

## 2. Backend API Updates
- **Publish Logic** (`backend/src/modules/version/service/publish.service.ts` / `diagram.repository.ts`):
  - When creating a new `DiagramVersion` during the publish action, ensure the current `diagram.dslText` is saved into the `DiagramVersion.dslText` column.
- **Fetch Logic**:
  - The current API endpoint that fetches diagram versions (`GET /api/projects/:projectId/diagrams/:id`) likely returns the versions array. We need to ensure `dslText` is selected and returned in the API response for `DiagramVersion` entities.
- **Restore Endpoint**:
  - Create a new endpoint `POST /api/projects/:projectId/diagrams/:id/versions/:versionId/restore`.
  - **Logic**: Look up the `DiagramVersion`, grab its `dslText`, and overwrite the current `Diagram`'s `dslText` (the active draft). This effectively restores the diagram while preserving it as the *current draft* until explicitly published again.

## 3. Frontend: History Timeline UI
- **Location**: Modify `EditorPanel.tsx` (the left sidebar).
- **Tabs**: Introduce a tab system at the top of the panel: `[ Code ]` | `[ History ]`.
- **History Tab Component**:
  - Map over the `diagram.versions` array.
  - Render a vertical timeline of cards displaying:
    - Version Number (e.g., `v2.0`)
    - Published Date (formatted nicely)
    - Publisher's name (if available)
  - Add an `onClick` handler to each card that dispatches an action to preview that specific version.

## 4. Frontend: Canvas Preview Mode
- **State Management**: Add a `previewVersion` state (either local to `WorkspaceCanvas` or in `editor.store.ts`) that holds the currently selected `DiagramVersion` object.
- **Canvas Override**:
  - When `previewVersion` is set, intercept the standard `dslText` being fed into the canvas and replace it with `previewVersion.dslText`.
  - Disable editing capabilities: Hide the Toolbar add buttons, disable the Code Editor text area, and disable node dragging.
- **Preview Banner**:
  - Render a highly visible, floating absolute `div` at the top center of the `WorkspaceCanvas`.
  - **Content**: "Previewing v{versionNumber}.0 - Published on {date}"
  - **Actions**:
    - `[ Restore Version ]`: Calls the backend restore API endpoint, clears `previewVersion` state, and invalidates React Query to refetch the now-restored draft.
    - `[ Exit Preview ]`: Clears `previewVersion` state, instantly snapping the canvas back to the current active draft.

## 5. Security & Permissions
- Ensure that only users with `EDITOR` or `OWNER` roles can trigger the `Restore Version` API endpoint.
- `VIEWER` roles should be allowed to view the History tab and Preview versions, but the "Restore Version" button should be hidden or disabled.

---
**Estimated Effort**: Medium (~2-3 hours)
**Impact**: High (Enterprise-grade version control for schemas)
