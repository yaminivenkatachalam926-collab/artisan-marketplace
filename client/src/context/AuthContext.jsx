import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const ACCOUNTS_STORAGE_KEY = 'kaivinai_user_accounts';

const DEFAULT_ACCOUNTS = [
  {
    _id: 'seed_cust_01',
    name: 'Rahul Sharma',
    email: 'rahul@customer.local',
    password: 'Customer@123',
    role: 'customer',
    location: 'Bengaluru, Karnataka',
  },
  {
    _id: 'seed_art_01',
    name: 'Meena Devi',
    email: 'meena@artisan.local',
    password: 'Artisan@123',
    role: 'artisan',
    craft: 'Palm-leaf Basketry & Grass Weaving',
    location: 'Erode, Tamil Nadu',
    community: 'Kaveri Women Weavers Collective',
    bio: 'Third-generation weaver passionate about preserving sustainable palm leaf craft.',
  },
  {
    _id: 'seed_admin_01',
    name: 'Platform Administrator',
    email: 'admin@artisan.local',
    password: 'Admin@12345',
    role: 'admin',
    location: 'New Delhi, India',
  },
];

function getLocalAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ACCOUNTS;
  } catch (e) {
    return DEFAULT_ACCOUNTS;
  }
}

function saveLocalAccount(user) {
  const list = getLocalAccounts();
  const filtered = list.filter((u) => u.email.toLowerCase() !== user.email.toLowerCase());
  const updated = [...filtered, user];
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(updated));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const cachedUser = localStorage.getItem('auth_user');

    if (!token || !cachedUser) {
      setLoading(false);
      return;
    }

    try {
      setUser(JSON.parse(cachedUser));
    } catch (e) {}

    // Verify token with backend if online
    api
      .get('/auth/me')
      .then((r) => {
        if (r?.data?.user) {
          setUser(r.data.user);
          localStorage.setItem('auth_user', JSON.stringify(r.data.user));
        }
      })
      .catch(() => {
        // Keep cached user if backend is offline or static SPA
      })
      .finally(() => setLoading(false));
  }, []);

  const finish = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const login = async (email, password, expectedRole = null) => {
    const emailNorm = (email || '').trim().toLowerCase();
    if (!emailNorm) throw new Error('Please enter your email address.');
    if (!password) throw new Error('Please enter your password.');

    // 1. Try real backend API if online
    try {
      const res = await api.post('/auth/login', { email: emailNorm, password });
      const backendUser = res.data.user;

      if (expectedRole && backendUser.role !== expectedRole) {
        throw new Error(
          expectedRole === 'customer'
            ? `⚠️ This email (${backendUser.email}) is registered as an ${backendUser.role.toUpperCase()}, not a Customer/Buyer.`
            : expectedRole === 'artisan'
            ? `⚠️ This email (${backendUser.email}) is registered as a ${backendUser.role.toUpperCase()}, not an Artisan.`
            : `⚠️ Access restricted. The account "${backendUser.email}" is not authorized for Admin access.`
        );
      }

      saveLocalAccount({ ...backendUser, password });
      return finish(res.data);
    } catch (err) {
      if (err.message && (err.message.includes('registered as') || err.message.includes('Access restricted'))) {
        throw err;
      }

      // If error is 400 or 401 from live backend
      if (err.response?.status === 400 || err.response?.status === 401) {
        throw new Error(err.response?.data?.message || 'Wrong email or password! Please check again.');
      }

      // If backend is 405/404 or offline: check local accounts
      const accounts = getLocalAccounts();
      const match = accounts.find((u) => u.email.toLowerCase() === emailNorm);

      if (!match) {
        throw new Error(`Wrong email! No account found for "${email.trim()}". Please check your email or register.`);
      }

      if (match.password !== password) {
        throw new Error(`Wrong password! The password you entered for "${email.trim()}" is incorrect.`);
      }

      if (expectedRole && match.role !== expectedRole) {
        throw new Error(
          expectedRole === 'customer'
            ? `⚠️ This email (${match.email}) is registered as an ${match.role.toUpperCase()}, not a Customer/Buyer. Please switch to the Artisan/Admin tab above.`
            : expectedRole === 'artisan'
            ? `⚠️ This email (${match.email}) is registered as a ${match.role.toUpperCase()}, not an Artisan. Please switch to Customer Login above.`
            : `⚠️ Access restricted. The account "${match.email}" is not authorized for Admin access.`
        );
      }

      const sessionUser = {
        _id: match._id,
        name: match.name,
        email: match.email,
        role: match.role,
        craft: match.craft,
        location: match.location,
        community: match.community,
        bio: match.bio,
      };

      return finish({
        token: 'token_' + Date.now().toString(36),
        user: sessionUser,
      });
    }
  };

  const register = async (form) => {
    const emailNorm = (form.email || '').trim().toLowerCase();
    if (!form.name || !form.name.trim()) throw new Error('Please enter your full name.');
    if (!emailNorm) throw new Error('Please enter your email address.');
    if (!form.password || form.password.length < 6) throw new Error('Password must be at least 6 characters.');

    // 1. Try real backend API if online
    try {
      const res = await api.post('/auth/register', {
        ...form,
        email: emailNorm,
      });
      saveLocalAccount({ ...res.data.user, password: form.password });
      return finish(res.data);
    } catch (err) {
      // If backend returned genuine error (e.g. Email already registered)
      if (err.response?.status === 400) {
        throw new Error(err.response?.data?.message || 'Email already registered!');
      }

      // If backend is 405/404 or offline:
      const accounts = getLocalAccounts();
      const existing = accounts.find((u) => u.email.toLowerCase() === emailNorm);
      if (existing) {
        throw new Error(`This email (${form.email.trim()}) is already registered! Please sign in with your password.`);
      }

      const newUser = {
        _id: 'usr_' + Date.now().toString(36),
        name: form.name.trim(),
        email: emailNorm,
        password: form.password,
        role: form.role || 'customer',
        craft: form.craft || (form.role === 'artisan' ? 'Traditional Craft' : undefined),
        location: form.location || 'India',
        community: form.role === 'artisan' ? 'Artisan Guild' : undefined,
      };

      saveLocalAccount(newUser);

      const sessionUser = {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        craft: newUser.craft,
        location: newUser.location,
      };

      return finish({
        token: 'token_' + Date.now().toString(36),
        user: sessionUser,
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
