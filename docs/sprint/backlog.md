# Sprint Backlog — TaskFlow Core Platform

## Sprint 1 (Completed)

| Story ID | Title | Role | Complexity Points | Status | Assigned Agent |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `STORY-001` | Task Schemas & Backend API | Backend Developer | 5 | `DONE` | `backend_developer` |
| `STORY-002` | Frontend Kanban Board UI | Frontend Developer | 3 | `DONE` | `frontend_developer` |
| `STORY-003` | QA Integration & E2E Tests | QA Reviewer | 3 | `DONE` | `qa_reviewer` |

---

## Sprint 2 (Completed)

| Story ID | Title | Role | Complexity Points | Status | Assigned Agent |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `STORY-004` | Task Search, Priority & Tag Filtering | Fullstack | 3 | `DONE` | `frontend_developer` / `backend_developer` |
| `STORY-005` | Task Edit, Delete & Detail Modal | Fullstack | 3 | `DONE` | `frontend_developer` / `backend_developer` |
| `STORY-006` | Activity Log API & Audit Trail Drawer | Fullstack | 5 | `DONE` | `backend_developer` / `frontend_developer` |
| `STORY-007` | QA Integration & E2E Verification (Sprint 2) | QA Reviewer | 3 | `DONE` | `qa_reviewer` |

---

## Sprint 2 Story Verification Summary

### `STORY-004`: Task Search, Priority & Tag Filtering
- **Status**: `DONE`
- **Acceptance Criteria Verification**:
  1. **AC-004.1 (Backend Filter Schema & Endpoint)**: `GET /api/tasks` query params (`search`, `priority`, `tag`) implemented in Prisma query. [PASSED]
  2. **AC-004.2 (Filter Validation)**: Invalid query filter params return `422 Unprocessable Entity`. [PASSED]
  3. **AC-004.3 (UI Search Bar & Filter Controls)**: Top bar search bar, priority dropdown, tag filter integrated into Next.js UI. [PASSED]

### `STORY-005`: Task Edit, Delete & Detail Modal
- **Status**: `DONE`
- **Acceptance Criteria Verification**:
  1. **AC-005.1 (Update Endpoint)**: `PUT /api/tasks/:id` updates title, description, priority, dueDate, tags with Zod validation (`200 OK`). [PASSED]
  2. **AC-005.2 (Delete Endpoint)**: `DELETE /api/tasks/:id` deletes task & writes audit log (`200 OK`). [PASSED]
  3. **AC-005.3 (Detail & Edit Modal UI)**: TaskDetailModal component with inline editing and delete confirmation state. [PASSED]

### `STORY-006`: Activity Log API & Audit Trail Drawer
- **Status**: `DONE`
- **Acceptance Criteria Verification**:
  1. **AC-006.1 (Activity Log List Endpoint)**: `GET /api/activity-logs` returns paginated audit records for workspace/task (`200 OK`). [PASSED]
  2. **AC-006.2 (Audit Trail UI Drawer)**: ActivityLogDrawer sliding component displaying audit events. [PASSED]

### `STORY-007`: QA Integration & E2E Verification (Sprint 2)
- **Status**: `DONE`
- **Acceptance Criteria Verification**:
  1. **AC-007.1 (Sprint 2 Integration Suite)**: Vitest suite verifying search filtering, update payload validation, delete actions, and audit log retrieval. [PASSED]
  2. **AC-007.2 (Zero Regression)**: 100% test pass rate and 0 typecheck compilation errors across `apps/api` and `apps/web`. [PASSED]

---

## Sprint 3 (Completed)

| Story ID | Title | Role | Complexity Points | Status | Assigned Agent |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `STORY-008` | Auth & JWT Authentication | Backend | 5 | `DONE` | `backend_developer` |
| `STORY-009` | RBAC Authorization Middleware | Backend | 3 | `DONE` | `backend_developer` |
| `STORY-010` | Real-Time WebSocket Gateway & Subscriptions | Fullstack | 5 | `DONE` | `backend_developer` / `frontend_developer` |
| `STORY-011` | QA Automated Verification (Sprint 3) | QA Reviewer | 3 | `DONE` | `qa_reviewer` |

