'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Department, Project, Summary, Tag, Task, TaskSummary, departmentApi, projectApi, tagApi, taskApi } from '@/lib/api';
import { ProjectStatusBadge, TagBadge, TaskPriorityBadge, TaskStatusBadge } from '@/components/Badges';

function Loading() {
  return <div className="loading-wrapper"><span className="spinner" />Loading data…</div>;
}

function ErrorPanel({ message, retry }: { message: string; retry?: () => void }) {
  return <div className="error-panel" role="alert"><strong>Unable to load data.</strong><p>{message}</p>{retry && <button className="btn btn-secondary btn-sm" onClick={retry}>Try again</button>}</div>;
}

function ProjectCard({ project }: { project: Project }) {
  return <Link className="card project-card" href={`/projects/${project.projectID}`}>
    <div className="card-heading"><h3>{project.projectName}</h3><ProjectStatusBadge status={project.status} /></div>
    <p className="card-description">{project.description || 'No project description provided.'}</p>
    <div className="detail-meta"><span>▦ {project.departmentName}</span><span>◷ {project.startDate}{project.endDate ? ` – ${project.endDate}` : ''}</span></div>
  </Link>;
}

function TaskRow({ task }: { task: Task | TaskSummary }) {
  return <Link className="task-row" href={`/tasks/${task.taskID}`}>
    <span className="task-row-title">{task.title}<span className="tag-list">{task.tags?.map(tag => <TagBadge key={tag.tagID} name={tag.tagName} color={tag.color} />)}</span></span>
    <span className="task-row-badges"><TaskStatusBadge status={task.status} /><TaskPriorityBadge priority={task.priority} /></span>
    <span className="task-row-date">{task.dueDate || 'No due date'}</span>
  </Link>;
}

export function HomeDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [nextSummary, nextProjects, tasks] = await Promise.all([
        departmentApi.getSummary(),
        projectApi.getAll(),
        taskApi.getAll(),
      ]);
      setSummary({ ...nextSummary, totalTasks: tasks.length });
      setProjects(nextProjects);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, [load]);

  return <div className="container">
    <section className="hero"><span className="eyebrow">PUBLIC TASK & TEAM MANAGEMENT</span><h1 className="hero-title">Make great work happen.</h1><p className="hero-subtitle">Explore departments, track projects, and keep every task moving forward.</p><div className="hero-actions"><Link className="btn btn-primary" href="/departments">Explore departments</Link><Link className="btn btn-secondary" href="/search">Find a task</Link></div></section>
    {error && <ErrorPanel message={error} retry={() => void load()} />}
    {loading ? <Loading /> : <>
      {summary && <section className="stat-grid">
        <Link href="/departments" className="stat-card"><div className="stat-value">{summary.totalDepartments}</div><div className="stat-label">Active departments</div></Link>
        <Link href="/departments" className="stat-card"><div className="stat-value">{summary.totalProjects}</div><div className="stat-label">Active projects</div></Link>
        <Link href="/search" className="stat-card"><div className="stat-value">{summary.totalTasks}</div><div className="stat-label">Open tasks</div></Link>
      </section>}
      <section className="section-block"><div className="section-heading"><div><h2 className="section-title">Active projects</h2><p className="page-subtitle">A snapshot of the teams’ current work.</p></div><Link href="/departments" className="text-link">Browse departments →</Link></div>
        {projects.length ? <div className="card-grid">{projects.map(project => <ProjectCard key={project.projectID} project={project} />)}</div> : <div className="empty-state card"><h3>No active projects yet</h3><p>Projects will appear here once they are created.</p></div>}
      </section>
    </>}
  </div>;
}

export function DepartmentDirectory() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [nextDepartments, projects] = await Promise.all([departmentApi.getAll(), projectApi.getAll()]);
      setDepartments(nextDepartments.map(department => ({
        ...department,
        projects: projects.filter(project => project.departmentID === department.departmentID).map(project => ({
          projectID: project.projectID,
          projectName: project.projectName,
          status: project.status,
          statusLabel: project.statusLabel,
          isActive: project.isActive,
        })),
      })));
    }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not load departments.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, [load]);

  return <div className="container"><header className="page-header"><span className="eyebrow">TEAMS</span><h1 className="page-title">Departments</h1><p className="page-subtitle">Explore teams and the projects they are working on.</p></header>
    {error && <ErrorPanel message={error} retry={() => void load()} />}
    {loading ? <Loading /> : departments.length ? <div className="card-grid">{departments.map(department => <Link href={`/departments/${department.departmentID}`} className="card department-card" key={department.departmentID}><span className="department-icon">⌘</span><h2>{department.departmentName}</h2><p className="card-description">{department.departmentDescription}</p><span className="text-link">{department.projects?.length ?? 0} active projects →</span></Link>)}</div> : <div className="empty-state card"><h2>No departments found</h2></div>}
  </div>;
}

