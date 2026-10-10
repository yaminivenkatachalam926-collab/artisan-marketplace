import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { money } from '../components/ProductCard';

export default function Checkout() {
  const { items, total, count, clear } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const nav = useNavigate();

  const [s, setS] = useState({
    name: user?.name || '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
  });

  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const setKey = (k) => (e) => setS({ ...s, [k]: e.target.value });

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);

    try {
      await api.post('/orders', {
        items: items.map((i) => ({ productId: i._id, qty: i.qty })),
        shipping: s,
      });
      clear();
      addToast('🎉 Order placed successfully! Thank you for supporting Indian artisans.', 'success', 5000);
      nav('/orders');
    } catch (x) {
      setErr(errMsg(x));
    } finally {
      setBusy(false);
    }
  };

  if (!items.length) {
    return (
      <div className="container panel narrow center">
        <h2>Your Cart is Empty</h2>
        <p className="muted">Add pieces to your cart before proceeding to checkout.</p>
        <Link to="/shop" className="btn btn-primary">
          Explore Handcrafted Pieces
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-page container">
      <div className="checkout-grid-layout">
        {/* Left Column: Delivery Form */}
        <div className="checkout-form-column">
          <div className="panel checkout-panel">
            <div className="checkout-head">
              <span className="checkout-step-badge">Step 1 of 1</span>
              <h2>Delivery Address</h2>
              <p className="muted">Please provide the delivery address for direct shipment from maker workshops</p>
            </div>

            {err && <div className="error-banner">{err}</div>}

            <form onSubmit={handlePlaceOrder} className="checkout-form">
              <label className="form-label">
                Recipient Full Name
                <input
                  required
                  value={s.name}
                  onChange={setKey('name')}
                  placeholder="e.g. Rahul Sharma"
                  className="form-input"
                />
              </label>

              <label className="form-label">
                Contact Phone Number
                <input
                  required
                  type="tel"
                  value={s.phone}
                  onChange={setKey('phone')}
                  placeholder="e.g. 9876543210 (for delivery updates)"
                  className="form-input"
                />
              </label>

              <label className="form-label">
                Complete Street Address
                <textarea
                  required
                  rows="3"
                  value={s.address}
                  onChange={setKey('address')}
                  placeholder="House / Flat number, building, street, locality"
                  className="form-input"
                />
              </label>

              <div className="two">
                <label className="form-label">
                  City / Town
                  <input
                    required
                    value={s.city}
                    onChange={setKey('city')}
                    placeholder="e.g. Bengaluru"
                    className="form-input"
                  />
                </label>
                <label className="form-label">
                  Postal Pincode
                  <input
                    required
                    value={s.pincode}
                    onChange={setKey('pincode')}
                    placeholder="e.g. 560001"
                    className="form-input"
                  />
                </label>
              </div>

              {/* Payment Section */}
              <div className="payment-method-box">
                <div className="payment-head">
                  <span className="payment-icon">💵</span>
                  <div>
                    <strong>Cash on Delivery (COD)</strong>
                    <small>Pay safely upon receiving your artisanal package. No prepayment required.</small>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block btn-lg btn-place-order"
                disabled={busy}
              >
                {busy ? 'Confirming with Artisans…' : `Place Order · ${money(total)}`}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Order Review */}
        <div className="checkout-review-column">
          <div className="panel review-panel">
            <h3>Review Items ({count})</h3>
            <div className="review-items-list">
              {items.map((i) => (
                <div key={i._id} className="review-item-row">
                  <div className="review-thumb">
                    {i.image ? <img src={i.image} alt={i.title} /> : <span>🏺</span>}
                  </div>
                  <div className="review-info">
                    <span className="review-title">{i.title}</span>
                    <span className="review-meta">Qty: {i.qty} × {money(i.price)}</span>
                  </div>
                  <span className="review-price">{money(i.price * i.qty)}</span>
                </div>
              ))}
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row">
              <span className="muted">Subtotal</span>
              <span>{money(total)}</span>
            </div>
            <div className="summary-row">
              <span className="muted">Shipping</span>
              <span className="free-tag">FREE</span>
            </div>
            <div className="summary-row total-row">
              <strong>Order Total</strong>
              <strong className="summary-total-amount">{money(total)}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
