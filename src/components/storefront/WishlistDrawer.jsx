import { useApp } from '../../context/AppContext';
import './WishlistDrawer.css';

export default function WishlistDrawer() {
  const {
    wishlist,
    isWishlistOpen,
    setIsWishlistOpen,
    setIsCartOpen,
    toggleWishlist,
    addToCart,
    formatPrice,
  } = useApp();

  if (!isWishlistOpen) return null;

  const closeDrawer = () => {
    setIsWishlistOpen(false);
  };

  const handleMoveToCart = (product) => {
    // Add to cart with default first size/color
    const size = (product.sizes && product.sizes[0]) || 'M';
    const color = (product.colors && product.colors[0]) || '#0A0A0A';
    addToCart(product, size, color);
    
    // Close wishlist and open cart drawer
    setIsWishlistOpen(false);
    setIsCartOpen(true);
  };

  return (
    <div className="wishlist-drawer-overlay" onClick={closeDrawer}>
      <div className="wishlist-drawer" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Wishlist">
        {/* Header */}
        <div className="wishlist-drawer__header">
          <h2 className="wishlist-drawer__title">WISHLIST ({wishlist.length})</h2>
          <button className="wishlist-drawer__close-btn" onClick={closeDrawer} aria-label="Close wishlist">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="wishlist-drawer__content-wrap">
          {wishlist.length === 0 ? (
            <div className="wishlist-drawer__empty">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <p className="wishlist-drawer__empty-text">Your wishlist is currently empty.</p>
              <button className="btn btn-secondary" onClick={closeDrawer} style={{ marginTop: '1.5rem' }}>
                Explore Products
              </button>
            </div>
          ) : (
            <div className="wishlist-drawer__items-list">
              {wishlist.map((item) => {
                const images = item.images || [];
                return (
                  <div className="wishlist-drawer__item" key={item.id}>
                    <img
                      src={images[0] || '/logo.png'}
                      alt={item.name}
                      className="wishlist-drawer__item-img"
                    />
                    <div className="wishlist-drawer__item-info">
                      <span className="wishlist-drawer__item-category">{item.categoryName}</span>
                      <h3 className="wishlist-drawer__item-name">{item.name}</h3>
                      <span className="wishlist-drawer__item-price">
                        {formatPrice(item.price)}
                      </span>
                      <button
                        className="btn btn-primary btn-sm wishlist-drawer__add-to-cart-btn"
                        onClick={() => handleMoveToCart(item)}
                        style={{ marginTop: '0.75rem', width: 'fit-content' }}
                      >
                        Add to Bag
                      </button>
                    </div>
                    <button
                      className="wishlist-drawer__item-remove"
                      onClick={() => toggleWishlist(item)}
                      aria-label="Remove item"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
