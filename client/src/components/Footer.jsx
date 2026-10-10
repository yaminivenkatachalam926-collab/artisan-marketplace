import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="brand-logo">
            <span className="brand-icon">🏺</span>
            <span className="brand-text">Kaivinai</span>
          </div>
          <p className="footer-desc">
            An AI-driven market linkage and smart cataloging ecosystem directly connecting marginalized, rural, and indigenous Indian artisans with global patrons.
          </p>
          <div className="footer-badges">
            <span className="trust-pill">🌱 100% Fair Trade</span>
            <span className="trust-pill">⚡ Direct Maker Payouts</span>
            <span className="trust-pill">🌐 8+ Indian Languages</span>
          </div>
        </div>

        <div className="footer-col">
          <h4>Explore</h4>
          <Link to="/shop">All Handcrafts</Link>
          <Link to="/artisans">Meet the Makers</Link>
          <Link to="/shop?category=Pottery">Khurja Pottery</Link>
          <Link to="/shop?category=Basketry">Palm-Leaf Weaving</Link>
          <Link to="/shop?category=Metalwork">Dhokra Metalwork</Link>
        </div>

        <div className="footer-col">
          <h4>For Artisans</h4>
          <Link to="/register">Join as a Maker</Link>
          <Link to="/artisan">Artisan Control Center</Link>
          <Link to="/login">Maker Sign In</Link>
          <span className="footer-subtext">AI Smart Multilingual Cataloging included free for all verified craftspersons.</span>
        </div>

        <div className="footer-col">
          <h4>Community & Impact</h4>
          <p className="footer-subtext">
            Supporting self-help groups, craft clusters, and indigenous women cooperatives across Tamil Nadu, Uttar Pradesh, West Bengal, and Karnataka.
          </p>
          <div className="demo-credentials-box" style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span className="demo-tag" style={{ color: '#111d4a', fontWeight: '700', fontSize: '0.8rem', display: 'block', marginBottom: '8px' }}>Portals & Access</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Link to="/login?role=customer" style={{ fontSize: '0.84rem' }}>🛍️ Customer Sign In</Link>
              <Link to="/login?role=artisan" style={{ fontSize: '0.84rem' }}>🏺 Artisan Workshop Sign In</Link>
              <Link to="/login?role=admin" style={{ fontSize: '0.84rem' }}>🛡️ Admin Governance Portal</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <span>© {new Date().getFullYear()} Kaivinai Marketplace. Handcrafted with reverence for traditional knowledge systems.</span>
          <div className="footer-bottom-links">
            <span>Craft Heritage</span>
            <span>·</span>
            <span>Privacy</span>
            <span>·</span>
            <span>Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
