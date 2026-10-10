import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { money } from '../components/ProductCard';
import { MOCK_PRODUCTS } from '../mockData';

const PALETTE = ['#1d2a62', '#d9981e', '#b8442f', '#2f7d6d', '#6a4c93', '#8a8f98', '#0284c7', '#ea580c'];

const FALLBACK_STATS = {
  customers: 18,
  artisans: 5,
  products: 8,
  orders: 12,
  revenue: 28450,
  breakdown: [
    { _id: 'Basketry', count: 2 },
    { _id: 'Pottery', count: 2 },
    { _id: 'Metalwork', count: 2 },
    { _id: 'Textiles', count: 1 },
    { _id: 'Woodwork', count: 1 },
  ],
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(FALLBACK_STATS);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      api.get('/admin/stats').then((r) => { if (r?.data?.revenue !== undefined) setStats(r.data); }),
      api.get('/admin/users').then((r) => { if (Array.isArray(r?.data)) setUsers(r.data); }),
      api.get('/admin/products').then((r) => { if (Array.isArray(r?.data)) setProducts(r.data); }),
      api.get('/admin/orders').then((r) => { if (Array.isArray(r?.data)) setOrders(r.data); }),
    ])
      .catch(() => {
        setStats(FALLBACK_STATS);
        setProducts(MOCK_PRODUCTS);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleBlockUser = async (u) => {
    try {
      await api.put(`/admin/users/${u._id}/block`);
      addToast(`User ${u.name} is now ${u.isBlocked ? 'Unblocked' : 'Blocked'}`, 'info');
      loadAll();
    } catch (e) {
      addToast(errMsg(e), 'error');
    }
  };

  const handleToggleProduct = async (p) => {
    try {
      await api.put(`/admin/products/${p._id}/toggle`);
      addToast(`Product status toggled to ${!p.isActive ? 'Live' : 'Hidden'}`, 'success');
      loadAll();
    } catch (e) {
      addToast(errMsg(e), 'error');
    }
  };

  const handleDeleteProduct = async (p) => {
    if (!window.confirm(`Permanently remove "${p.title}" from marketplace?`)) return;
    try {
      await api.delete(`/products/${p._id}`);
      addToast(`Removed "${p.title}" permanently`, 'info');
      loadAll();
    } catch (e) {
      addToast(errMsg(e), 'error');
    }
  };

  const tabs = [
    ['overview', '📊 Ecosystem Overview'],
    ['users', `👥 Community Users (${users.length})`],
    ['products', `📦 Craft Catalog (${products.length})`],
    ['orders', `📋 Customer Orders (${orders.length})`],
  ];

  return (
    <div className="admin-dashboard-page container">
      <div className="dashboard-header-banner">
        <div>
          <span className="dashboard-role-badge">🛡️ Governance & Moderation Hub</span>
          <h1>Marketplace Administration</h1>
          <p style={{ margin: '6px 0', fontSize: '1rem', color: '#111D4A' }}>
            ✉️ Logged in Admin Email: <strong>{user?.email || 'admin@artisan.local'}</strong>
          </p>
          <p className="muted">Ecosystem monitoring, artisan onboarding, and fair-trade moderation</p>
        </div>
      </div>

      <div className="tabs-nav-bar">
        {tabs.map(([k, l]) => (
          <button
            key={k}
            type="button"
            className={`tab-nav-btn ${tab === k ? 'active' : ''}`}
            onClick={() => setTab(k)}
          >
            {l}
          </button>
        ))}
      </div>

      {loading && !stats ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Auditing marketplace metrics…</p>
        </div>
      ) : (
        <div className="dashboard-view-body">
          {tab === 'overview' && stats && (
            <>
              <div className="stats-kpi-grid">
                <div className="kpi-card">
                  <span className="kpi-label">Registered Customers</span>
                  <span className="kpi-value">{stats.customers}</span>
                  <small className="kpi-sub">Active community shoppers</small>
                </div>
                <div className="kpi-card">
                  <span className="kpi-label">Artisans & Guilds</span>
                  <span className="kpi-value">{stats.artisans}</span>
                  <small className="kpi-sub">Verified makers</small>
                </div>
                <div className="kpi-card">
                  <span className="kpi-label">Listed Products</span>
                  <span className="kpi-value">{stats.products}</span>
                  <small className="kpi-sub">Handcrafted pieces</small>
                </div>
                <div className="kpi-card">
                  <span className="kpi-label">Total Transactions</span>
                  <span className="kpi-value">{stats.orders}</span>
                  <small className="kpi-sub">Completed order shipments</small>
                </div>
                <div className="kpi-card">
                  <span className="kpi-label">Gross Merchandise Value</span>
                  <span className="kpi-value">{money(stats.revenue)}</span>
                  <small className="kpi-sub">Total marketplace turnover</small>
                </div>
              </div>

              <div className="chart-panel">
                <h4>Products Distribution by Craft Category</h4>
                {stats.byCategory?.length ? (
                  <div className="chart-box" style={{ height: 320 }}>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={stats.byCategory}
                          dataKey="count"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          outerRadius={95}
                          innerRadius={45}
                          paddingAngle={3}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {stats.byCategory.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={PALETTE[idx % PALETTE.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="muted center chart-empty">Category statistics will show as pieces are added.</p>
                )}
              </div>
            </>
          )}

          {tab === 'users' && (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Moderation</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <strong>{u.name}</strong>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-badge role-${u.role}`}>{u.role}</span>
                      </td>
                      <td>
                        {new Date(u.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td>
                        <span className={`status-pill ${u.isBlocked ? 'status-cancelled' : 'status-delivered'}`}>
                          {u.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`link-action ${u.isBlocked ? '' : 'danger'}`}
                          onClick={() => handleBlockUser(u)}
                        >
                          {u.isBlocked ? 'Unblock User' : 'Block User'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'products' && (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Piece</th>
                    <th>Artisan Maker</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <strong>{p.title}</strong>
                      </td>
                      <td>{p.artisan?.name || 'Unknown Maker'}</td>
                      <td>{money(p.price)}</td>
                      <td>
                        <span className={`status-pill ${p.isActive ? 'status-delivered' : 'status-cancelled'}`}>
                          {p.isActive ? 'Live' : 'Hidden'}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button
                          type="button"
                          className="link-action"
                          onClick={() => handleToggleProduct(p)}
                        >
                          {p.isActive ? 'Hide Listing' : 'Make Live'}
                        </button>
                        <button
                          type="button"
                          className="link-action danger"
                          onClick={() => handleDeleteProduct(p)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'orders' && (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Order Ref</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Order Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o._id}>
                      <td>
                        <strong>#{o._id.slice(-6).toUpperCase()}</strong>
                      </td>
                      <td>
                        {o.customer?.name}
                        <div className="muted-mini">{o.customer?.email}</div>
                      </td>
                      <td>{o.items?.length || 0} pieces</td>
                      <td>
                        <strong>{money(o.total)}</strong>
                      </td>
                      <td>
                        {new Date(o.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
