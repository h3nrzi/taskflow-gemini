# ADR-001: Tech Stack Specification & Monorepo Architecture

| Metadata | Details |
| :--- | :--- |
| **Status** | Approved |
| **Deciders** | System Architect (`system_architect`), Orchestrator (`AGY`) |
| **Date** | 2026-07-31 |
| **In-Response-To** | `docs/prd/PRD-001-core-platform.md` |

---

## 1. Context & Business Problem
TaskFlow requires a modular, maintainable, and type-safe architecture to support multi-tenant task management. To enable fast development iterations while enforcing clear layer boundaries, we require a standardized technology stack and monorepo structure.

---

## 2. Decision Driver & Technical Requirements
- **Contract-First Architecture**: Endpoints and UI must share a single source of truth for domain models and DTO schemas.
- **Strict Boundary Separation**: Zero mixing of database persistence logic, network transport schemas, and UI rendering code.
- **Fast Developer Ergonomics & Execution**: Instant typechecking, lightweight local DB setup, and robust API performance.

---

## 3. Technology Stack Selection

### 3.1. Frontend Web App (`apps/web`)
- **Framework**: Next.js 15 (App Router, React 19)
- **Styling & UI**: Tailwind CSS v3 + `shadcn/ui` component primitives
- **State & Data Fetching**: React Server Components & TanStack React Query v5

### 3.2. Backend API Service (`apps/api`)
- **Runtime**: Node.js v20+ with TypeScript
- **Framework**: Fastify v4/v5 (Fast, low overhead, JSON schema support)
- **ORM & Database**: Prisma ORM with SQLite database driver (`file:./dev.db`)
- **Validation**: Fastify type-provider-zod with Zod schema validation

### 3.3. Shared Schema Layer (`packages/shared` / `shared/schemas`)
- **Schema Validation Library**: Zod (`z.object`, `z.enum`, `z.infer`)
- **Exports**: Pure TypeScript type definitions and Zod runtime validator schemas shared between `apps/api` and `apps/web`.

---

## 4. Architecture & Monorepo Structure

```
taskflow-gemini/
├── agents/                   # Agent contracts & dispatch prompts
├── docs/
│   ├── prd/                  # Product Requirement Documents
│   ├── adr/                  # Architecture Decision Records
│   └── sprint/               # Backlog & Sprint Tracking
├── shared/
│   └── schemas/              # Zod Data Contracts & Types
│       └── task.schema.ts
└── apps/
    ├── api/                  # Fastify Backend Service (Prisma + SQLite)
    └── web/                  # Next.js 15 Frontend Application
```

---

## 5. Consequences & Compliance Rules
- **Positive**:
  - Full end-to-end type safety from SQLite database to React components.
  - Zero payload mismatch risks due to shared Zod contracts.
- **Negative**:
  - Requires maintaining shared package paths and monorepo build references.
- **Quality Gate Compliance**:
  - All API routes must perform Zod schema validation before controller execution.
  - Invalid payload inputs must reject immediately with HTTP status `422 Unprocessable Entity`.
