'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { departmentApi, tagApi, Summary } from '@/lib/api';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, isAdmin } = useAuth();

  const [summary, setSummary] = useState<Summary | null>(null);
  const [tagCount, setTagCount] = useState<number>(0);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      Promise.all([
        departmentApi.getSummary().catch(() => null),
        tagApi.getAll().catch(() => []),
      ])
        .then(([sum, tags]) => {
          if (sum) setSummary(sum);
          if (Array.isArray(tags)) setTagCount(tags.length);
        })
        .catch(err => {
          setSummaryError(err instanceof Error ? err.message : 'Failed to load summary.');
        })
        .finally(() => {
          setLoadingSummary(false);
        });
    }
  }, [isAuthenticated]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <span className="spinner" /> Checking authentication…
      </div>
    );
  }

  const totalTags = summary?.totalTags ?? tagCount;

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <header className="page-header page-heading" style={{ marginBottom: '36px' }}>
        <div>
          <h1 className="page-title">Management Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, <strong>{user?.fullName}</strong> ({isAdmin ? 'Administrator' : 'Staff'}). Overview of system resources and management tools.
          </p>
        </div>
      </header>

      {/* Summary Cards */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>System Overview</h2>
        {loadingSummary ? (
          <div className="loading-wrapper"><span className="spinner" /> Loading statistics…</div>
        ) : summaryError ? (
          <div className="error-panel"><strong>Could not load metrics:</strong> {summaryError}</div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px',
            }}
          >
            <div className="card" style={{ padding: '24px', borderLeft: '4px solid #6366f1' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Departments
              </span>
              <p style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '8px', color: '#818cf8' }}>
                {summary?.totalDepartments ?? 0}
              </p>
              <Link href="/admin/departments" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px', display: 'inline-block' }}>
                Manage departments →
              </Link>
            </div>

            <div className="card" style={{ padding: '24px', borderLeft: '4px solid #10b981' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Projects
              </span>
              <p style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '8px', color: '#34d399' }}>
                {summary?.totalProjects ?? 0}
              </p>
              <Link href="/admin/projects" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px', display: 'inline-block' }}>
                Manage projects →
              </Link>
            </div>

            <div className="card" style={{ padding: '24px', borderLeft: '4px solid #f59e0b' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Tasks
              </span>
              <p style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '8px', color: '#fbbf24' }}>
                {summary?.totalTasks ?? 0}
              </p>
              <Link href="/admin/tasks" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px', display: 'inline-block' }}>
                Manage tasks →
              </Link>
            </div>

            <div className="card" style={{ padding: '24px', borderLeft: '4px solid #ec4899' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Tags
              </span>
              <p style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '8px', color: '#f472b6' }}>
                {totalTags}
              </p>
              <Link href="/admin/tags" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px', display: 'inline-block' }}>
                Manage tags →
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Navigation Links to Management Sections */}
      <section>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>Management Sections</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          <Link href="/admin/departments" className="card" style={{ padding: '24px', transition: 'transform 0.2s, border-color 0.2s', display: 'block' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🏢</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>Departments</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Create, edit, and remove operational departments in your organization.
            </p>
            <span className="btn btn-secondary btn-sm" style={{ marginTop: '16px' }}>Manage Departments</span>
          </Link>

          <Link href="/admin/projects" className="card" style={{ padding: '24px', transition: 'transform 0.2s, border-color 0.2s', display: 'block' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📁</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>Projects</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Create and track project lifecycles, assign departments, and schedule deadlines.
            </p>
            <span className="btn btn-secondary btn-sm" style={{ marginTop: '16px' }}>Manage Projects</span>
          </Link>

          <Link href="/admin/tasks" className="card" style={{ padding: '24px', transition: 'transform 0.2s, border-color 0.2s', display: 'block' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>✅</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>Tasks</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Track tasks, update status, priorities, due dates, and assign multi-tag labels.
            </p>
            <span className="btn btn-secondary btn-sm" style={{ marginTop: '16px' }}>Manage Tasks</span>
          </Link>

          <Link href="/admin/tags" className="card" style={{ padding: '24px', transition: 'transform 0.2s, border-color 0.2s', display: 'block' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🏷️</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>Tags</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Organize tasks with customizable color-coded labels and categories.
            </p>
            <span className="btn btn-secondary btn-sm" style={{ marginTop: '16px' }}>Manage Tags</span>
          </Link>

          {isAdmin ? (
            <Link href="/admin/accounts" className="card" style={{ padding: '24px', transition: 'transform 0.2s, border-color 0.2s', display: 'block', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🛡️</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>System Accounts</h3>
                <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontWeight: 600 }}>Admin Only</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Manage user accounts, elevate roles (Staff/Admin), and delete accounts.
              </p>
              <span className="btn btn-primary btn-sm" style={{ marginTop: '16px' }}>Manage Accounts</span>
            </Link>
          ) : (
            <div className="card" style={{ padding: '24px', opacity: 0.6 }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🔒</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>System Accounts</h3>
                <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontWeight: 600 }}>Admin Only</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Account management is restricted to Administrators.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
