import Navbar from '../components/storefront/Navbar';
import ProductGrid from '../components/storefront/ProductGrid';
import Footer from '../components/storefront/Footer';

export default function Shop() {
  return (
    <div className="storefront" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      
      {/* SOG-Style Promo/Sale Banner */}
      <div className="shop-promo-banner" style={{
        marginTop: 'var(--nav-height)',
        background: 'var(--white-05)',
        borderBottom: '1px solid rgba(0, 200, 200, 0.2)',
        padding: '12px 0',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        <div className="container">
          <p style={{
            fontFamily: 'var(--font-accent)',
            fontSize: '0.78rem',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--text-secondary)'
          }}>
            PRE-ORDER SS26 DROP <span style={{ color: 'var(--turquoise)', margin: '0 8px' }}>·</span> Pre-order now to secure limited drop pieces
          </p>
        </div>
      </div>

      <main id="main-content" style={{ minHeight: '80vh' }}>
        <ProductGrid />
      </main>

      <Footer />
    </div>
  );
}
