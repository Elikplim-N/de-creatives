import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { categories } from '../../data/mockData';
import './CategoryBanner.css';

// Using real DE Creatives product/model photos for the editorial showcase
const catImages = {
  'cat-1': '/products/tee-black-girl-palm.jpg',      // Streetwear
  'cat-2': '/products/tee-white-back.jpg',            // Essentials
  'cat-3': '/products/tee-black-girl-garden.jpg',     // Limited Edition
  'cat-4': '/products/tee-black-duo-girls.jpg',       // Accessories (placeholder or model duo)
};

export default function CategoryBanner() {
  const { setActiveCategory } = useApp();
  const navigate = useNavigate();

  const handleCategoryClick = (catId) => {
    setActiveCategory(catId);
    navigate('/shop');
  };

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
              <img src={catImages[cat.id]} alt={cat.name} loading="lazy" />
              <div className="cat-banner__overlay" />
              <div className="cat-banner__content">
                <span className="cat-banner__count">{cat.count} Items</span>
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
