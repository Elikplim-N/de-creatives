import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './AdminOverview.css';
import './AdminInventory.css';

const emptyPhoto = {
  src: '',
  title: '',
  category: 'Lookbook Edition',
  tag: 'God × Health × GOOD vibes'
};

export default function AdminGallery() {
  const { galleryPhotos, addGalleryPhoto, updateGalleryPhoto, deleteGalleryPhoto, resetGalleryPhotos, uploadProductImages } = useApp();
  const [form, setForm] = useState(emptyPhoto);
  const [editId, setEditId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setForm(prev => ({ ...prev, src: URL.createObjectURL(file) }));
  };

  const resetForm = () => {
    setForm(emptyPhoto);
    setEditId(null);
    setImageFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.src && !imageFile) return;

    setUploading(true);
    try {
      let src = form.src;
      if (imageFile && uploadProductImages) {
        try {
          const [uploadedUrl] = await uploadProductImages([imageFile]);
          if (uploadedUrl) src = uploadedUrl;
        } catch (err) {
          console.warn('Storage upload fallback to local URL:', err);
        }
      }

      const payload = {
        ...form,
        src: src || '/products/tee-black-girl-palm.jpg'
      };

      if (editId) {
        updateGalleryPhoto(editId, payload);
      } else {
        addGalleryPhoto(payload);
      }
      resetForm();
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (photo) => {
    setForm({
      src: photo.src || '',
      title: photo.title || '',
      category: photo.category || '',
      tag: photo.tag || ''
    });
    setEditId(photo.id);
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="admin-categories">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">The Gallery of DE</h1>
          <p className="admin-page-subtitle">{galleryPhotos?.length || 0} curated lookbook photos</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={resetGalleryPhotos}
            title="Reset gallery photos to default"
          >
            Reset to Defaults
          </button>
        </div>
      </div>

      {/* Add / Edit Form Card */}
      <div className="admin-card" style={{ marginBottom: '24px' }}>
        <h2 className="admin-card__title" style={{ fontSize: '1rem', marginBottom: '16px' }}>
          {editId ? '✏️ Edit Gallery Photo' : '➕ Add Photo to The Gallery of DE'}
        </h2>

        <form onSubmit={handleSubmit} className="admin-form">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="photo-title">Photo Title *</label>
              <input
                id="photo-title"
                name="title"
                type="text"
                className="form-input"
                placeholder="e.g. DE Signature Streetwear"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="photo-category">Category / Series</label>
              <input
                id="photo-category"
                name="category"
                type="text"
                className="form-input"
                placeholder="e.g. Lookbook Drop 01, Limited Edition"
                value={form.category}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="photo-tag">Tag / Badge</label>
              <input
                id="photo-tag"
                name="tag"
                type="text"
                className="form-input"
                placeholder="e.g. God × Health × GOOD vibes"
                value={form.tag}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '14px' }}>
            <div className="form-group">
              <label className="form-label">Upload Image File</label>
              <input
                type="file"
                accept="image/*"
                className="form-input"
                onChange={handleImageChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="photo-src">Or Image URL / Path</label>
              <input
                id="photo-src"
                name="src"
                type="text"
                className="form-input"
                placeholder="/products/tee-black-girl-palm.jpg or https://..."
                value={form.src}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Image Preview */}
          {form.src && (
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <img
                src={form.src}
                alt="Preview"
                style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Image Preview</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" className="btn btn-primary" disabled={uploading}>
              {uploading ? 'Saving...' : editId ? 'Save Photo Changes' : 'Add to Gallery'}
            </button>
            {editId && (
              <button type="button" className="btn btn-outline" onClick={resetForm}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Gallery Grid List */}
      <div className="admin-card">
        <h2 className="admin-card__title" style={{ fontSize: '1rem', marginBottom: '16px' }}>
          Current Gallery Items ({galleryPhotos?.length || 0})
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {(galleryPhotos || []).map((photo) => (
            <div
              key={photo.id}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
                <img
                  src={photo.src}
                  alt={photo.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    background: 'rgba(0,0,0,0.7)',
                    color: 'var(--turquoise)',
                    fontSize: '0.68rem',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontWeight: 600
                  }}
                >
                  {photo.tag}
                </span>
              </div>

              <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '0.92rem', color: 'var(--white)', fontFamily: 'var(--font-accent)' }}>
                    {photo.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {photo.category}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ flex: 1, padding: '4px 8px', fontSize: '0.75rem' }}
                    onClick={() => handleEdit(photo)}
                  >
                    Edit
                  </button>

                  {confirmDelete === photo.id ? (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        onClick={() => {
                          deleteGalleryPhoto(photo.id);
                          setConfirmDelete(null);
                        }}
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        onClick={() => setConfirmDelete(null)}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#ff6b6b', borderColor: 'rgba(255,107,107,0.3)' }}
                      onClick={() => setConfirmDelete(photo.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
