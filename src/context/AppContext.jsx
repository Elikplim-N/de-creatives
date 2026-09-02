import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  products as initialProducts,
  categories as initialCategories,
  heroSlides as initialHeroSlides,
  initialGalleryPhotos,
  initialManifesto,
  adminCredentials
} from '../data/mockData';
import { supabase } from '../lib/supabaseClient';
import { api } from '../lib/apiClient';

const AppContext = createContext(null);

// Bridges de_products' snake_case DB columns to the camelCase fields the
// storefront and admin UI read (reviewCount, isNew, isFeatured, isBestseller,
// comparePrice), plus the category name lookup both callers need.
function formatDbProduct(p, categoryList) {
  return {
    ...p,
    category: p.category_id || p.category,
    categoryName: categoryList?.find(c => c.id === (p.category_id || p.category))?.name || 'Uncategorized',
    comparePrice: p.compare_price ?? p.comparePrice,
    reviewCount: p.review_count ?? p.reviewCount,
    isNew: p.is_new ?? p.isNew,
    isFeatured: p.is_featured ?? p.isFeatured,
    isBestseller: p.is_bestseller ?? p.isBestseller,
    colorNames: p.color_names || p.colorNames,
  };
}

// Inverse of formatDbProduct - maps an admin-form update (camelCase, plus the
// UI-only categoryName field) to real de_products columns. `images` is
// already a plain array of Storage URLs by the time it gets here.
const PRODUCT_FIELD_TO_COLUMN = {
  category: 'category_id',
  comparePrice: 'compare_price',
  reviewCount: 'review_count',
  isNew: 'is_new',
  isFeatured: 'is_featured',
  isBestseller: 'is_bestseller',
  colorNames: 'color_names',
};

// Converts camelCase fields from the UI to snake_case DB columns, dropping
// any field that doesn't correspond to a real de_products column.
function toDbProductFields(updates) {
  const dbFields = {};
  for (const [key, value] of Object.entries(updates)) {
    if (key === 'categoryName') continue; // UI-only derived field
    const dbCol = PRODUCT_FIELD_TO_COLUMN[key] || key;
    dbFields[dbCol] = value;
  }
  return dbFields;
}

function formatDbHeroSlide(s) {
  return {
    id: s.id,
    eyebrow: s.eyebrow,
    heading: s.heading,
    subheading: s.subheading,
    cta: s.cta,
    ctaSecondary: s.cta_secondary || s.ctaSecondary,
    image: s.image,
    sortOrder: s.sort_order ?? s.sortOrder,
    isActive: s.is_active ?? s.isActive ?? true,
    createdAt: s.created_at || s.createdAt,
  };
}

function toDbHeroSlideFields(updates) {
  const dbFields = {};
  for (const [key, value] of Object.entries(updates)) {
    if (key === 'ctaSecondary') dbFields.cta_secondary = value;
    else if (key === 'sortOrder') dbFields.sort_order = value;
    else if (key === 'isActive') dbFields.is_active = value;
    else dbFields[key] = value;
  }
  return dbFields;
}

