'use client';

import { FormEvent, ReactNode, useCallback, useEffect, useState } from 'react';
import {
  Department, DepartmentCreate, Project, ProjectCreate, Tag, TagInput, Task, TaskCreate,
  departmentApi, projectApi, tagApi, taskApi,
} from '@/lib/api';
import { ProjectStatusBadge, TagBadge, TaskPriorityBadge, TaskStatusBadge } from '@/components/Badges';
import { useToast } from '@/components/ToastProvider';

type Entry = Department | Project | Task | Tag;
type FormValue = string | string[] | boolean;
type FormValues = Record<string, FormValue>;
type Field = {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'date' | 'number' | 'select' | 'checkbox' | 'color' | 'multiselect';
  required?: boolean;
  maxLength?: number;
  min?: number;
  options?: { value: string; label: string }[];
  loadOptions?: () => Promise<{ value: string; label: string }[]>;
  read?: (entry: Entry) => FormValue;
};
type Column = { label: string; render: (entry: Entry) => ReactNode };
type Resource = {
  title: string;
  description: string;
  columns: Column[];
  fields: Field[];
  list: () => Promise<Entry[]>;
  save: (id: number | null, values: FormValues) => Promise<unknown>;
  remove: (id: number) => Promise<unknown>;
  id: (entry: Entry) => number;
};

const projectStatuses = [
  { value: '0', label: 'Not Started' }, { value: '1', label: 'In Progress' },
  { value: '2', label: 'Completed' }, { value: '3', label: 'On Hold' },
];
const taskStatuses = [
  { value: '0', label: 'To Do' }, { value: '1', label: 'In Progress' },
  { value: '2', label: 'Done' }, { value: '3', label: 'Cancelled' },
];
const priorities = [
  { value: '0', label: 'Low' }, { value: '1', label: 'Medium' },
  { value: '2', label: 'High' }, { value: '3', label: 'Critical' },
];
const departmentOptions = async () => (await departmentApi.getAll()).map(item => ({
  value: String(item.departmentID), label: item.departmentName,
}));
const projectOptions = async () => (await projectApi.getAll()).map(item => ({
  value: String(item.projectID), label: item.projectName,
}));

