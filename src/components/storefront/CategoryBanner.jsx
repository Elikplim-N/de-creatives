import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './CategoryBanner.css';

export default function CategoryBanner() {
  const { categories, products, setActiveCategory } = useApp();
  const navigate = useNavigate();

  const handleCategoryClick = (catId) => {
    setActiveCategory(catId);
    navigate('/shop');
  };

  if (categories.length === 0) return null;

  return (
    <section className="cat-banner" id="editorial" aria-label="Editorial Showcase">
      <div className="container">
        <div className="cat-banner__grid">
          {categories.map((cat, i) => (
            <button
              key={cat.id}
              className={`cat-banner__item${i === 0 ? ' cat-banner__item--featured' : ''}`}
              onClick={() => handleCategoryClick(cat.id)}
              aria-label={`Browse ${cat.name}`}
            >
              {cat.image ? (
                <img src={cat.image} alt={cat.name} loading="lazy" />
              ) : (
                <div className="cat-banner__no-image" aria-hidden="true" />
              )}
              <div className="cat-banner__overlay" />
              <div className="cat-banner__content">
                <span className="cat-banner__count">{products.filter(p => p.category === cat.id).length} Items</span>
                <h3 className="cat-banner__name">{cat.name}</h3>
                <p className="cat-banner__desc">{cat.description}</p>
                <span className="cat-banner__link">
                  Explore Drop
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
