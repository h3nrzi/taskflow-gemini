---
name: react_nextjs_clean_arch
description: Clean architecture patterns for React 19 and Next.js 15 App Router, custom hooks isolation, zero raw fetch in UI components, and modular state management.
---

# React & Next.js Clean Architecture Skill

This skill defines the architectural boundary and component encapsulation rules for frontend application development.

## 1. Network & Data Fetching Encapsulation
- **ZERO Raw `fetch()` in UI**: Components MUST NOT contain inline HTTP requests or raw `fetch()` strings.
- **Dedicated Service Layer**: All network API calls must be encapsulated inside `src/lib/api.ts` or feature-specific API service modules.
- **Custom Hooks Isolation**: Wrap data fetching, state mutations, and WebSockets connections in reusable custom hooks (`useTasks`, `useWebSocket`, `useAuth`).

## 2. Component Layer Separation
- **Container / Page Components** (`src/app/page.tsx`): Manage page layout, route state, data orchestration, and top-level error boundaries.
- **Presentational Components** (`src/components/`): Pure or modular UI elements (`KanbanColumn`, `TaskCard`, `TaskDetailModal`) that accept typed props and emit callback events.

## 3. Type-Safe API Consumption
- 100% of network DTO types (request payloads, query parameters, response structures) must be imported directly from shared contracts (`shared/schemas/`).

## 4. Error State Handling
- Handle 4xx/5xx network errors gracefully using toast notification triggers (`toast.error()`) and inline alert banners (`ToastAlert`).
