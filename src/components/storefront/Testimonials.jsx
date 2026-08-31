import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './Testimonials.css';

function initials(name) {
  return (name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('');
}

function ReviewForm({ onDone }) {
  const { submitTestimonial } = useApp();
  const [form, setForm] = useState({ name: '', location: '', text: '', rating: 5 });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.text) return;
    setSubmitting(true);
    const ok = await submitTestimonial(form);
    setSubmitting(false);
    if (ok) {
      setForm({ name: '', location: '', text: '', rating: 5 });
      onDone?.();
    }
  };

  return (
    <form className="testimonials__form" onSubmit={handleSubmit} noValidate>
      <div className="testimonials__form-row">
        <div className="form-group">
          <label htmlFor="review-name" className="form-label">Your Name *</label>
          <input id="review-name" name="name" type="text" className="form-input" value={form.name} onChange={handleChange} required placeholder="Jane Doe" />
        </div>
        <div className="form-group">
          <label htmlFor="review-location" className="form-label">Location</label>
          <input id="review-location" name="location" type="text" className="form-input" value={form.location} onChange={handleChange} placeholder="Accra, Ghana" />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="review-rating" className="form-label">Rating</label>
        <select id="review-rating" name="rating" className="form-input" value={form.rating} onChange={handleChange}>
          {[5, 4, 3, 2, 1].map(n => (
            <option key={n} value={n}>{'★'.repeat(n)}{'☆'.repeat(5 - n)} ({n})</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="review-text" className="form-label">Your Experience *</label>
        <textarea id="review-text" name="text" className="form-input" rows="4" value={form.text} onChange={handleChange} required placeholder="Tell us what you thought..." style={{ resize: 'vertical', lineHeight: 1.6 }} />
      </div>

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
      <p className="testimonials__form-note">Reviews are checked before they go live, so yours won't appear immediately.</p>
    </form>
  );
}

export default function Testimonials() {
  const { testimonials } = useApp();
  const [showForm, setShowForm] = useState(false);

  return (
    <section className="testimonials" id="reviews" aria-label="Customer testimonials">
      <div className="container">
        <div className="testimonials__header">
          <p className="section-label" style={{ color: 'var(--turquoise)', letterSpacing: '0.15em', fontWeight: 600 }}>
            THE GOOD REPORT
          </p>
          <h2 className="section-heading" style={{ marginTop: '0.5rem' }}>
            TESTIMONIES & <span style={{ color: 'var(--turquoise)' }}>REVIEWS</span>
          </h2>
        </div>

        {testimonials.length > 0 ? (
          <div className="testimonials__grid">
            {testimonials.map((t, i) => (
              <article
                key={t.id || i}
                className="testimonials__card animate-fade-up"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="testimonials__stars">
                  {'★'.repeat(t.rating || 5)}
                </div>
                <blockquote className="testimonials__quote">"{t.text}"</blockquote>
                <footer className="testimonials__author">
                  {t.avatar ? (
                    <img src={t.avatar} alt={t.name} className="testimonials__avatar" loading="lazy" />
                  ) : (
                    <div className="testimonials__avatar testimonials__avatar--initials" aria-hidden="true">{initials(t.name)}</div>
                  )}
                  <div>
                    <p className="testimonials__name">{t.name}</p>
                    {t.location && <p className="testimonials__location">{t.location}</p>}
                  </div>
                </footer>
              </article>
            ))}
          </div>
        ) : (
          <div className="testimonials__empty">
            <p>No reports submitted yet — be the first to share your experience with the clan.</p>
          </div>
        )}

        <div className="testimonials__cta">
          {showForm ? (
            <ReviewForm onDone={() => setShowForm(false)} />
          ) : (
            <button className="btn btn-outline" onClick={() => setShowForm(true)}>
              ✦ Share a Good Report
            </button>
          )}
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
