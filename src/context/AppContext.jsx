import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { products as initialProducts, categories as initialCategories, adminCredentials } from '../data/mockData';
import { supabase } from '../lib/supabaseClient';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(!!supabase);
  const [loginError, setLoginError] = useState('');
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
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
          // Format category pointers for frontend compatibility
          const formattedProducts = prodData.map(p => ({
            ...p,
            category: p.category_id,
            categoryName: catData?.find(c => c.id === p.category_id)?.name || 'Uncategorized'
          }));
          setProducts(formattedProducts);
        }
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
          sku: product.sku || `DC-${Date.now()}`,
          name: product.name,
          category_id: product.category,
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
        setProducts(prev => [{
          ...newProductDb,
          category: newProductDb.category_id,
          categoryName: categories.find(c => c.id === newProductDb.category_id)?.name || 'Uncategorized'
        }, ...prev]);

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
        sku: product.sku || `DC-${Date.now()}`,
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
        const dbUpdates = { ...updates };
        if (updates.category) {
          dbUpdates.category_id = updates.category;
          delete dbUpdates.category;
        }

        const { error } = await supabase.from('de_products').update(dbUpdates).eq('id', id);
        if (error) throw error;

        setProducts(prev => prev.map(p => {
          if (p.id === id) {
            const merged = { ...p, ...updates };
            if (updates.category) {
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
      products, categories, cart, cartCount, wishlist, toast,
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
