import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
export const desc = (p, lang = 'en') =>
  p.descriptions?.[lang] || p.descriptions?.en || Object.values(p.descriptions || {})[0] || '';

export default function ProductCard({ p }) {
  const { add } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [added, setAdded] = useState(false);

  const canBuy = (!user || user.role === 'customer') && p.stock > 0;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canBuy) return;
    add(p, 1);
    setAdded(true);
    addToast(`Added "${p.title}" to your cart`, 'success');
    setTimeout(() => setAdded(false), 1800);
  };

  const isLowStock = p.stock > 0 && p.stock <= 3;

  return (
    <div className="card product-card">
      <Link to={`/product/${p._id}`} className="card-media-wrap">
        <div className="thumb">
          {p.images?.[0] ? (
            <img src={p.images[0]} alt={p.title} loading="lazy" />
          ) : (
            <div className="thumb-fallback">
              <span className="fallback-craft-icon">✨</span>
              <span>Handcrafted Art</span>
            </div>
          )}
        </div>
        <div className="card-floating-tags">
          <span className="card-category-tag">{p.category || 'Handcrafted'}</span>
          {p.stock === 0 ? (
            <span className="tag-stock tag-soldout">Sold out</span>
          ) : isLowStock ? (
            <span className="tag-stock tag-lowstock">Only {p.stock} left</span>
          ) : null}
        </div>
      </Link>

      <div className="card-body">
        <div className="card-maker-info">
          <span className="maker-avatar-mini">
            {p.artisan?.name ? p.artisan.name.charAt(0) : 'M'}
          </span>
          <span className="maker-name-text">
            {p.artisan?.name || 'Independent Maker'}
            {p.artisan?.location ? ` · ${p.artisan.location}` : ''}
          </span>
        </div>

        <h3 className="card-title">
          <Link to={`/product/${p._id}`}>{p.title}</Link>
        </h3>

        {p.materials && <p className="card-materials">{p.materials}</p>}

        <div className="card-footer-row">
          <div className="price-stack">
            <span className="price-amount">{money(p.price)}</span>
            <span className="price-subtext">Free shipping</span>
          </div>

          {canBuy && (
            <button
              type="button"
              className={`btn-quick-add ${added ? 'added' : ''}`}
              onClick={handleQuickAdd}
              aria-label={`Add ${p.title} to cart`}
              title="Quick Add to Cart"
            >
              {added ? '✓ Added' : '+ Add'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