const resources: Record<string, Resource> = {
  departments: {
    title: 'Department management',
    description: 'Create and manage active departments.',
    list: async () => departmentApi.getAll(),
    id: entry => (entry as Department).departmentID,
    save: async (id, values) => {
      const data: DepartmentCreate = {
        departmentName: String(values.departmentName).trim(),
        departmentDescription: String(values.departmentDescription).trim(),
        isActive: values.isActive === true,
      };
      return id === null ? departmentApi.create(data) : departmentApi.update(id, data);
    },
    remove: id => departmentApi.delete(id),
    fields: [
      { key: 'departmentName', label: 'Department name', required: true, maxLength: 100 },
      { key: 'departmentDescription', label: 'Description', type: 'textarea', required: true, maxLength: 300 },
      { key: 'isActive', label: 'Active', type: 'checkbox', read: entry => (entry as Department).isActive },
    ],
    columns: [
      { label: 'Name', render: entry => <strong>{(entry as Department).departmentName}</strong> },
      { label: 'Description', render: entry => (entry as Department).departmentDescription },
      { label: 'Projects', render: entry => (entry as Department).projects?.length ?? '—' },
      { label: 'State', render: entry => (entry as Department).isActive ? 'Active' : 'Inactive' },
    ],
  },
  projects: {
    title: 'Project management',
    description: 'Create, update, and manage projects.',
    list: async () => projectApi.getAll(),
    id: entry => (entry as Project).projectID,
    save: async (id, values) => {
      const data: ProjectCreate = {
        projectName: String(values.projectName).trim(),
        description: String(values.description || '').trim() || undefined,
        startDate: String(values.startDate),
        endDate: String(values.endDate || '') || undefined,
        status: Number(values.status),
        departmentID: Number(values.departmentID),
        isActive: values.isActive === true,
      };
      return id === null ? projectApi.create(data) : projectApi.update(id, data);
    },
    remove: id => projectApi.delete(id),
    fields: [
      { key: 'projectName', label: 'Project name', required: true, maxLength: 200 },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'startDate', label: 'Start date', type: 'date', required: true },
      { key: 'endDate', label: 'End date', type: 'date' },
      { key: 'status', label: 'Status', type: 'select', required: true, options: projectStatuses },
      { key: 'departmentID', label: 'Department', type: 'select', required: true, loadOptions: departmentOptions },
      { key: 'isActive', label: 'Active', type: 'checkbox', read: entry => (entry as Project).isActive },
    ],
    columns: [
      { label: 'Project', render: entry => <strong>{(entry as Project).projectName}</strong> },
      { label: 'Department', render: entry => (entry as Project).departmentName },
      { label: 'Status', render: entry => <ProjectStatusBadge status={(entry as Project).status} /> },
      { label: 'Start date', render: entry => (entry as Project).startDate },
    ],
  },
  tasks: {
    title: 'Task management',
    description: 'Manage tasks, status, priority, due dates, and tags.',
    list: async () => taskApi.getAll(),
    id: entry => (entry as Task).taskID,
    save: async (id, values) => {
      const data: TaskCreate = {
        title: String(values.title).trim(),
        description: String(values.description || '').trim() || undefined,
        status: Number(values.status),
        priority: Number(values.priority),
        dueDate: String(values.dueDate || '') || undefined,
        projectID: Number(values.projectID),
        tagIDs: Array.isArray(values.tagIDs) ? values.tagIDs.map(Number) : [],
        isActive: values.isActive !== false,
      };
      return id === null ? taskApi.create(data) : taskApi.update(id, data);
    },
    remove: id => taskApi.delete(id),
    fields: [
      { key: 'title', label: 'Title', required: true, maxLength: 300 },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'projectID', label: 'Project', type: 'select', required: true, loadOptions: projectOptions },
      { key: 'status', label: 'Status', type: 'select', required: true, options: taskStatuses },
      { key: 'priority', label: 'Priority', type: 'select', required: true, options: priorities },
      { key: 'dueDate', label: 'Due date', type: 'date' },
      { key: 'tagIDs', label: 'Tags', type: 'multiselect', loadOptions: async () => (await tagApi.getAll()).map(item => ({ value: String(item.tagID), label: item.tagName })), read: entry => (entry as Task).tags?.map(tag => String(tag.tagID)) ?? [] },
      { key: 'isActive', label: 'Active', type: 'checkbox', read: entry => (entry as Task).isActive },
    ],
    columns: [
      { label: 'Title', render: entry => <strong>{(entry as Task).title}</strong> },
      { label: 'Project', render: entry => (entry as Task).projectName },
      { label: 'Status', render: entry => <TaskStatusBadge status={(entry as Task).status} /> },
      { label: 'Priority', render: entry => <TaskPriorityBadge priority={(entry as Task).priority} /> },
      { label: 'Due date', render: entry => (entry as Task).dueDate || '—' },
    ],
  },
  tags: {
    title: 'Tag management',
    description: 'Create and manage tags used to organize tasks.',
    list: async () => tagApi.getAll(),
    id: entry => (entry as Tag).tagID,
    save: async (id, values) => {
      const data: TagInput = {
        tagName: String(values.tagName).trim(),
        color: String(values.color || '') || undefined,
      };
      return id === null ? tagApi.create(data) : tagApi.update(id, data);
    },
    remove: id => tagApi.delete(id),
    fields: [
      { key: 'tagName', label: 'Tag name', required: true, maxLength: 50 },
      { key: 'color', label: 'Color', type: 'color' },
    ],
    columns: [
      { label: 'Tag', render: entry => <TagBadge name={(entry as Tag).tagName} color={(entry as Tag).color} /> },
      { label: 'Color', render: entry => (entry as Tag).color || 'Default' },
    ],
  },
};

function valueFor(field: Field, entry?: Entry): FormValue {
  if (!entry) {
    if (field.type === 'checkbox') return true;
    if (field.type === 'select' && field.options?.length) return field.options[0].value;
    if (field.type === 'color') return '#6366f1';
    return field.type === 'multiselect' ? [] : '';
  }
  if (field.read) return field.read(entry);
  const value = (entry as unknown as Record<string, unknown>)[field.key];
  return value === null || value === undefined ? (field.type === 'color' ? '#6366f1' : '') : String(value);
}

