# PRD-001: Core Task Management Platform

| Document Metadata | Details |
| :--- | :--- |
| **Document ID** | PRD-001 |
| **Title** | Core Task Management SaaS Platform |
| **Author** | Product Manager (`product_manager`) |
| **Status** | Approved / Ready for Architecture |
| **Created Date** | 2026-07-31 |

---

## 1. Executive Summary & Product Vision
TaskFlow is a modern, high-performance Task Management SaaS designed for multi-tenant organizations and agile teams. The platform enables users to organize, track, and collaborate on tasks across customizable workflows with multi-tenancy, Kanban visualization, granular task metadata, and comprehensive activity logging.

---

## 2. Target User Personas
- **Workspace Admin (`admin`)**: Responsible for workspace creation, user management, project administration, and tenant settings.
- **Team Member (`developer` / `designer` / `manager`)**: Responsible for creating, updating, moving, and completing tasks on Kanban boards.
- **Auditor / Manager (`viewer`)**: Requires visibility into activity logs, audit trails, and overall task progression across projects.

---

## 3. Core Feature Requirements

### 3.1. Multi-Tenant Workspaces
- Users belong to one or more Workspaces (Tenants).
- All workspace data (Tasks, Tags, Activity Logs) is strictly isolated per tenant (`tenantId`).
- Roles per workspace: `OWNER`, `MEMBER`, `VIEWER`.

### 3.2. Interactive Kanban Board
- Visual columns representing workflow states:
  - `TODO` (Backlog / Not Started)
  - `IN_PROGRESS` (Active Development / Work in Progress)
  - `DONE` (Completed / Verified)
- Drag-and-drop or status toggle support between columns with immediate UI feedback.

### 3.3. Task Lifecycle & Metadata
Each task contains the following structured attributes:
- `id` (string / UUID)
- `workspaceId` (string / UUID)
- `title` (string, 1-100 characters)
- `description` (optional string, markdown supported)
- `status` (`TODO` | `IN_PROGRESS` | `DONE`)
- `priority` (`LOW` | `MEDIUM` | `HIGH` | `URGENT`)
- `dueDate` (optional ISO 8601 date string)
- `tags` (array of string labels)
- `createdAt` & `updatedAt` timestamps

### 3.4. Activity Logging
- Every mutation (create, status update, priority change, deletion) generates an indelible Activity Log entry.
- Log record attributes: `id`, `taskId`, `workspaceId`, `action`, `actorId`, `timestamp`, `details`.

---

## 4. User Stories & Acceptance Criteria

### Story 1: Task Schemas & Backend API (`STORY-001`)
- **Format**: As a Backend Developer, I want type-safe Task schemas and Fastify REST API endpoints, so that the web client can securely create, query, update, and track tasks.
- **Complexity**: 5 points

### Story 2: Frontend Kanban Board UI (`STORY-002`)
- **Format**: As a Team Member, I want an interactive Kanban board interface, so that I can visually manage and drag tasks between Todo, In Progress, and Done columns.
- **Complexity**: 3 points

### Story 3: QA E2E & Integration Verification (`STORY-003`)
- **Format**: As a QA Reviewer, I want automated integration and E2E test coverage, so that task lifecycle state changes and API validation rules remain regression-free.
- **Complexity**: 3 points
