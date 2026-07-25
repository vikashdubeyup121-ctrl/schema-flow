# File

Projects/schemaFlow/docs/architecture/05-review-workflow.md

---

# Review Workflow Engineering Specification

**Document:** 05-review-workflow.md

**Project:** SchemaFlow

**Version:** Phase 1

---

# Purpose

The Review Workflow is the defining feature of SchemaFlow.

Unlike traditional ERD tools where every modification immediately changes the design, SchemaFlow introduces a Git-inspired review workflow.

Every modification is first made inside a Draft.

Only after review does it become part of the Published version.

This document defines the entire review lifecycle.

---

# Design Goals

The review system should

- Clearly distinguish Draft from Published
- Highlight every change
- Allow reviewers to inspect modifications quickly
- Never modify Published data directly
- Support future multi-reviewer workflows

---

# Core Concepts

Every diagram always contains two logical versions.

```
Published Version

+

Draft Version
```

Published is immutable.

Draft is editable.

---

# Workflow Overview

```
Published Version

↓

Create Draft

↓

Edit Draft

↓

Review Changes

↓

Approve

↓

Publish

↓

Published Version + 1

↓

New Draft
```

---

# Review States

Every schema object stores its review state.

```
UNCHANGED

CREATED

MODIFIED

DELETED
```

This state is persisted in the database.

---

# Visual Representation

| Review State | Border | Background | Visibility |
|--------------|--------|------------|------------|
| UNCHANGED | Default | Default | Normal |
| CREATED | Green | Light Green | Visible |
| MODIFIED | Orange | Light Orange | Visible |
| DELETED | Red Dashed | Light Red | Semi-transparent |

---

# Why Persist Review State?

Instead of calculating diffs every time,

SchemaFlow stores the review state directly.

Advantages

- Fast loading
- Fast review
- Simpler frontend
- No expensive comparisons

---

# Object Lifecycle

Example

```
Published

↓

Rename Table

↓

MODIFIED

↓

Publish

↓

UNCHANGED
```

---

# Creating Objects

```
Create Table

↓

Review State

↓

CREATED
```

Created objects appear immediately on the canvas.

Review highlights indicate they do not yet exist in the published version.

---

# Editing Objects

```
Rename Column

↓

Change Datatype

↓

Resize Table

↓

Move Table

↓

Review State

↓

MODIFIED
```

If already CREATED,

it remains CREATED.

---

# Deleting Objects

Deletion never removes objects immediately.

Instead

```
Delete

↓

Review State

↓

DELETED
```

The object remains visible during review.

---

# Deleted Object Rendering

Deleted objects

- cannot be edited
- appear faded
- show red border
- display strike-through title (optional)

This lets reviewers understand what will disappear after publish.

---

# Review Summary

Opening Review Mode displays

```
Tables

Created

Modified

Deleted

↓

Columns

Created

Modified

Deleted

↓

Relationships

Created

Deleted

↓

Notes

Created

Modified

Deleted
```

---

# Example Summary

```
Changes

Tables Created

2

Tables Modified

1

Tables Deleted

0

Columns Added

8

Columns Modified

3

Columns Deleted

1

Relationships Created

2

Relationships Deleted

1
```

---

# Review Sidebar

The sidebar groups changes by type.

```
Changes

▼ Tables

    + Users

    ~ Orders

▼ Columns

    + email

    ~ status

    - legacy_code

▼ Relationships

    + FK Users → Orders
```

Clicking an item

Centers the canvas.

---

# Change Navigation

Users can

```
Next Change

Previous Change
```

Keyboard

```
]

[

Future
```

---

# Filtering

Filters

```
Created

Modified

Deleted

Only Tables

Only Relationships

Only Notes
```

Useful for large diagrams.

---

# Review Mode

Review Mode disables editing.

Allowed

- Pan
- Zoom
- Inspect
- Search

Disabled

- Create
- Delete
- Rename
- Drag

---

# Publish Preconditions

Before publishing

Validation checks

```
Duplicate Tables

Duplicate Columns

Broken Relationships

Invalid References

Missing Primary Keys

Invalid Datatypes
```

Publish stops if validation fails.

---

# Publish Confirmation

Dialog

```
Publish Version 7?

Changes

+ 3 Tables

~ 7 Columns

- 2 Relationships

Publish

Cancel
```

---

# Publish Sequence

```
Review

↓

Validate

↓

Publish

↓

Create Version

↓

Reset Review State

↓

Create New Draft
```

---

# Review State Reset

After publish

Every object

Becomes

```
UNCHANGED
```

in the new draft.

---

# Discard Draft

User

```
Discard

↓

Confirmation

↓

Delete Draft

↓

Reload Published
```

All review information disappears.

---

# Conflict Handling

If another user publishes first

```
Revision Conflict

↓

Reload Draft

↓

Notify User
```

Future

Automatic merge.

---

# Search During Review

Search results include

```
Review Badge

+

Change Type
```

Example

```
Users

MODIFIED
```

---

# Collaboration

Multiple users edit

the same draft.

Review state updates

in real time.

---

# Notifications

Future

```
Review Requested

Review Approved

Review Rejected

Version Published
```

---

# Future Features

Planned

```
Inline Comments

Approvals

Review Requests

Suggested Changes

Code Owners

Protected Branches

Merge Queue
```

---

# Metrics

Track

```
Average Review Time

Objects Changed

Publish Frequency

Discard Frequency

Validation Failures
```

---

# Logging

Record

```
Review Opened

Review Closed

Publish Started

Publish Completed

Publish Failed
```

---

# Performance Targets

```
Open Review

<100 ms

Generate Summary

<50 ms

Publish Validation

<100 ms

Publish

<500 ms
```

---

# Acceptance Criteria

- Review state persisted
- Review summary generated
- Sidebar implemented
- Filters supported
- Deleted objects visible
- Publish validation complete
- Review mode read-only
- Review reset after publish
- Performance targets met

---

# End of Document

Continue with

```
Projects/schemaFlow/docs/architecture/

06-command-bus.md
```