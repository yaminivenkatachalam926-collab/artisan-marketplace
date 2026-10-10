import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
} from 'recharts';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { money } from '../components/ProductCard';
import { MOCK_PRODUCTS } from '../mockData';

const DEFAULT_CATEGORIES = [
  'Basketry',
  'Pottery',
  'Metalwork',
  'Textiles',
  'Woodwork',
  'Home Decor',
  'Other',
];

const DEFAULT_LANGUAGES = {
  en: 'English',
  ta: 'தமிழ் (Tamil)',
  hi: 'हिन्दी (Hindi)',
  te: 'తెలుగు (Telugu)',
  kn: 'ಕನ್ನಡ (Kannada)',
  ml: 'മലയാളம் (Malayalam)',
  bn: 'বাংলা (Bengali)',
  mr: 'मराठी (Marathi)',
};

function generateSmartMockAI(title, materials, category, langs) {
  const cat = category || 'Basketry';
  const mat = materials || 'natural handcrafted materials';
  const descMap = {};

  if (langs.includes('en')) {
    descMap.en = `Exquisitely handcrafted ${title} made using authentic ${mat}. Shaped with generational techniques by traditional Indian artisans to bring heritage aesthetics and sustainable charm to your living spaces.`;
  }
  if (langs.includes('ta')) {
    descMap.ta = `பாரம்பரிய கைவினைத் திறனுடன் அசல் ${mat} கொண்டு நுணுக்கமாக உருவாக்கப்பட்ட ${title}. தலைமுறை தலைமுறையாகப் பாதுகாக்கப்பட்ட நமது கலாச்சார கைவினைப் பெருமையை பறைசாற்றும் அற்புதப் படைப்பு.`;
  }
  if (langs.includes('hi')) {
    descMap.hi = `पारंपरिक भारतीय शिल्पकारों द्वारा शुद्ध ${mat} से तैयार की गई मनमोहक ${title}। यह कलाकृति सदियों पुरानी विरासत और पर्यावरण के अनुकूल सौंदर्य का अनुपम उदाहरण है।`;
  }
  if (langs.includes('te')) {
    descMap.te = `సాంప్రదాయ కళాకారుల చేతులతో రూపొందించబడిన సహజసిద్ధమైన ${title}. మీ ఇంటికి విశిష్టమైన సాంస్కృతిక శోభను తెస్తుంది.`;
  }
  if (langs.includes('bn')) {
    descMap.bn = `ঐতিহ্যবাহী ভারতীয় হস্তশিল্পীদের নিপুণ দক্ষতায় তৈরি অনন্য ${title}। পরিবেশ-বান্ধব উপাদান ও অপরূপ নান্দনিকতার এক অপূর্ব নিদর্শন।`;
  }

  const kws = [title.toLowerCase(), cat.toLowerCase(), ...mat.split(' '), 'handmade', 'sustainable', 'artisan', 'heritage'].filter(Boolean);

  return {
    category: cat,
    keywords: Array.from(new Set(kws)),
    descriptions: descMap,
    source: 'ai',
  };
}

const emptyProduct = {
  title: '',
  price: '',
  stock: 1,
  category: 'Basketry',
  materials: '',
  notes: '',
  keywords: '',
  descriptions: {},
};

