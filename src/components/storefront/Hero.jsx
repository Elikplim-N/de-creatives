import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './Hero.css';

export default function Hero() {
  const { products, testimonials, heroSlides: allSlides } = useApp();
  const heroSlides = allSlides.filter(s => s.isActive !== false);
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const t = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % heroSlides.length);
        setTransitioning(false);
      }, 400);
    }, 6000);
    return () => clearInterval(t);
  }, [heroSlides.length]);

  if (heroSlides.length === 0) {
    return (
      <section className="hero" id="hero" aria-label="Hero section">
        <div className="hero__bg hero__bg--active" style={{ background: '#09090b' }}>
          <div className="hero__overlay" style={{ background: 'radial-gradient(circle at center, rgba(37,99,235,0.18) 0%, #09090b 80%)' }} />
        </div>
        <div className="hero__content container">
          <div className="hero__text">
            <span className="hero__eyebrow">
              <span className="hero__eyebrow-dot" />
              DE CREATIVES — ACCRA
            </span>
            <h1 className="hero__heading">
              <span className="hero__heading-line">DEFINE YOUR</span>
              <span className="hero__heading-line hero__heading-accent">CREATIVE</span>
            </h1>
            <p className="hero__subheading">Premium streetwear engineered for the bold. Made in Africa, worn by the world.</p>
            <div className="hero__ctas">
              <Link to="/manifesto" className="btn btn-primary btn-lg hero__cta-primary">
                Explore Clan of DE
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const slide = heroSlides[current % heroSlides.length];

  return (
    <section className="hero" id="hero" aria-label="Hero section">
      {/* Background Images */}
      {heroSlides.map((s, i) => (
        <div
          key={s.id}
          className={`hero__bg${i === current ? ' hero__bg--active' : ''}`}
          aria-hidden="true"
        >
          <img src={s.image} alt="" loading={i === 0 ? 'eager' : 'lazy'} />
          <div className="hero__overlay" />
        </div>
      ))}

      {/* Slide Indicators */}
      <div className="hero__indicators" aria-label="Slide indicators">
        {heroSlides.map((s, i) => (
          <button
            key={s.id}
            className={`hero__indicator${i === current ? ' hero__indicator--active' : ''}`}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Content */}
      <div className={`hero__content container${transitioning ? ' hero__content--out' : ''}`}>
        <div className="hero__text">
          <span className="hero__eyebrow">
            <span className="hero__eyebrow-dot" />
            {slide.eyebrow}
          </span>
          <h1 className="hero__heading">
            {(slide.heading || '').split('\n').map((line, i) => (
              <span key={i} className="hero__heading-line">
                {i === 1 ? <span className="hero__heading-accent">{line}</span> : line}
              </span>
            ))}
          </h1>
          <p className="hero__subheading">{slide.subheading}</p>
          <div className="hero__ctas">
            <Link to="/shop" className="btn btn-primary btn-lg hero__cta-primary">
              {slide.cta}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <Link to="/manifesto" className="btn btn-ghost btn-lg hero__cta-secondary">
              {slide.ctaSecondary}
            </Link>
          </div>
        </div>

        {/* Stats Strip - real data only; rating/review counts stay hidden
            until there are actual approved reviews to back them. */}
        <div className="hero__stats">
          {[
            { value: `${products.length}+`, label: 'Products' },
            testimonials.length > 0 && {
              value: `${(testimonials.reduce((sum, t) => sum + (Number(t.rating) || 5), 0) / testimonials.length).toFixed(1)}★`,
              label: 'Avg Rating',
            },
            testimonials.length > 0 && { value: `${testimonials.length}`, label: 'Reviews' },
            { value: '24H', label: 'Fast Dispatch' },
          ].filter(Boolean).map((stat) => (
            <div key={stat.label} className="hero__stat">
              <span className="hero__stat-value">{stat.value}</span>
              <span className="hero__stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Hint */}
      <div className="hero__scroll" aria-label="Scroll down">
        <div className="hero__scroll-line" />
        <span className="hero__scroll-text">Scroll</span>
      </div>
    </section>
  );
}
