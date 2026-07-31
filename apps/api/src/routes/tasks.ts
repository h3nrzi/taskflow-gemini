import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../db.js';
import {
  CreateTaskInputSchema,
  UpdateTaskStatusInputSchema,
  TaskStatusEnum,
  CreateTaskInput,
  UpdateTaskStatusInput,
  TaskStatus,
} from '../../../../shared/schemas/task.schema.js';

export async function taskRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  /**
   * POST /api/tasks — Create Task
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
   * GET /api/tasks — Query Tasks by Workspace ID and optional Status
   */
  typedApp.get(
    '/tasks',
    {
      schema: {
        querystring: z.object({
          workspaceId: z.string().min(1, 'workspaceId is required'),
          status: TaskStatusEnum.optional(),
        }),
      },
    },
    async (request, reply) => {
      const query = request.query as { workspaceId: string; status?: TaskStatus };
      const { workspaceId, status } = query;

      const whereCondition: any = { workspaceId };
      if (status) {
        whereCondition.status = status;
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
   * PATCH /api/tasks/:id/status — Update Task Status
   */
  typedApp.patch(
    '/tasks/:id/status',
    {
      schema: {
        params: z.object({
          id: z.string().uuid(),
        }),
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
}
