import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { money, desc } from '../components/ProductCard';
import { MOCK_PRODUCTS } from '../mockData';

export default function ProductDetail() {
  const { id } = useParams();
  const { add } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [p, setP] = useState(() => MOCK_PRODUCTS.find((item) => item._id === id) || MOCK_PRODUCTS[0]);
  const [meta, setMeta] = useState({
    languages: {
      en: 'English',
      ta: 'தமிழ் (Tamil)',
      hi: 'हिन्दी (Hindi)',
      bn: 'বাংলা (Bengali)',
    },
  });
  const [lang, setLang] = useState('en');
  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then((r) => {
        if (r?.data && typeof r.data === 'object' && r.data.title) {
          setP(r.data);
        }
      })
      .catch(() => {
        const fallback = MOCK_PRODUCTS.find((item) => item._id === id) || MOCK_PRODUCTS[0];
        setP(fallback);
      });

    api
      .get('/products/meta')
      .then((r) => {
        if (r?.data?.languages) setMeta(r.data);
      })
      .catch(() => {});
  }, [id]);

  if (p === null) {
    return (
      <div className="container loading-state">
        <div className="spinner"></div>
        <p>Loading craft details from the artisan…</p>
      </div>
    );
  }

  if (p === false) {
    return (
      <div className="container panel narrow center">
        <h2>Piece Not Found</h2>
        <p className="muted">This handcrafted item may have been retired or removed by the maker.</p>
        <Link to="/shop" className="btn btn-primary">
          Browse Handcrafted Collection
        </Link>
      </div>
    );
  }

  const availableLanguages = Object.keys(p.descriptions || {});
  const canBuy = (!user || user.role === 'customer') && p.stock > 0;

  const handleAddToCart = () => {
    if (!canBuy) return;
    add(p, qty);
    setAdded(true);
    addToast(`Added ${qty} × "${p.title}" to your cart!`, 'success');
  };

  const images = p.images?.length ? p.images : [];
  const currentImgSrc = images[img] || null;

  return (
    <div className="product-detail-page container">
      {/* Breadcrumbs */}
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span className="sep">/</span>
        <Link to="/shop">Shop</Link>
        <span className="sep">/</span>
        <Link to={`/shop?category=${encodeURIComponent(p.category || 'Other')}`}>{p.category || 'Craft'}</Link>
        <span className="sep">/</span>
        <span className="current">{p.title}</span>
      </nav>

      <div className="detail-layout">
        {/* Left Column: Gallery */}
        <div className="gallery-column">
          <div className="main-image-wrap">
            {currentImgSrc ? (
              <img src={currentImgSrc} alt={p.title} className="main-detail-img" />
            ) : (
              <div className="main-image-placeholder">
                <span className="placeholder-icon">🏺</span>
                <span>Authentic Handcrafted Piece</span>
              </div>
            )}
            <span className="image-badge-tag">{p.category}</span>
          </div>

          {images.length > 1 && (
            <div className="thumbnails-row">
              {images.map((src, i) => (
                <button
                  type="button"
                  key={src}
                  className={`thumb-btn ${i === img ? 'active' : ''}`}
                  onClick={() => setImg(i)}
                  aria-label={`View photo ${i + 1}`}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}

          {/* Maker Story Card */}
          {p.artisan && (
            <div className="artisan-story-card">
              <div className="story-card-header">
                <span className="artisan-story-avatar">
                  {p.artisan.name?.charAt(0) || 'A'}
                </span>
                <div>
                  <h4 className="maker-card-name">{p.artisan.name}</h4>
                  <span className="maker-card-craft">
                    {[p.artisan.craft, p.artisan.location].filter(Boolean).join(' · ')}
                  </span>
                </div>
              </div>
              {p.artisan.bio && <p className="artisan-bio-quote">"{p.artisan.bio}"</p>}
              <Link to={`/artisans/${p.artisan._id}`} className="view-profile-btn">
                View Maker Portfolio & Story →
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Commerce */}
        <div className="info-column">
          <div className="title-section">
            <span className="category-meta-badge">{p.category}</span>
            <h1 className="product-title">{p.title}</h1>
            <p className="product-price">{money(p.price)}</p>
            <div className="shipping-micro">
              <span>✓ Free shipping on COD across India</span>
              <span>·</span>
              <span>100% Direct Maker Payout</span>
            </div>
          </div>

          {/* Multilingual Storytelling Section */}
          <div className="story-language-block">
            <div className="story-language-head">
              <strong>Craft Story in Native Indian Languages:</strong>
              <span className="ai-catalog-pill">✦ AI Multilingual Translation</span>
            </div>

            {availableLanguages.length > 1 && (
              <div className="lang-chips-row">
                {availableLanguages.map((l) => (
                  <button
                    key={l}
                    type="button"
                    className={`chip ${lang === l ? 'on' : ''}`}
                    onClick={() => setLang(l)}
                  >
                    {meta.languages[l] || l}
                  </button>
                ))}
              </div>
            )}

            <div className="product-description-box">
              <p className="product-description-text">{desc(p, lang)}</p>
            </div>
          </div>

          {/* Specifications */}
          <div className="specs-card">
            <dl className="specs-list">
              <dt>Craft Tradition</dt>
              <dd>{p.category}</dd>

              {p.materials && (
                <>
                  <dt>Materials</dt>
                  <dd>{p.materials}</dd>
                </>
              )}

              <dt>Availability</dt>
              <dd>
                {p.stock > 0 ? (
                  <span className="stock-in">
                    ✓ {p.stock} {p.stock === 1 ? 'piece' : 'pieces'} available
                  </span>
                ) : (
                  <span className="stock-out">✕ Sold out</span>
                )}
              </dd>

              {p.artisan?.community && (
                <>
                  <dt>Craft Guild</dt>
                  <dd>{p.artisan.community}</dd>
                </>
              )}
            </dl>
          </div>

          {/* Tags */}
          {p.keywords?.length > 0 && (
            <div className="tags-section">
              <span className="tags-label">Keywords:</span>
              <div className="tag-cloud">
                {p.keywords.map((k) => (
                  <span key={k} className="tag tag-pill">
                    #{k}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Commerce Action */}
          <div className="buy-action-box">
            {canBuy ? (
              <div className="action-row">
                <div className="qty-control">
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                  >
                    −
                  </button>
                  <span className="qty-val">{qty}</span>
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => setQty((q) => Math.min(p.stock, q + 1))}
                    disabled={qty >= p.stock}
                  >
                    +
                  </button>
                </div>

                <button type="button" className="btn btn-primary btn-add-main" onClick={handleAddToCart}>
                  {added ? '✓ Added to Cart' : `Add ${qty} to Cart · ${money(p.price * qty)}`}
                </button>
              </div>
            ) : p.stock === 0 ? (
              <div className="out-of-stock-alert">
                <strong>Sold Out</strong>
                <p className="muted">This unique piece has been claimed. Reach out to the maker for a custom commission.</p>
              </div>
            ) : null}

            {added && (
              <div className="added-notice-bar">
                <span>Item successfully placed in your shopping bag.</span>
                <Link to="/cart" className="view-cart-link">
                  Proceed to Checkout →
                </Link>
              </div>
            )}
          </div>

          {/* Trust Guarantees */}
          <div className="trust-features-grid">
            <div className="trust-feature">
              <span>🏺</span>
              <div>
                <strong>Handcrafted Uniqueness</strong>
                <small>No two pieces are mass-produced or identical</small>
              </div>
            </div>
            <div className="trust-feature">
              <span>🤝</span>
              <div>
                <strong>Fair Trade Guaranteed</strong>
                <small>Direct income for rural artisan households</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
