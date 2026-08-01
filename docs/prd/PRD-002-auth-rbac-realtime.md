# PRD-002: Authentication, Role-Based Access Control (RBAC), and Real-Time WebSockets

| Document Metadata | Details |
| :--- | :--- |
| **Document ID** | PRD-002 |
| **Title** | Enterprise Security, Auth, RBAC & Real-Time Collaboration Gateway |
| **Author** | Product Manager (`product_manager`) |
| **Status** | Approved / Ready for Architecture |
| **Created Date** | 2026-08-01 |

---

## 1. Executive Summary & Product Vision

As TaskFlow scales across multi-tenant organizations and agile teams, secure multi-tenant isolation, granular access authorization, and real-time collaborative state synchronization become critical foundational requirements. 

PRD-002 defines the architecture and requirements for:
1. **Authentication & Identity Management**: Secure user registration, password hashing via `bcrypt`, and stateless JWT (JSON Web Token) access token issuance/verification.
2. **Role-Based Access Control (RBAC)**: Fine-grained permissions framework defining `OWNER`, `MEMBER`, and `VIEWER` roles across Workspaces, Tasks, Audit Logs, and Socket streams.
3. **Real-Time WebSockets Gateway**: Low-latency event-driven WebSocket gateway using workspace-level room subscriptions to broadcast live task mutations (`TASK_CREATED`, `TASK_UPDATED`, `TASK_DELETED`) and audit trails (`ACTIVITY_LOGGED`).

---

## 2. Target User Personas & Roles

TaskFlow enforces strict role hierarchy within each workspace context (`tenantId`):

- **Workspace Owner (`OWNER`)**: 
  - Administrative authority over workspace settings, user membership, and role assignments.
  - Full CRUD privileges on tasks, activity logs, and administrative configurations.
  - Can publish and receive all WebSocket updates.
- **Team Member (`MEMBER`)**:
  - Operational workspace user responsible for day-to-day work.
  - Can create tasks, edit assigned/workspace tasks, move tasks across Kanban columns, and view activity logs.
  - Receives and triggers real-time workspace updates.
  - Cannot alter workspace administration or modify user roles.
- **Auditor / Observer (`VIEWER`)**:
  - Read-only stakeholder who monitors workspace progress, Kanban boards, and audit history.
  - Can view tasks, search/filter boards, listen to live real-time updates.
  - Strictly blocked from performing any mutation (create, update, delete) operations.

---

## 3. Detailed Feature Requirements

### 3.1. Authentication & Identity Management (Auth & JWT)
- **User Registration (`POST /api/auth/register`)**:
  - Accepts `email`, `password` (min 8 characters), and `name`.
  - Hashes passwords using `bcrypt` (salt rounds >= 10) prior to database persistence.
  - Prevents duplicate registration for existing email addresses (`409 Conflict`).
- **User Login (`POST /api/auth/login`)**:
  - Validates user credentials against stored `bcrypt` hash.
  - Generates signed JWT access tokens containing claims (`userId`, `email`, `defaultWorkspaceId`).
  - Returns `200 OK` with token payload and user profile (excluding `passwordHash`).
- **Token Verification & Session Validation (`GET /api/auth/me`)**:
  - Inspects `Authorization: Bearer <token>` header on protected routes.
  - Verifies token signature, expiration (`exp`), and active user status.
  - Returns `401 Unauthorized` for invalid or expired tokens.

### 3.2. Role-Based Access Control (RBAC) Matrix
The authorization layer must evaluate every request against the user's assigned role (`OWNER`, `MEMBER`, `VIEWER`) for the target workspace (`workspaceId`).

| Operation Category | Specific Action / Endpoint | OWNER | MEMBER | VIEWER |
| :--- | :--- | :---: | :---: | :---: |
| **Workspace** | View Workspace Info & Members | Allowed | Allowed | Allowed |
| | Update Workspace Settings | Allowed | Denied (`403`) | Denied (`403`) |
| | Invite / Remove Workspace Members | Allowed | Denied (`403`) | Denied (`403`) |
| | Change User Roles | Allowed | Denied (`403`) | Denied (`403`) |
| **Tasks** | View Kanban Tasks (`GET /api/tasks`) | Allowed | Allowed | Allowed |
| | Create Task (`POST /api/tasks`) | Allowed | Allowed | Denied (`403`) |
| | Update Task / Move Column (`PUT /api/tasks/:id`) | Allowed | Allowed | Denied (`403`) |
| | Soft Delete Task (`DELETE /api/tasks/:id`) | Allowed | Allowed | Denied (`403`) |
| | Hard Delete Task / Purge | Allowed | Denied (`403`) | Denied (`403`) |
| **Activity Logs** | View Audit Logs (`GET /api/activity-logs`) | Allowed | Allowed | Allowed |
| | Export / Clear Logs | Allowed | Denied (`403`) | Denied (`403`) |
| **Real-Time** | Connect WebSocket & Subscribe Room | Allowed | Allowed | Allowed |
| | Broadcast Event Trigger | Allowed | Allowed | Denied (`403`) |

