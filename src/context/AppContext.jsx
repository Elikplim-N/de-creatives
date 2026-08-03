import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { products as initialProducts, categories as initialCategories, testimonials as initialTestimonials, heroSlides as initialHeroSlides, adminCredentials } from '../data/mockData';
import { supabase } from '../lib/supabaseClient';

const AppContext = createContext(null);

// Bridges de_products' snake_case DB columns to the camelCase fields the
// storefront and admin UI read (reviewCount, isNew, isFeatured, isBestseller,
// comparePrice), plus the category name lookup both callers need.
function formatDbProduct(p, categoryList) {
  return {
    ...p,
    category: p.category_id,
    categoryName: categoryList?.find(c => c.id === p.category_id)?.name || 'Uncategorized',
    comparePrice: p.compare_price,
    reviewCount: p.review_count,
    isNew: p.is_new,
    isFeatured: p.is_featured,
    isBestseller: p.is_bestseller,
    colorNames: p.color_names,
  };
}

// Inverse of formatDbProduct - maps an admin-form update (camelCase, plus the
// UI-only categoryName field) to real de_products columns. `images` is
// already a plain array of Storage URLs by the time it gets here.
const PRODUCT_FIELD_TO_COLUMN = {
  category: 'category_id',
  comparePrice: 'compare_price',
  isNew: 'is_new',
  isFeatured: 'is_featured',
  isBestseller: 'is_bestseller',
  colorNames: 'color_names',
};
const PRODUCT_UI_ONLY_FIELDS = new Set(['categoryName']);

function toDbProductFields(fields) {
  const dbFields = {};
  for (const [key, value] of Object.entries(fields)) {
    if (PRODUCT_UI_ONLY_FIELDS.has(key)) continue;
    dbFields[PRODUCT_FIELD_TO_COLUMN[key] || key] = value;
  }
  if ('category' in fields) dbFields.category_id = fields.category || null;
  return dbFields;
}

// Bridges de_hero_slides' snake_case DB columns to the camelCase fields the
// Hero carousel and admin form read.
function formatDbHeroSlide(s) {
  return {
    ...s,
    ctaSecondary: s.cta_secondary,
    sortOrder: s.sort_order,
    isActive: s.is_active,
  };
}

const HERO_SLIDE_FIELD_TO_COLUMN = {
  ctaSecondary: 'cta_secondary',
  sortOrder: 'sort_order',
  isActive: 'is_active',
};

function toDbHeroSlideFields(fields) {
  const dbFields = {};
  for (const [key, value] of Object.entries(fields)) {
    dbFields[HERO_SLIDE_FIELD_TO_COLUMN[key] || key] = value;
  }
  return dbFields;
}