export function DepartmentDetail() {
  const { id } = useParams<{ id: string }>();
  const [department, setDepartment] = useState<Department | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setDepartment(await departmentApi.getById(Number(id))); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not load department.'); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => { const timer = window.setTimeout(() => { if (id) void load(); }, 0); return () => window.clearTimeout(timer); }, [id, load]);
  return <div className="container"><Link className="back-link" href="/departments">← All departments</Link>
    {loading ? <Loading /> : error ? <ErrorPanel message={error} retry={() => void load()} /> : department && <>
      <header className="detail-header"><span className="eyebrow">DEPARTMENT</span><h1 className="page-title">{department.departmentName}</h1><p className="page-subtitle">{department.departmentDescription}</p><div className="detail-meta"><span>{department.projects?.length ?? 0} active projects</span></div></header>
      <section className="section-block"><h2 className="section-title">Projects</h2>{department.projects?.length ? <div className="card-grid">{department.projects.map(project => <Link className="card project-card" href={`/projects/${project.projectID}`} key={project.projectID}><div className="card-heading"><h3>{project.projectName}</h3><ProjectStatusBadge status={project.status} /></div><span className="text-link">View project →</span></Link>)}</div> : <div className="empty-state card"><h3>No active projects in this department</h3></div>}</section>
    </>}
  </div>;
}

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setProject(await projectApi.getById(Number(id))); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not load project.'); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => { const timer = window.setTimeout(() => { if (id) void load(); }, 0); return () => window.clearTimeout(timer); }, [id, load]);
  return <div className="container"><Link className="back-link" href="/departments">← All departments</Link>
    {loading ? <Loading /> : error ? <ErrorPanel message={error} retry={() => void load()} /> : project && <>
      <header className="detail-header"><span className="eyebrow">PROJECT · {project.departmentName}</span><div className="card-heading"><h1 className="page-title">{project.projectName}</h1><ProjectStatusBadge status={project.status} /></div><p className="page-subtitle">{project.description || 'No project description provided.'}</p><div className="detail-meta"><span>Starts {project.startDate}</span><span>{project.endDate ? `Ends ${project.endDate}` : 'No end date set'}</span><span>{project.isActive ? 'Active' : 'Inactive'}</span></div></header>
      <section className="section-block"><div className="section-heading"><h2 className="section-title">Tasks</h2><Link href={`/search?projectId=${project.projectID}`} className="text-link">Search this project →</Link></div>
        {project.tasks?.length ? <div className="task-list">{project.tasks.map(task => <TaskRow key={task.taskID} task={task} />)}</div> : <div className="empty-state card"><h3>No active tasks</h3></div>}
      </section>
    </>}
  </div>;
}

export function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setTask(await taskApi.getById(Number(id))); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not load task.'); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => { const timer = window.setTimeout(() => { if (id) void load(); }, 0); return () => window.clearTimeout(timer); }, [id, load]);
  return <div className="container"><Link className="back-link" href="/search">← Search tasks</Link>
    {loading ? <Loading /> : error ? <ErrorPanel message={error} retry={() => void load()} /> : task && <>
      <header className="detail-header"><span className="eyebrow">TASK · <Link href={`/projects/${task.projectID}`}>{task.projectName || 'Project'}</Link></span><h1 className="page-title">{task.title}</h1><p className="page-subtitle">{task.description || 'No description provided.'}</p><div className="detail-meta"><TaskStatusBadge status={task.status} /><TaskPriorityBadge priority={task.priority} /><span>{task.dueDate ? `Due ${task.dueDate}` : 'No due date'}</span></div></header>
      <section className="card detail-fields"><h2 className="section-title">Task details</h2><dl className="definition-grid">
        <dt>Task ID</dt><dd>{task.taskID}</dd><dt>Project</dt><dd><Link className="text-link" href={`/projects/${task.projectID}`}>{task.projectName}</Link></dd>
        <dt>Status</dt><dd><TaskStatusBadge status={task.status} /></dd><dt>Priority</dt><dd><TaskPriorityBadge priority={task.priority} /></dd>
        <dt>Due date</dt><dd>{task.dueDate || 'Not set'}</dd><dt>Active</dt><dd>{task.isActive ? 'Yes' : 'No'}</dd>
        <dt>Created</dt><dd>{new Date(task.createdDate).toLocaleString()}</dd><dt>Last modified</dt><dd>{task.modifiedDate ? new Date(task.modifiedDate).toLocaleString() : 'Not modified'}</dd>
        <dt>Tags</dt><dd className="tag-list">{task.tags?.length ? task.tags.map(tag => <TagBadge key={tag.tagID} name={tag.tagName} color={tag.color} />) : 'No tags'}</dd>
      </dl></section>
    </>}
  </div>;
}