export default function ManagementPage({ resourceKey }: { resourceKey: string }) {
  const resource = resources[resourceKey];
  const { toast } = useToast();
  const [items, setItems] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [editing, setEditing] = useState<Entry | null>(null);
  const [creating, setCreating] = useState(false);
  const [values, setValues] = useState<FormValues>({});
  const [options, setOptions] = useState<Record<string, { value: string; label: string }[]>>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      setItems(await resource.list());
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load records.');
    } finally {
      setLoading(false);
    }
  }, [resource]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  useEffect(() => {
    let active = true;
    Promise.all(resource.fields.map(async field => field.loadOptions
      ? [field.key, await field.loadOptions()] as const
      : null))
      .then(results => {
        if (active) setOptions(Object.fromEntries(results.filter((result): result is readonly [string, { value: string; label: string }[]] => result !== null)));
      })
      .catch(error => {
        if (active) toast(error instanceof Error ? error.message : 'Unable to load form options.', 'error');
      });
    return () => { active = false; };
  }, [resource, toast]);

  function openForm(item?: Entry) {
    const nextValues: FormValues = {};
    for (const field of resource.fields) nextValues[field.key] = valueFor(field, item);
    setValues(nextValues);
    setEditing(item ?? null);
    setCreating(!item);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await resource.save(editing ? resource.id(editing) : null, values);
      toast(`${resource.title.replace(' management', '')} ${editing ? 'updated' : 'created'} successfully.`);
      setCreating(false);
      setEditing(null);
      await load();
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Unable to save changes.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: Entry) {
    if (!window.confirm(`Delete this ${resource.title.replace(' management', '').toLowerCase()}? This action cannot be undone.`)) return;
    try {
      await resource.remove(resource.id(item));
      toast('Record deleted successfully.');
      await load();
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Unable to delete record.', 'error');
    }
  }

  if (!resource) return <div className="container page-header"><h1>Management page not found</h1></div>;

  return (
    <div className="container">
      <header className="page-header page-heading">
        <div><h1 className="page-title">{resource.title}</h1><p className="page-subtitle">{resource.description}</p></div>
        <button className="btn btn-primary" onClick={() => openForm()}>＋ Create new</button>
      </header>

      {loadError && <div className="error-panel" role="alert"><strong>Could not load records.</strong><p>{loadError}</p><button className="btn btn-secondary btn-sm" onClick={() => void load()}>Try again</button></div>}
      {loading ? <div className="loading-wrapper"><span className="spinner" />Loading records…</div> : !loadError && items.length === 0 ? (
        <div className="empty-state card"><h2>No records yet</h2><p>Create the first record to get started.</p></div>
      ) : !loadError && (
        <div className="table-wrapper responsive-table"><table><thead><tr>{resource.columns.map(column => <th key={column.label}>{column.label}</th>)}<th>Actions</th></tr></thead>
          <tbody>{items.map(item => <tr key={resource.id(item)}>{resource.columns.map(column => <td key={column.label}>{column.render(item)}</td>)}
            <td><div className="table-actions"><button className="btn btn-secondary btn-sm" onClick={() => openForm(item)}>Edit</button><button className="btn btn-danger btn-sm" onClick={() => void remove(item)}>Delete</button></div></td>
          </tr>)}</tbody>
        </table></div>
      )}

      {(creating || editing) && (
        <div className="modal-overlay" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget && !saving) { setCreating(false); setEditing(null); } }}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="form-title">
            <h2 className="modal-title" id="form-title">{editing ? 'Edit' : 'Create'} {resource.title.replace(' management', '').toLowerCase()}</h2>
            <form onSubmit={event => void submit(event)}>
              <div className="form-grid">
                {resource.fields.map(field => {
                  const fieldOptions = field.options ?? options[field.key] ?? [];
                  const value = values[field.key] ?? '';
                  if (field.type === 'checkbox') return <label className="checkbox-field" key={field.key}><input type="checkbox" checked={value === true} onChange={event => setValues(current => ({ ...current, [field.key]: event.target.checked }))} />{field.label}</label>;
                  if (field.type === 'multiselect') {
                    const selected = Array.isArray(value) ? value : [];
                    return <div className="form-group form-wide" key={field.key}><span className="form-label">{field.label}</span><div className="multi-select">{fieldOptions.map(option => <button type="button" key={option.value} className={`multi-select-option${selected.includes(option.value) ? ' selected' : ''}`} aria-pressed={selected.includes(option.value)} onClick={() => setValues(current => ({ ...current, [field.key]: selected.includes(option.value) ? selected.filter(item => item !== option.value) : [...selected, option.value] }))}>{option.label}</button>)}</div></div>;
                  }
                  return <label className={`form-group${field.type === 'textarea' ? ' form-wide' : ''}`} key={field.key}>
                    <span className="form-label">{field.label}{field.required ? ' *' : ''}</span>
                    {field.type === 'textarea' ? <textarea className="textarea" required={field.required} maxLength={field.maxLength} value={String(value)} onChange={event => setValues(current => ({ ...current, [field.key]: event.target.value }))} />
                      : field.type === 'select' ? <select className="select" required={field.required} value={String(value)} onChange={event => setValues(current => ({ ...current, [field.key]: event.target.value }))}><option value="">Select…</option>{fieldOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
                        : <input className="input" type={field.type ?? 'text'} required={field.required} maxLength={field.maxLength} min={field.min} value={String(value)} onChange={event => setValues(current => ({ ...current, [field.key]: event.target.value }))} />}
                  </label>;
                })}
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" disabled={saving} onClick={() => { setCreating(false); setEditing(null); }}>Cancel</button><button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Create'}</button></div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
