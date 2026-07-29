import { useState } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import AdminInventory from '../components/admin/AdminInventory';
import AdminProducts from '../components/admin/AdminProducts';
import AdminCategories from '../components/admin/AdminCategories';
import AdminOverview from '../components/admin/AdminOverview';
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
];

export default function AdminDashboard() {
  const { adminLogout, products, categories } = useApp();
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
          </Routes>
        </div>
      </div>
    </div>
  );
}
