import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../src/app.js';
import { prisma } from '../src/db.js';

describe('Task REST API Integration Tests (Sprint 1 & Sprint 2)', () => {
  const app = buildApp();
  const testWorkspaceId = 'ws-test-sprint2';
  let createdTaskId: string;

  beforeAll(async () => {
    await app.ready();
    await prisma.activityLog.deleteMany({ where: { workspaceId: testWorkspaceId } });
    await prisma.task.deleteMany({ where: { workspaceId: testWorkspaceId } });
  });

  afterAll(async () => {
    await prisma.activityLog.deleteMany({ where: { workspaceId: testWorkspaceId } });
    await prisma.task.deleteMany({ where: { workspaceId: testWorkspaceId } });
    await prisma.$disconnect();
    await app.close();
  });

  it('POST /api/tasks — creates a task successfully (201 Created)', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/tasks',
      payload: {
        workspaceId: testWorkspaceId,
        title: 'Refactor Fastify Endpoints',
        description: 'Add Sprint 2 endpoints with Zod payload validation',
        priority: 'HIGH',
        tags: ['backend', 'sprint2', 'zod'],
      },
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.payload);
    expect(body.id).toBeDefined();
    expect(body.title).toBe('Refactor Fastify Endpoints');
    expect(body.status).toBe('TODO');
    expect(body.priority).toBe('HIGH');
    expect(body.tags).toEqual(['backend', 'sprint2', 'zod']);

    createdTaskId = body.id;
  });

  it('GET /api/tasks — filters tasks by search keyword and priority (STORY-004)', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/api/tasks?workspaceId=${testWorkspaceId}&search=Refactor&priority=HIGH`,
    });

    expect(response.statusCode).toBe(200);
    const tasks = JSON.parse(response.payload);
    expect(Array.isArray(tasks)).toBe(true);
    expect(tasks.length).toBe(1);
    expect(tasks[0].id).toBe(createdTaskId);
  });

  it('PUT /api/tasks/:id — updates full task details (STORY-005)', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: `/api/tasks/${createdTaskId}`,
      payload: {
        title: 'Updated Fastify Endpoints Title',
        priority: 'URGENT',
        tags: ['backend', 'updated'],
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.id).toBe(createdTaskId);
    expect(body.title).toBe('Updated Fastify Endpoints Title');
    expect(body.priority).toBe('URGENT');
    expect(body.tags).toEqual(['backend', 'updated']);
  });

  it('GET /api/activity-logs — fetches activity audit logs for workspace (STORY-006)', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/api/activity-logs?workspaceId=${testWorkspaceId}`,
    });

    expect(response.statusCode).toBe(200);
    const logs = JSON.parse(response.payload);
    expect(Array.isArray(logs)).toBe(true);
    expect(logs.length).toBeGreaterThanOrEqual(2); // TASK_CREATED, TASK_UPDATED
  });

  it('DELETE /api/tasks/:id — deletes task successfully (STORY-005)', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/api/tasks/${createdTaskId}`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.message).toBe('Task deleted successfully');
    expect(body.id).toBe(createdTaskId);
  });
});
