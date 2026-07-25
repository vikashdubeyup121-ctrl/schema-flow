# File

Projects/schemaFlow/docs/frontend/06-features/06-features_PART_6.md

---

# Review & Versioning Feature

The Review & Versioning system is the core differentiator of SchemaFlow.

Unlike traditional ER diagram tools, SchemaFlow supports a Git-like workflow where users make changes in a Draft, review them visually, and then Publish them as the new version.

The published version is always stable.

The draft represents the working copy.

Nothing is permanently changed until Publish succeeds.

---

# Objectives

Allow users to

- Create drafts
- Modify existing schemas
- Review changes
- Reject changes
- Publish reviewed changes
- Restore deleted objects
- Compare versions
- Track object history

---

# High-Level Workflow

```
Published Version

        │

        ▼

Create Draft

        │

        ▼

Modify Objects

        │

        ▼

Review Mode

        │

        ▼

Publish

        │

        ▼

New Published Version
```

---

# Version Model

Every diagram always has

```
Published Version

+

Draft Version
```

Never edit

Published Version directly.

---

# Diagram Version

```ts
export interface DiagramVersion {

    id: string;

    diagramId: string;

    versionNumber: number;

    status:

        | "published"

        | "draft";

    createdBy: string;

    createdAt: string;

}
```

Future

```
Reviewer

Approver

Release Notes
```

---

# Object Version Model

Every object stores

```ts
interface VersionMetadata {

    objectId: string;

    versionId: string;

    changeType:

        | "created"

        | "modified"

        | "deleted"

        | "unchanged";

}
```

Never infer review state.

Always store it.

---

# Change Types

Supported

```
UNCHANGED

CREATED

MODIFIED

DELETED
```

Future

```
MOVED

RENAMED

MERGED

SPLIT
```

---

# Review Colors

Configured through theme.

Default

```
Created

Green

Modified

Orange

Deleted

Red

Published

Normal
```

Never hardcode.

---

# Review Borders

Created

```
Solid Green Border
```

Modified

```
Solid Orange Border
```

Deleted

```
Dashed Red Border

40% Opacity
```

---

# Review Priority

Priority

```
Deleted

↓

Created

↓

Modified

↓

Selection

↓

Hover

↓

Default
```

Deleted state

Always wins.

---

# Object Lifecycle

```
Published

↓

Draft

↓

Modified

↓

Reviewed

↓

Published
```

Nothing skips review.

---

# Draft Creation

User clicks

```
Edit Diagram
```

Flow

```
Published Version

↓

Clone

↓

Draft Version

↓

Workspace
```

No changes

Made to published objects.

---

# Draft Isolation

Every operation

Occurs

Inside draft.

Published objects

Remain immutable.

---

# Review Store

```
features/

review/

stores/

review.store.ts
```

Owns

```
Current Draft

Review Mode

Changed Objects

Pending Publish
```

Never owns

Objects themselves.

---

# Review Services

```
review/

services/

review.service.ts

publish.service.ts

version.service.ts

diff.service.ts
```

Each service

Single responsibility.

---

# Review Commands

Commands

```
Start Review

Cancel Review

Publish

Discard Draft

Restore Object
```

Everything goes through

Commands.

---

# Change Detection

Every mutation

Marks object

Dirty.

Example

```
Rename Table

↓

Review Service

↓

Table

↓

Modified
```

---

# Dirty Tracking

Dirty tracking

Occurs

Immediately.

No expensive

Full diagram diff

Required.

---

# Review Badges

Every object

Displays

```
+

Created

~

Modified

-

Deleted
```

Future

Hover

Displays

Detailed history.

---

# Created Objects

Behavior

```
Visible

Editable

Selectable

Searchable
```

Publish

Creates object

In published version.

---

# Modified Objects

Published object

Still exists.

Draft

Contains modifications.

Visual indicator

Orange border.

---

# Deleted Objects

Never removed immediately.

Instead

```
Deleted

↓

Hidden From Export

↓

Visible In Review

↓

Publish

↓

Permanent Delete
```

---

# Restore Object

Before publish

Deleted object

Can be restored.

Review metadata removed.

---

# Delete Protection

Deleting table

Automatically marks

```
Relationships

Columns

Notes
```

Deleted.

One review transaction.

---

# Publish Flow

```
Publish

↓

Validation

↓

Generate Patch

↓

API

↓

Backend Validation

↓

Commit

↓

Version++

↓

Clear Draft

↓

Workspace Refresh
```

---

# Validation Before Publish

Verify

```
Duplicate Tables

Duplicate Columns

Broken Relationships

Missing PK

Invalid References

Invalid Datatypes
```

No publish

If validation fails.

---

# Patch Generation

Frontend

Never sends

Entire diagram.

Instead

Generate

```
Created Objects

Modified Objects

Deleted Objects
```

Patch

Much smaller.

Future

Supports

Large diagrams.

---

# Publish Transaction

Publish

Must be atomic.

Either

Everything succeeds

or

Nothing changes.

Never partial publish.

---

# Review Sidebar (Future)

Displays

```
Created

Modified

Deleted

Summary

Warnings
```

Click

↓

Focus object.

---

# Change Summary

Display

```
+2 Tables

+8 Columns

~3 Columns

-1 Relationship
```

Before publish.

---

# Version History (Future)

Every publish

Creates

```
Version 1

↓

Version 2

↓

Version 3
```

Users

Can browse history.

---

# Compare Versions (Future)

Compare

```
v4

↓

v7
```

Highlight

Differences.

---

# Discard Draft

Flow

```
Discard

↓

Confirmation

↓

Delete Draft

↓

Reload Published Version
```

No partial discard.

---

# Autosave Integration

Autosave

Saves

Draft only.

Never

Published version.

---

# DSL Integration

DSL

Represents

Draft.

Published DSL

Generated only

After publish.

---

# Import Integration

Import

Creates

Draft changes.

Never overwrite

Published version.

---

# Export Integration

Export

Default

Published version.

Future

Allow exporting

Draft.

---

# Search Integration

Search

Returns

Published

+

Draft

Objects.

Deleted objects

Only in review mode.

---

# Performance Targets

Support

```
20,000 Objects
```

Review mode

Must remain

Responsive.

Target

```
Toggle Review

<100ms
```

---

# Testing

Unit Tests

- Create Draft
- Mark Modified
- Mark Deleted
- Restore
- Publish Patch

Integration Tests

- Review Workflow
- Publish
- Discard Draft
- Autosave

Performance Tests

- 20k Objects
- Patch Generation
- Review Toggle

---

# Acceptance Criteria

- Draft isolated from published version
- Review colors correct
- Restore works
- Publish atomic
- Patch generation implemented
- Validation before publish
- Autosave targets draft
- Deleted objects recoverable
- Version number increments
- Fully typed
- Lint passes
- TypeScript passes
- Unit tests pass

---

# End of Document

Continue with

```
Projects/schemaFlow/docs/frontend/06-features/

06-features_PART_7.md
```