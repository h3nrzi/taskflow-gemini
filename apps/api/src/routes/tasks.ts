import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../db.js';
import { authorizeRoles } from '../plugins/auth.js';
import { broadcastToWorkspace } from '../plugins/websocket.js';
import {
  CreateTaskInputSchema,
  UpdateTaskStatusInputSchema,
  UpdateTaskInputSchema,
  TaskQueryFilterSchema,
  ActivityLogQuerySchema,
  CreateTaskInput,
  UpdateTaskStatusInput,
  UpdateTaskInput,
  TaskQueryFilter,
  ActivityLogQuery,
} from '../../../../shared/schemas/task.schema.js';

export async function taskRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  /**
   * POST /api/tasks — Create Task (Sprint 1 & Sprint 3 RBAC + WS)
   */
  typedApp.post(
    '/tasks',
    {
      preHandler: authorizeRoles('OWNER', 'MEMBER'),
      schema: {
        body: CreateTaskInputSchema,
      },
    },
    async (request, reply) => {
      const body = request.body as CreateTaskInput;
      const { workspaceId, title, description, priority, dueDate, tags } = body;

      const createdTask = await prisma.task.create({
        data: {
          workspaceId,
          title,
          description: description || null,
          priority: priority || 'MEDIUM',
          status: 'TODO',
          dueDate: dueDate ? new Date(dueDate) : null,
          tags: JSON.stringify(tags || []),
        },
      });

      const formattedTask = {
        ...createdTask,
        tags: JSON.parse(createdTask.tags),
        dueDate: createdTask.dueDate ? createdTask.dueDate.toISOString() : null,
        createdAt: createdTask.createdAt.toISOString(),
        updatedAt: createdTask.updatedAt.toISOString(),
      };

      // Audit Activity Log Creation
      const log = await prisma.activityLog.create({
        data: {
          taskId: createdTask.id,
          workspaceId: createdTask.workspaceId,
          action: 'TASK_CREATED',
          actorId: request.user?.userId || 'user-system',
          details: JSON.stringify({ title: createdTask.title, initialStatus: createdTask.status }),
        },
      });

      const formattedLog = {
        ...log,
        timestamp: log.timestamp.toISOString(),
        details: log.details ? JSON.parse(log.details) : undefined,
      };

      // Real-time WebSockets Broadcast
      broadcastToWorkspace(createdTask.workspaceId, {
        type: 'TASK_CREATED',
        workspaceId: createdTask.workspaceId,
        payload: formattedTask,
      });

      broadcastToWorkspace(createdTask.workspaceId, {
        type: 'ACTIVITY_LOGGED',
        workspaceId: createdTask.workspaceId,
        payload: formattedLog,
      });

      return reply.status(201).send(formattedTask);
    }
  );

  /**
   * GET /api/tasks — Search & Filter Tasks (Sprint 2 - STORY-004)
   */
  typedApp.get(
    '/tasks',
    {
      schema: {
        querystring: TaskQueryFilterSchema,
      },
    },
    async (request, reply) => {
      const query = request.query as TaskQueryFilter;
      const { workspaceId, status, priority, tag, search } = query;

      const whereCondition: any = { workspaceId };

      if (status) {
        whereCondition.status = status;
      }

      if (priority) {
        whereCondition.priority = priority;
      }

      if (tag) {
        whereCondition.tags = {
          contains: tag,
        };
      }

      if (search && search.trim()) {
        const searchTerm = search.trim();
        whereCondition.OR = [
          { title: { contains: searchTerm } },
          { description: { contains: searchTerm } },
        ];
      }

      const tasks = await prisma.task.findMany({
        where: whereCondition,
        orderBy: { createdAt: 'desc' },
      });

      const formattedTasks = tasks.map((task) => ({
        ...task,
        tags: JSON.parse(task.tags),
        dueDate: task.dueDate ? task.dueDate.toISOString() : null,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      }));

      return reply.status(200).send(formattedTasks);
    }
  );

  /**
   * PATCH /api/tasks/:id/status — Update Task Status (Sprint 1 & Sprint 3 RBAC + WS)
   */
  typedApp.patch(
    '/tasks/:id/status',
    {
      preHandler: authorizeRoles('OWNER', 'MEMBER'),
      schema: {
        params: z.object({ id: z.string().uuid() }),
        body: UpdateTaskStatusInputSchema,
      },
    },
    async (request, reply) => {
      const params = request.params as { id: string };
      const body = request.body as UpdateTaskStatusInput;
      const { id } = params;
      const { status } = body;

      const existingTask = await prisma.task.findUnique({ where: { id } });
      if (!existingTask) {
        return reply.status(404).send({
          error: 'Not Found',
          statusCode: 404,
          message: `Task with ID ${id} not found`,
        });
      }

      const updatedTask = await prisma.task.update({
        where: { id },
        data: { status },
      });

      const formattedTask = {
        ...updatedTask,
        tags: JSON.parse(updatedTask.tags),
        dueDate: updatedTask.dueDate ? updatedTask.dueDate.toISOString() : null,
        createdAt: updatedTask.createdAt.toISOString(),
        updatedAt: updatedTask.updatedAt.toISOString(),
      };

      // Audit Activity Log Entry
      const log = await prisma.activityLog.create({
        data: {
          taskId: updatedTask.id,
          workspaceId: updatedTask.workspaceId,
          action: 'STATUS_UPDATED',
          actorId: request.user?.userId || 'user-system',
          details: JSON.stringify({
            previousStatus: existingTask.status,
            newStatus: updatedTask.status,
          }),
        },
      });

      const formattedLog = {
        ...log,
        timestamp: log.timestamp.toISOString(),
        details: log.details ? JSON.parse(log.details) : undefined,
      };

      // Real-time WebSockets Broadcast
      broadcastToWorkspace(updatedTask.workspaceId, {
        type: 'TASK_UPDATED',
        workspaceId: updatedTask.workspaceId,
        payload: formattedTask,
      });

      broadcastToWorkspace(updatedTask.workspaceId, {
        type: 'ACTIVITY_LOGGED',
        workspaceId: updatedTask.workspaceId,
        payload: formattedLog,
      });

      return reply.status(200).send(formattedTask);
    }
  );

  /**
   * PUT /api/tasks/:id — Full Task Edit (Sprint 2 - STORY-005 & Sprint 3 RBAC + WS)
   */
  typedApp.put(
    '/tasks/:id',
    {
      preHandler: authorizeRoles('OWNER', 'MEMBER'),
      schema: {
        params: z.object({ id: z.string().uuid() }),
        body: UpdateTaskInputSchema,
      },
    },
    async (request, reply) => {
      const params = request.params as { id: string };
      const body = request.body as UpdateTaskInput;
      const { id } = params;

      const existingTask = await prisma.task.findUnique({ where: { id } });
      if (!existingTask) {
        return reply.status(404).send({
          error: 'Not Found',
          statusCode: 404,
          message: `Task with ID ${id} not found`,
        });
      }

      const dataToUpdate: any = {};
      if (body.title !== undefined) dataToUpdate.title = body.title;
      if (body.description !== undefined) dataToUpdate.description = body.description;
      if (body.priority !== undefined) dataToUpdate.priority = body.priority;
      if (body.dueDate !== undefined)
        dataToUpdate.dueDate = body.dueDate ? new Date(body.dueDate) : null;
      if (body.tags !== undefined) dataToUpdate.tags = JSON.stringify(body.tags);

      const updatedTask = await prisma.task.update({
        where: { id },
        data: dataToUpdate,
      });

      const formattedTask = {
        ...updatedTask,
        tags: JSON.parse(updatedTask.tags),
        dueDate: updatedTask.dueDate ? updatedTask.dueDate.toISOString() : null,
        createdAt: updatedTask.createdAt.toISOString(),
        updatedAt: updatedTask.updatedAt.toISOString(),
      };

      // Audit Activity Log Entry
      const log = await prisma.activityLog.create({
        data: {
          taskId: updatedTask.id,
          workspaceId: updatedTask.workspaceId,
          action: 'TASK_UPDATED',
          actorId: request.user?.userId || 'user-system',
          details: JSON.stringify({ changes: body }),
        },
      });

      const formattedLog = {
        ...log,
        timestamp: log.timestamp.toISOString(),
        details: log.details ? JSON.parse(log.details) : undefined,
      };

      // Real-time WebSockets Broadcast
      broadcastToWorkspace(updatedTask.workspaceId, {
        type: 'TASK_UPDATED',
        workspaceId: updatedTask.workspaceId,
        payload: formattedTask,
      });

      broadcastToWorkspace(updatedTask.workspaceId, {
        type: 'ACTIVITY_LOGGED',
        workspaceId: updatedTask.workspaceId,
        payload: formattedLog,
      });

      return reply.status(200).send(formattedTask);
    }
  );

  /**
   * DELETE /api/tasks/:id — Delete Task (Sprint 2 - STORY-005 & Sprint 3 RBAC + WS)
   */
  typedApp.delete(
    '/tasks/:id',
    {
      preHandler: authorizeRoles('OWNER', 'MEMBER'),
      schema: {
        params: z.object({ id: z.string().uuid() }),
      },
    },
    async (request, reply) => {
      const params = request.params as { id: string };
      const { id } = params;

      const existingTask = await prisma.task.findUnique({ where: { id } });
      if (!existingTask) {
        return reply.status(404).send({
          error: 'Not Found',
          statusCode: 404,
          message: `Task with ID ${id} not found`,
        });
      }

      await prisma.task.delete({ where: { id } });

      // Real-time WebSockets Broadcast
      broadcastToWorkspace(existingTask.workspaceId, {
        type: 'TASK_DELETED',
        workspaceId: existingTask.workspaceId,
        payload: { id: existingTask.id, workspaceId: existingTask.workspaceId },
      });

      return reply.status(200).send({
        message: 'Task deleted successfully',
        id,
      });
    }
  );

  /**
   * GET /api/activity-logs — Query Activity Logs (Sprint 2 - STORY-006)
   */
  typedApp.get(
    '/activity-logs',
    {
      schema: {
        querystring: ActivityLogQuerySchema,
      },
    },
    async (request, reply) => {
      const query = request.query as ActivityLogQuery;
      const { workspaceId, taskId, limit } = query;

      const whereCondition: any = { workspaceId };
      if (taskId) {
        whereCondition.taskId = taskId;
      }

      const logs = await prisma.activityLog.findMany({
        where: whereCondition,
        orderBy: { timestamp: 'desc' },
        take: limit || 50,
      });

      const formattedLogs = logs.map((log) => ({
        ...log,
        timestamp: log.timestamp.toISOString(),
        details: log.details ? JSON.parse(log.details) : undefined,
      }));

      return reply.status(200).send(formattedLogs);
    }
  );
}
