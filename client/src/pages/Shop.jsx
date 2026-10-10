import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '../mockData';

function filterMockProducts(f) {
  let list = [...MOCK_PRODUCTS];
  if (f.category && f.category !== 'All') {
    list = list.filter((p) => p.category === f.category);
  }
  if (f.q && f.q.trim()) {
    const q = f.q.toLowerCase().trim();
    list = list.filter((p) =>
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.materials?.toLowerCase().includes(q) ||
      p.keywords?.some((k) => k.toLowerCase().includes(q))
    );
  }
  if (f.minPrice) {
    list = list.filter((p) => p.price >= Number(f.minPrice));
  }
  if (f.maxPrice) {
    list = list.filter((p) => p.price <= Number(f.maxPrice));
  }
  if (f.sort === 'price-asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (f.sort === 'price-desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (f.sort === 'popular') {
    list.sort((a, b) => (b.sold || 0) - (a.sold || 0));
  }
  return { products: list, total: list.length, pages: 1 };
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [meta, setMeta] = useState({ categories: MOCK_CATEGORIES.filter((c) => c !== 'All') });

  const initialQ = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'All';

  const [f, setF] = useState({
    q: initialQ,
    category: initialCategory,
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'newest',
    page: 1,
  });

  const [data, setData] = useState(() => filterMockProducts({
    q: initialQ,
    category: initialCategory,
    minPrice: '',
    maxPrice: '',
    sort: 'newest',
  }));
  const [busy, setBusy] = useState(false);

  // Sync when URL parameters change externally (e.g. from navbar search or home page)
  useEffect(() => {
    const qParam = searchParams.get('q') || '';
    const catParam = searchParams.get('category') || 'All';
    setF((cur) => ({
      ...cur,
      q: qParam,
      category: catParam,
      page: 1,
    }));
  }, [searchParams]);

  useEffect(() => {
    api
      .get('/products/meta')
      .then((r) => {
        if (r.data && Array.isArray(r.data.categories)) {
          setMeta(r.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setBusy(true);
    const t = setTimeout(() => {
      api
        .get('/products', { params: { ...f, limit: 12 } })
        .then((r) => {
          if (r?.data && Array.isArray(r.data.products)) {
            setData(r.data);
          } else {
            setData(filterMockProducts(f));
          }
        })
        .catch(() => {
          setData(filterMockProducts(f));
        })
        .finally(() => setBusy(false));
    }, 250);
    return () => clearTimeout(t);
  }, [f]);

  const setFilterKey = (key, val) => {
    setF((cur) => ({ ...cur, [key]: val, page: 1 }));
  };

  const handlePricePreset = (min, max) => {
    setF((cur) => ({ ...cur, minPrice: min, maxPrice: max, page: 1 }));
  };

  const handleResetFilters = () => {
    setSearchParams({});
    setF({
      q: '',
      category: 'All',
      minPrice: '',
      maxPrice: '',
      sort: 'newest',
      page: 1,
    });
  };

  const hasActiveFilters = Boolean(f.q || (f.category && f.category !== 'All') || f.minPrice || f.maxPrice);

  return (
    <div className="shop-page container">
      <div className="shop-header-banner">
        <div>
          <h1>Handmade Marketplace</h1>
          <p className="muted">Direct from rural cooperatives and independent Indian master craftspeople</p>
        </div>
        {hasActiveFilters && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleResetFilters}>
            ✕ Clear all filters
          </button>
        )}
      </div>

      <div className="shop-layout">
        {/* Filters Sidebar */}
        <aside className="filters-sidebar">
          <div className="filter-card">
            <h3 className="filter-title">Search & Filter</h3>

            <div className="filter-group">
              <label htmlFor="shop-search" className="filter-label">Search Crafts</label>
              <div className="filter-input-wrap">
                <input
                  id="shop-search"
                  type="search"
                  value={f.q}
                  onChange={(e) => setFilterKey('q', e.target.value)}
                  placeholder="e.g. basket, brass, terracotta…"
                  className="filter-input"
                />
                {f.q && (
                  <button type="button" className="filter-clear-btn" onClick={() => setFilterKey('q', '')}>
                    ×
                  </button>
                )}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Craft Category</label>
              <div className="category-pill-list">
                <button
                  type="button"
                  className={`category-pill ${f.category === 'All' ? 'active' : ''}`}
                  onClick={() => setFilterKey('category', 'All')}
                >
                  All Crafts
                </button>
                {meta.categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`category-pill ${f.category === c ? 'active' : ''}`}
                    onClick={() => setFilterKey('category', c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Price Range (₹)</label>
              <div className="price-presets-row">
                <button
                  type="button"
                  className="preset-btn"
                  onClick={() => handlePricePreset('', '500')}
                >
                  &lt; ₹500
                </button>
                <button
                  type="button"
                  className="preset-btn"
                  onClick={() => handlePricePreset('500', '1000')}
                >
                  ₹500–₹1k
                </button>
                <button
                  type="button"
                  className="preset-btn"
                  onClick={() => handlePricePreset('1000', '')}
                >
                  &gt; ₹1k
                </button>
              </div>
              <div className="two price-inputs-row">
                <div>
                  <input
                    type="number"
                    min="0"
                    placeholder="Min ₹"
                    value={f.minPrice}
                    onChange={(e) => setFilterKey('minPrice', e.target.value)}
                    className="filter-input"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max ₹"
                    value={f.maxPrice}
                    onChange={(e) => setFilterKey('maxPrice', e.target.value)}
                    className="filter-input"
                  />
                </div>
              </div>
            </div>

            <div className="filter-group">
              <label htmlFor="shop-sort" className="filter-label">Sort Order</label>
              <select
                id="shop-sort"
                value={f.sort}
                onChange={(e) => setFilterKey('sort', e.target.value)}
                className="filter-select"
              >
                <option value="newest">Newest Creations</option>
                <option value="popular">Most Popular</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <section className="shop-results">
          <div className="results-toolbar">
            <span className="results-count">
              {busy ? (
                'Discovering pieces…'
              ) : (
                <>
                  Showing <strong>{data.total}</strong> authentic handcrafted {data.total === 1 ? 'piece' : 'pieces'}
                  {f.category !== 'All' && ` in ${f.category}`}
                  {f.q && ` matching "${f.q}"`}
                </>
              )}
            </span>
          </div>

          {busy ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading pieces directly from village makers…</p>
            </div>
          ) : Array.isArray(data?.products) && data.products.length > 0 ? (
            <div className="grid">
              {data.products.map((p) => (
                <ProductCard key={p._id} p={p} />
              ))}
            </div>
          ) : (
            <div className="empty-catalog-state panel center">
              <span className="empty-icon">🏺</span>
              <h3>No matching handcrafted pieces found</h3>
              <p className="muted">
                Try clearing your search query or selecting a broader price range.
              </p>
              <button type="button" className="btn btn-primary" onClick={handleResetFilters}>
                Reset all filters
              </button>
            </div>
          )}

          {data.pages > 1 && (
            <div className="pagination-row">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={f.page <= 1}
                onClick={() => setF({ ...f, page: f.page - 1 })}
              >
                ← Previous
              </button>
              <span className="page-indicator">
                Page {f.page} of {data.pages}
              </span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={f.page >= data.pages}
                onClick={() => setF({ ...f, page: f.page + 1 })}
              >
                Next →
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
