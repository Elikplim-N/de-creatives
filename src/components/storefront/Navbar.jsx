import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './Navbar.css';

export default function Navbar() {
  const { cartCount, wishlist, searchQuery, setSearchQuery } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'Manifesto', href: '/manifesto' },
  ];

  return (
    <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}${mobileOpen ? ' navbar--open' : ''}`} role="banner">
      <div className="navbar__inner">

        {/* Left: Nav Links and Mobile Hamburger */}
        <div className="navbar__left">
          <button
            className={`navbar__hamburger${mobileOpen ? ' navbar__hamburger--open' : ''}`}
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <span /><span /><span />
          </button>

          <nav className="navbar__links" aria-label="Main navigation">
            {navLinks.map(l => (
              <Link key={l.label} to={l.href} className="navbar__link">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Center: Both Logos */}
        <Link to="/" className="navbar__logo" aria-label="DE Creatives Home">
          <img src="/logo.png" alt="DE Creatives Logo" className="navbar__logo-text-img" />
          <img src="/favicon_nav.png" alt="DE Logo" className="navbar__logo-img" />
        </Link>

        {/* Right: Actions */}
        <div className="navbar__actions">
          {searchOpen ? (
            <div className="navbar__search-wrap">
              <input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="navbar__search-input"
                autoFocus
                aria-label="Search products"
              />
              <button onClick={() => setSearchOpen(false)} className="navbar__action-btn" aria-label="Close search">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          ) : (
            <>
              <button onClick={() => setSearchOpen(true)} className="navbar__action-btn" aria-label="Search">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </button>
              <button className="navbar__action-btn navbar__wishlist-btn" aria-label={`Wishlist (${wishlist.length} items)`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                {wishlist.length > 0 && <span className="navbar__badge">{wishlist.length}</span>}
              </button>
              <button className="navbar__action-btn navbar__cart-btn" aria-label={`Cart (${cartCount} items)`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                {cartCount > 0 && <span className="navbar__badge navbar__badge--primary">{cartCount}</span>}
              </button>
              <Link to="/admin/login" className="navbar__admin-link" aria-label="Admin portal">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`navbar__mobile${mobileOpen ? ' navbar__mobile--open' : ''}`} aria-hidden={!mobileOpen}>
        <nav className="navbar__mobile-links">
          {navLinks.map(l => (
            <Link key={l.label} to={l.href} className="navbar__mobile-link">
              {l.label}
            </Link>
          ))}
          <div className="navbar__mobile-divider" />
          <Link to="/admin/login" className="navbar__mobile-link navbar__mobile-admin">
            Admin Portal →
          </Link>
        </nav>
      </div>
    </header>
  );
}
