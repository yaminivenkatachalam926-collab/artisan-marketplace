import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const nav = useNavigate();
  const [navSearch, setNavSearch] = useState('');

  const home = user?.role === 'artisan' ? '/artisan' : user?.role === 'admin' ? '/admin' : '/orders';

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      nav(`/shop?q=${encodeURIComponent(navSearch.trim())}`);
      setNavSearch('');
    }
  };

  return (
    <header className="nav">
      <div className="nav-announcement">
        <span>✨ Directly supporting 100+ rural & marginalized Indian artisans · 100% Direct Payouts · Free Delivery on COD</span>
      </div>
      <div className="nav-inner">
        <Link to="/" className="brand">
          <span className="brand-logo-mark">🏺</span>
          <div className="brand-text-group">
            <span className="brand-title">Kaivinai</span>
            <span className="brand-tagline">கைவினை · Fair Trade Marketplace</span>
          </div>
        </Link>

        <form className="nav-search-form" onSubmit={handleSearchSubmit}>
          <span className="nav-search-icon">🔍</span>
          <input
            type="search"
            placeholder="Search pottery, handloom, brass, baskets…"
            value={navSearch}
            onChange={(e) => setNavSearch(e.target.value)}
            className="nav-search-input"
          />
        </form>

        <nav className="nav-links">
          <NavLink to="/shop" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            Shop
          </NavLink>
          <NavLink to="/artisans" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            Makers
          </NavLink>

          {user?.role !== 'artisan' && user?.role !== 'admin' && (
            <NavLink to="/cart" className={({ isActive }) => `nav-item nav-cart ${isActive ? 'active' : ''}`}>
              <span className="cart-icon">🛍️</span>
              <span>Cart</span>
              {count > 0 && <span className="badge cart-badge">{count}</span>}
            </NavLink>
          )}

          {/* Universal Dashboard link for everyone */}
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item nav-dashboard-link ${isActive ? 'active' : ''}`}>
            📊 Dashboard
          </NavLink>

          {user ? (
            <div className="nav-user-cluster">
              <div className="nav-user-badge" title={`Signed in as ${user.email}`}>
                <span className="nav-user-name">{user.name}</span>
                <span className="nav-user-email">✉️ {user.email}</span>
              </div>
              <span className={`role-badge role-${user.role}`}>
                {user.role === 'artisan' ? '🏺 Maker' : user.role === 'admin' ? '🛡️ Admin' : '🛍️ Buyer'}
              </span>
              {user.role === 'customer' && (
                <NavLink to="/orders" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                  📦 Orders
                </NavLink>
              )}
              {user.role === 'admin' && (
                <NavLink to="/artisan" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                  🏺 Artisan Portal
                </NavLink>
              )}
              <button
                type="button"
                className="btn-logout"
                title={`Signed in as ${user.email}`}
                onClick={() => {
                  logout();
                  nav('/');
                }}
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="nav-guest-cluster">
              <NavLink to="/login" className="nav-item">
                Log in
              </NavLink>
              <Link to="/register" className="btn btn-nav-cta">
                Join
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
