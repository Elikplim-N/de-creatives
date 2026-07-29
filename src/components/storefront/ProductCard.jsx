import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { toggleWishlist, isInWishlist, addToCart } = useApp();
  const wishlisted = isInWishlist(product.id);
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, product.sizes[0], product.colors[0]);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <article className="product-card">
      <Link to={`/product/${product.id}`} className="product-card__image-wrap" aria-label={`View ${product.name}`}>
        <img
          src={product.images[0]}
          alt={product.name}
          className="product-card__image product-card__image--front"
          loading="lazy"
        />
        {product.images[1] && (
          <img
            src={product.images[1]}
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
            <span className="product-card__stars">{'★'.repeat(Math.round(product.rating))}</span>
            <span className="product-card__review-count">({product.reviewCount})</span>
          </div>
        </div>

        <Link to={`/product/${product.id}`} className="product-card__name-link">
          <h3 className="product-card__name">{product.name}</h3>
        </Link>

        <div className="product-card__bottom">
          <div className="product-card__price-wrap">
            <span className="product-card__price">
              ${product.price.toFixed(2)}
            </span>
            {product.comparePrice && (
              <span className="product-card__compare">
                ${product.comparePrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Color swatches */}
          <div className="product-card__colors">
            {product.colors.slice(0, 4).map((color, i) => (
              <span
                key={i}
                className="product-card__swatch"
                style={{ background: color }}
                title={product.colorNames[i]}
                role="img"
                aria-label={product.colorNames[i]}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="product-card__swatch-more">+{product.colors.length - 4}</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
