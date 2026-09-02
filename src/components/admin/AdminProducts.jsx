import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './AdminOverview.css';
import './AdminInventory.css';

const emptyForm = {
  name: '', sku: '', price: '', comparePrice: '',
  category: '', categoryName: '',
  description: '', sizes: 'S, M, L, XL', stock: '',
  isNew: true, isFeatured: false, isBestseller: false,
  images: [], // ordered list of { url, file? } - file present only for not-yet-uploaded picks
  colorSwatches: [], // ordered list of { hex, name }
};

export default function AdminProducts() {
  const { products, categories, addProduct, updateProduct, deleteProduct, uploadProductImages, resetProductsToDefault, formatPrice } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Filters & sorting
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = products
    .filter(p => {
      const matchSearch = !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
      const matchCat = selectedCat === 'all' || p.category === selectedCat;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'stock-asc') return a.stock - b.stock;
      return 0;
    });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newImgs = files.map(file => ({ file, url: URL.createObjectURL(file) }));
    setForm(prev => ({ ...prev, images: [...prev.images, ...newImgs] }));
  };

  const removeImage = (index) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const moveImage = (index, direction) => {
    const newImages = [...form.images];
    const target = index + direction;
    if (target < 0 || target >= newImages.length) return;
    const temp = newImages[index];
    newImages[index] = newImages[target];
    newImages[target] = temp;
    setForm(prev => ({ ...prev, images: newImages }));
  };

  const updateColorSwatch = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      colorSwatches: prev.colorSwatches.map((c, i) => i === index ? { ...c, [field]: value } : c),
    }));
  };

  const addColorSwatch = () => {
    setForm(prev => ({ ...prev, colorSwatches: [...prev.colorSwatches, { hex: '#0A0A0A', name: '' }] }));
  };

  const removeColorSwatch = (index) => {
    setForm(prev => ({ ...prev, colorSwatches: prev.colorSwatches.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return;

    setUploading(true);
    try {
      // Separate existing URLs from new File objects that need uploading
      const existingUrls = form.images.filter(img => !img.file).map(img => img.url);
      const newFiles = form.images.filter(img => img.file).map(img => img.file);

      let newUrls = [];
      if (newFiles.length > 0) {
        newUrls = await uploadProductImages(newFiles);
      }

      const allImageUrls = [...existingUrls, ...newUrls];
      const namedSwatches = form.colorSwatches.filter(c => c.name.trim());

      const sizesArray = form.sizes
        ? form.sizes.split(',').map(s => s.trim()).filter(Boolean)
        : ['S', 'M', 'L', 'XL'];

      const payload = {
        name: form.name,
        sku: form.sku || undefined,
        price: parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
        category: form.category || 'cat-1',
        categoryName: categories.find(c => c.id === form.category)?.name || 'Uncategorized',
        stock: parseInt(form.stock) || 0,
        sizes: sizesArray,
        description: form.description,
        isNew: form.isNew,
        isFeatured: form.isFeatured,
        isBestseller: form.isBestseller,
        images: allImageUrls,
        colors: namedSwatches.map(c => c.hex),
        colorNames: namedSwatches.map(c => c.name.trim()),
      };

      if (editId) {
        await updateProduct(editId, payload);
      } else {
        await addProduct(payload);
      }

      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      setImageUrlInput('');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (product) => {
    const colors = product.colors || [];
    const colorNames = product.colorNames || [];
    setForm({
      name: product.name,
      sku: product.sku || '',
      price: product.price,
      comparePrice: product.comparePrice || '',
      category: product.category,
      stock: product.stock,
      sizes: (product.sizes || []).join(', '),
      description: product.description || '',
      isNew: product.isNew ?? false,
      isFeatured: product.isFeatured ?? false,
      isBestseller: product.isBestseller ?? false,
      images: (product.images || []).map(url => ({ file: null, url })),
      colorSwatches: colors.map((hex, i) => ({ hex, name: colorNames[i] || '' })),
    });
    setEditId(product.id);
    setShowForm(true);
    setImageUrlInput('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="admin-products">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Product Management</h1>
          <p className="admin-page-subtitle">{products.length} products in catalog</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {showResetConfirm ? (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reset all products?</span>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ color: '#ef4444', borderColor: '#ef4444' }}
                onClick={() => { resetProductsToDefault(); setShowResetConfirm(false); }}
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
              title="Restore original default products"
            >
              ↺ Reset to Defaults
            </button>
          )}
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
                <label className="form-label">Product Images</label>
                <div className="admin-upload-zone">
                  <input type="file" accept="image/*" multiple onChange={handleImagesChange} aria-label="Upload product images" />
                  <div className="admin-upload-zone__icon">📸</div>
                  <p className="admin-upload-zone__text">Click to upload or drag & drop</p>
                  <p className="admin-upload-zone__sub">PNG, JPG up to 10MB each &middot; first image is the cover shown in listings</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Or paste image URL (e.g. /products/... or https://...)"
                    value={imageUrlInput}
                    onChange={e => setImageUrlInput(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ whiteSpace: 'nowrap' }}
                    onClick={() => {
                      if (!imageUrlInput.trim()) return;
                      setForm(prev => ({
                        ...prev,
                        images: [...prev.images, { file: null, url: imageUrlInput.trim() }]
                      }));
                      setImageUrlInput('');
                    }}
                  >
                    + Add URL
                  </button>
                </div>

                {form.images.length > 0 && (
                  <div className="admin-image-list">
                    {form.images.map((img, i) => (
                      <div key={img.url} className="admin-image-list__item">
                        <img src={img.url} alt={`Product ${i + 1}`} className="admin-image-list__thumb" />
                        {i === 0 && <span className="badge badge-turquoise admin-image-list__cover-badge">Cover</span>}
                        <div className="admin-image-list__controls">
                          <button type="button" className="btn btn-outline btn-sm" onClick={() => moveImage(i, -1)} disabled={i === 0} aria-label="Move left">←</button>
                          <button type="button" className="btn btn-outline btn-sm" onClick={() => moveImage(i, 1)} disabled={i === form.images.length - 1} aria-label="Move right">→</button>
                          <button type="button" className="btn btn-outline btn-sm" style={{ color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)' }} onClick={() => removeImage(i)} aria-label="Remove image">✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="prod-name" className="form-label">Product Name *</label>
                <input id="prod-name" name="name" type="text" className="form-input" placeholder="e.g. Phantom Oversized Tee" value={form.name} onChange={handleChange} required aria-required="true" />
              </div>
              <div className="form-group">
                <label htmlFor="prod-sku" className="form-label">SKU</label>
                <input id="prod-sku" name="sku" type="text" className="form-input" placeholder="e.g. DE-SW-010" value={form.sku} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="prod-price" className="form-label">Price (GH₵) *</label>
                <input id="prod-price" name="price" type="number" min="0" step="0.01" className="form-input" placeholder="0.00" value={form.price} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="prod-compare" className="form-label">Compare Price (GH₵)</label>
                <input id="prod-compare" name="comparePrice" type="number" min="0" step="0.01" className="form-input" placeholder="0.00 (optional)" value={form.comparePrice} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="prod-cat" className="form-label">Category</label>
                <select id="prod-cat" name="category" className="form-input" value={form.category} onChange={handleChange}>
                  <option value="">Uncategorized</option>
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
                <label className="form-label">Color Options</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {form.colorSwatches.map((c, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="color"
                        value={c.hex}
                        onChange={(e) => updateColorSwatch(i, 'hex', e.target.value)}
                        aria-label={`Color swatch ${i + 1}`}
                        style={{ width: '40px', height: '38px', padding: '2px', background: 'none', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Phantom Black"
                        value={c.name}
                        onChange={(e) => updateColorSwatch(i, 'name', e.target.value)}
                        aria-label={`Color name ${i + 1}`}
                      />
                      <button type="button" className="btn btn-outline btn-sm" style={{ color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)', flexShrink: 0 }} onClick={() => removeColorSwatch(i)} aria-label={`Remove color ${i + 1}`}>✕</button>
                    </div>
                  ))}
                  <button type="button" className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start' }} onClick={addColorSwatch}>+ Add Color</button>
                </div>
                <small style={{ fontFamily: 'var(--font-accent)', fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                  Leave empty to use the default color. Shoppers pick one before adding to cart.
                </small>
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
              <button type="submit" className="btn btn-primary" disabled={uploading}>
                {uploading ? 'Saving...' : (editId ? 'Save Changes' : 'Add Product')}
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
                        <p style={{ fontFamily: 'var(--font-accent)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.sku} &middot; {(p.images || []).length} photo{(p.images || []).length === 1 ? '' : 's'}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-neutral">{p.categoryName}</span></td>
                  <td style={{ fontFamily: 'var(--font-accent)', fontWeight: 700, color: 'var(--white)' }}>
                    {formatPrice(p.price)}
                    {p.comparePrice && <del style={{ marginLeft: '6px', color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.8rem' }}>{formatPrice(p.comparePrice)}</del>}
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
