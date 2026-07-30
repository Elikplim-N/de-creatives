import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Navbar from '../components/storefront/Navbar';
import Footer from '../components/storefront/Footer';
import './ProductDetail.css';

export default function ProductDetail() {
  const id = useParams().id;
  const { products, addToCart, toggleWishlist, isInWishlist } = useApp();
  const product = products.find(p => p.id === id);

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);

  const [activeTab, setActiveTab] = useState('details');

  if (!product) {
    return (
      <div className="storefront">
        <Navbar />
        <div className="product-detail__not-found container">
          <h1>Product not found</h1>
          <Link to="/" className="btn btn-primary">Back to Shop</Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Defensive fallbacks for Supabase arrays
  const images = product.images || [];
  const colors = product.colors || [];
  const colorNames = product.colorNames || [];
  const sizes = product.sizes || [];

  const wishlisted = isInWishlist(product.id);
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null;

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2000);
      return;
    }
    addToCart(product, selectedSize, colors[selectedColor] || '#0A0A0A');
  };

  return (
    <div className="storefront">
      <Navbar />
      <main className="product-detail" id="main-content">
        {/* Breadcrumb */}
        <div className="product-detail__breadcrumb container">
          <Link to="/" className="product-detail__crumb">Home</Link>
          <span className="product-detail__crumb-sep">/</span>
          <span className="product-detail__crumb">{product.categoryName}</span>
          <span className="product-detail__crumb-sep">/</span>
          <span className="product-detail__crumb product-detail__crumb--active">{product.name}</span>
        </div>

        <div className="container">
          <div className="product-detail__layout">
            {/* Gallery */}
            <div className="product-detail__gallery">
              <div className="product-detail__thumbnails">
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`product-detail__thumb${activeImage === i ? ' product-detail__thumb--active' : ''}`}
                    onClick={() => setActiveImage(i)}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={img} alt={`${product.name} view ${i + 1}`} loading="lazy" />
                  </button>
                ))}
              </div>
              <div className="product-detail__main-image">
                <img
                  src={images[activeImage] || '/logo.png'}
                  alt={product.name}
                  key={activeImage}
                  className="product-detail__img"
                />
                {product.isNew && (
                  <div className="product-detail__badge-new badge badge-turquoise">New Arrival</div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="product-detail__info">
              <div className="product-detail__category-label">
                <span className="badge badge-neutral">{product.categoryName}</span>
                {product.isBestseller && <span className="badge badge-turquoise">Bestseller</span>}
              </div>

              <h1 className="product-detail__name">{product.name}</h1>

              <div className="product-detail__rating">
                <span className="product-detail__stars">{'★'.repeat(Math.round(product.rating || 5))}</span>
                <span className="product-detail__rating-val">{(product.rating || 5.0).toFixed(1)}</span>
                <span className="product-detail__review-count">({product.reviewCount || 0} reviews)</span>
              </div>

              <div className="product-detail__price-row">
                <span className="product-detail__price">${(product.price || 0).toFixed(2)}</span>
                {product.comparePrice && (
                  <>
                    <span className="product-detail__compare">${product.comparePrice.toFixed(2)}</span>
                    <span className="badge badge-danger">Save {discount}%</span>
                  </>
                )}
              </div>

              <div className="product-detail__divider divider" />

              {/* Color Selection */}
              <div className="product-detail__section">
                <div className="product-detail__section-header">
                  <span className="product-detail__section-label">Color</span>
                  <span className="product-detail__section-val">{colorNames[selectedColor] || 'Default'}</span>
                </div>
                <div className="product-detail__colors">
                  {colors.map((color, i) => (
                    <button
                      key={i}
                      className={`product-detail__color-swatch${selectedColor === i ? ' product-detail__color-swatch--active' : ''}`}
                      style={{ '--swatch-color': color }}
                      onClick={() => setSelectedColor(i)}
                      aria-label={colorNames[i] || 'Color'}
                      title={colorNames[i] || 'Color'}
                    />
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="product-detail__section">
                <div className="product-detail__section-header">
                  <span className="product-detail__section-label">Size</span>
                  <button onClick={() => setActiveTab('sizing')} className="product-detail__size-guide">Size Guide →</button>
                </div>
                <div className={`product-detail__sizes${sizeError ? ' product-detail__sizes--error' : ''}`}>
                  {sizes.map(size => (
                    <button
                      key={size}
                      className={`product-detail__size-btn${selectedSize === size ? ' product-detail__size-btn--active' : ''}`}
                      onClick={() => { setSelectedSize(size); setSizeError(false); }}
                      aria-pressed={selectedSize === size}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {sizeError && <p className="product-detail__size-error">Please select a size</p>}
              </div>

              {/* Quantity + Add to Cart */}
              <div className="product-detail__ctas">
                <div className="product-detail__qty">
                  <button
                    className="product-detail__qty-btn"
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                  >−</button>
                  <span className="product-detail__qty-val">{qty}</span>
                  <button
                    className="product-detail__qty-btn"
                    onClick={() => setQty(q => q + 1)}
                    aria-label="Increase quantity"
                  >+</button>
                </div>
                <button className="btn btn-primary btn-lg product-detail__add-btn" onClick={handleAddToCart}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                  Add to Cart
                </button>
                <button
                  className={`product-detail__wishlist-btn${wishlisted ? ' active' : ''}`}
                  onClick={() => toggleWishlist(product)}
                  aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
              </div>

              <div className="product-detail__divider divider" />

              {/* SOG-style details tabs */}
              <div className="product-detail__tabs-wrap">
                <div className="product-detail__tabs" role="tablist">
                  <button
                    className={`product-detail__tab-btn${activeTab === 'details' ? ' active' : ''}`}
                    onClick={() => setActiveTab('details')}
                    role="tab"
                    aria-selected={activeTab === 'details'}
                  >
                    Details
                  </button>
                  <button
                    className={`product-detail__tab-btn${activeTab === 'shipping' ? ' active' : ''}`}
                    onClick={() => setActiveTab('shipping')}
                    role="tab"
                    aria-selected={activeTab === 'shipping'}
                  >
                    Shipping
                  </button>
                  <button
                    className={`product-detail__tab-btn${activeTab === 'sizing' ? ' active' : ''}`}
                    onClick={() => setActiveTab('sizing')}
                    role="tab"
                    aria-selected={activeTab === 'sizing'}
                  >
                    Sizing
                  </button>
                </div>
                <div className="product-detail__tab-content">
                  {activeTab === 'details' && (
                    <div className="product-detail__tab-pane">
                      <p className="product-detail__description">{product.description}</p>
                      <p className="product-detail__sku" style={{ marginTop: '1rem' }}>SKU: <strong>{product.sku}</strong></p>
                    </div>
                  )}
                  {activeTab === 'shipping' && (
                    <div className="product-detail__tab-pane">
                      <p className="product-detail__description">We drop all items in very limited editions. Order dispatch takes 2-4 business days. Standard delivery is free on all orders over $150.</p>
                      <p className="product-detail__description" style={{ marginTop: '0.5rem' }}>We offer free 30-day returns and exchanges on all items in original unworn condition.</p>
                    </div>
                  )}
                  {activeTab === 'sizing' && (
                    <div className="product-detail__tab-pane">
                      <p className="product-detail__description">This garment features a high-end streetwear silhouette. Fits true to size with a clean, slightly oversized aesthetic.</p>
                      <table className="product-detail__size-table" style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse', color: 'var(--text-secondary)', fontFamily: 'var(--font-accent)', fontSize: '0.8rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                            <th style={{ padding: '8px 0' }}>Size</th>
                            <th style={{ padding: '8px 0' }}>Chest (in)</th>
                            <th style={{ padding: '8px 0' }}>Length (in)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}><td style={{ padding: '8px 0' }}>S</td><td style={{ padding: '8px 0' }}>42</td><td style={{ padding: '8px 0' }}>27.5</td></tr>
                          <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}><td style={{ padding: '8px 0' }}>M</td><td style={{ padding: '8px 0' }}>44</td><td style={{ padding: '8px 0' }}>28.5</td></tr>
                          <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}><td style={{ padding: '8px 0' }}>L</td><td style={{ padding: '8px 0' }}>46</td><td style={{ padding: '8px 0' }}>29.5</td></tr>
                          <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}><td style={{ padding: '8px 0' }}>XL</td><td style={{ padding: '8px 0' }}>48</td><td style={{ padding: '8px 0' }}>30.5</td></tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
