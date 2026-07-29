import { useApp } from '../../context/AppContext';
import { categories } from '../../data/mockData';
import ProductCard from './ProductCard';
import './ProductGrid.css';

export default function ProductGrid() {
  const { filteredProducts, activeCategory, setActiveCategory, searchQuery, setSearchQuery } = useApp();

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
            All ({filteredProducts.length + (activeCategory !== 'all' ? filteredProducts.length - filteredProducts.length : 0)})
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
        {filteredProducts.length === 0 ? (
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
