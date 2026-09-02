import { useState, useEffect } from 'react';
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
  const images = product?.images && product.images.length > 0 ? product.images : ['/logo.png'];
  const colors = product?.colors && product.colors.length > 0 ? product.colors : ['#0A0A0A'];
  const colorNames = product?.colorNames && product.colorNames.length > 0 ? product.colorNames : ['Default'];
  // Fit-specific size ranges
  const REGULAR_FIT_SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];
  const DROP_SHOULDER_SIZES = ['S', 'M', 'L', 'XL', '2XL'];

  const [selectedFit, setSelectedFit] = useState('Regular Fit'); // 'Regular Fit' or 'Drop Shoulder Fit'
  const isDropShoulder = selectedFit === 'Drop Shoulder Fit';
  const availableSizes = isDropShoulder ? DROP_SHOULDER_SIZES : REGULAR_FIT_SIZES;

  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [showSizeGuideModal, setShowSizeGuideModal] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [sizeUnit, setSizeUnit] = useState('in'); // 'in' or 'cm'

  useEffect(() => {
    if (zoomOpen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const handleKey = (e) => { if (e.key === 'Escape') setZoomOpen(false); };
      window.addEventListener('keydown', handleKey);
      return () => {
        document.body.style.overflow = orig;
        window.removeEventListener('keydown', handleKey);
      };
    }
  }, [zoomOpen]);

  const handleFitChange = (fit) => {
    setSelectedFit(fit);
    const targetSizes = fit === 'Drop Shoulder Fit' ? DROP_SHOULDER_SIZES : REGULAR_FIT_SIZES;
    if (!targetSizes.includes(selectedSize)) {
      setSelectedSize('M');
    }
  };

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

    const message = `Hello DE Creatives! 🇬🇭✨\n\nI want to order this item:\n\n*Product:* ${product.name}\n*Style / Cut:* ${selectedFit} (${formatPrice(currentUnitPrice)})\n*Size:* ${selectedSize}\n*Color:* ${chosenColorName}\n*Quantity:* ${qty}\n*Total:* ${totalAmount}\n\nPlease confirm availability and payment details so I can proceed!`;

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
              <div
                className="product-detail__main-image"
                onClick={() => setZoomOpen(true)}
                style={{ cursor: 'zoom-in' }}
                title="Click to enlarge"
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setZoomOpen(true); }}
                aria-label="Click to enlarge product photo"
              >
                <img
                  src={images[activeImage] || '/logo.png'}
                  alt={product.name}
                  key={activeImage}
                  className="product-detail__img"
                />
                <div className="product-detail__zoom-hint">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    <line x1="11" y1="8" x2="11" y2="14"/>
                    <line x1="8" y1="11" x2="14" y2="11"/>
                  </svg>
                  Enlarge
                </div>
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
                    onClick={() => handleFitChange('Regular Fit')}
                    style={{ padding: '10px 14px', fontSize: '0.82rem', textAlign: 'center', lineHeight: 1.3 }}
                  >
                    <div><strong>Regular Fit</strong></div>
                    <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>{formatPrice(product.price)} (up to 4XL)</div>
                  </button>

                  <button
                    type="button"
                    className={`btn ${selectedFit === 'Drop Shoulder Fit' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => handleFitChange('Drop Shoulder Fit')}
                    style={{ padding: '10px 14px', fontSize: '0.82rem', textAlign: 'center', lineHeight: 1.3 }}
                  >
                    <div><strong>Drop Shoulder Fit</strong></div>
                    <div style={{ fontSize: '0.72rem', color: selectedFit === 'Drop Shoulder Fit' ? '#000' : 'var(--turquoise)' }}>
                      GH₵ 250.00 (up to 2XL)
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
                  <span className="product-detail__section-label">
                    Size ({selectedSize}) — <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{selectedFit === 'Regular Fit' ? 'S to 4XL' : 'S to 2XL'}</span>
                  </span>
                  <button type="button" onClick={() => setShowSizeGuideModal(true)} className="product-detail__size-guide">
                    📏 Size Guide →
                  </button>
                </div>
                <div className={`product-detail__sizes${sizeError ? ' product-detail__sizes--error' : ''}`}>
                  {availableSizes.map(size => (
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

              {/* Secondary WhatsApp direct order CTA */}
              <button
                type="button"
                className="btn btn-outline product-detail__wa-btn"
                onClick={handleWhatsAppOrder}
              >
                <span>💬</span> Text to Order on WhatsApp
              </button>

              {/* Tabs */}
              <div className="product-detail__tabs">
                <div className="product-detail__tab-list" role="tablist">
                  <button
                    className={`product-detail__tab-btn${activeTab === 'details' ? ' active' : ''}`}
                    onClick={() => setActiveTab('details')}
                    role="tab"
                    aria-selected={activeTab === 'details'}
                  >Details</button>
                  <button
                    className={`product-detail__tab-btn${activeTab === 'shipping' ? ' active' : ''}`}
                    onClick={() => setActiveTab('shipping')}
                    role="tab"
                    aria-selected={activeTab === 'shipping'}
                  >Dispatch & Payment</button>
                  <button
                    className={`product-detail__tab-btn${activeTab === 'sizing' ? ' active' : ''}`}
                    onClick={() => setActiveTab('sizing')}
                    role="tab"
                    aria-selected={activeTab === 'sizing'}
                  >Size Chart</button>
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
                      <p className="product-detail__description"><strong>🚚 Fast Dispatch:</strong> Orders are dispatched within 24 to 48 hours in Accra.</p>
                      <p className="product-detail__description" style={{ marginTop: '0.5rem' }}><strong>📱 Mobile Money:</strong> Pay easily via MTN Mobile Money (MoMo) or Telecel Cash.</p>
                      <p className="product-detail__description" style={{ marginTop: '0.5rem' }}><strong>💬 Direct Ordering:</strong> Tap "Text to Order on WhatsApp" to place your order directly.</p>
                    </div>
                  )}
                  {activeTab === 'sizing' && (
                    <div className="product-detail__tab-pane">
                      <p className="product-detail__description">
                        Available in Regular Fit (S to 4XL) and Oversized Drop Shoulder Fit (S to 2XL, GH₵ 250). Click below to view the full size chart.
                      </p>
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
                  Regular Fit (S–4XL) & Drop Shoulder Fit (S–2XL)
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
              1. REGULAR FIT TEES (S to 4XL)
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
                    { size: 'S', chestIn: '40', chestCm: '102', lenIn: '27.5', lenCm: '70', shIn: '18', shCm: '46' },
                    { size: 'M', chestIn: '42', chestCm: '107', lenIn: '28.5', lenCm: '72', shIn: '19', shCm: '48' },
                    { size: 'L', chestIn: '44', chestCm: '112', lenIn: '29.5', lenCm: '75', shIn: '20', shCm: '51' },
                    { size: 'XL', chestIn: '46', chestCm: '117', lenIn: '30.5', lenCm: '77', shIn: '21', shCm: '53' },
                    { size: '2XL', chestIn: '48', chestCm: '122', lenIn: '31.5', lenCm: '80', shIn: '22', shCm: '56' },
                    { size: '3XL', chestIn: '50', chestCm: '127', lenIn: '32.5', lenCm: '83', shIn: '23', shCm: '58' },
                    { size: '4XL', chestIn: '52', chestCm: '132', lenIn: '33.5', lenCm: '85', shIn: '24', shCm: '61' },
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
              2. DROP SHOULDER FIT TEES — GH₵ 250 (S to 2XL)
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
                    { size: '2XL', chestIn: '52', chestCm: '132', lenIn: '32.0', lenCm: '81', shIn: '26.5', shCm: '67' },
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
              💡 <strong>Fitting Tip:</strong> Regular Fit extends from S up to 4XL for standard streetwear drape. Drop Shoulder Fit offers dropped armholes and wider sleeves (available from S to 2XL).
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

      {/* Product Image Fullscreen Lightbox Modal */}
      {zoomOpen && (
        <div
          className="gallery-lightbox"
          onClick={() => setZoomOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`${product.name} enlarged photo`}
        >
          <button
            type="button"
            className="gallery-lightbox__close"
            onClick={() => setZoomOpen(false)}
            aria-label="Close photo preview"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                className="gallery-lightbox__nav gallery-lightbox__nav--prev"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImage(prev => (prev - 1 + images.length) % images.length);
                }}
                aria-label="Previous image"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                type="button"
                className="gallery-lightbox__nav gallery-lightbox__nav--next"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImage(prev => (prev + 1) % images.length);
                }}
                aria-label="Next image"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </>
          )}

          <div className="gallery-lightbox__content" onClick={e => e.stopPropagation()}>
            <div className="gallery-lightbox__img-wrap">
              <img
                src={images[activeImage] || '/logo.png'}
                alt={product.name}
                className="gallery-lightbox__img"
              />
            </div>
            <div className="gallery-lightbox__caption">
              <div className="gallery-lightbox__info">
                <span className="gallery-item__tag" style={{ marginBottom: '4px', display: 'inline-block' }}>
                  {product.categoryName || 'Streetwear'}
                </span>
                <h3 className="gallery-lightbox__title">{product.name}</h3>
                <p className="gallery-lightbox__meta">
                  {formatPrice(currentUnitPrice)} · Image {activeImage + 1} of {images.length}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setZoomOpen(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