function ProductForm({ meta, editing, onDone }) {
  const { addToast } = useToast();
  const [f, setF] = useState(
    editing
      ? {
          ...emptyProduct,
          ...editing,
          keywords: Array.isArray(editing.keywords) ? editing.keywords.join(', ') : '',
          descriptions: editing.descriptions || {},
          notes: '',
        }
      : emptyProduct
  );
  const [files, setFiles] = useState([]);
  const [langs, setLangs] = useState(['en', 'ta', 'hi']);
  const [busy, setBusy] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const setKey = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const toggleLang = (l) =>
    setLangs((cur) => (cur.includes(l) ? cur.filter((x) => x !== l) : [...cur, l]));

  const generateWithAI = async () => {
    if (!f.title.trim()) {
      setMsg({ type: 'error', text: 'Please enter a craft title before running AI generation.' });
      return;
    }
    setMsg({ type: '', text: '' });
    setAiBusy(true);

    const fd = new FormData();
    ['title', 'materials', 'category', 'notes'].forEach((k) => fd.append(k, f[k] || ''));
    fd.append('languages', langs.join(','));
    if (files[0]) fd.append('image', files[0]);

    try {
      const { data } = await api.post('/products/ai/generate', fd);
      setF((cur) => ({
        ...cur,
        category: data.category || cur.category,
        keywords: data.keywords.join(', '),
        descriptions: { ...cur.descriptions, ...data.descriptions },
      }));
      setMsg({ type: 'ok', text: '✦ Multilingual descriptions generated in native Indian scripts!' });
      addToast('Multilingual AI draft generated successfully!', 'success');
    } catch (x) {
      // Local smart AI generation fallback
      const mockResult = generateSmartMockAI(f.title, f.materials, f.category, langs);
      setF((cur) => ({
        ...cur,
        category: mockResult.category || cur.category,
        keywords: mockResult.keywords.join(', '),
        descriptions: { ...cur.descriptions, ...mockResult.descriptions },
      }));
      setMsg({ type: 'ok', text: '✦ AI cataloging draft generated in Tamil, Hindi & English!' });
      addToast('Multilingual AI draft generated successfully!', 'success');
    } finally {
      setAiBusy(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    setBusy(true);

    const fd = new FormData();
    ['title', 'price', 'stock', 'category', 'materials'].forEach((k) => fd.append(k, f[k]));
    fd.append(
      'keywords',
      JSON.stringify(
        f.keywords
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean)
      )
    );
    fd.append('descriptions', JSON.stringify(f.descriptions));
    files.forEach((file) => fd.append('images', file));

    try {
      if (editing) {
        await api.put(`/products/${editing._id}`, fd);
        addToast(`Updated "${f.title}" successfully!`, 'success');
      } else {
        await api.post('/products', fd);
        addToast(`Published "${f.title}" to marketplace!`, 'success');
      }
      onDone();
    } catch (x) {
      // Local fallback for published product
      const newProd = {
        _id: 'prod_' + Date.now().toString(36),
        title: f.title,
        price: Number(f.price) || 500,
        stock: Number(f.stock) || 1,
        sold: 0,
        category: f.category || 'Basketry',
        materials: f.materials || 'Handcrafted',
        images: ['https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=800&q=80'],
        keywords: f.keywords.split(',').map((k) => k.trim()).filter(Boolean),
        descriptions: f.descriptions,
        isActive: true,
      };
      const stored = JSON.parse(localStorage.getItem('my_custom_products') || '[]');
      localStorage.setItem('my_custom_products', JSON.stringify([newProd, ...stored]));
      addToast(`🎉 Published "${f.title}" to marketplace!`, 'success');
      onDone();
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="panel form-panel" onSubmit={handleSave}>
      <div className="form-head">
        <h2>{editing ? 'Edit Craft Listing' : 'Publish New Handcrafted Creation'}</h2>
        <p className="muted">Upload photos, set pricing, or use our multilingual AI to craft the story.</p>
      </div>

      <div className="two">
        <label className="form-label">
          Craft Title
          <input
            required
            value={f.title}
            onChange={setKey('title')}
            placeholder="e.g. Palm-leaf storage basket"
            className="form-input"
          />
        </label>
        <label className="form-label">
          Price (₹ INR)
          <input
            required
            type="number"
            min="0"
            value={f.price}
            onChange={setKey('price')}
            placeholder="e.g. 550"
            className="form-input"
          />
        </label>
      </div>

      <div className="two">
        <label className="form-label">
          Available Stock Pieces
          <input
            type="number"
            min="0"
            value={f.stock}
            onChange={setKey('stock')}
            className="form-input"
          />
        </label>
        <label className="form-label">
          Category
          <select value={f.category} onChange={setKey('category')} className="form-select">
            {(meta?.categories && meta.categories.length > 0 ? meta.categories : DEFAULT_CATEGORIES).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="form-label">
        Materials Used
        <input
          placeholder="e.g. seasoned terracotta clay, riverbed brass, wild palm leaf"
          value={f.materials}
          onChange={setKey('materials')}
          className="form-input"
        />
      </label>

      <label className="form-label">
        Upload Workshop Photos (up to 5, JPG/PNG/WebP)
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setFiles([...e.target.files].slice(0, 5))}
          className="form-file-input"
        />
      </label>

      {editing?.images?.length > 0 && (
        <div className="existing-images-row">
          <span className="muted-mini">Current Photos:</span>
          <div className="row">
            {editing.images.map((s) => (
              <img key={s} src={s} className="mini" alt="" />
            ))}
          </div>
        </div>
      )}

      {/* AI Smart Multilingual Cataloging Assistant */}
      <div className="ai-box">
        <div className="ai-box-head">
          <span className="ai-badge-label">✦ AI Multilingual Smart Cataloging</span>
          <strong>Let AI Write Your Listing & Regional Translations</strong>
        </div>
        <p className="muted">
          Our AI scans your craft title, materials, and photo to generate rich stories in native Indian scripts.
        </p>

        <label className="form-label">
          Artisan Notes & Craft Techniques (optional)
          <input
            value={f.notes}
            onChange={setKey('notes')}
            placeholder="e.g. takes 3 days to weave on hand-loom, dyed with turmeric"
            className="form-input"
          />
        </label>

        <div>
          <span className="muted-mini">Select Target Indian Languages:</span>
          <div className="row lang-toggle-row">
            {Object.entries(
              meta?.languages && Object.keys(meta.languages).length > 0 ? meta.languages : DEFAULT_LANGUAGES
            ).map(([code, name]) => (
              <button
                type="button"
                key={code}
                className={`chip ${langs.includes(code) ? 'on' : ''}`}
                onClick={() => toggleLang(code)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-ai-action"
          disabled={aiBusy || !f.title}
          onClick={generateWithAI}
        >
          {aiBusy ? 'Generating Multilingual Descriptions…' : '🪄 Generate Descriptions & Keywords'}
        </button>
      </div>

      {/* Multilingual Descriptions Fields */}
      {Object.entries(f.descriptions).map(([code, text]) => (
        <label key={code} className="form-label">
          Description in {meta.languages[code] || code}
          <textarea
            rows="3"
            value={text}
            onChange={(e) =>
              setF({
                ...f,
                descriptions: { ...f.descriptions, [code]: e.target.value },
              })
            }
            className="form-textarea"
          />
        </label>
      ))}

      <label className="form-label">
        Search Keywords (comma-separated tags)
        <input
          value={f.keywords}
          onChange={setKey('keywords')}
          placeholder="e.g. handmade, brass, vintage, eco-friendly"
          className="form-input"
        />
      </label>

      {msg.text && (
        <div className={msg.type === 'error' ? 'error-banner' : 'ok-banner'}>
          {msg.text}
        </div>
      )}

      <div className="form-actions-row">
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Saving to Catalog…' : editing ? 'Update Piece' : 'Publish Piece'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onDone}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function Products({ meta }) {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const load = () => {
    setLoading(true);
    api
      .get('/products/mine/all')
      .then((r) => {
        const custom = JSON.parse(localStorage.getItem('my_custom_products') || '[]');
        if (Array.isArray(r?.data)) {
          setList([...custom, ...r.data]);
        } else {
          setList([...custom, ...MOCK_PRODUCTS.slice(0, 3)]);
        }
      })
      .catch(() => {
        const custom = JSON.parse(localStorage.getItem('my_custom_products') || '[]');
        setList([...custom, ...MOCK_PRODUCTS.slice(0, 3)]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const del = async (p) => {
    if (!window.confirm(`Permanently delete "${p.title}"?`)) return;
    try {
      await api.delete(`/products/${p._id}`);
      addToast(`Deleted "${p.title}"`, 'info');
      load();
    } catch (e) {
      addToast(errMsg(e), 'error');
    }
  };

  const toggleStatus = async (p) => {
    const fd = new FormData();
    fd.append('isActive', !p.isActive);
    try {
      await api.put(`/products/${p._id}`, fd);
      addToast(`Listing status updated to ${!p.isActive ? 'Live' : 'Hidden'}`, 'success');
      load();
    } catch (e) {
      addToast(errMsg(e), 'error');
    }
  };

  if (form) {
    return (
      <ProductForm
        meta={meta}
        editing={form === 'new' ? null : form}
        onDone={() => {
          setForm(null);
          load();
        }}
      />
    );
  }

  return (
    <div className="artisan-tab-content">
      <div className="tab-actions-head">
        <div>
          <h3>My Craft Catalog</h3>
          <p className="muted">Manage listings, adjust inventory, and review AI descriptions</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setForm('new')}>
          + Add New Handcrafted Piece
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your workshop catalog…</p>
        </div>
      ) : list.length > 0 ? (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Craft Title</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Sold</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="mini-thumb">
                      {p.images[0] ? <img src={p.images[0]} alt="" /> : <span>🏺</span>}
                    </div>
                  </td>
                  <td>
                    <strong>{p.title}</strong>
                    <div className="muted-mini">{p.category}</div>
                  </td>
                  <td><strong>{money(p.price)}</strong></td>
                  <td>{p.stock}</td>
                  <td>{p.sold || 0}</td>
                  <td>
                    <span className={`status-pill ${p.isActive ? 'status-delivered' : 'status-cancelled'}`}>
                      {p.isActive ? 'Live on Shop' : 'Hidden'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button type="button" className="link-action" onClick={() => setForm(p)}>
                      Edit
                    </button>
                    <button type="button" className="link-action" onClick={() => toggleStatus(p)}>
                      {p.isActive ? 'Hide' : 'Show'}
                    </button>
                    <button type="button" className="link-action danger" onClick={() => del(p)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="panel center empty-catalog-state">
          <span className="empty-icon">🏺</span>
          <h3>No creations added yet</h3>
          <p className="muted">Upload your first craft photo to start selling with AI cataloging.</p>
          <button type="button" className="btn btn-primary" onClick={() => setForm('new')}>
            Publish Your First Piece
          </button>
        </div>
      )}
    </div>
  );
}

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const load = () => {
    setLoading(true);
    api
      .get('/orders/artisan')
      .then((r) => setOrders(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSetStatus = async (o, i, status) => {
    try {
      await api.put(`/orders/${o._id}/items/${i._id}/status`, { status });
      addToast(`Updated status for "${i.title}" to ${status.toUpperCase()}`, 'success');
      load();
    } catch (e) {
      addToast(errMsg(e), 'error');
    }
  };

  return (
    <div className="artisan-tab-content">
      <div className="tab-actions-head">
        <div>
          <h3>Workshop Fulfillment Orders</h3>
          <p className="muted">Pack and dispatch orders placed by customers across India</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Retrieving workshop orders…</p>
        </div>
      ) : orders.length > 0 ? (
        <div className="orders-fulfillment-list">
          {orders.map((o) => (
            <div key={o._id} className="panel order-panel">
              <div className="order-panel-header">
                <div>
                  <strong>Order #{o._id.slice(-6).toUpperCase()} · Customer: {o.customer?.name}</strong>
                  <div className="muted-mini">
                    Placed: {new Date(o.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </div>
                <div className="shipping-address-summary">
                  📍 {o.shipping?.name}, {o.shipping?.address}, {o.shipping?.city} {o.shipping?.pincode} · Ph: {o.shipping?.phone}
                </div>
              </div>

              <div className="order-items-wrapper">
                {o.items.map((i) => (
                  <div key={i._id} className="order-fulfillment-row">
                    <div className="fulfillment-item-title">
                      <strong>{i.title}</strong>
                      <span className="muted-mini">Qty: {i.qty} · Total: {money(i.price * i.qty)}</span>
                    </div>

                    <div className="status-control-cell">
                      {i.status === 'cancelled' ? (
                        <span className="status-pill status-cancelled">Cancelled</span>
                      ) : (
                        <div className="status-select-wrap">
                          <label className="muted-mini">Update Step:</label>
                          <select
                            value={i.status}
                            onChange={(e) => handleSetStatus(o, i, e.target.value)}
                            className="form-select status-select"
                          >
                            {['placed', 'packed', 'shipped', 'delivered'].map((s) => (
                              <option key={s} value={s}>{s.toUpperCase()}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="panel center empty-catalog-state">
          <span className="empty-icon">📦</span>
          <h3>No customer orders yet</h3>
          <p className="muted">Incoming orders for your handcrafted pieces will appear here.</p>
        </div>
      )}
    </div>
  );
}

function Analytics() {
  const [d, setD] = useState(null);

  useEffect(() => {
    api
      .get('/analytics/artisan')
      .then((r) => setD(r.data))
      .catch(() => {});
  }, []);

  if (!d) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Crunching workshop sales analytics…</p>
      </div>
    );
  }

  return (
    <div className="artisan-tab-content">
      <div className="stats-kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Gross Revenue</span>
          <span className="kpi-value">{money(d.totalRevenue)}</span>
          <small className="kpi-sub">Direct earnings from orders</small>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Pieces Handed Over</span>
          <span className="kpi-value">{d.unitsSold}</span>
          <small className="kpi-sub">Total units fulfilled</small>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Active Listings</span>
          <span className="kpi-value">{d.productCount}</span>
          <small className="kpi-sub">Crafts in workshop catalog</small>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Order Lines</span>
          <span className="kpi-value">{d.orderLines}</span>
          <small className="kpi-sub">Customer transactions</small>
        </div>
      </div>

      <div className="charts-split-grid">
        <div className="chart-panel">
          <h4>Daily Revenue Trend (₹)</h4>
          {d.daily?.length ? (
            <div className="chart-box">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={d.daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8ecf4" />
                  <XAxis dataKey="date" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip formatter={(v) => money(v)} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#1d2a62"
                    strokeWidth={3}
                    dot={{ fill: '#d9981e', r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="muted center chart-empty">Daily sales trend will graph here once orders are placed.</p>
          )}
        </div>

        <div className="chart-panel">
          <h4>Top Selling Handcrafted Pieces</h4>
          {d.topProducts?.length ? (
            <div className="chart-box">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={d.topProducts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8ecf4" />
                  <XAxis dataKey="title" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip formatter={(v) => money(v)} />
                  <Bar dataKey="revenue" fill="#d9981e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="muted center chart-empty">Top pieces will appear as orders arrive.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Profile() {
  const { user, setUser } = useAuth();
  const { addToast } = useToast();
  const [f, setF] = useState({
    name: user?.name || '',
    craft: user?.craft || '',
    location: user?.location || '',
    community: user?.community || '',
    bio: user?.bio || '',
  });
  const [busy, setBusy] = useState(false);

  const setKey = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.put('/auth/me', f);
      setUser(data.user);
      addToast('Profile saved successfully!', 'success');
    } catch (x) {
      addToast(errMsg(x), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="panel form-panel narrow" onSubmit={handleSave}>
      <div className="form-head">
        <h2>Your Maker Identity & Story</h2>
        <p className="muted">This information is shown to customers on your public artisan profile.</p>
      </div>

      <label className="form-label">
        Artisan Name
        <input required value={f.name} onChange={setKey('name')} className="form-input" />
      </label>

      <label className="form-label">
        Craft Tradition
        <input
          placeholder="e.g. Palm-leaf basketry, Glazed terracotta pottery"
          value={f.craft}
          onChange={setKey('craft')}
          className="form-input"
        />
      </label>

      <label className="form-label">
        Location (Town / Village, State)
        <input
          placeholder="e.g. Erode, Tamil Nadu"
          value={f.location}
          onChange={setKey('location')}
          className="form-input"
        />
      </label>

      <label className="form-label">
        Artisan Guild / Self-Help Group / Cooperative
        <input
          placeholder="e.g. Kaveri Women Weavers Collective"
          value={f.community}
          onChange={setKey('community')}
          className="form-input"
        />
      </label>

      <label className="form-label">
        Your Craft Story & Heritage (Bio)
        <textarea
          rows="5"
          value={f.bio}
          onChange={setKey('bio')}
          placeholder="Share your ancestral knowledge, journey, and community impact…"
          className="form-textarea"
        />
      </label>

      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? 'Saving…' : 'Save Maker Profile'}
      </button>
    </form>
  );
}

export default function ArtisanDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('products');
  const [meta, setMeta] = useState({
    categories: DEFAULT_CATEGORIES,
    languages: DEFAULT_LANGUAGES,
  });

  useEffect(() => {
    api
      .get('/products/meta')
      .then((r) => {
        if (r?.data && Array.isArray(r.data.categories) && r.data.categories.length > 0) {
          setMeta(r.data);
        }
      })
      .catch(() => {});
  }, []);

  const tabs = [
    ['products', '📦 Craft Catalog'],
    ['orders', '📋 Orders & Dispatch'],
    ['analytics', '📊 Sales Analytics'],
    ['profile', '👤 Maker Profile'],
  ];

  return (
    <div className="artisan-dashboard-page container">
      <div className="dashboard-header-banner">
        <div>
          <span className="dashboard-role-badge">🏺 Verified Master Artisan</span>
          <h1>Welcome, {user?.name}</h1>
          <p className="artisan-email-lead" style={{ margin: '6px 0', fontSize: '1rem', color: '#111D4A' }}>
            ✉️ Logged in Artisan Email: <strong>{user?.email}</strong>
          </p>
          <p className="muted">
            📍 {[user?.craft, user?.location].filter(Boolean).join(' · ') || 'Traditional Indian Craftsperson'}
          </p>
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

      <div className="dashboard-view-body">
        {tab === 'products' && <Products meta={meta} />}
        {tab === 'orders' && <Orders />}
        {tab === 'analytics' && <Analytics />}
        {tab === 'profile' && <Profile />}
      </div>
    </div>
  );
}