---

## Sprint 3 User Story Details

### `STORY-008`: Auth & JWT Authentication
- **Role**: Backend Developer
- **Complexity Points**: 5
- **Status**: `DONE`
- **Assigned Agent**: `backend_developer`
- **User Story**: As a User, I want to register and log in with secure password hashing and JWT authentication, so that my identity is authenticated across API requests.
- **Acceptance Criteria**:
  - AC-008.1: `POST /api/auth/register` accepts `email`, `password`, and `name`. Hashes password with `bcrypt` (salt rounds 10), creates user record, and returns `201 Created` with sanitized user object (no password).
  - AC-008.2: `POST /api/auth/login` validates credentials via `bcrypt.compare`, issues signed JWT access token (containing `userId` and `email`), and returns `200 OK` with token and user object. Returns `401 Unauthorized` for invalid credentials.
  - AC-008.3: Protected endpoint `GET /api/auth/me` validates `Authorization: Bearer <token>` header, decodes JWT, and returns active user profile. Returns `401 Unauthorized` for missing, expired, or malformed tokens.

### `STORY-009`: RBAC Authorization Middleware
- **Role**: Backend Developer
- **Complexity Points**: 3
- **Status**: `DONE`
- **Assigned Agent**: `backend_developer`
- **User Story**: As a Workspace Admin, I want role-based authorization middleware enforcing workspace permissions, so that users can only perform actions allowed by their role (OWNER, MEMBER, VIEWER).
- **Acceptance Criteria**:
  - AC-009.1: Create Fastify authentication plugin/decorator that extracts and verifies JWT header, attaching `request.user` context to incoming HTTP requests.
  - AC-009.2: Create `authorizeRoles(...roles)` middleware that checks `request.user.role` against allowed permissions for target workspace resources, returning `403 Forbidden` with standard error response if unauthorized.
  - AC-009.3: Enforce RBAC matrix across task mutation routes: `VIEWER` receives `403 Forbidden` on POST/PUT/DELETE, `MEMBER` can POST/PUT/DELETE tasks, and `OWNER` retains full administrative access.

### `STORY-010`: Real-Time WebSocket Gateway & Event Subscriptions
- **Role**: Fullstack (`backend_developer` / `frontend_developer`)
- **Complexity Points**: 5
- **Status**: `DONE`
- **Assigned Agent**: `backend_developer` / `frontend_developer`
- **User Story**: As a Team Member, I want real-time WebSocket room subscriptions and event notifications, so that task updates and activity logs propagate live across clients.
- **Acceptance Criteria**:
  - AC-010.1: Implement Fastify WebSocket gateway requiring valid JWT authentication on handshake, terminating unauthenticated socket attempts with `4001 Unauthorized`.
  - AC-010.2: Implement workspace room subscription protocol (`join-room` / `leave-room`) partitioning client events by `workspaceId`.
  - AC-010.3: Broadcast real-time events (`TASK_CREATED`, `TASK_UPDATED`, `TASK_DELETED`, `ACTIVITY_LOGGED`) to all connected sockets in target workspace room upon database mutation.
  - AC-010.4: Update Next.js frontend client to establish WebSocket connection post-login, subscribe to active workspace room, and automatically re-render Kanban board and activity drawer on received events.