### 3.3. Real-Time WebSockets Gateway & Room Subscriptions
- **Gateway Architecture**:
  - WebSocket gateway running on Fastify backend infrastructure.
  - Authenticates WebSocket connection handshakes via JWT token passed via query parameter (`?token=...`) or auth header.
- **Workspace Room Isolation**:
  - Connected sockets subscribe to specific workspace rooms (`workspace:${workspaceId}`).
  - Cross-tenant event leaking is strictly prevented; clients only receive events for subscribed rooms.
- **Standard Real-Time Event Types**:
  - `TASK_CREATED`: Emitted upon successful task creation, transmitting complete task payload.
  - `TASK_UPDATED`: Emitted upon task state/metadata update (e.g. status move from `TODO` to `IN_PROGRESS`).
  - `TASK_DELETED`: Emitted upon task deletion, transmitting `taskId` and `workspaceId`.
  - `ACTIVITY_LOGGED`: Emitted whenever a new audit record is generated.

---

## 4. User Stories & Acceptance Criteria

### STORY-008: Auth & JWT Authentication
- **User Story**: As a User, I want to register and log in with secure password hashing and JWT authentication, so that my identity is authenticated across API requests.
- **Assigned Agent**: `backend_developer`
- **Complexity**: 5 points
- **Acceptance Criteria**:
  - **AC-008.1**: `POST /api/auth/register` accepts `email`, `password`, and `name`. Hashes password with `bcrypt` (salt rounds 10), creates user record, and returns `201 Created` with sanitized user object (no password).
  - **AC-008.2**: `POST /api/auth/login` validates credentials via `bcrypt.compare`, issues signed JWT access token (containing `userId` and `email`), and returns `200 OK` with token and user object. Returns `401 Unauthorized` for invalid credentials.
  - **AC-008.3**: Protected endpoint `GET /api/auth/me` validates `Authorization: Bearer <token>` header, decodes JWT, and returns active user profile. Returns `401 Unauthorized` for missing, expired, or malformed tokens.

### STORY-009: RBAC Authorization Middleware
- **User Story**: As a Workspace Admin, I want role-based authorization middleware enforcing workspace permissions, so that users can only perform actions allowed by their role (OWNER, MEMBER, VIEWER).
- **Assigned Agent**: `backend_developer`
- **Complexity**: 3 points
- **Acceptance Criteria**:
  - **AC-009.1**: Create Fastify authentication plugin/decorator that extracts and verifies JWT header, attaching `request.user` context to incoming HTTP requests.
  - **AC-009.2**: Create `authorizeRoles(...roles)` middleware that checks `request.user.role` against allowed permissions for target workspace resources, returning `403 Forbidden` with standard error response if unauthorized.
  - **AC-009.3**: Enforce RBAC matrix across task mutation routes: `VIEWER` receives `403 Forbidden` on POST/PUT/DELETE, `MEMBER` can POST/PUT/DELETE tasks, and `OWNER` retains full administrative access.

### STORY-010: Real-Time WebSocket Gateway & Event Subscriptions
- **User Story**: As a Team Member, I want real-time WebSocket room subscriptions and event notifications, so that task updates and activity logs propagate live across clients.
- **Assigned Agent**: `backend_developer` / `frontend_developer`
- **Complexity**: 5 points
- **Acceptance Criteria**:
  - **AC-010.1**: Implement Fastify WebSocket gateway requiring valid JWT authentication on handshake, terminating unauthenticated socket attempts with `4001 Unauthorized`.
  - **AC-010.2**: Implement workspace room subscription protocol (`join-room` / `leave-room`) partitioning client events by `workspaceId`.
  - **AC-010.3**: Broadcast real-time events (`TASK_CREATED`, `TASK_UPDATED`, `TASK_DELETED`, `ACTIVITY_LOGGED`) to all connected sockets in target workspace room upon database mutation.
  - **AC-010.4**: Update Next.js frontend client to establish WebSocket connection post-login, subscribe to active workspace room, and automatically re-render Kanban board and activity drawer on received events.

### STORY-011: QA Verification & Automated Test Suite (Sprint 3)
- **User Story**: As a QA Reviewer, I want comprehensive unit, integration, and end-to-end automated tests for Auth, RBAC, and WebSockets, so that system security and real-time synchronization are fully verified without regressions.
- **Assigned Agent**: `qa_reviewer`
- **Complexity**: 3 points
- **Acceptance Criteria**:
  - **AC-011.1**: Unit and integration test suite covering Auth endpoints (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`), password hashing verification, and JWT expiration/invalidation edge cases.
  - **AC-011.2**: Integration tests validating RBAC permission matrix for `OWNER`, `MEMBER`, and `VIEWER` roles across task CRUD operations (verifying `200 OK` vs `403 Forbidden`).
  - **AC-011.3**: Automated WebSocket tests verifying client handshake authentication, room subscription isolation, and end-to-end propagation of `TASK_UPDATED` and `TASK_CREATED` events across concurrent sockets.
