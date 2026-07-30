import { Link } from 'react-router-dom';
import Navbar from '../components/storefront/Navbar';
import Footer from '../components/storefront/Footer';
import './Manifesto.css';

export default function Manifesto() {
  return (
    <div className="storefront" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />

      <main id="main-content" style={{ minHeight: '100vh', paddingTop: 'var(--nav-height)' }}>
        {/* Hero Section */}
        <section className="manifesto-hero">
          <img
            src="/products/tee-black-girl-palm.jpg"
            alt="DE Creatives Editorial"
            className="manifesto-hero__img"
          />
          <div className="manifesto-hero__overlay" />
          <div className="manifesto-hero__content container">
            <p className="manifesto-hero__brand animate-fade-up">DE Creatives</p>
            <h1 className="manifesto-hero__title animate-fade-up animate-delay-1">Manifesto</h1>
            <p className="manifesto-hero__tagline animate-fade-up animate-delay-2">Wear Your Identity</p>
          </div>
        </section>

        {/* Conviction Block */}
        <section className="manifesto-conviction">
          <div className="container manifesto-conviction__inner">
            <p className="manifesto-conviction__label">Our Conviction</p>
            <h2 className="manifesto-conviction__text">
              Identity should be visible — without compromising style, excellence, or cultural relevance.
            </h2>
          </div>
        </section>

        {/* Articles Columns */}
        <section className="manifesto-articles container">
          <div className="manifesto-articles__grid">
            {/* Column 1 */}
            <article className="manifesto-article">
              <span className="manifesto-article__number">01 / IDENTITY</span>
              <div className="manifesto-article__body">
                <p>We are not defined by temporary trends.</p>
                <p>We are defined by the vision within.</p>
                <p>We are chosen, called, and commissioned.</p>
              </div>
            </article>

            {/* Column 2 */}
            <article className="manifesto-article">
              <span className="manifesto-article__number">02 / BELIEF</span>
              <div className="manifesto-article__body">
                <p>We believe excellence is standard.</p>
                <p>We believe identity should be visible.</p>
                <p>We believe clothing can tell stories.</p>
                <p>We believe self-expression changes everything.</p>
              </div>
            </article>

            {/* Column 3 */}
            <article className="manifesto-article">
              <span className="manifesto-article__number">03 / DECLARATION</span>
              <div className="manifesto-article__body">
                <p className="highlight">We stand bold in who we are.</p>
                <p className="highlight">This is more than fashion.</p>
                <p className="brand-highlight">THIS IS DE CREATIVES.</p>
              </div>
            </article>
          </div>
        </section>

        {/* Explore CTA */}
        <section className="manifesto-cta">
          <div className="container">
            <p className="manifesto-cta__sub">The Collection</p>
            <p className="manifesto-cta__text">
              Garments rooted in culture. Crafted to be worn with purpose.
            </p>
            <Link to="/shop" className="btn btn-outline btn-lg" style={{ marginTop: 'var(--space-8)' }}>
              Explore Collection
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
