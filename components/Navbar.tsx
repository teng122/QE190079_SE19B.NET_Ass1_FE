'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Home' },
  { href: '/departments', label: 'Departments' },
  { href: '/search', label: 'Search tasks' },
  { href: '/departments/manage', label: 'Manage departments' },
  { href: '/projects/manage', label: 'Manage projects' },
  { href: '/tasks/manage', label: 'Manage tasks' },
  { href: '/tags/manage', label: 'Manage tags' },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-inner">
          <Link href="/" className="navbar-logo">⚡ TaskTrack</Link>
          <div className="navbar-links">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`navbar-link${pathname === l.href || (l.href !== '/' && pathname.startsWith(`${l.href}/`)) ? ' active' : ''}`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
