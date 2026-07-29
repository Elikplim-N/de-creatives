import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer" role="contentinfo">
      {/* Top CTA Band */}
      <div className="footer__cta-band">
        <div className="container footer__cta-inner">
          <div>
            <h2 className="footer__cta-heading">JOIN THE CLAN OF DE</h2>
            <p className="footer__cta-sub">Get early access to drops, exclusive deals, and behind-the-scenes content.</p>
          </div>
          <form className="footer__email-form" onSubmit={e => e.preventDefault()}>
            <input type="email" placeholder="Enter your email" className="footer__email-input" aria-label="Email address" />
            <button type="submit" className="btn btn-primary">Subscribe</button>
          </form>
        </div>
      </div>

      {/* Main Footer - Centered Layout */}
      <div className="footer__main">
        <div className="container footer__content-centered">
          {/* Logo group showing both logos */}
          <div className="footer__logo-group">
            <img src="/favicon_nav.png" alt="DE Logo" className="footer__logo-img" />
            <img src="/logo.png" alt="DE Creatives Logo" className="footer__logo-text-img" />
          </div>

          {/* Slogan */}
          <p className="footer__slogan">God + Health + Good Vibes.</p>

          {/* Links */}
          <nav className="footer__nav-links" aria-label="Footer navigation">
            <Link to="/shop" className="footer__nav-link">Shop</Link>
            <Link to="/manifesto" className="footer__nav-link">Manifesto</Link>
            <Link to="/shop" className="footer__nav-link">Cart</Link>
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
