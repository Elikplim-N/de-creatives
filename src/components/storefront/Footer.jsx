import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();
  const { subscribeToClan, showToast } = useApp();
  const [email, setEmail] = useState('');
  const [pref, setPref] = useState('all');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address.', 'warning');
      return;
    }

    setLoading(true);
    const success = await subscribeToClan(email, pref);
    setLoading(false);

    if (success) {
      setSubscribed(true);
      showToast('🎉 Welcome to the Clan of DE!', 'success');
    }
  };

  return (
    <footer className="footer" role="contentinfo">
      {/* Top CTA Band */}
      <div className="footer__cta-band">
        <div className="container footer__cta-inner">
          <div>
            <h2 className="footer__cta-heading">JOIN THE CLAN OF DE</h2>
            <p className="footer__cta-sub">
              Get early access to exclusive drops, promotional adverts, and community stories.
            </p>
          </div>

          {subscribed ? (
            <div style={{
              background: 'rgba(0, 200, 200, 0.1)',
              border: '1px solid var(--turquoise)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 20px',
              color: 'var(--white)',
              textAlign: 'center'
            }}>
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--turquoise)' }}>
                ✓ THANK YOU FOR SUBSCRIBING!
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Welcome to the Clan. You are first on the list for our next drop & secret promos.
              </p>
            </div>
          ) : (
            <form className="footer__email-form" onSubmit={handleSubscribe}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="footer__email-input"
                    aria-label="Email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Joining...' : 'Subscribe'}
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '14px', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="subPref"
                      value="all"
                      checked={pref === 'all'}
                      onChange={() => setPref('all')}
                      style={{ accentColor: 'var(--turquoise)' }}
                    />
                    All Drops & Promos
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="subPref"
                      value="newsletter"
                      checked={pref === 'newsletter'}
                      onChange={() => setPref('newsletter')}
                      style={{ accentColor: 'var(--turquoise)' }}
                    />
                    Newsletter Only
                  </label>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Main Footer - Centered Layout */}
      <div className="footer__main">
        <div className="container footer__content-centered">
          {/* Logo group showing both logos stacked */}
          <div className="footer__logo-group">
            <img src="/logo.png" alt="DE Creatives Logo" className="footer__logo-text-img" />
            <img src="/favicon_nav.png" alt="DE Logo" className="footer__logo-img" />
          </div>

          {/* Slogan */}
          <p className="footer__slogan">God × Health × GOOD vibes</p>

          {/* Links */}
          <nav className="footer__nav-links" aria-label="Footer navigation">
            <Link to="/shop" className="footer__nav-link">Shop</Link>
            <Link to="/manifesto" className="footer__nav-link">Manifesto</Link>
            <a
              href="https://wa.me/233532391663"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__nav-link"
              style={{ color: '#25D366' }}
            >
              WhatsApp Support
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer__nav-link">Instagram</a>
          </nav>

          {/* Copyright & Admin Portal */}
          <div className="footer__bottom-centered">
            <p className="footer__copy">
              &copy; {year} DE CREATIVES. ALL RIGHTS RESERVED.
            </p>
            <Link to="/admin/login" className="footer__admin-link-subtle">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
