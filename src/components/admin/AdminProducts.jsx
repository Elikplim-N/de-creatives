import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './AdminOverview.css';
import './AdminInventory.css';

const emptyForm = {
  name: '', sku: '', price: '', comparePrice: '',
  category: 'cat-1', categoryName: 'Streetwear',
  description: '', sizes: 'S, M, L, XL', stock: '',
  isNew: true, isFeatured: false, isBestseller: false,
  imagePreview: null,
};

export default function AdminProducts() {
  const { products, categories, addProduct, deleteProduct, updateProduct } = useApp();
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm(prev => ({ ...prev, imagePreview: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return;
    const cat = categories.find(c => c.id === form.category);
    const payload = {
      ...form,
      price: parseFloat(form.price),
      comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
      stock: parseInt(form.stock) || 0,
      sizes: form.sizes.split(',').map(s => s.trim()).filter(Boolean),
      categoryName: cat?.name || 'Streetwear',
    };
    if (editId) {
      updateProduct(editId, payload);
      setEditId(null);
    } else {
      addProduct(payload);
    }
    setForm(emptyForm);
    setShowForm(false);
  };

  const handleEdit = (product) => {
    setForm({
      ...emptyForm,
      ...product,
      price: (product.price || 0).toString(),
      comparePrice: product.comparePrice?.toString() || '',
      stock: (product.stock || 0).toString(),
      sizes: (product.sizes || []).join(', '),
    });
    setEditId(product.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="admin-products">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Product Management</h1>
          <p className="admin-page-subtitle">{products.length} products in catalog</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(v => !v); setEditId(null); setForm(emptyForm); }}>
          {showForm ? 'Cancel' : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Product
            </>
          )}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card" style={{ animation: 'fadeSlideUp 0.3s both' }}>
          <div className="admin-section-header">
            <h2 className="admin-section-title">{editId ? 'Edit Product' : 'Add New Product'}</h2>
            {editId && <span className="badge badge-turquoise">Editing</span>}
          </div>
          <form className="admin-add-form" onSubmit={handleSubmit} noValidate>
            <div className="admin-add-form__grid">
              {/* Image Upload */}
              <div className="form-group admin-add-form__full">
                <label className="form-label">Product Image</label>
                <div className="admin-upload-zone">
                  <input type="file" accept="image/*" onChange={handleImageChange} aria-label="Upload product image" />
                  {form.imagePreview ? (
                    <img src={form.imagePreview} alt="Preview" className="admin-upload-preview" />
                  ) : (
                    <>
                      <div className="admin-upload-zone__icon">📸</div>
                      <p className="admin-upload-zone__text">Click to upload or drag & drop</p>
                      <p className="admin-upload-zone__sub">PNG, JPG up to 10MB</p>
                    </>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="prod-name" className="form-label">Product Name *</label>
                <input id="prod-name" name="name" type="text" className="form-input" placeholder="e.g. Phantom Oversized Tee" value={form.name} onChange={handleChange} required aria-required="true" />
              </div>
              <div className="form-group">
                <label htmlFor="prod-sku" className="form-label">SKU</label>
                <input id="prod-sku" name="sku" type="text" className="form-input" placeholder="e.g. DC-SW-010" value={form.sku} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="prod-price" className="form-label">Price (USD) *</label>
                <input id="prod-price" name="price" type="number" min="0" step="0.01" className="form-input" placeholder="0.00" value={form.price} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="prod-compare" className="form-label">Compare Price (USD)</label>
                <input id="prod-compare" name="comparePrice" type="number" min="0" step="0.01" className="form-input" placeholder="0.00 (optional)" value={form.comparePrice} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="prod-cat" className="form-label">Category</label>
                <select id="prod-cat" name="category" className="form-input" value={form.category} onChange={handleChange}>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="prod-stock" className="form-label">Initial Stock</label>
                <input id="prod-stock" name="stock" type="number" min="0" className="form-input" placeholder="0" value={form.stock} onChange={handleChange} />
              </div>
              <div className="form-group admin-add-form__full">
                <label htmlFor="prod-sizes" className="form-label">Sizes (comma separated)</label>
                <input id="prod-sizes" name="sizes" type="text" className="form-input" placeholder="XS, S, M, L, XL, XXL" value={form.sizes} onChange={handleChange} />
              </div>
              <div className="form-group admin-add-form__full">
                <label htmlFor="prod-desc" className="form-label">Description</label>
                <textarea id="prod-desc" name="description" className="form-input" rows="3" style={{ resize: 'vertical', lineHeight: '1.6' }} placeholder="Product description..." value={form.description} onChange={handleChange} />
              </div>

              {/* Flags */}
              <div className="admin-add-form__full" style={{ display: 'flex', gap: 'var(--space-6)' }}>
                {[
                  { name: 'isNew', label: 'New Arrival' },
                  { name: 'isFeatured', label: 'Featured' },
                  { name: 'isBestseller', label: 'Bestseller' },
                ].map(flag => (
                  <label key={flag.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontFamily: 'var(--font-accent)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <input
                      type="checkbox"
                      name={flag.name}
                      checked={!!form[flag.name]}
                      onChange={handleChange}
                      style={{ accentColor: 'var(--turquoise)', width: '16px', height: '16px' }}
                    />
                    {flag.label}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', paddingTop: 'var(--space-2)' }}>
              <button type="submit" className="btn btn-primary">
                {editId ? 'Save Changes' : 'Add Product'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      <div className="admin-inventory__controls">
        <div className="admin-inventory__search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="admin-inventory__search-icon">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input admin-inventory__search"
            aria-label="Search products"
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="admin-inventory__table-scroll">
          <table className="data-table" aria-label="Products table">
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">Category</th>
                <th scope="col">Price</th>
                <th scope="col">Stock</th>
                <th scope="col">Badges</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={(p.images && p.images[0]) || '/logo.png'} alt={p.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} loading="lazy" />
                      <div>
                        <p style={{ fontFamily: 'var(--font-accent)', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{p.name}</p>
                        <p style={{ fontFamily: 'var(--font-accent)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-neutral">{p.categoryName}</span></td>
                  <td style={{ fontFamily: 'var(--font-accent)', fontWeight: 700, color: 'var(--white)' }}>
                    ${p.price.toFixed(2)}
                    {p.comparePrice && <del style={{ marginLeft: '6px', color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.8rem' }}>${p.comparePrice.toFixed(2)}</del>}
                  </td>
                  <td style={{ fontFamily: 'var(--font-accent)', fontSize: '0.875rem', color: p.stock <= 15 ? 'var(--warning)' : 'var(--text-secondary)' }}>
                    {p.stock} units
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {p.isNew && <span className="badge badge-turquoise">New</span>}
                      {p.isFeatured && <span className="badge badge-success">Featured</span>}
                      {p.isBestseller && <span className="badge badge-neutral">Best</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => handleEdit(p)} aria-label={`Edit ${p.name}`}>Edit</button>
                      {confirmDelete === p.id ? (
                        <>
                          <button className="btn btn-danger btn-sm" onClick={() => { deleteProduct(p.id); setConfirmDelete(null); }}>Confirm</button>
                          <button className="btn btn-outline btn-sm" onClick={() => setConfirmDelete(null)}>Cancel</button>
                        </>
                      ) : (
                        <button className="btn btn-outline btn-sm" style={{ color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)' }} onClick={() => setConfirmDelete(p.id)} aria-label={`Delete ${p.name}`}>Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', fontFamily: 'var(--font-accent)' }}>
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
