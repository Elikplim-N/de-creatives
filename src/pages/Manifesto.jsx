import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Navbar from '../components/storefront/Navbar';
import Footer from '../components/storefront/Footer';
import './Manifesto.css';

export default function Manifesto() {
  const { manifesto } = useApp();

  return (
    <div className="storefront" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />

      <main id="main-content" style={{ minHeight: '100vh', paddingTop: 'var(--nav-height)' }}>
        {/* Hero Section */}
        <section className="manifesto-hero">
          {manifesto?.heroImage ? (
            <img
              src={manifesto.heroImage}
              alt="Clan of DE Editorial"
              className="manifesto-hero__img"
            />
          ) : (
            <div className="manifesto-hero__img manifesto-hero__img--fallback" style={{
              background: 'linear-gradient(135deg, #09090b 0%, #13141c 50%, #09090b 100%)',
              position: 'absolute',
              inset: 0
            }}>
              <div style={{
                position: 'absolute',
                top: '20%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '400px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(0,200,200,0.14) 0%, rgba(0,0,0,0) 70%)',
                filter: 'blur(50px)',
                pointerEvents: 'none'
              }} />
            </div>
          )}
          <div className="manifesto-hero__overlay" />
          <div className="manifesto-hero__content container">
            <p className="manifesto-hero__brand animate-fade-up">{manifesto?.heroBrand || 'Clan of DE'}</p>
            <h1 className="manifesto-hero__title animate-fade-up animate-delay-1">
              {manifesto?.heroTitle || 'Welcome to the Clan of DE 👋🏾'}
            </h1>
            <p className="manifesto-hero__tagline animate-fade-up animate-delay-2">
              {manifesto?.heroTagline || 'God × Health × Good Vibes'}
            </p>
          </div>
        </section>

        {/* Conversational Letter Container */}
        <div className="clan-letter-container container">
          {/* Greeting & Lead */}
          <section className="clan-intro-card">
            <div className="clan-greeting-badge">{manifesto?.introGreeting || 'Hi there! 😃'}</div>
            <p className="clan-intro-lead">
              {manifesto?.introLead || "So… you're here. Welcome to DE.\n\nYou're probably wondering, “What exactly is DE?”\n\nWell, it's pretty simple."}
            </p>
            <div className="clan-slogan-pill">
              <span>{manifesto?.slogan || 'God. Health. Good Vibes.'}</span>
            </div>
          </section>

          {/* Three Core Pillars Grid */}
          <section className="clan-pillars-section">
            <div className="clan-pillars-grid">
              {(manifesto?.pillars || []).map((pillar, idx) => (
                <article key={pillar.id || idx} className={`clan-pillar-card clan-pillar-card--${pillar.id || idx}`}>
                  <div className="clan-pillar-icon">{pillar.icon}</div>
                  <h2 className="clan-pillar-title">{pillar.title}</h2>
                  {pillar.subtitle && <h3 className="clan-pillar-subtitle">{pillar.subtitle}</h3>}
                  <div className="clan-pillar-body">
                    {pillar.body.split('\n\n').map((paragraph, pIdx) => (
                      <p key={pIdx}>{paragraph}</p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Community Closing Card */}
          <section className="clan-closing-card">
            <div className="clan-closing-content">
              {manifesto?.closingText ? (
                manifesto.closingText.split('\n\n').map((para, i) => (
                  <p key={i} className={i === 1 ? 'clan-closing-highlight' : ''}>
                    {para}
                  </p>
                ))
              ) : (
                <>
                  <p>So yeah…</p>
                  <p className="clan-closing-highlight">Welcome to the Clan of DE. 🖤</p>
                  <p>Grab a T-shirt. Wear it proudly. Start a conversation. Spread some goodness.</p>
                  <p>And who knows? Maybe you’ll find a little piece of yourself in DE.</p>
                </>
              )}
            </div>
          </section>

          {/* Anime Easter Egg Secret Section */}
          <section className="clan-easter-egg-card">
            <div className="clan-easter-egg-header">
              <span className="clan-easter-egg-badge">
                {manifesto?.animeEasterEgg?.badge || "👀 But wait… there's something you should know."}
              </span>
              <h3 className="clan-easter-egg-title">
                {manifesto?.animeEasterEgg?.heading || '“Clan of DE” has an anime reference.'}
              </h3>
            </div>

            <div className="clan-easter-egg-body">
              {manifesto?.animeEasterEgg?.text ? (
                manifesto.animeEasterEgg.text.split('\n\n').map((chunk, cIdx) => (
                  <p key={cIdx}>{chunk}</p>
                ))
              ) : (
                <>
                  <p>Yep. We hid one in there. 👀</p>
                  <p>Think you know which anime?</p>
                  <p>Send your guess to us on Instagram or drop us an email.</p>
                  <p>No cheating. 😂 Let’s see who catches it first.</p>
                </>
              )}
            </div>

            <div className="clan-easter-egg-actions">
              <a
                href="https://instagram.com/de_creatives_tees"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{ borderColor: 'var(--turquoise)', color: 'var(--turquoise)' }}
              >
                📸 Guess on Instagram
              </a>
              <a
                href="https://wa.me/233595515040?text=I%20have%20a%20guess%20for%20the%20DE%20Anime%20Reference!%20%F0%9F%91%80"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                💬 Tell Us on WhatsApp
              </a>
            </div>

            <div className="clan-easter-egg-footer">
              <p>{manifesto?.animeEasterEgg?.footerNote || 'Welcome to DE. God. Health. Good Vibes. Welcome to the clan.'}</p>
            </div>
          </section>

          {/* Explore Collection CTA */}
          <section className="manifesto-cta">
            <p className="manifesto-cta__sub">The Collection</p>
            <h3 style={{ fontFamily: 'var(--font-accent)', fontSize: 'clamp(1.3rem, 3.5vw, 1.9rem)', color: 'var(--turquoise)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0.5rem 0 1rem 0' }}>
              God × Health × GOOD vibes
            </h3>
            <p className="manifesto-cta__text">
              Garments rooted in culture. Crafted to be worn with purpose.
            </p>
            <Link to="/shop" className="btn btn-primary btn-lg" style={{ marginTop: 'var(--space-8)' }}>
              Explore Collection
            </Link>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
