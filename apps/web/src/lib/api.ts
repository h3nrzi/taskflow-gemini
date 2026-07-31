import {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskStatus,
  TaskPriority,
  TaskActivityLog,
} from '@shared/schemas/task.schema';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function fetchTasks(
  workspaceId: string,
  filters?: { search?: string; priority?: TaskPriority; tag?: string }
): Promise<Task[]> {
  const queryParams = new URLSearchParams({ workspaceId });
  if (filters?.search) queryParams.set('search', filters.search);
  if (filters?.priority) queryParams.set('priority', filters.priority);
  if (filters?.tag) queryParams.set('tag', filters.tag);

  const res = await fetch(`${API_BASE_URL}/tasks?${queryParams.toString()}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch tasks (HTTP ${res.status})`);
  }
  return res.json();
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const res = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to create task (HTTP ${res.status})`);
  }
  return res.json();
}

export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task> {
  const res = await fetch(`${API_BASE_URL}/tasks/${taskId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to update task status (HTTP ${res.status})`);
  }
  return res.json();
}

export async function updateTask(taskId: string, input: UpdateTaskInput): Promise<Task> {
  const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to update task (HTTP ${res.status})`);
  }
  return res.json();
}

export async function deleteTask(taskId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to delete task (HTTP ${res.status})`);
  }
}

export async function fetchActivityLogs(
  workspaceId: string,
  taskId?: string
): Promise<TaskActivityLog[]> {
  const queryParams = new URLSearchParams({ workspaceId });
  if (taskId) queryParams.set('taskId', taskId);

  const res = await fetch(`${API_BASE_URL}/activity-logs?${queryParams.toString()}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch activity logs (HTTP ${res.status})`);
  }
  return res.json();
}
