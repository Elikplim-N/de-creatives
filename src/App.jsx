import { useEffect, useState } from 'react';
import './styles/index.css';

function LoadingScreen({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3400);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="loading-screen">
      <img src="/logo.png" alt="DE Creatives" className="loading-logo" />
      <div className="loading-progress">
        <div className="loading-progress-bar" />
      </div>
      <span className="loading-tagline">God × Health × GOOD vibes</span>
    </div>
  );
}

import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

import Storefront from './pages/Storefront';
import Shop from './pages/Shop';
import Manifesto from './pages/Manifesto';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ProductDetail from './pages/ProductDetail';
import Toast from './components/shared/Toast';
import AdminRoute from './components/shared/AdminRoute';
import CartDrawer from './components/storefront/CartDrawer';
import WishlistDrawer from './components/storefront/WishlistDrawer';

export default function App() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading && <LoadingScreen onDone={() => setLoading(false)} />}
      <AppProvider>
        <Routes>
          <Route path="/" element={<Storefront />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/manifesto" element={<Manifesto />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/*" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
        </Routes>
        <Toast />
        <CartDrawer />
        <WishlistDrawer />
      </AppProvider>
    </>
  );
}
