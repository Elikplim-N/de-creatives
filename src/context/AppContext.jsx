import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { products as initialProducts, categories as initialCategories, testimonials as initialTestimonials, adminCredentials } from '../data/mockData';
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
  };
}

// Inverse of formatDbProduct - maps an admin-form update (camelCase, plus
// UI-only fields like categoryName/imagePreview) to real de_products columns.
const PRODUCT_FIELD_TO_COLUMN = {
  category: 'category_id',
  comparePrice: 'compare_price',
  isNew: 'is_new',
  isFeatured: 'is_featured',
  isBestseller: 'is_bestseller',
};
const PRODUCT_UI_ONLY_FIELDS = new Set(['categoryName', 'imagePreview']);

function toDbProductUpdates(updates) {
  const dbUpdates = {};
  for (const [key, value] of Object.entries(updates)) {
    if (PRODUCT_UI_ONLY_FIELDS.has(key)) continue;
    dbUpdates[PRODUCT_FIELD_TO_COLUMN[key] || key] = value;
  }
  if ('category' in updates) dbUpdates.category_id = updates.category || null;
  if (updates.imagePreview) dbUpdates.images = [updates.imagePreview];
  return dbUpdates;
}

export function AppProvider({ children }) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(!!supabase);
  const [loginError, setLoginError] = useState('');
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [orders, setOrders] = useState([]);
  const [testimonials, setTestimonials] = useState(initialTestimonials);
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

  const addProduct = useCallback(async (product) => {
    if (supabase) {
      try {
        const id = `p-${Date.now()}`;
        const newProductDb = {
          id,
          sku: product.sku || `DE-${Date.now()}`,
          name: product.name,
          category_id: product.category || null,
          price: parseFloat(product.price),
          compare_price: product.comparePrice ? parseFloat(product.comparePrice) : null,
          description: product.description,
          stock: parseInt(product.stock) || 0,
          is_new: true,
          is_featured: false,
          is_bestseller: false,
          colors: ['#0A0A0A'],
          color_names: ['Default Jet Black'],
          sizes: ['S', 'M', 'L', 'XL'],
          images: product.imagePreview ? [product.imagePreview] : ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80'],
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
        isNew: true, isFeatured: false, isBestseller: false,
        images: product.imagePreview ? [product.imagePreview] : ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80'],
        colors: ['#1A1A1A'], colorNames: ['Default'],
      };
      setProducts(prev => [newProduct, ...prev]);
      showToast(`"${product.name}" added successfully!`, 'success');
    }
  }, [categories, showToast]);

  const updateProduct = useCallback(async (id, updates) => {
    if (supabase) {
      try {
        const dbUpdates = toDbProductUpdates(updates);

        const { error } = await supabase.from('de_products').update(dbUpdates).eq('id', id);
        if (error) throw error;

        setProducts(prev => prev.map(p => {
          if (p.id === id) {
            const merged = { ...p, ...updates };
            if ('category' in updates) {
              merged.categoryName = categories.find(c => c.id === updates.category)?.name || 'Uncategorized';
            }
            if (updates.imagePreview) {
              merged.images = [updates.imagePreview];
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
          description: category.description
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

  // Currency State and Helpers
  const [currency, setCurrency] = useState('USD');

  const currencies = {
    USD: { symbol: '$', rate: 1.0, label: 'USD' },
    GHS: { symbol: 'GH₵ ', rate: 15.20, label: 'GHS' },
    EUR: { symbol: '€', rate: 0.92, label: 'EUR' },
    GBP: { symbol: '£', rate: 0.78, label: 'GBP' }
  };

  const formatPrice = useCallback((priceInUsd) => {
    const cur = currencies[currency] || currencies.USD;
    const converted = (priceInUsd || 0) * cur.rate;
    return `${cur.symbol}${converted.toFixed(2)}`;
  }, [currency]);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

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
      addProduct, updateProduct, deleteProduct,
      addCategory, deleteCategory,
      addToCart, toggleWishlist, isInWishlist,
      removeFromCart, updateCartQty, clearCart,
      currency, setCurrency, currencies, formatPrice,
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
