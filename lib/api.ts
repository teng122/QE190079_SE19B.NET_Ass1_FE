const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5195').replace(/\/+$/, '');

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    const body: unknown = await res.json().catch(() => null);
    if (body && typeof body === 'object') {
      const response = body as { error?: unknown; title?: unknown; detail?: unknown; errors?: Record<string, string[]> };
      const validationErrors = response.errors
        ? Object.entries(response.errors).flatMap(([field, messages]) => messages.map(message => `${field}: ${message}`)).join('\n')
        : undefined;
      const message = validationErrors
        || (typeof response.error === 'string' ? response.error : undefined)
        || (typeof response.detail === 'string' ? response.detail : undefined)
        || (typeof response.title === 'string' ? response.title : undefined);
      throw new Error(message || `HTTP ${res.status}`);
    }
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  if (res.status === 204) return null as T;
  return res.json();
}

// ── Types ──────────────────────────────────────────────────
export interface Department {
  departmentID: number;
  departmentName: string;
  departmentDescription: string;
  isActive: boolean;
  projects?: ProjectSummary[];
}

export interface ProjectSummary {
  projectID: number;
  projectName: string;
  status: number;
  statusLabel: string;
  isActive: boolean;
}

export interface Project {
  projectID: number;
  projectName: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status: number;
  statusLabel: string;
  departmentID: number;
  departmentName: string;
  isActive: boolean;
  createdDate: string;
  tasks?: TaskSummary[];
}

export interface TaskSummary {
  taskID: number;
  title: string;
  status: number;
  statusLabel: string;
  priority: number;
  priorityLabel: string;
  dueDate?: string;
  tags?: Tag[];
}

export interface Task {
  taskID: number;
  title: string;
  description?: string;
  status: number;
  statusLabel: string;
  priority: number;
  priorityLabel: string;
  dueDate?: string;
  projectID: number;
  projectName?: string;
  isActive: boolean;
  createdDate: string;
  modifiedDate?: string;
  tags?: Tag[];
}

export interface Tag {
  tagID: number;
  tagName: string;
  color?: string;
}

export interface Summary {
  totalDepartments: number;
  totalProjects: number;
  totalTasks: number;
}

export interface DepartmentCreate {
  departmentName: string;
  departmentDescription: string;
  isActive: boolean;
}

export interface ProjectCreate {
  projectName: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status: number;
  departmentID: number;
  isActive: boolean;
}

export interface TaskCreate {
  title: string;
  description?: string;
  status: number;
  priority: number;
  dueDate?: string;
  projectID: number;
  tagIDs: number[];
  isActive?: boolean;
}

export interface TagInput {
  tagName: string;
  color?: string;
}

// ── Department API ─────────────────────────────────────────
export const departmentApi = {
  getAll: () => apiFetch<Department[]>('/api/departments'),
  getById: (id: number) => apiFetch<Department>(`/api/departments/${id}`),
  search: (name: string) => apiFetch<Department[]>(`/api/departments/search?name=${encodeURIComponent(name)}`),
  getSummary: () => apiFetch<Summary>('/api/departments/summary'),
  create: (data: DepartmentCreate) =>
    apiFetch<Department>('/api/departments', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: DepartmentCreate) =>
    apiFetch<Department>(`/api/departments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => apiFetch<null>(`/api/departments/${id}`, { method: 'DELETE' }),
};

// ── Project API ────────────────────────────────────────────
export const projectApi = {
  getAll: () => apiFetch<Project[]>('/api/projects'),
  getById: (id: number) => apiFetch<Project>(`/api/projects/${id}`),
  getByDepartment: (deptId: number) => apiFetch<Project[]>(`/api/projects/department/${deptId}`),
  search: (params: { name?: string; status?: number; departmentId?: number }) => {
    const qs = new URLSearchParams();
    if (params.name) qs.set('name', params.name);
    if (params.status !== undefined && params.status !== null) qs.set('status', String(params.status));
    if (params.departmentId) qs.set('departmentId', String(params.departmentId));
    return apiFetch<Project[]>(`/api/projects/search?${qs.toString()}`);
  },
  create: (data: ProjectCreate) =>
    apiFetch<Project>('/api/projects', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: ProjectCreate) =>
    apiFetch<Project>(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => apiFetch<null>(`/api/projects/${id}`, { method: 'DELETE' }),
};

// ── Task API ───────────────────────────────────────────────
export const taskApi = {
  getAll: () => apiFetch<Task[]>('/api/tasks'),
  getById: (id: number) => apiFetch<Task>(`/api/tasks/${id}`),
  getByProject: (projectId: number) => apiFetch<Task[]>(`/api/tasks/project/${projectId}`),
  search: (params: { title?: string; status?: number; priority?: number; projectId?: number; tagId?: number }) => {
    const qs = new URLSearchParams();
    if (params.title) qs.set('title', params.title);
    if (params.status !== undefined && params.status !== null) qs.set('status', String(params.status));
    if (params.priority !== undefined && params.priority !== null) qs.set('priority', String(params.priority));
    if (params.projectId) qs.set('projectId', String(params.projectId));
    if (params.tagId) qs.set('tagId', String(params.tagId));
    return apiFetch<Task[]>(`/api/tasks/search?${qs.toString()}`);
  },
  create: (data: TaskCreate) =>
    apiFetch<Task>('/api/tasks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: TaskCreate) =>
    apiFetch<Task>(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => apiFetch<null>(`/api/tasks/${id}`, { method: 'DELETE' }),
};

// ── Tag API ────────────────────────────────────────────────
export const tagApi = {
  getAll: () => apiFetch<Tag[]>('/api/tags'),
  getById: (id: number) => apiFetch<Tag>(`/api/tags/${id}`),
  create: (data: TagInput) =>
    apiFetch<Tag>('/api/tags', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: TagInput) =>
    apiFetch<Tag>(`/api/tags/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => apiFetch<null>(`/api/tags/${id}`, { method: 'DELETE' }),
};

// ── Label helpers ──────────────────────────────────────────
export const PROJECT_STATUS: Record<number, { label: string; color: string }> = {
  0: { label: 'Not Started', color: '#6366f1' },
  1: { label: 'In Progress', color: '#f59e0b' },
  2: { label: 'Completed',   color: '#10b981' },
  3: { label: 'On Hold',     color: '#ef4444' },
};

export const TASK_STATUS: Record<number, { label: string; color: string }> = {
  0: { label: 'To Do',       color: '#6366f1' },
  1: { label: 'In Progress', color: '#f59e0b' },
  2: { label: 'Done',        color: '#10b981' },
  3: { label: 'Cancelled',   color: '#ef4444' },
};

export const TASK_PRIORITY: Record<number, { label: string; color: string }> = {
  0: { label: 'Low',      color: '#64748b' },
  1: { label: 'Medium',   color: '#3b82f6' },
  2: { label: 'High',     color: '#f59e0b' },
  3: { label: 'Critical', color: '#ef4444' },
};
