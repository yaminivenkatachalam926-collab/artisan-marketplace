import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';

export default function ArtisanProfile() {
  const { id } = useParams();
  const [d, setD] = useState(null);

  useEffect(() => {
    api
      .get(`/artisans/${id}`)
      .then((r) => setD(r.data))
      .catch(() => setD(false));
  }, [id]);

  if (d === null) {
    return (
      <div className="container loading-state">
        <div className="spinner"></div>
        <p>Loading artisan profile and handcrafted portfolio…</p>
      </div>
    );
  }

  if (d === false) {
    return (
      <div className="container panel narrow center">
        <h2>Artisan Not Found</h2>
        <p className="muted">This maker profile does not exist or may have been unlisted.</p>
        <Link to="/artisans" className="btn btn-primary">
          Explore All Makers
        </Link>
      </div>
    );
  }

  const { artisan: a, products } = d;

  return (
    <div className="artisan-profile-page container">
      {/* Breadcrumb */}
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span className="sep">/</span>
        <Link to="/artisans">Makers</Link>
        <span className="sep">/</span>
        <span className="current">{a.name}</span>
      </nav>

      {/* Artisan Showcase Banner */}
      <section className="profile-hero-banner">
        <div className="profile-hero-content">
          <div className="profile-avatar-large">
            <span>{a.name.charAt(0)}</span>
          </div>
          <div className="profile-text-details">
            <span className="profile-craft-badge">{a.craft || 'Traditional Craft'}</span>
            <h1 className="profile-artisan-name">{a.name}</h1>
            <p className="profile-location-line">
              📍 {[a.location, a.community].filter(Boolean).join(' · ')}
            </p>
            <p className="profile-story-quote">
              {a.bio || 'Master craftsperson dedicated to sustaining ancestral heritage and passing techniques to next generations.'}
            </p>
            <div className="profile-tags-row">
              <span className="profile-tag-pill">🌱 100% Direct Payout</span>
              <span className="profile-tag-pill">🏺 Handmade Certified</span>
              <span className="profile-tag-pill">✨ {products.length} Active Creations</span>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="portfolio-section">
        <div className="section-head">
          <div>
            <h2 className="section-title">Handcrafted Portfolio by {a.name}</h2>
            <p className="section-subtitle">Browse and order directly from this artisan's workshop</p>
          </div>
        </div>

        {products.length > 0 ? (
          <div className="grid">
            {products.map((p) => (
              <ProductCard key={p._id} p={{ ...p, artisan: a }} />
            ))}
          </div>
        ) : (
          <div className="panel center empty-catalog-state">
            <p className="muted">This maker currently has no active pieces listed in their shop.</p>
            <Link to="/shop" className="btn btn-primary">
              Explore other handcrafted pieces
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