export function AppProvider({ children }) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('de_admin_session') === 'true';
  });
  const [authLoading, setAuthLoading] = useState(!!supabase);
  const [loginError, setLoginError] = useState('');

  // Catalog state - populated strictly from the cloud database (Supabase)
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [heroSlides, setHeroSlides] = useState([]);
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [manifesto, setManifesto] = useState(initialManifesto);
  const [pendingTestimonials, setPendingTestimonials] = useState([]);

  // Client-only state (persists in browser for shopper convenience)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('de_cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('de_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [toast, setToast] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // One-time cleanup: remove any old prototype catalog keys from browser storage
  useEffect(() => {
    ['de_products', 'de_categories', 'de_hero_slides', 'de_testimonials', 'de_pending_testimonials', 'de_subscribers', 'de_gallery_photos', 'de_manifesto'].forEach(k => {
      try { localStorage.removeItem(k); } catch {}
    });
  }, []);

  // Save cart & wishlist changes to browser
  useEffect(() => {
    try { localStorage.setItem('de_cart', JSON.stringify(cart)); } catch {}
  }, [cart]);

  useEffect(() => {
    try { localStorage.setItem('de_wishlist', JSON.stringify(wishlist)); } catch {}
  }, [wishlist]);

  const showToast = useCallback((message, type = 'default', icon = null) => {
    setToast({ message, type, icon });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Fetch initial data from Backend API or Supabase
  useEffect(() => {
    const loadData = async () => {
      let catList = [];

      // 1. Categories
      try {
        const catData = await api.getCategories();
        if (Array.isArray(catData)) {
          catList = catData;
          setCategories(catData);
        }
      } catch (e) {
        console.warn('Failed to load categories from API:', e.message);
      }

      // 2. Products
      try {
        const prodData = await api.getProducts();
        if (Array.isArray(prodData)) {
          const formatted = prodData.map(p => formatDbProduct(p, catList));
          setProducts(formatted);
        }
      } catch (e) {
        console.warn('Failed to load products from API:', e.message);
      }

      // 3. Hero Slides
      try {
        const heroData = await api.getHeroSlides();
        if (Array.isArray(heroData)) {
          const formatted = heroData.map(formatDbHeroSlide);
          setHeroSlides(formatted);
        }
      } catch (e) {
        console.warn('Failed to load hero slides from API:', e.message);
      }

      // 4. Testimonials
      try {
        const testData = await api.getTestimonials(true);
        if (Array.isArray(testData)) {
          setTestimonials(testData.filter(t => t.is_approved));
          setPendingTestimonials(testData.filter(t => !t.is_approved));
        }
      } catch (e) {
        console.warn('Failed to load testimonials from API:', e.message);
      }

      // 5. Subscribers
      try {
        const subData = await api.getSubscribers();
        if (Array.isArray(subData)) {
          setSubscribers(subData);
        }
      } catch (e) {
        console.warn('Failed to load subscribers from API:', e.message);
      }

      // 6. Manifesto
      try {
        const maniData = await api.getManifesto();
        if (maniData && typeof maniData === 'object') {
          setManifesto(maniData);
        }
      } catch (e) {
        console.warn('Failed to load manifesto from API:', e.message);
      }

      // 7. Gallery Photos
      try {
        const galData = await api.getGalleryPhotos();
        if (Array.isArray(galData)) {
          setGalleryPhotos(galData);
        }
      } catch (e) {
        console.warn('Failed to load gallery photos from API:', e.message);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const loggedIn = !!session;
      setIsAdminLoggedIn(loggedIn);
      if (loggedIn) {
        localStorage.setItem('de_admin_session', 'true');
      } else {
        localStorage.removeItem('de_admin_session');
      }
      setAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Orders are RLS-gated to authenticated users, so they can only be fetched
  // once an admin session exists - refetch whenever login state flips on.
  useEffect(() => {
    if (!supabase || !isAdminLoggedIn) return;

    const loadOrders = async () => {
      const { data, error } = await supabase
        .from('de_orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching orders from Supabase:', error.message);
        return;
      }
      if (data) setOrders(data);
    };

    loadOrders();
  }, [isAdminLoggedIn]);

  // Inactive hero slides are hidden from the public RLS policy, so an admin
  // session needs its own fetch to manage the full set, not just the live ones.
  useEffect(() => {
    if (!supabase || !isAdminLoggedIn) return;

    const loadAllHeroSlides = async () => {
      const { data, error } = await supabase
        .from('de_hero_slides')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) {
        console.error('Error fetching hero slides from Supabase:', error.message);
        return;
      }
      if (data) setHeroSlides(data.map(formatDbHeroSlide));
    };

    loadAllHeroSlides();
  }, [isAdminLoggedIn]);

  // Pending review moderation queue - same RLS gating as orders (the public
  // select policy only returns is_approved = true, so unapproved rows are
  // invisible until an admin session queries with the authenticated policy).
  const refreshPendingTestimonials = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('de_testimonials')
      .select('*')
      .eq('is_approved', false)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching pending testimonials:', error.message);
      return;
    }
    if (data) setPendingTestimonials(data);
  }, []);

  useEffect(() => {
    if (!supabase || !isAdminLoggedIn) return;
    refreshPendingTestimonials();
  }, [isAdminLoggedIn, refreshPendingTestimonials]);

  const adminLogin = useCallback(async (usernameOrEmail, password) => {
    setLoginError('');

    // With a real backend configured, Supabase auth is the only path: writes
    // are RLS-gated on an authenticated Supabase session, so a local-only
    // credential check would "log in" an admin whose every write then fails.
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: usernameOrEmail,
          password: password,
        });

        if (error) throw error;

        if (data?.user) {
          setIsAdminLoggedIn(true);
          localStorage.setItem('de_admin_session', 'true');
          showToast('Welcome back, Admin!', 'success');
          return true;
        }
      } catch (err) {
        console.error('Auth error:', err.message);
      }

      setLoginError('Invalid credentials. Please try again.');
      return false;
    }

    const normalizedUser = (usernameOrEmail || '').trim().toLowerCase();
    const isMatched = (
      (normalizedUser === adminCredentials.username.toLowerCase() ||
       normalizedUser === 'admin@decreatives.com' ||
       normalizedUser === 'admin') &&
      password === adminCredentials.password
    );

    if (isMatched) {
      setIsAdminLoggedIn(true);
      setAuthLoading(false);
      localStorage.setItem('de_admin_session', 'true');
      showToast('Welcome back, Admin!', 'success');
      return true;
    }

    setLoginError('Invalid credentials. Please try again.');
    return false;
  }, [showToast]);

  const adminLogout = useCallback(async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Error signing out:', err.message);
      }
    }
    setIsAdminLoggedIn(false);
    localStorage.removeItem('de_admin_session');
    showToast('Logged out successfully.', 'default');
  }, [showToast]);

  // Uploads real files to Supabase Storage and returns their public URLs, in
  // the same order given - order matters, since images[0] is the cover shown
  // on product cards and the storefront grid. Falls back to local data URLs
  // in mock mode, where there's no backend to actually store files in.
  const uploadProductImages = useCallback(async (files) => {
    if (!files || files.length === 0) return [];
    if (!supabase) {
      return Promise.all(files.map(file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      })));
    }
    const urls = [];
    for (const file of files) {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('product-images').upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from('product-images').getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    return urls;
  }, []);

  const addProduct = useCallback(async (product) => {
    const id = product.id || `p-${Date.now()}`;
    const newProduct = {
      ...product,
      id,
      sku: product.sku || `DE-${Date.now()}`,
      price: parseFloat(product.price) || 200,
      comparePrice: product.comparePrice ? parseFloat(product.comparePrice) : null,
      stock: parseInt(product.stock) || 0,
      isNew: product.isNew ?? true,
      isFeatured: product.isFeatured ?? false,
      isBestseller: product.isBestseller ?? false,
      colors: product.colors?.length > 0 ? product.colors : ['#0A0A0A'],
      colorNames: product.colorNames?.length > 0 ? product.colorNames : ['Default Jet Black'],
      sizes: product.sizes?.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL'],
      images: product.images || [],
      rating: 5.0,
      reviewCount: 0
    };

    try {
      await api.createProduct(newProduct);
    } catch (e) {
      if (supabase) {
        try {
          await supabase.from('de_products').insert([toDbProductFields(newProduct)]);
        } catch (sErr) { console.error('Supabase write error:', sErr); }
      }
    }

    const formatted = formatDbProduct(newProduct, categories);
    setProducts(prev => [formatted, ...prev.filter(p => p.id !== id)]);
    showToast(`"${product.name}" added successfully!`, 'success');
  }, [categories, showToast]);

  const updateProduct = useCallback(async (id, updates) => {
    try {
      await api.updateProduct({ id, ...updates });
    } catch (e) {
      if (supabase) {
        try {
          await supabase.from('de_products').update(toDbProductFields(updates)).eq('id', id);
        } catch (sErr) { console.error('Supabase write error:', sErr); }
      }
    }

    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const merged = { ...p, ...updates };
        if ('category' in updates) {
          merged.categoryName = categories.find(c => c.id === updates.category)?.name || 'Uncategorized';
        }
        return merged;
      }
      return p;
    }));
    showToast('Product updated successfully!', 'success');
  }, [categories, showToast]);

  const deleteProduct = useCallback(async (id) => {
    const product = products.find(p => p.id === id);
    try {
      await api.deleteProduct(id);
    } catch (e) {
      if (supabase) {
        try {
          await supabase.from('de_products').delete().eq('id', id);
        } catch (sErr) { console.error('Supabase delete error:', sErr); }
      }
    }

    setProducts(prev => prev.filter(p => p.id !== id));
    showToast(`"${product?.name || 'Product'}" removed.`, 'danger');
  }, [products, showToast]);

  const addCategory = useCallback(async (category) => {
    const id = category.id || `cat-${Date.now()}`;
    const newCat = {
      ...category,
      id,
      slug: category.slug || category.name.toLowerCase().replace(/\s+/g, '-'),
      description: category.description || '',
      image: category.image || '',
    };

    try {
      await api.createCategory(newCat);
    } catch (e) {
      if (supabase) {
        try {
          await supabase.from('de_categories').insert([newCat]);
        } catch (sErr) { console.error('Supabase write error:', sErr); }
      }
    }

    setCategories(prev => [...prev.filter(c => c.id !== id), newCat]);
    showToast(`Category "${category.name}" added!`, 'success');
  }, [showToast]);

  const updateCategory = useCallback(async (id, updates) => {
    try {
      await api.updateCategory({ id, ...updates });
    } catch (e) {
      if (supabase) {
        try {
          await supabase.from('de_categories').update(updates).eq('id', id);
        } catch (sErr) { console.error('Supabase write error:', sErr); }
      }
    }

    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    showToast('Category updated!', 'success');
  }, [showToast]);

  const deleteCategory = useCallback(async (id) => {
    const cat = categories.find(c => c.id === id);
    try {
      await api.deleteCategory(id);
    } catch (e) {
      if (supabase) {
        try {
          await supabase.from('de_categories').delete().eq('id', id);
        } catch (sErr) { console.error('Supabase delete error:', sErr); }
      }
    }

    setCategories(prev => prev.filter(c => c.id !== id));
    showToast(`Category "${cat?.name || 'Category'}" removed.`, 'danger');
  }, [categories, showToast]);

  const addHeroSlide = useCallback(async (slide) => {
    const sortOrder = heroSlides.length > 0 ? Math.max(...heroSlides.map(s => s.sortOrder ?? 0)) + 1 : 0;
    const id = slide.id || `hero-${Date.now()}`;
    const newSlide = {
      ...slide,
      id,
      eyebrow: slide.eyebrow || 'DE CREATIVES',
      heading: slide.heading || 'DEFINE YOUR CREATIVE',
      subheading: slide.subheading || '',
      cta: slide.cta || 'Shop The Drop',
      ctaSecondary: slide.ctaSecondary || '',
      image: slide.image || '',
      sortOrder,
      isActive: slide.isActive ?? true,
    };

    try {
      await api.createHeroSlide(newSlide);
    } catch (e) {
      if (supabase) {
        try {
          await supabase.from('de_hero_slides').insert([toDbHeroSlideFields(newSlide)]);
        } catch (sErr) { console.error('Supabase write error:', sErr); }
      }
    }

    setHeroSlides(prev => [...prev.filter(s => s.id !== id), newSlide]);
    showToast('Hero slide added!', 'success');
  }, [heroSlides, showToast]);

  const updateHeroSlide = useCallback(async (id, updates) => {
    try {
      await api.updateHeroSlide({ id, ...updates });
    } catch (e) {
      if (supabase) {
        try {
          await supabase.from('de_hero_slides').update(toDbHeroSlideFields(updates)).eq('id', id);
        } catch (sErr) { console.error('Supabase write error:', sErr); }
      }
    }

    setHeroSlides(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    showToast('Hero slide updated!', 'success');
  }, [showToast]);

  const deleteHeroSlide = useCallback(async (id) => {
    try {
      await api.deleteHeroSlide(id);
    } catch (e) {
      if (supabase) {
        try {
          await supabase.from('de_hero_slides').delete().eq('id', id);
        } catch (sErr) { console.error('Supabase delete error:', sErr); }
      }
    }

    setHeroSlides(prev => prev.filter(s => s.id !== id));
    showToast('Hero slide removed.', 'danger');
  }, [showToast]);

  // Swaps sort_order with the adjacent slide (by current array position) to
  // move a slide up (-1) or down (+1) in the homepage carousel.
  const reorderHeroSlide = useCallback(async (id, direction) => {
    const sorted = [...heroSlides].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const index = sorted.findIndex(s => s.id === id);
    const targetIndex = index + direction;
    if (index === -1 || targetIndex < 0 || targetIndex >= sorted.length) return;

    const current = sorted[index];
    const target = sorted[targetIndex];
    const currentOrder = current.sortOrder ?? 0;
    const targetOrder = target.sortOrder ?? 0;

    if (supabase) {
      try {
        const { error: err1 } = await supabase.from('de_hero_slides').update({ sort_order: targetOrder }).eq('id', current.id);
        if (err1) throw err1;
        const { error: err2 } = await supabase.from('de_hero_slides').update({ sort_order: currentOrder }).eq('id', target.id);
        if (err2) throw err2;

        setHeroSlides(prev => prev.map(s => {
          if (s.id === current.id) return { ...s, sortOrder: targetOrder };
          if (s.id === target.id) return { ...s, sortOrder: currentOrder };
          return s;
        }));
      } catch (err) {
        console.error('Error reordering hero slides:', err.message);
        showToast(`Failed to reorder: ${err.message}`, 'danger');
      }
    } else {
      setHeroSlides(prev => {
        return prev.map(s => {
          if (s.id === current.id) return { ...s, sortOrder: targetOrder };
          if (s.id === target.id) return { ...s, sortOrder: currentOrder };
          return s;
        });
      });
    }
  }, [heroSlides, showToast]);

  const resetProductsToDefault = useCallback(() => {
    setProducts(initialProducts);
    showToast('Products restored to default.', 'default');
  }, [showToast]);

  const resetCategoriesToDefault = useCallback(() => {
    setCategories(initialCategories);
    showToast('Categories restored to default.', 'default');
  }, [showToast]);

  const resetHeroSlidesToDefault = useCallback(() => {
    setHeroSlides(initialHeroSlides);
    showToast('Hero slides restored to default.', 'default');
  }, [showToast]);

  const clearAllForOnboarding = useCallback(async () => {
    try {
      await api.deleteGalleryPhoto('all');
    } catch (e) {
      console.warn('API error clearing gallery:', e.message);
    }
    setProducts([]);
    setCategories([]);
    setHeroSlides([]);
    setGalleryPhotos([]);
    showToast('Catalog & Lookbook cleared! Ready for fresh onboarding.', 'success');
  }, [showToast]);

  // Public - any visitor can submit a review.
  const submitTestimonial = useCallback(async ({ name, location, text, rating }) => {
    const generatedId = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : '00000000-0000-4000-8000-' + Date.now().toString(16).padStart(12, '0');

    const newTestimonial = {
      id: generatedId,
      name,
      location: location || null,
      text,
      rating: Number(rating) || 5,
      is_approved: false,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { error } = await supabase.from('de_testimonials').insert([{
          id: generatedId,
          name,
          location: location || null,
          text,
          rating: Number(rating) || 5,
          is_approved: false,
        }]);
        if (error) console.warn('Supabase testimonial insert warning:', error.message);
      } catch (err) {
        console.warn('Supabase testimonial insert error:', err.message);
      }
    }

    setPendingTestimonials(prev => [newTestimonial, ...prev]);

    showToast('Thanks for sharing! Your review will appear once approved.', 'success');
    return true;
  }, [showToast]);

  // Admin-only moderation actions.
  const approveTestimonial = useCallback(async (id) => {
    const idStr = String(id);
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idStr);

    if (supabase && isUuid) {
      try {
        const { error } = await supabase.from('de_testimonials').update({ is_approved: true }).eq('id', id);
        if (error) console.warn('Supabase testimonial update warning:', error.message);
      } catch (err) {
        console.warn('Supabase testimonial update error:', err.message);
      }
    }

    setPendingTestimonials(prev => {
      const target = prev.find(t => String(t.id) === idStr);
      const remaining = prev.filter(t => String(t.id) !== idStr);
      if (target) {
        setTestimonials(tList => [{ ...target, is_approved: true }, ...tList]);
      }
      return remaining;
    });

    showToast('Review approved and now live.', 'success');
  }, [showToast]);

  // Handles both rejecting a pending review and removing an already-live one.
  const rejectTestimonial = useCallback(async (id) => {
    const idStr = String(id);
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idStr);

    if (supabase && isUuid) {
      try {
        const { error } = await supabase.from('de_testimonials').delete().eq('id', id);
        if (error) console.warn('Supabase testimonial delete warning:', error.message);
      } catch (err) {
        console.warn('Supabase testimonial delete error:', err.message);
      }
    }

    setPendingTestimonials(prev => prev.filter(t => String(t.id) !== idStr));
    setTestimonials(prev => prev.filter(t => String(t.id) !== idStr));

    showToast('Review removed.', 'default');
  }, [showToast]);

  const resetTestimonials = useCallback(() => {
    setTestimonials(initialTestimonials);
    setPendingTestimonials([]);
    showToast('Reviews reset to default.', 'default');
  }, [showToast]);

  // Newsletter / Clan Subscriptions
  const subscribeToClan = useCallback(async (email, type = 'all') => {
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address.', 'warning');
      return false;
    }

    const newSub = {
      id: `sub-${Date.now()}`,
      email: email.trim().toLowerCase(),
      type: type || 'all',
      created_at: new Date().toISOString(),
    };

    try {
      if (supabase) {
        const { error } = await supabase.from('de_subscribers').insert([{
          email: newSub.email,
          type: newSub.type,
        }]);
        if (error && !error.message?.includes('duplicate')) {
          console.warn('Supabase subscription warning:', error.message);
        }
      }

      setSubscribers(prev => {
        const exists = prev.some(s => s.email === newSub.email);
        return exists ? prev : [newSub, ...prev];
      });

      return true;
    } catch (err) {
      console.error('Subscribe error:', err);
      setSubscribers(prev => {
        const exists = prev.some(s => s.email === newSub.email);
        return exists ? prev : [newSub, ...prev];
      });
      return true;
    }
  }, [showToast]);

  const deleteSubscriber = useCallback(async (id, email) => {
    try {
      if (supabase && email) {
        await supabase.from('de_subscribers').delete().eq('email', email);
      }
      setSubscribers(prev => prev.filter(s => s.id !== id && s.email !== email));
      showToast('Subscriber removed.', 'default');
    } catch (err) {
      console.error('Delete subscriber error:', err.message);
      showToast('Failed to delete subscriber.', 'danger');
    }
  }, [showToast]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  const addToCart = useCallback((product, size, color, fit = 'Regular Fit', priceOverride = null) => {
    const finalPrice = priceOverride !== null ? priceOverride : (fit === 'Drop Shoulder Fit' ? 250 : product.price);
    const cartId = `${product.id}-${size}-${color}-${fit}`;

    setCart(prev => {
      const existing = prev.find(i => i.cartId === cartId);
      if (existing) {
        return prev.map(i =>
          i.cartId === cartId ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, {
        ...product,
        size,
        color,
        fit,
        price: finalPrice,
        qty: 1,
        cartId
      }];
    });
    setIsCartOpen(true); // Auto-open cart drawer
    showToast('Added to bag!', 'success');
  }, [showToast]);

  const removeFromCart = useCallback((cartId) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
    showToast('Removed from bag', 'default');
  }, [showToast]);

  const updateCartQty = useCallback((cartId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartId);
      return;
    }
    setCart(prev => prev.map(item =>
      item.cartId === cartId ? { ...item, qty: newQty } : item
    ));
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const toggleWishlist = useCallback((product) => {
    setWishlist(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        showToast('Removed from wishlist', 'default');
        return prev.filter(p => p.id !== product.id);
      }
      setIsWishlistOpen(true); // Auto-open wishlist drawer
      showToast('Added to wishlist!', 'success');
      return [...prev, product];
    });
  }, [showToast]);

  const isInWishlist = useCallback((id) => wishlist.some(p => p.id === id), [wishlist]);

  // Store operates in Ghana Cedis (GH₵)
  const formatPrice = useCallback((priceInGhs) => {
    return `GH₵ ${(Number(priceInGhs) || 0).toFixed(2)}`;
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const sortedHeroSlides = [...heroSlides].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const filteredProducts = products.filter(p => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // Gallery Management
  const addGalleryPhoto = useCallback(async (photo) => {
    const id = photo.id ? String(photo.id) : `photo-${Date.now()}`;
    const newPhoto = { ...photo, id };
    try {
      await api.createGalleryPhoto(newPhoto);
    } catch (e) {
      console.warn('API error adding gallery photo:', e.message);
    }
    setGalleryPhotos(prev => [newPhoto, ...prev.filter(p => p.id !== id)]);
    showToast('Photo added to The Gallery of DE!', 'success');
  }, [showToast]);

  const updateGalleryPhoto = useCallback(async (id, updatedFields) => {
    const payload = { id, ...updatedFields };
    try {
      await api.updateGalleryPhoto(payload);
    } catch (e) {
      console.warn('API error updating gallery photo:', e.message);
    }
    setGalleryPhotos(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
    showToast('Gallery photo updated!', 'success');
  }, [showToast]);

  const deleteGalleryPhoto = useCallback(async (id) => {
    try {
      await api.deleteGalleryPhoto(id);
    } catch (e) {
      console.warn('API error deleting gallery photo:', e.message);
    }
    setGalleryPhotos(prev => prev.filter(p => p.id !== id));
    showToast('Gallery photo removed.', 'default');
  }, [showToast]);

  const resetGalleryPhotos = useCallback(() => {
    setGalleryPhotos(initialGalleryPhotos);
    showToast('Gallery reset to default.', 'default');
  }, [showToast]);

  // Manifesto / Clan of DE Management
  const updateManifesto = useCallback(async (newManifestoData) => {
    setManifesto(newManifestoData);
    try {
      await api.saveManifesto(newManifestoData);
    } catch (e) {
      console.warn('API error saving manifesto:', e.message);
    }
    showToast('Clan of DE content updated successfully!', 'success');
  }, [showToast]);

  const resetManifesto = useCallback(() => {
    setManifesto(initialManifesto);
    showToast('Clan of DE reset to default.', 'default');
  }, [showToast]);

  return (
    <AppContext.Provider value={{
      isAdminLoggedIn, authLoading, loginError, adminLogin, adminLogout,
      products, categories, orders, cart, cartCount, wishlist, toast,
      testimonials, pendingTestimonials, submitTestimonial, approveTestimonial, rejectTestimonial, resetTestimonials,
      refreshPendingTestimonials,
      subscribers, subscribeToClan, deleteSubscriber,
      activeCategory, setActiveCategory,
      searchQuery, setSearchQuery,
      filteredProducts, showToast,
      addProduct, updateProduct, deleteProduct, uploadProductImages, resetProductsToDefault,
      addCategory, updateCategory, deleteCategory, resetCategoriesToDefault,
      heroSlides: sortedHeroSlides, addHeroSlide, updateHeroSlide, deleteHeroSlide, reorderHeroSlide, resetHeroSlidesToDefault,
      clearAllForOnboarding,
      galleryPhotos, addGalleryPhoto, updateGalleryPhoto, deleteGalleryPhoto, resetGalleryPhotos,
      manifesto, updateManifesto, resetManifesto,
      addToCart, toggleWishlist, isInWishlist,
      removeFromCart, updateCartQty, clearCart,
      formatPrice,
      isCartOpen, setIsCartOpen,
      isWishlistOpen, setIsWishlistOpen,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
