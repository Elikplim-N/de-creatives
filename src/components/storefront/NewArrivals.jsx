import { useApp } from '../../context/AppContext';
import ProductCard from './ProductCard';
import './NewArrivals.css';

export default function NewArrivals() {
  const { products } = useApp();
  
  // Filter products where isNew is true
  const newProducts = products.filter(p => p.isNew);

  if (newProducts.length === 0) return null;

  return (
    <section className="new-arrivals-section" id="new-arrivals" aria-label="New Arrivals">
      <div className="container">
        {/* Section Header */}
        <div className="new-arrivals-section__header">
          <p className="section-label">Latest Drop</p>
          <h2 className="section-heading" style={{ marginTop: '0.5rem' }}>
            NEW <span style={{ color: 'var(--turquoise)' }}>ARRIVALS</span>
          </h2>
        </div>

        {/* Grid of New Arrivals */}
        <div className="new-arrivals__grid">
          {newProducts.map((product, i) => (
            <div
              key={product.id}
              className="animate-fade-up"
              style={{ animationDelay: `${Math.min(i * 0.08, 0.6)}s` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
