import Navbar from '../components/storefront/Navbar';
import Hero from '../components/storefront/Hero';
import NewArrivals from '../components/storefront/NewArrivals';
import CategoryBanner from '../components/storefront/CategoryBanner';
import Gallery from '../components/storefront/Gallery';
import Testimonials from '../components/storefront/Testimonials';
import Footer from '../components/storefront/Footer';

export default function Storefront() {
  return (
    <div className="storefront">
      <Navbar />
      <main id="main-content" className="animate-fade-up" style={{ minHeight: '100vh' }}>
        <Hero />
        
        {/* New Arrivals Section - placed before Editorial */}
        <NewArrivals />

        {/* Brand Statement Banner - placed after New Arrivals */}
        <section className="brand-statement-banner" style={{
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: 'var(--space-20) 0',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div className="container" style={{ maxWidth: '800px' }}>
            <p className="brand-statement-text" style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 300,
              fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
              lineHeight: 1.6,
              letterSpacing: '0.04em',
              color: 'var(--text-primary)',
            }}>
              God × Health × GOOD vibes
            </p>
          </div>
        </section>

        {/* Editorial Showcase Grid */}
        <CategoryBanner />

        {/* Lookbook / Visual Gallery */}
        <Gallery />

        {/* The Good Report / Testimonials */}
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
