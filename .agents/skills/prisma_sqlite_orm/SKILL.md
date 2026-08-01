---
name: prisma_sqlite_orm
description: Data persistence architecture using Prisma ORM with SQLite database driver, schema design, model indexing, and audit logging.
---

# Prisma ORM & SQLite Persistence Skill

This skill defines database schema modeling, ORM client instantiation, query optimization, and audit trail logging.

## 1. Prisma Schema Guidelines
- Define models with UUID primary keys, default timestamps, and tenant indices:
  ```prisma
  model Task {
    id           String   @id @default(uuid())
    workspaceId  String
    title        String
    status       String   @default("TODO")
    createdAt    DateTime @default(now())
    updatedAt    DateTime @updatedAt

    @@index([workspaceId])
    @@index([workspaceId, status])
  }
  ```

## 2. Multi-Tenant Isolation
- Always include `workspaceId` filter in database queries to guarantee multi-tenant data boundary isolation.

## 3. Automatic Audit Trail Logging
- Generate indelible `ActivityLog` entries for every mutation (create, update, status change, delete) within database transactions or service layer operations.

## 4. Migration & Schema Synchronization
- Use `npx prisma db push` and `npx prisma generate` to keep client definitions in sync across the workspace.
