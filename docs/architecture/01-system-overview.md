# File

Projects/schemaFlow/docs/architecture/01-system-overview.md

---

# System Overview Engineering Specification

**Document:** 01-system-overview.md

**Project:** SchemaFlow

**Version:** Phase 1 (Production Architecture)

---

# Purpose

This document defines the complete runtime architecture of SchemaFlow.

Unlike previous documents which explain individual modules, this document explains how every subsystem interacts together.

It serves as the entry point for any engineer joining the project.

---

# Architectural Principles

SchemaFlow is built around five fundamental principles.

1. Canonical Domain Model
2. Event Driven Communication
3. Immutable Published Versions
4. Command Based Mutations
5. Feature Isolation

These principles must never be violated.

---

# High Level Architecture

```
                               Browser

                                  │

                                  ▼

                         React + Vite Application

                                  │

                 ┌────────────────┼────────────────┐

                 ▼                ▼                ▼

            React Query       Zustand         React Flow

                 │                │                │

                 └────────────────┼────────────────┘

                                  ▼

                        Feature Layer

 ┌──────────────────────────────────────────────────────────────┐

 │ Dashboard │ Canvas │ Editor │ Review │ Search │ Collaboration │

 └──────────────────────────────────────────────────────────────┘

                                  │

                                  ▼

                           Command Bus

                                  │

                                  ▼

                         HTTP / WebSocket

                                  │

                    ┌─────────────┴─────────────┐

                    ▼                           ▼

               Fastify REST API         Socket.IO Gateway

                    │                           │

                    └─────────────┬─────────────┘

                                  ▼

                        Application Services

        ┌────────────────────────────────────────────────┐

        │ Auth │ Project │ Diagram │ Schema │ Version │   │
        │ Parser │ Collaboration │ Search │ Review │    │
        └────────────────────────────────────────────────┘

                                  │

                                  ▼

                           Repository Layer

                                  │

                   ┌──────────────┴──────────────┐

                   ▼                             ▼

             PostgreSQL                      Redis

```

---

# Core Concepts

The application revolves around seven domain concepts.

```
User

↓

Project

↓

Diagram

↓

Version

↓

Schema

↓

Commands

↓

Events
```

Every feature ultimately operates on one of these concepts.

---

# Layered Architecture

```
Presentation

↓

Features

↓

Commands

↓

Services

↓

Repositories

↓

Database
```

Every request flows through these layers.

No shortcuts are allowed.

---

# Frontend Architecture

```
Pages

↓

Widgets

↓

Features

↓

Shared
```

Pages contain routing only.

Widgets compose features.

Features own business logic.

Shared contains reusable infrastructure.

---

# Backend Architecture

```
Routes

↓

Controllers

↓

Services

↓

Repositories

↓

Prisma

↓

PostgreSQL
```

Controllers never contain business logic.

Repositories never contain validation.

---

# Runtime Components

Frontend

```
Dashboard

Workspace

Editor

Canvas

Review Panel

Properties Panel
```

Backend

```
REST API

Socket Gateway

Parser

Review Engine

Version Engine

Search Engine
```

Infrastructure

```
PostgreSQL

Redis

Docker

Nginx
```

---

# Canonical Data Flow

```
User Action

↓

Command

↓

Validation

↓

Service

↓

Repository

↓

Database

↓

Domain Model

↓

Frontend Store

↓

React Components
```

This flow applies to every mutation.

---

# Canonical Read Flow

```
Browser

↓

HTTP

↓

Controller

↓

Repository

↓

Database

↓

Mapper

↓

JSON

↓

React Query

↓

Feature

↓

UI
```

Reads never go through the Command Bus.

---

# Canonical Write Flow

```
Toolbar

↓

Command

↓

Dispatcher

↓

Validation

↓

Backend

↓

Persist

↓

Broadcast

↓

Update UI
```

Every write is represented as a command.

---

# Workspace Runtime

Opening a workspace performs the following sequence.

```
Authenticate

↓

Load Diagram

↓

Load Active Draft

↓

Load Schema

↓

Build Graph

↓

Render Canvas

↓

Connect Socket

↓

Join Collaboration Room

↓

Ready
```

