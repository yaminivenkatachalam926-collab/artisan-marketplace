import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Protected from './components/Protected';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Artisans from './pages/Artisans';
import ArtisanProfile from './pages/ArtisanProfile';
import { Login, Register } from './pages/Auth';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import ArtisanDashboard from './pages/ArtisanDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { useAuth } from './context/AuthContext';

function DashboardRedirect() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="container loading-state" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
        <p>Opening Dashboard…</p>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role === 'artisan') {
    return <Navigate to="/artisan" replace />;
  }
  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  return <Navigate to="/orders" replace />;
}

export default function App() {
  return (
    <div className="app-shell">
      <ScrollToTop />
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/artisans" element={<Artisans />} />
          <Route path="/artisans/:id" element={<ArtisanProfile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="/checkout" element={<Protected role="customer"><Checkout /></Protected>} />
          <Route path="/orders" element={<Protected role="customer"><MyOrders /></Protected>} />
          <Route path="/artisan" element={<Protected role="artisan"><ArtisanDashboard /></Protected>} />
          <Route path="/admin" element={<Protected role="admin"><AdminDashboard /></Protected>} />
          <Route path="*" element={<div className="container not-found"><div className="panel narrow center"><h2>Page Not Found</h2><p className="muted">The craft collection or page you requested does not exist.</p><a href="/shop" className="btn">Return to Shop</a></div></div>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

