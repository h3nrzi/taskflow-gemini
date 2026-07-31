import { z } from 'zod';

/**
 * Task Status Enum
 */
export const TaskStatusEnum = z.enum(['TODO', 'IN_PROGRESS', 'DONE']);
export type TaskStatus = z.infer<typeof TaskStatusEnum>;

/**
 * Task Priority Enum
 */
export const TaskPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
export type TaskPriority = z.infer<typeof TaskPriorityEnum>;

/**
 * Core Task Domain Schema
 */
export const TaskSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().min(1, 'Workspace ID is required'),
  title: z.string().min(1, 'Title is required').max(100, 'Title must be <= 100 characters'),
  description: z.string().optional().nullable(),
  status: TaskStatusEnum,
  priority: TaskPriorityEnum.default('MEDIUM'),
  dueDate: z.string().datetime().optional().nullable(),
  tags: z.array(z.string()).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Task = z.infer<typeof TaskSchema>;

/**
 * Create Task Input Payload Schema
 */
export const CreateTaskInputSchema = z.object({
  workspaceId: z.string().min(1, 'Workspace ID is required'),
  title: z.string().min(1, 'Title is required').max(100, 'Title must be <= 100 characters'),
  description: z.string().optional(),
  priority: TaskPriorityEnum.optional().default('MEDIUM'),
  dueDate: z.string().datetime().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
});
export type CreateTaskInput = z.infer<typeof CreateTaskInputSchema>;

/**
 * Update Task Payload Schema (Sprint 2 - STORY-005)
 */
export const UpdateTaskInputSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100).optional(),
  description: z.string().optional().nullable(),
  priority: TaskPriorityEnum.optional(),
  dueDate: z.string().datetime().optional().nullable(),
  tags: z.array(z.string()).optional(),
});
export type UpdateTaskInput = z.infer<typeof UpdateTaskInputSchema>;

/**
 * Update Task Status Input Payload Schema (Sprint 1)
 */
export const UpdateTaskStatusInputSchema = z.object({
  status: TaskStatusEnum,
});
export type UpdateTaskStatusInput = z.infer<typeof UpdateTaskStatusInputSchema>;

/**
 * Task Search & Query Filter Parameters (Sprint 2 - STORY-004)
 */
export const TaskQueryFilterSchema = z.object({
  workspaceId: z.string().min(1, 'workspaceId is required'),
  status: TaskStatusEnum.optional(),
  priority: TaskPriorityEnum.optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
});
export type TaskQueryFilter = z.infer<typeof TaskQueryFilterSchema>;

/**
 * Task Activity Log Audit Schema
 */
export const TaskActivityLogSchema = z.object({
  id: z.string().uuid(),
  taskId: z.string().uuid(),
  workspaceId: z.string(),
  action: z.string(),
  actorId: z.string(),
  timestamp: z.string().datetime(),
  details: z.record(z.unknown()).optional(),
});
export type TaskActivityLog = z.infer<typeof TaskActivityLogSchema>;

/**
 * Activity Log Query Filter Parameters (Sprint 2 - STORY-006)
 */
export const ActivityLogQuerySchema = z.object({
  workspaceId: z.string().min(1, 'workspaceId is required'),
  taskId: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
});
export type ActivityLogQuery = z.infer<typeof ActivityLogQuerySchema>;
