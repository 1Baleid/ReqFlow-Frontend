# Member C Core Requirement Flow APIs

Base URL: `http://localhost:5000/api`

These endpoints support the Phase 5 Member C scope: requirement CRUD, refinement, comments and clarifications, acceptance criteria, related requirement links, and version comparison.

## Requirements

### List requirements

`GET /requirements`

Optional query parameters:

- `projectId`: defaults to `proj-1`
- `status`: `draft`, `review`, `approved`, `rejected`, or `locked`
- `priority`: `low`, `medium`, `high`, or `critical`
- `assigneeId`: team member user ID
- `search`: text search over title and description

### Create requirement

`POST /requirements`

```json
{
  "projectId": "proj-1",
  "title": "Export approved requirements",
  "description": "The system shall export approved requirements as a PDF report.",
  "type": "functional",
  "priority": "medium",
  "createdBy": {
    "id": "user-1",
    "name": "Abdullah Al-Rashid",
    "role": "client"
  }
}
```

New requirements are always created in `draft`.

### Get requirement detail

`GET /requirements/:id`

Example: `GET /requirements/REQ-123456`

### Update or refine requirement

`PATCH /requirements/:id`

```json
{
  "title": "Export approved requirements report",
  "description": "The system shall export approved requirements as a PDF report with status, priority, and version metadata.",
  "type": "functional",
  "priority": "high",
  "changeSummary": "Refined report scope and metadata",
  "editedBy": {
    "id": "user-3",
    "name": "Omar Faisal",
    "role": "member"
  }
}
```

Locked requirements return `409 Conflict`.

### Archive requirement

`DELETE /requirements/:id`

Archives a non-locked requirement instead of deleting the database record.

### Change requirement status

`PATCH /requirements/:id/status`

```json
{
  "status": "review",
  "actor": {
    "id": "user-2",
    "name": "Khalid Hassan",
    "role": "manager"
  }
}
```

Allowed lifecycle transitions:

- Manager: `draft` -> `review`
- Client: `review` -> `approved`
- Client: `review` -> `rejected` with `reason`
- Manager: `approved` -> `locked`

## Comments and Clarifications

### Add comment or clarification

`POST /requirements/:id/comments`

```json
{
  "message": "Can the export include requirement history?",
  "kind": "clarification-request",
  "author": {
    "id": "user-3",
    "name": "Omar Faisal",
    "role": "member"
  }
}
```

Allowed `kind` values:

- `comment`
- `clarification-request`
- `clarification-response`

## Acceptance Criteria

### Add acceptance criteria

`POST /requirements/:id/acceptance-criteria`

```json
{
  "text": "PDF export includes requirement ID, title, status, priority, and current version.",
  "createdBy": {
    "id": "user-3",
    "name": "Omar Faisal",
    "role": "member"
  }
}
```

## Linked Requirements

### Link related requirement

`POST /requirements/:id/links`

```json
{
  "linkedRequirementId": "REQ-123456",
  "linkedBy": {
    "id": "user-3",
    "name": "Omar Faisal",
    "role": "member"
  }
}
```

The API prevents self-linking and duplicate links.

### Unlink related requirement

`DELETE /requirements/:id/links/:linkedId`

## Duplicate Requirements

### Mark requirements as duplicates

`POST /requirements/duplicates`

```json
{
  "requirementIds": ["REQ-123456", "REQ-654321"],
  "actor": {
    "id": "user-2",
    "name": "Khalid Hassan",
    "role": "manager"
  }
}
```

The API validates that at least two active requirements are selected and that they belong to the same project.

### Merge duplicate requirements

`POST /requirements/duplicates/merge`

```json
{
  "duplicateGroupId": "DUP-MIH8A2-9XQW",
  "primaryRequirementId": "REQ-123456",
  "actor": {
    "id": "user-2",
    "name": "Khalid Hassan",
    "role": "manager"
  }
}
```

The primary requirement stays active. Other duplicate requirements are archived, stale links are removed, and related links are redirected to the primary requirement.

## Version History

### List versions

`GET /requirements/:id/versions`

### Compare versions

`POST /requirements/:id/versions/compare`

```json
{
  "fromVersion": 1,
  "toVersion": 2
}
```

Returns changed fields with previous and current values.
