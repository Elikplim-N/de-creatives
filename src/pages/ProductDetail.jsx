import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Navbar from '../components/storefront/Navbar';
import Footer from '../components/storefront/Footer';
import './ProductDetail.css';

export default function ProductDetail() {
  const id = useParams().id;
  const { products, addToCart, toggleWishlist, isInWishlist, formatPrice } = useApp();
  const product = products.find(p => p.id === id);

  // Defensive fallbacks for Supabase arrays
  const images = product?.images || [];
  const colors = product?.colors || [];
  const colorNames = product?.colorNames || [];
  const sizes = product?.sizes || ['S', 'M', 'L', 'XL'];

  const [selectedSize, setSelectedSize] = useState(sizes[0] || 'M');
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedFit, setSelectedFit] = useState('Regular Fit'); // 'Regular Fit' or 'Drop Shoulder Fit'
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [showSizeGuideModal, setShowSizeGuideModal] = useState(false);
  const [sizeUnit, setSizeUnit] = useState('in'); // 'in' or 'cm'

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

  const isDropShoulder = selectedFit === 'Drop Shoulder Fit';
  const currentUnitPrice = isDropShoulder ? 250.00 : product.price;
  const wishlisted = isInWishlist(product.id);
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - currentUnitPrice) / product.comparePrice) * 100)
    : null;

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2000);
      return;
    }
    const chosenColor = colors[selectedColor] || '#0A0A0A';
    addToCart(product, selectedSize, chosenColor, selectedFit, currentUnitPrice);
  };

  const handleWhatsAppOrder = () => {
    const chosenColorName = colorNames[selectedColor] || 'Default';
    const totalAmount = formatPrice(currentUnitPrice * qty);

    const message = `Hello DE Creatives! 🇬🇭✨\n\nI want to order this item:\n\n*Product:* ${product.name}\n*Style / Cut:* ${selectedFit} (${formatPrice(currentUnitPrice)})\n*Size:* ${selectedSize}\n*Color:* ${chosenColorName}\n*Quantity:* ${qty}\n*Total:* ${totalAmount}\n*Delivery:* Free Delivery\n\nPlease let me know the MoMo payment details so I can proceed!`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/233595515040?text=${encoded}`, '_blank');
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
                <span className="badge badge-success" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>Free Delivery</span>
              </div>

              <h1 className="product-detail__name">{product.name}</h1>

              <div className="product-detail__rating">
                <span className="product-detail__stars">{'★'.repeat(Math.round(product.rating || 5))}</span>
                <span className="product-detail__rating-val">{(product.rating || 5.0).toFixed(1)}</span>
                <span className="product-detail__review-count">({product.reviewCount || 0} reviews)</span>
              </div>

              <div className="product-detail__price-row">
                <span className="product-detail__price">{formatPrice(currentUnitPrice)}</span>
                {product.comparePrice && !isDropShoulder && (
                  <>
                    <span className="product-detail__compare">{formatPrice(product.comparePrice)}</span>
                    {discount > 0 && <span className="badge badge-danger">Save {discount}%</span>}
                  </>
                )}
                {isDropShoulder && (
                  <span className="badge badge-turquoise" style={{ fontSize: '0.75rem' }}>Drop Shoulder Edition</span>
                )}
              </div>

              <div className="product-detail__divider divider" />

              {/* Fit / Cut Option (Regular vs Drop Shoulder at 250gh) */}
              <div className="product-detail__section">
                <div className="product-detail__section-header">
                  <span className="product-detail__section-label">Silhouette / Fit</span>
                  <span className="product-detail__section-val" style={{ color: 'var(--turquoise)', fontWeight: 600 }}>{selectedFit}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    className={`btn ${selectedFit === 'Regular Fit' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setSelectedFit('Regular Fit')}
                    style={{ padding: '10px 14px', fontSize: '0.82rem', textAlign: 'center', lineHeight: 1.3 }}
                  >
                    <div><strong>Regular Fit</strong></div>
                    <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>{formatPrice(product.price)}</div>
                  </button>

                  <button
                    type="button"
                    className={`btn ${selectedFit === 'Drop Shoulder Fit' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setSelectedFit('Drop Shoulder Fit')}
                    style={{ padding: '10px 14px', fontSize: '0.82rem', textAlign: 'center', lineHeight: 1.3 }}
                  >
                    <div><strong>Drop Shoulder Fit</strong></div>
                    <div style={{ fontSize: '0.72rem', color: selectedFit === 'Drop Shoulder Fit' ? '#000' : 'var(--turquoise)' }}>
                      GH₵ 250.00
                    </div>
                  </button>
                </div>
              </div>

              {/* Color Selection */}
              <div className="product-detail__section">
                <div className="product-detail__section-header">
                  <span className="product-detail__section-label">Color</span>
                  <span className="product-detail__section-val">{colorNames[selectedColor] || 'Default Color'}</span>
                </div>
                <div className="product-detail__colors">
                  {colors.map((color, i) => (
                    <button
                      key={i}
                      className={`product-detail__color-swatch${selectedColor === i ? ' product-detail__color-swatch--active' : ''}`}
                      style={{ '--swatch-color': color }}
                      onClick={() => {
                        setSelectedColor(i);
                        if (images[i]) setActiveImage(i);
                      }}
                      aria-label={colorNames[i] || 'Color'}
                      title={colorNames[i] || 'Color'}
                    />
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="product-detail__section">
                <div className="product-detail__section-header">
                  <span className="product-detail__section-label">Size ({selectedSize})</span>
                  <button type="button" onClick={() => setShowSizeGuideModal(true)} className="product-detail__size-guide">
                    📏 Size Guide →
                  </button>
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

              {/* Quantity + Add to Cart + WhatsApp CTA */}
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

              {/* Direct WhatsApp Order */}
              <div style={{ marginTop: '12px' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-lg"
                  onClick={handleWhatsAppOrder}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    borderColor: '#25D366',
                    color: '#25D366',
                    background: 'rgba(37, 211, 102, 0.05)'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.324 5.328 0 11.859 0c3.161.001 6.132 1.233 8.368 3.472 2.235 2.24 3.461 5.215 3.46 8.378-.003 6.536-5.328 11.86-11.859 11.86-2.007-.001-3.98-.513-5.736-1.489L0 24zm6.59-4.846c1.666.988 3.311 1.485 5.26 1.486 5.417 0 9.825-4.414 9.827-9.836.001-2.627-1.02-5.1-2.874-6.958C16.99 1.888 14.5.86 11.862.86c-5.42 0-9.829 4.415-9.831 9.837-.001 1.887.493 3.73 1.427 5.33L2.454 21.5l5.59-1.465zM17.15 14.4c-.29-.145-1.713-.846-1.978-.942-.265-.096-.458-.145-.65.145-.193.29-.747.942-.916 1.132-.169.19-.338.212-.627.067-.29-.145-1.22-.45-2.325-1.434-.86-.767-1.44-1.714-1.61-2.004-.168-.29-.018-.446.126-.59.13-.13.29-.338.434-.508.145-.17.193-.29.29-.483.096-.19.048-.36-.024-.506-.072-.145-.65-1.568-.89-2.146-.233-.563-.47-.487-.65-.496-.168-.008-.362-.01-.555-.01-.193 0-.506.072-.77.36-.266.29-1.013.99-1.013 2.413 0 1.42 1.037 2.793 1.18 2.987.145.195 2.04 3.115 4.94 4.37.69.298 1.229.477 1.65.612.693.22 1.324.19 1.823.115.556-.08 1.713-.7 1.953-1.375.24-.675.24-1.255.17-1.375-.07-.12-.266-.19-.556-.335z"/>
                  </svg>
                  Order via WhatsApp Directly
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
                    Shipping & MoMo
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
                      <p className="product-detail__sku" style={{ marginTop: '0.5rem' }}>Motto: <strong>God × Health × GOOD vibes</strong></p>
                    </div>
                  )}
                  {activeTab === 'shipping' && (
                    <div className="product-detail__tab-pane">
                      <p className="product-detail__description"><strong>🚚 Free Delivery:</strong> Standard delivery is free on all orders across Ghana.</p>
                      <p className="product-detail__description" style={{ marginTop: '0.5rem' }}><strong>📱 Mobile Money:</strong> Pay easily with MTN Mobile Money (MoMo), Telecel Cash, or Cash on Delivery.</p>
                      <p className="product-detail__description" style={{ marginTop: '0.5rem' }}><strong>⚡ Dispatch:</strong> 24 to 48-hour delivery in Accra & major cities.</p>
                    </div>
                  )}
                  {activeTab === 'sizing' && (
                    <div className="product-detail__tab-pane">
                      <p className="product-detail__description">Available in Standard Regular Fit and Oversized Drop Shoulder Fit (250 GH₵). Click below to view the comprehensive size guide.</p>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ marginTop: '1rem' }}
                        onClick={() => setShowSizeGuideModal(true)}
                      >
                        Open Full Size Chart
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Size Guide Modal */}
      {showSizeGuideModal && (
        <div
          className="cart-drawer-overlay"
          onClick={() => setShowSizeGuideModal(false)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 9999 }}
        >
          <div
            className="card"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6)',
              position: 'relative'
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Size Guide"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-3)' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-accent)', letterSpacing: '0.05em', color: 'var(--white)', margin: 0, fontSize: '1.2rem' }}>
                  DE CREATIVES SIZE GUIDE
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Standard Regular & Drop Shoulder Silhouettes
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSizeGuideModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '8px' }}
                aria-label="Close size guide"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Unit Switcher */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginBottom: '16px' }}>
              <button
                type="button"
                className={`btn btn-sm ${sizeUnit === 'in' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setSizeUnit('in')}
                style={{ padding: '4px 12px', fontSize: '0.75rem' }}
              >
                Inches (in)
              </button>
              <button
                type="button"
                className={`btn btn-sm ${sizeUnit === 'cm' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setSizeUnit('cm')}
                style={{ padding: '4px 12px', fontSize: '0.75rem' }}
              >
                Centimeters (cm)
              </button>
            </div>

            {/* Regular Fit Table */}
            <h4 style={{ color: 'var(--turquoise)', fontFamily: 'var(--font-accent)', fontSize: '0.85rem', marginBottom: '8px', letterSpacing: '0.04em' }}>
              1. REGULAR FIT TEES
            </h4>
            <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--white-05)', color: 'var(--white)' }}>
                    <th style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)' }}>Size</th>
                    <th style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)' }}>Chest ({sizeUnit})</th>
                    <th style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)' }}>Length ({sizeUnit})</th>
                    <th style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)' }}>Shoulder ({sizeUnit})</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { size: 'XS', chestIn: '38', chestCm: '96', lenIn: '26.5', lenCm: '67', shIn: '17', shCm: '43' },
                    { size: 'S', chestIn: '40', chestCm: '102', lenIn: '27.5', lenCm: '70', shIn: '18', shCm: '46' },
                    { size: 'M', chestIn: '42', chestCm: '107', lenIn: '28.5', lenCm: '72', shIn: '19', shCm: '48' },
                    { size: 'L', chestIn: '44', chestCm: '112', lenIn: '29.5', lenCm: '75', shIn: '20', shCm: '51' },
                    { size: 'XL', chestIn: '46', chestCm: '117', lenIn: '30.5', lenCm: '77', shIn: '21', shCm: '53' },
                    { size: 'XXL', chestIn: '48', chestCm: '122', lenIn: '31.5', lenCm: '80', shIn: '22', shCm: '56' },
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--white)' }}>{row.size}</td>
                      <td style={{ padding: '8px 12px' }}>{sizeUnit === 'in' ? row.chestIn : row.chestCm}</td>
                      <td style={{ padding: '8px 12px' }}>{sizeUnit === 'in' ? row.lenIn : row.lenCm}</td>
                      <td style={{ padding: '8px 12px' }}>{sizeUnit === 'in' ? row.shIn : row.shCm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Drop Shoulder Fit Table */}
            <h4 style={{ color: 'var(--turquoise)', fontFamily: 'var(--font-accent)', fontSize: '0.85rem', marginBottom: '8px', letterSpacing: '0.04em' }}>
              2. DROP SHOULDER FIT TEES (GH₵ 250)
            </h4>
            <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--white-05)', color: 'var(--white)' }}>
                    <th style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)' }}>Size</th>
                    <th style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)' }}>Chest ({sizeUnit})</th>
                    <th style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)' }}>Length ({sizeUnit})</th>
                    <th style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)' }}>Drop Shoulder ({sizeUnit})</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { size: 'S', chestIn: '44', chestCm: '112', lenIn: '28.0', lenCm: '71', shIn: '22.5', shCm: '57' },
                    { size: 'M', chestIn: '46', chestCm: '117', lenIn: '29.0', lenCm: '74', shIn: '23.5', shCm: '60' },
                    { size: 'L', chestIn: '48', chestCm: '122', lenIn: '30.0', lenCm: '76', shIn: '24.5', shCm: '62' },
                    { size: 'XL', chestIn: '50', chestCm: '127', lenIn: '31.0', lenCm: '79', shIn: '25.5', shCm: '65' },
                    { size: 'XXL', chestIn: '52', chestCm: '132', lenIn: '32.0', lenCm: '81', shIn: '26.5', shCm: '67' },
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--white)' }}>{row.size}</td>
                      <td style={{ padding: '8px 12px' }}>{sizeUnit === 'in' ? row.chestIn : row.chestCm}</td>
                      <td style={{ padding: '8px 12px' }}>{sizeUnit === 'in' ? row.lenIn : row.lenCm}</td>
                      <td style={{ padding: '8px 12px' }}>{sizeUnit === 'in' ? row.shIn : row.shCm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ background: 'var(--white-05)', padding: '12px', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              💡 <strong>Fitting Tip:</strong> If you prefer a standard streetwear silhouette, stick with your normal size. For a signature exaggerated streetwear drape, our Drop Shoulder cut offers dropped armholes and wider sleeves.
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowSizeGuideModal(false)}
              style={{ marginTop: '16px', width: '100%' }}
            >
              Got It
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
