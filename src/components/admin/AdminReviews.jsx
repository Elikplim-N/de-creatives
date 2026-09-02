import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './AdminOverview.css';
import './AdminInventory.css';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  if (Number.isNaN(diffMs)) return '';
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function ReviewCard({ t, children }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-accent)', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{t.name}</p>
          {t.location && <p style={{ fontFamily: 'var(--font-accent)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.location}</p>}
        </div>
        <span style={{ color: 'var(--turquoise)', fontFamily: 'var(--font-accent)', fontWeight: 700 }}>{'★'.repeat(t.rating || 5)}</span>
      </div>
      <p style={{ fontFamily: 'var(--font-accent)', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>"{t.text}"</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'auto', paddingTop: '8px' }}>
        <span style={{ fontFamily: 'var(--font-accent)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{timeAgo(t.created_at)}</span>
        <div style={{ display: 'flex', gap: '6px' }}>{children}</div>
      </div>
    </div>
  );
}

export default function AdminReviews() {
  const { pendingTestimonials, testimonials, approveTestimonial, rejectTestimonial, resetTestimonials, submitTestimonial } = useApp();
  const [confirmId, setConfirmId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', location: 'Accra, Ghana', text: '', rating: 5 });

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!newReview.name || !newReview.text) return;
    await submitTestimonial(newReview);
    setNewReview({ name: '', location: 'Accra, Ghana', text: '', rating: 5 });
    setShowAddForm(false);
  };

  return (
    <div className="admin-reviews">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Reviews & Good Report</h1>
          <p className="admin-page-subtitle">{pendingTestimonials.length} pending &middot; {testimonials.length} live on storefront</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={resetTestimonials}
            title="Reset reviews to default curated list"
          >
            Reset to Defaults
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setShowAddForm(v => !v)}
          >
            {showAddForm ? '✕ Close Form' : '➕ Add Review'}
          </button>
        </div>
      </div>

      {/* Optional Manual Review Add Form */}
      {showAddForm && (
        <div className="admin-card" style={{ marginBottom: '24px' }}>
          <h2 className="admin-card__title" style={{ fontSize: '1rem', marginBottom: '14px' }}>Add Customer Review</h2>
          <form onSubmit={handleAddReview} className="admin-form">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="rev-name">Customer Name *</label>
                <input
                  id="rev-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Kwame A."
                  value={newReview.name}
                  onChange={e => setNewReview({ ...newReview, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="rev-loc">Location</label>
                <input
                  id="rev-loc"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Accra, Ghana"
                  value={newReview.location}
                  onChange={e => setNewReview({ ...newReview, location: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="rev-rating">Rating (1 to 5 Stars)</label>
                <select
                  id="rev-rating"
                  className="form-input"
                  value={newReview.rating}
                  onChange={e => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                >
                  <option value={5}>★★★★★ (5 Stars)</option>
                  <option value={4}>★★★★☆ (4 Stars)</option>
                  <option value={3}>★★★☆☆ (3 Stars)</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '12px' }}>
              <label className="form-label" htmlFor="rev-text">Review Text *</label>
              <textarea
                id="rev-text"
                rows={3}
                className="form-input"
                placeholder="The quality is unreal — investment-grade pieces!"
                value={newReview.text}
                onChange={e => setNewReview({ ...newReview, text: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>
              Submit Review
            </button>
          </form>
        </div>
      )}

      {/* Pending Reviews */}
      <div className="admin-section-header">
        <h2 className="admin-section-title">Pending Moderation</h2>
        {pendingTestimonials.length > 0 && <span className="badge badge-warning">{pendingTestimonials.length}</span>}
      </div>
      {pendingTestimonials.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-accent)', padding: '12px 0 24px' }}>
          No pending reviews waiting on moderation.
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-10)' }}>
          {pendingTestimonials.map(t => (
            <ReviewCard key={t.id} t={t}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => approveTestimonial(t.id)}
              >
                Approve
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)' }}
                onClick={() => rejectTestimonial(t.id)}
              >
                Reject
              </button>
            </ReviewCard>
          ))}
        </div>
      )}

      {/* Live Reviews */}
      <div className="admin-section-header">
        <h2 className="admin-section-title">Live on Storefront ({testimonials.length})</h2>
      </div>
      {testimonials.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-accent)', padding: '16px 0' }}>
          No live reviews on the storefront.
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          {testimonials.map(t => (
            <ReviewCard key={t.id} t={t}>
              {confirmId === t.id ? (
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                    onClick={() => {
                      rejectTestimonial(t.id);
                      setConfirmId(null);
                    }}
                  >
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                    onClick={() => setConfirmId(null)}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)' }}
                  onClick={() => setConfirmId(t.id)}
                >
                  Remove
                </button>
              )}
            </ReviewCard>
          ))}
        </div>
      )}
    </div>
  );
}
