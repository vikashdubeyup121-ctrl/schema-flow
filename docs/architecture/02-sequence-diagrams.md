# File

Projects/schemaFlow/docs/architecture/02-sequence-diagrams.md

---

# Sequence Diagrams Engineering Specification

**Document:** 02-sequence-diagrams.md

**Project:** SchemaFlow

**Version:** Phase 1

---

# Purpose

This document defines the runtime sequence diagrams for every major user interaction in SchemaFlow.

Unlike the System Overview document, this focuses on **chronological execution flow**.

Every important feature should have a corresponding sequence diagram.

---

# Covered Flows

- User Login
- Dashboard Load
- Open Workspace
- Create Table
- Rename Column
- Move Table
- Autosave
- Collaboration
- Publish
- Discard Draft
- Reconnect
- Import DBML
- Export DBML

---

# 1. Google Login

```
User

 │

 │ Click Login

 ▼

Frontend

 │

 │ Redirect

 ▼

Google OAuth

 │

 │ Authorization Code

 ▼

Backend

 │

 │ Exchange Code

 ▼

Google API

 │

 │ User Profile

 ▼

Backend

 │

 │ Create/Find User

 │

 │ Generate JWT

 │

 │ Generate Refresh Token

 ▼

Frontend

 │

 │ Store Access Token

 ▼

Dashboard
```

---

# 2. Dashboard Load

```
Browser

 │

 │ GET /auth/me

 ▼

Backend

 │

 │ Validate JWT

 ▼

Database

 │

 │ Load User

 ▼

Backend

 │

 │ Return User

 ▼

Frontend

 │

 │ GET /projects

 ▼

Backend

 │

 │ Load Projects

 ▼

Database

 │

 │ Return Projects

 ▼

Dashboard Rendered
```

---

# 3. Open Diagram

```
Dashboard

 │

 │ Click Diagram

 ▼

Router

 │

 ▼

Workspace

 │

 │ GET Diagram

 ▼

Backend

 │

 ▼

Database

 │

 │ Diagram Metadata

 ▼

Backend

 │

 │ GET Schema

 ▼

Database

 │

 │ Tables

 │ Columns

 │ Relationships

 │ Notes

 ▼

Backend

 │

 ▼

Frontend

 │

 │ Build Graph

 │

 │ Render ReactFlow

 │

 │ Connect Socket

 ▼

Ready
```

---

# 4. Create Table

```
Toolbar

 │

 │ Click

 ▼

CreateTableCommand

 │

 ▼

Dispatcher

 │

 ▼

Validation

 │

 ▼

Store

 │

 │ Optimistic Update

 ▼

Canvas

 │

 │ POST Operation

 ▼

Backend

 │

 ▼

Schema Service

 │

 ▼

Database

 │

 ▼

ACK

 │

 ▼

Client
```

---

# 5. Rename Column

```
Double Click

 │

 ▼

Property Panel

 │

 ▼

RenameColumnCommand

 │

 ▼

Dispatcher

 │

 ▼

Validation

 │

 ▼

Optimistic Update

 │

 ▼

Socket Broadcast

 │

 ▼

Other Clients
```

---

# 6. Move Table

```
Mouse Down

 │

 ▼

Drag Service

 │

 ▼

Pointer Move

 │

 ▼

GPU Transform

 │

 ▼

Mouse Up

 │

 ▼

MoveTableCommand

 │

 ▼

Backend

 │

 ▼

Persist Position

 │

 ▼

Broadcast
```

Note:

Dragging never performs a network request until the drag operation completes.

---

# 7. Autosave

```
User Edit

 │

 ▼

Dirty State

 │

 ▼

Debounce

(1500 ms)

 │

 ▼

Save Draft

 │

 ▼

Backend

 │

 ▼

Database

 │

 ▼

Revision++

 │

 ▼

Success
```

---

# 8. Collaboration

User A

```
Create Table

 │

 ▼

Command

 │

 ▼

Backend

 │

 ▼

Persist

 │

 ▼

Broadcast

 │

 ▼

User B

 │

 ▼

Apply Command

 │

 ▼

Render
```

User A receives

```
ACK
```

User B receives

```
REMOTE_COMMAND
```

---

# 9. Publish

