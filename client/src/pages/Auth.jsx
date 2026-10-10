import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { errMsg } from '../api';

const homeFor = (u) => (u.role === 'artisan' ? '/artisan' : u.role === 'admin' ? '/admin' : '/orders');

export function Login() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const nav = useNavigate();
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const handleLogin = async (e) => {
    e?.preventDefault?.();
    setErr('');
    setBusy(true);
    try {
      const u = await login(f.email, f.password);
      addToast(`Welcome back, ${u.name}! (Signed in as ${u.email})`, 'success');
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
          <span className="auth-icon">🏺</span>
          <h1>Sign In to Kaivinai</h1>
          <p className="muted">Enter your email and password to access your account</p>
        </div>

        {err && <div className="error-banner">{err}</div>}

        <form onSubmit={handleLogin} className="auth-form">
          <label className="form-label">
            Email Address
            <input
              type="email"
              required
              value={f.email}
              onChange={(e) => setF({ ...f, email: e.target.value })}
              placeholder="e.g. you@example.com"
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
            {busy ? 'Verifying credentials…' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer-text">
          New to Kaivinai? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export function Register() {
  const { register } = useAuth();
  const { addToast } = useToast();
  const nav = useNavigate();
  const [f, setF] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
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
      addToast(`Account created successfully! Welcome, ${u.name}! (Email: ${u.email})`, 'success');
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
            🛍️ I want to Buy Crafts
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
              placeholder="e.g. Priyadarshini Rao"
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
              placeholder="e.g. priya@example.com"
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
            {busy ? 'Creating account…' : f.role === 'artisan' ? 'Register as Artisan' : 'Create Customer Account'}
          </button>
        </form>

        <p className="auth-footer-text">
          Already registered? <Link to="/login">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}