export function TaskSearch() {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [projectId, setProjectId] = useState('');
  const [tagId, setTagId] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [error, setError] = useState('');
  const [optionsError, setOptionsError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([projectApi.getAll(), tagApi.getAll()])
      .then(([nextProjects, nextTags]) => {
        if (active) { setProjects(nextProjects); setTags(nextTags); }
      })
      .catch(cause => { if (active) setOptionsError(cause instanceof Error ? cause.message : 'Could not load filter options.'); })
      .finally(() => { if (active) setLoadingOptions(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const initialProjectId = new URLSearchParams(window.location.search).get('projectId');
      if (initialProjectId) setProjectId(initialProjectId);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let active = true;
    const timeout = window.setTimeout(() => {
      setLoadingTasks(true);
      setError('');
      taskApi.search({
        title,
        status: status === '' ? undefined : Number(status),
        priority: priority === '' ? undefined : Number(priority),
        projectId: projectId === '' ? undefined : Number(projectId),
        tagId: tagId === '' ? undefined : Number(tagId),
      }).then(result => { if (active) setTasks(result); })
        .catch(cause => { if (active) setError(cause instanceof Error ? cause.message : 'Could not search tasks.'); })
        .finally(() => { if (active) setLoadingTasks(false); });
    }, 200);
    return () => { active = false; window.clearTimeout(timeout); };
  }, [title, status, priority, projectId, tagId]);

  return <div className="container"><header className="page-header"><span className="eyebrow">DISCOVER</span><h1 className="page-title">Search tasks</h1><p className="page-subtitle">Combine any filters to find the work you need.</p></header>
    {optionsError && <ErrorPanel message={optionsError} />}
    <section className="filters search-filters">
      <label className="form-group"><span className="form-label">Title</span><input className="input" placeholder="Search task titles…" value={title} onChange={event => setTitle(event.target.value)} /></label>
      <label className="form-group"><span className="form-label">Status</span><select className="select" value={status} onChange={event => setStatus(event.target.value)}><option value="">Any status</option>{taskStatusesOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
      <label className="form-group"><span className="form-label">Priority</span><select className="select" value={priority} onChange={event => setPriority(event.target.value)}><option value="">Any priority</option>{prioritiesOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
      <label className="form-group"><span className="form-label">Project</span><select className="select" value={projectId} disabled={loadingOptions} onChange={event => setProjectId(event.target.value)}><option value="">Any project</option>{projects.map(project => <option key={project.projectID} value={project.projectID}>{project.projectName}</option>)}</select></label>
      <label className="form-group"><span className="form-label">Tag</span><select className="select" value={tagId} disabled={loadingOptions} onChange={event => setTagId(event.target.value)}><option value="">Any tag</option>{tags.map(tag => <option key={tag.tagID} value={tag.tagID}>{tag.tagName}</option>)}</select></label>
      <button className="btn btn-secondary" onClick={() => { setTitle(''); setStatus(''); setPriority(''); setProjectId(''); setTagId(''); }}>Clear filters</button>
    </section>
    {error && <ErrorPanel message={error} />}
    <div className="results-heading"><h2 className="section-title">Results</h2>{!loadingTasks && !error && <span className="result-count">{tasks.length} tasks</span>}</div>
    {loadingTasks ? <Loading /> : !error && tasks.length ? <div className="task-list">{tasks.map(task => <TaskRow key={task.taskID} task={task} />)}</div> : !error && <div className="empty-state card"><h3>No matching tasks</h3><p>Try changing or clearing some filters.</p></div>}
  </div>;
}

const taskStatusesOptions = [
  { value: '0', label: 'To Do' }, { value: '1', label: 'In Progress' },
  { value: '2', label: 'Done' }, { value: '3', label: 'Cancelled' },
];
const prioritiesOptions = [
  { value: '0', label: 'Low' }, { value: '1', label: 'Medium' },
  { value: '2', label: 'High' }, { value: '3', label: 'Critical' },
];
