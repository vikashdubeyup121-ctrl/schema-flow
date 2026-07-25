# File

Projects/schemaFlow/docs/architecture/03-event-flow.md

---

# Event Flow Engineering Specification

**Document:** 03-event-flow.md

**Project:** SchemaFlow

**Version:** Phase 1

---

# Purpose

This document defines every event that flows through SchemaFlow.

The system is fundamentally **event-driven**.

Almost every user action eventually becomes one or more events.

This document explains

- Event producers
- Event consumers
- Event ordering
- Event propagation
- Event guarantees

---

# Event Philosophy

Every important business action produces an event.

Examples

```
Table Created

↓

Table Renamed

↓

Relationship Deleted

↓

Version Published
```

Events represent

**Facts**

not

**Commands**

---

# Event Categories

SchemaFlow contains five categories of events.

```
UI Events

↓

Commands

↓

Domain Events

↓

Infrastructure Events

↓

Notification Events
```

---

# Complete Event Pipeline

```
User Click

↓

UI Event

↓

Command

↓

Validation

↓

Service

↓

Database

↓

Domain Event

↓

Socket Broadcast

↓

Analytics

↓

Logs
```

---

# Event Hierarchy

```
Browser Event

↓

UI Event

↓

Command

↓

Database Mutation

↓

Domain Event

↓

External Broadcast
```

Every layer has a single responsibility.

---

# Event Producers

Frontend

```
Toolbar

Canvas

Keyboard

Editor

Dashboard

Property Panel
```

Backend

```
Project Service

Diagram Service

Schema Service

Version Service

Parser Service

Collaboration Service
```

---

# Event Consumers

Frontend

```
React Query

Zustand

Graph Engine

History Manager

Selection Manager

Review Engine
```

Backend

```
Audit Service

Socket Gateway

Metrics

Logging

Future Notification Service
```

---

# UI Events

Examples

```
TABLE_CLICKED

TABLE_DRAG_STARTED

COLUMN_DOUBLE_CLICKED

DELETE_PRESSED

PASTE_TRIGGERED

PUBLISH_CLICKED
```

These events never leave the browser.

---

# Commands

Commands represent

Intent.

Examples

```
CreateTableCommand

RenameColumnCommand

DeleteRelationshipCommand

PublishVersionCommand

ImportDBMLCommand
```

Commands may fail.

Events never fail.

---

# Domain Events

Domain Events represent

Facts that already happened.

Examples

```
TableCreated

TableDeleted

RelationshipCreated

VersionPublished

DraftDiscarded
```

Domain events are immutable.

---

# Infrastructure Events

Examples

```
SocketConnected

SocketDisconnected

HeartbeatReceived

AutosaveTriggered

RetryScheduled
```

Used internally.

---

# Notification Events

Future

Examples

```
DiagramShared

VersionPublished

MentionCreated

ReviewRequested
```

Consumed by

Email

Slack

Push Notifications.

---

# Event Envelope

Every event uses a standard envelope.

```ts
interface DomainEvent<T> {

    id: string;

    type: string;

    timestamp: number;

    correlationId: string;

    causationId: string;

    actorId: string;

    payload: T;

}
```

---

# Correlation ID

Used to trace

Entire request.

Example

```
Create Table

↓

Rename Column

↓

Publish

↓

Audit

↓

Logs
```

Same

Correlation ID.

---

# Causation ID

Represents

The event

that caused

another event.

Example

```
PublishClicked

↓

PublishCommand

↓

VersionPublished
```

---

# Event Ordering

Events are processed

Strictly

In order

Within a diagram.

```
1

↓

2

↓

3

↓

4
```

Ordering is guaranteed

Per room.

---

# Event Delivery

Phase 1

Guarantee

```
At Least Once
```

Consumers must be idempotent.

Future

Exactly-once semantics.

---

# Event Bus

Backend

```
Service

↓

Publish Event

↓

Event Bus

↓

Subscribers
```

Phase 1

In-memory bus.

Future

Redis Pub/Sub

or

Google Pub/Sub.

---

# Event Subscribers

Current

```
Audit Logger

Socket Gateway

Metrics Collector
```

Future

```
Email

AI Assistant

Webhook

Search Indexer
```

---

# Project Events

```
ProjectCreated

ProjectUpdated

ProjectDeleted

ProjectRestored
```

---

# Diagram Events

```
DiagramCreated

DiagramRenamed

DiagramDeleted

ViewportUpdated
```

---

# Schema Events

```
TableCreated

TableMoved

TableResized

TableRenamed

TableDeleted

ColumnCreated

ColumnUpdated

ColumnDeleted

RelationshipCreated

RelationshipDeleted

NoteCreated

NoteUpdated

NoteDeleted
```

---

# Version Events

```
DraftCreated

DraftDiscarded

ReviewStarted

VersionPublished

RollbackCreated
```

---

# Collaboration Events

```
UserJoinedRoom

UserLeftRoom

CursorMoved

SelectionChanged

ViewportChanged

RemoteOperationApplied
```

---

# Authentication Events

```
UserLoggedIn

UserLoggedOut

TokenRefreshed
```

---

# Event Flow Example

Creating a table

```
Toolbar Click

↓

CreateTableCommand

↓

SchemaService

↓

Database Insert

↓

TableCreated

↓

Audit Log

↓

Socket Broadcast

↓

Metrics

↓

Client Update
```

---

# Publish Flow

```
Publish Button

↓

PublishCommand

↓

Validation

↓

Transaction

↓

VersionPublished

↓

Audit

↓

Socket Broadcast

↓

History Refresh
```

---

# Event Versioning

Every event

Contains

```
eventVersion
```

Example

```ts
interface VersionPublishedV1 {

}
```

Future

```
VersionPublishedV2
```

Allows

Backward compatibility.

---

# Idempotency

Every event

Owns

```
eventId
```

Consumers store

Recently processed IDs.

Duplicate events

Ignored.

---

# Retry Strategy

Infrastructure failures

Retry.

Validation failures

Do not retry.

```
Database Timeout

↓

Retry
```

```
Duplicate Table

↓

Reject
```

---

# Failure Handling

If subscriber fails

```
Log Failure

↓

Retry (if retryable)

↓

Continue
```

Never block

Main request.

---

# Event Storage

Phase 1

Events

Not persisted.

Audit logs

Persisted.

Future

Event sourcing

Possible.

---

# Event Naming Rules

Always

Past tense.

Good

```
TableCreated

DiagramDeleted

VersionPublished
```

Bad

```
CreateTable

DeleteDiagram
```

Commands use verbs.

Events use facts.

---

# Performance Targets

```
Publish Event

<5 ms

Socket Broadcast

<20 ms

Audit Logging

<10 ms

Metrics Recording

<5 ms
```

---

# Monitoring

Track

```
Events Produced

Events Consumed

Retries

Failures

Latency

Duplicate Events
```

---

# Testing

Unit Tests

- Event Bus
- Event Envelope
- Subscribers
- Retry Logic

Integration Tests

- Publish Flow
- Collaboration
- Audit Logging

Performance Tests

- 1,000 Events/sec
- Broadcast Latency
- Subscriber Throughput

---

# Acceptance Criteria

- Standard event envelope
- Event categories defined
- Event ordering guaranteed
- Correlation IDs implemented
- Idempotency supported
- Event bus implemented
- Subscribers isolated
- Retry strategy documented
- Monitoring defined
- Tests specified

---

# End of Document

Continue with

```
Projects/schemaFlow/docs/architecture/

04-websocket-protocol.md
```