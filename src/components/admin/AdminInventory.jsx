import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './AdminOverview.css';

export default function AdminInventory() {
  const { products, updateProduct, formatPrice } = useApp();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filter, setFilter] = useState('all');

  const filtered = products
    .filter(p => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === 'all'
        || (filter === 'low' && p.stock <= 15)
        || (filter === 'out' && p.stock === 0)
        || (filter === 'ok' && p.stock > 15);
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'stock-asc') return a.stock - b.stock;
      if (sortBy === 'stock-desc') return b.stock - a.stock;
      if (sortBy === 'price') return b.price - a.price;
      return 0;
    });

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', cls: 'badge-danger' };
    if (stock <= 10) return { label: 'Critical', cls: 'badge-danger' };
    if (stock <= 20) return { label: 'Low Stock', cls: 'badge-warning' };
    return { label: 'In Stock', cls: 'badge-success' };
  };

  return (
    <div className="admin-inventory">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Inventory Tracker</h1>
          <p className="admin-page-subtitle">{products.length} products · {products.filter(p => p.stock <= 15).length} low stock alerts</p>
        </div>
      </div>

      {/* Controls */}
      <div className="admin-inventory__controls">
        <div className="admin-inventory__search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="admin-inventory__search-icon">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="search"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input admin-inventory__search"
            aria-label="Search inventory"
          />
        </div>

        <div className="admin-inventory__filters" role="group" aria-label="Filter inventory">
          {[
            { val: 'all', label: 'All' },
            { val: 'ok', label: 'In Stock' },
            { val: 'low', label: 'Low Stock' },
            { val: 'out', label: 'Out of Stock' },
          ].map(f => (
            <button
              key={f.val}
              className={`admin-filter-btn${filter === f.val ? ' admin-filter-btn--active' : ''}`}
              onClick={() => setFilter(f.val)}
              aria-pressed={filter === f.val}
            >
              {f.label}
            </button>
          ))}
        </div>

        <select
          className="form-input admin-inventory__sort"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          aria-label="Sort inventory"
        >
          <option value="name">Sort: Name A-Z</option>
          <option value="stock-asc">Sort: Stock Low-High</option>
          <option value="stock-desc">Sort: Stock High-Low</option>
          <option value="price">Sort: Price High-Low</option>
        </select>
      </div>

      {/* Table */}
      <div className="card admin-inventory__table-wrap">
        <div className="admin-inventory__table-scroll">
          <table className="data-table" aria-label="Inventory table">
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">SKU</th>
                <th scope="col">Category</th>
                <th scope="col">Price</th>
                <th scope="col">Stock Level</th>
                <th scope="col">Status</th>
                <th scope="col">Adjust</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const status = getStockStatus(p.stock);
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={(p.images && p.images[0]) || '/logo.png'} alt={p.name} style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '8px', background: 'var(--bg-elevated)', flexShrink: 0 }} loading="lazy" />
                        <span style={{ fontFamily: 'var(--font-accent)', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{p.name}</span>
                      </div>
                    </td>
                    <td><code style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-muted)', background: 'var(--white-05)', padding: '2px 8px', borderRadius: '4px' }}>{p.sku}</code></td>
                    <td><span className="badge badge-neutral">{p.categoryName}</span></td>
                    <td style={{ fontFamily: 'var(--font-accent)', fontWeight: 700, color: 'var(--white)' }}>{formatPrice(p.price)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="admin-inventory__stock-bar-wrap">
                          <div
                            className="admin-inventory__stock-bar"
                            style={{
                              width: `${Math.min(100, (p.stock / 200) * 100)}%`,
                              background: p.stock <= 10 ? 'var(--danger)' : p.stock <= 20 ? 'var(--warning)' : 'var(--turquoise)'
                            }}
                          />
                        </div>
                        <span style={{ fontFamily: 'var(--font-accent)', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600, minWidth: '40px' }}>{p.stock}</span>
                      </div>
                    </td>
                    <td><span className={`badge ${status.cls}`}>{status.label}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => updateProduct(p.id, { stock: Math.max(0, p.stock - 10) })}
                          aria-label={`Decrease stock for ${p.name}`}
                        >−10</button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => updateProduct(p.id, { stock: p.stock + 10 })}
                          aria-label={`Increase stock for ${p.name}`}
                        >+10</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', fontFamily: 'var(--font-accent)' }}>
                    No products match your filters.
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
