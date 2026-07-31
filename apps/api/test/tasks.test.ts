import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../src/app.js';
import { prisma } from '../src/db.js';

describe('Task REST API Integration Tests', () => {
  const app = buildApp();
  const testWorkspaceId = 'ws-test-1001';
  let createdTaskId: string;

  beforeAll(async () => {
    await app.ready();
    // Clean up test tasks
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
        title: 'Build Fastify Task API',
        description: 'Implement Task REST API endpoints with Zod payload validation',
        priority: 'HIGH',
        tags: ['backend', 'fastify', 'prisma'],
      },
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.payload);
    expect(body.id).toBeDefined();
    expect(body.title).toBe('Build Fastify Task API');
    expect(body.status).toBe('TODO');
    expect(body.priority).toBe('HIGH');
    expect(body.tags).toEqual(['backend', 'fastify', 'prisma']);

    createdTaskId = body.id;
  });

  it('POST /api/tasks — rejects invalid payload with 422 Unprocessable Entity (Fail-Fast Gate)', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/tasks',
      payload: {
        // Missing workspaceId & title
        description: 'Invalid task payload without title',
      },
    });

    expect(response.statusCode).toBe(422);
    const body = JSON.parse(response.payload);
    expect(body.statusCode).toBe(422);
    expect(body.error).toBe('Unprocessable Entity');
  });

  it('GET /api/tasks — lists tasks for a workspace (200 OK)', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/api/tasks?workspaceId=${testWorkspaceId}`,
    });

    expect(response.statusCode).toBe(200);
    const tasks = JSON.parse(response.payload);
    expect(Array.isArray(tasks)).toBe(true);
    expect(tasks.length).toBeGreaterThanOrEqual(1);
    expect(tasks[0].workspaceId).toBe(testWorkspaceId);
  });

  it('PATCH /api/tasks/:id/status — updates task status to IN_PROGRESS (200 OK)', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: `/api/tasks/${createdTaskId}/status`,
      payload: {
        status: 'IN_PROGRESS',
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.id).toBe(createdTaskId);
    expect(body.status).toBe('IN_PROGRESS');
  });

  it('PATCH /api/tasks/:id/status — rejects invalid status with 422 Unprocessable Entity', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: `/api/tasks/${createdTaskId}/status`,
      payload: {
        status: 'INVALID_STATUS_STRING',
      },
    });

    expect(response.statusCode).toBe(422);
    const body = JSON.parse(response.payload);
    expect(body.statusCode).toBe(422);
  });
});
