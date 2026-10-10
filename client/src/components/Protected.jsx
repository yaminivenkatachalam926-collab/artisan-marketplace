import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Protected({ role, children }) {
  const { user, loading, login } = useAuth();
  const { addToast } = useToast();
  const nav = useNavigate();
  const [allowPreview, setAllowPreview] = useState(false);
  const [switching, setSwitching] = useState(false);

  if (loading) {
    return (
      <div className="container loading-state" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
        <p>Verifying portal access…</p>
      </div>
    );
  }

  // Not logged in -> go to login with targeted role
  if (!user) {
    return <Navigate to={`/login${role ? `?role=${role}` : ''}`} replace />;
  }

  // If preview mode was enabled by the user
  if (allowPreview) {
    return children;
  }

  // If role is required and user does not match (and user is not admin)
  if (role && user.role !== role && user.role !== 'admin') {
    const handleQuickSwitch = async () => {
      setSwitching(true);
      try {
        if (role === 'artisan') {
          await login('meena@artisan.local', 'Artisan@123', 'artisan');
          addToast('Switched to Artisan account (Meena Devi)! Artisan Dashboard is now active.', 'success');
        } else if (role === 'admin') {
          await login('admin@artisan.local', 'Admin@12345', 'admin');
          addToast('Switched to Admin account! Governance Dashboard is now active.', 'success');
        } else {
          await login('rahul@customer.local', 'Customer@123', 'customer');
          addToast('Switched to Customer account!', 'success');
        }
      } catch (err) {
        addToast(err.message || 'Could not switch automatically.', 'error');
      } finally {
        setSwitching(false);
      }
    };

    return (
      <div className="container" style={{ padding: '60px 20px', maxWidth: '640px' }}>
        <div
          className="panel center"
          style={{
            padding: '40px 32px',
            borderRadius: '24px',
            background: '#ffffff',
            boxShadow: '0 16px 40px rgba(0,0,0,0.07)',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ fontSize: '3.6rem', marginBottom: '14px' }}>
            {role === 'artisan' ? '🏺' : role === 'admin' ? '🛡️' : '🛍️'}
          </div>
          <h2 style={{ color: '#111D4A', marginBottom: '12px', fontSize: '1.6rem', fontWeight: '700' }}>
            {role === 'artisan'
              ? 'Artisan Workshop Portal'
              : role === 'admin'
              ? 'Administrator Governance Portal'
              : 'Customer Account Portal'}
          </h2>
          <p style={{ color: '#64748B', lineHeight: '1.6', fontSize: '0.98rem', marginBottom: '24px' }}>
            You are currently signed in as <strong>{user.name}</strong> (Role: <span style={{ textTransform: 'uppercase', color: '#111D4A', fontWeight: '700' }}>{user.role}</span>).
            <br />
            To manage listings or access this dashboard, switch to a {role.toUpperCase()} account or preview it below:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '420px', margin: '0 auto' }}>
            <button
              type="button"
              className="btn btn-primary"
              disabled={switching}
              onClick={handleQuickSwitch}
              style={{ padding: '12px 24px', borderRadius: '12px', fontSize: '1rem', fontWeight: '600' }}
            >
              {switching
                ? 'Activating…'
                : role === 'artisan'
                ? '⚡ 1-Click Switch to Artisan (Meena Devi)'
                : role === 'admin'
                ? '⚡ 1-Click Switch to Admin'
                : '⚡ 1-Click Switch to Customer'}
            </button>

            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setAllowPreview(true)}
              style={{ padding: '10px 20px', borderRadius: '12px', fontSize: '0.95rem' }}
            >
              👁️ Preview {role === 'artisan' ? 'Artisan' : role === 'admin' ? 'Admin' : ''} Dashboard (Demo Mode)
            </button>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '8px' }}>
              <a
                href={`/login?role=${role}`}
                className="link-action"
                style={{ fontSize: '0.9rem' }}
              >
                Sign in with custom {role} email
              </a>
              <span style={{ color: '#cbd5e1' }}>·</span>
              <a href="/" className="link-action" style={{ fontSize: '0.9rem' }}>
                Return to Shop
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

