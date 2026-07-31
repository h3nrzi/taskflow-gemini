# Sprint Backlog — TaskFlow Core Platform

| Story ID | Title | Role | Complexity Points | Status | Assigned Agent |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `STORY-001` | Task Schemas & Backend API | Backend Developer | 5 | `DONE` | `backend_developer` |
| `STORY-002` | Frontend Kanban Board UI | Frontend Developer | 3 | `DONE` | `frontend_developer` |
| `STORY-003` | QA Integration & E2E Tests | QA Reviewer | 3 | `DONE` | `qa_reviewer` |

---

## Story Details & Verification Results

### `STORY-001`: Task Schemas & Backend API
- **User Story**: As a Backend Developer, I want type-safe Task schemas and Fastify REST API endpoints, so that the web client can securely create, query, update, and track tasks.
- **Complexity Score**: 5 Points
- **Status**: `DONE`
- **Acceptance Criteria Verification**:
  1. **AC-001.1 (Contract-First Schemas)**: `shared/schemas/task.schema.ts` exports Zod schemas (`TaskSchema`, `CreateTaskInputSchema`, `UpdateTaskStatusInputSchema`, `TaskStatusEnum`) and derived TypeScript types. [PASSED]
  2. **AC-001.2 (Create Task Endpoint)**: `POST /api/tasks` creates a task in SQLite database via Prisma, returning `201 Created` with the created task payload. [PASSED]
  3. **AC-001.3 (List Tasks Endpoint)**: `GET /api/tasks` returns `200 OK` with an array of tasks filtered by `workspaceId` and optional `status`. [PASSED]
  4. **AC-001.4 (Update Status Endpoint)**: `PATCH /api/tasks/:id/status` updates the task status (`TODO` -> `IN_PROGRESS` -> `DONE`), returning `200 OK` with updated task payload. [PASSED]
  5. **AC-001.5 (Payload Fail-Fast)**: Invalid input payloads (e.g. missing title, invalid status string) are rejected immediately with `422 Unprocessable Entity`. [PASSED]
  6. **AC-001.6 (Activity Log Audit)**: Task status mutations create an audit record in the Activity Log table. [PASSED]

---

### `STORY-002`: Frontend Kanban Board UI
- **User Story**: As a Team Member, I want an interactive Kanban board interface, so that I can visually manage and drag tasks between Todo, In Progress, and Done columns.
- **Complexity Score**: 3 Points
- **Status**: `DONE`
- **Acceptance Criteria Verification**:
  1. **AC-002.1 (Kanban Layout)**: Layout presents 3 distinct columns (`TODO`, `IN_PROGRESS`, `DONE`) styled using Tailwind CSS and shadcn/ui. [PASSED]
  2. **AC-002.2 (Task Cards)**: Each task card displays Title, Priority badge, Due Date, and Tags. [PASSED]
  3. **AC-002.3 (Interactive State Transition)**: Changing a task column triggers a `PATCH /api/tasks/:id/status` request and updates state cleanly. [PASSED]
  4. **AC-002.4 (Type Safety)**: 100% of API query/mutation payloads consume shared Zod schemas from `@taskflow/shared`. [PASSED]
  5. **AC-002.5 (Error Feedback)**: Failed API responses (4xx/5xx) render accessible Toast notifications and Alert UI states. [PASSED]

---

### `STORY-003`: QA Integration & E2E Verification
- **User Story**: As a QA Reviewer, I want automated integration and E2E test coverage, so that task lifecycle state changes and API validation rules remain regression-free.
- **Complexity Score**: 3 Points
- **Status**: `DONE`
- **Acceptance Criteria Verification**:
  1. **AC-003.1 (AC Verification)**: All acceptance criteria in `STORY-001` and `STORY-002` verified with automated test executions. [PASSED]
  2. **AC-003.2 (Zero Regression)**: Unit, integration, and typecheck commands run without failure. [PASSED]
  3. **AC-003.3 (Definition of Done)**: Code formatting, schema validation, and error state criteria satisfied. [PASSED]
