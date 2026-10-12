'use client';

import { FormEvent, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { authApi } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { toast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      await authApi.changePassword({
        currentPassword,
        newPassword,
      });

      toast('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to update password.';
      setPasswordError(msg);
      toast(msg, 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <span className="spinner" /> Loading profile…
      </div>
    );
  }

  const isAdmin = user.role === 1;

  return (
    <div className="container" style={{ maxWidth: '680px', padding: '40px 20px' }}>
      <header className="page-header" style={{ marginBottom: '32px' }}>
        <h1 className="page-title">User Profile</h1>
        <p className="page-subtitle">View your account details and manage security settings.</p>
      </header>

      <div className="card" style={{ padding: '28px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>Account Information</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Full Name
            </span>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '4px' }}>{user.fullName}</p>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Email Address
            </span>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '4px' }}>{user.email}</p>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Account Role
            </span>
            <p style={{ marginTop: '4px' }}>
              <span
                style={{
                  fontSize: '0.85rem',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  backgroundColor: isAdmin ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                  color: isAdmin ? '#f87171' : '#818cf8',
                  fontWeight: 600,
                  display: 'inline-block'
                }}
              >
                {isAdmin ? '🛡️ Administrator' : '👤 Staff Member'}
              </span>
            </p>
          </div>

          {user.createdDate && (
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Member Since
              </span>
              <p style={{ fontSize: '1rem', marginTop: '4px' }}>
                {new Date(user.createdDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          )}
        </div>

        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
          <button onClick={logout} className="btn btn-danger btn-sm">
            Sign Out
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '28px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Change Password</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
          Update your password to keep your account secure.
        </p>

        {passwordError && (
          <div
            className="error-panel"
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '20px',
              fontSize: '0.9rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5'
            }}
          >
            <strong>Error:</strong> {passwordError}
          </div>
        )}

        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="currPassword">
              Current Password *
            </label>
            <input
              id="currPassword"
              type="password"
              className="input"
              required
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              disabled={passwordLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="newPassword">
              New Password * (min 6 chars)
            </label>
            <input
              id="newPassword"
              type="password"
              className="input"
              required
              minLength={6}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              disabled={passwordLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confPassword">
              Confirm New Password *
            </label>
            <input
              id="confPassword"
              type="password"
              className="input"
              required
              minLength={6}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              disabled={passwordLoading}
            />
          </div>

          <div>
            <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
              {passwordLoading ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
