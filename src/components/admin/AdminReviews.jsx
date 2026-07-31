import { useApp } from '../../context/AppContext';
import './AdminOverview.css';

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
        <span style={{ color: 'var(--turquoise)', fontFamily: 'var(--font-accent)', fontWeight: 700 }}>{'★'.repeat(t.rating)}</span>
      </div>
      <p style={{ fontFamily: 'var(--font-accent)', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>"{t.text}"</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)' }}>
        <span style={{ fontFamily: 'var(--font-accent)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{timeAgo(t.created_at)}</span>
        <div style={{ display: 'flex', gap: '6px' }}>{children}</div>
      </div>
    </div>
  );
}

export default function AdminReviews() {
  const { pendingTestimonials, testimonials, approveTestimonial, rejectTestimonial } = useApp();

  return (
    <div className="admin-reviews">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Reviews</h1>
          <p className="admin-page-subtitle">{pendingTestimonials.length} pending &middot; {testimonials.length} live</p>
        </div>
      </div>

      <div className="admin-section-header">
        <h2 className="admin-section-title">Pending Approval</h2>
        {pendingTestimonials.length > 0 && <span className="badge badge-warning">{pendingTestimonials.length}</span>}
      </div>
      {pendingTestimonials.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-accent)', padding: '16px 0 32px' }}>
          Nothing waiting on review right now.
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-10)' }}>
          {pendingTestimonials.map(t => (
            <ReviewCard key={t.id} t={t}>
              <button className="btn btn-primary btn-sm" onClick={() => approveTestimonial(t.id)}>Approve</button>
              <button className="btn btn-outline btn-sm" style={{ color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)' }} onClick={() => rejectTestimonial(t.id)}>Reject</button>
            </ReviewCard>
          ))}
        </div>
      )}

      <div className="admin-section-header">
        <h2 className="admin-section-title">Live on Storefront</h2>
      </div>
      {testimonials.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-accent)', padding: '16px 0' }}>
          No approved reviews yet.
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          {testimonials.map(t => (
            <ReviewCard key={t.id} t={t}>
              <button className="btn btn-outline btn-sm" style={{ color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)' }} onClick={() => rejectTestimonial(t.id)}>Remove</button>
            </ReviewCard>
          ))}
        </div>
      )}
    </div>
  );
}
