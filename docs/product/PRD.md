# Product Requirements Document (PRD)

**Project Name:** SchemaFlow (Working Name)  
**Version:** 1.0  
**Author:** Vinay Singh  
**Status:** Draft  
**Target Release:** MVP v1

---

# 1. Product Overview

## Vision

Build a modern, collaborative database schema designer similar to **dbdiagram.io**, with an intuitive canvas experience inspired by **Figma**.

The application should enable developers, architects, and engineering teams to collaboratively design database schemas in real time, review changes before publishing, and maintain versioned database diagrams.

Unlike dbdiagram.io, the MVP introduces a **Change Review System** that allows reviewers to visually inspect newly added, modified, and deleted entities before publishing.

---

# 2. Goals

## Business Goals

- Build an impressive engineering project.
- Demonstrate frontend architecture expertise.
- Demonstrate scalable backend design.
- Demonstrate collaborative editing.
- Demonstrate modern React architecture.
- Demonstrate Node.js backend architecture.
- Create a production-quality application.

---

## Engineering Goals

- Modular architecture
- Feature-based folder structure
- Maintainable codebase
- High performance
- Clean separation of concerns
- Easy future scalability
- Easy onboarding of contributors

---

# 3. MVP Scope

The MVP targets:

- 50 registered users
- 10 concurrent users
- 5–10 collaborators on the same diagram
- Single backend instance
- Single PostgreSQL instance

---

# 4. Target Users

## Primary

Software Engineers

Needs:

- Design schemas
- Share schemas
- Review changes

---

## Secondary

Engineering Managers

Needs:

- Review database changes
- Approve schema updates

---

## Tertiary

Students

Needs:

- Learn database design
- Visualize schemas

---

# 5. Product Features

## Authentication

- Google Login
- JWT Authentication
- Session Management

---

## Workspace

- Dashboard
- Projects
- Multiple Diagrams
- Delete Project
- Rename Project

---

## Diagram

- Infinite Canvas
- Zoom
- Pan
- Save
- Auto Save
- Export JSON
- Import JSON

---

## Tables

Each table supports:

- Name
- Color
- Position
- Width
- Collapse
- Delete
- Duplicate

---

## Columns

Each column supports

- Name
- Data Type
- Nullable
- Primary Key
- Foreign Key
- Unique
- Default Value
- Notes

---

## Relationships

Support

- One to One
- One to Many
- Many to One

---

## Notes

Floating notes supporting Markdown.

---

## Collaboration

- Live editing
- Shared cursor (future)
- Live updates
- Diagram rooms

---

# 6. Unique Feature — Change Review

This is the primary differentiator from dbdiagram.io.

Instead of directly publishing changes, every diagram maintains:

```
Published Version

↓

Draft Version

↓

Review

↓

Publish
```

---

## Object States

Every entity can exist in one of four states.

| State | Meaning | UI |
|---------|----------|------|
| Published | Existing production object | Gray |
| Created | Newly added | Green Border |
| Modified | Existing but changed | Yellow Border |
| Deleted | Marked for deletion | Red Border + Strike-through |

Supported objects:

- Tables
- Columns
- Relationships
- Notes

---

## Publishing

Publishing performs

- Delete removed entities
- Remove temporary states
- Create new baseline

---

# 7. Functional Requirements

## Authentication

### User Login

User shall login using Google.

Acceptance Criteria

- Google popup opens
- JWT generated
- Session persisted

---

## Dashboard

User can

- View projects
- Create project
- Delete project
- Rename project

---

## Diagram

User can

- Create diagram
- Delete diagram
- Rename diagram

---

## Canvas

Canvas shall support

- Infinite scrolling
- Mouse wheel zoom
- Pan using middle mouse
- Touchpad gestures

---

## Table

User shall

- Create
- Delete
- Rename
- Move
- Resize
- Change color

---

## Column

User shall

- Add
- Remove
- Rename
- Reorder
- Add note

---

## Relationships

User shall connect columns.

System shall

- Highlight connected entities
- Update relationship on movement

---

## Notes

User shall

- Create notes
- Resize
- Drag
- Edit Markdown

---

## Save

System shall

Auto-save every 2 seconds after inactivity.

---

# 8. Non Functional Goals

Although not strict MVP requirements, architecture should support

- 1000+ tables
- 100+ diagrams
- Modular backend
- Horizontal scaling later

---

# 9. Out Of Scope

Not included in MVP

- SQL Parsing
- SQL Generation
- AI Assistant
- CRDT
- Redis Cluster
- Kubernetes
- Comments
- Notifications
- Multi-region deployment

---

# 10. User Journey

```
Login

↓

Dashboard

↓

Create Project

↓

Create Diagram

↓

Canvas Opens

↓

Create Tables

↓

Create Relationships

↓

Save

↓

Review Changes

↓

Publish
```

---

# 11. High Level Modules

Frontend

- Dashboard
- Workspace
- Canvas
- Toolbar
- Sidebar
- Properties Panel
- Minimap

Backend

- Authentication
- Projects
- Diagrams
- Collaboration
- Export

---

# 12. Architecture Principles

## Single Responsibility

Every component has one responsibility.

---

## Feature Based

No shared business logic between unrelated modules.

---

## Unidirectional Data Flow

```
UI

↓

Store

↓

API

↓

Backend

↓

Database
```

---

## Optimistic Updates

User interaction should immediately reflect on UI.

Backend synchronization happens asynchronously.

---

# 13. Success Metrics

MVP considered successful if:

- Google Login works
- Multiple projects supported
- Multiple diagrams supported
- Smooth drag experience
- Smooth zoom
- Smooth pan
- Live collaboration
- Review mode functional
- Publish functional
- No data loss

---

# 14. Risks

| Risk | Mitigation |
|------|------------|
| React Flow limitations | Custom nodes and edges |
| WebSocket disconnect | Automatic reconnect |
| Large diagrams | Virtual rendering later |
| Collaboration conflicts | Operation ordering |

---

# 15. Future Roadmap

## Phase 2

- Undo / Redo
- Minimap improvements
- Search
- Keyboard shortcuts
- Better edge routing

---

## Phase 3

- Version history
- Comments
- Presence
- Shared cursors
- Redis
- CRDT

---

## Phase 4

- SQL Import
- SQL Export
- AI Schema Suggestions
- Auto Layout
- Database Reverse Engineering

---

# 16. Engineering Standards

Frontend

- React
- TypeScript
- Vite
- React Flow
- Zustand
- TanStack Query
- Tailwind
- shadcn/ui

Backend

- Node.js
- Fastify
- Prisma
- PostgreSQL
- Socket.IO

---

# 17. Repository Structure

```
schemaflow/

docs/

frontend/

backend/

shared/

scripts/

docker/

.github/

README.md
```

---

# 18. Definition of Done

A feature is complete only if:

- Architecture follows documentation
- Types defined
- No lint errors
- No TypeScript errors
- Unit tests pass (where applicable)
- Manual verification completed
- Responsive UI verified
- Performance acceptable
- Git commit created

---

# 19. Coding Principles

- Prefer composition over inheritance.
- Components must remain presentational where possible.
- Business logic belongs in hooks/services.
- Never call APIs directly from UI components.
- Shared types live in dedicated type files.
- Every feature should be independently testable.

---

# 20. Next Document

The next document is:

`01-frontend-foundation.md`

This will define:

- Complete frontend folder structure
- Every folder purpose
- Every file to create
- React architecture
- Zustand architecture
- TanStack Query architecture
- Routing
- Component hierarchy
- Shared utilities
- Design system
- Coding conventions
- File naming conventions
- Verification checklist
- Acceptance criteria