import { TASK_STATUS, TASK_PRIORITY, PROJECT_STATUS } from '@/lib/api';

export function TaskStatusBadge({ status }: { status: number }) {
  const s = TASK_STATUS[status] ?? { label: 'Unknown', color: '#64748b' };
  return (
    <span className="badge" style={{ background: `${s.color}22`, color: s.color, border: `1px solid ${s.color}44` }}>
      {s.label}
    </span>
  );
}

export function TaskPriorityBadge({ priority }: { priority: number }) {
  const p = TASK_PRIORITY[priority] ?? { label: 'Unknown', color: '#64748b' };
  return (
    <span className="badge" style={{ background: `${p.color}22`, color: p.color, border: `1px solid ${p.color}44` }}>
      {p.label}
    </span>
  );
}

export function ProjectStatusBadge({ status }: { status: number }) {
  const s = PROJECT_STATUS[status] ?? { label: 'Unknown', color: '#64748b' };
  return (
    <span className="badge" style={{ background: `${s.color}22`, color: s.color, border: `1px solid ${s.color}44` }}>
      {s.label}
    </span>
  );
}

export function TagBadge({ name, color }: { name: string; color?: string }) {
  const bg = color || '#6366f1';
  return (
    <span className="badge-tag" style={{ background: bg }}>
      {name}
    </span>
  );
}
