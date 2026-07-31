import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './AdminOverview.css';
import './AdminInventory.css';

const emptyForm = { name: '', slug: '', description: '', image: '' };

export default function AdminCategories() {
  const { categories, products, addCategory, updateCategory, deleteCategory, uploadProductImages } = useApp();
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'name' && !editId ? { slug: value.toLowerCase().replace(/\s+/g, '-') } : {}),
    }));
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
    if (!form.name) return;

    setUploading(true);
    try {
      let image = form.image;
      if (imageFile) {
        const [uploadedUrl] = await uploadProductImages([imageFile]);
        image = uploadedUrl;
      }
      const payload = { ...form, image };
      if (editId) {
        await updateCategory(editId, payload);
      } else {
        await addCategory(payload);
      }
      resetForm();
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (cat) => {
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', image: cat.image || '' });
    setImageFile(null);
    setEditId(cat.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="admin-categories">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Categories</h1>
          <p className="admin-page-subtitle">{categories.length} categories</p>
        </div>
      </div>

      <div className="admin-categories__layout">
        {/* Add/Edit Category Form */}
        <div className="card">
          <div className="admin-section-header">
            <h2 className="admin-section-title">{editId ? 'Edit Category' : 'Add New Category'}</h2>
            {editId && <span className="badge badge-turquoise">Editing</span>}
          </div>
          <form className="admin-add-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Cover Image</label>
              <div className="admin-upload-zone">
                <input type="file" accept="image/*" onChange={handleImageChange} aria-label="Upload category image" />
                {form.image ? (
                  <img src={form.image} alt="Preview" className="admin-upload-preview" />
                ) : (
                  <>
                    <div className="admin-upload-zone__icon">🖼️</div>
                    <p className="admin-upload-zone__text">Click to upload or drag & drop</p>
                    <p className="admin-upload-zone__sub">Shown on the homepage editorial banner</p>
                  </>
                )}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="cat-name" className="form-label">Category Name *</label>
              <input
                id="cat-name"
                name="name"
                type="text"
                className="form-input"
                placeholder="e.g. Activewear"
                value={form.name}
                onChange={handleChange}
                required
                aria-required="true"
              />
            </div>
            <div className="form-group">
              <label htmlFor="cat-slug" className="form-label">Slug (auto-generated)</label>
              <input
                id="cat-slug"
                name="slug"
                type="text"
                className="form-input"
                placeholder="activewear"
                value={form.slug}
                onChange={handleChange}
                aria-describedby="slug-hint"
              />
              <small id="slug-hint" style={{ fontFamily: 'var(--font-accent)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Used in URLs. Lowercase, no spaces.
              </small>
            </div>
            <div className="form-group">
              <label htmlFor="cat-desc" className="form-label">Description</label>
              <textarea
                id="cat-desc"
                name="description"
                className="form-input"
                rows="3"
                placeholder="Describe this category..."
                value={form.description}
                onChange={handleChange}
                style={{ resize: 'vertical', lineHeight: '1.6' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button type="submit" className="btn btn-primary" disabled={uploading}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                {uploading ? 'Saving...' : (editId ? 'Save Changes' : 'Add Category')}
              </button>
              {editId && (
                <button type="button" className="btn btn-outline" onClick={resetForm}>Cancel</button>
              )}
            </div>
          </form>
        </div>

        {/* Categories List */}
        <div className="card">
          <div className="admin-section-header">
            <h2 className="admin-section-title">All Categories</h2>
            <span className="badge badge-neutral">{categories.length} total</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {categories.map((cat, i) => (
              <div
                key={cat.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-4) 0',
                  borderBottom: i < categories.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  gap: 'var(--space-3)',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0 }} />
                    ) : (
                      <div style={{
                        width: '36px', height: '36px',
                        background: 'var(--turquoise-muted)',
                        border: '1px solid rgba(0,200,200,0.2)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--turquoise)" strokeWidth="2">
                          <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                          <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
                          <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                        </svg>
                      </div>
                    )}
                    <div>
                      <p style={{ fontFamily: 'var(--font-accent)', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{cat.name}</p>
                      <p style={{ fontFamily: 'var(--font-accent)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        /{cat.slug} · {products.filter(p => p.category === cat.id).length} items
                      </p>
                    </div>
                  </div>
                  {cat.description && (
                    <p style={{ fontFamily: 'var(--font-accent)', fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px', marginLeft: '52px' }}>
                      {cat.description}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => handleEdit(cat)}
                    aria-label={`Edit category ${cat.name}`}
                  >
                    Edit
                  </button>
                  {confirmDelete === cat.id ? (
                    <>
                      <button className="btn btn-danger btn-sm" onClick={() => { deleteCategory(cat.id); setConfirmDelete(null); }}>Confirm</button>
                      <button className="btn btn-outline btn-sm" onClick={() => setConfirmDelete(null)}>Cancel</button>
                    </>
                  ) : (
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)' }}
                      onClick={() => setConfirmDelete(cat.id)}
                      aria-label={`Delete category ${cat.name}`}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
