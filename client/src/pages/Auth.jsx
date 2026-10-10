import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { errMsg } from '../api';

const homeFor = (u) => (u.role === 'artisan' ? '/artisan' : u.role === 'admin' ? '/admin' : '/orders');

export function Login() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const nav = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialRole = searchParams.get('role') || 'customer';
  const [activeRole, setActiveRole] = useState(
    ['customer', 'artisan', 'admin'].includes(initialRole) ? initialRole : 'customer'
  );

  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const r = searchParams.get('role');
    if (r && ['customer', 'artisan', 'admin'].includes(r)) {
      setActiveRole(r);
    }
  }, [searchParams]);

  const handleRoleChange = (role) => {
    setActiveRole(role);
    setErr('');
    setSearchParams({ role });
  };

  const handleLogin = async (e) => {
    e?.preventDefault?.();
    setErr('');
    setBusy(true);

    try {
      const u = await login(f.email, f.password, activeRole);
      addToast(`Signed in successfully! Welcome, ${u.name}! (Email: ${u.email})`, 'success');
      nav(homeFor(u));
    } catch (x) {
      setErr(errMsg(x));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrapper container">
      <div className="panel auth-panel">
        {/* 3 Dedicated Role Login Tabs */}
        <div className="separated-login-tabs">
          <button
            type="button"
            className={`sep-login-tab ${activeRole === 'customer' ? 'active' : ''}`}
            onClick={() => handleRoleChange('customer')}
          >
            <span className="sep-tab-icon">🛍️</span>
            <span className="sep-tab-label">Customer Login</span>
          </button>

          <button
            type="button"
            className={`sep-login-tab ${activeRole === 'artisan' ? 'active' : ''}`}
            onClick={() => handleRoleChange('artisan')}
          >
            <span className="sep-tab-icon">🏺</span>
            <span className="sep-tab-label">Artisan Login</span>
          </button>

          <button
            type="button"
            className={`sep-login-tab ${activeRole === 'admin' ? 'active' : ''}`}
            onClick={() => handleRoleChange('admin')}
          >
            <span className="sep-tab-icon">🛡️</span>
            <span className="sep-tab-label">Admin Login</span>
          </button>
        </div>

        <div className="auth-header">
          <span className="auth-icon">
            {activeRole === 'customer' ? '🛍️' : activeRole === 'artisan' ? '🏺' : '🛡️'}
          </span>
          <h1>
            {activeRole === 'customer'
              ? 'Customer Sign In'
              : activeRole === 'artisan'
              ? 'Artisan Workshop Sign In'
              : 'Admin Portal Sign In'}
          </h1>
          <p className="muted">
            {activeRole === 'customer'
              ? 'Sign in with your buyer account to access your orders and handcrafted bag'
              : activeRole === 'artisan'
              ? 'Sign in with your artisan account to manage your listings, AI catalog & sales'
              : 'Enter your administrator credentials to manage platform governance'}
          </p>
        </div>

        {err && <div className="error-banner">{err}</div>}

        <form onSubmit={handleLogin} className="auth-form">
          <label className="form-label">
            {activeRole === 'customer'
              ? 'Customer Email Address'
              : activeRole === 'artisan'
              ? 'Artisan Email Address'
              : 'Admin Email Address'}
            <input
              type="email"
              required
              value={f.email}
              onChange={(e) => setF({ ...f, email: e.target.value })}
              placeholder={
                activeRole === 'customer'
                  ? 'e.g. yamini@gmail.com'
                  : activeRole === 'artisan'
                  ? 'e.g. meena@artisan.local'
                  : 'e.g. admin@artisan.local'
              }
              className="form-input"
            />
          </label>

          <label className="form-label">
            Password
            <input
              type="password"
              required
              value={f.password}
              onChange={(e) => setF({ ...f, password: e.target.value })}
              placeholder="••••••••"
              className="form-input"
            />
          </label>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={busy}>
            {busy
              ? 'Verifying…'
              : activeRole === 'customer'
              ? 'Sign In as Customer'
              : activeRole === 'artisan'
              ? 'Sign In to Artisan Workshop'
              : 'Access Admin Dashboard'}
          </button>
        </form>

        <div className="auth-footer-block">
          {activeRole === 'customer' && (
            <p className="auth-footer-text">
              Don't have a Customer account?{' '}
              <Link to="/register?role=customer">Register as a Buyer</Link>
            </p>
          )}

          {activeRole === 'artisan' && (
            <p className="auth-footer-text">
              Want to sell your handcrafted pieces?{' '}
              <Link to="/register?role=artisan">Register as an Artisan Maker</Link>
            </p>
          )}

          {activeRole === 'admin' && (
            <p className="auth-footer-text muted-mini">
              🔒 Restricted access for platform administrators only.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function Register() {
  const { register } = useAuth();
  const { addToast } = useToast();
  const nav = useNavigate();
  const [searchParams] = useSearchParams();

  const initialRole = searchParams.get('role') === 'artisan' ? 'artisan' : 'customer';

  const [f, setF] = useState({
    name: '',
    email: '',
    password: '',
    role: initialRole,
    craft: '',
    location: '',
  });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const setKey = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);

    try {
      const u = await register(f);
      addToast(`Account created! Welcome, ${u.name}! (Email: ${u.email})`, 'success');
      nav(homeFor(u));
    } catch (x) {
      setErr(errMsg(x));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrapper container">
      <div className="panel auth-panel">
        <div className="auth-header">
          <span className="auth-icon">✨</span>
          <h1>Join Kaivinai</h1>
          <p className="muted">Become part of India's direct handcrafted community</p>
        </div>

        {err && <div className="error-banner">{err}</div>}

        <div className="role-switch-row">
          <button
            type="button"
            className={`role-switch-btn ${f.role === 'customer' ? 'active' : ''}`}
            onClick={() => setF({ ...f, role: 'customer' })}
          >
            🛍️ I want to Buy Crafts (Customer)
          </button>
          <button
            type="button"
            className={`role-switch-btn ${f.role === 'artisan' ? 'active' : ''}`}
            onClick={() => setF({ ...f, role: 'artisan' })}
          >
            🏺 I am an Artisan / Maker
          </button>
        </div>

        <form onSubmit={handleRegister} className="auth-form">
          <label className="form-label">
            Full Name
            <input
              required
              value={f.name}
              onChange={setKey('name')}
              placeholder={f.role === 'artisan' ? 'e.g. Meena Devi' : 'e.g. Yamini Venkatachalam'}
              className="form-input"
            />
          </label>

          <label className="form-label">
            Email Address
            <input
              type="email"
              required
              value={f.email}
              onChange={setKey('email')}
              placeholder={f.role === 'artisan' ? 'e.g. meena@artisan.local' : 'e.g. yamini@gmail.com'}
              className="form-input"
            />
          </label>

          <label className="form-label">
            Password (at least 6 characters)
            <input
              type="password"
              minLength={6}
              required
              value={f.password}
              onChange={setKey('password')}
              placeholder="••••••••"
              className="form-input"
            />
          </label>

          {f.role === 'artisan' && (
            <div className="artisan-custom-fields">
              <label className="form-label">
                Your Primary Craft Specialty
                <input
                  required
                  placeholder="e.g. Palm-leaf basketry, Terracotta pottery, Dhokra casting"
                  value={f.craft}
                  onChange={setKey('craft')}
                  className="form-input"
                />
              </label>

              <label className="form-label">
                Town / Village & State
                <input
                  required
                  placeholder="e.g. Erode, Tamil Nadu"
                  value={f.location}
                  onChange={setKey('location')}
                  className="form-input"
                />
              </label>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={busy}>
            {busy
              ? 'Creating account…'
              : f.role === 'artisan'
              ? 'Register as Artisan Maker'
              : 'Create Customer Account'}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account?{' '}
          <Link to={`/login?role=${f.role}`}>Sign in here</Link>
        </p>
      </div>
    </div>
  );
}
