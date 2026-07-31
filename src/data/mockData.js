// =============================================
// DE CREATIVES — MOCK DATA
// =============================================

export const categories = [
  { id: 'cat-1', name: 'Streetwear', slug: 'streetwear', count: 24, description: 'Bold, urban-inspired pieces that make a statement.', image: '/products/tee-black-girl-palm.jpg' },
  { id: 'cat-2', name: 'Essentials', slug: 'essentials', count: 18, description: 'Premium basics engineered for everyday luxury.', image: '/products/tee-white-back.jpg' },
  { id: 'cat-3', name: 'Limited Edition', slug: 'limited-edition', count: 8, description: 'Exclusive drops with limited-run designs.', image: '/products/tee-black-girl-garden.jpg' },
  { id: 'cat-4', name: 'Accessories', slug: 'accessories', count: 31, description: 'The details that define your look.', image: '/products/tee-black-duo-girls.jpg' },
];

export const products = [
  {
    id: 'p-001', sku: 'DE-SW-001', name: 'DE Signature Tee — Black',
    category: 'cat-1', categoryName: 'Streetwear',
    price: 89.99, comparePrice: 120.00,
    description: 'The original. Ultra-soft premium cotton, oversized silhouette. The iconic DE Creatives logo printed front-centre. This is what started it all.',
    colors: ['#0A0A0A', '#FAFAFA'],
    colorNames: ['Phantom Black', 'Clean White'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    stock: 47, isNew: true, isFeatured: true, isBestseller: false,
    rating: 4.8, reviewCount: 124,
    images: [
      '/products/tee-black-girl-tree.jpg',
      '/products/tee-black-girl-smile.jpg',
    ]
  },
  {
    id: 'p-002', sku: 'DE-ES-002', name: 'DE Classic Tee — White',
    category: 'cat-2', categoryName: 'Essentials',
    price: 64.99, comparePrice: null,
    description: 'Walk by faith. Clean white oversized tee with the DE Creatives vertical back print. A wardrobe cornerstone built for everyday wear.',
    colors: ['#FAFAFA', '#0A0A0A'],
    colorNames: ['Clean White', 'Phantom Black'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    stock: 83, isNew: false, isFeatured: true, isBestseller: true,
    rating: 4.9, reviewCount: 287,
    images: [
      '/products/tee-white-back.jpg',
      '/products/tee-duo-white-black.jpg',
    ]
  },
  {
    id: 'p-003', sku: 'DE-LE-003', name: 'DE Bracket Logo Tee',
    category: 'cat-3', categoryName: 'Limited Edition',
    price: 219.99, comparePrice: null,
    description: 'Limited run. The bracket-frame DE Creatives logo in full teal-and-white on deep black. Only available while stock lasts — collector\'s status guaranteed.',
    colors: ['#0A0A0A'],
    colorNames: ['Void Black'],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 12, isNew: true, isFeatured: true, isBestseller: false,
    rating: 5.0, reviewCount: 41,
    images: [
      '/products/tee-black-girl-palm.jpg',
      '/products/tee-black-girl-garden.jpg',
    ]
  },
  {
    id: 'p-004', sku: 'DE-SW-004', name: 'DE Duo Set — His & Hers',
    category: 'cat-1', categoryName: 'Streetwear',
    price: 149.99, comparePrice: 200.00,
    description: 'Two iconic DE Creatives tees in one set. White and black, both with signature logo prints. Perfect for couples or as a gift.',
    colors: ['#FAFAFA', '#0A0A0A'],
    colorNames: ['White + Black Set'],
    sizes: ['S/S', 'M/M', 'L/L', 'S/M', 'M/L'],
    stock: 29, isNew: false, isFeatured: false, isBestseller: true,
    rating: 4.7, reviewCount: 98,
    images: [
      '/products/tee-duo-white-black.jpg',
      '/products/tee-black-duo-girls.jpg',
    ]
  },
  {
    id: 'p-005', sku: 'DE-ES-005', name: 'DE Relaxed Fit Tee — Black',
    category: 'cat-2', categoryName: 'Essentials',
    price: 74.99, comparePrice: null,
    description: 'Relaxed silhouette, premium weight cotton. The DE bracket logo sits clean at the chest. Pairs with everything.',
    colors: ['#0A0A0A'],
    colorNames: ['Jet Black'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    stock: 62, isNew: false, isFeatured: true, isBestseller: false,
    rating: 4.7, reviewCount: 153,
    images: [
      '/products/tee-black-girl-smile2.jpg',
      '/products/tee-black-girl-smile.jpg',
    ]
  },
  {
    id: 'p-006', sku: 'DE-LE-006', name: 'DE Girls Collection Drop',
    category: 'cat-3', categoryName: 'Limited Edition',
    price: 89.99, comparePrice: 110.00,
    description: 'Shot in the garden. The DE Creatives women\'s cut — slightly cropped, soft cotton, full logo print. Limited seasonal drop.',
    colors: ['#0A0A0A'],
    colorNames: ['Jet Black'],
    sizes: ['XS', 'S', 'M', 'L'],
    stock: 38, isNew: true, isFeatured: false, isBestseller: false,
    rating: 4.5, reviewCount: 76,
    images: [
      '/products/tee-black-girl-grass.jpg',
      '/products/tee-black-girl-palm.jpg',
    ]
  },
  {
    id: 'p-007', sku: 'DE-SW-007', name: 'DE Duo — Two Friends Edition',
    category: 'cat-1', categoryName: 'Streetwear',
    price: 159.99, comparePrice: null,
    description: 'Two DE Creatives tees, two different logo placements. Shot together, worn together. Limited friendship edition.',
    colors: ['#0A0A0A'],
    colorNames: ['Black Duo'],
    sizes: ['S/S', 'M/M', 'L/L', 'M/L'],
    stock: 22, isNew: false, isFeatured: false, isBestseller: true,
    rating: 4.8, reviewCount: 64,
    images: [
      '/products/tee-black-duo-girls.jpg',
      '/products/tee-black-girl-tree.jpg',
    ]
  },
  {
    id: 'p-008', sku: 'DE-ES-008', name: 'DE Garden Series Tee',
    category: 'cat-2', categoryName: 'Essentials',
    price: 79.99, comparePrice: null,
    description: 'Lush. Tropical. DE Creatives. Shot in the garden series — the DE bracket logo pops bold against the greens. Premium 300GSM cotton.',
    colors: ['#0A0A0A'],
    colorNames: ['Jet Black'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    stock: 55, isNew: false, isFeatured: false, isBestseller: true,
    rating: 4.8, reviewCount: 218,
    images: [
      '/products/tee-black-girl-garden.jpg',
      '/products/tee-black-girl-smile2.jpg',
    ]
  },
];

export const heroSlides = [
  {
    id: 1,
    eyebrow: 'New Arrival — SS26',
    heading: 'DEFINE YOUR\nCREATIVE',
    subheading: 'Premium streetwear engineered for the bold. Made in Africa, worn by the world.',
    cta: 'Shop Collection',
    ctaSecondary: 'Explore Lookbook',
    image: '/products/tee-black-girl-palm.jpg',
    accent: 'Streetwear',
  },
  {
    id: 2,
    eyebrow: 'Limited Edition Drop',
    heading: 'WALK BY\nFAITH',
    subheading: 'The iconic white tee. Only 150 pieces. Own a piece of history.',
    cta: 'Get Yours Now',
    ctaSecondary: 'View Details',
    image: '/products/tee-white-back.jpg',
    accent: 'Limited',
  },
  {
    id: 3,
    eyebrow: 'The DE Creatives Look',
    heading: 'WEAR THE\nCULTURE',
    subheading: 'Bold prints, premium cotton, zero compromise. This is DE Creatives.',
    cta: 'Shop Now',
    ctaSecondary: 'See Lookbook',
    image: '/products/tee-black-duo-girls.jpg',
    accent: 'Culture',
  },
];

export const testimonials = [
  {
    id: 1, name: 'Kwame A.', location: 'Accra, Ghana',
    text: 'DE Creatives completely changed how I approach fashion. The quality is unreal — these pieces are investment-grade.',
    rating: 5, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80',
  },
  {
    id: 2, name: 'Zara M.', location: 'Lagos, Nigeria',
    text: 'The bracket logo tee is the most premium item I own. Worth every cedi. Will be ordering again.',
    rating: 5, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80',
  },
  {
    id: 3, name: 'Olu B.', location: 'London, UK',
    text: 'Fast shipping, incredible packaging, and the fits are exactly as advertised. DE Creatives is the real deal.',
    rating: 5, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80',
  },
];

// Dev-only fallback login, used solely when no Supabase backend is configured
// (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY unset). Never consulted once a
// real backend is live — see adminLogin in AppContext.jsx.
export const adminCredentials = {
  username: 'admin',
  password: 'decreatives2024',
};
