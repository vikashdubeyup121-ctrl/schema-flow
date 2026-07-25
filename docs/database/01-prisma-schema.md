# File

Projects/schemaFlow/docs/database/01-prisma-schema.md

---

# Prisma Database Schema Engineering Specification

**Document:** 01-prisma-schema.md

**Project:** SchemaFlow

---

# Purpose

This document defines the complete Prisma schema for SchemaFlow.

The schema is designed to support

- Immutable published versions
- Mutable drafts
- Review workflow
- Collaboration
- Version history
- Fast lookups
- Future horizontal scaling

The Prisma schema is intentionally normalized.

No UI-specific information should leak into the database.

---

# Prisma Generator

```prisma
generator client {
  provider = "prisma-client-js"
}
```

---

# Datasource

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

# Enums

```prisma
enum VersionStatus {
  DRAFT
  PUBLISHED
}

enum ReviewState {
  UNCHANGED
  CREATED
  MODIFIED
  DELETED
}

enum RelationshipType {
  ONE_TO_ONE
  ONE_TO_MANY
  MANY_TO_ONE
  MANY_TO_MANY
}
```

---

# User

```prisma
model User {

  id          String   @id @default(uuid())

  email       String   @unique

  name        String

  pictureUrl  String?

  createdAt   DateTime @default(now())

  updatedAt   DateTime @updatedAt

  projects        Project[]
  createdVersions DiagramVersion[] @relation("CreatedVersions")
  publishedVersions DiagramVersion[] @relation("PublishedVersions")

  @@map("users")
}
```

---

# Project

```prisma
model Project {

  id          String   @id @default(uuid())

  ownerId     String

  owner        User @relation(fields: [ownerId], references: [id])

  name        String

  description String?

  deletedAt   DateTime?

  createdAt   DateTime @default(now())

  updatedAt   DateTime @updatedAt

  diagrams Diagram[]

  @@index([ownerId])

  @@index([updatedAt])

  @@map("projects")
}
```

---

# Diagram

```prisma
model Diagram {

  id String @id @default(uuid())

  projectId String

  project Project @relation(fields: [projectId], references: [id])

  name String

  description String?

  publishedVersionId String?

  draftVersionId String?

  viewportX Float @default(0)

  viewportY Float @default(0)

  viewportZoom Float @default(1)

  createdAt DateTime @default(now())

  updatedAt DateTime @updatedAt

  deletedAt DateTime?

  versions DiagramVersion[]

  @@index([projectId])

  @@map("diagrams")
}
```

---

# DiagramVersion

```prisma
model DiagramVersion {

  id String @id @default(uuid())

  diagramId String

  diagram Diagram @relation(fields: [diagramId], references: [id])

  versionNumber Int

  status VersionStatus

  basedOnVersionId String?

  revisionNumber Int @default(1)

  createdBy String

  publishedBy String?

  creator User @relation(
    "CreatedVersions",
    fields: [createdBy],
    references: [id]
  )

  publisher User? @relation(
    "PublishedVersions",
    fields: [publishedBy],
    references: [id]
  )

  createdAt DateTime @default(now())

  publishedAt DateTime?

  tables SchemaTable[]

  relationships SchemaRelationship[]

  notes SchemaNote[]

  @@unique([diagramId, versionNumber])

  @@index([diagramId])

  @@index([status])

  @@map("diagram_versions")
}
```

---

# SchemaTable

```prisma
model SchemaTable {

  id String @id @default(uuid())

  versionId String

  version DiagramVersion @relation(
    fields: [versionId],
    references: [id]
  )

  lineageId String

  name String

  description String?

  color String @default("#2563EB")

  positionX Float

  positionY Float

  width Float @default(320)

  collapsed Boolean @default(false)

  reviewState ReviewState @default(UNCHANGED)

  createdAt DateTime @default(now())

  updatedAt DateTime @updatedAt

  columns SchemaColumn[]

  @@index([versionId])

  @@index([lineageId])

  @@map("schema_tables")
}
```

---

# SchemaColumn

```prisma
model SchemaColumn {

  id String @id @default(uuid())

  tableId String

  table SchemaTable @relation(
    fields: [tableId],
    references: [id],
    onDelete: Cascade
  )

  lineageId String

  name String

  datatype String

  nullable Boolean @default(true)

  primaryKey Boolean @default(false)

  uniqueKey Boolean @default(false)

  defaultValue String?

  note String?

  displayOrder Int

  reviewState ReviewState @default(UNCHANGED)

  createdAt DateTime @default(now())

  updatedAt DateTime @updatedAt

  @@index([tableId])

  @@index([lineageId])

  @@map("schema_columns")
}
```

---

# SchemaRelationship

```prisma
model SchemaRelationship {

  id String @id @default(uuid())

  versionId String

  version DiagramVersion @relation(
    fields: [versionId],
    references: [id]
  )

  lineageId String

  sourceTableId String

  sourceColumnId String

  targetTableId String

  targetColumnId String

  relationshipType RelationshipType

  reviewState ReviewState @default(UNCHANGED)

  createdAt DateTime @default(now())

  updatedAt DateTime @updatedAt

  @@index([versionId])

  @@index([sourceColumnId])

  @@index([targetColumnId])

  @@index([lineageId])

  @@map("schema_relationships")
}
```

---

# SchemaNote

```prisma
model SchemaNote {

  id String @id @default(uuid())

  versionId String

  version DiagramVersion @relation(
    fields: [versionId],
    references: [id]
  )

  lineageId String

  title String?

  markdown String

  color String @default("#FDE68A")

  positionX Float

  positionY Float

  width Float

  height Float

  reviewState ReviewState @default(UNCHANGED)

  createdAt DateTime @default(now())

  updatedAt DateTime @updatedAt

  @@index([versionId])

  @@index([lineageId])

  @@map("schema_notes")
}
```

---

# RefreshToken

```prisma
model RefreshToken {

  id String @id @default(uuid())

  userId String

  user User @relation(
    fields: [userId],
    references: [id]
  )

  tokenHash String

  expiresAt DateTime

  revokedAt DateTime?

  createdAt DateTime @default(now())

  @@index([userId])

  @@index([expiresAt])

  @@map("refresh_tokens")
}
```

---

# AuditLog

```prisma
model AuditLog {

  id String @id @default(uuid())

  userId String?

  entityType String

  entityId String

  operation String

  requestId String

  payload Json?

  createdAt DateTime @default(now())

  @@index([entityType, entityId])

  @@index([createdAt])

  @@map("audit_logs")
}
```

---

# Referential Integrity

```
User
    ↓
Project
    ↓
Diagram
    ↓
DiagramVersion
    ↓
Tables
    ↓
Columns
```

Relationships and Notes belong directly to a DiagramVersion.

---

# Migration Strategy

Development

```bash
pnpm prisma migrate dev
```

Production

```bash
pnpm prisma migrate deploy
```

Never use `prisma db push` in production.

---

# Acceptance Criteria

- All core entities modeled
- Immutable versioning supported
- Review state persisted
- Lineage IDs implemented
- Proper foreign keys
- Indexes added for common queries
- Prisma Client generated successfully
- Migration executes without errors

---

# End of Document

Continue with

```
Projects/schemaFlow/docs/database/

02-er-diagram.md
```