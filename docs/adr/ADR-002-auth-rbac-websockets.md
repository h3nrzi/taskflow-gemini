# ADR-002: Authentication, Role-Based Access Control (RBAC), and Real-Time WebSockets

| Metadata | Details |
| :--- | :--- |
| **Status** | Approved |
| **Deciders** | System Architect (`system_architect`), Orchestrator (`AGY`) |
| **Date** | 2026-08-01 |
| **In-Response-To** | `docs/prd/PRD-002-auth-rbac-realtime.md` |

---

## 1. Context & Business Problem

As TaskFlow scales across multi-tenant enterprise organizations, isolated data access, fine-grained role permissions, and instant cross-client synchronization become paramount. Without stateless identity verification, unauthorized users could access multi-tenant workspaces. Without real-time event distribution, concurrent team members work on stale task state, leading to edit conflicts.

PRD-002 mandates a robust security, authorization, and real-time synchronization model covering:
1. **Stateless JWT Authentication & Identity Verification**
2. **Fastify Hook-Based Role-Based Access Control (RBAC)**
3. **Multi-Tenant Room-Isolated Real-Time WebSockets Gateway**

---

## 2. Decision Drivers & Technical Requirements

- **Contract-First Architectural Integrity**: All authentication requests, RBAC roles, and WebSocket frame structures must be defined as shared Zod schemas (`shared/schemas/`).
- **Clean Domain Boundaries**: Zero domain logic mixing between database persistence entities (Prisma/SQLite), authorization transport hooks, and UI presentation layers.
- **Low-Latency Event Synchronization**: Real-time event propagation across workspace members within sub-100ms latency.
- **Multi-Tenant Room Isolation**: Strict separation of socket channels by `workspaceId` preventing cross-tenant data leaks.

---

## 3. Detailed Architectural Specifications

### 3.1. JWT Token Structure & Authentication Scheme
- **Token Format**: Standard JSON Web Token (JWT) signed with HMAC-SHA256 (`HS256`).
- **Header Scheme**: HTTP requests transmit token via standard Authorization header:
  ```http
  Authorization: Bearer <jwt_access_token>
  ```
- **JWT Payload Structure**:
  ```json
  {
    "userId": "c56a4180-65aa-42ec-a945-5fd21dec0538",
    "email": "alex@taskflow.dev",
    "role": "MEMBER",
    "workspaceId": "ws-engineering-101",
    "iat": 1754006620,
    "exp": 1754093020
  }
  ```
  *Validated by `JwtPayloadSchema` in `shared/schemas/auth.schema.ts`.*
- **Authentication Lifecycle**:
  - `POST /api/auth/register`: Creates user, hashes password, returns `UserProfile` DTO.
  - `POST /api/auth/login`: Validates credentials, returns JWT token + sanitized `UserProfile` DTO (`AuthResponse`).
  - `GET /api/auth/me`: Authenticates Bearer token and returns active session user profile.

### 3.2. Password Hashing & Security Standard
- **Algorithm**: `bcrypt` password hashing with `10` salt rounds (adaptive cost parameter).
- **Storage**: Only the hashed string (`passwordHash`) is stored in the database.
- **Sanitization Policy**: Password hashes are strictly excluded from API response payloads (`UserProfileSchema` and `AuthResponseSchema`).

### 3.3. Fastify Hook-Based RBAC Middleware
- **Architecture**: Fastify decorator plugin (`@fastify/jwt` or custom preHandler decorator) enforcing permission checks prior to route controller execution.
- **Role Hierarchy**:
  - `OWNER`: Full administrative privileges across workspace settings, user membership/role updates, hard deletes, log purges, task CRUD, and real-time event broadcasting.
  - `MEMBER`: Operational privileges including Task CRUD (create, update/move Kanban column, soft delete), audit log viewing, WebSocket room subscription, and real-time event broadcasting. Restricted from workspace administration and user role changes.
  - `VIEWER`: Read-only observer privileges (`GET /api/tasks`, `GET /api/activity-logs`, WebSocket room listening). Strictly blocked (`403 Forbidden`) from all mutation endpoints (POST/PUT/DELETE) and event broadcasting.

- **RBAC Matrix**:

| Category | Endpoint / Event | OWNER | MEMBER | VIEWER |
| :--- | :--- | :---: | :---: | :---: |
| Workspace | Workspace Settings / Member Roles | Allowed | Denied (`403`) | Denied (`403`) |
| Tasks | View Kanban Board (`GET /api/tasks`) | Allowed | Allowed | Allowed |
| | Create Task (`POST /api/tasks`) | Allowed | Allowed | Denied (`403`) |
| | Update / Move Task (`PUT /api/tasks/:id`) | Allowed | Allowed | Denied (`403`) |
| | Soft Delete Task (`DELETE /api/tasks/:id`) | Allowed | Allowed | Denied (`403`) |
| | Hard Delete / Purge Task | Allowed | Denied (`403`) | Denied (`403`) |
| Activity Logs | View Audit Logs (`GET /api/activity-logs`) | Allowed | Allowed | Allowed |
| | Export / Clear Audit Logs | Allowed | Denied (`403`) | Denied (`403`) |
| Real-Time | Connect Socket & Subscribe Room | Allowed | Allowed | Allowed |
| | Broadcast State Event (`TASK_*`, etc.) | Allowed | Allowed | Denied (`403`) |

