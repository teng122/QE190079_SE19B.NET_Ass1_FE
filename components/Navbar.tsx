'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const isLinkActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-inner">
          <Link href="/" className="navbar-logo">⚡ TaskTrack</Link>

          <div className="navbar-links">
            <Link
              href="/"
              className={`navbar-link${isLinkActive('/') ? ' active' : ''}`}
            >
              Home
            </Link>
            <Link
              href="/departments"
              className={`navbar-link${isLinkActive('/departments') && !pathname.startsWith('/admin') ? ' active' : ''}`}
            >
              Departments
            </Link>
            <Link
              href="/search"
              className={`navbar-link${isLinkActive('/search') ? ' active' : ''}`}
            >
              Search tasks
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  href="/admin"
                  className={`navbar-link${pathname === '/admin' ? ' active' : ''}`}
                >
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin/accounts"
                    className={`navbar-link${pathname.startsWith('/admin/accounts') ? ' active' : ''}`}
                  >
                    Accounts
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="navbar-auth-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isAuthenticated && user ? (
              <>
                <Link
                  href="/profile"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    border: '1px solid var(--border)'
                  }}
                  title="View Profile"
                >
                  <span style={{ fontWeight: 600 }}>{user.fullName}</span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: isAdmin ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                      color: isAdmin ? '#f87171' : '#818cf8',
                      fontWeight: 600
                    }}
                  >
                    {user.roleLabel || (user.role === 1 ? 'Admin' : 'Staff')}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="btn btn-secondary btn-sm"
                  style={{ cursor: 'pointer' }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`navbar-link${pathname === '/login' ? ' active' : ''}`}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="btn btn-primary btn-sm"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
