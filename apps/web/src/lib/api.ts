import {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskStatus,
  TaskPriority,
  TaskActivityLog,
  RegisterInput,
  LoginInput,
  AuthResponse,
  UserProfile,
} from '@shared/schemas/index';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

let tokenStore: string | null = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

export function setAuthToken(token: string | null): void {
  tokenStore = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }
}

export function getAuthToken(): string | null {
  if (!tokenStore && typeof window !== 'undefined') {
    tokenStore = localStorage.getItem('auth_token');
  }
  return tokenStore;
}

function getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response, fallbackErrorMessage: string): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    if (res.status === 403) {
      throw new Error(errorData.message || '403 Forbidden: Insufficient role permissions');
    }
    throw new Error(errorData.message || `${fallbackErrorMessage} (HTTP ${res.status})`);
  }
  return res.json();
}

// Auth API Functions
export async function registerUser(input: RegisterInput): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(input),
  });
  const data = await handleResponse<AuthResponse>(res, 'Failed to register user');
  if (data.token) {
    setAuthToken(data.token);
  }
  return data;
}

export async function loginUser(input: LoginInput): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(input),
  });
  const data = await handleResponse<AuthResponse>(res, 'Failed to login');
  if (data.token) {
    setAuthToken(data.token);
  }
  return data;
}

export async function fetchCurrentUser(): Promise<UserProfile> {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getHeaders(),
  });
  return handleResponse<UserProfile>(res, 'Failed to fetch current user profile');
}

// Tasks API Functions
export async function fetchTasks(
  workspaceId: string,
  filters?: { search?: string; priority?: TaskPriority; tag?: string }
): Promise<Task[]> {
  const queryParams = new URLSearchParams({ workspaceId });
  if (filters?.search) queryParams.set('search', filters.search);
  if (filters?.priority) queryParams.set('priority', filters.priority);
  if (filters?.tag) queryParams.set('tag', filters.tag);

  const res = await fetch(`${API_BASE_URL}/tasks?${queryParams.toString()}`, {
    headers: getHeaders(),
  });
  return handleResponse<Task[]>(res, 'Failed to fetch tasks');
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const res = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(input),
  });
  return handleResponse<Task>(res, 'Failed to create task');
}

export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task> {
  const res = await fetch(`${API_BASE_URL}/tasks/${taskId}/status`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });
  return handleResponse<Task>(res, 'Failed to update task status');
}

export async function updateTask(taskId: string, input: UpdateTaskInput): Promise<Task> {
  const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(input),
  });
  return handleResponse<Task>(res, 'Failed to update task');
}

export async function deleteTask(taskId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    if (res.status === 403) {
      throw new Error(errorData.message || '403 Forbidden: Insufficient role permissions');
    }
    throw new Error(errorData.message || `Failed to delete task (HTTP ${res.status})`);
  }
}

export async function fetchActivityLogs(
  workspaceId: string,
  taskId?: string
): Promise<TaskActivityLog[]> {
  const queryParams = new URLSearchParams({ workspaceId });
  if (taskId) queryParams.set('taskId', taskId);

  const res = await fetch(`${API_BASE_URL}/activity-logs?${queryParams.toString()}`, {
    headers: getHeaders(),
  });
  return handleResponse<TaskActivityLog[]>(res, 'Failed to fetch activity logs');
}