export function AppProvider({ children }) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(!!supabase);
  const [loginError, setLoginError] = useState('');
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [orders, setOrders] = useState([]);
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [heroSlides, setHeroSlides] = useState(initialHeroSlides);
  const [pendingTestimonials, setPendingTestimonials] = useState([]);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [toast, setToast] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const showToast = useCallback((message, type = 'default', icon = null) => {
    setToast({ message, type, icon });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Fetch initial data from Supabase if available
  useEffect(() => {
    if (!supabase) return;

    const loadData = async () => {
      try {
        // Fetch Categories from de_categories
        const { data: catData, error: catError } = await supabase
          .from('de_categories')
          .select('*');
        if (catError) throw catError;
        if (catData) setCategories(catData);

        // Fetch Products from de_products
        const { data: prodData, error: prodError } = await supabase
          .from('de_products')
          .select('*');
        if (prodError) throw prodError;
        if (prodData) {
          setProducts(prodData.map(p => formatDbProduct(p, catData)));
        }

        // Fetch approved Testimonials from de_testimonials (RLS hides
        // pending/rejected ones from anonymous visitors already, but order
        // + limit keep the storefront section tidy).
        const { data: testData, error: testError } = await supabase
          .from('de_testimonials')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(9);
        if (testError) throw testError;
        if (testData) setTestimonials(testData);

        // Fetch Hero Slides from de_hero_slides (anon RLS returns active
        // ones only; an admin session refetches the full set separately)
        const { data: heroData, error: heroError } = await supabase
          .from('de_hero_slides')
          .select('*')
          .order('sort_order', { ascending: true });
        if (heroError) throw heroError;
        if (heroData) setHeroSlides(heroData.map(formatDbHeroSlide));
      } catch (err) {
        console.error('Error fetching data from Supabase:', err.message);
        showToast('Connected but failed to fetch data from Supabase. Using mock data.', 'warning');
      }
    };

    loadData();

    // Listen for auth state changes to keep dashboard synced.
    // The first callback fires with the restored session (or null) before
    // any user interaction, so it also tells us when the initial check is done.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAdminLoggedIn(!!session);
      setAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [showToast]);

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
          showToast('Welcome back, Admin!', 'success');
          return true;
        }
      } catch (err) {
        console.error('Auth error:', err.message);
      }

      setLoginError('Invalid credentials. Please try again.');
      return false;
    }

    // No backend configured (local/dev mock-data mode) - fall back to the
    // hardcoded demo credentials so the admin UI is still reachable.
    if (usernameOrEmail === adminCredentials.username && password === adminCredentials.password) {
      setIsAdminLoggedIn(true);
      setAuthLoading(false);
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
        setIsAdminLoggedIn(false);
        showToast('Logged out successfully.', 'default');
      } catch (err) {
        console.error('Error signing out:', err.message);
      }
    } else {
      setIsAdminLoggedIn(false);
    }
  }, [showToast]);

  const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80';

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
    if (supabase) {
      try {
        const id = `p-${Date.now()}`;
        const newProductDb = {
          ...toDbProductFields(product),
          id,
          sku: product.sku || `DE-${Date.now()}`,
          price: parseFloat(product.price),
          compare_price: product.comparePrice ? parseFloat(product.comparePrice) : null,
          stock: parseInt(product.stock) || 0,
          is_new: product.isNew ?? true,
          is_featured: product.isFeatured ?? false,
          is_bestseller: product.isBestseller ?? false,
          colors: product.colors?.length > 0 ? product.colors : ['#0A0A0A'],
          color_names: product.colorNames?.length > 0 ? product.colorNames : ['Default Jet Black'],
          sizes: product.sizes?.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL'],
          images: product.images?.length > 0 ? product.images : [DEFAULT_PRODUCT_IMAGE],
          rating: 5.0,
          review_count: 0
        };

        const { error } = await supabase.from('de_products').insert([newProductDb]);
        if (error) throw error;

        // update local state
        setProducts(prev => [formatDbProduct(newProductDb, categories), ...prev]);

        showToast(`"${product.name}" added to Supabase!`, 'success');
      } catch (err) {
        console.error('Error adding product:', err.message);
        showToast(`Failed to add product: ${err.message}`, 'danger');
      }
    } else {
      // Mock mode
      const newProduct = {
        ...product,
        id: `p-${Date.now()}`,
        sku: product.sku || `DE-${Date.now()}`,
        rating: 0, reviewCount: 0,
        isNew: product.isNew ?? true,
        isFeatured: product.isFeatured ?? false,
        isBestseller: product.isBestseller ?? false,
        images: product.images?.length > 0 ? product.images : [DEFAULT_PRODUCT_IMAGE],
        colors: product.colors?.length > 0 ? product.colors : ['#1A1A1A'],
        colorNames: product.colorNames?.length > 0 ? product.colorNames : ['Default'],
      };
      setProducts(prev => [newProduct, ...prev]);
      showToast(`"${product.name}" added successfully!`, 'success');
    }
  }, [categories, showToast]);

  const updateProduct = useCallback(async (id, updates) => {
    if (supabase) {
      try {
        const dbUpdates = toDbProductFields(updates);

        const { error } = await supabase.from('de_products').update(dbUpdates).eq('id', id);
        if (error) throw error;

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
        showToast('Product updated in Supabase!', 'success');
      } catch (err) {
        console.error('Error updating product:', err.message);
        showToast(`Failed to update product: ${err.message}`, 'danger');
      }
    } else {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      showToast('Product updated successfully!', 'success');
    }
  }, [categories, showToast]);

  const deleteProduct = useCallback(async (id) => {
    const product = products.find(p => p.id === id);
    if (supabase) {
      try {
        const { error } = await supabase.from('de_products').delete().eq('id', id);
        if (error) throw error;

        setProducts(prev => prev.filter(p => p.id !== id));
        showToast(`"${product?.name}" removed from Supabase.`, 'danger');
      } catch (err) {
        console.error('Error deleting product:', err.message);
        showToast(`Failed to delete product: ${err.message}`, 'danger');
      }
    } else {
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast(`"${product?.name}" removed.`, 'danger');
    }
  }, [products, showToast]);

  const addCategory = useCallback(async (category) => {
    if (supabase) {
      try {
        const id = `cat-${Date.now()}`;
        const newCat = {
          id,
          name: category.name,
          slug: category.slug || category.name.toLowerCase().replace(/\s+/g, '-'),
          description: category.description,
          image: category.image || null,
        };

        const { error } = await supabase.from('de_categories').insert([newCat]);
        if (error) throw error;

        setCategories(prev => [...prev, newCat]);
        showToast(`Category "${category.name}" added to Supabase!`, 'success');
      } catch (err) {
        console.error('Error adding category:', err.message);
        showToast(`Failed to add category: ${err.message}`, 'danger');
      }
    } else {
      const newCat = {
        ...category,
        id: `cat-${Date.now()}`,
        count: 0,
      };
      setCategories(prev => [...prev, newCat]);
      showToast(`Category "${category.name}" added!`, 'success');
    }
  }, [showToast]);

  const updateCategory = useCallback(async (id, updates) => {
    if (supabase) {
      try {
        const { error } = await supabase.from('de_categories').update(updates).eq('id', id);
        if (error) throw error;

        setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
        showToast('Category updated!', 'success');
      } catch (err) {
        console.error('Error updating category:', err.message);
        showToast(`Failed to update category: ${err.message}`, 'danger');
      }
    } else {
      setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
      showToast('Category updated!', 'success');
    }
  }, [showToast]);

  const deleteCategory = useCallback(async (id) => {
    const cat = categories.find(c => c.id === id);
    if (supabase) {
      try {
        const { error } = await supabase.from('de_categories').delete().eq('id', id);
        if (error) throw error;

        setCategories(prev => prev.filter(c => c.id !== id));
        showToast(`Category "${cat?.name}" removed from Supabase.`, 'danger');
      } catch (err) {
        console.error('Error deleting category:', err.message);
        showToast(`Failed to delete category: ${err.message}`, 'danger');
      }
    } else {
      setCategories(prev => prev.filter(c => c.id !== id));
      showToast(`Category "${cat?.name}" removed.`, 'danger');
    }
  }, [categories, showToast]);

  const addHeroSlide = useCallback(async (slide) => {
    const sortOrder = heroSlides.length > 0 ? Math.max(...heroSlides.map(s => s.sortOrder ?? 0)) + 1 : 0;
    if (supabase) {
      try {
        const id = `hero-${Date.now()}`;
        const newSlide = {
          id,
          eyebrow: slide.eyebrow || '',
          heading: slide.heading,
          subheading: slide.subheading || '',
          cta: slide.cta || '',
          cta_secondary: slide.ctaSecondary || '',
          image: slide.image || null,
          sort_order: sortOrder,
          is_active: slide.isActive ?? true,
        };

        const { error } = await supabase.from('de_hero_slides').insert([newSlide]);
        if (error) throw error;

        setHeroSlides(prev => [...prev, formatDbHeroSlide(newSlide)]);
        showToast('Hero slide added!', 'success');
      } catch (err) {
        console.error('Error adding hero slide:', err.message);
        showToast(`Failed to add hero slide: ${err.message}`, 'danger');
      }
    } else {
      const newSlide = { ...slide, id: `hero-${Date.now()}`, sortOrder, isActive: slide.isActive ?? true };
      setHeroSlides(prev => [...prev, newSlide]);
      showToast('Hero slide added!', 'success');
    }
  }, [heroSlides, showToast]);

  const updateHeroSlide = useCallback(async (id, updates) => {
    if (supabase) {
      try {
        const dbUpdates = toDbHeroSlideFields(updates);
        const { error } = await supabase.from('de_hero_slides').update(dbUpdates).eq('id', id);
        if (error) throw error;

        setHeroSlides(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
        showToast('Hero slide updated!', 'success');
      } catch (err) {
        console.error('Error updating hero slide:', err.message);
        showToast(`Failed to update hero slide: ${err.message}`, 'danger');
      }
    } else {
      setHeroSlides(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
      showToast('Hero slide updated!', 'success');
    }
  }, [showToast]);

  const deleteHeroSlide = useCallback(async (id) => {
    if (supabase) {
      try {
        const { error } = await supabase.from('de_hero_slides').delete().eq('id', id);
        if (error) throw error;

        setHeroSlides(prev => prev.filter(s => s.id !== id));
        showToast('Hero slide removed.', 'danger');
      } catch (err) {
        console.error('Error deleting hero slide:', err.message);
        showToast(`Failed to delete hero slide: ${err.message}`, 'danger');
      }
    } else {
      setHeroSlides(prev => prev.filter(s => s.id !== id));
      showToast('Hero slide removed.', 'danger');
    }
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
      setHeroSlides(prev => prev.map(s => {
        if (s.id === current.id) return { ...s, sortOrder: targetOrder };
        if (s.id === target.id) return { ...s, sortOrder: currentOrder };
        return s;
      }));
    }
  }, [heroSlides, showToast]);

  // Public - any visitor can submit a review. RLS forces is_approved=false
  // on every public insert regardless of what's sent, so this can't be used
  // to skip moderation even by a malicious direct API call.
  const submitTestimonial = useCallback(async ({ name, location, text, rating }) => {
    if (!supabase) {
      showToast('Reviews require a connected backend - not available in demo mode.', 'warning');
      return false;
    }
    try {
      const { error } = await supabase.from('de_testimonials').insert([{
        name, location: location || null, text, rating, is_approved: false,
      }]);
      if (error) throw error;
      showToast('Thanks for sharing! Your review will appear once approved.', 'success');
      return true;
    } catch (err) {
      console.error('Error submitting testimonial:', err.message);
      showToast(`Failed to submit review: ${err.message}`, 'danger');
      return false;
    }
  }, [showToast]);

  // Admin-only moderation actions (RLS requires an authenticated session).
  const approveTestimonial = useCallback(async (id) => {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('de_testimonials').update({ is_approved: true }).eq('id', id);
      if (error) throw error;
      setPendingTestimonials(prev => {
        const approved = prev.find(t => t.id === id);
        if (approved) setTestimonials(t => [{ ...approved, is_approved: true }, ...t]);
        return prev.filter(t => t.id !== id);
      });
      showToast('Review approved and now live.', 'success');
    } catch (err) {
      console.error('Error approving testimonial:', err.message);
      showToast(`Failed to approve review: ${err.message}`, 'danger');
    }
  }, [showToast]);

  // Handles both rejecting a pending review and removing an already-live one.
  const rejectTestimonial = useCallback(async (id) => {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('de_testimonials').delete().eq('id', id);
      if (error) throw error;
      setPendingTestimonials(prev => prev.filter(t => t.id !== id));
      setTestimonials(prev => prev.filter(t => t.id !== id));
      showToast('Review removed.', 'default');
    } catch (err) {
      console.error('Error removing testimonial:', err.message);
      showToast(`Failed to remove review: ${err.message}`, 'danger');
    }
  }, [showToast]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  const addToCart = useCallback((product, size, color) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id && i.size === size && i.color === color);
      if (existing) return prev.map(i =>
        i.id === product.id && i.size === size && i.color === color
          ? { ...i, qty: i.qty + 1 } : i
      );
      return [...prev, { ...product, size, color, qty: 1, cartId: `${product.id}-${size}-${color}` }];
    });
    setIsCartOpen(true); // Auto-open cart drawer
    showToast('Added to cart!', 'success');
  }, [showToast]);

  const removeFromCart = useCallback((cartId) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
    showToast('Removed from cart', 'default');
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

  // Store operates in USD only - no multi-currency conversion.
  const formatPrice = useCallback((priceInUsd) => {
    return `$${(priceInUsd || 0).toFixed(2)}`;
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const sortedHeroSlides = [...heroSlides].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const filteredProducts = products.filter(p => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <AppContext.Provider value={{
      isAdminLoggedIn, authLoading, loginError, adminLogin, adminLogout,
      products, categories, orders, cart, cartCount, wishlist, toast,
      testimonials, pendingTestimonials, submitTestimonial, approveTestimonial, rejectTestimonial,
      refreshPendingTestimonials,
      activeCategory, setActiveCategory,
      searchQuery, setSearchQuery,
      filteredProducts, showToast,
      addProduct, updateProduct, deleteProduct, uploadProductImages,
      addCategory, updateCategory, deleteCategory,
      heroSlides: sortedHeroSlides, addHeroSlide, updateHeroSlide, deleteHeroSlide, reorderHeroSlide,
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
