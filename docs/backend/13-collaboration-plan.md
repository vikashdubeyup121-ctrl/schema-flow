# 13. Collaboration & Access Control Plan

## 1. Overview
This document outlines the plan to implement project collaboration, allowing the creator of a project (Admin) to invite other users by their email addresses. It also details a WebSocket integration to broadcast diagram changes (e.g., when a diagram is saved) to all active viewers.

## 2. Roles & Permissions
- **Admin (Owner):** The user who originally created the project (`Project.ownerId`). Has full permissions, including deleting the project and managing access. There is only one Admin per project.
- **Editor:** A collaborator who can view and edit the project/diagrams, but cannot delete the project or manage collaborators.
- **Viewer:** A collaborator who can only view the diagrams in read-only mode.

## 3. Database Schema Updates
We will introduce a `ProjectMember` model in `prisma/schema.prisma` to track collaborator access.

```prisma
enum ProjectRole {
  OWNER
  EDITOR
  VIEWER
}

model ProjectMember {
  id        String      @id @default(uuid())
  projectId String      @map("project_id")
  userId    String      @map("user_id")
  role      ProjectRole
  createdAt DateTime    @default(now()) @map("created_at")
  updatedAt DateTime    @updatedAt @map("updated_at")

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([projectId, userId])
  @@index([projectId])
  @@index([userId])
  @@map("project_members")
}
```
*Note: The `Project` model will need a `members ProjectMember[]` relation added.*

## 4. Backend API Endpoints (Project Members)
We will add endpoints to `project.controller.ts` (or create a new `project-member.controller.ts`).

- `POST /projects/:projectId/members`
  - **Payload:** `{ email: string, role: ProjectRole }`
  - **Logic:** Lookup user by `email`. If the user does not exist, throw a `404 Not Found` (which the frontend will display as a toast error). If they exist, create a `ProjectMember` record. Only the Admin can call this.
- `GET /projects/:projectId/members`
  - **Logic:** Return a list of all members (plus the Owner) for the project.
- `PUT /projects/:projectId/members/:userId`
  - **Payload:** `{ role: ProjectRole }`
  - **Logic:** Admin updates the role of a specific collaborator.
- `DELETE /projects/:projectId/members/:userId`
  - **Logic:** Admin removes a collaborator's access.

## 5. Backend Authorization Logic
Update existing guards and services to enforce access control:
- **Admin Actions** (Delete project, invite/manage members): Requires `userId === project.ownerId`.
- **Edit Actions** (Save diagram, publish diagram, edit project details): Requires `userId === project.ownerId` OR `ProjectMember` where `role === EDITOR`.
- **View Actions** (Fetch diagram, list project details): Requires `userId === project.ownerId` OR `ProjectMember` (any role).

## 6. WebSocket Broadcasting (Save/Update)
We already have a `CollaborationGateway` handling rooms (`JOIN_DIAGRAM`).
- Inject the Gateway (or a broadcast service) into `DiagramService`.
- Inside `updateDiagram` (or `saveDiagram`), after successfully updating the database, emit a `DIAGRAM_UPDATED` event to the `diagramId` room.
- Include the updated `dslText` or a signal to refetch.

## 7. Frontend Updates
1. **Manage Collaborators UI:**
   - A "Share" or "Collaborators" button on the Project overview page and inside the Diagram editor (only visible to the Admin).
   - This opens a modal displaying the list of current members, with an option to remove (`DELETE /members/:userId`) or change their roles.
   - An input field to invite a new user by email with a role dropdown (Editor/Viewer).
   - On submit, call the `POST /members` API. If it returns a 404, show an error toast: "User not found. They must log in at least once."
2. **Updated By Attribution:**
   - Track who made the last change. We will update the backend `Diagram` and `Project` queries to fetch and populate an `updatedByUserName` field (or join with the User table).
   - Display "Updated by [User Name]" on project cards, diagram lists, and inside the canvas status bar.
3. **Read-Only Mode:**
   - If the current user's role is `VIEWER`, disable the Editor panel (or make it read-only) and hide the "Publish" / "Add Table" controls on the Canvas.
4. **Live Refresh (WebSocket):**
   - Connect to the socket room via `JOIN_DIAGRAM`.
   - Listen for `DIAGRAM_UPDATED`.
   - When triggered, invoke `queryClient.invalidateQueries({ queryKey: diagramKeys.detail(id) })` to silently refetch and update the UI with the latest changes without requiring a manual page reload.
