import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { MOCK_ARTISANS } from '../mockData';

export default function Artisans() {
  const [list, setList] = useState(MOCK_ARTISANS);
  const [filterQuery, setFilterQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get('/artisans')
      .then((r) => {
        if (r?.data && Array.isArray(r.data) && r.data.length > 0) {
          setList(r.data);
        } else {
          setList(MOCK_ARTISANS);
        }
      })
      .catch(() => {
        setList(MOCK_ARTISANS);
      })
      .finally(() => setLoading(false));
  }, []);

  const safeList = Array.isArray(list) ? list : MOCK_ARTISANS;
  const filtered = safeList.filter((a) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    const name = a?.name || '';
    const craft = a?.craft || '';
    const loc = a?.location || '';
    const comm = a?.community || '';
    return (
      name.toLowerCase().includes(q) ||
      craft.toLowerCase().includes(q) ||
      loc.toLowerCase().includes(q) ||
      comm.toLowerCase().includes(q)
    );
  });

  return (
    <div className="artisans-page container">
      <div className="makers-header-banner">
        <span className="makers-pill">🌿 Master Craftspeople of India</span>
        <h1>Meet the Makers Behind the Craft</h1>
        <p className="lead-text">
          Preserving generational techniques—from wild palm leaf weaving in Tamil Nadu to 4,000-year-old Dhokra bronze casting in West Bengal.
        </p>
        <div className="makers-search-bar">
          <input
            type="search"
            placeholder="Search by artisan name, craft (pottery, brass, weaving), or state…"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="filter-input"
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Connecting with artisan clusters across India…</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="makers-directory-grid">
          {filtered.map((a) => (
            <div key={a._id} className="maker-directory-card">
              <div className="card-top-banner">
                <div className="artisan-badge-chip">{a.craft || 'Artisan'}</div>
              </div>
              <div className="card-inner-body">
                <div className="avatar-wrap">
                  <span className="artisan-directory-avatar">{(a?.name || 'A').charAt(0)}</span>
                </div>
                <h3>{a?.name || 'Artisan'}</h3>
                <p className="location-pin">📍 {a.location || 'Rural India'}</p>
                {a.community && <p className="community-tag">Collective: {a.community}</p>}
                <p className="bio-snippet">{a.bio || 'Generational master craftsperson committed to authentic, sustainable creation.'}</p>
                
                <div className="card-bottom-row">
                  <span className="creations-badge">
                    {a.productCount} handcrafted {a.productCount === 1 ? 'piece' : 'pieces'}
                  </span>
                  <Link to={`/artisans/${a._id}`} className="btn btn-outline btn-sm">
                    View Portfolio →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="panel center empty-catalog-state">
          <h3>No artisans matched your search</h3>
          <p className="muted">Try searching for different terms like "pottery", "weaving", or "Tamil Nadu".</p>
          <button type="button" className="btn btn-ghost" onClick={() => setFilterQuery('')}>
            View All Makers
          </button>
        </div>
      )}
    </div>
  );
}
