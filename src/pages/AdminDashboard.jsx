import { useState } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import AdminInventory from '../components/admin/AdminInventory';
import AdminProducts from '../components/admin/AdminProducts';
import AdminCategories from '../components/admin/AdminCategories';
import AdminHero from '../components/admin/AdminHero';
import AdminOverview from '../components/admin/AdminOverview';
import AdminReviews from '../components/admin/AdminReviews';
import AdminSubscribers from '../components/admin/AdminSubscribers';
import AdminGallery from '../components/admin/AdminGallery';
import AdminManifesto from '../components/admin/AdminManifesto';
import './AdminDashboard.css';

const navItems = [
  {
    id: 'overview', label: 'Overview', path: '/admin',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    id: 'inventory', label: 'Inventory', path: '/admin/inventory',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
  },
  {
    id: 'products', label: 'Products', path: '/admin/products',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
  },
  {
    id: 'categories', label: 'Categories', path: '/admin/categories',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
        <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
        <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
      </svg>
    ),
  },
  {
    id: 'homepage', label: 'Homepage', path: '/admin/homepage',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    id: 'gallery', label: 'The Gallery of DE', path: '/admin/gallery',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    ),
  },
  {
    id: 'manifesto', label: 'Clan of DE Editor', path: '/admin/manifesto',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
  },
  {
    id: 'reviews', label: 'Reviews', path: '/admin/reviews',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
  {
    id: 'subscribers', label: 'Subscribers', path: '/admin/subscribers',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
  },
];

export default function AdminDashboard() {
  const { adminLogout, products, categories, pendingTestimonials } = useApp();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState('overview');

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const handleNav = (item) => {
    setActivePage(item.id);
    navigate(item.path);
  };

  return (
    <div className={`admin-dashboard${sidebarOpen ? '' : ' admin-dashboard--collapsed'}`}>
      {/* Sidebar */}
      <aside className="admin-sidebar" aria-label="Admin navigation">
        {/* Brand */}
        <div className="admin-sidebar__brand">
          <img src="/logo.png" alt="DE Creatives" className="admin-sidebar__logo" />
          {sidebarOpen && <span className="admin-sidebar__brand-text">DE Creatives</span>}
        </div>

        {/* Nav */}
        <nav className="admin-sidebar__nav" aria-label="Admin pages">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`admin-sidebar__nav-item${activePage === item.id ? ' admin-sidebar__nav-item--active' : ''}`}
              onClick={() => handleNav(item)}
              title={!sidebarOpen ? item.label : undefined}
              aria-current={activePage === item.id ? 'page' : undefined}
            >
              <span className="admin-sidebar__nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="admin-sidebar__nav-label">{item.label}</span>}
              {item.id === 'reviews' && pendingTestimonials.length > 0 && (
                <span className="badge badge-warning admin-sidebar__nav-badge">{pendingTestimonials.length}</span>
              )}
              {activePage === item.id && <span className="admin-sidebar__nav-indicator" />}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user" aria-label="Logged in as Admin">
            <div className="admin-sidebar__avatar">A</div>
            {sidebarOpen && (
              <div className="admin-sidebar__user-info">
                <p className="admin-sidebar__user-name">Admin</p>
                <p className="admin-sidebar__user-role">Store Owner</p>
              </div>
            )}
          </div>
          <button
            className="admin-sidebar__logout"
            onClick={handleLogout}
            title="Sign out"
            aria-label="Sign out"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Top Bar */}
        <header className="admin-topbar" role="banner">
          <button
            className="admin-topbar__toggle"
            onClick={() => setSidebarOpen(v => !v)}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div className="admin-topbar__breadcrumb">
            <span className="admin-topbar__breadcrumb-root">Dashboard</span>
            <span className="admin-topbar__breadcrumb-sep">/</span>
            <span className="admin-topbar__breadcrumb-current">
              {navItems.find(n => n.id === activePage)?.label}
            </span>
          </div>
          <div className="admin-topbar__actions">
            <span className="badge badge-success admin-topbar__status">
              <span className="admin-topbar__status-dot" />
              Live
            </span>
            <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              View Store
            </a>
          </div>
        </header>

        {/* Page Content */}
        <div className="admin-content">
          <Routes>
            <Route index element={<AdminOverview />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="homepage" element={<AdminHero />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="manifesto" element={<AdminManifesto />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="subscribers" element={<AdminSubscribers />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
