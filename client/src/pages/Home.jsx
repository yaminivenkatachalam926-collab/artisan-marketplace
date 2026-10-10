import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';

const CATEGORY_CHIPS = [
  { name: 'Basketry', icon: '🧺', count: 'Palm-leaf & Grass' },
  { name: 'Pottery', icon: '🏺', count: 'Glazed & Terracotta' },
  { name: 'Metalwork', icon: '🪔', count: 'Dhokra & Brass' },
  { name: 'Textiles', icon: '🧵', count: 'Kantha & Handloom' },
  { name: 'Woodwork', icon: '🪵', count: 'Sheesham & Carving' },
  { name: 'Home Decor', icon: '✨', count: 'Heritage Living' },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/products', { params: { limit: 8, sort: 'popular' } }),
      api.get('/artisans'),
    ])
      .then(([pRes, aRes]) => {
        setProducts(pRes.data.products || []);
        setArtisans((aRes.data || []).slice(0, 3));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-pill">
            <span className="pill-dot"></span>
            <span>Ethical Market Linkage & AI Multilingual Cataloging</span>
          </div>

          <h1 className="hero-title">
            Buy handmade directly from the <span className="highlight-text">hands that created it.</span>
          </h1>

          <p className="hero-lead">
            Kaivinai connects rural, indigenous, and marginalized Indian artisans with mindful patrons.
            Artisans upload a craft photo; our AI writes rich product listings and translations in their native tongue.
          </p>

          <div className="hero-actions">
            <Link to="/shop" className="btn btn-primary btn-lg">
              Explore Collections
            </Link>
            <Link to="/artisans" className="btn btn-secondary btn-lg">
              Meet the Makers
            </Link>
            <Link to="/register" className="btn btn-ghost btn-lg">
              Join as Artisan
            </Link>
          </div>

          <div className="hero-stats-bar">
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Direct Maker Payout</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">0%</span>
              <span className="stat-label">Middleman Margin</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">8+</span>
              <span className="stat-label">Indian Languages</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">4,000+</span>
              <span className="stat-label">Years of Craft Heritage</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-card-stack">
            <img
              src="https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=800&q=80"
              alt="Handwoven palm leaf basket"
              className="hero-main-img"
            />
            <div className="hero-floating-card top-float">
              <span className="floating-icon">🏺</span>
              <div>
                <strong>Authentic Heritage</strong>
                <small>Certified Fair Trade</small>
              </div>
            </div>
            <div className="hero-floating-card bottom-float">
              <span className="floating-icon">✨</span>
              <div>
                <strong>AI Smart Cataloged</strong>
                <small>Tamil · Hindi · Bengali & more</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Craft Categories Bar */}
      <section className="categories-section">
        <div className="section-head">
          <div>
            <h2 className="section-title">Explore by Living Craft Traditions</h2>
            <p className="section-subtitle">Preserving ancestral craft cultures across Indian regions</p>
          </div>
          <Link to="/shop" className="section-link">View all categories →</Link>
        </div>

        <div className="category-chips-grid">
          {CATEGORY_CHIPS.map((cat) => (
            <Link
              key={cat.name}
              to={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="category-chip-card"
            >
              <span className="cat-icon">{cat.icon}</span>
              <div className="cat-details">
                <strong>{cat.name}</strong>
                <span>{cat.count}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="featured-section">
        <div className="section-head">
          <div>
            <h2 className="section-title">Featured Handcrafted Pieces</h2>
            <p className="section-subtitle">Freshly fired, woven, and cast by community artisans</p>
          </div>
          <Link to="/shop" className="section-link">Browse Full Shop →</Link>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Gathering handcrafted treasures…</p>
          </div>
        ) : (
          <div className="grid">
            {products.map((p) => (
              <ProductCard key={p._id} p={p} />
            ))}
          </div>
        )}
      </section>

      {/* AI Empowerment Spotlight Banner */}
      <section className="ai-spotlight-banner">
        <div className="ai-spotlight-content">
          <span className="ai-badge">✦ Breakthrough AI Technology</span>
          <h2>Breaking Language & Digital Barriers for Rural Makers</h2>
          <p>
            Traditional artisans often lack digital marketing skills or English proficiency.
            With Kaivinai, a maker simply snaps a photo. Our vision AI and multilingual language models
            instantly compose rich descriptions, SEO keywords, and categorization in 8 Indian regional languages.
          </p>

          <div className="ai-steps-row">
            <div className="ai-step">
              <span className="ai-step-num">1</span>
              <strong>Snap Photo</strong>
              <span>Artisan captures their handcrafted creation</span>
            </div>
            <div className="ai-step">
              <span className="ai-step-num">2</span>
              <strong>AI Cataloging</strong>
              <span>Generates multilingual stories in native scripts</span>
            </div>
            <div className="ai-step">
              <span className="ai-step-num">3</span>
              <strong>Artisan Reviews</strong>
              <span>Maker approves price, stock, and details</span>
            </div>
            <div className="ai-step">
              <span className="ai-step-num">4</span>
              <strong>Direct Commerce</strong>
              <span>Listed nationally with 100% direct payouts</span>
            </div>
          </div>
        </div>
      </section>

      {/* Makers Spotlight */}
      {artisans.length > 0 && (
        <section className="makers-section">
          <div className="section-head">
            <div>
              <h2 className="section-title">Meet Master Artisans Behind the Crafts</h2>
              <p className="section-subtitle">Real people, ancestral heritage, and honest livelihoods</p>
            </div>
            <Link to="/artisans" className="section-link">See all makers →</Link>
          </div>

          <div className="makers-grid">
            {artisans.map((a) => (
              <Link key={a._id} to={`/artisans/${a._id}`} className="maker-card">
                <div className="maker-avatar-banner">
                  <span className="maker-big-avatar">{a.name.charAt(0)}</span>
                </div>
                <div className="maker-card-body">
                  <h3>{a.name}</h3>
                  <p className="maker-craft-tag">{a.craft || 'Traditional Artisan'}</p>
                  <p className="maker-location-text">📍 {a.location || 'Rural India'}</p>
                  <p className="maker-bio-preview">{a.bio || 'Preserving living traditions.'}</p>
                  <span className="maker-creations-count">
                    {a.productCount || 0} pieces in collection →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Trust & Guarantee Banner */}
      <section className="guarantee-section">
        <div className="guarantee-grid">
          <div className="guarantee-card">
            <span className="guarantee-icon">🤝</span>
            <h4>Direct Fair Trade</h4>
            <p>Every rupee goes straight to the maker’s cooperative without broker cuts.</p>
          </div>
          <div className="guarantee-card">
            <span className="guarantee-icon">🌿</span>
            <h4>Sustainable & Earth-Friendly</h4>
            <p>Crafted using renewable, natural, and biodegradable materials.</p>
          </div>
          <div className="guarantee-card">
            <span className="guarantee-icon">📦</span>
            <h4>Safe Eco-Packaging</h4>
            <p>Packed with care using biodegradable wraps and delivered to your doorstep.</p>
          </div>
          <div className="guarantee-card">
            <span className="guarantee-icon">🛡️</span>
            <h4>Cash on Delivery</h4>
            <p>Order easily with COD options across all pincodes in India.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