```
User

 │

 ▼

Publish Button

 │

 ▼

Publish API

 │

 ▼

Validation

 │

 ▼

Generate Diff

 │

 ▼

Transaction

 │

 ├── Clone Objects

 ├── Create Version

 ├── Update Diagram

 ├── Delete Draft

 └── Create Fresh Draft

 │

 ▼

Commit

 │

 ▼

Response

 │

 ▼

Frontend Reload
```

---

# 10. Discard Draft

```
Discard

 │

 ▼

Confirmation

 │

 ▼

DELETE Draft

 │

 ▼

Backend

 │

 ▼

Delete Draft

 │

 ▼

Reload Published

 │

 ▼

Workspace
```

---

# 11. Reconnect

```
Connection Lost

 │

 ▼

Reconnect

 │

 ▼

JWT Verify

 │

 ▼

Join Room

 │

 ▼

Latest Revision

 │

 ▼

Revision Match?

 ├─────────────┐
 │             │
 │ Yes         │ No
 ▼             ▼

Resume      Reload Draft
```

---

# 12. Import DBML

```
Upload File

 │

 ▼

Parser

 │

 ▼

Lexer

 │

 ▼

AST

 │

 ▼

Validation

 │

 ▼

Preview

 │

 ▼

Import Confirm

 │

 ▼

Transaction

 │

 ▼

Schema Created
```

---

# 13. Export DBML

```
Export

 │

 ▼

Load Schema

 │

 ▼

Serializer

 │

 ▼

Formatter

 │

 ▼

Download
```

---

# 14. Workspace Startup

```
Open Diagram

 │

 ▼

Authentication

 │

 ▼

Load Diagram

 │

 ▼

Load Draft

 │

 ▼

Load Schema

 │

 ▼

Build Graph

 │

 ▼

Initialize Stores

 │

 ▼

Render Canvas

 │

 ▼

Connect Socket

 │

 ▼

Join Collaboration

 │

 ▼

Workspace Ready
```

---

# 15. Review Mode

```
Open Review

 │

 ▼

GET Review Summary

 │

 ▼

Backend

 │

 ▼

Review Service

 │

 ▼

Summary

 │

 ▼

Sidebar

 │

 ▼

Highlight Changes
```

---

# 16. Undo

```
Ctrl + Z

 │

 ▼

History Manager

 │

 ▼

Undo Command

 │

 ▼

Apply Reverse Mutation

 │

 ▼

Update Store

 │

 ▼

Persist

 │

 ▼

Broadcast
```

---

# 17. Redo

```
Ctrl + Shift + Z

 │

 ▼

History Manager

 │

 ▼

Redo Command

 │

 ▼

Persist

 │

 ▼

Broadcast
```

---

# 18. Search

```
Search Input

 │

 ▼

Debounce

 │

 ▼

Graph Search

 │

 ▼

Results

 │

 ▼

Select Result

 │

 ▼

Center View

 │

 ▼

Highlight
```

---

# 19. Relationship Creation

```
Drag Handle

 │

 ▼

Preview Edge

 │

 ▼

Drop Target

 │

 ▼

Validation

 │

 ▼

CreateRelationshipCommand

 │

 ▼

Persist

 │

 ▼

Broadcast
```

---

# 20. Version History

```
Open History

 │

 ▼

GET Versions

 │

 ▼

Database

 │

 ▼

Version List

 │

 ▼

Timeline
```

---

# Sequence Diagram Design Rules

Every sequence diagram must satisfy:

- Validation before persistence
- Services own business logic
- Transactions wrap multi-entity mutations
- Commands are the only mutation path
- Published versions are never mutated
- Collaboration broadcasts only after successful persistence

---

# Latency Targets

| Flow | Target |
|-------|---------|
| Login | < 300 ms |
| Dashboard Load | < 500 ms |
| Open Workspace | < 2 s |
| Create Table | < 100 ms |
| Rename Column | < 80 ms |
| Publish | < 500 ms |
| Collaboration ACK | < 50 ms |
| Reconnect | < 2 s |
| Import | < 250 ms |
| Export | < 150 ms |

---

# Acceptance Criteria

- All major user flows documented
- Command pipeline represented
- Collaboration flow documented
- Publish workflow documented
- Startup sequence documented
- Autosave sequence documented
- Error recovery paths included
- Latency targets defined

---

# End of Document

Continue with

```
Projects/schemaFlow/docs/architecture/

03-event-flow.md
```