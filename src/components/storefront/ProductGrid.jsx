import { useApp } from '../../context/AppContext';
import ProductCard from './ProductCard';
import './ProductGrid.css';

export default function ProductGrid() {
  const { products, categories, filteredProducts, activeCategory, setActiveCategory, searchQuery, setSearchQuery } = useApp();

  return (
    <section className="product-grid-section" id="products" aria-label="Products">
      <div className="container">
        {/* Section Header */}
        <div className="product-grid-section__header">
          <div>
            <p className="section-label">Our Collection</p>
            <h2 className="section-heading" style={{ marginTop: '0.5rem' }}>
              SHOP <span style={{ color: 'var(--turquoise)' }}>ALL</span>
            </h2>
          </div>
          {searchQuery && (
            <div className="product-grid__search-info">
              <span>Results for "<strong>{searchQuery}</strong>"</span>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setSearchQuery('')}
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className="product-grid__filters" role="tablist" aria-label="Filter by category">
          <button
            className={`product-grid__filter-btn${activeCategory === 'all' ? ' product-grid__filter-btn--active' : ''}`}
            onClick={() => setActiveCategory('all')}
            role="tab"
            aria-selected={activeCategory === 'all'}
          >
            All ({products.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`product-grid__filter-btn${activeCategory === cat.id ? ' product-grid__filter-btn--active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
              role="tab"
              aria-selected={activeCategory === cat.id}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Grid */}
        {products.length === 0 ? (
          <div className="product-grid__empty" style={{ padding: 'var(--space-16) 0' }}>
            <div className="product-grid__empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </div>
            <h3>New Collection Dropping Soon</h3>
            <p style={{ maxWidth: '400px', margin: '0 auto var(--space-4)' }}>Our catalog is being updated with exclusive pieces. Explore our brand story in the meantime.</p>
            <a href="/manifesto" className="btn btn-primary">
              Welcome to Clan of DE
            </a>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="product-grid__empty">
            <div className="product-grid__empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </div>
            <h3>No products found</h3>
            <p>Try adjusting your filters or search query.</p>
            <button className="btn btn-primary" onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}>
              View All Products
            </button>
          </div>
        ) : (
          <div className="product-grid__grid">
            {filteredProducts.map((product, i) => (
              <div
                key={product.id}
                className="animate-fade-up"
                style={{ animationDelay: `${Math.min(i * 0.07, 0.5)}s` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
