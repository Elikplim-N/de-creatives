import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './Gallery.css';

const galleryPhotos = [
  { id: 1, src: '/products/tee-black-girl-palm.jpg', title: 'DE Signature Streetwear', category: 'Lookbook Drop 01', tag: 'God × Health × GOOD vibes' },
  { id: 2, src: '/products/tee-white-back.jpg', title: 'Walk By Faith Classic', category: 'Back Print Edition', tag: 'Essentials' },
  { id: 3, src: '/products/tee-black-duo-girls.jpg', title: 'Clan Duo Edition', category: 'Community', tag: 'Streetwear' },
  { id: 4, src: '/products/tee-black-girl-garden.jpg', title: 'Garden Series Drop', category: 'Limited Edition', tag: 'Drop Shoulder' },
  { id: 5, src: '/products/tee-black-girl-smile.jpg', title: 'Good Vibes Edition', category: 'Editorial', tag: 'Lifestyle' },
  { id: 6, src: '/products/tee-black-girl-tree.jpg', title: 'Rooted in Culture', category: 'Streetwear', tag: 'Original Cut' },
  { id: 7, src: '/products/tee-duo-white-black.jpg', title: 'Monochrome Twin Set', category: 'Set Edition', tag: 'Black & White' },
  { id: 8, src: '/products/tee-black-girl-grass.jpg', title: 'Verdant Street Silhouette', category: 'Lookbook Drop 02', tag: 'Oversized Fit' },
  { id: 9, src: '/products/tee-black-girl-smile2.jpg', title: 'Clean Bracket Framing', category: 'Essentials', tag: 'Signature' },
];

export default function Gallery() {
  const [activePhoto, setActivePhoto] = useState(null);

  return (
    <section className="gallery-section" id="gallery" aria-label="Visual gallery and lookbook">
      <div className="container">
        <div className="gallery-section__header">
          <p className="section-label" style={{ color: 'var(--turquoise)', letterSpacing: '0.15em', fontWeight: 600 }}>
            VISUAL LOOKBOOK
          </p>
          <h2 className="section-heading" style={{ marginTop: '0.5rem' }}>
            THE DE <span style={{ color: 'var(--turquoise)' }}>GALLERY</span>
          </h2>
          <p className="gallery-section__subtitle">
            A visual archive of style, faith, and identity. Shot across Ghana.
          </p>
        </div>

        <div className="gallery-grid">
          {galleryPhotos.map((photo, i) => (
            <div
              key={photo.id}
              className={`gallery-item gallery-item--${(i % 5 === 0) ? 'wide' : (i % 3 === 0) ? 'tall' : 'normal'}`}
              onClick={() => setActivePhoto(photo)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActivePhoto(photo); }}
              aria-label={`View photo ${photo.title}`}
            >
              <img
                src={photo.src}
                alt={photo.title}
                className="gallery-item__img"
                loading="lazy"
              />
              <div className="gallery-item__overlay">
                <span className="gallery-item__tag">{photo.tag}</span>
                <h3 className="gallery-item__title">{photo.title}</h3>
                <p className="gallery-item__category">{photo.category}</p>
                <span className="gallery-item__zoom-hint">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    <line x1="11" y1="8" x2="11" y2="14"/>
                    <line x1="8" y1="11" x2="14" y2="11"/>
                  </svg>
                  Enlarge Photo
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {activePhoto && (
        <div
          className="gallery-lightbox"
          onClick={() => setActivePhoto(null)}
          role="dialog"
          aria-modal="true"
          aria-label={activePhoto.title}
        >
          <button
            type="button"
            className="gallery-lightbox__close"
            onClick={() => setActivePhoto(null)}
            aria-label="Close photo preview"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="gallery-lightbox__content" onClick={e => e.stopPropagation()}>
            <img
              src={activePhoto.src}
              alt={activePhoto.title}
              className="gallery-lightbox__img"
            />
            <div className="gallery-lightbox__caption">
              <div>
                <span className="gallery-item__tag" style={{ marginBottom: '6px', display: 'inline-block' }}>
                  {activePhoto.tag}
                </span>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff', fontFamily: 'var(--font-accent)' }}>
                  {activePhoto.title}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {activePhoto.category} · DE Creatives Lookbook
                </p>
              </div>
              <a
                href={`https://wa.me/233532391663?text=${encodeURIComponent(`Hello DE Creatives! I saw this photo on your gallery and would like to inquire about ordering: ${activePhoto.title}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#25D366', borderColor: '#25D366' }}
              >
                Inquire on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
