import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { toggleWishlist, isInWishlist, addToCart, formatPrice } = useApp();
  const wishlisted = isInWishlist(product.id);
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null;

  // Defensive fallbacks for Supabase PostgreSQL array columns
  const images = product.images || [];
  const colors = product.colors || [];
  const colorNames = product.colorNames || [];
  const sizes = product.sizes || ['S', 'M', 'L', 'XL'];

  const [activeColorIdx, setActiveColorIdx] = useState(0);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, sizes[0] || 'M', colors[activeColorIdx] || '#0A0A0A', 'Regular Fit', product.price);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleColorClick = (e, idx) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveColorIdx(idx);
  };

  const displayImage = images[activeColorIdx] || images[0] || '/logo.png';
  const hoverImage = images[1] && activeColorIdx === 0 ? images[1] : null;

  return (
    <article className="product-card">
      <Link to={`/product/${product.id}`} className="product-card__image-wrap" aria-label={`View ${product.name}`}>
        <img
          src={displayImage}
          alt={product.name}
          className="product-card__image product-card__image--front"
          loading="lazy"
        />
        {hoverImage && (
          <img
            src={hoverImage}
            alt={`${product.name} alternate view`}
            className="product-card__image product-card__image--back"
            loading="lazy"
          />
        )}

        {/* Badges */}
        <div className="product-card__badges">
          {product.isNew && <span className="badge badge-turquoise">New</span>}
          {product.isBestseller && <span className="badge badge-neutral">Bestseller</span>}
          {discount && <span className="badge badge-danger">-{discount}%</span>}
          {product.stock <= 15 && product.stock > 0 && (
            <span className="badge badge-warning">Low Stock</span>
          )}
        </div>

        {/* Wishlist */}
        <button
          className={`product-card__wishlist${wishlisted ? ' product-card__wishlist--active' : ''}`}
          onClick={handleWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

        {/* Quick Add Overlay */}
        <div className="product-card__quick-add-wrap">
          <button className="product-card__quick-add btn btn-primary" onClick={handleQuickAdd}>
            Quick Add
          </button>
        </div>
      </Link>

      <div className="product-card__info">
        <div className="product-card__meta">
          <span className="product-card__category">{product.categoryName}</span>
          <div className="product-card__rating">
            <span className="product-card__stars">{'★'.repeat(Math.round(product.rating || 5))}</span>
            <span className="product-card__review-count">({product.reviewCount || 0})</span>
          </div>
        </div>

        <Link to={`/product/${product.id}`} className="product-card__name-link">
          <h3 className="product-card__name">{product.name}</h3>
        </Link>

        <div className="product-card__bottom">
          <div className="product-card__price-wrap">
            <span className="product-card__price">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && (
              <span className="product-card__compare">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>

          {/* Color swatches */}
          <div className="product-card__colors">
            {colors.slice(0, 4).map((color, i) => (
              <button
                key={i}
                type="button"
                className={`product-card__swatch${activeColorIdx === i ? ' product-card__swatch--active' : ''}`}
                style={{
                  background: color,
                  border: activeColorIdx === i ? '2px solid var(--turquoise)' : '1px solid var(--border-subtle)',
                  padding: 0,
                  cursor: 'pointer'
                }}
                title={colorNames[i] || 'Color'}
                onClick={(e) => handleColorClick(e, i)}
                aria-label={colorNames[i] || 'Color'}
              />
            ))}
            {colors.length > 4 && (
              <span className="product-card__swatch-more">+{colors.length - 4}</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