### `STORY-011`: QA Verification & Automated Test Suite (Sprint 3)
- **Role**: QA Reviewer
- **Complexity Points**: 3
- **Status**: `DONE`
- **Assigned Agent**: `qa_reviewer`
- **User Story**: As a QA Reviewer, I want comprehensive unit, integration, and end-to-end automated tests for Auth, RBAC, and WebSockets, so that system security and real-time synchronization are fully verified without regressions.
- **Acceptance Criteria**:
  - AC-011.1: Unit and integration test suite covering Auth endpoints (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`), password hashing verification, and JWT expiration/invalidation edge cases.
  - AC-011.2: Integration tests validating RBAC permission matrix for `OWNER`, `MEMBER`, and `VIEWER` roles across task CRUD operations (verifying `200 OK` vs `403 Forbidden`).
  - AC-011.3: Automated WebSocket tests verifying client handshake authentication, room subscription isolation, and end-to-end propagation of `TASK_UPDATED` and `TASK_CREATED` events across concurrent sockets.

---

## Sprint 3 Story Verification Summary

### `STORY-008`: Auth & JWT Authentication
- **Status**: `DONE`
- **Acceptance Criteria Verification**:
  1. **AC-008.1 (Register & Password Hashing)**: `POST /api/auth/register` creates user record, hashes password with `bcrypt` (10 rounds), and returns `201 Created` with sanitized user object (omitting `passwordHash`). Rejects duplicates with `409 Conflict`. [PASSED]
  2. **AC-008.2 (Login & JWT Issuance)**: `POST /api/auth/login` verifies password via `bcrypt.compare`, issues signed JWT access token, and returns `200 OK` with token and profile. Rejects invalid credentials with `401 Unauthorized`. [PASSED]
  3. **AC-008.3 (Me Endpoint & Session Validation)**: `GET /api/auth/me` validates `Authorization: Bearer <token>` header, decodes payload, and returns current user profile (`200 OK`). Rejects malformed/invalid tokens with `401 Unauthorized`. [PASSED]

### `STORY-009`: RBAC Authorization Middleware
- **Status**: `DONE`
- **Acceptance Criteria Verification**:
  1. **AC-009.1 (Fastify Auth Decorator)**: `@fastify/jwt` decorator plugin extracts header, verifies token, and decorates request context with `request.user`. [PASSED]
  2. **AC-009.2 (authorizeRoles Middleware)**: `authorizeRoles(...roles)` preHandler hook checks `request.user.role` against required permissions and returns `403 Forbidden` (`Insufficient role permissions`) when unauthorized. [PASSED]
  3. **AC-009.3 (RBAC Matrix Enforcement)**: `VIEWER` role receives `403 Forbidden` on mutation routes (POST, PUT, DELETE), while `MEMBER` and `OWNER` are permitted full task mutation privileges. [PASSED]

### `STORY-010`: Real-Time WebSocket Gateway & Event Subscriptions
- **Status**: `DONE`
- **Acceptance Criteria Verification**:
  1. **AC-010.1 (Handshake Token Auth)**: Handshake validates `?token=` query param or header via JWT verification, closing unauthenticated connections with code `4001`. [PASSED]
  2. **AC-010.2 (Workspace Room Partitioning)**: Clients send `SUBSCRIBE` messages with `workspaceId`, joining room `workspace:${workspaceId}` to isolate streams per tenant. [PASSED]
  3. **AC-010.3 (Event Broadcast)**: Fastify mutations dispatch `TASK_CREATED`, `TASK_UPDATED`, `TASK_DELETED`, and `ACTIVITY_LOGGED` real-time events to all clients in target workspace room. [PASSED]
  4. **AC-010.4 (Frontend Live Sync)**: `useWebSocket` hook in `apps/web` connects on login, subscribes to active workspace room, and automatically triggers `loadTasks()` and toast alerts on received events. [PASSED]

### `STORY-011`: QA Verification & Automated Test Suite (Sprint 3)
- **Status**: `DONE`
- **Acceptance Criteria Verification**:
  1. **AC-011.1 (Auth Test Suite)**: Vitest tests cover register, login, credential failure, and session profile endpoints. [PASSED]
  2. **AC-011.2 (RBAC Permission Matrix Tests)**: Integration tests verify `OWNER` / `MEMBER` success vs `VIEWER` `403 Forbidden` returns on POST, PUT, and DELETE operations. [PASSED]
  3. **AC-011.3 (WebSocket Gateway Automated Tests)**: `app.injectWS` tests verify invalid handshake rejection (code `4001`), room subscription setup, and live event broadcasting (`TASK_CREATED`, `TASK_DELETED`). [PASSED]


