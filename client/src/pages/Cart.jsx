import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { money } from '../components/ProductCard';

export default function Cart() {
  const { items, setQty, remove, total, count } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const nav = useNavigate();

  const handleRemove = (id, title) => {
    remove(id);
    addToast(`Removed "${title}" from cart`, 'info');
  };

  if (!items.length) {
    return (
      <div className="cart-page container">
        <div className="panel narrow center empty-cart-box">
          <span className="empty-cart-icon">🛍️</span>
          <h2>Your Craft Basket is Empty</h2>
          <p className="muted">
            Explore authentic pieces lovingly made by independent weavers, potters, and metalworkers.
          </p>
          <Link to="/shop" className="btn btn-primary btn-lg">
            Discover Handcrafted Pieces
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page container">
      <div className="cart-header">
        <h1>Your Shopping Basket</h1>
        <span className="cart-count-label">{count} {count === 1 ? 'item' : 'items'} selected</span>
      </div>

      <div className="cart-grid-layout">
        {/* Left Column: Items */}
        <div className="cart-items-list">
          {items.map((i) => (
            <div key={i._id} className="cart-item-card">
              <div className="cart-item-thumb">
                {i.image ? (
                  <img src={i.image} alt={i.title} />
                ) : (
                  <span className="cart-item-placeholder">🏺</span>
                )}
              </div>

              <div className="cart-item-details">
                <h3 className="cart-item-title">
                  <Link to={`/product/${i._id}`}>{i.title}</Link>
                </h3>
                <span className="cart-item-unit-price">{money(i.price)} each</span>
              </div>

              <div className="cart-item-actions">
                <div className="qty-control cart-qty-control">
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => setQty(i._id, i.qty - 1)}
                    disabled={i.qty <= 1}
                  >
                    −
                  </button>
                  <span className="qty-val">{i.qty}</span>
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => setQty(i._id, i.qty + 1)}
                    disabled={i.qty >= i.stock}
                  >
                    +
                  </button>
                </div>

                <span className="cart-item-line-total">{money(i.price * i.qty)}</span>

                <button
                  type="button"
                  className="cart-remove-btn"
                  onClick={() => handleRemove(i._id, i.title)}
                  title="Remove from basket"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Order Summary Sidebar */}
        <div className="cart-summary-sidebar">
          <div className="panel summary-card">
            <h3>Order Summary</h3>

            <div className="summary-row">
              <span className="muted">Craft Subtotal ({count} items)</span>
              <span>{money(total)}</span>
            </div>

            <div className="summary-row">
              <span className="muted">Standard Delivery</span>
              <span className="free-tag">FREE (Across India)</span>
            </div>

            <div className="summary-row">
              <span className="muted">Payment Method</span>
              <span>Cash on Delivery (COD)</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row total-row">
              <strong>Total Amount</strong>
              <strong className="summary-total-amount">{money(total)}</strong>
            </div>

            <div className="summary-impact-note">
              <span>🤝 100% of this total reaches our verified artisans.</span>
            </div>

            {user?.role && user.role !== 'customer' ? (
              <div className="error-banner">
                You are currently signed in as an {user.role}. Please log in with a customer account to place orders.
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-block btn-lg"
                onClick={() => nav(user ? '/checkout' : '/login')}
              >
                {user ? 'Proceed to Delivery Details' : 'Sign in to Complete Order'}
              </button>
            )}

            <div className="summary-continue-link">
              <Link to="/shop">← Continue Shopping</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