---

# Draft Workflow

```
Published Version

↓

Clone

↓

Draft

↓

Edit

↓

Review

↓

Publish

↓

Published Version

↓

Fresh Draft
```

Only drafts are editable.

---

# Collaboration Flow

```
User A

↓

Command

↓

Backend

↓

Persist

↓

Broadcast

↓

User B

↓

Update Graph

↓

Render
```

No ReactFlow objects are synchronized.

Only domain operations.

---

# State Ownership

Server State

```
Projects

Diagrams

Schema

Versions

Users
```

Owned by

```
React Query
```

UI State

```
Selection

Viewport

Sidebar

Dialogs

Inspector

Theme
```

Owned by

```
Zustand
```

---

# Single Source of Truth

For each concern there is exactly one owner.

| Concern | Owner |
|----------|-------|
| Authentication | Backend |
| Schema | Backend |
| Version History | Backend |
| Review State | Backend |
| UI State | Zustand |
| Server Cache | React Query |
| Canvas Rendering | React Flow |
| Graph Relationships | Graph Engine |

Duplicating ownership is forbidden.

---

# Communication Patterns

Frontend → Backend

```
REST

WebSocket
```

Backend → Frontend

```
REST Response

Socket Events
```

Backend → Backend

```
Service Calls

Domain Events
```

---

# Event Driven Architecture

Every important mutation emits an event.

Examples

```
ProjectCreated

DiagramCreated

TableCreated

VersionPublished

DraftDiscarded

RelationshipDeleted
```

Future systems subscribe to these events.

---

# Module Dependencies

```
Dashboard

↓

Workspace

↓

Canvas

↓

Commands

↓

Services
```

No circular dependencies.

---

# Security Model

Every request passes through

```
Authentication

↓

Authorization

↓

Validation

↓

Business Rules
```

Never trust frontend input.

---

# Performance Model

Expected Phase 1

```
50 Users

10 Concurrent Editors

500 Tables

10,000 Columns

20,000 Relationships
```

Architecture should scale without redesign.

---

# Error Handling Strategy

Errors are categorized into

```
Validation

Authentication

Authorization

Business

Infrastructure

Unexpected
```

Each category has standardized handling.

---

# Recovery Strategy

On failure

```
Rollback Transaction

↓

Return Error

↓

Keep Client Consistent
```

Never partially apply mutations.

---

# Logging Strategy

Every request logs

```
Request ID

User ID

Latency

Status

Route

Errors
```

Every command logs

```
Command

Duration

Result
```

---

# Testing Strategy

Every layer is independently testable.

```
Unit

↓

Integration

↓

Contract

↓

Performance

↓

E2E
```

---

# Future Extension Points

Architecture already supports

```
Organizations

Permissions

Comments

Mentions

Plugins

Templates

AI Assistant

Database Connectors

Offline Mode

CLI
```

These should require new modules rather than rewriting existing ones.

---

# Engineering Rules

Engineers must follow these rules.

- Never bypass services.
- Never mutate Zustand directly from components.
- Never call Prisma outside repositories.
- Never expose database entities to the frontend.
- Never synchronize ReactFlow objects over sockets.
- Never mutate published versions.
- Never store business state in UI components.
- Never duplicate ownership of state.

---

# Technology Summary

Frontend

```
React

TypeScript

Vite

React Query

Zustand

React Flow

TailwindCSS

CodeMirror
```

Backend

```
Node.js

Fastify

Prisma

PostgreSQL

Redis

Socket.IO

JWT

Google OAuth
```

Infrastructure

```
Docker

Docker Compose

Nginx

GitHub Actions
```

---

# Acceptance Criteria

- Complete runtime architecture documented
- Layer responsibilities clearly defined
- Ownership model established
- Read/write flows documented
- Collaboration architecture explained
- Draft workflow documented
- Event-driven architecture established
- Extension points identified

---

# End of Document

Continue with

```
Projects/schemaFlow/docs/architecture/

02-sequence-diagrams.md
```