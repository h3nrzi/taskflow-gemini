# Sprint Backlog — TaskFlow Core Platform

## Sprint 1 (Completed)

| Story ID | Title | Role | Complexity Points | Status | Assigned Agent |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `STORY-001` | Task Schemas & Backend API | Backend Developer | 5 | `DONE` | `backend_developer` |
| `STORY-002` | Frontend Kanban Board UI | Frontend Developer | 3 | `DONE` | `frontend_developer` |
| `STORY-003` | QA Integration & E2E Tests | QA Reviewer | 3 | `DONE` | `qa_reviewer` |

---

## Sprint 2 (Active Planning)

| Story ID | Title | Role | Complexity Points | Status | Assigned Agent |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `STORY-004` | Task Search, Priority & Tag Filtering | Fullstack | 3 | `READY_FOR_DEV` | `frontend_developer` / `backend_developer` |
| `STORY-005` | Task Edit, Delete & Detail Modal | Fullstack | 3 | `READY_FOR_DEV` | `frontend_developer` / `backend_developer` |
| `STORY-006` | Activity Log API & Audit Trail Drawer | Fullstack | 5 | `READY_FOR_DEV` | `backend_developer` / `frontend_developer` |
| `STORY-007` | QA Integration & E2E Verification (Sprint 2) | QA Reviewer | 3 | `PENDING_IMPL` | `qa_reviewer` |

---

## Sprint 2 Story Specifications

### `STORY-004`: Task Search, Priority & Tag Filtering
- **User Story**: As a Team Member, I want to search tasks by keyword and filter by priority or tags, so that I can quickly locate relevant work items on busy boards.
- **Complexity Score**: 3 Points
- **Status**: `READY_FOR_DEV`
- **Acceptance Criteria**:
  1. **AC-004.1 (Backend Filter Schema & Endpoint)**: `GET /api/tasks` accepts query parameters: `search` (keyword in title/description), `priority` (`LOW`|`MEDIUM`|`HIGH`|`URGENT`), and `tag` (string label).
  2. **AC-004.2 (Filter Validation)**: Invalid query filter params return `422 Unprocessable Entity`.
  3. **AC-004.3 (UI Search Bar & Filter Controls)**: Top bar includes Search Input, Priority Dropdown, and Tag selector with dynamic board filtering.

---

### `STORY-005`: Task Edit, Delete & Detail Modal
- **User Story**: As a Team Member, I want to edit task details or delete completed tasks, so that task information remains accurate and up to date.
- **Complexity Score**: 3 Points
- **Status**: `READY_FOR_DEV`
- **Acceptance Criteria**:
  1. **AC-005.1 (Update Endpoint)**: `PUT /api/tasks/:id` updates title, description, priority, dueDate, and tags with `UpdateTaskInputSchema` Zod validation, returning `200 OK`.
  2. **AC-005.2 (Delete Endpoint)**: `DELETE /api/tasks/:id` removes the task and associated activity logs, returning `200 OK` or `204 No Content`.
  3. **AC-005.3 (Detail & Edit Modal UI)**: Clicking a task card opens a Full Detail Modal with inline editing, deletion confirmation, and status management.

---

### `STORY-006`: Activity Log API & Audit Trail Drawer
- **User Story**: As an Auditor / Manager, I want to view a full activity audit log for any task or workspace, so that I can trace all status updates and task modifications.
- **Complexity Score**: 5 Points
- **Status**: `READY_FOR_DEV`
- **Acceptance Criteria**:
  1. **AC-006.1 (Activity Log List Endpoint)**: `GET /api/activity-logs` returns paginated audit records for a `workspaceId` or specific `taskId`, returning `200 OK`.
  2. **AC-006.2 (Audit Trail UI Drawer)**: Sliding side drawer UI displaying chronological activity events (Task Created, Status Changed, Priority Updated) with actor timestamps.

---

### `STORY-007`: QA Integration & E2E Verification (Sprint 2)
- **User Story**: As a QA Reviewer, I want to execute integration tests for search, edit/delete, and activity log APIs, so that Sprint 2 features pass Definition of Done with zero regression.
- **Complexity Score**: 3 Points
- **Status**: `PENDING_IMPL`
- **Acceptance Criteria**:
  1. **AC-007.1 (Sprint 2 Integration Suite)**: Vitest suite verifying search filtering, update payload validation, delete actions, and audit log retrieval.
  2. **AC-007.2 (Zero Regression)**: 100% test pass rate and 0 typecheck compilation errors across `apps/api` and `apps/web`.
