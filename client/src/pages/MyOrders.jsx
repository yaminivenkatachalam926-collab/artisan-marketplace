import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useToast } from '../context/ToastContext';
import { money } from '../components/ProductCard';

const ORDER_STEPS = ['placed', 'packed', 'shipped', 'delivered'];

export default function MyOrders() {
  const [orders, setOrders] = useState(null);
  const [err, setErr] = useState('');
  const { addToast } = useToast();

  const load = () => {
    api
      .get('/orders/mine')
      .then((r) => {
        if (r?.data && Array.isArray(r.data)) {
          setOrders(r.data);
        } else {
          const localOrders = JSON.parse(localStorage.getItem('my_orders') || '[]');
          setOrders(localOrders);
        }
      })
      .catch((e) => {
        const localOrders = JSON.parse(localStorage.getItem('my_orders') || '[]');
        setOrders(localOrders);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancelItem = async (o, i) => {
    if (!window.confirm(`Are you sure you want to cancel "${i.title}"?`)) return;
    setErr('');
    try {
      await api.put(`/orders/${o._id}/items/${i._id}/cancel`);
      addToast(`Cancelled "${i.title}". Stock has been restored for the artisan.`, 'info');
      load();
    } catch (x) {
      setErr(errMsg(x));
    }
  };

  if (!orders) {
    return (
      <div className="container loading-state">
        <div className="spinner"></div>
        <p>Retrieving your order history…</p>
      </div>
    );
  }

  return (
    <div className="orders-page container">
      <div className="orders-header">
        <h1>My Order History</h1>
        <p className="muted">Direct shipments from community artisan workshops</p>
      </div>

      {err && <div className="error-banner">{err}</div>}

      {!orders.length ? (
        <div className="panel center empty-catalog-state">
          <span className="empty-icon">📦</span>
          <h3>You haven't placed any orders yet</h3>
          <p className="muted">
            Support authentic Indian artisans by browsing their collections.
          </p>
          <Link to="/shop" className="btn btn-primary">
            Explore Handcrafted Collections
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((o) => (
            <div key={o._id} className="panel order-panel">
              <div className="order-panel-header">
                <div className="order-id-group">
                  <span className="order-number">Order #{o._id.slice(-6).toUpperCase()}</span>
                  <span className="order-date">
                    Placed on {new Date(o.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="order-dest-group">
                  <span className="order-city-badge">📍 {o.shipping?.city}, {o.shipping?.pincode}</span>
                  <span className="order-total-badge">{money(o.total)}</span>
                </div>
              </div>

              {/* Order Items */}
              <div className="order-items-wrapper">
                {o.items.map((i) => {
                  const stepIndex = ORDER_STEPS.indexOf(i.status);
                  const isCancelled = i.status === 'cancelled';

                  return (
                    <div key={i._id} className="order-item-card">
                      <div className="order-item-top">
                        <div className="order-thumb-wrap">
                          {i.image ? (
                            <img src={i.image} alt={i.title} />
                          ) : (
                            <span className="thumb-craft-icon">🏺</span>
                          )}
                        </div>

                        <div className="order-item-info">
                          <h4>{i.title}</h4>
                          <span className="order-item-pricing">
                            Qty: {i.qty} · {money(i.price)} each = <strong>{money(i.price * i.qty)}</strong>
                          </span>
                        </div>

                        <div className="order-item-status-col">
                          <span className={`status-pill status-${i.status}`}>
                            {i.status.toUpperCase()}
                          </span>
                          {i.status === 'placed' && (
                            <button
                              type="button"
                              className="cancel-link-btn"
                              onClick={() => handleCancelItem(o, i)}
                            >
                              Cancel Item
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Timeline bar */}
                      {!isCancelled && (
                        <div className="order-timeline">
                          {ORDER_STEPS.map((s, idx) => (
                            <div
                              key={s}
                              className={`timeline-step ${idx <= stepIndex ? 'completed' : ''} ${idx === stepIndex ? 'current' : ''}`}
                            >
                              <div className="step-circle">{idx <= stepIndex ? '✓' : idx + 1}</div>
                              <span className="step-label">{s}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="order-panel-footer">
                <span className="shipping-recipient">
                  Recipient: <strong>{o.shipping?.name}</strong> · {o.shipping?.address} · Ph: {o.shipping?.phone}
                </span>
                <span className="cod-badge">Payment: Cash on Delivery</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
