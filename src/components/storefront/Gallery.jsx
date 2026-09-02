import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { initialGalleryPhotos } from '../../data/mockData';
import './Gallery.css';

export default function Gallery() {
  const { galleryPhotos } = useApp();
  const [activePhoto, setActivePhoto] = useState(null);

  const displayPhotos = galleryPhotos && galleryPhotos.length > 0 ? galleryPhotos : initialGalleryPhotos;

  const handlePrev = useCallback((e) => {
    e?.stopPropagation();
    if (!activePhoto || displayPhotos.length <= 1) return;
    const currentIndex = displayPhotos.findIndex(p => p.id === activePhoto.id);
    const prevIndex = (currentIndex - 1 + displayPhotos.length) % displayPhotos.length;
    setActivePhoto(displayPhotos[prevIndex]);
  }, [activePhoto, displayPhotos]);

  const handleNext = useCallback((e) => {
    e?.stopPropagation();
    if (!activePhoto || displayPhotos.length <= 1) return;
    const currentIndex = displayPhotos.findIndex(p => p.id === activePhoto.id);
    const nextIndex = (currentIndex + 1) % displayPhotos.length;
    setActivePhoto(displayPhotos[nextIndex]);
  }, [activePhoto, displayPhotos]);

  // Lock background body scroll and listen for Escape / Arrow keys
  useEffect(() => {
    if (activePhoto) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setActivePhoto(null);
        if (e.key === 'ArrowLeft') handlePrev();
        if (e.key === 'ArrowRight') handleNext();
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [activePhoto, handlePrev, handleNext]);

  return (
    <section className="gallery-section" id="gallery" aria-label="Visual gallery and lookbook">
      <div className="container">
        <div className="gallery-section__header">
          <p className="section-label" style={{ color: 'var(--turquoise)', letterSpacing: '0.15em', fontWeight: 600 }}>
            VISUAL LOOKBOOK
          </p>
          <h2 className="section-heading" style={{ marginTop: '0.5rem' }}>
            THE GALLERY OF <span style={{ color: 'var(--turquoise)' }}>DE</span>
          </h2>
          <p className="gallery-section__subtitle">
            A visual archive of style, faith, and identity. Shot across Ghana.
          </p>
        </div>

        <div className="gallery-grid">
          {displayPhotos.map((photo, i) => (
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
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {displayPhotos.length > 1 && (
            <>
              <button
                type="button"
                className="gallery-lightbox__nav gallery-lightbox__nav--prev"
                onClick={handlePrev}
                aria-label="Previous photo"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                type="button"
                className="gallery-lightbox__nav gallery-lightbox__nav--next"
                onClick={handleNext}
                aria-label="Next photo"
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
                src={activePhoto.src}
                alt={activePhoto.title}
                className="gallery-lightbox__img"
              />
            </div>
            <div className="gallery-lightbox__caption">
              <div className="gallery-lightbox__info">
                {activePhoto.tag && (
                  <span className="gallery-item__tag" style={{ marginBottom: '4px', display: 'inline-block' }}>
                    {activePhoto.tag}
                  </span>
                )}
                <h3 className="gallery-lightbox__title">
                  {activePhoto.title}
                </h3>
                {activePhoto.category && (
                  <p className="gallery-lightbox__meta">
                    {activePhoto.category} · DE Creatives Lookbook
                  </p>
                )}
              </div>
              <a
                href={`https://wa.me/233595515040?text=${encodeURIComponent(`Hello DE Creatives! I saw this photo on your gallery and would like to inquire about ordering: ${activePhoto.title}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm gallery-lightbox__wa-btn"
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
