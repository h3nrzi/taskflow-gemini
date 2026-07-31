import { Task, CreateTaskInput, TaskStatus } from '@shared/schemas/task.schema';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function fetchTasks(workspaceId: string): Promise<Task[]> {
  const res = await fetch(`${API_BASE_URL}/tasks?workspaceId=${encodeURIComponent(workspaceId)}`);
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