- **Execution Hook Flow**:
  1. `onRequest` / `preHandler`: Extract Bearer token from header.
  2. `jwt.verify`: Validate signature and expiration.
  3. `request.user`: Decorate request context with payload (`userId`, `email`, `role`, `workspaceId`).
  4. `authorizeRoles(...roles)` decorator: Match `request.user.role` against required route roles.
  5. Deny with `403 Forbidden` if role requirement is unmet; otherwise pass control to handler.

### 3.4. Real-Time WebSockets Architecture
- **Framework Integration**: `@fastify/websocket` plugin integrated directly into the Fastify backend server.
- **Handshake Authentication**:
  - WebSockets cannot always send custom HTTP headers during initial standard browser instantiation.
  - Authentication supports token extraction from either:
    1. Query Parameter: `ws://localhost:3001/ws?token=<jwt_access_token>`
    2. Handshake `Authorization: Bearer <token>` header (where supported).
  - Failed verification terminates the connection handshake immediately with code `4001 Unauthorized` (or HTTP 401).
- **Workspace Room Isolation**:
  - Connections subscribe to rooms scoped by tenant workspace: `workspace:${workspaceId}`.
  - Sockets only receive broadcast messages destined for their subscribed workspace room.
- **Event Dispatch Schema & Protocol**:
  - Standardized frame schema (`WsMessageSchema`):
    ```ts
    {
      type: WsEventTypeEnum, // TASK_CREATED, TASK_UPDATED, TASK_DELETED, ACTIVITY_LOGGED, SUBSCRIBE, UNSUBSCRIBE, ERROR
      workspaceId: string,
      payload: unknown,
      timestamp: string // ISO 8601
    }
    ```

### 3.5. Shared Zod Data Schemas Contract
- `shared/schemas/auth.schema.ts`:
  - `UserRoleEnum`: `'OWNER' | 'MEMBER' | 'VIEWER'`
  - `RegisterInputSchema`: `email`, `password` (min 8 chars), `name`
  - `LoginInputSchema`: `email`, `password`
  - `UserProfileSchema`: `id`, `email`, `name`, `role`, `workspaceId`, `createdAt`
  - `AuthResponseSchema`: `token`, `user`
  - `JwtPayloadSchema`: `userId`, `email`, `role`, `workspaceId`, `iat`, `exp`
- `shared/schemas/websocket.schema.ts`:
  - `WsEventTypeEnum`: `'TASK_CREATED' | 'TASK_UPDATED' | 'TASK_DELETED' | 'ACTIVITY_LOGGED' | 'SUBSCRIBE' | 'UNSUBSCRIBE' | 'ERROR'`
  - `WsSubscribePayloadSchema`: `workspaceId`
  - `WsMessageSchema`: `type`, `workspaceId`, `payload`, `timestamp`

---

## 4. Consequence & Architectural Trade-offs

### 4.1. Positive Consequences
- **Type Safety across Monorepo**: Frontend (`apps/web`) and Backend (`apps/api`) consume identical Zod schemas and TypeScript types.
- **Stateless & Scalable Auth**: Decoupled JWT authentication reduces database session lookup queries per API request.
- **Strict Tenant Isolation**: Workspace room partitioning eliminates cross-tenant data leakage in real-time streams.

### 4.2. Evaluated Architectural Trade-offs
1. **Stateless JWT Tokens vs. Server-Side Session Database**:
   - *Trade-off*: Stateless JWT avoids database lookups per request but prevents immediate token revocation before expiration (`exp`) without maintaining a token revocation list (TRL).
   - *Mitigation*: Short expiration lifetimes for access tokens coupled with role re-validation on sensitive routes.
2. **In-Memory Fastify WebSocket Rooms vs. Distributed Redis Pub/Sub**:
   - *Trade-off*: In-memory room management within Fastify is fast and zero-dependency for single-node deployment, but requires Redis Pub/Sub adapter when scaling horizontally across multiple API container instances.
   - *Mitigation*: Clean encapsulation of room broadcast methods so a Redis adapter can be swapped seamlessly in future scaling phases.
3. **Fastify `preHandler` Authorization Decorator vs. Inline Controller Logic**:
   - *Trade-off*: Centralized hook-based RBAC decorators enforce uniform security policies declarative on routes, reducing duplication but requiring developers to explicitly annotate routes.

---

## 5. Quality Gate Compliance

- **Contract-First Integrity**: Verified. All endpoints and WebSocket events are defined with Zod schemas in `shared/schemas/`.
- **Clean Domain Boundaries**: Verified. Zero domain logic or database entity leakage in network transport contracts.
