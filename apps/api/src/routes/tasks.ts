import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../db.js';
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
   * POST /api/tasks — Create Task (Sprint 1)
   */
  typedApp.post(
    '/tasks',
    {
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

      // Audit Activity Log Creation
      await prisma.activityLog.create({
        data: {
          taskId: createdTask.id,
          workspaceId: createdTask.workspaceId,
          action: 'TASK_CREATED',
          actorId: 'user-system',
          details: JSON.stringify({ title: createdTask.title, initialStatus: createdTask.status }),
        },
      });

      return reply.status(201).send({
        ...createdTask,
        tags: JSON.parse(createdTask.tags),
        dueDate: createdTask.dueDate ? createdTask.dueDate.toISOString() : null,
        createdAt: createdTask.createdAt.toISOString(),
        updatedAt: createdTask.updatedAt.toISOString(),
      });
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
   * PATCH /api/tasks/:id/status — Update Task Status (Sprint 1)
   */
  typedApp.patch(
    '/tasks/:id/status',
    {
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

      // Audit Activity Log Entry
      await prisma.activityLog.create({
        data: {
          taskId: updatedTask.id,
          workspaceId: updatedTask.workspaceId,
          action: 'STATUS_UPDATED',
          actorId: 'user-system',
          details: JSON.stringify({
            previousStatus: existingTask.status,
            newStatus: updatedTask.status,
          }),
        },
      });

      return reply.status(200).send({
        ...updatedTask,
        tags: JSON.parse(updatedTask.tags),
        dueDate: updatedTask.dueDate ? updatedTask.dueDate.toISOString() : null,
        createdAt: updatedTask.createdAt.toISOString(),
        updatedAt: updatedTask.updatedAt.toISOString(),
      });
    }
  );

  /**
   * PUT /api/tasks/:id — Full Task Edit (Sprint 2 - STORY-005)
   */
  typedApp.put(
    '/tasks/:id',
    {
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

      // Audit Activity Log Entry
      await prisma.activityLog.create({
        data: {
          taskId: updatedTask.id,
          workspaceId: updatedTask.workspaceId,
          action: 'TASK_UPDATED',
          actorId: 'user-system',
          details: JSON.stringify({ changes: body }),
        },
      });

      return reply.status(200).send({
        ...updatedTask,
        tags: JSON.parse(updatedTask.tags),
        dueDate: updatedTask.dueDate ? updatedTask.dueDate.toISOString() : null,
        createdAt: updatedTask.createdAt.toISOString(),
        updatedAt: updatedTask.updatedAt.toISOString(),
      });
    }
  );

  /**
   * DELETE /api/tasks/:id — Delete Task (Sprint 2 - STORY-005)
   */
  typedApp.delete(
    '/tasks/:id',
    {
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
