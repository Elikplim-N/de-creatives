import { testimonials } from '../../data/mockData';
import './Testimonials.css';

export default function Testimonials() {
  return (
    <section className="testimonials" id="reviews" aria-label="Customer testimonials">
      <div className="container">
        <div className="testimonials__header">
          <p className="section-label">Social Proof</p>
          <h2 className="section-heading" style={{ marginTop: '0.5rem' }}>
            WHAT THEY <span style={{ color: 'var(--turquoise)' }}>SAY</span>
          </h2>
        </div>
        <div className="testimonials__grid">
          {testimonials.map((t, i) => (
            <article
              key={t.id}
              className="testimonials__card animate-fade-up"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <div className="testimonials__stars">
                {'★'.repeat(t.rating)}
              </div>
              <blockquote className="testimonials__quote">"{t.text}"</blockquote>
              <footer className="testimonials__author">
                <img src={t.avatar} alt={t.name} className="testimonials__avatar" loading="lazy" />
                <div>
                  <p className="testimonials__name">{t.name}</p>
                  <p className="testimonials__location">{t.location}</p>
                </div>
              </footer>
            </article>
          ))}
        </div>

        {/* Brand Marquee */}
        <div className="testimonials__marquee" aria-hidden="true">
          <div className="testimonials__marquee-track">
            {['Premium Quality', 'Fast Delivery', 'Limited Drops', 'Premium Quality', 'Fast Delivery', 'Limited Drops', 'Premium Quality', 'Fast Delivery', 'Limited Drops'].map((t, i) => (
              <span key={i} className="testimonials__marquee-item">
                {t}
                <span className="testimonials__marquee-dot">◆</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
