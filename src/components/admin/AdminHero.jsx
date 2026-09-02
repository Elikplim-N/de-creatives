import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './AdminOverview.css';
import './AdminInventory.css';

const emptyForm = { eyebrow: '', heading: '', subheading: '', cta: '', ctaSecondary: '', image: '', isActive: true };

export default function AdminHero() {
  const { heroSlides, addHeroSlide, updateHeroSlide, deleteHeroSlide, reorderHeroSlide, uploadProductImages, resetHeroSlidesToDefault } = useApp();
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setForm(prev => ({ ...prev, image: URL.createObjectURL(file) }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
    setImageFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.heading) return;

    setUploading(true);
    try {
      let image = form.image;
      if (imageFile) {
        const [uploadedUrl] = await uploadProductImages([imageFile]);
        image = uploadedUrl;
      }
      const payload = { ...form, image };
      if (editId) {
        await updateHeroSlide(editId, payload);
      } else {
        await addHeroSlide(payload);
      }
      resetForm();
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (slide) => {
    setForm({
      eyebrow: slide.eyebrow || '',
      heading: slide.heading || '',
      subheading: slide.subheading || '',
      cta: slide.cta || '',
      ctaSecondary: slide.ctaSecondary || '',
      image: slide.image || '',
      isActive: slide.isActive ?? true,
    });
    setImageFile(null);
    setEditId(slide.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="admin-categories">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Homepage</h1>
          <p className="admin-page-subtitle">{heroSlides.length} hero slides</p>
        </div>
        <div>
          {showResetConfirm ? (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reset all slides?</span>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ color: '#ef4444', borderColor: '#ef4444' }}
                onClick={() => { resetHeroSlidesToDefault(); setShowResetConfirm(false); }}
              >
                Confirm Reset
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setShowResetConfirm(false)}
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setShowResetConfirm(true)}
              title="Restore original default hero slides"
            >
              ↺ Reset to Defaults
            </button>
          )}
        </div>
      </div>

      <div className="admin-categories__layout">
        {/* Add/Edit Slide Form */}
        <div className="card">
          <div className="admin-section-header">
            <h2 className="admin-section-title">{editId ? 'Edit Slide' : 'Add New Slide'}</h2>
            {editId && <span className="badge badge-turquoise">Editing</span>}
          </div>
          <form className="admin-add-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Background Image</label>
              <div className="admin-upload-zone">
                <input type="file" accept="image/*" onChange={handleImageChange} aria-label="Upload hero slide image" />
                {form.image ? (
                  <img src={form.image} alt="Preview" className="admin-upload-preview" />
                ) : (
                  <>
                    <div className="admin-upload-zone__icon">🖼️</div>
                    <p className="admin-upload-zone__text">Click to upload or drag & drop</p>
                    <p className="admin-upload-zone__sub">Full-bleed background for this slide</p>
                  </>
                )}
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  name="image"
                  placeholder="Or paste image URL (e.g. /products/... or https://...)"
                  value={form.image}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="hero-eyebrow" className="form-label">Eyebrow</label>
              <input
                id="hero-eyebrow" name="eyebrow" type="text" className="form-input"
                placeholder="e.g. New Arrival — SS26" value={form.eyebrow} onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="hero-heading" className="form-label">Heading *</label>
              <textarea
                id="hero-heading" name="heading" className="form-input" rows="2"
                placeholder={'e.g. DEFINE YOUR\nCREATIVE'} value={form.heading} onChange={handleChange}
                style={{ resize: 'vertical', lineHeight: '1.6' }}
                required aria-required="true"
              />
              <small style={{ fontFamily: 'var(--font-accent)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Use a line break to split the heading across two lines.
              </small>
            </div>
            <div className="form-group">
              <label htmlFor="hero-subheading" className="form-label">Subheading</label>
              <textarea
                id="hero-subheading" name="subheading" className="form-input" rows="2"
                placeholder="Short supporting line shown under the heading..." value={form.subheading} onChange={handleChange}
                style={{ resize: 'vertical', lineHeight: '1.6' }}
              />
            </div>
            <div className="form-group">
              <label htmlFor="hero-cta" className="form-label">Primary Button Text</label>
              <input id="hero-cta" name="cta" type="text" className="form-input" placeholder="Shop Collection" value={form.cta} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="hero-cta-secondary" className="form-label">Secondary Button Text</label>
              <input id="hero-cta-secondary" name="ctaSecondary" type="text" className="form-input" placeholder="Explore Lookbook" value={form.ctaSecondary} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontFamily: 'var(--font-accent)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange}
                  style={{ accentColor: 'var(--turquoise)', width: '16px', height: '16px' }}
                />
                Show on homepage
              </label>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button type="submit" className="btn btn-primary" disabled={uploading}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                {uploading ? 'Saving...' : (editId ? 'Save Changes' : 'Add Slide')}
              </button>
              {editId && (
                <button type="button" className="btn btn-outline" onClick={resetForm}>Cancel</button>
              )}
            </div>
          </form>
        </div>

        {/* Slides List */}
        <div className="card">
          <div className="admin-section-header">
            <h2 className="admin-section-title">All Slides</h2>
            <span className="badge badge-neutral">{heroSlides.length} total</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {heroSlides.map((slide, i) => (
              <div
                key={slide.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-4) 0',
                  borderBottom: i < heroSlides.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  gap: 'var(--space-3)',
                }}
              >
                <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  {slide.image ? (
                    <img src={slide.image} alt={slide.heading} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: '48px', height: '48px', background: 'var(--turquoise-muted)', borderRadius: 'var(--radius-md)', flexShrink: 0 }} />
                  )}
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontFamily: 'var(--font-accent)', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                      {(slide.heading || '').split('\n').join(' ')}
                      {slide.isActive === false && <span className="badge badge-neutral" style={{ marginLeft: '8px' }}>Hidden</span>}
                    </p>
                    <p style={{ fontFamily: 'var(--font-accent)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{slide.eyebrow}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => reorderHeroSlide(slide.id, -1)} disabled={i === 0} aria-label="Move up">↑</button>
                  <button className="btn btn-outline btn-sm" onClick={() => reorderHeroSlide(slide.id, 1)} disabled={i === heroSlides.length - 1} aria-label="Move down">↓</button>
                  <button className="btn btn-outline btn-sm" onClick={() => handleEdit(slide)} aria-label={`Edit slide ${slide.heading}`}>Edit</button>
                  {confirmDelete === slide.id ? (
                    <>
                      <button className="btn btn-danger btn-sm" onClick={() => { deleteHeroSlide(slide.id); setConfirmDelete(null); }}>Confirm</button>
                      <button className="btn btn-outline btn-sm" onClick={() => setConfirmDelete(null)}>Cancel</button>
                    </>
                  ) : (
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)' }}
                      onClick={() => setConfirmDelete(slide.id)}
                      aria-label={`Delete slide ${slide.heading}`}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
            {heroSlides.length === 0 && (
              <p style={{ fontFamily: 'var(--font-accent)', fontSize: '0.875rem', color: 'var(--text-muted)', padding: 'var(--space-4) 0' }}>
                No slides yet - add one to populate the homepage hero.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
