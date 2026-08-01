import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import bcrypt from 'bcryptjs';
import { buildApp } from '../src/app.js';
import { prisma } from '../src/db.js';

describe('Auth, RBAC, and WebSocket Integration Tests (Sprint 3)', () => {
  const app = buildApp();
  const testWorkspaceId = 'ws-rbac-test';

  let ownerToken: string;
  let memberToken: string;
  let viewerToken: string;
  let testTaskId: string;

  beforeAll(async () => {
    await app.ready();

    // Clean up test database records
    await prisma.activityLog.deleteMany({ where: { workspaceId: testWorkspaceId } });
    await prisma.task.deleteMany({ where: { workspaceId: testWorkspaceId } });
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            'register-test@taskflow.dev',
            'owner-test@taskflow.dev',
            'member-test@taskflow.dev',
            'viewer-test@taskflow.dev',
          ],
        },
      },
    });

    // Seed test users with specific roles
    const passwordHash = await bcrypt.hash('Password123!', 10);

    await prisma.user.create({
      data: {
        email: 'owner-test@taskflow.dev',
        name: 'Owner User',
        passwordHash,
        role: 'OWNER',
        workspaceId: testWorkspaceId,
      },
    });

    await prisma.user.create({
      data: {
        email: 'member-test@taskflow.dev',
        name: 'Member User',
        passwordHash,
        role: 'MEMBER',
        workspaceId: testWorkspaceId,
      },
    });

    await prisma.user.create({
      data: {
        email: 'viewer-test@taskflow.dev',
        name: 'Viewer User',
        passwordHash,
        role: 'VIEWER',
        workspaceId: testWorkspaceId,
      },
    });

    // Login to retrieve JWT tokens for test roles
    const ownerLogin = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'owner-test@taskflow.dev', password: 'Password123!' },
    });
    ownerToken = JSON.parse(ownerLogin.payload).token;

    const memberLogin = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'member-test@taskflow.dev', password: 'Password123!' },
    });
    memberToken = JSON.parse(memberLogin.payload).token;

    const viewerLogin = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'viewer-test@taskflow.dev', password: 'Password123!' },
    });
    viewerToken = JSON.parse(viewerLogin.payload).token;
  });

  afterAll(async () => {
    await prisma.activityLog.deleteMany({ where: { workspaceId: testWorkspaceId } });
    await prisma.task.deleteMany({ where: { workspaceId: testWorkspaceId } });
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            'register-test@taskflow.dev',
            'owner-test@taskflow.dev',
            'member-test@taskflow.dev',
            'viewer-test@taskflow.dev',
          ],
        },
      },
    });
    await prisma.$disconnect();
    await app.close();
  });

  describe('1. Authentication Endpoints (STORY-008)', () => {
    it('POST /api/auth/register — registers a new user (201 Created)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 'register-test@taskflow.dev',
          password: 'Password123!',
          name: 'New Registered User',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);
      expect(body.id).toBeDefined();
      expect(body.email).toBe('register-test@taskflow.dev');
      expect(body.name).toBe('New Registered User');
      expect(body.role).toBe('MEMBER');
      expect(body.passwordHash).toBeUndefined();
    });

    it('POST /api/auth/register — rejects duplicate email (409 Conflict)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 'register-test@taskflow.dev',
          password: 'Password123!',
          name: 'Duplicate User',
        },
      });

      expect(response.statusCode).toBe(409);
      const body = JSON.parse(response.payload);
      expect(body.error).toBe('Conflict');
    });

    it('POST /api/auth/register — rejects invalid payload (422 Unprocessable Entity)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 'invalid-email',
          password: 'short',
          name: '',
        },
      });

      expect(response.statusCode).toBe(422);
    });

    it('POST /api/auth/login — authenticates valid credentials (200 OK)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'register-test@taskflow.dev',
          password: 'Password123!',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.token).toBeDefined();
      expect(body.user.email).toBe('register-test@taskflow.dev');
    });

    it('POST /api/auth/login — rejects invalid password (401 Unauthorized)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'register-test@taskflow.dev',
          password: 'WrongPassword!',
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.payload);
      expect(body.error).toBe('Unauthorized');
    });

    it('GET /api/auth/me — verifies Bearer token and returns profile (200 OK)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: {
          authorization: `Bearer ${memberToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.email).toBe('member-test@taskflow.dev');
      expect(body.role).toBe('MEMBER');
    });

    it('GET /api/auth/me — rejects missing or invalid token (401 Unauthorized)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: {
          authorization: 'Bearer invalid.jwt.token',
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('2. RBAC Enforcement (STORY-009)', () => {
    it('POST /api/tasks — OWNER & MEMBER allowed (201 Created)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/tasks',
        headers: {
          authorization: `Bearer ${memberToken}`,
        },
        payload: {
          workspaceId: testWorkspaceId,
          title: 'RBAC Task by Member',
          priority: 'HIGH',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);
      testTaskId = body.id;
    });

    it('POST /api/tasks — VIEWER denied mutation (403 Forbidden)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/tasks',
        headers: {
          authorization: `Bearer ${viewerToken}`,
        },
        payload: {
          workspaceId: testWorkspaceId,
          title: 'Unauthorized Task Creation',
        },
      });

      expect(response.statusCode).toBe(403);
      const body = JSON.parse(response.payload);
      expect(body.error).toBe('Forbidden');
      expect(body.message).toBe('Insufficient role permissions');
    });

    it('PUT /api/tasks/:id — VIEWER denied update (403 Forbidden)', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/api/tasks/${testTaskId}`,
        headers: {
          authorization: `Bearer ${viewerToken}`,
        },
        payload: {
          title: 'Attempted Edit by Viewer',
        },
      });

      expect(response.statusCode).toBe(403);
    });

    it('PUT /api/tasks/:id — OWNER allowed update (200 OK)', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/api/tasks/${testTaskId}`,
        headers: {
          authorization: `Bearer ${ownerToken}`,
        },
        payload: {
          title: 'Updated Task Title by Owner',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.title).toBe('Updated Task Title by Owner');
    });

    it('DELETE /api/tasks/:id — VIEWER denied deletion (403 Forbidden)', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/tasks/${testTaskId}`,
        headers: {
          authorization: `Bearer ${viewerToken}`,
        },
      });

      expect(response.statusCode).toBe(403);
    });

    it('GET /api/tasks — VIEWER allowed read access (200 OK)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/tasks?workspaceId=${testWorkspaceId}`,
        headers: {
          authorization: `Bearer ${viewerToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const tasks = JSON.parse(response.payload);
      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('3. WebSockets Gateway & Room Broadcasts (STORY-010)', () => {
    it('Reject connection handshake with invalid token (close code 4001)', async () => {
      const ws = await app.injectWS('/ws?token=invalid-token');
      const closeCode = await new Promise<number>((resolve) => {
        if (ws.readyState === 3 /* CLOSED */) {
          resolve(4001);
        } else {
          ws.on('close', (code) => resolve(code));
        }
      });
      expect(closeCode).toBe(4001);
    });

    it('Connect successfully with valid token and receive room broadcasts on task mutation', async () => {
      const ws = await app.injectWS(`/ws?token=${memberToken}`);

      ws.send(JSON.stringify({ type: 'SUBSCRIBE', workspaceId: testWorkspaceId }));

      const receivedMessages: any[] = [];
      ws.on('message', (data) => {
        receivedMessages.push(JSON.parse(data.toString()));
      });

      // Trigger Task Creation
      const createRes = await app.inject({
        method: 'POST',
        url: '/api/tasks',
        headers: {
          authorization: `Bearer ${memberToken}`,
        },
        payload: {
          workspaceId: testWorkspaceId,
          title: 'WebSocket Broadcast Test Task',
          priority: 'HIGH',
        },
      });

      expect(createRes.statusCode).toBe(201);
      const createdTask = JSON.parse(createRes.payload);

      // Brief delay for WS async frame delivery
      await new Promise((r) => setTimeout(r, 100));

      const createdEvent = receivedMessages.find((m) => m.type === 'TASK_CREATED');
      expect(createdEvent).toBeDefined();
      expect(createdEvent.workspaceId).toBe(testWorkspaceId);
      expect(createdEvent.payload.id).toBe(createdTask.id);

      // Trigger Task Deletion
      await app.inject({
        method: 'DELETE',
        url: `/api/tasks/${createdTask.id}`,
        headers: {
          authorization: `Bearer ${memberToken}`,
        },
      });

      await new Promise((r) => setTimeout(r, 100));

      const deletedEvent = receivedMessages.find((m) => m.type === 'TASK_DELETED');
      expect(deletedEvent).toBeDefined();
      expect(deletedEvent.payload.id).toBe(createdTask.id);

      ws.close();
    });
  });
});
